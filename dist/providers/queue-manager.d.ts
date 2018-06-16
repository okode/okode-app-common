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
    businessKey: string;
    items: any[];
    queueHandler: IQueueHandler;
    isDispatching?: boolean;
    filterOnSend?: (item: any) => boolean;
}
export declare class QueueManager {
    private log;
    private events;
    static readonly DISPATCHER_METADATA: string;
    private maxConcurrency;
    private queues;
    constructor(log: Log, events: Events);
    /**
     * Returns a queue by name.
     * @param name
     */
    getQueue(name: string): Queue;
    /**
     * Returns queue items by queue name or null if the queue doesn't exist.
     * @param name
     */
    getQueueItems(name: string, filter?: (item: any) => boolean): any[];
    /**
     * Returns all queue names.
     */
    getQueueNames(): string[];
    /**
     * Configures Queues manager in order to know how many request can be dispatched at a time.
     * @param maxConcurrency
     */
    setMaxConcurrency(maxConcurrency: number): void;
    /**
     * Addes a new queue to the manager with the name received as parameter.
     *
     * @param name
     * @param queue
     */
    addQueue(name: string, queue: Queue): void;
    /**
     * Updates all items of a queue by queue name.
     *
     * @param name
     * @param items
     */
    updateQueueItems(name: string, items: any[]): void;
    /**
     * Deletes a queue by name.
     *
     * @param name
     */
    removeQueue(name: string): void;
    /**
     * Removes a queue item.
     *
     * @param name
     * @param businessValue
     */
    removeQueueItem(name: string, businessValue: string): void;
    readonly isDispatching: boolean;
    private findQueueItemIndex;
    private initDispatch;
    /**
     * Dispath all queues one after another if the queue manager is not busy.
     */
    dispatchQueues(): void;
    /**
     * Dispath a queue by name if the queue manager is not busy.
     */
    dispatchOneQueue(name: string): Promise<void>;
    private dispatchQueue;
    private takeMaxItems;
    /**
     * Builds a queue items processor and execute it n times dependending on max concurrency.
     * When the processor ends, the promise will be resolved.
     *
     * @param queue
     */
    private executeQueueDispatcher;
    /**
     * Removes an item sent successfully from its queue by businessKey.
     *
     * @param queue
     * @param item
     */
    private onItemSuccess;
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
    private onItemFail;
    /**
     * QUEUE DEFAULT FILTERS
     */
    /**
     * Filters non failed items so the failed items will not be sent again.
     */
    static filterNonFailed(item: any): boolean;
}
