import { Fish} from "./models";
import FishRouter from "./routes/fishRouter";

const sqlite3 = require('sqlite3').verbose();


const createTable = () => {
    const db = new sqlite3.Database('src/data/app.db');
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS fish (id INTEGER PRIMARY KEY, name TEXT, minTmp REAL, maxTmp REAL, minPh REAL, maxPh REAL)")
    })
    db.close();
}


const deleteTable = () => {
    const db = new sqlite3.Database('src/data/app.db');
    db.serialize(() => {
        db.run("DROP TABLE fish");
    })
    db.close();
}

/**
 * Método para leitura da tabela de peixes. Caso nenhum id seja fornecido, o método irá retornar
 * todos os peixes da tabela
 * */
const readTable = async (id: number | null = null): Promise<Fish[]> => {
    const db = new sqlite3.Database('src/data/app.db');
    let fishList: Fish[] = [];

    const promise = new Promise<Fish[]>((resolve, reject) => {
        db.serialize(async () => {
            if(id !== null){
                let callbackPromise =  new Promise<Fish[]>((resolve, reject) => {
                    db.all("SELECT * FROM fish WHERE id = ?", id, (err: any, rows: any) => {
                        if(!!err)
                            reject();

                        rows.forEach((row: any )=> {
                            const { _, ...fishData} = row;
                            fishList.push(fishData as Fish);
                        })

                        resolve(fishList);
                    });
                })

                await callbackPromise
            }
            else {
                let callbackPromise =  new Promise<Fish[]>((resolve, reject) => {
                    db.all("SELECT * FROM fish", (err: any, rows: any) => {
                        if(!!err)
                            reject();

                        rows.forEach((row: any) => {
                            const {_, ...fishData} = row;
                            fishList.push(fishData as Fish);
                        });

                        resolve(fishList);
                    })
                })

                await callbackPromise;
            }

            resolve(fishList);
            db.close();
        })
    })

    return await promise;
}

const createFish = (fish: Fish) => {
    const db = new sqlite3.Database('src/data/app.db');
    const { name, minTmp, maxTmp, minPh, maxPh} = fish;


    db.serialize(() => {
        db.run("INSERT INTO fish (name, minTmp, maxTmp, minPh, maxPh) VALUES (?, ?, ?, ?, ?)", name, minTmp, maxTmp, minPh, maxPh);
    })

    db.close();
}

const deleteFish = (id: number | null = null) => {
    const db = new sqlite3.Database('src/data/app.db');
    db.serialize(() => {
        if(id !== null)
            db.run("DELETE FROM fish WHERE id = ?", id);
        else
            db.run("DELETE FROM fish");
    })

    db.close();
}

export {
    createTable,
    deleteTable,
    readTable,
    createFish,
    deleteFish
}