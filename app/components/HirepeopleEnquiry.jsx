import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function HirepeopleEnquiry() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session, isSessionLoaded } = useContext(SessionContext);

  const { 
    cat_id, 
    land_id, 
    v_id, 
    product_name, 
    city: professionalCity,
    customer_id,
    user_id
  } = params;

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [city, setCity] = useState('');

  useEffect(() => {
    if (isSessionLoaded && session) {
      setName(session.name || '');
      setMobile(session.mobile || '');
      setCity(session.city || professionalCity || '');
    }
  }, [isSessionLoaded, session]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!product_name) return Alert.alert('Error', 'Professional information is missing');
    if (!city) return Alert.alert('Error', 'Please enter your city');
    if (!session?.id) return Alert.alert('Error', 'User session not found. Please login again.');

    setIsSubmitting(true);

    const enquiryParams = {
      user_id: session.id,
      customer_id: customer_id || '',
      name: name.trim(),
      mobile: mobile.trim(),
      message: message.trim(),
      product_name: product_name.trim(),
      vendor_id: v_id || land_id || '',
      city: city.trim(),
      cat_id: cat_id || ''
    };

    try {
      const response = await api.get('professional_enquery.php', {
        params: enquiryParams
      });

      if (response.data.success === 1) {
        Alert.alert('Success', 'Enquiry submitted successfully', [
          { 
            text: 'OK', 
            onPress: () => router.push({
              pathname: '/components/Home',
              params: {
                id: land_id || v_id,
                title: product_name,
                cat_id,
                v_id,
                user_id: session.id,
                customer_id
              }
            })
          }
        ]);
      } else {
        Alert.alert('Failed', response.data.text || 'Something went wrong');
      }
    } catch (error) {
      let errorMessage = 'Submission failed. Please try again.';
      if (error.response) {
        errorMessage = error.response.data.text || errorMessage;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#D2691E']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Send Enquiry</Text>
        </View>
      </LinearGradient>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 60 : 80} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              editable={!session?.name}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              placeholderTextColor="#999"
              value={mobile}
              keyboardType="phone-pad"
              onChangeText={setMobile}
              editable={!session?.mobile}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Enter your enquiry message"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitText}>Submit Enquiry</Text>
                <Ionicons name="send" size={16} color="white" style={styles.buttonIcon} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: Platform.OS === 'ios' ? 160 : 140,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 15,
    color: '#5D4037',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#D7CCC8',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#5D4037',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#8B4513',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#A0522D',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.8,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});