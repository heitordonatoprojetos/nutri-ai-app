import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  doc, getDoc, setDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
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

  const uid = user?.uid || 'guest';

  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    if (isFirebaseConfigured && db && uid !== 'guest') {
      try {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setProfile(data.profile || DEFAULT_PROFILE);
          setDays(data.days || {});
          setWeightHistory(data.weights || []);
        } else {
          setProfile(DEFAULT_PROFILE);
        }
      } catch (e) {
        console.error('Firestore error, falling back to local:', e);
        const local = getLocalData(uid);
        setProfile(local.profile);
        setDays(local.days);
        setWeightHistory(local.weights);
      }
    } else {
      const local = getLocalData(uid);
      setProfile(local.profile);
      setDays(local.days);
      setWeightHistory(local.weights);
    }

    setLoading(false);
  }, [user, uid]);

  useEffect(() => { loadData(); }, [loadData]);

  const persist = useCallback(async (newProfile: UserProfile, newDays: Record<string, DayData>, newWeights: WeightEntry[]) => {
    const data = { profile: newProfile, days: newDays, weights: newWeights };
    saveLocalData(uid, data);

    if (isFirebaseConfigured && db && uid !== 'guest') {
      try {
        await setDoc(doc(db, 'users', uid), data, { merge: true });
      } catch (e) {
        console.error('Failed to sync to Firestore:', e);
      }
    }
  }, [uid]);

  const saveProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const newProfile = { ...(profile || DEFAULT_PROFILE), ...updates };
    setProfile(newProfile);
    await persist(newProfile, days, weightHistory);
  }, [profile, days, weightHistory, persist]);

  const addMealEntry = useCallback(async (entry: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const today = todayKey();
    const newEntry: MealEntry = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
    const newDays = {
      ...days,
      [today]: {
        date: today,
        waterMl: days[today]?.waterMl || 0,
        meals: [...(days[today]?.meals || []), newEntry],
      },
    };
    setDays(newDays);
    await persist(profile || DEFAULT_PROFILE, newDays, weightHistory);
  }, [days, profile, weightHistory, persist]);

  const removeMealEntry = useCallback(async (entryId: string) => {
    const today = todayKey();
    const newDays = {
      ...days,
      [today]: {
        ...days[today],
        date: today,
        waterMl: days[today]?.waterMl || 0,
        meals: (days[today]?.meals || []).filter(m => m.id !== entryId),
      },
    };
    setDays(newDays);
    await persist(profile || DEFAULT_PROFILE, newDays, weightHistory);
  }, [days, profile, weightHistory, persist]);

  const setWater = useCallback(async (ml: number) => {
    const today = todayKey();
    const newDays = {
      ...days,
      [today]: {
        ...days[today],
        date: today,
        meals: days[today]?.meals || [],
        waterMl: Math.max(0, ml),
      },
    };
    setDays(newDays);
    await persist(profile || DEFAULT_PROFILE, newDays, weightHistory);
  }, [days, profile, weightHistory, persist]);

  const addWeightEntry = useCallback(async (weight: number) => {
    const today = todayKey();
    const newEntry: WeightEntry = { date: today, weight };
    const newWeights = [...weightHistory.filter(w => w.date !== today), newEntry].sort((a, b) => a.date.localeCompare(b.date));
    setWeightHistory(newWeights);
    const newProfile = { ...(profile || DEFAULT_PROFILE), weight };
    setProfile(newProfile);
    await persist(newProfile, days, newWeights);
  }, [weightHistory, profile, days, persist]);

  const today = todayKey();
  const todayData: DayData = days[today] || { date: today, meals: [], waterMl: 0 };

  return (
    <UserDataContext.Provider value={{
      profile,
      todayData,
      weightHistory,
      loading,
      saveProfile,
      addMealEntry,
      removeMealEntry,
      setWater,
      addWeightEntry,
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
