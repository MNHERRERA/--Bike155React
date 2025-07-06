import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../lib/api';

export default function Login() {
  const [user, setUser] = useState('');

  const iniciarSesion = async () => {
    const nombreIngresado = user.trim().toLowerCase();

    if (!nombreIngresado) {
      Alert.alert('Campo vacío', 'Ingrese su nombre de usuario');
      return;
    }

    try {
      const response = await api.get('/Users');
      const usuarios = response.data;

      console.log('Usuarios recibidos:', usuarios);

      const existe = usuarios.some(
        (u: { nombre: string }) =>
          u.nombre?.trim().toLowerCase() === nombreIngresado
      );

      if (existe) {
        router.replace({
          pathname: '/(tabs)/home',
          params: { user: nombreIngresado },
        });
      } else {
        Alert.alert('Error', 'Usuario no encontrado');
      }
    } catch (error: any) {
      console.error('Error al conectar con el servidor:', error?.message);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        placeholder="Usuario"
        placeholderTextColor="#ccc"
        value={user}
        onChangeText={setUser}
        style={styles.input}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={iniciarSesion}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/registrar')}
      >
        <Text style={styles.buttonText}>Registrar Usuario</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002F6C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFCC00',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#DA291C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#004C99',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
