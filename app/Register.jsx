import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import logoimg from '../assets/images/veebuilder.png';
import { SessionContext } from '../context/SessionContext';
import api from "./services/api";

export default function Register() {
  const router = useRouter();
  const { saveSession, session } = useContext(SessionContext);
  const params = useLocalSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Get mobile and userId from params or session
  const mobile = params.mobile || session?.mobile || '';
  const userId = params.userId || session?.id || '';

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 3) {
      return 'Name should be at least 3 characters long';
    }
    if (!/^[a-zA-Z\s]*$/.test(name.trim())) {
      return 'Name should contain only letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Validate form whenever name or email changes
  useEffect(() => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    
    setErrors({
      name: nameError,
      email: emailError
    });

    setIsFormValid(!nameError && !emailError && name.trim() && email.trim());
  }, [name, email]);

  // Function to handle location permissions and fetch location
  const getLocationPermission = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        console.log('Location fetched:', currentLocation);
      } else {
        Alert.alert(
          'Location Permission', 
          'Location access helps us serve you better. Please enable it in settings.'
        );
      }
    } catch (error) {
      console.error('Location Error:', error);
      Alert.alert('Error', 'Failed to get location. Using default values.');
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getLocationPermission();
  }, []);

  const handleRegister = async () => {
    // Final validation before submission
    const nameError = validateName(name);
    const emailError = validateEmail(email);

    if (nameError || emailError) {
      setErrors({
        name: nameError,
        email: emailError
      });
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please try the OTP process again.');
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        mobile,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        type: '1', // Assuming type 1 is for this user type
        userId: userId // Make sure to include userId in the request
      };

      // Add location data if available
      if (location) {
        const { latitude, longitude } = location.coords;
        requestData.gst_lattitude = latitude.toString();
        requestData.gst_longitude = longitude.toString();

        // Get address details from coordinates
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          requestData.city = geocode[0]?.city || 'Unknown City';
          requestData.location = [
            geocode[0]?.street,
            geocode[0]?.city,
            geocode[0]?.region,
            geocode[0]?.postalCode,
            geocode[0]?.country
          ].filter(Boolean).join(', ');
        }
      }

      console.log('Registration data:', requestData);

      // Using POST with FormData instead of GET with params
      const formData = new FormData();
      for (const key in requestData) {
        formData.append(key, requestData[key]);
      }

      const response = await api.post(
        'register.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = response.data;
      console.log('Registration response:', data);

      if (data.success === 1) {
        // Update session with complete user data
        await saveSession({
          ...session,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          id: userId, // Use the userId we already have
          location: requestData.location || 'Default Location',
          city: requestData.city || 'Default City'
        });

        router.replace({
          pathname: '/components/Home',
          params: { userId } // Pass userId to Home screen
        });
      } else {
        Alert.alert('Registration Failed', data.text || 'Please try again later.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 
        'Failed to register. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Image source={logoimg} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Complete Registration</Text>


            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <View style={styles.inputWrapper}>
              <FontAwesome name="user" size={20} color="#1e90ff" style={styles.icon} />
              <TextInput
                style={[
                  styles.input, 
                  errors.name && styles.inputError
                ]}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
            

            <View style={styles.inputWrapper}>
              <FontAwesome name="phone" size={20} color="#1e90ff" style={styles.icon} />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={mobile}
                editable={false}
              />
            </View>
             {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            <View style={styles.inputWrapper}>
              <FontAwesome name="envelope" size={20} color="#1e90ff" style={styles.icon} />
              <TextInput
                style={[
                  styles.input, 
                  errors.email && styles.inputError
                ]}
                placeholder="Email (e.g., example@gmail.com)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                maxLength={100}
              />
            </View>
            

            <TouchableOpacity 
              style={[
                styles.button, 
                (!isFormValid || isLoading) && styles.buttonDisabled
              ]} 
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            {locationLoading && (
              <View style={styles.locationStatus}>
                <ActivityIndicator size="small" color="#1e90ff" />
                <Text style={styles.locationText}>Getting your location...</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#795805ff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  disabledInput: {
    color: '#666',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  button: {
    height: 50,
    backgroundColor: '#795805ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationStatus: {
    marginTop: 10,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});