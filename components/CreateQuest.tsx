import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function CreateQuest() {
  const [questName, setQuestName] = useState("");
  const [frequency, setFrequency] = useState("Daily"); // Default frequency
  const [loading, setLoading] = useState(false);
  const [borderAnim] = useState(new Animated.Value(0)); // Animated glowing border
  const navigation = useNavigation();

  async function addQuest() {
    if (!questName.trim()) {
      Alert.alert("Error", "Your quest must have a name!");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Error", "Unable to get current user");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("quests")
      .insert([{ name: questName, frequency, user_id: user.id }]); // ✅ Attach user_id

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setQuestName("");
      setLoading(false);
      navigation.goBack();
    }
  }

  // Handle input focus animations
  const handleFocus = () => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Quest</Text>
      <Text style={styles.subtitle}>
        Set your goal and embark on your journey!
      </Text>

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: borderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["#1E1E1E", "#4CAF50"], // Green glow effect
            }),
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Enter quest name..."
          placeholderTextColor="#888"
          value={questName}
          onChangeText={setQuestName}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>

      {/* Frequency Selection */}
      <View style={styles.frequencyContainer}>
        <Button
          title="Daily"
          buttonStyle={[
            styles.frequencyButton,
            frequency === "Daily" && styles.selectedFrequency,
          ]}
          titleStyle={[
            frequency === "Daily" ? styles.selectedText : styles.unselectedText,
          ]}
          onPress={() => setFrequency("Daily")}
        />
        <Button
          title="Weekly"
          disabled={true} // Still disabled for now
          buttonStyle={[styles.frequencyButton, styles.disabledButton]}
          titleStyle={styles.disabledText}
        />
        <Button
          title="Custom"
          disabled={true} // Still disabled for now
          buttonStyle={[styles.frequencyButton, styles.disabledButton]}
          titleStyle={styles.disabledText}
        />
      </View>

      <Button
        title={loading ? "Saving..." : "Start Quest"}
        buttonStyle={styles.saveButton}
        titleStyle={styles.buttonText}
        onPress={addQuest}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 30,
    textAlign: "center",
  },
  inputWrapper: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    borderWidth: 2,
  },
  input: {
    fontSize: 18,
    color: "#fff",
  },
  frequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    width: "100%",
  },
  frequencyButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  selectedFrequency: {
    backgroundColor: "#007AFF",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  unselectedText: {
    color: "#ccc",
  },
  disabledButton: {
    backgroundColor: "#222",
  },
  disabledText: {
    color: "#555",
  },
  saveButton: {
    backgroundColor: "#4CAF50", // Green success color
    borderRadius: 8,
    marginTop: 20,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
