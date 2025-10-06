import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // ✅ for gradient
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

export default function Realestate() {
  const [realEstateData, setRealEstateData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cat_id, customer_id } = params;

  const handleCallPress = (mobileNumber) => {
    if (mobileNumber) {
      Linking.openURL(`tel:${mobileNumber}`).catch(() => {
        Alert.alert('Error', 'Could not initiate call');
      });
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleWhatsAppPress = (mobileNumber) => {
    if (mobileNumber) {
      const cleanedNumber = mobileNumber.replace(/^\+?0?|\s+/g, '');
      const whatsappUrl = `https://wa.me/${cleanedNumber}`;
      Linking.openURL(whatsappUrl).catch(() => {
        Alert.alert('Error', 'Could not open WhatsApp');
      });
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('all_land_list.php');
        const processedData = response.data.storeList.map((item) => {
          const baseUrl = item.url.replace('/master//', '/master/');
          let firstImage = '';
          try {
            const imagesString = item.siteimg.replace(/^\[|\]$/g, '');
            const imagesArray = imagesString.split(', ')
              .map(img => img.trim())
              .filter(img => img.length > 0);
            if (imagesArray.length > 0) {
              firstImage = baseUrl + imagesArray[0];
            }
          } catch (e) {}
          return { ...item, firstImage };
        });
        setRealEstateData(processedData);
        setFilteredData(processedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text) {
      setFilteredData(realEstateData);
      return;
    }
    const filtered = realEstateData.filter(item => {
      const matchBroker = item.land_brocker?.toLowerCase().includes(text.toLowerCase());
      const matchArea = item.land_area?.toLowerCase().includes(text.toLowerCase());
      const matchType = item.property_type?.toLowerCase().includes(text.toLowerCase());
      return matchBroker || matchArea || matchType;
    });
    setFilteredData(filtered);
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {item.firstImage ? (
          <Image
            source={{ uri: item.firstImage }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.propertyImage, styles.placeholderImage]}>
            <Ionicons name="image" size={50} color="#ccc" />
          </View>
        )}

        <View style={styles.textGroupContainer}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/components/Landdetails',
                params: { id: item.id, cat_id, customer_id, vendor_id: item.vendor_id }
              })
            }
            style={styles.cardTextContainer}
          >
            <View style={styles.textGroup}>
              <Text style={styles.title}>{item.land_brocker}</Text>
              <Text style={styles.subText}>Location: {item.land_area}</Text>
              <Text style={styles.subText}>Size: {item.land_size} sq ft</Text>
              <Text style={styles.subText}>Price: ₹{item.cost_per_sq} per sq ft</Text>
              <Text style={styles.subText}>Type: {item.property_type}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => handleCallPress(item.vendor_mobile)}>
          <Ionicons name="call" size={16} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: '/components/EnquiryRealHire',
              params: { cat_id, land_id: item.id, v_id: item.vendor_id || '' }
            })
          }
        >
          <Ionicons name="information-circle" size={16} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Enquiry</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleWhatsAppPress(item.vendor_mobile)}>
          <Ionicons name="logo-whatsapp" size={16} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B4513" style={styles.loader} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Gradient Header */}
      <LinearGradient
        colors={['#5D4037', '#8D6E63', '#D7CCC8']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Real Estate</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8D6E63" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, location, type"
          placeholderTextColor="#8D6E63"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.noResults}>
          <Text>No properties found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: {
    height: 120,
    paddingTop: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 5,
  },
  backButton: { marginRight: 10 },
  headerText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#A1887F',
    alignItems: 'center',
    backgroundColor: '#EFEBE9',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, color: '#000' },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#5D4037',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    minHeight: 250,
  },
  cardContent: { flexDirection: 'row', marginBottom: 16 },
  propertyImage: {
    width: '40%',
    height: 150,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  textGroupContainer: { flex: 1, marginLeft: 16 },
  textGroup: { flex: 1, justifyContent: 'flex-start', gap: 8 },
  title: { fontWeight: 'bold', fontSize: 15, color: '#333', textAlign: 'left' },
  subText: { fontSize: 12, color: '#555', textAlign: 'left' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 'auto',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8D6E63', // ✅ solid brown
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    minHeight: 40,
    maxWidth: '32%',
  },
  buttonText: { color: 'white', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  icon: {},
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  noResults: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardTextContainer: { flex: 1 },
});
