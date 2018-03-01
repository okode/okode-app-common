import { InjectionToken } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
export declare const HTTP_CACHE_INTERCEPTOR_DURATION_MINS: InjectionToken<number>;
export declare const HTTP_CACHE_INTERCEPTOR_STORE_CACHE: InjectionToken<boolean>;
export declare class HttpCacheInterceptor implements HttpInterceptor {
    private storage;
    private cache;
    private durationMins;
    private storeCache;
    private static readonly HEADER_NAME;
    private static readonly HEADER_VALUE_CACHE_RESPONSE;
    private static readonly HEADER_VALUE_CACHE_CLEAR;
    constructor(duration: number, store: boolean, storage: Storage);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    private isReponseExpired(cachedResponse);
    private loadCacheFromStorage();
    private setToCache(key, value);
    private clearCache();
}
