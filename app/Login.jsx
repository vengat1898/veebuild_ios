// import { FontAwesome } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useContext, useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
// import logoimg from '../assets/images/veebuilder.png';
// import { SessionContext } from '../context/SessionContext.jsx';
// import api from "./services/api.jsx";

// export default function LoginScreen() {
//   const router = useRouter();
//   const { saveSession, isSessionLoaded, session } = useContext(SessionContext);

//   const [mobileNumber, setMobileNumber] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const userType = '1';

//   useEffect(() => {
//     if (isSessionLoaded && session?.id) {
//       router.replace('/components/Home');
//     }
//   }, [isSessionLoaded, session]);

//   const handleGetOtp = async () => {
//     const regex = /^[6-9]\d{9}$/;
//     if (!regex.test(mobileNumber)) {
//       Alert.alert('Invalid Number', 'Please enter a valid 10-digit Indian mobile number.');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('type', userType);
//       formData.append('mobile', mobileNumber);

//       const response = await api.post(
//         'login.php',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       console.log('Login response:', response.data);

//       if (response.data.success == 1) {
//         const userId = response.data.userId?.toString() || '';
        
//         await saveSession({
//           id: userId,
//           mobile: mobileNumber,
//           type: userType,
//         });

//         router.push({
//           pathname: '/Otp',
//           params: {
//             otp: response.data.otp,
//             mobile: mobileNumber,
//             userId: userId,
//           },
//         });
//       } else {
//         Alert.alert('Error', response.data.message || 'Failed to send OTP');
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGuestLogin = async () => {
//     setIsLoading(true);
//     try {
//       // Create a guest session with dummy data
//       await saveSession({
//         id: 'guest_user',
//         mobile: '',
//         type: 'guest',
//         isGuest: true,
//       });

//       // Navigate directly to home screen
//       router.replace('/components/Home');
//     } catch (error) {
//       console.error('Guest login error:', error);
//       Alert.alert('Error', 'Unable to login as guest. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isSessionLoaded) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#1e90ff" />
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={{ flex: 1 }}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View style={styles.container}>
//           <Image source={logoimg} style={styles.logo} resizeMode="contain" />
//           <Text style={styles.heading}>Sign In</Text>

//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter Mobile Number"
//               keyboardType="number-pad"
//               value={mobileNumber}
//               onChangeText={(text) => {
//                 const cleanText = text.replace(/[^0-9]/g, '');
//                 if (cleanText.length <= 10) {
//                   setMobileNumber(cleanText);
//                 }
//               }}
//               maxLength={10}
//             />
//             <FontAwesome name="phone" size={20} color="gray" style={styles.icon} />
//           </View>

//           <TouchableOpacity 
//             style={styles.button} 
//             onPress={handleGetOtp}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Get OTP</Text>
//             )}
//           </TouchableOpacity>

//           {/* Guest Login Option */}
//           <View style={styles.guestContainer}>
//             <View style={styles.divider} />
//             <Text style={styles.guestText}>OR</Text>
//             <View style={styles.divider} />
//           </View>

//           <TouchableOpacity 
//             style={styles.guestButton} 
//             onPress={handleGuestLogin}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <ActivityIndicator color="#795805" />
//             ) : (
//               <Text style={styles.guestButtonText}>Continue as Guest</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   container: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     padding: 20, 
//     backgroundColor: '#fff' 
//   },
//   logo: { 
//     width: 250, 
//     height: 250, 
//     alignSelf: 'center', 
//     marginBottom: 20 
//   },
//   heading: { 
//     fontSize: 24, 
//     fontWeight: 'bold', 
//     color: '#795805ff', 
//     marginBottom: 20, 
//     textAlign: 'center' 
//   },
//   inputWrapper: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     borderColor: 'gray', 
//     borderWidth: 1, 
//     borderRadius: 5, 
//     marginBottom: 20, 
//     paddingHorizontal: 10 
//   },
//   input: { 
//     flex: 1, 
//     height: 50 
//   },
//   icon: { 
//     marginLeft: 10 
//   },
//   button: { 
//     height: 50, 
//     backgroundColor: '#795805ff', 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     borderRadius: 5 
//   },
//   buttonText: { 
//     color: '#fff', 
//     fontWeight: 'bold', 
//     fontSize: 16 
//   },
//   guestContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   divider: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#ddd',
//   },
//   guestText: {
//     marginHorizontal: 10,
//     color: '#666',
//     fontSize: 14,
//   },
//   guestButton: {
//     height: 50,
//     backgroundColor: 'transparent',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#795805ff',
//   },
//   guestButtonText: {
//     color: '#795805ff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import logoimg from '../assets/images/veebuilder.png';
import { SessionContext } from '../context/SessionContext.jsx';
import api from "./services/api.jsx";

export default function LoginScreen() {
  const router = useRouter();
  const { saveSession, isSessionLoaded, session } = useContext(SessionContext);

  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userType = '1';

  useEffect(() => {
    if (isSessionLoaded && session?.id) {
      router.replace('/components/Home');
    }
  }, [isSessionLoaded, session]);

  const handleGetOtp = async () => {
    const regex = /^[6-9]\d{9}$/;
    if (!regex.test(mobileNumber)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', userType);
      formData.append('mobile', mobileNumber);

      const response = await api.post(
        'login.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Login response:', response.data);

      if (response.data.success == 1) {
        const userId = response.data.userId?.toString() || '';
        
        await saveSession({
          id: userId,
          mobile: mobileNumber,
          type: userType,
        });

        router.push({
          pathname: '/Otp',
          params: {
            otp: response.data.otp,
            mobile: mobileNumber,
            userId: userId,
          },
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // Create a guest session with dummy data
      await saveSession({
        id: 'guest_user',
        mobile: '',
        type: 'guest',
        isGuest: true,
      });

      // Navigate directly to home screen
      router.replace('/components/Home');
    } catch (error) {
      console.error('Guest login error:', error);
      Alert.alert('Error', 'Unable to login as guest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSessionLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Image source={logoimg} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Sign In</Text>

            <View style={styles.inputWrapper}>
              <FontAwesome name="phone" size={20} color="gray" style={styles.iconLeft} />
              <TextInput
                style={styles.input}
                placeholder="Enter Mobile Number"
                keyboardType="number-pad"
                value={mobileNumber}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9]/g, '');
                  if (cleanText.length <= 10) {
                    setMobileNumber(cleanText);
                  }
                }}
                maxLength={10}
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleGetOtp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Get OTP</Text>
              )}
            </TouchableOpacity>

            {/* Guest Login Option */}
            <View style={styles.guestContainer}>
              <View style={styles.divider} />
              <Text style={styles.guestText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={[styles.guestButton, isLoading && styles.guestButtonDisabled]} 
              onPress={handleGuestLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#795805" />
              ) : (
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              )}
            </TouchableOpacity>

            {/* Spacer to ensure content stays above keyboard */}
            <View style={styles.spacer} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: { 
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    minHeight: Platform.OS === 'ios' ? '100%' : '90%',
  },
  logo: { 
    width: 250, 
    height: 250, 
    alignSelf: 'center', 
    marginBottom: 10,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  heading: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#795805ff', 
    marginBottom: 30, 
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 10, 
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    height: 55,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconLeft: {
    marginRight: 10,
  },
  input: { 
    flex: 1, 
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  button: { 
    height: 55, 
    backgroundColor: '#795805ff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 10,
    marginTop: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#795805',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 17,
    letterSpacing: 0.5,
  },
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    marginTop: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  guestText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  guestButton: {
    height: 55,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#795805ff',
    marginBottom: 20,
  },
  guestButtonDisabled: {
    opacity: 0.7,
  },
  guestButtonText: {
    color: '#795805ff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  spacer: {
    height: Platform.OS === 'android' ? 50 : 30,
  },
});