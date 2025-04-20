import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      Alert.alert('Error de acceso', 'Correo o contraseña incorrectos.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/login.jpeg')} style={styles.logo} />
      <Text style={styles.title}>Bienvenido de nuevo</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: 120, height: 120, marginBottom: 20, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 30, color: '#333' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 10, marginBottom: 15, borderColor: '#ddd', borderWidth: 1 },
  button: { backgroundColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 15, color: '#1d4ed8', textDecorationLine: 'underline' },
});
