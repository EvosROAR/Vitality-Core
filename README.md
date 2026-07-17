# 🏅 VitalityCore AI — Personalized Fitness & Nutrition Tracker

Welcome to **VitalityCore AI**, an immersive, gamified full-stack fitness and nutrition companion powered by Gemini AI. Designed for modern athletes, this platform transforms daily health logs into interactive milestones, offering personalized exercise regimens, smart nutritional analysis, wearable device telemetry simulations, competitive community leaderboards, and secure sandbox user sessions.

---

## 🚀 Key Features

*   👤 **Athlete Accounts & Profile Hub**: Create a custom profile or sign in using sandbox accounts. Features interactive biomechanical parameter sliders (Fluid Intake limit, Calorie Target, Athlete Age), level-up progression systems (XP accumulation), and active daily streak trackers.
*   🏋️ **AI-Powered Workouts**: Generate tailored workouts based on physical goals, tracking completed routines dynamically.
*   🥗 **Smart Nutrition Logging**: Catalog meals, track dynamic calorie counts, manage active hydration progress, and request personalized AI dietary assessments.
*   💓 **Wearable Telemetry**: Simulate real-time heart rate monitoring, watch telemetry logs, and analyze cardiovascular performance.
*   🏆 **Social Share & Community Hub**: Compete with other virtual athletes on the server-wide XP Leaderboard, view active daily challenges, and generate custom social-share cards.
*   🔔 **Alert Center & Inbox**: Receive responsive, categorized event notifications (workouts, hydration triggers, and achievements) to stay locked into your goals.

---

## 🛠️ Technology Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (via `motion/react` for elegant visual transitions)
*   **Icons**: Lucide React
*   **Backend**: Node.js, Express (custom hybrid server serving static assets and proxying backend queries)
*   **AI Integration**: Google Gemini API (securely configured server-side to hide API credentials)
*   **Persistence**: Offline-First Local Storage Synchronization

---

## 📦 Directory Structure

```text
├── src/
│   ├── components/
│   │   ├── ProfileAuth.tsx         # User Auth, Profiles, Achievements, and Biometrics Sliders
│   │   ├── SocialShareHub.tsx      # Community Feed, Challenge Board, and Leaderboards
│   │   ├── AIInsightsPanel.tsx     # Gemini-powered Nutritional and Exercise Analytics
│   │   ├── NotificationCenter.tsx  # Dynamic Alert and Motivational Popups
│   │   └── ...                     # Tailored metric widgets
│   ├── App.tsx                     # Main layout & Application Controller
│   ├── types.ts                    # Global TypeScript interfaces
│   └── index.css                   # Global Tailwind CSS imports & Typography pairing
├── server.ts                       # Custom Express + Vite Middleware Server entry point
├── package.json                    # Dependency manifest and execution scripts
└── metadata.json                   # Platform-wide capabilities and manifest configuration
```

---

## 🔧 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/vitality-core-ai.git
cd vitality-core-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and append your secure Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:3000`.

### 5. Production Build
To bundle the frontend assets and compile the Express server entry point:
```bash
npm run build
npm start
```

---

## 🛡️ Sandbox Access Credentials
To test the Athlete Accounts and secure session-state features immediately, use the default sandbox profile credentials:
*   **Email**: `athlete@vitalitycore.ai`
*   **Password**: `password123`
*   *Alternatively, register a brand new athlete profile directly inside the application!*
