import { Injectable, isDevMode } from '@angular/core';
import { MMobile } from './mmobile';
var Log = /** @class */ (function () {
    function Log(mmobile) {
        this.mmobile = mmobile;
    }
    /**
     * Set user identifier to add it into the log lines
     * @param nuuma identifier
     * @param technicianId sub-identifier
     */
    Log.prototype.setUser = function (nuuma, technicianId) {
        this.nuuma = nuuma;
        if (technicianId != null) {
            this.technicianId = technicianId;
        }
    };
    Log.prototype.setRole = function (role) {
        this.role = role;
    };
    Log.prototype.i = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.print(Log.INFO_TAG, message, optionalParams);
    };
    Log.prototype.d = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (isDevMode()) {
            this.print(Log.DEBUG_TAG, message, optionalParams);
        }
    };
    Log.prototype.w = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.print(Log.WARNING_TAG, message, optionalParams);
    };
    Log.prototype.e = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.print(Log.ERROR_TAG, message, optionalParams);
    };
    Log.prototype.print = function (tag, message) {
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        var log = "" + tag + this.getUser() + ": " + message + " " + optionalParams.join(' ');
        switch (tag) {
            case Log.ERROR_TAG:
                console.error(log);
                break;
            case Log.WARNING_TAG:
                console.warn(log);
                break;
            default:
                console.log(log);
        }
        this.mmobile.writeLog(log);
        if (typeof fabric != 'undefined') {
            fabric.Crashlytics.addLog(log);
        }
    };
    Log.prototype.getUser = function () {
        var userInfo = '';
        var technician = this.technicianId == null ? '' : ', ' + this.technicianId;
        if (this.nuuma) {
            userInfo = " (" + this.nuuma + technician + ")";
        }
        if (this.role) {
            userInfo += " (" + this.role + ")";
        }
        return userInfo;
    };
    Log.INFO_TAG = '[INFO]';
    Log.DEBUG_TAG = '[DEBUG]';
    Log.WARNING_TAG = '[WARNING]';
    Log.ERROR_TAG = '[ERROR]';
    Log.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    Log.ctorParameters = function () { return [
        { type: MMobile, },
    ]; };
    return Log;
}());
export { Log };
//# sourceMappingURL=log.js.map