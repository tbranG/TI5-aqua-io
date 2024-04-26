"use strict";
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('src/data/app.db', (err) => {
    if (err) {
        console.log("Erro na conexão com o banco de dados");
    }
    else {
        console.log("Conectado ao app.db");
    }
});
db.serialize(() => {
    let stmt = db.prepare("INSERT INTO fish VALUES (?, ?, ?, ?, ?, ?)");
});
db.close();
