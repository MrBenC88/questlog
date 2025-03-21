import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Icon, Button } from "@rneui/themed";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function Quest() {
  const [quests, setQuests] = useState<any[]>([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchQuests();
    }, [])
  );

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
          <QuestItem item={item} navigation={navigation} />
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
        onPress={() => navigation.navigate("CreateQuest")}
      />
    </View>
  );
}

// 🔥 Custom Quest Item with Glow & Touch Effect
function QuestItem({ item, navigation }) {
  const glowAnim = useState(new Animated.Value(1))[0];

  const handlePressIn = () => {
    Animated.timing(glowAnim, {
      toValue: 1.15,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    navigation.navigate("QuestDetails", { quest: item });
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[styles.questItem, { transform: [{ scale: glowAnim }] }]}
      >
        <Icon
          name="bolt"
          type="font-awesome"
          color="#FFC107"
          size={16}
          style={styles.questIcon}
        />
        <Text style={styles.questText}>{item.name}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F8F8F8",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    marginBottom: 20,
    textAlign: "center",
  },
  questItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#007AFF",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  questIcon: {
    marginRight: 10,
  },
  questText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "capitalize",
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
