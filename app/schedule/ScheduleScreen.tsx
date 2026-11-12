import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import { useSupabase } from '../../lib/supabase-context'
import { NINER_GREEN, GOLD, WHITE, NEAR_BLACK } from '../../lib/theme'

export default function ScheduleScreen() {
  const { supabase } = useSupabase()
  const { user } = useStore()
  const [classes, setClasses] = useState([])
  const [newCourse, setNewCourse] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      ;(async () => {
        const { data, error } = await supabase.from('class_schedule').select('*').eq('user_id', user.id).maybeSingle()
        setClasses(data || [])
        setIsLoading(false)
      })()
    }
  }, [user?.id])

  const addClass = async () => {
    if (!newCourse) return Alert.alert('Error', 'Course code required')
    if (!user?.id) return
    setIsLoading(true)
    await supabase.from('class_schedule').insert({
      user_id: user.id, course_code: newCourse, days: 'MWF', start_time: '09:00', end_time: '10:00'
    })
    setClasses([...classes, { course_code: newCourse, days: 'MWF', start_time: '09:00', end_time: '10:00' }])
    setNewCourse('')
    setIsLoading(false)
  }

  if (isLoading && classes.length === 0) return (
    <ScrollView style={styles.container}><ActivityIndicator size="large" color={GOLD} /></ScrollView>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <Text style={styles.headerSubtitle}>Niner Navigation</Text>
      </View>
      <View style={styles.form}>
        <TextInput placeholder="Course code" value={newCourse} onChangeText={setNewCourse} style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={addClass}><Text style={styles.buttonText}>Add Class</Text></TouchableOpacity>
      </View>
      <View style={styles.list}><Text style={styles.listTitle}>Classes</Text>{classes.length === 0 ? (
        <Text style={styles.empty}>No classes yet</Text>
      ) : (
        classes.map((c) => (
          <View key={c.course_code} style={styles.item}><Text style={styles.course}>{c.course_code}</Text><Text style={styles.times}>{c.days} {c.start_time} - {c.end_time}</Text></View>
        ))
      )}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NINER_GREEN },
  content: { padding: 20 },
  header: { marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 28, color: WHITE, fontWeight: '600' },
  headerSubtitle: { color: GOLD, fontSize: 14, marginTop: 4 },
  form: { marginVertical: 20 },
  input: { width: '100%', height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, color: WHITE, fontSize: 16 },
  button: { width: '100%', height: 50, backgroundColor: GOLD, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: NINER_GREEN, fontSize: 16, fontWeight: '600' },
  list: { marginTop: 20 },
  listTitle: { fontSize: 18, color: GOLD, marginBottom: 12 },
  item: { backgroundColor: WHITE, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  course: { color: NINER_GREEN, fontSize: 16, fontWeight: '600' },
  times: { color: NEAR_BLACK, fontSize: 14 },
  empty: { color: '#888888', fontSize: 14, marginVertical: 8 },
})