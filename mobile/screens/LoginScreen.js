import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext, API_URL } from '../App';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('');
  const { setUserToken } = useContext(AuthContext);

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const token = res.data.token;
      await SecureStore.setItemAsync('userToken', token);
      setUserToken(token);
    } catch (e) {
      alert('Błąd logowania');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <TextInput placeholder="username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Zaloguj" onPress={login} />
      <Button title="Rejestracja" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',padding:20},
  input:{borderWidth:1,borderColor:'#ccc',padding:8,marginVertical:6}
});
