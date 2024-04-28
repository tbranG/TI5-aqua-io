# TI5-aqua-io

Ao clonar o repositório, execute `npm i` (dentro das pastas aquaio_back e aquaio_front) para baixar os pacotes necessários.

Para rodar o backend execute `npm run dev`
Para rodar o frontend no navegador execute `npm run web`

Rotas do backend:

GET para enviar dados: http://localhost:8000/sensor/receiveData?temperature=25&ph=7
POST para enviar dados: http://localhost:8000/sensor/receiveData

- o corpo da requisição deve conter um objeto na seguinte estrutura:

```
{
temperature: 25,
ph: 7
}
```

GET para ler os dados: http://localhost:8000/sensor/getData
