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
    console.log("🔐 Sign in clicked from Hire People Enquiry");
    console.log("📱 Current session:", JSON.stringify(session, null, 2));
    
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
          fromHireEnquiry: 'true',
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
    console.log("🔄 useEffect triggered - Session loaded:", isSessionLoaded);
    console.log("👤 Current session:", JSON.stringify(session, null, 2));
    console.log("🚫 Is guest user:", isGuestUser);
    
    if (isSessionLoaded && session && !isGuestUser) {
      console.log("✅ Setting user data from session");
      setName(session.name || '');
      setMobile(session.mobile || '');
      setCity(session.city || professionalCity || '');
      
      console.log("📝 Form data set:");
      console.log("   Name:", session.name || '');
      console.log("   Mobile:", session.mobile || '');
      console.log("   City:", session.city || professionalCity || '');
    }
  }, [isSessionLoaded, session, isGuestUser]);

  // Loading states
  if (!isSessionLoaded) {
    console.log("⏳ Showing loading state...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show login required screen for guest users
  if (isGuestUser) {
    console.log("👤 Showing guest user screen");
    console.log("📋 Params received:", JSON.stringify(params, null, 2));
    
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
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Send Enquiry</Text>
          </View>
        </LinearGradient>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="log-in-outline" size={80} color="#8B4513" />
          </View>
          
          <Text style={styles.guestTitle}>Login Required</Text>
          
          <Text style={styles.guestMessage}>
            You need to be logged in to submit professional enquiries. Please sign in to access this feature.
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
    console.log("🚀 Submit button clicked");
    console.log("📊 Current form state:");
    console.log("   Name:", name);
    console.log("   Mobile:", mobile);
    console.log("   Message:", message);
    console.log("   City:", city);
    console.log("   Product Name:", product_name);
    
    if (isSubmitting) {
      console.log("⏳ Already submitting, returning...");
      return;
    }
    
    if (!product_name) {
      console.log("❌ Product name missing");
      return Alert.alert('Error', 'Professional information is missing');
    }
    
    if (!city) {
      console.log("❌ City missing");
      return Alert.alert('Error', 'Please enter your city');
    }
    
    if (!session?.id) {
      console.log("❌ Session ID missing");
      return Alert.alert('Error', 'User session not found. Please login again.');
    }

    setIsSubmitting(true);
    console.log("🔄 Starting submission process...");

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

    console.log("📨 API Request Parameters:");
    console.log(JSON.stringify(enquiryParams, null, 2));

    try {
      console.log("🌐 Making API call to professional_enquery.php...");
      const response = await api.get('professional_enquery.php', {
        params: enquiryParams
      });

      console.log("✅ API Response Received:");
      console.log("📅 Date:", new Date().toISOString());
      console.log("📦 Full Response:", JSON.stringify(response, null, 2));
      console.log("📋 Response Data:", JSON.stringify(response.data, null, 2));
      console.log("🔢 Response Status:", response.status);
      console.log("📝 Response Status Text:", response.statusText);
      
      if (response.data.success === 1) {
        console.log("🎉 Enquiry submitted successfully!");
        Alert.alert('Success', 'Enquiry submitted successfully', [
          { 
            text: 'OK', 
            onPress: () => {
              console.log("🏠 Navigating to home after success...");
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
        console.log("❌ API returned failure:", response.data.text);
        Alert.alert('Failed', response.data.text || 'Something went wrong');
      }
    } catch (error) {
      console.log("💥 API Error Occurred:");
      console.log("📅 Date:", new Date().toISOString());
      console.log("🚨 Error Object:", JSON.stringify(error, null, 2));
      console.log("📝 Error Message:", error.message);
      
      let errorMessage = 'Submission failed. Please try again.';
      if (error.response) {
        console.log("📡 Error Response Data:", JSON.stringify(error.response.data, null, 2));
        console.log("🔢 Error Response Status:", error.response.status);
        errorMessage = error.response.data.text || errorMessage;
      } else if (error.request) {
        console.log("🌐 No response received - Network error");
        errorMessage = 'Network error. Please check your connection.';
      }
      
      console.log("📢 Showing alert with error:", errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      console.log("🏁 Submission process completed");
      setIsSubmitting(false);
    }
  };

  console.log("🎨 Rendering main enquiry form");
  console.log("📱 Form values - Name:", name, "Mobile:", mobile, "Message:", message, "City:", city);

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
              onChangeText={(text) => {
                console.log("✏️ Name changed to:", text);
                setName(text);
              }}
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
              onChangeText={(text) => {
                console.log("📱 Mobile changed to:", text);
                setMobile(text);
              }}
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
              onChangeText={(text) => {
                console.log("💬 Message changed to:", text);
                setMessage(text);
              }}
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