import { Injectable } from '@angular/core';
import { Platform, IonicErrorHandler, AlertController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as StackTrace from 'stacktrace-js';
import { Log } from './log';
import { Storage } from '@ionic/storage';

@Injectable()
export class CrashlyticsErrorHandler extends IonicErrorHandler {

  private static APP_CRASH_DETECTED_KEY = 'OKODE_APP_CRASH_DETECTED';
  private static APP_CRASH_MESSAGE_ES = 'La App ha detectado un error y se reiniciará.';
  private static APP_CRASH_MESSAGE_EN = 'An error was detected, the App will restart.';

  private static APP_CRASH_QUOTA_EXCEEDED_ES = 'Optimiza el espacio disponible para poder acceder a la app';
  private static APP_CRASH_QUOTA_EXCEEDED_EN = 'Please optimize the available storage space in order to be able to use the app';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private log: Log,
    private storage: Storage,
    private alertCtrl: AlertController
  ) {
    super();
  }

  handleError(error: any) {
    if (this.isQuotaExceededError(error)) return this.handleQuotaExceededError();
    if (this.isIgnorableNavError(error)) { return; }
    if (!this.platform.is('cordova') && error.rejection && error.rejection.needsRestartApp == true) {
      this.restartApp();
    } else {
      super.handleError(error);
    }
    if (this.platform.is('cordova') && !this.isIgnorableError(error)) {
      this.sendErrorAndDisplayError(error);
    }
  }

  async getAndClearCrashDetected() {
    try {
      let keys = await this.storage.keys();
      let appWasCrashed = false;
      if (keys.indexOf(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY) != -1) appWasCrashed = true;
      await this.storage.remove(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY);
      return appWasCrashed;
    } catch (err) { }
    return false;
  }

  async sendSilentError(error: any) {
    if (typeof fabric != 'undefined') {
      if (error instanceof Error) {
        const frames = await StackTrace.fromError(error).catch(reason => this.log.e('Crashlytics catch: ' + reason));
        if (frames) {
          if (this.platform.is('android')) {
            fabric.Crashlytics.sendNonFatalCrash(error.message, frames);
          } else {
            let baseHref = window.location.href.replace('www/index.html', '');
            let report = '';
            for (let frame of frames) {
              report += `${frame.functionName}(${frame.fileName.replace(baseHref, '')}:${frame.lineNumber})\n`;
            }
            fabric.Crashlytics.sendNonFatalCrash(`${error.name}: ${error.message}\n\n${report}`);
          }
        }
      } else {
        fabric.Crashlytics.sendNonFatalCrash(JSON.stringify(error));
      }
    }
  }

  private async sendErrorAndDisplayError(error: any) {
    await this.sendSilentError(error);
    this.displayErrorMsgAndReload();
  }

  private displayErrorMsgAndReload() {
    this.splashScreen.hide();
    let isLangES = navigator.language.startsWith('es');
    this.alertCtrl.create({
      title: 'Error',
      message: isLangES ? CrashlyticsErrorHandler.APP_CRASH_MESSAGE_ES : CrashlyticsErrorHandler.APP_CRASH_MESSAGE_EN,
      enableBackdropDismiss: false,
      buttons: [{
        text: isLangES ? 'Aceptar' : 'OK',
        handler: () => {
          this.log.e(CrashlyticsErrorHandler.APP_CRASH_MESSAGE_EN);
          this.log.e(`Creating entry in local storage for ${CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY} = true`);
          this.storage.set(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY, true).then(() => {
            this.splashScreen.show();
            this.restartApp();
          }).catch(() => {
            this.splashScreen.show();
            this.restartApp();
          });
        }
      }]
    }).present();
  }

  private restartApp() {
    let href = window.location.href;
    if (href.indexOf('/www/index.html') > 0) {
      href = href.substring(0, href.indexOf('/www/index.html') + '/www/index.html'.length);
    } else {
      href = '/';
    }
    window.location.href = href;
  }

  private isIgnorableError(error: any) {
    if (error !== undefined && error.status !== undefined && error.status >= 400) return true;
    return false;
  }

  private isIgnorableNavError(error: any) {
    if (!error || !error.message) { return false; }
    let message = error.message;
    /**
     * Messages got from:
     * https://github.com/ionic-team/ionic/blob/ae4be669bb96de01ff2224ff36da89e9cde12c7f/src/navigation/nav-controller-base.ts#L322
     *
     */
    if (
      message.includes('navigation stack needs at least one root page') ||
      message.includes('no views in the stack to be removed') ||
      message.includes('removeView was not found')
    ) {
      this.log.e(`Ignoring Ionic nav error ${message}`);
      return true;
    }
    return false;
  }

  isQuotaExceededError(error: any) {
    this.log.e({error});
    if (error) {
      if (error.rejection) {
        if (error.rejection instanceof DOMException) {
          if (error.rejection.code == DOMException.QUOTA_EXCEEDED_ERR) {
            return true;
          }
        } else {
          if (error.rejection.code == 4 && error.rejection.message == 'sqlite3_step failure: database or disk is full') { // https://github.com/litehelpers/Cordova-sqlite-storage/blob/87a06a0705576c772a6b2e95f07ca659eca8744c/src/android/io/sqlc/SQLiteConnectorDatabase.java#L136
            return true;
          }
        }
      }
    }
    return false;
  }

  handleQuotaExceededError() {
    this.splashScreen.hide();
    let isLangES = navigator.language.startsWith('es');
    this.alertCtrl.create({
      title: 'Error',
      message: isLangES ? CrashlyticsErrorHandler.APP_CRASH_QUOTA_EXCEEDED_ES : CrashlyticsErrorHandler.APP_CRASH_QUOTA_EXCEEDED_EN,
      enableBackdropDismiss: false,
      buttons: [{
        text: isLangES ? 'Aceptar' : 'OK',
        handler: () => {
          this.log.e(CrashlyticsErrorHandler.APP_CRASH_QUOTA_EXCEEDED_EN);
          this.log.e(`Creating entry in local storage for ${CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY} = true`);
          this.storage.set(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY, true).then(() => {
            this.splashScreen.show();
            this.restartApp();
          }).catch(() => {
            this.splashScreen.show();
            this.restartApp();
          });
        }
      }]
    }).present();
  }

}
