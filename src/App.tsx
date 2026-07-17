import React, { useState, useEffect } from "react";
import {
  Activity,
  Dumbbell,
  Coffee,
  Bell,
  Sparkles,
  Flame,
  Droplet,
  Heart,
  TrendingUp,
  HeartHandshake,
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  Users,
  Share2,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { UserProfile, WorkoutPlan, Meal, PushNotification } from "./types";
import WorkoutGenerator from "./components/WorkoutGenerator";
import NutritionTracker from "./components/NutritionTracker";
import WearableSync from "./components/WearableSync";
import NotificationCenter from "./components/NotificationCenter";
import SocialShareHub from "./components/SocialShareHub";
import AIInsightsPanel from "./components/AIInsightsPanel";
import ProfileAuth from "./components/ProfileAuth";

const INITIAL_PROFILE: UserProfile = {
  age: 28,
  gender: "Determined Athlete",
  goals: "Build muscular endurance and establish healthy nutrition habits",
  fitnessLevel: "Intermediate",
  experience: "Some training experience",
  equipment: ["Bodyweight", "Dumbbells", "Resistance Bands"],
  duration: 45,
  frequency: 3,
  calorieTarget: 2200,
  waterTarget: 2500,
};

const DEFAULT_PLAN: WorkoutPlan = {
  planName: "Active Vitality Launch Plan",
  summary: "A carefully structured baseline conditioning program designed by AI to build muscular endurance, joint stability, and aerobic health.",
  routines: [
    {
      dayNumber: 1,
      focus: "Full-Body Metabolic Conditioning",
      warmUp: [
        "3 mins jumping jacks",
        "Arm circles & shoulder rolls",
        "Dynamic bodyweight squats"
      ],
      exercises: [
        { name: "Goblet Squats (or Bodyweight)", sets: 3, repsOrDuration: "12 reps", rest: "60s", intensity: "Moderate", completed: false },
        { name: "Dumbbell Floor Press (or Push-Ups)", sets: 3, repsOrDuration: "10 reps", rest: "60s", intensity: "Moderate", completed: false },
        { name: "Single-Arm Dumbbell Rows", sets: 3, repsOrDuration: "12 reps per side", rest: "60s", intensity: "Moderate", completed: false },
        { name: "Plank Hold", sets: 3, repsOrDuration: "45 seconds", rest: "45s", intensity: "High", completed: false }
      ],
      coolDown: [
        "Seated hamstring stretch (30s)",
        "Overhead tricep stretch (30s each)",
        "Deep breathing (1 min)"
      ]
    },
    {
      dayNumber: 2,
      focus: "Core Stability & Heart Rate Flush",
      warmUp: [
        "5 mins light walking/jogging in place",
        "Cat-cow spine mobility stretch"
      ],
      exercises: [
        { name: "Mountain Climbers", sets: 3, repsOrDuration: "45 seconds", rest: "45s", intensity: "High", completed: false },
        { name: "Glute Bridges", sets: 3, repsOrDuration: "15 reps", rest: "45s", intensity: "Moderate", completed: false },
        { name: "Bicycle Crunches", sets: 3, repsOrDuration: "15 reps per side", rest: "45s", intensity: "Moderate", completed: false },
        { name: "Jumping Jacks (Fast Pace)", sets: 3, repsOrDuration: "30 seconds", rest: "45s", intensity: "High", completed: false }
      ],
      coolDown: [
        "Child's pose relaxation (1 min)",
        "Cobra stretch for abdominals (30s)"
      ]
    },
    {
      dayNumber: 3,
      focus: "Posterior Chain Power & Flexibility",
      warmUp: [
        "Dynamic leg swings",
        "Hip openers"
      ],
      exercises: [
        { name: "Dumbbell Romanian Deadlifts", sets: 3, repsOrDuration: "12 reps", rest: "60s", intensity: "Moderate", completed: false },
        { name: "Bodyweight Lunges", sets: 3, repsOrDuration: "10 reps per leg", rest: "60s", intensity: "Moderate", completed: false },
        { name: "Bird-Dog Core Press", sets: 3, repsOrDuration: "10 reps per side", rest: "45s", intensity: "Low", completed: false },
        { name: "Supermans (Lower Back)", sets: 3, repsOrDuration: "15 reps", rest: "45s", intensity: "Moderate", completed: false }
      ],
      coolDown: [
        "Standing quad stretch (30s each)",
        "Spinal twist stretch (30s each)"
      ]
    }
  ]
};

const INITIAL_MEALS: Meal[] = [
  {
    id: "meal-1",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    mealName: "Nutritious Power Breakfast",
    calories: 450,
    protein: 28,
    carbs: 45,
    fats: 14,
    breakdown: ["1 cup Greek yogurt", "1 scoop Whey Protein", "1/2 cup fresh Blueberries", "1 tbsp Almond Butter"],
    tip: "A perfect macronutrient balance! High protein in the morning sustains metabolic rate and prevents muscle breakdown."
  }
];

const INITIAL_ALERTS: PushNotification[] = [
  {
    id: "alert-1",
    title: "Welcome to AI Studio Fitness! 🎉",
    message: "Sync your wearable device, request AI workout routines, and type your meals naturally for smart calorie logging.",
    timestamp: new Date().toISOString(),
    category: "general",
    read: false,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "workout" | "nutrition" | "wearable" | "notifications" | "social" | "profile">("dashboard");

  // Local storage synchronized states
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem("fit_profile");
    return cached ? JSON.parse(cached) : INITIAL_PROFILE;
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>(() => {
    const cached = localStorage.getItem("fit_workout_plan");
    return cached ? JSON.parse(cached) : DEFAULT_PLAN;
  });

  const [meals, setMeals] = useState<Meal[]>(() => {
    const cached = localStorage.getItem("fit_meals");
    return cached ? JSON.parse(cached) : INITIAL_MEALS;
  });

  const [waterIntake, setWaterIntake] = useState<number>(() => {
    const cached = localStorage.getItem("fit_water");
    return cached ? parseInt(cached) : 500;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const cached = localStorage.getItem("fit_alerts");
    return cached ? JSON.parse(cached) : INITIAL_ALERTS;
  });

  const [streak, setStreak] = useState<number>(() => {
    const cached = localStorage.getItem("fit_streak");
    return cached ? parseInt(cached) : 2;
  });

  const [userXp, setUserXp] = useState<number>(() => {
    const cached = localStorage.getItem("vitality_core_user_xp");
    return cached ? parseInt(cached) : 2150;
  });

  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  // Synchronize state with Local Storage
  useEffect(() => {
    localStorage.setItem("vitality_core_user_xp", userXp.toString());
  }, [userXp]);

  useEffect(() => {
    localStorage.setItem("fit_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("fit_workout_plan", JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem("fit_meals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("fit_water", waterIntake.toString());
  }, [waterIntake]);

  useEffect(() => {
    localStorage.setItem("fit_alerts", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("fit_streak", streak.toString());
  }, [streak]);

  // Dispatch general local notification helper
  const addNotification = (title: string, message: string, category: PushNotification["category"]) => {
    const newAlert: PushNotification = {
      id: `alert-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      category,
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  const handleAddMeal = (mealData: Omit<Meal, "id" | "timestamp">) => {
    const newMeal: Meal = {
      ...mealData,
      id: `meal-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setMeals((prev) => [newMeal, ...prev]);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateWaterIntake = (amount: number) => {
    setWaterIntake((prev) => Math.max(0, prev + amount));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllAlerts = () => {
    setNotifications([]);
  };

  // Helper dashboard metrics calculations
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  // Active workout stats
  const activeRoutine = workoutPlan.routines[0]; // Day 1
  const completedExCount = workoutPlan.routines.reduce(
    (acc, r) => acc + r.exercises.filter((e) => e.completed).length,
    0
  );
  const totalExCount = workoutPlan.routines.reduce((acc, r) => acc + r.exercises.length, 0);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col md:flex-row" id="app-root-container">
      {/* Side Rail Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/40 backdrop-blur-md text-slate-200 flex flex-col justify-between shrink-0 border-r border-slate-900" id="sidebar-nav">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center border border-indigo-400/30 shadow-indigo-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase leading-none font-display">
                VITALITY<span className="text-indigo-500">CORE</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase font-mono mt-1 block">
                COMPANION
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="mt-8 flex flex-col gap-2">
            {[
              { id: "dashboard", label: "Dashboard Hub", icon: LayoutDashboard },
              { id: "workout", label: "AI Workout Plan", icon: Dumbbell },
              { id: "nutrition", label: "AI Nutrition Log", icon: Coffee },
              { id: "wearable", label: "Wearable & Pulse", icon: Heart },
              { id: "social", label: "Social Hub", icon: Users },
              { id: "notifications", label: "Alert Inbox", icon: Bell, badge: unreadAlertsCount },
              { id: "profile", label: "Athlete Account", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-4 py-3 text-sm font-semibold rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] font-mono rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Wearable summary bubble inside sidebar */}
        <div className="p-6 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Heart className={`h-5 w-5 text-rose-500 ${currentHeartRate ? "animate-pulse" : ""}`} />
              </div>
              {currentHeartRate && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping" />
              )}
            </div>
            <div>
              <span className="text-[10px] text-rose-400 font-bold tracking-wider font-mono block">LIVE PULSE RATE</span>
              <span className="text-xs text-slate-300 font-mono font-bold leading-tight block">
                {currentHeartRate ? `${currentHeartRate} BPM` : "Offline Sync"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen bg-slate-950" id="main-content-area">
        {/* Top Header Row */}
        <header className="px-6 py-4 bg-slate-950 border-b border-slate-900 flex flex-wrap justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-indigo-400 uppercase tracking-widest font-mono bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
              ACTIVE
            </span>
            <span className="text-slate-800">|</span>
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Streak: <strong className="text-slate-200 font-mono">{streak} Days Active</strong>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold font-mono flex items-center gap-1">
            UTC: {new Date().toISOString().substring(11, 16)} | AI Personal Trainer Live
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
                id="dashboard-view"
              >
                {/* Greeting banner (styled with gradient mesh/bento inspiration) */}
                <div className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-200 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-indigo-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="relative z-10 flex flex-col gap-1.5 md:max-w-xl">
                    <div className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-bold font-mono tracking-widest text-indigo-300 rounded-full w-max flex items-center gap-1.5 uppercase">
                      <Sparkles className="h-3 w-3 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
                      Adaptive Fitness Profile Active
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-none mt-1 text-white font-display">
                      Welcome back, Athlete!
                    </h2>
                    <p className="text-sm text-indigo-300/90 leading-relaxed mt-1">
                      Your current goal is <strong className="text-white">"{userProfile.goals}"</strong>. Start tracking with your wearables, check off today's routines, or query Gemini to analyze your nutrition!
                    </p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="mt-3 w-fit px-3.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-xs font-bold text-indigo-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95 duration-200"
                      id="edit-profile-trigger-btn"
                    >
                      <HeartHandshake className="h-3.5 w-3.5" />
                      Configure Targets & Profile
                    </button>
                  </div>

                  {/* Onboarding stat widgets */}
                  <div className="flex flex-col gap-3 relative z-10 shrink-0">
                    <div className="flex gap-4">
                      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center min-w-[90px]">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">STREAK</span>
                        <span className="text-2xl font-black text-white font-mono mt-1">{streak}d</span>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center min-w-[110px]">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">COMPLETE</span>
                        <span className="text-2xl font-black text-white font-mono mt-1">
                          {totalExCount > 0 ? Math.round((completedExCount / totalExCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("social")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border border-indigo-400/30 shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-display"
                      id="dashboard-share-stats-btn"
                    >
                      <Share2 className="h-3.5 w-3.5 text-indigo-100" />
                      Share Achievements
                    </button>
                  </div>

                  {/* Decorative background ambient lighting */}
                  <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Dashboard Stats Bento Grid (3-columns layout) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Calorie Card */}
                  <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-5 transition-all duration-300 hover:border-slate-700/80">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center border border-orange-500/20">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono block">NUTRITION TARGET</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">Calories Balance</h4>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline font-mono">
                        <span className="text-4xl font-extrabold text-white tracking-tight">{totalCalories}</span>
                        <span className="text-xs text-slate-400 font-bold">/ {userProfile.calorieTarget} kcal</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 relative border border-slate-800">
                        <div
                          style={{ width: `${Math.min(100, (totalCalories / userProfile.calorieTarget) * 100)}%` }}
                          className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Water Card */}
                  <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-5 transition-all duration-300 hover:border-slate-700/80">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                          <Droplet className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono block">FLUID INTAKE</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">Hydration Progress</h4>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline font-mono">
                        <span className="text-4xl font-extrabold text-white tracking-tight">{waterIntake}</span>
                        <span className="text-xs text-slate-400 font-bold">/ {userProfile.waterTarget} ml</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 relative border border-slate-800">
                        <div
                          style={{ width: `${Math.min(100, (waterIntake / userProfile.waterTarget) * 100)}%` }}
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Heart rate monitor quick-widget */}
                  <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/20">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono block">BIOMETRIC FEEDBACK</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">Wearable Pulse</h4>
                        </div>
                      </div>
                      {currentHeartRate && (
                        <div className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-rose-500/20 animate-pulse">
                          LIVE
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-between">
                      {currentHeartRate ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-rose-500 font-mono tracking-tight animate-pulse">{currentHeartRate}</span>
                          <span className="text-xs font-mono font-bold text-rose-400 uppercase">BPM</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 font-semibold font-mono">Offline</span>
                      )}

                      <button
                        onClick={() => setActiveTab("wearable")}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase font-mono rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/15"
                        id="widget-sync-wearable-btn"
                      >
                        {currentHeartRate ? "Graph" : "Sync BLE"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid Split: Next Workout & Recent Meal Breakdowns (Bento Rows) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Next Training Routine Preview */}
                  <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 transition-all duration-300 hover:border-slate-700/80">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">PLANNER SCHEDULE</span>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                          <Dumbbell className="h-4 w-4 text-indigo-400" />
                          Next Workout routine
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab("workout")}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 transition-colors"
                        id="widget-workout-detail-btn"
                      >
                        Open Planner <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">TODAY'S TARGET FOCUS</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{activeRoutine?.focus || "Rest Day Focus"}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-1 rounded-xl shrink-0">
                        Day 1
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Routine Preview</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeRoutine?.exercises.slice(0, 4).map((ex, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between text-xs transition-all hover:bg-slate-950/60"
                          >
                            <span className="font-semibold text-slate-300 truncate max-w-[130px]">{ex.name}</span>
                            <span className="text-[10px] font-mono font-bold text-indigo-400 shrink-0 bg-indigo-500/10 px-2 py-0.5 rounded-md">{ex.sets}x {ex.repsOrDuration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Meal logs preview */}
                  <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 transition-all duration-300 hover:border-slate-700/80">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">DIET SUMMARY</span>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                          <Coffee className="h-4 w-4 text-emerald-400" />
                          Today's Meal logs
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab("nutrition")}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition-colors"
                        id="widget-nutrition-detail-btn"
                      >
                        Log Food <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[220px]">
                      {meals.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl my-auto font-mono">
                          No nutrition logged today. Try typing your meals!
                        </div>
                      ) : (
                        meals.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center text-xs transition-all hover:bg-slate-950/60"
                          >
                            <div>
                              <h4 className="font-bold text-slate-200">{m.mealName}</h4>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                Protein: {m.protein}g | Carbs: {m.carbs}g | Fat: {m.fats}g
                              </span>
                            </div>
                            <span className="font-mono font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{m.calories} kcal</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Bio-Feedback Insight Panel */}
                <div className="mt-6">
                  <AIInsightsPanel
                    userProfile={userProfile}
                    streak={streak}
                    meals={meals}
                    waterIntake={waterIntake}
                    currentHeartRate={currentHeartRate}
                    onNotificationTrigger={addNotification}
                  />
                </div>

                {/* Floating Heart Rate Sync reminder if offline */}
                {!currentHeartRate && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/20 text-rose-200 text-xs rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/25 shrink-0">
                        <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                      </div>
                      <span>
                        <strong className="text-rose-300">Wearable Device Disconnected:</strong> Connect a smart fitness wearable via Web Bluetooth to track cardiovascular strain live during routines.
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("wearable")}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold rounded-xl shrink-0 cursor-pointer text-[10px] uppercase font-mono border border-rose-500/30 transition-all duration-200"
                      id="widget-pair-wearable-action-btn"
                    >
                      Connect BLE
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "workout" && (
              <motion.div
                key="workout"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <WorkoutGenerator
                  workoutPlan={workoutPlan}
                  userProfile={userProfile}
                  onUpdateProfile={(profile) => setUserProfile((prev) => ({ ...prev, ...profile }))}
                  onUpdateWorkoutPlan={setWorkoutPlan}
                  onIncrementStreak={() => setStreak((prev) => prev + 1)}
                  onNotificationTrigger={addNotification}
                  currentHeartRate={currentHeartRate}
                />
              </motion.div>
            )}

            {activeTab === "nutrition" && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <NutritionTracker
                  meals={meals}
                  onAddMeal={handleAddMeal}
                  onDeleteMeal={handleDeleteMeal}
                  calorieTarget={userProfile.calorieTarget}
                  waterTarget={userProfile.waterTarget}
                  waterIntake={waterIntake}
                  onUpdateWaterIntake={handleUpdateWaterIntake}
                  onNotificationTrigger={addNotification}
                />
              </motion.div>
            )}

            {activeTab === "wearable" && (
              <motion.div
                key="wearable"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <WearableSync
                  onHeartRateUpdate={setCurrentHeartRate}
                  onNotificationTrigger={addNotification}
                />
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <SocialShareHub
                  workoutPlan={workoutPlan}
                  userProfile={userProfile}
                  streak={streak}
                  meals={meals}
                  waterIntake={waterIntake}
                  currentHeartRate={currentHeartRate}
                  onNotificationTrigger={addNotification}
                  userXp={userXp}
                  setUserXp={setUserXp}
                />
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <NotificationCenter
                  notifications={notifications}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                  onClearAll={handleClearAllAlerts}
                  onAddNotification={addNotification}
                  streak={streak}
                  recentWorkoutName={activeRoutine?.focus || "None"}
                />
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <ProfileAuth
                  currentProfile={userProfile}
                  onProfileUpdate={setUserProfile}
                  userXp={userXp}
                  setUserXp={setUserXp}
                  streak={streak}
                  setStreak={setStreak}
                  onNotificationTrigger={addNotification}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Elegant Profile Customization Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="profile-editor-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 z-10 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">ATHLETE SETTINGS</span>
                  <h3 className="text-lg font-black text-white mt-0.5 font-display flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-400" />
                    Target Metrics & Profile
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-mono font-bold"
                  id="close-profile-modal-btn"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Name/Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Athlete Age</label>
                    <input
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 28 }))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 text-slate-100 text-sm rounded-xl outline-hidden font-semibold"
                      id="edit-profile-age-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Athlete Gender / Title</label>
                    <input
                      type="text"
                      value={userProfile.gender}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value }))}
                      placeholder="e.g. Determined Athlete"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 text-slate-100 text-sm rounded-xl outline-hidden font-semibold"
                      id="edit-profile-gender-input"
                    />
                  </div>
                </div>

                {/* Health Goals */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Primary Fitness & Health Goals</label>
                  <textarea
                    rows={2}
                    value={userProfile.goals}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="e.g. Build aerobic power, increase leg strength..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 text-slate-100 text-sm rounded-xl outline-hidden font-semibold resize-none"
                    id="edit-profile-goals-input"
                  />
                </div>

                {/* Sliders for Targets */}
                <div className="flex flex-col gap-4 bg-slate-950 p-4 border border-slate-900 rounded-2xl">
                  {/* Calorie Target Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" /> Calorie Target
                      </span>
                      <span className="font-mono font-black text-slate-200">{userProfile.calorieTarget} kcal / day</span>
                    </div>
                    <input
                      type="range"
                      min="1200"
                      max="5000"
                      step="50"
                      value={userProfile.calorieTarget}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, calorieTarget: parseInt(e.target.value) }))}
                      className="w-full accent-orange-500 cursor-ew-resize bg-slate-800 h-1.5 rounded-lg font-bold"
                      id="edit-profile-calorie-slider"
                    />
                  </div>

                  {/* Water Target Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Droplet className="h-3.5 w-3.5" /> Fluid Water Target
                      </span>
                      <span className="font-mono font-black text-slate-200">{userProfile.waterTarget} ml / day</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="6000"
                      step="100"
                      value={userProfile.waterTarget}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, waterTarget: parseInt(e.target.value) }))}
                      className="w-full accent-blue-500 cursor-ew-resize bg-slate-800 h-1.5 rounded-lg font-bold"
                      id="edit-profile-water-slider"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-800 pt-4 mt-1">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-950 border border-slate-900 hover:bg-slate-900 rounded-xl cursor-pointer transition-colors"
                  id="cancel-profile-btn"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    addNotification(
                      "Profile Settings Saved! ⚙️",
                      `Targets adjusted: ${userProfile.calorieTarget} kcal, ${userProfile.waterTarget} ml fluid daily intake.`,
                      "general"
                    );
                  }}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer transition-colors"
                  id="save-profile-btn"
                >
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
