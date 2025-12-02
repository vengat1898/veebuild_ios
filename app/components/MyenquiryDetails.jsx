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
  const [counts, setCounts] = useState({
    Pending: 0,
    Completed: 0,
    Rejected: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const statusMap = {
    Pending: 0,
    Completed: 2,
    Rejected: 1,
  };

  const statusColors = {
    Pending: "#D4A574",
    Completed: "#8B7355",
    Rejected: "#A52A2A"
  };

  useEffect(() => {
    const fetchAllCounts = async () => {
      const userId = customer_id || (session && session.id);
      if (!userId) return;

      setIsLoading(true);
      try {
        // Fetch counts for all statuses in parallel
        const countPromises = Object.entries(statusMap).map(async ([status, statusCode]) => {
          const normalizedTitle = title?.toLowerCase().trim();
          let url = "";

          if (normalizedTitle === "real estate enquiry") {
            url = `real_estate_enquiry_list.php?user_id=${userId}&status=${statusCode}`;
          } else if (normalizedTitle === "hire people enquiry") {
            url = `hire_enquiry_list.php?user_id=${userId}&status=${statusCode}`;
          } else if (normalizedTitle === "material enquiry") {
            url = `my_enquery.php?user_id=${userId}&status=${statusCode}`;
          } else {
            return { status, count: 0 };
          }

          try {
            const response = await api.get(url);
            const count = response.data.success === 1 && Array.isArray(response.data.storeList) 
              ? response.data.storeList.length 
              : 0;
            return { status, count };
          } catch (error) {
            console.error(`Error fetching ${status} count:`, error);
            return { status, count: 0 };
          }
        });

        const results = await Promise.all(countPromises);
        const newCounts = {};
        results.forEach(result => {
          newCounts[result.status] = result.count;
        });
        
        setCounts(newCounts);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCounts();
  }, [session, customer_id, title]);

  useEffect(() => {
    const fetchEnquiries = async () => {
      const userId = customer_id || (session && session.id);
      if (!userId || selectedStatus === null) return;

      try {
        const statusCode = statusMap[selectedStatus];
        let url = "";
        const normalizedTitle = title?.toLowerCase().trim();

        if (normalizedTitle === "real estate enquiry") {
          url = `real_estate_enquiry_list.php?user_id=${userId}&status=${statusCode}`;
        } else if (normalizedTitle === "hire people enquiry") {
          url = `hire_enquiry_list.php?user_id=${userId}&status=${statusCode}`;
        } else if (normalizedTitle === "material enquiry") {
          url = `my_enquery.php?user_id=${userId}&status=${statusCode}`;
        } else {
          setEnquiries([]);
          return;
        }

        const response = await api.get(url);

        if (response.data.success === 1 && Array.isArray(response.data.storeList)) {
          setEnquiries(response.data.storeList);
        } else {
          setEnquiries([]);
        }
      } catch (error) {
        console.error("Error fetching enquiry data:", error);
        setEnquiries([]);
      }
    };

    fetchEnquiries();
  }, [selectedStatus, session, customer_id, title]);

  const renderEnquiryItem = ({ item }) => (
    <View style={styles.detailsBox}>
      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{item.name || item.customer_name || "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Mobile Number</Text>
        <Text style={styles.value}>{item.mobile || item.phone || item.contact_number || "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Enquiry Status</Text>
        <Text style={[
          styles.value, 
          { 
            color: statusColors[selectedStatus],
            fontWeight: "bold" 
          }
        ]}>
          {selectedStatus}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{item.created || item.date || item.created_date || "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Enquiry To</Text>
        <Text style={styles.value}>{item.vendor_name || item.company_name || item.provider_name || "N/A"}</Text>
      </View>

      {/* Your Message Box */}
      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Your Message</Text>
        <Text style={styles.messageText}>{item.message || item.description || item.enquiry_message || "N/A"}</Text>
      </View>

      {/* Vendor Reply Box */}
      {(item.vendor_reply && item.vendor_reply.trim() !== "") && (
        <View style={[styles.messageBox, styles.vendorReplyBox]}>
          <View style={styles.vendorReplyHeader}>
            <Ionicons name="business" size={16} color="#8B4513" />
            <Text style={styles.vendorReplyLabel}>Vendor's Reply</Text>
          </View>
          <Text style={styles.vendorReplyText}>{item.vendor_reply}</Text>
        </View>
      )}

      {(!item.vendor_reply || item.vendor_reply.trim() === "") && (
        <View style={[styles.messageBox, styles.noReplyBox]}>
          <Text style={styles.noReplyText}>
            <Ionicons name="time-outline" size={14} color="#666" />
            {" Waiting for vendor's reply"}
          </Text>
        </View>
      )}
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>{title}</Text>
          <Text style={styles.headerSubtitle}>{enquiries.length} {selectedStatus.toLowerCase()} enquiry{enquiries.length !== 1 ? 's' : ''}</Text>
        </View>
      </LinearGradient>

      {/* Status Filter with Counts */}
      <View style={styles.statusContainer}>
        {["Pending", "Completed", "Rejected"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.selectedStatusButton,
              isLoading && styles.statusButtonDisabled
            ]}
            onPress={() => !isLoading && setSelectedStatus(status)}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === status && styles.selectedStatusButtonText,
              ]}
            >
              {status}
            </Text>
            
            {/* Count Badge */}
            <View style={[
              styles.countBadge,
              selectedStatus === status && styles.selectedCountBadge
            ]}>
              <Text style={[
                styles.countText,
                selectedStatus === status && styles.selectedCountText
              ]}>
                {isLoading ? "..." : counts[status]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={30} color="#8B4513" />
          <Text style={styles.loadingText}>Loading counts...</Text>
        </View>
      )}

      {/* Enquiry List */}
      {enquiries.length > 0 ? (
        <FlatList
          data={enquiries}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderEnquiryItem}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        />
      ) : (
        selectedStatus && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons 
              name={counts[selectedStatus] === 0 ? "document-text-outline" : "checkmark-circle"} 
              size={60} 
              color="#8B4513" 
            />
            <Text style={styles.emptyText}>
              {counts[selectedStatus] === 0 
                ? "No enquiries found" 
                : "No enquiries in this status"}
            </Text>
            <Text style={styles.emptySubtext}>
              Total {selectedStatus.toLowerCase()} enquiries: {counts[selectedStatus]}
            </Text>
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
  headerTitleContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
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
    paddingHorizontal: 15,
    borderRadius: 7,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#8B4513",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: "center",
    minWidth: 90,
    position: "relative",
  },
  statusButtonDisabled: {
    opacity: 0.7,
  },
  selectedStatusButton: {
    backgroundColor: "#8B4513",
    borderColor: "#654321",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 4,
  },
  selectedStatusButtonText: {
    color: "#fff",
  },
  countBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#8B4513",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  selectedCountBadge: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  countText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8B4513",
  },
  selectedCountText: {
    color: "#8B4513",
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
  vendorReplyBox: {
    backgroundColor: "#E8F5E8",
    borderColor: "#C8E6C9",
    borderLeftColor: "#4CAF50",
  },
  vendorReplyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  vendorReplyLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 6,
  },
  vendorReplyText: {
    fontSize: 14,
    color: "#1B5E20",
    lineHeight: 20,
    fontWeight: "500",
  },
  noReplyBox: {
    backgroundColor: "#FFF3E0",
    borderColor: "#FFE0B2",
    borderLeftColor: "#FF9800",
  },
  noReplyText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#8B4513",
    marginLeft: 10,
    fontStyle: "italic",
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
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
});