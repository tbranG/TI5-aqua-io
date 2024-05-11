import { Router, Response } from "express";
import fs from "fs";
import { ISensorData } from "../models";

const sensorRouter = Router();
const writeDataIfValid = (data: ISensorData, response: Response<any>) => {
    if (data.temperature === null || data.ph === null){
        response.status(400).send({
            status: 400,
            message: 'Informações insuficientes, dados de temperatura ou ph não foram informados.'
        });
        return;
    }

    fs.writeFile('src/data/currentSensorData.json', JSON.stringify(
        {
            temperature: data.temperature,
            ph: data.ph
        }
    ), () => {
        console.log("Data saved.");
    })

    response.status(200).send({
        status: 200,
        message: 'Os dados foram enviados com sucesso.'
    })
}


sensorRouter.get('/receiveData', async (req, res) => {
    const temperature = parseFloat(req.query.temperature as string);
    const ph = parseFloat(req.query.ph as string);

    const sensorData: ISensorData = {
        temperature: isNaN(temperature) ? null : temperature,
        ph: isNaN(ph) ? null : ph
    };
    writeDataIfValid(sensorData, res);
})

sensorRouter.post('/receiveData', async (req, res) => {
    const { temperature, ph } = req.body;

    const sensorData: ISensorData = {
        temperature: temperature === undefined ? null : temperature,
        ph: ph === undefined ? null : ph
    };
    writeDataIfValid(sensorData, res);
})

sensorRouter.get('/getData', async (_, res) => {
    fs.readFile('src/data/currentSensorData.json', (err, data) => {
        if(err !== null) res.status(500).send({
            status: 500,
            message: 'Erro ao ler o arquivo'
        });
        else res.setHeader('Content-Type', 'sensorRouterlication/json'); res.status(200).send(data);
    });
})

export default sensorRouter;