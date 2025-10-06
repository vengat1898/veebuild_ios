import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SessionContext } from '../../context/SessionContext';
import api from "../services/api";

export default function Support() {
  const router = useRouter();
  const { getUserId } = useContext(SessionContext);

  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch Support Data (skip message)
  const fetchSupport = async () => {
    setIsLoading(true);
    try {
      const id = await getUserId();
      console.log("📌 getUserId() returned:", id);

      if (id) {
        setUserId(id);
        const url = `profile_fetch.php?id=${id}`;
        console.log("🌐 Fetching support with URL:", url);

        const response = await api.get(url);
        console.log("✅ Support Fetch Response:", response.data);

        if (response.data.success === 1) {
          const support = response.data;
          setName(support.name || '');
          setMobile(support.mobile || '');   // ✅ mobile editable
          setEmail(support.email || '');
          setLocation(support.location || '');
          // ❌ not setting message (user must type new message)
        } else {
          Alert.alert('Error', 'Failed to load support details.');
        }
      } else {
        Alert.alert('Error', 'User ID not found.');
      }
    } catch (error) {
      console.error('❌ Fetch support error:', error);
      Alert.alert('Error', 'Could not fetch support data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupport();
  }, [getUserId]);

  // ✅ Submit Support Request
  const handleSubmit = async () => {
    if (!name || !mobile || !email || !message) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    console.log("📤 Submitting Support Params:", {
      name,
      mobile,
      email,
      message,
      type: "customer",
      cus_id: userId
    });

    setIsLoading(true);
    try {
      const url = `support.php?name=${encodeURIComponent(
        name
      )}&mobile=${encodeURIComponent(mobile)}&email=${encodeURIComponent(
        email
      )}&message=${encodeURIComponent(message)}&type=${encodeURIComponent(
        "customer"
      )}&cus_id=${userId}`;

      console.log("🌐 Submit Support URL:", url);

      const response = await api.get(url);
      console.log("✅ Support Submit Response:", response.data);

      if (response.data.success === 1) {
        Alert.alert('Success', 'Support request submitted successfully!');
        setMessage(""); // clear message after submit
      } else {
        Alert.alert('Failed', response.data.message || 'Please try again.');
      }
    } catch (error) {
      console.error('❌ Support submit error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
        <Text style={styles.headerTitle}>Support</Text>
      </LinearGradient>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {isLoading && <ActivityIndicator size="large" color="#8B4513" style={{ marginVertical: 20 }} />}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput 
            placeholder="Enter your name" 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            editable={false} 
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            placeholder="Enter your mobile number"
            style={styles.input}
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            placeholder="Type your message here..."
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.submitButtonWrapper}>
          <LinearGradient
            colors={['#8B4513', '#A0522D', '#D2691E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
    marginTop: 40,
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  body: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#f8f4f0',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#5D4037',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageInput: {
    minHeight: 120,
    paddingTop: 16,
  },
  submitButtonWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});