import { View, Text, StyleSheet } from 'react-native'
import { NINER_GREEN, WHITE } from '../../lib/theme'

export default function ScheduleScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Schedule</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NINER_GREEN, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, color: WHITE, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#A49665', marginBottom: 32, textAlign: 'center' },
})