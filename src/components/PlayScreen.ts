import './PlayScreen.css';
import { createCameraStage } from './CameraStage';
import { createHandOverlay } from './HandOverlay';
import { createHud } from './Hud';
import { createFeedbackFlash } from './FeedbackFlash';
import { createStatusBar } from './StatusBar';
import { createCountdown } from './Countdown';
import { createTargetDrawer } from './TargetDrawer';
import { createLoadingIndicator } from './LoadingIndicator';
import { createQuitButton } from './QuitButton';
import { createConfirmModal } from './ConfirmModal';
import type { HandOverlay } from './HandOverlay';
import type { Hud } from './Hud';
import type { FeedbackFlash } from './FeedbackFlash';
import type { StatusBar } from './StatusBar';
import type { Countdown } from './Countdown';
import type { TargetDrawer } from './TargetDrawer';
import type { LoadingIndicator } from './LoadingIndicator';
import type { QuitButton } from './QuitButton';
import type { ConfirmModal } from './ConfirmModal';
import { initTracker, stopTracker, hasHand, getFps, setLowPowerMode, getLandmarks, startTracking } from '../services/tracker';
import { recognizeGesture } from '../services/gestureRecognizer';
import { dispatch, getState, subscribe } from '../services/gameStore';
import { soundManager } from '../services/sounds';

export interface PlayScreenProps {
  onQuit: () => void;
}

export interface PlayScreen {
  el: HTMLElement;
  update: (props: PlayScreenProps) => void;
  destroy: () => void;
}

export function createPlayScreen(_props: PlayScreenProps): PlayScreen {
  const el = document.createElement('div');
  el.className = 'play-screen';

  let handOverlay: HandOverlay | null = null;
  let hud: Hud | null = null;
  let feedbackFlash: FeedbackFlash | null = null;
  let statusBar: StatusBar | null = null;
  let countdown: Countdown | null = null;
  let targetDrawer: TargetDrawer | null = null;
  let loadingIndicator: LoadingIndicator | null = null;
  let quitButton: QuitButton | null = null;
  let confirmModal: ConfirmModal | null = null;
  let animationId: number | null = null;
  let unsubscribe: (() => void) | null = null;
  
  let lowPowerEnabled = false;
  let showingFeedback = false;
  let feedbackTimeout: number | null = null;
  let lastHandSeenTime = Date.now();
  let noHandWarningShown = false;
  let frameCount = 0;
  let gestureHoldFrames = 0;
  const GESTURE_HOLD_THRESHOLD = 30; // Hold gesture for ~0.5 seconds at 60fps
  let countdownValue = 3;
  let countdownStartTime = Date.now();
  let roundStartTime = 0;

  const cameraStage = createCameraStage({
    onBackToMenu: _props.onQuit,
    onVideoReady: async (video) => {
      // Show loading indicator starting at 0%
      loadingIndicator = createLoadingIndicator({
        message: 'INITIALIZING HAND TRACKING SYSTEMS',
        progress: 0,
      });
      el.appendChild(loadingIndicator.el);

      try {
        // Stage 1: Camera ready (33%)
        if (loadingIndicator) {
          loadingIndicator.update({ progress: 33 });
        }
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Stage 2: Loading MediaPipe (66%)
        if (loadingIndicator) {
          loadingIndicator.update({ progress: 66 });
        }
        
        // Initialize tracker but don't start detection loop yet
        await initTracker(video, false); // Pass false to prevent auto-start
        
        // Stage 3: Complete (100%)
        if (loadingIndicator) {
          loadingIndicator.update({ progress: 100 });
        }
        
        // Hold at 100% for a moment before removing
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remove loading indicator
        if (loadingIndicator) {
          loadingIndicator.destroy();
          el.removeChild(loadingIndicator.el);
          loadingIndicator = null;
        }
        
        const canvas = cameraStage.getCanvas();
        handOverlay = createHandOverlay({
          canvas,
          stroke: [], // Not used anymore
        });

        const state = getState();
        
        hud = createHud({
          score: state.score,
          streak: state.streak,
          hp: state.hp,
          timerProgress: 1,
          targetShape: state.currentTarget,
        });

        feedbackFlash = createFeedbackFlash({
          visible: false,
          success: false,
          accuracy: 0,
        });

        statusBar = createStatusBar({
          handDetected: false,
          fps: 0,
          lowPowerMode: false,
          onToggleLowPower: () => {
            lowPowerEnabled = !lowPowerEnabled;
            setLowPowerMode(lowPowerEnabled);
          },
        });

        targetDrawer = createTargetDrawer({
          shape: state.currentTarget,
        });

        quitButton = createQuitButton({
          onClick: () => {
            // Show confirmation modal
            confirmModal = createConfirmModal({
              title: 'QUIT GAME',
              message: 'Are you sure you want to quit? All progress will be lost.',
              onConfirm: () => {
                if (confirmModal) {
                  confirmModal.destroy();
                  el.removeChild(confirmModal.el);
                  confirmModal = null;
                }
                _props.onQuit();
              },
              onCancel: () => {
                if (confirmModal) {
                  confirmModal.destroy();
                  el.removeChild(confirmModal.el);
                  confirmModal = null;
                }
              },
            });
            el.appendChild(confirmModal.el);
          },
        });

        const quitContainer = document.createElement('div');
        quitContainer.className = 'play-screen__quit';
        quitContainer.appendChild(quitButton.el);

        el.appendChild(cameraStage.el);
        el.appendChild(hud.el);
        el.appendChild(feedbackFlash.el);
        el.appendChild(statusBar.el);
        el.appendChild(targetDrawer.el);
        el.appendChild(quitContainer);

        // Subscribe to store changes
        unsubscribe = subscribe(updateFromStore);

        // Show countdown - ensure it starts at 3 by delaying the timer start
        countdownValue = 3;
        countdown = createCountdown({ value: 3 });
        cameraStage.el.appendChild(countdown.el);
        
        // Delay timer start by one frame to ensure "3" displays first
        requestAnimationFrame(() => {
          countdownStartTime = Date.now();
        });

        // Start rendering loop
        function renderLoop(): void {
          if (!handOverlay || !hud || !statusBar || !targetDrawer) return;

          const state = getState();
          
          frameCount++;
          
          // Handle countdown
          if (countdown) {
            // Only start counting if timer has been initialized
            if (countdownStartTime > 0) {
              const elapsed = Date.now() - countdownStartTime;
              // Calculate countdown value: starts at 3, then 2, then 1, then 0 (GO!)
              const newValue = Math.max(0, 3 - Math.floor(elapsed / 1000));
              
              // Only update if value changed
              if (newValue !== countdownValue && newValue >= 0) {
                countdownValue = newValue;
                countdown.update({ value: countdownValue });
              }
              
              // Remove countdown when finished (after showing GO! for 1 second)
              // Total time: 3s (3,2,1) + 1s (GO!) = 4s
              if (elapsed >= 4000) {
                countdown.destroy();
                cameraStage.el.removeChild(countdown.el);
                countdown = null;
                // Show video now
                video.classList.add('camera-stage__video--visible');
                // Start hand tracking now
                startTracking();
                // Start timer for first round
                roundStartTime = Date.now();
              }
            }
          }
          
          const handDetected = hasHand();

          // Calculate timer progress
          let timerProgress = 1;
          if (!countdown && state.gameState === 'playing' && roundStartTime > 0) {
            const elapsed = Date.now() - roundStartTime;
            const ROUND_TIME = 10000; // 10 seconds
            timerProgress = Math.max(0, 1 - elapsed / ROUND_TIME);
            
            // Check for timeout
            if (elapsed >= ROUND_TIME) {
              console.log('TIMEOUT!');
              dispatch({ type: 'TIMEOUT' });
              roundStartTime = Date.now(); // Reset timer for next round
            }
          }

          // Only run game logic after countdown
          if (!countdown && state.gameState === 'playing' && handDetected && !showingFeedback) {
            // Get landmarks and recognize gesture
            const landmarks = getLandmarks();
            
            if (landmarks) {
              const result = recognizeGesture(landmarks);
              
              if (result && result.gesture === state.currentTarget) {
                // Correct gesture detected!
                gestureHoldFrames++;
                
                // Show progress indicator in console
                if (gestureHoldFrames % 10 === 0) {
                  console.log(`Holding correct gesture: ${gestureHoldFrames}/${GESTURE_HOLD_THRESHOLD}`);
                }
                
                if (gestureHoldFrames >= GESTURE_HOLD_THRESHOLD) {
                  // Gesture held long enough!
                  console.log('GESTURE MATCHED:', result.gesture);
                  
                  showingFeedback = true;
                  gestureHoldFrames = 0;
                  
                  // Play success sound
                  soundManager.playSuccess();
                  
                  feedbackFlash?.update({
                    visible: true,
                    success: true,
                    accuracy: Math.round(result.confidence * 100),
                  });

                  dispatch({ type: 'STROKE_SCORED', accuracy: Math.round(result.confidence * 100) });

                  // Reset timer for next round - sync with when store changes target
                  setTimeout(() => {
                    roundStartTime = Date.now();
                  }, 50);

                  if (feedbackTimeout) clearTimeout(feedbackTimeout);
                  feedbackTimeout = window.setTimeout(() => {
                    feedbackFlash?.update({
                      visible: false,
                      success: false,
                      accuracy: 0,
                    });
                    showingFeedback = false;
                  }, 1500);
                }
              } else {
                // Wrong gesture or no gesture
                if (gestureHoldFrames > 0) {
                  console.log('Gesture lost or wrong');
                }
                gestureHoldFrames = 0;
              }
            }
          }

          // Update HUD
          hud.update({
            score: state.score,
            streak: state.streak,
            hp: state.hp,
            timerProgress: timerProgress,
            targetShape: state.currentTarget,
          });

          // Update target drawer
          targetDrawer.update({
            shape: state.currentTarget,
          });

          // Check for "no hand" warning
          if (handDetected) {
            lastHandSeenTime = Date.now();
            noHandWarningShown = false;
          } else if (!noHandWarningShown && Date.now() - lastHandSeenTime > 2000) {
            console.log('No hand detected for 2 seconds');
            noHandWarningShown = true;
          }

          // Update status bar
          statusBar.update({
            handDetected: hasHand(),
            fps: getFps(),
            lowPowerMode: lowPowerEnabled,
            onToggleLowPower: () => {
              lowPowerEnabled = !lowPowerEnabled;
              setLowPowerMode(lowPowerEnabled);
            },
          });

          handOverlay.update({ canvas, stroke: [] });
          handOverlay.draw();

          animationId = requestAnimationFrame(renderLoop);
        }

        renderLoop();
      } catch (error) {
        // Remove loading indicator on error
        if (loadingIndicator) {
          loadingIndicator.destroy();
          el.removeChild(loadingIndicator.el);
          loadingIndicator = null;
        }
        console.error('Failed to initialize tracker:', error);
      }
    },
  });

  function updateFromStore(): void {
    const state = getState();
    
    if (hud) {
      hud.update({
        score: state.score,
        streak: state.streak,
        hp: state.hp,
        timerProgress: 1,
        targetShape: state.currentTarget,
      });
    }

    if (targetDrawer) {
      targetDrawer.update({
        shape: state.currentTarget,
      });
    }
  }

  el.appendChild(cameraStage.el);

  return {
    el,
    update(_nextProps: PlayScreenProps) {
      // Props not used in this screen
    },
    destroy() {
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      if (unsubscribe) {
        unsubscribe();
      }
      if (countdown) {
        countdown.destroy();
      }
      if (handOverlay) {
        handOverlay.destroy();
      }
      if (hud) {
        hud.destroy();
      }
      if (feedbackFlash) {
        feedbackFlash.destroy();
      }
      if (statusBar) {
        statusBar.destroy();
      }
      if (targetDrawer) {
        targetDrawer.destroy();
      }
      if (loadingIndicator) {
        loadingIndicator.destroy();
      }
      if (quitButton) {
        quitButton.destroy();
      }
      if (confirmModal) {
        confirmModal.destroy();
      }
      stopTracker();
      cameraStage.destroy();
    },
  };
}
