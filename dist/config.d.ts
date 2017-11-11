import { Storage } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, ToastController, Platform } from 'ionic-angular';
import { Log } from './log';
export declare class Config {
    private platform;
    private storage;
    private appVersion;
    private http;
    private actionSheetCtrl;
    private toastCtrl;
    private log;
    private static readonly ENVIRONMENT_KEY;
    private static readonly CONFIG_JSON_PATH;
    private environment;
    private config;
    private updateToVersion;
    private isReady;
    private isInitializing;
    private readyPromiseResolve;
    private readyPromiseReject;
    constructor(platform: Platform, storage: Storage, appVersion: AppVersion, http: HttpClient, actionSheetCtrl: ActionSheetController, toastCtrl: ToastController, log: Log);
    ready(): Promise<void>;
    private initConfigs();
    private showEnvironmentActionSheet(environments, configs);
    private setConfig(save, environment, configBase, configEnvironment?);
    getConfig(): any;
    getEnvironment(): string;
    getUpdateToVersion(): number;
    getVersionNumber(): Promise<string>;
}
