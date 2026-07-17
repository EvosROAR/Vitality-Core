import React, { useState } from "react";
import {
  Share2,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Copy,
  Twitter,
  Flame,
  Award,
  Heart,
  Dumbbell,
  Droplet,
  Send,
  Check,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, WorkoutPlan, Meal } from "../types";

// In-app direct friends to share with
const FRIENDS = [
  { id: "friend-sarah", name: "Sarah (Gym Partner)", avatar: "👩‍🚀", bio: "Hyrox competitor & PB hunter", online: true },
  { id: "friend-alex", name: "Coach Alex", avatar: "👨‍🏫", bio: "AI Certified Personal Trainer", online: true },
  { id: "friend-brody", name: "Brody (Workout Buddy)", avatar: "🧑‍🎤", bio: "Loves deadlifts & cheat meals", online: false },
  { id: "friend-fitbot", name: "FitBot AI Companion", avatar: "🤖", bio: "Automated macro optimizer", online: true },
];

interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  message: string;
  cardStyle: string;
  achievementType: string;
  metrics: { label: string; value: string }[];
  likes: number;
  comments: { author: string; text: string }[];
  cheered: boolean;
  isUser?: boolean;
}

const INITIAL_FEED_POSTS: Post[] = [
  {
    id: "feed-1",
    author: "Sarah (Gym Partner)",
    avatar: "👩‍🚀",
    time: "20 minutes ago",
    message: "Just completed Day 2 of the AI Conditioning Plan! Absolute lung-burner but feeling outstanding. Let's keep this streak burning! 🌋💪 #VitalityCore #HyroxPrep",
    cardStyle: "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border-indigo-500/30",
    achievementType: "Workout Complete",
    metrics: [
      { label: "Workout", value: "Core & Heart Rate Flush" },
      { label: "Completion", value: "100%" },
      { label: "Active Peak HR", value: "158 BPM" }
    ],
    likes: 5,
    comments: [
      { author: "Coach Alex", text: "Incredible pacing, Sarah! Keep that lactic threshold building." }
    ],
    cheered: false
  },
  {
    id: "feed-2",
    author: "Brody (Workout Buddy)",
    avatar: "🧑‍🎤",
    time: "2 hours ago",
    message: "Hydration target SMASHED before 3 PM today! Over 3 liters down. 💦 Trying to catch up to your streak! #WaterIsLife",
    cardStyle: "bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-blue-500/30",
    achievementType: "Personal Best",
    metrics: [
      { label: "Hydration", value: "3200 ml logged" },
      { label: "Target", value: "2500 ml" },
      { label: "Status", value: "Surpassed (+28%)" }
    ],
    likes: 3,
    comments: [],
    cheered: false
  }
];

interface SocialShareHubProps {
  workoutPlan: WorkoutPlan;
  userProfile: UserProfile;
  streak: number;
  meals: Meal[];
  waterIntake: number;
  currentHeartRate: number | null;
  onNotificationTrigger: (title: string, message: string, category: "workout" | "nutrition" | "streak" | "general" | "wearable") => void;
  userXp: number;
  setUserXp: React.Dispatch<React.SetStateAction<number>>;
}

export default function SocialShareHub({
  workoutPlan,
  userProfile,
  streak,
  meals,
  waterIntake,
  currentHeartRate,
  onNotificationTrigger,
  userXp,
  setUserXp,
}: SocialShareHubProps) {
  // Share generator state
  const [selectedType, setSelectedType] = useState<"workout" | "best" | "goal">("workout");
  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number>(0);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [cardTheme, setCardTheme] = useState<"indigo" | "flame" | "carbon" | "emerald">("indigo");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [aiTone, setAiTone] = useState<"beast" | "inspiring" | "mindful" | "classic">("inspiring");
  
  // Community Feed State
  const [feedPosts, setFeedPosts] = useState<Post[]>(INITIAL_FEED_POSTS);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharedPlatform, setSharedPlatform] = useState<string | null>(null);

  // New sub-tab state for Community column
  const [socialSubTab, setSocialSubTab] = useState<"feed" | "leaderboard">("feed");

  // Daily Challenge board states
  const [hydrationChallengeCompleted, setHydrationChallengeCompleted] = useState<boolean>(() => {
    return localStorage.getItem("vitality_core_hydration_challenge") === "true";
  });
  const [cardioChallengeCompleted, setCardioChallengeCompleted] = useState<boolean>(() => {
    return localStorage.getItem("vitality_core_cardio_challenge") === "true";
  });

  // Computed metric helpers
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const completedExCount = workoutPlan.routines.reduce(
    (acc, r) => acc + r.exercises.filter((e) => e.completed).length,
    0
  );
  const totalExCount = workoutPlan.routines.reduce((acc, r) => acc + r.exercises.length, 0);
  const completionRate = totalExCount > 0 ? Math.round((completedExCount / totalExCount) * 100) : 0;

  // Auto-fill template messages based on selection
  const handleAutoFill = (type: "workout" | "best" | "goal") => {
    setSelectedType(type);
    let msg = "";
    if (type === "workout") {
      const routine = workoutPlan.routines[selectedRoutineIndex] || workoutPlan.routines[0];
      const completedCount = routine?.exercises.filter(e => e.completed).length || 0;
      const totalCount = routine?.exercises.length || 0;
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      msg = `Crushed today's workout focus: "${routine?.focus || 'Metabolic Conditioning'}"! Completed ${completedCount}/${totalCount} exercises (${percent}%). Solid training session designed by VitalityCore AI! 🏋️‍♂️🔥`;
    } else if (type === "best") {
      msg = `Feeling unbeatable today! I have kept my workout consistency alive for ${streak} consecutive days. Hydration status: ${waterIntake} ml fueled. Consistency is the real victory! 🏆⚡ #StreakKeeper`;
    } else if (type === "goal") {
      msg = `Zeroing in on my primary fitness goal: "${userProfile.goals}". Building joint stability, endurance, and clean habits. Progress takes dedication! 🎯👊`;
    }
    setCustomMessage(msg);
  };

  // Prefill on load
  React.useEffect(() => {
    handleAutoFill(selectedType);
  }, [selectedRoutineIndex]);

  // AI custom message enhancement using Gemini
  const enhanceMessageWithAI = async () => {
    if (!customMessage.trim()) return;
    setIsEnhancing(true);
    try {
      // Create metric object to pass to AI
      const metricsSummary = {
        streak: `${streak} Days`,
        calories: `${totalCalories} kcal`,
        water: `${waterIntake} ml`,
        profileGoal: userProfile.goals,
        currentHeartRate: currentHeartRate ? `${currentHeartRate} BPM` : "145 BPM"
      };

      const response = await fetch("/api/share/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: customMessage,
          tone: aiTone,
          type: selectedType,
          metrics: metricsSummary
        }),
      });

      if (!response.ok) {
        throw new Error("Gemini API not responding.");
      }

      const data = await response.json();
      if (data.enhancedMessage) {
        setCustomMessage(data.enhancedMessage);
        onNotificationTrigger(
          "AI Message Tailored! ✨",
          "Gemini has enhanced your message with specialized fitness tone profiles.",
          "general"
        );
      }
    } catch (err) {
      console.error("AI enhancement failed:", err);
      // Client-side local enhancement fallback
      let suffix = "";
      if (aiTone === "beast") {
        suffix = "\n\nNO DAYS OFF. NO EXCUSES. Beast mode unlocked! 🦾⚡ #Grindset #FitLife";
      } else if (aiTone === "mindful") {
        suffix = "\n\nAligning body and mind. True health is peace in movement. 🌱🧘‍♂️ #ZenAthletics";
      } else {
        suffix = "\n\nProgress over perfection. Let's keep building! 🎯🏋️‍♂️ #AthleteJourney";
      }
      setCustomMessage(prev => prev + suffix);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleClaimHydrationChallenge = () => {
    if (waterIntake >= 2000 && !hydrationChallengeCompleted) {
      setUserXp((prev) => prev + 150);
      setHydrationChallengeCompleted(true);
      localStorage.setItem("vitality_core_hydration_challenge", "true");
      onNotificationTrigger(
        "Daily Challenge Unlocked! 🏆",
        "You earned +150 XP for completing 'The Hydration Flush'!",
        "streak"
      );
    }
  };

  const handleClaimCardioChallenge = () => {
    if (currentHeartRate && currentHeartRate >= 140 && !cardioChallengeCompleted) {
      setUserXp((prev) => prev + 200);
      setCardioChallengeCompleted(true);
      localStorage.setItem("vitality_core_cardio_challenge", "true");
      onNotificationTrigger(
        "Daily Challenge Unlocked! 🏆",
        "You earned +200 XP for completing 'Zone 4 Cardio Burst'!",
        "streak"
      );
    }
  };

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };

  // Publish to in-app community feed
  const handlePublishInApp = () => {
    if (!customMessage.trim()) return;

    let themeStyles = "";
    let label = "Achievement";
    let metrics: { label: string; value: string }[] = [];

    // Map themes
    if (cardTheme === "indigo") themeStyles = "bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/30";
    else if (cardTheme === "flame") themeStyles = "bg-gradient-to-br from-orange-950 via-red-950 to-slate-900 border-orange-500/30";
    else if (cardTheme === "carbon") themeStyles = "bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-800 border-slate-700/40";
    else if (cardTheme === "emerald") themeStyles = "bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-900 border-emerald-500/30";

    if (selectedType === "workout") {
      label = "Workout Complete";
      const routine = workoutPlan.routines[selectedRoutineIndex] || workoutPlan.routines[0];
      metrics = [
        { label: "Focus", value: routine?.focus || "AI Routine" },
        { label: "Completed", value: `${routine?.exercises.filter(e => e.completed).length || 0} exercises` },
        { label: "Heart Rate", value: currentHeartRate ? `${currentHeartRate} BPM` : "Peak Zone" }
      ];
    } else if (selectedType === "best") {
      label = "Personal Best";
      metrics = [
        { label: "Streak", value: `${streak} Days Active` },
        { label: "Fuel Intake", value: `${waterIntake} ml` },
        { label: "Calories", value: `${totalCalories} kcal` }
      ];
    } else if (selectedType === "goal") {
      label = "Fitness Goal Set";
      metrics = [
        { label: "Goal Focus", value: userProfile.goals.substring(0, 30) + "..." },
        { label: "Target Water", value: `${userProfile.waterTarget} ml` },
        { label: "Active Days", value: `${userProfile.frequency} days/wk` }
      ];
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: "Me (Verified Athlete)",
      avatar: "🏅",
      time: "Just now",
      message: customMessage,
      cardStyle: themeStyles,
      achievementType: label,
      metrics: metrics,
      likes: 0,
      comments: [],
      cheered: false,
      isUser: true,
    };

    setFeedPosts(prev => [newPost, ...prev]);

    // Send notifications to selected friends and generate instant smart cheer comments!
    if (selectedFriends.length > 0) {
      selectedFriends.forEach(friendId => {
        const friend = FRIENDS.find(f => f.id === friendId);
        if (friend) {
          // Send smart automated congrats from this friend within 1.5 seconds!
          setTimeout(() => {
            const replies = [
              "Sensational work! You're raising the bar. 🔥👏",
              "Incredible discipline! Keep pushing that streak forward.",
              "This is how champions are forged. Proud of you!",
              "Wow, those macro numbers are clinical. Awesome job!"
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            
            setFeedPosts(currentPosts =>
              currentPosts.map(p =>
                p.id === newPost.id
                  ? {
                      ...p,
                      likes: p.likes + 1,
                      comments: [...p.comments, { author: friend.name, text: randomReply }]
                    }
                  : p
              )
            );
            onNotificationTrigger(
              `${friend.name} Cheered! 👏`,
              `"${randomReply}" sent in response to your shared achievement.`,
              "general"
            );
          }, 1500);
        }
      });
      onNotificationTrigger(
        "Directly Shared! 📨",
        `Achievement shared directly with ${selectedFriends.length} friends inside VitalityCore.`,
        "general"
      );
    } else {
      onNotificationTrigger(
        "Posted to Feed! 📡",
        "Your tailored card has been broadcasted to your community feed.",
        "general"
      );
    }

    // Reset inputs
    setSelectedFriends([]);
    // Scroll to feed top if needed
  };

  const handleLikePost = (postId: string) => {
    setFeedPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.cheered ? post.likes - 1 : post.likes + 1,
            cheered: !post.cheered
          };
        }
        return post;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setFeedPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, { author: "Me (Verified Athlete)", text: text.trim() }]
          };
        }
        return post;
      })
    );

    // Clear comment input
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const handleDeletePost = (postId: string) => {
    setFeedPosts(prev => prev.filter(post => post.id !== postId));
    onNotificationTrigger(
      "Post Removed 🗑️",
      "Achievement card was deleted from your history log.",
      "general"
    );
  };

  // Mock export to platform
  const triggerPlatformShare = (platform: string) => {
    setSharedPlatform(platform);
    setShowShareModal(true);
    
    // Copy to clipboard helper
    if (platform === "Clipboard") {
      navigator.clipboard.writeText(`[VitalityCore AI Achievement] ${customMessage}`);
    }

    onNotificationTrigger(
      "Export Request Authorized! 🌐",
      `Redirecting credentials to export your achievement card to ${platform}.`,
      "general"
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="social-hub-container">
      {/* Achievement Composer Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-5">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase font-mono tracking-widest">
              Aesthetic Exporter
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-3 tracking-tight font-display">
              <Share2 className="h-5 w-5 text-indigo-400" />
              Compose & Broadcast
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Synthesize your completed workouts, streaks, or wellness targets into a customizable athletic card. Publish to in-app circles or export externally.
            </p>
          </div>

          {/* Step 1: Select Metric Category */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Step 1: Select Athletic Achievement
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleAutoFill("workout")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "workout"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                }`}
                id="share-select-workout-btn"
              >
                <Dumbbell className="h-4.5 w-4.5" />
                <span className="text-[11px] font-bold tracking-tight">Workout Plan</span>
              </button>

              <button
                onClick={() => handleAutoFill("best")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "best"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                }`}
                id="share-select-best-btn"
              >
                <Flame className="h-4.5 w-4.5" />
                <span className="text-[11px] font-bold tracking-tight">Personal Best</span>
              </button>

              <button
                onClick={() => handleAutoFill("goal")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "goal"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                }`}
                id="share-select-goal-btn"
              >
                <Award className="h-4.5 w-4.5" />
                <span className="text-[11px] font-bold tracking-tight">Active Goal</span>
              </button>
            </div>
          </div>

          {/* Extra selection context for workouts */}
          {selectedType === "workout" && (
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col gap-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Select Completed Day Focus
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {workoutPlan.routines.map((routine, idx) => {
                  const completedCount = routine.exercises.filter(e => e.completed).length;
                  const total = routine.exercises.length;
                  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
                  return (
                    <button
                      key={routine.dayNumber}
                      onClick={() => setSelectedRoutineIndex(idx)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all border flex items-center gap-1.5 ${
                        selectedRoutineIndex === idx
                          ? "bg-slate-900 text-indigo-400 border-indigo-500/50"
                          : "bg-slate-950/60 border-slate-900 text-slate-400 hover:bg-slate-900"
                      }`}
                      id={`share-workout-day-${routine.dayNumber}`}
                    >
                      Day {routine.dayNumber} Focus ({percent}%)
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Custom Caption / Message */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                Step 2: Customize Message
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value as any)}
                  className="px-2 py-0.5 bg-slate-950 border border-slate-850 text-[10px] font-bold text-indigo-300 rounded-lg outline-hidden cursor-pointer"
                  id="ai-tone-select"
                >
                  <option value="beast" className="bg-slate-950">🦾 Beast Mode</option>
                  <option value="inspiring" className="bg-slate-950">✨ Inspective</option>
                  <option value="mindful" className="bg-slate-950">🧘‍♂️ Mindfulness</option>
                  <option value="classic" className="bg-slate-950">📋 Classic Stats</option>
                </select>
                <button
                  type="button"
                  disabled={isEnhancing || !customMessage.trim()}
                  onClick={enhanceMessageWithAI}
                  className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:bg-slate-950 disabled:text-slate-600 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  title="Enhance message phrasing with Gemini AI"
                  id="ai-enhance-msg-btn"
                >
                  {isEnhancing ? (
                    <RefreshCw className="h-2.5 w-2.5 animate-spin text-indigo-400" />
                  ) : (
                    <Sparkles className="h-2.5 w-2.5 text-indigo-300" />
                  )}
                  AI Tailor ✨
                </button>
              </div>
            </div>

            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Inject personal thoughts, emojis, hashtags or training milestones..."
              rows={3}
              className="w-full px-4 py-3.5 bg-slate-950 border border-slate-850 focus:border-indigo-500/50 text-slate-100 text-xs rounded-xl outline-hidden transition-all resize-none leading-relaxed"
              id="share-custom-message-input"
            />
          </div>

          {/* Step 3: Card Styling Themes */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Step 3: Choose Visual Background Style
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "indigo", name: "Slate Eclipse", color: "bg-indigo-500" },
                { id: "flame", name: "Inferno Heat", color: "bg-orange-500" },
                { id: "carbon", name: "Brutalist Mono", color: "bg-neutral-600" },
                { id: "emerald", name: "Zen Aurora", color: "bg-emerald-500" },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCardTheme(theme.id as any)}
                  className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    cardTheme === theme.id
                      ? "bg-slate-900 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-slate-950 border-slate-900 text-slate-500 hover:bg-slate-900"
                  }`}
                  id={`share-theme-${theme.id}`}
                >
                  <span className={`w-3 h-3 rounded-full ${theme.color} shrink-0`} />
                  <span className="text-[10px] truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Share Direct to Friends */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-850">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Step 4: Send Directly to Friends (In-App)
            </span>
            <div className="flex flex-wrap gap-2">
              {FRIENDS.map((friend) => {
                const selected = selectedFriends.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    onClick={() => handleFriendToggle(friend.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                      selected
                        ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                    }`}
                    id={`share-friend-${friend.id}`}
                  >
                    <span className="text-sm">{friend.avatar}</span>
                    <span className="font-semibold text-[11px]">{friend.name}</span>
                    {selected && <Check className="h-3 w-3 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publishing Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-850">
            <button
              onClick={handlePublishInApp}
              disabled={!customMessage.trim()}
              className="py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-display shadow-lg shadow-indigo-600/10 border border-indigo-500/20"
              id="publish-in-app-btn"
            >
              <Users className="h-4 w-4" />
              Broadcast to Social Hub Feed
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerPlatformShare("Twitter/X")}
                disabled={!customMessage.trim()}
                className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 disabled:bg-slate-950 disabled:text-slate-600 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all text-xs"
                id="share-external-twitter-btn"
                title="Publish to Twitter/X platform"
              >
                <Twitter className="h-3.5 w-3.5 text-slate-300" />
                Twitter/X
              </button>

              <button
                onClick={() => triggerPlatformShare("Clipboard")}
                disabled={!customMessage.trim()}
                className="px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 disabled:bg-slate-950 disabled:text-slate-600 text-slate-200 font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all text-xs"
                id="share-copy-link-btn"
                title="Copy share link to clipboard"
              >
                <Copy className="h-3.5 w-3.5 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Visual Card Preview (Instagram Story / Strava Style Mockup) */}
        <div className="bg-slate-900/30 rounded-3xl p-6 border border-slate-850 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            LIVE CARD GENERATION PREVIEW
          </span>

          <div className="flex items-center justify-center py-4 bg-slate-950 rounded-2xl border border-slate-900 relative overflow-hidden p-4">
            {/* Outer dynamic card */}
            <div
              className={`w-full max-w-[340px] rounded-2xl p-5 border shadow-2xl flex flex-col justify-between aspect-[4/5] relative overflow-hidden transition-all duration-300 ${
                cardTheme === "indigo" ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/30" :
                cardTheme === "flame" ? "bg-gradient-to-br from-orange-950 via-red-950 to-slate-900 border-orange-500/30" :
                cardTheme === "carbon" ? "bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-800 border-slate-700/40" :
                "bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-900 border-emerald-500/30"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 shrink-0">
                    <Share2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black tracking-tight text-white uppercase leading-none font-display">
                      VITALITY<span className="text-indigo-400">CORE</span>
                    </h4>
                    <span className="text-[7px] text-slate-300 font-bold tracking-widest uppercase font-mono block mt-0.5">
                      Verified Athlete Progress
                    </span>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 rounded-md uppercase font-bold shrink-0">
                  {selectedType === "workout" ? "WORKOUT COMPLETE" : selectedType === "best" ? "PERSONAL BEST" : "ACTIVE GOAL"}
                </span>
              </div>

              {/* Dynamic Metric values overlay in the card body */}
              <div className="flex flex-col gap-3 my-4">
                {selectedType === "workout" ? (
                  <>
                    <h3 className="text-lg font-black text-white leading-tight font-display tracking-tight">
                      {workoutPlan.routines[selectedRoutineIndex]?.focus || "Metabolic Conditioning"}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-semibold text-slate-300 uppercase tracking-wider font-mono">Exercises</span>
                        <span className="text-xs font-black text-white font-mono mt-0.5">
                          {workoutPlan.routines[selectedRoutineIndex]?.exercises.length || 4} logged
                        </span>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-semibold text-slate-300 uppercase tracking-wider font-mono">Status</span>
                        <span className="text-xs font-black text-white font-mono mt-0.5">
                          {workoutPlan.routines[selectedRoutineIndex]?.exercises.filter(e => e.completed).length || 0} completed
                        </span>
                      </div>
                    </div>
                  </>
                ) : selectedType === "best" ? (
                  <>
                    <h3 className="text-lg font-black text-white leading-tight font-display tracking-tight">
                      Consistency Streak Milestone!
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-semibold text-slate-300 uppercase tracking-wider font-mono">Consecutive Days</span>
                        <span className="text-xs font-black text-orange-400 font-mono mt-0.5">
                          {streak} days active 🔥
                        </span>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-semibold text-slate-300 uppercase tracking-wider font-mono">Hydration Log</span>
                        <span className="text-xs font-black text-blue-400 font-mono mt-0.5">
                          {waterIntake} ml fueled 💧
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-white leading-tight font-display tracking-tight">
                      Primary Fitness Goal Progress
                    </h3>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                      "{userProfile.goals}"
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-semibold text-slate-300 uppercase tracking-wider font-mono">Frequency Target</span>
                        <span className="text-xs font-black text-white font-mono mt-0.5">
                          {userProfile.frequency} sessions/wk
                        </span>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-semibold text-slate-300 uppercase tracking-wider font-mono">Calorie Target</span>
                        <span className="text-xs font-black text-white font-mono mt-0.5">
                          {userProfile.calorieTarget} kcal/day
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Stamp */}
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-[7px] text-slate-400 font-mono">
                  Timestamp: {new Date().toISOString().substring(0, 10)}
                </span>
                <span className="text-[8px] text-indigo-300 font-bold tracking-widest uppercase font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  AI Generated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Community, Leaderboard & In-App Shared Feed */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-5 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-display tracking-tight">
                <Users className="h-4 w-4 text-indigo-400" />
                Athlete Circle
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gamified challenges, real-time leaderboards, and team timeline.
              </p>
            </div>

            {/* Slider capsule pills tab toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
              <button
                onClick={() => setSocialSubTab("feed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
                  socialSubTab === "feed"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="toggle-social-subtab-feed"
              >
                Feed
              </button>
              <button
                onClick={() => setSocialSubTab("leaderboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
                  socialSubTab === "leaderboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="toggle-social-subtab-leaderboard"
              >
                Leaderboard
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {socialSubTab === "feed" ? (
              <motion.div
                key="social-feed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4 overflow-y-auto max-h-[520px] pr-1"
              >
                {feedPosts.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl font-mono">
                    Your social timeline is silent. Choose an achievement on the left to broadcast or send to friends.
                  </div>
                ) : (
                  feedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col gap-3 relative group hover:border-slate-850 transition-all duration-200"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-sm shadow-inner shrink-0">
                            {post.avatar}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 leading-tight">
                              {post.author}
                            </h4>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                              {post.time}
                            </span>
                          </div>
                        </div>

                        {post.isUser && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 text-slate-600 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Remove post"
                            id={`delete-post-${post.id}-btn`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Content text */}
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {post.message}
                      </p>

                      {/* In-feed stylized mini preview card */}
                      <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${post.cardStyle}`}>
                        <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                          <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest font-mono">
                            {post.achievementType}
                          </span>
                          <span className="text-[7px] text-slate-400 font-mono">VitalityCore AI</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                          {post.metrics.map((met, index) => (
                            <div key={index} className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                              <span className="block text-[7px] text-slate-400 uppercase font-mono">{met.label}</span>
                              <span className="text-[9px] font-black text-white truncate block mt-0.5">{met.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions feedback */}
                      <div className="flex items-center gap-4 pt-1.5 border-t border-slate-900 text-slate-400">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors ${
                            post.cheered ? "text-indigo-400" : "hover:text-slate-200"
                          }`}
                          id={`cheer-post-${post.id}-btn`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${post.cheered ? "fill-indigo-500 text-indigo-400" : ""}`} />
                          <span>Cheer ({post.likes})</span>
                        </button>

                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                          <MessageCircle className="h-3.5 w-3.5 text-slate-500" />
                          <span>Comments ({post.comments.length})</span>
                        </div>
                      </div>

                      {/* Comments list */}
                      {post.comments.length > 0 && (
                        <div className="flex flex-col gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-900/50 mt-1">
                          {post.comments.map((comment, idx) => (
                            <div key={idx} className="text-[11px] leading-relaxed">
                              <strong className="text-indigo-300 mr-1">{comment.author}:</strong>
                              <span className="text-slate-400 font-medium">{comment.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment inline form */}
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Cheer on or ask a question..."
                          className="flex-1 bg-slate-950/60 border border-slate-900 focus:border-slate-800 text-[11px] text-slate-200 px-3 py-1.5 rounded-lg outline-hidden font-medium"
                          id={`comment-input-${post.id}`}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg cursor-pointer transition-colors"
                          id={`submit-comment-${post.id}-btn`}
                          title="Post comment"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="social-leaderboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-5 overflow-y-auto max-h-[520px] pr-1"
              >
                {/* Daily Challenges */}
                <div className="bg-indigo-950/15 border border-indigo-500/10 rounded-2xl p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    Daily Challenge Board
                  </span>

                  <div className="flex flex-col gap-3">
                    {/* Hydration Challenge */}
                    <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          The Hydration Flush
                          {hydrationChallengeCompleted && (
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              Claimed
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-tight mt-1">
                          Fuel at least 2.0L (2000ml) of hydration fluid today.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden relative">
                            <div
                              style={{ width: `${Math.min(100, (waterIntake / 2000) * 100)}%` }}
                              className="bg-blue-500 h-full rounded-full transition-all duration-300"
                            />
                          </div>
                          <span className="text-[9px] font-bold font-mono text-slate-400">
                            {waterIntake}/2000ml
                          </span>
                        </div>
                      </div>

                      {hydrationChallengeCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : waterIntake >= 2000 ? (
                        <button
                          onClick={handleClaimHydrationChallenge}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-lg cursor-pointer transition-all uppercase font-mono shadow-md shrink-0"
                          id="claim-hydration-challenge-btn"
                        >
                          Claim 150XP
                        </button>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-slate-900 border border-slate-850 px-2 py-1 rounded shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Cardio Challenge */}
                    <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          Zone 4 Cardio Burst
                          {cardioChallengeCompleted && (
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              Claimed
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-tight mt-1">
                          Increase pulse peak above 140 BPM with wearable companion.
                        </p>
                        <span className="text-[9px] font-bold font-mono text-slate-400 mt-2 block">
                          Current Zone: {currentHeartRate ? `${currentHeartRate} BPM` : "Wearable Offline"}
                        </span>
                      </div>

                      {cardioChallengeCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : currentHeartRate && currentHeartRate >= 140 ? (
                        <button
                          onClick={handleClaimCardioChallenge}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-lg cursor-pointer transition-all uppercase font-mono shadow-md shrink-0"
                          id="claim-cardio-challenge-btn"
                        >
                          Claim 200XP
                        </button>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-slate-900 border border-slate-850 px-2 py-1 rounded shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Leaderboard Rankings */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Weekly Gym Board Rankings
                  </span>

                  <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-2.5 flex flex-col gap-1.5">
                    {[
                      { name: "Sarah (Gym Partner)", avatar: "👩‍🚀", xp: 4500, streak: "6d", isUser: false },
                      { name: "Me (Verified Athlete)", avatar: "🏅", xp: userXp, streak: `${streak}d`, isUser: true },
                      { name: "Brody (Workout Buddy)", avatar: "🧑‍🎤", xp: 2800, streak: "5d", isUser: false },
                      { name: "Coach Alex", avatar: "👨‍🏫", xp: 1500, streak: "2d", isUser: false },
                      { name: "FitBot AI", avatar: "🤖", xp: 900, streak: "1d", isUser: false }
                    ]
                      .sort((a, b) => b.xp - a.xp)
                      .map((item, idx) => {
                        const isWinner = idx === 0;
                        return (
                          <div
                            key={item.name}
                            className={`p-2.5 rounded-xl flex items-center justify-between gap-3 border ${
                              item.isUser
                                ? "bg-indigo-950/30 border-indigo-500/25"
                                : "bg-slate-950 border-slate-900/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Ranking number */}
                              <span className={`text-[10px] font-black font-mono w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                isWinner
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/35"
                                  : "bg-slate-900 text-slate-400 border border-slate-850"
                              }`}>
                                {idx + 1}
                              </span>
                              
                              <span className="text-xs shrink-0">{item.avatar}</span>
                              <div className="truncate max-w-[120px]">
                                <span className={`text-xs font-bold block truncate ${item.isUser ? "text-indigo-300" : "text-slate-200"}`}>
                                  {item.name}
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono">Streak: {item.streak}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-black font-mono text-slate-100 block">
                                {item.xp.toLocaleString()} <span className="text-indigo-400 font-bold text-[8px]">XP</span>
                              </span>
                              <span className="text-[7px] text-slate-500 font-mono font-medium block uppercase">
                                {isWinner ? "Championship" : "Competitor"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Share Export Success Dialog Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-display">Export Authorized!</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {sharedPlatform === "Clipboard"
                    ? "Custom athletic sharing message has been formatted and copied safely to your device's clipboard."
                    : `Your customized workout statistics, goal accomplishments, and motivation quotes have been packaged and prepared to publish to ${sharedPlatform}.`}
                </p>
              </div>

              {sharedPlatform !== "Clipboard" && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[11px] text-indigo-300 font-mono leading-tight text-left">
                  <span className="text-[9px] text-slate-500 block mb-1">PREPARED CAPTION:</span>
                  {customMessage}
                </div>
              )}

              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSharedPlatform(null);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all font-display border border-indigo-500/20"
                id="close-share-modal-btn"
              >
                Return to Workspace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
