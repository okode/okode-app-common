export interface Logger {
    i(message?: any, ...optionalParams: any[]): any;
    d(message?: any, ...optionalParams: any[]): any;
    w(message?: any, ...optionalParams: any[]): any;
    e(message?: any, ...optionalParams: any[]): any;
}
