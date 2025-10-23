import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#FFE5B5" 
  },
  contentBackground: { 
    flex: 1, 
    backgroundColor: "#F8F1E5" 
  },
  scrollContent: { 
    paddingBottom: 20 
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  city: { 
    color: "#FF8800", 
    fontWeight: "600", 
    fontSize: 14 
  },
  location: { 
    color: "#000", 
    fontSize: 15, 
    marginTop: 2 
  },
  profileIcon: { 
    backgroundColor: "#FFA500", 
    borderRadius: 20, 
    padding: 5 
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 15,
    paddingHorizontal: 17,
    paddingVertical: 9,
    elevation: 3,
    borderColor: "#b86822ff",
    borderWidth: 0.5
  },
  searchIcon: { 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 14, 
    color: "#000" 
  },
  cardContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 16 
  },
  card: { 
    flex: 1, 
    marginHorizontal: 5, 
    borderRadius: 15, 
    overflow: "hidden", 
    height: 200, 
    borderWidth: 1, 
    borderColor: "#613004ff" 
  },
  cardBg: { 
    width: "100%", 
    height: "100%", 
    position: "absolute" 
  },
  cardOverlay: { 
    flex: 1, 
    justifyContent: "flex-end", 
    padding: 15 
  },
  cardNumber: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#613004ff" 
  },
  hotEnquiry: { 
    marginHorizontal: 16, 
    marginTop: 10, 
    borderRadius: 12, 
    overflow: "hidden" 
  },
  hotEnquiryImg: { 
    width: "100%", 
    height: 120, 
    borderRadius: 12 
  },
  hotEnquiryText: {
    position: "absolute",
    bottom: 10,
    left: 15,
    backgroundColor: "#FF8800",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: "600",
  },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    marginTop: 20 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#000" 
  },
  moreText: { 
    fontSize: 14, 
    color: "purple", 
    fontWeight: "600" 
  },
  
  // Materials Grid
  materialsContainer: { 
    paddingHorizontal: 16, 
    marginTop: 10 
  },
  materialsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 15 
  },
  materialItem: { 
    width: (width - 48) / 4, 
    alignItems: "center" 
  },
  materialImageContainer: {
    width: 60, 
    height: 60, 
    borderRadius: 10, 
    backgroundColor: "#fff",
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 8,
    overflow: 'hidden',
  },
  materialGridImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  placeholderText: {
    fontSize: 8,
    color: '#999',
    marginTop: 4,
  },
  materialName: { 
    fontSize: 11, 
    fontWeight: "600", 
    color: "#000", 
    textAlign: "center" 
  },
  moreButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#5f3106ff", 
    paddingVertical: 12, 
    borderRadius: 8, 
    marginTop: 10,
  },
  moreButtonText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "white", 
    marginRight: 4 
  },
  
  loadingContainer: { 
    padding: 20, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 12, 
    color: "#666" 
  },
  errorContainer: { 
    padding: 20, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  errorText: { 
    fontSize: 14, 
    color: "#ff0000", 
    textAlign: "center", 
    marginBottom: 10 
  },
  retryButton: { 
    backgroundColor: "#FF8800", 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 6 
  },
  retryText: { 
    color: "#fff", 
    fontWeight: "600" 
  },
  
  // Trending Products
  materialScroll: { 
    paddingHorizontal: 12, 
    paddingVertical: 10 
  },
  materialCard: { 
    width: 110, 
    height: 150, 
    backgroundColor: "#fff", 
    borderRadius: 15, 
    marginRight: 12, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  materialImageWrapper: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    overflow: "hidden", 
    backgroundColor: "#fff", 
    marginBottom: 10, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  materialImage: { 
    width: '100%', 
    height: '100%' 
  },
  materialText: { 
    fontSize: 10, 
    fontWeight: "600", 
    color: "#000" 
  },
  
  // Most Enquired Products - REDUCED SIZES
  mostEnquiredContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  enquiredScrollBackground: { 
    width: "100%", 
    paddingVertical: 12, // Reduced vertical padding
  },
  enquiredScroll: { 
    paddingLeft: 6, // Reduced padding
    paddingRight: 2,
    paddingVertical: 8,
  },
  enquiredCard: { 
    width: 100, // Reduced from 130
    height: 140, // Reduced from 170
    backgroundColor: "rgba(248, 229, 192, 0.95)",
    marginRight: 10, // Reduced margin
    marginLeft: 2,
    alignItems: "center", 
    borderTopLeftRadius: 50, // Reduced border radius
    borderTopRightRadius: 50, 
    borderWidth: 1, 
    borderColor: "rgba(181, 95, 7, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  enquiredImageWrapper: { 
    width: 65, // Reduced from 85
    height: 65, 
    borderRadius: 6, 
    marginTop: 18, // Reduced margin
    backgroundColor: "#fff", 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(181, 95, 7, 0.1)",
  },
  enquiredImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover", 
    borderRadius: 6, // Reduced border radius
  },
  enquiredTextWrapper: { 
    backgroundColor: "#fff", 
    paddingHorizontal: 8, // Reduced padding
    paddingVertical: 4, 
    borderRadius: 4, 
    marginTop: 20, // Reduced margin
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Reduced shadow opacity
    shadowRadius: 1,
    elevation: 1,
  },
  enquiredText: { 
    fontSize: 8, // Reduced from 9
    fontWeight: "600", 
    color: "#9a5f07ff", 
    textAlign: "center" 
  },
  
  // Most Searched Products
  mostSearchedContainer: {
    marginHorizontal: 16,
  },
  
  // Hire Categories
  categoryList: { 
    marginTop: 10, 
    paddingHorizontal: 16 
  },
  categoryCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12 
  },
  categoryIcon: { 
    width: 40, 
    height: 40, 
    marginRight: 12 
  },
  categorySub: { 
    fontSize: 13, 
    color: "#444" 
  },
  categoryTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#000" 
  },
  detailBtn: { 
    backgroundColor: "#d17d00", 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 6 
  },
  detailText: { 
    fontSize: 12, 
    color: "#fff", 
    fontWeight: "600" 
  },
  
  // Brands Section
  brandsScroll: { 
    alignItems: "center", 
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  brandCard: { 
    marginRight: 20, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  brandImage: { 
    width: 110, 
    height: 110, 
    borderWidth: 2, 
    borderColor: "#f3e1ccff", 
    borderRadius: 10, 
    backgroundColor: "#fff" 
  },

  // Footer
  footer: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: 70,
  borderTopWidth: 1,
  borderTopColor: "#ddd",
  backgroundColor: "#fff",
  elevation: 5,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: -2 },
  shadowRadius: 4,
  paddingHorizontal: 20,
},
footerTab: {
  alignItems: "center",
  justifyContent: "center",
  width: 60,
},
footerText: {
  fontSize: 10,
  marginTop: 2,
  color: "#888",
  fontWeight: "600",
},
centerEnquiryButton: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: -25,
},
centerEnquiryCircle: {
  width: 45,
  height: 45,
  borderRadius: 30,
  backgroundColor: "#FF8800",
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},
centerEnquiryText: {
  fontSize: 10,
  marginTop: 5,
  color: "#FF8800",
  fontWeight: "600",
},
});

export default styles;