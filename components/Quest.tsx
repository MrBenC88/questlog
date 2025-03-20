import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Icon, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function Quest() {
  const [quests, setQuests] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchQuests();
  }, []);

  async function fetchQuests() {
    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setQuests(data);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Quests</Text>
      <Text style={styles.subtitle}>Track your daily progress</Text>

      {/* Quest List */}
      <FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.questItem}>
            <Text style={styles.questText}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No quests yet. Add one!</Text>
        }
      />

      {/* Add Quest Button */}
      <Button
        icon={<Icon name="plus" type="font-awesome" color="white" />}
        title="  Add Quest"
        buttonStyle={styles.addButton}
        onPress={() => navigation.navigate("CreateQuest" as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 20,
  },
  questItem: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  questText: {
    fontSize: 16,
    color: "#fff",
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginTop: 20,
  },
});
