import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase/firebaseConfig";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function ReferralScreen() {
  const [referralCode, setReferralCode] =
    useState("");
  const [name, setName] = useState("User");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (snap.exists()) {
        const data = snap.data();

        setName(
          data.fullName ||
            data.name ||
            "User"
        );

        setReferralCode(
          data.referralCode ||
            user.uid.substring(0, 8).toUpperCase()
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message: `Join SharePlus and earn rewards!\n\nReferral Code: ${referralCode}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const copyCode = () => {
    Alert.alert(
      "Copied",
      `Referral code: ${referralCode}`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>
        Refer & Earn
      </Text>

      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        style={styles.heroCard}
      >
        <Ionicons
          name="gift"
          size={60}
          color="white"
        />

        <Text style={styles.heroTitle}>
          Invite Friends
        </Text>

        <Text style={styles.heroText}>
          Earn referral bonuses whenever
          someone joins SharePlus using
          your code.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>
          Your Referral Code
        </Text>

        <Text style={styles.code}>
          {referralCode}
        </Text>

        <TouchableOpacity
          style={styles.copyBtn}
          onPress={copyCode}
        >
          <Text style={styles.copyText}>
            Copy Code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>
          Referral Stats
        </Text>

        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Referrals
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              ₦0
            </Text>

            <Text style={styles.statLabel}>
              Earnings
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.shareBtn}
        onPress={shareReferral}
      >
        <Ionicons
          name="share-social"
          size={22}
          color="white"
        />

        <Text style={styles.shareText}>
          Share Referral Code
        </Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          How It Works
        </Text>

        <Text style={styles.infoText}>
          1. Share your referral code.
        </Text>

        <Text style={styles.infoText}>
          2. Friend signs up.
        </Text>

        <Text style={styles.infoText}>
          3. Friend funds wallet.
        </Text>

        <Text style={styles.infoText}>
          4. You earn referral bonus.
        </Text>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B1A",
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
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
  },

  heroTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },

  heroText: {
    color: "#F3E8FF",
    textAlign: "center",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },

  label: {
    color: "#9CA3AF",
  },

  code: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    letterSpacing: 2,
  },

  copyBtn: {
    marginTop: 15,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  copyText: {
    color: "white",
    fontWeight: "bold",
  },

  statsCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },

  statsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statBox: {
    width: "48%",
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },

  statNumber: {
    color: "#10B981",
    fontSize: 22,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#9CA3AF",
    marginTop: 5,
  },

  shareBtn: {
    backgroundColor: "#EC4899",
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  shareText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },

  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },

  infoTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },

  infoText: {
    color: "#D1D5DB",
    marginBottom: 8,
  },
});