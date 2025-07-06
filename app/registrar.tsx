// app/registrar.tsx

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { api } from '../lib/api';

export default function RegistrarUsuario() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');

  const registrar = async () => {
    if (nombre.trim() !== '' && correo.trim() !== '') {
      try {
        const nuevoUsuario = {
          id: 0,
          nombre: nombre.trim(),
          correo: correo.trim(),
        };

        await api.post('/Users', nuevoUsuario);

        Alert.alert('Éxito', 'Usuario registrado correctamente');
        router.replace('/'); // Vuelve al login tras registrar
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo registrar el usuario');
      }
    } else {
      Alert.alert('Error', 'Completa todos los campos');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Registrar Usuario</Text>
      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          marginBottom: 10,
        }}
      />
      <Button title="Registrar" onPress={registrar} />
    </View>
  );
}
