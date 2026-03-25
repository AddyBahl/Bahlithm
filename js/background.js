(function () {
  const canvas = document.getElementById("space-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BG = "#e8f1fb";
  const ACCENT = "29, 78, 216";
  const LINK_DIST = 120;
  const MOUSE_RADIUS = 160;
  const MOUSE_FORCE = 0.08;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let raf = 0;

  function particleCount() {
    const area = w * h;
    const n = Math.round(Math.sqrt(area) / 12);
    return Math.min(220, Math.max(64, n));
  }

  function initParticles() {
    particles = [];
    const n = particleCount();
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.2 + 0.6,
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function drawStatic() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.28;
          ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.fillStyle = `rgba(${ACCENT},${0.35 + Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    if (mouse.active) {
      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < MOUSE_RADIUS) {
          const f = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_FORCE;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
      }
    }

    for (const p of particles) {
      p.vx += (Math.random() - 0.5) * 0.012;
      p.vy += (Math.random() - 0.5) * 0.012;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.34;
          ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.fillStyle = `rgba(${ACCENT},0.55)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(tick);
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    },
    { passive: true }
  );

  window.addEventListener(
    "mouseleave",
    () => {
      mouse.active = false;
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) {
      cancelAnimationFrame(raf);
      drawStatic();
    }
  });

  resize();

  if (reducedMotion) {
    drawStatic();
    return;
  }

  tick();
})();
