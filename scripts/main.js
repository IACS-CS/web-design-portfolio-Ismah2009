console.log();
// Subtle falling gold + rocks (continuous)
// Works best with the #falling-sky div overlay in your HTML.

(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) return;

  const container = document.getElementById("falling-sky");
  if (!container) return;

  // Emoji choices (you can swap these for images later if you want)
  const TYPES = [
    { char: "🪙", weight: 5 }, // gold coin
    { char: "✨", weight: 2 }, // sparkle
    { char: "🪨", weight: 4 }, // rock
  ];

  // Weighted random picker
  const pickType = () => {
    const total = TYPES.reduce((sum, t) => sum + t.weight, 0);
    let r = Math.random() * total;
    for (const t of TYPES) {
      r -= t.weight;
      if (r <= 0) return t.char;
    }
    return TYPES[0].char;
  };

  // Controls (tweak for “more” or “less”)
  const SPAWN_EVERY_MS = 260;   // higher = fewer particles
  const MAX_ON_SCREEN = 50;     // cap for performance
  const BASE_SIZE = 14;         // px
  const SIZE_VARIATION = 10;    // px
  const BASE_OPACITY = 0.18;    // subtle
  const OPACITY_VARIATION = 0.22;

  let pieces = [];
  let lastSpawn = 0;

  const rand = (min, max) => Math.random() * (max - min) + min;

  function spawnPiece() {
    // performance cap
    if (pieces.length >= MAX_ON_SCREEN) return;

    const el = document.createElement("div");
    el.className = "falling-piece";
    el.textContent = pickType();

    const x = rand(0, 100); // vw
    const size = BASE_SIZE + rand(0, SIZE_VARIATION);
    const opacity = BASE_OPACITY + rand(0, OPACITY_VARIATION);

    // speed & drift
    const fallSpeed = rand(20, 60); // vh per second (lower = slower)
    const driftSpeed = rand(-10, 10); // vw per second sideways
    const rotationSpeed = rand(-90, 90); // deg per second

    // start slightly randomized above the top
    const startY = rand(-20, -5); // vh
    const startRot = rand(0, 360);

    el.style.left = `${x}vw`;
    el.style.fontSize = `${size}px`;
    el.style.opacity = opacity.toFixed(2);

    container.appendChild(el);

    pieces.push({
      el,
      x,
      y: startY,
      rot: startRot,
      fallSpeed,
      driftSpeed,
      rotationSpeed,
    });
  }

  function tick(ts) {
    // spawn on a timer
    if (!lastSpawn) lastSpawn = ts;
    if (ts - lastSpawn >= SPAWN_EVERY_MS) {
      spawnPiece();
      lastSpawn = ts;
    }

    const dt = 1 / 60; // good enough for smoothness (subtle animation)
    const viewportW = window.innerWidth;

    // update positions
    pieces = pieces.filter((p) => {
      p.y += p.fallSpeed * dt;
      p.x += p.driftSpeed * dt;
      p.rot += p.rotationSpeed * dt;

      // keep x in a reasonable range
      if (p.x < -10) p.x = 110;
      if (p.x > 110) p.x = -10;

      p.el.style.transform = `translate3d(${p.x}vw, ${p.y}vh, 0) rotate(${p.rot}deg)`;

      // remove if far past bottom
      if (p.y > 120) {
        p.el.remove();
        return false;
      }
      return true;
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();