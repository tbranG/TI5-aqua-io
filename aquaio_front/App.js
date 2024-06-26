import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AppLoading from 'expo-app-loading';
import { useFonts, LobsterTwo_700Bold } from '@expo-google-fonts/lobster-two';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

export default function App() {
  const [temperature, setTemperature] = useState(0);
  const [ph, setPh] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [fishType, setFishType] = useState('');
  const [maxPh, setMaxPh] = useState('');
  const [minPh, setMinPh] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [selectedFish, setSelectedFish] = useState('Selecione seu peixe');
  const [fishList, setFishList] = useState([]);
  const [fishListComponent, setFishListComponent] = useState(<></>);
  const ip = require("ip");
  //const url = `http://localhost:8000`
  //alterar para o endereco do front end
  const url = `http://192.168.15.29:8000`

  let [fontsLoaded] = useFonts({
    LobsterTwo_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    getFishList();
    updateData();
  }, []);

  const getFishList = () => {
    axios.get(url + "/fish")
      .then(res => {
        let fishComponent = (res.data.map((fish, i) => {
          return(
            <Picker.Item label={fish.name} value={fish.name} key={i}/>
          )
        }))
        setFishList(res.data);
        setFishListComponent(fishComponent)
      })
  }

  const updateData = () => {
    axios.get(url + "/sensor/getData")
      .then((res) => {
        setTemperature(res.data?.temperature);
        setPh(res.data?.ph);
      });

    setTimeout(() => { updateData(); console.log("atualizei os dados")}, 5000);
  }

  const checkAlertConditions = (temperature, ph, fishName) => {
    console.log(fishName);
    if(fishList.length <= 0 || fishName == null || fishName === 'Selecione seu peixe'){
      return;
    }
    console.log('passei aqui');
    let fish = fishList.find(f => f.name === fishName);

    if (!fish) return;

    let alertMessages = [];
    console.log('temperatura peixe: ' + fish.minTmp, fish.maxTmp);
    if(temperature < fish.minTmp || temperature > fish.maxTmp) {
      alertMessages.push(`Temperatura fora da faixa: ${temperature.toFixed(2)}°C`);
    }
    
    if(ph < fish.minPh || ph > fish.maxPh) {
      alertMessages.push(`pH fora da faixa: ${ph.toFixed(2)}`);
    }

    if(alertMessages.length > 0) {
      setAlertMessage(alertMessages.join('\n'));
      setAlertModalVisible(true);
    }
  }

  const getSelectedFishTmp = () => {
    if(fishList.length <= 0){
      return styles.sensorValue;
    }
    let fish = null;
    fishList.forEach(f => {
      if(f.name == selectedFish){
        fish = f;
      }
    });
    if(fish == null){
      return styles.sensorValue;
    }

    if(temperature < fish.minTmp || temperature > fish.maxTmp){
      return styles.sensorValueRed;
    }

    return styles.sensorValue;
  }

  const getSelectedFishPh = () => {
    if(fishList.length <= 0){
      return styles.sensorValue;
    }
    let fish = null;
    fishList.forEach(f => {
      if(f.name == selectedFish){
        fish = f;
      }
    });
    if(fish == null){
      return styles.sensorValue;
    }

    if(ph < fish.minPh || ph > fish.maxPh){
      return styles.sensorValueRed;
    }

    return styles.sensorValue;
  }

  const handleSave = () => {
    axios.post(url + "/fish/new",{
      name: fishType,
      minTmp: minTemp,
      maxTmp: maxTemp,
      minPh: minPh,
      maxPh: maxPh
    }).then(() => {
      getFishList();
    });
    setModalVisible(false);
  }

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <LinearGradient
      colors={['#4682B4', '#0D4F8B']}
      style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Aqua.IO</Text>
        <View style={styles.sensorContainer}>
          <View style={styles.sensorBox}>
            <Text style={styles.sensorLabel}>Temperatura</Text>
            <Text style={getSelectedFishTmp()}>{temperature.toFixed(2)}°C</Text>
          </View>
          <View style={styles.sensorBox}>
            <Text style={styles.sensorLabel}>pH</Text>
            <Text style={getSelectedFishPh()}>{ph.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedFish ?? 'selecione seu peixe'}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue) => {
              setSelectedFish(itemValue);
              console.log('valores: ' + temperature, ph);
              checkAlertConditions(temperature, ph, itemValue);
            }}>
            <Picker.Item label='Selecione seu peixe' value='Selecione seu peixe' key={0}/>
            {fishListComponent}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.customButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.customButtonText}>Cadastrar Peixe</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Cadastrar Peixe</Text>
              <TextInput
                style={styles.input}
                placeholder="Tipo do peixe"
                value={fishType}
                onChangeText={setFishType}
              />
              <TextInput
                style={styles.input}
                placeholder="pH máximo"
                keyboardType="numeric"
                value={maxPh}
                onChangeText={setMaxPh}
              />
              <TextInput
                style={styles.input}
                placeholder="pH mínimo"
                keyboardType="numeric"
                value={minPh}
                onChangeText={setMinPh}
              />
              <TextInput
                style={styles.input}
                placeholder="Temperatura máxima"
                keyboardType="numeric"
                value={maxTemp}
                onChangeText={setMaxTemp}
              />
              <TextInput
                style={styles.input}
                placeholder="Temperatura mínima"
                keyboardType="numeric"
                value={minTemp}
                onChangeText={setMinTemp}
              />
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={handleSave}
              >
                <Text style={styles.textStyle}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={alertModalVisible}
          onRequestClose={() => {
            setAlertModalVisible(!alertModalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Alerta</Text>
              <Text style={styles.alertMessage}>{alertMessage}</Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setAlertModalVisible(!alertModalVisible)}
              >
                <Text style={styles.textStyle}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        <StatusBar style="auto" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 48,
    color: '#FFF',
    fontFamily: 'LobsterTwo_700Bold',
    marginBottom: 20,
  },
  sensorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
    marginTop: 20,
  },
  sensorBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    margin: 5,
  },
  sensorLabel: {
    fontSize: 18,
    marginBottom: 5,
    color: '#0D4F8B', // Cor ajustada
    fontFamily: 'Inter_600SemiBold',
  },
  sensorValue: {
    fontSize: 24,
    color: '#0D4F8B', // Cor ajustada
    fontFamily: 'Inter_600SemiBold',
  },
  sensorValueRed: {
    fontSize: 24,
    color: 'red',
    fontFamily: 'Inter_600SemiBold',
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    overflow: 'hidden',
    marginTop: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    color: '#0D4F8B',
    fontFamily: 'Inter_600SemiBold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  customButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
  },
  customButtonText: {
    color: '#0D4F8B', // Cor ajustada
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginTop: 10
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold'
  },
  alertMessage: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: 'red'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: 200
  }
});
