import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import { Logger } from './logger';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class MMobile {

  private baseUrl: string;
  private appName: string;
  private version: string;
  private jwtConfigName: string;
  private timeout: number;

  private config: any;

  private logsQueue: string[] = [];
  private isProcessingLogs = false;
  private logger: Logger;

  private static readonly INITIAL_CONFIG_PATH = 'assets/config/mmobileInitialConfig.json';
  private static readonly LOGS_DIR = 'mmobilelogs';
  private static readonly LOGS_SERVICE_KEY = 'MMOBILE_sendLogs';
  private static readonly LAST_UPDATED_KEY = 'MMOBILE_lastUpdated';
  private static readonly MMOBILE_CONFIG = 'MMOBILE_config';

  constructor(
    private http: HttpClient,
    private file: File,
    private device: Device,
    private storage: Storage
  )  {}

  init(baseUrl: string, appName: string, version: string, jwtConfigName?: string, timeout?: number) {
    return new Promise<boolean>((resolve, reject) => {
      this.baseUrl = baseUrl;
      this.appName = appName;
      this.version = version;
      this.jwtConfigName = jwtConfigName;
      this.timeout = timeout;

      this.prepareLogs();

      let url = `${baseUrl}/config/${appName}/${version}`;
      let observable = this.http.get(url);
      if (timeout) {
        observable = observable.timeout(timeout);
      }
      observable.toPromise()
        .then(result => {
          this.config = result;
          this.storage.ready()
            .then(() => {
              return this.storage.set(MMobile.MMOBILE_CONFIG, this.config);
            })
            .then(() => {
              return this.storage.set(MMobile.LAST_UPDATED_KEY, new Date());
            })
            .then(() => {
              resolve(true);
            });
        })
        .catch((error: any) => {
          this.printLog(`Error downloading MMobile config. Check it out: ${url}`);
          this.storage.ready()
            .then(() => {
              return this.storage.get(MMobile.MMOBILE_CONFIG);
            })
            .then(config => {
              if (config != null) {
                this.config = config;
                resolve(false);
              } else {
                this.http.get(MMobile.INITIAL_CONFIG_PATH).toPromise()
                .then(result => {
                  this.config = result;
                  this.storage.ready()
                    .then(() => {
                      return this.storage.get(MMobile.LAST_UPDATED_KEY);
                    })
                    .then(lastUpdatedDate => {
                      if (lastUpdatedDate == null) {
                        return this.storage.set(MMobile.LAST_UPDATED_KEY, new Date());
                      } else {
                        return Promise.resolve();
                      }
                    })
                    .then(() => {
                      resolve(false);
                    });
                })
                .catch((error: any) => {
                  this.printLog(`Error loading MMobile initial config. Reason: ${JSON.stringify(error)}`);
                  reject();
                });
              }
            });
        });
    });
  }

  reloadConfig() {
    this.checkIfIsInitialized();
    return this.init(this.baseUrl, this.appName, this.version, this.jwtConfigName, this.timeout);
  }

  getCustomConfig() {
    this.checkIfIsInitialized();
    return this.config.customConfig;
  }

  getVersion() {
    return this.version;
  }

  getTimeout() {
    this.checkIfIsInitialized();
    return this.config.timeout;
  }

  isActive() {
    this.checkIfIsInitialized();
    return this.config.active;
  }

  getFeatures() {
    this.checkIfIsInitialized();
    return this.config.features;
  }

  isDeviceLocked() {
    this.checkIfIsInitialized();

    let mobileLockInfo = this.config.lockingConfig;
    if (mobileLockInfo == null || !mobileLockInfo.active) {
      return false;
    }

    let deviceVersion = this.device.version;
    let deviceModel = this.device.model;
    let devicePlatform = this.device.platform;

    let deviceMatched = false;
    mobileLockInfo.devices.forEach((deviceLockInfo: any) => {
      if (deviceMatched) return;

      let modelMatch = true;
      let versionMatch = true;
      let platformMatch = true;

      // Matching model
      if (deviceLockInfo.model != null) {
        let re = new RegExp(deviceLockInfo.model, 'i');
        modelMatch = re.test(deviceModel);
      }

      // Matching version
      if (deviceLockInfo.version != null) {
        let re = new RegExp(deviceLockInfo.version, 'i');
        versionMatch = re.test(deviceVersion);
      }

      // Matching platform
      if (deviceLockInfo.platform != null) {
        let re = new RegExp(deviceLockInfo.platform, 'i');
        platformMatch = re.test(devicePlatform);
      }

      if (modelMatch && platformMatch && versionMatch) {
        deviceMatched = true;
      }
    });

    if (mobileLockInfo.mode == 'WHITELIST') {
      return !deviceMatched;
    } else {
      return deviceMatched;
    }
  }

  getLastUpdatedDate() {
    this.checkIfIsInitialized();

    return new Promise<Date>((resolve, reject) => {
      this.storage.ready()
      .then(() => {
        return this.storage.get(MMobile.LAST_UPDATED_KEY);
      })
      .then(date => {
        resolve (new Date(date));
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  async writeLog(log: string) {
    let message = `>>>>>>> ${this.getFormattedDateWithHour()}: ${log}` + '\n';
    this.logsQueue.push(message);
    
    if (!this.isProcessingLogs) {
      this.processLogs();
    }
  }

  private processLogs() {
    if (!this.logsQueue.length) {
      this.isProcessingLogs = false;
      return;
    }

    this.isProcessingLogs = true;
    let m = this.logsQueue.shift();

    this.file.writeFile(`${this.file.dataDirectory}${MMobile.LOGS_DIR}/`, this.getLogsFileName(), m, {append: true})
      .then(() => this.processLogs())
      .catch(err => {
        this.printLog(`Error writing log to file. Discarding it. Reason: ${JSON.stringify(err)}`);
        this.processLogs();
      });
  }

  sendLogs(deviceName: string) {
    this.checkIfIsInitialized();
    return new Promise<boolean>((resolve, reject) => {
      if (this.isLogsEnabled()) {
        this.file.readAsText(`${this.file.dataDirectory}${MMobile.LOGS_DIR}/`, this.getLogsFileName())
        .then(log => {
          let logsUrl = `${this.baseUrl}/services/public/${this.appName}/${this.version}/${MMobile.LOGS_SERVICE_KEY}`;
          let body = {
            'rawlog': btoa(log),
            'deviceId': deviceName
          };
          let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
          });
          return this.http.post(logsUrl, this.jsonToURLEncoded(body), { headers: headers, responseType: 'text' }).toPromise();
        })
        .then(result => {
          resolve(true);
        })
        .catch(error => {
          this.writeLog(`Error sending MMobile logs. Reason: ${JSON.stringify(error)}`);
          resolve(false);
        });
      } else {
        this.writeLog('Logs service is not enabled');
        resolve(false);
      }
    });
  }

  isLogsEnabled() {
    this.checkIfIsInitialized();
    return (this.config.services !== null
            && this.config.services[MMobile.LOGS_SERVICE_KEY] !== null
            && this.config.services[MMobile.LOGS_SERVICE_KEY] !== null);
  }

  getServiceUrl(key: string) {
    this.checkIfIsInitialized();
    let service = this.config.services[key];
    if (service != null) {
      if (service.mediated == false) {
        return service.path;
      }
      return (`${this.baseUrl}${service.prefix}/${this.appName}/${this.version}/${key}`);
    } else {
      this.printLog(`Service was not found: ${key}`);
      return null;
    }
  }

  getJwtLoginUrl() {
    this.checkIfIsInitialized();
    if (this.jwtConfigName) {
      return `${this.baseUrl}/jwt/login/${this.appName}/${this.version}/${this.jwtConfigName}`;
    } else {
      this.printLog(`jwtConfigName service is not enabled`);
      return null;
    }
  }

  getJwtRefreshUrl() {
    this.checkIfIsInitialized();
    if (this.jwtConfigName) {
      return `${this.baseUrl}/jwt/refresh/${this.appName}/${this.version}/${this.jwtConfigName}`;
    } else {
      this.printLog(`jwtConfigName service is not enabled`);
      return null;
    }
  }

  isInitialized() {
    return this.config != null;
  }

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  private prepareLogs() {
    this.file.checkDir(this.file.dataDirectory, MMobile.LOGS_DIR)
      .then(() => {
        // Logs directory exists. Check if the file is created for today
         this.file.checkFile(`${this.file.dataDirectory}${MMobile.LOGS_DIR}/`, this.getLogsFileName())
          .then(() => {
            // Logs file exists for today, nothing to do
          })
          .catch(err => {
            this.file.removeRecursively(this.file.dataDirectory, MMobile.LOGS_DIR)
              .then(() => {
                this.prepareLogs();
              });
          });
      })
      .catch(err => {
        if (err == 'cordova_not_available') {
          this.printLog(`Cordova not enabled. Discarding it. Reason: ${JSON.stringify(err)}`);
          return;
        }
        this.file.createDir(this.file.dataDirectory, MMobile.LOGS_DIR, false)
          .then(() => {
            this.file.createFile(`${this.file.dataDirectory}${MMobile.LOGS_DIR}/`, this.getLogsFileName(), true);
          });
      });
  }

  private getFormattedDateWithHour() {
    let now = new Date();
    let dd = ('0' + now.getDate()).slice(-2);
    let MM = ('0' + (now.getMonth() + 1)).slice(-2);
    let yyyy = now.getFullYear();
    let hh = ('0' + now.getHours()).slice(-2);
    let mm = ('0' + now.getMinutes()).slice(-2);
    let ss = ('0' + now.getSeconds()).slice(-2);

    return `${dd}/${MM}/${yyyy} ${hh}:${mm}:${ss}`;
  }

  private getLogsFileName() {
    let now = new Date();
    let dd = ('0' + now.getDate()).slice(-2);
    let MM = ('0' + (now.getMonth() + 1)).slice(-2);
    let yyyy = now.getFullYear();

    return `log${dd}${MM}${yyyy}.txt`;
  }

  private jsonToURLEncoded(jsonString: Object) {
    return Object.keys(jsonString).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(jsonString[key])).join('&');
  }

  private checkIfIsInitialized() {
    if (this.config == null) {
      throw({ message: 'MMobile is not initialized', needsRestartApp: true });
    }
  }

  private printLog(message?: any, ...optionalParams: any[]) {
    if (this.logger == null) {
      console.log(message, optionalParams);
    } else {
      this.logger.i(message, optionalParams);
    }
  }
}