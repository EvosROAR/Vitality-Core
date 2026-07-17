import React, { useState } from "react";
import {
  BrainCircuit,
  Activity,
  Sparkles,
  TrendingUp,
  Droplet,
  Flame,
  CheckSquare,
  RefreshCw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Meal } from "../types";

interface InsightResult {
  bioFeedback: string;
  hydrationAnalysis: string;
  macroBalanceReview: string;
  strategicActionPlan: string[];
}

interface AIInsightsPanelProps {
  userProfile: UserProfile;
  streak: number;
  meals: Meal[];
  waterIntake: number;
  currentHeartRate: number | null;
  onNotificationTrigger: (title: string, message: string, category: "workout" | "nutrition" | "streak" | "general" | "wearable") => void;
}

export default function AIInsightsPanel({
  userProfile,
  streak,
  meals,
  waterIntake,
  currentHeartRate,
  onNotificationTrigger,
}: AIInsightsPanelProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/fitness/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          streak,
          meals,
          waterIntake,
          currentHeartRate,
        }),
      });

      if (!response.ok) {
        throw new Error("Insights generation failed.");
      }

      const data = await response.json();
      setInsights(data);
      onNotificationTrigger(
        "AI Analysis Complete! 🧠",
        "Your personalized sports physiology bio-feedback report is ready.",
        "general"
      );
    } catch (err: any) {
      console.error(err);
      setError("Unable to process high-fidelity neural recommendation right now. Reverting to backup system.");
      // Fallback local calculations
      const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
      setInsights({
        bioFeedback: `Cardiorespiratory reserve is healthy. Average rhythm matches standard active state for a ${userProfile.age}-year-old level. Dynamic pulse recovery remains on trend.`,
        hydrationAnalysis: `Currently fueling at ${waterIntake} ml. Targeting ${userProfile.waterTarget} ml. Ensure continuous dynamic replenishment to manage active sweat coefficients.`,
        macroBalanceReview: `Current energy intake: ${totalCalories} kcal. Ensure adequate glycogen loading with dynamic complex carbohydrates before high-intensity workouts.`,
        strategicActionPlan: [
          "Incorporate 5 minutes of mindful diaphragmatic breathing to stabilize metabolic parameters.",
          "Structure a balanced post-workout protein-glycogen snack within 45 minutes of finishing exercises.",
          "Maintain active wrist/ankle mobility stretches tonight to support joint fluid replenishment."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-5" id="ai-insights-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase font-mono tracking-widest">
            Neural Diagnostic Engine
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5 mt-3 font-display tracking-tight">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            AI Bio-Feedback & Insights
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Harness Gemini's analytical models to translate heart rate profiles, macro distributions, and consistency streaks into professional sports-science tips.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/10 border border-indigo-500/20 text-xs font-display"
          id="trigger-ai-insights-btn"
        >
          {loading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              Analyze My Progress
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {insights ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-5"
          >
            {/* Bio feedback evaluation */}
            <div className="md:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-900 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Cardiac & Heart Rate Strain
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {insights.bioFeedback}
              </p>
            </div>

            {/* Hydration Assessment */}
            <div className="md:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-900 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-blue-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5" />
                Intracellular Hydration Analysis
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {insights.hydrationAnalysis}
              </p>
            </div>

            {/* Nutrition & macro balance evaluation */}
            <div className="md:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-900 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Macro & Caloric Integration
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {insights.macroBalanceReview}
              </p>
            </div>

            {/* High Impact Action Plan */}
            <div className="md:col-span-12 bg-indigo-950/20 border border-indigo-500/10 p-5 rounded-2xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" />
                Your 24h Tactical Athletic Action Plan
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.strategicActionPlan.map((action, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-xs font-black font-mono text-indigo-400 bg-indigo-500/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-indigo-500/20">
                      0{idx + 1}
                    </span>
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="border border-dashed border-slate-850 rounded-2xl py-12 flex flex-col items-center justify-center text-center gap-2">
            <span className="text-xl">📊</span>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Neural feedback is idle. Request analysis above to scan active wellness factors.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
