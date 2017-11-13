import { Platform, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
export declare class CrashlyticsErrorHandler extends IonicErrorHandler {
    private platform;
    private splashScreen;
    constructor(platform: Platform, splashScreen: SplashScreen);
    handleError(error: any): void;
    private sendError(error);
    private displayErrorMsgAndReload();
    private isAnIgnorableError(error);
}
