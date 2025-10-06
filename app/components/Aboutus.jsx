import { Ionicons } from '@expo/vector-icons';
import cheerio from 'cheerio-without-node-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from "../services/api";

export default function Aboutus() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      const response = await api.get('about_us.php');
      const $ = cheerio.load(response.data);

      const extractedTitle = $('#b-font').text().trim();
      const paragraphs = [];
      $('#services p').each((_, el) => {
        paragraphs.push($(el).text().trim());
      });

      setTitle(extractedTitle);
      setContent(paragraphs.join('\n\n'));
    } catch (error) {
      console.error('Error fetching About Us:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f4f0' }}>
      {/* Header */}
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#D2691E']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>Loading About Us...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.titleUnderline} />
            </View>
            <Text style={styles.paragraph}>{content}</Text>
            
            {/* Additional decorative elements */}
            <View style={styles.decorativeSection}>
              <View style={styles.decorativeItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="heart" size={20} color="#8B4513" />
                </View>
                <Text style={styles.decorativeText}>Quality Service</Text>
              </View>
              
              <View style={styles.decorativeItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="star" size={20} color="#8B4513" />
                </View>
                <Text style={styles.decorativeText}>Expert Team</Text>
              </View>
              
              <View style={styles.decorativeItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="shield-checkmark" size={20} color="#8B4513" />
                </View>
                <Text style={styles.decorativeText}>Trusted</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    height: 120
  },
  backButton: {
    marginRight: 15,
    marginTop: 20,
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#5D4037',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#D2691E',
    borderRadius: 2,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    color: '#5D4037',
    textAlign: 'justify',
    marginBottom: 25,
  },
  decorativeSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
  },
  decorativeItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E8D5C4',
  },
  decorativeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B4513',
    textAlign: 'center',
  },
});