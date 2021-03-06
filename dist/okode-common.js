import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Config } from './providers/config';
import { CrashlyticsErrorHandler } from './providers/crashlytics';
import { Log } from './providers/log';
import { MMobile } from './providers/mmobile';
import { MPush } from './providers/mpush';
import { QueueManager } from './providers/queue-manager';
import { IonicStorageModule } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { ModalWrapperComponent } from './components/modal-wrapper';
import { IonicModule } from 'ionic-angular';
var OkodeCommonModule = /** @class */ (function () {
    function OkodeCommonModule() {
    }
    OkodeCommonModule.forRoot = function () {
        return {
            ngModule: OkodeCommonModule,
            providers: [
                { provide: ErrorHandler, useClass: CrashlyticsErrorHandler },
                Config,
                Log,
                MMobile,
                QueueManager,
                MPush,
                File,
                Device
            ]
        };
    };
    OkodeCommonModule.decorators = [
        { type: NgModule, args: [{
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
                },] },
    ];
    /** @nocollapse */
    OkodeCommonModule.ctorParameters = function () { return []; };
    return OkodeCommonModule;
}());
export { OkodeCommonModule };
//# sourceMappingURL=okode-common.js.map