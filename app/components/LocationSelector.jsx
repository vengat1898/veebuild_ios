// components/LocationSelector.js
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Your Google Places API Key
const GOOGLE_PLACES_API_KEY = "AIzaSyAr3P4anv6bZgHKOk6e1tW1qD7GFS2K7ro";

const LocationSelector = ({ 
  currentLocation, 
  onLocationChange, 
  isLocationLoading, 
  onLocationLoadingChange 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentLocations, setRecentLocations] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);
  const [locationDetails, setLocationDetails] = useState(null);

  // Helper function to extract state from description
  const extractStateFromDescription = (description) => {
    if (!description) return '';
    
    // Description format is usually "City, State, Country"
    const parts = description.split(',');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    return '';
  };

  // Load recent locations on component mount
  useEffect(() => {
    loadRecentLocations();
  }, []);

  const loadRecentLocations = async () => {
    try {
      const savedLocations = await AsyncStorage.getItem('recentLocations');
      if (savedLocations) {
        const parsedLocations = JSON.parse(savedLocations);
        
        // Convert old string format to new object format for backward compatibility
        const formattedLocations = parsedLocations.map(loc => {
          if (typeof loc === 'string') {
            return {
              name: loc,
              display_name: loc,
              city: loc,
              timestamp: Date.now()
            };
          }
          return loc;
        });
        
        setRecentLocations(formattedLocations);
      }
    } catch (error) {
      console.error('Error loading recent locations:', error);
    }
  };

  const saveToRecentLocations = async (locationData) => {
    try {
      // Create a location object with city details
      const locationObj = {
        ...locationData,
        timestamp: Date.now()
      };
      
      // Filter out duplicates based on city name
      const updatedLocations = [
        locationObj,
        ...recentLocations.filter(loc => {
          const existingCity = typeof loc === 'string' ? loc : loc.city;
          return existingCity?.toLowerCase() !== locationData.city?.toLowerCase();
        })
      ].slice(0, 5); // Keep only last 5 locations
      
      setRecentLocations(updatedLocations);
      await AsyncStorage.setItem('recentLocations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error saving recent location:', error);
    }
  };

  // Search cities using Google Places API
  const searchCities = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      // Google Places Autocomplete API with type=locality for cities
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(query)}` +
        `&types=(cities)` +  // Only cities
        `&components=country:in` +  // Limit to India
        `&key=${GOOGLE_PLACES_API_KEY}` +
        `&language=en`
      );

      const data = await response.json();

      if (data.status === "OK" && data.predictions.length > 0) {
        const cities = data.predictions.map(prediction => {
          // Extract city name from structured formatting
          const structured = prediction.structured_formatting;
          return {
            place_id: prediction.place_id,
            name: structured.main_text,
            description: structured.secondary_text || '',
            display_name: prediction.description,
            city: structured.main_text,
            state: extractStateFromDescription(prediction.description), // Fixed: using function directly
            type: 'locality'
          };
        });

        // Remove duplicates based on city name
        const uniqueCities = cities.filter((city, index, self) =>
          index === self.findIndex((c) => c.city === city.city)
        );

        setSuggestions(uniqueCities);
      } else if (data.status === "ZERO_RESULTS") {
        setSuggestions([]);
      } else {
        console.error('Google Places API error:', data.status);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCities]);

  // Get city details from place_id
  const getCityDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${placeId}` +
        `&fields=name,formatted_address,geometry,address_components` +
        `&key=${GOOGLE_PLACES_API_KEY}` +
        `&language=en`
      );

      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const place = data.result;
        
        // Extract city and state from address components
        let city = '';
        let state = '';
        
        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
          }
        }

        return {
          name: place.name,
          city: city || place.name,
          state: state,
          formatted_address: place.formatted_address,
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng
        };
      }
    } catch (error) {
      console.error('Error getting city details:', error);
    }
    return null;
  };

  // Get current location and reverse geocode to get city
  const getCurrentLocation = async () => {
    if (onLocationLoadingChange) {
      onLocationLoadingChange(true);
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 8000,
      });

      // Reverse geocode using Google Geocoding API
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `latlng=${location.coords.latitude},${location.coords.longitude}` +
        `&key=${GOOGLE_PLACES_API_KEY}` +
        `&language=en` +
        `&result_type=locality`
      );

      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
        const result = geocodeData.results[0];
        
        // Extract city name
        let cityName = '';
        for (const component of result.address_components) {
          if (component.types.includes('locality')) {
            cityName = component.long_name;
            break;
          }
        }

        if (!cityName) {
          cityName = result.address_components[0]?.long_name || 'Current Location';
        }

        const locationData = {
          name: cityName,
          city: cityName,
          state: extractStateFromDescription(result.formatted_address), // Fixed: using function directly
          formatted_address: result.formatted_address,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          isCurrentLocation: true
        };

        handleLocationSelect(locationData);
      } else {
        alert('Unable to determine city from current location');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get current location');
    } finally {
      if (onLocationLoadingChange) {
        onLocationLoadingChange(false);
      }
    }
  };

  const handleLocationSelect = async (locationData) => {
    // If we only have place_id, fetch complete details
    let completeLocationData = locationData;
    
    if (locationData.place_id && !locationData.latitude) {
      completeLocationData = await getCityDetails(locationData.place_id);
    }

    if (completeLocationData) {
      setSelectedLocation(completeLocationData.city);
      setLocationDetails(completeLocationData);
      
      // Save to recent locations
      await saveToRecentLocations(completeLocationData);
      
      // Save as current location
      try {
        await AsyncStorage.setItem('userLocation', JSON.stringify(completeLocationData));
      } catch (error) {
        console.error('Error saving location:', error);
      }

      // Notify parent component
      if (onLocationChange) {
        onLocationChange(completeLocationData);
      }

      setModalVisible(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleLocationSelect(item)}
    >
      <Ionicons 
        name="location-city" 
        size={22} 
        color="#FF8800" 
      />
      <View style={styles.suggestionTextContainer}>
        <Text style={styles.suggestionCity} numberOfLines={1}>
          {item.city}
        </Text>
        {item.state ? (
          <Text style={styles.suggestionState} numberOfLines={1}>
            {item.state}
          </Text>
        ) : null}
        {item.description ? (
          <Text style={styles.suggestionDescription} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderRecentLocationItem = ({ item }) => {
    // Handle both string and object types for backward compatibility
    const locationData = typeof item === 'string' ? 
      { city: item, state: '' } : item;
    
    return (
      <TouchableOpacity
        style={styles.recentItem}
        onPress={() => handleLocationSelect(locationData)}
      >
        <Ionicons name="time-outline" size={20} color="#666" />
        <View style={styles.recentTextContainer}>
          <Text style={styles.recentCity} numberOfLines={1}>
            {locationData.city}
          </Text>
          {locationData.state ? (
            <Text style={styles.recentState} numberOfLines={1}>
              {locationData.state}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Location Display Button */}
      <TouchableOpacity 
        style={styles.locationButton}
        onPress={() => setModalVisible(true)}
        onLongPress={getCurrentLocation}
      >
        <MaterialIcons name="location-on" size={18} color="#FF8800" />
        {isLocationLoading ? (
          <ActivityIndicator size="small" color="#FF8800" style={styles.loadingIndicator} />
        ) : (
          <Text style={styles.locationText} numberOfLines={1}>
            {selectedLocation} ▼
          </Text>
        )}
      </TouchableOpacity>

      {/* Location Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="Search for a city..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="navigate" size={20} color="#FF8800" />
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </TouchableOpacity>

          {/* Suggestions List */}
          {loadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8800" />
              <Text style={styles.loadingText}>Searching cities...</Text>
            </View>
          ) : searchQuery.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `city-${item.place_id || item.city}-${index}`}
              renderItem={renderSuggestionItem}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No cities found</Text>
                  <Text style={styles.emptySubText}>Try searching for a different city name</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.recentContainer}>
              <Text style={styles.sectionTitle}>Recent Cities</Text>
              {recentLocations.length > 0 ? (
                <FlatList
                  data={recentLocations}
                  keyExtractor={(item, index) => {
                    const id = typeof item === 'string' ? item : item.city;
                    return `recent-${id}-${index}`;
                  }}
                  renderItem={renderRecentLocationItem}
                  style={styles.recentList}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="time-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No recent cities</Text>
                  <Text style={styles.emptySubText}>Your recently selected cities will appear here</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: 150,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
  loadingIndicator: {
    marginHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentLocationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionCity: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionState: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
  },
  recentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recentList: {
    flex: 1,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recentCity: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  recentState: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LocationSelector;