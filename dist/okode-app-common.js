import { NgModule } from '@angular/core';
import { MyComponent } from './components/my-component';
import { Config } from './providers/config';
import { CrashlyticsErrorHandler } from './providers/crashlytics';
import { Log } from './providers/log';
import { MMobile } from './providers/mmobile';
var OkodeAppCommonModule = /** @class */ (function () {
    function OkodeAppCommonModule() {
    }
    OkodeAppCommonModule.forRoot = function () {
        return {
            ngModule: OkodeAppCommonModule,
            providers: [Config, CrashlyticsErrorHandler, Log, MMobile]
        };
    };
    OkodeAppCommonModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [
                        // declare all components that your module uses
                        MyComponent
                    ],
                    exports: [
                        // export the component(s) that you want others to be able to use
                        MyComponent
                    ]
                },] },
    ];
    /** @nocollapse */
    OkodeAppCommonModule.ctorParameters = function () { return []; };
    return OkodeAppCommonModule;
}());
export { OkodeAppCommonModule };
//# sourceMappingURL=okode-app-common.js.map