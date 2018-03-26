import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

export const HTTP_CACHE_INTERCEPTOR_DURATION_MINS = new InjectionToken<number>('httpCache.mins');

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {

  private cache = new Map<string, { response: HttpResponse<any>, timestamp: number }>();

  private durationMins = null;
  private static readonly HEADER_NAME = 'Cache-Interceptor';
  private static readonly HEADER_VALUE_CACHE_RESPONSE = 'cache-response';
  private static readonly HEADER_VALUE_CACHE_CLEAR = 'clear-cache';

  constructor(@Inject(HTTP_CACHE_INTERCEPTOR_DURATION_MINS) duration: number) {
    this.durationMins = duration || null;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headerValue = req.headers.get(HttpCacheInterceptor.HEADER_NAME);
    req = req.clone({ headers: req.headers.delete(HttpCacheInterceptor.HEADER_NAME) });

    if (req.method !== 'GET' || !headerValue) {
      return next.handle(req);
    }

    if (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_CLEAR) {
      this.cache.clear();
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(req.urlWithParams);
    if (cachedResponse && !this.isReponseExpired(cachedResponse)) {
      return Observable.of(cachedResponse.response);
    }

    const cacheResponse = (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_RESPONSE);

    return next.handle(req).do(event => {
      if (event instanceof HttpResponse && cacheResponse) {
        this.cache.set(req.urlWithParams, { response: event.clone(), timestamp: Date.now() });
      }
    });
  }

  private isReponseExpired(cachedResponse: any) {
    if (!this.durationMins) return false;
    return Date.now() > cachedResponse.timestamp + (this.durationMins * 60000);
  }

}
