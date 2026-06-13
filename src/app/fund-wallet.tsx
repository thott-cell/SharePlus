import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase/firebaseConfig";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function FundWalletScreen() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (snap.exists()) {
        setBalance(
          Number(snap.data().balance || 0)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const proceedToPayment = async () => {
    const value = Number(amount);

    if (!value || value < 100) {
      Alert.alert(
        "Invalid Amount",
        "Minimum funding is ₦100"
      );
      return;
    }

    Alert.alert(
      "Paystack Integration",
      `Ready to fund ₦${value.toLocaleString()}\n\nWe'll connect Paystack next.`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Fund Wallet
      </Text>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>
          Current Balance
        </Text>

        <Text style={styles.balance}>
          ₦{balance.toLocaleString()}
        </Text>
      </LinearGradient>

      <Text style={styles.section}>
        Enter Amount
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="wallet"
          size={22}
          color="#9CA3AF"
        />

        <TextInput
          style={styles.input}
          placeholder="5000"
          placeholderTextColor="#6B7280"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.quickRow}>
        {[1000, 2000, 5000, 10000].map(
          (item) => (
            <TouchableOpacity
              key={item}
              style={styles.quickButton}
              onPress={() =>
                setAmount(String(item))
              }
            >
              <Text style={styles.quickText}>
                ₦{item}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.button}
      >
        <TouchableOpacity
          style={styles.buttonInner}
          onPress={proceedToPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Continue to Payment
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B1A",
    padding: 20,
    paddingTop: 60,
  },

  header: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
  },

  balanceCard: {
    padding: 25,
    borderRadius: 25,
    marginBottom: 25,
  },

  balanceLabel: {
    color: "#E9D5FF",
  },

  balance: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },

  section: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 15,
  },

  inputContainer: {
    backgroundColor: "#111827",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    color: "white",
    paddingVertical: 18,
    marginLeft: 10,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  quickButton: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
  },

  quickText: {
    color: "white",
    fontWeight: "600",
  },

  button: {
    borderRadius: 18,
  },

  buttonInner: {
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
});