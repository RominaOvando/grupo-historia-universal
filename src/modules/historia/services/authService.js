import { API_BASE_URL } from '../../../config/apiConfig';

// Servicio para iniciar sesión en VIRTU
export async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al iniciar sesión');
    }

    if (!result.data?.token) {
      throw new Error('El servidor no devolvió un token');
    }

    return result.data;
  } catch (error) {
    throw new Error(error.message || 'No se pudo conectar con el servidor');
  }
}
