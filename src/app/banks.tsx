import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase/firebaseConfig";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function BanksScreen() {
  const [bankName, setBankName] =
    useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [accountName, setAccountName] =
    useState("");

  const [banks, setBanks] =
    useState<any[]>([]);

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const q = query(
        collection(db, "banks"),
        where("uid", "==", user.uid)
      );

      const snapshot =
        await getDocs(q);

      const list: any[] = [];

      snapshot.forEach((docItem) => {
        list.push({
          id: docItem.id,
          ...docItem.data(),
        });
      });

      setBanks(list);
    } catch (error) {
      console.log(error);
    }
  };

  const saveBank = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      if (
        !bankName ||
        !accountName ||
        !accountNumber
      ) {
        Alert.alert(
          "Error",
          "Fill all fields"
        );
        return;
      }

      await addDoc(
        collection(db, "banks"),
        {
          uid: user.uid,
          bankName,
          accountName,
          accountNumber,
          createdAt: new Date(),
        }
      );

      Alert.alert(
        "Success",
        "Bank account added"
      );

      setBankName("");
      setAccountName("");
      setAccountNumber("");

      loadBanks();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  const removeBank = async (
    id: string
  ) => {
    Alert.alert(
      "Delete Bank",
      "Remove this bank account?",
      [
        {
          text: "Cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(
              doc(db, "banks", id)
            );

            loadBanks();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      <Text style={styles.header}>
        Saved Banks
      </Text>

      <LinearGradient
        colors={[
          "#7C3AED",
          "#EC4899",
        ]}
        style={styles.heroCard}
      >
        <Ionicons
          name="card"
          size={50}
          color="white"
        />

        <Text style={styles.heroTitle}>
          Bank Accounts
        </Text>

        <Text style={styles.heroSub}>
          Save your bank accounts
          for quick withdrawals
        </Text>
      </LinearGradient>

      <View style={styles.formCard}>
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

        <TouchableOpacity
          style={styles.addButton}
          onPress={saveBank}
        >
          <Text
            style={
              styles.addButtonText
            }
          >
            Save Bank
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>
        Saved Accounts
      </Text>

      {banks.length === 0 ? (
        <View
          style={styles.emptyCard}
        >
          <Text
            style={
              styles.emptyText
            }
          >
            No bank accounts added
          </Text>
        </View>
      ) : (
        banks.map((bank) => (
          <View
            key={bank.id}
            style={styles.bankCard}
          >
            <View>
              <Text
                style={
                  styles.bankName
                }
              >
                {bank.bankName}
              </Text>

              <Text
                style={
                  styles.bankText
                }
              >
                {
                  bank.accountName
                }
              </Text>

              <Text
                style={
                  styles.bankText
                }
              >
                {
                  bank.accountNumber
                }
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                removeBank(
                  bank.id
                )
              }
            >
              <Ionicons
                name="trash"
                size={24}
                color="#EF4444"
              />
            </TouchableOpacity>
          </View>
        ))
      )}

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

    heroCard: {
      padding: 25,
      borderRadius: 24,
      alignItems: "center",
      marginBottom: 25,
    },

    heroTitle: {
      color: "white",
      fontSize: 22,
      fontWeight: "bold",
      marginTop: 10,
    },

    heroSub: {
      color: "#F3E8FF",
      marginTop: 10,
      textAlign: "center",
    },

    formCard: {
      backgroundColor:
        "#111827",
      borderRadius: 20,
      padding: 20,
    },

    label: {
      color: "white",
      marginBottom: 8,
      marginTop: 12,
      fontWeight: "600",
    },

    input: {
      backgroundColor:
        "#1F2937",
      color: "white",
      borderRadius: 14,
      padding: 15,
    },

    addButton: {
      backgroundColor:
        "#7C3AED",
      marginTop: 20,
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
    },

    addButtonText: {
      color: "white",
      fontWeight: "bold",
    },

    section: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 25,
      marginBottom: 15,
    },

    emptyCard: {
      backgroundColor:
        "#111827",
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
    },

    emptyText: {
      color: "#9CA3AF",
    },

    bankCard: {
      backgroundColor:
        "#111827",
      borderRadius: 18,
      padding: 18,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    bankName: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 5,
    },

    bankText: {
      color: "#9CA3AF",
    },
  });