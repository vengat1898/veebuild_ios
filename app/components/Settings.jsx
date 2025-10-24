import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Settings = () => {
  const router = useRouter();
  const [showWebView, setShowWebView] = React.useState(false);
  const [webViewUrl, setWebViewUrl] = React.useState('');

  const handleBack = () => {
    if (showWebView) {
      setShowWebView(false);
      setWebViewUrl('');
    } else {
      router.back();
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const url = 'https://veebuilds.com/mobile/form.php';
            setWebViewUrl(url);
            setShowWebView(true);
          }
        }
      ]
    );
  };

  const handleWebViewLoad = () => {
    console.log('WebView loaded successfully');
  };

  const handleWebViewError = (error) => {
    console.error('WebView error:', error);
    Alert.alert(
      "Error",
      "Failed to load the form. Please check your internet connection and try again.",
      [
        {
          text: "OK",
          onPress: () => {
            setShowWebView(false);
            setWebViewUrl('');
          }
        }
      ]
    );
  };

  // WebView configuration for larger content
  const webViewConfig = {
    source: { uri: webViewUrl },
    style: styles.webview,
    onLoad: handleWebViewLoad,
    onError: handleWebViewError,
    startInLoadingState: true,
    scalesPageToFit: true,
    javaScriptEnabled: true,
    domStorageEnabled: true,
    mixedContentMode: 'always',
    setSupportMultipleWindows: false,
    // Increase text size and zoom
    textZoom: 150, // Increase text size by 50%
    // Additional configuration for better content display
    injectedJavaScript: `
      (function() {
        // Increase font sizes
        const style = document.createElement('style');
        style.textContent = \`
          body {
            font-size: 18px !important;
            zoom: 1.3;
            -webkit-text-size-adjust: 150%;
          }
          input, select, textarea, button {
            font-size: 18px !important;
            min-height: 44px;
          }
          .container, .form-container, .form-wrapper {
            max-width: 100% !important;
            width: 100% !important;
            padding: 20px !important;
          }
          * {
            max-width: 100% !important;
          }
        \`;
        document.head.appendChild(style);
        
        // Force viewport meta tag for mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes');
        } else {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes';
          document.head.appendChild(meta);
        }
        
        true;
      })();
    `,
    // Allow zooming and scaling
    allowsInlineMediaPlayback: true,
    allowsFullscreenVideo: false,
    // Better rendering
    useWebKit: true,
    cacheEnabled: true,
  };

  if (showWebView) {
    return (
      <SafeAreaView style={styles.webviewContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header for WebView */}
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
            <Text style={styles.backText}>settings</Text>
          </TouchableOpacity>
        
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                setWebViewUrl('');
                setTimeout(() => setWebViewUrl('https://veebuilds.com/mobile/form.php'), 100);
              }}
            >
              <Ionicons name="refresh" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Larger WebView */}
        <View style={styles.webviewWrapper}>
          <WebView {...webViewConfig} />
        </View>

        {/* WebView Controls */}
        <View style={styles.webviewControls}>
          <Text style={styles.helpText}>
            Fill out the form to request account deletion
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Delete Account Section */}
        <View style={styles.section}>
 
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.deleteOption]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.deleteIconContainer}>
              <Ionicons name="trash-outline" size={22} color="#dc2626" />
            </View>
            <View style={styles.deleteTextContainer}>
              <Text style={styles.deleteText}>Delete Account</Text>
              <Text style={styles.deleteSubtext}>
                Permanently remove your account and all data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  deleteOption: {
    borderBottomWidth: 0,
    alignItems: 'flex-start',
  },
  deleteIconContainer: {
    marginTop: 2,
  },
  deleteTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  deleteText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  deleteSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  // WebView Styles
  webviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  webviewHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  webviewWrapper: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.85, // 85% of screen height
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    height: '100%',
    backgroundColor: '#ffffff',
  },
  webviewControls: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Settings;