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
import { Storage } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, ToastController, Platform } from 'ionic-angular';
import { Log } from './log';
var Config = /** @class */ (function () {
    function Config(platform, storage, appVersion, http, actionSheetCtrl, toastCtrl, log) {
        this.platform = platform;
        this.storage = storage;
        this.appVersion = appVersion;
        this.http = http;
        this.actionSheetCtrl = actionSheetCtrl;
        this.toastCtrl = toastCtrl;
        this.log = log;
        this.isReady = false;
        this.isInitializing = false;
        this.readyPromiseResolve = [];
        this.readyPromiseReject = [];
    }
    Config.prototype.ready = function () {
        var _this = this;
        if (this.isReady)
            return Promise.resolve();
        if (!this.isInitializing) {
            this.isInitializing = true;
            this.initConfigs();
        }
        return new Promise(function (resolve, reject) {
            _this.readyPromiseResolve.push(resolve);
            _this.readyPromiseReject.push(reject);
        });
    };
    Config.prototype.initConfigs = function () {
        var _this = this;
        this.http
            .get(Config.CONFIG_JSON_PATH)
            .subscribe(function (res) {
            var configs = res;
            if (configs == null || Object.keys(configs).length == 0) {
                _this.readyPromiseReject.forEach(function (reject) { return reject(); });
                _this.log.i("Config fails: '" + Config.CONFIG_JSON_PATH + "' is empty or invalid");
                return;
            }
            var environments = Object.keys(configs).filter(function (environment) { return environment !== 'default'; });
            if (environments == null || environments.length == 0) {
                _this.setConfig(false, 'default', configs['default']);
            }
            else {
                _this.storage.ready().then(function () {
                    _this.storage.get(Config.ENVIRONMENT_KEY).then(function (storedEnvironment) {
                        if (storedEnvironment == null) {
                            if (environments.length > 1) {
                                _this.log.i('No saved environment detected, will prompt user for selection');
                                _this.showEnvironmentActionSheet(environments, configs);
                            }
                            else {
                                var environment = environments[0];
                                _this.setConfig(true, environment, configs['default'], configs[environment]);
                            }
                        }
                        else {
                            _this.log.i("Detected saved environment: " + storedEnvironment);
                            _this.setConfig(false, storedEnvironment, configs['default'], configs[storedEnvironment]);
                        }
                    });
                });
            }
        }, function (err) {
            _this.readyPromiseReject.forEach(function (reject) { return reject(); });
            _this.log.i("Config fails: Not found '" + Config.CONFIG_JSON_PATH + "'");
        });
    };
    Config.prototype.showEnvironmentActionSheet = function (environments, configs) {
        var _this = this;
        var actionSheet = this.actionSheetCtrl.create({
            title: 'Select environment',
            enableBackdropDismiss: false,
            buttons: environments.map(function (environment) { return ({
                text: environment,
                handler: function () {
                    _this.setConfig(true, environment, configs['default'], configs[environment]);
                    actionSheet.dismiss().then(function () {
                        _this.toastCtrl.create({ message: environment + " selected", duration: 2000, position: 'top' }).present();
                    });
                    return false;
                }
            }); })
        });
        actionSheet.present();
    };
    Config.prototype.setConfig = function (save, environment, configBase, configEnvironment) {
        this.log.i("Applying environment: " + environment);
        this.environment = environment;
        this.config = configBase;
        if (configEnvironment != null) {
            Object.assign(this.config, configEnvironment);
        }
        if (save) {
            this.log.i("Saving environment: " + environment);
            this.storage.set(Config.ENVIRONMENT_KEY, environment);
        }
        this.isReady = true;
        this.readyPromiseResolve.forEach(function (resolve) { return resolve(); });
    };
    Config.prototype.getConfig = function () {
        return this.config;
    };
    Config.prototype.getEnvironment = function () {
        return this.environment;
    };
    Config.prototype.getUpdateToVersion = function () {
        if (this.updateToVersion)
            return this.updateToVersion;
        if (!this.config || !this.config.updateToVersion)
            return 0;
        this.updateToVersion = this.config.updateToVersion;
        return this.updateToVersion;
    };
    Config.prototype.getAppName = function (browserAppName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        if (!this.platform.is('cordova')) {
                            return [2 /*return*/, Promise.resolve(browserAppName)];
                        }
                        return [2 /*return*/, this.appVersion.getAppName().then(function (name) { return name; })];
                }
            });
        });
    };
    Config.prototype.getVersionNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var appVersion, versionEnv;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        appVersion = Config.BROWSER_VERSION;
                        if (!this.platform.is('cordova')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.appVersion.getVersionNumber().then(function (version) { return version; })];
                    case 2:
                        appVersion = _a.sent();
                        _a.label = 3;
                    case 3:
                        versionEnv = this.getConfig().versionEnv;
                        if (versionEnv != null) {
                            appVersion += "-" + versionEnv;
                        }
                        return [2 /*return*/, appVersion];
                }
            });
        });
    };
    Config.prototype.getMMobileVersion = function () {
        var config = this.getConfig();
        var mmobileVersionNumber = config.mmobileConfigVersion;
        if (mmobileVersionNumber == null) {
            this.log.i('Unknown MMobile version. Set "mmobileConfigVersion" property on config.xml');
            return null;
        }
        var versionEnv = config.versionEnv;
        if (versionEnv != null) {
            mmobileVersionNumber += "-" + versionEnv;
        }
        return mmobileVersionNumber;
    };
    Config.ENVIRONMENT_KEY = 'configEnvironmentKey';
    Config.CONFIG_JSON_PATH = 'assets/config/config.json';
    Config.BROWSER_VERSION = 'Browser version';
    Config.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    Config.ctorParameters = function () { return [
        { type: Platform, },
        { type: Storage, },
        { type: AppVersion, },
        { type: HttpClient, },
        { type: ActionSheetController, },
        { type: ToastController, },
        { type: Log, },
    ]; };
    return Config;
}());
export { Config };
//# sourceMappingURL=config.js.map