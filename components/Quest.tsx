import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Quest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Quests</Text>
      <Text style={styles.subtitle}>Track your daily progress here!</Text>
      {/* Add quest list later */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 10,
  },
});
