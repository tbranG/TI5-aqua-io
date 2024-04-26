"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const sensorRouter = (0, express_1.Router)();
sensorRouter.get('/receiveData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const temperature = parseFloat(req.query.temperature);
    const ph = parseFloat(req.query.ph);
    if (temperature === undefined || ph === undefined) {
        res.status(400).send({
            status: 400,
            message: 'Informações insuficientes, dados de temperatura ou ph não foram informados.'
        });
    }
    else {
        fs_1.default.writeFile('src/data/currentSensorData.json', JSON.stringify({
            temperature: temperature,
            ph: ph
        }), () => {
            console.log("Data saved.");
        });
        res.status(200).send({
            status: 200,
            message: 'Os dados foram enviados com sucesso.'
        });
    }
}));
sensorRouter.post('/receiveData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { temperature, ph } = req.body;
    if (temperature === undefined || ph === undefined) {
        res.status(400).send({
            status: 400,
            message: 'Informações insuficientes, dados de temperatura ou ph não foram informados.'
        });
    }
    else {
        fs_1.default.writeFile('src/data/currentSensorData.json', JSON.stringify({
            temperature: temperature,
            ph: ph
        }), () => {
            console.log("Data saved.");
        });
        res.status(200).send({
            status: 200,
            message: 'Os dados foram enviados com sucesso.'
        });
    }
}));
sensorRouter.get('/getData', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    fs_1.default.readFile('src/data/currentSensorData.json', (err, data) => {
        if (err !== null)
            res.status(500).send({
                status: 500,
                message: 'Erro ao ler o arquivo'
            });
        else
            res.setHeader('Content-Type', 'sensorRouterlication/json');
        res.status(200).send(data);
    });
}));
exports.default = sensorRouter;
