import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, LinearProgress } from "@rneui/themed";
import { supabase } from "../lib/supabase";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function Profile({ session }) {
  const [profile, setProfile] = useState<any>(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  async function fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error.message);
    } else {
      setProfile(data);
    }
  }

  function calculateXPToNextLevel(level) {
    return Math.floor(level * 10 * 1.2);
  }

  function getProgress(currentXP, level) {
    const requiredXP = calculateXPToNextLevel(level);
    return Math.min(currentXP / requiredXP, 1);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading profile...</Text>
      </View>
    );
  }

  const currentLevel = profile.mastery_lvl || 1;
  const currentXP = profile.mastery_xp || 0;
  const xpToNextLevel = calculateXPToNextLevel(currentLevel);
  const xpProgress = getProgress(currentXP, currentLevel);

  return (
    <View style={styles.container}>
      {/* 🔥 Username Display */}
      <Text style={styles.header}>{profile.username || "Challenger"}</Text>

      {/* 🔥 Level Display */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Lv. {currentLevel}</Text>
      </View>

      {/* ⚡ XP Progress Bar */}
      <View style={styles.progressWrapper}>
        <Text style={styles.subText}>
          ⚡ XP: {currentXP} / {xpToNextLevel}
        </Text>
        <LinearProgress
          value={xpProgress}
          color="#4CAF50"
          style={styles.progressBar}
        />
      </View>

      {/* 🏆 Mastery Progress Bar */}
      <View style={styles.progressWrapper}>
        <Text style={styles.subText}>
          🏆 Mastery XP: {profile.mastery_xp || 0}
        </Text>
        <LinearProgress
          value={getProgress(profile.mastery_xp, profile.mastery_lvl)}
          color="#FFC107"
          style={styles.progressBar}
        />
      </View>

      {/* 🔥 Streak */}
      <Text style={styles.streakText}>
        🔥 Streak: {profile.streak || 0} days
      </Text>

      {/* 📜 Edit Profile Button */}
      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate("EditProfile")}
        buttonStyle={styles.editButton}
      />

      {/* 🚪 Logout Button */}
      <Button
        title="Logout"
        onPress={handleLogout}
        buttonStyle={styles.logoutButton}
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
    alignItems: "center",
  },
  header: {
    fontSize: 32,
    color: "#F8F8F8",
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textShadowColor: "#FFD700",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  levelContainer: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 5,
  },
  levelText: {
    fontSize: 36,
    color: "#FFD700",
    fontWeight: "bold",
    letterSpacing: 1.6,
  },
  subText: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    marginBottom: 6,
  },
  streakText: {
    fontSize: 16,
    color: "#FFA500",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  progressWrapper: {
    width: "100%",
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    width: "80%",
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    width: "80%",
  },
  loading: {
    fontSize: 18,
    color: "#BBB",
  },
});
