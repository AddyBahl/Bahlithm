(function () {
  const INTRO_TEXT = "Enter Bahlithm";
  const FADE_MS = 900;
  const TYPE_MS = 95;
  const TRAIL_THROTTLE_MS = 28;

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const intro = document.getElementById("intro");
  const typingEl = document.getElementById("typing");
  const enterHint = document.getElementById("enter-hint");
  const siteRoot = document.getElementById("site-root");

  if (!intro || !typingEl || !enterHint || !siteRoot) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let introDismissed = false;
  let typingIndex = 0;
  let trailLast = 0;

  document.body.classList.add("intro-open");

  function spawnTrail(clientX, clientY) {
    if (reduceMotion) return;
    const dot = document.createElement("div");
    dot.className = "cursor-trail";
    dot.style.left = `${clientX}px`;
    dot.style.top = `${clientY}px`;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.opacity = "0";
      dot.style.transform = "scale(2.2)";
    });
    window.setTimeout(() => dot.remove(), 320);
  }

  document.addEventListener(
    "mousemove",
    (e) => {
      const now = performance.now();
      if (now - trailLast < TRAIL_THROTTLE_MS) return;
      trailLast = now;
      spawnTrail(e.clientX, e.clientY);
    },
    { passive: true }
  );

  function dismissIntro() {
    if (introDismissed) return;
    introDismissed = true;

    intro.classList.add("fade-out");
    siteRoot.classList.remove("site-hidden");
    siteRoot.classList.add("site-visible");
    siteRoot.removeAttribute("aria-hidden");
    document.body.classList.remove("intro-open");
    document.body.classList.add("main-ready");

    window.setTimeout(() => {
      intro.style.display = "none";
      intro.setAttribute("aria-hidden", "true");
    }, FADE_MS);
  }

  function onEnterKey(e) {
    if (e.key !== "Enter") return;
    if (introDismissed) return;
    e.preventDefault();
    dismissIntro();
  }

  function typeStep() {
    if (introDismissed) return;
    if (typingIndex < INTRO_TEXT.length) {
      typingEl.textContent += INTRO_TEXT.charAt(typingIndex);
      typingIndex += 1;
      window.setTimeout(typeStep, reduceMotion ? 0 : TYPE_MS);
    } else {
      enterHint.classList.add("is-visible");
    }
  }

  function startTyping() {
    typingEl.textContent = "";
    if (reduceMotion) {
      typingEl.textContent = INTRO_TEXT;
      enterHint.classList.add("is-visible");
      return;
    }
    typeStep();
  }

  intro.addEventListener("click", () => dismissIntro());

  document.addEventListener("keydown", onEnterKey);

  startTyping();
})();
