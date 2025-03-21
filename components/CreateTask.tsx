import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "@rneui/themed";
import { useNavigation } from "../stores/useNavigation";
import { supabase } from "../lib/supabase";

export default function CreateTask({ questId }: { questId: string }) {
  const { goBack } = useNavigation();
  const [taskName, setTaskName] = useState("");

  async function addTask() {
    if (!taskName.trim()) {
      Alert.alert("Error", "Task name cannot be empty.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Error", "Unable to get current user.");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .insert([{ name: taskName, quest_id: questId, user_id: user.id }]); // ✅ Add user_id

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      goBack(); // Return to QuestDetails page
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter task name..."
        placeholderTextColor="#888"
        value={taskName}
        onChangeText={setTaskName}
      />

      <Button
        title="Save Task"
        buttonStyle={styles.saveButton}
        onPress={addTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
});
