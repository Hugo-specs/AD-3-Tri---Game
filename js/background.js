// ============================================================
// PROCEDURAL CYBERPUNK BACKGROUND
// ============================================================

class CyberpunkBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.buildings = [];
        this.stars = [];
        this.raindrops = [];
        this.neonSigns = [];
        this.holograms = [];
        this.fogLayers = [];
        this.time = 0;
        this.parallaxOffset = 0;
        this._init();
    }

    _init() {
        this._generateStars();
        this._generateBuildings();
        this._generateRain();
        this._generateNeonSigns();
        this._generateHolograms();
        this._generateFog();
    }

    _generateStars() {
        this.stars = [];
        for (let i = 0; i < GAME_CONFIG.bgStarCount; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.4,
                size: 0.5 + Math.random() * 1.5,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 2
            });
        }
    }

    _generateBuildings() {
        this.buildings = [];
        const count = GAME_CONFIG.bgBuildingCount;

        // Far layer
        for (let i = 0; i < count; i++) {
            const w = 0.02 + Math.random() * 0.06;
            const h = 0.2 + Math.random() * 0.45;
            this.buildings.push({
                x: (i / count) + (Math.random() - 0.5) * 0.04,
                width: w,
                height: h,
                layer: Math.floor(Math.random() * 3), // 0=far, 1=mid, 2=near
                color: this._buildingColor(Math.floor(Math.random() * 3)),
                windows: Math.random() > 0.3,
                windowRows: 4 + Math.floor(Math.random() * 15),
                windowCols: 2 + Math.floor(Math.random() * 5),
                windowColor: this._randomNeonDim(),
                antenna: Math.random() > 0.6,
                antennaHeight: 0.01 + Math.random() * 0.04,
                antennaColor: Math.random() > 0.5 ? '#ff0033' : '#00ffcc',
                ledgeCount: Math.floor(Math.random() * 3),
                roofType: Math.floor(Math.random() * 3), // 0=flat, 1=pointed, 2=stepped
                neonStripe: Math.random() > 0.5,
                neonStripeColor: this._randomNeon(),
                neonStripeY: 0.1 + Math.random() * 0.6,
            });
        }

        this.buildings.sort((a, b) => a.layer - b.layer);
    }

    _generateRain() {
        this.raindrops = [];
        for (let i = 0; i < GAME_CONFIG.rainDropCount; i++) {
            this.raindrops.push({
                x: Math.random(),
                y: Math.random(),
                speed: 0.6 + Math.random() * 1.2,
                length: 0.01 + Math.random() * 0.03,
                alpha: 0.1 + Math.random() * 0.25,
                drift: (Math.random() - 0.5) * 0.02,
            });
        }
    }

    _generateNeonSigns() {
        this.neonSigns = [];
        const signs = ['酒', '夜', 'ネオン', 'BAR', 'CLUB', '24H', 'DATA', 'NET', 'ARASAKA', 'MILITECH', 'HOTEL'];
        for (let i = 0; i < 8; i++) {
            this.neonSigns.push({
                x: 0.05 + Math.random() * 0.9,
                y: 0.15 + Math.random() * 0.45,
                text: signs[Math.floor(Math.random() * signs.length)],
                color: this._randomNeon(),
                size: 8 + Math.random() * 14,
                flicker: Math.random() * Math.PI * 2,
                flickerSpeed: 2 + Math.random() * 6,
                on: true,
                layer: Math.floor(Math.random() * 3),
            });
        }
    }

    _generateHolograms() {
        this.holograms = [];
        for (let i = 0; i < 3; i++) {
            this.holograms.push({
                x: 0.1 + Math.random() * 0.8,
                y: 0.1 + Math.random() * 0.3,
                width: 0.03 + Math.random() * 0.05,
                height: 0.04 + Math.random() * 0.06,
                color: this._randomNeon(),
                phase: Math.random() * Math.PI * 2,
                scanlineOffset: 0,
            });
        }
    }

    _generateFog() {
        this.fogLayers = [];
        for (let i = 0; i < 4; i++) {
            this.fogLayers.push({
                y: 0.5 + Math.random() * 0.4,
                speed: 0.005 + Math.random() * 0.015,
                alpha: 0.03 + Math.random() * 0.06,
                offset: Math.random() * Math.PI * 2,
                color: Math.random() > 0.5 ? '0, 255, 204' : '255, 0, 100',
            });
        }
    }

    _randomNeon() {
        const colors = GAME_CONFIG.neonColors;
        return colors[Math.floor(Math.random() * colors.length)];
    }

    _randomNeonDim() {
        const colors = ['rgba(0,200,255,0.4)', 'rgba(255,100,200,0.3)', 'rgba(0,255,180,0.3)',
            'rgba(255,200,0,0.3)', 'rgba(200,100,255,0.3)'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    _buildingColor(layer) {
        const bases = [
            [10, 12, 25], // far
            [15, 15, 30], // mid
            [20, 20, 38], // near
        ];
        const b = bases[layer];
        const v = Math.floor(Math.random() * 8);
        return `rgb(${b[0] + v}, ${b[1] + v}, ${b[2] + v})`;
    }

    resize() {
        // Re-init to adapt to new size
        this._generateRain();
    }

    update(dt) {
        this.time += dt;

        // Rain
        for (const r of this.raindrops) {
            r.y += r.speed * dt;
            r.x += r.drift * dt;
            if (r.y > 1.05) {
                r.y = -0.05;
                r.x = Math.random();
            }
            if (r.x < 0) r.x = 1;
            if (r.x > 1) r.x = 0;
        }

        // Neon sign flicker
        for (const s of this.neonSigns) {
            s.flicker += s.flickerSpeed * dt;
            if (Math.random() < 0.002) s.on = !s.on;
            if (!s.on && Math.random() < 0.05) s.on = true;
        }

        // Hologram scan
        for (const h of this.holograms) {
            h.scanlineOffset += dt * 0.3;
            if (h.scanlineOffset > 1) h.scanlineOffset = 0;
        }
    }

    render(ctx) {
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, '#050510');
        skyGrad.addColorStop(0.25, '#0a0a1e');
        skyGrad.addColorStop(0.5, '#0f0a20');
        skyGrad.addColorStop(0.75, '#150a22');
        skyGrad.addColorStop(1, '#1a0825');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // Ambient city glow at horizon
        const glowGrad = ctx.createRadialGradient(W * 0.5, H * 0.7, 0, W * 0.5, H * 0.7, W * 0.6);
        glowGrad.addColorStop(0, 'rgba(255, 0, 80, 0.08)');
        glowGrad.addColorStop(0.5, 'rgba(100, 0, 200, 0.04)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, W, H);

        // Stars
        this._renderStars(ctx, W, H);

        // Buildings (back to front)
        this._renderBuildings(ctx, W, H);

        // Neon signs
        this._renderNeonSigns(ctx, W, H);

        // Holograms
        this._renderHolograms(ctx, W, H);

        // Fog
        this._renderFog(ctx, W, H);

        // Rain
        this._renderRain(ctx, W, H);

        // Wet ground reflection
        this._renderWetGround(ctx, W, H);
    }

    _renderStars(ctx, W, H) {
        for (const s of this.stars) {
            const alpha = 0.3 + Math.sin(this.time * s.speed + s.twinkle) * 0.3;
            ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _renderBuildings(ctx, W, H) {
        for (const b of this.buildings) {
            const bx = b.x * W;
            const bw = b.width * W;
            const bh = b.height * H;
            const by = H - bh;
            const layerDarken = 1 - b.layer * 0.15;

            // Building body
            ctx.fillStyle = b.color;
            ctx.fillRect(bx, by, bw, bh);

            // Roof
            if (b.roofType === 1) {
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + bw / 2, by - bw * 0.3);
                ctx.lineTo(bx + bw, by);
                ctx.fill();
            } else if (b.roofType === 2) {
                const stepW = bw * 0.7;
                const stepH = bh * 0.08;
                ctx.fillStyle = b.color;
                ctx.fillRect(bx + (bw - stepW) / 2, by - stepH, stepW, stepH);
            }

            // Antenna
            if (b.antenna) {
                const ah = b.antennaHeight * H;
                const ax = bx + bw / 2;
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(ax, by);
                ctx.lineTo(ax, by - ah);
                ctx.stroke();
                // Blinking light
                const blink = Math.sin(this.time * 3 + b.x * 10) > 0;
                if (blink) {
                    ctx.fillStyle = b.antennaColor;
                    ctx.shadowColor = b.antennaColor;
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.arc(ax, by - ah, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            // Neon stripe
            if (b.neonStripe) {
                const ny = by + bh * b.neonStripeY;
                ctx.strokeStyle = b.neonStripeColor;
                ctx.shadowColor = b.neonStripeColor;
                ctx.shadowBlur = 8;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(bx, ny);
                ctx.lineTo(bx + bw, ny);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Windows
            if (b.windows) {
                const winPadX = bw * 0.12;
                const winPadY = bh * 0.05;
                const areaW = bw - winPadX * 2;
                const areaH = bh - winPadY * 2;
                const cols = b.windowCols;
                const rows = b.windowRows;
                const ww = areaW / cols * 0.6;
                const wh = areaH / rows * 0.5;
                const gapX = areaW / cols;
                const gapY = areaH / rows;

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (Math.random() > 0.65 * layerDarken) continue;
                        const wx = bx + winPadX + c * gapX;
                        const wy = by + winPadY + r * gapY;
                        ctx.fillStyle = b.windowColor;
                        ctx.fillRect(wx, wy, ww, wh);
                    }
                }
            }

            // Ledges
            for (let l = 0; l < b.ledgeCount; l++) {
                const ly = by + bh * (0.2 + l * 0.3);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(bx - 2, ly, bw + 4, 3);
            }
        }
    }

    _renderNeonSigns(ctx, W, H) {
        for (const s of this.neonSigns) {
            if (!s.on) continue;
            const flicker = Math.sin(s.flicker) * 0.15 + 0.85;
            ctx.save();
            ctx.globalAlpha = 0.5 * flicker;
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 12;
            ctx.font = `bold ${s.size}px 'Rajdhani', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(s.text, s.x * W, s.y * H);
            ctx.restore();
        }
    }

    _renderHolograms(ctx, W, H) {
        for (const h of this.holograms) {
            ctx.save();
            const hx = h.x * W;
            const hy = h.y * H;
            const hw = h.width * W;
            const hh = h.height * H;
            const alpha = 0.15 + Math.sin(this.time * 2 + h.phase) * 0.05;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = h.color;
            ctx.fillRect(hx, hy, hw, hh);

            // Scanline
            const sy = hy + h.scanlineOffset * hh;
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(hx, sy, hw, 2);
            ctx.restore();
        }
    }

    _renderFog(ctx, W, H) {
        for (const f of this.fogLayers) {
            const fy = f.y * H;
            const wave = Math.sin(this.time * f.speed * 20 + f.offset) * W * 0.1;
            ctx.save();
            ctx.globalAlpha = f.alpha;
            const grad = ctx.createLinearGradient(0, fy - 30, 0, fy + 30);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, `rgba(${f.color}, 0.4)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(-50 + wave, fy - 30, W + 100, 60);
            ctx.restore();
        }
    }

    _renderRain(ctx, W, H) {
        ctx.save();
        ctx.strokeStyle = 'rgba(150, 180, 255, 0.25)';
        ctx.lineWidth = 1;
        for (const r of this.raindrops) {
            ctx.globalAlpha = r.alpha;
            const rx = r.x * W;
            const ry = r.y * H;
            const rl = r.length * H;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx + r.drift * 50, ry + rl);
            ctx.stroke();
        }
        ctx.restore();
    }

    _renderWetGround(ctx, W, H) {
        // Reflective ground area at bottom
        const groundH = H * 0.06;
        const groundY = H - groundH;
        const grad = ctx.createLinearGradient(0, groundY, 0, H);
        grad.addColorStop(0, 'rgba(20, 15, 35, 0.6)');
        grad.addColorStop(0.5, 'rgba(15, 10, 30, 0.8)');
        grad.addColorStop(1, 'rgba(10, 5, 20, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, groundY, W, groundH);

        // Puddle reflections
        const puddles = 5;
        for (let i = 0; i < puddles; i++) {
            const px = (i / puddles) * W + Math.sin(this.time + i) * 20;
            const pw = 40 + Math.random() * 80;
            const shimmer = Math.sin(this.time * 2 + i * 1.5) * 0.1 + 0.1;
            ctx.fillStyle = `rgba(0, 180, 255, ${shimmer})`;
            ctx.fillRect(px, groundY + 2, pw, groundH - 4);
        }
    }
}
