import { Router } from "express";
import fs from "fs";

const sensorRouter = Router();

sensorRouter.get('/receiveData', async (req, res) => {
    const temperature = parseFloat(req.query.temperature as string);
    const ph = parseFloat(req.query.ph as string);

    if(temperature === undefined || ph === undefined){
        res.status(400).send({
            status: 400,
            message: 'Informações insuficientes, dados de temperatura ou ph não foram informados.'
        })
    }else{
        fs.writeFile('src/data/currentSensorData.json', JSON.stringify(
            {
                temperature: temperature,
                ph: ph
            }
        ), () => {
            console.log("Data saved.");
        })

        res.status(200).send({
            status: 200,
            message: 'Os dados foram enviados com sucesso.'
        })
    }
})

sensorRouter.post('/receiveData', async (req, res) => {
    const { temperature, ph } = req.body;

    if(temperature === undefined || ph === undefined){
        res.status(400).send({
            status: 400,
            message: 'Informações insuficientes, dados de temperatura ou ph não foram informados.'
        })
    }else{
        fs.writeFile('src/data/currentSensorData.json', JSON.stringify(
            {
                temperature: temperature,
                ph: ph     
            }
        ), () => {
            console.log("Data saved.");
        })

        res.status(200).send({
            status: 200,
            message: 'Os dados foram enviados com sucesso.'
        })
    }
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