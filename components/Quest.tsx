import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Icon, Button, LinearProgress } from "@rneui/themed";
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
    const { data: questsData, error: questsError } = await supabase
      .from("quests")
      .select("*")
      .order("created_at", { ascending: false });

    if (questsError) {
      console.error("Failed to fetch quests", questsError);
      return;
    }

    const questsWithProgress = await Promise.all(
      questsData.map(async (quest) => {
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("completed")
          .eq("quest_id", quest.id);

        if (tasksError) {
          console.error(
            `Failed to fetch tasks for quest ${quest.id}`,
            tasksError
          );
          return { ...quest, progress: 0 };
        }

        const total = tasks.length;
        const completed = tasks.filter((t) => t.completed).length;
        const progress = total > 0 ? completed / total : 0;

        return { ...quest, progress };
      })
    );

    setQuests(questsWithProgress);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quests</Text>
      <Text style={styles.subtitle}>Level up. No excuses.</Text>

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

      <Button
        icon={<Icon name="plus" type="font-awesome" color="white" />}
        title="  Add Quest"
        buttonStyle={styles.addButton}
        onPress={() => navigation.navigate("CreateQuest")}
      />
    </View>
  );
}

function QuestItem({ item, navigation }) {
  const glowAnim = useState(new Animated.Value(1))[0];
  const progress = Math.min(item.progress || 0, 1); // fallback to 0 if missing

  const handlePressIn = () => {
    Animated.timing(glowAnim, {
      toValue: 1.02,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate("QuestDetails", { quest: item });
    });
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
    >
      <Animated.View
        style={[styles.questItem, { transform: [{ scale: glowAnim }] }]}
      >
        <View style={styles.questLeft}>
          <Icon name="fire" type="font-awesome" color="#9EFFA9" size={20} />
        </View>
        <View style={styles.questCenter}>
          <Text style={styles.questTitle}>{item.name}</Text>
          <Text style={styles.questSub}>
            Lv. {item.mastery_lvl || 1} • {item.streak || 0}d streak
          </Text>
        </View>
        <View style={styles.questRight}>
          <Icon name="angle-right" type="font-awesome" color="#888" />
        </View>

        {/* 🟢 Progress bar inside quest card */}
        <View style={styles.progressContainer}>
          <LinearProgress
            value={progress}
            variant="determinate"
            color="#4CAF50"
            style={styles.progressBar}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0D0D0D",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 1.2,
    textShadowColor: "#4CAF50",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 18,
  },
  questItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: "#9EFFA9",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  questLeft: {
    marginRight: 12,
  },
  questCenter: {
    flex: 1,
  },
  questRight: {
    marginLeft: 10,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F5F5F5",
    textTransform: "capitalize",
  },
  questSub: {
    fontSize: 13,
    color: "#AAAAAA",
    marginTop: 4,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    marginTop: 20,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: "hidden",
  },

  progressBar: {
    height: 6,
    backgroundColor: "#2C2C2C",
  },
});
