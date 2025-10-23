import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext } from '../../context/SessionContext';
import styles from "../components/styles/Homestyles";
import LocationSelector from './LocationSelector';
import MenuDrawer from './MenuDrawer';

const { width } = Dimensions.get("window");

// App link for sharing
const appLink = "https://play.google.com/store/apps/details?id=com.yourapp";

// Utility function to handle image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `https://veebuilds.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// Image component with error handling
const MaterialImage = ({ source, style, fallbackComponent }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !source?.uri) {
    return fallbackComponent || (
      <View style={[style, styles.placeholderImage]}>
        <Ionicons name="image-outline" size={20} color="#999" />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode="cover"
      onError={() => setImageError(true)}
    />
  );
};

const Home = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const { session, isSessionLoaded, clearSession } = useContext(SessionContext);
  const userId = session?.id;

  // New states for additional data
  const [trendingData, setTrendingData] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [mostEnquiredData, setMostEnquiredData] = useState([]);
  const [loadingMostEnquired, setLoadingMostEnquired] = useState(true);
  const [mostSearchedData, setMostSearchedData] = useState([]);
  const [loadingMostSearched, setLoadingMostSearched] = useState(true);
  
  // Brands state
  const [brandsData, setBrandsData] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  
  // Hire Categories state
  const [hireCategories, setHireCategories] = useState([]);
  const [loadingHireCategories, setLoadingHireCategories] = useState(true);
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState('Chennai');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [appState, setAppState] = useState(AppState.currentState);
  const [mounted, setMounted] = useState(true);

  const brandsScrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);

  // Fallback brands data
  const fallbackBrands = [
    { id: 'brand1', localImage: require("../../assets/images/brand1.png") },
    { id: 'brand2', localImage: require("../../assets/images/brand2.png") },
    { id: 'brand3', localImage: require("../../assets/images/brand3.png") },
    { id: 'brand4', localImage: require("../../assets/images/brand4.png") },
    { id: 'cement', localImage: require("../../assets/images/cement.png") },
  ];

  // App state change handler
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState]);

  // Component unmount handler
  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  // Enhanced error handling for API calls
  const safeApiCall = useCallback(async (apiCall, fallbackData = []) => {
    try {
      if (!mounted) return fallbackData;
      return await apiCall();
    } catch (error) {
      console.error('API call failed:', error);
      return fallbackData;
    }
  }, [mounted]);

  // Location permission and fetching
  const requestLocationPermission = useCallback(async () => {
    if (!mounted || (__DEV__ && Platform.OS === 'ios')) {
      console.log('Skipping location request in development build');
      return;
    }

    try {
      setIsLocationLoading(true);
      
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          try {
            const savedLocation = await AsyncStorage.getItem('userLocation');
            if (savedLocation && mounted) {
              setCurrentLocation(savedLocation);
            }
          } catch (storageError) {
            console.error('Error reading saved location:', storageError);
          }
          return;
        }
      }

      if (!mounted) return;
      
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 8000,
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location timeout')), 8000);
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);
      
      if (!mounted) return;
      
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (address.length > 0 && mounted) {
        const locality = address[0].district || address[0].subregion || address[0].region || 'Your Location';
        setCurrentLocation(locality);
        
        try {
          await AsyncStorage.setItem('userLocation', locality);
        } catch (storageError) {
          console.error('Error saving location:', storageError);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      if (mounted) {
        try {
          const savedLocation = await AsyncStorage.getItem('userLocation');
          if (savedLocation) {
            setCurrentLocation(savedLocation);
          }
        } catch (storageError) {
          console.error('Error loading saved location:', storageError);
        }
      }
    } finally {
      if (mounted) {
        setIsLocationLoading(false);
      }
    }
  }, [mounted]);

  // Original materials fetch
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://veebuilds.com/mobile/maincategory.php"
      );
      
      console.log('📦 Materials Response:', response.data);
      
      if (response.data.result === "Success") {
        const materialsWithImages = response.data.storeList || [];
        setMaterials(materialsWithImages);
      } else {
        setError("Failed to fetch materials");
      }
    } catch (err) {
      console.error('❌ Error fetching materials:', err);
      setError("Error fetching materials: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trending products API
  const fetchTrendingProducts = useCallback(async () => {
    if (!mounted) return [];
    
    try {
      const response = await axios.get(
        "https://veebuilds.com/mobile/trending_products_list.php",
        { timeout: 8000 }
      );
      
      if (response.data.result === "Success" && mounted) {
        setTrendingData(response.data.storeList || []);
        return response.data.storeList || [];
      } else {
        throw new Error('Failed to fetch trending products');
      }
    } catch (error) {
      console.error('Trending products error:', error);
      return [];
    } finally {
      if (mounted) {
        setLoadingTrending(false);
      }
    }
  }, [mounted]);

  // Most enquired products API
  const fetchMostEnquiredProducts = useCallback(async () => {
    if (!mounted) return [];
    
    try {
      const response = await axios.get(
        "https://veebuilds.com/mobile/mostenquiredlist.php",
        { timeout: 8000 }
      );
      
      if (response.data.result === 'Success' && mounted) {
        setMostEnquiredData(response.data.storeList || []);
        return response.data.storeList || [];
      } else {
        throw new Error('Failed to fetch most enquired products');
      }
    } catch (error) {
      console.error('Most enquired products error:', error);
      return [];
    } finally {
      if (mounted) {
        setLoadingMostEnquired(false);
      }
    }
  }, [mounted]);

  // Most searched products API
  const fetchMostSearchedProducts = useCallback(async () => {
    if (!mounted) return [];
    
    try {
      const response = await axios.get(
        "https://veebuilds.com/mobile/recentlist.php",
        { timeout: 8000 }
      );
      
      if (response.data.result === 'Success' && mounted) {
        setMostSearchedData(response.data.storeList || []);
        return response.data.storeList || [];
      } else {
        throw new Error('Failed to fetch most searched products');
      }
    } catch (error) {
      console.error('Most searched products error:', error);
      return [];
    } finally {
      if (mounted) {
        setLoadingMostSearched(false);
      }
    }
  }, [mounted]);

  // Brands API call function
  const fetchBrands = useCallback(async () => {
    if (!mounted) return [];
    
    try {
      setLoadingBrands(true);
      const response = await axios.get(
        "https://veebuilds.com/mobile/brands.php",
        { timeout: 8000 }
      );
      
      console.log('🏷️ Brands API Response:', response.data);
      
      if (response.data.status === true && mounted) {
        // Convert the img object to array format for easier mapping
        const brandsArray = Object.entries(response.data.img).map(([key, value]) => ({
          id: key,
          imageUrl: value
        }));
        
        setBrandsData(brandsArray);
        return brandsArray;
      } else {
        throw new Error('Failed to fetch brands');
      }
    } catch (error) {
      console.error('❌ Brands API error:', error);
      
      // Fallback to local images if API fails
      if (mounted) {
        setBrandsData(fallbackBrands);
      }
      
      return [];
    } finally {
      if (mounted) {
        setLoadingBrands(false);
      }
    }
  }, [mounted]);

  // Top Hire Categories API function
  const fetchTopHireCategories = useCallback(async () => {
    if (!mounted) return [];
    
    try {
      setLoadingHireCategories(true);
      const response = await axios.get(
        "https://veebuilds.com/mobile/occupation_list.php",
        { 
          timeout: 8000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('👷 Top Hire Categories Response:', response.data);
      
      if (response.data?.storeList && Array.isArray(response.data.storeList) && mounted) {
        // Take only first 3 categories for home screen
        const topCategories = response.data.storeList.slice(0, 3);
        console.log('✅ Top 3 Hire Categories:', topCategories);
        setHireCategories(topCategories);
        return topCategories;
      } else {
        console.log('⚠️ No storeList found in response');
        // Fallback to default categories if API returns unexpected format
        const fallbackCategories = [
          { id: '1', title: 'Engineering' },
          { id: '2', title: 'Architect' },
          { id: '3', title: 'Plumber' }
        ];
        setHireCategories(fallbackCategories);
        return fallbackCategories;
      }
    } catch (error) {
      console.error('❌ Top Hire Categories error:', error);
      // Fallback categories in case of error
      const fallbackCategories = [
        { id: '1', title: 'Engineering' },
        { id: '2', title: 'Architect' },
        { id: '3', title: 'Plumber' }
      ];
      setHireCategories(fallbackCategories);
      return fallbackCategories;
    } finally {
      if (mounted) {
        setLoadingHireCategories(false);
      }
    }
  }, [mounted]);

  // Load all data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (!mounted) return;
      
      try {
        // Load saved location immediately for better UX
        const savedLocation = await AsyncStorage.getItem('userLocation');
        if (savedLocation && mounted) {
          setCurrentLocation(savedLocation);
        }

        // Fetch all API data
        fetchMaterials();
        setTimeout(() => {
          if (mounted) safeApiCall(fetchTrendingProducts);
        }, 100);
        
        setTimeout(() => {
          if (mounted) safeApiCall(fetchMostEnquiredProducts);
        }, 300);
        
        setTimeout(() => {
          if (mounted) safeApiCall(fetchMostSearchedProducts);
        }, 500);

        // Fetch brands data
        setTimeout(() => {
          if (mounted) safeApiCall(fetchBrands);
        }, 700);

        // Fetch hire categories data
        setTimeout(() => {
          if (mounted) safeApiCall(fetchTopHireCategories);
        }, 900);

        // Request location permission
        setTimeout(() => {
          if (mounted) requestLocationPermission();
        }, 2000);

      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [
    mounted, 
    safeApiCall, 
    fetchMaterials, 
    fetchTrendingProducts, 
    fetchMostEnquiredProducts, 
    fetchMostSearchedProducts, 
    fetchBrands, 
    fetchTopHireCategories, 
    requestLocationPermission
  ]);

  // Fixed auto-scroll for brands
  useEffect(() => {
    if (brandsData.length === 0) return;

    const startAutoScroll = () => {
      scrollIntervalRef.current = setInterval(() => {
        setCurrentBrandIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          const maxIndex = brandsData.length;
          
          if (brandsScrollRef.current) {
            brandsScrollRef.current.scrollTo({
              x: nextIndex * 120,
              animated: true
            });
          }

          if (nextIndex >= maxIndex) {
            setTimeout(() => {
              if (brandsScrollRef.current) {
                brandsScrollRef.current.scrollTo({ x: 0, animated: false });
              }
            }, 500);
            return 0;
          }
          
          return nextIndex;
        });
      }, 2000);
    };

    startAutoScroll();

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [brandsData.length]);

  // Navigation handlers
  const handleMoreMaterials = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    
    try {
      router.push('/components/Materials');
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      Alert.alert('Navigation Error', error.message);
    }
  };

  const handleMaterialPress = (material) => {
    console.log('🎯 Material pressed:', material.title, 'ID:', material.id);
    if (userId) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      
      try {
        router.push({ 
          pathname: '/components/Materials', 
          params: { 
            cat_id: material.id, 
            customer_id: userId
          } 
        });
      } catch (error) {
        console.error('❌ Material navigation failed:', error);
      }
    } else {
      Alert.alert('Error', 'User session not found');
    }
  };

  // Hire Category press handler
  const handleCategoryPress = async (category) => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    
    console.log('🎯 Category pressed:', category.title, 'ID:', category.id);
    
    try {
      const response = await axios.get(
        `https://veebuilds.com/mobile/professional_list_by_id.php?occupation=${category.id}`,
        { timeout: 8000 }
      );
      
      console.log('👥 Professionals Response:', response.data);
      
      if (response.data?.storeList) {
        router.push({
          pathname: '/components/HirepeopleDeatils',
          params: {
            id: category.id,
            title: category.title,
            professionals: JSON.stringify(response.data.storeList),
          },
        });
      } else {
        Alert.alert('Info', 'No professionals found for this category yet');
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      Alert.alert('Error', 'Failed to load professionals. Please try again.');
    }
  };

  const handleProfilePress = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    router.push('/components/profile');
  };

  const handleSearchPress = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    router.push('/components/Search');
  };

  const handleHirePeoplePress = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    router.push('/components/Hirepeople');
  };

  const handleRealEstatePress = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    router.push('/components/Realestate');
  };

  const handleHotEnquiryPress = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    router.push({ 
      pathname: '/components/HotenquiryForm', 
      params: { userId, name: session?.name, mobile: session?.mobile } 
    });
  };

  const handleMyEnquiryPress = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    router.push('/components/Myenquiry');
  };

  // Drawer handlers
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleShareApp = async () => {
    try {
      const message = `Check out this amazing app! Download here: ${appLink}`;
      
      const result = await Share.share({
        message: message,
        url: appLink,
        title: 'Download VeeBuilder App',
      });

      if (result.action === Share.sharedAction) {
        console.log('App shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error("Error sharing app:", error);
      Alert.alert("Error", "Unable to share the app right now. Please try again.");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await clearSession();
              router.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout properly');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // Manual location refresh
  const refreshLocation = () => {
    if (!isLocationLoading && mounted) {
      requestLocationPermission();
    }
  };

  // Render functions for FlatList
  const renderTrendingItem = useCallback(({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push({ 
        pathname: '/components/Shop', 
        params: { 
          cat_id: item.master_id, 
          customer_id: userId 
        } 
      })}
    >
      <View style={[styles.materialCard, { backgroundColor: '#f0c78dff' }]}>
        <View style={styles.materialImageWrapper}>
          <MaterialImage 
            source={{ uri: getImageUrl(item.image) }} 
            style={styles.materialImage}
            fallbackComponent={
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={24} color="#fff" />
              </View>
            }
          />
        </View>
        <Text style={[styles.materialText, { color: 'black', textAlign: 'center' }]} numberOfLines={2}>
          {item.msater_name}
        </Text>
      </View>
    </TouchableOpacity>
  ), [router, userId]);

  const renderMostEnquiredItem = useCallback(({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push({ 
        pathname: '/components/Shop', 
        params: { 
          cat_id: item.master_id, 
          customer_id: userId 
        } 
      })}
    >
      <View style={styles.enquiredCard}>
        <View style={styles.enquiredImageWrapper}>
          <MaterialImage
            source={{ uri: getImageUrl(item.image) }}
            style={styles.enquiredImage}
            fallbackComponent={
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={24} color="#999" />
              </View>
            }
          />
        </View>
        <View style={styles.enquiredTextWrapper}>
          <Text style={styles.enquiredText} numberOfLines={2}>{item.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [router, userId]);

  const renderMostSearchedItem = useCallback(({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push({ 
        pathname: '/components/Shop', 
        params: { 
          cat_id: item.master_id, 
          customer_id: userId 
        } 
      })}
    >
      <View style={styles.materialCard}>
        <View style={styles.materialImageWrapper}>
          <MaterialImage
            source={{ uri: getImageUrl(item.image) }}
            style={styles.materialImage}
            fallbackComponent={
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={24} color="#999" />
              </View>
            }
          />
        </View>
        <Text style={styles.materialText} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  ), [router, userId]);

  // Render brands item
  const renderBrandItem = useCallback(({ item }) => (
    <View style={styles.brandCard}>
      {item.imageUrl ? (
        <MaterialImage
          source={{ uri: item.imageUrl }}
          style={styles.brandImage}
          fallbackComponent={
            <View style={styles.placeholderImage}>
              <Ionicons name="business-outline" size={24} color="#999" />
            </View>
          }
        />
      ) : (
        <Image 
          source={item.localImage} 
          style={styles.brandImage} 
          resizeMode="contain" 
        />
      )}
    </View>
  ), []);

  const renderMaterialsGrid = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8800" />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMaterials}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const displayMaterials = materials.slice(0, 8);
    const rows = [];

    for (let i = 0; i < displayMaterials.length; i += 4) {
      const rowItems = displayMaterials.slice(i, i + 4);
      rows.push(
        <View key={i} style={styles.materialsRow}>
          {rowItems.map((material, index) => {
            const imageUrl = getImageUrl(material.image);

            return (
              <TouchableOpacity 
                key={`${material.id}-${index}`} 
                style={styles.materialItem}
                onPress={() => handleMaterialPress(material)}
              >
                <View style={styles.materialImageContainer}>
                  <MaterialImage
                    source={{ uri: imageUrl }}
                    style={styles.materialGridImage}
                    fallbackComponent={
                      <View style={styles.placeholderImage}>
                        <Ionicons name="image-outline" size={24} color="#999" />
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    }
                  />
                </View>
                <Text style={styles.materialName} numberOfLines={2}>
                  {material.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.materialsContainer}>
        {rows}
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={handleMoreMaterials}
          activeOpacity={0.7}
        >
          <Text style={styles.moreButtonText}>
            More Materials
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  if (!isSessionLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8800" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#FFE5B5" 
        barStyle="dark-content" 
        translucent={false} 
      />
      <MenuDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        handleShareApp={handleShareApp}
        handleLogout={handleLogout}
        session={session}
      />
      
      <LinearGradient colors={["#FFE5B5", "#FFDFA0"]} style={styles.header}>
        <View style={styles.headerTop}>
          <LocationSelector
            currentLocation={currentLocation}
            onLocationChange={setCurrentLocation}
            isLocationLoading={isLocationLoading}
            onLocationLoadingChange={setIsLocationLoading}
          />
          
          {/* <TouchableOpacity 
            style={styles.profileIcon}
            onPress={handleProfilePress}
          >
            <Ionicons name="person-circle" size={22} color="#fff" />
          </TouchableOpacity> */}
        </View>

        <TouchableOpacity onPress={handleSearchPress}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#aaa"
              style={styles.searchInput}
              editable={false}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.contentBackground}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cards Section */}
          <View style={styles.cardContainer}>
            <TouchableOpacity 
              style={styles.card}
              onPress={handleHirePeoplePress}
            >
              <Image source={require("../../assets/images/hirepeople12.png")} style={styles.cardBg} />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardNumber}>29</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.card}
              onPress={handleRealEstatePress}
            >
              <Image source={require("../../assets/images/realestate.png")} style={styles.cardBg} />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardNumber}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Materials Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Materials</Text>
          </View>
          
          {renderMaterialsGrid()}

          {/* Trending Products */}
          {/* <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Products</Text>
          </View>
          {loadingTrending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8800" />
            </View>
          ) : (
            <FlatList
              horizontal
              data={trendingData}
              keyExtractor={(item) => `trending-${item.master_id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.materialScroll}
              renderItem={renderTrendingItem}
            />
          )} */}

          {/* Hot Enquiry */}
          <TouchableOpacity 
            style={styles.hotEnquiry}
            onPress={handleHotEnquiryPress}
          >
            <Image source={require("../../assets/images/Hotenquiry.png")} style={styles.hotEnquiryImg} />
            <Text style={styles.hotEnquiryText}>Hot enquiry</Text>
          </TouchableOpacity>

          {/* Most Searched Products */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Searched Products</Text>
          </View>
          {loadingMostSearched ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8800" />
            </View>
          ) : (
            <FlatList
              horizontal
              data={mostSearchedData}
              keyExtractor={(item) => `most-searched-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.materialScroll}
              renderItem={renderMostSearchedItem}
            />
          )}

          {/* Hire Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Hire Categories</Text>
            <TouchableOpacity onPress={handleHirePeoplePress}>
              <Text style={styles.moreText}>More</Text>
            </TouchableOpacity>
          </View>
          
          {loadingHireCategories ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF8800" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {hireCategories.map((category, idx) => (
                <View key={category.id} style={styles.categoryCard}>
                  <Image source={require("../../assets/images/veebuilder.png")} style={styles.categoryIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.categorySub}>Hire people</Text>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.detailBtn}
                    onPress={() => handleCategoryPress(category)}
                  >
                    <Text style={styles.detailText}>view more detail</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Most Enquired Products */}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Most Enquired Products</Text>
</View>
{loadingMostEnquired ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FF8800" />
  </View>
) : (
  <View style={styles.mostEnquiredContainer}>
    <ImageBackground
      source={require("../../assets/images/mostep.png")}
      style={styles.enquiredScrollBackground}
      resizeMode="stretch"
    >
      <FlatList
        horizontal
        data={mostEnquiredData}
        keyExtractor={(item) => `most-enquired-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.enquiredScroll}
        renderItem={renderMostEnquiredItem}
      />
    </ImageBackground>
  </View>
)}

          {/* Our Brands - Fixed Auto Scroll */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Brands</Text>
          </View>
          
          {loadingBrands ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8800" />
              <Text style={styles.loadingText}>Loading brands...</Text>
            </View>
          ) : (
            <ScrollView
              ref={brandsScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              contentContainerStyle={styles.brandsScroll}
            >
              {brandsData.map((brand, index) => (
                <View key={brand.id} style={styles.brandCard}>
                  {brand.imageUrl ? (
                    <MaterialImage
                      source={{ uri: brand.imageUrl }}
                      style={styles.brandImage}
                      fallbackComponent={
                        <View style={styles.placeholderImage}>
                          <Ionicons name="business-outline" size={24} color="#999" />
                        </View>
                      }
                    />
                  ) : (
                    <Image 
                      source={brand.localImage} 
                      style={styles.brandImage} 
                      resizeMode="contain" 
                    />
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </ScrollView>
      </View>

{/* Footer */}
{/* Footer */}
<View style={styles.footer}>
  {/* Home Tab */}
  <TouchableOpacity style={styles.footerTab}>
    <MaterialIcons name="home" size={24} color="#FF8800" />
    <Text style={[styles.footerText, { color: "#FF8800" }]}>Home</Text>
  </TouchableOpacity>
  
  {/* Profile Tab */}
  <TouchableOpacity style={styles.footerTab} onPress={handleProfilePress}>
    <MaterialIcons name="person" size={24} color="#888" />
    <Text style={styles.footerText}>Profile</Text>
  </TouchableOpacity>
  
  {/* Center Circular My Enquiry Button */}
  <TouchableOpacity style={styles.centerEnquiryButton} onPress={handleMyEnquiryPress}>
    <View style={styles.centerEnquiryCircle}>
      <MaterialIcons name="list-alt" size={24} color="#fff" />
    </View>
    <Text style={styles.centerEnquiryText}>My Enquiry</Text>
  </TouchableOpacity>
  
  {/* Hot Enquiry Tab */}
  <TouchableOpacity style={styles.footerTab} onPress={handleHotEnquiryPress}>
    <MaterialIcons name="whatshot" size={24} color="#888" />
    <Text style={styles.footerText}>Hot Enquiry</Text>
  </TouchableOpacity>
  
  {/* Menu Tab */}
  <TouchableOpacity style={styles.footerTab} onPress={toggleDrawer}>
    <MaterialIcons name="menu" size={24} color="#888" />
    <Text style={styles.footerText}>Menu</Text>
  </TouchableOpacity>
</View>
      
    </SafeAreaView>
  );
};

export default Home;