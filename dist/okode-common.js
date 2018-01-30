import { NgModule } from '@angular/core';
import { MyComponent } from './components/my-component';
import { Config } from './providers/config';
import { CrashlyticsErrorHandler } from './providers/crashlytics';
import { Log } from './providers/log';
import { MMobile } from './providers/mmobile';
import { IonicStorageModule } from '@ionic/storage';
var OkodeCommonModule = /** @class */ (function () {
    function OkodeCommonModule() {
    }
    OkodeCommonModule.forRoot = function () {
        return {
            ngModule: OkodeCommonModule,
            providers: [Config, CrashlyticsErrorHandler, Log, MMobile]
        };
    };
    OkodeCommonModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [
                        // declare all components that your module uses
                        MyComponent
                    ],
                    imports: [
                        IonicStorageModule.forRoot()
                    ],
                    exports: [
                        // export the component(s) that you want others to be able to use
                        MyComponent
                    ]
                },] },
    ];
    /** @nocollapse */
    OkodeCommonModule.ctorParameters = function () { return []; };
    return OkodeCommonModule;
}());
export { OkodeCommonModule };
//# sourceMappingURL=okode-common.js.map