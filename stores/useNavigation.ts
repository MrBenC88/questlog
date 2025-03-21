import { create } from "zustand";

type Tab = "Quests" | "Explore" | "Profile";
type Subscreen =
  | "Main"
  | "QuestDetails"
  | "CreateQuest"
  | "CreateTask"
  | "EditProfile";

interface NavState {
  tab: Tab;
  subscreen: Subscreen;
  data?: any;
  setTab: (tab: Tab) => void;
  goToSubscreen: (screen: Subscreen, data?: any) => void;
  goBack: () => void;
}

// Add generic param storage to the store
export const useNavigation = create<NavState>((set) => ({
    tab: 'Quests',
    subscreen: 'Main',
    data: null,
    setTab: (tab) => set({ tab, subscreen: 'Main', data: null }),
    goToSubscreen: (subscreen, data = null) => set({ subscreen, data }),
    goBack: () => set((state) => ({
      subscreen: 'Main',
      data: null,
    })),
  }));