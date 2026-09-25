import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type GestureShape = 'thumbs-up' | 'peace' | 'open-hand' | 'ok-sign' | 'rock' | 'pointer' | 'call-me';

interface GestureResult {
  gesture: GestureShape;
  confidence: number;
}

function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isFingerExtended(landmarks: NormalizedLandmark[], fingerTip: number, fingerBase: number): boolean {
  const tip = landmarks[fingerTip];
  const base = landmarks[fingerBase];
  const wrist = landmarks[0];
  
  // Finger is extended if tip is farther from wrist than base
  const tipDist = distance(tip, wrist);
  const baseDist = distance(base, wrist);
  
  // More lenient threshold - only needs to be 5% farther instead of 10%
  return tipDist > baseDist * 1.05;
}

function isFingersClose(landmarks: NormalizedLandmark[], finger1: number, finger2: number, threshold: number = 0.05): boolean {
  return distance(landmarks[finger1], landmarks[finger2]) < threshold;
}

export function recognizeGesture(landmarks: NormalizedLandmark[]): GestureResult | null {
  if (!landmarks || landmarks.length < 21) return null;

  // Finger tip indices: thumb=4, index=8, middle=12, ring=16, pinky=20
  // Finger base indices: thumb=2, index=5, middle=9, ring=13, pinky=17
  
  const thumbExtended = isFingerExtended(landmarks, 4, 2);
  const indexExtended = isFingerExtended(landmarks, 8, 5);
  const middleExtended = isFingerExtended(landmarks, 12, 9);
  const ringExtended = isFingerExtended(landmarks, 16, 13);
  const pinkyExtended = isFingerExtended(landmarks, 20, 17);
  
  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;
  
  // Thumbs up: Only thumb extended, thumb pointing up
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    const thumbTip = landmarks[4];
    const wrist = landmarks[0];
    
    // More lenient - just check if thumb is generally above wrist
    if (thumbTip.y < wrist.y) {
      return { gesture: 'thumbs-up', confidence: 0.9 };
    }
  }
  
  // Peace sign: Index and middle extended, others closed
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return { gesture: 'peace', confidence: 0.85 };
  }
  
  // Pointer: Only index finger extended
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return { gesture: 'pointer', confidence: 0.9 };
  }
  
  // OK sign: Thumb and index touching, others extended
  if (isFingersClose(landmarks, 4, 8, 0.08) && middleExtended && ringExtended && pinkyExtended) {
    return { gesture: 'ok-sign', confidence: 0.85 };
  }
  
  // Open hand: All fingers extended
  if (extendedCount === 4 && thumbExtended) {
    return { gesture: 'open-hand', confidence: 0.85 };
  }
  
  // Rock (horns): Index and pinky extended, middle and ring closed
  if (indexExtended && pinkyExtended && !middleExtended && !ringExtended) {
    return { gesture: 'rock', confidence: 0.85 };
  }
  
  // Call me (shaka): Thumb and pinky extended, others closed
  if (thumbExtended && pinkyExtended && !indexExtended && !middleExtended && !ringExtended) {
    return { gesture: 'call-me', confidence: 0.85 };
  }
  
  return null;
}

// Console test helper
(window as any).gestureRecognizer = { recognizeGesture };
