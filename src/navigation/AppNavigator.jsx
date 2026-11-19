
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

import LoginScreen from '../modules/historia/screens/LoginScreen';
import { HistoriaHomeScreen } from '../modules/historia';

const Stack = createNativeStackNavigator();

function DocenteHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Docente</Text>
      <Text style={styles.description}>
        Bienvenido a VIRTU. Aquí podrás administrar tus cursos.
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
        options={{ title: 'Iniciar sesión' }}
      />

      <Stack.Screen
        name="Estudiante"
        component={HistoriaHomeScreen}
        options={{ title: 'Inicio del estudiante' }}
      />

      <Stack.Screen
        name="Docente"
        component={DocenteHomeScreen}
        options={{ title: 'Inicio del docente' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
