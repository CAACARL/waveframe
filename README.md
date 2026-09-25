# WAVEFRAME

A tactical gesture-based reflex game with real-time hand tracking. Match target gestures using your hands before time runs out. Features military-inspired UI, combo multipliers, and competitive leaderboards.

## Features

- 👋 **7 Gesture Recognition**: thumbs-up 👍, peace ✌️, open-hand 🖐️, ok-sign 👌, rock 🤘, pointer ☝️, call-me 🤙
- 📹 **Real-time Hand Tracking** with MediaPipe vision AI
- ⚡ **10-Second Rounds** with visual timer countdown
- 💚 **HP System** with escalating damage for consecutive failures
- 🔥 **Combo Multipliers** (up to 100X+) with color-coded tiers
- 🏆 **Global Leaderboard** with podium rankings and game history
- 🎯 **Tactical UI** with military-style HUD and angled components
- 🎮 **Hand Skeleton Visualization** with cyan wireframe overlay

## Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+
- Modern browser with camera support (Chrome/Edge recommended)
- HTTPS connection (localhost works for development)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser and allow camera access when prompted.

### Production Build

```bash
npm run build
npm run preview
```

## How to Play

1. **Start Game**: Click "START GAME" from the main menu
2. **Camera Access**: Allow camera permissions when prompted
3. **Wait for Countdown**: Loading indicator shows initialization progress (3, 2, 1, GO!)
4. **Make Gestures**: 
   - Hold your hand **palm-forward** with fingers facing the camera
   - Match the target gesture shown in the right-side drawer
   - Hold the gesture steady until it registers (cyan skeleton tracks your hand)
5. **Beat the Timer**: You have 10 seconds per round to match the target
6. **Build Combos**: Successful matches build your streak multiplier (2X, 5X, 10X... 100X+!)
7. **Survive**: You start with 100 HP. Consecutive failures deal escalating damage (10 HP → 20 HP → 30 HP...)
8. **Game Over**: When HP reaches 0, enter your name to save your score to the leaderboard

### Important Notes

⚠️ **Gestures must be palm-forward** - fingers facing the camera, not backhands. The system doesn't read backhand gestures well.

### Controls

- **Click START GAME**: Start game from menu
- **Click RANKINGS**: View leaderboard with top 10 performances
- **Click EXIT**: Close the application
- **Mouse/Touch**: Navigate all UI elements

## Architecture

### Component-Based System

All UI components follow a factory function pattern:

```typescript
export function createComponent(props: Props): Component {
  const el = document.createElement('div');
  // Build DOM once
  
  return {
    el,                    // Root element
    update(nextProps) {},  // Update in place
    destroy() {},          // Cleanup
  };
}
```

**Key Principles:**
- DOM built once, updated in place (no `innerHTML` in hot paths)
- Props in, callbacks out
- No direct store access in components
- Co-located CSS with prefixed class names
- Parent manages child lifecycle

### Components (`src/components/`)

### Components (`src/components/`)

**Screens:**
- `App`: Root component, manages screen routing (menu → play → nameInput → gameOver)
- `MenuScreen`: Landing screen with START GAME, RANKINGS, and EXIT buttons
- `PlayScreen`: Main game screen with camera, hand tracking, HUD, and target drawer
- `NameInputScreen`: Post-game name entry screen before final results
- `GameOverScreen`: Final score display with leaderboard ranking and restart options
- `RankingsScreen`: Leaderboard with podium (top 3) and full top 10 table

**Game UI Components:**
- `CameraStage`: Video feed with cyan hand skeleton overlay
- `HandOverlay`: Draws hand landmarks as wireframe with joint connections
- `TargetDrawer`: Right-side tactical panel showing target gesture
- `TargetPreview`: Displays gesture emoji in drawer
- `Hud`: Composites HP, score, streak, timer
- `HpDisplay`: Color-coded health bar (green/yellow/red with pulsing)
- `ScoreDisplay`: Current score with tactical styling
- `StreakBadge`: Combo multiplier with 10 color tiers (cyan → white/rainbow at 100X+)
- `TimerBar`: 10-second countdown progress bar
- `FeedbackFlash`: "MATCHED!" success feedback
- `LoadingIndicator`: Initialization progress bar with loading stages
- `Countdown`: 3-2-1-GO countdown before game starts
- `StatusBar`: Hand detection status indicator
- `Button`: Shared tactical button component with angled corners

### Services (`src/services/`)

Services are pure modules with no DOM manipulation:

**tracker** - Hand tracking with MediaPipe
- Manages camera stream and HandLandmarker
- Exposes: `getLandmarks()`, `hasHand()`, `startTracking()`
- Delayed start support for proper initialization
- Provides hand landmark data for gesture recognition

**gestureRecognizer** - Gesture recognition
- Implements 7 gestures: thumbs-up, peace, open-hand, ok-sign, rock, pointer, call-me
- Uses finger extension detection and distance calculations
- Returns gesture type with confidence score
- Lenient thresholds for easier detection (5% extension threshold)

**gameStore** - State management
- State machine: `menu`, `playing`, `nameInput`, `gameOver`
- Actions: `START`, `TIMEOUT`, `RESTART`, `TO_MENU`, `SAVE_NAME`
- Game rules: 10s rounds, HP system with escalating damage, combo multipliers
- Tracks: score, HP, streak, maxStreak, consecutiveFails

**storage** - Persistence
- Wraps localStorage with try/catch and in-memory fallback
- Stores: highScore, gameHistory (top 10 performances with name, score, streak, date)
- Backwards compatible with old localStorage format

**constants** - Tunable parameters
- Game, tracking, and gesture parameters
- See section below for values

### Data Flow

```
tracker (hand landmarks) 
  → gestureRecognizer (gesture detection)
  → PlayScreen (match validation)
  → gameStore.dispatch()
  → store notifies App
  → App updates components via update()
```

Only `gameStore` mutates game state. Components are pure presentational.

## Game Mechanics

### HP System
- Start with **100 HP**
- Failing to match a gesture deals damage:
  - 1st consecutive fail: **-10 HP**
  - 2nd consecutive fail: **-20 HP**
  - 3rd consecutive fail: **-30 HP**
  - Pattern continues with escalating damage
- Successfully matching a gesture resets consecutive fails to 0
- Game over when HP reaches 0

### Combo System
- Build streaks by matching consecutive gestures
- Score multiplier = streak count (5 streak = 5X multiplier)
- **10 Color Tiers**:
  - 10X: Cyan
  - 20X: Green
  - 30X: Lime
  - 40X: Yellow
  - 50X: Orange
  - 60X: Red-Orange
  - 70X: Red
  - 80X: Magenta
  - 90X: Purple
  - 100X+: White with rainbow animation
- Failing a gesture resets streak to 0

### Scoring
- Base points: 80 per successful match
- Final score = base points × streak multiplier
- Example: 80 × 10X = 800 points

## Tunable Constants

Edit `src/services/constants.ts` to adjust gameplay:

### Game Parameters
- `STARTING_HP`: 100 (starting health points)
- `BASE_DAMAGE`: 10 (damage for first consecutive fail, escalates by +10 each time)
- `ROUND_TIME_MS`: 10000 (10 seconds per round)
- `SHAPES`: Array of 7 gestures (thumbs-up, peace, open-hand, ok-sign, rock, pointer, call-me)

### Tracking Parameters
- `CAMERA_WIDTH`: 640
- `CAMERA_HEIGHT`: 480
- `NO_HAND_TIMEOUT_MS`: 2000

## Performance

Optimized for real-time gesture tracking:

- Camera at 640x480 resolution
- Single hand tracking (`numHands: 1`)
- DOM updates in place, no full re-renders
- Canvas-based hand skeleton rendering
- Proper cleanup in component `destroy()` methods
- No memory leaks

## Deployment

**Important:** Camera access requires HTTPS in production (localhost works for dev).

Deploy the `dist/` folder after `npm run build` to any static hosting service:
- Vercel, Netlify, GitHub Pages, etc.
- Ensure HTTPS is enabled

## Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Best effort (MediaPipe support may vary)
- **Safari**: Best effort (camera permissions may differ)

## Project Structure

```
waveframe/
├── public/
│   ├── wasm/                    # MediaPipe WASM files
│   ├── hand_landmarker.task     # Hand tracking model
│   └── favicon.svg
├── src/
│   ├── components/              # UI components
│   │   ├── App.ts/css
│   │   ├── MenuScreen.ts/css
│   │   ├── PlayScreen.ts/css
│   │   ├── NameInputScreen.ts/css
│   │   ├── GameOverScreen.ts/css
│   │   ├── RankingsScreen.ts/css
│   │   ├── CameraStage.ts/css
│   │   ├── HandOverlay.ts
│   │   ├── TargetDrawer.ts/css
│   │   ├── TargetPreview.ts/css
│   │   ├── Hud.ts/css
│   │   ├── HpDisplay.ts/css
│   │   ├── ScoreDisplay.ts/css
│   │   ├── StreakBadge.ts/css
│   │   ├── TimerBar.ts/css
│   │   ├── LoadingIndicator.ts/css
│   │   ├── Countdown.ts/css
│   │   ├── FeedbackFlash.ts/css
│   │   ├── StatusBar.ts/css
│   │   ├── LivesDisplay.ts/css
│   │   └── Button.ts/css
│   ├── services/                # Business logic
│   │   ├── tracker.ts           # Hand tracking
│   │   ├── gestureRecognizer.ts # Gesture recognition
│   │   ├── gameStore.ts         # State management
│   │   ├── storage.ts           # Persistence
│   │   └── constants.ts         # Tunables
│   ├── main.ts                  # Entry point
│   └── styles.css               # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Development Notes

### Vite Version
This project uses Vite 8.3.0. Configuration follows ESM conventions with `"type": "module"` in package.json.

### TypeScript
Strict mode enabled. All new files are `.ts` with minimal, precise types.

### No Framework
Pure vanilla TypeScript with factory function components. No React, Vue, or other frameworks.

### MediaPipe Model
The `hand_landmarker.task` model file (~7.8MB) is downloaded automatically during setup from:
```
https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
```

### Testing in Console
The `gestureRecognizer` exposes a test helper on `window`:

```javascript
// Test gesture recognizer (requires hand landmarks array)
window.gestureRecognizer.recognizeGesture(landmarks);
```

## Troubleshooting

**Camera not working:**
- Ensure HTTPS (or localhost for dev)
- Check browser permissions
- Try Chrome/Edge if other browsers fail

**Hand tracking not detecting:**
- Ensure good lighting
- Keep hand within camera view and palm facing forward (fingers toward camera)
- Backhanded gestures won't register properly
- Try adjusting camera angle
- Check console for initialization errors

**Gestures not registering:**
- Make sure your palm is facing the camera (not showing the back of your hand)
- Hold gestures steady for ~0.5 seconds
- Keep fingers clearly separated for gestures like "peace" or "rock"
- Ensure hand is well-lit and in focus

**Build errors:**
- Ensure Node.js 20.19+ or 22.12+
- Delete `node_modules` and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

MIT

## Credits

Built with:
- [Vite](https://vite.dev/) - Build tool
- [MediaPipe](https://developers.google.com/mediapipe) - Hand tracking
- TypeScript & Vanilla JS - No frameworks
