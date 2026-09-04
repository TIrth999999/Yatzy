# Yatzy Clash: Dice Masters 🎲

A modern, production-ready, commercial-quality HTML5 Yatzy dice game built specifically for publishing on **CrazyGames.com**.

---

## Features & Highlights

- **Original Visual Identity**: Warm coral/amber and deep slate theme, tactile 3D perspective dice with SVG pips, smooth 60 FPS CSS keyframe rolling tumbles, and responsive particle confetti celebrations.
- **Strict, Pure Yatzy Rules**:
  - **Upper Section**: Ones, Twos, Threes, Fours, Fives, Sixes.
  - **Upper Bonus**: Dynamic progress meter (`0/63`). Grants **+35 points** as soon as upper subtotal reaches 63.
  - **Lower Section**: 3 of a Kind, 4 of a Kind, Full House, Small Straight (15 pts), Large Straight (20 pts), Yatzy (50 pts), Chance.
  - **Permanent Category Locking**: Scored categories lock permanently with clear visual badges.
- **Dual Dedicated Responsive Layouts** (No `transform: scale()` hacks!):
  - **Mobile Portrait (9:16 & touchscreens)**: Sticky bottom thumb zone with large touchable dice and dominant Roll button; smooth scrollable scorecard with thumb-friendly rows.
  - **Desktop / Web (16:9 widescreen)**: Spacious horizontal layout; left gameplay panel with prominent dice and keyboard controls (`R` to Roll, `1`-`5` to Hold, `Esc` to Pause); right dedicated scorecard panel displaying all 13 categories without vertical scrolling.
- **Three-Tier Bot AI Engine**:
  - **Easy**: Casual player behavior, recognizes obvious matches, occasional suboptimal holds, beatable.
  - **Medium**: Heuristic combination and straight detector with upper-bonus awareness.
  - **Hard**: Exhaustive $2^5 = 32$ hold-subset Expected Value (EV) calculation simulating reroll probability distributions, factoring in upper-bonus proximity, endgame scarcity, and strategic sacrifices.
  - **Fairness Guarantee**: The bot uses the exact same deterministic PRNG service (`RNGService`) as the player.
- **Procedural Web Audio Soundscape**:
  - Zero external MP3/WAV files! Built 100% on the HTML5 Web Audio API.
  - Acoustic dice rattles, wooden table clatters, tactile hold/release pops, chimes for scores, fanfares for Upper Bonus and Yatzy, and gentle procedural ambient music chords.
- **Player Retention & Progression**:
  - **Interactive Onboarding Tutorial**: Step-by-step interactive spotlight on first game with a Skip button.
  - **Comprehensive Statistics**: Total games, win rates, highest score, win streaks, and difficulty breakdowns.
  - **Achievements System**: 10 unlockable badges with real-time toast notifications.
  - **Unlockable Dice Skins**: Classic Ivory, Ruby Flame, Cyber Neon, Royal Gold, Ocean Wave.
  - **Daily Challenge Architecture**: Deterministic date-based seed (`YATZY-YYYY-MM-DD`) for global daily competitions.
- **CrazyGames SDK v3 Integration**:
  - Official SDK v3 loader with asynchronous loading start/stop and gameplay start/stop lifecycle tracking.
  - Non-intrusive midgame interstitial ads at natural transitions (between completed matches).
  - Rewarded ad integration for cosmetic dice skin unlocks.
  - Seamless offline / localhost fallback when SDK is blocked or unavailable.
- **Dev Debug Panel**: Accessible via the `~` key or `?debug=1` parameter (inject dice hands, skip bot delays, inspect AI decision logs).

---

## Project Structure

```
├── index.html                   # Entry point with CrazyGames SDK v3 & viewport config
├── package.json                 # Project scripts and dependencies
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite configuration
├── src/
│   ├── main.ts                  # Application bootstrapper and lifecycle wiring
│   ├── types/game.ts            # Core TypeScript interfaces, rules config, and types
│   ├── core/
│   │   ├── GameState.ts         # Centralized deterministic state model
│   │   ├── GameEngine.ts        # Turn coordinator and match orchestrator
│   │   └── EventBus.ts          # Typed pub/sub event bus
│   ├── dice/
│   │   ├── RNG.ts               # Seedable Mulberry32 PRNG
│   │   └── DiceEngine.ts        # 5-dice roll manager, hold states, roll counters
│   ├── scoring/
│   │   ├── ScoreRules.ts        # Pure, testable rule functions for all 13 categories
│   │   ├── ScoreEngine.ts       # Scorecard manager, bonus calculation (+35 at >= 63)
│   │   └── SmartRecommender.ts  # "Best Choice" heuristic recommendation engine
│   ├── bot/
│   │   ├── BotDecisionEngine.ts # Bot orchestrator, human-like thinking delays, dev logs
│   │   ├── EasyStrategy.ts      # Casual casual-mistake strategy
│   │   ├── MediumStrategy.ts    # Heuristic pair/straight strategy
│   │   └── HardStrategy.ts      # 32-hold EV calculation engine
│   ├── audio/
│   │   ├── SoundSynth.ts        # Web Audio procedural sound effect synthesizer
│   │   ├── MusicSynth.ts        # Web Audio ambient chord progression music
│   │   └── AudioManager.ts      # Master audio coordinator
│   ├── persistence/
│   │   ├── SaveManager.ts       # LocalStorage + CrazyGames Data adapter
│   │   ├── StatsManager.ts      # Persistent player records and win streaks
│   │   └── AchievementManager.ts# 10 achievement badges
│   ├── settings/
│   │   └── SettingsManager.ts   # Audio, animations, and gameplay preferences
│   ├── crazygames/
│   │   ├── CrazyGamesManager.ts # Official SDK v3 lifecycle methods
│   │   └── AdManager.ts         # Midgame and rewarded ad handlers
│   ├── daily/
│   │   └── DailyChallenge.ts    # Date-hashed challenge seed generator
│   ├── ui/
│   │   ├── UIManager.ts         # Master UI coordinator
│   │   ├── animations/Confetti.ts # High-performance canvas particle system
│   │   ├── components/          # Header, DiceBoard, Scorecard, Modals, DebugPanel
│   │   └── screens/MainMenu.ts  # Main menu and difficulty selector
│   └── styles/
│       ├── main.css             # Design tokens and common components
│       ├── dice.css             # 3D dice styling, pips, and tumble keyframes
│       ├── desktop.css          # Dedicated desktop horizontal layout
│       └── mobile.css           # Dedicated mobile portrait layout
└── test/
    ├── scoring.test.ts          # 17 pure scoring and bonus calculation tests
    ├── state.test.ts            # State transitions and turn rule tests
    └── simulation.test.ts       # Automated 120-game statistical bot benchmark
```

---

## Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Automated Tests
```bash
npm run test
```
Runs the full Vitest test suite including:
- 17 unit tests for all 13 scoring rules, bonus threshold, and edge cases.
- 3 state machine turn and category locking tests.
- 120-match statistical bot benchmark proving Hard AI dominates Medium and Easy bots in average scores and win rate.

### 4. Type Checking
```bash
npm run typecheck
```

---

## Production Build & CrazyGames Deployment

### 1. Build for Production
```bash
npm run build
```
The compiled, minified bundle will be output to the `dist/` directory:
- Extremely lightweight (< 120 kB total uncompressed; ~28 kB gzipped).
- Zero external asset dependencies.
- Zero audio files required (100% procedural synthesis).

### 2. Preview the Production Build Locally
```bash
npm run preview
```

### 3. Deploying to CrazyGames
1. Zip the contents of the `dist/` folder (ensure `index.html` is at the root of the zip file).
2. Go to the [CrazyGames Developer Portal](https://developer.crazygames.com/).
3. Upload the `.zip` archive.
4. The game automatically initializes the official CrazyGames SDK v3, reports `loadingStart`/`loadingStop` and `gameplayStart`/`gameplayStop`, and utilizes non-intrusive midgame and rewarded ads.
