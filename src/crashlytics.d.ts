import { Platform, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Log } from './log';
export declare class CrashlyticsErrorHandler extends IonicErrorHandler {
    private platform;
    private splashScreen;
    private log;
    constructor(platform: Platform, splashScreen: SplashScreen, log: Log);
    handleError(error: any): void;
    private sendError(error);
    private displayErrorMsgAndReload();
    private isAnIgnorableError(error);
    private isIgnorableNavError(message);
}
