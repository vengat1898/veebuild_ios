import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { FlatList, Platform, StatusBar as RNStatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext } from "../../context/SessionContext";
import api from "../services/api";

export default function MyenquiryDetails() {
  const { title, customer_id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useContext(SessionContext);

  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [enquiries, setEnquiries] = useState([]);

  const statusMap = {
    Pending: 0,
    Completed: 2,
    Rejected: 1,
  };

  useEffect(() => {
    const fetchEnquiries = async () => {
      const userId = customer_id || (session && session.id);
      if (!userId || selectedStatus === null) return;

      try {
        const statusCode = statusMap[selectedStatus];
        let url = "";

        if (title === "real estate enquiry") {
          url = `real_estate_enquiry_list.php?user_id=${userId}&status=${statusCode}`;
        } else if (title === "Hire people enquiry") {
          url = `hire_enquiry_list.php?user_id=${userId}&status=${statusCode}`;
        } else {
          url = `my_enquery.php?user_id=${userId}&status=${statusCode}`;
        }

        console.log("\n==============================");
        console.log("📡 API Request URL:", url);
        console.log("==============================\n");

        const response = await api.get(url);

        console.log("\n==============================");
        console.log("📩 API Response:", JSON.stringify(response.data, null, 2));
        console.log("==============================\n");

        if (response.data.success === 1 && Array.isArray(response.data.storeList)) {
          setEnquiries(response.data.storeList);
        } else {
          setEnquiries([]);
        }
      } catch (error) {
        console.error("\n❌ Error fetching enquiry data:", error, "\n");
        setEnquiries([]);
      }
    };

    fetchEnquiries();
  }, [selectedStatus, session, customer_id, title]);

  const renderEnquiryItem = ({ item }) => (
    <View style={styles.detailsBox}>
      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{item.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Mobile Number</Text>
        <Text style={styles.value}>{item.mobile}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Enquiry Status</Text>
        <Text style={[
          styles.value, 
          { 
            color: selectedStatus === "Pending" ? "#D4A574" : 
                   selectedStatus === "Completed" ? "#8B7355" : "#A52A2A",
            fontWeight: "bold" 
          }
        ]}>
          {selectedStatus}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{item.created}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Enquiry For</Text>
        <Text style={styles.value}>{item.product_name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Enquiry To</Text>
        <Text style={styles.value}>{item.vendor_name || "N/A"}</Text>
      </View>

      {/* Separate Message Box */}
      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Message</Text>
        <Text style={styles.messageText}>{item.message || "N/A"}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F5F2" }}>
      {/* StatusBar Transparent */}
      <StatusBar style="light" translucent={true} backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient
        colors={["#8B4513", "#D2691E", "#A0522D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{title}</Text>
      </LinearGradient>

      {/* Status Filter */}
      <View style={styles.statusContainer}>
        {["Pending", "Completed", "Rejected"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.statusButton, selectedStatus === status && styles.selectedStatusButton]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === status && styles.selectedStatusButtonText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Enquiry List */}
      {enquiries.length > 0 ? (
        <FlatList
          data={enquiries}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderEnquiryItem}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        />
      ) : (
        selectedStatus && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#8B4513" />
            <Text style={styles.emptyText}>No enquiries found</Text>
          </View>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "android" ? 80 + RNStatusBar.currentHeight : 110,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusContainer: {
    marginTop: Platform.OS === "android" ? 80 + RNStatusBar.currentHeight : 80,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#8B4513",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedStatusButton: {
    backgroundColor: "#8B4513",
    borderColor: "#654321",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513",
  },
  selectedStatusButtonText: {
    color: "#fff",
  },
  detailsBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    borderLeftColor: "#8B4513",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 3,
  },
  label: {
    width: 120,
    fontSize: 14,
    fontWeight: "bold",
    color: "#5D4037",
    textAlign: "left",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  messageBox: {
    marginTop: 15,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F5F0E6",
    borderWidth: 1,
    borderColor: "#E8D5C4",
    borderLeftWidth: 3,
    borderLeftColor: "#A0522D",
  },
  messageLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#8B4513",
    marginTop: 12,
    fontWeight: "500",
  },
});