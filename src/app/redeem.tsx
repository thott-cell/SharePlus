import React, { useState } from "react";
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
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function RedeemScreen() {
  const [claimCode, setClaimCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [claim, setClaim] =
    useState<any>(null);

  const searchClaim = async () => {
    try {
      if (!claimCode.trim()) {
        Alert.alert(
          "Error",
          "Enter claim code"
        );
        return;
      }

      setLoading(true);

      const q = query(
        collection(db, "claims"),
        where(
          "claimCode",
          "==",
          claimCode.trim()
        )
      );

      const snapshot =
        await getDocs(q);

      if (snapshot.empty) {
        Alert.alert(
          "Not Found",
          "Invalid claim code"
        );
        setClaim(null);
        return;
      }

      const data =
        snapshot.docs[0];

      setClaim({
        id: data.id,
        ...data.data(),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const redeemClaim = async () => {
    try {
      const user =
        auth.currentUser;

      if (!user) {
        Alert.alert(
          "Error",
          "Login required"
        );
        return;
      }

      if (!claim) {
        Alert.alert(
          "Error",
          "No claim selected"
        );
        return;
      }

      const claimedUsers =
        claim.claimedUsers || [];

      if (
        claimedUsers.includes(
          user.uid
        )
      ) {
        Alert.alert(
          "Already Claimed",
          "You already claimed this giveaway"
        );
        return;
      }

      if (
        claim.remaining <= 0
      ) {
        Alert.alert(
          "Finished",
          "This giveaway has ended"
        );
        return;
      }

      setLoading(true);

      const claimRef = doc(
        db,
        "claims",
        claim.id
      );

      await updateDoc(
        claimRef,
        {
          remaining:
            claim.remaining - 1,

          claimedUsers:
            arrayUnion(
              user.uid
            ),
        }
      );

      await addDoc(
        collection(
          db,
          "transactions"
        ),
        {
          uid: user.uid,
          type: "claim_redeem",
          service:
            claim.service,
          amount:
            claim.amount,
          status: "success",
          transactionType:
            "credit",
          createdAt:
            serverTimestamp(),
        }
      );

      Alert.alert(
        "Success 🎉",
        `You received ${claim.amount}`
      );

      setClaim(null);
      setClaimCode("");
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
        Redeem Giveaway
      </Text>

      <LinearGradient
        colors={[
          "#7C3AED",
          "#EC4899",
        ]}
        style={styles.topCard}
      >
        <Ionicons
          name="gift"
          size={40}
          color="white"
        />

        <Text
          style={styles.topTitle}
        >
          Claim Airtime & Data
        </Text>

        <Text
          style={styles.topSub}
        >
          Enter a giveaway code
        </Text>
      </LinearGradient>

      <Text
        style={styles.label}
      >
        Claim Code
      </Text>

      <TextInput
        style={styles.input}
        value={claimCode}
        onChangeText={
          setClaimCode
        }
        placeholder="SP-ABC123"
        placeholderTextColor="#777"
      />

      <TouchableOpacity
        style={styles.searchBtn}
        onPress={
          searchClaim
        }
      >
        <Text
          style={
            styles.searchText
          }
        >
          Search Claim
        </Text>
      </TouchableOpacity>

      {claim && (
        <View
          style={styles.claimCard}
        >
          <Text
            style={
              styles.claimTitle
            }
          >
            Giveaway Found
          </Text>

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label2
              }
            >
              Service
            </Text>

            <Text
              style={
                styles.value
              }
            >
              {claim.service.toUpperCase()}
            </Text>
          </View>

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label2
              }
            >
              Amount
            </Text>

            <Text
              style={
                styles.value
              }
            >
              ₦
              {Number(
                claim.amount
              ).toLocaleString()}
            </Text>
          </View>

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label2
              }
            >
              Remaining
            </Text>

            <Text
              style={
                styles.value
              }
            >
              {
                claim.remaining
              }
            </Text>
          </View>

          <LinearGradient
            colors={[
              "#7C3AED",
              "#EC4899",
            ]}
            style={
              styles.redeemBtn
            }
          >
            <TouchableOpacity
              onPress={
                redeemClaim
              }
              disabled={
                loading
              }
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={
                    styles.redeemText
                  }
                >
                  Redeem Now
                </Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      <View
        style={{
          height: 50,
        }}
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
      padding: 20,
      paddingTop: 60,
    },

    header: {
      color: "white",
      fontSize: 30,
      fontWeight:
        "bold",
      marginBottom: 20,
    },

    topCard: {
      padding: 25,
      borderRadius: 25,
      alignItems:
        "center",
      marginBottom: 25,
    },

    topTitle: {
      color: "white",
      fontSize: 22,
      fontWeight:
        "bold",
      marginTop: 10,
    },

    topSub: {
      color:
        "#F3E8FF",
      marginTop: 5,
    },

    label: {
      color: "white",
      marginBottom: 10,
      fontWeight:
        "600",
    },

    input: {
      backgroundColor:
        "#111827",
      color: "white",
      borderRadius: 16,
      padding: 16,
    },

    searchBtn: {
      backgroundColor:
        "#7C3AED",
      marginTop: 15,
      padding: 16,
      borderRadius: 16,
      alignItems:
        "center",
    },

    searchText: {
      color: "white",
      fontWeight:
        "bold",
    },

    claimCard: {
      backgroundColor:
        "#111827",
      borderRadius: 20,
      padding: 20,
      marginTop: 25,
    },

    claimTitle: {
      color: "white",
      fontSize: 20,
      fontWeight:
        "bold",
      marginBottom: 15,
    },

    row: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    label2: {
      color:
        "#9CA3AF",
    },

    value: {
      color: "white",
      fontWeight:
        "bold",
    },

    redeemBtn: {
      borderRadius: 16,
      marginTop: 20,
    },

    redeemText: {
      color: "white",
      textAlign:
        "center",
      padding: 16,
      fontWeight:
        "bold",
      fontSize: 16,
    },
  });