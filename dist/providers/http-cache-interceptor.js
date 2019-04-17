import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
export var HTTP_CACHE_INTERCEPTOR_DURATION_MINS = new InjectionToken('httpCache.mins');
var HttpCacheInterceptor = /** @class */ (function () {
    function HttpCacheInterceptor(duration) {
        this.cache = new Map();
        this.durationMins = null;
        this.durationMins = duration || null;
    }
    HttpCacheInterceptor.prototype.intercept = function (req, next) {
        var _this = this;
        var headerValue = req.headers.get(HttpCacheInterceptor.HEADER_NAME);
        req = req.clone({ headers: req.headers.delete(HttpCacheInterceptor.HEADER_NAME) });
        if (!headerValue) {
            return next.handle(req);
        }
        if (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_CLEAR) {
            this.cache.clear();
            return next.handle(req);
        }
        if (req.method !== 'GET') {
            return next.handle(req);
        }
        var cachedResponse = this.cache.get(req.urlWithParams);
        if (cachedResponse && !this.isReponseExpired(cachedResponse)) {
            return Observable.of(cachedResponse.response);
        }
        var cacheResponse = (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_RESPONSE);
        return next.handle(req).do(function (event) {
            if (event instanceof HttpResponse && cacheResponse) {
                _this.cache.set(req.urlWithParams, { response: event.clone(), timestamp: Date.now() });
            }
        });
    };
    HttpCacheInterceptor.prototype.isReponseExpired = function (cachedResponse) {
        if (!this.durationMins)
            return false;
        return Date.now() > cachedResponse.timestamp + (this.durationMins * 60000);
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
    ]; };
    return HttpCacheInterceptor;
}());
export { HttpCacheInterceptor };
//# sourceMappingURL=http-cache-interceptor.js.map