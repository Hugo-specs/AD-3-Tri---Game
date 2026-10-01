// ============================================================
// COLLISION SYSTEM - AABB
// ============================================================

function getWorldHitbox(entity) {
    const hb = entity.hitbox;
    const w = entity.drawWidth || entity.width;
    const h = entity.drawHeight || entity.height;
    return {
        x: entity.x + hb.offsetX * w,
        y: entity.y + hb.offsetY * h,
        width: hb.width * w,
        height: hb.height * h
    };
}

function aabbOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function checkCollision(entityA, entityB) {
    const boxA = getWorldHitbox(entityA);
    const boxB = getWorldHitbox(entityB);
    return aabbOverlap(boxA, boxB);
}

function getCenterOf(entity) {
    const hb = getWorldHitbox(entity);
    return {
        x: hb.x + hb.width / 2,
        y: hb.y + hb.height / 2
    };
}
