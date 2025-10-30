import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react'; // Added useState import
import { Alert, BackHandler } from 'react-native';
import { SessionProvider } from '../context/SessionContext';
import SplashScreen from './components/SplashScreen'; // Fixed import path

export default function RootLayout() {
  const [isSplashComplete, setSplashComplete] = useState(false);
  
  if (!isSplashComplete) {
    return <SplashScreen onFinish={() => setSplashComplete(true)} />;
  }
  
  return (
    <SessionProvider>
      <BackHandlerWrapper>
        <Stack screenOptions={{ headerShown: false }}>
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
      // Routes where we want to show exit confirmation
      const exitRoutes = [
        '/components/Home',
        '/Login',
        '/components/Otp',
        '/components/Register',
        
      ];
      
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
        // If not on an exit route, navigate to home
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

