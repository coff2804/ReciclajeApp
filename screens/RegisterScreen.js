import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../firebase/config';
import { ref, set } from 'firebase/database';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
      await set(ref(database, `usuarios/${uid}`), {
        rol: 'user',
        correo: email,
      });
      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada.');
      navigation.navigate('Login');
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setError('El correo ya está en uso.');
      else if (e.code === 'auth/invalid-email') setError('Correo no válido.');
      else setError('Error al registrar. Intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/login.jpeg')} style={styles.image} />
      <Text style={styles.title}>Crear cuenta</Text>
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', padding: 20 },
  image: { width: 120, height: 120, marginBottom: 20, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20, color: '#333' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 10, marginBottom: 10, borderColor: '#ddd', borderWidth: 1 },
  button: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#ef4444', marginBottom: 10, textAlign: 'center' },
  link: { marginTop: 15, color: '#1d4ed8', textDecorationLine: 'underline' },
});
