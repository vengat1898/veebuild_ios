import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function HotenquiryForm() {
  const router = useRouter();
  const { session, isSessionLoaded } = useContext(SessionContext);

  // Form states
  const [name, setName] = useState(session?.name || '');
  const [mobileNumber, setMobileNumber] = useState(session?.mobile || '');
  const [category, setCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);

  // Refs for keyboard handling
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const inputPositions = useRef({});
  const modalScrollViewRef = useRef(null);

  // Loading states
  if (!isSessionLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginPrompt}>Please login to submit enquiries</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fetch main categories
  const fetchMainCategories = async () => {
    try {
      const response = await api.get('maincategory.php');
      if (response.data.result === 'Success') {
        setMainCategories(response.data.storeList);
      } else {
        Alert.alert('Error', 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    }
  };

  const handleOpenModal = async () => {
    setModalVisible(true);
    await fetchMainCategories();
  };

  const filteredCategories = mainCategories.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const uploadImage = async (uri) => {
    try {
      console.log('Starting image upload with URI:', uri);
      
      if (!uri) {
        throw new Error('No image URI provided');
      }

      // Generate filename similar to Android version
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5);
      const filename = `Profile_${timestamp}.jpg`;

      const formData = new FormData();
      
      const imageFile = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'image/jpeg',
        name: filename,
      };

      console.log('Image file object:', imageFile);
      formData.append('file', imageFile);

      console.log('Uploading to hot_enquiry_file.php');

      const response = await api.post('hot_enquiry_file.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      console.log('Upload response:', response.data);

      if (response.data) {
        if (response.data.success !== undefined) {
          if (response.data.success === "1" || response.data.success === 1) {
            setImageUploadError(false);
            return filename;
          } else {
            throw new Error(response.data.message || 'Upload failed');
          }
        } else {
          setImageUploadError(false);
          return filename;
        }
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Image upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      setImageUploadError(true);
      
      if (error.response?.status === 413) {
        throw new Error('Image file is too large. Please select a smaller image.');
      } else if (error.response?.status === 415) {
        throw new Error('Image format not supported. Please select a JPEG or PNG image.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.code === 'TIMEOUT') {
        throw new Error('Upload timeout. Please try again.');
      } else {
        throw new Error(error.message || 'Failed to upload image. Please try again.');
      }
    }
  };

  // Improved keyboard handling functions
  const handleInputLayout = (event, inputName) => {
    // Store the position of each input for scrolling
    inputPositions.current[inputName] = event.nativeEvent.layout;
  };

  const handleInputFocus = (inputName) => {
    // Scroll to the input position with a small delay to ensure keyboard is up
    setTimeout(() => {
      const position = inputPositions.current[inputName];
      if (position && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: position.y - 100,
          animated: true
        });
      }
    }, 300);
  };

  const focusNextInput = (nextInput) => {
    inputRefs.current[nextInput]?.focus();
  };

  // Handle modal search input focus
  const handleModalSearchFocus = () => {
    // Scroll modal content up when search input is focused
    setTimeout(() => {
      modalScrollViewRef.current?.scrollTo({
        y: 0,
        animated: true
      });
    }, 100);
  };

  // Camera & Gallery functions
  const handleCameraPick = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        return Alert.alert('Permission Required', 'Camera access is required to take photos.');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('Camera image selected:', uri);
        setImage(uri);
        setImageUploadError(false);
      }
    } catch (error) {
      console.error('Camera picker error:', error);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const handleGalleryPick = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        return Alert.alert('Permission Required', 'Media library access is required to select photos.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('Gallery image selected:', uri);
        setImage(uri);
        setImageUploadError(false);
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert('Error', 'Failed to access gallery. Please try again.');
    }
  };

  const pickImage = () => {
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: handleCameraPick },
        { text: 'Gallery', onPress: handleGalleryPick },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Submit function
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!message || !category) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    setIsSubmitting(true);
    try {
      let imageFilename = '';
      
      if (image) {
        try {
          console.log('Attempting to upload image...');
          imageFilename = await uploadImage(image);
          console.log('Image uploaded successfully:', imageFilename);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          
          const continueWithoutImage = await new Promise((resolve) => {
            Alert.alert(
              'Image Upload Failed',
              `${uploadError.message}\n\nWould you like to continue without the image?`,
              [
                { text: 'Try Again', onPress: () => resolve(false) },
                { text: 'Continue Without Image', onPress: () => resolve(true) },
              ]
            );
          });

          if (!continueWithoutImage) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      const selectedCategory = mainCategories.find(cat => cat.title === category);
      if (!selectedCategory) {
        return Alert.alert('Error', 'Invalid category selected');
      }

      const params = new URLSearchParams();
      params.append('user_id', session.id);
      params.append('name', name);
      params.append('mobile', mobileNumber);
      params.append('message', message);
      params.append('category_id', selectedCategory.id);
      params.append('image', imageFilename || '');
      params.append('city', session.city || 'Unknown');

      console.log('Submitting enquiry with params:', Object.fromEntries(params));

      const response = await api.post('hot_enquiry_add.php', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      console.log('Enquiry submission response:', response.data);

      if (response.data.success === 1) {
        Alert.alert('Success', 'Enquiry submitted successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B4513', '#A0522D', '#D2691E']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hot Enquiry Form</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.formContainer}>
              <TextInput 
                ref={ref => inputRefs.current.name = ref}
                style={styles.input} 
                placeholder="Enter your name" 
                value={name} 
                onChangeText={setName}
                onLayout={(e) => handleInputLayout(e, 'name')}
                onFocus={() => handleInputFocus('name')}
                returnKeyType="next"
                onSubmitEditing={() => focusNextInput('mobile')}
                blurOnSubmit={false}
              />
              
              <TextInput
                ref={ref => inputRefs.current.mobile = ref}
                style={styles.input}
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChangeText={(text) => /^\d*$/.test(text) && setMobileNumber(text)}
                keyboardType="numeric"
                maxLength={10}
                onLayout={(e) => handleInputLayout(e, 'mobile')}
                onFocus={() => handleInputFocus('mobile')}
                returnKeyType="next"
                onSubmitEditing={() => setModalVisible(true)}
                blurOnSubmit={false}
              />

              <TouchableOpacity 
                style={styles.input} 
                onPress={handleOpenModal} 
                disabled={isSubmitting}
                onLayout={(e) => handleInputLayout(e, 'category')}
                onFocus={() => handleInputFocus('category')}
              >
                <Text style={{ color: category ? '#000' : '#888', fontSize: 16 }}>
                  {category || 'Select category'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.imageUploadBox, imageUploadError && styles.uploadError]} 
                onPress={pickImage} 
                disabled={isSubmitting}
                onLayout={(e) => handleInputLayout(e, 'image')}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <Ionicons 
                      name={imageUploadError ? "warning-outline" : "cloud-upload-outline"} 
                      size={30} 
                      color={imageUploadError ? "#8B0000" : "#8B4513"} 
                    />
                    <Text style={{ color: imageUploadError ? "#8B0000" : "#8B4513", marginTop: 5, fontWeight: '500' }}>
                      {imageUploadError ? "Upload Failed - Tap to retry" : "Upload Image"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TextInput
                ref={ref => inputRefs.current.message = ref}
                style={[styles.input, styles.messageInput]}
                placeholder="Enter your message"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onLayout={(e) => handleInputLayout(e, 'message')}
                onFocus={() => handleInputFocus('message')}
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <TouchableOpacity 
                style={[styles.continueButton, isSubmitting && styles.disabledButton]} 
                onPress={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Submit Enquiry</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        transparent 
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalWrapper}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <TextInput 
                placeholder="Search category..." 
                style={styles.searchInput} 
                value={searchText} 
                onChangeText={setSearchText} 
                autoFocus={true}
                onFocus={handleModalSearchFocus}
                returnKeyType="search"
              />
              <ScrollView 
                ref={modalScrollViewRef}
                style={styles.modalListContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                <FlatList
                  data={filteredCategories}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.modalItem} 
                      onPress={() => { 
                        setCategory(item.title); 
                        setModalVisible(false); 
                        setSearchText(''); 
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false} // Let the parent ScrollView handle scrolling
                  ListEmptyComponent={
                    <Text style={styles.noResultsText}>No categories found</Text>
                  }
                />
              </ScrollView>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={styles.closeModal}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAF0E6' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FAF0E6'
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: 20, 
    paddingBottom: 30, 
    paddingTop: 20,
  },
  loginPrompt: { 
    fontSize: 16, 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#8B4513',
    fontWeight: '500'
  },
  loginButton: { 
    backgroundColor: '#8B4513', 
    padding: 16, 
    borderRadius: 50, 
    alignItems: 'center', 
    marginHorizontal: 50, 
    elevation: 5,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: { 
    color: 'white', 
    fontWeight: '600', 
    fontSize: 16 
  },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 50 : 40, 
    paddingBottom: 15, 
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: Platform.OS === 'ios' ? 30 : 20 
  },
  headerTitle: { 
    flex: 1, 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 20, 
    textAlign: 'center' 
  },
  input: { 
    backgroundColor: 'white', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    marginBottom: 15, 
    fontSize: 16, 
    color: '#333', 
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513'
  },
  messageInput: { 
    height: 120, 
    textAlignVertical: 'top' 
  },
  imageUploadBox: { 
    backgroundColor: '#FFF8DC', 
    borderRadius: 12, 
    height: 160, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#D2B48C', 
    borderStyle: 'dashed',
    overflow: 'hidden', 
    shadowColor: '#8B4513', 
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 4, 
    elevation: 3 
  },
  uploadError: { 
    borderColor: '#8B0000', 
    backgroundColor: '#FFE4E1' 
  },
  uploadedImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 12, 
    resizeMode: 'cover' 
  },
  continueButton: { 
    borderRadius: 50, 
    paddingVertical: 16, 
    alignItems: 'center', 
    marginTop: 10, 
    elevation: 3, 
    shadowColor: '#8B4513', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    backgroundColor: '#8B4513',
    borderWidth: 1,
    borderColor: '#A0522D'
  },
  disabledButton: { 
    opacity: 0.6 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  modalWrapper: { 
    flex: 1, 
    backgroundColor: 'rgba(139, 69, 19, 0.5)', 
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  modalContainer: { 
    backgroundColor: 'white', 
    borderRadius: 15, 
    maxHeight: '80%', // Increased height to accommodate keyboard
    padding: 15, 
    shadowColor: '#8B4513', 
    shadowOpacity: 0.2, 
    shadowOffset: { width: 0, height: 5 }, 
    shadowRadius: 10, 
    elevation: 10,
    borderWidth: 1,
    borderColor: '#D2B48C'
  },
  modalListContainer: {
    maxHeight: '70%', // Limit the list height to ensure close button is visible
  },
  searchInput: { 
    backgroundColor: '#FAF0E6', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    marginBottom: 10, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D2B48C'
  },
  modalItem: { 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5DEB3' 
  },
  noResultsText: { 
    textAlign: 'center', 
    padding: 20, 
    color: '#8B4513', 
    fontSize: 16,
    fontStyle: 'italic'
  },
  closeModal: { 
    marginTop: 15, 
    backgroundColor: '#8B4513', 
    padding: 14, 
    borderRadius: 50, 
    alignItems: 'center',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  }
});