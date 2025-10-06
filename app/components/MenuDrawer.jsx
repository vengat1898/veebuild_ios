import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

const MenuDrawer = ({ 
  drawerOpen, 
  setDrawerOpen, 
  handleShareApp, 
  handleLogout,
  session 
}) => {
  const router = useRouter();

  const handleNavigation = (route) => {
    setDrawerOpen(false);
    if (route) {
      router.push(route);
    }
  };

  const menuItems = [
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
      icon: "assignment",
      label: "My Enquiry",
      route: "/components/Myenquiry",
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
    // {
    //   icon: "privacy-tip",
    //   label: "Privacy Policy",
    //   // route: "/components/PrivacyPolicy",
    // },
    {
      icon: "exit-to-app",
      label: "Logout",
      action: handleLogout,
    },
  ];

  if (!drawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 999,
        }}
        activeOpacity={1}
        onPress={() => setDrawerOpen(false)}
      />
      
      {/* Drawer Content - Now on Left Side */}
      <View style={drawerStyles.container}>
        {/* Header - Reduced Size */}
        <View style={drawerStyles.header}>
          <View style={drawerStyles.logoContainer}>
            <Image 
              source={require("../../assets/images/veebuilder.png")} 
              style={drawerStyles.logo}
            />
          </View>
          {session?.name && (
            <View style={drawerStyles.userInfo}>
              <Text style={drawerStyles.userGreeting}>Welcome</Text>
              <Text style={drawerStyles.userName}>{session.name}</Text>
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
                  item.label === "Logout" && drawerStyles.logoutItem
                ]}
                onPress={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    handleNavigation(item.route);
                  }
                }}
              >
                <View style={drawerStyles.menuItemLeft}>
                  <View style={[
                    drawerStyles.iconContainer,
                    item.label === "Logout" && drawerStyles.logoutIconContainer
                  ]}>
                    <MaterialIcons 
                      name={item.icon} 
                      size={20} 
                      color={item.label === "Logout" ? "#D32F2F" : "#8B4513"} 
                    />
                  </View>
                  <Text style={[
                    drawerStyles.menuText,
                    item.label === "Logout" && drawerStyles.logoutText
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <MaterialIcons 
                  name="chevron-right" 
                  size={18} 
                  color={item.label === "Logout" ? "#D32F2F" : "#A0522D"} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={drawerStyles.footer}>
          <Text style={drawerStyles.versionText}>Version 1.0.0</Text>
          <Text style={drawerStyles.copyrightText}>© 2024 VeeBuilder</Text>
        </View>
      </View>
    </>
  );
};

const drawerStyles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0, // Changed from right to left
    width: width * 0.75, // Reduced width from 85% to 75%
    height: height,
    backgroundColor: '#FFF8F0',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 4, // Changed from -4 to 4 for left side shadow
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    backgroundColor: '#8B4513',
    paddingVertical: 25, // Reduced from 40
    paddingHorizontal: 20,
    borderBottomRightRadius: 20, // Changed from borderBottomRightRadius
    marginBottom: 5,
    paddingTop: 50, // Reduced from 60
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15, // Reduced from 20
  },
  logo: {
    width: 160, // Reduced from 200
    height: 50, // Reduced from 70
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userGreeting: {
    fontSize: 13, // Reduced from 14
    color: '#F5DEB3',
    fontWeight: '400',
    marginBottom: 3,
  },
  userName: {
    fontSize: 16, // Reduced from 20
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 11, // Reduced from 12
    color: '#F5DEB3',
    fontWeight: '400',
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
    paddingVertical: 15, // Reduced from 18
    paddingHorizontal: 20, // Reduced from 25
    marginHorizontal: 12, // Reduced from 15
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutItem: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 3, // Reduced from 4
    borderLeftColor: '#D32F2F',
    marginTop: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    borderRadius: 8, // Reduced from 10
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Reduced from 15
  },
  logoutIconContainer: {
    backgroundColor: '#FFCDD2',
  },
  menuText: {
    flex: 1,
    fontSize: 15, // Reduced from 16
    color: '#5D4037',
    fontWeight: '500',
  },
  logoutText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  footer: {
    padding: 20, // Reduced from 25
    borderTopWidth: 1,
    borderTopColor: '#E8D5C4',
    backgroundColor: '#FFF8F0',
  },
  versionText: {
    fontSize: 11, // Reduced from 12
    color: '#A1887F',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 3,
  },
  copyrightText: {
    fontSize: 9, // Reduced from 10
    color: '#A1887F',
    fontWeight: '400',
    textAlign: 'center',
  },
};

export default MenuDrawer;