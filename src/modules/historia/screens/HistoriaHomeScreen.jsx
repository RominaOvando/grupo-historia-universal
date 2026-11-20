import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { obtenerContenidosHistoria } from '../services/historiaService';

// Convertir diferentes estructuras de respuesta en una lista
function convertirEnLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  if (!datos || typeof datos !== 'object') {
    return [];
  }

  if (Array.isArray(datos.unidades)) {
    return datos.unidades;
  }

  if (Array.isArray(datos.contenidos)) {
    return datos.contenidos;
  }

  if (Array.isArray(datos.items)) {
    return datos.items;
  }

  if (Array.isArray(datos.data)) {
    return datos.data;
  }

  return [];
}

// Obtener el nombre de una unidad
function obtenerNombreUnidad(unidad) {
  return (
    unidad.nombre ||
    unidad.titulo ||
    unidad.nombreUnidad ||
    'Unidad sin título'
  );
}

// Obtener las lecciones de una unidad
function obtenerLecciones(unidad) {
  if (Array.isArray(unidad.lecciones)) {
    return unidad.lecciones;
  }

  if (Array.isArray(unidad.contenidos)) {
    return unidad.contenidos;
  }

  return [];
}

// Obtener el título de una lección
function obtenerTituloLeccion(leccion) {
  return (
    leccion.titulo ||
    leccion.nombre ||
    leccion.nombreLeccion ||
    'Lección sin título'
  );
}

// Obtener el estado de una lección
function obtenerEstadoLeccion(leccion) {
  if (leccion.estudiado === true) {
    return 'ESTUDIADO';
  }

  if (leccion.estudiado === false) {
    return 'PENDIENTE';
  }

  return (
    leccion.estadoAprendizaje ||
    leccion.estadoEstudio ||
    leccion.estado ||
    'PENDIENTE'
  );
}

export function HistoriaHomeScreen() {
  const navigation = useNavigation();

  const [unidades, setUnidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const cargarUnidades = useCallback(async () => {
    try {
      setError('');

      const datos = await obtenerContenidosHistoria();

      const lista = convertirEnLista(datos);

      setUnidades(lista);
    } catch (error) {
      console.error('Error al cargar Historia:', error.message);

      setError(error.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarUnidades();
  }, [cargarUnidades]);

  const actualizar = () => {
    setActualizando(true);
    cargarUnidades();
  };

  const abrirLeccion = (leccion) => {
    if (leccion.id == null) {
      setError('Esta lección no tiene un identificador válido.');
      return;
    }

    navigation.navigate('DetalleLeccion', {
      leccionId: leccion.id,
      titulo: obtenerTituloLeccion(leccion),
    });
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.mensaje}>
          Cargando Historia Universal...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      refreshControl={
        <RefreshControl
          refreshing={actualizando}
          onRefresh={actualizar}
        />
      }
    >
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <Text style={styles.etiqueta}>VIRTU EDUCACIÓN</Text>

        <Text style={styles.titulo}>
          Historia Universal
        </Text>

        <Text style={styles.subtitulo}>
          Explora los acontecimientos que cambiaron el mundo.
        </Text>
      </View>

      {/* Bienvenida */}
      <View style={styles.bienvenida}>
        <Text style={styles.bienvenidaTitulo}>
          ¡Bienvenido a Historia!
        </Text>

        <Text style={styles.bienvenidaTexto}>
          Aquí encontrarás las unidades y lecciones
          disponibles para continuar aprendiendo.
        </Text>
      </View>

      {/* Encabezado de unidades */}
      <View style={styles.filaTitulo}>
        <Text style={styles.seccionTitulo}>
          Unidades de aprendizaje
        </Text>

        <Text style={styles.contador}>
          {unidades.length} unidades
        </Text>
      </View>

      {/* Mensajes de error */}
      {error !== '' && (
        <View style={styles.cajaError}>
          <Text style={styles.textoError}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={cargarUnidades}
          >
            <Text style={styles.textoBoton}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Si no hay unidades */}
      {unidades.length === 0 && error === '' && (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>
            No hay unidades disponibles
          </Text>

          <Text style={styles.vacioTexto}>
            Todavía no se encontraron unidades de Historia Universal.
          </Text>
        </View>
      )}

      {/* Lista de unidades */}
      {unidades.map((unidad, indice) => {
        const lecciones = obtenerLecciones(unidad);

        return (
          <View
            key={String(unidad.id ?? indice)}
            style={styles.tarjetaUnidad}
          >
            <View style={styles.unidadEncabezado}>
              <View style={styles.numeroUnidad}>
                <Text style={styles.numeroTexto}>
                  {indice + 1}
                </Text>
              </View>

              <View style={styles.unidadInformacion}>
                <Text style={styles.unidadTitulo}>
                  {obtenerNombreUnidad(unidad)}
                </Text>

                <Text style={styles.unidadCantidad}>
                  {lecciones.length} lecciones
                </Text>
              </View>
            </View>

            {!!unidad.descripcion && (
              <Text style={styles.descripcionUnidad}>
                {unidad.descripcion}
              </Text>
            )}

            {lecciones.length === 0 ? (
              <Text style={styles.sinLecciones}>
                Esta unidad todavía no contiene lecciones.
              </Text>
            ) : (
              lecciones.map((leccion, posicion) => {
                const estado = String(
                  obtenerEstadoLeccion(leccion)
                ).toUpperCase();

                const estudiado = estado === 'ESTUDIADO';

                return (
                  <TouchableOpacity
                    key={String(leccion.id ?? posicion)}
                    style={styles.tarjetaLeccion}
                    onPress={() => abrirLeccion(leccion)}
                  >
                    <View style={styles.leccionInformacion}>
                      <Text style={styles.leccionTitulo}>
                        {obtenerTituloLeccion(leccion)}
                      </Text>

                      <Text
                        style={[
                          styles.estado,
                          estudiado
                            ? styles.estadoEstudiado
                            : styles.estadoPendiente,
                        ]}
                      >
                        {estado}
                      </Text>
                    </View>

                    <Text style={styles.flecha}>
                      ›
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        );
      })}
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
    paddingBottom: 50,
  },

  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },

  mensaje: {
    marginTop: 15,
    fontSize: 16,
    color: '#64748B',
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
    marginBottom: 10,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#DBEAFE',
    fontSize: 15,
    marginTop: 10,
    lineHeight: 22,
  },

  bienvenida: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },

  bienvenidaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  bienvenidaTexto: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 23,
    marginTop: 10,
  },

  filaTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  seccionTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },

  contador: {
    fontSize: 13,
    color: '#64748B',
  },

  tarjetaUnidad: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  unidadEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  numeroUnidad: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  numeroTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },

  unidadInformacion: {
    flex: 1,
  },

  unidadTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  unidadCantidad: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },

  descripcionUnidad: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 15,
  },

  tarjetaLeccion: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  leccionInformacion: {
    flex: 1,
  },

  leccionTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },

  estado: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },

  estadoEstudiado: {
    color: '#16A34A',
  },

  estadoPendiente: {
    color: '#D97706',
  },

  flecha: {
    fontSize: 30,
    color: '#2563EB',
    marginLeft: 10,
  },

  cajaError: {
    backgroundColor: '#FEE2E2',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },

  textoError: {
    color: '#B91C1C',
    fontSize: 14,
    marginBottom: 12,
  },

  botonReintentar: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  vacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },

  vacioTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#334155',
  },

  vacioTexto: {
    fontSize: 14,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 10,
  },

  sinLecciones: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 10,
  },
});