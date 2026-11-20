
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { obtenerEstudiantesCurso } from '../services/docenteService';

// Convertir la respuesta del backend en una lista
function convertirEnLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  if (!datos || typeof datos !== 'object') {
    return [];
  }

  if (Array.isArray(datos.estudiantes)) {
    return datos.estudiantes;
  }

  if (Array.isArray(datos.alumnos)) {
    return datos.alumnos;
  }

  if (Array.isArray(datos.items)) {
    return datos.items;
  }

  if (Array.isArray(datos.data)) {
    return datos.data;
  }

  return [];
}

// Obtener el nombre completo del estudiante
function nombreEstudiante(estudiante, indice) {
  if (estudiante.nombreCompleto) {
    return estudiante.nombreCompleto;
  }

  if (estudiante.nombre_completo) {
    return estudiante.nombre_completo;
  }

  if (estudiante.usuario?.nombreCompleto) {
    return estudiante.usuario.nombreCompleto;
  }

  const nombre = estudiante.nombre || '';
  const apellido = estudiante.apellido || '';

  const nombreCompleto = `${nombre} ${apellido}`.trim();

  return (
    nombreCompleto ||
    estudiante.username ||
    `Estudiante ${indice + 1}`
  );
}

export default function EstudiantesCursoScreen({ route }) {
  const navigation = useNavigation();

  const { cursoId, cursoNombre } = route.params;

  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  // Consultar los estudiantes de un curso
  const cargarEstudiantes = useCallback(async () => {
    try {
      setError('');

      const resultado = await obtenerEstudiantesCurso(cursoId);

      const lista = convertirEnLista(resultado);

      setEstudiantes(lista);
    } catch (err) {
      console.error('ERROR AL CARGAR ESTUDIANTES:', err.message);

      setError(
        err.message || 'No se pudieron cargar los estudiantes.'
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [cursoId]);

  useEffect(() => {
    cargarEstudiantes();
  }, [cargarEstudiantes]);

  // Actualizar la lista
  const actualizar = () => {
    setActualizando(true);
    cargarEstudiantes();
  };

  // Abrir la pantalla de progreso académico
  const abrirProgreso = (estudiante, indice) => {
    // Mostrar solamente los nombres de los campos
    console.log(
      'CAMPOS DEL ESTUDIANTE:',
      Object.keys(estudiante)
    );

    // Revisar posibles nombres del identificador
    console.log('POSIBLES IDENTIFICADORES:', {
      id: estudiante.id,
      estudianteId: estudiante.estudianteId,
      usuarioId: estudiante.usuarioId,
      usuario_id: estudiante.usuario_id,
      idUsuario: estudiante.idUsuario,
      id_estudiante: estudiante.id_estudiante,
      id_usuario: estudiante.id_usuario,
      idAnidado: estudiante.usuario?.id,
    });

    // Buscar el identificador en los campos habituales
    const estudianteId =
      estudiante.id ??
      estudiante.estudianteId ??
      estudiante.usuarioId ??
      estudiante.usuario_id ??
      estudiante.idUsuario ??
      estudiante.id_estudiante ??
      estudiante.id_usuario ??
      estudiante.usuario?.id;

    // Verificar que exista el identificador
    if (estudianteId === undefined || estudianteId === null) {
      setError(
        'No se encontró el ID del estudiante. Revisa la consola del navegador.'
      );

      return;
    }

    // Limpiar errores anteriores
    setError('');

    // Abrir la pantalla de progreso
    navigation.navigate('ProgresoEstudiante', {
      estudianteId: estudianteId,
      estudianteNombre: nombreEstudiante(estudiante, indice),
    });
  };

  // Pantalla mientras se cargan los estudiantes
  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.textoCarga}>
          Cargando estudiantes...
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
      {/* ENCABEZADO */}
      <View style={styles.encabezado}>
        <Text style={styles.etiqueta}>
          VIRTU EDUCACIÓN
        </Text>

        <Text style={styles.titulo}>
          {cursoNombre || 'Estudiantes del curso'}
        </Text>

        <Text style={styles.subtitulo}>
          Consulta el seguimiento académico de los estudiantes.
        </Text>
      </View>

      {/* TOTAL DE ESTUDIANTES */}
      <View style={styles.resumen}>
        <Text style={styles.numero}>
          {estudiantes.length}
        </Text>

        <Text style={styles.resumenTexto}>
          Estudiantes encontrados
        </Text>
      </View>

      {/* TÍTULO DEL LISTADO */}
      <Text style={styles.seccionTitulo}>
        Lista de estudiantes
      </Text>

      {/* MENSAJE DE ERROR */}
      {error !== '' && (
        <View style={styles.cajaError}>
          <Text style={styles.textoError}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.boton}
            onPress={cargarEstudiantes}
          >
            <Text style={styles.botonTexto}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SIN ESTUDIANTES */}
      {estudiantes.length === 0 && error === '' && (
        <View style={styles.tarjeta}>
          <Text style={styles.detalle}>
            No se encontraron estudiantes para este curso.
          </Text>
        </View>
      )}

      {/* LISTA DE ESTUDIANTES */}
      {estudiantes.map((estudiante, indice) => (
        <TouchableOpacity
          key={String(estudiante.id ?? indice)}
          style={styles.tarjeta}
          activeOpacity={0.8}
          onPress={() => abrirProgreso(estudiante, indice)}
        >
          <View style={styles.fila}>
            {/* NÚMERO DEL ESTUDIANTE */}
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {indice + 1}
              </Text>
            </View>

            {/* INFORMACIÓN */}
            <View style={styles.info}>
              <Text style={styles.nombre}>
                {nombreEstudiante(estudiante, indice)}
              </Text>

              {!!estudiante.username && (
                <Text style={styles.detalle}>
                  Usuario: {estudiante.username}
                </Text>
              )}

              <Text style={styles.enlace}>
                Consultar progreso académico
              </Text>
            </View>

            {/* FLECHA */}
            <Text style={styles.flecha}>
              ›
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ESTILOS DE LA PANTALLA
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
    borderRadius: 18,
    padding: 25,
    marginBottom: 25,
  },

  etiqueta: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitulo: {
    fontSize: 15,
    color: '#DBEAFE',
    marginTop: 10,
    lineHeight: 23,
  },

  resumen: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },

  numero: {
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
  },

  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },

  info: {
    flex: 1,
  },

  nombre: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  detalle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },

  enlace: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 10,
  },

  flecha: {
    fontSize: 30,
    color: '#2563EB',
    marginLeft: 8,
  },

  cajaError: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 18,
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
