import { AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps'; // Importar MapView, Marker, UrlTile
import { api } from '../../lib/api'; // CORRECCIÓN: Importar la instancia de Axios con la ruta correcta

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Bike = {
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

export default function Home() {
  const [rutasHechas, setRutasHechas] = useState<Ruta[]>([]);
  const [expandedRutaId, setExpandedRutaId] = useState<number | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // Cargar rutas existentes
  useEffect(() => {
    const loadRutas = async () => {
      try {
        // Usar la instancia de Axios para cargar rutas
        const response = await api.get('/Rutas');
        const data = response.data;
        if (Array.isArray(data)) {
          setRutasHechas(data);
        } else {
          console.error('Respuesta inesperada del servidor al cargar rutas:', data);
        }
      } catch (error) {
        console.error('Error al cargar rutas:', error);
        Alert.alert('Error', 'No se pudieron cargar las rutas existentes.');
      }
    };
    loadRutas();
  }, []); // Se ejecuta una vez al montar el componente

  // Obtener ubicación actual
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        Alert.alert('Permiso Denegado', 'Se necesita permiso de ubicación para mostrar el mapa.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedRutaId(expandedRutaId === id ? null : id);
  };

  const getTipoRuta = (bike: Bike | undefined) => bike?.tipo || 'Desconocido';

  const renderRuta = ({ item }: { item: Ruta }) => {
    const fechaValida = !isNaN(Date.parse(item.fecha));
    return (
      <View style={styles.itemContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <AntDesign name={expandedRutaId === item.id ? 'down' : 'right'} size={16} color="#FFCC00" />
          </TouchableOpacity>
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.tipoTitulo}>{getTipoRuta(item.bike)}</Text>
            <Text style={styles.itemText}>{item.ubicacion}</Text>
            <Text style={styles.fechaText}>
              {fechaValida ? new Date(item.fecha).toLocaleDateString() : 'Fecha no válida'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bike155</Text> {/* Título cambiado a Bike155 */}

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
            {/* Marcadores para rutas existentes */}
            {rutasHechas.map(ruta =>
              ruta.latitud !== undefined && ruta.longitud !== undefined ? (
                <Marker
                  key={ruta.id}
                  coordinate={{ latitude: ruta.latitud, longitude: ruta.longitud }}
                  title={ruta.ubicacion}
                  description={getTipoRuta(ruta.bike)}
                />
              ) : null
            )}
          </MapView>
        </>
      ) : (
        <Text style={styles.ubicacionText}>Obteniendo ubicación...</Text>
      )}

      <FlatList
        data={rutasHechas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRuta}
        style={{ marginTop: 10 }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/eventos')}>
          <Text style={styles.buttonText}>Eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/crearRuta')}>
          <Text style={styles.buttonText}>Crear Ruta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002F6C',
    padding: 16,
    paddingBottom: 100,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
  },
  primaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 50,
    borderRadius: 99,
    backgroundColor: '#DA291C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
