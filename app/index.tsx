// app/index.tsx

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { api } from '../lib/api';

export default function Login() {
  const [user, setUser] = useState('');

  const iniciarSesion = async () => {
    if (user.trim() !== '') {
      try {
        const response = await api.get('/Users');
        const usuarios = response.data;

        const existe = usuarios.some(
          (u: { nombre: string }) => u.nombre.toLowerCase() === user.trim().toLowerCase()
        );

        if (existe) {
          router.replace('/(tabs)/home');
        } else {
          Alert.alert('Error', 'Usuario no encontrado');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Usuario"
        value={user}
        onChangeText={setUser}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          marginBottom: 10,
        }}
      />
      <Button title="Entrar" onPress={iniciarSesion} />
      <Button
        title="Registrar usuario"
        onPress={() => router.push('/registrar')}
      />
    </View>
  );
}
