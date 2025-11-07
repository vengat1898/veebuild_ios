import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function Enquiry() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const catIdFromParams = params.cat_id;
  const vendorIdFromParams = params.vendor_id;
  const shopNameFromParams = params.shop_name;

  const { 
    getUserId, 
    getUserName, 
    getUserMobile, 
    isLoggedIn,
    isSessionLoaded 
  } = useContext(SessionContext);

  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [shopName, setShopName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCategoryName = async (catId) => {
    if (!catId) return;
    
    const categoryUrl = `cat_sec.php?cat_id=${catId}`;
    try {
      const response = await api.get(categoryUrl, { timeout: 10000 });
      console.log("cat response "+ response.data);
      
      if (response.data.result === 'Success' && response.data.storeList.length > 0) {
        setCategories(response.data.storeList[0].title);
      } else {
        setCategories('');
      }
    } catch (error) {
      console.error('Category fetch error:', error);
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!name.trim()) errors.push('Name is required');
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.trim())) errors.push('Valid 10-digit mobile number is required');
    if (!message.trim() || message.trim().length < 10) errors.push('Message must be at least 10 characters');
    if (!categories && !vendorId) errors.push('Either category or vendor information is required');
    return errors;
  };

  const submitEnquiry = async (enquiryParams) => {
    try {
      const response = await api({
        method: 'get',
        url: 'enquery.php',
        params: enquiryParams,
        timeout: 15000,
        headers: { 'Accept': 'application/json', 'User-Agent': 'VeeBuilds-Mobile-App' }
      });
      return response;
    } catch (error) {
      if (retryCount < 2 && (!error.response || error.response.status >= 500)) {
        setRetryCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return submitEnquiry(enquiryParams);
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!isSessionLoaded) return;

    const fetchUserData = async () => {
      try {
        if (!isLoggedIn()) {
          Alert.alert('Error', 'Please log in to continue.');
          router.back();
          return;
        }

        const id = await getUserId();
        const userName = await getUserName();
        const userMobile = await getUserMobile();

        if (!id) {
          Alert.alert('Error', 'User session not found. Please log in again.');
          router.back();
          return;
        }

        setUserId(id);
        if (userName) setName(userName);
        if (userMobile) setMobile(userMobile);

        try {
          const profileUrl = `profile_fetch.php?id=${id}`;
          const response = await api.get(profileUrl, { timeout: 10000 });
          if (response.data.success === 1) {
            const profile = response.data;
            setName(profile.name || userName || '');
            setMobile(profile.mobile || userMobile || '');
            setCity(profile.city || '');
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
        }

        if (vendorIdFromParams) {
          setVendorId(vendorIdFromParams);
          if (shopNameFromParams) setShopName(shopNameFromParams);
        }

        if (catIdFromParams) await fetchCategoryName(catIdFromParams);
      } catch (error) {
        console.error('User data fetch error:', error);
        Alert.alert('Error', 'Could not fetch user information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isSessionLoaded]);

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      Alert.alert('Validation Error', validationErrors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    setRetryCount(0);

    const enquiryParams = {
      user_id: userId,
      name: name.trim(),
      mobile: mobile.trim(),
      message: message.trim(),
      v_id: vendorId || catIdFromParams || '',
      inner_subid: 1,
      product_name: categories,
      city: city.trim(),
      shop_name: shopName || ''
    };

    try {
      const response = await submitEnquiry(enquiryParams);
      if (response.data.success === 1) {
        Alert.alert(
          'Success!', 
          response.data.api_message || 'Your enquiry has been submitted successfully.',
          [{ 
            text: 'OK', 
            onPress: () => {
              console.log('Navigating to: /componets/Home'); 
              // Redirect to home screen after successful submission
              router.replace('/components/Home');
              console.log('Navigating to00000: /componets/Home'); 
            }
          }]
        );
      } else {
        Alert.alert('Submission Failed', response.data.api_message || 'Unable to submit your enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Enquiry submission error:', error);
      let errorMessage = 'Unable to submit enquiry. Please try again.';
      if (error.code === 'ECONNABORTED') errorMessage = 'Request timed out. Please check your internet connection.';
      else if (error.response) {
        switch(error.response.status) {
          case 400: errorMessage = 'Invalid request data. Please check your information.'; break;
          case 401: errorMessage = 'Session expired. Please login again.'; break;
          case 404: errorMessage = 'Service not available. Please contact support.'; break;
          case 500: errorMessage = 'Server error. Please try again later.'; break;
        }
      } else if (error.request) errorMessage = 'No response from server. Please check your internet connection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isSessionLoaded) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient
        colors={['#8B4513', '#5C3317']}
        style={styles.header}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enquiry</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Mobile Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={[styles.input, styles.nonEditableInput]}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={mobile}
                editable={false}
              />
              <Text style={styles.helperText}>Mobile number cannot be changed</Text>
            </View>

            {/* Category Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category *</Text>
              <TextInput
                style={[styles.input, styles.nonEditableInput]}
                placeholder="Categories"
                value={categories}
                editable={false}
              />
            </View>

            {/* Message Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your detailed enquiry message (minimum 10 characters)"
                placeholderTextColor="#999"
                value={message}
                onChangeText={text => text.length <= 500 && setMessage(text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{message.length}/500 characters</Text>
            </View>

            {/* Submit Button */}
            <LinearGradient
              colors={['#8B4513', '#5C3317']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientButton, isSubmitting && styles.buttonDisabled]}
            >
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={[styles.buttonText, { marginLeft: 10 }]}>Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Submit Enquiry</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 20, 
    paddingHorizontal: 15, 
    paddingTop: 60,
  },
  backButton: { position: 'absolute', left: 15, top: 65, padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  scrollContainer: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  formContainer: { flex: 1, marginTop: 10 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#4B2E2E', marginBottom: 8 },
  input: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#C4A484', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    backgroundColor: '#f9f5f0', 
    fontSize: 16, 
    color: '#333' 
  },
  nonEditableInput: { backgroundColor: '#e8e1da', color: '#666' },
  textArea: { height: 120, paddingTop: 15 },
  helperText: { fontSize: 12, color: '#666', marginTop: 5, fontStyle: 'italic' },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 5 },
  gradientButton: { 
    borderRadius: 15, 
    marginTop: 25, 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 6, 
    elevation: 8 
  },
  buttonDisabled: { opacity: 0.6 },
  button: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
});
