import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, ToastController, Platform } from 'ionic-angular';
import { Log } from './log';

type PromiseResolve = (value?: void | PromiseLike<void>) => void;
type PromiseReject = (reason?: any) => void;

@Injectable()
export class Config {

  private static readonly ENVIRONMENT_KEY = 'configEnvironmentKey';
  private static readonly CONFIG_JSON_PATH = 'assets/config/config.json';
  private static readonly BROWSER_VERSION: string = 'Browser version';

  private environment: string;
  private config: any;
  private updateToVersion: number;
  private isReady = false;
  private isInitializing = false;
  private readyPromiseResolve: PromiseResolve[] = [];
  private readyPromiseReject: PromiseReject[] = [];

  constructor(
    private platform: Platform,
    private storage: Storage,
    private appVersion: AppVersion,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private log: Log) {}

  ready() {
    if (this.isReady) return Promise.resolve();
    if (!this.isInitializing) {
        this.isInitializing = true;
        this.initConfigs();
    }
    return new Promise<void>((resolve, reject) => {
      this.readyPromiseResolve.push(resolve);
      this.readyPromiseReject.push(reject);
    });
  }

  private initConfigs() {
    this.http
      .get(Config.CONFIG_JSON_PATH)
      .subscribe(
        res => {
          let configs = res;
          if (configs == null || Object.keys(configs).length == 0) {
            this.readyPromiseReject.forEach((reject) => reject());
            this.log.i(`Config fails: '${Config.CONFIG_JSON_PATH}' is empty or invalid`);
            return;
          }
          let environments = Object.keys(configs).filter(environment => environment !== 'default');
          if (environments == null || environments.length == 0) {
            this.setConfig(false, 'default', configs['default']);
          } else {
            this.storage.ready().then(() => {
              this.storage.get(Config.ENVIRONMENT_KEY).then(storedEnvironment => {
                if (storedEnvironment == null) {
                  if (environments.length > 1) {
                    this.log.i('No saved environment detected, will prompt user for selection');
                    this.showEnvironmentActionSheet(environments, configs);
                  } else {
                    let environment = environments[0];
                    this.setConfig(true, environment, configs['default'], configs[environment]);
                  }
                } else {
                  this.log.i(`Detected saved environment: ${storedEnvironment}`);
                  this.setConfig(false, storedEnvironment, configs['default'], configs[storedEnvironment]);
                }
              });
            });
          }
        },
        err => {
          this.readyPromiseReject.forEach((reject) => reject());
          this.log.i(`Config fails: Not found '${Config.CONFIG_JSON_PATH}'`);
        }
      );
  }

  private showEnvironmentActionSheet(environments: string[], configs: any) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select environment',
      enableBackdropDismiss: false,
      buttons: environments.map(environment => ({
          text: environment,
          handler: (): boolean => {
            this.setConfig(true, environment, configs['default'], configs[environment]);
            actionSheet.dismiss().then(() => {
              this.toastCtrl.create( { message: `${environment} selected`, duration: 2000, position: 'top' } ).present();
            });
            return false;
          }
        })
      )
    });
    actionSheet.present();
  }

  private setConfig(save: boolean, environment: string, configBase: any, configEnvironment?: any) {
    this.log.i(`Applying environment: ${environment}`);
    this.environment = environment;
    this.config = configBase;
    if (configEnvironment != null) {
      Object.assign(this.config, configEnvironment);
    }
    if (save) {
      this.log.i(`Saving environment: ${environment}`);
      this.storage.set(Config.ENVIRONMENT_KEY, environment);
    }
    this.isReady = true;
    this.readyPromiseResolve.forEach((resolve) => resolve());
  }

  getConfig() {
    return this.config;
  }

  getEnvironment() {
    return this.environment;
  }

  getUpdateToVersion() {
    if (this.updateToVersion) return this.updateToVersion;
    if (!this.config || !this.config.updateToVersion) return 0;
    this.updateToVersion = this.config.updateToVersion;
    return this.updateToVersion;
  }

  async getAppName(browserAppName: string) {
    await this.platform.ready();
    if (!this.platform.is('cordova')) {
        return Promise.resolve(browserAppName);
    }
    return this.appVersion.getAppName().then(name => name as string);
  }

  async getVersionNumber() {
    await this.platform.ready();
    let appVersion = Config.BROWSER_VERSION;
    if (this.platform.is('cordova')) {
        appVersion = await this.appVersion.getVersionNumber().then(version => version as string);
    }
    let versionEnv = this.getConfig().versionEnv;
    if (versionEnv != null) {
      appVersion += `-${versionEnv}`;
    }
    return appVersion;
  }

  getMMobileVersion() {
    let config = this.getConfig();
    let mmobileVersionNumber = config.mmobileConfigVersion;
    if (mmobileVersionNumber == null) {
      this.log.i('Unknown MMobile version. Set "mmobileConfigVersion" property on config.xml');
      return null;
    }
    let versionEnv = config.versionEnv;
    if (versionEnv != null) {
        mmobileVersionNumber += `-${versionEnv}`;
    }
    return mmobileVersionNumber;
  }

}
