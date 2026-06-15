import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
  const [email, setEmail] = useState(""); // Kept to track user email
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
      console.log("UID:", auth.currentUser?.uid);
      setEmail(user.email || ""); // Save the email value from Auth object

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

  /* ========================================================
     FIXED NAVIGATION LIFTING PROPS
     ======================================================== */
  const handleTopUp = () => {
    const currentUid = auth.currentUser?.uid;
    
    if (!currentUid || !email) {
      console.log("Cannot navigate: user metadata is loading.");
      return;
    }

    // Passes key params through url navigation string parameters safely
    router.push({
      pathname: "../paystackTopup",
      params: { uid: currentUid, email: email }
    });
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
          <Text style={styles.topUpText}>+ Add ₦5,000</Text>
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
                <Text style={styles.seeMoreText}>See More</Text>
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
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  walletCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  walletTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  walletLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  balance: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  bonus: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 8,
  },
  topUpBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 15,
  },
  topUpText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  actionsRow: {
    flexDirection: "row",justifyContent: "space-between",marginBottom: 30,},actionButton: {width: "22%",aspectRatio: 1,borderRadius: 12,justifyContent: "center",alignItems: "center",},actionText: {color: "white",fontSize: 12,marginTop: 5,fontWeight: "500",},transactionCard: {backgroundColor: "#111827",borderRadius: 16,padding: 15,marginBottom: 40,},transactionRow: {flexDirection: "row",justifyContent: "space-between",alignItems: "center",paddingVertical: 12,borderBottomWidth: 1,borderBottomColor: "#1F2937",},transactionLeft: {flexDirection: "row",alignItems: "center",},iconCircle: {width: 36,height: 36,borderRadius: 18,backgroundColor: "#1F2937",justifyContent: "center",alignItems: "center",marginRight: 12,},transactionTitle: {color: "white",fontWeight: "bold",fontSize: 14,},transactionDate: {color: "#6B7280",fontSize: 12,marginTop: 2,},transactionAmount: {fontWeight: "bold",fontSize: 16,},seeMoreBtn: {alignItems: "center",paddingTop: 12,},seeMoreText: {color: "#7C3AED",fontWeight: "bold",},});
