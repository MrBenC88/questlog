import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert } from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";

export default function EditProfile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, website, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };
      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    Alert.alert(
      "Are you sure?",
      "This will permanently delete your account and all your data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const userId = session.user.id;

              // Step 1: Delete tasks
              await supabase.from("tasks").delete().eq("user_id", userId);

              // Step 2: Delete quests
              await supabase.from("quests").delete().eq("user_id", userId);

              // Step 3: Delete profile
              await supabase.from("profiles").delete().eq("id", userId);

              // Step 4: Delete the user from auth (admin only)
              const { error: deleteUserError } =
                await supabase.auth.admin.deleteUser(userId);
              if (deleteUserError) throw deleteUserError;

              // Step 5: Sign out
              await supabase.auth.signOut();
            } catch (err: any) {
              Alert.alert("Failed to delete account", err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚔️ Update User</Text>
      <Text style={styles.sub}>Modify user details.</Text>

      <Input
        label="Email"
        value={session.user.email}
        disabled
        inputStyle={styles.inputText}
        labelStyle={styles.label}
      />

      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        inputStyle={styles.inputText}
        labelStyle={styles.label}
      />

      <Input
        label="Website"
        value={website}
        onChangeText={setWebsite}
        inputStyle={styles.inputText}
        labelStyle={styles.label}
      />

      <Button
        title={loading ? "Loading..." : "Save Changes"}
        onPress={() =>
          updateProfile({ username, website, avatar_url: avatarUrl })
        }
        disabled={loading}
        buttonStyle={styles.saveButton}
      />
      {/* 
      <Button
        title="Delete Account"
        onPress={deleteAccount}
        buttonStyle={styles.deleteButton}
        disabled={loading}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    color: "#F8F8F8",
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 1.1,
    textShadowColor: "#4CAF50",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sub: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  label: {
    color: "#AAA",
    fontSize: 13,
  },
  inputText: {
    color: "#F5F5F5",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    marginTop: 20,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    marginTop: 14,
    borderRadius: 10,
  },
});
