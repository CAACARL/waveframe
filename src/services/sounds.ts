// Sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = true;

  constructor() {
    // Initialize on first user interaction
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.init(), { once: true });
      document.addEventListener('keydown', () => this.init(), { once: true });
    }
  }

  private init(): void {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.audioContext.destination);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  private ensureInit(): boolean {
    if (!this.audioContext || !this.masterGain) {
      this.init();
    }
    return this.enabled && !!this.audioContext && !!this.masterGain;
  }

  // Success sound - upward chime
  playSuccess(): void {
    if (!this.ensureInit() || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Create oscillator for melodic sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Bright, upward melody
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.linearRampToValueAtTime(659.25, now + 0.05); // E5
    osc.frequency.linearRampToValueAtTime(783.99, now + 0.1); // G5
    
    // Quick fade envelope
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Fail sound - downward tone
  playFail(): void {
    if (!this.ensureInit() || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Create oscillator for fail tone
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Downward tone
    osc.type = 'square';
    osc.frequency.setValueAtTime(311.13, now); // Eb4
    osc.frequency.linearRampToValueAtTime(207.65, now + 0.1); // Ab3
    
    // Quick fade
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Game over sound - dramatic descending notes
  playGameOver(): void {
    if (!this.ensureInit() || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // First note - high
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.start(now);
    osc1.stop(now + 0.3);
    
    // Second note - mid
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(392.00, now + 0.15); // G4
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.45);
    
    // Third note - low
    const osc3 = this.audioContext.createOscillator();
    const gain3 = this.audioContext.createGain();
    osc3.connect(gain3);
    gain3.connect(this.masterGain);
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(261.63, now + 0.3); // C4
    gain3.gain.setValueAtTime(0.4, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    osc3.start(now + 0.3);
    osc3.stop(now + 0.8);
  }

  // Combo milestone sound - celebratory fanfare
  playComboMilestone(): void {
    if (!this.ensureInit() || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Triumphant ascending chord
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      const startTime = now + (index * 0.05);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
    
    // Add a bright sweep at the end
    const sweep = this.audioContext.createOscillator();
    const sweepGain = this.audioContext.createGain();
    sweep.connect(sweepGain);
    sweepGain.connect(this.masterGain);
    
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(1046.50, now + 0.15); // C6
    sweep.frequency.exponentialRampToValueAtTime(2093.00, now + 0.35); // C7
    
    sweepGain.gain.setValueAtTime(0.2, now + 0.15);
    sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    sweep.start(now + 0.15);
    sweep.stop(now + 0.35);
  }

  // Quit sound - short dismissal tone
  playQuit(): void {
    if (!this.ensureInit() || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440.00, now); // A4
    osc.frequency.linearRampToValueAtTime(220.00, now + 0.08); // A3
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
