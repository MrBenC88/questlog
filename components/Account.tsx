import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert } from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";

export default function Account({ session }: { session: Session }) {
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
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) throw error;
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
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;

      await supabase.auth.signOut();
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚔️ Your Profile</Text>
      <Text style={styles.sub}>Edit your stats before battle.</Text>

      <Input
        label="Email"
        value={session?.user?.email}
        disabled
        inputStyle={styles.inputText}
        labelStyle={styles.label}
      />

      <Input
        label="Username"
        value={username || ""}
        onChangeText={(text) => setUsername(text)}
        inputStyle={styles.inputText}
        labelStyle={styles.label}
      />

      <Input
        label="Website"
        value={website || ""}
        onChangeText={(text) => setWebsite(text)}
        inputStyle={styles.inputText}
        labelStyle={styles.label}
      />

      <Button
        title={loading ? "Loading ..." : "Update"}
        onPress={() =>
          updateProfile({ username, website, avatar_url: avatarUrl })
        }
        disabled={loading}
        buttonStyle={styles.updateButton}
      />

      <Button
        title="Sign Out"
        onPress={() => supabase.auth.signOut()}
        buttonStyle={styles.signOutButton}
      />
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
  updateButton: {
    backgroundColor: "#4CAF50",
    marginTop: 20,
    borderRadius: 10,
  },
  signOutButton: {
    backgroundColor: "#444",
    marginTop: 12,
    borderRadius: 10,
  },
});
