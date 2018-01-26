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
import { Injectable, isDevMode } from '@angular/core';
import { Platform, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as StackTrace from 'stacktrace-js';
import { Log } from './log';
var CrashlyticsErrorHandler = /** @class */ (function (_super) {
    __extends(CrashlyticsErrorHandler, _super);
    function CrashlyticsErrorHandler(platform, splashScreen, log) {
        var _this = _super.call(this) || this;
        _this.platform = platform;
        _this.splashScreen = splashScreen;
        _this.log = log;
        return _this;
    }
    CrashlyticsErrorHandler.prototype.handleError = function (error) {
        if (this.isIgnorableNavError(error)) {
            return;
        }
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
                fabric.Crashlytics.sendNonFatalCrash(JSON.stringify(error));
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
    CrashlyticsErrorHandler.prototype.isIgnorableNavError = function (error) {
        if (!error || !error.message) {
            return false;
        }
        var message = error.message;
        /**
         * Messages got from:
         * https://github.com/ionic-team/ionic/blob/ae4be669bb96de01ff2224ff36da89e9cde12c7f/src/navigation/nav-controller-base.ts#L322
         *
         */
        if (message.includes('navigation stack needs at least one root page') ||
            message.includes('no views in the stack to be removed') ||
            message.includes('removeView was not found')) {
            this.log.e("Ignoring Ionic nav error " + message);
            return true;
        }
        return false;
    };
    CrashlyticsErrorHandler.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    CrashlyticsErrorHandler.ctorParameters = function () { return [
        { type: Platform, },
        { type: SplashScreen, },
        { type: Log, },
    ]; };
    return CrashlyticsErrorHandler;
}(IonicErrorHandler));
export { CrashlyticsErrorHandler };
//# sourceMappingURL=crashlytics.js.map