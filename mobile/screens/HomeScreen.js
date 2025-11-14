import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import axios from 'axios';
import { AuthContext, API_URL } from '../App';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen({ navigation }) {
  const { userToken, setUserToken } = useContext(AuthContext);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const socket = io(API_URL, { transports:['websocket'] });
    socket.on('connect', () => console.log('socket connected'));
    socket.on('newRide', r => setRides(prev => [r, ...prev]));
    axios.get(`${API_URL}/rides`).then(res => setRides(res.data)).catch(()=>{});
    return () => socket.disconnect();
  }, []);

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setUserToken(null);
  };

  return (
    <View style={{flex:1,padding:20}}>
      <Button title="Idź na mapę" onPress={() => navigation.navigate('Map')} />
      <Button title="Wyloguj" onPress={logout} />
      <Text style={{marginTop:12,fontWeight:'bold'}}>Ranking na żywo:</Text>
      <FlatList data={rides} keyExtractor={(i)=>String(i.id)} renderItem={({item})=>(
        <Text style={{paddingVertical:6}}>{item.username}: {item.distance_km} km</Text>
      )} />
    </View>
  );
}
