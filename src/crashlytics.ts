import { Injectable, isDevMode } from '@angular/core';
import { Platform, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as StackTrace from 'stacktrace-js';
import { Log } from './log';

@Injectable()
export class CrashlyticsErrorHandler extends IonicErrorHandler {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private log: Log
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

  private sendError(error: any) {
    console.log('TODO: Add block UI for preventing use while sending report to Crashlytics');
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
        }).catch(reason => console.log('Crashlytics catch: ' + reason));
      } else {
        fabric.Crashlytics.sendNonFatalCrash(JSON.stringify(error));
        this.displayErrorMsgAndReload();
      }
    }
  }

  private displayErrorMsgAndReload() {
    console.log('The application has unexpectedly quit and will restart.');
    this.splashScreen.show();
    window.location.reload();
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
