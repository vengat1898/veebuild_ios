// app/_layout.tsx
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { SessionProvider } from '../context/SessionContext';
import SplashScreen from './components/SplashScreen';

export default function RootLayout() {
  const [isSplashComplete, setSplashComplete] = useState(false);
  
  if (!isSplashComplete) {
    return <SplashScreen onFinish={() => setSplashComplete(true)} />;
  }
  
  return (
    <SessionProvider>
      <BackHandlerWrapper>
        <Stack screenOptions={{ 
          headerShown: false,
          // Disable swipe gestures for all screens by default
          gestureEnabled: false 
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Login" />
          <Stack.Screen name="Otp" />
          <Stack.Screen name="Register" />
          <Stack.Screen name="Home" />
        </Stack>
      </BackHandlerWrapper>
    </SessionProvider>
  );
}

function BackHandlerWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const backAction = () => {
      // Routes where back is COMPLETELY disabled
      const noBackRoutes = [
        '/Otp',
        '/components/Home',
        '/Login'
      ];
      
      // Routes where exit confirmation is shown
      const exitRoutes = [
        '/Login',
        '/Register',
        '/components/Home',
      ];
      
      // Check if current route is in noBackRoutes - disable back completely
      if (noBackRoutes.includes(pathname)) {
        // For OTP screen, show a specific message
        if (pathname === '/Otp') {
          Alert.alert(
            "Complete Verification",
            "Please complete the OTP verification process.",
            [{ text: "OK", onPress: () => null }]
          );
        }
        return true; // Prevent default behavior completely
      }
      
      // Check if current route is in exitRoutes
      if (exitRoutes.includes(pathname)) {
        // Show alert to exit app
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit the app?",
          [
            {
              text: "Cancel",
              onPress: () => null,
              style: "cancel"
            },
            {
              text: "Exit",
              onPress: () => BackHandler.exitApp()
            }
          ]
        );
        return true; // Prevent default behavior
      } else {
        // For other routes, navigate to home
        router.replace('/components/Home');
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [pathname, router]);

  return children;
}

