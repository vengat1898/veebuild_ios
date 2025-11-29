import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from "../services/api";

export default function Shopdetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const vendor_id = params.vendor_id || params.vendor || params.id;
  const cat_id = params.cat_id || params.category_id || 'unknown_category';
  const customer_id = params.customer_id || params.user_id || 'unknown_customer';

  const [activeTab, setActiveTab] = useState('Quick Info');
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`vendor_details.php?vendor_id=${vendor_id}`);
        if (response.data?.result === "Success" && response.data.storeList?.length > 0) {
          setVendorData(response.data.storeList[0]);
        } else {
          Alert.alert('Error', response.data?.text || 'No vendor details found');
        }
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [vendor_id]);

  // Function to track enquiry
  const trackEnquiry = async (enquiryType) => {
    try {
      const response = await api.get('https://veebuilds.com/mobile/save_enquiry.php', {
        params: {
          user_id: customer_id,
          type: 1, // Assuming type=1 for vendor enquiries
          enquiry_type: enquiryType, // 1 for call, 2 for WhatsApp
          poi_id: vendor_id
        }
      });

      if (response.data?.status === true) {
        console.log(`Enquiry tracked successfully for type: ${enquiryType}`);
      } else {
        console.log('Enquiry tracking failed:', response.data?.message);
      }
    } catch (error) {
      console.error('Error tracking enquiry:', error);
      // Don't show alert for tracking errors as it might interrupt user flow
    }
  };

  const handleCall = async () => {
    if (vendorData?.mobile) {
      // Track call enquiry first
      await trackEnquiry(1); // enquiry_type=1 for call
      
      // Then initiate the call
      Linking.openURL(`tel:${vendorData.mobile}`);
    } else {
      Alert.alert('No phone number available');
    }
  };

  const handleWhatsApp = async () => {
    const number = vendorData?.whatsapp || vendorData?.mobile;
    if (number) {
      // Track WhatsApp enquiry first
      await trackEnquiry(2); // enquiry_type=2 for WhatsApp
      
      // Then open WhatsApp
      const whatsappNumber = number.startsWith('91') ? number : `91${number}`;
      Linking.openURL(`https://wa.me/${whatsappNumber}`);
    } else {
      Alert.alert('No WhatsApp number available');
    }
  };

  const handleEnquiry = () => {
    if (!vendorData) {
      Alert.alert('Error', 'Vendor information not loaded');
      return;
    }

    router.push({
      pathname: '/components/Enquiry',
      params: {
        vendor_id,
        cat_id,
        customer_id,
        shopName: vendorData.name || '',
        shopImage: vendorData.shop_image || '',
        mobile: vendorData.mobile || '',
        whatsapp: vendorData.whatsapp || '',
        email: vendorData.email || '',
        experience: vendorData.yera_of_exp || '',
        location: vendorData.location || '',
        city: vendorData.city || '',
        state: vendorData.state || '',
        country: vendorData.country || ''
      }
    });
  };

  const styles = createStyles(windowWidth, windowHeight);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading Shop Details...</Text>
      </View>
    );
  }

  if (!vendorData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#8B4513" />
        <Text style={styles.errorText}>Failed to load vendor details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* StatusBar setup */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with dynamic padding for status bar */}
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#D2691E']}
        style={[
          styles.header,
          { paddingTop: insets.top, height: insets.top + 70 }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Shop Details</Text>
          <Text style={styles.headerSubText}>Discover more about this shop</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Shop Card */}
        <View style={styles.shopCard}>
          <View style={styles.logoContainer}>
            <Image
              source={vendorData.shop_image ? { uri: vendorData.shop_image } : require('../../assets/images/veebuilder.png')}
              style={styles.logo}
              resizeMode="cover"
            />
            <View style={styles.logoOverlay} />
          </View>

          <View style={styles.shopInfo}>
            <Text style={styles.nameText}>{vendorData.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#8B4513" />
              <Text style={styles.detailText}>{params.distance || vendorData.distance || 0} km away</Text>
            </View>
            {vendorData.city && (
              <View style={styles.detailItem}>
                <Ionicons name="business-outline" size={16} color="#8B4513" />
                <Text style={styles.detailText}>{vendorData.city}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#8B4513" />
              <Text style={styles.detailText}>{vendorData.enquery || 0} enquiries</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="trophy-outline" size={16} color="#8B4513" />
              <Text style={styles.detailText}>{vendorData.yera_of_exp || 0} years exp</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {vendorData.location && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="map-outline" size={20} color="#8B4513" />
                <Text style={styles.sectionHeading}>Address</Text>
              </View>
              <Text style={styles.addressText}>{vendorData.location}</Text>
              <View style={styles.separator} />
            </>
          )}

          {/* Tabs Section */}
          <View style={styles.tabsContainer}>
            {['Quick Info', 'Overview', 'Photos'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'Quick Info' && (
              <View style={styles.infoGrid}>
                {vendorData.mobile && (
                  <View style={styles.infoCard}>
                    <Ionicons name="call-outline" size={24} color="#8B4513" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoHeading}>Mobile</Text>
                      <Text style={styles.infoText}>{vendorData.mobile}</Text>
                    </View>
                  </View>
                )}
                {vendorData.email && (
                  <View style={styles.infoCard}>
                    <Ionicons name="mail-outline" size={24} color="#8B4513" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoHeading}>Email</Text>
                      <Text style={styles.infoText}>{vendorData.email}</Text>
                    </View>
                  </View>
                )}
                {vendorData.year_established && (
                  <View style={styles.infoCard}>
                    <Ionicons name="calendar-outline" size={24} color="#8B4513" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoHeading}>Year Established</Text>
                      <Text style={styles.infoText}>{vendorData.year_established}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'Overview' && (
              <View style={styles.infoGrid}>
                {vendorData.no_of_emp && (
                  <View style={styles.infoCard}>
                    <Ionicons name="people-outline" size={24} color="#8B4513" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoHeading}>Number of Employees</Text>
                      <Text style={styles.infoText}>{vendorData.no_of_emp}</Text>
                    </View>
                  </View>
                )}
                {vendorData.gstnumber && (
                  <View style={styles.infoCard}>
                    <Ionicons name="document-outline" size={24} color="#8B4513" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoHeading}>GST Number</Text>
                      <Text style={styles.infoText}>{vendorData.gstnumber}</Text>
                    </View>
                  </View>
                )}
                {vendorData.turn_over && (
                  <View style={styles.infoCard}>
                    <Ionicons name="trending-up-outline" size={24} color="#8B4513" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoHeading}>Turn Over</Text>
                      <Text style={styles.infoText}>{vendorData.turn_over}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'Photos' && (
              <View style={styles.photoContainer}>
                {vendorData.shop_image ? (
                  <Image
                    source={{ uri: vendorData.shop_image }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noPhotosContainer}>
                    <Ionicons name="images-outline" size={64} color="#8B4513" />
                    <Text style={styles.noPhotosText}>No photos available</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
        style={styles.buttonContainer}
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall}>
            <Ionicons name="call" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.enquiryButton]} onPress={handleEnquiry}>
            <Ionicons name="information-circle" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Enquiry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.whatsappButton]} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (windowWidth, windowHeight) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FAF0E6',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#8B4513',
      fontWeight: '500',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#FAF0E6',
    },
    errorText: {
      fontSize: 16,
      color: '#8B4513',
      marginBottom: 20,
      textAlign: 'center',
      marginTop: 16,
    },
    header: {
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerBackButton: {
      marginRight: 15,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      padding: 8,
    },
    headerContent: {
      flex: 1,
    },
    headerText: {
      color: 'white',
      fontSize: 22,
      fontWeight: 'bold',
    },
    headerSubText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
      marginTop: 2,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    shopCard: {
      backgroundColor: 'white',
      margin: 16,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    logoContainer: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: 16,
    },
    logo: {
      width: windowWidth * 0.3,
      height: windowWidth * 0.3,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#8B4513',
    },
    logoOverlay: {
      position: 'absolute',
      bottom: -5,
      width: '100%',
      height: 1,
      backgroundColor: 'rgba(139, 69, 19, 0.1)',
      borderRadius: 5,
    },
    shopInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    nameText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF8E1',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    ratingText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#8B4513',
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FAF0E6',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      marginBottom: 8,
      minWidth: '48%',
    },
    detailText: {
      fontSize: 12,
      color: '#8B4513',
      marginLeft: 6,
      fontWeight: '500',
    },
    contentContainer: {
      backgroundColor: 'white',
      margin: 16,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionHeading: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginLeft: 8,
    },
    addressText: {
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
      marginBottom: 16,
    },
    separator: {
      height: 1,
      backgroundColor: '#F0F0F0',
      marginVertical: 16,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: '#FAF0E6',
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      position: 'relative',
    },
    activeTabButton: {
      backgroundColor: 'white',
      borderRadius: 8,
      shadowColor: '#8B4513',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      color: '#8B4513',
      fontWeight: '500',
    },
    activeTabText: {
      color: '#8B4513',
      fontWeight: 'bold',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: -4,
      width: 20,
      height: 3,
      backgroundColor: '#8B4513',
      borderRadius: 2,
    },
    tabContent: {
      marginBottom: 20,
    },
    infoGrid: {
      gap: 12,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FAF0E6',
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#8B4513',
    },
    infoContent: {
      marginLeft: 12,
      flex: 1,
    },
    infoHeading: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    infoText: {
      fontSize: 16,
      color: '#8B4513',
      fontWeight: '500',
    },
    photoContainer: {
      width: '100%',
      height: 200,
      backgroundColor: '#FAF0E6',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    noPhotosContainer: {
      alignItems: 'center',
    },
    noPhotosText: {
      fontSize: 14,
      color: '#8B4513',
      marginTop: 8,
    },
    buttonContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      flex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    callButton: {
      backgroundColor: '#8B4513',
    },
    enquiryButton: {
      backgroundColor: '#A0522D',
    },
    whatsappButton: {
      backgroundColor: '#25D366',
    },
    buttonIcon: {
      marginRight: 8,
    },
    buttonText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    },
    backButton: {
      backgroundColor: '#8B4513',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    backButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });