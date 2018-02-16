import { Injectable, isDevMode } from '@angular/core';
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
    if (this.isIgnorableNavError(error)) { return; }
    if (isDevMode() && error.rejection && error.rejection.needsRestartApp == true) {
      this.restartApp();
    } else {
      super.handleError(error);
    }
    if (!isDevMode() && !this.isIgnorableError(error)) {
      this.sendError(error);
    }
  }

  async getAndClearCrashDetected() {
    try {
      let keys = await this.storage.keys();
      let appWasCrashed = false;
      if (keys.indexOf(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY) != -1) appWasCrashed = true;
      await this.storage.remove(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY);
      return appWasCrashed;
    } catch (err) {}
    return false;
  }

  private sendError(error: any) {
    if (typeof fabric != 'undefined') {
      if (error instanceof Error) {
        StackTrace.fromError(error).then(frames => {
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
          this.displayErrorMsgAndReload();
        }).catch(reason => this.log.e('Crashlytics catch: ' + reason));
      } else {
        fabric.Crashlytics.sendNonFatalCrash(JSON.stringify(error));
        this.displayErrorMsgAndReload();
      }
    }
  }

  private displayErrorMsgAndReload() {
    this.splashScreen.hide();
    let isLangES = navigator.language.startsWith('es');
    this.alertCtrl.create({
      title: 'Error',
      message: isLangES ? CrashlyticsErrorHandler.APP_CRASH_MESSAGE_ES : CrashlyticsErrorHandler.APP_CRASH_MESSAGE_EN,
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
    window.location.href = '/';
  }

  private isIgnorableError(error: any) {
    if (error !== undefined && error.status !== undefined && error.status >= 400) return true;
    return false;
  }

  private isIgnorableNavError(error: any) {
    if (!error || !error.message) { return false; }
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

}
