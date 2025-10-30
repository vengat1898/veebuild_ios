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
import { SessionContext } from '../../context/SessionContext.jsx';
import api from "../services/api.jsx";

export default function EnquiryRealHire() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session, isSessionLoaded, clearSession } = useContext(SessionContext);

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

  // Check if user is a guest (no proper mobile number)
  const isGuestUser = !session || 
                     !session.mobile || 
                     session.mobile === '' || 
                     session.id === 'guest_user' || 
                     session.type === 'guest';

  // Handle sign in for guest users - COMPLETE NAVIGATION RESET
  const handleSignIn = async () => {
    console.log("Sign in clicked from Enquiry Form");
    
    // Clear any guest session before navigating to login
    if (isGuestUser) {
      await clearSession();
    }
    
    // COMPLETE NAVIGATION RESET - This will clear the entire stack
    if (router.dismissAll) {
      router.dismissAll();
    }
    
    setTimeout(() => {
      router.replace({
        pathname: '/Login',
        params: { 
          fromEnquiry: 'true',
          returnParams: JSON.stringify(params) // Pass all params to return after login
        }
      });
    }, 100);
  };

  // Handle back navigation for guest users
  const handleBackPress = () => {
    // Complete reset to home
    if (router.dismissAll) {
      router.dismissAll();
    }
    setTimeout(() => {
      router.replace('/components/Home');
    }, 100);
  };

  useEffect(() => {
    if (isSessionLoaded && session && !isGuestUser) {
      setName(session.name || '');
      setMobile(session.mobile || '');
      setCity(session.city || professionalCity || '');
    }
  }, [isSessionLoaded, session, isGuestUser]);

  // Loading states
  if (!isSessionLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show login required screen for guest users
  if (isGuestUser) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#8B4513', '#A0522D', '#D2691E']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Enquiry Form</Text>
        </LinearGradient>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="log-in-outline" size={80} color="#8B4513" />
          </View>
          
          <Text style={styles.guestTitle}>Login Required</Text>
          
          <Text style={styles.guestMessage}>
            You need to be logged in to submit enquiries. Please sign in to access this feature.
          </Text>

          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <Ionicons name="log-in" size={20} color="white" style={styles.signInIcon} />
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButtonGuest}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>Go Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!v_id) return Alert.alert('Error', 'Vendor information is missing');
    if (!message) return Alert.alert('Error', 'Please enter your enquiry message');
    if (!session?.id) return Alert.alert('Error', 'User session not found. Please login again.');

    setIsSubmitting(true);
    
    const enquiryParams = {
      user_id: session.id,
      customer_id: customer_id || '',
      name: name.trim(),
      mobile: mobile.trim(),
      message: message.trim(),
      product_name: product_name || `${name} - ${city || 'No city specified'}`,
      vendor_id: v_id,
      city: city.trim() || 'Not specified',
      land_id: land_id || '',
      cat_id: cat_id || ''
    };

    try {
      const response = await api.get('land_enquery.php', {
        params: enquiryParams
      });

      if (response.data.success === 1 || response.data.result === 'success') {
        Alert.alert('Success', response.data.message || 'Enquiry submitted successfully', [
          { 
            text: 'OK', 
            onPress: () => {
              if (router.dismissAll) {
                router.dismissAll();
              }
              setTimeout(() => {
                router.replace('/components/Home');
              }, 100);
            }
          }
        ]);
      } else {
        Alert.alert('Failed', response.data.text || response.data.message || 'Something went wrong');
      }
    } catch (error) {
      let errorMessage = 'Submission failed. Please try again.';
      if (error.response) {
        errorMessage = error.response.data.text || error.response.data.message || errorMessage;
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
        <Text style={styles.headerText}>Enquiry Form</Text>
      </LinearGradient>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 60 : 80}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            editable={!!session?.name}
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your mobile number"
            placeholderTextColor="#999"
            value={mobile}
            keyboardType="phone-pad"
            onChangeText={setMobile}
            editable={false}
          />

          <Text style={styles.label}>Message*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your enquiry message (required)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Submit Enquiry</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: Platform.OS === 'ios' ? 130 : 120,
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: 10,
    marginTop: Platform.OS === 'ios' ? 35 : 30,
    padding: 4,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'ios' ? 35 : 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
    color: '#5D4037',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D7CCC8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
    color: '#5D4037',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#BCAAA4',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  // Guest user styles
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FAF0E6'
  },
  loadingText: {
    marginTop: 10,
    color: '#8B4513',
    fontSize: 16,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FAF0E6',
  },
  guestIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#D2B48C',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  guestMessage: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '80%',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  signInIcon: {
    marginRight: 10,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonGuest: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#8B4513',
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '500',
  },
});