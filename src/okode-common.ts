import { Observable } from 'rxjs';
import { NgModule, ModuleWithProviders, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Config } from './providers/config';
import { CrashlyticsErrorHandler } from './providers/crashlytics';
import { Log } from './providers/log';
import { MMobile } from './providers/mmobile';
import { QueueManager } from './providers/queue-manager';
import { IonicStorageModule } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { ModalWrapperComponent } from './components/modal-wrapper';
import { IonicModule } from 'ionic-angular';

@NgModule({
  declarations: [
    // declare all components that your module uses
    ModalWrapperComponent
  ],
  imports: [
    HttpClientModule,
    IonicModule,
    IonicStorageModule.forRoot()
  ],
  exports: [
    // export the component(s) that you want others to be able to use
    ModalWrapperComponent
  ],
  entryComponents: [
    ModalWrapperComponent
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
        QueueManager,
        File,
        Device
      ]
    };
  }
}

