import './CameraStage.css';
import { CAMERA_WIDTH, CAMERA_HEIGHT } from '../services/constants';
import { createButton } from './Button';

export interface CameraStageProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
}

export interface CameraStage {
  el: HTMLElement;
  update: (props: CameraStageProps) => void;
  destroy: () => void;
  getCanvas: () => HTMLCanvasElement;
  getVideo: () => HTMLVideoElement | null;
}

export function createCameraStage(props: CameraStageProps): CameraStage {
  const el = document.createElement('div');
  el.className = 'camera-stage';

  const placeholder = document.createElement('div');
  placeholder.className = 'camera-stage__placeholder';

  const startButton = createButton({
    text: 'Start Camera',
    onClick: initCamera,
  });

  placeholder.appendChild(startButton.el);
  el.appendChild(placeholder);

  let video: HTMLVideoElement | null = null;
  const canvas = document.createElement('canvas');
  canvas.className = 'camera-stage__canvas';
  canvas.width = CAMERA_WIDTH;
  canvas.height = CAMERA_HEIGHT;

  let stream: MediaStream | null = null;

  async function initCamera(): Promise<void> {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: CAMERA_WIDTH,
          height: CAMERA_HEIGHT,
        },
      });

      video = document.createElement('video');
      video.className = 'camera-stage__video';
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      video.addEventListener('loadedmetadata', () => {
        el.removeChild(placeholder);
        if (video) {
          el.appendChild(video);
          el.appendChild(canvas);
          props.onVideoReady?.(video);
        }
      });
    } catch (error) {
      const errorEl = document.createElement('div');
      errorEl.className = 'camera-stage__error';
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        errorEl.textContent = 'Camera permission denied. Please allow camera access and refresh.';
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        errorEl.textContent = 'No camera found. Please connect a camera and refresh.';
      } else {
        errorEl.textContent = 'Camera error. Please check your camera and refresh.';
      }

      placeholder.innerHTML = '';
      placeholder.appendChild(errorEl);
    }
  }

  return {
    el,
    update(nextProps: CameraStageProps) {
      props = nextProps;
    },
    destroy() {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      startButton.destroy();
    },
    getCanvas() {
      return canvas;
    },
    getVideo() {
      return video;
    },
  };
}
