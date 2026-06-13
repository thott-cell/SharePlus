import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase/firebaseConfig";

import { doc, getDoc } from "firebase/firestore";

// ✅ ENGINE IMPORT (NEW)
import { purchaseData } from "../services/dataEngine";

export default function DataScreen() {
  const [network, setNetwork] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const plans: Record<string, any[]> = {
    mtn: [
      { size: "1GB", amount: 500 },
      { size: "2GB", amount: 1000 },
      { size: "5GB", amount: 2500 },
    ],
    airtel: [
      { size: "1GB", amount: 500 },
      { size: "2GB", amount: 1000 },
      { size: "5GB", amount: 2500 },
    ],
    glo: [
      { size: "1GB", amount: 500 },
      { size: "2GB", amount: 1000 },
      { size: "5GB", amount: 2500 },
    ],
    "9mobile": [
      { size: "1GB", amount: 500 },
      { size: "2GB", amount: 1000 },
      { size: "5GB", amount: 2500 },
    ],
  };

  const [selectedPlan, setSelectedPlan] = useState(plans.mtn[0]);

  useEffect(() => {
    loadBalance();
  }, []);

  useEffect(() => {
    setSelectedPlan(plans[network][0]);
  }, [network]);

  const loadBalance = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setBalance(Number(snap.data().balance || 0));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buyData = async () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter phone number");
      return;
    }

    if (phone.trim().length < 11) {
      Alert.alert("Error", "Enter valid phone number");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not logged in");
      }

      // ✅ ENGINE CALL (ALL LOGIC MOVED OUT)
      const result = await purchaseData({
        uid: user.uid,
        network,
        phone: phone.trim(),
        plan: selectedPlan.size,
        amount: selectedPlan.amount,
        description: `Data purchase: ${selectedPlan.size} for ${phone.trim()}`,
      });

      setBalance(result.balanceAfter);

      Alert.alert(
        "Success",
        `${selectedPlan.size} purchased successfully`
      );

      setPhone("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Buy Data</Text>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Wallet Balance</Text>

        <Text style={styles.balanceAmount}>
          ₦{balance.toLocaleString()}
        </Text>

        <Text style={styles.balanceSmall}>
          Ready for data purchase
        </Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Select Network</Text>

      <View style={styles.networkRow}>
        {[
          { id: "mtn", label: "MTN" },
          { id: "airtel", label: "Airtel" },
          { id: "glo", label: "Glo" },
          { id: "9mobile", label: "9mobile" },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.networkButton,
              network === item.id && styles.activeNetwork,
            ]}
            onPress={() => setNetwork(item.id)}
          >
            <Text style={styles.networkText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Select Plan</Text>

      {plans[network].map((plan) => (
        <TouchableOpacity
          key={plan.size}
          style={[
            styles.planCard,
            selectedPlan.size === plan.size && styles.activePlan,
          ]}
          onPress={() => setSelectedPlan(plan)}
        >
          <View>
            <Text style={styles.planSize}>{plan.size}</Text>
            <Text style={styles.planSub}>Instant Delivery</Text>
          </View>

          <Text style={styles.planPrice}>
            ₦{plan.amount.toLocaleString()}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Phone Number</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="call" size={22} color="#9CA3AF" />

        <TextInput
          style={styles.input}
          placeholder="08012345678"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Purchase Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Network</Text>
          <Text style={styles.summaryValue}>{network.toUpperCase()}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plan</Text>
          <Text style={styles.summaryValue}>{selectedPlan.size}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>
            ₦{selectedPlan.amount.toLocaleString()}
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.buyButton}
      >
        <TouchableOpacity
          style={styles.buyButtonInner}
          onPress={buyData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buyButtonText}>Buy Data</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* =======================
   STYLES (UNCHANGED)
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B1A",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  header: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  balanceCard: {
    borderRadius: 24,
    padding: 25,
    marginBottom: 25,
  },

  balanceLabel: {
    color: "#E9D5FF",
    fontSize: 15,
  },

  balanceAmount: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },

  balanceSmall: {
    color: "#F3E8FF",
    marginTop: 8,
  },

  sectionTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 10,
  },

  networkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  networkButton: {
    width: "48%",
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },

  activeNetwork: {
    backgroundColor: "#7C3AED",
  },

  networkText: {
    color: "white",
    fontWeight: "700",
  },

  planCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activePlan: {
    borderWidth: 2,
    borderColor: "#7C3AED",
  },

  planSize: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  planSub: {
    color: "#9CA3AF",
    marginTop: 5,
  },

  planPrice: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "bold",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    color: "white",
    paddingVertical: 16,
    marginLeft: 10,
  },

  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
  },

  summaryTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryLabel: {
    color: "#9CA3AF",
  },

  summaryValue: {
    color: "white",
    fontWeight: "700",
  },

  buyButton: {
    borderRadius: 18,
  },

  buyButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
  },

  buyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});