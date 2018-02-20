import { InjectionToken } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
export declare const HTTP_CACHE_INTERCEPTOR_DURATION_MINS: InjectionToken<number>;
export declare class HttpCacheInterceptor implements HttpInterceptor {
    private cache;
    private durationMins;
    private static readonly HEADER_NAME;
    private static readonly HEADER_VALUE_CACHE_RESPONSE;
    private static readonly HEADER_VALUE_CACHE_CLEAR;
    constructor(duration: number);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    private isReponseExpired(cachedResponse);
}
