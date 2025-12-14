import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { AnimalIconType } from '@/constants/animalIcons';

type AchievementStore = {
  achievements: { [key in AnimalIconType]: number };
  isHydrated: boolean;
  incrementAnimal: (type: AnimalIconType) => void;
  decrementAnimal: (type: AnimalIconType) => void;
  hydrate: () => Promise<void>;
};

const STORAGE_KEY = '@achievementStore/achievements';

const DEFAULT_ACHIEVEMENTS: { [key in AnimalIconType]: number } = {
  paw: 0,
  cat: 0,
  dog: 0,
  frog: 0,
  dragon: 0,
  'kiwi-bird': 0,
  horse: 0,
  fish: 0,
};

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  achievements: DEFAULT_ACHIEVEMENTS,
  isHydrated: false,

  incrementAnimal: (type) =>
    set((state) => {
      const newAchievements = {
        ...state.achievements,
        [type]: state.achievements[type] + 1,
      };

      // 永続化
      saveAchievements(newAchievements);

      return {
        achievements: newAchievements,
      };
    }),

  decrementAnimal: (type) =>
    set((state) => {
      const newAchievements = {
        ...state.achievements,
        [type]: Math.max(0, state.achievements[type] - 1),
      };

      // 永続化
      saveAchievements(newAchievements);

      return {
        achievements: newAchievements,
      };
    }),

  hydrate: async () => {
    try {
      const achievementsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const loadedAchievements = achievementsJson
        ? JSON.parse(achievementsJson)
        : DEFAULT_ACHIEVEMENTS;

      set({
        achievements: loadedAchievements,
        isHydrated: true,
      });
    } catch (error) {
      console.error('Failed to load achievements:', error);
      set({ isHydrated: true });
    }
  },
}));

// ヘルパー関数: 実績を保存
const saveAchievements = async (achievements: { [key in AnimalIconType]: number }) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
};
