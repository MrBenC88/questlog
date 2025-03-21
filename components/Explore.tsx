import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Icon } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";

export default function Explore() {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // Tracks which presets are expanded

  useFocusEffect(
    useCallback(() => {
      fetchPresets();
    }, [])
  );

  async function fetchPresets() {
    setLoading(true);
    const { data, error } = await supabase
      .from("preset_quests")
      .select("*, preset_tasks(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch presets", error);
    } else {
      setPresets(data);
    }
    setLoading(false);
  }

  function toggleExpand(presetId) {
    setExpanded((prev) => ({ ...prev, [presetId]: !prev[presetId] }));
  }

  async function handleAddPreset(preset) {
    const user = supabase.auth.getUser();
    const { data: userData } = await user;

    if (!userData?.user) {
      Alert.alert("You must be signed in to add quests.");
      return;
    }

    const { data: insertedQuest, error: questError } = await supabase
      .from("quests")
      .insert([
        {
          name: preset.name,
          frequency: preset.frequency || "Daily",
          user_id: userData.user.id,
          mastery_lvl: 1,
          mastery_xp: 0,
        },
      ])
      .select()
      .single();

    if (questError) {
      console.error("Failed to insert quest", questError);
      return;
    }

    const newTasks = (preset.preset_tasks || []).map((task) => ({
      name: task.name,
      quest_id: insertedQuest.id,
      user_id: userData.user.id,
      completed: false,
    }));

    const { error: taskError } = await supabase.from("tasks").insert(newTasks);

    if (taskError) {
      console.error("Failed to insert tasks", taskError);
    } else {
      Alert.alert("Success", `Added quest "${preset.name}" to your list.`);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Quests</Text>
      <Text style={styles.subtitle}>
        Choose a preset to begin your journey.
      </Text>

      <FlatList
        data={presets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.questCard}>
            <Text style={styles.questName}>{item.name}</Text>
            <Text style={styles.taskCount}>
              🗡 {item.preset_tasks?.length || 0} Tasks
            </Text>

            {/* Show Details Button */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => toggleExpand(item.id)}
            >
              <Text style={styles.detailsButtonText}>
                {expanded[item.id] ? "Hide Details" : "Show Details"}
              </Text>
            </TouchableOpacity>

            {/* Expandable Task List */}
            {expanded[item.id] && (
              <View style={styles.taskList}>
                {item.preset_tasks.map((task, index) => (
                  <Text key={index} style={styles.taskItem}>
                    • {task.name}
                  </Text>
                ))}
              </View>
            )}

            {/* Add Button */}
            <Button
              title="ADD"
              buttonStyle={styles.addButton}
              onPress={() => handleAddPreset(item)}
              icon={
                <Icon name="plus" type="font-awesome" color="#fff" size={14} />
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D0D0D",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#F8F8F8",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  questCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#9EFFA9",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  questName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  taskCount: {
    fontSize: 13,
    color: "#CCCCCC",
    marginBottom: 10,
  },
  detailsButton: {
    backgroundColor: "#333",
    padding: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  detailsButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  taskList: {
    backgroundColor: "#292929",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  taskItem: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
