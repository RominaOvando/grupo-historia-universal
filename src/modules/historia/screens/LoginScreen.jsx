import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { login } from '../services/authService';
import { colors, typography, spacing } from '../../../config/theme';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Atención', 'Completa tu usuario y contraseña.');
      return;
    }

    try {
      setLoading(true);

      // 1. Conectar con el backend
      const data = await login(username.trim(), password);

      // 2. Comprobar el rol recibido
      const rol = data?.usuario?.rol?.trim()?.toUpperCase();

      console.log('LOGIN EXITOSO');
      console.log('ROL DEL USUARIO:', rol);

      if (!data?.token || !data?.usuario) {
        throw new Error('La respuesta del servidor está incompleta.');
      }

      if (rol !== 'ESTUDIANTE' && rol !== 'DOCENTE') {
        throw new Error('El rol del usuario no es válido.');
      }

      // 3. Guardar token y datos del usuario
      if (Platform.OS === 'web') {
        sessionStorage.setItem('virtu_token', data.token);
        sessionStorage.setItem('virtu_user', JSON.stringify(data.usuario));
      } else {
        await SecureStore.setItemAsync('virtu_token', data.token);

        await SecureStore.setItemAsync('virtu_user', JSON.stringify(data.usuario));
      }

      // 4. Determinar la pantalla según el rol
      let pantalla;

      if (rol === 'ESTUDIANTE') {
        pantalla = 'Estudiante';
      } else {
        pantalla = 'Docente';
      }

      console.log('PANTALLA DE DESTINO:', pantalla);

      // 5. Redirigir al usuario
      navigation.replace(pantalla);
    } catch (error) {
      console.error('ERROR EN EL LOGIN:', error);

      Alert.alert(
        'Error al iniciar sesión',
        error.message || 'Verifica tus datos e intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>VIRTU</Text>

        <Text style={styles.title}>Bienvenido</Text>

        <Text style={styles.description}>Ingresa tus datos para continuar aprendiendo.</Text>

        <Text style={styles.label}>Usuario</Text>

        <TextInput
          style={styles.input}
          placeholder="Escribe tu usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>Contraseña</Text>

        <TextInput
          style={styles.input}
          placeholder="Escribe tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },

  description: {
    fontSize: typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  label: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.body,
    backgroundColor: '#FFFFFF',
  },

  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
});
