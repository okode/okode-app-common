import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/toPromise';
var MMobile = /** @class */ (function () {
    function MMobile(http, file, device, storage) {
        this.http = http;
        this.file = file;
        this.device = device;
        this.storage = storage;
    }
    MMobile.prototype.init = function (baseUrl, appName, version, jwtConfigName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.baseUrl = baseUrl;
            _this.appName = appName;
            _this.version = version;
            _this.jwtConfigName = jwtConfigName;
            _this.prepareLogs();
            var url = baseUrl + "/config/" + appName + "/" + version;
            _this.http.get(url).toPromise()
                .then(function (result) {
                _this.config = result;
                _this.storage.ready()
                    .then(function () {
                    return _this.storage.set(MMobile.MMOBILE_CONFIG, _this.config);
                })
                    .then(function () {
                    return _this.storage.set(MMobile.LAST_UPDATED_KEY, new Date());
                })
                    .then(function () {
                    resolve(true);
                });
            })
                .catch(function (error) {
                _this.printLog("Error downloading MMobile config. Check it out: " + url);
                _this.storage.ready()
                    .then(function () {
                    return _this.storage.get(MMobile.MMOBILE_CONFIG);
                })
                    .then(function (config) {
                    if (config != null) {
                        _this.config = config;
                        resolve(false);
                    }
                    else {
                        _this.http.get(MMobile.INITIAL_CONFIG_PATH).toPromise()
                            .then(function (result) {
                            _this.config = result;
                            _this.storage.ready()
                                .then(function () {
                                return _this.storage.get(MMobile.LAST_UPDATED_KEY);
                            })
                                .then(function (lastUpdatedDate) {
                                if (lastUpdatedDate == null) {
                                    return _this.storage.set(MMobile.LAST_UPDATED_KEY, new Date());
                                }
                                else {
                                    return Promise.resolve();
                                }
                            })
                                .then(function () {
                                resolve(false);
                            });
                        })
                            .catch(function (error) {
                            _this.printLog("Error loading MMobile initial config. Reason: " + JSON.stringify(error));
                            reject();
                        });
                    }
                });
            });
        });
    };
    MMobile.prototype.reloadConfig = function () {
        this.checkIfIsInitialized();
        return this.init(this.baseUrl, this.appName, this.version);
    };
    MMobile.prototype.getCustomConfig = function () {
        this.checkIfIsInitialized();
        return this.config.customConfig;
    };
    MMobile.prototype.getVersion = function () {
        return this.version;
    };
    MMobile.prototype.getTimeout = function () {
        this.checkIfIsInitialized();
        return this.config.timeout;
    };
    MMobile.prototype.isActive = function () {
        this.checkIfIsInitialized();
        return this.config.active;
    };
    MMobile.prototype.getFeatures = function () {
        this.checkIfIsInitialized();
        return this.config.features;
    };
    MMobile.prototype.isDeviceLocked = function () {
        this.checkIfIsInitialized();
        var mobileLockInfo = this.config.lockingConfig;
        if (mobileLockInfo == null || !mobileLockInfo.active) {
            return false;
        }
        var deviceVersion = this.device.version;
        var deviceModel = this.device.model;
        var devicePlatform = this.device.platform;
        var deviceMatched = false;
        mobileLockInfo.devices.forEach(function (deviceLockInfo) {
            if (deviceMatched)
                return;
            var modelMatch = true;
            var versionMatch = true;
            var platformMatch = true;
            // Matching model
            if (deviceLockInfo.model != null) {
                var re = new RegExp(deviceLockInfo.model, 'i');
                modelMatch = re.test(deviceModel);
            }
            // Matching version
            if (deviceLockInfo.version != null) {
                var re = new RegExp(deviceLockInfo.version, 'i');
                versionMatch = re.test(deviceVersion);
            }
            // Matching platform
            if (deviceLockInfo.platform != null) {
                var re = new RegExp(deviceLockInfo.platform, 'i');
                platformMatch = re.test(devicePlatform);
            }
            if (modelMatch && platformMatch && versionMatch) {
                deviceMatched = true;
            }
        });
        if (mobileLockInfo.mode == 'WHITELIST') {
            return !deviceMatched;
        }
        else {
            return deviceMatched;
        }
    };
    MMobile.prototype.getLastUpdatedDate = function () {
        var _this = this;
        this.checkIfIsInitialized();
        return new Promise(function (resolve, reject) {
            _this.storage.ready()
                .then(function () {
                return _this.storage.get(MMobile.LAST_UPDATED_KEY);
            })
                .then(function (date) {
                resolve(new Date(date));
            })
                .catch(function (error) {
                reject(error);
            });
        });
    };
    MMobile.prototype.writeLog = function (log) {
        var _this = this;
        var message = ">>>>>>> " + this.getFormattedDateWithHour() + ": " + log + '\n';
        this.file.writeFile("" + this.file.dataDirectory + MMobile.LOGS_DIR + "/", this.getLogsFileName(), message, { append: true })
            .catch(function (err) {
            _this.printLog("Error writing log to file. Discarding it. Reason: " + JSON.stringify(err));
        });
    };
    MMobile.prototype.sendLogs = function (deviceName) {
        var _this = this;
        this.checkIfIsInitialized();
        return new Promise(function (resolve, reject) {
            if (_this.isLogsEnabled()) {
                _this.file.readAsText("" + _this.file.dataDirectory + MMobile.LOGS_DIR + "/", _this.getLogsFileName())
                    .then(function (log) {
                    var logsUrl = _this.baseUrl + "/services/public/" + _this.appName + "/" + _this.version + "/" + MMobile.LOGS_SERVICE_KEY;
                    var body = {
                        'rawlog': btoa(log),
                        'deviceId': deviceName
                    };
                    var headers = new HttpHeaders({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    });
                    return _this.http.post(logsUrl, _this.jsonToURLEncoded(body), { headers: headers, responseType: 'text' }).toPromise();
                })
                    .then(function (result) {
                    resolve(true);
                })
                    .catch(function (error) {
                    _this.writeLog("Error sending MMobile logs. Reason: " + JSON.stringify(error));
                    resolve(false);
                });
            }
            else {
                _this.writeLog('Logs service is not enabled');
                resolve(false);
            }
        });
    };
    MMobile.prototype.isLogsEnabled = function () {
        this.checkIfIsInitialized();
        return (this.config.services !== null
            && this.config.services[MMobile.LOGS_SERVICE_KEY] !== null
            && this.config.services[MMobile.LOGS_SERVICE_KEY] !== null);
    };
    MMobile.prototype.getServiceUrl = function (key) {
        this.checkIfIsInitialized();
        var service = this.config.services[key];
        if (service != null) {
            return ("" + this.baseUrl + service.prefix + "/" + this.appName + "/" + this.version + "/" + key);
        }
        else {
            this.printLog("Service was not found: " + key);
            return null;
        }
    };
    MMobile.prototype.getJwtLoginUrl = function () {
        this.checkIfIsInitialized();
        if (this.jwtConfigName) {
            return this.baseUrl + "/jwt/login/" + this.appName + "/" + this.version + "/" + this.jwtConfigName;
        }
        else {
            this.printLog("jwtConfigName service is not enabled");
            return null;
        }
    };
    MMobile.prototype.isInitialized = function () {
        return this.config != null;
    };
    MMobile.prototype.setLogger = function (logger) {
        this.logger = logger;
    };
    MMobile.prototype.prepareLogs = function () {
        var _this = this;
        this.file.checkDir(this.file.dataDirectory, MMobile.LOGS_DIR)
            .then(function () {
            // Logs directory exists. Check if the file is created for today
            _this.file.checkFile("" + _this.file.dataDirectory + MMobile.LOGS_DIR + "/", _this.getLogsFileName())
                .then(function () {
                // Logs file exists for today, nothing to do
            })
                .catch(function (err) {
                _this.file.removeRecursively(_this.file.dataDirectory, MMobile.LOGS_DIR)
                    .then(function () {
                    _this.prepareLogs();
                });
            });
        })
            .catch(function (err) {
            if (err == 'cordova_not_available') {
                _this.printLog("Cordova not enabled. Discarding it. Reason: " + JSON.stringify(err));
                return;
            }
            _this.file.createDir(_this.file.dataDirectory, MMobile.LOGS_DIR, false)
                .then(function () {
                _this.file.createFile("" + _this.file.dataDirectory + MMobile.LOGS_DIR + "/", _this.getLogsFileName(), true);
            });
        });
    };
    MMobile.prototype.getFormattedDateWithHour = function () {
        var now = new Date();
        var dd = ('0' + now.getDate()).slice(-2);
        var MM = ('0' + (now.getMonth() + 1)).slice(-2);
        var yyyy = now.getFullYear();
        var hh = ('0' + now.getHours()).slice(-2);
        var mm = ('0' + now.getMinutes()).slice(-2);
        var ss = ('0' + now.getSeconds()).slice(-2);
        return dd + "/" + MM + "/" + yyyy + " " + hh + ":" + mm + ":" + ss;
    };
    MMobile.prototype.getLogsFileName = function () {
        var now = new Date();
        var dd = ('0' + now.getDate()).slice(-2);
        var MM = ('0' + (now.getMonth() + 1)).slice(-2);
        var yyyy = now.getFullYear();
        return "log" + dd + MM + yyyy + ".txt";
    };
    MMobile.prototype.jsonToURLEncoded = function (jsonString) {
        return Object.keys(jsonString).map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(jsonString[key]); }).join('&');
    };
    MMobile.prototype.checkIfIsInitialized = function () {
        if (this.config == null) {
            throw ({ message: 'MMobile is not initialized', needsRestartApp: true });
        }
    };
    MMobile.prototype.printLog = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this.logger == null) {
            console.log(message, optionalParams);
        }
        else {
            this.logger.i(message, optionalParams);
        }
    };
    MMobile.INITIAL_CONFIG_PATH = 'assets/config/mmobileInitialConfig.json';
    MMobile.LOGS_DIR = 'mmobilelogs';
    MMobile.LOGS_SERVICE_KEY = 'MMOBILE_sendLogs';
    MMobile.LAST_UPDATED_KEY = 'MMOBILE_lastUpdated';
    MMobile.MMOBILE_CONFIG = 'MMOBILE_config';
    MMobile.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MMobile.ctorParameters = function () { return [
        { type: HttpClient, },
        { type: File, },
        { type: Device, },
        { type: Storage, },
    ]; };
    return MMobile;
}());
export { MMobile };
//# sourceMappingURL=mmobile.js.map