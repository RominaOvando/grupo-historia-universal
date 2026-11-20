import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { obtenerDetalleLeccion } from '../services/historiaService';

export default function LeccionDetalleScreen({ route, navigation }) {
  const { leccionId, titulo } = route.params;

  const [leccion, setLeccion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarLeccion() {
      try {
        setCargando(true);
        setError('');

        const resultado = await obtenerDetalleLeccion(leccionId);

        if (activo) {
          setLeccion(resultado.leccion ?? resultado);
        }
      } catch (error) {
        if (activo) {
          setError(error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarLeccion();

    return () => {
      activo = false;
    };
  }, [leccionId]);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.mensaje}>
          Cargando lección...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botonTexto}>
            Volver a Historia
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!leccion || typeof leccion !== 'object') {
    return (
      <View style={styles.centro}>
        <Text>No se encontró información de esta lección.</Text>
      </View>
    );
  }

  const tituloLeccion =
    leccion.titulo ||
    leccion.nombre ||
    titulo ||
    'Lección de Historia';

  const definicion =
    leccion.definicion ||
    leccion.contenido ||
    leccion.descripcion ||
    leccion.texto ||
    '';

  const ejemplo =
    leccion.ejemploHistorico ||
    leccion.ejemplo ||
    '';

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.encabezado}>
        <Text style={styles.etiqueta}>
          HISTORIA UNIVERSAL
        </Text>

        <Text style={styles.titulo}>
          {tituloLeccion}
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>
          ¿De qué trata esta lección?
        </Text>

        <Text style={styles.texto}>
          {definicion || 'No hay una definición disponible.'}
        </Text>
      </View>

      {!!ejemplo && (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>
            Ejemplo histórico
          </Text>

          <Text style={styles.texto}>
            {ejemplo}
          </Text>
        </View>
      )}

      <View style={styles.tarjetaInformativa}>
        <Text style={styles.informacionTitulo}>
          Sigue aprendiendo
        </Text>

        <Text style={styles.informacionTexto}>
          Lee atentamente esta lección para comprender
          mejor los acontecimientos de la Historia Universal.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botonTexto}>
          Volver a las unidades
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  contenido: {
    padding: 20,
    paddingBottom: 40,
  },

  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  mensaje: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 15,
  },

  encabezado: {
    backgroundColor: '#1D4ED8',
    padding: 25,
    borderRadius: 18,
    marginBottom: 20,
  },

  etiqueta: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    marginBottom: 18,
  },

  seccionTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },

  texto: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
  },

  tarjetaInformativa: {
    backgroundColor: '#DBEAFE',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },

  informacionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },

  informacionTexto: {
    fontSize: 15,
    color: '#1E40AF',
    lineHeight: 23,
    marginTop: 10,
  },

  boton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  error: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
});