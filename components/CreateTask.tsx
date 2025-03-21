import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function CreateTask() {
  const [taskName, setTaskName] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { questId } = route.params as { questId: string };

  async function addTask() {
    if (!taskName.trim()) {
      Alert.alert("Error", "Task name cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .insert([{ name: taskName, quest_id: questId }]);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      navigation.goBack(); // Return to QuestDetails page
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
