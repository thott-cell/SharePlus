import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import { auth } from "../../firebase/firebaseConfig";

// ✅ ENGINE IMPORT
import { createClaim } from "../../services/claimEngine";

export default function ClaimScreen() {
  const [service, setService] = useState<"airtime" | "data">("airtime");
  const [amount, setAmount] = useState("");
  const [winners, setWinners] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [claimCode, setClaimCode] = useState("");

  useEffect(() => {
    generateCode();
  }, []);

  const generateCode = () => {
    const code =
      "SP-" +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    setClaimCode(code);
  };

  const amountValue = Number(amount) || 0;
  const winnerCount = Number(winners) || 0;
  const totalCost = amountValue * winnerCount;

  const createClaimHandler = async () => {
    try {
      if (amountValue <= 0) {
        Alert.alert("Error", "Enter valid amount");
        return;
      }

      if (winnerCount <= 0) {
        Alert.alert("Error", "Enter valid winners");
        return;
      }

      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not logged in");
      }

      // ✅ ENGINE CALL (ALL LOGIC MOVED OUT)
      const result = await createClaim({
        uid: user.uid,
        service,
        amount: amountValue,
        winners: winnerCount,
        claimCode,
      });

      setBalance(result.balanceAfter);

      Alert.alert(
        "Success 🎉",
        `Claim created successfully.\n\nCode: ${claimCode}`
      );

      setAmount("");
      setWinners("");
      generateCode();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Giveaway Center</Text>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.walletCard}
      >
        <Text style={styles.walletLabel}>Available Balance</Text>

        <Text style={styles.walletAmount}>
          ₦{balance.toLocaleString()}
        </Text>

        <Text style={styles.walletSub}>
          Create airtime & data giveaways
        </Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Giveaway Type</Text>

      <View style={styles.serviceRow}>
        <TouchableOpacity
          style={[
            styles.serviceCard,
            service === "airtime" && styles.activeCard,
          ]}
          onPress={() => setService("airtime")}
        >
          <MaterialIcons name="phone-android" size={28} color="white" />
          <Text style={styles.serviceText}>Airtime</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.serviceCard,
            service === "data" && styles.activeCard,
          ]}
          onPress={() => setService("data")}
        >
          <Ionicons name="wifi" size={28} color="white" />
          <Text style={styles.serviceText}>Data</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Amount Per Winner</Text>

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="100"
        placeholderTextColor="#6B7280"
      />

      <Text style={styles.sectionTitle}>Number of Winners</Text>

      <TextInput
        style={styles.input}
        value={winners}
        onChangeText={setWinners}
        keyboardType="numeric"
        placeholder="10"
        placeholderTextColor="#6B7280"
      />

      <View style={styles.quickRow}>
        {[10, 20, 50, 100].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.quickBtn}
            onPress={() => setWinners(String(num))}
          >
            <Text style={styles.quickText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.claimCard}>
        <Text style={styles.claimTitle}>Claim Code</Text>

        <Text style={styles.claimCode}>{claimCode}</Text>

        <Text style={styles.claimLink}>
          shareplus.app/claim/{claimCode}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Giveaway Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{service.toUpperCase()}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Winners</Text>
          <Text style={styles.summaryValue}>{winnerCount}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Each</Text>
          <Text style={styles.summaryValue}>
            ₦{amountValue.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Cost</Text>
          <Text style={styles.totalValue}>
            ₦{totalCost.toLocaleString()}
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.button}
      >
        <TouchableOpacity onPress={createClaimHandler} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Create Giveaway</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 60 }} />
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
  walletCard: {
    padding: 25,
    borderRadius: 25,
  },
  walletLabel: {
    color: "#E9D5FF",
  },
  walletAmount: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 8,
  },
  walletSub: {
    color: "#F3E8FF",
    marginTop: 5,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#111827",
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
  },
  activeCard: {
    borderWidth: 2,
    borderColor: "#7C3AED",
  },
  serviceText: {
    color: "white",
    marginTop: 10,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 18,
    padding: 18,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  quickBtn: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickText: {
    color: "white",
    fontWeight: "700",
  },
  claimCard: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 20,
    marginTop: 25,
  },
  claimTitle: {
    color: "#9CA3AF",
  },
  claimCode: {
    color: "#10B981",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },
  claimLink: {
    color: "#D1D5DB",
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  summaryTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  summaryDivider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 12,
  },
  totalLabel: {
    color: "white",
    fontWeight: "bold",
  },
  totalValue: {
    color: "#10B981",
    fontWeight: "bold",
    fontSize: 18,
  },
  button: {
    marginTop: 25,
    borderRadius: 18,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    padding: 18,
    fontSize: 18,
    fontWeight: "bold",
  },
});