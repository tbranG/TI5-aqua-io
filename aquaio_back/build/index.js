"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const sensorDataRouter_1 = __importDefault(require("./routes/sensorDataRouter"));
const fishData_1 = __importDefault(require("./routes/fishData"));
const app = (0, express_1.default)();
const port = 8000;
const cors = require('cors');
const corsConfig = {
    origin: `http://localhost:${port}`,
    methods: 'GET,POST'
};
app.use(cors(corsConfig));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use('/sensor', sensorDataRouter_1.default);
app.use('/fish', fishData_1.default);
app.get('/hello', (_, res) => {
    res.status(200).send('<h1>Hello World!</h1>');
});
app.listen(port, () => {
    console.log(`API now listening at port ${port}\nTest: http://localhost:${port}/hello\n`);
});
