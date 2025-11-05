import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function Landdetails() {
  const router = useRouter();
  const { session, isSessionLoaded, clearSession } = useContext(SessionContext);
  const { id, cat_id, customer_id } = useLocalSearchParams();
  const [landDetails, setLandDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Check if user is a guest (no proper mobile number)
  const isGuestUser = !session || 
                     !session.mobile || 
                     session.mobile === '' || 
                     session.id === 'guest_user' || 
                     session.type === 'guest';

  // Handle sign in for guest users - COMPLETE NAVIGATION RESET
  const handleSignIn = async () => {
    console.log("Sign in clicked from Land Details");
    
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
          fromLandDetails: 'true',
          returnParams: JSON.stringify({ id, cat_id, customer_id })
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

  useEffect(() => {
    api.get('all_land_list.php')
      .then(response => {
        const land = response.data.storeList.find(item => item.id === id);
        setLandDetails(land);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching land details:', error);
        setLoading(false);
      });
  }, [id]);

  const getFirstImageUrl = () => {
    if (!landDetails?.siteimg) return null;
    
    try {
      if (typeof landDetails.siteimg === 'string' && !landDetails.siteimg.startsWith('[')) {
        return `https://veebuilds.com/master/assets/images/product_image/${landDetails.siteimg}`;
      }
      
      const imagesString = landDetails.siteimg.replace(/^\[|\]$/g, '');
      const imagesArray = imagesString.split(',')
        .map(img => img.trim().replace(/"/g, ''))
        .filter(img => img.length > 0);
      
      if (imagesArray.length > 0) {
        return `https://veebuilds.com/master/assets/images/product_image/${imagesArray[0]}`;
      }
    } catch (e) {
      console.log('Error parsing images', e);
    }
    
    return null;
  };

  const handleCallPress = () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }
    
    if (landDetails?.mobile) {
      // You can implement calling functionality here
      console.log('Call:', landDetails.mobile);
    }
  };

  const handleWhatsAppPress = () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }
    
    if (landDetails?.mobile) {
      // You can implement WhatsApp functionality here
      console.log('WhatsApp:', landDetails.mobile);
    }
  };

  const handleEnquiryPress = () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }

    router.push({
      pathname: '/components/EnquiryRealHire',
      params: { 
        cat_id: cat_id || '',          
        land_id: id,                   
        v_id: landDetails?.vendor_id || '',         
        customer_id: customer_id || '' 
      }
    });
  };

  const imageUrl = getFirstImageUrl();

  // Loading states
  if (!isSessionLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show login required screen for guest users - HIDE ALL DETAILS
  if (isGuestUser) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#A0522D', '#3E2723']}
          style={styles.header}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Land Details</Text>
        </LinearGradient>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="lock-closed" size={80} color="#8B4513" />
          </View>
          
          <Text style={styles.guestTitle}>Login Required</Text>
          
          <Text style={styles.guestMessage}>
            You need to be logged in to view land details and contact information. Please sign in to access this feature.
          </Text>

          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <Ionicons name="log-in" size={20} color="white" style={styles.signInIcon} />
            <Text style={styles.signInButtonText}>Sign In to View Details</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading Land Details...</Text>
      </View>
    );
  }

  if (!landDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Land details not found.</Text>
      </View>
    );
  }

  const {
    land_brocker,
    land_area,
    land_mark,
    land_size,
    connection,
    property_type,
    cost_per_sq,
    tot_cost,
    mobile,
    vendor_id
  } = landDetails;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#A0522D', '#3E2723']} // brown gradient
        style={styles.header}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Land Details</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.item}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.nameText}>{land_brocker}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Land Area:</Text>
          <Text style={styles.valueText}>{land_area}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Land mark:</Text>
          <Text style={styles.valueText}>{land_mark}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Land Size:</Text>
          <Text style={styles.valueText}>{land_size} sq ft</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Connection:</Text>
          <Text style={styles.valueText}>{connection}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Site Image:</Text>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image" size={50} color="#ccc" />
              <Text>No Image Available</Text>
            </View>
          )}
          {imageError && (
            <View style={styles.placeholderImage}>
              <Ionicons name="image" size={50} color="#ccc" />
              <Text>Failed to load image</Text>
            </View>
          )}
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Property Type:</Text>
          <Text style={styles.valueText}>{property_type}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Cost per sq ft:</Text>
          <Text style={styles.valueText}>₹ {cost_per_sq}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Total Cost:</Text>
          <Text style={styles.valueText}>₹ {tot_cost}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleCallPress}>
          <Ionicons name="call" size={16} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleEnquiryPress}
        >
          <Ionicons name="information-circle" size={16} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Enquiry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#25D366' }]}
          onPress={handleWhatsAppPress}
        >
          <Ionicons name="logo-whatsapp" size={16} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0', // light cream background for earthy tone
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF3E0',
  },
  loadingText: {
    marginTop: 10,
    color: '#8B4513',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    height: 120,
    paddingTop: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 20,
    marginTop: 30
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 40,
    marginTop: 30
  },
  content: {
    padding: 20,
  },
  item: {
    borderWidth: 1,
    borderColor: '#d7ccc8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#4E342E',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D4C41',
  },
  valueText: {
    fontSize: 16,
    color: '#5D4037',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: 110,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 4,
  },
  // Guest user styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FAF3E0',
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
});
