import express from 'express'
import bodyParser from 'body-parser';
import sensorRouter from './routes/sensorDataRouter';

const app = express();
const port = 8000;

const cors = require('cors');
const corsConfig = {
    origin: `http://localhost:${port}`,
    methods: 'GET,POST'
}

app.use(cors(corsConfig));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/sensor', sensorRouter);

app.get('/hello', (_, res) => {
    res.status(200).send('<h1>Hello World!</h1>');
});

app.listen(port, () => {
    console.log(`API now listening at port ${port}\nTest: http://localhost:${port}/hello\n`);
});