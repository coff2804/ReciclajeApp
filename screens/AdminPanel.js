import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { database, auth } from '../firebase/config';
import { ref, onValue, update } from 'firebase/database';
import { signOut } from 'firebase/auth';

const Tab = createBottomTabNavigator();
const TopTabs = createMaterialTopTabNavigator();

function FormulariosPorEstado({ estado }) {
  const [formularios, setFormularios] = useState([]);
  const [usuarios, setUsuarios] = useState({});

  useEffect(() => {
    onValue(ref(database, 'usuarios/'), (snap) => {
      setUsuarios(snap.val() || {});
    });

    onValue(ref(database, 'formularios/'), (snapshot) => {
      const data = snapshot.val();
      const lista = [];

      if (data) {
        Object.entries(data).forEach(([uid, forms]) => {
          Object.entries(forms).forEach(([id, f]) => {
            if ((estado === 'pendiente' && !f.estado) || f.estado === estado) {
              lista.push({ id, uid, ...f });
            }
          });
        });
      }

      setFormularios(lista);
    });
  }, [estado]);

  const manejarDecision = async (uid, id, decision, comentario) => {
    try {
      await update(ref(database, `formularios/${uid}/${id}`), {
        estado: decision,
        comentarioAdmin: comentario,
      });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      {formularios.length === 0 ? (
        <Text style={styles.emptyText}>No hay formularios {estado}</Text>
      ) : (
        formularios.map((item, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.label}>📧 Usuario: {usuarios[item.uid]?.correo || 'Desconocido'}</Text>
            <Text style={styles.label}>📦 Tipo: {item.tipo}</Text>
            <Text style={styles.label}>♻️ Cantidad: {item.cantidad}</Text>
            <Text style={styles.label}>📍 Punto: {item.punto}</Text>
            {item.comentarioAdmin && (
              <Text style={styles.label}>💬 Comentario admin: {item.comentarioAdmin}</Text>
            )}

            {estado === 'pendiente' && (
              <>
                <TextInput
                  placeholder="Comentario del admin"
                  onChangeText={(text) => (item.comentarioTemp = text)}
                  style={styles.input}
                />
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#10b981' }]}
                    onPress={() => manejarDecision(item.uid, item.id, 'aceptado', item.comentarioTemp || '')}
                  >
                    <Text style={styles.buttonText}>Aceptar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#ef4444' }]}
                    onPress={() => manejarDecision(item.uid, item.id, 'rechazado', item.comentarioTemp || '')}
                  >
                    <Text style={styles.buttonText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function FormulariosTab() {
  return (
    <TopTabs.Navigator screenOptions={{
      tabBarActiveTintColor: '#00aa88',
      tabBarLabelStyle: { fontWeight: '600' },
      tabBarIndicatorStyle: { backgroundColor: '#00aa88' },
    }}>
      <TopTabs.Screen name="Pendientes">{() => <FormulariosPorEstado estado="pendiente" />}</TopTabs.Screen>
      <TopTabs.Screen name="Aceptados">{() => <FormulariosPorEstado estado="aceptado" />}</TopTabs.Screen>
      <TopTabs.Screen name="Rechazados">{() => <FormulariosPorEstado estado="rechazado" />}</TopTabs.Screen>
    </TopTabs.Navigator>
  );
}

function UsuariosTab() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    onValue(ref(database, 'usuarios/'), (snapshot) => {
      const data = snapshot.val();
      const lista = data ? Object.entries(data).map(([uid, info]) => ({ uid, ...info })) : [];
      setUsuarios(lista);
    });
  }, []);

  const cambiarRol = async (uid, nuevoRol) => {
    try {
      await update(ref(database, `usuarios/${uid}`), { rol: nuevoRol });
      Alert.alert('Rol actualizado');
    } catch (error) {
      console.error('Error al actualizar el rol:', error);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>👥 Gestión de Usuarios</Text>
      {usuarios.map((user) => (
        <View key={user.uid} style={styles.card}>
          <Text style={styles.label}>📧 Correo: {user.correo}</Text>
          <Text style={styles.label}>🔐 Rol: {user.rol}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3b82f6' }]}
              onPress={() => cambiarRol(user.uid, 'user')}
            >
              <Text style={styles.buttonText}>User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#a855f7' }]}
              onPress={() => cambiarRol(user.uid, 'admin')}
            >
              <Text style={styles.buttonText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function EstadisticasTab() {
  const [stats, setStats] = useState({ porMaterial: {}, porUsuario: {}, total: 0 });

  useEffect(() => {
    onValue(ref(database, 'formularios/'), (snapshot) => {
      const data = snapshot.val();
      const materiales = {};
      const usuarios = {};
      let total = 0;

      if (data) {
        Object.entries(data).forEach(([uid, forms]) => {
          Object.entries(forms).forEach(([id, f]) => {
            const tipo = f.tipo?.toLowerCase() || 'otro';
            const cantidad = parseInt(f.cantidad) || 0;
            materiales[tipo] = (materiales[tipo] || 0) + cantidad;
            usuarios[uid] = (usuarios[uid] || 0) + cantidad;
            total += cantidad;
          });
        });
      }

      setStats({ porMaterial: materiales, porUsuario: usuarios, total });
    });
  }, []);

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>📊 Estadísticas</Text>
      <Text style={styles.sectionTitle}>Por Material</Text>
      {Object.entries(stats.porMaterial).map(([mat, cant]) => (
        <Text key={mat} style={styles.label}>🔹 {mat}: {cant}</Text>
      ))}
      <Text style={styles.sectionTitle}>Por Usuario</Text>
      {Object.entries(stats.porUsuario).map(([uid, cant]) => (
        <Text key={uid} style={styles.label}>👤 {uid}: {cant}</Text>
      ))}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Total Reciclado: {stats.total}</Text>
    </ScrollView>
  );
}

export default function AdminPanel() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
          if (route.name === 'Formularios') iconName = 'document-text-outline';
          else if (route.name === 'Usuarios') iconName = 'people-outline';
          else if (route.name === 'Estadísticas') iconName = 'bar-chart-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Formularios" component={FormulariosTab} />
      <Tab.Screen name="Usuarios" component={UsuariosTab} />
      <Tab.Screen name="Estadísticas" component={EstadisticasTab} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#333', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#444' },
  card: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginVertical: 10, elevation: 3 },
  label: { fontSize: 16, color: '#555', marginBottom: 4 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 8, marginVertical: 10, backgroundColor: '#fff' },
  emptyText: { fontSize: 18, color: '#888', textAlign: 'center', marginTop: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  button: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
