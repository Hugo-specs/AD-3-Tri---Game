// ============================================================
// AUDIO SYSTEM - Web Audio API
// ============================================================

class AudioSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available');
        }
    }

    get volume() {
        return this.muted ? 0 : GAME_CONFIG.masterVolume;
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    _playTone(freq, duration, type = 'sine', vol = 1, delay = 0) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    _playNoise(duration, vol = 0.3) {
        if (!this.ctx || this.muted) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * vol;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();
    }

    playCatch() {
        this._playTone(880, 0.08, 'sine', 0.4);
        this._playTone(1320, 0.08, 'sine', 0.3, 0.04);
    }

    playQuickCatch() {
        this._playTone(1100, 0.06, 'sine', 0.5);
        this._playTone(1650, 0.06, 'sine', 0.4, 0.03);
        this._playTone(2200, 0.08, 'sine', 0.3, 0.06);
    }

    playMiss() {
        this._playTone(300, 0.15, 'sawtooth', 0.2);
        this._playTone(200, 0.2, 'sawtooth', 0.15, 0.05);
    }

    playHit() {
        this._playNoise(0.2, 0.5);
        this._playTone(100, 0.3, 'sawtooth', 0.4);
        this._playTone(60, 0.4, 'square', 0.3, 0.1);
    }

    playComboUp() {
        this._playTone(660, 0.06, 'sine', 0.3);
        this._playTone(880, 0.06, 'sine', 0.25, 0.06);
        this._playTone(1100, 0.1, 'sine', 0.2, 0.12);
    }

    playButton() {
        this._playTone(600, 0.05, 'sine', 0.2);
        this._playTone(900, 0.05, 'sine', 0.15, 0.03);
    }

    playGameOver() {
        this._playTone(440, 0.3, 'sawtooth', 0.3);
        this._playTone(330, 0.3, 'sawtooth', 0.25, 0.3);
        this._playTone(220, 0.5, 'sawtooth', 0.3, 0.6);
        this._playTone(165, 0.8, 'sawtooth', 0.2, 0.9);
    }

    playWarning() {
        this._playTone(200, 0.1, 'square', 0.3);
        this._playTone(200, 0.1, 'square', 0.3, 0.15);
    }

    playSandevistan() {
        if (!this.ctx || this.muted) return;
        // Cyberpunk Sandevistan activation: deep time-dilation warp + high digital resonance
        this._playTone(1200, 0.22, 'sawtooth', 0.45);
        this._playTone(280, 0.45, 'sawtooth', 0.5, 0.05);
        this._playTone(85, 0.6, 'sine', 0.6, 0.1);
        this._playNoise(0.25, 0.35);
        this._playTone(1800, 0.2, 'triangle', 0.3, 0.15);
        this._playTone(600, 0.3, 'sine', 0.35, 0.22);
    }

    playLevelUp() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            this._playTone(n, 0.12, 'sine', 0.3, i * 0.08);
        });
    }

    playNewRecord() {
        const notes = [523, 659, 784, 1047, 1319, 1568];
        notes.forEach((n, i) => {
            this._playTone(n, 0.15, 'sine', 0.35 - i * 0.03, i * 0.1);
        });
    }
}

const audio = new AudioSystem();
