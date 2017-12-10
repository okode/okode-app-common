import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from '@ionic-native/sqlite';
export declare class SQLiteBrowser extends SQLite {
    create(config: SQLiteDatabaseConfig): Promise<SQLiteObject>;
    echoTest(): Promise<any>;
    deleteDatabase(config: SQLiteDatabaseConfig): Promise<any>;
}
