import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Quest from "./components/Quest";
import QuestDetails from "./components/QuestDetails";
import CreateQuest from "./components/CreateQuest";
import CreateTask from "./components/CreateTask";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Explore from "./components/Explore";
import { Session } from "@supabase/supabase-js";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Icon } from "@rneui/themed";

// ✅ Define stack route types
export type QuestStackParamList = {
  QuestList: undefined;
  QuestDetails: { quest: any };
  CreateTask: { questId: string };
  CreateQuest: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined; // 🟢 renamed from "Profile"
  EditProfile: undefined;
};

const Tab = createBottomTabNavigator();
const QuestStackNav = createNativeStackNavigator<QuestStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function QuestStack() {
  return (
    <QuestStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#fff",
      }}
    >
      <QuestStackNav.Screen
        name="QuestList"
        component={Quest}
        options={{ headerShown: false }}
      />
      <QuestStackNav.Screen
        name="QuestDetails"
        component={QuestDetails}
        options={{ title: "Quest Details" }}
      />
      <QuestStackNav.Screen
        name="CreateTask"
        component={CreateTask}
        options={{ title: "New Task" }}
      />
      <QuestStackNav.Screen
        name="CreateQuest"
        component={CreateQuest}
        options={{ title: "New Quest" }}
      />
    </QuestStackNav.Navigator>
  );
}

function ProfileStack({ session }: { session: Session }) {
  return (
    <ProfileStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#fff",
      }}
    >
      <ProfileStackNav.Screen
        name="ProfileHome" // ✅ renamed
        children={() => <Profile session={session} />}
        options={{ title: "Profile" }} // User-facing title remains "Profile"
      />
      <ProfileStackNav.Screen
        name="EditProfile"
        children={() => <EditProfile session={session} />}
        options={{ title: "Edit Profile" }}
      />
    </ProfileStackNav.Navigator>
  );
}

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

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#0B0B0B",
              borderTopWidth: 0,
              height: 50,
              paddingBottom: 2,
              paddingTop: 2,
            },
            tabBarActiveTintColor: "#9EFFA9",
            tabBarInactiveTintColor: "#888",
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1.2,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = "";
              let iconType = "material-community";

              if (route.name === "Quests") {
                iconName = "sword-cross"; // ⚔️
              } else if (route.name === "Explore") {
                iconName = "map-search"; // 🗺️
              } else if (route.name === "Profile") {
                iconName = "account-supervisor-outline"; // 🤠 (or 'account-supervisor' for clean look)
              }

              return (
                <Icon
                  name={iconName}
                  type={iconType}
                  color={focused ? "#9EFFA9" : color}
                  size={focused ? size + 6 : size}
                  style={{
                    textShadowColor: focused ? "#9EFFA9" : "transparent",
                    textShadowRadius: focused ? 8 : 0,
                    textShadowOffset: { width: 0, height: 0 },
                  }}
                />
              );
            },
          })}
        >
          <Tab.Screen name="Quests" component={QuestStack} />
          <Tab.Screen name="Explore" component={Explore} />
          <Tab.Screen
            name="Profile"
            children={() => <ProfileStack session={session} />}
          />
        </Tab.Navigator>
      ) : (
        <Auth />
      )}
    </NavigationContainer>
  );
}
