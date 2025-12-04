import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import logoimg from '../../assets/images/veebuilder.png';
import { SessionContext } from '../../context/SessionContext.jsx';
import api from "../services/api.jsx";

// Custom Image component with proper error handling
const VendorImage = ({ imageUrl, style, onPress }) => {
  const [imageError, setImageError] = useState(false);
  
  // Check if URL is valid before even trying to load
  const isValidUrl = (url) => {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (url.trim() === '') return false;
    if (url === 'null' || url === 'undefined' || url === 'N/A') return false;
    if (!url.startsWith('http')) return false;
    
    // Additional checks for common problematic patterns
    if (url.includes('default.jpg') || url.includes('placeholder')) return false;
    if (url.includes('mas_sec/assets/images/vendor/Profile_')) {
      // Check if it looks like a specific profile image pattern
      // You can add more specific checks here
    }
    
    return true;
  };

  // Determine if we should even try to load the URL
  const shouldLoadImage = isValidUrl(imageUrl);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Image
        source={shouldLoadImage && !imageError ? { uri: imageUrl } : logoimg}
        style={style}
        defaultSource={logoimg}
        onError={() => {
          console.log('Image failed to load, using fallback:', imageUrl);
          setImageError(true);
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', imageUrl);
        }}
      />
    </TouchableOpacity>
  );
};

export default function Shop() {
  const { session, isSessionLoaded, clearSession } = useContext(SessionContext);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('=============================================================');
  console.log('Shop screen received params:', params);
  console.log('=============================================================');

  const [modalVisible, setModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeLoading, setTypeLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { cat_id, customer_id: paramCustomerId } = params;
  
  // Check if user is a guest (no proper mobile number)
  const isGuestUser = !session || 
                     !session.mobile || 
                     session.mobile === '' || 
                     session.id === 'guest_user' || 
                     session.type === 'guest';

  const customer_id = paramCustomerId || session?.id;

  // Function to navigate to shop details
  const navigateToShopDetails = (item) => {
    console.log('=============================================================');
    console.log('NAVIGATING TO SHOP DETAILS');
    console.log('Vendor ID:', item.id);
    console.log('=============================================================');
    
    router.push({
      pathname: '/components/Shopdetails',
      params: { 
        vendor_id: item.id,
        cat_id,
        customer_id,
        shopName: item.name,
        shopImage: item.shop_image,
        mobile: item.mobile,
        whatsapp: item.whatsapp,
        email: item.email,
        experience: item.yera_of_exp,
        location: item.location,
        city: item.city,
        state: item.state,
        country: item.country,
        rattings: item.rattings,
        enquery: item.enquery,
        distance: item.distance,
        dealer: item.dealer // Pass dealer info to details page
      }
    });
  };

  // Function to track enquiry
  const trackEnquiry = async (enquiryType, vendorId) => {
    try {
      const response = await api.get('https://veebuilds.com/mobile/save_enquiry.php', {
        params: {
          user_id: customer_id,
          type: 1, // Assuming type=1 for vendor enquiries
          enquiry_type: enquiryType, // 1 for call, 2 for WhatsApp
          poi_id: vendorId
        }
      });

      if (response.data?.status === true) {
        console.log(`Enquiry tracked successfully for type: ${enquiryType}, vendor: ${vendorId}`);
      } else {
        console.log('Enquiry tracking failed:', response.data?.message);
      }
    } catch (error) {
      console.error('Error tracking enquiry:', error);
      // Don't show alert for tracking errors as it might interrupt user flow
    }
  };

  // Handle sign in for guest users - COMPLETE NAVIGATION RESET
  const handleSignIn = async () => {
    console.log("Sign in clicked from Shop");
    
    // Clear any guest session before navigating to login
    if (isGuestUser) {
      await clearSession();
    }
    
    // COMPLETE NAVIGATION RESET - This will clear the entire stack
    if (router.dismissAll) {
      router.dismissAll();
    }
    
    setTimeout(() => {
      router.replace({
        pathname: '/Login',
        params: { 
          fromShop: 'true',
          returnParams: JSON.stringify(params) // Pass all params to return after login
        }
      });
    }, 100);
  };

  // Handle back navigation for guest users
  const handleBackPress = () => {
    // Complete reset to home
    if (router.dismissAll) {
      router.dismissAll();
    }
    setTimeout(() => {
      router.replace('/components/Home');
    }, 100);
  };

  // Loading states
  if (!isSessionLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Shop</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Show login required screen for guest users
  if (isGuestUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Shop</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="storefront" size={24} color="white" />
          </View>
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="log-in-outline" size={80} color="#8B4513" />
          </View>
          
          <Text style={styles.guestTitle}>Login Required</Text>
          
          <Text style={styles.guestMessage}>
            You need to be logged in to browse shops and contact vendors. Please sign in to access this feature.
          </Text>

          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <Ionicons name="log-in" size={20} color="white" style={styles.signInIcon} />
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButtonGuest}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>Go Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCallPress = async (mobileNumber, vendorId) => {
    console.log('=== CALL FUNCTION ===');
    console.log('Attempting to call:', mobileNumber);
    console.log('Vendor ID:', vendorId);
    
    if (mobileNumber) {
      // Track call enquiry first
      await trackEnquiry(1, vendorId); // enquiry_type=1 for call
      
      // Then initiate the call
      Linking.openURL(`tel:${mobileNumber}`)
        .then(() => console.log('Call initiated successfully'))
        .catch(err => {
          console.error('Error initiating call:', err);
          Alert.alert('Error', 'Could not initiate call');
        });
    } else {
      console.log('No mobile number available');
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleWhatsAppPress = async (whatsappNumber, vendorId) => {
    console.log('=== WHATSAPP FUNCTION ===');
    console.log('Attempting to open WhatsApp for:', whatsappNumber);
    console.log('Vendor ID:', vendorId);
    
    if (whatsappNumber) {
      // Track WhatsApp enquiry first
      await trackEnquiry(2, vendorId); // enquiry_type=2 for WhatsApp
      
      const cleanedNumber = whatsappNumber.replace(/^\+?0?|\s+/g, '');
      const whatsappUrl = `https://wa.me/${cleanedNumber}`;
      
      console.log('WhatsApp URL:', whatsappUrl);
      
      Linking.openURL(whatsappUrl)
        .then(() => console.log('WhatsApp opened successfully'))
        .catch(err => {
          console.error('Error opening WhatsApp:', err);
          Alert.alert('Error', 'Could not open WhatsApp');
        });
    } else {
      console.log('No WhatsApp number available');
      Alert.alert('Error', 'WhatsApp number not available');
    }
  };

  // Function to filter vendors by search query
  const filterVendorsBySearch = (query) => {
    if (!query.trim()) {
      // If search is empty, show all vendors
      setFilteredVendors(vendors);
      return;
    }
    
    const filtered = vendors.filter(vendor => {
      const vendorName = vendor.name || '';
      return vendorName.toLowerCase().includes(query.toLowerCase());
    });
    
    // Sort alphabetically by name
    const sorted = filtered.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    setFilteredVendors(sorted);
  };

  // Handle search input change
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    filterVendorsBySearch(text);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredVendors(vendors);
  };

  // Clear all filters and reset to original vendor list
  const clearAllFilters = async () => {
    console.log('=============================================================');
    console.log('CLEARING ALL FILTERS');
    console.log('=============================================================');

    setLoading(true);
    
    // Clear selected types and brands
    setSelectedTypes([]);
    setSelectedBrands([]);
    
    try {
      // Fetch all vendors again (no filters)
      const vendorUrl = `vendor_list.php?category_id=${cat_id}&customer_id=${customer_id}`;
      
      console.log('=============================================================');
      console.log('FETCHING ALL VENDORS (NO FILTERS)');
      console.log('Vendor URL:', vendorUrl);
      console.log('=============================================================');
      
      const vendorsResponse = await api.get(vendorUrl);
      
      if (vendorsResponse.data.result === 'Success') {
        // Sort vendors alphabetically by name
        const sortedVendors = vendorsResponse.data.storeList.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setVendors(sortedVendors);
        setFilteredVendors(sortedVendors);
        
        console.log('=============================================================');
        console.log('ALL FILTERS CLEARED SUCCESSFULLY');
        console.log('Number of vendors:', sortedVendors.length);
        console.log('=============================================================');
      }
    } catch (error) {
      console.log('=============================================================');
      console.log('CLEAR FILTERS ERROR');
      console.log('Error:', error.message);
      console.log('=============================================================');
      Alert.alert('Error', 'Failed to clear filters');
    } finally {
      setLoading(false);
    }
  };

  console.log('=============================================================');
  console.log('Final cat_id:', cat_id);
  console.log('Final customer_id:', customer_id);
  console.log('Session data:', session);
  console.log('=============================================================');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!cat_id) {
          throw new Error('Missing category ID');
        }
        
        if (!customer_id) {
          throw new Error('Please login to view this category');
        }

        setLoading(true);
        
        const vendorUrl = `vendor_list.php?category_id=${cat_id}&customer_id=${customer_id}`;
        console.log('=============================================================');
        console.log('FETCHING VENDORS');
        console.log('Vendor URL:', vendorUrl);
        console.log('=============================================================');
        
        const vendorsResponse = await api.get(vendorUrl);
        
        console.log('=============================================================');
        console.log('VENDOR RESPONSE');
        console.log('Status:', vendorsResponse.status);
        console.log('Response Data:', JSON.stringify(vendorsResponse.data, null, 2));
        console.log('=============================================================');

        if (vendorsResponse.data.result === 'Success') {
          // Sort vendors alphabetically by name
          const sortedVendors = vendorsResponse.data.storeList.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          
          setVendors(sortedVendors);
          setFilteredVendors(sortedVendors);
          console.log('=============================================================');
          console.log('VENDORS SET SUCCESSFULLY');
          console.log('Number of vendors:', sortedVendors.length);
          console.log('=============================================================');
        } else {
          setError(vendorsResponse.data.text || 'Failed to fetch vendors');
          setVendors([]);
          setFilteredVendors([]);
          console.log('=============================================================');
          console.log('VENDOR FETCH FAILED');
          console.log('Error:', vendorsResponse.data.text);
          console.log('=============================================================');
        }

        setTypeLoading(true);
        const typesUrl = `type_list_customer.php?cat_id=${cat_id}&customer_id=${customer_id}`;
        console.log('=============================================================');
        console.log('FETCHING TYPES');
        console.log('Types URL:', typesUrl);
        console.log('=============================================================');
        
        const typesResponse = await api.get(typesUrl);
        
        console.log('=============================================================');
        console.log('TYPES RESPONSE');
        console.log('Status:', typesResponse.status);
        console.log('Response Data:', JSON.stringify(typesResponse.data, null, 2));
        console.log('=============================================================');

        if (typesResponse.data.result === 'Success') {
          setTypes(typesResponse.data.storeList);
          console.log('=============================================================');
          console.log('TYPES SET SUCCESSFULLY');
          console.log('Number of types:', typesResponse.data.storeList.length);
          console.log('=============================================================');
        } else {
          console.log('=============================================================');
          console.log('TYPES FETCH FAILED');
          console.log('Error:', typesResponse.data.text);
          console.log('=============================================================');
        }
      } catch (err) {
        setError(err.message);
        setVendors([]);
        setFilteredVendors([]);
        console.log('=============================================================');
        console.log('FETCH DATA ERROR');
        console.log('Error message:', err.message);
        console.log('Full error:', err);
        console.log('=============================================================');
      } finally {
        setLoading(false);
        setTypeLoading(false);
        console.log('=============================================================');
        console.log('FETCH DATA COMPLETED');
        console.log('Loading set to false');
        console.log('=============================================================');
      }
    };

    fetchData();
  }, [cat_id, customer_id]);

  const clearBrandFilter = () => {
    console.log('=============================================================');
    console.log('CLEARING BRAND FILTER');
    console.log('Previous selected brands:', selectedBrands);
    console.log('=============================================================');

    setSelectedBrands([]);
    setBrandModalVisible(false);

    console.log('=============================================================');
    console.log('BRAND FILTER CLEARED');
    console.log('Selected brands reset to empty array');
    console.log('Brand modal closed');
    console.log('=============================================================');
  };

  const fetchBrands = async (typeId) => {
    try {
      setBrandLoading(true);
      const brandUrl = `brand_list_customer.php?cat_id=${cat_id}&customer_id=${customer_id}&type_id=${typeId}`;
      console.log('=============================================================');
      console.log('FETCHING BRANDS');
      console.log('Brand URL:', brandUrl);
      console.log('Type ID:', typeId);
      console.log('=============================================================');
      
      const response = await api.get(brandUrl);
      
      console.log('=============================================================');
      console.log('BRAND RESPONSE');
      console.log('Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('=============================================================');
      
      if (response.data.result === 'Success') {
        setBrands(response.data.storeList);
        console.log('=============================================================');
        console.log('BRANDS SET SUCCESSFULLY');
        console.log('Number of brands:', response.data.storeList.length);
        console.log('=============================================================');
      } else {
        console.log('=============================================================');
        console.log('BRAND FETCH FAILED');
        console.log('Error:', response.data.text);
        console.log('=============================================================');
        setBrands([]);
      }
    } catch (err) {
      console.log('=============================================================');
      console.log('FETCH BRANDS ERROR');
      console.log('Error message:', err.message);
      console.log('Full error:', err);
      console.log('=============================================================');
      setBrands([]);
    } finally {
      setBrandLoading(false);
      console.log('=============================================================');
      console.log('FETCH BRANDS COMPLETED');
      console.log('Brand loading set to false');
      console.log('=============================================================');
    }
  };

  const toggleTypeSelection = (typeId) => {
    setSelectedTypes(prev => {
      const newSelection = prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId];
      
      console.log('=============================================================');
      console.log('TYPE SELECTION TOGGLED');
      console.log('Type ID:', typeId);
      console.log('Previous selection:', prev);
      console.log('New selection:', newSelection);
      console.log('=============================================================');
      
      return newSelection;
    });
  };

  const toggleBrandSelection = (brandId) => {
    setSelectedBrands((prev) => {
      const newSelection = prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId];
        
      console.log('=============================================================');
      console.log('BRAND SELECTION TOGGLED');
      console.log('Brand ID:', brandId);
      console.log('Previous selection:', prev);
      console.log('New selection:', newSelection);
      console.log('=============================================================');
      
      return newSelection;
    });
  };

  // Updated applyTypeFilter function
  const applyTypeFilter = async () => {
    setModalVisible(false);
    setLoading(true);
    
    console.log('=============================================================');
    console.log('APPLYING TYPE FILTER');
    console.log('Selected types:', selectedTypes);
    console.log('Selected brands:', selectedBrands);
    console.log('=============================================================');

    try {
      // Prepare type_id array format
      const typeIds = selectedTypes.length > 0 ? `[${selectedTypes.join(',')}]` : '[]';
      // Prepare brand_id array format
      const brandIds = selectedBrands.length > 0 ? `[${selectedBrands.join(',')}]` : '[]';
      
      // Use the correct endpoint for type+brand filtering
      const apiUrl = `search_brand_vendor_new.php?brand_id=${brandIds}&type_id=${typeIds}&customer_id=${customer_id}`;

      console.log('=============================================================');
      console.log('TYPE + BRAND FILTER API CALL');
      console.log('API URL:', apiUrl);
      console.log('Type IDs:', typeIds);
      console.log('Brand IDs:', brandIds);
      console.log('=============================================================');

      const response = await api.get(apiUrl);

      console.log('=============================================================');
      console.log('TYPE FILTER RESPONSE');
      console.log('Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('=============================================================');

      if (response.data.result === 'Success' && response.data.storeList) {
        // Sort vendors alphabetically by name
        const sortedVendors = response.data.storeList.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setVendors(sortedVendors);
        // Apply current search filter if any
        if (searchQuery.trim()) {
          filterVendorsBySearch(searchQuery);
        } else {
          setFilteredVendors(sortedVendors);
        }
        
        console.log('=============================================================');
        console.log('TYPE + BRAND FILTER APPLIED SUCCESSFULLY');
        console.log('Number of vendors after filter:', sortedVendors.length);
        console.log('=============================================================');
      } else {
        setVendors([]);
        setFilteredVendors([]);
        console.log('=============================================================');
        console.log('TYPE FILTER NO RESULTS');
        console.log('Setting vendors to empty array');
        console.log('=============================================================');
        Alert.alert('No vendors found for selected filters.');
      }
    } catch (error) {
      console.log('=============================================================');
      console.log('TYPE FILTER ERROR');
      console.log('Error message:', error.message);
      console.log('Full error:', error);
      console.log('=============================================================');
      Alert.alert('Error', 'Failed to apply filter.');
    } finally {
      setLoading(false);
      console.log('=============================================================');
      console.log('TYPE FILTER COMPLETED');
      console.log('Loading set to false');
      console.log('=============================================================');
    }
  };

  const clearTypeFilter = () => {
    console.log('=============================================================');
    console.log('CLEARING TYPE FILTER');
    console.log('Previous selected types:', selectedTypes);
    console.log('=============================================================');
    
    setSelectedTypes([]);
    setModalVisible(false);
    
    console.log('=============================================================');
    console.log('TYPE FILTER CLEARED');
    console.log('Selected types reset to empty array');
    console.log('Modal closed');
    console.log('=============================================================');
  };

  const handleBrandModalOpen = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Select Type First', 'Please select at least one type to see available brands.');
      return;
    }
    
    console.log('=============================================================');
    console.log('OPENING BRAND MODAL');
    console.log('Selected types:', selectedTypes);
    console.log('First selected type ID:', selectedTypes[0]);
    console.log('=============================================================');
    
    await fetchBrands(selectedTypes[0]);
    setBrandModalVisible(true);
    
    console.log('=============================================================');
    console.log('BRAND MODAL OPENED');
    console.log('=============================================================');
  };

  // Updated applyBrandFilter function
  const applyBrandFilter = async () => {
    try {
      setBrandModalVisible(false);
      
      // Instead of fetching from a different API, we'll just apply the brand filter
      // using the same logic as type filter since they work together
      console.log('=============================================================');
      console.log('APPLYING BRAND FILTER');
      console.log('Selected brands:', selectedBrands);
      console.log('=============================================================');

      // Show loading indicator
      setLoading(true);
      
      // Prepare brand_id array format
      const brandIds = selectedBrands.length > 0 ? `[${selectedBrands.join(',')}]` : '[]';
      // Prepare type_id array format (use selected types if any)
      const typeIds = selectedTypes.length > 0 ? `[${selectedTypes.join(',')}]` : '[]';
      
      // Use the correct endpoint
      const apiUrl = `search_brand_vendor_new.php?brand_id=${brandIds}&type_id=${typeIds}&customer_id=${customer_id}`;
      
      console.log('=============================================================');
      console.log('BRAND FILTER API CALL');
      console.log('API URL:', apiUrl);
      console.log('Brand IDs:', brandIds);
      console.log('Type IDs:', typeIds);
      console.log('=============================================================');
      
      const response = await api.get(apiUrl);

      console.log('=============================================================');
      console.log('BRAND FILTER RESPONSE');
      console.log('Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('=============================================================');

      if (response.data.result === 'Success' && response.data.storeList) {
        // Sort vendors alphabetically by name
        const sortedVendors = response.data.storeList.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setVendors(sortedVendors);
        // Apply current search filter if any
        if (searchQuery.trim()) {
          filterVendorsBySearch(searchQuery);
        } else {
          setFilteredVendors(sortedVendors);
        }
        
        console.log('=============================================================');
        console.log('BRAND FILTER APPLIED SUCCESSFULLY');
        console.log('Number of vendors:', sortedVendors.length);
        console.log('=============================================================');
        
        if (sortedVendors.length === 0) {
          Alert.alert('No Results', 'No vendors found for selected brands');
        }
      } else {
        setVendors([]);
        setFilteredVendors([]);
        console.log('=============================================================');
        console.log('BRAND FILTER NO RESULTS');
        console.log('Setting vendors to empty array');
        console.log('=============================================================');
        Alert.alert('No Results', 'No vendors found for selected brands');
      }
    } catch (error) {
      console.log('=============================================================');
      console.log('BRAND FILTER ERROR');
      console.log('Error message:', error.message);
      console.log('Full error:', error);
      console.log('=============================================================');
      Alert.alert('Error', 'Failed to apply brand filter');
    } finally {
      setLoading(false);
      console.log('=============================================================');
      console.log('BRAND FILTER COMPLETED');
      console.log('Loading set to false');
      console.log('=============================================================');
    }
  };

  const renderCard = ({ item }) => {
    console.log('=============================================================');
    console.log('RENDERING CARD');
    console.log('Item data:', JSON.stringify(item, null, 2));
    console.log('=============================================================');
    
    // Determine if dealer or vendor
    const isDealer = item.dealer === "1" || item.dealer === 1;
    const businessType = isDealer ? "Dealer" : "Vendor";
    const tagColor = isDealer ? "#2E7D32" : "#1976D2"; // Green for dealer, Blue for vendor
    
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <VendorImage
            imageUrl={item.shop_image}
            style={styles.logo}
            onPress={() => navigateToShopDetails(item)}
          />
          <View style={styles.textGroupContainer}>
            <TouchableOpacity
              onPress={() => navigateToShopDetails(item)}
              style={styles.cardTextContainer}
            >
              <View style={styles.textGroup}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.name}</Text>
                  <View style={[styles.businessTag, { backgroundColor: tagColor }]}>
                    <Text style={styles.businessTagText}>{businessType}</Text>
                  </View>
                </View>
                <Text style={styles.subText}>{item.distance} km away</Text>
                <Text style={styles.subText}>{item.city}</Text>
                <Text style={styles.subText}>{item.yera_of_exp} years of experience</Text>
                <Text style={styles.subText}>{item.enquery} enquiries answered</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleCallPress(item.mobile, item.id)}
          >
            <Ionicons name="call" size={16} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              console.log("enq params");
              
              console.log(cat_id, customer_id,  item.id,  item.name );
              
              router.push({
                pathname: '/components/Enquiry',
                params: { cat_id, customer_id, vendor_id: item.id, shop_name: item.name }
              });
            
            }}
          >
            <Ionicons name="information-circle" size={16} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Enquiry</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleWhatsAppPress(item.whatsapp, item.id)}
          >
            <Ionicons name="logo-whatsapp" size={16} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Shop</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading shops...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Shop</Text>
        </View>

        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={64} color="#8B4513" />
          <Text style={styles.errorTitle}>No Vendors Found</Text>
          <Text style={styles.errorMessage}>We couldn't find any vendors for this category.</Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Shop</Text>
        <View style={styles.headerIcon}>
          <Ionicons name="storefront" size={24} color="white" />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shops by name..."
          placeholderTextColor="#A0522D"
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#8B4513" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={styles.filterButton}
        >
          <Ionicons name="filter" size={18} color="#8B4513" />
          <Text style={styles.filterButtonText}>
            {selectedTypes.length > 0 ? `${selectedTypes.length} Types` : 'Filter Types'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#8B4513" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleBrandModalOpen} 
          style={styles.filterButton}
          disabled={selectedTypes.length === 0}
        >
          <Ionicons name="pricetag" size={18} color={selectedTypes.length === 0 ? '#CCCCCC' : '#8B4513'} />
          <Text style={[styles.filterButtonText, selectedTypes.length === 0 && styles.disabledButtonText]}>
            {selectedBrands.length > 0 ? `${selectedBrands.length} Brands` : 'Filter Brands'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={selectedTypes.length === 0 ? '#CCCCCC' : '#8B4513'} />
        </TouchableOpacity>

        {/* Reset filters button */}
        {(selectedTypes.length > 0 || selectedBrands.length > 0) && (
          <TouchableOpacity 
            onPress={clearAllFilters} 
            style={[styles.filterButton, styles.resetButton]}
          >
            <Ionicons name="close-circle" size={18} color="#FF6B6B" />
            <Text style={[styles.filterButtonText, styles.resetButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Vendors List */}
      {filteredVendors.length > 0 ? (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            searchQuery.trim() ? (
              <Text style={styles.searchResultsText}>
                Found {filteredVendors.length} shop{filteredVendors.length !== 1 ? 's' : ''} for "{searchQuery}"
              </Text>
            ) : null
          }
        />
      ) : (
        <View style={styles.noResults}>
          <Ionicons name="business-outline" size={64} color="#8B4513" />
          {searchQuery.trim() ? (
            <>
              <Text style={styles.noResultsText}>No shops found</Text>
              <Text style={styles.noResultsSubText}>No results for "{searchQuery}"</Text>
              <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.noResultsText}>No shops found</Text>
              <Text style={styles.noResultsSubText}>Try adjusting your filters</Text>
              {(selectedTypes.length > 0 || selectedBrands.length > 0) && (
                <TouchableOpacity onPress={clearAllFilters} style={styles.clearSearchButton}>
                  <Text style={styles.clearSearchButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* Types Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Types</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#8B4513" />
              </TouchableOpacity>
            </View>
            
            {typeLoading ? (
              <View style={styles.modalLoader}>
                <ActivityIndicator size="large" color="#8B4513" />
                <Text style={styles.loadingText}>Loading types...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {types.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.checkboxContainer,
                      selectedTypes.includes(type.id) && styles.selectedCheckboxContainer
                    ]}
                    onPress={() => toggleTypeSelection(type.id)}
                  >
                    <Checkbox
                      value={selectedTypes.includes(type.id)}
                      onValueChange={() => toggleTypeSelection(type.id)}
                      color={selectedTypes.includes(type.id) ? '#8B4513' : undefined}
                    />
                    <Text style={[
                      styles.checkboxLabel,
                      selectedTypes.includes(type.id) && styles.selectedCheckboxLabel
                    ]}>
                      {type.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                onPress={clearTypeFilter} 
                style={[styles.modalButton, styles.clearButton]}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={applyTypeFilter} 
                style={[styles.modalButton, styles.applyButton]}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Brand Modal */}
      <Modal visible={brandModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Brands</Text>
              <TouchableOpacity onPress={() => setBrandModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#8B4513" />
              </TouchableOpacity>
            </View>
            
            {brandLoading ? (
              <View style={styles.modalLoader}>
                <ActivityIndicator size="large" color="#8B4513" />
                <Text style={styles.loadingText}>Loading brands...</Text>
              </View>
            ) : brands.length > 0 ? (
              <FlatList
                data={brands}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isSelected = selectedBrands.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.brandOption,
                        isSelected && styles.selectedBrandOption
                      ]}
                      onPress={() => toggleBrandSelection(item.id)}
                    >
                      <Checkbox
                        value={isSelected}
                        onValueChange={() => toggleBrandSelection(item.id)}
                        color={isSelected ? '#8B4513' : undefined}
                      />
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.brandImage} 
                        resizeMode="contain"
                      />
                      <Text style={[
                        styles.brandText,
                        isSelected && styles.selectedBrandText
                      ]}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noBrandsContainer}>
                <Ionicons name="image-outline" size={48} color="#8B4513" />
                <Text style={styles.noBrandsText}>No brands available</Text>
                <Text style={styles.noBrandsSubText}>Select a type first to see brands</Text>
              </View>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                onPress={clearBrandFilter} 
                style={[styles.modalButton, styles.clearButton]}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyBrandFilter}
                style={[styles.modalButton, styles.applyButton]}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF8F0' 
  },
  
  // Header Styles
  header: {
    height: 120,
    backgroundColor: '#8B4513',
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: { 
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerText: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },

  // Guest user styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FAF0E6',
  },
  guestIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#D2B48C',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  guestMessage: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '80%',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  signInIcon: {
    marginRight: 10,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonGuest: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#8B4513',
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '500',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D2691E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 50,
  },
  searchIcon: { 
    marginRight: 12 
  },
  searchInput: { 
    flex: 1, 
    height: 50, 
    color: '#8B4513', 
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Search results text
  searchResultsText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '500',
    marginHorizontal: 10,
    marginBottom: 10,
    fontStyle: 'italic',
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 15,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D2691E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
    minWidth: 120,
    marginBottom: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
  resetButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#8B4513',
  },
  resetButtonText: {
    color: '#8B4513',
  },

  // List Container
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },

  // Card Styles
  card: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 7,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  textGroupContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  textGroup: {
    flex: 1,
    gap: 6,
  },
  // Title row with tag
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#8B4513',
    flex: 1,
    marginRight: 8,
  },
  // Business type tag
  businessTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessTagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  subText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 5,
    gap: 6,
    minHeight: 33,
  },
  buttonText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: '600',
  },
  icon: { 
    // Icon styling if needed
  },

  // Modal Styles
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalLoader: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  // Checkbox Styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectedCheckboxContainer: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedCheckboxLabel: {
    color: 'white',
    fontWeight: '600',
  },

  // Brand Styles
  brandOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectedBrandOption: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  brandImage: {
    width: 40,
    height: 40,
    marginLeft: 12,
    marginRight: 12,
  },
  brandText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedBrandText: {
    color: 'white',
    fontWeight: '600',
  },

  // Modal Buttons
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D2691E',
  },
  applyButton: {
    backgroundColor: '#8B4513',
  },
  clearButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading States
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#8B4513',
    fontSize: 16,
  },

  // Error States
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#8B4513',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // No Results States
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#8B4513',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  clearSearchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // No Brands State
  noBrandsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noBrandsText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  noBrandsSubText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});