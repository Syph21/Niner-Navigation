import { View, Text, StyleSheet } from 'react-native'

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Niner Navigation</Text>
      <Text style={styles.subtitle}>UNC Charlotte Campus Navigation</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#005035',
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#A49665',
    marginBottom: 32,
  },
})