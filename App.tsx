import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase"; 
import { Session } from "@supabase/supabase-js";
import Auth from "./components/Auth";
import Quest from "./components/Quest";
import QuestDetails from "./components/QuestDetails";
import CreateQuest from "./components/CreateQuest";
import CreateTask from "./components/CreateTask";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Explore from "./components/Explore";
import {
  ActivityIndicator,
  View,
  Text,
  Button,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "./stores/useNavigation";
import AppRouter from "./AppRouter";

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!session) return <Auth />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0B" }}>
      <AppRouter session={session} />
    </SafeAreaView>
  );
}
