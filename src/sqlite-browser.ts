import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from '@ionic-native/sqlite';
import { Database } from 'sql.js';

class SQLiteObjectBrowser extends SQLiteObject {

  executeSql(statement: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let st = this._objectInstance.prepare(statement, params);
        let rows: any[] = [];
        while (st.step()) {
          rows.push(st.getAsObject());
        }
        let payload = {
          rows: {
            item: (i: any) => rows[i],
            length: rows.length
          },
          rowsAffected: this._objectInstance.getRowsModified() || 0,
          insertId: this._objectInstance.insertId || void 0
        };
        resolve(payload);
      } catch (e) {
        reject(e);
      }
    });
  }

  sqlBatch(sqlStatements: Array<string | string[] | any>): Promise<any> {
    return new Promise((resolve, reject) => { reject('sqlBatch mock not implemented'); });
  }

}

export class SQLiteBrowser extends SQLite {

  create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
    return new Promise((resolve, reject) => { resolve(new SQLiteObjectBrowser(new Database())); });
  }

  echoTest(): Promise<any> {
    return new Promise((resolve, reject) => { resolve(); });
  }

  deleteDatabase(config: SQLiteDatabaseConfig): Promise<any> {
    return new Promise((resolve, reject) => { resolve(); });
  }

}