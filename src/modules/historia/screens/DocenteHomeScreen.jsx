
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { obtenerCursosDocente } from '../services/docenteService';

function convertirEnLista(datos) {
  if (Array.isArray(datos)) return datos;
  if (!datos || typeof datos !== 'object') return [];

  if (Array.isArray(datos.cursos)) return datos.cursos;
  if (Array.isArray(datos.items)) return datos.items;
  if (Array.isArray(datos.data)) return datos.data;

  return [];
}

function nombreCurso(curso, indice) {
  const nombre =
    curso.nombre ||
    curso.nombreCurso ||
    curso.curso ||
    `Curso ${indice + 1}`;

  return typeof nombre === 'string' ? nombre : `Curso ${indice + 1}`;
}

export default function DocenteHomeScreen() {
  const navigation = useNavigation();

  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const cargarCursos = useCallback(async () => {
    try {
      setError('');

      const resultado = await obtenerCursosDocente();
      setCursos(convertirEnLista(resultado));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los cursos.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarCursos();
  }, [cargarCursos]);

  const actualizar = () => {
    setActualizando(true);
    cargarCursos();
  };

  const abrirCurso = (curso, indice) => {
    const id = curso.id ?? curso.cursoId;

    if (id == null) {
      setError('El curso seleccionado no tiene un identificador válido.');
      return;
    }

    navigation.navigate('EstudiantesCurso', {
      cursoId: id,
      cursoNombre: nombreCurso(curso, indice),
    });
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.textoCarga}>
          Cargando cursos del docente...
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
      <View style={styles.encabezado}>
        <Text style={styles.etiqueta}>VIRTU EDUCACIÓN</Text>
        <Text style={styles.titulo}>Panel del Docente</Text>
        <Text style={styles.subtitulo}>
          Consulta tus cursos y da seguimiento al aprendizaje
          de tus estudiantes.
        </Text>
      </View>

      <View style={styles.bienvenida}>
        <Text style={styles.bienvenidaTitulo}>
          ¡Bienvenido, docente!
        </Text>
        <Text style={styles.bienvenidaTexto}>
          Selecciona uno de tus cursos para consultar
          los estudiantes registrados.
        </Text>
      </View>

      <View style={styles.resumen}>
        <Text style={styles.resumenNumero}>
          {cursos.length}
        </Text>
        <Text style={styles.resumenTexto}>
          Cursos asignados
        </Text>
      </View>

      <Text style={styles.seccionTitulo}>Mis cursos</Text>

      {!!error && (
        <View style={styles.cajaError}>
          <Text style={styles.textoError}>{error}</Text>
          <TouchableOpacity
            style={styles.boton}
            onPress={cargarCursos}
          >
            <Text style={styles.botonTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && cursos.length === 0 && (
        <View style={styles.tarjeta}>
          <Text style={styles.detalle}>
            No se encontraron cursos asignados.
          </Text>
        </View>
      )}

      {cursos.map((curso, indice) => (
        <TouchableOpacity
          key={String(curso.id ?? indice)}
          style={styles.tarjeta}
          onPress={() => abrirCurso(curso, indice)}
          activeOpacity={0.8}
        >
          <View style={styles.fila}>
            <View style={styles.informacionCurso}>
              <Text style={styles.nombreCurso}>
                {nombreCurso(curso, indice)}
              </Text>

              <Text style={styles.indicacion}>
                Ver estudiantes del curso
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </View>
        </TouchableOpacity>
      ))}
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
    backgroundColor: '#F4F7FB',
  },
  textoCarga: {
    marginTop: 12,
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
    marginBottom: 10,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#DBEAFE',
    fontSize: 15,
    marginTop: 10,
    lineHeight: 23,
  },
  bienvenida: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  bienvenidaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  bienvenidaTexto: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 10,
    lineHeight: 23,
  },
  resumen: {
    backgroundColor: '#DBEAFE',
    padding: 22,
    borderRadius: 16,
    marginBottom: 25,
  },
  resumenNumero: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  resumenTexto: {
    fontSize: 15,
    color: '#1E40AF',
    marginTop: 5,
  },
  seccionTitulo: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  informacionCurso: {
    flex: 1,
  },
  nombreCurso: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  indicacion: {
    marginTop: 10,
    fontSize: 14,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  flecha: {
    fontSize: 32,
    color: '#2563EB',
    marginLeft: 12,
  },
  detalle: {
    color: '#64748B',
    fontSize: 15,
  },
  cajaError: {
    backgroundColor: '#FEE2E2',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  textoError: {
    color: '#B91C1C',
    marginBottom: 12,
  },
  boton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
