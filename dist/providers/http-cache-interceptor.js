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
import { Injectable, Inject, InjectionToken, isDevMode } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
export var HTTP_CACHE_INTERCEPTOR_DURATION_MINS = new InjectionToken('httpCache.mins');
export var HTTP_CACHE_INTERCEPTOR_STORE_CACHE = new InjectionToken('httpCache.store');
var HTTP_CACHE_STORAGE = 'HTTP_CACHE_STORAGE';
var HttpCacheInterceptor = /** @class */ (function () {
    function HttpCacheInterceptor(duration, store, storage) {
        this.storage = storage;
        this.cache = new Map();
        this.durationMins = null;
        this.storeCache = null;
        this.durationMins = duration || null;
        if (isDevMode() && store) {
            this.storeCache = true;
            this.loadCacheFromStorage();
        }
    }
    HttpCacheInterceptor.prototype.intercept = function (req, next) {
        var _this = this;
        var headerValue = req.headers.get(HttpCacheInterceptor.HEADER_NAME);
        req = req.clone({ headers: req.headers.delete(HttpCacheInterceptor.HEADER_NAME) });
        if (req.method !== 'GET' || !headerValue) {
            return next.handle(req);
        }
        if (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_CLEAR) {
            this.clearCache();
            return next.handle(req);
        }
        var cachedResponse = this.cache.get(req.urlWithParams);
        if (cachedResponse && !this.isReponseExpired(cachedResponse)) {
            return Observable.of(cachedResponse.response);
        }
        var cacheResponse = (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_RESPONSE);
        return next.handle(req).do(function (event) {
            if (event instanceof HttpResponse && cacheResponse) {
                _this.setToCache(req.urlWithParams, { response: event.clone(), timestamp: Date.now() });
            }
        });
    };
    HttpCacheInterceptor.prototype.isReponseExpired = function (cachedResponse) {
        if (!this.durationMins)
            return false;
        return Date.now() > cachedResponse.timestamp + (this.durationMins * 60000);
    };
    HttpCacheInterceptor.prototype.loadCacheFromStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cacheFromStorage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.ready()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storage.get(HTTP_CACHE_STORAGE)];
                    case 2:
                        cacheFromStorage = _a.sent();
                        if (cacheFromStorage) {
                            this.cache = JSON.parse(cacheFromStorage);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpCacheInterceptor.prototype.setToCache = function (key, value) {
        var _this = this;
        this.cache.set(key, value);
        if (this.storeCache) {
            this.storage.ready()
                .then(function () { return _this.storage.set(HTTP_CACHE_STORAGE, JSON.stringify(_this.cache)); });
        }
    };
    HttpCacheInterceptor.prototype.clearCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.cache.clear();
                if (this.storeCache) {
                    this.storage.ready()
                        .then(function () { return _this.storage.remove(HTTP_CACHE_STORAGE); });
                }
                return [2 /*return*/];
            });
        });
    };
    HttpCacheInterceptor.HEADER_NAME = 'Cache-Interceptor';
    HttpCacheInterceptor.HEADER_VALUE_CACHE_RESPONSE = 'cache-response';
    HttpCacheInterceptor.HEADER_VALUE_CACHE_CLEAR = 'clear-cache';
    HttpCacheInterceptor.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    HttpCacheInterceptor.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [HTTP_CACHE_INTERCEPTOR_DURATION_MINS,] },] },
        { type: undefined, decorators: [{ type: Inject, args: [HTTP_CACHE_INTERCEPTOR_STORE_CACHE,] },] },
        { type: Storage, },
    ]; };
    return HttpCacheInterceptor;
}());
export { HttpCacheInterceptor };
//# sourceMappingURL=http-cache-interceptor.js.map