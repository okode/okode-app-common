import { Platform, IonicErrorHandler, AlertController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Log } from './log';
import { Storage } from '@ionic/storage';
export declare class CrashlyticsErrorHandler extends IonicErrorHandler {
    private platform;
    private splashScreen;
    private log;
    private storage;
    private alertCtrl;
    private static APP_CRASH_DETECTED_KEY;
    private static APP_CRASH_MESSAGE_ES;
    private static APP_CRASH_MESSAGE_EN;
    private static APP_CRASH_QUOTA_EXCEEDED_ES;
    private static APP_CRASH_QUOTA_EXCEEDED_EN;
    constructor(platform: Platform, splashScreen: SplashScreen, log: Log, storage: Storage, alertCtrl: AlertController);
    handleError(error: any): void;
    getAndClearCrashDetected(): Promise<boolean>;
    private sendError;
    private displayErrorMsgAndReload;
    private restartApp;
    private isIgnorableError;
    private isIgnorableNavError;
    isQuotaExceededError(error: any): boolean;
    handleQuotaExceededError(): void;
}
