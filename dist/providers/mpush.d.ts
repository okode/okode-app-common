import { HttpClient } from '@angular/common/http';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import { Log } from './log';
export declare enum UserIdType {
    DNI = 0,
    EMAIL = 1,
    NUUMA = 2,
    USUARIOAMA = 3,
    USUARIOCIS = 4
}
export declare class MPushService {
    private http;
    private device;
    private storage;
    private log;
    private baseUrl;
    private userIdType;
    private user;
    private password;
    private static readonly USUNM;
    constructor(http: HttpClient, device: Device, storage: Storage, log: Log);
    init(baseUrl: string, mpushClientApp: string, userIdType: UserIdType): void;
    setCredentials(user: string, password: string): void;
    register(user: string): Promise<void>;
    forceNewRegister(user: string): Promise<void>;
    unregister(userValue: string): Promise<void>;
    getUsunm(): Promise<any>;
    private doRegister;
    private getChannelId;
    private checkIfIsInitialized;
    private promiseTimeout;
    private safeStringify;
}
