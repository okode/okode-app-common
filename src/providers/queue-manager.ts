import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Log } from './log';
import { Events } from 'ionic-angular';

export interface IQueueHandler {
  sync(item: any, srcQueue: Queue): Promise<any>;
  onQueueRequestDispatched?: (queue: Queue, item: any, success: boolean) => void;
  onQueueCompleted?: (queue: Queue, dispatchedItems: any[], failedItems: any[]) => void;
}

/**
 * Business key must be an unique identifier for the object so the queue works properly.
 */
export interface Queue {
  name?: string;
  // It's the property name that identifies the queue's object (e.g: 'id').
  businessKey: string;
  items: any[];
  queueHandler: IQueueHandler;
  isDispatching?: boolean;
  filterOnSend?: (item: any) => boolean;
}

interface QueueResult {
  failedItems: any[];
  successItems: any[];
}

@Injectable()
export class QueueManager {

  static readonly DISPATCHER_METADATA = '_dispatcherMetadata';

  private maxConcurrency = 0;
  private queues: {
    [name: string]: Queue;
  } = {};

  constructor(
    private log: Log,
    private events: Events
  ) {}

  /**
   * Returns a queue by name.
   * @param name
   */
  getQueue(name: string) {
    return this.queues[name];
  }

  /**
   * Returns queue items by queue name or null if the queue doesn't exist.
   * @param name
   */
  getQueueItems(name: string, filter?: (item: any) => boolean) {
    let queue = this.getQueue(name);
    let items = queue != null ? (queue.items || []) : null;
    if (items == null) return null;
    if (filter) {
      return items.filter((i) => filter(i));
    }
    return items;
  }

  /**
   * Returns all queue names.
   */
  getQueueNames() {
    return Object.keys(this.queues);
  }

  /**
   * Configures Queues manager in order to know how many request can be dispatched at a time.
   * @param maxConcurrency
   */
  setMaxConcurrency(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency || 0;
  }

  /**
   * Addes a new queue to the manager with the name received as parameter.
   *
   * @param name
   * @param queue
   */
  addQueue(name: string, queue: Queue) {
    if (queue != null) {
      queue.name = name;
      this.queues[name] = queue;
    }
  }

  /**
   * Updates all items of a queue by queue name.
   *
   * @param name
   * @param items
   */
  updateQueueItems(name: string, items: any[]) {
    if (this.queues[name] != null) {
      this.queues[name].items = items;
    }
  }

  /**
   * Deletes a queue by name.
   *
   * @param name
   */
  removeQueue(name: string) {
    delete this.queues[name];
  }

  /**
   * Removes a queue item.
   *
   * @param name
   * @param businessValue
   */
  removeQueueItem(name: string, businessValue: string) {
    let queue = this.getQueue(name);
    if (!queue || !queue.items) return;
    let index = this.findQueueItemIndex(queue, businessValue);
    if (index != -1) {
      queue.items.splice(index, 1);
    }
  }

  get isDispatching() {
    let queueNames = this.getQueueNames();
    let hasQueueDispatching = queueNames.map(name => this.queues[name]).some(q => q.isDispatching);
    return hasQueueDispatching;
  }

  private findQueueItemIndex(queue: Queue, businessValue: string) {
    let businessKey = queue.businessKey;
    return queue.items.findIndex(i => i[businessKey] == businessValue);
  }

  private initDispatch(queue: Queue) {
    if (queue.isDispatching) {
      this.log.i(`Queue ${queue.name} is being dispatched. Ignoring start`);
      return false;
    } else if (navigator.onLine == false) {
      this.log.i(`There is no network connection. Queue ${queue.name} will not be dispatched`);
      return false;
    }
    this.log.i(`Dispatching queue ${queue.name}`);
    queue.isDispatching = true;
    return true;
  }

  /**
   * Dispath all queues one after another if the queue manager is not busy.
   */
  dispatchQueues() {
    this.log.i('Dispatching queues');
    let queueNames = this.getQueueNames();
    for (let name of queueNames) {
      this.log.i(`Found queue with name: ${name}`);
      this.dispatchQueue(this.queues[name]);
    }
  }

  /**
   * Dispath a queue by name if the queue manager is not busy.
   */
  async dispatchOneQueue(name: string) {
    this.log.i(`Dispatching one queue with name: ${name}`);
    let queue = this.queues[name];
    this.dispatchQueue(queue);
  }

  private async dispatchQueue(queue: Queue) {
    if (queue == null) {
      this.log.w(`Queue ${queue.name} not found`);
      return;
    }
    if (queue.items == null || queue.items.length == 0) {
      this.log.i(`Queue ${queue.name} has no items`);
      return;
    }
    if (!this.initDispatch(queue)) return;
    let queueHandler = queue.queueHandler;
    return this.executeQueueDispatcher(queue)
      .then(res => {
        queue.isDispatching = false;
        if (queueHandler.onQueueCompleted) {
          queueHandler.onQueueCompleted(queue, res.successItems, res.failedItems);
        }
        this.log.i(`Queue was dispatched: ${name}`);
        return res;
      })
      .catch(err => {
        this.log.e(`Unexpected error dispatching queue ${queue.name}. Err: ${JSON.stringify(err)}`);
      });
  }

  private takeMaxItems(items: any[], maxConcurrency: number) {
    if (items == null) return 0;
    if (maxConcurrency == 0) return items.length;
    return items.length < maxConcurrency ? items.length : maxConcurrency;
  }

  /**
   * Builds a queue items processor and execute it n times dependending on max concurrency.
   * When the processor ends, the promise will be resolved.
   *
   * @param queue
   */
  private executeQueueDispatcher(queue: Queue) {
    let items = [...queue.items];
    if (queue.filterOnSend) {
      items = items.filter(item => queue.filterOnSend(item));
    }
    let processor = new QueueDispatcher(items, queue.queueHandler, this.log, queue,
      (item) => this.onItemSuccess(queue, item), (item) => this.onItemFail(queue, item));
    let promises: any = [];
    let maxItems = this.takeMaxItems(items, this.maxConcurrency);
    for (let i = 0; i < maxItems; i++) {
      this.log.i(`Building a queue dispatcher. Dispatcher ID: ${i}`);
      promises.push(processor.performSending(i));
    }
    return Promise.all(promises).then(() => {
      this.log.i(`Queue dispatcher finished`);
      return Promise.resolve(processor.result);
    });
  }

  /**
   * Removes an item sent successfully from its queue by businessKey.
   *
   * @param queue
   * @param item
   */
  private onItemSuccess(queue: Queue, item: any) {
    let businessKey = queue.businessKey;
    let index = this.findQueueItemIndex(queue, item[businessKey]);
    if (index != -1) {
      queue.items.splice(index, 1);
      let handler = queue.queueHandler;
      if (handler && handler.onQueueRequestDispatched) {
        handler.onQueueRequestDispatched(queue, item, true);
      }
    } else {
      this.log.w('Queue manager received a success item but it does not exist in the queue');
    }
  }

  /**
   * Adds metadata on a item which couldn't have been sent successfully by businessKey.
   * {
   *  *,
   *
   *  "_dispatcherMetadata": {
   *    "failed": true
   *  }
   * }
   *
   * @param queue
   * @param item
   */
  private onItemFail(queue: Queue, item: any) {
    let businessKey = queue.businessKey;
    let index = this.findQueueItemIndex(queue, item[businessKey]);
    if (index != -1) {
      let queueItem = queue.items[index];
      queueItem[QueueManager.DISPATCHER_METADATA] =
        queueItem[QueueManager.DISPATCHER_METADATA] || {};
      queueItem[QueueManager.DISPATCHER_METADATA].failed = true;
      let handler = queue.queueHandler;
      if (handler && handler.onQueueRequestDispatched) {
        handler.onQueueRequestDispatched(queue, queueItem, false);
      }
    } else {
      this.log.w('Queue manager received a failed item but it does not exist in the queue');
    }
  }

  /**
   * QUEUE DEFAULT FILTERS
   */

  /**
   * Filters non failed items so the failed items will not be sent again.
   */
  static filterNonFailed(item: any) {
    let metatada = item[QueueManager.DISPATCHER_METADATA];
    return !metatada || !metatada.failed;
  }

}

class QueueDispatcher {

  items: any[] = [];
  service: IQueueHandler;
  log: Log;
  queue: Queue;
  onItemSuccess: Function;
  onItemFail: Function;
  result: QueueResult = {
    failedItems: [],
    successItems: []
  };

  constructor(items: any[], service: IQueueHandler, log: Log, srcQueue: Queue,
    onItemSuccess: (item) => void, onItemFail: (item) => void) {
    this.items = items;
    this.service = service;
    this.log = log;
    this.queue = srcQueue;
    this.onItemSuccess = onItemSuccess;
    this.onItemFail = onItemFail;
  }

  performSending(processorId: number) {
    return new Promise<void>((resolve, reject) => {
      this.log.i(`Process pending sending. Dispatcher ID: ${processorId}`);
      let item = this.items.pop();
      if (item == null) {
        this.log.i(`No more pending sendings. Dispatcher ID: ${processorId}`);
        return resolve();
      }
      this.log.i(
        `Dispatcher ID: ${processorId} - Uploading ${item.constructor.name} with ID ${item.id}`
      );
      this.service.sync(item, this.queue)
        .then(() => {
          this.result.successItems.push(item);
          this.log.i(
            `Dispatcher ID: ${processorId} - Sent successfully ${item.constructor.name} with ID ${item.id}`
          );
          this.onItemSuccess(item);
          this.performSending(processorId).then(() => resolve());
        })
        .catch(err => {
          this.result.failedItems.push(item);
          this.log.e(
            `Processor ID: ${processorId} - Error sending ${item.constructor.name} with ID ${item.id}`
          );
          this.onItemFail(item);
          this.performSending(processorId).then(() => resolve());
        });
    });
  }

}