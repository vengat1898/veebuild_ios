import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function Materials({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); 
  
  const { session, isSessionLoaded } = useContext(SessionContext);
  const userId = session?.id;

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('category.php');
      
      if (response.data.result === 'Success') {
        setCategories(response.data.storeList);
        setShowTrending(true);
      } else {
        Alert.alert('Error', 'Failed to load categories');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch main categories
  const fetchMainCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('maincategory.php');
      
      if (response.data.result === 'Success') {
        setMainCategories(response.data.storeList);
        setShowTrending(true);
        setSelectedCategoryId(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load main categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryById = async (catId) => {
    if (!catId) return;

    try {
      setLoading(true);
      const response = await api.get(`cat.php?cat_id=${catId}`);

      if (response.data.result === 'Success') {
        setCategories(response.data.storeList);
        setShowTrending(true);
        setSelectedCategoryId(catId); 
      } else if (response.data.text === 'List Empty!') {
        setCategories([]);
        setShowTrending(true);
        setSelectedCategoryId(catId); 
        Alert.alert('Info', 'No materials found in this category');
      } else {
        Alert.alert('Error', 'Failed to load category data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMainCategories();
  }, []);

  const handleCategoryPress = (item) => {
    if (!isSessionLoaded) return;
    
    if (!userId) {
      Alert.alert(
        'Login Required',
        'You need to login to view this category',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/components/Login') }
        ]
      );
      return;
    }

    router.push({ 
      pathname: '/components/Shop', 
      params: { 
        cat_id: item.id, 
        customer_id: userId 
      } 
    });
  };

  if (!isSessionLoaded) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Brown Gradient */}
      <LinearGradient
        colors={['#ed9d64ff', '#d88e5aff', '#b0652fff']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Materials</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="construct" size={24} color="white" />
          </View>
        </View>
      </LinearGradient>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
        <TextInput
          placeholder="Search materials..."
          style={styles.searchInput}
          placeholderTextColor="#A0522D"
          onPressIn={() => router.push('/components/Search')}
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Left Sidebar - Categories */}
        <View style={styles.sidebar}>
          <TouchableOpacity 
            style={[
              styles.allCategoriesBtn,
              selectedCategoryId === null && styles.selectedCategory
            ]} 
            onPress={fetchCategories}
          >
            <Ionicons 
              name="apps" 
              size={16} 
              color={selectedCategoryId === null ? 'white' : '#8B4513'} 
            />
            <Text style={[
              styles.allCategoriesText,
              selectedCategoryId === null && styles.selectedCategoryText
            ]}>
              All
            </Text>
          </TouchableOpacity>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {mainCategories.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedCategoryId === item.id && styles.selectedCategory
                ]}
                onPress={() => fetchCategoryById(item.id)}
              >
                <View style={styles.categoryImageWrapper}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.categoryImage} 
                    resizeMode="cover"
                  />
                </View>
                <Text 
                  style={[
                    styles.categoryLabel,
                    selectedCategoryId === item.id && styles.selectedCategoryText
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Content - Materials Grid */}
        <View style={styles.contentArea}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B4513" />
              <Text style={styles.loadingText}>Loading materials...</Text>
            </View>
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.materialsGrid}
            >
              {categories.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.materialCard}
                  onPress={() => handleCategoryPress(item)}
                >
                  <LinearGradient
                    colors={['#c5875bff', '#A0522D', '#8B4513']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.imageWrapper}>
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.materialImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay} />
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.materialName} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF8F0' 
  },
  centerContent: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: 10,
    color: '#8B4513',
    fontSize: 16,
  },

  // Header Styles
  header: {
    height: 120,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: { 
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerIcon: {
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

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 25,
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

  // Main Content Layout
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  // Sidebar Styles
  sidebar: {
    width: 100,
    backgroundColor: 'white',
    marginRight: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 15,
  },
  allCategoriesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B4513',
    backgroundColor: 'white',
  },
  allCategoriesText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
    marginLeft: 4,
    textAlign: 'center',
  },
  categoriesList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  categoryImageWrapper: {
    padding: 8,
    backgroundColor: '#FFF8F0',
    borderRadius: 10,
    marginBottom: 6,
  },
  categoryImage: { 
    width: 35, 
    height: 35, 
    borderRadius: 8,
  },
  categoryLabel: { 
    fontSize: 9, 
    color: '#8B4513', 
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 11,
  },

  // Content Area Styles
  contentArea: {
    flex: 1,
    marginLeft: 5,
  },
  sectionHeader: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#8B4513',
    marginBottom: 5,
  },
  titleUnderline: {
    height: 3,
    backgroundColor: '#8B4513',
    width: 60,
    borderRadius: 2,
  },

  // Materials Grid
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  materialCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    height: 120,
  },
  materialImage: { 
    width: '100%', 
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  materialName: { 
    fontSize: 12, 
    color: 'white', 
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    lineHeight: 14,
  },

  // Selection Styles
  selectedCategory: {
    backgroundColor: '#d2882fff',
    borderWidth: 1,
    borderColor: '#654321',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
});