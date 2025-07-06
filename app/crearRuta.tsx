import { Picker } from '@react-native-picker/picker'; // Importar Picker para el menú desplegable
import axios from 'axios'; // Importar axios completo para isAxiosError y AxiosError
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { api } from '../lib/api'; // Importar la instancia de Axios

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Bike = {
  id: number; // Añadido id para el tipo de bicicleta
  tipo: string;
};

type Ruta = {
  id: number;
  ubicacion: string;
  fecha: string;
  latitud?: number;
  longitud?: number;
  bike?: Bike;
};

export default function CrearRutaScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // Estados para la nueva ruta
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  // Fecha automática: inicializar con la fecha actual en formato ISO-MM-DD
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nuevaLatitud, setNuevaLatitud] = useState('');
  const [nuevaLongitud, setNuevaLongitud] = useState('');
  
  // Nuevo estado para los tipos de bicicleta obtenidos de la API
  const [availableBikeTypes, setAvailableBikeTypes] = useState<Bike[]>([]);
  // El tipo de bicicleta seleccionado, inicializado a una cadena vacía o un valor por defecto
  const [selectedBikeType, setSelectedBikeType] = useState<string>('');

  // Efecto para obtener la ubicación actual
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        Alert.alert('Permiso Denegado', 'Se necesita permiso de ubicación para mostrar el mapa y sugerir la ubicación.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setNuevaLatitud(currentLocation.coords.latitude.toFixed(5));
      setNuevaLongitud(currentLocation.coords.longitude.toFixed(5));
    })();
  }, []);

  // Nuevo useEffect para cargar los tipos de bicicleta desde la API
  useEffect(() => {
    const loadBikeTypes = async () => {
      try {
        // Asumiendo que el endpoint para los tipos de bicicleta es /api/Bikes
        const response = await api.get('/Bikes'); 
        const data = response.data;
        if (Array.isArray(data)) {
          setAvailableBikeTypes(data);
          // Establecer el tipo de bicicleta seleccionado por defecto si hay tipos disponibles
          if (data.length > 0) {
            setSelectedBikeType(data[0].tipo); // Selecciona el primer tipo por defecto
          } else {
            setSelectedBikeType(''); // Si no hay tipos, dejarlo vacío
          }
        } else {
          console.error('Respuesta inesperada del servidor al cargar tipos de bicicleta:', data);
        }
      } catch (error: unknown) { // Tipo de error corregido aquí a unknown
        console.error('Error al cargar tipos de bicicleta:', error);
        if (axios.isAxiosError(error) && error.response && typeof error.response.data === 'string') {
          Alert.alert('Error del Servidor', error.response.data);
        } else {
          Alert.alert('Error', 'No se pudieron cargar los tipos de bicicleta.');
        }
      }
    };
    loadBikeTypes();
  }, []); // Se ejecuta una vez al montar el componente

  const crearNuevaRuta = async () => {
    // Validaciones
    let missingFields = [];
    if (!nuevaUbicacion.trim()) missingFields.push('Ubicación');
    if (!selectedBikeType || selectedBikeType === '') missingFields.push('Tipo de Bicicleta');

    if (missingFields.length > 0) {
      Alert.alert('Error', `Por favor, completa los siguientes campos: ${missingFields.join(', ')}.`);
      return;
    }

    const latitud = nuevaLatitud.trim() ? parseFloat(nuevaLatitud) : location?.coords.latitude;
    const longitud = nuevaLongitud.trim() ? parseFloat(nuevaLongitud) : location?.coords.longitude;

    if (isNaN(latitud!) || isNaN(longitud!)) {
      Alert.alert('Error', 'Latitud o Longitud no válidas. Por favor, ingresa números o permite la ubicación.');
      return;
    }

    // *** MODIFICACIÓN CLAVE AQUÍ: ENCONTRAR EL ID DEL TIPO DE BICICLETA SELECCIONADO ***
    const selectedBike = availableBikeTypes.find(bike => bike.tipo === selectedBikeType);

    if (!selectedBike) {
      Alert.alert('Error', 'Tipo de bicicleta seleccionado no válido. Por favor, selecciona uno de la lista.');
      return;
    }

    const nuevaRutaPayload = {
      id: 0, 
      ubicacion: nuevaUbicacion.trim(),
      fecha: new Date(nuevaFecha).toISOString(), 
      latitud: latitud,
      longitud: longitud,
      bike: {
        id: selectedBike.id, // <-- ¡Añadimos el ID de la bicicleta aquí!
        tipo: selectedBike.tipo // También enviamos el tipo, por si acaso el backend lo necesita
      }
    };

    try {
      await api.post('/Rutas', nuevaRutaPayload);
      Alert.alert('Éxito', 'Ruta creada correctamente.');
      // Limpiar campos después de crear
      setNuevaUbicacion('');
      setNuevaFecha(new Date().toISOString().split('T')[0]); 
      setNuevaLatitud(location?.coords.latitude.toFixed(5) || '');
      setNuevaLongitud(location?.coords.longitude.toFixed(5) || '');
      setSelectedBikeType(availableBikeTypes.length > 0 ? availableBikeTypes[0].tipo : ''); // Restablecer el Picker
      
      // router.replace('/(tabs)/home'); // Opcional: volver a la pantalla principal
    } catch (error: unknown) { // Tipo de error corregido aquí a unknown
      console.error('Error al crear ruta:', error);
      // Intentar mostrar un mensaje de error más específico si viene del servidor
      if (axios.isAxiosError(error) && error.response && typeof error.response.data === 'string') {
        Alert.alert('Error del Servidor', error.response.data);
      } else {
        Alert.alert('Error', 'No se pudo crear la ruta. Verifica la conexión o los datos.');
      }
    }
  };

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Bike155</Text> 

        {location ? (
          <>
            <Text style={styles.ubicacionText}>
              Tu ubicación actual: {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
            </Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <UrlTile
                urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Tu ubicación"
                pinColor="blue"
              />
            </MapView>
          </>
        ) : (
          <Text style={styles.ubicacionText}>Obteniendo ubicación...</Text>
        )}

        <View style={styles.divider} />

        <Text style={styles.title}>Crear Nueva Ruta</Text>

        <TextInput
          placeholder="Ubicación (Ej: Parque La Carolina)"
          placeholderTextColor="#ccc"
          value={nuevaUbicacion}
          onChangeText={setNuevaUbicacion}
          style={styles.input}
        />
        
        <View style={styles.readOnlyFieldContainer}>
          <Text style={styles.readOnlyFieldLabel}>Fecha:</Text>
          <Text style={styles.readOnlyFieldText}>{nuevaFecha}</Text>
        </View>

        <TextInput
          placeholder="Latitud (Ej: -0.18065)"
          placeholderTextColor="#ccc"
          value={nuevaLatitud}
          onChangeText={setNuevaLatitud}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Longitud (Ej: -78.46784)"
          placeholderTextColor="#ccc"
          value={nuevaLongitud}
          onChangeText={setNuevaLongitud}
          keyboardType="numeric"
          style={styles.input}
        />
        
        {/* Picker para Tipo de Bicicleta */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBikeType}
            onValueChange={(itemValue: string) => setSelectedBikeType(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {/* Opción por defecto */}
            <Picker.Item label="Selecciona un tipo" value="" /> 
            {availableBikeTypes.map((bikeType) => (
              <Picker.Item key={bikeType.id} label={bikeType.tipo} value={bikeType.tipo} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={crearNuevaRuta}>
          <Text style={styles.buttonText}>Guardar Nueva Ruta</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)/eventos')}>
          <Text style={styles.buttonText}>Eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.buttonText}>Ver Rutas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#002F6C',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#FFCC00',
  },
  itemContainer: { 
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFCC00',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#004C99',
  },
  headerRow: { 
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipoTitulo: { 
    color: '#FFCC00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: { 
    color: '#FFFFFF',
    fontSize: 16,
  },
  fechaText: { 
    color: '#CCCCCC',
    fontSize: 14,
  },
  ubicacionText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 10,
    borderRadius: 8,
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
  primaryButton: {
    backgroundColor: '#DA291C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 2,
    backgroundColor: '#FFCC00',
    marginVertical: 20,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 1,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#002F6C',
    borderTopWidth: 1,
    borderTopColor: '#FFCC00',
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 50,
    borderRadius: 99,
    backgroundColor: '#004C99',
  },
  readOnlyFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFCC00',
    backgroundColor: '#004C99',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  readOnlyFieldLabel: {
    color: '#FFCC00',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  readOnlyFieldText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFCC00',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000000',
  },
  pickerItem: {
    color: '#000000',
  },
});
