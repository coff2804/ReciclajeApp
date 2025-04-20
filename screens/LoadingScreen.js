import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../firebase/config';

export default function LoadingScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const snapshot = await get(ref(database, `usuarios/${uid}`));
      const data = snapshot.val();
      const role = data?.rol;

      if (role === 'admin') {
        navigation.replace('AdminPanel');
      } else if (role === 'user') {
        navigation.replace('UserPanel');
      } else {
        Alert.alert('Error', 'Rol no definido.');
      }
    } catch (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Iniciar sesión" onPress={handleLogin} />
    </View>
  );
}
