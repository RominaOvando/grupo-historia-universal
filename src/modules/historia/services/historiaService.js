import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '../../../config/apiConfig';

// Obtener el token que guardó el login de Romina
async function obtenerToken() {
  if (Platform.OS === 'web') {
    return sessionStorage.getItem('virtu_token');
  }

  return await SecureStore.getItemAsync('virtu_token');
}

// Función para consultar la API
async function consultarAPI(ruta) {
  const token = await obtenerToken();

  if (!token) {
    throw new Error('No se encontró una sesión. Inicia sesión nuevamente.');
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
      resultado.message || 'Ocurrió un error al consultar el servidor.'
    );
  }

  return resultado.data ?? resultado;
}

// Obtener los contenidos de Historia Universal
export async function obtenerContenidosHistoria() {
  return await consultarAPI('/contenidos/historia');
}

// Obtener el detalle de una lección
export async function obtenerDetalleLeccion(id) {
  return await consultarAPI(`/lecciones/${encodeURIComponent(id)}`);
}