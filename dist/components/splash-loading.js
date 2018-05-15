import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform } from 'ionic-angular';
var SplashLoadingComponent = /** @class */ (function () {
    function SplashLoadingComponent(platform, splashScreen) {
        this.platform = platform;
        this.splashScreen = splashScreen;
    }
    SplashLoadingComponent.prototype.ionViewDidEnter = function () {
        var _this = this;
        this.platform.ready().then(function () {
            _this.splashScreen.hide();
        });
    };
    SplashLoadingComponent.decorators = [
        { type: Component, args: [{
                    selector: 'splash-loading-component',
                    templateUrl: './splash-loading.html',
                    styleUrls: ['./splash-loading.scss']
                },] },
    ];
    /** @nocollapse */
    SplashLoadingComponent.ctorParameters = function () { return [
        { type: Platform, },
        { type: SplashScreen, },
    ]; };
    return SplashLoadingComponent;
}());
export { SplashLoadingComponent };
//# sourceMappingURL=splash-loading.js.map