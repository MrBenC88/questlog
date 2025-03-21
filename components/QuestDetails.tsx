import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { Button, Icon, LinearProgress } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QuestDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { quest } = route.params as { quest: any };
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getSecondsUntilMidnight());

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  // ⏳ Get seconds until midnight
  function getSecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }

  // ⏲ Format seconds into HH:MM:SS
  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // ⏳ Auto-countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return getSecondsUntilMidnight(); // Reset timer at midnight
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Load tasks from AsyncStorage first, then sync with Supabase
  async function loadTasks() {
    try {
      const cachedTasks = await AsyncStorage.getItem(`tasks-${quest.id}`);
      if (cachedTasks) {
        setTasks(JSON.parse(cachedTasks));
        updateProgress(JSON.parse(cachedTasks));
      }
      fetchTasks();
    } catch (error) {
      console.error("Failed to load tasks from cache", error);
    }
  }

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("quest_id", quest.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else {
      setTasks(data);
      updateProgress(data);
      await AsyncStorage.setItem(`tasks-${quest.id}`, JSON.stringify(data));
      setLoading(false);
    }
  }

  function updateProgress(taskList) {
    const completedTasks = taskList.filter((task) => task.completed).length;
    const totalTasks = taskList.length;
    setProgress(totalTasks > 0 ? completedTasks / totalTasks : 0);
  }

  async function toggleTaskCompletion(task) {
    const updatedCompleted = !task.completed;
    const { error } = await supabase
      .from("tasks")
      .update({ completed: updatedCompleted })
      .eq("id", task.id);

    if (error) {
      console.error(error);
    } else {
      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, completed: updatedCompleted } : t
      );
      setTasks(updatedTasks);
      updateProgress(updatedTasks);
      await AsyncStorage.setItem(
        `tasks-${quest.id}`,
        JSON.stringify(updatedTasks)
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quest.name}</Text>
      <Text style={styles.subtitle}>Task List ({quest.frequency})</Text>

      {/* ⏳ Countdown Timer */}
      <Text style={styles.timerText}>
        ⏳ Time left today:{" "}
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </Text>

      {/* Progress Bar */}
      <LinearProgress
        value={progress}
        color="#4CAF50"
        style={styles.progressBar}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem task={item} toggleTaskCompletion={toggleTaskCompletion} />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks yet. Add one!</Text>
          }
        />
      )}

      {/* Add Task Button */}
      <Button
        title="Add Task"
        buttonStyle={styles.addButton}
        onPress={() => navigation.navigate("CreateTask", { questId: quest.id })}
      />

      {/* Back Button */}
      <Button
        title="Back"
        buttonStyle={styles.backButton}
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

// ✅ Task Item Component with Clickable Checkmark
function TaskItem({ task, toggleTaskCompletion }) {
  return (
    <TouchableOpacity
      onPress={() => toggleTaskCompletion(task)}
      activeOpacity={0.8}
    >
      <View style={[styles.taskItem, task.completed && styles.completedTask]}>
        <Icon
          name={task.completed ? "check-circle" : "circle-o"}
          type="font-awesome"
          color={task.completed ? "#4CAF50" : "#ccc"}
          size={22}
          style={styles.taskIcon}
        />
        <Text
          style={[styles.taskText, task.completed && styles.completedTaskText]}
        >
          {task.name}
        </Text>
      </View>
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
    marginBottom: 10,
    textAlign: "center",
  },
  timerText: {
    fontSize: 14,
    color: "#BBB",
    textAlign: "center",
    marginBottom: 10,
  },
  timer: {
    color: "#FF5555",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    borderRadius: 10,
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  completedTask: {
    backgroundColor: "#2A2A2A",
  },
  taskIcon: {
    marginRight: 10,
  },
  taskText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  completedTaskText: {
    textDecorationLine: "line-through",
    color: "#888",
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
  backButton: {
    backgroundColor: "#555",
    borderRadius: 8,
    marginTop: 10,
  },
});
