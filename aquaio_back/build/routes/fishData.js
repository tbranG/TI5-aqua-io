"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fishDataRouter = (0, express_1.Router)();
fishDataRouter.get('/:name', (req, res) => {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('src/data/app.db');
    db.serialize(() => {
        db.each('SELECT * FROM fish WHERE name = ?', req.params.name, (err, rows) => {
            if (err !== null && err !== undefined) {
                res.status(400).send({
                    status: 400,
                    message: "Não foi encontrado um peixe com esse nome"
                });
            }
            else {
                res.status(200).send({
                    name: rows.name,
                    minTmp: rows.minTmp,
                    maxTmp: rows.MaxTmp,
                    minPh: rows.minPh,
                    maxPh: rows.maxPh
                });
            }
        });
    });
    db.close();
});
exports.default = fishDataRouter;
