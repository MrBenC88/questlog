import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import Quest from "./components/Quest";
import QuestDetails from "./components/QuestDetails";
import CreateQuest from "./components/CreateQuest";
import CreateTask from "./components/CreateTask";
import { Session } from "@supabase/supabase-js";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Icon } from "@rneui/themed";

// ✅ Define type-safe route list for QuestStack
export type QuestStackParamList = {
  QuestList: undefined;
  QuestDetails: { quest: any };
  CreateTask: { questId: string };
  CreateQuest: undefined;
};

// ✅ Apply it to your stack navigator
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<QuestStackParamList>();

function QuestStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="QuestList"
        component={Quest}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuestDetails"
        component={QuestDetails}
        options={{ title: "Quest Details" }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTask}
        options={{ title: "New Task" }}
      />
      <Stack.Screen
        name="CreateQuest"
        component={CreateQuest}
        options={{ title: "New Quest" }}
      />
    </Stack.Navigator>
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: "#121212" },
            tabBarActiveTintColor: "#fff",
          }}
        >
          <Tab.Screen
            name="Quest"
            component={QuestStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon
                  name="book"
                  type="font-awesome"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Account"
            children={() => <Account session={session} />}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon
                  name="user"
                  type="font-awesome"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        </Tab.Navigator>
      ) : (
        <Auth />
      )}
    </NavigationContainer>
  );
}
