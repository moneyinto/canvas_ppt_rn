import SQLite from "react-native-sqlite-storage";
import { ISlide } from "../types/slide";
import { OPTION_TYPE } from "../config/options";
import { IHistory } from "../types";

const DB_NAME = "CANVAS_PPT_DB.db";

export default class DB {
    private db: SQLite.SQLiteDatabase | undefined;
    constructor() {
        if (!this.db) this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            if (this.db) resolve(true);
            this.db = SQLite.openDatabase(
                {
                    name: DB_NAME,
                    location: "default"
                },
                async () => {
                    console.log("DB opened");
                    await this.createTable();
                    resolve(true);
                },
                (error) => {
                    console.log(error);
                    reject(error);
                }
            );
        });
    }

    async createHistoryTable() {
        return new Promise((resolve, reject) => {
            this.db?.transaction((tx) => {
                tx.executeSql(
                    "CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, optionType TEXT, slideId TEXT, slides TEXT);",
                    [],
                    () => {
                        console.log("Table history created successfully");
                        resolve(true);
                    },
                    (_, error) => {
                        console.error("Error creating table: " + error)
                    }
                );
    
                
            });
        })
    }

    async createFileTable() {
        return new Promise((resolve, reject) => {
            this.db?.transaction((tx) => {
                tx.executeSql(
                    "CREATE TABLE IF NOT EXISTS file (fileId TEXT PRIMARY KEY, content TEXT);",
                    [],
                    () => {
                        console.log("Table file created successfully");
                        resolve(true);
                    },
                    (_, error) => {
                        console.error("Error creating table: " + error)
                    }
                );
            });
        });
    }

    async createTable() {
        if (!this.db) await this.init();
        await this.createHistoryTable();
        await this.createFileTable();
    }

    async delete(keys: number[]) {
        if (!this.db) await this.init();
        await this.db!.transaction((tx) => {
            tx.executeSql(
                "DELETE FROM history WHERE id IN (?)",
                [keys.join(",")],
                () => console.log("Table deleted successfully"),
                (_, error) => console.error("Error deleting table: " + error)
            );
        });
    }

    async getAllKeys() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            this.db!.transaction((tx) => {
                tx.executeSql(
                    "SELECT id FROM history",
                    [],
                    (_, result) => {
                        resolve(result.rows.raw().map((v) => v.id));
                    },
                    (_, error) => {
                        console.error("Error getting all keys: " + error);
                        reject(error);
                    }
                );
            });
        });
    }

    async getData(key: number): Promise<IHistory> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            this.db!.transaction((tx) => {
                tx.executeSql(
                    "SELECT id,optionType,slideId,slides FROM history WHERE id = ?",
                    [key],
                    (_, result) => {
                        const tableData = result.rows.raw();
                        if (tableData.length > 0) {
                            const data = tableData[0];
                            data.slides = JSON.parse(data.slides);
                            resolve(data as IHistory);
                        } else {
                            resolve({
                                id: 0,
                                slideId: "",
                                slides: []
                            });
                        }
                    },
                    (_, error) => {
                        console.error("Error getting data: " + error);
                        reject(error);
                    }
                );
            });
        });
    }

    async setData(slideId: string, slides: ISlide[], optionType?: OPTION_TYPE) {
        if (!this.db) await this.init();
        return this.db!.transaction((tx) => {
            tx.executeSql(
                "INSERT INTO history (optionType, slideId, slides) VALUES (?, ?, ?);",
                [optionType, slideId, JSON.stringify(slides)],
                (_, result) => {},
                (_, error) => {
                    console.error("Error setting data: " + error);
                }
            );
        });
    }

    async getFile(fileId: string): Promise<string> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            this.db!.transaction((tx) => {
                tx.executeSql(
                    "SELECT fileId,content FROM file WHERE fileId = ?",
                    [fileId],
                    (_, result) => {
                        const list = result.rows.raw();
                        resolve(list.length > 0 ? list[0].content : "");
                    },
                    (_, error) => {
                        console.error("Error getting file: " + error);
                        reject(error);
                    }
                );
            });
        });
    }

    async saveFile(fileId: string, file: string) {
        if (!this.db) await this.init();
        const result = await this.getFile(fileId);
        if (!result) {
            await this.db!.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO file (fileId, content) VALUES (?, ?);",
                    [fileId, file],
                    (_, result) => {},
                    (_, error) => {
                        console.error("Error saving file: " + error);
                    }
                );
            });
        }
    }

    async deleteFiles() {
        if (!this.db) await this.init();
        this.db!.transaction((tx) => {
            tx.executeSql(
                "DELETE FROM file",
                [],
                (_, result) => {
                    console.log("Table deleting files successfully");
                },
                (_, error) => {
                    console.error("Error deleting files: " + error);
                }
            );
        });
    }
}
