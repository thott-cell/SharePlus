import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// ✅ ENGINE IMPORT
import { sendBulk } from "../services/bulkEngine";

export default function BulkScreen() {
  const [service, setService] = useState<"airtime" | "data">("airtime");
  const [numbers, setNumbers] = useState("");
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

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setBalance(Number(snap.data().balance || 0));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const recipients = numbers
    .split("\n")
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const amountValue = Number(amount) || 0;
  const totalRecipients = recipients.length;
  const totalCost = totalRecipients * amountValue;

  const handleSendBulk = async () => {
    try {
      if (recipients.length === 0) {
        Alert.alert("Error", "Enter recipient numbers");
        return;
      }

      if (!amount || amountValue <= 0) {
        Alert.alert("Error", "Enter valid amount");
        return;
      }

      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not logged in");
      }

      // ✅ ENGINE CALL (FIXED)
      const result = await sendBulk({
  uid: user.uid,
  service,
  recipients,
  amountPerPerson: amountValue,
});

      // refresh balance properly
      await loadBalance();

      Alert.alert(
        "Success",
        `${totalRecipients} recipients processed successfully`
      );

      setNumbers("");
      setAmount("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Bulk Distribution</Text>

      <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>

        <Text style={styles.balanceAmount}>
          ₦{balance.toLocaleString()}
        </Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Service Type</Text>

      <View style={styles.serviceRow}>
        <TouchableOpacity
          style={[
            styles.serviceBtn,
            service === "airtime" && styles.activeBtn,
          ]}
          onPress={() => setService("airtime")}
        >
          <Text style={styles.serviceText}>Airtime</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.serviceBtn,
            service === "data" && styles.activeBtn,
          ]}
          onPress={() => setService("data")}
        >
          <Text style={styles.serviceText}>Data</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recipients</Text>

      <TextInput
        style={styles.recipientInput}
        multiline
        value={numbers}
        onChangeText={setNumbers}
        placeholder={`08011111111
08022222222
08033333333`}
        placeholderTextColor="#777"
      />

      <Text style={styles.sectionTitle}>Amount Per Person</Text>

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="500"
        placeholderTextColor="#777"
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>

        <Text style={styles.summaryText}>
          Service: {service.toUpperCase()}
        </Text>

        <Text style={styles.summaryText}>
          Recipients: {totalRecipients}
        </Text>

        <Text style={styles.summaryText}>
          Amount Each: ₦{amountValue.toLocaleString()}
        </Text>

        <Text style={styles.totalText}>
          Total Cost: ₦{totalCost.toLocaleString()}
        </Text>
      </View>

      <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.button}>
        <TouchableOpacity
          style={styles.buttonInner}
          onPress={handleSendBulk}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Send Bulk</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* =====================
   STYLES (UNCHANGED)
===================== */

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
    color: "#F3E8FF",
  },

  balanceAmount: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 15,
  },

  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  serviceBtn: {
    width: "48%",
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  activeBtn: {
    backgroundColor: "#7C3AED",
  },

  serviceText: {
    color: "white",
    fontWeight: "700",
  },

  recipientInput: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 18,
    padding: 15,
    minHeight: 180,
    textAlignVertical: "top",
  },

  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 18,
    padding: 16,
  },

  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
  },

  summaryTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },

  summaryText: {
    color: "#D1D5DB",
    marginBottom: 6,
  },

  totalText: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  button: {
    borderRadius: 18,
    marginTop: 25,
  },

  buttonInner: {
    padding: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});