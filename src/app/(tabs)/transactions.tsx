import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";

import {
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";

export default function TransactionsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const list: any[] = [];

        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });

        setTransactions(list);
        setLoading(false);
      });

      return () => unsub();
    });

    return () => unsubAuth();
  }, []);

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

  const isCredit = (type: string) =>
    type === "topup" || type === "credit" || type === "refund";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>All Transactions</Text>

      {transactions.length === 0 ? (
        <Text style={styles.empty}>No transactions found</Text>
      ) : (
        transactions.map((item) => {
          const credit = isCredit(item.type);
          const amount = Number(item.amount || 0);

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.left}>
                <View style={styles.icon}>{getIcon(item.type)}</View>

                <View>
                  <Text style={styles.type}>
                    {item.type?.toUpperCase()}
                  </Text>

                  <Text style={styles.phone}>
                    {item.phone || ""}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.amount,
                  { color: credit ? "#22C55E" : "#EF4444" },
                ]}
              >
                {credit ? "+" : "-"}₦{amount.toLocaleString()}
              </Text>
            </View>
          );
        })
      )}
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070B1A",
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  empty: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 40,
  },

  card: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  type: {
    color: "white",
    fontWeight: "bold",
  },

  phone: {
    color: "#9CA3AF",
    fontSize: 12,
  },

  amount: {
    fontWeight: "bold",
    fontSize: 14,
  },
});