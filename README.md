# Okode App Common

Okode Common Library for Ionic and Angular as module using TypeScript. Supports Angular's ngc and Ahead-of-Time compiling out of the box.

## Building

```
$ npm install ; npm run build
```

## Using Okode App Common module in an Ionic 2 app

```typescript
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

// Import Okode App Common module
import { OkodeCommonModule } from '@okode/common';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    OkodeCommonModule.forRoot(), // Put Okode App Common module here
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: []
})
export class AppModule {}
```

## Using optional Okode App Common providers

### HttpCacheInterceptor

Allows caching GET responses adding custom header

**1) Register provider in app @NgModule**
```
  { provide: HTTP_CACHE_INTERCEPTOR_CONFIG, useValue: { minutes: 5, headerName: 'Cache-Response'} },
  { provide: HTTP_INTERCEPTORS, useClass: HttpCacheInterceptor, multi: true },
```
>`HTTP_CACHE_INTERCEPTOR_CONFIG` is optional
>- `minutes` default: `null` (cache not expires)
>- `headerName` default: `'Cache-Response'` (any value is valid, it only needs to be defined)

**2) Add header to services that you want to cache**
```
  headers = headers.append('Cache-Response', 'true');
````
> This header will not be sent to the server