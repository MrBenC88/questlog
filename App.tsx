import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import Quest from "./components/Quest";
import { Session } from "@supabase/supabase-js";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Icon } from "@rneui/themed";

const Tab = createBottomTabNavigator();

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

  // Show loading indicator while checking session state
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
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen
            name="Quest"
            component={Quest}
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
