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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/toPromise';
import { safeJsonStringify } from 'safe-json-stringify';
var MMobile = /** @class */ (function () {
    function MMobile(http, file, device, storage) {
        this.http = http;
        this.file = file;
        this.device = device;
        this.storage = storage;
        this.logsQueue = [];
        this.isProcessingLogs = false;
    }
    MMobile.prototype.init = function (baseUrl, appName, version, jwtConfigName, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.baseUrl = baseUrl;
            _this.appName = appName;
            _this.version = version;
            _this.jwtConfigName = jwtConfigName;
            _this.timeout = timeout;
            _this.prepareLogs();
            var url = baseUrl + "/config/" + appName + "/" + version;
            var observable = _this.http.get(url);
            if (timeout) {
                observable = observable.timeout(timeout);
            }
            observable.toPromise()
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
        return this.init(this.baseUrl, this.appName, this.version, this.jwtConfigName, this.timeout);
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
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                message = ">>>>>>> " + this.getFormattedDateWithHour() + ": " + log + '\n';
                this.logsQueue.push(message);
                if (!this.isProcessingLogs) {
                    this.processLogs();
                }
                return [2 /*return*/];
            });
        });
    };
    MMobile.prototype.processLogs = function () {
        var _this = this;
        if (!this.logsQueue.length) {
            this.isProcessingLogs = false;
            return;
        }
        this.isProcessingLogs = true;
        var m = this.logsQueue.shift();
        this.file.writeFile("" + this.file.dataDirectory + MMobile.LOGS_DIR + "/", this.getLogsFileName(), m, { append: true })
            .then(function () { return _this.processLogs(); })
            .catch(function (err) {
            _this.printLog("Error writing log to file. Discarding it. Reason: " + JSON.stringify(err));
            _this.processLogs();
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
                        'rawlog': btoa(unescape(encodeURIComponent(log))),
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
            if (service.mediated == false) {
                return service.path;
            }
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
    MMobile.prototype.getJwtRefreshUrl = function () {
        this.checkIfIsInitialized();
        if (this.jwtConfigName) {
            return this.baseUrl + "/jwt/refresh/" + this.appName + "/" + this.version + "/" + this.jwtConfigName;
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
                _this.printLog("Logs file for today already exists: ", _this.getLogsFileName());
            })
                .catch(function (checkFileErr) {
                _this.printLog("Failed to check logs file. Reason: " + safeJsonStringify(checkFileErr));
                _this.file.removeRecursively(_this.file.dataDirectory, MMobile.LOGS_DIR)
                    .then(function () {
                    _this.prepareLogs();
                })
                    .catch(function (removeRecursivelyErr) {
                    _this.printLog("Failed to remove logs files and directory recursively. Reason: " + safeJsonStringify(checkFileErr));
                });
            });
        })
            .catch(function (err) {
            if (err == 'cordova_not_available') {
                _this.printLog("Cordova not enabled. Discarding it. Reason: " + JSON.stringify(err));
                return;
            }
            _this.printLog("Failed to check logs directory. Reason: " + safeJsonStringify(err));
            _this.file.createDir(_this.file.dataDirectory, MMobile.LOGS_DIR, false)
                .then(function () {
                _this.file.createFile("" + _this.file.dataDirectory + MMobile.LOGS_DIR + "/", _this.getLogsFileName(), true)
                    .then(function () {
                    _this.printLog("Success creating logs file");
                })
                    .catch(function (createFileErr) {
                    _this.printLog("Failed to create logs directory. Reason: " + safeJsonStringify(createFileErr));
                });
            })
                .catch(function (createDirErr) {
                _this.printLog("Failed to create logs directory. Reason: " + safeJsonStringify(createDirErr));
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