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
import { MMobile } from './mmobile';
var Log = (function () {
    function Log(mmobile) {
        this.mmobile = mmobile;
    }
    Log_1 = Log;
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
        this.print(Log_1.INFO_TAG, message, optionalParams);
    };
    Log.prototype.d = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (isDevMode()) {
            this.print(Log_1.DEBUG_TAG, message, optionalParams);
        }
    };
    Log.prototype.w = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.print(Log_1.WARNING_TAG, message, optionalParams);
    };
    Log.prototype.e = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.print(Log_1.ERROR_TAG, message, optionalParams);
    };
    Log.prototype.print = function (tag, message) {
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        var log = "" + tag + this.getUser() + ": " + message + " " + optionalParams.join(' ');
        switch (tag) {
            case Log_1.ERROR_TAG:
                console.error(log);
                break;
            case Log_1.WARNING_TAG:
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
    Log = Log_1 = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [MMobile])
    ], Log);
    return Log;
    var Log_1;
}());
export { Log };
//# sourceMappingURL=log.js.map