import React, { useState, useEffect } from "react";
import {
  User,
  UserPlus,
  LogIn,
  LogOut,
  Key,
  Mail,
  Lock,
  ShieldCheck,
  Award,
  Activity,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Droplet,
  Flame,
  UserCheck,
  Zap,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string; // stored locally for demonstration
  avatar: string;
  profile: UserProfile;
  xp: number;
  streak: number;
  level: number;
  joinedDate: string;
}

interface ProfileAuthProps {
  currentProfile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
  userXp: number;
  setUserXp: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  onNotificationTrigger: (title: string, message: string, category: "workout" | "nutrition" | "streak" | "general" | "wearable") => void;
}

const AVATARS = ["🏅", "🚀", "⚡", "🏋️", "🏃", "🥗", "🧘", "🏆", "🌟", "🔥"];

export default function ProfileAuth({
  currentProfile,
  onProfileUpdate,
  userXp,
  setUserXp,
  streak,
  setStreak,
  onNotificationTrigger
}: ProfileAuthProps) {
  // Accounts lists
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const cached = localStorage.getItem("vitality_core_accounts");
    if (cached) return JSON.parse(cached);
    
    // Seed default account
    const defaultAcc: UserAccount = {
      id: "acc-default",
      name: "Verified Athlete",
      email: "athlete@vitalitycore.ai",
      password: "password123",
      avatar: "🏅",
      profile: currentProfile,
      xp: userXp,
      streak: streak,
      level: Math.floor(userXp / 1000) + 1,
      joinedDate: new Date().toLocaleDateString()
    };
    return [defaultAcc];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const cached = localStorage.getItem("vitality_core_current_user");
    return cached ? JSON.parse(cached) : null;
  });

  // Auth flow state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [avatarSelection, setAvatarSelection] = useState("🏅");
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit fields
  const [editBio, setEditBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("vitality_core_accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("vitality_core_current_user", JSON.stringify(currentUser));
      // update parent profile
      onProfileUpdate(currentUser.profile);
    } else {
      localStorage.removeItem("vitality_core_current_user");
    }
  }, [currentUser]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError("Please fill out all credentials.");
      return;
    }

    const matched = accounts.find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
    );

    if (matched) {
      setCurrentUser(matched);
      setUserXp(matched.xp);
      setStreak(matched.streak);
      onNotificationTrigger(
        "Welcome Back! 👋",
        `Logged in successfully as ${matched.name}. Let's crush today's routines!`,
        "general"
      );
      // reset forms
      setEmail("");
      setPassword("");
    } else {
      setAuthError("Invalid email or password combination.");
    }
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name || !email || !password) {
      setAuthError("All registration fields are required.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    const exists = accounts.some((acc) => acc.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setAuthError("This email address is already registered.");
      return;
    }

    const newAcc: UserAccount = {
      id: `acc-${Date.now()}`,
      name,
      email,
      password,
      avatar: avatarSelection,
      profile: { ...currentProfile, goals: "Create my fitness plan with AI" },
      xp: 100, // starting gift
      streak: 1,
      level: 1,
      joinedDate: new Date().toLocaleDateString()
    };

    setAccounts((prev) => [...prev, newAcc]);
    setCurrentUser(newAcc);
    setUserXp(100);
    setStreak(1);
    
    onNotificationTrigger(
      "Account Registered! 🏆",
      `Welcome ${name} to VitalityCore! +100 XP starter bonus applied.`,
      "general"
    );

    // reset forms
    setName("");
    setEmail("");
    setPassword("");
    setSuccessMsg("Account successfully created!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Handle Logout
  const handleLogout = () => {
    if (currentUser) {
      // Save state before logging out
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === currentUser.id) {
          return {
            ...acc,
            xp: userXp,
            streak: streak,
            profile: currentProfile
          };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      onNotificationTrigger(
        "Logged Out Securely 🔒",
        `See you soon, ${currentUser.name}! Progress saved.`,
        "general"
      );
      setCurrentUser(null);
    }
  };

  // Save changes to account profile
  const saveProfileSettings = () => {
    if (currentUser) {
      const updatedAcc = {
        ...currentUser,
        profile: currentProfile,
        xp: userXp,
        streak: streak
      };
      setCurrentUser(updatedAcc);
      setAccounts((prev) => prev.map((acc) => (acc.id === currentUser.id ? updatedAcc : acc)));
      onNotificationTrigger("Profile Synchronized ⚙️", "Your target goals and biometric config have been saved.", "general");
    }
  };

  // Determine levels and achievements
  const userLevel = Math.floor(userXp / 1000) + 1;
  const xpNeededForNextLevel = userLevel * 1000;
  const xpProgressPercent = Math.min(100, (userXp % 1000) / 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="profile-auth-section">
      
      {/* Left side: Account Status / Auth forms */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {!currentUser ? (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white"
            >
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">ATHLETE SECURITY</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1 font-display tracking-tight">
                  {authMode === "login" ? <LogIn className="h-5 w-5 text-indigo-400" /> : <UserPlus className="h-5 w-5 text-indigo-400" />}
                  {authMode === "login" ? "Sign In to VitalityCore" : "Register New Account"}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {authMode === "login" 
                    ? "Access your custom fitness tracker, synchronize AI workouts, and track macros."
                    : "Create a personalized fitness persona and start earning XP today."}
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                  {authError}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="flex flex-col gap-4">
                {authMode === "register" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Athlete Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl outline-hidden text-xs font-semibold"
                      id="auth-register-name"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Email Address</label>
                  <input
                    type="email"
                    placeholder="athlete@vitalitycore.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl outline-hidden text-xs font-semibold"
                    id="auth-email-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl outline-hidden text-xs font-semibold"
                    id="auth-password-input"
                  />
                </div>

                {authMode === "register" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Choose Avatar Badge</label>
                    <div className="flex flex-wrap gap-2">
                      {AVATARS.map((av) => (
                        <button
                          type="button"
                          key={av}
                          onClick={() => setAvatarSelection(av)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                            avatarSelection === av
                              ? "bg-indigo-600 border-indigo-500 scale-110 shadow-md shadow-indigo-600/25"
                              : "bg-slate-950 border-slate-800 hover:bg-slate-900"
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  id="auth-submit-btn"
                >
                  {authMode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {authMode === "login" ? "Verify Credentials" : "Initialize Fitness Account"}
                </button>
              </form>

              {/* Demo hints */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-900 flex items-start gap-2.5 mt-1">
                <Key className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-400 leading-relaxed font-mono">
                  <span className="font-bold text-slate-200">Local Sandbox Mode:</span> You can sign in using <strong className="text-indigo-400">athlete@vitalitycore.ai</strong> and password <strong className="text-indigo-400">password123</strong>, or register your own account right now.
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 text-center">
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  id="toggle-auth-mode-btn"
                >
                  {authMode === "login" ? "Don't have an account? Register" : "Already have an account? Sign In"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth-user"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Authorized Session
                  </span>
                  <h3 className="text-base font-bold text-white font-display mt-0.5">Active Account</h3>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-bold uppercase font-mono transition-all cursor-pointer flex items-center gap-1"
                  id="auth-logout-btn"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </button>
              </div>

              {/* Profile card badge */}
              <div className="p-5 bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-slate-850 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                  <span className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-3xl shadow-lg">
                    {currentUser.avatar}
                  </span>
                  <div>
                    <h4 className="text-base font-black text-white tracking-tight">{currentUser.name}</h4>
                    <span className="text-xs text-slate-400 font-mono block mt-0.5">{currentUser.email}</span>
                    <span className="inline-block mt-2 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold uppercase font-mono px-2 py-0.5 rounded-md">
                      Level {userLevel} Athlete
                    </span>
                  </div>
                </div>

                {/* Level Progress bar */}
                <div className="relative z-10 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 mb-1.5">
                    <span>PROGRESS TO LEVEL {userLevel + 1}</span>
                    <span>{userXp % 1000} / 1000 XP</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden relative border border-slate-800">
                    <div
                      style={{ width: `${xpProgressPercent}%` }}
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* User Milestones & Streaks */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-center">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block">Active Streak</span>
                  <span className="text-xl font-black text-amber-400 block mt-1">{streak} Days 🔥</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-center">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block">Accumulated XP</span>
                  <span className="text-xl font-black text-indigo-400 block mt-1">{userXp} XP 🏆</span>
                </div>
              </div>

              {/* Security Logs */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col gap-2">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">ACCOUNT METADATA</span>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Member Since:</span>
                  <span className="text-slate-200 font-bold">{currentUser.joinedDate}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Database Connection:</span>
                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Active
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: Beautiful interactive Profile Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white flex-1">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-display tracking-tight">
              <Award className="h-5 w-5 text-indigo-400" />
              Athletic Performance Profile
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure target metric boundaries, view accumulated virtual achievements, and sync details.
            </p>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto pr-1">
            {/* Bio & Status quote */}
            <div className="bg-slate-950/50 border border-slate-900 p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono block">Athlete Mission Bio</span>
              {isEditingBio ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Enter athletic motivation quote or bio..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-slate-700 text-xs text-slate-100 px-3 py-2 rounded-xl outline-hidden font-semibold"
                    id="edit-profile-bio-input"
                  />
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      onProfileUpdate({ ...currentProfile, gender: editBio || currentProfile.gender });
                      if (currentUser) {
                        const updatedCurrentUser = {
                          ...currentUser,
                          profile: { ...currentUser.profile, gender: editBio || currentProfile.gender }
                        };
                        setCurrentUser(updatedCurrentUser);
                      }
                      onNotificationTrigger("Mission Updated! 🎯", "Your dynamic bio status has been successfully updated.", "general");
                    }}
                    className="px-3 py-2 bg-indigo-600 text-xs font-bold text-white rounded-xl cursor-pointer hover:bg-indigo-500 transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-300 italic font-medium leading-relaxed">
                    "{currentProfile.gender || "No mission bio declared yet. Click 'Edit' to personalize."}"
                  </p>
                  <button
                    onClick={() => {
                      setEditBio(currentProfile.gender);
                      setIsEditingBio(true);
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-white cursor-pointer transition-colors shrink-0"
                    id="edit-bio-btn"
                  >
                    [Edit]
                  </button>
                </div>
              )}
            </div>

            {/* Achievements and Badges Bento Row */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">FITNESS ACHIEVEMENT INSIGNIAS</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { title: "Zone 4 Cardio", desc: "Pulse peak > 140", active: streak >= 2, icon: "⚡", col: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                  { title: "Hydration Flush", desc: "Water intake > 2L", active: true, icon: "💧", col: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                  { title: "Macro Chef", desc: "Logged food item", active: true, icon: "🥗", col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { title: "Elite Streak", desc: "Active streak > 5d", active: streak >= 5, icon: "🔥", col: "text-rose-400 bg-rose-500/10 border-rose-500/20" }
                ].map((badge) => (
                  <div
                    key={badge.title}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all relative group ${
                      badge.active 
                        ? badge.col
                        : "bg-slate-950/40 border-slate-900/60 text-slate-600 opacity-50"
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <span className="text-[10px] font-bold block truncate text-slate-100">{badge.title}</span>
                      <span className="text-[8px] font-mono block truncate text-slate-500 mt-0.5">{badge.desc}</span>
                    </div>
                    {badge.active && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Config Settings Fields */}
            <div className="flex flex-col gap-4 bg-slate-950 p-4 border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">TARGET BOUNDARY PARAMETERS</span>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Athlete Age</label>
                  <input
                    type="number"
                    value={currentProfile.age}
                    onChange={(e) => {
                      const age = parseInt(e.target.value) || 28;
                      onProfileUpdate({ ...currentProfile, age });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 focus:border-indigo-500/40 rounded-xl outline-hidden text-xs font-semibold"
                    id="profile-age-field"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Fitness Level</label>
                  <select
                    value={currentProfile.fitnessLevel}
                    onChange={(e) => onProfileUpdate({ ...currentProfile, fitnessLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 focus:border-indigo-500/40 rounded-xl outline-hidden text-xs font-semibold cursor-pointer"
                    id="profile-level-field"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Sliders for Targets */}
              <div className="flex flex-col gap-4 border-t border-slate-900 pt-3">
                {/* Calorie Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-orange-400 uppercase tracking-widest font-mono flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" /> Calorie Target limit
                    </span>
                    <span className="font-mono font-black text-slate-200">{currentProfile.calorieTarget} kcal</span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="4500"
                    step="50"
                    value={currentProfile.calorieTarget}
                    onChange={(e) => onProfileUpdate({ ...currentProfile, calorieTarget: parseInt(e.target.value) })}
                    className="w-full accent-orange-500 cursor-ew-resize bg-slate-800 h-1.5 rounded-lg font-bold"
                    id="profile-calorie-slider-field"
                  />
                </div>

                {/* Water Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1">
                      <Droplet className="h-3.5 w-3.5" /> Water Fluid limit
                    </span>
                    <span className="font-mono font-black text-slate-200">{currentProfile.waterTarget} ml</span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="5000"
                    step="100"
                    value={currentProfile.waterTarget}
                    onChange={(e) => onProfileUpdate({ ...currentProfile, waterTarget: parseInt(e.target.value) })}
                    className="w-full accent-blue-500 cursor-ew-resize bg-slate-800 h-1.5 rounded-lg font-bold"
                    id="profile-water-slider-field"
                  />
                </div>
              </div>

              {/* Goals */}
              <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Current Fitness Goal</label>
                <textarea
                  rows={2}
                  value={currentProfile.goals}
                  onChange={(e) => onProfileUpdate({ ...currentProfile, goals: e.target.value })}
                  placeholder="Declare target athletic objectives..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-850 focus:border-indigo-500/40 rounded-xl outline-hidden text-xs font-semibold resize-none"
                  id="profile-goals-field"
                />
              </div>

              {currentUser && (
                <button
                  onClick={saveProfileSettings}
                  className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center font-display"
                  id="profile-sync-btn"
                >
                  Synchronize and Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
