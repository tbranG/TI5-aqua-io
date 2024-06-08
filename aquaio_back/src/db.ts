import {Fish, IResponseView} from "./models";
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

/*
------------------------------------------------------------------------------------------------+
    A biblioteca sqlite3 utiliza callbacks para confirmar suas operações e retornar os dados
    do banco, a estrutura da chamada costuma ser:
        db.serialize(<callback>()) -> db.<método-banco>(<callback>(data, err)).

    Logo, para confirmar a operação, e ler os dados (data, err), encapsulamos os métodos em duas
    promises:
        promise1
            db.serialize(<callback>())
                promise2
                    db.<método-banco>(<callback>(data, err))

    A promise1 sempre irá resolver, recebendo os dados da promise2. A promise2 irá rejeitar se
    apenas se houver erro no banco, e resolver, retornado os dados da query.
------------------------------------------------------------------------------------------------+
*/


/**
 * Método para leitura da tabela de peixes. Caso nenhum id seja fornecido, o método irá retornar
 * todos os peixes da tabela
 * */
const readTable = async (id: number | null = null): Promise<Fish[]> => {
    const db = new sqlite3.Database('src/data/app.db');
    let fishList: Fish[] = [];

    const promise = new Promise<Fish[]>((resolve, _) => {
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

const createFish = async (fish: Fish) => {
    const db = new sqlite3.Database('src/data/app.db');
    const { name, minTmp, maxTmp, minPh, maxPh} = fish;

    let promise = new Promise<IResponseView>((resolve, _) => {
        db.serialize(async () => {
            let callbackPromise = new Promise<IResponseView>((resolve, reject) => {
                db.run("INSERT INTO fish (name, minTmp, maxTmp, minPh, maxPh) VALUES (?, ?, ?, ?, ?)", name, minTmp, maxTmp, minPh, maxPh, (_: any, err: any) => {
                   if(!!err)
                       reject({
                           status: 500,
                           message: "Erro interno no banco, INSERT falhou"
                       });

                    resolve({
                        status: 200,
                        message: `Peixe adicionado na tabela`
                    })
                });
            })

            const response = await callbackPromise;
            resolve(response);
        })
        db.close();
    })

    return await promise;
}

const deleteFish = async (id: number | null = null) => {
    const db = new sqlite3.Database('src/data/app.db');

    let promise = new Promise<IResponseView>((resolve, reject) => {
        db.serialize(async () => {
            let callbackPromise = new Promise<IResponseView>((resolve, reject) => {
                db.run("DELETE FROM fish WHERE id = ?", id, (_: any, err: any) => {
                    if(!!err)
                        reject({
                            status: 500,
                            message: `O peixe de id=${id} não pode ser deletado`
                        });

                    resolve({
                        status: 200,
                        message: `O peixe de id=${id} foi deletado com sucesso`
                    });
                });
            });

            const response = await callbackPromise;
            resolve(response);
        })
        db.close();
    })

    return await promise;
}

export {
    createTable,
    deleteTable,
    readTable,
    createFish,
    deleteFish
}