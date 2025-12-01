import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    location: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation functions - same as Register
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

  // Real-time validation handlers
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

  // Address functions - same as Register
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
    setSelectedLocation(null);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (query.length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

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

      if (suggestion.lat && suggestion.lon) {
        latitude = suggestion.lat.toString();
        longitude = suggestion.lon.toString();
      } else if (suggestion.place_id) {
        const coordinates = await fetchCoordinatesFromPlaceId(suggestion.place_id);
        if (coordinates) {
          latitude = coordinates.lat.toString();
          longitude = coordinates.lng.toString();
        }
      }

      const locationData = {
        displayName: suggestion.display_name,
        latitude: latitude,
        longitude: longitude,
      };
      
      setSelectedLocation(locationData);
      
      console.log("📍 Selected Location Data:");
      console.log("Display Name:", suggestion.display_name);
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("==========================================");
      
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
      const locationData = {
        displayName: suggestion.display_name,
        latitude: "",
        longitude: "",
      };
      setSelectedLocation(locationData);
    }
  };

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

  // Get current location - same as Register
  const handleGetLocation = async () => {
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
        
        const locationData = {
          displayName: fullAddress,
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString(),
          addressDetails: place,
          city: place.city || "Chennai"
        };
        
        setSelectedLocation(locationData);
        
        // Clear location error if any
        setErrors(prev => ({ ...prev, location: '' }));
        
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

  // Render suggestions
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

  // Fetch profile data
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const id = await getUserId();
      console.log('User ID from context:', id);
      
      if (id) {
        setUserId(id);
        // Try to get profile using the same ID format as Register
        const response = await api.get(`profile_fetch.php?id=${id}`);
        
        if (response.data) {
          console.log('📡 Profile fetch response:', response.data);
          
          if (response.data.success === 1) {
            const profile = response.data;
            setName(profile.name || '');
            setMobile(profile.mobile || '');
            setEmail(profile.email || '');
            setAddress(profile.location || '');
            
            // Initialize selectedLocation if we have location data
            if (profile.location) {
              setSelectedLocation({
                displayName: profile.location,
                latitude: profile.gst_lattitude || "",
                longitude: profile.gst_longitude || "",
                city: profile.city || "Chennai"
              });
            }
          } else {
            Alert.alert('Error', response.data.message || 'Failed to load profile.');
          }
        } else {
          Alert.alert('Error', 'No response from server.');
        }
      } else {
        Alert.alert('Error', 'User ID not found.');
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      Alert.alert('Error', 'Could not fetch profile. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [getUserId]);

  // Form validation
  useEffect(() => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const addressError = validateAddress(address);
    
    setErrors({
      name: nameError,
      email: emailError,
      location: addressError
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

  // Helper function to try GET method
  const tryGetMethod = async (requestData) => {
    try {
      // Try with GET method (your original working approach)
      // Remove userId and use cus_id for GET
      const getData = {
        ...requestData,
        cus_id: requestData.userId
      };
      delete getData.userId;
      delete getData.type; // Remove type for GET if not needed
      
      // Build query string
      const queryParams = new URLSearchParams();
      for (const key in getData) {
        if (getData[key] !== undefined && getData[key] !== null && getData[key] !== '') {
          queryParams.append(key, getData[key]);
        }
      }
      
      const url = `profile_update.php?${queryParams.toString()}`;
      console.log('📡 Trying GET request to:', url);
      
      const response = await api.get(url);
      console.log('✅ GET Update response:', response.data);
      
      // Debug: log all response fields
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      if (response.data) {
        console.log('Success field:', response.data.success);
        console.log('Result field:', response.data.result);
        console.log('Message field:', response.data.message);
        console.log('Text field:', response.data.text);
      }
      
      if (response.data && 
          (response.data.success === 1 || 
           response.data.result === "success" || 
           response.data.message === 'Successfully' ||
           response.data.text === 'success' ||
           response.data === 'Successfully')) {
        Alert.alert('Success', 'Profile updated successfully!');
        fetchProfile();
      } else {
        console.error('GET Update failed:', response.data);
        Alert.alert('Update Failed', response.data?.message || 'Please try again later.');
      }
    } catch (getError) {
      console.error('GET method also failed:', getError);
      Alert.alert('Update Failed', 'Please check your connection and try again.');
    }
  };

  const validateForm = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const addressError = validateAddress(address);

    setErrors({
      name: nameError,
      email: emailError,
      location: addressError
    });

    return !nameError && !emailError && !addressError;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in the correct format.');
      return;
    }

    setIsLoading(true);
    try {
      // Get current location if not already available
      let latitude = "";
      let longitude = "";
      let city = "Chennai";
      
      if (selectedLocation?.latitude && selectedLocation?.longitude) {
        latitude = selectedLocation.latitude;
        longitude = selectedLocation.longitude;
        city = selectedLocation.city || "Chennai";
      } else {
        // Get current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          latitude = currentLocation.coords.latitude.toString();
          longitude = currentLocation.coords.longitude.toString();
          
          const geocode = await Location.reverseGeocodeAsync({ 
            latitude: currentLocation.coords.latitude, 
            longitude: currentLocation.coords.longitude 
          });
          
          if (geocode.length > 0) {
            city = geocode[0]?.city || "Chennai";
          }
        }
      }

      // ✅ FIXED: Use EXACT parameter names that the server expects
      // Based on your Register component which works
      const requestData = {
        mobile: mobile || "", // Include mobile if available
        name: name.trim(),
        email: email.trim().toLowerCase(),
        type: '1', // Same as Register
        userId: userId, // This is "id" in your session
        location: address.trim(), // Full address
        city: city, // City name
        gst_lattitude: latitude || "13.0827", // Default to Chennai coordinates if empty
        gst_longitude: longitude || "80.2707"
      };

      console.log('📡 Profile Update Data:', JSON.stringify(requestData, null, 2));

      // Try GET method first (since your original was GET)
      await tryGetMethod(requestData);
      
    } catch (error) {
      console.error('❌ Update error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 
        error.message ||
        'Something went wrong. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
            
            {/* Location Input with Address Autocomplete */}
            <View style={styles.inputWrapper}>
              <View style={[
                styles.inputContainer, 
                errors.location && styles.inputError
              ]}>
                <Ionicons name="location-outline" size={20} color="#8B4513" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Start typing your address..."
                  value={address}
                  onChangeText={handleAddressSearch}
                  onBlur={() => setErrors(prev => ({ ...prev, location: validateAddress(address) }))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                  maxLength={200}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                {address && (
                  <TouchableOpacity
                    onPress={() => {
                      setAddress('');
                      setSelectedLocation(null);
                      setShowSuggestions(false);
                      setSuggestions([]);
                    }}
                    style={{ padding: 5 }}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              
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
              {/* {(!selectedLocation?.latitude && address.length > 0) && (
                <View style={styles.locationWarning}>
                  <Ionicons name="information-circle-outline" size={16} color="#1e90ff" />
                  <Text style={styles.locationWarningText}>
                    Will use current location coordinates when updating
                  </Text>
                </View>
              )} */}
              
              {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
            </View>

            {/* Address Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView 
                  style={styles.suggestionsList}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  maxHeight={150}
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

            <TouchableOpacity onPress={handleGetLocation} style={styles.locationButton} disabled={locationLoading}>
              {locationLoading ? (
                <ActivityIndicator size="small" color="#8B4513" />
              ) : (
                <>
                  <Ionicons name="navigate-circle" size={20} color="#8B4513" />
                  <Text style={styles.locationButtonText}>Use Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <LinearGradient
                colors={['#8B4513', '#A0522D', '#D2691E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.gradientButton,
                  (!isFormValid || isLoading) && { opacity: 0.6 }
                ]}
              >
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleUpdate} 
                  disabled={!isFormValid || isLoading}
                >
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
    </TouchableWithoutFeedback>
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
  // Suggestions Styles - Same as Register but adapted to Profile theme
  suggestionsContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 150,
    marginTop: -20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    borderBottomColor: '#F5F5F5',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#5D4037',
    marginLeft: 10,
  },
  noSuggestions: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -20,
    marginBottom: 20,
  },
  noSuggestionsText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  // Location status indicators
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F8EF',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  locationStatusText: {
    fontSize: 12,
    color: '#29CB56',
    marginLeft: 5,
    fontWeight: '500',
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  locationWarningText: {
    fontSize: 12,
    color: '#1e90ff',
    marginLeft: 5,
    fontWeight: '500',
  },
});