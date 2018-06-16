import { HttpClient } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import { Logger } from './logger';
import 'rxjs/add/operator/toPromise';
export declare class MMobile {
    private http;
    private file;
    private device;
    private storage;
    private baseUrl;
    private appName;
    private version;
    private jwtConfigName;
    private config;
    private logsQueue;
    private isProcessingLogs;
    private logger;
    private static readonly INITIAL_CONFIG_PATH;
    private static readonly LOGS_DIR;
    private static readonly LOGS_SERVICE_KEY;
    private static readonly LAST_UPDATED_KEY;
    private static readonly MMOBILE_CONFIG;
    constructor(http: HttpClient, file: File, device: Device, storage: Storage);
    init(baseUrl: string, appName: string, version: string, jwtConfigName?: string, timeout?: number): Promise<boolean>;
    reloadConfig(): Promise<boolean>;
    getCustomConfig(): any;
    getVersion(): string;
    getTimeout(): any;
    isActive(): any;
    getFeatures(): any;
    isDeviceLocked(): boolean;
    getLastUpdatedDate(): Promise<Date>;
    writeLog(log: string): Promise<void>;
    private processLogs;
    sendLogs(deviceName: string): Promise<boolean>;
    isLogsEnabled(): boolean;
    getServiceUrl(key: string): any;
    getJwtLoginUrl(): string;
    isInitialized(): boolean;
    setLogger(logger: Logger): void;
    private prepareLogs;
    private getFormattedDateWithHour;
    private getLogsFileName;
    private jsonToURLEncoded;
    private checkIfIsInitialized;
    private printLog;
}
