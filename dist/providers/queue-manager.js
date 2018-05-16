var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Log } from './log';
import { Events } from 'ionic-angular';
var QueueManagerService = /** @class */ (function () {
    function QueueManagerService(log, events) {
        this.log = log;
        this.events = events;
        this.maxConcurrency = 0;
        this.queues = {};
    }
    /**
     * Returns a queue by name.
     * @param name
     */
    QueueManagerService.prototype.getQueue = function (name) {
        return this.queues[name];
    };
    /**
     * Returns queue items by queue name or null if the queue doesn't exist.
     * @param name
     */
    QueueManagerService.prototype.getQueueItems = function (name, filter) {
        var queue = this.getQueue(name);
        var items = queue != null ? (queue.items || []) : null;
        if (items == null)
            return null;
        if (filter) {
            return items.filter(function (i) { return filter(i); });
        }
        return items;
    };
    /**
     * Returns all queue names.
     */
    QueueManagerService.prototype.getQueueNames = function () {
        return Object.keys(this.queues);
    };
    /**
     * Configures Queues manager in order to know how many request can be dispatched at a time.
     * @param maxConcurrency
     */
    QueueManagerService.prototype.setMaxConcurrency = function (maxConcurrency) {
        this.maxConcurrency = maxConcurrency || 0;
    };
    /**
     * Addes a new queue to the manager with the name received as parameter.
     *
     * @param name
     * @param queue
     */
    QueueManagerService.prototype.addQueue = function (name, queue) {
        if (queue != null) {
            this.queues[name] = queue;
        }
    };
    /**
     * Updates all items of a queue by queue name.
     *
     * @param name
     * @param items
     */
    QueueManagerService.prototype.updateQueueItems = function (name, items) {
        if (this.queues[name] != null) {
            this.queues[name].items = items;
        }
    };
    /**
     * Deletes a queue by name.
     *
     * @param name
     */
    QueueManagerService.prototype.removeQueue = function (name) {
        delete this.queues[name];
    };
    /**
     * Removes a queue item.
     *
     * @param name
     * @param businessValue
     */
    QueueManagerService.prototype.removeQueueItem = function (name, businessValue) {
        var queue = this.getQueue(name);
        if (!queue || !queue.items)
            return;
        var index = this.findQueueItemIndex(queue, businessValue);
        if (index != -1) {
            queue.items.splice(index, 1);
        }
    };
    QueueManagerService.prototype.findQueueItemIndex = function (queue, businessValue) {
        var businessKey = queue.businessKey;
        return queue.items.findIndex(function (i) { return i[businessKey] == businessValue; });
    };
    QueueManagerService.prototype.ready = function () {
        if (this.isDispatching) {
            this.log.i('Queue manager is still processing items');
            return false;
        }
        else if (navigator.onLine == false) {
            this.log.i('Queue manager has no network connection');
            return false;
        }
        return true;
    };
    QueueManagerService.prototype.initDispatch = function () {
        if (!this.ready()) {
            this.log.i('Queue manager is not ready. Ignoring start');
            return false;
        }
        this.log.i('Initializing sync process');
        this.isDispatching = true;
        this.events.publish('queue-manager:started');
        return true;
    };
    QueueManagerService.prototype.stopDispatch = function () {
        this.isDispatching = false;
        this.events.publish('queue-manager:ended');
    };
    /**
     * Dispath all queues one after another if the queue manager is not busy.
     */
    QueueManagerService.prototype.dispatchQueues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queueNames, _i, queueNames_1, name_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initDispatch())
                            return [2 /*return*/];
                        this.log.i('Dispatching queues');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        queueNames = this.getQueueNames();
                        _i = 0, queueNames_1 = queueNames;
                        _a.label = 2;
                    case 2:
                        if (!(_i < queueNames_1.length)) return [3 /*break*/, 5];
                        name_1 = queueNames_1[_i];
                        this.log.i("Found queue with name: " + name_1);
                        return [4 /*yield*/, this.dispatchQueue(this.queues[name_1])];
                    case 3:
                        _a.sent();
                        this.log.i("Queue with name: " + name_1 + " dispatched");
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.log.i("All queues were dispatched");
                        this.stopDispatch();
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        this.log.e("Unexpected error dispatching queues. Err: " + JSON.stringify(err_1));
                        this.stopDispatch();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dispath a queue by name if the queue manager is not busy.
     */
    QueueManagerService.prototype.dispatchOneQueue = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var queue, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initDispatch())
                            return [2 /*return*/];
                        this.log.i("Dispatching one queue with name: " + name);
                        queue = this.queues[name];
                        if (queue == null) {
                            this.log.w("Queue with name " + name + " not found");
                            this.stopDispatch();
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.dispatchQueue(queue)];
                    case 2:
                        _a.sent();
                        this.log.i("One queue was dispatched: " + name);
                        this.stopDispatch();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        this.log.e("Unexpected error dispatching one queue. Err: " + JSON.stringify(err_2));
                        this.stopDispatch();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    QueueManagerService.prototype.dispatchQueue = function (queue) {
        return __awaiter(this, void 0, void 0, function () {
            var queueHandler;
            return __generator(this, function (_a) {
                if (queue == null) {
                    this.log.w('Queue not found or no items');
                    return [2 /*return*/];
                }
                if (queue.items == null || queue.items.length == 0) {
                    this.log.i('Queue has no items');
                    return [2 /*return*/];
                }
                queue.isDispatching = true;
                queueHandler = queue.queueHandler;
                return [2 /*return*/, this.executeQueueDispatcher(queue).then(function (res) {
                        queue.isDispatching = true;
                        if (queueHandler.onQueueCompleted) {
                            queueHandler.onQueueCompleted(queue, res.successItems, res.failedItems);
                        }
                        return res;
                    })];
            });
        });
    };
    QueueManagerService.prototype.takeMaxItems = function (items, maxConcurrency) {
        if (items == null)
            return 0;
        if (maxConcurrency == 0)
            return items.length;
        return items.length < maxConcurrency ? items.length : maxConcurrency;
    };
    /**
     * Builds a queue items processor and execute it n times dependending on max concurrency.
     * When the processor ends, the promise will be resolved.
     *
     * @param queue
     */
    QueueManagerService.prototype.executeQueueDispatcher = function (queue) {
        var _this = this;
        var items = queue.items.slice();
        if (queue.filterOnSend) {
            items = items.filter(function (item) { return queue.filterOnSend(item); });
        }
        var processor = new QueueDispatcher(items, queue.queueHandler, this.log, queue, function (item) { return _this.onItemSuccess(queue, item); }, function (item) { return _this.onItemFail(queue, item); });
        var promises = [];
        var maxItems = this.takeMaxItems(items, this.maxConcurrency);
        for (var i = 0; i < maxItems; i++) {
            this.log.i("Building a queue dispatcher. Dispatcher ID: " + i);
            promises.push(processor.performSending(i));
        }
        return Promise.all(promises).then(function () {
            _this.log.i("Queue dispatcher finished");
            return Promise.resolve(processor.result);
        });
    };
    /**
     * Removes an item sent successfully from its queue by businessKey.
     *
     * @param queue
     * @param item
     */
    QueueManagerService.prototype.onItemSuccess = function (queue, item) {
        var businessKey = queue.businessKey;
        var index = this.findQueueItemIndex(queue, item[businessKey]);
        if (index != -1) {
            queue.items.splice(index, 1);
            var handler = queue.queueHandler;
            if (handler && handler.onQueueRequestDispatched) {
                handler.onQueueRequestDispatched(queue, item, true);
            }
        }
        else {
            this.log.w('Queue manager received a success item but it does not exist in the queue');
        }
    };
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
    QueueManagerService.prototype.onItemFail = function (queue, item) {
        var businessKey = queue.businessKey;
        var index = this.findQueueItemIndex(queue, item[businessKey]);
        if (index != -1) {
            var queueItem = queue.items[index];
            queueItem[QueueManagerService.DISPATCHER_METADATA] =
                queueItem[QueueManagerService.DISPATCHER_METADATA] || {};
            queueItem[QueueManagerService.DISPATCHER_METADATA].failed = true;
            var handler = queue.queueHandler;
            if (handler && handler.onQueueRequestDispatched) {
                handler.onQueueRequestDispatched(queue, queueItem, false);
            }
        }
        else {
            this.log.w('Queue manager received a failed item but it does not exist in the queue');
        }
    };
    /**
     * QUEUE DEFAULT FILTERS
     */
    /**
     * Filters non failed items so the failed items will not be sent again.
     */
    QueueManagerService.filterNonFailed = function (item) {
        var metatada = item[QueueManagerService.DISPATCHER_METADATA];
        return !metatada || !metatada.failed;
    };
    QueueManagerService.DISPATCHER_METADATA = '_dispatcherMetadata';
    QueueManagerService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    QueueManagerService.ctorParameters = function () { return [
        { type: Log, },
        { type: Events, },
    ]; };
    return QueueManagerService;
}());
export { QueueManagerService };
var QueueDispatcher = /** @class */ (function () {
    function QueueDispatcher(items, service, log, srcQueue, onItemSuccess, onItemFail) {
        this.items = [];
        this.result = {
            failedItems: [],
            successItems: []
        };
        this.items = items;
        this.service = service;
        this.log = log;
        this.queue = srcQueue;
        this.onItemSuccess = onItemSuccess;
        this.onItemFail = onItemFail;
    }
    QueueDispatcher.prototype.performSending = function (processorId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.log.i("Process pending sending. Dispatcher ID: " + processorId);
            var item = _this.items.pop();
            if (item == null) {
                _this.log.i("No more pending sendings. Dispatcher ID: " + processorId);
                return resolve();
            }
            _this.log.i("Dispatcher ID: " + processorId + " - Uploading " + item.constructor.name + " with ID " + item.id);
            _this.service.sync(item, _this.queue)
                .then(function () {
                _this.result.successItems.push(item);
                _this.log.i("Dispatcher ID: " + processorId + " - Sent successfully " + item.constructor.name + " with ID " + item.id);
                _this.onItemSuccess(item);
                _this.performSending(processorId).then(function () { return resolve(); });
            })
                .catch(function (err) {
                _this.result.failedItems.push(item);
                _this.log.e("Processor ID: " + processorId + " - Error sending " + item.constructor.name + " with ID " + item.id);
                _this.onItemFail(item);
                _this.performSending(processorId).then(function () { return resolve(); });
            });
        });
    };
    return QueueDispatcher;
}());
//# sourceMappingURL=queue-manager.js.map