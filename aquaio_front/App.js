import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { useFonts, LobsterTwo_400Regular } from '@expo-google-fonts/lobster-two';

export default function App() {
  const[temperature, setTemperature] = useState(0);
  const[ph, setPh] = useState(0);
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
      { (temperature < 25 || temperature > 28) ?
          <Text style={styles.h2_red}>- Temperatura = {temperature}</Text>:
          <Text style={styles.h2}>- Temperatura = {temperature}</Text>
      }
      {
        (ph < 6 || ph > 9) ?
          <Text style={styles.h2_red}>- Ph = {ph}</Text>:
          <Text style={styles.h2}>- Ph = {ph}</Text>
      }

      <Button title="Cadastrar Peixe" onPress={() => setModalVisible(true)} />

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
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    color: '#1E90FF',
    fontFamily: 'LobsterTwo_400Regular',
    marginBottom: 20,
  },
  h2: {
    fontSize: 24
  },
  h2_red: {
    fontSize: 24,
    color: 'red'
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
