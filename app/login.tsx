import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { useSupabase } from '../lib/supabase-context'
import { NINER_GREEN, GOLD, WHITE, SOFT_GRAY, NEAR_BLACK } from '../lib/theme'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [sent, setSent] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [signupEmail, setSignupEmail] = useState<string>('')
  const [signupPassword, setSignupPassword] = useState<string>('')

  const normalizedEmail = email.trim().toLowerCase()

  const { supabase } = useSupabase()

  // Validate email domain
  const validateEmail = (email: string) => {
    const trimmed = email.trim()
    if (!trimmed.endsWith('@charlotte.edu')) {
      return 'Email must end with @charlotte.edu (case-insensitive)'
    }
    return null
  }

  // Send OTP
  const sendOTP = async () => {
    if (!normalizedEmail.endsWith('@charlotte.edu')) {
      Alert.alert('Invalid Email', 'Email must end with @charlotte.edu')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail })
      if (error) throw error
      setSent(true)
      setResendTimer(30)
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send code')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const resendOTP = async () => {
    await sendOTP()
  }

  // Verify code and sign in
  const verifyCode = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: code,
        type: 'email',
      })
      if (error) throw error
      // Do NOT navigate manually here - the layout guard will handle the redirect
      // Fallback: if redirect doesn't fire within a second, navigate manually
      const checkRedirect = setTimeout(() => {
        router.replace('/(tabs)/map')
      }, 1000)
      // Clear timeout on unmount/rerender
      return () => clearTimeout(checkRedirect)
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle session already exists
  

  // Resend countdown using setTimeout (no leak!)
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  // Sign up new user
  const signup = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: signupEmail,
        type: 'signup',
      })
      if (error) throw error
      Alert.alert('Success', 'Account created! Please check your email for a verification link.')
      setShowSignup(false)
      setSignupEmail('')
      setSignupPassword('')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {sent ? (
        <View style={styles.codeScreen}>
          <Text style={styles.title}>Verification Code Sent</Text>
          <Text style={styles.subtitle}>
          A 6-digit code has been sent to {email.trim()}. Enter the code below.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            autoCapitalize="none"
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={verifyCode}>
            <Text style={styles.buttonText}>Verify Code</Text>
          </TouchableOpacity>
          <Text style={styles.resendText}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity onPress={sendOTP} disabled={!canResend || isLoading}>
            <Text style={[{ ...styles.resendLink, ...(!canResend && { opacity: 0.5 }) }]}>
              {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.welcomeScreen}>
          {showSignup ? (
            <View style={styles.signupScreen}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Niner Navigation</Text>
              <TextInput
                style={styles.input}
                placeholder="student@charlotte.edu"
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={signupPassword}
                onChangeText={setSignupPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={signup}>
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.link} onPress={() => setShowSignup(false)}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Niner Navigation</Text>
              <TextInput
                style={styles.input}
                placeholder="student@charlotte.edu"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.button} onPress={sendOTP} disabled={!canResend || isLoading}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Send 6-digit Code'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.link} onPress={() => setShowSignup(true)}>
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005035',
  },
  welcomeScreen: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A49665',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#A49665',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#005035',
    fontSize: 16,
    fontWeight: '600',
  },
  codeScreen: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resendText: {
    color: '#FFFFFF',
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  },
  resendLink: {},
  link: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkText: {
    color: '#A49665',
    fontSize: 14,
    textAlign: 'center',
  },
  signupScreen: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
})