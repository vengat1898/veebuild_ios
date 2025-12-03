import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import logoimg from '../assets/images/veebuilder.png';
import { SessionContext } from '../context/SessionContext';
import api from "./services/api";

const { width, height } = Dimensions.get('window');

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
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [tempSelectedLocation, setTempSelectedLocation] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Refs for input focus
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Get mobile and userId from params or session
  const mobile = params.mobile || session?.mobile || '';
  const userId = params.userId || session?.id || '';

  // ✅ Keyboard listeners for modal positioning
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // ✅ Auto-scroll when keyboard appears
  useEffect(() => {
    if (isKeyboardVisible && emailInputRef.current) {
      // Scroll to make email input visible
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 250, animated: true });
      }, 100);
    }
  }, [isKeyboardVisible]);

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

  // ✅ Real-time validation handlers with focus management
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

  // ✅ Focus next input
  const focusEmailInput = () => {
    emailInputRef.current?.focus();
  };

  // ✅ Open address modal (iOS style)
  const openAddressModal = () => {
    setTempAddress(address);
    setTempSelectedLocation(selectedLocation);
    setAddressModalVisible(true);
  };

  // ✅ Close address modal
  const closeAddressModal = () => {
    Keyboard.dismiss();
    setAddressModalVisible(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // ✅ Save address from modal
  const saveAddressFromModal = () => {
    if (tempSelectedLocation) {
      setAddress(tempSelectedLocation.displayName || tempAddress);
      setSelectedLocation(tempSelectedLocation);
    } else if (tempAddress.trim().length >= 5) {
      setAddress(tempAddress);
      const locationData = {
        displayName: tempAddress,
        main_text: tempAddress.split(',')[0],
        secondary_text: tempAddress.substring(tempAddress.split(',')[0].length + 2),
        latitude: "",
        longitude: "",
      };
      setSelectedLocation(locationData);
    }
    closeAddressModal();
  };

  // ✅ Enhanced address search with structured results
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
        const formattedSuggestions = data.predictions.map((item, index) => {
          const parts = item.structured_formatting || {};
          return {
            id: item.id || `${item.place_id}-${index}`,
            main_text: parts.main_text || item.description.split(',')[0],
            secondary_text: parts.secondary_text || item.description.substring(parts.main_text?.length + 2) || '',
            displayName: item.description,
            place_id: item.place_id,
            type: 'google'
          };
        });
        
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
        const formattedSuggestions = data.map((item, index) => {
          const parts = item.display_name.split(',');
          return {
            id: `${item.place_id}-${index}`,
            main_text: parts[0] || item.display_name,
            secondary_text: parts.slice(1, 3).join(', ') || '',
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: 'osm'
          };
        });
        
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
    setTempAddress(query);
    setTempSelectedLocation(null);

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
    setTempAddress(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
    
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
        displayName: suggestion.displayName,
        main_text: suggestion.main_text,
        secondary_text: suggestion.secondary_text,
        latitude: latitude,
        longitude: longitude,
      };
      
      setTempSelectedLocation(locationData);
      
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
      const locationData = {
        displayName: suggestion.displayName,
        main_text: suggestion.main_text,
        secondary_text: suggestion.secondary_text,
        latitude: "",
        longitude: "",
      };
      setTempSelectedLocation(locationData);
    }
  };

  const fetchCoordinatesFromPlaceId = async (placeId) => {
    try {
      const GOOGLE_API_KEY = "AIzaSyAr3P4anv6bZgHKOk6e1tW1qD7GFS2K7ro";
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name&key=${GOOGLE_API_KEY}`
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

  // ✅ Get current location in modal
  const getCurrentLocationInModal = async () => {
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
        setTempAddress(fullAddress);
        setShowSuggestions(false);
        setSuggestions([]);
        Keyboard.dismiss();
        
        const locationData = {
          displayName: fullAddress,
          main_text: place.name || place.street || "Current Location",
          secondary_text: [place.city, place.region, place.postalCode].filter(Boolean).join(', '),
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString(),
          addressDetails: place,
          city: place.city || "Chennai"
        };
        
        setTempSelectedLocation(locationData);
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

  // ✅ Render suggestions in modal
  const renderSuggestions = () => {
    return suggestions.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.suggestionItem}
        onPress={() => handleSuggestionSelect(item)}
      >
        <View style={styles.suggestionIconContainer}>
          <Ionicons 
            name={item.type === 'google' ? 'business' : 'location-outline'} 
            size={18} 
            color="#666" 
          />
        </View>
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionMainText} numberOfLines={1}>
            {item.main_text}
          </Text>
          <Text style={styles.suggestionSecondaryText} numberOfLines={2}>
            {item.secondary_text}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
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
      let latitude = "";
      let longitude = "";
      let city = "Chennai";
      
      if (selectedLocation?.latitude && selectedLocation?.longitude) {
        latitude = selectedLocation.latitude;
        longitude = selectedLocation.longitude;
        city = selectedLocation.city || "Chennai";
      } else {
        setLocationLoading(true);
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
        setLocationLoading(false);
      }

      const requestData = {
        mobile: mobile,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        type: '1',
        userId: userId,
        location: address.trim(),
        city: city,
        gst_lattitude: latitude || "13.0827",
        gst_longitude: longitude || "80.2707"
      };

      console.log('📡 Registration data:', JSON.stringify(requestData, null, 2));

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* ✅ MAIN FORM with KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardVisible && { paddingBottom: 100 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complete Registration</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.content}>
            {/* Logo - Increased Size */}
            <View style={styles.logoContainer}>
              <Image source={logoimg} style={styles.logo} resizeMode="contain" />
            </View>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <FontAwesome name="user" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  ref={nameInputRef}
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8E8E93"
                  value={name}
                  onChangeText={handleNameChange}
                  autoCapitalize="words"
                  maxLength={50}
                  returnKeyType="next"
                  onSubmitEditing={focusEmailInput}
                  blurOnSubmit={false}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Mobile Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <FontAwesome name="phone" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={mobile}
                  editable={false}
                  placeholderTextColor="#8E8E93"
                />
              </View>
            </View>

            {/* Email Input - with auto scroll */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <FontAwesome name="envelope" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  ref={emailInputRef}
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="#8E8E93"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={handleEmailChange}
                  maxLength={100}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    // Scroll to address section when done with email
                    scrollViewRef.current?.scrollTo({ y: 350, animated: true });
                    Keyboard.dismiss();
                  }}
                  onFocus={() => {
                    // Auto-scroll when email input is focused
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 250, animated: true });
                    }, 100);
                  }}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Address Input - iOS Style */}
            <View style={styles.inputSection}>
              <View style={styles.addressLabelRow}>
                <Text style={styles.inputLabel}>Address</Text>
                <TouchableOpacity
                  onPress={openAddressModal}
                  style={styles.editAddressButton}
                >
                  <Text style={styles.editAddressText}>
                    {address ? 'Edit' : 'Add Address'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {address ? (
                <TouchableOpacity 
                  style={styles.addressDisplay}
                  onPress={openAddressModal}
                >
                  <View style={styles.addressIconContainer}>
                    <Ionicons name="location-sharp" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.addressTextContainer}>
                    <Text style={styles.addressMainText} numberOfLines={1}>
                      {selectedLocation?.main_text || address.split(',')[0]}
                    </Text>
                    <Text style={styles.addressSubText} numberOfLines={2}>
                      {selectedLocation?.secondary_text || address.substring(address.split(',')[0].length + 2)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.addAddressButton}
                  onPress={openAddressModal}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addAddressText}>Add your address</Text>
                </TouchableOpacity>
              )}
              {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[
                styles.registerButton, 
                (!isFormValid || isLoading) && styles.registerButtonDisabled
              ]} 
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Complete Registration</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ FIXED: iOS Style Address Modal with Keyboard Handling */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={addressModalVisible}
        onRequestClose={closeAddressModal}
        statusBarTranslucent={Platform.OS === 'ios'}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          {/* Modal Header - Fixed at top */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={closeAddressModal}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Address</Text>
            <TouchableOpacity 
              style={styles.modalSaveButton}
              onPress={saveAddressFromModal}
              disabled={!tempAddress.trim()}
            >
              <Text style={[
                styles.modalSaveText,
                !tempAddress.trim() && styles.modalSaveTextDisabled
              ]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar - Fixed below header */}
          <View style={styles.modalSearchContainer}>
            <View style={styles.modalSearchBar}>
              <Feather name="search" size={18} color="#8E8E93" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search for address, area, or landmark..."
                placeholderTextColor="#8E8E93"
                value={tempAddress}
                onChangeText={handleAddressSearch}
                autoFocus={true}
                returnKeyType="search"
              />
              {tempAddress.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setTempAddress('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  style={styles.modalClearButton}
                >
                  <Ionicons name="close-circle" size={18} color="#C7C7CC" />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              onPress={getCurrentLocationInModal}
              style={styles.modalCurrentLocation}
              disabled={locationLoading}
            >
              <Ionicons name="navigate" size={18} color="#007AFF" />
              <Text style={styles.modalCurrentLocationText}>
                {locationLoading ? 'Getting location...' : 'Use current location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ FIXED: Dynamic ScrollView that adjusts for keyboard */}
          <KeyboardAvoidingView 
            style={styles.modalKeyboardAvoidView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              style={styles.suggestionsScrollView}
              contentContainerStyle={[
                styles.suggestionsContent,
                { paddingBottom: isKeyboardVisible ? 20 : 40 }
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {searching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Searching addresses...</Text>
                </View>
              ) : suggestions.length > 0 ? (
                <>
                  <View style={styles.suggestionsHeader}>
                    <Text style={styles.suggestionsTitle}>SUGGESTIONS</Text>
                  </View>
                  {renderSuggestions()}
                </>
              ) : tempAddress.length >= 3 && !searching ? (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="location-outline" size={50} color="#E5E5EA" />
                  <Text style={styles.noResultsTitle}>No results found</Text>
                  <Text style={styles.noResultsText}>
                    Try searching with different keywords
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="search" size={50} color="#E5E5EA" />
                  <Text style={styles.emptyStateTitle}>Search for your address</Text>
                  <Text style={styles.emptyStateText}>
                    Enter your street, area, or landmark to find your location
                  </Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // ✅ Keyboard avoiding for main form
  keyboardAvoidContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerRight: {
    width: 40,
  },
  
  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // Logo Section - Increased Size
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 180,
  },
  
  // Input Sections
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  disabledInput: {
    backgroundColor: '#F2F2F7',
    opacity: 0.7,
  },
  inputError: {
    borderWidth: 0.5,
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Address Section
  addressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editAddressButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  editAddressText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  addressDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 14,
  },
  addressIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressMainText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  addressSubText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 14,
  },
  addAddressText: {
    fontSize: 15,
    color: '#007AFF',
    marginLeft: 10,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Register Button
  registerButton: {
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 30,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Modal Header - Fixed at top
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 15,
    color: '#007AFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalSaveButton: {
    padding: 6,
  },
  modalSaveText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalSaveTextDisabled: {
    color: '#C7C7CC',
  },
  
  // Modal Search - Fixed below header
  modalSearchContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalClearButton: {
    padding: 3,
  },
  modalCurrentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  modalCurrentLocationText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // ✅ FIXED: Modal Keyboard Avoiding View
  modalKeyboardAvoidView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // ✅ FIXED: Suggestions ScrollView
  suggestionsScrollView: {
    flex: 1,
  },
  
  // ✅ FIXED: Suggestions Content Container
  suggestionsContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  suggestionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Suggestion Item
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  suggestionIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  suggestionSecondaryText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Empty States
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    minHeight: 300,
  },
  noResultsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  noResultsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    minHeight: 400,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});