import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function Register() {
  const router = useRouter();
  const { saveSession, session } = useContext(SessionContext);
  const params = useLocalSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Get mobile and userId from params or session
  const mobile = params.mobile || session?.mobile || '';
  const userId = params.userId || session?.id || '';

  // ✅ Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    
    if (!name.trim()) {
      return 'Name is required';
    } else if (name.trim().length < 3) {
      return 'Name should be at least 3 characters long';
    } else if (name.trim().length > 50) {
      return 'Name must not exceed 50 characters';
    } else if (!nameRegex.test(name.trim())) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  };

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

  const validateAddress = (address) => {
    if (!address.trim()) {
      return 'Address is required';
    } else if (address.trim().length < 5) {
      return 'Please enter a complete address';
    }
    return '';
  };

  // ✅ Real-time validation handlers
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

  // ✅ EXACTLY THE SAME ADDRESS FUNCTIONS 
  const searchAddressSuggestions = async (query) => {
    try {
      setSearching(true);
      setShowSuggestions(true);

      const GOOGLE_API_KEY = "AIzaSyAr3P4anv6bZgHKOk6e1tW1qD7GFS2K7ro";
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&location=13.0827,80.2707&radius=50000&key=${GOOGLE_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.predictions.length > 0) {
        const formattedSuggestions = data.predictions.map((item, index) => ({
          id: item.id || `${item.place_id}-${index}`,
          display_name: item.description,
          place_id: item.place_id,
        }));
        
        setSuggestions(formattedSuggestions);
      } else {
        await fallbackSearchSuggestions(query);
      }
    } catch (error) {
      console.error("Google Places API error:", error);
      await fallbackSearchSuggestions(query);
    } finally {
      setSearching(false);
    }
  };

  const fallbackSearchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}, Chennai, Tamil Nadu, India&format=json&limit=5`,
        {
          headers: {
            'User-Agent': 'AGSK-Mobile-App/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const formattedSuggestions = data.map((item, index) => ({
          id: `${item.place_id}-${index}`,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));
        
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Fallback search error:", error);
      setSuggestions([]);
    }
  };

  const handleAddressSearch = (query) => {
    setAddress(query);
    setSelectedLocation(null); // Clear selected location when user types

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Don't search for very short queries
    if (query.length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // Set new timer for debouncing
    const newTimer = setTimeout(async () => {
      await searchAddressSuggestions(query);
    }, 500);

    setDebounceTimer(newTimer);
  };

  const handleSuggestionSelect = async (suggestion) => {
    setAddress(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    try {
      let latitude = "";
      let longitude = "";

      // If we have lat/lon directly from OpenStreetMap
      if (suggestion.lat && suggestion.lon) {
        latitude = suggestion.lat.toString();
        longitude = suggestion.lon.toString();
      } 
      // If it's from Google Places API, we need to fetch coordinates
      else if (suggestion.place_id) {
        const coordinates = await fetchCoordinatesFromPlaceId(suggestion.place_id);
        if (coordinates) {
          latitude = coordinates.lat.toString();
          longitude = coordinates.lng.toString();
        }
      }

      // Store the selected location data
      const locationData = {
        displayName: suggestion.display_name,
        latitude: latitude,
        longitude: longitude,
      };
      
      setSelectedLocation(locationData);
      
      // Console all the data with proper spacing
      console.log("📍 Selected Location Data:");
      console.log("Display Name:", suggestion.display_name);
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("==========================================");
      
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
      // Still set the location data even if coordinates fail
      const locationData = {
        displayName: suggestion.display_name,
        latitude: "",
        longitude: "",
      };
      setSelectedLocation(locationData);
    }
  };

  // ✅ New function to fetch coordinates from Google Place ID
  const fetchCoordinatesFromPlaceId = async (placeId) => {
    try {
      const GOOGLE_API_KEY = "AIzaSyAr3P4anv6bZgHKOk6e1tW1qD7GFS2K7ro";
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        return { lat, lng };
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error fetching coordinates from place ID:", error);
      return null;
    }
  };

  // ✅ Get current location - EXACTLY THE SAME AS NewCustomerRegister()
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to fetch address."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 5000,
        timeout: 5000,
      });

      const [place] = await Location.reverseGeocodeAsync(location.coords);
      if (place) {
        const addressParts = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.postalCode,
          place.country
        ].filter(Boolean);

        const fullAddress = addressParts.join(", ");
        setAddress(fullAddress);
        setShowSuggestions(false);
        setSuggestions([]);
        
        // Store the current location data
        const locationData = {
          displayName: fullAddress,
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString(),
          addressDetails: place,
          city: place.city || "Chennai"
        };
        
        setSelectedLocation(locationData);
        
        // Console all the data with proper spacing
        console.log("📍 Current Location Data:");
        console.log("Display Name:", fullAddress);
        console.log("City:", place.city);
        console.log("Latitude:", location.coords.latitude);
        console.log("Longitude:", location.coords.longitude);
        console.log("==========================================");
      } else {
        Alert.alert("Error", "Unable to fetch address from location");
      }
    } catch (error) {
      console.error("❌ Location Error:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLocationLoading(false);
    }
  };

  // ✅ Render suggestions without FlatList to avoid VirtualizedList nesting
  const renderSuggestions = () => {
    return suggestions.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.suggestionItem}
        onPress={() => handleSuggestionSelect(item)}
      >
        <Feather name="map-pin" size={16} color="#666" />
        <Text style={styles.suggestionText} numberOfLines={2}>
          {item.display_name}
        </Text>
      </TouchableOpacity>
    ));
  };

  // ✅ Validate form whenever name, email or address changes
  useEffect(() => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const addressError = validateAddress(address);
    
    setErrors({
      name: nameError,
      email: emailError,
      address: addressError
    });

    setIsFormValid(
      !nameError && 
      !emailError && 
      !addressError && 
      name.trim() && 
      email.trim() && 
      address.trim()
    );
  }, [name, email, address]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleRegister = async () => {
    // Final validation before submission
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const addressError = validateAddress(address);

    if (nameError || emailError || addressError) {
      setErrors({
        name: nameError,
        email: emailError,
        address: addressError
      });
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please try the OTP process again.');
      return;
    }

    setIsLoading(true);
    try {
      // Get current location if not already available
      let latitude = "";
      let longitude = "";
      let city = "Chennai"; // Default city
      
      if (selectedLocation?.latitude && selectedLocation?.longitude) {
        latitude = selectedLocation.latitude;
        longitude = selectedLocation.longitude;
        city = selectedLocation.city || "Chennai";
      } else {
        // Get current location
        setLocationLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          latitude = currentLocation.coords.latitude.toString();
          longitude = currentLocation.coords.longitude.toString();
          
          // Get city from coordinates
          const geocode = await Location.reverseGeocodeAsync({ 
            latitude: currentLocation.coords.latitude, 
            longitude: currentLocation.coords.longitude 
          });
          
          if (geocode.length > 0) {
            city = geocode[0]?.city || "Chennai";
          }
        }
        setLocationLoading(false);
      }

      // ✅ Match the EXACT same parameters as your working log
      const requestData = {
        mobile: mobile,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        type: '1',
        userId: userId,
        location: address.trim(), // Full address
        city: city, // City name
        gst_lattitude: latitude || "13.0827", // Default to Chennai coordinates if empty
        gst_longitude: longitude || "80.2707"
      };

      console.log('📡 Registration data:', JSON.stringify(requestData, null, 2));

      // Create FormData
      const formData = new FormData();
      for (const key in requestData) {
        formData.append(key, requestData[key]);
      }

      console.log('📡 Sending registration with FormData...');
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
      console.log('✅ Registration response:', data);

      if (data.success === 1 || data.result === "success") {
        // Update session with complete user data
        await saveSession({
          ...session,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          id: userId,
          city: requestData.city,
          gst_lattitude: requestData.gst_lattitude,
          gst_longitude: requestData.gst_longitude
        });

        router.replace({
          pathname: '/components/Home',
          params: { 
            userId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile,
            city: requestData.city,
            location: requestData.location
          }
        });
      } else {
        Alert.alert(
          'Registration Failed', 
          data.text || data.message || 'Please try again later.'
        );
      }
    } catch (error) {
      console.error('❌ Registration Error:', error);
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
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.container}>
            <Image source={logoimg} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Complete Registration</Text>

            {/* Name Input with Error */}
            <View style={styles.inputWrapper}>
              <FontAwesome name="user" size={20} color="#1e90ff" style={styles.icon} />
              <TextInput
                style={[
                  styles.input, 
                  errors.name && styles.inputError
                ]}
                placeholder="Full Name (letters only)"
                value={name}
                onChangeText={handleNameChange}
                onBlur={() => setErrors(prev => ({ ...prev, name: validateName(name) }))}
                autoCapitalize="words"
                maxLength={50}
                returnKeyType="next"
              />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            {/* Mobile Input */}
            <View style={styles.inputWrapper}>
              <FontAwesome name="phone" size={20} color="#1e90ff" style={styles.icon} />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={mobile}
                editable={false}
                placeholder="Mobile Number"
              />
            </View>

            {/* Email Input with Error */}
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
                onChangeText={handleEmailChange}
                onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(email) }))}
                maxLength={100}
                returnKeyType="next"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* ✅ Address Section */}
            <View style={styles.addressSection}>
              <Text style={styles.inputLabel}>Address *</Text>
              
              {/* Show coordinates if available */}
              {selectedLocation?.latitude && (
                <View style={styles.locationStatus}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#29CB56" />
                  <Text style={styles.locationStatusText}>
                    Coordinates ready: {selectedLocation.latitude}, {selectedLocation.longitude}
                  </Text>
                </View>
              )}

              {/* Show warning if no coordinates */}
              {(!selectedLocation?.latitude && address.length > 0) && (
                <View style={styles.locationWarning}>
                  <Ionicons name="information-circle-outline" size={16} color="#1e90ff" />
                  <Text style={styles.locationWarningText}>
                    Will use current location coordinates when registering
                  </Text>
                </View>
              )}

              <View style={styles.addressContainer}>
                <TextInput
                  style={[
                    styles.input, 
                    styles.addressInput, 
                    errors.address && styles.inputError,
                    showSuggestions && styles.inputWithSuggestions
                  ]}
                  placeholder="Start typing your address..."
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={handleAddressSearch}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                  onBlur={() => setErrors(prev => ({ ...prev, address: validateAddress(address) }))}
                />
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  style={styles.locationButton}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color="#1e90ff" />
                  ) : (
                    <Ionicons name="location-outline" size={22} color="#29CB56" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Address Suggestions - Using manual mapping instead of FlatList */}
              {showSuggestions && suggestions.length > 0 && (
                <View style={[
                  styles.suggestionsContainer,
                  suggestions.length > 3 && styles.suggestionsContainerLarge
                ]}>
                  <ScrollView 
                    style={styles.suggestionsList}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {renderSuggestions()}
                  </ScrollView>
                </View>
              )}

              {showSuggestions && suggestions.length === 0 && !searching && (
                <View style={styles.noSuggestions}>
                  <Text style={styles.noSuggestionsText}>
                    No addresses found. Try being more specific.
                  </Text>
                </View>
              )}
            </View>
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  disabledInput: {
    color: '#666',
    backgroundColor: '#f5f5f5',
  },
  inputError: {
    borderColor: '#ff0000',
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
  
  // ✅ EXACTLY THE SAME ADDRESS STYLES AS NewCustomerRegister
  addressSection: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInput: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  inputWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  locationButton: {
    marginLeft: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  
  // Location status indicators
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    padding: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  locationWarningText: {
    fontSize: 12,
    color: '#1e90ff',
    marginLeft: 5,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F8EF',
    padding: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  locationStatusText: {
    fontSize: 12,
    color: '#29CB56',
    marginLeft: 5,
  },
  
  // Suggestions Styles - Same as NewCustomerRegister
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  suggestionsContainerLarge: {
    maxHeight: 200,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  noSuggestions: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  noSuggestionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});