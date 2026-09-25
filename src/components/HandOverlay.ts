import { CAMERA_WIDTH, CAMERA_HEIGHT } from '../services/constants';
import { getLandmarks } from '../services/tracker';

export interface HandOverlayProps {
  canvas: HTMLCanvasElement;
  stroke: Array<{ x: number; y: number }>;
}

export interface HandOverlay {
  el: null;
  update: (props: HandOverlayProps) => void;
  destroy: () => void;
  draw: () => void;
}

// Hand skeleton connections (MediaPipe hand landmark indices)
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17]
];

export function createHandOverlay(props: HandOverlayProps): HandOverlay {
  const ctx = props.canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  function draw(): void {
    if (!ctx) return;

    ctx.clearRect(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);

    // Draw hand skeleton
    const landmarks = getLandmarks();
    if (landmarks) {
      // Draw connections (bones)
      ctx.strokeStyle = '#00d9ff'; // Tactical cyan
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0, 217, 255, 0.5)';
      ctx.shadowBlur = 8;

      HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        
        const x1 = start.x * CAMERA_WIDTH;
        const y1 = start.y * CAMERA_HEIGHT;
        const x2 = end.x * CAMERA_WIDTH;
        const y2 = end.y * CAMERA_HEIGHT;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Reset shadow for joints
      ctx.shadowBlur = 0;

      // Draw joint points
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * CAMERA_WIDTH;
        const y = landmark.y * CAMERA_HEIGHT;

        // Fingertips are larger
        const isFingertip = [4, 8, 12, 16, 20].includes(index);
        const radius = isFingertip ? 4 : 3;

        // Draw outer ring
        ctx.beginPath();
        ctx.arc(x, y, radius + 1, 0, 2 * Math.PI);
        ctx.fillStyle = '#0a0e14'; // Dark background
        ctx.fill();

        // Draw inner dot
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#00d9ff'; // Tactical cyan
        ctx.fill();

        // Add glow to fingertips
        if (isFingertip) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    }

    // Draw current stroke (if any)
    if (props.stroke.length > 0) {
      ctx.shadowColor = 'rgba(0, 217, 255, 0.4)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#00d9ff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(props.stroke[0].x, props.stroke[0].y);
      for (let i = 1; i < props.stroke.length; i++) {
        ctx.lineTo(props.stroke[i].x, props.stroke[i].y);
      }
      ctx.stroke();
      
      ctx.shadowBlur = 0;
    }
  }

  return {
    el: null,
    update(nextProps: HandOverlayProps) {
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
    draw,
  };
}
