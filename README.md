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
import { OkodeAppCommonModule } from '@okode/common';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    OkodeAppCommonModule // Put Okode App Common module here
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