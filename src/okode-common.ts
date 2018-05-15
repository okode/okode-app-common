import { Observable } from 'rxjs';
import { NgModule, ModuleWithProviders, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Config } from './providers/config';
import { CrashlyticsErrorHandler } from './providers/crashlytics';
import { Log } from './providers/log';
import { MMobile } from './providers/mmobile';
import { IonicStorageModule } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { IonicModule } from 'ionic-angular';
import { ModalWrapperComponent } from './components/modal-wrapper';
import { SplashLoadingComponent } from './components/splash-loading';

@NgModule({
  declarations: [
    // declare all components that your module uses
    ModalWrapperComponent,
    SplashLoadingComponent
  ],
  imports: [
    HttpClientModule,
    IonicModule,
    IonicStorageModule.forRoot()
  ],
  exports: [
    // export the component(s) that you want others to be able to use
    ModalWrapperComponent,
    SplashLoadingComponent
  ],
  entryComponents: [
    ModalWrapperComponent,
    SplashLoadingComponent
  ]
})
export class OkodeCommonModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: OkodeCommonModule,
      providers: [
        { provide: ErrorHandler, useClass: CrashlyticsErrorHandler },
        Config,
        Log,
        MMobile,
        File,
        Device
      ]
    };
  }
}

