var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Database } from 'sql.js';
export function resolveSQLiteForCordovaOrBrowser(platform) {
    if (platform.is('cordova')) {
        return new SQLite();
    }
    else {
        return new SQLiteBrowser();
    }
}
var SQLiteBrowser = (function (_super) {
    __extends(SQLiteBrowser, _super);
    function SQLiteBrowser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SQLiteBrowser.prototype.create = function (config) {
        return new Promise(function (resolve, reject) { resolve(new SQLiteObjectBrowser(new Database())); });
    };
    SQLiteBrowser.prototype.echoTest = function () {
        return new Promise(function (resolve, reject) { resolve(); });
    };
    SQLiteBrowser.prototype.deleteDatabase = function (config) {
        return new Promise(function (resolve, reject) { resolve(); });
    };
    return SQLiteBrowser;
}(SQLite));
export { SQLiteBrowser };
var SQLiteObjectBrowser = (function (_super) {
    __extends(SQLiteObjectBrowser, _super);
    function SQLiteObjectBrowser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SQLiteObjectBrowser.prototype.executeSql = function (statement, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var st = _this._objectInstance.prepare(statement, params);
                var rows_1 = [];
                while (st.step()) {
                    rows_1.push(st.getAsObject());
                }
                var payload = {
                    rows: {
                        item: function (i) { return rows_1[i]; },
                        length: rows_1.length
                    },
                    rowsAffected: _this._objectInstance.getRowsModified() || 0,
                    insertId: _this._objectInstance.insertId || void 0
                };
                resolve(payload);
            }
            catch (e) {
                reject(e);
            }
        });
    };
    SQLiteObjectBrowser.prototype.sqlBatch = function (sqlStatements) {
        return new Promise(function (resolve, reject) { reject('sqlBatch mock not implemented'); });
    };
    return SQLiteObjectBrowser;
}(SQLiteObject));
//# sourceMappingURL=sqlite-browser.js.map