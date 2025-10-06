import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import api from "../services/api";

export default function HirepeopleDetails() {
  const router = useRouter();
  const {
    id,
    title,
    cat_id = '',
    v_id = '',
    user_id = '',
    customer_id = '',
  } = useLocalSearchParams();

  // Console log all parameters
  console.log('=================== COMPONENT PARAMETERS ===================');
  console.log('ID:', id);
  console.log('Title:', title);
  console.log('Category ID:', cat_id);
  console.log('V ID:', v_id);
  console.log('User ID:', user_id);
  console.log('Customer ID:', customer_id);
  console.log('========================================================');
  console.log('');

  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleCallPress = (mobileNumber) => {
    if (mobileNumber) {
      Linking.openURL(`tel:${mobileNumber}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleWhatsAppPress = (mobileNumber) => {
    if (mobileNumber) {
      // Note: WhatsApp requires phone number in international format without '+' or '0'
      const phoneNumber = mobileNumber.replace(/^\+?0?/, '');
      Linking.openURL(`https://wa.me/${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleImageError = (id) => {
    console.log('=================== IMAGE ERROR ===================');
    console.log('Failed to load image for ID:', id);
    console.log('==================================================');
    console.log('');
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const fetchProfessionals = async () => {
    const apiUrl = `professional_list_by_id.php?occupation=${id}`;
    
    console.log('=================== API REQUEST ===================');
    console.log('URL:', apiUrl);
    console.log('Method: GET');
    console.log('Timestamp:', new Date().toISOString());
    console.log('==================================================');
    console.log('');

    try {
      setLoading(true);
      const response = await api.get(apiUrl);

      console.log('=================== API RESPONSE ===================');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', JSON.stringify(response.headers, null, 2));
      console.log('');
      console.log('Full Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('');
      console.log('Response Data Type:', typeof response.data);
      console.log('Has storeList:', !!response.data?.storeList);
      
      if (response.data?.storeList) {
        console.log('Store List Length:', response.data.storeList.length);
        console.log('Store List Items:');
        response.data.storeList.forEach((item, index) => {
          console.log(`  Item ${index + 1}:`, JSON.stringify(item, null, 4));
        });
      }
      console.log('===================================================');
      console.log('');

      if (response.data?.storeList) {
        const processedData = response.data.storeList.map((item) => {
          let imagePath = item.aatharimage || '';
          const originalImagePath = imagePath;
          
          if (imagePath.includes('https://veebuilds.com')) {
            imagePath = imagePath.replace('https://veebuilds.com', '');
          }
          imagePath = imagePath.replace(/^\/+|\/+$/g, '');

          const finalImageUrl = imagePath ? `https://veebuilds.com/${imagePath}` : null;
          
          console.log('=================== IMAGE PROCESSING ===================');
          console.log('Item ID:', item.id);
          console.log('Original Image Path:', originalImagePath);
          console.log('Processed Image Path:', imagePath);
          console.log('Final Image URL:', finalImageUrl);
          console.log('========================================================');
          console.log('');

          return {
            ...item,
            aatharimage: finalImageUrl,
          };
        });
        
        console.log('=================== PROCESSED DATA ===================');
        console.log('Total Processed Items:', processedData.length);
        console.log('Processed Data:');
        console.log(JSON.stringify(processedData, null, 2));
        console.log('======================================================');
        console.log('');
        
        setPeople(processedData);
      }
    } catch (error) {
      console.log('=================== API ERROR ===================');
      console.log('Error Type:', error.constructor.name);
      console.log('Error Message:', error.message);
      console.log('Error Code:', error.code);
      console.log('Error Config:', JSON.stringify(error.config, null, 2));
      if (error.response) {
        console.log('Error Response Status:', error.response.status);
        console.log('Error Response Data:', JSON.stringify(error.response.data, null, 2));
        console.log('Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
      }
      console.log('Stack Trace:', error.stack);
      console.log('=================================================');
      console.log('');
      
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('=================== API CALL COMPLETED ===================');
      console.log('Loading State Set to False');
      console.log('Timestamp:', new Date().toISOString());
      console.log('==========================================================');
      console.log('');
    }
  };

  useEffect(() => {
    console.log('=================== COMPONENT MOUNTED ===================');
    console.log('Calling fetchProfessionals...');
    console.log('=========================================================');
    console.log('');
    fetchProfessionals();
  }, []);

  useEffect(() => {
    console.log('=================== SEARCH FILTER ===================');
    console.log('Search Text:', searchText);
    console.log('People Array Length:', people.length);
    
    if (!searchText) {
      console.log('No search text - showing all people');
      setFilteredPeople(people);
    } else {
      const lowerSearch = searchText.toLowerCase();
      console.log('Search Text (lowercase):', lowerSearch);
      
      const filtered = people.filter(
        (item) =>
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.city?.toLowerCase().includes(lowerSearch)
      );
      
      console.log('Filtered Results Count:', filtered.length);
      console.log('Filtered Results:');
      filtered.forEach((item, index) => {
        console.log(`  Result ${index + 1}: ${item.name} - ${item.city}`);
      });
      
      setFilteredPeople(filtered);
    }
    console.log('====================================================');
    console.log('');
  }, [searchText, people]);

  const renderCard = ({ item }) => {
    console.log('=================== RENDERING CARD ===================');
    console.log('Item ID:', item.id);
    console.log('Item Name:', item.name);
    console.log('Item City:', item.city);
    console.log('Item Image URL:', item.aatharimage);
    console.log('======================================================');
    console.log('');
    
    const hasImageError = imageErrors[item.id];
    const showPlaceholder = !item.aatharimage || hasImageError;

    return (
      <LinearGradient
        colors={['#FDF6EC', '#F8F0E5', '#F4E8D8']}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          {showPlaceholder ? (
            <View style={styles.placeholder}>
              <Ionicons name="person-circle-outline" size={60} color="#8B7355" />
            </View>
          ) : (
            <Image
              source={{ uri: item.aatharimage }}
              style={styles.logo}
              onError={() => handleImageError(item.id)}
              resizeMode="cover"
            />
          )}

          <View style={styles.textGroupContainer}>
            <TouchableOpacity
              onPress={() => {
                console.log('=================== NAVIGATION TO DETAILS ===================');
                console.log('Target Route: /components/HirepeopleDetails1');
                console.log('Navigation Data:', JSON.stringify(item, null, 2));
                console.log('==============================================================');
                console.log('');
                
                router.push({
                  pathname: '/components/HirepeopleDetails1',
                  params: { data: JSON.stringify(item) },
                });
              }}
              style={styles.cardTextContainer}
            >
              <View style={styles.textGroup}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color="#8B7355" />
                  <Text style={styles.subText}>{item.city}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="briefcase-outline" size={14} color="#8B7355" />
                  <Text style={styles.subText}>{item.yearofexp} years of experience</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="chatbubble-outline" size={14} color="#8B7355" />
                  <Text style={styles.subText}>{item.enquery} enquiry answers</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              console.log('=================== CALL BUTTON PRESSED ===================');
              console.log('Item ID:', item.id);
              console.log('Item Name:', item.name);
              console.log('Phone Number:', item.mobile);
              console.log('===========================================================');
              console.log('');
              handleCallPress(item.mobile);
            }}
          >
            <Ionicons name="call" size={16} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              const enquiryParams = {
                cat_id,
                land_id: item.id,
                v_id: item.id,
                customer_id,
                user_id,
                product_name: item.name || '',
                product_id: item.id,
                city: item.city || '',
              };
              
              console.log('=================== NAVIGATION TO ENQUIRY ===================');
              console.log('Target Route: /components/HirepeopleEnquiry');
              console.log('Enquiry Parameters:');
              console.log(JSON.stringify(enquiryParams, null, 2));
              console.log('==============================================================');
              console.log('');
              
              router.push({
                pathname: '/components/HirepeopleEnquiry',
                params: enquiryParams,
              });
            }}
          >
            <Ionicons name="information-circle" size={16} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Enquiry</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              console.log('=================== WHATSAPP BUTTON PRESSED ===================');
              console.log('Item ID:', item.id);
              console.log('Item Name:', item.name);
              console.log('Phone Number:', item.mobile);
              console.log('===============================================================');
              console.log('');
              handleWhatsAppPress(item.mobile);
            }}
          >
            <Ionicons name="logo-whatsapp" size={16} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  if (loading) {
    console.log('=================== LOADING STATE ===================');
    console.log('Component is in loading state');
    console.log('=====================================================');
    console.log('');
    
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B4513" style={styles.loader} />
      </View>
    );
  }

  if (error) {
    console.log('=================== ERROR STATE ===================');
    console.log('Component is in error state');
    console.log('Error:', error);
    console.log('===================================================');
    console.log('');
    
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          onPress={() => {
            console.log('=================== BACK NAVIGATION (ERROR) ===================');
            console.log('Navigating back due to error');
            console.log('================================================================');
            console.log('');
            router.back();
          }} 
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('=================== RENDER MAIN COMPONENT ===================');
  console.log('Filtered People Count:', filteredPeople.length);
  console.log('Search Text:', searchText);
  console.log('==============================================================');
  console.log('');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#D2691E']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => {
            console.log('=================== BACK NAVIGATION ===================');
            console.log('Back button pressed');
            console.log('======================================================');
            console.log('');
            router.back();
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{title}</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8B7355" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by name or city"
          value={searchText}
          onChangeText={(text) => {
            console.log('=================== SEARCH INPUT CHANGE ===================');
            console.log('New Search Text:', text);
            console.log('===========================================================');
            console.log('');
            setSearchText(text);
          }}
          style={styles.searchInput}
          placeholderTextColor="#8B7355"
        />
      </View>

      {filteredPeople.length > 0 ? (
        <FlatList
          data={filteredPeople}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={() => {
            console.log('=================== FLATLIST END REACHED ===================');
            console.log('User scrolled to end of list');
            console.log('============================================================');
            console.log('');
          }}
        />
      ) : (
        <View style={styles.noResults}>
          <Ionicons name="search-outline" size={60} color="#8B7355" />
          <Text style={styles.noResultsText}>No professionals found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC',
  },
  header: {
    height: 120,
    paddingTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8D5C4',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#5D4037',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E8D5C4',
    minHeight: 200,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logo: {
    width: '40%',
    height: 150,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: '#E8D5C4',
  },
  placeholder: {
    width: '40%',
    height: 150,
    backgroundColor: '#F8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8D5C4',
    borderStyle: 'dashed',
  },
  textGroupContainer: {
    flex: 1,
    marginLeft: 16,
  },
  textGroup: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#5D4037',
    textAlign: 'left',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'left',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
    paddingTop: 16,
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    flex: 1,
    minHeight: 44,
    maxWidth: '32%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  icon: {},
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  errorButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B7355',
    fontWeight: '500',
  },
  cardTextContainer: {
    flex: 1,
  },
});