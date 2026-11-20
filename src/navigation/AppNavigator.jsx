import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../modules/historia/screens/LoginScreen';

import { HistoriaHomeScreen } from '../modules/historia';

import LeccionDetalleScreen from '../modules/historia/screens/LeccionDetalleScreen';

const Stack = createNativeStackNavigator();

// Pantalla provisional del docente
function DocenteHomeScreen() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>
        Panel del Docente
      </Text>

      <Text style={styles.descripcion}>
        Bienvenido a VIRTU.
        Aquí podrás administrar tus cursos.
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Iniciar sesión',
        }}
      />

      <Stack.Screen
        name="Estudiante"
        component={HistoriaHomeScreen}
        options={{
          title: 'Historia Universal',
        }}
      />

      <Stack.Screen
        name="DetalleLeccion"
        component={LeccionDetalleScreen}
        options={{
          title: 'Detalle de la lección',
        }}
      />

      <Stack.Screen
        name="Docente"
        component={DocenteHomeScreen}
        options={{
          title: 'Panel del Docente',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  descripcion: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    color: '#64748B',
  },
});