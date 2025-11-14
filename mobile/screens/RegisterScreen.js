import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../App';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, { username, password });
      alert('Zarejestrowano. Zaloguj się.');
      navigation.goBack();
    } catch (e) {
      alert('Błąd rejestracji');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Zarejestruj" onPress={register} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',padding:20},
  input:{borderWidth:1,borderColor:'#ccc',padding:8,marginVertical:6}
});
