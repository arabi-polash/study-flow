import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type RepeatMode = 'once' | 'daily' | 'days';
export type ScheduleMode = 'duration' | 'time';

export type Subject = {
  id: string;
  name: string;
  color: string;
};

export type Plan = {
  id: string;
  title: string;
  subjectId?: string;
  /** Chapters / topics to cover in one session */
  topics: string[];
  /** 'duration' = spend X hours, 'time' = do it at a fixed time */
  mode: ScheduleMode;
  durationMin?: number;
  startMin?: number;
  endMin?: number;
  repeat: RepeatMode;
  /** Weekdays for repeat === 'days', 0 = Sunday */
  days: number[];
  /** Calendar day for repeat === 'once', e.g. 2026-10-25 */
  dateKey: string;
  /** dayKey -> finished */
  history: Record<string, boolean>;
  createdAt: number;
};

export type NewPlan = Omit<Plan, 'id' | 'createdAt' | 'history'>;

export type NotificationSettings = {
  dailyReminder: boolean;
  /** Minutes from midnight */
  dailyReminderAt: number;
  remindBeforeFixedTime: boolean;
  leadMinutes: number;
  weeklySummary: boolean;
};

export type Settings = {
  darkMode: boolean;
  /** Minutes of study per day, 0 = no goal */
  dailyGoalMin: number;
  /** Minutes of study per week, 0 = no goal */
  weeklyGoalMin: number;
  notifications: NotificationSettings;
};

const SUBJECT_COLORS = [
  '#4F46E5',
  '#0EA5E9',
  '#12A150',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#EF4444',
];

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  dailyGoalMin: 120,
  weeklyGoalMin: 0,
  notifications: {
    dailyReminder: false,
    dailyReminderAt: 18 * 60,
    remindBeforeFixedTime: false,
    leadMinutes: 15,
    weeklySummary: false,
  },
};

const PLANS_KEY = 'study-planner:plans:v1';
const SUBJECTS_KEY = 'study-planner:subjects:v1';
const SETTINGS_KEY = 'study-planner:settings:v1';

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (active && raw) setValue(JSON.parse(raw) as T);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}

type AppContextValue = {
  ready: boolean;
  plans: Plan[];
  subjects: Subject[];
  settings: Settings;
  addPlan: (input: NewPlan) => void;
  removePlan: (id: string) => void;
  toggleDone: (id: string, date: string) => void;
  addSubject: (name: string) => string;
  removeSubject: (id: string) => void;
  getSubject: (id?: string) => Subject | undefined;
  updateSettings: (patch: Partial<Settings>) => void;
  updateNotifications: (patch: Partial<NotificationSettings>) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [storedPlans, setPlans, plansReady] = usePersistentState<Plan[]>(PLANS_KEY, []);
  const [subjects, setSubjects, subjectsReady] = usePersistentState<Subject[]>(SUBJECTS_KEY, []);
  const [storedSettings, setStoredSettings, settingsReady] = usePersistentState<Settings>(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
  );
  const ready = plansReady && subjectsReady && settingsReady;

  const plans = useMemo(
    () =>
      (Array.isArray(storedPlans) ? storedPlans : []).map((plan) => ({
        ...plan,
        title: plan?.title || 'Untitled Task',
        topics: Array.isArray(plan?.topics) ? plan.topics : [],
        history: plan?.history || {},
      })),
    [storedPlans],
  );

  const settings = useMemo<Settings>(
    () => ({
      ...DEFAULT_SETTINGS,
      ...storedSettings,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...storedSettings.notifications },
    }),
    [storedSettings],
  );

  const addPlan = useCallback(
    (input: NewPlan) => {
      setPlans((prev) => [...prev, { ...input, id: newId(), createdAt: Date.now(), history: {} }]);
    },
    [setPlans],
  );

  const removePlan = useCallback(
    (id: string) => {
      setPlans((prev) => prev.filter((plan) => plan.id !== id));
    },
    [setPlans],
  );

  const toggleDone = useCallback(
    (id: string, date: string) => {
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.id !== id) return plan;
          const history = { ...plan.history };
          if (history[date]) delete history[date];
          else history[date] = true;
          return { ...plan, history };
        }),
      );
    },
    [setPlans],
  );

  const addSubject = useCallback(
    (name: string) => {
      const id = newId();
      setSubjects((prev) => [
        ...prev,
        { id, name, color: SUBJECT_COLORS[prev.length % SUBJECT_COLORS.length] },
      ]);
      return id;
    },
    [setSubjects],
  );

  const removeSubject = useCallback(
    (id: string) => {
      setSubjects((prev) => prev.filter((subject) => subject.id !== id));
    },
    [setSubjects],
  );

  const getSubject = useCallback(
    (id?: string) => (id ? subjects.find((subject) => subject.id === id) : undefined),
    [subjects],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setStoredSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch }));
    },
    [setStoredSettings],
  );

  const updateNotifications = useCallback(
    (patch: Partial<NotificationSettings>) => {
      setStoredSettings((prev) => ({
        ...DEFAULT_SETTINGS,
        ...prev,
        notifications: {
          ...DEFAULT_SETTINGS.notifications,
          ...prev.notifications,
          ...patch,
        },
      }));
    },
    [setStoredSettings],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      plans,
      subjects,
      settings,
      addPlan,
      removePlan,
      toggleDone,
      addSubject,
      removeSubject,
      getSubject,
      updateSettings,
      updateNotifications,
    }),
    [
      ready,
      plans,
      subjects,
      settings,
      addPlan,
      removePlan,
      toggleDone,
      addSubject,
      removeSubject,
      getSubject,
      updateSettings,
      updateNotifications,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
