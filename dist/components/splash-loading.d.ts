import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform } from 'ionic-angular';
export declare class SplashLoadingComponent {
    private platform;
    private splashScreen;
    constructor(platform: Platform, splashScreen: SplashScreen);
    ionViewDidEnter(): void;
}
