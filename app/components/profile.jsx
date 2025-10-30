import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
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
  View
} from 'react-native';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function Profile() {
  const router = useRouter();
  const { getUserId } = useContext(SessionContext);

  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    location: ''
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const id = await getUserId();
      if (id) {
        setUserId(id);
        const response = await api.get(`profile_fetch.php?id=${id}`);
        if (response.data.success === 1) {
          const profile = response.data;
          setName(profile.name);
          setMobile(profile.mobile);
          setEmail(profile.email);
          setLocation(profile.location);
        } else {
          Alert.alert('Error', 'Failed to load profile.');
        }
      } else {
        Alert.alert('Error', 'User ID not found.');
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      Alert.alert('Error', 'Could not fetch profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [getUserId]);

  // Name validation
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!name.trim()) {
      return 'Name is required';
    } else if (name.trim().length < 3) {
      return 'Name must be at least 3 characters long';
    } else if (name.trim().length > 50) {
      return 'Name must not exceed 50 characters';
    } else if (!nameRegex.test(name.trim())) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    } else if (email.length > 100) {
      return 'Email must not exceed 100 characters';
    }
    return '';
  };

  // Location validation
  const validateLocation = (location) => {
    if (!location.trim()) {
      return 'Location is required';
    } else if (location.trim().length < 5) {
      return 'Location must be at least 5 characters long';
    } else if (location.length > 200) {
      return 'Location must not exceed 200 characters';
    }
    return '';
  };

  // Real-time validation
  const handleNameChange = (text) => {
    setName(text);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: validateName(text) }));
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(text) }));
    }
  };

  const handleLocationChange = (text) => {
    setLocation(text);
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: validateLocation(text) }));
    }
  };

  const validateForm = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const locationError = validateLocation(location);

    setErrors({
      name: nameError,
      email: emailError,
      location: locationError
    });

    return !nameError && !emailError && !locationError;
  };

  const handleGetLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      let addressArray = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressArray.length > 0) {
        const address = addressArray[0];
        const formattedAddress = `${address.name || ''}, ${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.postalCode || ''}, ${address.country || ''}`;
        setLocation(formattedAddress);
        // Clear location error if any
        setErrors(prev => ({ ...prev, location: '' }));
      } else {
        Alert.alert('Error', 'Unable to fetch address from location.');
      }
    } catch (error) {
      console.error('Location Error:', error);
      Alert.alert('Error', 'Failed to get current location.');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in the correct format.');
      return;
    }

    setIsLoading(true);
    try {
      const url = `profile_update.php?name=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email.trim())}&location=${encodeURIComponent(location.trim())}&cus_id=${userId}`;
      console.log("=====pro uri",url)

      const response = await api.get(url);
      
      if (response.data.message === 'Successfully') {
        Alert.alert('Success', 'Profile updated successfully!');
        fetchProfile();
      } else {
        Alert.alert('Update Failed', response.data.message || 'Please try again.');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#8B4513', '#D2691E', '#A0522D']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="person-circle" size={28} color="white" />
          </View>
        </LinearGradient>

        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          {isLoading && <ActivityIndicator size="large" color="#8B4513" style={styles.loadingIndicator} />}
          
          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <View style={[
              styles.inputContainer, 
              errors.name && styles.inputError
            ]}>
              <Ionicons name="person-outline" size={20} color="#8B4513" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={handleNameChange}
                onBlur={() => setErrors(prev => ({ ...prev, name: validateName(name) }))}
                placeholderTextColor="#999"
                maxLength={50}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>
          
          {/* Mobile Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait-outline" size={20} color="#8B4513" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                editable={false}
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={[
              styles.inputContainer, 
              errors.email && styles.inputError
            ]}>
              <Ionicons name="mail-outline" size={20} color="#8B4513" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(email) }))}
                autoCapitalize="none"
                placeholderTextColor="#999"
                maxLength={100}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>
          
          {/* Location Input */}
          <View style={styles.inputWrapper}>
            <View style={[
              styles.inputContainer, 
              errors.location && styles.inputError
            ]}>
              <Ionicons name="location-outline" size={20} color="#8B4513" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Address"
                value={location}
                onChangeText={handleLocationChange}
                onBlur={() => setErrors(prev => ({ ...prev, location: validateLocation(location) }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#999"
                maxLength={200}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
          </View>

          <TouchableOpacity onPress={handleGetLocation} style={styles.locationButton}>
            <Ionicons name="navigate-circle" size={20} color="#8B4513" />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={['#8B4513', '#A0522D', '#D2691E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text style={styles.buttonText}>
                      Update Profile
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Add some extra space at the bottom for better scrolling */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerIcon: {
    padding: 4,
  },
  container: {
    padding: 25,
    backgroundColor: '#FFF8F0',
    flexGrow: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: '#5D4037',
    paddingVertical: 8,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#9E9E9E',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
    fontWeight: '500',
  },
  gradientButton: {
    borderRadius: 12,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    backgroundColor: '#F5E6D3',
    padding: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D7CCC8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationButtonText: {
    color: '#8B4513',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  bottomSpacer: {
    height: 50,
  },
});