// components/LocationSelector.js
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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

  // Function to extract short location name from full address
  const getShortLocationName = (address) => {
    if (!address) return 'Unknown Location';
    
    // Extract city, town, village, or district from the address
    // The address format usually starts with the most specific location
    const parts = address.split(',');
    
    if (parts.length > 0) {
      // Return the first part (most specific location)
      const shortName = parts[0].trim();
      return shortName || 'Unknown Location';
    }
    
    return address;
  };

  // Function to extract location name from reverse geocoding
  const getLocationFromAddress = (address) => {
    if (!address || address.length === 0) return 'Current Location';
    
    const location = address[0];
    // Priority: district -> subregion -> region -> city -> country
    return location.district || 
           location.subregion || 
           location.region || 
           location.city || 
           location.country || 
           'Current Location';
  };

  // Load recent locations on component mount
  useEffect(() => {
    loadRecentLocations();
  }, []);

  const loadRecentLocations = async () => {
    try {
      const savedLocations = await AsyncStorage.getItem('recentLocations');
      if (savedLocations) {
        setRecentLocations(JSON.parse(savedLocations));
      }
    } catch (error) {
      console.error('Error loading recent locations:', error);
    }
  };

  const saveToRecentLocations = async (location) => {
    try {
      const updatedLocations = [
        location,
        ...recentLocations.filter(loc => loc.toLowerCase() !== location.toLowerCase())
      ].slice(0, 5); // Keep only last 5 locations
      
      setRecentLocations(updatedLocations);
      await AsyncStorage.setItem('recentLocations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error saving recent location:', error);
    }
  };

  // Search location suggestions
  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      // Using OpenStreetMap Nominatim API for location search
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 10,
            countrycodes: 'in', // Limit to India
            'accept-language': 'en', // English results
          },
          timeout: 5000,
        }
      );

      const locations = response.data.map(item => {
        const shortName = getShortLocationName(item.display_name);
        return {
          display_name: item.display_name,
          short_name: shortName,
          lat: item.lat,
          lon: item.lon,
          type: item.type,
          class: item.class,
        };
      });

      // Remove duplicates based on short name
      const uniqueLocations = locations.filter((location, index, self) =>
        index === self.findIndex((l) => l.short_name === location.short_name)
      );

      setSuggestions(uniqueLocations);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);

  // Get current location
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

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const locality = getLocationFromAddress(address);
        handleLocationSelect(locality);
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

  const handleLocationSelect = async (locationName) => {
    setSelectedLocation(locationName);
    
    // Save to recent locations
    await saveToRecentLocations(locationName);
    
    // Save as current location
    try {
      await AsyncStorage.setItem('userLocation', locationName);
    } catch (error) {
      console.error('Error saving location:', error);
    }

    // Notify parent component
    if (onLocationChange) {
      onLocationChange(locationName);
    }

    setModalVisible(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleLocationSelect(item.short_name)}
    >
      <Ionicons 
        name={getLocationIcon(item.class)} 
        size={20} 
        color="#FF8800" 
      />
      <View style={styles.suggestionTextContainer}>
        <Text style={styles.suggestionText} numberOfLines={1}>
          {item.short_name}
        </Text>
        <Text style={styles.suggestionType}>
          {formatLocationType(item.type)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleLocationSelect(item)}
    >
      <Ionicons name="time-outline" size={20} color="#666" />
      <Text style={styles.recentText} numberOfLines={1}>{item}</Text>
    </TouchableOpacity>
  );

  // Helper function to get appropriate icon based on location type
  const getLocationIcon = (locationClass) => {
    switch (locationClass) {
      case 'place':
        return 'location-outline';
      case 'boundary':
        return 'map-outline';
      case 'highway':
        return 'car-outline';
      case 'natural':
        return 'leaf-outline';
      case 'building':
        return 'business-outline';
      default:
        return 'location-outline';
    }
  };

  // Helper function to format location type for display
  const formatLocationType = (type) => {
    if (!type) return 'Location';
    
    const typeMap = {
      'city': 'City',
      'town': 'Town',
      'village': 'Village',
      'suburb': 'Suburb',
      'neighbourhood': 'Neighborhood',
      'county': 'County',
      'state': 'State',
      'country': 'Country',
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
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
            <Text style={styles.modalTitle}>Select Location</Text>
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
              placeholder="Search city, district, or area..."
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
              <Text style={styles.loadingText}>Searching locations...</Text>
            </View>
          ) : searchQuery.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `suggestion-${item.short_name}-${index}`}
              renderItem={renderSuggestionItem}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No locations found</Text>
                  <Text style={styles.emptySubText}>Try searching for a city, district, or area</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.recentContainer}>
              <Text style={styles.sectionTitle}>Recent Locations</Text>
              {recentLocations.length > 0 ? (
                <FlatList
                  data={recentLocations}
                  keyExtractor={(item, index) => `recent-${index}`}
                  renderItem={renderRecentLocationItem}
                  style={styles.recentList}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="time-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No recent locations</Text>
                  <Text style={styles.emptySubText}>Your recent locations will appear here</Text>
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
  suggestionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  recentText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
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