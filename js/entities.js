// ============================================================
// ENTITIES - Ammo + Adam Smasher
// ============================================================

class FallingEntity {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.drawWidth = 40;
        this.drawHeight = 40;
        this.speed = 150;
        this.type = null; // ammo config or 'smasher'
        this.isDanger = false;
        this.image = null;
        this.imageLoaded = false;
        this.hitbox = { offsetX: 0.2, offsetY: 0.1, width: 0.6, height: 0.8 };
        this.color = '#fff';
        this.score = 100;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.glowAlpha = 0;
        this.glowDir = 1;
        this.warningTimer = 0;
        this.spawnTime = 0;
        this.trailTimer = 0;

        // Sandevistan properties
        this.hasSandevistan = false;
        this.sandevistanMode = null; // 'straight_fast' or 'zigzag'
        this.zigzagDir = 1;
        this.zigzagSpeed = 480;
        this.zigzagTimer = 0;
        this.canvasWidth = 1280;
        this.afterimages = [];
        this.afterimageTimer = 0;
    }

    reset() {
        this.active = false;
        this.warningTimer = 0;
        this.rotation = 0;
        this.glowAlpha = 0;
        this.trailTimer = 0;
        this.hasSandevistan = false;
        this.sandevistanMode = null;
        this.afterimages = [];
        this.afterimageTimer = 0;
        this.zigzagTimer = 0;
        this.zigzagDir = 1;
    }

    initAmmo(typeConfig, x, y, speed, canvasHeight, img) {
        this.reset();
        this.active = true;
        this.isDanger = false;
        this.type = typeConfig;
        this.image = img;
        this.imageLoaded = !!img;
        this.color = typeConfig.color;
        this.score = typeConfig.score;
        this.hitbox = { ...typeConfig.hitbox };

        const scale = typeConfig.scale * canvasHeight;
        if (this.imageLoaded) {
            const ratio = img.width / img.height;
            this.drawHeight = scale;
            this.drawWidth = scale * ratio;
        } else {
            this.drawWidth = scale * 0.6;
            this.drawHeight = scale;
        }

        this.x = x - this.drawWidth / 2;
        this.y = y - this.drawHeight;
        this.speed = speed;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        this.spawnTime = performance.now();
    }

    initSmasher(x, y, speed, canvasHeight, canvasWidthOrImg, maybeImg) {
        this.reset();
        this.active = true;
        this.isDanger = true;
        this.type = ENEMY_CONFIG;

        let canvasWidth = 1280;
        let img = null;
        if (typeof canvasWidthOrImg === 'number') {
            canvasWidth = canvasWidthOrImg;
            img = maybeImg;
        } else {
            img = canvasWidthOrImg;
            if (typeof maybeImg === 'number') canvasWidth = maybeImg;
        }
        this.canvasWidth = canvasWidth;

        this.image = img;
        this.imageLoaded = !!img;
        this.color = ENEMY_CONFIG.color;
        this.score = 0;
        this.hitbox = { ...ENEMY_CONFIG.hitbox };

        const scale = ENEMY_CONFIG.scale * canvasHeight;
        if (this.imageLoaded) {
            const ratio = img.width / img.height;
            this.drawHeight = scale;
            this.drawWidth = scale * ratio;
        } else {
            this.drawWidth = scale * 0.6;
            this.drawHeight = scale;
        }

        this.x = x - this.drawWidth / 2;
        this.y = y - this.drawHeight;

        // Sandevistan activation roll: 25% chance
        const rollSandevistan = Math.random() < (ENEMY_CONFIG.sandevistanChance ?? 0.25);
        if (rollSandevistan) {
            this.hasSandevistan = true;
            // 25% chance: blitz straight hyper-fast; 75% chance: normal speed with aggressive zigzag
            const rollStraight = Math.random() < (ENEMY_CONFIG.sandevistanStraightChance ?? 0.25);
            if (rollStraight) {
                this.sandevistanMode = 'straight_fast';
                this.speed = speed * (ENEMY_CONFIG.sandevistanBlitzSpeedMult ?? 2.8);
            } else {
                this.sandevistanMode = 'zigzag';
                this.speed = speed; // normal speed
                this.zigzagDir = Math.random() < 0.5 ? 1 : -1;
                this.zigzagSpeed = (ENEMY_CONFIG.sandevistanZigzagSpeed ?? 480);
                this.zigzagTimer = 0;
            }
        } else {
            this.hasSandevistan = false;
            this.sandevistanMode = null;
            this.speed = speed;
        }

        this.warningTimer = ENEMY_CONFIG.warningTime;
        this.rotationSpeed = 0;
        this.spawnTime = performance.now();
    }

    get centerX() { return this.x + this.drawWidth / 2; }
    get centerY() { return this.y + this.drawHeight / 2; }

    getTimeSinceSpawn() {
        return (performance.now() - this.spawnTime) / 1000;
    }

    update(dt) {
        if (!this.active) return;

        if (this.warningTimer > 0) {
            this.warningTimer -= dt;
            if (this.warningTimer > 0) return;
        }

        // Sandevistan Zigzag movement
        if (this.isDanger && this.hasSandevistan && this.sandevistanMode === 'zigzag') {
            this.x += this.zigzagDir * this.zigzagSpeed * dt;
            const margin = 16;
            const maxRight = (this.canvasWidth || 1280) - this.drawWidth - margin;

            if (this.x <= margin) {
                this.x = margin;
                this.zigzagDir = 1;
            } else if (this.x >= maxRight) {
                this.x = maxRight;
                this.zigzagDir = -1;
            }

            this.zigzagTimer += dt;
            if (this.zigzagTimer >= 0.42) {
                this.zigzagTimer = 0;
                if (Math.random() < 0.4) {
                    this.zigzagDir = -this.zigzagDir;
                }
            }
        }

        this.y += this.speed * dt;
        this.rotation += this.rotationSpeed * dt;

        // Sandevistan Ghost Afterimages
        if (this.isDanger && this.hasSandevistan) {
            this.afterimageTimer += dt;
            if (this.afterimageTimer >= 0.02) {
                this.afterimageTimer = 0;
                const trailColor = this.sandevistanMode === 'straight_fast' ? '#00ffcc' : '#ff0055';
                this.afterimages.push({
                    x: this.x,
                    y: this.y,
                    alpha: 0.75,
                    color: trailColor
                });
                if (this.afterimages.length > 12) {
                    this.afterimages.shift();
                }
            }

            // Decay afterimages
            for (let i = this.afterimages.length - 1; i >= 0; i--) {
                this.afterimages[i].alpha -= dt * 3.4;
                if (this.afterimages[i].alpha <= 0) {
                    this.afterimages.splice(i, 1);
                }
            }
        }

        // Glow pulsation
        this.glowAlpha += this.glowDir * dt * 3;
        if (this.glowAlpha >= 1) { this.glowAlpha = 1; this.glowDir = -1; }
        if (this.glowAlpha <= 0.3) { this.glowAlpha = 0.3; this.glowDir = 1; }

        this.trailTimer += dt;
    }

    render(ctx) {
        if (!this.active) return;

        // Warning indicator for smasher
        if (this.isDanger && this.warningTimer > 0) {
            this._renderWarning(ctx);
            return;
        }

        // Draw Sandevistan Ghost Afterimages
        if (this.isDanger && this.hasSandevistan && this.afterimages.length > 0) {
            for (const ghost of this.afterimages) {
                ctx.save();
                ctx.globalAlpha = ghost.alpha * 0.55;
                ctx.shadowColor = ghost.color;
                ctx.shadowBlur = 18;
                if (this.imageLoaded) {
                    ctx.drawImage(this.image,
                        ghost.x, ghost.y,
                        this.drawWidth, this.drawHeight
                    );
                } else {
                    ctx.fillStyle = ghost.color;
                    ctx.fillRect(ghost.x, ghost.y, this.drawWidth, this.drawHeight);
                }
                ctx.restore();
            }
        }

        ctx.save();
        const cx = this.centerX;
        const cy = this.centerY;
        ctx.translate(cx, cy);

        // Danger / Sandevistan glow
        if (this.isDanger && this.hasSandevistan) {
            ctx.shadowColor = this.sandevistanMode === 'straight_fast' ? '#00ffcc' : '#ff00ff';
            ctx.shadowBlur = 25 + this.glowAlpha * 15;
        } else if (this.isDanger) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15 + this.glowAlpha * 10;
        } else {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 5 + this.glowAlpha * 5;
        }

        if (!this.isDanger) {
            ctx.rotate(this.rotation);
        }

        if (this.imageLoaded) {
            ctx.drawImage(this.image,
                -this.drawWidth / 2, -this.drawHeight / 2,
                this.drawWidth, this.drawHeight
            );
        } else {
            this._drawFallback(ctx);
        }

        // Sandevistan floating label badge
        if (this.isDanger && this.hasSandevistan) {
            ctx.font = '900 10px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00ffcc';
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 10;
            ctx.fillText('⚡ SANDEVISTAN', 0, -this.drawHeight / 2 - 10);
        }

        ctx.restore();
    }

    _renderWarning(ctx) {
        const cx = this.x + this.drawWidth / 2;
        const canvasH = ctx.canvas.height || 800;
        const pulse = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;

        ctx.save();
        if (this.hasSandevistan) {
            // Sandevistan Warning line - electric cyan & magenta
            ctx.strokeStyle = `rgba(0, 255, 204, ${pulse * 0.85})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 14;
            ctx.setLineDash([12, 6]);
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, canvasH);
            ctx.stroke();
            ctx.setLineDash([]);

            // Sandevistan Warning Icons & Text
            ctx.fillStyle = `rgba(0, 255, 204, ${pulse})`;
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 12;
            ctx.font = 'bold 24px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ SANDEVISTAN ⚡', cx, 36);

            ctx.font = 'bold 11px Orbitron, monospace';
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 8;
            ctx.fillText('TIME DILATION DETECTED', cx, 54);

            const modeLabel = this.sandevistanMode === 'straight_fast' ? '>> BLITZ DASH <<' : '~~ WARP ZIGZAG ~~';
            ctx.font = 'bold 10px Orbitron, monospace';
            ctx.fillStyle = '#00ffcc';
            ctx.fillText(modeLabel, cx, 70);
        } else {
            // Normal Smasher Warning line
            ctx.strokeStyle = `rgba(255, 0, 50, ${pulse * 0.6})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, canvasH);
            ctx.stroke();
            ctx.setLineDash([]);

            // Warning triangle
            ctx.fillStyle = `rgba(255, 0, 50, ${pulse})`;
            ctx.font = 'bold 24px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚠', cx, 40);

            ctx.font = '10px Orbitron, monospace';
            ctx.fillStyle = `rgba(255, 0, 50, ${pulse * 0.8})`;
            ctx.fillText('DANGER', cx, 56);
        }
        ctx.restore();
    }

    _drawFallback(ctx) {
        if (this.isDanger) {
            // Smasher fallback - red menacing shape
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.roundRect(-this.drawWidth * 0.35, -this.drawHeight * 0.4,
                this.drawWidth * 0.7, this.drawHeight * 0.8, 6);
            ctx.fill();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(-this.drawWidth * 0.1, -this.drawHeight * 0.15, 4, 0, Math.PI * 2);
            ctx.arc(this.drawWidth * 0.1, -this.drawHeight * 0.15, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.drawWidth * 0.3, -this.drawHeight * 0.35,
                this.drawWidth * 0.6, this.drawHeight * 0.7);
        } else {
            // Ammo fallback - colored bullet shape
            const w = this.drawWidth;
            const h = this.drawHeight;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.4);
            ctx.lineTo(w * 0.2, -h * 0.15);
            ctx.lineTo(w * 0.2, h * 0.4);
            ctx.lineTo(-w * 0.2, h * 0.4);
            ctx.lineTo(-w * 0.2, -h * 0.15);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(0, -h * 0.25, w * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Entity Pool
class EntityPool {
    constructor(size) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new FallingEntity());
        }
    }

    get() {
        for (const e of this.pool) {
            if (!e.active) return e;
        }
        return null;
    }

    getActive() {
        return this.pool.filter(e => e.active);
    }

    countActive() {
        let c = 0;
        for (const e of this.pool) {
            if (e.active) c++;
        }
        return c;
    }

    countDanger() {
        let c = 0;
        for (const e of this.pool) {
            if (e.active && e.isDanger) c++;
        }
        return c;
    }

    update(dt) {
        for (const e of this.pool) {
            if (e.active) e.update(dt);
        }
    }

    render(ctx) {
        for (const e of this.pool) {
            if (e.active) e.render(ctx);
        }
    }

    deactivateAll() {
        for (const e of this.pool) {
            e.active = false;
        }
    }
}
