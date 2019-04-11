import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import { Log } from './log';

export enum UserIdType {
  DNI,
  EMAIL,
  NUUMA,
  USUARIOAMA,
  USUARIOCIS
}

@Injectable()
export class MPush {

  private baseUrl: string;
  private userIdType: UserIdType;
  private user: string;
  private password: string;


  private static readonly USUNM = 'usunm';

  constructor(
    private http: HttpClient,
    private device: Device,
    private storage: Storage,
    private log: Log
  ) {}

  init(baseUrl: string, mpushClientApp: string, userIdType: UserIdType) {
    this.baseUrl = `${baseUrl}/${mpushClientApp}`;
    this.userIdType = userIdType;
  }

  setCredentials(user: string, password: string) {
    this.user = user;
    this.password = password;
  }

  register(user: string) {
    this.checkIfIsInitialized();
    return this.storage.ready()
      .then(() => {
        return this.storage.get(MPush.USUNM);
      })
      .then(usunm => {
        return this.doRegister(user, usunm);
      });
  }

  forceNewRegister(user: string) {
    this.checkIfIsInitialized();
    return this.doRegister(user, null);
  }

  unregister(userValue: string) {
    this.checkIfIsInitialized();
    return new Promise<void>((resolve, reject) => {
      let currentUsunm: string = null;
      this.storage.ready()
        .then(() => this.storage.get(MPush.USUNM))
        .then(usunm => {
          currentUsunm = usunm;
          return this.getChannelId();
        })
        .then(channelId => {
          let url = `${this.baseUrl}/unregisterUser`;
          let options: any = {};
          if (this.user && this.password) {
            let encodedCredentials = btoa(`${this.user}:${this.password}`);
            let headers = new HttpHeaders();
            headers = headers.append('Authorization', `Basic ${encodedCredentials}`);
            options.headers = headers;
          }
          let body: any = {
            'technology': this.device.platform,
            'userIdTypeKey': UserIdType[this.userIdType],
            'userIdTypeValue': userValue,
          };
          if (currentUsunm) body.usunm = currentUsunm;
          if (channelId) body.urbanChannel = channelId;
          this.http.post(url, body, options).toPromise()
            .then(() => {
              this.log.i('[MPUSH] Usunm was unregistered successfully');
              UAirship.setAlias('', () => { resolve(); });
            })
            .catch(err => {
              this.log.e(`[MPUSH] Error unregistering user from MPush. Reason: ${this.safeStringify(err)}`);
              reject(err);
            });
        });
    });
  }

  getUsunm() {
    return this.storage.get(MPush.USUNM);
  }

  private doRegister(userValue: string, usunm: string) {
    return new Promise<void>((resolve, reject) => {
      this.getChannelId()
        .then(channelId => {
          let url = this.baseUrl;
          let options: { headers: any, responseType: 'json' } = { headers: null, responseType: 'json'};
          if (this.user && this.password) {
            let encodedCredentials = btoa(`${this.user}:${this.password}`);
            let headers = new HttpHeaders();
            headers = headers.append('Authorization', `Basic ${encodedCredentials}`);
            options.headers = headers;
          }
          let body: any = {
            'technology': this.device.platform,
            'userIdTypeKey': UserIdType[this.userIdType],
            'userIdTypeValue': userValue,
          };
          if (usunm) body.usunm = usunm;
          if (channelId) body.urbanChannel = channelId;

          this.http.post(url, body, options).toPromise()
            .then((response: any) => {
              let currentUsunm = response.usunm;
              if (currentUsunm) {
                UAirship.setAlias(currentUsunm, () => {
                  this.log.i(`[MPUSH] Device usunm ${currentUsunm}`);
                  this.storage.ready().then(() => this.storage.set(MPush.USUNM, currentUsunm));
                });
              } else {
                this.log.e('[MPUSH] Error getting usunm.');
              }
              resolve();
            })
            .catch(err => {
              this.log.e(`[MPUSH] Error registering user in MPush. Reason: ${this.safeStringify(err)}`);
              let response = err.json ? err.json() : err.error;
              let unknownUsunm = 8;
              if (response && response.code && response.code == unknownUsunm) {
                this.log.w('[MPUSH] Usunm not registered in mpush and trying to obtain new one');
                this.storage.ready()
                  .then(() => this.storage.remove(MPush.USUNM))
                  .then(() => this.doRegister(userValue, null))
                  .then(() => resolve())
                  .catch(err => reject(err));
              } else reject(err);
            });
        })
        .catch(err => reject(err));
    });
  }

  private getChannelId() {
    let maxTimeout = 10000;
    let promise = new Promise<string>((resolve, reject) => {
      UAirship.getChannelID((channelId => resolve(channelId)));
    });
    return this.promiseTimeout(maxTimeout, promise);
  }

  private checkIfIsInitialized() {
    if (this.baseUrl == null) {
      throw('MPush is not initialized');
    }
  }

  private promiseTimeout<T>(milis: number, promise: Promise<T>) {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out in ' + milis + 'ms.');
      }, milis);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([promise, timeout]);
  }

  private safeStringify(e) {
    try {
      return JSON.stringify(e);
    } catch {
      return 'Error on parse json error';
    }
  }
}