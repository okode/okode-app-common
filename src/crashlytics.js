var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, isDevMode } from '@angular/core';
import { Platform, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as StackTrace from 'stacktrace-js';
import safeJsonStringify from 'safe-json-stringify';
var CrashlyticsErrorHandler = (function (_super) {
    __extends(CrashlyticsErrorHandler, _super);
    function CrashlyticsErrorHandler(platform, splashScreen) {
        var _this = _super.call(this) || this;
        _this.platform = platform;
        _this.splashScreen = splashScreen;
        return _this;
    }
    CrashlyticsErrorHandler.prototype.handleError = function (error) {
        _super.prototype.handleError.call(this, error);
        if (!isDevMode() && !this.isAnIgnorableError(error)) {
            this.sendError(error);
        }
    };
    CrashlyticsErrorHandler.prototype.sendError = function (error) {
        var _this = this;
        console.log('TODO: Add block UI for preventing use while sending report to Crashlytics');
        if (typeof fabric != 'undefined') {
            if (error instanceof Error) {
                StackTrace.fromError(error).then(function (frames) {
                    if (_this.platform.is('android')) {
                        fabric.Crashlytics.sendNonFatalCrash(error.message, frames);
                    }
                    else {
                        var baseHref = window.location.href.replace('www/index.html', '');
                        var report = '';
                        for (var _i = 0, frames_1 = frames; _i < frames_1.length; _i++) {
                            var frame = frames_1[_i];
                            report += frame.functionName + "(" + frame.fileName.replace(baseHref, '') + ":" + frame.lineNumber + ")\n";
                        }
                        fabric.Crashlytics.sendNonFatalCrash(error.name + ": " + error.message + "\n\n" + report);
                    }
                    _this.displayErrorMsgAndReload();
                }).catch(function (reason) { return console.log('Crashlytics catch: ' + reason); });
            }
            else {
                fabric.Crashlytics.sendNonFatalCrash(safeJsonStringify(error));
                this.displayErrorMsgAndReload();
            }
        }
    };
    CrashlyticsErrorHandler.prototype.displayErrorMsgAndReload = function () {
        console.log('The application has unexpectedly quit and will restart.');
        this.splashScreen.show();
        window.location.reload();
    };
    CrashlyticsErrorHandler.prototype.isAnIgnorableError = function (error) {
        if (error && error.status == 500)
            return true;
        return false;
    };
    CrashlyticsErrorHandler = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Platform,
            SplashScreen])
    ], CrashlyticsErrorHandler);
    return CrashlyticsErrorHandler;
}(IonicErrorHandler));
export { CrashlyticsErrorHandler };
//# sourceMappingURL=crashlytics.js.map