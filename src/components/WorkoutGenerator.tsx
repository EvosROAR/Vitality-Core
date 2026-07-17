import React, { useState } from "react";
import { Dumbbell, Sparkles, RefreshCw, Trophy, CheckSquare, Square, Target, Calendar, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WorkoutPlan, UserProfile, DayRoutine, Exercise } from "../types";
import ActivePaceTimer from "./ActivePaceTimer";

interface WorkoutGeneratorProps {
  workoutPlan: WorkoutPlan;
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onUpdateWorkoutPlan: (plan: WorkoutPlan) => void;
  onIncrementStreak: () => void;
  onNotificationTrigger: (title: string, message: string, category: "workout") => void;
  currentHeartRate: number | null;
}

export default function WorkoutGenerator({
  workoutPlan,
  userProfile,
  onUpdateProfile,
  onUpdateWorkoutPlan,
  onIncrementStreak,
  onNotificationTrigger,
  currentHeartRate,
}: WorkoutGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const fitnessLevels = ["Beginner", "Intermediate", "Advanced"];
  const equipmentOptions = ["Bodyweight", "Dumbbells", "Kettlebells", "Resistance Bands", "Barbell & Plates", "Pull-up Bar"];
  const durationOptions = [20, 30, 45, 60, 90];
  const frequencyOptions = [2, 3, 4, 5, 6];

  const handleEquipmentToggle = (item: string) => {
    const isPresent = userProfile.equipment.includes(item);
    const updated = isPresent
      ? userProfile.equipment.filter((e) => e !== item)
      : [...userProfile.equipment, item];
    onUpdateProfile({ equipment: updated });
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/workouts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        throw new Error("Failed to generate custom workouts. Please check your network or API key.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onUpdateWorkoutPlan(data);
      setSelectedDayIdx(0);

      onNotificationTrigger(
        "Workout Plan Ready! 🔥",
        `Enjoy your brand new custom: ${data.planName}!`,
        "workout"
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during AI plan generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleExerciseComplete = (dayIdx: number, exIdx: number) => {
    const updatedRoutines = workoutPlan.routines.map((routine, dIdx) => {
      if (dIdx !== dayIdx) return routine;

      const updatedExercises = routine.exercises.map((ex, eIdx) => {
        if (eIdx !== exIdx) return ex;
        const nextState = !ex.completed;

        // Toast on first completion
        if (nextState) {
          onNotificationTrigger(
            "Exercise Completed! 💪",
            `Awesome work finishing ${ex.name}! Keep it up.`,
            "workout"
          );
        }

        return { ...ex, completed: nextState };
      });

      return { ...routine, exercises: updatedExercises };
    });

    onUpdateWorkoutPlan({
      ...workoutPlan,
      routines: updatedRoutines,
    });
  };

  const completeDayRoutine = (dayIdx: number) => {
    const routine = workoutPlan.routines[dayIdx];
    const updatedRoutines = workoutPlan.routines.map((r, dIdx) => {
      if (dIdx !== dayIdx) return r;
      return { ...r, completed: true };
    });

    onUpdateWorkoutPlan({
      ...workoutPlan,
      routines: updatedRoutines,
    });

    onIncrementStreak();

    onNotificationTrigger(
      "Day Completed! 🏆",
      `Phenomenal performance! You completed the workout for Day ${routine.dayNumber} focus: ${routine.focus}!`,
      "workout"
    );
  };

  const activeRoutine = workoutPlan.routines[selectedDayIdx];
  const activeExCompletedCount = activeRoutine?.exercises.filter((e) => e.completed).length || 0;
  const activeExTotalCount = activeRoutine?.exercises.length || 0;
  const activePercent = activeExTotalCount > 0 ? Math.round((activeExCompletedCount / activeExTotalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="workout-generator-container">
      {/* Parameters Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight font-display">
              <Dumbbell className="h-5 w-5 text-indigo-400" />
              AI Routine Tailoring
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Customize your profile details. Gemini AI creates a structured, highly specific workout schedule.
            </p>
          </div>

          <form onSubmit={handleGeneratePlan} className="flex flex-col gap-4">
            {/* Goals Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Primary Health Goals</label>
              <input
                type="text"
                value={userProfile.goals}
                onChange={(e) => onUpdateProfile({ goals: e.target.value })}
                placeholder="e.g., Increase shoulder mobility, lose body fat..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 focus:bg-slate-950 text-slate-100 text-sm rounded-xl outline-hidden transition-all placeholder-slate-500 font-semibold"
                id="goals-profile-input"
              />
            </div>

            {/* Fitness level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Fitness Experience</label>
              <div className="grid grid-cols-3 gap-2">
                {fitnessLevels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onUpdateProfile({ fitnessLevel: lvl })}
                    className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                      userProfile.fitnessLevel === lvl
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15"
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                    id={`fitness-lvl-${lvl.toLowerCase()}-btn`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration and frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Duration (Min)</label>
                <select
                  value={userProfile.duration}
                  onChange={(e) => onUpdateProfile({ duration: parseInt(e.target.value) })}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 font-semibold text-sm rounded-xl outline-hidden cursor-pointer"
                  id="duration-profile-select"
                >
                  {durationOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-950">
                      {opt} mins
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Frequency (Days/Wk)</label>
                <select
                  value={userProfile.frequency}
                  onChange={(e) => onUpdateProfile({ frequency: parseInt(e.target.value) })}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 font-semibold text-sm rounded-xl outline-hidden cursor-pointer"
                  id="frequency-profile-select"
                >
                  {frequencyOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-950">
                      {opt} days
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Equipment checklist */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Available Equipment</label>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                {equipmentOptions.map((eq) => {
                  const selected = userProfile.equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => handleEquipmentToggle(eq)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                        selected
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-bold"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                      }`}
                      id={`equipment-${eq.replace(/\s+/g, "-").toLowerCase()}-btn`}
                    >
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 font-mono">
                {error}
              </span>
            )}

            {/* Trigger generation */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/15 text-sm font-display border border-indigo-500/30"
              id="generate-workout-btn"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Generating Custom Plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-indigo-200" />
                  Generate AI Workout Plan
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Routine Display Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-5 flex-1">
          {/* Plan header */}
          <div className="border-b border-slate-800/80 pb-4">
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase font-mono tracking-widest">
              Gemini Personal Training
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight mt-3 font-display">
              {workoutPlan.planName}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {workoutPlan.summary}
            </p>
          </div>

          {/* Quick calendar tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/50">
            {workoutPlan.routines.map((routine, idx) => (
              <button
                key={routine.dayNumber}
                onClick={() => setSelectedDayIdx(idx)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all border flex items-center gap-1.5 ${
                  selectedDayIdx === idx
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15"
                    : routine.completed
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                }`}
                id={`workout-day-tab-${routine.dayNumber}`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Day {routine.dayNumber}
                {routine.completed && <Trophy className="h-3 w-3 text-emerald-400 ml-0.5 fill-emerald-400/25" />}
              </button>
            ))}
          </div>

          {/* Active day detail content */}
          {activeRoutine ? (
            <div className="flex flex-col gap-5 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">
                    {activeRoutine.focus}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1 uppercase tracking-wider">
                    Completed: {activeExCompletedCount} / {activeExTotalCount} exercises
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden relative border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activePercent}%` }}
                    className="bg-indigo-500 h-full rounded-full"
                  />
                </div>
              </div>

              {/* Warm up cards */}
              {activeRoutine.warmUp && activeRoutine.warmUp.length > 0 && (
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2 font-mono">
                    WARM-UP (Active Prep)
                  </span>
                  <ul className="text-xs text-slate-400 list-disc pl-4 flex flex-col gap-1 font-semibold leading-relaxed">
                    {activeRoutine.warmUp.map((w, index) => (
                      <li key={index}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main exercises checklist */}
              <div className="flex flex-col gap-2.5 flex-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                  MAIN WORKOUT
                </span>

                <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {activeRoutine.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      onClick={() => toggleExerciseComplete(selectedDayIdx, exIdx)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        ex.completed
                          ? "bg-slate-950/20 border-slate-900/60 text-slate-500"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200"
                      }`}
                      id={`exercise-card-${selectedDayIdx}-${exIdx}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {ex.completed ? (
                            <CheckSquare className="h-5 w-5 text-indigo-500" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-700" />
                          )}
                        </div>
                        <div>
                          <h5 className={`text-sm font-bold leading-tight ${ex.completed ? "line-through text-slate-500" : ""}`}>
                            {ex.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
                            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                              {ex.sets} sets
                            </span>
                            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                              {ex.repsOrDuration}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] font-mono">
                              <Clock className="h-3 w-3 text-slate-500" /> {ex.rest} rest
                            </span>
                          </div>
                        </div>
                      </div>

                      {ex.intensity && (
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg ${
                          ex.intensity === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {ex.intensity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Set Companion Pacing & Rest Companion Timer */}
              <ActivePaceTimer currentHeartRate={currentHeartRate} />

              {/* Cool down stretches */}
              {activeRoutine.coolDown && activeRoutine.coolDown.length > 0 && (
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2 font-mono">
                    COOL-DOWN (Stretches & Breathing)
                  </span>
                  <ul className="text-xs text-slate-400 list-disc pl-4 flex flex-col gap-1 font-semibold leading-relaxed">
                    {activeRoutine.coolDown.map((c, index) => (
                      <li key={index}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complete day button */}
              {!activeRoutine.completed ? (
                <button
                  onClick={() => completeDayRoutine(selectedDayIdx)}
                  disabled={activeExCompletedCount === 0}
                  className="w-full mt-auto py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-950 disabled:text-slate-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed border border-indigo-500/20 shadow-lg shadow-indigo-600/10"
                  id={`complete-day-${selectedDayIdx}-btn`}
                >
                  <Trophy className="h-4 w-4" />
                  Finish Workout & Lock Progress
                </button>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs rounded-2xl flex flex-wrap items-center justify-between gap-3 font-semibold mt-auto">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/35 shrink-0">
                      <Trophy className="h-4.5 w-4.5 text-emerald-400 fill-emerald-400/10" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 block">Routine Completed & Locked! 🏆</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Your achievements have been recorded on your activity profile.</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1.5 rounded-xl">
                    Broadcasting active in Social Hub 📡
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-sm font-mono border border-dashed border-slate-850 rounded-2xl">
              No workout plan selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
