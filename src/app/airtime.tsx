import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

import { auth, db } from "../firebase/firebaseConfig";

import { doc, getDoc } from "firebase/firestore";

// ✅ ENGINE IMPORT (NEW)
import { purchaseAirtime } from "../services/airtimeEngine";

export default function AirtimeScreen() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("mtn");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const quickAmounts = [100, 200, 500, 1000];

  useEffect(() => {
    loadBalance();
  }, []);

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

  const buyAirtime = async () => {
    if (!phone.trim() || !amount.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const value = Number(amount);

    if (isNaN(value) || value <= 0) {
      Alert.alert("Error", "Enter valid amount");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not logged in");
      }

      // ✅ ENGINE CALL (ALL LOGIC MOVED OUT)
      const result = await purchaseAirtime({
        uid: user.uid,
        network,
        phone: phone.trim(),
        amount: value,
        description: `Airtime purchase for ${phone.trim()}`,
      });

      // update UI balance from engine result
      setBalance(result.balanceAfter);

      Alert.alert(
        "Success",
        `₦${value.toLocaleString()} airtime purchased successfully`
      );

      setPhone("");
      setAmount("");
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Buy Airtime</Text>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Wallet Balance</Text>

        <Text style={styles.balanceAmount}>
          ₦{balance.toLocaleString()}
        </Text>

        <Text style={styles.balanceSmall}>
          Ready for airtime purchases
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
            <Text style={styles.networkText}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Phone Number</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="phone" size={22} color="#9CA3AF" />

        <TextInput
          style={styles.input}
          placeholder="08012345678"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <Text style={styles.sectionTitle}>Amount</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="account-balance-wallet"
          size={22}
          color="#9CA3AF"
        />

        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#6B7280"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.quickRow}>
        {quickAmounts.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.quickButton}
            onPress={() => setAmount(String(amt))}
          >
            <Text style={styles.quickText}>₦{amt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Purchase Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Network</Text>
          <Text style={styles.summaryValue}>
            {network.toUpperCase()}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>
            ₦{Number(amount || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.buyButton}
      >
        <TouchableOpacity
          style={styles.buyButtonInner}
          onPress={buyAirtime}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buyButtonText}>
              Buy Airtime
            </Text>
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

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    color: "white",
    paddingVertical: 16,
    marginLeft: 10,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  quickButton: {
    backgroundColor: "#1F2937",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  quickText: {
    color: "white",
    fontWeight: "600",
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