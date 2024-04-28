import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const[temperature, setTemperature] = useState(0);
  const[ph, setPh] = useState(0);

  const updateData = () => {
    axios.get("http://localhost:8000/sensor/getData")
      .then((res) => {
        setTemperature(res.data?.temperature);
        setPh(res.data?.ph);
      });

    setTimeout(() => { updateData(); console.log("atualizei os dados")}, 5000);
  }

  useEffect(() => {
    updateData();
  })

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Sensores</Text>
      { (temperature < 25 || temperature > 28) ?
          <Text style={styles.h2_red}>- Temperatura = {temperature}</Text>:
          <Text style={styles.h2}>- Temperatura = {temperature}</Text>
      }
      {
        (ph < 6 || ph > 9) ?
          <Text style={styles.h2_red}>- Ph = {ph}</Text>:
          <Text style={styles.h2}>- Ph = {ph}</Text>
      }
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
  h1: {
    fontSize: 38,
    borderBottomWidth: 2,
    marginBottom: 15
  },
  h2:{
    fontSize: 24
  },
  h2_red: {
    fontSize: 24,
    color: 'red'
  }
});
