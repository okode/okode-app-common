import { Observable } from 'rxjs';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { MyComponent } from './components/my-component';
import { Config } from './providers/config';
import { CrashlyticsErrorHandler } from './providers/crashlytics';
import { Log } from './providers/log';
import { MMobile } from './providers/mmobile';

@NgModule({
  declarations: [
    // declare all components that your module uses
    MyComponent
  ],
  exports: [
    // export the component(s) that you want others to be able to use
    MyComponent
  ]
})
export class OkodeCommonModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: OkodeCommonModule,
      providers: [ Config, CrashlyticsErrorHandler, Log, MMobile ]
    };
  }
}

