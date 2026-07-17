export interface UserProfile {
  age: number;
  gender: string;
  goals: string;
  fitnessLevel: string;
  experience: string;
  equipment: string[];
  duration: number;
  frequency: number;
  calorieTarget: number;
  waterTarget: number; // in ml
}

export interface Exercise {
  name: string;
  sets: number;
  repsOrDuration: string;
  rest: string;
  intensity?: string;
  completed?: boolean;
}

export interface DayRoutine {
  dayNumber: number;
  focus: string;
  warmUp: string[];
  exercises: Exercise[];
  coolDown: string[];
  completed?: boolean;
}

export interface WorkoutPlan {
  planName: string;
  summary: string;
  routines: DayRoutine[];
}

export interface Meal {
  id: string;
  timestamp: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  breakdown: string[];
  tip?: string;
}

export interface HeartRatePoint {
  time: string;
  bpm: number;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "workout" | "nutrition" | "streak" | "general" | "wearable";
  read: boolean;
}
