import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Icon, LinearProgress } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { questDetailStyles as styles } from "../constants";
import { useNavigation } from "../stores/useNavigation";

export default function QuestDetails({ quest }: { quest: any }) {
  const { goToSubscreen, goBack } = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getSecondsUntilMidnight());
  const [questMastery, setQuestMastery] = useState({ level: 1, xp: 0 });
  const [questMeta, setQuestMeta] = useState<{
    streak: number;
    failed_at: string | null;
    due_date: string | null;
    frequency: any;
    last_completed_at: string | null;
  }>({
    streak: 0,
    failed_at: null,
    due_date: null,
    frequency: quest.frequency,
    last_completed_at: null,
  });

  const [submittedToday, setSubmittedToday] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: questData, error: questError } = await supabase
      .from("quests")
      .select(
        "id, name, streak, mastery_lvl, mastery_xp, last_completed_at, failed_at, due_date, frequency"
      )
      .eq("id", quest.id)
      .eq("user_id", user.id)
      .single();

    if (questError) {
      console.error("Quest fetch error:", questError);
      return;
    }

    const { data: tasksData, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("quest_id", quest.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!taskError) {
      setTasks(tasksData);
      updateProgress(tasksData);
      await AsyncStorage.setItem(
        `tasks-${quest.id}`,
        JSON.stringify(tasksData)
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const lastCompleted = questData.last_completed_at?.split("T")[0];
    setSubmittedToday(lastCompleted === today);

    setQuestMastery({
      level: questData.mastery_lvl || 1,
      xp: questData.mastery_xp || 0,
    });

    setQuestMeta({
      streak: questData.streak || 0,
      failed_at: questData.failed_at,
      due_date: questData.due_date,
      frequency: questData.frequency,
      last_completed_at: questData.last_completed_at,
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

  function getXpThreshold(level: number) {
    return Math.ceil(level * 10 * 1.2);
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
    let threshold = getXpThreshold(lvl);

    while (xp >= threshold) {
      xp -= threshold;
      lvl += 1;
      threshold = getXpThreshold(lvl);
    }

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

  async function handleSubmitQuest() {
    const today = new Date().toISOString().split("T")[0];
    const lastCompleted = questMeta.last_completed_at?.split("T")[0] || "";

    const due = questMeta.due_date?.split("T")[0] || today;

    const missed = lastCompleted && today > due && lastCompleted !== due;
    let newStreak = missed ? 0 : questMeta.streak + 1;

    const xpGain = 50;
    let newXP = questMastery.xp + xpGain;
    let newLevel = questMastery.level;
    let threshold = getXpThreshold(newLevel);

    while (newXP >= threshold) {
      newXP -= threshold;
      newLevel += 1;
      threshold = getXpThreshold(newLevel);
    }

    const nextDue = getNextDueDate(today, questMeta.frequency);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ✅ 1. Update quest-specific XP
    const { error: questError } = await supabase
      .from("quests")
      .update({
        streak: newStreak,
        failed_at: missed ? today : null,
        last_completed_at: today,
        mastery_xp: newXP,
        mastery_lvl: newLevel,
        due_date: nextDue,
      })
      .eq("id", quest.id);

    if (questError) {
      console.error("Submit quest failed", questError);
      return;
    }

    // ✅ 2. Fetch current profile XP + level
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Failed to fetch profile XP:", profileError);
    } else {
      let totalXP = (profileData.xp || 0) + xpGain;
      let totalLvl = profileData.level || 1;
      let profileThreshold = getXpThreshold(totalLvl);

      while (totalXP >= profileThreshold) {
        totalXP -= profileThreshold;
        totalLvl += 1;
        profileThreshold = getXpThreshold(totalLvl);
      }

      // ✅ 3. Update profile XP + level
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          xp: totalXP,
          level: totalLvl,
        })
        .eq("id", user.id);

      if (updateProfileError) {
        console.error("Failed to update profile XP:", updateProfileError);
      }
    }

    // ✅ 4. Update local UI state
    setQuestMeta((prev) => ({
      ...prev,
      streak: newStreak,
      failed_at: missed ? today : null,
      last_completed_at: today,
      due_date: nextDue,
    }));
    setQuestMastery({ xp: newXP, level: newLevel });
    setSubmittedToday(true);
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
    }
  }

  const allTasksComplete = tasks.length > 0 && tasks.every((t) => t.completed);
  const masteryProgress = questMastery.xp / getXpThreshold(questMastery.level);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quest.name}</Text>
      <Text style={styles.subtitle}>Task List ({questMeta.frequency})</Text>

      <Text style={styles.timerText}>
        ⏳ Time left: <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </Text>

      <LinearProgress
        value={progress}
        color="#4CAF50"
        style={styles.progressBar}
      />

      <Text style={styles.streak}>
        Streak: {questMeta.streak} day{questMeta.streak === 1 ? "" : "s"} |
        Mastery Level: {questMastery.level} | XP: {questMastery.xp} /{" "}
        {getXpThreshold(questMastery.level)}
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
        title="Submit Quest"
        disabled={!allTasksComplete}
        buttonStyle={styles.submitButton}
        onPress={handleSubmitQuest}
      />
      <Button
        title="Add Task"
        buttonStyle={styles.addButton}
        onPress={() => goToSubscreen("CreateTask", quest.id)}
      />
      <Button title="Back" buttonStyle={styles.backButton} onPress={goBack} />
    </View>
  );
}

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
