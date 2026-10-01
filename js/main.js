// ============================================================
// MAIN - Entry Point
// ============================================================

let game = null;

window.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('game-canvas');
    game = new Game(canvas);
    await game.init();
});

// Global functions called from HTML buttons
function startGame() {
    if (game) {
        audio.init();
        audio.playButton();
        game.start();
    }
}

function resumeGame() {
    if (game) game.resume();
}

function restartGame() {
    if (game) {
        audio.init();
        audio.playButton();
        game.start();
    }
}

function goToMenu() {
    if (game) game.goToMenu();
}
