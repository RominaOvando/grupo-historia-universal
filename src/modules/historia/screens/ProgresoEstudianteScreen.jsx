
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { obtenerContenidosHistoria } from '../services/historiaService';
import { obtenerProgresoEstudiante } from '../services/docenteService';

// Convertir diferentes respuestas del backend en listas
function convertirEnLista(datos, campos) {
  if (Array.isArray(datos)) return datos;

  if (!datos || typeof datos !== 'object') return [];

  for (const campo of campos) {
    if (Array.isArray(datos[campo])) {
      return datos[campo];
    }
  }

  if (datos.data && datos.data !== datos) {
    return convertirEnLista(datos.data, campos);
  }

  return [];
}

// Obtener las lecciones desde las unidades de Historia
function extraerLecciones(datos) {
  const unidades = convertirEnLista(datos, [
    'unidades',
    'contenidos',
    'items',
  ]);

  const resultado = [];

  for (const unidad of unidades) {
    const lecciones = convertirEnLista(unidad, [
      'lecciones',
      'contenidos',
    ]);

    for (const leccion of lecciones) {
      if (!leccion || typeof leccion !== 'object') continue;

      const id =
        leccion.id ??
        leccion.leccionId ??
        leccion.id_leccion;

      if (id == null) continue;

      const nombre =
        leccion.titulo ||
        leccion.nombre ||
        leccion.nombreLeccion ||
        `Lección ${id}`;

      if (
        !resultado.some(
          (item) => String(item.id) === String(id)
        )
      ) {
        resultado.push({
          id,
          nombre: String(nombre),
        });
      }
    }
  }

  return resultado;
}

// Obtener un campo del backend
function obtenerDato(datos, campos) {
  if (!datos || typeof datos !== 'object') {
    return undefined;
  }

  // Primero buscar en la respuesta principal
  for (const campo of campos) {
    if (
      datos[campo] !== undefined &&
      datos[campo] !== null
    ) {
      return datos[campo];
    }
  }

  // Después buscar en posibles objetos internos
  for (const contenedor of [
    'progreso',
    'seguimiento',
    'avance',
    'resultado',
    'leccion',
    'data',
  ]) {
    const interno = datos[contenedor];

    if (
      interno &&
      interno !== datos &&
      typeof interno === 'object' &&
      !Array.isArray(interno)
    ) {
      const valor = obtenerDato(interno, campos);

      if (valor !== undefined) {
        return valor;
      }
    }
  }

  return undefined;
}

// Mostrar los datos en un formato entendible
function formatear(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return 'No informado';
  }

  if (typeof valor === 'boolean') {
    return valor ? 'Sí' : 'No';
  }

  if (typeof valor === 'object') {
    return 'Información adicional registrada';
  }

  return String(valor);
}

// Convertir el estado de aprendizaje en texto legible
function formatearEstado(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return 'No informado';
  }

  if (typeof valor === 'boolean') {
    return valor ? 'Estudiada' : 'Pendiente';
  }

  const estado = String(valor).trim().toUpperCase();

  if (
    estado === 'ESTUDIADO' ||
    estado === 'ESTUDIADA' ||
    estado === 'COMPLETADO' ||
    estado === 'COMPLETADA'
  ) {
    return 'Estudiada';
  }

  if (
    estado === 'PENDIENTE' ||
    estado === 'NO_ESTUDIADO' ||
    estado === 'NO_ESTUDIADA'
  ) {
    return 'Pendiente';
  }

  return String(valor);
}

// Mostrar intentos cuando el backend los devuelve
function formatearIntentos(valor) {
  if (valor === undefined || valor === null) {
    return 'No informado';
  }

  if (Array.isArray(valor)) {
    return `${valor.length} intentos registrados`;
  }

  if (typeof valor === 'number') {
    return `${valor} intentos registrados`;
  }

  if (typeof valor === 'object') {
    const cantidad =
      valor.total ??
      valor.cantidad ??
      valor.totalIntentos;

    if (cantidad !== undefined) {
      return `${cantidad} intentos registrados`;
    }

    return 'Existen datos de intentos disponibles';
  }

  return String(valor);
}

export default function ProgresoEstudianteScreen({ route }) {
  const { estudianteId, estudianteNombre } = route.params;

  const [lecciones, setLecciones] = useState([]);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);

  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const [cargandoLecciones, setCargandoLecciones] = useState(true);
  const [cargandoProgreso, setCargandoProgreso] = useState(false);

  const [errorLecciones, setErrorLecciones] = useState('');
  const [errorProgreso, setErrorProgreso] = useState('');

  const [resultado, setResultado] = useState(null);
  const [consultado, setConsultado] = useState(false);

  // Consultar lecciones disponibles de Historia Universal
  const cargarLecciones = useCallback(async () => {
    try {
      setCargandoLecciones(true);
      setErrorLecciones('');

      const datos = await obtenerContenidosHistoria();
      const lista = extraerLecciones(datos);

      setLecciones(lista);

      if (lista.length > 0) {
        setLeccionSeleccionada(
          (anterior) =>
            lista.find(
              (item) =>
                String(item.id) === String(anterior?.id)
            ) || lista[0]
        );
      } else {
        setLeccionSeleccionada(null);
      }
    } catch (error) {
      setErrorLecciones(
        error.message ||
          'No se pudieron cargar las lecciones.'
      );
    } finally {
      setCargandoLecciones(false);
    }
  }, []);

  useEffect(() => {
    cargarLecciones();
  }, [cargarLecciones]);

  // Seleccionar una lección
  const seleccionarLeccion = (leccion) => {
    setLeccionSeleccionada(leccion);
    setMostrarOpciones(false);

    setResultado(null);
    setConsultado(false);
    setErrorProgreso('');
  };

  // Consultar el seguimiento académico
  const consultarProgreso = async () => {
    if (!leccionSeleccionada) {
      setErrorProgreso('Primero selecciona una lección.');
      return;
    }

    try {
      setCargandoProgreso(true);
      setErrorProgreso('');
      setResultado(null);
      setConsultado(false);

      const datos = await obtenerProgresoEstudiante(
        estudianteId,
        leccionSeleccionada.id
      );

      // Diagnóstico: solo nombres de campos
      console.log(
        'CAMPOS DEL SEGUIMIENTO:',
        datos && typeof datos === 'object'
          ? Object.keys(datos)
          : []
      );

      setResultado(datos);
      setConsultado(true);
    } catch (error) {
      setErrorProgreso(
        error.message ||
          'No se pudo consultar el seguimiento.'
      );
    } finally {
      setCargandoProgreso(false);
    }
  };

  // CAMPOS REALES IDENTIFICADOS EN EL BACKEND
  const estadoLeccion = obtenerDato(resultado, [
    'estadoLeccion',
    'estadoAprendizaje',
    'estadoEstudio',
    'estado',
    'estudiado',
    'completado',
  ]);

  const tieneCuestionario = obtenerDato(resultado, [
    'tieneCuestionario',
  ]);

  const intentosRealizados = obtenerDato(resultado, [
    'intentosRealizados',
  ]);

  const mensaje = obtenerDato(resultado, [
    'mensaje',
  ]);

  // Campos adicionales, si el servidor los proporciona
  const porcentaje = obtenerDato(resultado, [
    'porcentajeAvance',
    'porcentaje',
    'progresoPorcentaje',
  ]);

  const calificacion = obtenerDato(resultado, [
    'calificacion',
    'nota',
    'puntaje',
  ]);

  const dificultad = obtenerDato(resultado, [
    'dificultad',
    'nivelDificultad',
    'temaDificultad',
  ]);

  let porcentajeTexto = null;

  if (porcentaje !== undefined) {
    if (
      typeof porcentaje === 'number' ||
      /^\d+(\.\d+)?$/.test(String(porcentaje))
    ) {
      porcentajeTexto = `${porcentaje}%`;
    } else {
      porcentajeTexto = formatear(porcentaje);
    }
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      {/* ENCABEZADO */}
      <View style={styles.encabezado}>
        <Text style={styles.etiqueta}>
          VIRTU · HISTORIA UNIVERSAL
        </Text>

        <Text style={styles.titulo}>
          Seguimiento académico
        </Text>

        <Text style={styles.subtitulo}>
          Consulta el aprendizaje de tus estudiantes.
        </Text>
      </View>

      {/* ESTUDIANTE SELECCIONADO */}
      <View style={styles.tarjeta}>
        <Text style={styles.etiquetaSeccion}>
          ESTUDIANTE SELECCIONADO
        </Text>

        <View style={styles.filaEstudiante}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {String(estudianteNombre || 'E')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoEstudiante}>
            <Text style={styles.nombreEstudiante}>
              {estudianteNombre || 'Estudiante'}
            </Text>

            <Text style={styles.descripcion}>
              Historia Universal
            </Text>
          </View>
        </View>
      </View>

      {/* SELECCIÓN DE LECCIONES */}
      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>
          Seleccionar lección
        </Text>

        <Text style={styles.descripcion}>
          Elige el tema que deseas revisar.
          No necesitas escribir su número.
        </Text>

        {cargandoLecciones ? (
          <View style={styles.cargando}>
            <ActivityIndicator color="#2563EB" />

            <Text style={styles.descripcion}>
              Cargando lecciones...
            </Text>
          </View>
        ) : (
          <>
            {!!errorLecciones && (
              <Text style={styles.errorTexto}>
                {errorLecciones}
              </Text>
            )}

            {lecciones.length > 0 ? (
              <>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() =>
                    setMostrarOpciones(!mostrarOpciones)
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Seleccionar lección"
                >
                  <Text style={styles.selectorTexto}>
                    {leccionSeleccionada?.nombre ||
                      'Selecciona una lección'}
                  </Text>

                  <Text style={styles.flecha}>
                    {mostrarOpciones ? '⌃' : '⌄'}
                  </Text>
                </TouchableOpacity>

                {mostrarOpciones && (
                  <View style={styles.listaOpciones}>
                    {lecciones.map((leccion) => (
                      <TouchableOpacity
                        key={String(leccion.id)}
                        style={styles.opcion}
                        onPress={() =>
                          seleccionarLeccion(leccion)
                        }
                      >
                        <Text style={styles.opcionTexto}>
                          {leccion.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.botonPrincipal,
                    cargandoProgreso &&
                      styles.botonDesactivado,
                  ]}
                  onPress={consultarProgreso}
                  disabled={cargandoProgreso}
                >
                  <Text style={styles.botonTexto}>
                    {cargandoProgreso
                      ? 'Consultando progreso...'
                      : 'Ver progreso del estudiante'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.descripcion}>
                No hay lecciones disponibles.
              </Text>
            )}

            {(errorLecciones || lecciones.length === 0) && (
              <TouchableOpacity
                style={styles.botonSecundario}
                onPress={cargarLecciones}
              >
                <Text style={styles.botonSecundarioTexto}>
                  Volver a cargar las lecciones
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* ERROR */}
      {!!errorProgreso && (
        <View style={styles.cajaError}>
          <Text style={styles.errorTitulo}>
            No se pudo consultar el seguimiento
          </Text>

          <Text style={styles.errorTexto}>
            {errorProgreso}
          </Text>

          <TouchableOpacity
            style={styles.botonPrincipal}
            onPress={consultarProgreso}
          >
            <Text style={styles.botonTexto}>
              Intentar nuevamente
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RESULTADO DEL SEGUIMIENTO */}
      {consultado && (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>
            Resultado del seguimiento
          </Text>

          <Text style={styles.descripcion}>
            Información registrada en VIRTU para este estudiante.
          </Text>

          {/* NOMBRE DE LA LECCIÓN */}
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>
              Lección consultada
            </Text>

            <Text style={styles.datoValor}>
              {leccionSeleccionada?.nombre}
            </Text>
          </View>

          {/* ESTADO REAL DE APRENDIZAJE */}
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>
              Estado de aprendizaje
            </Text>

            <Text style={styles.valorDestacado}>
              {formatearEstado(estadoLeccion)}
            </Text>
          </View>

          {/* CUESTIONARIO */}
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>
              ¿La lección tiene cuestionario?
            </Text>

            <Text style={styles.datoValor}>
              {tieneCuestionario === undefined
                ? 'No informado'
                : tieneCuestionario === true
                  ? 'Sí, tiene cuestionario'
                  : tieneCuestionario === false
                    ? 'No tiene cuestionario'
                    : formatear(tieneCuestionario)}
            </Text>
          </View>

          {/* INTENTOS */}
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>
              Intentos realizados
            </Text>

            <Text style={styles.datoValor}>
              {formatearIntentos(intentosRealizados)}
            </Text>
          </View>

          {/* PORCENTAJE */}
          {porcentajeTexto !== null && (
            <View style={styles.dato}>
              <Text style={styles.datoEtiqueta}>
                Porcentaje de avance
              </Text>

              <Text style={styles.datoValor}>
                {porcentajeTexto}
              </Text>
            </View>
          )}

          {/* CALIFICACIÓN */}
          {calificacion !== undefined && (
            <View style={styles.dato}>
              <Text style={styles.datoEtiqueta}>
                Calificación registrada
              </Text>

              <Text style={styles.datoValor}>
                {formatear(calificacion)}
              </Text>
            </View>
          )}

          {/* DIFICULTAD */}
          {dificultad !== undefined && (
            <View style={styles.dato}>
              <Text style={styles.datoEtiqueta}>
                Dificultad registrada
              </Text>

              <Text style={styles.datoValor}>
                {formatear(dificultad)}
              </Text>
            </View>
          )}

          {/* MENSAJE DEL BACKEND */}
          {mensaje !== undefined &&
            typeof mensaje !== 'object' && (
              <View style={styles.aviso}>
                <Text style={styles.avisoTitulo}>
                  Información adicional
                </Text>

                <Text style={styles.avisoTexto}>
                  {formatear(mensaje)}
                </Text>
              </View>
            )}
        </View>
      )}

      {/* AYUDA */}
      {!consultado &&
        !cargandoProgreso &&
        !errorProgreso && (
          <View style={styles.tarjetaInformativa}>
            <Text style={styles.informacionTitulo}>
              ¿Cómo consultar el seguimiento?
            </Text>

            <Text style={styles.informacionTexto}>
              1. Verifica el nombre del estudiante.
              {'\n\n'}
              2. Selecciona una lección de Historia.
              {'\n\n'}
              3. Presiona "Ver progreso del estudiante".
              {'\n\n'}
              4. Revisa su estado y los intentos disponibles.
            </Text>
          </View>
        )}
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
    paddingBottom: 45,
  },

  encabezado: {
    backgroundColor: '#2051D4',
    borderRadius: 18,
    padding: 25,
    marginBottom: 20,
  },

  etiqueta: {
    fontSize: 12,
    color: '#DBEAFE',
    fontWeight: 'bold',
    marginBottom: 12,
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitulo: {
    fontSize: 15,
    color: '#DBEAFE',
    marginTop: 10,
    lineHeight: 23,
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    marginBottom: 18,
  },

  etiquetaSeccion: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  filaEstudiante: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarTexto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },

  infoEstudiante: {
    flex: 1,
  },

  nombreEstudiante: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#17233B',
  },

  seccionTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#17233B',
    marginBottom: 10,
  },

  descripcion: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginTop: 5,
  },

  cargando: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  selector: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectorTexto: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },

  flecha: {
    fontSize: 24,
    color: '#2563EB',
  },

  listaOpciones: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },

  opcion: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  opcionTexto: {
    color: '#334155',
    fontSize: 15,
  },

  botonPrincipal: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    marginTop: 18,
  },

  botonDesactivado: {
    opacity: 0.6,
  },

  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botonSecundario: {
    borderColor: '#2563EB',
    borderWidth: 1,
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  botonSecundarioTexto: {
    color: '#2563EB',
    fontWeight: 'bold',
  },

  dato: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 15,
  },

  datoEtiqueta: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  datoValor: {
    color: '#1E293B',
    fontSize: 17,
  },

  valorDestacado: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: 'bold',
  },

  aviso: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 18,
    marginTop: 20,
  },

  avisoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },

  avisoTexto: {
    color: '#1E40AF',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  cajaError: {
    backgroundColor: '#FEE2E2',
    borderRadius: 15,
    padding: 20,
    marginBottom: 18,
  },

  errorTitulo: {
    color: '#991B1B',
    fontSize: 17,
    fontWeight: 'bold',
  },

  errorTexto: {
    color: '#B91C1C',
    fontSize: 14,
    marginTop: 10,
  },

  tarjetaInformativa: {
    backgroundColor: '#DBEAFE',
    borderRadius: 15,
    padding: 22,
  },

  informacionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },

  informacionTexto: {
    color: '#1E40AF',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
});
