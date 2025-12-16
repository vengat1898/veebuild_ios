// import { MaterialIcons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useContext } from "react";
// import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
// import { SessionContext } from "../../context/SessionContext";
// const { width, height } = Dimensions.get("window");

// const MenuDrawer = ({ 
//   drawerOpen, 
//   setDrawerOpen, 
//   handleShareApp, 
//   handleLogout,
//   session 
// }) => {
//   const router = useRouter();
//   const {  isSessionLoaded, clearSession } = useContext(SessionContext);

//   const handleNavigation = (route) => {
//     setDrawerOpen(false);
//     setTimeout(() => {
//       if (route) {
//         router.push(route);
//       }
//     }, 100);
//   };

//    // In MenuDrawer.jsx
// const handleSignIn = async () => {
//   console.log("Sign in clicked");
  
//   // Clear any guest session before navigating to login
//   if (session?.isGuest || session?.type === 'guest') {
//     await clearSession(); // Make sure clearSession is available in props
//   }
  
//   setDrawerOpen(false);
  
//   // Use a small timeout to ensure navigation happens after state updates
//   setTimeout(() => {
//     router.replace('/Login');
//   }, 100);
// };

//   // Base menu items that are always shown
//   const baseMenuItems = [
//     {
//       icon: "home",
//       label: "Home",
//       route: "/components/Home",
//     },
//     {
//       icon: "info",
//       label: "About Us",
//       route: "/components/Aboutus",
//     },
//     {
//       icon: "contact-mail",
//       label: "Contact Us",
//       route: "/components/Contactus",
//     },
//     {
//       icon: "share",
//       label: "Share App",
//       action: handleShareApp,
//     },
//     {
//       icon: "help",
//       label: "Support",
//       route: "/components/Support",
//     },
//     {
//       icon: "gavel",
//       label: "Terms and Conditions",
//       route: "/components/TermsAndConditions",
//     },
//     {
//       icon: "settings",
//       label: "Settings",
//       route: "/components/Settings",
//     },
//   ];

//   // In MenuDrawer.jsx - update the getConditionalMenuItems function
// const getConditionalMenuItems = () => {
//   // Properly check if user is logged in (not guest)
//   const isLoggedIn = session && 
//                     session.id && 
//                     session.id !== 'guest_user' && 
//                     session.mobile && 
//                     session.mobile !== '';

//   const conditionalItems = [];

//   // Add "My Enquiry" only if properly logged in
//   if (isLoggedIn) {
//     conditionalItems.push({
//       icon: "assignment",
//       label: "My Enquiry",
//       route: "/components/Myenquiry",
//     });
//   }

//   // Add either Logout or Sign In
//   if (isLoggedIn) {
//     conditionalItems.push({
//       icon: "exit-to-app",
//       label: "Logout",
//       action: handleLogout,
//     });
//   } else {
//     conditionalItems.push({
//       icon: "login",
//       label: "Sign In",
//       action: handleSignIn,
//     });
//   }

//   return conditionalItems;
// };

//   // Combine base items with conditional items
//   const menuItems = [...baseMenuItems, ...getConditionalMenuItems()];

//   if (!drawerOpen) return null;

//   return (
//     <>
//       {/* Overlay */}
//       <TouchableOpacity
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.6)',
//           zIndex: 999,
//         }}
//         activeOpacity={1}
//         onPress={() => setDrawerOpen(false)}
//       />
      
//       {/* Drawer Content - Now on Left Side */}
//       <View style={drawerStyles.container}>
//         {/* Header - Reduced Size */}
//         <View style={drawerStyles.header}>
//           <View style={drawerStyles.logoContainer}>
//             <Image 
//               source={require("../../assets/images/veebuilder.png")} 
//               style={drawerStyles.logo}
//             />
//           </View>
//           {session?.name && session?.mobile ? (
//             <View style={drawerStyles.userInfo}>
//               <Text style={drawerStyles.userGreeting}>Welcome</Text>
//               <Text style={drawerStyles.userName}>{session.name}</Text>
//               <Text style={drawerStyles.userEmail}>{session.mobile}</Text>
//             </View>
//           ) : (
//             <View style={drawerStyles.userInfo}>
//               <Text style={drawerStyles.userGreeting}>Welcome</Text>
//               <Text style={drawerStyles.userName}>Guest User</Text>
//               <Text style={drawerStyles.signInPrompt}>Sign in to access all features</Text>
//             </View>
//           )}
//         </View>
        
//         {/* Scrollable Menu Items */}
//         <ScrollView 
//           style={drawerStyles.scrollContainer}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={drawerStyles.scrollContent}
//         >
//           <View style={drawerStyles.menuList}>
//             {menuItems.map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   drawerStyles.menuItem,
//                   (item.label === "Logout" || item.label === "Sign In") && drawerStyles.authItem
//                 ]}
//                 onPress={() => {
//                   if (item.action) {
//                     item.action();
//                   } else {
//                     handleNavigation(item.route);
//                   }
//                 }}
//               >
//                 <View style={drawerStyles.menuItemLeft}>
//                   <View style={[
//                     drawerStyles.iconContainer,
//                     (item.label === "Logout" || item.label === "Sign In") && drawerStyles.authIconContainer
//                   ]}>
//                     <MaterialIcons 
//                       name={item.icon} 
//                       size={20} 
//                       color={(item.label === "Logout" || item.label === "Sign In") ? "#1976D2" : "#8B4513"} 
//                     />
//                   </View>
//                   <Text style={[
//                     drawerStyles.menuText,
//                     (item.label === "Logout" || item.label === "Sign In") && drawerStyles.authText
//                   ]}>
//                     {item.label}
//                   </Text>
//                 </View>
//                 <MaterialIcons 
//                   name="chevron-right" 
//                   size={18} 
//                   color={(item.label === "Logout" || item.label === "Sign In") ? "#1976D2" : "#A0522D"} 
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>
//         </ScrollView>

//         {/* Footer */}
//         <View style={drawerStyles.footer}>
//           <Text style={drawerStyles.versionText}>Version 1.0.0</Text>
//           <Text style={drawerStyles.copyrightText}>© 2024 Vee Build</Text>
//         </View>
//       </View>
//     </>
//   );
// };

// const drawerStyles = {
//   container: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: width * 0.75,
//     height: height,
//     backgroundColor: '#FFF8F0',
//     zIndex: 1000,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 4,
//       height: 0,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 10,
//   },
//   header: {
//     backgroundColor: '#8B4513',
//     paddingVertical: 25,
//     paddingHorizontal: 20,
//     borderBottomRightRadius: 20,
//     marginBottom: 5,
//     paddingTop: 50,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   logo: {
//     width: 160,
//     height: 50,
//     resizeMode: 'contain',
//     tintColor: '#FFFFFF',
//   },
//   userInfo: {
//     alignItems: 'center',
//   },
//   userGreeting: {
//     fontSize: 13,
//     color: '#F5DEB3',
//     fontWeight: '400',
//     marginBottom: 3,
//   },
//   userName: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     fontWeight: '600',
//     marginBottom: 2,
//     textAlign: 'center',
//   },
//   userEmail: {
//     fontSize: 11,
//     color: '#F5DEB3',
//     fontWeight: '400',
//   },
//   signInPrompt: {
//     fontSize: 11,
//     color: '#F5DEB3',
//     fontWeight: '400',
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingBottom: 15,
//   },
//   menuList: {
//     paddingVertical: 10,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     marginHorizontal: 12,
//     marginVertical: 2,
//     borderRadius: 12,
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   authItem: {
//     backgroundColor: '#E3F2FD',
//     borderLeftWidth: 3,
//     borderLeftColor: '#1976D2',
//     marginTop: 8,
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   iconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 8,
//     backgroundColor: '#F5E6D3',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   authIconContainer: {
//     backgroundColor: '#BBDEFB',
//   },
//   menuText: {
//     flex: 1,
//     fontSize: 15,
//     color: '#5D4037',
//     fontWeight: '500',
//   },
//   authText: {
//     color: '#1976D2',
//     fontWeight: '600',
//   },
//   footer: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#E8D5C4',
//     backgroundColor: '#FFF8F0',
//   },
//   versionText: {
//     fontSize: 11,
//     color: '#A1887F',
//     fontWeight: '400',
//     textAlign: 'center',
//     marginBottom: 3,
//   },
//   copyrightText: {
//     fontSize: 9,
//     color: '#A1887F',
//     fontWeight: '400',
//     textAlign: 'center',
//   },
// };

// export default MenuDrawer;


import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SessionContext } from "../../context/SessionContext";
const { width } = Dimensions.get("window");

const MenuDrawer = ({ 
  drawerOpen, 
  setDrawerOpen, 
  handleShareApp, 
  handleLogout,
  session 
}) => {
  const router = useRouter();
  const {  isSessionLoaded, clearSession } = useContext(SessionContext);
  const insets = useSafeAreaInsets();

  const handleNavigation = (route) => {
    setDrawerOpen(false);
    setTimeout(() => {
      if (route) {
        router.push(route);
      }
    }, 100);
  };

  const handleSignIn = async () => {
    console.log("Sign in clicked");
    
    if (session?.isGuest || session?.type === 'guest') {
      await clearSession();
    }
    
    setDrawerOpen(false);
    
    setTimeout(() => {
      router.replace('/Login');
    }, 100);
  };

  const baseMenuItems = [
    {
      icon: "home",
      label: "Home",
      route: "/components/Home",
    },
    {
      icon: "info",
      label: "About Us",
      route: "/components/Aboutus",
    },
    {
      icon: "contact-mail",
      label: "Contact Us",
      route: "/components/Contactus",
    },
    {
      icon: "share",
      label: "Share App",
      action: handleShareApp,
    },
    {
      icon: "help",
      label: "Support",
      route: "/components/Support",
    },
    {
      icon: "gavel",
      label: "Terms and Conditions",
      route: "/components/TermsAndConditions",
    },
    {
      icon: "settings",
      label: "Settings",
      route: "/components/Settings",
    },
  ];

  const getConditionalMenuItems = () => {
    const isLoggedIn = session && 
                      session.id && 
                      session.id !== 'guest_user' && 
                      session.mobile && 
                      session.mobile !== '';

    const conditionalItems = [];

    if (isLoggedIn) {
      conditionalItems.push({
        icon: "assignment",
        label: "My Enquiry",
        route: "/components/Myenquiry",
      });
    }

    if (isLoggedIn) {
      conditionalItems.push({
        icon: "exit-to-app",
        label: "Logout",
        action: handleLogout,
      });
    } else {
      conditionalItems.push({
        icon: "login",
        label: "Sign In",
        action: handleSignIn,
      });
    }

    return conditionalItems;
  };

  const menuItems = [...baseMenuItems, ...getConditionalMenuItems()];

  if (!drawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={drawerStyles.overlay}
        activeOpacity={1}
        onPress={() => setDrawerOpen(false)}
      />
      
      {/* Drawer Content */}
      <View style={drawerStyles.container}>
        {/* Status Bar Spacer */}
        <View style={{ height: insets.top, backgroundColor: '#8B4513' }} />
        
        {/* Header */}
        <View style={drawerStyles.header}>
          <View style={drawerStyles.logoContainer}>
            <Image 
              source={require("../../assets/images/veebuilder.png")} 
              style={drawerStyles.logo}
            />
          </View>
          {session?.name && session?.mobile ? (
            <View style={drawerStyles.userInfo}>
              <Text style={drawerStyles.userGreeting}>Welcome</Text>
              <Text style={drawerStyles.userName} numberOfLines={1} ellipsizeMode="tail">
                {session.name}
              </Text>
              <Text style={drawerStyles.userEmail}>{session.mobile}</Text>
            </View>
          ) : (
            <View style={drawerStyles.userInfo}>
              <Text style={drawerStyles.userGreeting}>Welcome</Text>
              <Text style={drawerStyles.userName}>Guest User</Text>
              <Text style={drawerStyles.signInPrompt}>
                Sign in to access all features
              </Text>
            </View>
          )}
        </View>
        
        {/* Scrollable Menu Items */}
        <ScrollView 
          style={drawerStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={drawerStyles.scrollContent}
        >
          <View style={drawerStyles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  drawerStyles.menuItem,
                  (item.label === "Logout" || item.label === "Sign In") && drawerStyles.authItem
                ]}
                onPress={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    handleNavigation(item.route);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={drawerStyles.menuItemLeft}>
                  <View style={[
                    drawerStyles.iconContainer,
                    (item.label === "Logout" || item.label === "Sign In") && drawerStyles.authIconContainer
                  ]}>
                    <MaterialIcons 
                      name={item.icon} 
                      size={20} 
                      color={(item.label === "Logout" || item.label === "Sign In") ? "#1976D2" : "#8B4513"} 
                    />
                  </View>
                  <Text 
                    style={[
                      drawerStyles.menuText,
                      (item.label === "Logout" || item.label === "Sign In") && drawerStyles.authText
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.label}
                  </Text>
                </View>
                <MaterialIcons 
                  name="chevron-right" 
                  size={18} 
                  color={(item.label === "Logout" || item.label === "Sign In") ? "#1976D2" : "#A0522D"} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={drawerStyles.footer}>
          <Text style={drawerStyles.versionText}>Version 1.0.0</Text>
          <Text style={drawerStyles.copyrightText}>© 2024 Vee Build</Text>
        </View>
        
        {/* Bottom Navigation Bar Spacer */}
        <View style={{ height: insets.bottom, backgroundColor: '#FFF8F0' }} />
      </View>
    </>
  );
};

const drawerStyles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#FFF8F0',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 4,
          height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    backgroundColor: '#8B4513',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomRightRadius: 20,
    marginBottom: 5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  logo: {
    width: 160,
    height: 50,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  userGreeting: {
    fontSize: 13,
    color: '#F5DEB3',
    fontWeight: '400',
    marginBottom: 3,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  userName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },
  userEmail: {
    fontSize: 11,
    color: '#F5DEB3',
    fontWeight: '400',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  signInPrompt: {
    fontSize: 11,
    color: '#F5DEB3',
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingHorizontal: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 15,
  },
  menuList: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  authItem: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',
    marginTop: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    paddingRight: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authIconContainer: {
    backgroundColor: '#BBDEFB',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#5D4037',
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  authText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8D5C4',
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 11,
    color: '#A1887F',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 3,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  copyrightText: {
    fontSize: 9,
    color: '#A1887F',
    fontWeight: '400',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
};

export default MenuDrawer;