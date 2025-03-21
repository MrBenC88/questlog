import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
  const [questMastery, setQuestMastery] = useState({ level: 1, xp: 0 });
  const [questMeta, setQuestMeta] = useState({
    streak: 0,
    failed_at: null,
    due_date: null,
    frequency: quest.frequency,
  });

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  function getSecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? getSecondsUntilMidnight() : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadTasks() {
    try {
      const cachedTasks = await AsyncStorage.getItem(`tasks-${quest.id}`);
      if (cachedTasks) {
        const parsed = JSON.parse(cachedTasks);
        setTasks(parsed);
        updateProgress(parsed);
      }

      const lastCheck = await AsyncStorage.getItem(
        `last_check_date-${quest.id}`
      );
      const today = new Date().toISOString().split("T")[0];

      if (lastCheck !== today) {
        await updateQuestStreakIfNeeded();
        await AsyncStorage.setItem(`last_check_date-${quest.id}`, today);
      }

      fetchTasks();
    } catch (error) {
      console.error("Cache error", error);
    }
  }

  async function fetchTasks() {
    const { data: questData, error: questError } = await supabase
      .from("quests")
      .select(
        "id, name, streak, mastery_lvl, mastery_xp, last_completed_at, failed_at, due_date, frequency"
      )
      .eq("id", quest.id)
      .single();

    if (questError) {
      console.error("Quest fetch error:", questError);
      return;
    }

    const { data: tasksData, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("quest_id", quest.id)
      .order("created_at", { ascending: false });

    if (!taskError) {
      setTasks(tasksData);
      updateProgress(tasksData);
      await AsyncStorage.setItem(
        `tasks-${quest.id}`,
        JSON.stringify(tasksData)
      );
    }

    setQuestMastery({
      level: questData.mastery_lvl || 1,
      xp: questData.mastery_xp || 0,
    });

    setQuestMeta({
      streak: questData.streak || 0,
      failed_at: questData.failed_at,
      due_date: questData.due_date,
      frequency: questData.frequency,
    });

    setLoading(false);
  }

  function getNextDueDate(today: string, frequency: string): string {
    const date = new Date(today);
    if (frequency === "Daily") date.setDate(date.getDate() + 1);
    else if (frequency === "Weekly") date.setDate(date.getDate() + 7);
    else if (frequency.includes("Custom-")) {
      const days = parseInt(frequency.split("-")[1], 10);
      date.setDate(date.getDate() + days);
    }
    return date.toISOString().split("T")[0];
  }

  function updateProgress(taskList) {
    const completed = taskList.filter((t) => t.completed).length;
    setProgress(taskList.length > 0 ? completed / taskList.length : 0);
  }

  async function updateQuestStreakIfNeeded() {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("quests")
      .select(
        "streak, last_completed_at, mastery_xp, mastery_lvl, failed_at, frequency, due_date"
      )
      .eq("id", quest.id)
      .single();

    if (error) {
      console.error("Streak fetch failed", error);
      return;
    }

    const lastCompleted = data.last_completed_at?.split("T")[0];
    const due = data.due_date?.split("T")[0] || today;

    let streak = data.streak;
    let failed = data.failed_at;

    if (today > due) {
      if (lastCompleted !== due) {
        streak = 0;
        failed = today;
      } else {
        streak += 1;
      }
    }

    const xpGain = 50;
    let xp = data.mastery_xp + xpGain;
    let lvl = data.mastery_lvl;
    const threshold = lvl * 100;
    if (xp >= threshold) lvl += 1;

    const nextDue = getNextDueDate(today, data.frequency);

    await supabase
      .from("quests")
      .update({
        streak,
        failed_at: failed,
        last_completed_at: today,
        mastery_xp: xp,
        mastery_lvl: lvl,
        due_date: nextDue,
      })
      .eq("id", quest.id);
  }

  async function toggleTaskCompletion(task) {
    const updated = !task.completed;
    const { error } = await supabase
      .from("tasks")
      .update({ completed: updated })
      .eq("id", task.id);

    if (!error) {
      const newTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, completed: updated } : t
      );
      setTasks(newTasks);
      updateProgress(newTasks);
      await AsyncStorage.setItem(`tasks-${quest.id}`, JSON.stringify(newTasks));

      const allComplete = newTasks.length && newTasks.every((t) => t.completed);
      if (allComplete) await updateQuestStreakIfNeeded();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quest.name}</Text>
      <Text style={styles.subtitle}>Task List ({questMeta.frequency})</Text>

      <Text style={styles.timerText}>
        ⏳ Time left today:{" "}
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </Text>

      <LinearProgress
        value={progress}
        color="#4CAF50"
        style={styles.progressBar}
      />

      <Text style={styles.failure}>
        {questMeta.failed_at ? `❌ Last Failed: ${questMeta.failed_at}` : ""}
      </Text>
      <Text style={styles.dueDate}>
        📅 Next Due: {questMeta.due_date || "Not Set"}
      </Text>

      <Text style={styles.streak}>
        🔥 Streak: {questMeta.streak} day{questMeta.streak === 1 ? "" : "s"}
      </Text>

      <Text style={styles.mastery}>
        🏆 Mastery Level: {questMastery.level} | XP: {questMastery.xp}
      </Text>

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

      <Button
        title="Add Task"
        buttonStyle={styles.addButton}
        onPress={() => navigation.navigate("CreateTask", { questId: quest.id })}
      />
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
  streak: {
    fontSize: 16,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  mastery: {
    fontSize: 16,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  failure: {
    fontSize: 14,
    color: "#FF5555",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  dueDate: {
    fontSize: 14,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
  },
});
