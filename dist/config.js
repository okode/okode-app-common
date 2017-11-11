var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
    Config_1 = Config;
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
            .get(Config_1.CONFIG_JSON_PATH)
            .subscribe(function (res) {
            var configs = res;
            if (configs == null || Object.keys(configs).length == 0) {
                _this.readyPromiseReject.forEach(function (reject) { return reject(); });
                _this.log.i("Config fails: '" + Config_1.CONFIG_JSON_PATH + "' is empty or invalid");
                return;
            }
            var environments = Object.keys(configs).filter(function (environment) { return environment !== 'default'; });
            if (environments == null || environments.length == 0) {
                _this.setConfig(false, 'default', configs['default']);
            }
            else {
                _this.storage.ready().then(function () {
                    _this.storage.get(Config_1.ENVIRONMENT_KEY).then(function (storedEnvironment) {
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
            _this.log.i("Config fails: Not found '" + Config_1.CONFIG_JSON_PATH + "'");
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
            this.storage.set(Config_1.ENVIRONMENT_KEY, environment);
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
    Config.prototype.getVersionNumber = function () {
        var _this = this;
        return this.platform.ready().then(function () {
            if (_this.platform.is('cordova')) {
                var versionNumber_1 = '';
                return _this.appVersion.getVersionNumber().then(function (version) {
                    versionNumber_1 = version;
                    return _this.ready().then(function () {
                        var versionEnv = _this.getConfig().versionEnv;
                        if (versionEnv != null) {
                            versionNumber_1 += "-" + versionEnv;
                        }
                        return versionNumber_1;
                    });
                });
            }
            else {
                return 'Browser version';
            }
        });
    };
    Config.ENVIRONMENT_KEY = 'configEnvironmentKey';
    Config.CONFIG_JSON_PATH = 'assets/config/config.json';
    Config = Config_1 = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Platform,
            Storage,
            AppVersion,
            HttpClient,
            ActionSheetController,
            ToastController,
            Log])
    ], Config);
    return Config;
    var Config_1;
}());
export { Config };
//# sourceMappingURL=config.js.map