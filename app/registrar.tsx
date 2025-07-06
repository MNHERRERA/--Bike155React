// app/registrar.tsx

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Usuario</Text>
      <TextInput
        placeholder="Nombre"
        placeholderTextColor="#ccc"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Correo"
        placeholderTextColor="#ccc"
        value={correo}
        onChangeText={setCorreo}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={registrar}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>Volver al Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002F6C', // azul Red Bull
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFCC00', // amarillo Red Bull
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFCC00', // amarillo Red Bull
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#DA291C', // rojo Red Bull
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#004C99', // azul medio Red Bull
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
