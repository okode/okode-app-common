import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

export interface CacheConfig {
  minutes: number;
  headerName: string;
}

export const HTTP_CACHE_INTERCEPTOR_CONFIG = new InjectionToken<CacheConfig>('httpCache.config');

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {

  private cache = new Map<string, { response: HttpResponse<any>, timestamp: number }>();

  private durationMins = null;
  private headerName = 'Cache-Response';

  constructor(@Inject(HTTP_CACHE_INTERCEPTOR_CONFIG) config: CacheConfig) {
    this.headerName = config.headerName || this.headerName;
    this.durationMins = config.minutes || null;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET' || !req.headers.get(this.headerName)) {
      return next.handle(req);
    }
    req = req.clone({ headers: req.headers.delete(this.headerName) });

    const cachedResponse = this.cache.get(req.urlWithParams);
    if (cachedResponse && !this.isReponseExpired(cachedResponse)) {
      return Observable.of(cachedResponse.response);
    }

    return next.handle(req).do(event => {
      if (event instanceof HttpResponse) {
        this.cache.set(req.urlWithParams, { response: event.clone(), timestamp: Date.now() });
      }
    });
  }

  private isReponseExpired(cachedResponse: any) {
    if (!this.durationMins) return false;
    return Date.now() > cachedResponse.timestamp + (this.durationMins * 60000);
  }

}
