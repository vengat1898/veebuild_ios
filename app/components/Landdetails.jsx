// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useContext, useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { SessionContext } from '../../context/SessionContext';
// import api from "../services/api";

// export default function Landdetails() {
//   const router = useRouter();
//   const { session, isSessionLoaded, clearSession, getUserIdSync } = useContext(SessionContext);
//   const { id, cat_id, customer_id } = useLocalSearchParams();
//   const [landDetails, setLandDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [imageError, setImageError] = useState(false);

//   // Check if user is a guest (no proper mobile number)
//   const isGuestUser = !session || 
//                      !session.mobile || 
//                      session.mobile === '' || 
//                      session.id === 'guest_user' || 
//                      session.type === 'guest';

//   // API call to save enquiry
//   const saveEnquiry = async (enquiryType, vendorId) => {
//     try {
//       const userId = getUserIdSync();
      
//       if (!userId) {
//         console.log('User not logged in, skipping enquiry tracking');
//         return false;
//       }

//       const response = await api.get('save_enquiry_individual.php', {
//         params: {
//           user_id: userId,
//           enquiry_type: enquiryType,
//           poi_id: vendorId
//         }
//       });

//       if (response.data.status) {
//         console.log(`✅ Enquiry saved successfully for type: ${enquiryType}`);
//         return true;
//       } else {
//         console.log('❌ Failed to save enquiry:', response.data.message);
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Error saving enquiry:', error);
//       return false;
//     }
//   };

//   // Handle sign in for guest users - COMPLETE NAVIGATION RESET
//   const handleSignIn = async () => {
//     console.log("Sign in clicked from Land Details");
    
//     // Clear any guest session before navigating to login
//     if (isGuestUser) {
//       await clearSession();
//     }
    
//     // COMPLETE NAVIGATION RESET - This will clear the entire stack
//     if (router.dismissAll) {
//       router.dismissAll();
//     }
    
//     setTimeout(() => {
//       router.replace({
//         pathname: '/Login',
//         params: { 
//           fromLandDetails: 'true',
//           returnParams: JSON.stringify({ id, cat_id, customer_id })
//         }
//       });
//     }, 100);
//   };

//   // Handle back navigation for guest users
//   const handleBackPress = () => {
//     // Complete reset to home
//     if (router.dismissAll) {
//       router.dismissAll();
//     }
//     setTimeout(() => {
//       router.replace('/components/Home');
//     }, 100);
//   };

//   useEffect(() => {
//     api.get('all_land_list.php')
//       .then(response => {
//         const land = response.data.storeList.find(item => item.id === id);
//         setLandDetails(land);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error fetching land details:', error);
//         setLoading(false);
//       });
//   }, [id]);

//   const getFirstImageUrl = () => {
//     if (!landDetails?.siteimg) return null;
    
//     try {
//       if (typeof landDetails.siteimg === 'string' && !landDetails.siteimg.startsWith('[')) {
//         return `https://veebuilds.com/master/assets/images/product_image/${landDetails.siteimg}`;
//       }
      
//       const imagesString = landDetails.siteimg.replace(/^\[|\]$/g, '');
//       const imagesArray = imagesString.split(',')
//         .map(img => img.trim().replace(/"/g, ''))
//         .filter(img => img.length > 0);
      
//       if (imagesArray.length > 0) {
//         return `https://veebuilds.com/master/assets/images/product_image/${imagesArray[0]}`;
//       }
//     } catch (e) {
//       console.log('Error parsing images', e);
//     }
    
//     return null;
//   };

//   const handleCallPress = async () => {
//     if (isGuestUser) {
//       handleSignIn();
//       return;
//     }
    
//     if (landDetails?.mobile) {
//       // Save call enquiry first
//       const enquirySaved = await saveEnquiry(1, landDetails.vendor_id);
      
//       if (enquirySaved) {
//         // Then initiate call
//         Linking.openURL(`tel:${landDetails.mobile}`).catch(() => {
//           Alert.alert('Error', 'Could not initiate call');
//         });
//       } else {
//         Alert.alert('Error', 'Failed to track enquiry. Please try again.');
//       }
//     } else {
//       Alert.alert('Error', 'Phone number not available');
//     }
//   };

//   const handleWhatsAppPress = async () => {
//     if (isGuestUser) {
//       handleSignIn();
//       return;
//     }
    
//     if (landDetails?.mobile) {
//       // Save WhatsApp enquiry first
//       const enquirySaved = await saveEnquiry(2, landDetails.vendor_id);
      
//       if (enquirySaved) {
//         // Then open WhatsApp
//         const cleanedNumber = landDetails.mobile.replace(/^\+?0?|\s+/g, '');
//         const whatsappUrl = `https://wa.me/${cleanedNumber}`;
//         Linking.openURL(whatsappUrl).catch(() => {
//           Alert.alert('Error', 'Could not open WhatsApp');
//         });
//       } else {
//         Alert.alert('Error', 'Failed to track enquiry. Please try again.');
//       }
//     } else {
//       Alert.alert('Error', 'Phone number not available');
//     }
//   };

//   const handleEnquiryPress = () => {
//     if (isGuestUser) {
//       handleSignIn();
//       return;
//     }

//     router.push({
//       pathname: '/components/EnquiryRealHire',
//       params: { 
//         cat_id: cat_id || '',          
//         land_id: id,                   
//         v_id: landDetails?.vendor_id || '',         
//         customer_id: customer_id || '' 
//       }
//     });
//   };

//   const imageUrl = getFirstImageUrl();

//   // Loading states
//   if (!isSessionLoaded) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8B4513" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   // Show login required screen for guest users - HIDE ALL DETAILS
//   if (isGuestUser) {
//     return (
//       <View style={{ flex: 1 }}>
//         <LinearGradient
//           colors={['#A0522D', '#3E2723']}
//           style={styles.header}
//           start={{ x: 1, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={28} color="white" />
//           </TouchableOpacity>
//           <Text style={styles.headerText}>Land Details</Text>
//         </LinearGradient>

//         <View style={styles.guestContainer}>
//           <View style={styles.guestIconContainer}>
//             <Ionicons name="lock-closed" size={80} color="#8B4513" />
//           </View>
          
//           <Text style={styles.guestTitle}>Login Required</Text>
          
//           <Text style={styles.guestMessage}>
//             You need to be logged in to view land details and contact information. Please sign in to access this feature.
//           </Text>

//           <TouchableOpacity 
//             style={styles.signInButton}
//             onPress={handleSignIn}
//           >
//             <Ionicons name="log-in" size={20} color="white" style={styles.signInIcon} />
//             <Text style={styles.signInButtonText}>Sign In to View Details</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.backButtonGuest}
//             onPress={handleBackPress}
//           >
//             <Text style={styles.backButtonText}>Go Back to Home</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8B4513" />
//         <Text style={styles.loadingText}>Loading Land Details...</Text>
//       </View>
//     );
//   }

//   if (!landDetails) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.errorText}>Land details not found.</Text>
//       </View>
//     );
//   }

//   const {
//     land_brocker,
//     land_area,
//     land_mark,
//     land_size,
//     connection,
//     property_type,
//     cost_per_sq,
//     tot_cost,
//     mobile,
//     vendor_id
//   } = landDetails;

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#A0522D', '#3E2723']} // brown gradient
//         style={styles.header}
//         start={{ x: 1, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={28} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Land Details</Text>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.content}>
//         <View style={styles.item}>
//           <Text style={styles.label}>Name:</Text>
//           <Text style={styles.nameText}>{land_brocker}</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Land Area:</Text>
//           <Text style={styles.valueText}>{land_area}</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Land mark:</Text>
//           <Text style={styles.valueText}>{land_mark}</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Land Size:</Text>
//           <Text style={styles.valueText}>{land_size} sq ft</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Connection:</Text>
//           <Text style={styles.valueText}>{connection}</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Site Image:</Text>
//           {imageUrl ? (
//             <Image 
//               source={{ uri: imageUrl }} 
//               style={styles.image} 
//               resizeMode="cover"
//               onError={() => setImageError(true)}
//             />
//           ) : (
//             <View style={styles.placeholderImage}>
//               <Ionicons name="image" size={50} color="#ccc" />
//               <Text>No Image Available</Text>
//             </View>
//           )}
//           {imageError && (
//             <View style={styles.placeholderImage}>
//               <Ionicons name="image" size={50} color="#ccc" />
//               <Text>Failed to load image</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Property Type:</Text>
//           <Text style={styles.valueText}>{property_type}</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Cost per sq ft:</Text>
//           <Text style={styles.valueText}>₹ {cost_per_sq}</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Total Cost:</Text>
//           <Text style={styles.valueText}>₹ {tot_cost}</Text>
//         </View>
//         <View style={styles.item}>
//           <Text style={styles.label}>Contact Number:</Text>
//           <Text style={styles.valueText}>{mobile || 'Not available'}</Text>
//         </View>
//       </ScrollView>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity 
//           style={styles.button} 
//           onPress={handleCallPress}
//         >
//           <Ionicons name="call" size={16} color="white" style={styles.icon} />
//           <Text style={styles.buttonText}>Call</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={styles.button}
//           onPress={handleEnquiryPress}
//         >
//           <Ionicons name="information-circle" size={16} color="white" style={styles.icon} />
//           <Text style={styles.buttonText}>Enquiry</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.button, { backgroundColor: '#25D366' }]}
//           onPress={handleWhatsAppPress}
//         >
//           <Ionicons name="logo-whatsapp" size={16} color="white" style={styles.icon} />
//           <Text style={styles.buttonText}>WhatsApp</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FAF3E0', // light cream background for earthy tone
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FAF3E0',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#8B4513',
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   header: {
//     height: 120,
//     paddingTop: 30,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 10,
//     borderRadius: 20,
//     marginTop: 30
//   },
//   headerText: {
//     color: 'white',
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     flex: 1,
//     marginRight: 40,
//     marginTop: 30
//   },
//   content: {
//     padding: 20,
//   },
//   item: {
//     borderWidth: 1,
//     borderColor: '#d7ccc8',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//     backgroundColor: '#fff8f0',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 5,
//     color: '#4E342E',
//   },
//   nameText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#6D4C41',
//   },
//   valueText: {
//     fontSize: 16,
//     color: '#5D4037',
//   },
//   image: {
//     width: '100%',
//     height: 200,
//     marginTop: 10,
//     borderRadius: 10,
//   },
//   placeholderImage: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 200,
//     marginTop: 10,
//     borderRadius: 10,
//     backgroundColor: '#eee',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//     gap: 12,
//     marginBottom: 20,
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#8B4513',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     width: 110,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   icon: {
//     marginRight: 4,
//   },
//   // Guest user styles
//   guestContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     backgroundColor: '#FAF3E0',
//   },
//   guestIconContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#FFF8DC',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 25,
//     borderWidth: 3,
//     borderColor: '#D2B48C',
//   },
//   guestTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#8B4513',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   guestMessage: {
//     fontSize: 16,
//     color: '#5D4037',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 30,
//   },
//   signInButton: {
//     flexDirection: 'row',
//     backgroundColor: '#8B4513',
//     paddingVertical: 16,
//     paddingHorizontal: 30,
//     borderRadius: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 15,
//     width: '80%',
//     shadowColor: '#8B4513',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   signInIcon: {
//     marginRight: 10,
//   },
//   signInButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   backButtonGuest: {
//     paddingVertical: 14,
//     paddingHorizontal: 30,
//     borderRadius: 50,
//     borderWidth: 1,
//     borderColor: '#8B4513',
//     width: '80%',
//     alignItems: 'center',
//   },
//   backButtonText: {
//     color: '#8B4513',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });


import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function Landdetails() {
  const router = useRouter();
  const { session, isSessionLoaded, clearSession, getUserIdSync } = useContext(SessionContext);
  const { id, cat_id, customer_id } = useLocalSearchParams();
  const [landDetails, setLandDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const insets = useSafeAreaInsets();

  // Check if user is a guest (no proper mobile number)
  const isGuestUser = !session || 
                     !session.mobile || 
                     session.mobile === '' || 
                     session.id === 'guest_user' || 
                     session.type === 'guest';

  // API call to save enquiry
  const saveEnquiry = async (enquiryType, vendorId) => {
    try {
      const userId = getUserIdSync();
      
      if (!userId) {
        console.log('User not logged in, skipping enquiry tracking');
        return false;
      }

      const response = await api.get('save_enquiry_individual.php', {
        params: {
          user_id: userId,
          enquiry_type: enquiryType,
          poi_id: vendorId
        }
      });

      if (response.data.status) {
        console.log(`✅ Enquiry saved successfully for type: ${enquiryType}`);
        return true;
      } else {
        console.log('❌ Failed to save enquiry:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving enquiry:', error);
      return false;
    }
  };

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

  const handleCallPress = async () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }
    
    if (landDetails?.mobile) {
      // Save call enquiry first
      const enquirySaved = await saveEnquiry(1, landDetails.vendor_id);
      
      if (enquirySaved) {
        // Then initiate call
        Linking.openURL(`tel:${landDetails.mobile}`).catch(() => {
          Alert.alert('Error', 'Could not initiate call');
        });
      } else {
        Alert.alert('Error', 'Failed to track enquiry. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleWhatsAppPress = async () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }
    
    if (landDetails?.mobile) {
      // Save WhatsApp enquiry first
      const enquirySaved = await saveEnquiry(2, landDetails.vendor_id);
      
      if (enquirySaved) {
        // Then open WhatsApp
        const cleanedNumber = landDetails.mobile.replace(/^\+?0?|\s+/g, '');
        const whatsappUrl = `https://wa.me/${cleanedNumber}`;
        Linking.openURL(whatsappUrl).catch(() => {
          Alert.alert('Error', 'Could not open WhatsApp');
        });
      } else {
        Alert.alert('Error', 'Failed to track enquiry. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Phone number not available');
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
      <View style={{ flex: 1, backgroundColor: '#FAF3E0' }}>
        <StatusBar backgroundColor="#A0522D" barStyle="light-content" />
        <LinearGradient
          colors={['#A0522D', '#3E2723']}
          style={[
            styles.header,
            { 
              paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
              height: Platform.OS === 'ios' ? insets.top + 90 : (StatusBar.currentHeight || 0) + 80
            }
          ]}
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
      <StatusBar backgroundColor="#A0522D" barStyle="light-content" />
      
      <LinearGradient
        colors={['#A0522D', '#3E2723']}
        style={[
          styles.header,
          { 
            paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
            height: Platform.OS === 'ios' ? insets.top + 90 : (StatusBar.currentHeight || 0) + 80
          }
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Land Details</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'ios' ? 100 : 110 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
          {imageError && (
            <View style={styles.placeholderImage}>
              <Ionicons name="image" size={50} color="#ccc" />
              <Text style={styles.placeholderText}>Failed to load image</Text>
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
        <View style={styles.item}>
          <Text style={styles.label}>Contact Number:</Text>
          <Text style={styles.valueText}>{mobile || 'Not available'}</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={[
        styles.buttonRow,
        {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 16),
          paddingTop: 12
        }
      ]}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCallPress}
        >
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
    backgroundColor: '#FAF3E0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF3E0',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#8B4513',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
  },
  errorText: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 22 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 40,
  },
  content: {
    padding: Platform.OS === 'ios' ? 20 : 16,
    flexGrow: 1,
  },
  item: {
    borderWidth: 1,
    borderColor: '#d7ccc8',
    borderRadius: 10,
    padding: Platform.OS === 'ios' ? 15 : 12,
    marginBottom: Platform.OS === 'ios' ? 20 : 16,
    backgroundColor: '#fff8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#4E342E',
  },
  nameText: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: 'bold',
    color: '#6D4C41',
  },
  valueText: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#5D4037',
  },
  image: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 180,
    marginTop: 10,
    borderRadius: 10,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 200 : 180,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  placeholderText: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    color: '#666',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
    marginBottom: Platform.OS === 'ios' ? 10 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
    borderRadius: 10,
    flex: 1,
    maxWidth: 110,
    marginHorizontal: Platform.OS === 'ios' ? 2 : 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 12 : 10,
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
    paddingHorizontal: Platform.OS === 'ios' ? 30 : 24,
    backgroundColor: '#FAF3E0',
  },
  guestIconContainer: {
    width: Platform.OS === 'ios' ? 120 : 100,
    height: Platform.OS === 'ios' ? 120 : 100,
    borderRadius: Platform.OS === 'ios' ? 60 : 50,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 25 : 20,
    borderWidth: 3,
    borderColor: '#D2B48C',
  },
  guestTitle: {
    fontSize: Platform.OS === 'ios' ? 24 : 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: Platform.OS === 'ios' ? 15 : 12,
    textAlign: 'center',
  },
  guestMessage: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 22 : 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 24,
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    paddingHorizontal: Platform.OS === 'ios' ? 30 : 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 15 : 12,
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
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
  },
  backButtonGuest: {
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: Platform.OS === 'ios' ? 30 : 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#8B4513',
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#8B4513',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '500',
  },
});
