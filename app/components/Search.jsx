import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SessionContext } from '../../context/SessionContext'; // Adjust path as needed
import api from "../services/api";

export default function Search() {
  const navigation = useNavigation();
  const router = useRouter();
  const { getUserIdSync, session, isSessionLoaded } = useContext(SessionContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [storeList, setStoreList] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    console.log('\n================= COMPONENT MOUNTED =================');
    
    // Load user ID from session context
    const loadUserId = async () => {
      try {
        console.log('\n--- Loading User ID from Session Context ---');
        
        if (!isSessionLoaded) {
          console.log('⚠️ Session not loaded yet, waiting...');
          return;
        }
        
        // Option 1: Use getUserIdSync (synchronous)
        const syncUserId = getUserIdSync();
        console.log('Sync User ID:', syncUserId);
        
        // Option 2: Use session directly
        if (session && session.id) {
          console.log('Session User ID:', session.id);
          console.log('Session Data:', session);
          setUserId(session.id);
          console.log('✅ User ID Set Successfully:', session.id);
        } else {
          console.log('❌ No session found or user not logged in');
          console.log('Current Session:', session);
          setUserId(null);
        }
      } catch (error) {
        console.log('💥 Session Context Error:');
        console.log('Error Message:', error.message);
        console.error('Failed to load user ID from session:', error);
      }
    };

    loadUserId();
  }, [isSessionLoaded, session, getUserIdSync]);

  // Alternative: Listen for session changes
  useEffect(() => {
    if (session?.id && session.id !== userId) {
      console.log('🔄 Session updated, setting new user ID:', session.id);
      setUserId(session.id);
    }
  }, [session]);

  const fetchStoreList = async () => {
    console.log('\n================= FETCHING STORE LIST =================');
    console.log('API Endpoint:', 'searchlist.php');
    console.log('Request Method:', 'GET');
    console.log('Loading State Set:', true);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Making API Request...');
      const response = await api.get('searchlist.php');
      
      console.log('\n--- API RESPONSE DETAILS ---');
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Config:', response.config);
      console.log('Full Response Object:', response);
      console.log('\n--- RESPONSE DATA ---');
      console.log('Raw Response Data:', JSON.stringify(response.data, null, 2));
      console.log('Response Result:', response.data.result);
      console.log('Response Store List Length:', response.data.storeList?.length || 0);

      if (response.data.result === 'Success') {
        console.log('\n--- PROCESSING STORE LIST ---');
        console.log('Original Store List:', response.data.storeList);
        
        const uniqueStoreList = Array.from(
          new Map(response.data.storeList.map((item) => [item.id, item])).values()
        );
        
        console.log('Unique Store List Count:', uniqueStoreList.length);
        console.log('Unique Store List Data:', uniqueStoreList);
        console.log('Sample Store Item:', uniqueStoreList[0]);
        
        setStoreList(uniqueStoreList);
        console.log('✅ Store List Set Successfully');
      } else {
        console.log('❌ Server Response Failed');
        console.log('Server Result:', response.data.result);
        console.log('Server Message:', response.data.message || 'No message provided');
        console.error('Failed to load store list from server');
        setError('Failed to load store list');
      }
    } catch (err) {
      console.log('\n💥 FETCH ERROR DETAILS:');
      console.log('Error Message:', err.message);
      console.log('Error Code:', err.code);
      console.log('Error Status:', err.response?.status);
      console.log('Error Response Data:', err.response?.data);
      console.log('Error Config:', err.config);
      console.log('Full Error Object:', err);
      console.error('Fetch Error:', err.message);
      setError('Error fetching data');
    } finally {
      console.log('Loading State Set:', false);
      console.log('================= STORE LIST FETCH COMPLETE =================\n');
      setLoading(false);
    }
  };

  const fetchRecentSearches = async () => {
    console.log('\n================= FETCHING RECENT SEARCHES =================');
    console.log('User ID Check:', userId);
    
    if (!userId) {
      console.log('❌ No User ID available - skipping recent searches');
      return;
    }
    
    const endpoint = `recent_search_history.php?customer_id=${userId}`;
    console.log('API Endpoint:', endpoint);
    console.log('Request Method:', 'GET');
    console.log('URL Parameters:');
    console.log('  - customer_id:', userId);
    
    try {
      console.log('📡 Making Recent Searches API Request...');
      const response = await api.get(endpoint);
      
      console.log('\n--- RECENT SEARCHES RESPONSE DETAILS ---');
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Config:', response.config);
      console.log('Full Response Object:', response);
      console.log('\n--- RECENT SEARCHES DATA ---');
      console.log('Raw Response Data:', JSON.stringify(response.data, null, 2));
      console.log('Response Result:', response.data.result);
      console.log('Recent Searches Count:', response.data.storeList?.length || 0);

      if (response.data.result === 'Success') {
        console.log('\n--- PROCESSING RECENT SEARCHES ---');
        console.log('Recent Searches Data:', response.data.storeList || []);
        setRecentSearches(response.data.storeList || []);
        console.log('✅ Recent Searches Set Successfully');
      } else {
        console.log('❌ Recent Searches Request Failed');
        console.log('Server Result:', response.data.result);
        console.log('Server Message:', response.data.message || 'No message provided');
      }
    } catch (err) {
      console.log('\n💥 RECENT SEARCHES ERROR:');
      console.log('Error Message:', err.message);
      console.log('Error Code:', err.code);
      console.log('Error Status:', err.response?.status);
      console.log('Error Response Data:', err.response?.data);
      console.log('Error Config:', err.config);
      console.log('Full Error Object:', err);
      console.error('Error fetching recent searches:', err);
    }
    
    console.log('================= RECENT SEARCHES FETCH COMPLETE =================\n');
  };

  useEffect(() => {
    console.log('\n================= USEEFFECT TRIGGERED =================');
    console.log('User ID Value:', userId);
    console.log('User ID Type:', typeof userId);
    console.log('Session Loaded:', isSessionLoaded);
    console.log('Current Session:', session);
    
    console.log('Calling fetchStoreList...');
    fetchStoreList();
    
    if (userId) {
      console.log('User ID exists - calling fetchRecentSearches...');
      fetchRecentSearches();
    } else {
      console.log('No User ID - skipping fetchRecentSearches');
    }
    
    console.log('================= USEEFFECT COMPLETE =================\n');
  }, [userId]);

  const filteredStoreList = storeList.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Log search filtering
  useEffect(() => {
    if (searchQuery.length > 0) {
      console.log('\n--- SEARCH FILTERING ---');
      console.log('Search Query:', searchQuery);
      console.log('Total Stores:', storeList.length);
      console.log('Filtered Results:', filteredStoreList.length);
      console.log('Filtered Items:', filteredStoreList.map(item => ({ id: item.id, name: item.name })));
    }
  }, [searchQuery, storeList]);

  const handleSearchItemPress = (item) => {
    console.log('\n================= SEARCH ITEM PRESSED =================');
    console.log('Selected Item:', item);
    console.log('Item ID:', item.id);
    console.log('Item Name:', item.name);
    console.log('Item Type:', item.type);
    console.log('User ID:', userId);
    
    const routeParams = { 
      cat_id: item.id, 
      customer_id: userId 
    };
    
    console.log('\n--- NAVIGATION DETAILS ---');
    console.log('Target Pathname:', '/components/Shop');
    console.log('Route Parameters:', routeParams);
    console.log('Navigation Method:', 'router.push');
    
    router.push({
      pathname: '/components/Shop',
      params: routeParams,
    });
    
    console.log('✅ Navigation Initiated');
    console.log('================= SEARCH ITEM PRESS COMPLETE =================\n');
  };

  const handleRecentSearchPress = (item) => {
    console.log('\n--- RECENT SEARCH PRESSED ---');
    console.log('Recent Search Item:', item);
    console.log('Setting Search Query to:', item.title);
    setSearchQuery(item.title);
    console.log('✅ Search Query Updated');
  };

  // Log state changes
  useEffect(() => {
    console.log('\n--- STATE UPDATE: Search Query ---');
    console.log('New Search Query:', searchQuery);
    console.log('Query Length:', searchQuery.length);
  }, [searchQuery]);

  useEffect(() => {
    console.log('\n--- STATE UPDATE: Store List ---');
    console.log('Store List Length:', storeList.length);
    console.log('Store List Sample:', storeList.slice(0, 3));
  }, [storeList]);

  useEffect(() => {
    console.log('\n--- STATE UPDATE: Recent Searches ---');
    console.log('Recent Searches Length:', recentSearches.length);
    console.log('Recent Searches Data:', recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    console.log('\n--- STATE UPDATE: Loading ---');
    console.log('Loading State:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('\n--- STATE UPDATE: Error ---');
    console.log('Error State:', error);
  }, [error]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B4513', '#D2691E', '#F4A460']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          onPress={() => {
            console.log('\n--- BACK BUTTON PRESSED ---');
            console.log('Navigating to: /components/Home');
            router.replace("/components/Home");
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Search</Text>
        </View>
      </LinearGradient>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Materials..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(text) => {
              console.log('\n--- SEARCH INPUT CHANGE ---');
              console.log('Previous Query:', searchQuery);
              console.log('New Query:', text);
              setSearchQuery(text);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8B4513" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading / Error */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Ionicons name="cafe" size={40} color="#8B4513" />
          <Text style={styles.loadingText}>Finding stores...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#D9534F" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      {searchQuery.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {filteredStoreList.length} results for "{searchQuery}"
          </Text>
          <FlatList
            data={filteredStoreList}
            keyExtractor={(item) => `${item.id}-${item.name}-${item.type}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSearchItemPress(item)}
              >
                <View style={styles.storeIcon}>
                  <Ionicons name="storefront" size={20} color="#8B4513" />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{item.name}</Text>
                  <Text style={styles.storeType}>{item.type || 'Store'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B4513" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={60} color="#ccc" />
                <Text style={styles.noResultsText}>No stores found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try different search terms
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentSearches.length > 0 ? (
            <FlatList
              data={recentSearches}
              keyExtractor={(item) => `${item.id}-${item.title}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentItem}
                  onPress={() => handleRecentSearchPress(item)}
                >
                  <View style={styles.recentItemIcon}>
                    <Ionicons name="time" size={18} color="#8B4513" />
                  </View>
                  <Text style={styles.recentItemText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyRecentContainer}>
              <Ionicons name="time-outline" size={60} color="#ccc" />
              <Text style={styles.noRecentText}>No recent searches</Text>
              <Text style={styles.noRecentSubtext}>
                Your search history will appear here
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginRight: 15,
    marginTop: 5,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F4A460',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    marginTop: 10,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8D7DA',
    margin: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  errorText: {
    fontSize: 16,
    color: '#721C24',
    marginLeft: 10,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  resultsTitle: {
    fontSize: 16,
    color: '#8B4513',
    marginBottom: 15,
    paddingHorizontal: 5,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#D2691E',
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeType: {
    fontSize: 14,
    color: '#8B4513',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 10,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  recentSearchesContainer: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  clearButton: {
    fontSize: 14,
    color: '#D2691E',
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  recentItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  emptyRecentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noRecentText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 10,
  },
  noRecentSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
});