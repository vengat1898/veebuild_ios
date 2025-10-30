import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import logoimg from '../../assets/images/veebuilder.png';

export default function Contactus() {
  const router = useRouter();

  const handleCall = () => Linking.openURL('tel:+919940098743');
  const handleWhatsApp = () => Linking.openURL('https://wa.me/919940098743');
  const handleEmail = () => Linking.openURL('mailto:veebuild2024@gmail.com');

  return (
    <View style={{ flex: 1, backgroundColor: '#fefaf7' }}>
      {/* Header */}
      <LinearGradient
        colors={['#d7ccc8', '#a1887f', '#8d6e63']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>We're here to help</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <Image source={logoimg} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.heroTitle}>Vee Build</Text>
          <Text style={styles.heroSubtitle}>Construction Excellence</Text>
        </View>

        {/* Contact Cards */}
        <View style={styles.cardsContainer}>
          {/* Location Card */}
          <View style={[styles.contactCard, styles.locationCard]}>
            <View style={styles.cardIcon}>
              <Ionicons name="location" size={24} color="#a1887f" />
            </View>
            <Text style={styles.cardTitle}>Our Location</Text>
            <Text style={styles.cardText}>
              East 3rd Cross Street{'\n'}
              Amarvathi Nagar{'\n'}
              Chennai, Tamil Nadu 600106
            </Text>
          </View>

          {/* Contact Info Card */}
          <View style={[styles.contactCard, styles.contactInfoCard]}>
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={18} color="#a1887f" />
              </View>
              <Text style={styles.contactText}>+91 99400 98743</Text>
            </View>
            
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <MaterialIcons name="email" size={18} color="#a1887f" />
              </View>
              <Text style={styles.contactText}>veebuild2024@gmail.com</Text>
            </View>
            
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <FontAwesome name="globe" size={18} color="#a1887f" />
              </View>
              <TouchableOpacity onPress={() => Linking.openURL('https://veebuild.com')}>
                <Text style={styles.linkText}>Visit Our Website</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Connect</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, styles.callCard]} onPress={handleCall}>
            <View style={styles.actionIcon}>
              <Ionicons name="call" size={26} color="white" />
            </View>
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.whatsappCard]} onPress={handleWhatsApp}>
            <View style={styles.actionIcon}>
              <FontAwesome name="whatsapp" size={26} color="white" />
            </View>
            <Text style={styles.actionText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.emailCard]} onPress={handleEmail}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="email" size={26} color="white" />
            </View>
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#a1887f',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  backButton: {
    marginRight: 12,
    padding: 5,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  content: {
    padding: 18,
    paddingTop: 25,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoWrapper: {
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#a1887f',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 12,
  },
  logo: {
    width: 65,
    height: 65,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#5d4037',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#a1887f',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 25,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#a1887f',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  locationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#a1887f',
  },
  contactInfoCard: {
    borderRightWidth: 4,
    borderRightColor: '#8d6e63',
  },
  cardIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5d4037',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 13,
    color: '#795548',
    lineHeight: 20,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 3,
  },
  contactIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 10,
  },
  contactText: {
    fontSize: 13,
    color: '#795548',
    fontWeight: '400',
    flex: 1,
  },
  linkText: {
    fontSize: 13,
    color: '#a1887f',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5d4037',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  callCard: {
    backgroundColor: '#a1887f',
  },
  whatsappCard: {
    backgroundColor: '#25D366',
  },
  emailCard: {
    backgroundColor: '#8d6e63',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: '#f5f1ef',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#a1887f',
  },
  noteText: {
    fontSize: 12,
    color: '#795548',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});