// ============================================================
// UI SYSTEM - HUD, Floating Text, Screen Management
// ============================================================

class UISystem {
    constructor() {
        this.floatingTexts = [];
        this.levelBannerEl = null;

        // DOM refs
        this.hud = document.getElementById('hud');
        this.scoreEl = document.getElementById('hud-score');
        this.highscoreEl = document.getElementById('hud-highscore');
        this.comboEl = document.getElementById('hud-combo');
        this.multiplierEl = document.getElementById('hud-multiplier');
        this.levelEl = document.getElementById('hud-level');
        this.hpBar = document.getElementById('hud-hp');
        this.levelIndicator = document.getElementById('level-indicator');
        this.accuracyDisplay = document.getElementById('accuracy-display');
        this.menuScreen = document.getElementById('menu-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.menuHighscore = document.getElementById('menu-highscore');
        this.muteBtn = document.getElementById('mute-btn');
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
    }

    setLoading(pct) {
        this.loadingBar.style.width = pct + '%';
    }

    hideLoading() {
        this.loadingScreen.classList.add('hidden');
    }

    showHUD() {
        this.hud.classList.add('visible');
        this.levelIndicator.classList.add('visible');
        this.accuracyDisplay.classList.add('visible');
    }

    hideHUD() {
        this.hud.classList.remove('visible');
        this.levelIndicator.classList.remove('visible');
        this.accuracyDisplay.classList.remove('visible');
    }

    updateScore(score) {
        this.scoreEl.textContent = this._formatNumber(score);
    }

    updateHighScore(hs) {
        this.highscoreEl.textContent = this._formatNumber(hs);
        this.menuHighscore.textContent = 'HIGH SCORE: ' + this._padNumber(hs);
    }

    updateCombo(combo, multiplier) {
        this.comboEl.textContent = combo;
        this.multiplierEl.textContent = 'x' + multiplier;

        // Pop animation
        this.comboEl.classList.add('pop');
        setTimeout(() => this.comboEl.classList.remove('pop'), 100);

        // Color by multiplier
        const ci = Math.min(multiplier - 1, GAME_CONFIG.comboColors.length - 1);
        this.comboEl.style.color = GAME_CONFIG.comboColors[ci];
        this.comboEl.style.textShadow = `0 0 10px ${GAME_CONFIG.comboColors[ci]}`;
    }

    updateLevel(level) {
        this.levelEl.textContent = level;
        this.levelIndicator.textContent = 'LVL ' + level;
    }

    updateHP(hp, maxHP) {
        const pct = Math.max(0, (hp / maxHP) * 100);
        this.hpBar.style.width = pct + '%';
        if (pct < 25) {
            this.hpBar.classList.add('low');
        } else {
            this.hpBar.classList.remove('low');
        }
    }

    updateAccuracy(caught, total) {
        const acc = total > 0 ? Math.round((caught / total) * 100) : 100;
        this.accuracyDisplay.textContent = `ACC ${acc}%`;
    }

    updateMuteButton(muted) {
        this.muteBtn.textContent = muted ? '🔇 MUTE' : '🔊 SFX';
    }

    // Screens
    showScreen(screen) {
        screen.classList.add('active');
    }

    hideScreen(screen) {
        screen.classList.remove('active');
    }

    showMenu() {
        this.showScreen(this.menuScreen);
        this.hideScreen(this.pauseScreen);
        this.hideScreen(this.gameoverScreen);
        this.hideHUD();
    }

    showPause() {
        this.showScreen(this.pauseScreen);
    }

    hidePause() {
        this.hideScreen(this.pauseScreen);
    }

    showGameOver(score, highScore, maxCombo, accuracy, isNewRecord) {
        document.getElementById('go-score').textContent = this._formatNumber(score);
        document.getElementById('go-best').textContent = this._formatNumber(highScore);
        document.getElementById('go-combo').textContent = maxCombo;
        document.getElementById('go-accuracy').textContent = accuracy + '%';
        document.getElementById('new-record').style.display = isNewRecord ? 'block' : 'none';
        this.showScreen(this.gameoverScreen);
    }

    hideGameOver() {
        this.hideScreen(this.gameoverScreen);
    }

    // Floating score texts (rendered on canvas)
    addFloatingText(x, y, text, color = '#fff', size = 18) {
        this.floatingTexts.push({
            x, y,
            text,
            color,
            size,
            alpha: 1,
            vy: -60,
            life: 1
        });
        // Limit
        if (this.floatingTexts.length > 30) {
            this.floatingTexts.shift();
        }
    }

    updateFloatingTexts(dt) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.vy *= 0.97;
            ft.life -= dt;
            ft.alpha = Math.max(0, ft.life);
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    renderFloatingTexts(ctx) {
        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 8;
            ctx.font = `bold ${ft.size}px 'Orbitron', monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    showLevelUpBanner(level) {
        // Remove existing
        if (this.levelBannerEl) {
            this.levelBannerEl.remove();
        }
        const el = document.createElement('div');
        el.className = 'level-up-banner';
        el.textContent = `LEVEL ${level}`;
        document.getElementById('game-container').appendChild(el);
        this.levelBannerEl = el;
        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 2200);
    }

    _formatNumber(n) {
        return n.toLocaleString();
    }

    _padNumber(n) {
        return String(n).padStart(6, '0');
    }
}
