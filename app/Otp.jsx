import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import otpimg from '../assets/images/otp.png';
import { SessionContext } from '../context/SessionContext';
import api from "./services/api";

export default function Otp() {
  const router = useRouter();
  const { saveSession } = useContext(SessionContext);
  const { mobile: initialMobile, userId: initialUserId } = useLocalSearchParams();

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Resend timer
  const [resendTimer, setResendTimer] = useState(30); // start countdown immediately
  const timerRef = useRef(null);

  useEffect(() => {
    // Keyboard listener
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    // Start resend timer
    startResendTimer();

    return () => {
      showSub.remove();
      hideSub.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', '1');
      formData.append('otp', otpCode);
      formData.append('mobile', initialMobile);
      if (initialUserId) formData.append('userId', initialUserId);

      const response = await api.post('otp_verify.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000
      });

      if (response.data.success === 1) {
        const userData = {
          id: response.data.id ? response.data.id.toString() : '',
          mobile: initialMobile,
          type: '1',
          name: response.data.name || '',
          email: response.data.email || '',
          sec_mobile: response.data.sec_mobile || '',
          register_status: response.data.register_status || 0
        };
        await saveSession(userData);

        setTimeout(() => {
          if (userData.register_status === 1) {
            router.replace({ pathname: '/components/Home', params: userData });
          } else {
            router.replace({ pathname: '/Register', params: { userId: userData.id, mobile: userData.mobile } });
          }
        }, 100);
      } else {
        Alert.alert('Error', response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      const formData = new FormData();
      formData.append('type', '1');
      formData.append('mobile', initialMobile);

      const response = await api.post('login.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000
      });

      if (response.data.success == 1) {
        Alert.alert('Success', 'New OTP has been sent.');
        startResendTimer();
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('[RESEND ERROR]', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Image source={otpimg} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heading}>OTP Verification</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to {initialMobile}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                style={styles.otpBox}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!isLoading}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyText}>Verify</Text>}
          </TouchableOpacity>

          {!keyboardVisible && resendTimer === 0 && (
            <Text style={styles.resendText}>
              Haven't received OTP?{' '}
              <Text style={styles.resendLink} onPress={handleResendOtp}>
                Resend
              </Text>
            </Text>
          )}

          {!keyboardVisible && resendTimer > 0 && (
            <Text style={styles.resendText}>
              Resend available in {resendTimer}s
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 200, height: 200, marginBottom: 20 },
  heading: { fontSize: 24, color: '#1e90ff', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#1e90ff',
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  verifyButton: { backgroundColor: '#1e90ff', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 8, marginBottom: 20, width: '70%', alignItems: 'center', justifyContent: 'center' },
  verifyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendText: { fontSize: 14, color: '#666', marginTop: 10 },
  resendLink: { color: '#795805ff', fontWeight: '600' },
});