import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../../config/theme';

export function HistoriaHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historia Universal</Text>
      <Text style={styles.description}>Bienvenido al módulo de Historia de Virtu.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: typography.body,
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
});
