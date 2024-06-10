import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { useFonts, LobsterTwo_400Regular } from '@expo-google-fonts/lobster-two';

export default function App() {
  const [temperature, setTemperature] = useState(0);
  const [ph, setPh] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [fishType, setFishType] = useState('');
  const [maxPh, setMaxPh] = useState('');
  const [minPh, setMinPh] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [minTemp, setMinTemp] = useState('');

  let [fontsLoaded] = useFonts({
    LobsterTwo_400Regular,
  });

  useEffect(() => {
    updateData();
  }, []);

  const updateData = () => {
    axios.get("http://localhost:8000/sensor/getData")
      .then((res) => {
        setTemperature(res.data?.temperature);
        setPh(res.data?.ph);
      });

    setTimeout(() => { updateData(); console.log("atualizei os dados")}, 5000);
  }

  const handleSave = () => {
    // adicionar a lógica para salvar os dados do peixe
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

      <View style={styles.buttonContainer}>
        <Button title="Cadastrar Peixe" onPress={() => setModalVisible(true)} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 48,
    color: '#1E90FF',
    fontFamily: 'LobsterTwo_400Regular',
    marginBottom: 20,
  },
  sensorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
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
  },
  sensorValue: {
    fontSize: 24,
  },
  sensorValueRed: {
    fontSize: 24,
    color: 'red',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
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