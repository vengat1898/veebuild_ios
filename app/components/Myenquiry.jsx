import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { default as hirepeople } from '../../assets/images/hirepeople1.png';
import material from '../../assets/images/materials.png';
import realestate from '../../assets/images/real.png';
import { SessionContext } from '../../context/SessionContext'; // Adjust path as needed

export default function Myenquiry() {
  const router = useRouter();
  const { session, isSessionLoaded } = useContext(SessionContext);

  const handlePress = (type) => {
    if (session && session.id) {
      router.push({ 
        pathname: '/components/MyenquiryDetails', 
        params: { 
          title: type,
          customer_id: session.id 
        }, 
      });
    } else {
      console.log('No user session found');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F4F0' }}>
      {/* Header */}
      <LinearGradient
        colors={['#8B4513', '#D2691E', '#A0522D']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/components/Home')}>
          <Ionicons name="arrow-back" size={34} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Enquiry</Text>
      </LinearGradient>

      {/* Container with cards */}
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.cardContainer}
          onPress={() => handlePress('meterial enquiry')}
        >
          <LinearGradient
            colors={['#8B4513', '#D2691E']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <Image source={material} style={styles.image} resizeMode="contain" />
              <Text style={styles.cardText}>Material</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cardContainer}
          onPress={() => handlePress('real estate enquiry')}
        >
          <LinearGradient
            colors={['#A0522D', '#CD853F']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <Image source={realestate} style={styles.image} resizeMode="contain" />
              <Text style={styles.cardText}>Real Estate</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cardContainer}
          onPress={() => handlePress('Hire people enquiry')}
        >
          <LinearGradient
            colors={['#A0522D', '#CD853F']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <Image source={hirepeople} style={styles.image} resizeMode="contain" />
              <Text style={styles.cardText}>Hire People</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.footerItem} 
          onPress={() => router.push('/components/Home')}
        >
          {({ pressed }) => (
            <>
              <Ionicons
                name="home"
                size={24}
                color={pressed ? '#8B4513' : '#A9A9A9'}
              />
              <Text style={[styles.footerText, { color: pressed ? '#8B4513' : '#A9A9A9' }]}>
                Home
              </Text>
            </>
          )}
        </Pressable>

        <Pressable 
          style={styles.footerItem} 
          onPress={() => router.push('/components/Myenquiry')}
        >
          {({ pressed }) => (
            <>
              <MaterialIcons
                name="assignment"
                size={24}
                color={pressed ? '#654321' : '#8B4513'}
              />
              <Text style={[styles.footerText, { color: pressed ? '#654321' : '#8B4513' }]}>
                My Enquiry
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    height: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    marginRight: 16,
    marginTop: 40,
    padding: 4,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  cardContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    width: '100%',
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 16,
    tintColor: '#fff',
  },
  cardText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  footerItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});