import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import {
  CAMERA_WIDTH,
  CAMERA_HEIGHT,
  INDEX_TIP_SMOOTHING_ALPHA,
  PINCH_THRESHOLD,
  PINCH_HYSTERESIS,
} from './constants';

interface Point {
  x: number;
  y: number;
}

let handLandmarker: HandLandmarker | null = null;
let video: HTMLVideoElement | null = null;
let animationId: number | null = null;
let lastVideoTime = -1;

// Smoothed index tip position
let smoothedTip: Point = { x: 0, y: 0 };
let hasHandDetected = false;
let isPinchingState = false;
let lastLandmarks: NormalizedLandmark[] | null = null;

// FPS tracking
let fps = 0;
let frameCount = 0;
let fpsUpdateTime = 0;

// Low power mode
let lowPowerMode = false;
let frameSkipCounter = 0;

function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

async function detectLoop(): Promise<void> {
  if (!handLandmarker || !video) return;

  const now = performance.now();
  
  // Calculate FPS
  frameCount++;
  if (now - fpsUpdateTime > 1000) {
    fps = frameCount;
    frameCount = 0;
    fpsUpdateTime = now;
  }

  // Skip frames in low power mode
  if (lowPowerMode) {
    frameSkipCounter++;
    if (frameSkipCounter % 2 !== 0) {
      animationId = requestAnimationFrame(detectLoop);
      return;
    }
  }

  // Skip if video time hasn't changed
  if (video.currentTime === lastVideoTime) {
    animationId = requestAnimationFrame(detectLoop);
    return;
  }
  lastVideoTime = video.currentTime;

  const results = handLandmarker.detectForVideo(video, now);
  
  // Debug: Log detection attempts occasionally
  if (frameCount % 120 === 0) {
    console.log('Detection running, hands found:', results.landmarks?.length || 0);
  }

  if (results.landmarks && results.landmarks.length > 0) {
    const landmarks = results.landmarks[0];
    lastLandmarks = landmarks;
    hasHandDetected = true;

    // Index tip is landmark 8
    const indexTip = landmarks[8];
    
    // Smooth using EMA
    if (smoothedTip.x === 0 && smoothedTip.y === 0) {
      smoothedTip.x = indexTip.x * CAMERA_WIDTH;
      smoothedTip.y = indexTip.y * CAMERA_HEIGHT;
    } else {
      smoothedTip.x = INDEX_TIP_SMOOTHING_ALPHA * indexTip.x * CAMERA_WIDTH + 
                      (1 - INDEX_TIP_SMOOTHING_ALPHA) * smoothedTip.x;
      smoothedTip.y = INDEX_TIP_SMOOTHING_ALPHA * indexTip.y * CAMERA_HEIGHT + 
                      (1 - INDEX_TIP_SMOOTHING_ALPHA) * smoothedTip.y;
    }

    // Pinch detection: thumb tip (4) and index tip (8)
    const thumbTip = landmarks[4];
    const indexTipRaw = landmarks[8];
    const pinchDistance = distance(thumbTip, indexTipRaw);

    // Hand size reference: wrist (0) to middle finger base (9)
    const wrist = landmarks[0];
    const middleBase = landmarks[9];
    const handSize = distance(wrist, middleBase);

    const relativePinchDistance = pinchDistance / handSize;

    // Hysteresis to prevent flickering
    const prevPinching = isPinchingState;
    if (isPinchingState) {
      if (relativePinchDistance > PINCH_THRESHOLD + PINCH_HYSTERESIS) {
        isPinchingState = false;
      }
    } else {
      if (relativePinchDistance < PINCH_THRESHOLD) {
        isPinchingState = true;
      }
    }
    
    // Debug log pinch state changes
    if (prevPinching !== isPinchingState) {
      console.log('Pinch state changed:', isPinchingState, 'distance:', relativePinchDistance.toFixed(3));
    }
  } else {
    hasHandDetected = false;
    lastLandmarks = null;
  }

  animationId = requestAnimationFrame(detectLoop);
}

export async function initTracker(videoElement: HTMLVideoElement, autoStart: boolean = true): Promise<void> {
  video = videoElement;

  // Initialize MediaPipe
  const vision = await FilesetResolver.forVisionTasks(
    `${import.meta.env.BASE_URL}wasm`
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `${import.meta.env.BASE_URL}hand_landmarker.task`,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.3,  // Lowered from default 0.5
    minHandPresenceConfidence: 0.3,   // Lowered from default 0.5
    minTrackingConfidence: 0.3,       // Lowered from default 0.5
  });

  // Only start detection loop if autoStart is true
  if (autoStart) {
    animationId = requestAnimationFrame(detectLoop);
  }
}

export function startTracking(): void {
  if (handLandmarker && video && animationId === null) {
    animationId = requestAnimationFrame(detectLoop);
  }
}

export function getIndexTip(): Point {
  return { ...smoothedTip };
}

export function isPinching(): boolean {
  return isPinchingState;
}

export function hasHand(): boolean {
  return hasHandDetected;
}

export function getFps(): number {
  return fps;
}

export function setLowPowerMode(enabled: boolean): void {
  lowPowerMode = enabled;
}

export function getLandmarks(): NormalizedLandmark[] | null {
  return lastLandmarks;
}

export function stopTracker(): void {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  handLandmarker = null;
  video = null;
  hasHandDetected = false;
  isPinchingState = false;
  smoothedTip = { x: 0, y: 0 };
  lastLandmarks = null;
}
