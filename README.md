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


INSTALACAO (branch "luiz")

- ir para a pasta back e front e rodar npm i

- npm run web (front)
- npm run dev (back)

A partir do endereco de Ip entregue em "Metro waiting", apos executar npm run web
- alterar -> "aquaio_front/App.js" -> "const url = `http://<enderecoIP do metro waiting>:8000`".
- Mantenha a porta como 8000

No codigo do arduino.
- alterar na secao de wifi
    const char* wifi_ssid = "<your_ssid>";
    const char* wifi_pswd = "<your_wifi_passwowd>"
    const char* wifi_serverAddress = "<back_end_server_ip>"; //altere com o ip do servidor gerado pelo backend
    const int wifi_serverPort = 8000;   //altere com o a porta gerada pelo servidor de backend