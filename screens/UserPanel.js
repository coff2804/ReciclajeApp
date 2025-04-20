import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { database, auth } from '../firebase/config';
import { ref, onValue, push } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

function FormularioScreen() {
  const [tipo, setTipo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('unidad');
  const [punto, setPunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [puntosCercanos, setPuntosCercanos] = useState([]);

  const enviarFormulario = async () => {
    const user = auth.currentUser;
    if (!tipo || !cantidad || !punto) {
      Alert.alert('Completa todos los campos');
      return;
    }
    try {
      const nuevoFormulario = {
        tipo,
        cantidad: `${cantidad} ${unidad}`,
        punto,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
      };
      await push(ref(database, `formularios/${user.uid}`), nuevoFormulario);
      setMensaje('Formulario enviado');
      setTipo('');
      setCantidad('');
      setUnidad('unidad');
      setPunto('');
    } catch (error) {
      Alert.alert('Error al enviar formulario');
    }
  };

  const cargarPuntosCercanos = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const puntosSimulados = [
        { nombre: 'Punto Centro', lat: latitude + 0.002, lng: longitude + 0.001 },
        { nombre: 'Punto Norte', lat: latitude + 0.01, lng: longitude + 0.01 },
        { nombre: 'Punto Sur', lat: latitude - 0.005, lng: longitude - 0.002 },
      ];
      setPuntosCercanos(puntosSimulados);
    } catch (error) {
      console.error('Error al cargar puntos de reciclaje:', error);
    }
  };

  useEffect(() => {
    cargarPuntosCercanos();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>📋 Nuevo Formulario</Text>
      <TextInput placeholder="Tipo de material" value={tipo} onChangeText={setTipo} style={styles.input} />
      <TextInput placeholder="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" style={styles.input} />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Selecciona unidad:</Text>
        <Picker selectedValue={unidad} style={styles.picker} onValueChange={setUnidad}>
          <Picker.Item label="Unidad" value="unidad" />
          <Picker.Item label="Kilos" value="kilos" />
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Selecciona punto de reciclaje:</Text>
        <Picker selectedValue={punto} style={styles.picker} onValueChange={setPunto}>
          <Picker.Item label="Selecciona un punto" value="" />
          {puntosCercanos.map((p, idx) => (
            <Picker.Item key={idx} label={p.nombre} value={p.nombre} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={enviarFormulario}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
      {mensaje && <Text style={styles.success}>{mensaje}</Text>}
    </ScrollView>
  );
}
//API 
function ClimaScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const API_KEY = 'c358d644efa2a58be9b5d939f90665a9';
      const res = await fetch(`http://api.weatherstack.com/current?access_key=${API_KEY}&query=${latitude},${longitude}&units=m`);
      const data = await res.json();
      setWeatherData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener clima:', error);
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>🌤️ Clima Actual</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#00aaff" style={{ marginTop: 30 }} />
      ) : weatherData?.current ? (
        <View style={styles.climaContainer}>
          <Text style={styles.climaTextoCiudad}>{weatherData.location.name}</Text>
          <Text style={styles.climaTemp}>{Math.round(weatherData.current.temperature)}°C</Text>
          <Text style={styles.climaDescripcion}>{weatherData.current.weather_descriptions[0]}</Text>
          <Image style={styles.climaIcono} source={{ uri: weatherData.current.weather_icons[0] }} />
        </View>
      ) : (
        <Text>❌ No se pudo cargar el clima</Text>
      )}
    </View>
  );
}

function ListaFormularios({ estadoFiltro }) {
  const [formularios, setFormularios] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = () => {
      onValue(ref(database, `formularios/${user.uid}`), (snapshot) => {
        const data = snapshot.val();
        const lista = data ? Object.entries(data).map(([id, f]) => ({ id, estado: f.estado || 'pendiente', ...f })) : [];
        setFormularios(lista.filter(f => f.estado === estadoFiltro));
      });
    };
    fetchData();
  }, [estadoFiltro]);

  if (formularios.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.emptyText}>No hay formularios {estadoFiltro}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      {formularios.map((form) => {
        const fecha = form.fecha ? new Date(form.fecha).toLocaleDateString('es-CL', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Fecha no disponible';

        return (
          <View key={form.id} style={styles.card}>
            <Text style={styles.label}>📦 Tipo: {form.tipo}</Text>
            <Text style={styles.label}>♻️ Cantidad: {form.cantidad}</Text>
            <Text style={styles.label}>📍 Punto: {form.punto}</Text>
            <Text style={styles.label}>📅 Fecha: {fecha}</Text>
            <Text style={styles.label}>📌 Estado: {form.estado}</Text>
            {form.comentarioAdmin && (
              <Text style={styles.label}>💬 Comentario: {form.comentarioAdmin}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

function HistorialScreen() {
  return (
    <TopTab.Navigator screenOptions={{
      tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
      tabBarIndicatorStyle: { backgroundColor: '#00aa88' },
      tabBarStyle: { backgroundColor: '#f0f0f0' },
    }}>
      <TopTab.Screen name="Pendientes">{() => <ListaFormularios estadoFiltro="pendiente" />}</TopTab.Screen>
      <TopTab.Screen name="Aceptados">{() => <ListaFormularios estadoFiltro="aceptado" />}</TopTab.Screen>
      <TopTab.Screen name="Rechazados">{() => <ListaFormularios estadoFiltro="rechazado" />}</TopTab.Screen>
    </TopTab.Navigator>
  );
}

export default function UserPanel() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: true,
      headerTitleAlign: 'center',
      headerRight: () => (
        <TouchableOpacity
          onPress={async () => {
            try {
              await signOut(auth);
            } catch {
              Alert.alert('Error al cerrar sesión');
            }
          }}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      ),
      tabBarActiveTintColor: '#00aa88',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#f4f4f4' },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Formulario') iconName = 'document-text-outline';
        else if (route.name === 'Mis Formularios') iconName = 'folder-open-outline';
        else if (route.name === 'Clima') iconName = 'cloud-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Formulario" component={FormularioScreen} />
      <Tab.Screen name="Mis Formularios" component={HistorialScreen} />
      <Tab.Screen name="Clima" component={ClimaScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, marginBottom: 15 },
  pickerContainer: { marginBottom: 15 },
  picker: { height: 50, width: '100%' },
  label: { fontSize: 16, marginBottom: 5 },
  button: { backgroundColor: '#00aa88', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  success: { color: 'green', marginTop: 10, textAlign: 'center' },
  emptyText: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  climaContainer: { alignItems: 'center', marginTop: 30 },
  climaTextoCiudad: { fontSize: 20, fontWeight: '600' },
  climaTemp: { fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
  climaDescripcion: { fontSize: 18 },
  climaIcono: { width: 64, height: 64, marginTop: 10 },
});
