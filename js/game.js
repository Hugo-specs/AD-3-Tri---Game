// ============================================================
// GAME ENGINE
// ============================================================

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = 'menu'; // menu, playing, paused, gameover

        // Systems
        this.ui = new UISystem();
        this.background = null;
        this.particles = new ParticleSystem(GAME_CONFIG.maxParticles);
        this.player = new Player(canvas);
        this.entities = new EntityPool(GAME_CONFIG.maxSimultaneousObjects + 10);

        // Images
        this.ammoImages = {};
        this.smasherImage = null;

        // Game state
        this.score = 0;
        this.highScore = this._loadHighScore();
        this.combo = 0;
        this.maxCombo = 0;
        this.multiplier = 1;
        this.hp = GAME_CONFIG.startingHP;
        this.level = 1;
        this.gameTime = 0;
        this.totalCaught = 0;
        this.totalMissed = 0;
        this.totalSpawned = 0;

        // Spawn
        this.spawnTimer = 0;
        this.spawnInterval = GAME_CONFIG.baseSpawnInterval;
        this.objectSpeed = GAME_CONFIG.baseObjectSpeed;
        this.smasherChance = GAME_CONFIG.smasherBaseChance;

        // Difficulty
        this.difficultyTimer = 0;
        this.lastLevel = 1;

        // Screen shake
        this.shakeTimer = 0;
        this.shakeX = 0;
        this.shakeY = 0;

        // Input
        this.keys = {};
        this.mouseX = null;
        this.mouseActive = false;

        // Delta time
        this.lastTimestamp = 0;
    }

    async init() {
        this.ui.setLoading(10);
        this.background = new CyberpunkBackground(this.canvas);
        this.ui.setLoading(30);

        // Load player
        await this.player.loadImage();
        this.ui.setLoading(50);

        // Load ammo images
        let loaded = 0;
        const total = AMMO_TYPES.length + 1;
        for (const ammoType of AMMO_TYPES) {
            this.ammoImages[ammoType.id] = await this._loadImage(ammoType.image);
            loaded++;
            this.ui.setLoading(50 + (loaded / total) * 40);
        }

        // Load smasher
        this.smasherImage = await this._loadImage(ENEMY_CONFIG.image);
        this.ui.setLoading(95);

        // Setup input
        this._setupInput();

        // Init high score display
        this.ui.updateHighScore(this.highScore);

        this.ui.setLoading(100);
        await new Promise(r => setTimeout(r, 300));
        this.ui.hideLoading();

        // Resize
        this._resize();
        window.addEventListener('resize', () => this._resize());

        // Start menu rendering
        this.state = 'menu';
        this.ui.showMenu();
        this.lastTimestamp = performance.now();
        this._loop(this.lastTimestamp);
    }

    _loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn('Failed to load:', src);
                resolve(null);
            };
            img.src = src;
        });
    }

    _setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.mouseActive = false;

            // Space or Enter to Start game from Menu
            if ((e.code === 'Space' || e.key === ' ' || e.key === 'Enter') && this.state === 'menu') {
                e.preventDefault();
                startGame();
                return;
            }

            // Space, Enter, or R to Restart game from Game Over
            if ((e.code === 'Space' || e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'r') && this.state === 'gameover') {
                e.preventDefault();
                restartGame();
                return;
            }

            // Space, Enter, or Esc to resume from Pause
            if ((e.code === 'Space' || e.key === ' ' || e.key === 'Enter') && this.state === 'paused') {
                e.preventDefault();
                this.resume();
                return;
            }

            if ((e.key === 'Escape' || e.key.toLowerCase() === 'p') && this.state === 'playing') {
                this.pause();
            } else if ((e.key === 'Escape' || e.key.toLowerCase() === 'p') && this.state === 'paused') {
                this.resume();
            }

            if (e.key.toLowerCase() === 'm') {
                const muted = audio.toggleMute();
                this.ui.updateMuteButton(muted);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Click on menu screen to start game effortlessly
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.addEventListener('click', (e) => {
                if (this.state === 'menu') {
                    startGame();
                }
            });
        }

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseActive = true;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseActive = false;
        });

        // Touch
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            this.mouseX = (e.touches[0].clientX - rect.left) * scaleX;
            this.mouseActive = true;
        }, { passive: false });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            this.mouseX = (e.touches[0].clientX - rect.left) * scaleX;
            this.mouseActive = true;
            audio.init();
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.mouseActive = false;
        });

        // Mute button
        document.getElementById('mute-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            audio.init();
            const muted = audio.toggleMute();
            this.ui.updateMuteButton(muted);
        });

        // Mouse click initializes audio
        this.canvas.addEventListener('click', () => audio.init());
    }

    _resize() {
        const container = document.getElementById('game-container');
        const cw = container.clientWidth;
        const ch = container.clientHeight;

        // Maintain aspect ratio close to 16:9
        const targetRatio = 16 / 9;
        let w, h;

        if (cw / ch > targetRatio) {
            h = ch;
            w = h * targetRatio;
        } else {
            w = cw;
            h = w / targetRatio;
        }

        this.canvas.width = Math.floor(w);
        this.canvas.height = Math.floor(h);
        this.canvas.style.width = Math.floor(w) + 'px';
        this.canvas.style.height = Math.floor(h) + 'px';

        this.player.resize();
        if (this.background) this.background.resize();
    }

    // ---- State Management ----

    start() {
        audio.init();
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.multiplier = 1;
        this.hp = GAME_CONFIG.startingHP;
        this.level = 1;
        this.lastLevel = 1;
        this.gameTime = 0;
        this.totalCaught = 0;
        this.totalMissed = 0;
        this.totalSpawned = 0;
        this.spawnTimer = 0;
        this.spawnInterval = GAME_CONFIG.baseSpawnInterval;
        this.objectSpeed = GAME_CONFIG.baseObjectSpeed;
        this.smasherChance = GAME_CONFIG.smasherBaseChance;
        this.difficultyTimer = 0;
        this.shakeTimer = 0;

        this.entities.deactivateAll();
        this.player.reset();

        this.ui.hideScreen(this.ui.menuScreen);
        this.ui.hideScreen(this.ui.pauseScreen);
        this.ui.hideScreen(this.ui.gameoverScreen);
        this.ui.showHUD();
        this.ui.updateScore(0);
        this.ui.updateCombo(0, 1);
        this.ui.updateLevel(1);
        this.ui.updateHP(this.hp, GAME_CONFIG.startingHP);
        this.ui.updateHighScore(this.highScore);
        this.ui.updateAccuracy(0, 0);

        this.state = 'playing';
        this.lastTimestamp = performance.now();
    }

    pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        this.ui.showPause();
        audio.playButton();
    }

    resume() {
        if (this.state !== 'paused') return;
        this.state = 'playing';
        this.ui.hidePause();
        this.lastTimestamp = performance.now();
        audio.playButton();
    }

    gameOver() {
        this.state = 'gameover';
        this.ui.hideHUD();

        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            this._saveHighScore(this.highScore);
            audio.playNewRecord();
        } else {
            audio.playGameOver();
        }

        const accuracy = this.totalSpawned > 0
            ? Math.round((this.totalCaught / this.totalSpawned) * 100) : 0;

        this.ui.updateHighScore(this.highScore);
        this.ui.showGameOver(this.score, this.highScore, this.maxCombo, accuracy, isNewRecord);
    }

    goToMenu() {
        this.state = 'menu';
        this.entities.deactivateAll();
        this.ui.hideScreen(this.ui.pauseScreen);
        this.ui.hideScreen(this.ui.gameoverScreen);
        this.ui.showMenu();
        this.lastTimestamp = performance.now();
        audio.playButton();
    }

    // ---- Game Loop ----

    _loop(timestamp) {
        let dt = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Clamp dt
        if (dt > 0.1) dt = 0.1;
        if (dt < 0) dt = 0;

        if (this.state === 'playing') {
            this._update(dt);
        }

        // Always update background and particles for visual continuity
        if (this.background) this.background.update(dt);

        this._render();

        requestAnimationFrame((ts) => this._loop(ts));
    }

    _update(dt) {
        this.gameTime += dt;

        // Difficulty
        this._updateDifficulty(dt);

        // Player input
        let inputDir = 0;
        if (this.keys['a'] || this.keys['arrowleft']) inputDir -= 1;
        if (this.keys['d'] || this.keys['arrowright']) inputDir += 1;
        this.player.update(dt, inputDir, this.mouseActive ? this.mouseX : null);

        // Spawn
        this._updateSpawn(dt);

        // Entities
        this.entities.update(dt);

        // Check collisions
        this._checkCollisions();

        // Check misses (off screen)
        this._checkMisses();

        // Particles
        this.particles.update(dt);

        // UI floating texts
        this.ui.updateFloatingTexts(dt);

        // Screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const intensity = GAME_CONFIG.shakeIntensity * (this.shakeTimer / GAME_CONFIG.shakeDuration);
            this.shakeX = (Math.random() - 0.5) * intensity * 2;
            this.shakeY = (Math.random() - 0.5) * intensity * 2;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        // Entity trails
        for (const e of this.entities.getActive()) {
            if (e.warningTimer > 0) continue;
            e.trailTimer += dt;
            if (e.trailTimer >= 0.05) {
                e.trailTimer = 0;
                this.particles.trail(e.centerX, e.centerY + e.drawHeight * 0.3, e.color);
            }
        }
    }

    _updateDifficulty(dt) {
        this.difficultyTimer += dt;
        const newLevel = Math.min(
            GAME_CONFIG.maxDifficulty,
            Math.floor(this.difficultyTimer / GAME_CONFIG.difficultyInterval) + 1
        );

        if (newLevel > this.lastLevel) {
            this.lastLevel = newLevel;
            this.level = newLevel;
            this.ui.updateLevel(this.level);
            this.ui.showLevelUpBanner(this.level);
            audio.playLevelUp();
        }

        const t = (this.level - 1) / (GAME_CONFIG.maxDifficulty - 1);
        this.spawnInterval = GAME_CONFIG.baseSpawnInterval - t * (GAME_CONFIG.baseSpawnInterval - GAME_CONFIG.minSpawnInterval);
        this.objectSpeed = GAME_CONFIG.baseObjectSpeed + t * (GAME_CONFIG.maxObjectSpeed - GAME_CONFIG.baseObjectSpeed);
        this.smasherChance = GAME_CONFIG.smasherBaseChance + t * (GAME_CONFIG.smasherMaxChance - GAME_CONFIG.smasherBaseChance);
    }

    _updateSpawn(dt) {
        this.spawnTimer += dt;
        if (this.spawnTimer < this.spawnInterval) return;
        this.spawnTimer = 0;

        if (this.entities.countActive() >= GAME_CONFIG.maxSimultaneousObjects) return;

        const isSmasher = Math.random() < this.smasherChance
            && this.entities.countDanger() < GAME_CONFIG.maxSimultaneousDanger;

        const entity = this.entities.get();
        if (!entity) return;

        const margin = this.canvas.width * 0.05;
        const x = margin + Math.random() * (this.canvas.width - margin * 2);

        if (isSmasher) {
            const speed = this.objectSpeed * ENEMY_CONFIG.speed * (0.8 + Math.random() * 0.4);
            entity.initSmasher(x, -50, speed, this.canvas.height, this.canvas.width, this.smasherImage);
            if (entity.hasSandevistan) {
                audio.playSandevistan();
                const modeNotice = entity.sandevistanMode === 'straight_fast' ? '⚡ SANDEVISTAN // BLITZ DASH!' : '⚡ SANDEVISTAN // WARP WEAVE!';
                this.ui.addFloatingText(this.canvas.width / 2, this.canvas.height * 0.28, modeNotice, '#00ffcc', 20);
            } else {
                audio.playWarning();
            }
        } else {
            const ammoType = this._pickAmmoType();
            const speed = this.objectSpeed * ammoType.speed * (0.8 + Math.random() * 0.4);
            const img = this.ammoImages[ammoType.id];
            entity.initAmmo(ammoType, x, -30, speed, this.canvas.height, img);
            this.totalSpawned++;
        }
    }

    _pickAmmoType() {
        // Weighted random by rarity
        const totalWeight = AMMO_TYPES.reduce((s, a) => s + a.rarity, 0);
        let r = Math.random() * totalWeight;
        for (const ammo of AMMO_TYPES) {
            r -= ammo.rarity;
            if (r <= 0) return ammo;
        }
        return AMMO_TYPES[0];
    }

    _checkCollisions() {
        const catchBox = this.player.getCatchHitbox();

        for (const e of this.entities.getActive()) {
            if (e.warningTimer > 0) continue;
            if (!checkCollision(catchBox, e)) continue;

            if (e.isDanger) {
                this._onSmasherHit(e);
            } else {
                this._onAmmoCatch(e);
            }
        }
    }

    _onAmmoCatch(entity) {
        const timeSinceSpawn = entity.getTimeSinceSpawn();
        const isQuick = timeSinceSpawn < GAME_CONFIG.quickCatchThreshold * (this.canvas.height / entity.speed);
        const baseScore = entity.score;
        const bonus = isQuick ? GAME_CONFIG.quickCatchBonus : 0;

        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.multiplier = Math.min(
            GAME_CONFIG.maxMultiplier,
            1 + Math.floor(this.combo / GAME_CONFIG.comboMultiplierInterval)
        );

        const points = (baseScore + bonus) * this.multiplier;
        this.score += points;
        this.totalCaught++;

        // Visual feedback
        const cx = entity.centerX;
        const cy = entity.centerY;
        this.particles.burstCatch(cx, cy, entity.color);
        this.ui.addFloatingText(cx, cy - 20, '+' + points, entity.color, 16 + Math.min(this.multiplier * 2, 12));

        if (isQuick) {
            this.ui.addFloatingText(cx, cy - 45, 'QUICK!', '#ffcc00', 12);
            audio.playQuickCatch();
        } else {
            audio.playCatch();
        }

        // Check combo milestones
        if (this.combo > 0 && this.combo % GAME_CONFIG.comboMultiplierInterval === 0) {
            audio.playComboUp();
            this.ui.addFloatingText(
                this.canvas.width / 2, this.canvas.height * 0.35,
                `x${this.multiplier} MULTIPLIER!`,
                GAME_CONFIG.comboColors[Math.min(this.multiplier - 1, GAME_CONFIG.comboColors.length - 1)],
                22
            );
        }

        // HP Recovery (1.5% of max HP per collected ammo)
        if (this.hp < GAME_CONFIG.startingHP) {
            const heal = (GAME_CONFIG.startingHP * (GAME_CONFIG.ammoHealPercent || 1.5)) / 100;
            this.hp = Math.min(GAME_CONFIG.startingHP, this.hp + heal);
            this.ui.updateHP(this.hp, GAME_CONFIG.startingHP);
        }

        // Update UI
        this.ui.updateScore(this.score);
        this.ui.updateCombo(this.combo, this.multiplier);
        this.ui.updateAccuracy(this.totalCaught, this.totalSpawned);

        entity.active = false;
    }

    _onSmasherHit(entity) {
        if (this.player.isInvincible) return;

        this.hp -= GAME_CONFIG.smasherDamage;
        this.combo = 0;
        this.multiplier = 1;

        this.player.stun();

        // Effects
        const cx = entity.centerX;
        const cy = entity.centerY;
        this.particles.burstHit(cx, cy);
        this.shakeTimer = GAME_CONFIG.shakeDuration * (entity.hasSandevistan ? 1.6 : 1.0);

        if (entity.hasSandevistan) {
            this.ui.addFloatingText(cx, cy - 30, '⚡ SANDEVISTAN SMASH! ⚡', '#00ffcc', 26);
            this.particles.burstCatch(cx, cy, '#00ffcc');
        } else {
            this.ui.addFloatingText(cx, cy - 30, 'SMASHER!', GAME_CONFIG.dangerColor, 24);
        }
        audio.playHit();

        this.ui.updateHP(this.hp, GAME_CONFIG.startingHP);
        this.ui.updateCombo(0, 1);

        entity.active = false;

        if (this.hp <= 0) {
            this.hp = 0;
            this.gameOver();
        }
    }

    _checkMisses() {
        for (const e of this.entities.getActive()) {
            if (e.y > this.canvas.height + 50) {
                if (!e.isDanger) {
                    this.totalMissed++;
                    this.combo = 0;
                    this.multiplier = 1;
                    const missDmg = (GAME_CONFIG.startingHP * (GAME_CONFIG.missLifeLossPercent || 1.0)) / 100;
                    this.hp -= missDmg;

                    this.ui.updateCombo(0, 1);
                    this.ui.updateHP(this.hp, GAME_CONFIG.startingHP);
                    this.ui.updateAccuracy(this.totalCaught, this.totalSpawned);
                    audio.playMiss();

                    if (this.hp <= 0) {
                        this.hp = 0;
                        this.gameOver();
                    }
                }
                e.active = false;
            }
        }
    }

    // ---- Render ----

    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();

        // Screen shake offset
        if (this.shakeTimer > 0) {
            ctx.translate(this.shakeX, this.shakeY);
        }

        // Background
        if (this.background) this.background.render(ctx);

        // Entities
        this.entities.render(ctx);

        // Particles
        this.particles.render(ctx);

        // Player
        if (this.state === 'playing' || this.state === 'paused') {
            this.player.render(ctx);
        }

        // Floating texts
        this.ui.renderFloatingTexts(ctx);

        ctx.restore();
    }

    // ---- Persistence ----

    _loadHighScore() {
        try {
            return parseInt(localStorage.getItem('cyberCatch_highScore')) || 0;
        } catch {
            return 0;
        }
    }

    _saveHighScore(score) {
        try {
            localStorage.setItem('cyberCatch_highScore', score);
        } catch {
            // localStorage unavailable
        }
    }
}
