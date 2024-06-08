import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import sensorRouter from './routes/sensorDataRouter';
import fishRouter from "./routes/fishRouter";

import * as DB from './db';

const app = express();
const portBack = 8000;

const ip = require('ip');

const corsConfig = {
    origin: '*',
    methods: 'GET,POST'
}

DB.createTable();

app.use(cors(corsConfig));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/sensor', sensorRouter);
app.use('/fish', fishRouter);

app.get('/hello', (_, res) => {
    res.status(200).send('<h1>Hello World!</h1>');
});

app.listen(portBack, () => {
    console.log(`
    API now listening at port ${portBack}
    Test: http://localhost:${portBack}/hello
    Network: http://${ip.address()}:${portBack}/hello
    `);
});