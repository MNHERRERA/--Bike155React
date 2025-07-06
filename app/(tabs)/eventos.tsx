import { Picker } from '@react-native-picker/picker';
import axios from 'axios'; // Importar axios completo para isAxiosError y AxiosError
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
    View,
} from 'react-native';
import { api } from '../../lib/api'; // Asegúrate de que la ruta sea correcta

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Tipos de datos
type Ruta = {
  id: number;
  ubicacion: string;
  fecha: string; // Puede que necesites este campo para mostrar la ruta
  latitud?: number;
  longitud?: number;
  bike?: { tipo: string };
};

type EventoPayload = {
  id: number; // 0 para creación, el backend asigna el ID real
  rutaId: number;
  fechaEvento: string; // Formato ISO 8601
  descripcion: string;
};

export default function EventosScreen() {
  const [availableRutas, setAvailableRutas] = useState<Ruta[]>([]);
  const [selectedRutaId, setSelectedRutaId] = useState<number | null>(null);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
  const [eventDescription, setEventDescription] = useState('');

  // Cargar rutas disponibles al montar el componente
  useEffect(() => {
    const loadRutas = async () => {
      try {
        const response = await api.get('/Rutas');
        const data = response.data;
        if (Array.isArray(data)) {
          setAvailableRutas(data);
          if (data.length > 0) {
            setSelectedRutaId(data[0].id); // Seleccionar la primera ruta por defecto
          } else {
            setSelectedRutaId(null); // Si no hay rutas, dejarlo en null
          }
        } else {
          console.error('Respuesta inesperada del servidor al cargar rutas:', data);
        }
      } catch (error: unknown) { // Tipo de error corregido aquí a unknown
        console.error('Error al cargar rutas para eventos:', error);
        if (axios.isAxiosError(error) && error.response && typeof error.response.data === 'string') {
          Alert.alert('Error del Servidor', error.response.data);
        } else {
          Alert.alert('Error', 'No se pudieron cargar las rutas disponibles para crear un evento.');
        }
      }
    };
    loadRutas();
  }, []);

  const handleCreateEvent = async () => {
    // Validaciones
    let missingFields = [];
    if (selectedRutaId === null) missingFields.push('Ruta');
    if (!eventDate.trim()) missingFields.push('Fecha del Evento');
    if (!eventDescription.trim()) missingFields.push('Descripción del Evento');

    if (missingFields.length > 0) {
      Alert.alert('Error', `Por favor, completa los siguientes campos: ${missingFields.join(', ')}.`);
      return;
    }

    if (!selectedRutaId) {
      Alert.alert('Error', 'Por favor, selecciona una ruta válida.');
      return;
    }

    const newEventPayload: EventoPayload = {
      id: 0, // El backend asignará el ID
      rutaId: selectedRutaId,
      fechaEvento: new Date(eventDate).toISOString(), // Asegúrate de que el formato sea correcto para tu API
      descripcion: eventDescription.trim(),
    };

    try {
      await api.post('/Eventos', newEventPayload); // Asumiendo el endpoint /api/Eventos
      Alert.alert('Éxito', 'Evento creado correctamente.');
      // Limpiar campos después de crear
      setSelectedRutaId(availableRutas.length > 0 ? availableRutas[0].id : null);
      setEventDate(new Date().toISOString().split('T')[0]);
      setEventDescription('');
    } catch (error: unknown) { // Tipo de error corregido aquí a unknown
      console.error('Error al crear evento:', error);
      if (axios.isAxiosError(error) && error.response && typeof error.response.data === 'string') {
        Alert.alert('Error del Servidor', error.response.data);
      } else {
        Alert.alert('Error', 'No se pudo crear el evento. Verifica la conexión o los datos.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Crear Nuevo Evento</Text>

        {/* Selector de Ruta */}
        <Text style={styles.label}>Selecciona una Ruta:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRutaId}
            onValueChange={(itemValue: number | null) => setSelectedRutaId(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {availableRutas.length === 0 && (
              <Picker.Item label="Cargando rutas..." value={null} />
            )}
            {availableRutas.map((ruta) => (
              <Picker.Item key={ruta.id} label={ruta.ubicacion} value={ruta.id} />
            ))}
          </Picker>
        </View>

        {/* Selector de Fecha */}
        <Text style={styles.label}>Fecha del Evento:</Text>
        <TextInput
          style={styles.input}
          value={eventDate}
          onChangeText={setEventDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#ccc"
          // keyboardType="numeric" // Si quieres forzar solo números para la fecha
        />
        {/* Aquí es donde integrarías un DatePicker real si usaras una librería */}

        {/* Descripción del Evento */}
        <Text style={styles.label}>Descripción del Evento:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={eventDescription}
          onChangeText={setEventDescription}
          placeholder="Describe el evento (ej: 'Ruta de 20km para principiantes, punto de encuentro en...')"
          placeholderTextColor="#ccc"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateEvent}>
          <Text style={styles.buttonText}>Crear Evento</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002F6C',
    padding: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFCC00',
  },
  label: {
    fontSize: 16,
    color: '#FFCC00',
    marginBottom: 8,
    fontWeight: 'bold',
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
  textArea: {
    height: 100, // Altura para el campo de descripción
    textAlignVertical: 'top', // Para que el texto empiece arriba en Android
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
  primaryButton: {
    backgroundColor: '#DA291C', // Rojo Red Bull
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
