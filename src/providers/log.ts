import { Injectable, isDevMode } from '@angular/core';
import { MMobile } from './mmobile';
import { Logger } from './logger';
import safeJsonStringify from 'safe-json-stringify';

@Injectable()
export class Log implements Logger {

  private static INFO_TAG = '[INFO]';
  private static DEBUG_TAG = '[DEBUG]';
  private static WARNING_TAG = '[WARNING]';
  private static ERROR_TAG = '[ERROR]';

  private nuuma: string;
  private technicianId: string;
  private role: string;

  constructor(private mmobile: MMobile) {}

  /**
   * Set user identifier to add it into the log lines
   * @param nuuma identifier
   * @param technicianId sub-identifier
   */
  setUser(nuuma: string, technicianId?: string) {
    this.nuuma = nuuma;
    if (technicianId != null) {
      this.technicianId = technicianId;
    }
  }

  setRole(role: string) {
    this.role = role;
  }

  i(message?: any, ...optionalParams: any[]) {
    this.print(Log.INFO_TAG, message, optionalParams);
  }

  d(message?: any, ...optionalParams: any[]) {
    if (isDevMode()) {
      this.print(Log.DEBUG_TAG, message, optionalParams);
    }
  }

  w(message?: any, ...optionalParams: any[]) {
    this.print(Log.WARNING_TAG, message, optionalParams);
  }

  e(message?: any, ...optionalParams: any[]) {
    this.print(Log.ERROR_TAG, message, optionalParams);
  }

  private print(tag: string, message?: any, ...optionalParams: any[]) {
    let parsedMessage = '';
    if (typeof message === 'string') {
      parsedMessage = message;
    } else {
      if (message.message) {
        parsedMessage = message.message;
      } else {
        try {
          parsedMessage = safeJsonStringify(message);
        } catch (stringifyError) {
          console.log('Error parsing log message: ', stringifyError);
        }
      }
    }
    let log = `${tag}${this.getUser()}: ${parsedMessage} ${optionalParams.join(' ')}`;
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
  }

  private getUser() {
    let userInfo = '';
    let technician = this.technicianId == null ? '' : ', ' + this.technicianId;
    if (this.nuuma) {
      userInfo = ` (${this.nuuma}${technician})`;
    }
    if (this.role) {
       userInfo += ` (${this.role})`;
    }
    return userInfo;
  }

}
