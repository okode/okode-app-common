import { InjectionToken } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
export interface CacheConfig {
    minutes: number;
    headerName: string;
}
export declare const HTTP_CACHE_INTERCEPTOR_CONFIG: InjectionToken<CacheConfig>;
export declare class HttpCacheInterceptor implements HttpInterceptor {
    private cache;
    private durationMins;
    private headerName;
    constructor(config: CacheConfig);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    private isReponseExpired(cachedResponse);
}
