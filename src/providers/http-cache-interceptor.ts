import { Injectable, Inject, InjectionToken, isDevMode } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';

export const HTTP_CACHE_INTERCEPTOR_DURATION_MINS = new InjectionToken<number>('httpCache.mins');
export const HTTP_CACHE_INTERCEPTOR_STORE_CACHE = new InjectionToken<boolean>('httpCache.store');
const HTTP_CACHE_STORAGE = 'HTTP_CACHE_STORAGE';

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {

  private cache = new Map<string, { response: HttpResponse<any>, timestamp: number }>();

  private durationMins = null;
  private storeCache = null;
  private static readonly HEADER_NAME = 'Cache-Interceptor';
  private static readonly HEADER_VALUE_CACHE_RESPONSE = 'cache-response';
  private static readonly HEADER_VALUE_CACHE_CLEAR = 'clear-cache';

  constructor(
    @Inject(HTTP_CACHE_INTERCEPTOR_DURATION_MINS) duration: number,
    @Inject(HTTP_CACHE_INTERCEPTOR_STORE_CACHE) store: boolean,
    private storage: Storage
  ) {
    this.durationMins = duration || null;
    if (isDevMode() && store) {
      this.storeCache = true;
      this.loadCacheFromStorage();
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headerValue = req.headers.get(HttpCacheInterceptor.HEADER_NAME);
    req = req.clone({ headers: req.headers.delete(HttpCacheInterceptor.HEADER_NAME) });

    if (req.method !== 'GET' || !headerValue) {
      return next.handle(req);
    }

    if (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_CLEAR) {
      this.clearCache();
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(req.urlWithParams);
    if (cachedResponse && !this.isReponseExpired(cachedResponse)) {
      return Observable.of(cachedResponse.response);
    }

    const cacheResponse = (headerValue == HttpCacheInterceptor.HEADER_VALUE_CACHE_RESPONSE);

    return next.handle(req).do(event => {
      if (event instanceof HttpResponse && cacheResponse) {
        this.setToCache(req.urlWithParams, { response: event.clone(), timestamp: Date.now() });
      }
    });
  }

  private isReponseExpired(cachedResponse: any) {
    if (!this.durationMins) return false;
    return Date.now() > cachedResponse.timestamp + (this.durationMins * 60000);
  }

  private async loadCacheFromStorage() {
    await this.storage.ready();
    let cacheFromStorage = await this.storage.get(HTTP_CACHE_STORAGE);
    if (cacheFromStorage) {
      this.cache = <Map<string, { response: HttpResponse<any>, timestamp: number }>>JSON.parse(cacheFromStorage);
    }
  }

  private setToCache(key: string, value: { response: HttpResponse<any>, timestamp: number }) {
    this.cache.set(key, value);
    if (this.storeCache) {
      this.storage.ready()
        .then(() => this.storage.set(HTTP_CACHE_STORAGE, JSON.stringify(this.cache)));
    }
  }

  private async clearCache() {
    this.cache.clear();
    if (this.storeCache) {
      this.storage.ready()
        .then(() => this.storage.remove(HTTP_CACHE_STORAGE));
    }
  }
}
