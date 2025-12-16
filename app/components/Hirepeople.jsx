// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useCallback, useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import api from "../services/api";

// export default function Hirepeople() {
//   const router = useRouter();
//   const [professions, setProfessions] = useState([]);
//   const [filteredProfessions, setFilteredProfessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
  
//   // Tap prevention state
//   const [isProcessingTap, setIsProcessingTap] = useState(false);

//   // Tap debouncing function
//   const withTapPrevention = useCallback((callback) => {
//     return async (...args) => {
//       if (isProcessingTap) {
//         console.log('🛑 Tap prevented - already processing');
//         return;
//       }

//       setIsProcessingTap(true);
      
//       try {
//         await callback(...args);
//       } catch (error) {
//         console.error('Error in tap handler:', error);
//       } finally {
//         // Reset after a short delay to prevent rapid successive taps
//         setTimeout(() => {
//           setIsProcessingTap(false);
//         }, 800);
//       }
//     };
//   }, [isProcessingTap]);

//   // Fetch all professions
//   const fetchProfessions = async () => {
//     const url = 'occupation_list.php';
    
//     console.log('=====================================');
//     console.log('🚀 FETCHING PROFESSIONS');
//     console.log('=====================================');
//     console.log('📍 URL:', url);
//     console.log('⏰ Timestamp:', new Date().toLocaleString());
//     console.log('=====================================');
    
//     try {
//       const response = await api.get(url);
      
//       console.log('=====================================');
//       console.log('✅ PROFESSIONS API SUCCESS');
//       console.log('=====================================');
//       console.log('📊 Response Status:', response.status);
//       console.log('📋 Response Headers:', JSON.stringify(response.headers, null, 2));
//       console.log('📄 Full Response Data:', JSON.stringify(response.data, null, 2));
//       console.log('=====================================');
      
//       if (response.data?.storeList) {
//         console.log('=====================================');
//         console.log('🎯 PROFESSIONS DATA PROCESSED');
//         console.log('=====================================');
//         console.log('📊 Total Professions Count:', response.data.storeList.length);
//         console.log('📝 Professions List:', JSON.stringify(response.data.storeList, null, 2));
//         console.log('=====================================');
        
//         setProfessions(response.data.storeList);
//         setFilteredProfessions(response.data.storeList);
//       } else {
//         console.log('=====================================');
//         console.log('⚠️ NO PROFESSIONS DATA FOUND');
//         console.log('=====================================');
//         console.log('📄 Response Structure:', JSON.stringify(response.data, null, 2));
//         console.log('=====================================');
//       }
//     } catch (error) {
//       console.log('=====================================');
//       console.log('❌ PROFESSIONS API ERROR');
//       console.log('=====================================');
//       console.log('🔗 URL:', url);
//       console.log('📄 Error Message:', error.message);
//       console.log('📊 Error Status:', error.response?.status);
//       console.log('📋 Error Response:', JSON.stringify(error.response?.data, null, 2));
//       console.log('🔍 Full Error Object:', JSON.stringify(error, null, 2));
//       console.log('=====================================');
//       console.error('Error fetching professions:', error);
//     } finally {
//       setLoading(false);
//       console.log('=====================================');
//       console.log('🏁 PROFESSIONS FETCH COMPLETED');
//       console.log('⏰ Timestamp:', new Date().toLocaleString());
//       console.log('=====================================');
//     }
//   };

//   useEffect(() => {
//     fetchProfessions();
//   }, []);

//   // Filter profession list
//   const handleSearch = (text) => {
//     console.log('=====================================');
//     console.log('🔍 SEARCH FUNCTIONALITY');
//     console.log('=====================================');
//     console.log('🔤 Search Text:', text);
//     console.log('📊 Total Professions:', professions.length);
    
//     setSearch(text);
//     const filtered = professions.filter((item) =>
//       item.title.toLowerCase().includes(text.toLowerCase())
//     );
    
//     console.log('📋 Filtered Results Count:', filtered.length);
//     console.log('📝 Filtered Results:', JSON.stringify(filtered, null, 2));
//     console.log('=====================================');
    
//     setFilteredProfessions(filtered);
//   };

//   // Fetch professionals based on occupation id
//   const fetchProfessionalsByOccupationId = async (occupationId) => {
//     const url = `professional_list_by_id.php?occupation=${occupationId}`;
    
//     console.log('=====================================');
//     console.log('👥 FETCHING PROFESSIONALS BY OCCUPATION');
//     console.log('=====================================');
//     console.log('🆔 Occupation ID:', occupationId);
//     console.log('📍 URL:', url);
//     console.log('⏰ Timestamp:', new Date().toLocaleString());
//     console.log('=====================================');
    
//     try {
//       const response = await api.get(url);
      
//       console.log('=====================================');
//       console.log('✅ PROFESSIONALS API SUCCESS');
//       console.log('=====================================');
//       console.log('📊 Response Status:', response.status);
//       console.log('📋 Response Headers:', JSON.stringify(response.headers, null, 2));
//       console.log('📄 Full Response Data:', JSON.stringify(response.data, null, 2));
//       console.log('=====================================');
      
//       if (response.data?.storeList) {
//         console.log('=====================================');
//         console.log('🎯 PROFESSIONALS DATA PROCESSED');
//         console.log('=====================================');
//         console.log('📊 Total Professionals Count:', response.data.storeList.length);
//         console.log('📝 Professionals List:', JSON.stringify(response.data.storeList, null, 2));
//         console.log('=====================================');
        
//         return response.data.storeList;
//       } else {
//         console.log('=====================================');
//         console.log('⚠️ NO PROFESSIONALS DATA FOUND');
//         console.log('=====================================');
//         console.log('📄 Response Structure:', JSON.stringify(response.data, null, 2));
//         console.log('=====================================');
        
//         return [];
//       }
//     } catch (error) {
//       console.log('=====================================');
//       console.log('❌ PROFESSIONALS API ERROR');
//       console.log('=====================================');
//       console.log('🆔 Occupation ID:', occupationId);
//       console.log('🔗 URL:', url);
//       console.log('📄 Error Message:', error.message);
//       console.log('📊 Error Status:', error.response?.status);
//       console.log('📋 Error Response:', JSON.stringify(error.response?.data, null, 2));
//       console.log('🔍 Full Error Object:', JSON.stringify(error, null, 2));
//       console.log('=====================================');
//       console.error('Error fetching professionals:', error);
//       return [];
//     }
//   };

//   // Navigate with professionals data - with tap prevention
//   const goToDetails = withTapPrevention(async (profession) => {
//     console.log('=====================================');
//     console.log('🧭 NAVIGATION TO DETAILS');
//     console.log('=====================================');
//     console.log('📋 Selected Profession:', JSON.stringify(profession, null, 2));
//     console.log('🆔 Profession ID:', profession.id);
//     console.log('📝 Profession Title:', profession.title);
//     console.log('=====================================');
    
//     const professionals = await fetchProfessionalsByOccupationId(profession.id);

//     console.log('=====================================');
//     console.log('🚀 PREPARING NAVIGATION PARAMS');
//     console.log('=====================================');
//     console.log('🆔 ID:', profession.id);
//     console.log('📝 Title:', profession.title);
//     console.log('👥 Professionals Data:', JSON.stringify(professionals, null, 2));
//     console.log('📊 Professionals Count:', professionals.length);
//     console.log('=====================================');

//     router.push({
//       pathname: '/components/HirepeopleDeatils',
//       params: {
//         id: profession.id,
//         title: profession.title,
//         professionals: JSON.stringify(professionals),
//       },
//     });

//     console.log('=====================================');
//     console.log('✅ NAVIGATION COMPLETED');
//     console.log('⏰ Timestamp:', new Date().toLocaleString());
//     console.log('=====================================');
//   });

//   // Back button handler with tap prevention
//   const handleBackPress = withTapPrevention(() => {
//     router.back();
//   });

//   // Clear search handler with tap prevention
//   const handleClearSearch = withTapPrevention(() => {
//     handleSearch('');
//   });

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <LinearGradient
//         colors={['#8B4513', '#D2691E', '#A0522D']}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <TouchableOpacity 
//           onPress={handleBackPress} 
//           style={styles.backButton}
//           disabled={isProcessingTap}
//         >
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <View style={styles.headerContent}>
//           <Text style={styles.headerText}>Hire People</Text>
//         </View>
//       </LinearGradient>

//       {/* Search Input */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchIconContainer}>
//           <Ionicons name="search" size={20} color="#8B4513" />
//         </View>
//         <TextInput
//           placeholder="Search profession..."
//           value={search}
//           onChangeText={handleSearch}
//           style={styles.searchInput}
//           placeholderTextColor="#999"
//         />
//         {search.length > 0 && (
//           <TouchableOpacity 
//             onPress={handleClearSearch} 
//             style={styles.clearButton}
//             disabled={isProcessingTap}
//           >
//             <Ionicons name="close-circle" size={20} color="#999" />
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* List or Loader */}
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#8B4513" />
//           <Text style={styles.loadingText}>Loading professions...</Text>
//         </View>
//       ) : (
//         <ScrollView 
//           contentContainerStyle={styles.scrollContainer}
//           showsVerticalScrollIndicator={false}
//         >
//           {filteredProfessions.length === 0 ? (
//             <View style={styles.emptyState}>
//               <Ionicons name="search-outline" size={64} color="#D2691E" />
//               <Text style={styles.emptyStateText}>No professions found</Text>
//               <Text style={styles.emptyStateSubtext}>Try adjusting your search terms</Text>
//             </View>
//           ) : (
//             filteredProfessions.map((item) => (
//               <TouchableOpacity
//                 key={item.id}
//                 style={[
//                   styles.professionItem,
//                   isProcessingTap && styles.disabledItem
//                 ]}
//                 onPress={() => goToDetails(item)}
//                 disabled={isProcessingTap}
//               >
//                 <View style={styles.professionIcon}>
//                   <Ionicons name="briefcase-outline" size={20} color="#8B4513" />
//                 </View>
//                 <View style={styles.professionContent}>
//                   <Text style={styles.professionText}>{item.title}</Text>
//                   <Text style={styles.professionSubtext}>Tap to view professionals</Text>
//                 </View>
//                 <Ionicons 
//                   name="chevron-forward" 
//                   size={20} 
//                   color={isProcessingTap ? "#CCC" : "#8B4513"} 
//                 />
//               </TouchableOpacity>
//             ))
//           )}
//         </ScrollView>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#FAF5F0' 
//   },
//   header: {
//     height: 130,
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: '#8B4513',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   backButton: { 
//     marginRight: 15,
//     padding: 8,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 12,
//   },
//   headerContent: {
//     flex: 1,
//   },
//   headerText: {
//     color: 'white',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   headerSubtext: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 14,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     marginHorizontal: 20,
//     marginTop: 20,
//     paddingHorizontal: 0,
//     borderRadius: 7,
//     height: 46,
//     shadowColor: '#8B4513',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 8,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#F5E6D3',
//   },
//   searchIconContainer: {
//     paddingHorizontal: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 10,
//     color: '#333',
//     height: '80%',
//   },
//   clearButton: {
//     paddingHorizontal: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 16,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#8B4513',
//     fontWeight: '500',
//   },
//   scrollContainer: {
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//   },
//   professionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#8B4513',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: '#F5E6D3',
//   },
//   disabledItem: {
//     opacity: 0.6,
//   },
//   professionIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: '#F5E6D3',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   professionContent: {
//     flex: 1,
//   },
//   professionText: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   professionSubtext: {
//     fontSize: 12,
//     color: '#8B4513',
//     opacity: 0.7,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//   },
//   emptyStateText: {
//     fontSize: 18,
//     color: '#8B4513',
//     fontWeight: '600',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateSubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//   },
// });

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from "../services/api";

export default function Hirepeople() {
  const router = useRouter();
  const [professions, setProfessions] = useState([]);
  const [filteredProfessions, setFilteredProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isProcessingTap, setIsProcessingTap] = useState(false);

  const withTapPrevention = useCallback((callback) => {
    return async (...args) => {
      if (isProcessingTap) return;
      setIsProcessingTap(true);
      
      try {
        await callback(...args);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setTimeout(() => {
          setIsProcessingTap(false);
        }, 500);
      }
    };
  }, [isProcessingTap]);

  const fetchProfessions = async () => {
    try {
      const response = await api.get('occupation_list.php');
      if (response.data?.storeList) {
        setProfessions(response.data.storeList);
        setFilteredProfessions(response.data.storeList);
      }
    } catch (error) {
      console.error('Error fetching professions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessions();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = professions.filter((item) =>
      item.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProfessions(filtered);
  };

  const fetchProfessionalsByOccupationId = async (occupationId) => {
    try {
      const response = await api.get(
        `professional_list_by_id.php?occupation=${occupationId}`
      );
      return response.data?.storeList || [];
    } catch (error) {
      console.error('Error fetching professionals:', error);
      return [];
    }
  };

  const goToDetails = withTapPrevention(async (profession) => {
    const professionals = await fetchProfessionalsByOccupationId(profession.id);
    
    router.push({
      pathname: '/components/HirepeopleDeatils',
      params: {
        id: profession.id,
        title: profession.title,
        professionals: JSON.stringify(professionals),
      },
    });
  });

  const handleBackPress = withTapPrevention(() => {
    router.back();
  });

  const handleClearSearch = withTapPrevention(() => {
    handleSearch('');
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B4513', '#D2691E', '#A0522D']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerInner}>
          <TouchableOpacity 
            onPress={handleBackPress} 
            style={styles.backButton}
            disabled={isProcessingTap}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Hire People</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
      </LinearGradient>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <Ionicons name="search" size={20} color="#8B4513" />
        </View>
        <TextInput
          placeholder="Search profession..."
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity 
            onPress={handleClearSearch} 
            style={styles.clearButton}
            disabled={isProcessingTap}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* List or Loader */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading professions...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredProfessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D2691E" />
              <Text style={styles.emptyStateText}>No professions found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search terms</Text>
            </View>
          ) : (
            filteredProfessions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.professionItem,
                  isProcessingTap && styles.disabledItem
                ]}
                onPress={() => goToDetails(item)}
                disabled={isProcessingTap}
                activeOpacity={0.7}
              >
                <View style={styles.professionIcon}>
                  <Ionicons name="briefcase-outline" size={20} color="#8B4513" />
                </View>
                <View style={styles.professionContent}>
                  <Text style={styles.professionText}>{item.title}</Text>
                  <Text style={styles.professionSubtext}>Tap to view professionals</Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={isProcessingTap ? "#CCC" : "#8B4513"} 
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAF5F0',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 15,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 18,
  },
  backButton: { 
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120, // Extra padding for bottom navigation/safe area
  },
  professionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5E6D3',
    minHeight: 70,
  },
  disabledItem: {
    opacity: 0.6,
  },
  professionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  professionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  professionSubtext: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#8B4513',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});