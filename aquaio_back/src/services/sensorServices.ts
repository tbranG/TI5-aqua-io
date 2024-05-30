import { Response } from "express";
import { IResponseView, ISensorData } from "../models";
import fs from "fs";

const writeDataIfValid = (data: ISensorData, response: Response<any>): IResponseView => {
    if (data.temperature === null || data.ph === null){
        return {
            status: 400,
            message: 'Informações insuficientes, dados de temperatura ou ph não foram informados.'
        };
    }

    fs.writeFile('src/data/currentSensorData.json', JSON.stringify(
        {
            temperature: data.temperature,
            ph: data.ph
        }
    ), () => {
        console.log("Data saved.");
    });

    return {
        status: 200,
        message: 'Os dados foram enviados com sucesso.'
    }
}

export {
    writeDataIfValid
}