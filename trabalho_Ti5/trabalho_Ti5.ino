/**
 * @file    TRABALHO_TI5.ino
 * @author  Lucas Zegrine Duarte 
 *          lucas.zegrine@gmail.com
 *          lucas.duarte.1327493@sga.pucminas.br
 * @brief 
 *          Communication between server and ESP32 client.
 *          POST http://localhost:8000/sensor/receiveData + body ({"temperature":<value>, "ph":<value>})
 *          GET http://localhost:8000/sensor/getData 
 * 
 * @version 1.0
 * @date 2024-06-16
 * 
 * @copyright Copyright (c) 2024
 * 
 */
#include <Arduino.h>
//WiFi
#include <SPI.h>
#include <WiFi.h>
#include <HTTPClient.h>
//Json
#include <ArduinoJson.h>
//Water Temperature Probe Sensor
#include <OneWire.h>
#include <DallasTemperature.h>
//OLED display
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

//OLED Display
void _display_printAddress();
void _display_begin();
void display_updateText();
void display_wifiInfo();
//led
const int LED_ERROR = 13;
//WiFi
void post_Data();
void _wifi_begin();
int _wifi_rssiUI(int rssi);
void wifi_handleDisconnect();
//Sensors
void run_Sensors();
//Water Temperature Probe Sensor
void wt_updateData();   //wt_Temp;
void wt_updateStatus(); //wt_Status;
//PH Sensor
void ph_updateData();   //ph_Value;
void ph_updateStatus();  //ph_Status;
//global time variables
unsigned long time_Current = millis();
unsigned long time_Last = millis();
unsigned long time_cycle = 3000;

/* * * * * * * * * * * * * * */
/*  WATER TEMPERATURE SENSOR */
/* * * * * * * * * * * * * * */
#define WT_SWITCH 4    //turn wts on when reading and turns off after reading it
#define WT_DATA 16      //sends data from WTS One Wire Bus
OneWire oneWire(WT_DATA);
DallasTemperature wt_Sensor(&oneWire);
unsigned long wt_lastTime = 0;
float wt_Temp = 0.0;
float wt_lastTemp = 0.0;
String wt_Status = "";

/**
 * @brief
 * Turns on Water Temperature Sensor hardware.
 * Check if value has changed
 *  if so update global "wt_Temp".
 *  else informs error
 * 
 * wt - water sensor
 */
void wt_updateData(){
    digitalWrite(WT_SWITCH, HIGH);  //turn on WTS
    wt_Sensor.requestTemperatures();
    wt_Temp = wt_Sensor.getTempCByIndex(0);
    if(wt_Temp == -127.00){
        Serial.println("Water Temperature: Error");
        if(wt_Temp != wt_lastTemp){
            wt_updateStatus();
        }
        wt_lastTemp = wt_Temp;
    }
    else{
        Serial.print("Water Temperature = ");
        Serial.println(wt_Temp);
        if(wt_lastTemp != wt_Temp){
            wt_updateStatus();
        }
        wt_lastTemp = wt_Temp;
    }
    digitalWrite(WT_SWITCH, LOW);  //turn off WTS
}

/**
 * @brief
 * updates "wt_Status" variable based on "wt_Temp" value
 * "wt_Status" is further used to print text on display
 * should be a user indicator for water condition
 */
void wt_updateStatus(){
    if(wt_Temp == -127.00)    { wt_Status = "Error"; }
    else if(wt_Temp < 8.00)   { wt_Status = "chilling"; }
    else if(wt_Temp >= 8.00  && wt_Temp < 19.00){ wt_Status = "cold"; }
    else if(wt_Temp >= 19.00 && wt_Temp < 28.0 ){ wt_Status = "cool"; }
    else if(wt_Temp >= 28.00 && wt_Temp < 40.00){ wt_Status = "warm"; }
    else if(wt_Temp >= 40.00) { wt_Status = "hot"; }
}

/* * * * * * * */
/*  PH SENSOR  */
/* * * * * * * */
const int ph_analogDataInPin = 34;
int _buf[10], _temp;
unsigned long int ph_avgValue;
float ph_Value = 0.0;
float ph_lastValue = 0.0;
String ph_Status = "";
/**STEP BY STEP CALIBRATION
this calibration is used when the input analog pin does not read 5V, like on esp32 which reads only 3.3v
if you're using an arduino, use use the calibration for 5V values.

1 - gather the analog reading data from 4.0 and 7.0 solutions. (in this case we are using 4.0 and 9.18)
PH SOLUTION   - ANALOG READ
4.0           -   4095
9.18          -   2891

2- convert the voltage
(formula) V1(ph4)     = analogValue/4095 * 3.3
V1(ph4)     = 4095/4095 * 3.3
V1(ph4)     = 3.3
(formula) V2(ph9.18)  = analogValue/4095 * 3.3
V2(ph9.18)  = 2949/4095 * 3.3
V2(ph9.18)  = 2.3764

3 - calculate the slope (m) and offset (b)
(formula) m = (pH2 - pH1) / V2 - V1
m = (9.18 - 4.0) / (2.3764 - 3.3)
m = -5.6084
(formula) b = pH1 - (m * V1)
b = 4.0 - (-5.6084 * 3.3)
b = 22.50

4 - set phValue based on slope and offset
ph_Value = _ph_calibration_slope * _phVol + ph_calibration_offset;


*/
//5V calibration
//float ph_calibration_5V = (26.7 - 0.653);  //change this value to calibrate //5v

//3.3V calibration
//float ph_calibration_3V = (26.7 - 0.653);   //deprecated
float ph_calibration_slope_3V = -5.6084;  //m
float ph_calibration_offset_3V = 22.50;   //b
/**
 * @brief 
 * updates "ph_Value" variable reading from "ph_analogDataInPin" pin.
 * creates a buffer to get an average value from "ph_analogDataInPin"
 * calibration value is done after calibrating the ph sensor hardware.
 * 
 * Future: implement a switch for ph power switch, to turn it off when not in use
 * ph - potential of hydrogen
 */
void ph_updateData(){
    for(int i=0; i<10; i++){
        _buf[i] = (analogRead(ph_analogDataInPin));
        delay(30);
    }
    for(int i=0; i<9; i++){
        for(int j=i+1; j<10; j++){
            if(_buf[i] > _buf[j]){
                _temp   = _buf[i];
                _buf[i] = _buf[j];
                _buf[j] = _temp;
            }
        }
    }
    ph_avgValue = 0;
    for(int i=2; i<8; i++){
        ph_avgValue += _buf[i];
    }
    //5V
    //float _phVol = (float)ph_avgValue * 5.0/1024/6;   //5v input analog pin voltage conversion (works on arduino)
    //ph_Value = -5.70 * _phVol + ph_calibration_5v;       //5v

    //3.3V
    float _phVol = (float)ph_avgValue * 3.3 / 4095 / 6;         //3.3v input analog pin voltage conversion (works on esp32)
    //ph_Value = -5.70 * _phVol * (5.0 / 3.3) + ph_calibration_3V; //3.3V (deprecated)
    ph_Value = ph_calibration_slope_3V * _phVol + ph_calibration_offset_3V;
    //
    Serial.println("--PH--");
    Serial.print("Pot value = ");
    Serial.println(analogRead(ph_analogDataInPin));
    Serial.print("Pot avg value = ");
    Serial.println(ph_avgValue);
    Serial.print("Ph Voltage = ");
    Serial.println(_phVol);
    Serial.print("PH sensor = ");
    Serial.println(ph_Value);
    Serial.println("--PH--");
    ph_updateStatus();  //updates ph_Status based on value
}

/**
 * @brief
 * updates "ph_Status" variable based on "ph_Value"
 * "ph_Status" is further used to print text on display
 * should be a user indicator for water condition
 */
void ph_updateStatus(){
    if     (ph_Value < -1) { ph_Status = "Error"; }
    else if(ph_Value >=-1 && ph_Value < 4) { ph_Status = "v. acidic"; }
    else if(ph_Value >= 4 && ph_Value < 6)   { ph_Status = "acidic"; }
    else if(ph_Value >= 6 && ph_Value < 8)   { ph_Status = "normal"; }
    else if(ph_Value >= 8 && ph_Value < 10)  { ph_Status = "basic"; }
    else if(ph_Value >= 10){ ph_Status = "v. basic"; }
}

/* * * * * * * */
/*   SENSORS   */
/*   SENSORS   */
/* * * * * * * */

/**
 * @brief
 * get data from sensors,
 * updates led color,
 * updates dsplay text
 * 
 */
void run_Sensors(){
    //update sensors variable
    wt_updateData();
    ph_updateData();
    //updates led
    if((wt_Temp == -127.00) || (ph_Value < -1)){
      digitalWrite(LED_ERROR, HIGH);
    }
    else{
      digitalWrite(LED_ERROR, LOW);
    }
    //led_updateState();    //create var of state, when wifi requisition is sent updates it
    //update display
    display_updateText();
}

/* * * * * * * */
/*     WIFI    */
/*     WIFI    */
/* * * * * * * */
const char* wifi_ssid = "<your_ssid>";
const char* wifi_pswd = "<your_wifi_passwowd>";
const char* wifi_serverAddress = "<back_end_server_ip>"; // Replace with your server's IP address
const int wifi_serverPort = 8000;   //Replace with server prot given from backend
const String post_EndPoint = "/sensor/receiveData";
//0 nothing, 1 sent, -1 failed, 2 received
short post_httpStatus = 0;

/**
 * @brief Start Wifi connection to specified ssid and pswd
 * 
 */
void _wifi_begin(){
    Serial.println ("\n---- WiFi Setup. ----");
    WiFi.begin(wifi_ssid, wifi_pswd);
    //
    Serial.print("Connecting to WiFi: [");
    while(WiFi.status() != WL_CONNECTED){ 
        Serial.print(".");
        delay(500);
    }
    Serial.println("]\nWiFi connected.");
    Serial.print("SSID: ");
    Serial.println(wifi_ssid);
    Serial.print("Signal Stregh: ");
    Serial.println(WiFi.RSSI());
    Serial.print("Server IP: ");
    Serial.println(wifi_serverAddress);
    Serial.print("Local IP: ");
    Serial.println(WiFi.localIP());
    Serial.println("Port: ");
    Serial.println(wifi_serverPort);
    Serial.println ("---- WiFi Setup. ----\n");
    delay(200);
    display_wifiInfo();
}

/**
 * @brief sends an integer that is used to set how many bars
 * on ui display for wifi stregth
 * 
 * @param rssi (int) wifi strength sent by "WiFi" library
 * @return int number of bars to be displayed
 */
int _wifi_rssiUI(int rssi){
    // Sinal forte
    if      (rssi > -55)  { return 4; }
    // Sinal bom
    else if (rssi > -70)  { return 3; }
    // Sinal fraco
    else if (rssi > -85)  { return 2; }
    // Sinal muito fraco
    else if (rssi > -100) { return 1; }
    // Sem sinal
    else                  { return 0; }
}

/**
 * @brief 
 * 
 */
void post_Data(){
    Serial.println("Post Data.");
    //Create Json PayLoad
    StaticJsonDocument<200> json_doc;
    json_doc["temperature"] = wt_Temp;
    json_doc["ph"] = ph_Value;
    //Convert JSON payload to string
    String json_payload;
    serializeJson(json_doc, json_payload);
    Serial.print("  Posting: ");
    Serial.print("{temperature: ");
    Serial.print(wt_Temp);
    Serial.print(", ph: ");
    Serial.print(ph_Value);
    Serial.println("}");
    //Send POST request to server
    HTTPClient _http;
    _http.begin(wifi_serverAddress, wifi_serverPort, post_EndPoint);
    _http.addHeader("Content-Type", "application/json");
    //payload post request
    int _httpResponseCode = _http.POST(json_payload);
    if(_httpResponseCode > 0){
        Serial.print("  HTTP POST request sent.");
        Serial.print(wifi_serverAddress);
        Serial.print(":");
        Serial.print(wifi_serverPort);
        Serial.print(post_EndPoint);
        Serial.print(", response code: ");
        Serial.println(_httpResponseCode);
        _http.end();
        post_httpStatus = 1;
    }
    else{
        Serial.print("  HTTP POST request failed, error: ");
        Serial.println(_httpResponseCode);
        Serial.print("  ");
        Serial.print(wifi_serverAddress);
        Serial.print(":");
        Serial.print(wifi_serverPort);
        Serial.print(":");
        Serial.print(post_EndPoint);
        Serial.print(", response code: ");
        Serial.println(_httpResponseCode);
        Serial.print("  Payload: ");
        Serial.println(json_payload);
        _http.end();
        post_httpStatus = -1;
    }
}

/* * * * * * * */
/* LCD DISPLAY */
/* LCD DISPLAY */
/* * * * * * * */
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define OLED_RESET     -1 // Reset pib  n # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

/**
 * @brief 
 * Find addresses from I2C devices, using "Wire" library 
 * Be sure to update "SCREEN_ADDRESS" based on the address found on scan
 * Be sure that the address shown is for the screen
 */
void _display_printAddress(){
  Serial.println ("\n---- I2C scanner. ----");
  byte count = 0;
  Wire.begin();
  for (byte i = 8; i < 120; i++)
  {
    Wire.beginTransmission (i);
    if (Wire.endTransmission () == 0)
      {
      Serial.print ("Found address: ");
      Serial.print (i, DEC);
      //use this address for setting up the lcd address
      Serial.print (" (0x");
      Serial.print (i, HEX);
      Serial.println (")");
      count++;
      delay (1);  // maybe unneeded?
      } // end of good response
  } // end of for loop
  Serial.print ("Found ");
  Serial.print (count, DEC);
  Serial.println (" device(s).");
  Serial.println ("---- I2C scanner. ----\n");
}

/**
 * @brief starts oled display and prints I2C display
 * 
 */
void _display_begin(){
    _display_printAddress();
    // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
    //display may need 5V input on vcc
    if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
        Serial.println(F("SSD1306 allocation failed"));
        Serial.println(F("Program Stopped!!"));
        for(;;); // Don't proceed, loop forever
    }
    // Show initial display buffer contents on the screen --
    // the library initializes this with an Adafruit splash screen.
    display.display();
    delay(2000); // Pause for 2 seconds
    // Clear the buffer
    display.clearDisplay();
    // Draw a single pixel in white
    display.drawPixel(10, 10, SSD1306_WHITE);
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(15, 20);
    display.print("Trabalho TI5");
    display.setCursor(18, 30);
    display.print("AquaIO");
    // Show the display buffer on the screen. You MUST call display() after
    // drawing commands to make them visible on screen!
    display.display();
    // display.display() is NOT necessary after every single drawing command,
    // unless that's what you want...rather, you can batch up a bunch of
    // drawing operations and then update the screen all at once by calling
    // display.display().
    delay(1000);
}

/**
 * @brief Display UI
 * Displays data from sensors global variables, signal strength and server ip
 * current display: 128 x 64
 */
void display_updateText(){
    Serial.println("Displaying data.");
    //init
    display.clearDisplay();
    display.invertDisplay(true);    //just to show that a update has been done
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    delay(100);
    display.invertDisplay(false);
    /* UI */
    display.setCursor(0, 0);
    display.print(wifi_serverAddress);
    //wifi getSignalStrength
    int _wifi_strength = _wifi_rssiUI((int)WiFi.RSSI());
    int xPos= 105;    //initial position for x signal strengh icon
    int yPos= 0;     //initial position for y signal strengh icon
    int barWidth = 4;
    int barHeightIncrement = 3;
    for (int i = 0; i < _wifi_strength; i++) {
        display.fillRect(xPos + i * (barWidth + 2), yPos, barWidth, (i + 1) * barHeightIncrement, SSD1306_WHITE);
    }
    //frame
    display.drawRoundRect(0, 15, 128, 47, 3, SSD1306_WHITE);
    //data
    display.setCursor(5, 20);
    display.print("Temp");
    display.write(248);
    display.print("C: ");
    if(wt_Temp == -127.00){
        display.print("nan");
    }
    else{
        display.print(wt_Temp);
    }
    display.setCursor(5, 30);
    display.print("Temp: ");
    display.println(wt_Status);
    display.setCursor(5, 40);
    display.print("PH: ");
    display.println(ph_Value);
    display.setCursor(5, 50);
    display.print("PH: ");
    display.print(ph_Status);
    display.display();
    //payload status
    display.setTextSize(2);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(110, 40);
    switch (post_httpStatus) {
        case (-1):
            //failed to send payload
            display.write(88);
            break;
        case 0:
            //nothing done
            display.write(254);
            break;
        case 1:
            //payload sent!
            display.write(175);
            break;
        case 2:
            //payload received!
            display.write(174);
            break;
        default:
            break;
    }
    display.display();
}

/**
 * @brief Display Wifi useful info from "WiFi" library
 * shows info for 10 seconds
 * 
 */
void display_wifiInfo(){
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.print("SSID: ");
    display.println(wifi_ssid);
    display.print("Signal Stregh: ");
    display.println(WiFi.RSSI());
    display.println("Server: ");
    display.println(wifi_serverAddress);
    display.println("Local: ");
    display.println(WiFi.localIP());
    display.println("Port: ");
    display.print(wifi_serverPort);
    display.display();
    delay(10000);
}

/**
 * @brief warns UI in case of disconnection to wifi AP
 * calls wifi_begin() to try reconnection to AP
 * 
 */
void wifi_handleDisconnect(){
    //Warn Serial
    Serial.println("\n---- WiFi Connection. ----");
    Serial.println("Connection Lost!");
    Serial.println(WiFi.status());
    Serial.println("Attempting Reconnection.");
    Serial.println("\n---- WiFi Connection. ----");
    //Warn user
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("Connection Lost!");
    display.println(wifi_ssid);
    display.print("WiFi Status:");
    display.println((int)WiFi.status());
    display.print("Signal Strgth:");
    display.println(WiFi.RSSI());
    int _wifi_strength = _wifi_rssiUI((int)WiFi.RSSI());
    int xPos= 105;    //initial position for x signal strengh icon
    int yPos= 0;     //initial position for y signal strengh icon
    int barWidth = 4;
    int barHeightIncrement = 3;
    for (int i = 0; i < _wifi_strength; i++) {
        display.fillRect(xPos + i * (barWidth + 2), yPos, barWidth, (i + 1) * barHeightIncrement, SSD1306_WHITE);
    }
    display.display();
    _wifi_begin();
}

/* * * * * * * */
/*     MAIN    */
/*     MAIN    */
/* * * * * * * */
void setup(){
    Serial.begin(115200);
    delay(1500);
    //display
    _display_begin();
    pinMode(LED_ERROR, OUTPUT);
    //wt
    pinMode(WT_SWITCH, OUTPUT); //water temperature power switch
    digitalWrite(WT_SWITCH, HIGH);
    wt_Sensor.begin();
    delay(1000);
    digitalWrite(WT_SWITCH, LOW);
    //ph
    pinMode(ph_analogDataInPin, INPUT);
    //wiFi setup
    _wifi_begin();
}

void loop(){
    time_Current = millis();
    if(time_Current - time_Last >= time_cycle){
        run_Sensors();
        //
        post_Data();
        //
        if(WiFi.status() != WL_CONNECTED){
            wifi_handleDisconnect();
        }
        //
        Serial.println("[Current time: "+String(time_Current/1000)+"s] [Last time: "+String(time_Last/1000)+"s] [Elapsed: "+String((time_Current-time_Last))+"ms]\n");
        time_Last = time_Current;
    }

}