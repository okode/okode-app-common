import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import { Log } from './log';
export var UserIdType;
(function (UserIdType) {
    UserIdType[UserIdType["DNI"] = 0] = "DNI";
    UserIdType[UserIdType["EMAIL"] = 1] = "EMAIL";
    UserIdType[UserIdType["NUUMA"] = 2] = "NUUMA";
    UserIdType[UserIdType["USUARIOAMA"] = 3] = "USUARIOAMA";
    UserIdType[UserIdType["USUARIOCIS"] = 4] = "USUARIOCIS";
})(UserIdType || (UserIdType = {}));
var MPushService = /** @class */ (function () {
    function MPushService(http, device, storage, log) {
        this.http = http;
        this.device = device;
        this.storage = storage;
        this.log = log;
    }
    MPushService.prototype.init = function (baseUrl, mpushClientApp, userIdType) {
        this.baseUrl = baseUrl + "/" + mpushClientApp;
        this.userIdType = userIdType;
    };
    MPushService.prototype.setCredentials = function (user, password) {
        this.user = user;
        this.password = password;
    };
    MPushService.prototype.register = function (user) {
        var _this = this;
        this.checkIfIsInitialized();
        return this.storage.ready()
            .then(function () {
            return _this.storage.get(MPushService.USUNM);
        })
            .then(function (usunm) {
            return _this.doRegister(user, usunm);
        });
    };
    MPushService.prototype.forceNewRegister = function (user) {
        this.checkIfIsInitialized();
        return this.doRegister(user, null);
    };
    MPushService.prototype.unregister = function (userValue) {
        var _this = this;
        this.checkIfIsInitialized();
        return new Promise(function (resolve, reject) {
            var currentUsunm = null;
            _this.storage.ready()
                .then(function () { return _this.storage.get(MPushService.USUNM); })
                .then(function (usunm) {
                currentUsunm = usunm;
                return _this.getChannelId();
            })
                .then(function (channelId) {
                var url = _this.baseUrl + "/unregisterUser";
                var options = {};
                if (_this.user && _this.password) {
                    var encodedCredentials = btoa(_this.user + ":" + _this.password);
                    var headers = new HttpHeaders();
                    headers = headers.append('Authorization', "Basic " + encodedCredentials);
                    options.headers = headers;
                }
                var body = {
                    'technology': _this.device.platform,
                    'userIdTypeKey': UserIdType[_this.userIdType],
                    'userIdTypeValue': userValue,
                };
                if (currentUsunm)
                    body.usunm = currentUsunm;
                if (channelId)
                    body.urbanChannel = channelId;
                _this.http.post(url, body, options).toPromise()
                    .then(function () {
                    _this.log.i('[MPUSH] Usunm was unregistered successfully');
                    UAirship.setAlias('', function () { resolve(); });
                })
                    .catch(function (err) {
                    _this.log.e("[MPUSH] Error unregistering user from MPush. Reason: " + _this.safeStringify(err));
                    reject(err);
                });
            });
        });
    };
    MPushService.prototype.getUsunm = function () {
        return this.storage.get(MPushService.USUNM);
    };
    MPushService.prototype.doRegister = function (userValue, usunm) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getChannelId()
                .then(function (channelId) {
                var url = _this.baseUrl;
                var options = { headers: null, responseType: 'json' };
                if (_this.user && _this.password) {
                    var encodedCredentials = btoa(_this.user + ":" + _this.password);
                    var headers = new HttpHeaders();
                    headers = headers.append('Authorization', "Basic " + encodedCredentials);
                    options.headers = headers;
                }
                var body = {
                    'technology': _this.device.platform,
                    'userIdTypeKey': UserIdType[_this.userIdType],
                    'userIdTypeValue': userValue,
                };
                if (usunm)
                    body.usunm = usunm;
                if (channelId)
                    body.urbanChannel = channelId;
                _this.http.post(url, body, options).toPromise()
                    .then(function (response) {
                    var currentUsunm = response.usunm;
                    if (currentUsunm) {
                        UAirship.setAlias(currentUsunm, function () {
                            _this.log.i("[MPUSH] Device usunm " + currentUsunm);
                            _this.storage.ready().then(function () { return _this.storage.set(MPushService.USUNM, currentUsunm); });
                        });
                    }
                    else {
                        _this.log.e('[MPUSH] Error getting usunm.');
                    }
                    resolve();
                })
                    .catch(function (err) {
                    _this.log.e("[MPUSH] Error registering user in MPush. Reason: " + _this.safeStringify(err));
                    var response = err.json ? err.json() : err.error;
                    var unknownUsunm = 8;
                    if (response.code && response.code == unknownUsunm) {
                        _this.log.w('[MPUSH] Usunm not registered in mpush and trying to obtain new one');
                        _this.storage.ready()
                            .then(function () { return _this.storage.remove(MPushService.USUNM); })
                            .then(function () { return _this.doRegister(userValue, null); })
                            .then(function () { return resolve(); })
                            .catch(function (err) { return reject(err); });
                    }
                    else
                        reject(err);
                });
            })
                .catch(function (err) { return reject(err); });
        });
    };
    MPushService.prototype.getChannelId = function () {
        var maxTimeout = 10000;
        var promise = new Promise(function (resolve, reject) {
            UAirship.getChannelID((function (channelId) { return resolve(channelId); }));
        });
        return this.promiseTimeout(maxTimeout, promise);
    };
    MPushService.prototype.checkIfIsInitialized = function () {
        if (this.baseUrl == null) {
            throw ('MPush is not initialized');
        }
    };
    MPushService.prototype.promiseTimeout = function (milis, promise) {
        // Create a promise that rejects in <ms> milliseconds
        var timeout = new Promise(function (resolve, reject) {
            var id = setTimeout(function () {
                clearTimeout(id);
                reject('Timed out in ' + milis + 'ms.');
            }, milis);
        });
        // Returns a race between our timeout and the passed in promise
        return Promise.race([promise, timeout]);
    };
    MPushService.prototype.safeStringify = function (e) {
        try {
            return JSON.stringify(e);
        }
        catch (_a) {
            return 'Error on parse json error';
        }
    };
    MPushService.USUNM = 'usunm';
    MPushService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MPushService.ctorParameters = function () { return [
        { type: HttpClient, },
        { type: Device, },
        { type: Storage, },
        { type: Log, },
    ]; };
    return MPushService;
}());
export { MPushService };
//# sourceMappingURL=mpush.js.map