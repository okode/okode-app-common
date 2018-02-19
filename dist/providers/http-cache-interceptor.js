import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
export var HTTP_CACHE_INTERCEPTOR_CONFIG = new InjectionToken('httpCache.config');
var HttpCacheInterceptor = /** @class */ (function () {
    function HttpCacheInterceptor(config) {
        this.cache = new Map();
        this.durationMins = null;
        this.headerName = 'Cache-Response';
        this.headerName = config.headerName || this.headerName;
        this.durationMins = config.minutes || null;
    }
    HttpCacheInterceptor.prototype.intercept = function (req, next) {
        var _this = this;
        if (req.method !== 'GET' || !req.headers.get(this.headerName)) {
            return next.handle(req);
        }
        req = req.clone({ headers: req.headers.delete(this.headerName) });
        var cachedResponse = this.cache.get(req.urlWithParams);
        if (cachedResponse && !this.isReponseExpired(cachedResponse)) {
            return Observable.of(cachedResponse.response);
        }
        return next.handle(req).do(function (event) {
            if (event instanceof HttpResponse) {
                _this.cache.set(req.urlWithParams, { response: event.clone(), timestamp: Date.now() });
            }
        });
    };
    HttpCacheInterceptor.prototype.isReponseExpired = function (cachedResponse) {
        if (!this.durationMins)
            return false;
        return Date.now() > cachedResponse.timestamp + (this.durationMins * 60000);
    };
    HttpCacheInterceptor.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    HttpCacheInterceptor.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [HTTP_CACHE_INTERCEPTOR_CONFIG,] },] },
    ]; };
    return HttpCacheInterceptor;
}());
export { HttpCacheInterceptor };
//# sourceMappingURL=http-cache-interceptor.js.map