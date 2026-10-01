// ============================================================
// PLAYER - Rebecca
// ============================================================

class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.image = null;
        this.imageLoaded = false;
        this.x = 0;
        this.y = 0;
        this.drawWidth = 100;
        this.drawHeight = 100;
        this.targetX = 0;
        this.tilt = 0;
        this.squash = 1;
        this.stretch = 1;
        this.hitbox = { ...GAME_CONFIG.playerHitbox };
        this.catchZone = { ...GAME_CONFIG.catchZone };
        this.stunTimer = 0;
        this.invincibleTimer = 0;
        this.flashTimer = 0;
        this.moveDir = 0;
        this.velocity = 0;
    }

    loadImage() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.imageLoaded = true;
                this._updateDimensions();
                resolve(true);
            };
            img.onerror = () => {
                this.imageLoaded = false;
                resolve(false);
            };
            img.src = PLAYER_CONFIG.image;
        });
    }

    _updateDimensions() {
        if (this.imageLoaded) {
            const ratio = this.image.width / this.image.height;
            this.drawHeight = this.canvas.height * GAME_CONFIG.playerScale;
            this.drawWidth = this.drawHeight * ratio;
        } else {
            this.drawWidth = this.canvas.width * 0.06;
            this.drawHeight = this.drawWidth * 1.6;
        }
    }

    reset() {
        this._updateDimensions();
        this.x = this.canvas.width / 2 - this.drawWidth / 2;
        this.y = this.canvas.height * GAME_CONFIG.playerY - this.drawHeight / 2;
        this.targetX = this.x;
        this.stunTimer = 0;
        this.invincibleTimer = 0;
        this.tilt = 0;
        this.squash = 1;
        this.stretch = 1;
        this.velocity = 0;
    }

    resize() {
        const oldCenterX = this.x + this.drawWidth / 2;
        const pct = oldCenterX / (this.canvas.width || 1);
        this._updateDimensions();
        this.x = pct * this.canvas.width - this.drawWidth / 2;
        this.y = this.canvas.height * GAME_CONFIG.playerY - this.drawHeight / 2;
        this.targetX = this.x;
    }

    setTargetX(tx) {
        this.targetX = tx - this.drawWidth / 2;
    }

    stun() {
        this.stunTimer = GAME_CONFIG.stunDuration;
        this.invincibleTimer = GAME_CONFIG.invincibilityDuration;
    }

    get isStunned() { return this.stunTimer > 0; }
    get isInvincible() { return this.invincibleTimer > 0; }
    get centerX() { return this.x + this.drawWidth / 2; }
    get centerY() { return this.y + this.drawHeight / 2; }

    getCatchHitbox() {
        const cz = this.catchZone;
        return {
            x: this.x + cz.offsetX * this.drawWidth,
            y: this.y + cz.offsetY * this.drawHeight,
            width: cz.width * this.drawWidth,
            height: cz.height * this.drawHeight,
            hitbox: { offsetX: 0, offsetY: 0, width: 1, height: 1 }
        };
    }

    update(dt, inputDir, mouseX) {
        if (this.stunTimer > 0) this.stunTimer -= dt;
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            this.flashTimer += dt * 10;
        }

        if (!this.isStunned) {
            if (inputDir !== 0) {
                // Keyboard movement (A/D or Arrows): direct, fast, and agile
                this.velocity = inputDir * GAME_CONFIG.playerSpeed;
                this.x += this.velocity * dt;
                this.targetX = this.x;
            } else if (mouseX !== null) {
                this.targetX = mouseX - this.drawWidth / 2;
                const diff = this.targetX - this.x;
                const lerpSpeed = 14;
                this.velocity = diff * lerpSpeed;
                this.x += this.velocity * dt;
            } else {
                this.velocity = 0;
            }

            // Clamp
            this.x = Math.max(0, Math.min(this.canvas.width - this.drawWidth, this.x));

            // Tilt based on movement
            const targetTilt = Math.max(-0.18, Math.min(0.18, (this.velocity / GAME_CONFIG.playerSpeed) * 0.16));
            this.tilt += (targetTilt - this.tilt) * 10 * dt;

            // Squash/stretch
            const moveAmount = Math.abs(this.velocity);
            const targetSquash = 1 - moveAmount * 0.00008;
            const targetStretch = 1 + moveAmount * 0.00008;
            this.squash += (targetSquash - this.squash) * 6 * dt;
            this.stretch += (targetStretch - this.stretch) * 6 * dt;
        } else {
            // Stunned wobble
            this.tilt = Math.sin(Date.now() * 0.02) * 0.1;
        }
    }

    render(ctx) {
        ctx.save();

        // Invincibility flashing
        if (this.isInvincible) {
            if (Math.sin(this.flashTimer * Math.PI) > 0) {
                ctx.globalAlpha = 0.5;
            }
        }

        const cx = this.x + this.drawWidth / 2;
        const cy = this.y + this.drawHeight / 2;
        ctx.translate(cx, cy);
        ctx.rotate(this.tilt);
        ctx.scale(this.squash, this.stretch);

        if (this.imageLoaded) {
            ctx.drawImage(this.image,
                -this.drawWidth / 2, -this.drawHeight / 2,
                this.drawWidth, this.drawHeight
            );
        } else {
            this._drawFallback(ctx);
        }

        ctx.restore();

        // Stun stars
        if (this.isStunned) {
            this._drawStunStars(ctx, cx, cy - this.drawHeight / 2 - 10);
        }
    }

    _drawFallback(ctx) {
        const w = this.drawWidth;
        const h = this.drawHeight;
        // Body
        ctx.fillStyle = PLAYER_CONFIG.fallbackColor;
        ctx.beginPath();
        ctx.roundRect(-w * 0.3, -h * 0.1, w * 0.6, h * 0.55, 8);
        ctx.fill();
        // Head
        ctx.fillStyle = '#ffccaa';
        ctx.beginPath();
        ctx.arc(0, -h * 0.2, w * 0.18, 0, Math.PI * 2);
        ctx.fill();
        // Hair
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(0, -h * 0.28, w * 0.22, Math.PI, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(-w * 0.06, -h * 0.22, 2, 0, Math.PI * 2);
        ctx.arc(w * 0.06, -h * 0.22, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawStunStars(ctx, x, y) {
        const t = Date.now() * 0.003;
        ctx.save();
        ctx.fillStyle = '#ffcc00';
        for (let i = 0; i < 3; i++) {
            const a = t + i * (Math.PI * 2 / 3);
            const sx = x + Math.cos(a) * 20;
            const sy = y + Math.sin(a) * 8;
            ctx.font = '12px Arial';
            ctx.fillText('★', sx - 5, sy);
        }
        ctx.restore();
    }
}
