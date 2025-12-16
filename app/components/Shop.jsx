import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
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

const { width, height } = Dimensions.get('window');

// Custom Image component with proper error handling
const VendorImage = ({ imageUrl, style, onPress }) => {
  const [imageError, setImageError] = useState(false);
  
  const isValidUrl = (url) => {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (url.trim() === '') return false;
    if (url === 'null' || url === 'undefined' || url === 'N/A') return false;
    if (!url.startsWith('http')) return false;
    
    if (url.includes('default.jpg') || url.includes('placeholder')) return false;
    
    return true;
  };

  const shouldLoadImage = isValidUrl(imageUrl);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Image
        source={shouldLoadImage && !imageError ? { uri: imageUrl } : logoimg}
        style={style}
        defaultSource={logoimg}
        onError={() => setImageError(true)}
      />
    </TouchableOpacity>
  );
};

export default function Shop() {
  const { session, isSessionLoaded, clearSession } = useContext(SessionContext);
  const router = useRouter();
  const params = useLocalSearchParams();

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
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [businessTypeDropdownVisible, setBusinessTypeDropdownVisible] = useState(false);
  const { cat_id, customer_id: paramCustomerId } = params;
  
  const isGuestUser = !session || 
                     !session.mobile || 
                     session.mobile === '' || 
                     session.id === 'guest_user' || 
                     session.type === 'guest';

  const customer_id = paramCustomerId || session?.id;

  const navigateToShopDetails = (item) => {
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
        dealer: item.dealer
      }
    });
  };

  const trackEnquiry = async (enquiryType, vendorId) => {
    try {
      await api.get('https://veebuilds.com/mobile/save_enquiry.php', {
        params: {
          user_id: customer_id,
          type: 1,
          enquiry_type: enquiryType,
          poi_id: vendorId
        }
      });
    } catch (error) {
      console.error('Error tracking enquiry:', error);
    }
  };

  const handleSignIn = async () => {
    if (isGuestUser) {
      await clearSession();
    }
    
    if (router.dismissAll) {
      router.dismissAll();
    }
    
    setTimeout(() => {
      router.replace({
        pathname: '/Login',
        params: { 
          fromShop: 'true',
          returnParams: JSON.stringify(params)
        }
      });
    }, 100);
  };

  const handleBackPress = () => {
    if (router.dismissAll) {
      router.dismissAll();
    }
    setTimeout(() => {
      router.replace('/components/Home');
    }, 100);
  };

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
    if (!mobileNumber || mobileNumber.trim() === '') {
      Alert.alert(
        'Phone Not Available',
        'This vendor has not provided a phone number.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    let cleanedNumber = mobileNumber.toString().trim();
    
    if (cleanedNumber.toLowerCase() === 'null' || 
        cleanedNumber.toLowerCase() === 'undefined' || 
        cleanedNumber === 'N/A' || 
        cleanedNumber === '') {
      Alert.alert(
        'Phone Not Available',
        'This vendor has not provided a valid phone number.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    cleanedNumber = cleanedNumber.replace(/\D/g, '');
    
    if (!cleanedNumber || cleanedNumber.trim() === '') {
      Alert.alert(
        'Invalid Number',
        'The phone number provided is not valid.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    let formattedNumber = cleanedNumber;
    
    if (formattedNumber.startsWith('91') && formattedNumber.length === 12) {
      formattedNumber = '0' + formattedNumber.substring(2);
    } else if (formattedNumber.length === 10) {
      formattedNumber = '0' + formattedNumber;
    }
    
    const telUrl = `tel:${formattedNumber}`;
    
    try {
      await trackEnquiry(1, vendorId);
    } catch (trackError) {
      console.log('Enquiry tracking failed:', trackError);
    }
    
    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      
      if (canOpen) {
        await Linking.openURL(telUrl);
      } else {
        Alert.alert(
          'Call Not Supported',
          'Phone calls are not supported on this device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Could not initiate call. Please check your phone settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleWhatsAppPress = async (whatsappNumber, mobileNumber, vendorId) => {
    let numberToUse = whatsappNumber;
    
    if (!numberToUse || 
        numberToUse.trim() === '' || 
        numberToUse.toLowerCase() === 'null' || 
        numberToUse === 'undefined' || 
        numberToUse === 'N/A') {
      
      Alert.alert(
        'WhatsApp Not Available',
        'This vendor hasn\'t provided a WhatsApp number. Would you like to try their mobile number instead?',
        [
          { 
            text: 'No Thanks', 
            style: 'cancel',
            onPress: () => {
              Alert.alert(
                'Try Calling Instead',
                'You can try calling the vendor directly using the Call button.',
                [{ text: 'OK' }]
              );
            }
          },
          { 
            text: 'Use Mobile Number', 
            onPress: () => {
              if (mobileNumber && 
                  mobileNumber.trim() !== '' && 
                  mobileNumber.toLowerCase() !== 'null' && 
                  mobileNumber !== 'undefined' && 
                  mobileNumber !== 'N/A') {
                handleWhatsAppPress(mobileNumber, '', vendorId);
              } else {
                Alert.alert(
                  'No Number Available',
                  'No contact number is available for this vendor.',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
      return;
    }
    
    let cleanedNumber = numberToUse.toString().trim();
    cleanedNumber = cleanedNumber.replace(/[^\d\+]/g, '');
    
    if (!cleanedNumber || cleanedNumber.trim() === '') {
      Alert.alert(
        'Invalid Number',
        'The WhatsApp number provided is not valid.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    let formattedNumber = cleanedNumber;
    
    if (formattedNumber.startsWith('+91')) {
      // Already formatted
    } else if (formattedNumber.startsWith('91') && formattedNumber.length === 12) {
      formattedNumber = '+' + formattedNumber;
    } else if (formattedNumber.startsWith('0')) {
      formattedNumber = '+91' + formattedNumber.substring(1);
    } else if (formattedNumber.length === 10) {
      formattedNumber = '+91' + formattedNumber;
    } else if (formattedNumber.length === 12 && !formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    
    try {
      await trackEnquiry(2, vendorId);
    } catch (trackError) {
      console.log('Enquiry tracking failed:', trackError);
    }
    
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp Not Installed',
          'WhatsApp is not installed on your device.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Install WhatsApp', 
              onPress: () => {
                Linking.openURL('market://details?id=com.whatsapp');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Could not open WhatsApp. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const filterVendorsBySearch = (query) => {
    if (!query.trim()) {
      if (businessTypeFilter === 'all') {
        setFilteredVendors(vendors);
      } else {
        const isDealerFilter = businessTypeFilter === 'dealer';
        const filtered = vendors.filter(vendor => {
          const isDealer = vendor.dealer === "1" || vendor.dealer === 1;
          return isDealerFilter ? isDealer : !isDealer;
        });
        setFilteredVendors(filtered);
      }
      return;
    }
    
    let initialFiltered = vendors;
    if (businessTypeFilter !== 'all') {
      const isDealerFilter = businessTypeFilter === 'dealer';
      initialFiltered = vendors.filter(vendor => {
        const isDealer = vendor.dealer === "1" || vendor.dealer === 1;
        return isDealerFilter ? isDealer : !isDealer;
      });
    }
    
    const filtered = initialFiltered.filter(vendor => {
      const vendorName = vendor.name || '';
      return vendorName.toLowerCase().includes(query.toLowerCase());
    });
    
    const sorted = filtered.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    setFilteredVendors(sorted);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    filterVendorsBySearch(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    filterVendorsBySearch('');
  };

  const applyBusinessTypeFilter = (type) => {
    setBusinessTypeFilter(type);
    
    if (type === 'all') {
      if (searchQuery.trim()) {
        filterVendorsBySearch(searchQuery);
      } else {
        setFilteredVendors(vendors);
      }
    } else {
      const isDealerFilter = type === 'dealer';
      const filtered = vendors.filter(vendor => {
        const isDealer = vendor.dealer === "1" || vendor.dealer === 1;
        return isDealerFilter ? isDealer : !isDealer;
      });
      
      const searchFiltered = searchQuery.trim() 
        ? filtered.filter(vendor => 
            (vendor.name || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        : filtered;
      
      setFilteredVendors(searchFiltered);
    }
  };

  const clearAllFilters = async () => {
    setLoading(true);
    
    setSelectedTypes([]);
    setSelectedBrands([]);
    setBusinessTypeFilter('all');
    setBusinessTypeDropdownVisible(false);
    setSearchQuery('');
    
    try {
      const vendorUrl = `vendor_list.php?category_id=${cat_id}&customer_id=${customer_id}`;
      
      const vendorsResponse = await api.get(vendorUrl);
      
      if (vendorsResponse.data.result === 'Success') {
        setVendors(vendorsResponse.data.storeList);
        setFilteredVendors(vendorsResponse.data.storeList);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to clear filters');
    } finally {
      setLoading(false);
    }
  };
  
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
        setBusinessTypeFilter('all');
        
        const vendorUrl = `vendor_list.php?category_id=${cat_id}&customer_id=${customer_id}`;
        const vendorsResponse = await api.get(vendorUrl);

        if (vendorsResponse.data.result === 'Success') {
          setVendors(vendorsResponse.data.storeList);
          setFilteredVendors(vendorsResponse.data.storeList);
        } else {
          setError(vendorsResponse.data.text || 'Failed to fetch vendors');
          setVendors([]);
          setFilteredVendors([]);
        }

        setTypeLoading(true);
        const typesUrl = `type_list_customer.php?cat_id=${cat_id}&customer_id=${customer_id}`;
        const typesResponse = await api.get(typesUrl);

        if (typesResponse.data.result === 'Success') {
          setTypes(typesResponse.data.storeList);
        }
      } catch (err) {
        setError(err.message);
        setVendors([]);
        setFilteredVendors([]);
      } finally {
        setLoading(false);
        setTypeLoading(false);
      }
    };

    fetchData();
  }, [cat_id, customer_id]);

  const clearBrandFilter = () => {
    setSelectedBrands([]);
    setBrandModalVisible(false);
  };

  const fetchBrands = async (typeId) => {
    try {
      setBrandLoading(true);
      const brandUrl = `brand_list_customer.php?cat_id=${cat_id}&customer_id=${customer_id}&type_id=${typeId}`;
      
      const response = await api.get(brandUrl);
      
      if (response.data.result === 'Success') {
        setBrands(response.data.storeList);
      } else {
        setBrands([]);
      }
    } catch (err) {
      setBrands([]);
    } finally {
      setBrandLoading(false);
    }
  };

  const toggleTypeSelection = (typeId) => {
    setSelectedTypes(prev => {
      return prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId];
    });
  };

  const toggleBrandSelection = (brandId) => {
    setSelectedBrands((prev) => {
      return prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId];
    });
  };

  const applyTypeFilter = async () => {
    setModalVisible(false);
    setLoading(true);
    
    try {
      const typeIds = selectedTypes.length > 0 ? `[${selectedTypes.join(',')}]` : '[]';
      const brandIds = selectedBrands.length > 0 ? `[${selectedBrands.join(',')}]` : '[]';
      
      const apiUrl = `search_brand_vendor_new.php?brand_id=${brandIds}&type_id=${typeIds}&customer_id=${customer_id}`;

      const response = await api.get(apiUrl);

      if (response.data.result === 'Success' && response.data.storeList) {
        if (businessTypeFilter !== 'all') {
          const isDealerFilter = businessTypeFilter === 'dealer';
          const businessFiltered = response.data.storeList.filter(vendor => {
            const isDealer = vendor.dealer === "1" || vendor.dealer === 1;
            return isDealerFilter ? isDealer : !isDealer;
          });
          setVendors(businessFiltered);
          if (searchQuery.trim()) {
            filterVendorsBySearch(searchQuery);
          } else {
            setFilteredVendors(businessFiltered);
          }
        } else {
          setVendors(response.data.storeList);
          if (searchQuery.trim()) {
            filterVendorsBySearch(searchQuery);
          } else {
            setFilteredVendors(response.data.storeList);
          }
        }
      } else {
        setVendors([]);
        setFilteredVendors([]);
        Alert.alert('No vendors found for selected filters.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply filter.');
    } finally {
      setLoading(false);
    }
  };

  const clearTypeFilter = () => {
    setSelectedTypes([]);
    setModalVisible(false);
  };

  const handleBrandModalOpen = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Select Type First', 'Please select at least one type to see available brands.');
      return;
    }
    
    await fetchBrands(selectedTypes[0]);
    setBrandModalVisible(true);
  };

  const applyBrandFilter = async () => {
    try {
      setBrandModalVisible(false);
      setLoading(true);
      
      const brandIds = selectedBrands.length > 0 ? `[${selectedBrands.join(',')}]` : '[]';
      const typeIds = selectedTypes.length > 0 ? `[${selectedTypes.join(',')}]` : '[]';
      
      const apiUrl = `search_brand_vendor_new.php?brand_id=${brandIds}&type_id=${typeIds}&customer_id=${customer_id}`;
      
      const response = await api.get(apiUrl);

      if (response.data.result === 'Success' && response.data.storeList) {
        if (businessTypeFilter !== 'all') {
          const isDealerFilter = businessTypeFilter === 'dealer';
          const businessFiltered = response.data.storeList.filter(vendor => {
            const isDealer = vendor.dealer === "1" || vendor.dealer === 1;
            return isDealerFilter ? isDealer : !isDealer;
          });
          setVendors(businessFiltered);
          if (searchQuery.trim()) {
            filterVendorsBySearch(searchQuery);
          } else {
            setFilteredVendors(businessFiltered);
          }
        } else {
          setVendors(response.data.storeList);
          if (searchQuery.trim()) {
            filterVendorsBySearch(searchQuery);
          } else {
            setFilteredVendors(response.data.storeList);
          }
        }
        
        if (response.data.storeList.length === 0) {
          Alert.alert('No Results', 'No vendors found for selected brands');
        }
      } else {
        setVendors([]);
        setFilteredVendors([]);
        Alert.alert('No Results', 'No vendors found for selected brands');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply brand filter');
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }) => {
    const isDealer = item.dealer === "1" || item.dealer === 1;
    const businessType = isDealer ? "Dealer" : "Vendor";
    const tagColor = isDealer ? "#2E7D32" : "#1976D2";
    
    const hasMobile = item.mobile && 
                     item.mobile.trim() !== '' && 
                     item.mobile.toLowerCase() !== 'null' && 
                     item.mobile !== 'undefined' && 
                     item.mobile !== 'N/A';
    
    const hasWhatsApp = item.whatsapp && 
                       item.whatsapp.trim() !== '' && 
                       item.whatsapp.toLowerCase() !== 'null' && 
                       item.whatsapp !== 'undefined' && 
                       item.whatsapp !== 'N/A';
    
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
            style={[
              styles.button,
              !hasMobile && styles.disabledButton
            ]} 
            onPress={() => {
              if (hasMobile) {
                handleCallPress(item.mobile, item.id);
              } else {
                Alert.alert(
                  'Phone Not Available',
                  'This vendor has not provided a phone number.',
                  [{ text: 'OK' }]
                );
              }
            }}
            disabled={!hasMobile}
          >
            <Ionicons 
              name="call" 
              size={16} 
              color={!hasMobile ? '#AAAAAA' : 'white'} 
              style={styles.icon} 
            />
            <Text style={[
              styles.buttonText,
              !hasMobile && styles.disabledButtonText
            ]}>
              Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
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
            style={[
              styles.button,
              (!hasMobile && !hasWhatsApp) && styles.disabledButton
            ]} 
            onPress={() => {
              if (hasWhatsApp || hasMobile) {
                handleWhatsAppPress(item.whatsapp, item.mobile, item.id);
              } else {
                Alert.alert(
                  'No Contact Available',
                  'This vendor has not provided any contact number.',
                  [{ text: 'OK' }]
                );
              }
            }}
            disabled={!hasMobile && !hasWhatsApp}
          >
            <Ionicons 
              name="logo-whatsapp" 
              size={16} 
              color={(!hasMobile && !hasWhatsApp) ? '#AAAAAA' : 'white'} 
              style={styles.icon} 
            />
            <Text style={[
              styles.buttonText,
              (!hasMobile && !hasWhatsApp) && styles.disabledButtonText
            ]}>
              WhatsApp
            </Text>
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
        {/* Type Filter Button */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={[
            styles.filterButton,
            selectedTypes.length > 0 && styles.activeFilterButton
          ]}
        >
          <Ionicons 
            name="filter" 
            size={18} 
            color={selectedTypes.length > 0 ? 'white' : '#8B4513'} 
          />
          <Text style={[
            styles.filterButtonText,
            selectedTypes.length > 0 && styles.activeFilterButtonText
          ]}>
            {selectedTypes.length > 0 ? `${selectedTypes.length} Types` : 'Types'}
          </Text>
          {selectedTypes.length > 0 && (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                clearTypeFilter();
              }}
              style={styles.filterClearIcon}
            >
              <Ionicons name="close-circle" size={14} color="white" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Brand Filter Button */}
        <TouchableOpacity 
          onPress={handleBrandModalOpen} 
          style={[
            styles.filterButton,
            selectedBrands.length > 0 && styles.activeFilterButton,
            selectedTypes.length === 0 && styles.disabledFilterButton
          ]}
          disabled={selectedTypes.length === 0}
        >
          <Ionicons 
            name="pricetag" 
            size={18} 
            color={selectedTypes.length === 0 ? '#CCCCCC' : selectedBrands.length > 0 ? 'white' : '#8B4513'} 
          />
          <Text style={[
            styles.filterButtonText,
            selectedTypes.length === 0 && styles.disabledFilterButtonText,
            selectedBrands.length > 0 && styles.activeFilterButtonText
          ]}>
            {selectedBrands.length > 0 ? `${selectedBrands.length} Brands` : 'Brands'}
          </Text>
          {selectedBrands.length > 0 && selectedTypes.length > 0 && (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                clearBrandFilter();
              }}
              style={styles.filterClearIcon}
            >
              <Ionicons name="close-circle" size={14} color="white" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Business Type Filter */}
        <View style={styles.businessTypeContainer}>
          <TouchableOpacity 
            onPress={() => {
              setBusinessTypeDropdownVisible(!businessTypeDropdownVisible);
            }} 
            style={[
              styles.filterButton,
              businessTypeFilter !== 'all' && styles.activeFilterButton
            ]}
          >
            <Ionicons 
              name="business" 
              size={18} 
              color={businessTypeFilter !== 'all' ? 'white' : '#8B4513'} 
            />
            <Text style={[
              styles.filterButtonText,
              businessTypeFilter !== 'all' && styles.activeFilterButtonText
            ]}>
              {businessTypeFilter === 'all' ? 'Business' : 
               businessTypeFilter === 'dealer' ? 'Dealers' : 'Vendors'}
            </Text>
            {businessTypeFilter !== 'all' && (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  applyBusinessTypeFilter('all');
                }}
                style={styles.filterClearIcon}
              >
                <Ionicons name="close-circle" size={14} color="white" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {businessTypeDropdownVisible && (
            <View style={styles.businessTypeDropdown}>
              <TouchableOpacity 
                style={[
                  styles.businessTypeOption,
                  businessTypeFilter === 'all' && styles.selectedBusinessTypeOption
                ]}
                onPress={() => {
                  applyBusinessTypeFilter('all');
                  setBusinessTypeDropdownVisible(false);
                }}
              >
                <View style={[
                  styles.radioCircle,
                  businessTypeFilter === 'all' && styles.selectedRadioCircle
                ]}>
                  {businessTypeFilter === 'all' && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={[
                  styles.businessTypeOptionText,
                  businessTypeFilter === 'all' && styles.selectedBusinessTypeOptionText
                ]}>
                  All
                </Text>
                <Text style={styles.businessTypeCount}>
                  ({vendors.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.businessTypeOption,
                  businessTypeFilter === 'dealer' && styles.selectedBusinessTypeOption
                ]}
                onPress={() => {
                  applyBusinessTypeFilter('dealer');
                  setBusinessTypeDropdownVisible(false);
                }}
              >
                <View style={[
                  styles.radioCircle,
                  businessTypeFilter === 'dealer' && styles.selectedRadioCircle
                ]}>
                  {businessTypeFilter === 'dealer' && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={[
                  styles.businessTypeOptionText,
                  businessTypeFilter === 'dealer' && styles.selectedBusinessTypeOptionText
                ]}>
                  Dealers Only
                </Text>
                <Text style={styles.businessTypeCount}>
                  ({vendors.filter(v => v.dealer === "1" || v.dealer === 1).length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.businessTypeOption,
                  businessTypeFilter === 'vendor' && styles.selectedBusinessTypeOption
                ]}
                onPress={() => {
                  applyBusinessTypeFilter('vendor');
                  setBusinessTypeDropdownVisible(false);
                }}
              >
                <View style={[
                  styles.radioCircle,
                  businessTypeFilter === 'vendor' && styles.selectedRadioCircle
                ]}>
                  {businessTypeFilter === 'vendor' && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={[
                  styles.businessTypeOptionText,
                  businessTypeFilter === 'vendor' && styles.selectedBusinessTypeOptionText
                ]}>
                  Vendors Only
                </Text>
                <Text style={styles.businessTypeCount}>
                  ({vendors.filter(v => !(v.dealer === "1" || v.dealer === 1)).length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Reset Button - Only shown when filters are active */}
        {(selectedTypes.length > 0 || selectedBrands.length > 0 || businessTypeFilter !== 'all' || searchQuery.trim() !== '') && (
          <TouchableOpacity 
            onPress={clearAllFilters} 
            style={[styles.resetButton]}
          >
            <Ionicons name="close-circle" size={14} color="#FF6B6B" />
            <Text style={styles.resetButtonText}>Reset</Text>
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
              {(selectedTypes.length > 0 || selectedBrands.length > 0 || businessTypeFilter !== 'all') && (
                <TouchableOpacity onPress={clearAllFilters} style={styles.clearSearchButton}>
                  <Text style={styles.clearSearchButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* Types Modal */}
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
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
      <Modal 
        visible={brandModalVisible} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setBrandModalVisible(false)}
      >
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
    height: Platform.OS === 'ios' ? 120 : 100,
    backgroundColor: '#8B4513',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  backButton: { 
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerText: { 
    color: 'white', 
    fontSize: Platform.OS === 'ios' ? 24 : 20, 
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
    paddingHorizontal: 24,
    backgroundColor: '#FAF0E6',
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
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
    fontSize: Platform.OS === 'ios' ? 24 : 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  guestMessage: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 22 : 20,
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
    minHeight: 56,
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
    fontSize: Platform.OS === 'ios' ? 16 : 14,
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
    minHeight: 52,
  },
  backButtonText: {
    color: '#8B4513',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '500',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2691E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: Platform.OS === 'ios' ? 50 : 48,
    minHeight: 48,
  },
  searchIcon: { 
    marginRight: 12 
  },
  searchInput: { 
    flex: 1, 
    height: '100%', 
    color: '#8B4513', 
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Search results text
  searchResultsText: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    color: '#8B4513',
    fontWeight: '500',
    marginHorizontal: 16,
    marginBottom: 12,
    fontStyle: 'italic',
  },

  // Filter Row - Fixed to prevent button size changes
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  // Main filter buttons - Consistent size
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D2691E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
    height: 40,
    minWidth: 100,
    maxWidth: 140,
    flexShrink: 1,
    position: 'relative',
  },
  
  // Disabled filter button
  disabledFilterButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  
  disabledFilterButtonText: {
    color: '#CCCCCC',
  },
  
  // Active filter button
  activeFilterButton: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
    paddingRight: 30, // Extra space for clear icon
  },
  
  filterButtonText: {
    fontSize: Platform.OS === 'ios' ? 12 : 11,
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  
  activeFilterButtonText: {
    color: 'white',
  },
  
  // Clear icon inside filter button
  filterClearIcon: {
    position: 'absolute',
    right: 6,
    padding: 2,
  },
  
  // Reset button - Smaller separate button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
    height: 32,
    minWidth: 70,
    marginLeft: 'auto',
  },
  
  resetButtonText: {
    fontSize: Platform.OS === 'ios' ? 11 : 10,
    color: '#FF6B6B',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Business Type Filter Styles
  businessTypeContainer: {
    position: 'relative',
    zIndex: 100,
    minWidth: 100,
    maxWidth: 140,
    flexShrink: 0,
  },
  
  businessTypeDropdown: {
position: 'absolute',
  top: '100%', // Changed from '100%' to 42 to position below the button
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#D2691E',
  marginTop: 4, // Small gap from the button
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 5,
  zIndex: 1000,
  maxHeight: height * 0.3,
  minWidth: 140,
  },
  
  businessTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    minHeight: 48,
  },
  
  selectedBusinessTypeOption: {
    backgroundColor: '#FFF8F0',
  },
  
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectedRadioCircle: {
    borderColor: '#8B4513',
  },
  
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B4513',
  },
  
  businessTypeOptionText: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    color: '#8B4513',
    flex: 1,
  },
  
  selectedBusinessTypeOptionText: {
    fontWeight: '600',
    color: '#8B4513',
  },
  
  businessTypeCount: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    color: '#A0522D',
    fontStyle: 'italic',
    marginLeft: 4,
  },

  // List Container
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 4,
    flexGrow: 1,
  },

  // Card Styles
  card: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 200,
  },
  
  cardContent: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    maxWidth: 120,
    maxHeight: 120,
    minWidth: 100,
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  
  textGroupContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    minHeight: width * 0.3,
  },
  
  cardTextContainer: {
    flex: 1,
  },
  
  textGroup: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  
  title: {
    fontWeight: 'bold',
    fontSize: Platform.OS === 'ios' ? 15 : 14,
    color: '#8B4513',
    flex: 1,
    marginRight: 8,
    lineHeight: Platform.OS === 'ios' ? 20 : 18,
  },
  
  businessTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 2,
  },
  
  businessTagText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 10 : 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  subText: {
    fontSize: Platform.OS === 'ios' ? 13 : 12,
    color: '#666',
    lineHeight: Platform.OS === 'ios' ? 18 : 16,
    marginBottom: 4,
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
    minHeight: 40,
  },
  
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#AAAAAA',
  },
  
  buttonText: { 
    color: 'white', 
    fontSize: Platform.OS === 'ios' ? 12 : 11, 
    fontWeight: '600',
  },
  
  disabledButtonText: {
    color: '#888888',
  },
  
  icon: { 
    // Icon styling
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
    maxHeight: height * 0.8,
    minHeight: height * 0.5,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  
  modalTitle: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  
  closeButton: {
    padding: 4,
  },
  
  modalScrollView: {
    maxHeight: height * 0.5,
    paddingHorizontal: 4,
  },
  
  modalLoader: {
    alignItems: 'center',
    paddingVertical: 40,
    justifyContent: 'center',
    minHeight: 200,
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
    minHeight: 56,
  },
  
  selectedCheckboxContainer: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  
  checkboxLabel: {
    marginLeft: 12,
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#333',
    flex: 1,
    lineHeight: Platform.OS === 'ios' ? 22 : 20,
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
    minHeight: 56,
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
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#333',
    flex: 1,
    lineHeight: Platform.OS === 'ios' ? 22 : 20,
  },
  
  selectedBrandText: {
    color: 'white',
    fontWeight: '600',
  },

  // Modal Buttons - Fixed positioning to prevent hiding
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#FFF8F0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    position: 'relative',
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
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
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
  },
  
  applyButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
  },

  // Loading States
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  
  loadingText: {
    marginTop: 12,
    color: '#8B4513',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
  },

  // Error States
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 60,
  },
  
  errorTitle: {
    color: '#8B4513',
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  
  errorMessage: {
    color: '#666',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: Platform.OS === 'ios' ? 22 : 20,
  },
  
  errorButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 52,
    minWidth: 150,
  },
  
  errorButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // No Results States
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 60,
  },
  
  noResultsText: {
    color: '#8B4513',
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  
  noResultsSubText: {
    color: '#666',
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  clearSearchButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    minHeight: 44,
    minWidth: 150,
  },
  
  clearSearchButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // No Brands State
  noBrandsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    justifyContent: 'center',
    minHeight: 200,
  },
  
  noBrandsText: {
    color: '#8B4513',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  
  noBrandsSubText: {
    color: '#666',
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    textAlign: 'center',
  },
});