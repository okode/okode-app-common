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

# Providers (optionals)

## HttpCacheInterceptor

Allows caching GET responses

**Register provider in app @NgModule**
```typescript
  { provide: HTTP_CACHE_INTERCEPTOR_DURATION_MINS, useValue: 5 },
  { provide: HTTP_INTERCEPTORS, useClass: HttpCacheInterceptor, multi: true },
```
>`HTTP_CACHE_INTERCEPTOR_DURATION_MINS` (minutes number) is optional, default: `null` (cache not expires)

**Add header to services that you want to cache**
```typescript
  headers = headers.append('Cache-Interceptor', 'cache-response');
````
>`Cache-Interceptor` header will not be sent to the server

**Clear all cache responses**
```typescript
  headers = headers.append('Cache-Interceptor', 'clear-cache');
````
>`Cache-Interceptor` header will not be sent to the server

# Components

## ModalWrapperComponent

Wrap the modal in a new ion-nav solving certain navigation problems (popToRoot in multiple modal levels, iOS statusbar in pushed pages inside modal, etc)

**Add module in inports**
```typescript
import { OkodeCommonModule } from '@okode/common';
@NgModule({
  imports: [
    OkodeCommonModule
```

**Usage**
```typescript

import { ModalWrapperComponent } from '@okode/common';

this.modalCtrl.create(ModalWrapperComponent, { root: 'my-page' }).present();
// OR
this.modalCtrl.create(ModalWrapperComponent, { root: 'my-page', params: { foo: 'bar' } }).present();
```
>From any point of the new modal `NavController`, we can close the entire modal nav stack returning data (or not) to the point where the modal was created (using `this.navCtrl.parent.getActive().dismiss()`)
```typescript
let modal = this.modalCtrl.create(ModalWrapperComponent, { root: 'my-page' });
modal.present();
modal.onDismiss(data => {
  if (data.success == true) {
    // do something
  }
});
```
```typescript
this.navCtrl.parent.getActive().dismiss({ success: true });
```
