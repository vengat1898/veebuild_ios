// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useContext, useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { SessionContext } from '../../context/SessionContext';
// import api from "../services/api";

// export default function Materials({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [mainCategories, setMainCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showTrending, setShowTrending] = useState(false);
//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   // Get the selected category ID from params and ensure it's string for comparison
//   const selectedCategoryIdFromParams = params.selectedCategoryId ? params.selectedCategoryId.toString() : null;
//   const [selectedCategoryId, setSelectedCategoryId] = useState(selectedCategoryIdFromParams);
  
//   const { session, isSessionLoaded } = useContext(SessionContext);
//   const userId = session?.id;

//   // Fetch all categories
//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('category.php');
      
//       if (response.data.result === 'Success') {
//         setCategories(response.data.storeList);
//         setShowTrending(true);
        
//         console.log('📦 All categories loaded:', response.data.storeList.length);
//       } else {
//         Alert.alert('Error', 'Failed to load categories');
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       Alert.alert('Error', 'Failed to connect to server');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch main categories (for sidebar)
//   const fetchMainCategories = async () => {
//     try {
//       const response = await api.get('maincategory.php');
      
//       if (response.data.result === 'Success') {
//         const mainCats = response.data.storeList || [];
//         setMainCategories(mainCats);
//         setShowTrending(true);
        
//         console.log('🏷️ Main categories loaded:', mainCats.length);
//         console.log('🎯 Looking for category ID:', selectedCategoryIdFromParams);
//         console.log('📋 Available main categories:', mainCats.map(cat => ({ id: cat.id, title: cat.title })));
        
//         // If we have a selected category ID from params, find it in main categories
//         if (selectedCategoryIdFromParams) {
//           const foundCategory = mainCats.find(cat => cat.id.toString() === selectedCategoryIdFromParams);
//           console.log('🔍 Found category in main categories:', foundCategory);
          
//           if (foundCategory) {
//             // Fetch the specific category
//             await fetchCategoryById(selectedCategoryIdFromParams);
//           } else {
//             console.log('❌ Category not found in main categories, showing all');
//             setSelectedCategoryId(null);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching main categories:', error);
//       Alert.alert('Error', 'Failed to load main categories');
//     }
//   };

//   const fetchCategoryById = async (catId) => {
//     if (!catId) {
//       console.log('🔄 No category ID provided, fetching all categories');
//       await fetchCategories();
//       return;
//     }

//     try {
//       setLoading(true);
//       console.log('🔄 Fetching category by ID:', catId);
      
//       const response = await api.get(`cat.php?cat_id=${catId}`);

//       console.log('📡 Category API response:', response.data);

//       if (response.data.result === 'Success') {
//         setCategories(response.data.storeList || []);
//         setShowTrending(true);
//         setSelectedCategoryId(catId.toString());
//         console.log('✅ Category loaded successfully:', response.data.storeList?.length || 0, 'items');
//       } else if (response.data.text === 'List Empty!') {
//         setCategories([]);
//         setShowTrending(true);
//         setSelectedCategoryId(catId.toString());
//         console.log('ℹ️ Category is empty');
//         Alert.alert('Info', 'No materials found in this category');
//       } else {
//         console.log('❌ Category API returned error:', response.data.text);
//         Alert.alert('Error', 'Failed to load category data');
//         // Fallback to all categories
//         await fetchCategories();
//         setSelectedCategoryId(null);
//       }
//     } catch (error) {
//       console.error('Error fetching category:', error);
//       Alert.alert('Error', 'Failed to connect to server');
//       // Fallback to all categories
//       await fetchCategories();
//       setSelectedCategoryId(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       await fetchMainCategories();
//     };
//     loadData();
//   }, []);

//   // Handle when selected category changes
//   useEffect(() => {
//     console.log('🔄 Selected category changed:', selectedCategoryId);
//   }, [selectedCategoryId]);

//   const handleCategoryPress = (item) => {
//     if (!isSessionLoaded) return;
    
//     if (!userId) {
//       Alert.alert(
//         'Login Required',
//         'You need to login to view this category',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Login', onPress: () => router.push('/components/Login') }
//         ]
//       );
//       return;
//     }

//     console.log('🎯 Navigating to Shop with category:', item.id);
//     router.push({ 
//       pathname: '/components/Shop', 
//       params: { 
//         cat_id: item.id, 
//         customer_id: userId 
//       } 
//     });
//   };

//   // Handle sidebar category click
//   const handleSidebarCategoryPress = async (categoryId) => {
//     console.log('🏷️ Sidebar category pressed:', categoryId);
//     await fetchCategoryById(categoryId);
//   };

//   // Handle "All" categories click
//   const handleAllCategoriesPress = async () => {
//     console.log('🔄 All categories pressed');
//     setSelectedCategoryId(null);
//     await fetchCategories();
//   };

//   // Find the selected category name for display
//   const getSelectedCategoryName = () => {
//     if (!selectedCategoryId) return 'Materials';
    
//     const category = mainCategories.find(cat => cat.id.toString() === selectedCategoryId);
//     return category?.title || 'Materials';
//   };

//   if (!isSessionLoaded) {
//     return (
//       <View style={[styles.container, styles.centerContent]}>
//         <ActivityIndicator size="large" color="#8B4513" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header with Brown Gradient */}
//       <LinearGradient
//         colors={['#ed9d64ff', '#d88e5aff', '#b0652fff']}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>
//           <Text style={styles.headerText}>{getSelectedCategoryName()}</Text>
//           <View style={styles.headerIcon}>
//             <Ionicons name="construct" size={24} color="white" />
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Search Input */}
//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
//         <TextInput
//           placeholder="Search materials..."
//           style={styles.searchInput}
//           placeholderTextColor="#A0522D"
//           onPressIn={() => router.push('/components/Search')}
//         />
//       </View>

//       {/* Main Content Area */}
//       <View style={styles.mainContent}>
//         {/* Left Sidebar - Categories */}
//         <View style={styles.sidebar}>
//           <TouchableOpacity 
//             style={[
//               styles.allCategoriesBtn,
//               selectedCategoryId === null && styles.selectedCategory
//             ]} 
//             onPress={handleAllCategoriesPress}
//           >
//             <Ionicons 
//               name="apps" 
//               size={16} 
//               color={selectedCategoryId === null ? 'white' : '#8B4513'} 
//             />
//             <Text style={[
//               styles.allCategoriesText,
//               selectedCategoryId === null && styles.selectedCategoryText
//             ]}>
//               All
//             </Text>
//           </TouchableOpacity>

//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.categoriesList}
//           >
//             {mainCategories.map((item, index) => {
//               const isSelected = selectedCategoryId === item.id.toString();
//               console.log(`🔍 Category ${item.id} (${item.title}) - Selected: ${isSelected}`);
              
//               return (
//                 <TouchableOpacity
//                   key={item.id || index}
//                   style={[
//                     styles.categoryItem,
//                     isSelected && styles.selectedCategory
//                   ]}
//                   onPress={() => handleSidebarCategoryPress(item.id)}
//                 >
//                   <View style={styles.categoryImageWrapper}>
//                     <Image 
//                       source={{ uri: item.image }} 
//                       style={styles.categoryImage} 
//                       resizeMode="cover"
//                       onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
//                     />
//                   </View>
//                   <Text 
//                     style={[
//                       styles.categoryLabel,
//                       isSelected && styles.selectedCategoryText
//                     ]}
//                     numberOfLines={2}
//                   >
//                     {item.title}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>

//         {/* Right Content - Materials Grid */}
//         <View style={styles.contentArea}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>
//               {selectedCategoryId 
//                 ? `${getSelectedCategoryName()} Materials`
//                 : 'All Materials'
//               }
//             </Text>
//             <View style={styles.titleUnderline} />
//           </View>
          
//           {loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#8B4513" />
//               <Text style={styles.loadingText}>Loading materials...</Text>
//             </View>
//           ) : (
//             <ScrollView 
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.materialsGrid}
//             >
//               {categories.length > 0 ? (
//                 categories.map((item, index) => (
//                   <TouchableOpacity
//                     key={item.id || index}
//                     style={styles.materialCard}
//                     onPress={() => handleCategoryPress(item)}
//                   >
//                     <LinearGradient
//                       colors={['#c5875bff', '#A0522D', '#8B4513']}
//                       style={styles.cardGradient}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 1 }}
//                     >
//                       <View style={styles.imageWrapper}>
//                         <Image 
//                           source={{ uri: item.image }} 
//                           style={styles.materialImage}
//                           resizeMode="cover"
//                         />
//                         <View style={styles.imageOverlay} />
//                       </View>
//                       <View style={styles.cardFooter}>
//                         <Text style={styles.materialName} numberOfLines={2}>
//                           {item.title}
//                         </Text>
//                         <Ionicons name="chevron-forward" size={16} color="white" />
//                       </View>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <View style={styles.noMaterialsContainer}>
//                   <Ionicons name="construct-outline" size={48} color="#8B4513" />
//                   <Text style={styles.noMaterialsText}>No materials found</Text>
//                   <Text style={styles.noMaterialsSubText}>Try selecting a different category</Text>
//                 </View>
//               )}
//             </ScrollView>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#FFF8F0' 
//   },
//   centerContent: { 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#8B4513',
//     fontSize: 16,
//   },

//   // Header Styles
//   header: {
//     height: 120,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//     justifyContent: 'flex-end',
//     paddingBottom: 15,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//   },
//   backButton: { 
//     padding: 8,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//   },
//   headerIcon: {
//     padding: 8,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//   },
//   headerText: { 
//     color: 'white', 
//     fontSize: 24, 
//     fontWeight: 'bold',
//     textAlign: 'center',
//     flex: 1,
//   },

//   // Search Bar
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     marginHorizontal: 20,
//     marginVertical: 15,
//     paddingHorizontal: 16,
//     borderRadius: 25,
//     borderWidth: 1,
//     borderColor: '#D2691E',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     height: 50,
//   },
//   searchIcon: { 
//     marginRight: 12 
//   },
//   searchInput: { 
//     flex: 1, 
//     height: 50, 
//     color: '#8B4513', 
//     fontSize: 16,
//   },

//   // Main Content Layout
//   mainContent: {
//     flex: 1,
//     flexDirection: 'row',
//     paddingHorizontal: 10,
//   },

//   // Sidebar Styles
//   sidebar: {
//     width: 100,
//     backgroundColor: 'white',
//     marginRight: 10,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     paddingVertical: 15,
//   },
//   allCategoriesBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     marginHorizontal: 10,
//     marginBottom: 15,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: '#8B4513',
//     backgroundColor: 'white',
//   },
//   allCategoriesText: {
//     fontSize: 12,
//     color: '#8B4513',
//     fontWeight: '600',
//     marginLeft: 4,
//     textAlign: 'center',
//   },
//   categoriesList: {
//     paddingHorizontal: 10,
//     paddingBottom: 20,
//   },
//   categoryItem: {
//     alignItems: 'center',
//     marginBottom: 20,
//     padding: 10,
//     borderRadius: 12,
//     backgroundColor: 'white',
//   },
//   categoryImageWrapper: {
//     padding: 8,
//     backgroundColor: '#FFF8F0',
//     borderRadius: 10,
//     marginBottom: 6,
//   },
//   categoryImage: { 
//     width: 35, 
//     height: 35, 
//     borderRadius: 8,
//   },
//   categoryLabel: { 
//     fontSize: 9, 
//     color: '#8B4513', 
//     textAlign: 'center',
//     fontWeight: '500',
//     lineHeight: 11,
//   },

//   // Content Area Styles
//   contentArea: {
//     flex: 1,
//     marginLeft: 5,
//   },
//   sectionHeader: {
//     marginBottom: 15,
//     paddingHorizontal: 5,
//   },
//   sectionTitle: { 
//     fontSize: 14, 
//     fontWeight: 'bold', 
//     color: '#8B4513',
//     marginBottom: 5,
//   },
//   titleUnderline: {
//     height: 3,
//     backgroundColor: '#8B4513',
//     width: 60,
//     borderRadius: 2,
//   },

//   // Materials Grid
//   materialsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     paddingBottom: 20,
//     minHeight: 200,
//   },
//   materialCard: {
//     width: '48%',
//     marginBottom: 15,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   cardGradient: {
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   imageWrapper: {
//     position: 'relative',
//     height: 120,
//   },
//   materialImage: { 
//     width: '100%', 
//     height: '100%',
//   },
//   imageOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(139, 69, 19, 0.1)',
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//   },
//   materialName: { 
//     fontSize: 12, 
//     color: 'white', 
//     fontWeight: 'bold',
//     flex: 1,
//     marginRight: 8,
//     lineHeight: 14,
//   },

//   // Selection Styles
//   selectedCategory: {
//     backgroundColor: '#d2882fff',
//     borderWidth: 1,
//     borderColor: '#654321',
//   },
//   selectedCategoryText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },

//   // Loading State
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 50,
//   },

//   // No Materials State
//   noMaterialsContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 50,
//   },
//   noMaterialsText: {
//     color: '#8B4513',
//     fontSize: 16,
//     fontWeight: '600',
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   noMaterialsSubText: {
//     color: '#666',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// });


import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

const { height } = Dimensions.get('window');

export default function Materials({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Search modal states
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [filteredSearchData, setFilteredSearchData] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [sectionedSearchData, setSectionedSearchData] = useState([]);
  
  // Get the selected category ID from params and ensure it's string for comparison
  const selectedCategoryIdFromParams = params.selectedCategoryId ? params.selectedCategoryId.toString() : null;
  const [selectedCategoryId, setSelectedCategoryId] = useState(selectedCategoryIdFromParams);
  
  const { session, isSessionLoaded } = useContext(SessionContext);
  const userId = session?.id;

  // Utility function to handle image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    return `https://veebuilds.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Function to group search data alphabetically
  const groupDataAlphabetically = (data) => {
    if (!data || data.length === 0) return [];
    
    // Remove duplicates based on id
    const uniqueData = Array.from(
      new Map(data.map(item => [item.id, item])).values()
    );
    
    // Create a map to group by first letter
    const grouped = {};
    
    uniqueData.forEach(item => {
      if (!item.name) return;
      
      const firstLetter = item.name.charAt(0).toUpperCase();
      
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      
      grouped[firstLetter].push(item);
    });
    
    // Convert to SectionList format and sort alphabetically
    const sections = Object.keys(grouped)
      .sort()
      .map(letter => ({
        title: letter,
        data: grouped[letter].sort((a, b) => a.name.localeCompare(b.name))
      }));
    
    return sections;
  };

  // Fetch search data
  const fetchSearchData = useCallback(async () => {
    try {
      setLoadingSearch(true);
      const response = await axios.get(
        "https://veebuilds.com/mobile/searchlist.php",
        { timeout: 8000 }
      );
      
      if (response.data.result === "Success") {
        const searchList = response.data.storeList || [];
        
        // Remove duplicates based on id
        const uniqueSearchList = Array.from(
          new Map(searchList.map(item => [item.id, item])).values()
        );
        
        setSearchData(uniqueSearchList);
        
        // Group data alphabetically
        const groupedData = groupDataAlphabetically(uniqueSearchList);
        setSectionedSearchData(groupedData);
        setFilteredSearchData(uniqueSearchList);
        
        return uniqueSearchList;
      } else {
        throw new Error('Failed to fetch search data');
      }
    } catch (error) {
      console.error('Search data error:', error);
      return [];
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    filterSearchData(text);
  };

  // Filter search data based on query
  const filterSearchData = useCallback((query) => {
    if (!query.trim()) {
      // If query is empty, show all data grouped
      const groupedData = groupDataAlphabetically(searchData);
      setSectionedSearchData(groupedData);
      return;
    }
    
    const filtered = searchData.filter(item => 
      item.name && item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Remove duplicates before grouping
    const uniqueFiltered = Array.from(
      new Map(filtered.map(item => [item.id, item])).values()
    );
    
    // Group filtered data
    const groupedData = groupDataAlphabetically(uniqueFiltered);
    setSectionedSearchData(groupedData);
  }, [searchData]);

  // Handle item selection from search
  const handleSearchItemSelect = (item) => {
    console.log('🔍 Search item selected:', item.name, 'ID:', item.id, 'Type:', item.type);
    
    // Close search modal
    setSearchModalVisible(false);
    setSearchQuery('');
    
    // Navigate to Shop screen with selected item
    if (userId && item.id) {
      router.push({ 
        pathname: '/components/Shop', 
        params: { 
          cat_id: item.id.toString(),
          customer_id: userId
        } 
      });
    } else {
      Alert.alert('Error', 'User session not found or item invalid');
    }
  };

  // Open search modal
  const handleSearchPress = () => {
    // Fetch search data if not already loaded
    if (searchData.length === 0) {
      fetchSearchData();
    }
    
    setSearchModalVisible(true);
  };

  // Close search modal
  const closeSearchModal = () => {
    setSearchModalVisible(false);
    setSearchQuery('');
  };

  // Render search section header
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  // Render search item
  const renderSearchItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleSearchItemSelect(item)}
    >
      <Ionicons 
        name="search-outline" 
        size={18} 
        color="#666" 
        style={styles.searchItemIcon}
      />
      <Text style={styles.searchItemText}>{item.name}</Text>
      <Text style={styles.searchItemType}>{item.type}</Text>
    </TouchableOpacity>
  );

  // Original functions (keep as is)
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('category.php');
      
      if (response.data.result === 'Success') {
        setCategories(response.data.storeList);
        setShowTrending(true);
        
        console.log('📦 All categories loaded:', response.data.storeList.length);
      } else {
        Alert.alert('Error', 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch main categories (for sidebar)
  const fetchMainCategories = async () => {
    try {
      const response = await api.get('maincategory.php');
      
      if (response.data.result === 'Success') {
        const mainCats = response.data.storeList || [];
        setMainCategories(mainCats);
        setShowTrending(true);
        
        console.log('🏷️ Main categories loaded:', mainCats.length);
        console.log('🎯 Looking for category ID:', selectedCategoryIdFromParams);
        console.log('📋 Available main categories:', mainCats.map(cat => ({ id: cat.id, title: cat.title })));
        
        // If we have a selected category ID from params, find it in main categories
        if (selectedCategoryIdFromParams) {
          const foundCategory = mainCats.find(cat => cat.id.toString() === selectedCategoryIdFromParams);
          console.log('🔍 Found category in main categories:', foundCategory);
          
          if (foundCategory) {
            // Fetch the specific category
            await fetchCategoryById(selectedCategoryIdFromParams);
          } else {
            console.log('❌ Category not found in main categories, showing all');
            setSelectedCategoryId(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching main categories:', error);
      Alert.alert('Error', 'Failed to load main categories');
    }
  };

  const fetchCategoryById = async (catId) => {
    if (!catId) {
      console.log('🔄 No category ID provided, fetching all categories');
      await fetchCategories();
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching category by ID:', catId);
      
      const response = await api.get(`cat.php?cat_id=${catId}`);

      console.log('📡 Category API response:', response.data);

      if (response.data.result === 'Success') {
        setCategories(response.data.storeList || []);
        setShowTrending(true);
        setSelectedCategoryId(catId.toString());
        console.log('✅ Category loaded successfully:', response.data.storeList?.length || 0, 'items');
      } else if (response.data.text === 'List Empty!') {
        setCategories([]);
        setShowTrending(true);
        setSelectedCategoryId(catId.toString());
        console.log('ℹ️ Category is empty');
        Alert.alert('Info', 'No materials found in this category');
      } else {
        console.log('❌ Category API returned error:', response.data.text);
        Alert.alert('Error', 'Failed to load category data');
        // Fallback to all categories
        await fetchCategories();
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      Alert.alert('Error', 'Failed to connect to server');
      // Fallback to all categories
      await fetchCategories();
      setSelectedCategoryId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchMainCategories();
    };
    loadData();
  }, []);

  // Handle when selected category changes
  useEffect(() => {
    console.log('🔄 Selected category changed:', selectedCategoryId);
  }, [selectedCategoryId]);

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

    console.log('🎯 Navigating to Shop with category:', item.id);
    router.push({ 
      pathname: '/components/Shop', 
      params: { 
        cat_id: item.id, 
        customer_id: userId 
      } 
    });
  };

  // Handle sidebar category click
  const handleSidebarCategoryPress = async (categoryId) => {
    console.log('🏷️ Sidebar category pressed:', categoryId);
    await fetchCategoryById(categoryId);
  };

  // Handle "All" categories click
  const handleAllCategoriesPress = async () => {
    console.log('🔄 All categories pressed');
    setSelectedCategoryId(null);
    await fetchCategories();
  };

  // Find the selected category name for display
  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return 'Materials';
    
    const category = mainCategories.find(cat => cat.id.toString() === selectedCategoryId);
    return category?.title || 'Materials';
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
          <Text style={styles.headerText}>{getSelectedCategoryName()}</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="construct" size={24} color="white" />
          </View>
        </View>
      </LinearGradient>

      {/* Search Input - Now opens search modal */}
      <TouchableOpacity onPress={handleSearchPress}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
          <TextInput
            placeholder="Search materials..."
            style={styles.searchInput}
            placeholderTextColor="#A0522D"
            editable={false}
            onPressIn={handleSearchPress}
          />
        </View>
      </TouchableOpacity>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Left Sidebar - Categories */}
        <View style={styles.sidebar}>
          <TouchableOpacity 
            style={[
              styles.allCategoriesBtn,
              selectedCategoryId === null && styles.selectedCategory
            ]} 
            onPress={handleAllCategoriesPress}
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
            {mainCategories.map((item, index) => {
              const isSelected = selectedCategoryId === item.id.toString();
              console.log(`🔍 Category ${item.id} (${item.title}) - Selected: ${isSelected}`);
              
              return (
                <TouchableOpacity
                  key={item.id || index}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.selectedCategory
                  ]}
                  onPress={() => handleSidebarCategoryPress(item.id)}
                >
                  <View style={styles.categoryImageWrapper}>
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.categoryImage} 
                      resizeMode="cover"
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                  </View>
                  <Text 
                    style={[
                      styles.categoryLabel,
                      isSelected && styles.selectedCategoryText
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Content - Materials Grid */}
        <View style={styles.contentArea}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategoryId 
                ? `${getSelectedCategoryName()} Materials`
                : 'All Materials'
              }
            </Text>
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
              {categories.length > 0 ? (
                categories.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || index}
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
                ))
              ) : (
                <View style={styles.noMaterialsContainer}>
                  <Ionicons name="construct-outline" size={48} color="#8B4513" />
                  <Text style={styles.noMaterialsText}>No materials found</Text>
                  <Text style={styles.noMaterialsSubText}>Try selecting a different category</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={closeSearchModal}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.searchModalSafeArea}>
          <View style={styles.searchModalContainer}>
            {/* Header stays fixed at top */}
            <View style={styles.searchModalHeader}>
              <TouchableOpacity 
                onPress={closeSearchModal} 
                style={styles.searchBackButton}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchModalIcon} />
                <TextInput
                  style={styles.searchModalInput}
                  placeholder="Search materials..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  autoFocus={true}
                  returnKeyType="search"
                  blurOnSubmit={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Scrollable content area */}
            {loadingSearch ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="large" color="#8B4513" />
                <Text style={styles.searchLoadingText}>Loading search data...</Text>
              </View>
            ) : (
              <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
              >
                <ScrollView
                  style={styles.searchScrollView}
                  contentContainerStyle={styles.searchScrollContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {sectionedSearchData.length > 0 ? (
                    <SectionList
                      sections={sectionedSearchData}
                      keyExtractor={(item, index) => `search-${item.id}-${index}-${item.type}`}
                      renderItem={renderSearchItem}
                      renderSectionHeader={renderSectionHeader}
                      stickySectionHeadersEnabled={true}
                      contentContainerStyle={styles.sectionListContent}
                      style={styles.sectionList}
                      keyboardShouldPersistTaps="handled"
                      ListEmptyComponent={
                        <View style={styles.searchEmptyContainer}>
                          <Ionicons name="search-outline" size={64} color="#ccc" />
                          <Text style={styles.searchEmptyText}>No results found</Text>
                        </View>
                      }
                    />
                  ) : (
                    <View style={styles.searchEmptyContainer}>
                      <Ionicons name="search-outline" size={64} color="#ccc" />
                      <Text style={styles.searchEmptyText}>No categories available</Text>
                    </View>
                  )}
                </ScrollView>
              </KeyboardAvoidingView>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
    minHeight: 200,
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

  // No Materials State
  noMaterialsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  noMaterialsText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  noMaterialsSubText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },

  // Search Modal Styles
  searchModalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchBackButton: {
    padding: 8,
    marginRight: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 44,
  },
  searchModalIcon: {
    marginRight: 10,
  },
  searchModalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  searchLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  searchLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  searchScrollView: {
    flex: 1,
  },
  searchScrollContent: {
    flexGrow: 1,
  },
  sectionListContent: {
    paddingBottom: 100,
  },
  sectionList: {
    flex: 1,
  },
  sectionHeaderContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchItemIcon: {
    marginRight: 12,
  },
  searchItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchItemType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    minHeight: height * 0.5,
  },
  searchEmptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});