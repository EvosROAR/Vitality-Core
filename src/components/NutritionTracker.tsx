import React, { useState } from "react";
import { Coffee, Flame, Droplet, Plus, Trash2, Search, Brain, HelpCircle, Check, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Meal } from "../types";

interface NutritionTrackerProps {
  meals: Meal[];
  onAddMeal: (meal: Omit<Meal, "id" | "timestamp">) => void;
  onDeleteMeal: (id: string) => void;
  calorieTarget: number;
  waterTarget: number; // in ml
  waterIntake: number; // in ml
  onUpdateWaterIntake: (amount: number) => void;
  onNotificationTrigger: (title: string, message: string, category: "nutrition") => void;
}

export default function NutritionTracker({
  meals,
  onAddMeal,
  onDeleteMeal,
  calorieTarget,
  waterTarget,
  waterIntake,
  onUpdateWaterIntake,
  onNotificationTrigger,
}: NutritionTrackerProps) {
  const [mealInput, setMealInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate daily totals
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

  // Percentage calculations
  const calPercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));
  const waterPercent = Math.min(100, Math.round((waterIntake / waterTarget) * 100));

  const handleAIAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealInput.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealDescription: mealInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze meal. Please check your network or API key.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add the analyzed meal
      onAddMeal({
        mealName: data.mealName,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        breakdown: data.breakdown || [],
        tip: data.tip,
      });

      onNotificationTrigger(
        "Meal Logged with AI 🍳",
        `Estimated ${data.calories} kcal added for "${data.mealName}"!`,
        "nutrition"
      );

      setMealInput("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickLogWater = (amount: number) => {
    onUpdateWaterIntake(amount);
    if (waterIntake + amount >= waterTarget && waterIntake < waterTarget) {
      onNotificationTrigger(
        "Hydration Target Met! 💧",
        "Excellent job! You reached your daily hydration goal of " + (waterTarget / 1000) + "L.",
        "nutrition"
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="nutrition-tracker-container">
      {/* Logging & Water Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* AI Food Logger */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight font-display">
              <Brain className="h-5 w-5 text-indigo-400" />
              AI Nutrition Scanner
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Type naturally what you ate. Our AI estimates ingredients, macros, and gives custom advice.
            </p>
          </div>

          <form onSubmit={handleAIAnalyze} className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={mealInput}
                onChange={(e) => setMealInput(e.target.value)}
                placeholder="e.g., Two scrambled eggs, half an avocado, and a cup of black coffee..."
                rows={3}
                disabled={isAnalyzing}
                className="w-full px-4 py-3 bg-slate-950 hover:bg-slate-950 focus:bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-indigo-500/50 text-sm rounded-xl focus:ring-0 outline-hidden transition-all resize-none disabled:opacity-50"
                id="ai-food-input"
              />
              <Sparkles className="absolute right-3 bottom-3 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>

            {error && (
              <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 font-mono">
                {error}
              </span>
            )}

            <button
              type="submit"
              disabled={isAnalyzing || !mealInput.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:cursor-not-allowed text-sm font-display shadow-lg shadow-indigo-600/10 border border-indigo-500/30"
              id="ai-food-submit-btn"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Analyzing Meal Nutrition...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 text-indigo-200" />
                  Analyze with Gemini AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Water Tracker */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight font-display">
                <Droplet className="h-5 w-5 text-blue-400" />
                Hydration Monitor
              </h2>
              <p className="text-xs text-slate-400 mt-1">Track and meet your fluid goals.</p>
            </div>
            <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
              {waterIntake} / {waterTarget} ml
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-2">
            {/* Water progress bar */}
            <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden relative border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${waterPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-blue-500 h-full rounded-full"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => quickLogWater(250)}
                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl border border-blue-500/20 flex items-center gap-1 transition-all text-xs cursor-pointer"
                id="add-water-250-btn"
              >
                <Plus className="h-3 w-3" /> 250ml
              </button>
              <button
                onClick={() => quickLogWater(500)}
                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl border border-blue-500/20 flex items-center gap-1 transition-all text-xs cursor-pointer"
                id="add-water-500-btn"
              >
                <Plus className="h-3 w-3" /> 500ml
              </button>
              <button
                onClick={() => onUpdateWaterIntake(-Math.min(waterIntake, 250))}
                className="px-2.5 py-1.5 hover:bg-slate-900 text-slate-500 hover:text-slate-300 rounded-xl transition-all text-xs cursor-pointer"
                id="sub-water-250-btn"
              >
                Reset (-250)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress & Meal List Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Progress Gauges */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-5">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-display">
            <Flame className="h-4 w-4 text-orange-400" />
            Daily Calories Meter
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-xs text-slate-400 font-semibold font-mono">
              <span>{totalCalories} kcal consumed</span>
              <span>Target: {calorieTarget} kcal</span>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden relative border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  totalCalories > calorieTarget ? "bg-rose-500" : "bg-orange-500"
                }`}
              />
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-800/80 text-center">
            <div className="bg-emerald-500/5 border border-emerald-500/25 p-2.5 rounded-xl">
              <span className="block text-[9px] font-bold text-slate-500 tracking-wider uppercase font-mono">PROTEIN</span>
              <span className="text-sm font-black text-emerald-400 font-mono">{totalProtein}g</span>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/25 p-2.5 rounded-xl">
              <span className="block text-[9px] font-bold text-slate-500 tracking-wider uppercase font-mono">CARBS</span>
              <span className="text-sm font-black text-amber-400 font-mono">{totalCarbs}g</span>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/25 p-2.5 rounded-xl">
              <span className="block text-[9px] font-bold text-slate-500 tracking-wider uppercase font-mono">FATS</span>
              <span className="text-sm font-black text-purple-400 font-mono">{totalFats}g</span>
            </div>
          </div>
        </div>

        {/* Meal Logs List */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-display">
              <Coffee className="h-4 w-4 text-slate-400" />
              Meal Log Book
            </h3>
            <span className="text-xs text-slate-400 font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850">Today</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1" id="meal-logs-list">
            <AnimatePresence initial={false}>
              {meals.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl font-mono">
                  No meals logged yet. Start typing above!
                </div>
              ) : (
                meals.map((meal) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col gap-2 relative group hover:border-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between pr-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 leading-tight">{meal.mealName}</h4>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                          {new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-400 shrink-0 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {meal.calories} kcal
                      </span>
                    </div>

                    {/* Macro badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold font-mono">
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">P: {meal.protein}g</span>
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">C: {meal.carbs}g</span>
                      <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">F: {meal.fats}g</span>
                    </div>

                    {/* Breakdown list */}
                    {meal.breakdown.length > 0 && (
                      <ul className="text-[11px] text-slate-400 list-disc pl-4 border-t border-slate-800/80 pt-1.5">
                        {meal.breakdown.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}

                    {/* Advice card */}
                    {meal.tip && (
                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 rounded-lg flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-400 mt-0.5" />
                        <span>{meal.tip}</span>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteMeal(meal.id)}
                      className="absolute right-2 top-2.5 p-1 text-slate-600 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete meal log"
                      id={`delete-meal-${meal.id}-btn`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
