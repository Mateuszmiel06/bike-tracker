import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext, API_URL } from '../App';

export default function MapScreen() {
  const [recording, setRecording] = useState(false);
  const [coords, setCoords] = useState([]);
  const [distance, setDistance] = useState(0);
  const watchRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(()=>{
    (async()=>{
      if (Platform.OS === 'android') {
        await Location.requestForegroundPermissionsAsync();
      }
    })();
  },[]);

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return alert('Allow location');
    setRecording(true);
    let last = null;
    const sub = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Highest, distanceInterval: 3, timeInterval:2000 },
      (loc)=>{
        const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setCoords(prev => [...prev, c]);
        if (last) {
          const d = getDistance(last, c);
          setDistance(dist => dist + d);
        }
        last = c;
        mapRef.current?.animateToRegion({ ...c, latitudeDelta:0.01, longitudeDelta:0.01 }, 1000);
      });
    watchRef.current = sub;
  };

  const stop = async () => {
    await watchRef.current?.remove();
    setRecording(false);
    // send to backend
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.post(`${API_URL}/ride`, {
        distance_km: (distance/1000).toFixed(2),
        duration_seconds: Math.max(1, Math.round(coords.length*5)),
        gps_data: coords
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Zapisano przejazd');
    } catch (e) {
      console.error(e);
      alert('Błąd zapisu');
    }
    setCoords([]);
    setDistance(0);
  };

  const getDistance = (a,b) => {
    const R = 6371000;
    const φ1 = a.latitude * Math.PI/180;
    const φ2 = b.latitude * Math.PI/180;
    const Δφ = (b.latitude - a.latitude)*Math.PI/180;
    const Δλ = (b.longitude - a.longitude)*Math.PI/180;
    const x = Math.sin(Δφ/2)*Math.sin(Δφ/2) + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2);
    const c = 2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
    return R * c;
  };

  return (
    <View style={{flex:1}}>
      <MapView ref={mapRef} style={{flex:1}} initialRegion={{latitude:52.2297,longitude:21.0122,latitudeDelta:0.1,longitudeDelta:0.1}}>
        {coords.length>0 && <Polyline coordinates={coords} strokeWidth={4} />}
        {coords.length>0 && <Marker coordinate={coords[coords.length-1]} />}
      </MapView>
      <View style={styles.controls}>
        <Text>Dystans: {(distance/1000).toFixed(2)} km</Text>
        <Button title={recording ? "Zakończ" : "Start"} onPress={recording? stop : start} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls:{ position:'absolute', bottom:20, left:12, right:12, backgroundColor:'#fff', padding:10, borderRadius:8, elevation:3 }
});
