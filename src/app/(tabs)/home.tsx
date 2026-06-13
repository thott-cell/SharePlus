import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";

import { auth, db } from "../../firebase/firebaseConfig";

import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  Unsubscribe,
} from "firebase/auth";

export default function HomeScreen() {
  console.log(
  "VTPASS API KEY:",
  process.env.EXPO_PUBLIC_VTPASS_API_KEY
);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("User");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let authUnsub: Unsubscribe | null = null;
    let userUnsub: Unsubscribe | null = null;
    let txUnsub: Unsubscribe | null = null;

    authUnsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);

      userUnsub = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          setName(
            data.name?.trim?.() ||
              data.fullName?.trim?.() ||
              data.username?.trim?.() ||
              "User"
          );

          setBalance(data.balance || 0);
        }

        setLoading(false);
      });

      const txQuery = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      txUnsub = onSnapshot(txQuery, (snapshot) => {
        const list: any[] = [];

        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setTransactions(list);
      });
    });

    return () => {
      authUnsub?.();
      userUnsub?.();
      txUnsub?.();
    };
  }, []);

 const handleTopUp = () => {
  router.push("../paystackTopup");
};

  const getIcon = (type: string) => {
    switch (type) {
      case "airtime":
        return <MaterialIcons name="phone-android" size={18} color="white" />;
      case "data":
        return <Ionicons name="wifi" size={18} color="white" />;
      case "topup":
        return <Ionicons name="wallet" size={18} color="white" />;
      default:
        return <Ionicons name="cash" size={18} color="white" />;
    }
  };

  const isCredit = (type: string) => {
    return type === "topup" || type === "credit" || type === "refund";
  };

  const visibleTransactions = showAll
    ? transactions
    : transactions.slice(0, 3);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.name}>{name}</Text>
        </View>

        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* WALLET */}
      <LinearGradient
        colors={["#7C3AED", "#EC4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.walletCard}
      >
        <View style={styles.walletTop}>
          <View>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.balance}>₦{balance.toLocaleString()}</Text>
            <Text style={styles.bonus}>Bonus Balance: ₦0</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleTopUp}>
            <Ionicons name="add" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.topUpBtn} onPress={handleTopUp}>
          <Text style={styles.topUpText}>+ Add ₦1000 (Test Top-Up)</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#7C3AED" }]}
          onPress={() => router.push("/airtime")}
        >
          <MaterialIcons name="phone-android" size={26} color="white" />
          <Text style={styles.actionText}>Airtime</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#2563EB" }]}
          onPress={() => router.push("/data")}
        >
          <Ionicons name="wifi" size={26} color="white" />
          <Text style={styles.actionText}>Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#EC4899" }]}
          onPress={() => router.push("/bulk")}
        >
          <FontAwesome5 name="users" size={20} color="white" />
          <Text style={styles.actionText}>Bulk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#F97316" }]}
          onPress={() => router.push("/claim")}
        >
          <Ionicons name="gift" size={24} color="white" />
          <Text style={styles.actionText}>Claim</Text>
        </TouchableOpacity>
      </View>

      {/* TRANSACTIONS */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <View style={styles.transactionCard}>
        {transactions.length === 0 ? (
          <Text style={{ color: "#9CA3AF" }}>No transactions yet</Text>
        ) : (
          <>
            {visibleTransactions.map((item) => {
              const credit = isCredit(item.type);
              const amount = Number(item.amount || 0);

              return (
                <View key={item.id} style={styles.transactionRow}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.iconCircle}>
                      {getIcon(item.type)}
                    </View>

                    <View>
                      <Text style={styles.transactionTitle}>
                        {item.type?.toUpperCase()}
                      </Text>

                      <Text style={styles.transactionDate}>
                        {item.phone || ""}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: credit ? "#22C55E" : "#EF4444" },
                    ]}
                  >
                    {credit ? "+" : "-"}₦{amount.toLocaleString()}
                  </Text>
                </View>
              );
            })}

            {transactions.length > 3 && (
             <TouchableOpacity
  onPress={() => router.push("/transactions")}
  style={styles.seeMoreBtn}
>
  <Text style={styles.seeMoreText}>
    See More
  </Text>
</TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B1A",
    paddingHorizontal: 20,
    paddingTop: 70,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070B1A",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  greeting: {
    color: "#9CA3AF",
    fontSize: 16,
  },

  name: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },

  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  walletCard: {
    borderRadius: 25,
    padding: 25,
  },

  walletTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  walletLabel: {
    color: "#E9D5FF",
    fontSize: 16,
  },

  balance: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 10,
  },

  bonus: {
    color: "#F3E8FF",
    marginTop: 10,
  },

  addButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },

  topUpBtn: {
    marginTop: 15,
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  topUpText: {
    color: "white",
    fontWeight: "bold",
  },

  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  actionButton: {
    width: 75,
    height: 75,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  actionText: {
    color: "white",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  transactionCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 15,
    marginBottom: 40,
  },

  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  transactionTitle: {
    color: "white",
    fontWeight: "bold",
  },

  transactionDate: {
    color: "#9CA3AF",
    fontSize: 12,
  },

  transactionAmount: {
    fontWeight: "bold",
  },

  seeMoreBtn: {
    marginTop: 15,
    alignItems: "center",
    paddingVertical: 10,
  },

  seeMoreText: {
    color: "#7C3AED",
    fontWeight: "bold",
  },
});