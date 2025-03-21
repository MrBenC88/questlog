import { View } from "react-native";
import { useNavigation } from "./stores/useNavigation";
import Quest from "./components/Quest";
import QuestDetails from "./components/QuestDetails";
import CreateTask from "./components/CreateTask";
import CreateQuest from "./components/CreateQuest";
import Explore from "./components/Explore";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import TabBar from "./components/TabBar";
import { Session } from "@supabase/supabase-js";

export default function AppRouter({ session }: { session: Session }) {
  const { tab, subscreen, data } = useNavigation();

  const renderScreen = () => {
    if (tab === "Quests") {
      switch (subscreen) {
        case "Main":
          return <Quest />;
        case "QuestDetails":
          return <QuestDetails quest={data} />;
        case "CreateTask":
          return <CreateTask questId={data} />;
        case "CreateQuest":
          return <CreateQuest />;
      }
    }

    if (tab === "Explore") return <Explore />;

    if (tab === "Profile") {
      return subscreen === "Main" ? (
        <Profile session={session} />
      ) : (
        <EditProfile session={session} />
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <TabBar />
    </View>
  );
}
