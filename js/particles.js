// ============================================================
// PARTICLE SYSTEM
// ============================================================

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 0;
        this.size = 2;
        this.color = '#fff';
        this.alpha = 1;
        this.decay = 1;
        this.gravity = 0;
        this.type = 'circle'; // circle, square, line, glow
        this.rotation = 0;
        this.rotationSpeed = 0;
    }

    update(dt) {
        if (!this.active) return;
        this.life -= dt;
        if (this.life <= 0) { this.active = false; return; }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.alpha = Math.max(0, this.life / this.maxLife);
        this.rotation += this.rotationSpeed * dt;
        this.size *= (1 - this.decay * dt * 0.5);
        if (this.size < 0.3) this.active = false;
    }

    render(ctx) {
        if (!this.active || this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'glow') {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'line') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = Math.max(1, this.size * 0.4);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.vx * 0.03, -this.vy * 0.03);
            ctx.stroke();
        } else if (this.type === 'square') {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class ParticleSystem {
    constructor(maxParticles) {
        this.pool = [];
        for (let i = 0; i < maxParticles; i++) {
            this.pool.push(new Particle());
        }
    }

    _getParticle() {
        for (const p of this.pool) {
            if (!p.active) return p;
        }
        return null;
    }

    emit(x, y, options = {}) {
        const p = this._getParticle();
        if (!p) return;
        p.reset();
        p.active = true;
        p.x = x + (options.spreadX ? (Math.random() - 0.5) * options.spreadX : 0);
        p.y = y + (options.spreadY ? (Math.random() - 0.5) * options.spreadY : 0);
        const angle = options.angle ?? Math.random() * Math.PI * 2;
        const speed = options.speed ?? (50 + Math.random() * 100);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = options.life ?? (0.3 + Math.random() * 0.5);
        p.maxLife = p.life;
        p.size = options.size ?? (2 + Math.random() * 4);
        p.color = options.color ?? '#fff';
        p.gravity = options.gravity ?? 0;
        p.decay = options.decay ?? 1;
        p.type = options.type ?? 'circle';
        p.rotation = Math.random() * Math.PI * 2;
        p.rotationSpeed = (Math.random() - 0.5) * 5;
        return p;
    }

    burstCatch(x, y, color) {
        const count = GAME_CONFIG.catchParticleCount;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            this.emit(x, y, {
                angle,
                speed: 80 + Math.random() * 150,
                life: 0.3 + Math.random() * 0.4,
                size: 2 + Math.random() * 5,
                color,
                gravity: 100,
                type: Math.random() > 0.5 ? 'glow' : 'circle'
            });
        }
    }

    burstHit(x, y) {
        const count = GAME_CONFIG.hitParticleCount;
        for (let i = 0; i < count; i++) {
            this.emit(x, y, {
                speed: 100 + Math.random() * 200,
                life: 0.3 + Math.random() * 0.5,
                size: 3 + Math.random() * 6,
                color: GAME_CONFIG.dangerColor,
                gravity: 150,
                type: Math.random() > 0.3 ? 'square' : 'line'
            });
        }
    }

    trail(x, y, color) {
        for (let i = 0; i < GAME_CONFIG.trailParticleCount; i++) {
            this.emit(x, y, {
                speed: 10 + Math.random() * 30,
                angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.5,
                life: 0.15 + Math.random() * 0.2,
                size: 1 + Math.random() * 2.5,
                color,
                type: 'glow',
                decay: 2
            });
        }
    }

    update(dt) {
        for (const p of this.pool) {
            if (p.active) p.update(dt);
        }
    }

    render(ctx) {
        for (const p of this.pool) {
            if (p.active) p.render(ctx);
        }
    }
}
