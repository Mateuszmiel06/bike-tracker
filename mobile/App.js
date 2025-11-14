import React, { useEffect, useState, createContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import io from 'socket.io-client';

import AuthStack from './screens/AuthStack';
import HomeStack from './screens/HomeStack';

// Set backend URL here (eg. http://192.168.0.100:4000 or deployed URL)
export const API_URL = "<PUT_BACKEND_URL_HERE>";

export const AuthContext = createContext();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      setUserToken(token);
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  if (isLoading) {
    return (<View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator /></View>);
  }

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, API_URL }}>
      {userToken ? <HomeStack /> : <AuthStack />}
    </AuthContext.Provider>
  );
}
