
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Pantallas de Romina
import LoginScreen from '../modules/historia/screens/LoginScreen';

// Pantallas de Nataly
import { HistoriaHomeScreen } from '../modules/historia';
import LeccionDetalleScreen from '../modules/historia/screens/LeccionDetalleScreen';

// Pantallas de Brandon
import DocenteHomeScreen from '../modules/historia/screens/DocenteHomeScreen';
import EstudiantesCursoScreen from '../modules/historia/screens/EstudiantesCursoScreen';
import ProgresoEstudianteScreen from '../modules/historia/screens/ProgresoEstudianteScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Iniciar sesión',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="Estudiante"
        component={HistoriaHomeScreen}
        options={{
          title: 'Historia Universal',
          headerBackVisible: false,
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
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="EstudiantesCurso"
        component={EstudiantesCursoScreen}
        options={{
          title: 'Estudiantes del curso',
        }}
      />

      <Stack.Screen
        name="ProgresoEstudiante"
        component={ProgresoEstudianteScreen}
        options={{
          title: 'Progreso académico',
        }}
      />
    </Stack.Navigator>
  );
}
