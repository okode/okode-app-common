import { MMobile } from './mmobile';
import { Logger } from './logger';
export declare class Log implements Logger {
    private mmobile;
    private static INFO_TAG;
    private static DEBUG_TAG;
    private static WARNING_TAG;
    private static ERROR_TAG;
    private nuuma;
    private technicianId;
    private role;
    constructor(mmobile: MMobile);
    /**
     * Set user identifier to add it into the log lines
     * @param nuuma identifier
     * @param technicianId sub-identifier
     */
    setUser(nuuma: string, technicianId?: string): void;
    setRole(role: string): void;
    i(message?: any, ...optionalParams: any[]): void;
    d(message?: any, ...optionalParams: any[]): void;
    w(message?: any, ...optionalParams: any[]): void;
    e(message?: any, ...optionalParams: any[]): void;
    private print;
    private getUser;
}
