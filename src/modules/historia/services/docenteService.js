
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../../config/apiConfig';

// Recuperar el token guardado durante el inicio de sesión
async function obtenerToken() {
  if (Platform.OS === 'web') {
    return sessionStorage.getItem('virtu_token');
  }

  return SecureStore.getItemAsync('virtu_token');
}

// Consultar información del backend
async function consultarDocente(ruta) {
  const token = await obtenerToken();

  if (!token) {
    throw new Error('No hay una sesión activa. Inicia sesión nuevamente.');
  }

  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || 'No se pudo consultar la información.'
    );
  }

  return resultado.data ?? resultado;
}

// Consultar cursos asignados al docente
export async function obtenerCursosDocente() {
  return consultarDocente('/docente/cursos');
}

// Consultar estudiantes de un curso
export async function obtenerEstudiantesCurso(cursoId) {
  return consultarDocente(
    `/docente/cursos/${encodeURIComponent(cursoId)}/estudiantes`
  );
}

// Consultar avance del estudiante en una lección
export async function obtenerProgresoEstudiante(estudianteId, leccionId) {
  return consultarDocente(
    `/docente/estudiantes/${encodeURIComponent(estudianteId)}` +
      `/lecciones/${encodeURIComponent(leccionId)}`
  );
}
