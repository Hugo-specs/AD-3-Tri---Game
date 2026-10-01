// ============================================================
// GAME CONFIGURATION
// ============================================================

const GAME_CONFIG = {
    // Canvas
    baseWidth: 1280,
    baseHeight: 720,

    // Player
    playerSpeed: 850,
    playerScale: 0.22,
    playerY: 0.88,
    playerHitbox: { offsetX: 0.25, offsetY: 0.15, width: 0.5, height: 0.7 },
    catchZone: { offsetX: 0.1, offsetY: 0.0, width: 0.8, height: 0.5 },
    stunDuration: 0.8,
    invincibilityDuration: 1.5,

    // Scoring
    baseAmmoScore: 100,
    quickCatchBonus: 50,
    quickCatchThreshold: 0.3,
    comboMultiplierInterval: 5,
    maxMultiplier: 8,
    missLifeLossPercent: 1.0, // 1.0% of max HP per missed ammo (0.5% less than heal)
    smasherDamage: 30,
    startingHP: 100,
    ammoHealPercent: 1.5, // 1.5% HP recovery per ammo caught

    // Difficulty
    baseDifficulty: 1,
    difficultyInterval: 11,
    maxDifficulty: 15,
    baseSpawnInterval: 1.2,
    minSpawnInterval: 0.25,
    baseObjectSpeed: 150,
    maxObjectSpeed: 500,
    smasherBaseChance: 0.06,
    smasherMaxChance: 0.18,
    maxSimultaneousObjects: 12,
    maxSimultaneousDanger: 2,

    // Particles
    maxParticles: 300,
    catchParticleCount: 12,
    hitParticleCount: 20,
    trailParticleCount: 2,

    // Screen shake
    shakeIntensity: 8,
    shakeDuration: 0.3,

    // Visual
    neonColors: ['#ff0055', '#00ffcc', '#ff00ff', '#00ccff', '#ffcc00', '#ff3399', '#66ffcc'],
    dangerColor: '#ff0033',
    uiGlow: '#00ffcc',
    comboColors: ['#ffffff', '#00ffcc', '#ffcc00', '#ff00ff', '#ff0055'],

    // Audio
    masterVolume: 0.3,

    // Background
    bgBuildingCount: 25,
    bgStarCount: 60,
    rainDropCount: 150,
};

// Ammo types
const AMMO_TYPES = [
    {
        id: 'ammo_pistol',
        name: '9mm',
        image: 'assets/ammo/9mm.png',
        score: 100,
        speed: 1.15,
        scale: 0.08,
        rarity: 1,
        color: '#ffcc00',
        hitbox: { offsetX: 0.2, offsetY: 0.1, width: 0.6, height: 0.8 }
    },
    {
        id: 'ammo_rifle',
        name: '5.56 NATO',
        image: 'assets/ammo/5.56_NATO.png',
        score: 150,
        speed: 1.35,
        scale: 0.09,
        rarity: 0.6,
        color: '#00ffcc',
        hitbox: { offsetX: 0.15, offsetY: 0.1, width: 0.7, height: 0.8 }
    },
    {
        id: 'ammo_shotgun',
        name: '.45 ACP',
        image: 'assets/ammo/45_ACP.png',
        score: 120,
        speed: 1.05,
        scale: 0.10,
        rarity: 0.7,
        color: '#ff3399',
        hitbox: { offsetX: 0.2, offsetY: 0.15, width: 0.6, height: 0.7 }
    },
    {
        id: 'ammo_sniper',
        name: '7.62x39',
        image: 'assets/ammo/7.62x39.png',
        score: 250,
        speed: 1.70,
        scale: 0.07,
        rarity: 0.2,
        color: '#ff00ff',
        hitbox: { offsetX: 0.25, offsetY: 0.05, width: 0.5, height: 0.9 }
    },
    {
        id: 'ammo_heavy',
        name: '.50 BMG',
        image: 'assets/ammo/50_BMG.png',
        score: 300,
        speed: 0.80,
        scale: 0.12,
        rarity: 0.1,
        color: '#ff0055',
        hitbox: { offsetX: 0.15, offsetY: 0.1, width: 0.7, height: 0.8 }
    }
];

const ENEMY_CONFIG = {
    id: 'adam_smasher',
    name: 'Adam Smasher',
    image: 'assets/enemies/adam_smasher.png',
    scale: 0.28,
    speed: 1.45,
    color: '#ff0033',
    hitbox: { offsetX: 0.2, offsetY: 0.1, width: 0.6, height: 0.8 },
    warningTime: 0.65,
    sandevistanChance: 0.25,          // 25% chance for Adam Smasher to activate Sandevistan
    sandevistanStraightChance: 0.25,  // 25% chance blitz straight hyper-fast, 75% normal speed zigzag
    sandevistanBlitzSpeedMult: 2.8,   // 2.8x speed multiplier for straight blitz
    sandevistanZigzagSpeed: 480       // Horizontal sweep speed for zigzag
};

const PLAYER_CONFIG = {
    image: 'assets/player/rebecca.png',
    fallbackColor: '#ff0055'
};
