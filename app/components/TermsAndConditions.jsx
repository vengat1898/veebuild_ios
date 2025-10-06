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
      const response = await api.get('terms_and_conditions.php');
      const $ = cheerio.load(response.data);

      const extractedTitle = $('#b-font').text().trim();
      const paragraphs = [];
      $('#services p').each((_, el) => {
        paragraphs.push($(el).text().trim());
      });

      setTitle(extractedTitle);
      setContent(paragraphs.join('\n\n'));
    } catch (error) {
      console.error('Error fetching Terms and Conditions:', error);
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>Loading Terms & Conditions...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.titleContainer}>
              <Ionicons name="document-text" size={28} color="#8B4513" style={styles.titleIcon} />
              <Text style={styles.title}>{title}</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <Text style={styles.paragraph}>{content}</Text>
            </View>

            {/* Important Notice Section */}
            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <Ionicons name="warning" size={20} color="#8B4513" />
                <Text style={styles.noticeTitle}>Important Notice</Text>
              </View>
              <Text style={styles.noticeText}>
                Please read these terms and conditions carefully before using our services. 
                By accessing or using our platform, you agree to be bound by these terms.
              </Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#F5E6D3',
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5D4037',
    flex: 1,
    letterSpacing: 0.3,
  },
  contentContainer: {
    marginBottom: 25,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 26,
    color: '#5D4037',
    textAlign: 'justify',
  },
  noticeBox: {
    backgroundColor: '#FDF6F0',
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#D2691E',
    marginTop: 10,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B4513',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5D4037',
    textAlign: 'justify',
  },
});