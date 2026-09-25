// Game parameters
export const PASS_SCORE = 70;
export const ROUND_TIME_MS = 10000;
export const STARTING_HP = 100;
export const BASE_DAMAGE = 10;
export const DIFFICULTY_STEP_INTERVAL = 3;
export const MIN_STROKE_POINTS = 20;
export const MIN_BOUNDING_BOX_SIZE = 10;

// Target shapes (gestures)
export const SHAPES = ['thumbs-up', 'peace', 'open-hand', 'ok-sign', 'rock', 'pointer', 'call-me'] as const;
export type Shape = typeof SHAPES[number];

// Tracking parameters
export const CAMERA_WIDTH = 640;
export const CAMERA_HEIGHT = 480;
export const INDEX_TIP_SMOOTHING_ALPHA = 0.4;
export const PINCH_THRESHOLD = 0.15; // Made more lenient (was 0.08)
export const PINCH_HYSTERESIS = 0.03; // Made more lenient (was 0.02)
export const NO_HAND_TIMEOUT_MS = 2000;

// Recognition parameters
export const RESAMPLE_POINTS = 64;
export const SCORE_RANGE = 100;
