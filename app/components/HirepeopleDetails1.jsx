// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useContext, useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Linking,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import logoimg from '../../assets/images/veebuilder.png';
// import { SessionContext } from '../../context/SessionContext';
// import api from "../services/api";

// // Custom Image component with proper error handling
// const ProfessionalImage = ({ imageUrl, style }) => {
//   const [imageError, setImageError] = useState(false);
  
//   // Check if URL is valid before even trying to load
//   const isValidUrl = (url) => {
//     if (!url) return false;
//     if (typeof url !== 'string') return false;
//     if (url.trim() === '') return false;
//     if (url === 'null' || url === 'undefined' || url === 'N/A') return false;
//     if (!url.startsWith('http')) return false;
    
//     // Additional checks for common problematic patterns
//     if (url.includes('default.jpg') || url.includes('placeholder')) return false;
    
//     return true;
//   };

//   // Determine if we should even try to load the URL
//   const shouldLoadImage = isValidUrl(imageUrl);

//   return (
//     <Image
//       source={shouldLoadImage && !imageError ? { uri: imageUrl } : logoimg}
//       style={style}
//       defaultSource={logoimg}
//       onError={() => {
//         console.log('Image failed to load, using fallback:', imageUrl);
//         setImageError(true);
//       }}
//       onLoad={() => {
//         console.log('Image loaded successfully:', imageUrl);
//       }}
//       resizeMode="cover"
//     />
//   );
// };

// export default function HirepeopleDetails1() {
//   const router = useRouter();
//   const { session, isSessionLoaded, clearSession, getUserIdSync } = useContext(SessionContext);

//   // Extract route params
//   const { data, cat_id, customer_id, user_id, v_id } = useLocalSearchParams();

//   const parsedData = data ? JSON.parse(data) : {};
//   const [person, setPerson] = useState(parsedData);
//   const [loading, setLoading] = useState(!parsedData.id);
//   const [activeTab, setActiveTab] = useState('Quick Info');
//   const [trackingCalls, setTrackingCalls] = useState({}); // Track ongoing API calls

//   // Check if user is a guest (no proper mobile number)
//   const isGuestUser = !session || 
//                      !session.mobile || 
//                      session.mobile === '' || 
//                      session.id === 'guest_user' || 
//                      session.type === 'guest';



//   // Function to get last 4 digits of mobile number

//   const getLastFourDigits = (mobile) => {

//     if (!mobile) return 'Not specified';

    

//     const mobileString = mobile.toString();

//     if (mobileString.length <= 4) return mobileString;

    

//     return `XXXXX${mobileString.slice(-4)}`;

//   };


//   // API function to track enquiry
//   const trackEnquiry = async (professionId, enquiryType, professionalName = '') => {
//     const userId = getUserIdSync();
    
//     console.log('=================== TRACKING ENQUIRY ===================');
//     console.log('User ID:', userId);
//     console.log('Profession ID (poi_id):', professionId);
//     console.log('Enquiry Type:', enquiryType);
//     console.log('Professional Name:', professionalName);
//     console.log('========================================================');
    
//     if (!userId) {
//       console.log('❌ No user ID found - skipping tracking');
//       return false;
//     }

//     // Prevent duplicate tracking for the same action
//     const trackingKey = `${professionId}_${enquiryType}`;
//     if (trackingCalls[trackingKey]) {
//       console.log('🛑 Tracking call already in progress for:', trackingKey);
//       return false;
//     }

//     try {
//       setTrackingCalls(prev => ({ ...prev, [trackingKey]: true }));
      
//       const url = `https://veebuilds.com/mobile/save_enquiry_professional.php`;
//       const params = {
//         user_id: userId,
//         enquiry_type: enquiryType,
//         poi_id: professionId
//       };

//       console.log('📡 Sending tracking request:');
//       console.log('URL:', url);
//       console.log('Params:', params);

//       const response = await api.get(url, { params });
      
//       console.log('✅ Tracking response:', response.data);
      
//       if (response.data?.status) {
//         console.log('🎯 Successfully tracked enquiry');
//         return true;
//       } else {
//         console.log('❌ Tracking failed:', response.data?.message);
//         return false;
//       }
//     } catch (error) {
//       console.log('=================== TRACKING ERROR ===================');
//       console.log('Error tracking enquiry:', error.message);
//       console.log('Error details:', JSON.stringify(error.response?.data, null, 2));
//       console.log('=====================================================');
//       return false;
//     } finally {
//       // Clear tracking flag after a delay
//       setTimeout(() => {
//         setTrackingCalls(prev => {
//           const newState = { ...prev };
//           delete newState[trackingKey];
//           return newState;
//         });
//       }, 3000);
//     }
//   };

//   // Handle sign in for guest users - COMPLETE NAVIGATION RESET
//   const handleSignIn = async () => {
//     console.log("Sign in clicked from Professional Details");
    
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
//           fromProfessionalDetails: 'true',
//           returnParams: JSON.stringify({ data, cat_id, customer_id, user_id, v_id })
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

//   const handleCallPress = async () => {
//     if (isGuestUser) {
//       handleSignIn();
//       return;
//     }
    
//     if (person.mobile) {
//       // Track the call action first
//       await trackEnquiry(person.id, 1, person.name);
      
//       // Then initiate the call
//       Linking.openURL(`tel:${person.mobile}`);
//     } else {
//       Alert.alert('Error', 'Phone number not available');
//     }
//   };

//   const handleWhatsAppPress = async () => {
//     if (isGuestUser) {
//       handleSignIn();
//       return;
//     }
    
//     if (person.mobile) {
//       // Track the WhatsApp action first
//       await trackEnquiry(person.id, 2, person.name);
      
//       // Then open WhatsApp
//       const phoneNumber = person.mobile.replace(/^\+?0?/, '');
//       Linking.openURL(`https://wa.me/${phoneNumber}`);
//     } else {
//       Alert.alert('Error', 'Phone number not available');
//     }
//   };

//   const fetchDetails = async () => {
//     try {
//       const response = await api.get(
//         `professional_details.php?id=${parsedData.id}`
//       );
//       if (response.data?.storeList?.length) {
//         setPerson(response.data.storeList[0]);
//       }
//     } catch (error) {
//       console.error('Error fetching person details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (parsedData.id && !person.mobile) {
//       fetchDetails();
//     }
//   }, []);

//   const handleEnquiryPress = () => {
//     if (isGuestUser) {
//       handleSignIn();
//       return;
//     }

//     const enquiryParams = {
//       cat_id: cat_id || '',
//       land_id: person.id || '',
//       v_id: person.vendor_id || v_id || person.id || '',
//       customer_id: customer_id || '',
//       user_id: user_id || '',
//       product_name: person.name || '',
//       product_id: person.id || '',
//       city: person.city || '',
//       occupation: person.occupation || '',
//       mobile: person.mobile || '',
//       address: person.address || '',
//       yearofexp: person.yearofexp || '',
//       costwithmeterial: person.costwithmeterial || '',
//       worktype: person.worktype || '',
//       ...person,
//     };

//     console.log('Data being passed to Enquiry screen:', JSON.stringify(enquiryParams, null, 2));

//     router.push({
//       pathname: '/components/HirepeopleEnquiry',
//       params: enquiryParams,
//     });
//   };

//   // Check if tracking is in progress for this person
//   const isCallTracking = trackingCalls[`${person.id}_1`];
//   const isWhatsAppTracking = trackingCalls[`${person.id}_2`];

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
//           colors={['#8B4513', '#A0522D', '#D2691E']}
//           style={styles.header}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>
//           <Text style={styles.headerText}>Professional Details</Text>
//           <View style={styles.headerIcon}>
//             <Ionicons name="person" size={20} color="white" />
//           </View>
//         </LinearGradient>

//         <View style={styles.guestContainer}>
//           <View style={styles.guestIconContainer}>
//             <Ionicons name="lock-closed" size={80} color="#8B4513" />
//           </View>
          
//           <Text style={styles.guestTitle}>Login Required</Text>
          
//           <Text style={styles.guestMessage}>
//             You need to be logged in to view professional details and contact information. Please sign in to access this feature.
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
//         <Text style={styles.loadingText}>Loading Professional Details...</Text>
//       </View>
//     );
//   }

//   if (!person) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.errorText}>No data found</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#8B4513', '#A0522D', '#D2691E']}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Professional Details</Text>
//         <View style={styles.headerIcon}>
//           <Ionicons name="person" size={20} color="white" />
//         </View>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.profileSection}>
//           <View style={styles.imageContainer}>
//             <ProfessionalImage
//               imageUrl={person.aatharimage}
//               style={styles.profileImage}
//             />
//             <View style={styles.imageOverlay} />
//           </View>
          
//           <View style={styles.profileInfo}>
//             <Text style={styles.name}>{person.name}</Text>
//             <View style={styles.locationRow}>
//               <Ionicons name="location" size={16} color="#8B4513" />
//               <Text style={styles.city}>{person.city || 'Location not specified'}</Text>
//             </View>
            
//             <View style={styles.ratingContainer}>
//               <View style={styles.ratingBox}>
//                 <Ionicons name="star" size={14} color="white" />
//                 <Text style={styles.ratingText}>4.5</Text>
//               </View>
//               <View style={styles.divider} />
//               <Text style={styles.occupation}>{person.occupation || 'Professional'}</Text>
//             </View>
            
//             <View style={styles.experienceBadge}>
//               <Ionicons name="time" size={14} color="#8B4513" />
//               <Text style={styles.yearofexp}>{person.yearofexp || '0'} years experience</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Ionicons name="business" size={18} color="#8B4513" />
//             <Text style={styles.cardTitle}>Address</Text>
//           </View>
//           <Text style={styles.addressText}>{person.address || 'Address not specified'}</Text>
//         </View>

//         <View style={styles.card}>
//           <View style={styles.tabsContainer}>
//             {['Quick Info', 'Overview', 'Photos'].map((tab) => (
//               <TouchableOpacity
//                 key={tab}
//                 style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
//                 onPress={() => setActiveTab(tab)}
//               >
//                 <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
//                   {tab}
//                 </Text>
//                 {activeTab === tab && <View style={styles.tabIndicator} />}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={styles.tabContent}>
//             {activeTab === 'Quick Info' && (
//               <View style={styles.infoGrid}>
//                 <View style={styles.infoItem}>
//                   <Ionicons name="call" size={20} color="#8B4513" style={{ paddingRight: 10 }}  />
//                   <View>
//                     <Text style={styles.infoLabel}>Mobile</Text>
//                     <Text style={styles.infoValue}> {getLastFourDigits(person.mobile)}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.infoItem}>
//                   <Ionicons name="briefcase" size={20} color="#8B4513" style={{ paddingRight: 10 }} />
//                   <View>
//                     <Text style={styles.infoLabel}>Profession</Text>
//                     <Text style={styles.infoValue}>{person.occupation || 'Not specified'}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.infoItem}>
//                   <Ionicons name="trophy" size={20} color="#8B4513" style={{ paddingRight: 10 }}  />
//                   <View>
//                     <Text style={styles.infoLabel}>Experience</Text>
//                     <Text style={styles.infoValue}>{person.yearofexp || '0'} years</Text>
//                   </View>
//                 </View>
//               </View>
//             )}
//             {activeTab === 'Overview' && (
//               <View style={styles.infoGrid}>
//                 <View style={styles.infoItem}>
//                   <Ionicons name="cash" size={20} color="#8B4513" style={{ paddingRight: 10 }} />
//                   <View>
//                     <Text style={styles.infoLabel}>Cost with Material</Text>
//                     <Text style={styles.infoValue}>₹{person.costwithmeterial || 'Not specified'}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.infoItem}>
//                   <Ionicons name="construct" size={20} color="#8B4513" style={{ paddingRight: 10 }}/>
//                   <View>
//                     <Text style={styles.infoLabel}>Work Type</Text>
//                     <Text style={styles.infoValue}>{person.worktype || 'Not specified'}</Text>
//                   </View>
//                 </View>
//               </View>
//             )}
//             {activeTab === 'Photos' && (
//               <View style={styles.photoContainer}>
//                 <ProfessionalImage
//                   imageUrl={person.aatharimage}
//                   style={styles.photoImage}
//                 />
//                 <View style={styles.photoOverlay}>
//                   <Text style={styles.photoText}>Professional Portfolio</Text>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       <View style={styles.footer}>
//         <TouchableOpacity 
//           style={[
//             styles.footerButton, 
//             styles.callButton,
//             isCallTracking && styles.buttonDisabled
//           ]} 
//           onPress={handleCallPress}
//           disabled={isCallTracking}
//         >
//           {isCallTracking ? (
//             <ActivityIndicator size="small" color="white" />
//           ) : (
//             <>
//               <Ionicons name="call" size={20} color="white" />
//               <Text style={styles.footerButtonText}>Call</Text>
//             </>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[styles.footerButton, styles.enquiryButton]} 
//           onPress={handleEnquiryPress}
//         >
//           <Ionicons name="document-text" size={20} color="white" />
//           <Text style={styles.footerButtonText}>Enquiry</Text>
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[
//             styles.footerButton, 
//             styles.whatsappButton,
//             isWhatsAppTracking && styles.buttonDisabled
//           ]} 
//           onPress={handleWhatsAppPress}
//           disabled={isWhatsAppTracking}
//         >
//           {isWhatsAppTracking ? (
//             <ActivityIndicator size="small" color="white" />
//           ) : (
//             <>
//               <Ionicons name="logo-whatsapp" size={20} color="white" />
//               <Text style={styles.footerButtonText}>WhatsApp</Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
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
//     height: 140,
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerText: {
//     color: 'white',
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     flex: 1,
//   },
//   headerIcon: {
//     padding: 8,
//     opacity: 0.8,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 100,
//   },
//   profileSection: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     alignItems: 'center',
//   },
//   imageContainer: {
//     position: 'relative',
//     marginBottom: 16,
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 1,
//     borderColor: '#8B4513',
//   },
//   imageOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     borderRadius: 60,
//     borderWidth: 2,
//     borderColor: 'rgba(139, 69, 19, 0.3)',
//   },
//   profileInfo: {
//     alignItems: 'center',
//   },
//   name: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   city: {
//     fontSize: 16,
//     color: '#666',
//     marginLeft: 6,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   ratingBox: {
//     backgroundColor: '#8B4513',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   ratingText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginLeft: 4,
//   },
//   divider: {
//     width: 1,
//     height: 16,
//     backgroundColor: '#DDD',
//     marginHorizontal: 12,
//   },
//   occupation: {
//     fontSize: 14,
//     color: '#8B4513',
//     fontWeight: '600',
//   },
//   experienceBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8F0',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#8B4513',
//   },
//   yearofexp: {
//     fontSize: 12,
//     color: '#8B4513',
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginLeft: 8,
//   },
//   addressText: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F8F8F8',
//     borderRadius: 12,
//     padding: 4,
//     marginBottom: 16,
//   },
//   tabButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 10,
//     position: 'relative',
//   },
//   activeTabButton: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#666',
//   },
//   activeTabText: {
//     color: '#8B4513',
//     fontWeight: 'bold',
//   },
//   tabIndicator: {
//     position: 'absolute',
//     bottom: -2,
//     width: 20,
//     height: 3,
//     backgroundColor: '#8B4513',
//     borderRadius: 2,
//   },
//   tabContent: {
//     minHeight: 120,
//   },
//   infoGrid: {
//     gap: 16,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8F0',
//     padding: 16,
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#8B4513',
//   },
//   infoLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   infoValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   photoContainer: {
//     position: 'relative',
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   photoImage: {
//     width: '100%',
//     height: 200,
//     backgroundColor: '#F0F0F0',
//   },
//   photoOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(139, 69, 19, 0.8)',
//     padding: 12,
//   },
//   photoText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#E8E8E8',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: -2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   footerButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     marginHorizontal: 6,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   callButton: {
//     backgroundColor: '#8B4513',
//   },
//   enquiryButton: {
//     backgroundColor: '#8B4513',
//   },
//   whatsappButton: {
//     backgroundColor: '#25D366',
//   },
//   buttonDisabled: {
//     backgroundColor: '#A9A9A9',
//     opacity: 0.7,
//   },
//   footerButtonText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//     marginLeft: 6,
//   },
//   // Guest user styles
//   guestContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     backgroundColor: '#FAF0E6',
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
import logoimg from '../../assets/images/veebuilder.png';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

// Custom Image component with proper error handling
const ProfessionalImage = ({ imageUrl, style }) => {
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
    
    return true;
  };

  // Determine if we should even try to load the URL
  const shouldLoadImage = isValidUrl(imageUrl);

  return (
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
      resizeMode="cover"
    />
  );
};

export default function HirepeopleDetails1() {
  const router = useRouter();
  const { session, isSessionLoaded, clearSession, getUserIdSync } = useContext(SessionContext);
  const insets = useSafeAreaInsets();

  // Extract route params
  const { data, cat_id, customer_id, user_id, v_id } = useLocalSearchParams();

  const parsedData = data ? JSON.parse(data) : {};
  const [person, setPerson] = useState(parsedData);
  const [loading, setLoading] = useState(!parsedData.id);
  const [activeTab, setActiveTab] = useState('Quick Info');
  const [trackingCalls, setTrackingCalls] = useState({}); // Track ongoing API calls

  // Check if user is a guest (no proper mobile number)
  const isGuestUser = !session || 
                     !session.mobile || 
                     session.mobile === '' || 
                     session.id === 'guest_user' || 
                     session.type === 'guest';

  // Function to get last 4 digits of mobile number
  const getLastFourDigits = (mobile) => {
    if (!mobile) return 'Not specified';
    const mobileString = mobile.toString();
    if (mobileString.length <= 4) return mobileString;
    return `XXXXX${mobileString.slice(-4)}`;
  };

  // API function to track enquiry
  const trackEnquiry = async (professionId, enquiryType, professionalName = '') => {
    const userId = getUserIdSync();
    
    console.log('=================== TRACKING ENQUIRY ===================');
    console.log('User ID:', userId);
    console.log('Profession ID (poi_id):', professionId);
    console.log('Enquiry Type:', enquiryType);
    console.log('Professional Name:', professionalName);
    console.log('========================================================');
    
    if (!userId) {
      console.log('❌ No user ID found - skipping tracking');
      return false;
    }

    // Prevent duplicate tracking for the same action
    const trackingKey = `${professionId}_${enquiryType}`;
    if (trackingCalls[trackingKey]) {
      console.log('🛑 Tracking call already in progress for:', trackingKey);
      return false;
    }

    try {
      setTrackingCalls(prev => ({ ...prev, [trackingKey]: true }));
      
      const url = `https://veebuilds.com/mobile/save_enquiry_professional.php`;
      const params = {
        user_id: userId,
        enquiry_type: enquiryType,
        poi_id: professionId
      };

      console.log('📡 Sending tracking request:');
      console.log('URL:', url);
      console.log('Params:', params);

      const response = await api.get(url, { params });
      
      console.log('✅ Tracking response:', response.data);
      
      if (response.data?.status) {
        console.log('🎯 Successfully tracked enquiry');
        return true;
      } else {
        console.log('❌ Tracking failed:', response.data?.message);
        return false;
      }
    } catch (error) {
      console.log('=================== TRACKING ERROR ===================');
      console.log('Error tracking enquiry:', error.message);
      console.log('Error details:', JSON.stringify(error.response?.data, null, 2));
      console.log('=====================================================');
      return false;
    } finally {
      // Clear tracking flag after a delay
      setTimeout(() => {
        setTrackingCalls(prev => {
          const newState = { ...prev };
          delete newState[trackingKey];
          return newState;
        });
      }, 3000);
    }
  };

  // Handle sign in for guest users - COMPLETE NAVIGATION RESET
  const handleSignIn = async () => {
    console.log("Sign in clicked from Professional Details");
    
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
          fromProfessionalDetails: 'true',
          returnParams: JSON.stringify({ data, cat_id, customer_id, user_id, v_id })
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

  const handleCallPress = async () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }
    
    if (person.mobile) {
      // Track the call action first
      await trackEnquiry(person.id, 1, person.name);
      
      // Then initiate the call
      Linking.openURL(`tel:${person.mobile}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleWhatsAppPress = async () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }
    
    if (person.mobile) {
      // Track the WhatsApp action first
      await trackEnquiry(person.id, 2, person.name);
      
      // Then open WhatsApp
      const phoneNumber = person.mobile.replace(/^\+?0?/, '');
      Linking.openURL(`https://wa.me/${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const fetchDetails = async () => {
    try {
      const response = await api.get(
        `professional_details.php?id=${parsedData.id}`
      );
      if (response.data?.storeList?.length) {
        setPerson(response.data.storeList[0]);
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parsedData.id && !person.mobile) {
      fetchDetails();
    }
  }, []);

  const handleEnquiryPress = () => {
    if (isGuestUser) {
      handleSignIn();
      return;
    }

    const enquiryParams = {
      cat_id: cat_id || '',
      land_id: person.id || '',
      v_id: person.vendor_id || v_id || person.id || '',
      customer_id: customer_id || '',
      user_id: user_id || '',
      product_name: person.name || '',
      product_id: person.id || '',
      city: person.city || '',
      occupation: person.occupation || '',
      mobile: person.mobile || '',
      address: person.address || '',
      yearofexp: person.yearofexp || '',
      costwithmeterial: person.costwithmeterial || '',
      worktype: person.worktype || '',
      ...person,
    };

    console.log('Data being passed to Enquiry screen:', JSON.stringify(enquiryParams, null, 2));

    router.push({
      pathname: '/components/HirepeopleEnquiry',
      params: enquiryParams,
    });
  };

  // Check if tracking is in progress for this person
  const isCallTracking = trackingCalls[`${person.id}_1`];
  const isWhatsAppTracking = trackingCalls[`${person.id}_2`];

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
      <View style={{ flex: 1, backgroundColor: '#FAF0E6' }}>
        <StatusBar backgroundColor="#8B4513" barStyle="light-content" />
        <LinearGradient
          colors={['#8B4513', '#A0522D', '#D2691E']}
          style={[
            styles.header,
            { 
              paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
              height: Platform.OS === 'ios' ? insets.top + 90 : (StatusBar.currentHeight || 0) + 80
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Professional Details</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="person" size={20} color="white" />
          </View>
        </LinearGradient>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="lock-closed" size={80} color="#8B4513" />
          </View>
          
          <Text style={styles.guestTitle}>Login Required</Text>
          
          <Text style={styles.guestMessage}>
            You need to be logged in to view professional details and contact information. Please sign in to access this feature.
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
        <Text style={styles.loadingText}>Loading Professional Details...</Text>
      </View>
    );
  }

  if (!person) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8B4513" barStyle="light-content" />
      
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#D2691E']}
        style={[
          styles.header,
          { 
            paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
            height: Platform.OS === 'ios' ? insets.top + 90 : (StatusBar.currentHeight || 0) + 80
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Professional Details</Text>
        <View style={styles.headerIcon}>
          <Ionicons name="person" size={20} color="white" />
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'ios' ? 100 : 110 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <ProfessionalImage
              imageUrl={person.aatharimage}
              style={styles.profileImage}
            />
            <View style={styles.imageOverlay} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{person.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#8B4513" />
              <Text style={styles.city}>{person.city || 'Location not specified'}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={14} color="white" />
                <Text style={styles.ratingText}>4.5</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.occupation}>{person.occupation || 'Professional'}</Text>
            </View>
            
            <View style={styles.experienceBadge}>
              <Ionicons name="time" size={14} color="#8B4513" />
              <Text style={styles.yearofexp}>{person.yearofexp || '0'} years experience</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={18} color="#8B4513" />
            <Text style={styles.cardTitle}>Address</Text>
          </View>
          <Text style={styles.addressText}>{person.address || 'Address not specified'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabsContainer}>
            {['Quick Info', 'Overview', 'Photos'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'Quick Info' && (
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="call" size={20} color="#8B4513" style={{ paddingRight: 10 }}  />
                  <View>
                    <Text style={styles.infoLabel}>Mobile</Text>
                    <Text style={styles.infoValue}> {getLastFourDigits(person.mobile)}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="briefcase" size={20} color="#8B4513" style={{ paddingRight: 10 }} />
                  <View>
                    <Text style={styles.infoLabel}>Profession</Text>
                    <Text style={styles.infoValue}>{person.occupation || 'Not specified'}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="trophy" size={20} color="#8B4513" style={{ paddingRight: 10 }}  />
                  <View>
                    <Text style={styles.infoLabel}>Experience</Text>
                    <Text style={styles.infoValue}>{person.yearofexp || '0'} years</Text>
                  </View>
                </View>
              </View>
            )}
            {activeTab === 'Overview' && (
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="cash" size={20} color="#8B4513" style={{ paddingRight: 10 }} />
                  <View>
                    <Text style={styles.infoLabel}>Cost with Material</Text>
                    <Text style={styles.infoValue}>₹{person.costwithmeterial || 'Not specified'}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="construct" size={20} color="#8B4513" style={{ paddingRight: 10 }}/>
                  <View>
                    <Text style={styles.infoLabel}>Work Type</Text>
                    <Text style={styles.infoValue}>{person.worktype || 'Not specified'}</Text>
                  </View>
                </View>
              </View>
            )}
            {activeTab === 'Photos' && (
              <View style={styles.photoContainer}>
                <ProfessionalImage
                  imageUrl={person.aatharimage}
                  style={styles.photoImage}
                />
                <View style={styles.photoOverlay}>
                  <Text style={styles.photoText}>Professional Portfolio</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer Buttons */}
      <View style={[
        styles.footer,
        {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 16),
          paddingTop: 12
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.footerButton, 
            styles.callButton,
            isCallTracking && styles.buttonDisabled
          ]} 
          onPress={handleCallPress}
          disabled={isCallTracking}
        >
          {isCallTracking ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.footerButtonText}>Call</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerButton, styles.enquiryButton]} 
          onPress={handleEnquiryPress}
        >
          <Ionicons name="document-text" size={20} color="white" />
          <Text style={styles.footerButtonText}>Enquiry</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.footerButton, 
            styles.whatsappButton,
            isWhatsAppTracking && styles.buttonDisabled
          ]} 
          onPress={handleWhatsAppPress}
          disabled={isWhatsAppTracking}
        >
          {isWhatsAppTracking ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="logo-whatsapp" size={20} color="white" />
              <Text style={styles.footerButtonText}>WhatsApp</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 22 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerIcon: {
    padding: 8,
    opacity: 0.8,
  },
  scrollContent: {
    padding: Platform.OS === 'ios' ? 16 : 14,
    flexGrow: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'ios' ? 16 : 14,
    padding: Platform.OS === 'ios' ? 20 : 16,
    marginBottom: Platform.OS === 'ios' ? 16 : 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: Platform.OS === 'ios' ? 16 : 14,
  },
  profileImage: {
    width: Platform.OS === 'ios' ? 120 : 110,
    height: Platform.OS === 'ios' ? 120 : 110,
    borderRadius: Platform.OS === 'ios' ? 60 : 55,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Platform.OS === 'ios' ? 60 : 55,
    borderWidth: 2,
    borderColor: 'rgba(139, 69, 19, 0.3)',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: Platform.OS === 'ios' ? 26 : 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: Platform.OS === 'ios' ? 8 : 6,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
  },
  city: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#666',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
    width: '100%',
    flexWrap: 'wrap',
  },
  ratingBox: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 8 : 6,
    paddingVertical: Platform.OS === 'ios' ? 4 : 3,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#DDD',
    marginHorizontal: Platform.OS === 'ios' ? 12 : 8,
  },
  occupation: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
  },
  experienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 10,
    paddingVertical: Platform.OS === 'ios' ? 6 : 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B4513',
    marginTop: Platform.OS === 'ios' ? 4 : 2,
  },
  yearofexp: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    color: '#8B4513',
    fontWeight: '600',
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'ios' ? 16 : 14,
    padding: Platform.OS === 'ios' ? 20 : 16,
    marginBottom: Platform.OS === 'ios' ? 16 : 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
  },
  cardTitle: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  addressText: {
    fontSize: Platform.OS === 'ios' ? 14 : 13,
    color: '#666',
    lineHeight: Platform.OS === 'ios' ? 20 : 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 4,
    marginBottom: Platform.OS === 'ios' ? 16 : 14,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 3,
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
  tabContent: {
    minHeight: Platform.OS === 'ios' ? 120 : 100,
  },
  infoGrid: {
    gap: Platform.OS === 'ios' ? 16 : 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  infoLabel: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    fontWeight: '600',
    color: '#333',
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 180,
    backgroundColor: '#F0F0F0',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
    padding: Platform.OS === 'ios' ? 12 : 10,
  },
  photoText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
    marginBottom: Platform.OS === 'ios' ? 10 : 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 12,
    marginHorizontal: Platform.OS === 'ios' ? 6 : 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  callButton: {
    backgroundColor: '#8B4513',
  },
  enquiryButton: {
    backgroundColor: '#8B4513',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
    opacity: 0.7,
  },
  footerButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  // Guest user styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 30 : 24,
    backgroundColor: '#FAF0E6',
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