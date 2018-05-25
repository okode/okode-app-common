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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Injectable } from '@angular/core';
import { Platform, IonicErrorHandler, AlertController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as StackTrace from 'stacktrace-js';
import { Log } from './log';
import { Storage } from '@ionic/storage';
var CrashlyticsErrorHandler = /** @class */ (function (_super) {
    __extends(CrashlyticsErrorHandler, _super);
    function CrashlyticsErrorHandler(platform, splashScreen, log, storage, alertCtrl) {
        var _this = _super.call(this) || this;
        _this.platform = platform;
        _this.splashScreen = splashScreen;
        _this.log = log;
        _this.storage = storage;
        _this.alertCtrl = alertCtrl;
        return _this;
    }
    CrashlyticsErrorHandler.prototype.handleError = function (error) {
        if (this.isIgnorableNavError(error)) {
            return;
        }
        if (!this.platform.is('cordova') && error.rejection && error.rejection.needsRestartApp == true) {
            this.restartApp();
        }
        else {
            _super.prototype.handleError.call(this, error);
        }
        if (this.platform.is('cordova') && !this.isIgnorableError(error)) {
            this.sendError(error);
        }
    };
    CrashlyticsErrorHandler.prototype.getAndClearCrashDetected = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keys, appWasCrashed, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.storage.keys()];
                    case 1:
                        keys = _a.sent();
                        appWasCrashed = false;
                        if (keys.indexOf(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY) != -1)
                            appWasCrashed = true;
                        return [4 /*yield*/, this.storage.remove(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, appWasCrashed];
                    case 3:
                        err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    CrashlyticsErrorHandler.prototype.sendError = function (error) {
        var _this = this;
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
                }).catch(function (reason) { return _this.log.e('Crashlytics catch: ' + reason); });
            }
            else {
                fabric.Crashlytics.sendNonFatalCrash(JSON.stringify(error));
                this.displayErrorMsgAndReload();
            }
        }
    };
    CrashlyticsErrorHandler.prototype.displayErrorMsgAndReload = function () {
        var _this = this;
        this.splashScreen.hide();
        var isLangES = navigator.language.startsWith('es');
        this.alertCtrl.create({
            title: 'Error',
            message: isLangES ? CrashlyticsErrorHandler.APP_CRASH_MESSAGE_ES : CrashlyticsErrorHandler.APP_CRASH_MESSAGE_EN,
            enableBackdropDismiss: false,
            buttons: [{
                    text: isLangES ? 'Aceptar' : 'OK',
                    handler: function () {
                        _this.log.e(CrashlyticsErrorHandler.APP_CRASH_MESSAGE_EN);
                        _this.log.e("Creating entry in local storage for " + CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY + " = true");
                        _this.storage.set(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY, true).then(function () {
                            _this.splashScreen.show();
                            _this.restartApp();
                        }).catch(function () {
                            _this.splashScreen.show();
                            _this.restartApp();
                        });
                    }
                }]
        }).present();
    };
    CrashlyticsErrorHandler.prototype.restartApp = function () {
        var href = window.location.href;
        if (href.indexOf('/www/index.html') > 0) {
            href = href.substring(0, href.indexOf('/www/index.html') + '/www/index.html'.length);
        }
        else {
            href = '/';
        }
        window.location.href = href;
    };
    CrashlyticsErrorHandler.prototype.isIgnorableError = function (error) {
        if (error !== undefined && error.status !== undefined && error.status >= 400)
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
    CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY = 'OKODE_APP_CRASH_DETECTED';
    CrashlyticsErrorHandler.APP_CRASH_MESSAGE_ES = 'La App ha detectado un error y se reiniciará.';
    CrashlyticsErrorHandler.APP_CRASH_MESSAGE_EN = 'An error was detected, the App will restart.';
    CrashlyticsErrorHandler.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    CrashlyticsErrorHandler.ctorParameters = function () { return [
        { type: Platform, },
        { type: SplashScreen, },
        { type: Log, },
        { type: Storage, },
        { type: AlertController, },
    ]; };
    return CrashlyticsErrorHandler;
}(IonicErrorHandler));
export { CrashlyticsErrorHandler };
//# sourceMappingURL=crashlytics.js.map