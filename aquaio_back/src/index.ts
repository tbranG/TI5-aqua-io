import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import sensorRouter from './routes/sensorDataRouter';

const app = express();
const portBack = 8000;

const corsConfig = {
    origin: '*',
    methods: 'GET,POST'
}

app.use(cors(corsConfig));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/sensor', sensorRouter);

app.get('/hello', (_, res) => {
    res.status(200).send('<h1>Hello World!</h1>');
});

app.listen(portBack, () => {
    console.log(`API now listening at port ${portBack}\nTest: http://localhost:${portBack}/hello\n`);
});