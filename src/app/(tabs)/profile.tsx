import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { auth, db } from "../../firebase/firebaseConfig";

import { doc, getDoc } from "firebase/firestore";

import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setEmail(user.email || "");

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || data.fullName || "User");
        setBalance(Number(data.balance || 0));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/login");
        },
      },
    ]);
  };

  const MenuItem = ({ icon, label, route }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push(route)}
    >
      {icon}

      <Text style={styles.menuText}>{label}</Text>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Profile</Text>

      <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </LinearGradient>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balance}>₦{balance.toLocaleString()}</Text>
      </View>

      {/* ACTIONS */}
      <MenuItem
        icon={<Ionicons name="person-outline" size={22} color="white" />}
        label="Edit Profile"
        route="/edit-profile"
      />

      <MenuItem
        icon={<MaterialIcons name="security" size={22} color="white" />}
        label="Security"
        route="/security"
      />

      <MenuItem
        icon={<Ionicons name="wallet-outline" size={22} color="white" />}
        label="Fund Wallet"
        route="/fund-wallet"
      />

      <MenuItem
        icon={<Ionicons name="card-outline" size={22} color="white" />}
        label="Withdraw"
        route="/withdraw"
      />

      <MenuItem
        icon={<FontAwesome5 name="gift" size={18} color="white" />}
        label="Referral Program"
        route="/referrals"
      />

      <MenuItem
        icon={<Ionicons name="ticket-outline" size={22} color="white" />}
        label="Redeem"
        route="/redeem"
      />

      <MenuItem
        icon={<Ionicons name="notifications-outline" size={22} color="white" />}
        label="Notifications"
        route="/notifications"
      />

      <MenuItem
        icon={<Ionicons name="shield-checkmark-outline" size={22} color="white" />}
        label="KYC Verification"
        route="/kyc"
      />

      <MenuItem
        icon={<Ionicons name="help-circle-outline" size={22} color="white" />}
        label="Support"
        route="/support"
      />

      <MenuItem
  icon={<Ionicons name="settings-outline" size={22} color="white" />}
  label="Settings"
  route="/settings"
/>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SharePlus v1.0.0</Text>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070B1A",
  },
  header: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },
  email: {
    color: "#F3E8FF",
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  balanceLabel: {
    color: "#9CA3AF",
  },
  balance: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuItem: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    color: "white",
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 25,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  version: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 25,
  },
});