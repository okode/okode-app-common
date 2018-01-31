import { Platform, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Log } from './log';
import { Storage } from '@ionic/storage';
export declare class CrashlyticsErrorHandler extends IonicErrorHandler {
    private platform;
    private splashScreen;
    private log;
    private storage;
    private static APP_CRASH_DETECTED_KEY;
    private static APP_CRASH_MESSAGE_ES;
    private static APP_CRASH_MESSAGE_EN;
    constructor(platform: Platform, splashScreen: SplashScreen, log: Log, storage: Storage);
    handleError(error: any): void;
    getAndClearCrashDetected(): Promise<boolean>;
    private sendError(error);
    private displayErrorMsgAndReload();
    private isAnIgnorableError(error);
    private isIgnorableNavError(error);
}
