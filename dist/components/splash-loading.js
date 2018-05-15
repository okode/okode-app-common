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
                    template: "\n  <ion-content padding>\n  <div class=\"loading\">\n    <ion-spinner></ion-spinner><span>Loading...</span>\n  </div>\n  </ion-content>\n  ",
                    styles: ["\n  $splash-loading-background-color: color($colors, primary);\n  $splash-loading-background-image: none;\n  ion-content {\n    .scroll-content {\n      background-color: $splash-loading-background-color;\n      background-image: $splash-loading-background-image;\n      background-size: cover;\n      text-align: center;\n      color: white;\n      padding-bottom: 100px !important;\n      overflow-y: hidden !important;\n      min-height: 500px;\n    }\n    .loading {\n      width: 100%;\n      height: 100%;\n      margin: 50% auto;\n    }\n    ion-spinner {\n      display: block;\n      margin: 10px auto;\n      * {\n        stroke: white !important;\n      }\n  \n      &.spinner-circles circle,\n      &.spinner-bubbles circle,\n      &.spinner-dots circle {\n        fill: white !important;\n      }\n    }\n  }\n  "]
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