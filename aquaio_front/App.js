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
  const [fishType, setFishType] = useState('');
  const [maxPh, setMaxPh] = useState('');
  const [minPh, setMinPh] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [selectedFish, setSelectedFish] = useState('Colisa');
  const ip = require("ip");
  const url = `http://localhost:8000`

  let [fontsLoaded] = useFonts({
    LobsterTwo_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    updateData();
  }, []);

  const updateData = () => {
    axios.get(url + "/sensor/getData")
      .then((res) => {
        setTemperature(res.data?.temperature);
        setPh(res.data?.ph);
      });

    setTimeout(() => { updateData(); console.log("atualizei os dados")}, 5000);
  }

  const handleSave = () => {
    axios.post(url + "/fish/new",{
      name: fishType,
      minTmp: minTemp,
      maxTmp: maxTemp,
      minPh: minPh,
      maxPh: maxPh
    });
    console.log({
      fishType,
      maxPh,
      minPh,
      maxTemp,
      minTemp
    });
    setModalVisible(false);
  }

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <LinearGradient
      colors={['#87CEFA', '#1E90FF']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Aqua.IO</Text>
        <View style={styles.sensorContainer}>
          <View style={styles.sensorBox}>
            <Text style={styles.sensorLabel}>Temperatura</Text>
            <Text style={temperature < 25 || temperature > 28 ? styles.sensorValueRed : styles.sensorValue}>{temperature}°C</Text>
          </View>
          <View style={styles.sensorBox}>
            <Text style={styles.sensorLabel}>pH</Text>
            <Text style={ph < 6 || ph > 9 ? styles.sensorValueRed : styles.sensorValue}>{ph}</Text>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedFish}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue) => setSelectedFish(itemValue)}
          >
            <Picker.Item label="Colisa" value="Colisa" />
            <Picker.Item label="Tetra neon" value="Tetra neon" />
            <Picker.Item label="Tilapia" value="Tilapia" />
            <Picker.Item label="Peixinho dourado" value="Peixinho dourado" />
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
    color: '#1E90FF',
    fontFamily: 'Inter_600SemiBold',
  },
  sensorValue: {
    fontSize: 24,
    color: '#1E90FF',
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
    color: '#1E90FF',
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
    color: '#1E90FF',
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: 200
  }
});
