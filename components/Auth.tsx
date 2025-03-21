import React, { useState } from "react";
import { Alert, StyleSheet, View, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input, Text } from "@rneui/themed";

// Automatically refresh session while app is active
import { AppState } from "react-native";
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lock In</Text>
      <Text style={styles.subtitle}>Sign in to level up your journey</Text>

      {/* 📧 Email Input */}
      <Input
        placeholder="email@address.com"
        placeholderTextColor="#AAA"
        leftIcon={{ type: "font-awesome", name: "envelope", color: "#888" }}
        onChangeText={(text) => setEmail(text)}
        value={email}
        autoCapitalize="none"
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputContainer}
      />

      {/* 🔒 Password Input */}
      <Input
        placeholder="Password"
        placeholderTextColor="#AAA"
        leftIcon={{ type: "font-awesome", name: "lock", color: "#888" }}
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
        autoCapitalize="none"
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputContainer}
      />

      {/* 🟢 Sign In Button */}
      <Button
        title={loading ? <ActivityIndicator color="white" /> : "Sign In"}
        disabled={loading}
        onPress={signInWithEmail}
        buttonStyle={styles.signInButton}
      />

      {/* ✨ Sign Up Button */}
      <Button
        title="Sign Up"
        disabled={loading}
        onPress={signUpWithEmail}
        buttonStyle={styles.signUpButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F8F8F8",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textShadowColor: "#FFD700",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 20,
    textAlign: "center",
  },
  inputText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    marginBottom: 12,
  },
  signInButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    width: "100%",
    marginTop: 20,
  },
  signUpButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: "100%",
    marginTop: 12,
  },
});
