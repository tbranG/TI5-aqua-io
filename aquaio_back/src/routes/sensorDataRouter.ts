import fs from "fs";
import { Router } from "express";
import { ISensorData } from "../models";
import { writeDataIfValid } from "../services/sensorServices";

const sensorRouter = Router();

sensorRouter.get('/receiveData', async (req, res) => {
    const temperature = parseFloat(req.query.temperature as string);
    const ph = parseFloat(req.query.ph as string);

    const sensorData: ISensorData = {
        temperature: isNaN(temperature) ? null : temperature,
        ph: isNaN(ph) ? null : ph
    };
    const result = writeDataIfValid(sensorData, res);
    res.status(result.status).send(result);
})

sensorRouter.post('/receiveData', (req, res) => {
    const { temperature, ph } = req.body;

    const sensorData: ISensorData = {
        temperature: temperature === undefined ? null : temperature,
        ph: ph === undefined ? null : ph
    };
    const result = writeDataIfValid(sensorData, res);
    res.status(result.status).send(result);
})

sensorRouter.get('/getData', (_, res) => {
    fs.readFile('src/data/currentSensorData.json', (err, data) => {
        if(err !== null){
            res.status(500).send({
                status: 500,
                message: 'Erro ao ler o arquivo'
            });
        }
        else {
            res.setHeader('Content-Type', 'sensorRouterlication/json');
            res.status(200).send(data);
        }
    });
})

export default sensorRouter;