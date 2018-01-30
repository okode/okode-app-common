import { Injectable, isDevMode } from '@angular/core';
import { Platform, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as StackTrace from 'stacktrace-js';
import { Log } from './log';
import { Storage } from '@ionic/storage';

@Injectable()
export class CrashlyticsErrorHandler extends IonicErrorHandler {

  private static APP_CRASH_DETECTED_KEY = 'OKODE_APP_CRASH_DETECTED';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private log: Log,
    private storage: Storage
  ) {
    super();
  }

  handleError(error: any) {
    if (this.isIgnorableNavError(error)) { return; }
    super.handleError(error);
    if (!isDevMode() && !this.isAnIgnorableError(error)) {
      this.sendError(error);
    }
  }

  async getAndClearCrashDetected() {
    try {
      let keys = await this.storage.keys();
      let appWasCrashed = false;
      if (keys.indexOf(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY)) appWasCrashed = true;
      await this.storage.remove(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY);
      return appWasCrashed;
    } catch (err) {}
    return false;
  }

  private sendError(error: any) {
    this.log.e('TODO: Add block UI for preventing use while sending report to Crashlytics');
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
    this.log.e('The application has unexpectedly quit and will restart.');
    this.log.e(`Creating entry in local storage for ${CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY} = true`);
    this.storage.set(CrashlyticsErrorHandler.APP_CRASH_DETECTED_KEY, true).then(() => {
      this.splashScreen.show();
      window.location.reload();
    }).catch(() => {
      this.splashScreen.show();
      window.location.reload();
    });
  }

  private isAnIgnorableError(error: any) {
    if (error && error.status == 500) return true;
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
