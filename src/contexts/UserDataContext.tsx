import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_SCHEDULE } from '../lib/notifications';
import type { NotificationSchedule } from '../lib/notifications';

export interface UserProfile {
  name: string;
  weight: number;       // kg
  height: number;       // cm
  age: number;
  sex: 'M' | 'F';
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight: number;
  weeksDuration: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  dailyCalories: number;
  dailyWaterMl: number;
  notifications: NotificationSchedule;
}

export interface MealEntry {
  id: string;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  timestamp: number;
}

export interface DayData {
  date: string; // "YYYY-MM-DD"
  meals: MealEntry[];
  waterMl: number;
  weight?: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

interface UserDataContextType {
  profile: UserProfile | null;
  todayData: DayData;
  weightHistory: WeightEntry[];
  loading: boolean;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'timestamp'>) => Promise<void>;
  removeMealEntry: (entryId: string) => Promise<void>;
  setWater: (ml: number) => Promise<void>;
  addWeightEntry: (weight: number) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

const DEFAULT_PROFILE: UserProfile = {
  name: 'Usuário',
  weight: 75,
  height: 175,
  age: 25,
  sex: 'M',
  goal: 'lose',
  targetWeight: 70,
  weeksDuration: 8,
  activityLevel: 'moderate',
  dailyCalories: 1850,
  dailyWaterMl: 2500,
  notifications: DEFAULT_SCHEDULE,
};

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getLocalData(uid: string): { profile: UserProfile; days: Record<string, DayData>; weights: WeightEntry[] } {
  try {
    const raw = localStorage.getItem(`nutriai_data_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { profile: DEFAULT_PROFILE, days: {}, weights: [] };
}

function saveLocalData(uid: string, data: { profile: UserProfile; days: Record<string, DayData>; weights: WeightEntry[] }) {
  localStorage.setItem(`nutriai_data_${uid}`, JSON.stringify(data));
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [days, setDays] = useState<Record<string, DayData>>({});
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-load data when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setDays({});
      setWeightHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = getLocalData(user.uid);
    setProfile({ ...data.profile, name: user.displayName || data.profile.name });
    setDays(data.days || {});
    setWeightHistory(data.weights || []);
    setLoading(false);
  }, [user]);

  const persist = useCallback((p: UserProfile, d: Record<string, DayData>, w: WeightEntry[]) => {
    if (!user) return;
    saveLocalData(user.uid, { profile: p, days: d, weights: w });
  }, [user]);

  const saveProfile = async (updates: Partial<UserProfile>) => {
    const current = profile || DEFAULT_PROFILE;
    const next = { ...current, ...updates };
    setProfile(next);
    persist(next, days, weightHistory);
  };

  const addMealEntry = async (entry: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now();
    const newEntry: MealEntry = { ...entry, id, timestamp };

    const dateKey = todayKey();
    const currentDays = { ...days };
    if (!currentDays[dateKey]) {
      currentDays[dateKey] = { date: dateKey, meals: [], waterMl: 0 };
    }
    
    currentDays[dateKey] = {
      ...currentDays[dateKey],
      meals: [...currentDays[dateKey].meals, newEntry]
    };
    
    setDays(currentDays);
    persist(profile || DEFAULT_PROFILE, currentDays, weightHistory);
  };

  const removeMealEntry = async (entryId: string) => {
    const dateKey = todayKey();
    const currentDays = { ...days };
    if (currentDays[dateKey]) {
      currentDays[dateKey] = {
        ...currentDays[dateKey],
        meals: currentDays[dateKey].meals.filter(m => m.id !== entryId)
      };
      setDays(currentDays);
      persist(profile || DEFAULT_PROFILE, currentDays, weightHistory);
    }
  };

  const setWater = async (ml: number) => {
    const dateKey = todayKey();
    const currentDays = { ...days };
    if (!currentDays[dateKey]) {
      currentDays[dateKey] = { date: dateKey, meals: [], waterMl: ml };
    } else {
      currentDays[dateKey] = { ...currentDays[dateKey], waterMl: ml };
    }
    setDays(currentDays);
    persist(profile || DEFAULT_PROFILE, currentDays, weightHistory);
  };

  const addWeightEntry = async (weight: number) => {
    const dateKey = todayKey();
    const nextHist = [...weightHistory.filter(w => w.date !== dateKey), { date: dateKey, weight }]
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setWeightHistory(nextHist);
    await saveProfile({ weight }); // calls persist internally
  };

  const todayData: DayData = days[todayKey()] || { date: todayKey(), meals: [], waterMl: 0 };

  return (
    <UserDataContext.Provider value={{
      profile, todayData, weightHistory, loading,
      saveProfile, addMealEntry, removeMealEntry, setWater, addWeightEntry
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used within UserDataProvider');
  return context;
}
