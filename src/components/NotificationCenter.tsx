import React, { useState, useEffect } from "react";
import { Bell, Sparkles, RefreshCw, Eye, EyeOff, Check, Heart, ShieldCheck, HeartCrack, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PushNotification, UserProfile } from "../types";

interface NotificationCenterProps {
  notifications: PushNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onAddNotification: (title: string, message: string, category: PushNotification["category"]) => void;
  streak: number;
  recentWorkoutName: string;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onAddNotification,
  streak,
  recentWorkoutName,
}: NotificationCenterProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isBoosting, setIsBoosting] = useState(false);
  const [userMood, setUserMood] = useState("Determined");

  // Track browser Notification permission state
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support system push notifications.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        onAddNotification(
          "Notifications Enabled! 🔔",
          "You've successfully authorized native desktop fitness alerts.",
          "general"
        );
        new Notification("Fitness Tracker Activated", {
          body: "We will notify you with training schedules, heart rate alerts, and dietary goals!",
          icon: "/favicon.ico",
        });
      }
    } catch (err) {
      console.error("Permission request failed:", err);
    }
  };

  const triggerAIMotivation = async () => {
    setIsBoosting(true);
    try {
      const response = await fetch("/api/motivation/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: userMood,
          streak: streak,
          recentWorkoutName: recentWorkoutName || "None logged yet",
          nutritionGoalStatus: "on track"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact motivation engine.");
      }

      const data = await response.json();
      onAddNotification(
        data.title || "AI Coach Boost! 🧠",
        data.message || "Keep pushing! You are doing incredible.",
        data.category || "general"
      );

      // Trigger system alert if permission is granted
      if (permission === "granted") {
        new Notification(data.title || "AI Coach Boost!", {
          body: data.message || "Keep pushing!",
        });
      }

    } catch (err) {
      console.error(err);
      onAddNotification(
        "Self-Discipline is Key! ✨",
        "Don't wait for motivation. True strength is in the habits you construct daily. Let's do it!",
        "general"
      );
    } finally {
      setIsBoosting(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="notification-center-container">
      {/* Settings & Booster Controls */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Permission card */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4 text-white">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight font-display">
              <Bell className="h-5 w-5 text-indigo-400 animate-bounce" style={{ animationDuration: "3s" }} />
              Push Notifications
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Get notified of heart rate anomalies, water breaks, training targets, and daily streaks.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Alert Authorization</span>
              <span className="text-xs font-bold text-slate-200 capitalize mt-0.5">
                {permission === "granted" ? "Authorized" : permission === "denied" ? "Declined" : "Action Required"}
              </span>
            </div>

            {permission !== "granted" ? (
              <button
                onClick={requestNotificationPermission}
                className="px-3.5 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
                id="enable-browser-alerts-btn"
              >
                Enable Alerts
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl flex items-center gap-1 font-mono">
                <ShieldCheck className="h-4 w-4" /> System Live
              </div>
            )}
          </div>
        </div>

        {/* AI Motivator Card */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4 text-white">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight font-display">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              AI Coach Booster
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              How are you feeling right now? Select a mood and trigger instant Gemini coaching prompts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {["Determined", "Sluggish", "Exhausted", "Fired Up", "Anxious", "Ready to Conquer"].map((m) => (
                <button
                  key={m}
                  onClick={() => setUserMood(m)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                    userMood === m
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                  id={`mood-btn-${m.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={triggerAIMotivation}
              disabled={isBoosting}
              className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-50 font-display"
              id="trigger-ai-motivation-btn"
            >
              {isBoosting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Generating Motivation...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-indigo-200" />
                  Request Custom Coaching
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Log Feed */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-5 flex-1 text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-display">
                <Bell className="h-4 w-4 text-slate-400" />
                Alert Inbox
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={onMarkAllRead}
                  className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
                  id="mark-all-read-btn"
                >
                  Mark all read
                </button>
                <span className="text-slate-800">|</span>
                <button
                  onClick={onClearAll}
                  className="text-xs font-bold text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                  id="clear-all-alerts-btn"
                >
                  Clear inbox
                </button>
              </div>
            )}
          </div>

          {/* Notifications feed logs list */}
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 flex-1" id="notifications-list">
            <AnimatePresence initial={false}>
              {notifications.length === 0 ? (
                <div className="text-center py-24 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 flex-1 font-mono">
                  <Bell className="h-8 w-8 text-slate-700" />
                  Inbox empty. Your notifications will appear here.
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3.5 rounded-xl border flex gap-3.5 transition-all relative group ${
                      n.read
                        ? "bg-slate-950/40 border-slate-900 text-slate-400"
                        : "bg-indigo-950/20 border-indigo-500/20 text-white shadow-md shadow-indigo-950/10"
                    }`}
                  >
                    {/* Visual dot */}
                    {!n.read && (
                      <div className="absolute top-4 right-4 h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                    )}

                    {/* Category Icon */}
                    <div className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border ${
                      n.category === "workout"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : n.category === "nutrition"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                        : n.category === "wearable"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                        : "bg-slate-900 text-slate-300 border-slate-800"
                    }`}>
                      {n.category === "wearable" ? (
                        <Heart className="h-5 w-5 animate-pulse" />
                      ) : n.category === "workout" ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>

                    {/* Notification content */}
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${n.read ? "text-slate-400 font-semibold" : "text-slate-200"}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {/* Individual Mark Read Button */}
                    {!n.read && (
                      <button
                        onClick={() => onMarkRead(n.id)}
                        className="absolute right-3.5 bottom-3.5 p-1.5 text-slate-400 hover:text-indigo-400 bg-slate-950 border border-slate-900 hover:border-indigo-500/30 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        id={`mark-read-${n.id}-btn`}
                      >
                        <Check className="h-3 w-3" /> Read
                      </button>
                    )}
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
