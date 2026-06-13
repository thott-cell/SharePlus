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
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase/firebaseConfig";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function WithdrawScreen() {
  const [balance, setBalance] = useState(0);

  const [bankName, setBankName] =
    useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [accountName, setAccountName] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (snap.exists()) {
        setBalance(
          Number(
            snap.data().balance || 0
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawFunds = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert(
          "Error",
          "Login required"
        );
        return;
      }

      const withdrawAmount =
        Number(amount);

      if (
        !bankName ||
        !accountNumber ||
        !accountName ||
        !amount
      ) {
        Alert.alert(
          "Error",
          "Fill all fields"
        );
        return;
      }

      if (
        withdrawAmount < 100
      ) {
        Alert.alert(
          "Error",
          "Minimum withdrawal is ₦100"
        );
        return;
      }

      if (
        withdrawAmount > balance
      ) {
        Alert.alert(
          "Error",
          "Insufficient balance"
        );
        return;
      }

      setLoading(true);

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(userRef, {
        balance:
          balance -
          withdrawAmount,
      });

      await addDoc(
        collection(
          db,
          "withdrawals"
        ),
        {
          uid: user.uid,
          bankName,
          accountNumber,
          accountName,
          amount: withdrawAmount,
          status: "pending",
          createdAt:
            serverTimestamp(),
        }
      );

      await addDoc(
        collection(
          db,
          "transactions"
        ),
        {
          uid: user.uid,
          type: "withdrawal",
          amount:
            withdrawAmount,
          status: "pending",
          createdAt:
            serverTimestamp(),
        }
      );

      setBalance(
        balance -
          withdrawAmount
      );

      Alert.alert(
        "Success",
        "Withdrawal request submitted"
      );

      setAmount("");
      setAccountName("");
      setAccountNumber("");
      setBankName("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      <Text style={styles.header}>
        Withdraw Funds
      </Text>

      <LinearGradient
        colors={[
          "#7C3AED",
          "#EC4899",
        ]}
        style={styles.balanceCard}
      >
        <Text
          style={styles.balanceLabel}
        >
          Available Balance
        </Text>

        <Text
          style={styles.balance}
        >
          ₦
          {balance.toLocaleString()}
        </Text>
      </LinearGradient>

      <Text style={styles.label}>
        Bank Name
      </Text>

      <TextInput
        style={styles.input}
        value={bankName}
        onChangeText={
          setBankName
        }
        placeholder="GTBank"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>
        Account Number
      </Text>

      <TextInput
        style={styles.input}
        value={accountNumber}
        onChangeText={
          setAccountNumber
        }
        keyboardType="numeric"
        maxLength={10}
        placeholder="0123456789"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>
        Account Name
      </Text>

      <TextInput
        style={styles.input}
        value={accountName}
        onChangeText={
          setAccountName
        }
        placeholder="John Doe"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>
        Amount
      </Text>

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={
          setAmount
        }
        keyboardType="numeric"
        placeholder="1000"
        placeholderTextColor="#666"
      />

      <View
        style={styles.summaryCard}
      >
        <Text
          style={styles.summaryTitle}
        >
          Withdrawal Info
        </Text>

        <Text
          style={styles.summaryText}
        >
          Minimum Withdrawal:
          ₦100
        </Text>

        <Text
          style={styles.summaryText}
        >
          Processing Time:
          Instant - 24 Hours
        </Text>

        <Text
          style={styles.summaryText}
        >
          Status: Pending
        </Text>
      </View>

      <LinearGradient
        colors={[
          "#7C3AED",
          "#EC4899",
        ]}
        style={styles.button}
      >
        <TouchableOpacity
          style={
            styles.buttonInner
          }
          onPress={
            withdrawFunds
          }
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              Withdraw Now
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View
        style={{ height: 50 }}
      />
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#070B1A",
      paddingHorizontal: 20,
      paddingTop: 60,
    },

    header: {
      color: "white",
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 20,
    },

    balanceCard: {
      padding: 25,
      borderRadius: 24,
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

    label: {
      color: "white",
      fontWeight: "600",
      marginBottom: 8,
      marginTop: 15,
    },

    input: {
      backgroundColor:
        "#111827",
      color: "white",
      borderRadius: 15,
      padding: 16,
    },

    summaryCard: {
      backgroundColor:
        "#111827",
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
    },

    summaryTitle: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },

    summaryText: {
      color: "#D1D5DB",
      marginBottom: 8,
    },

    button: {
      borderRadius: 18,
      marginTop: 25,
    },

    buttonInner: {
      paddingVertical: 18,
      alignItems: "center",
    },

    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });