import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation } from "../stores/useNavigation";
import { useEffect, useRef } from "react";

export default function TabBar() {
  const { tab, setTab } = useNavigation();

  const tabs: { name: string; key: typeof tab }[] = [
    { name: "Quests", key: "Quests" },
    { name: "Explore", key: "Explore" },
    { name: "Profile", key: "Profile" },
  ];

  const underlineAnim = useRef(new Animated.Value(0)).current;

  const tabIndex = tabs.findIndex((t) => t.key === tab);

  useEffect(() => {
    Animated.timing(underlineAnim, {
      toValue: tabIndex,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [tabIndex]);

  return (
    <View style={styles.container}>
      {tabs.map(({ name, key }, index) => (
        <TouchableOpacity
          key={key}
          onPress={() => setTab(key)}
          style={styles.tabButton}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === key && styles.activeText]}>
            {name}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Animated underline */}
      <Animated.View
        style={[
          styles.underline,
          {
            left: underlineAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: ["8%", "41%", "74%"], // Adjust based on layout
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#0B0B0B",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  activeText: {
    color: "#9EFFA9",
  },
  underline: {
    position: "absolute",
    bottom: 4,
    width: "18%",
    height: 3,
    backgroundColor: "#9EFFA9",
    borderRadius: 2,
  },
});
