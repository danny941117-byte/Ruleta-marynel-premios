/* ============================================================
   LYRA X7 — ANIMADOR 2D PARA MARYNEL
   Archivo independiente: lyra-animation.js

   Uso:
   1. Guarda este archivo junto a index.html.
   2. Antes de </body> agrega:
      <script src="lyra-animation.js"></script>
   3. El script busca automáticamente .avatar o #lyraAvatar.
   ============================================================ */

(() => {
  "use strict";

  const CONFIG = {
    selector: "#lyraAvatar, .avatar",
    breathing: true,
    blinking: true,
    idleMovement: true,
    reactionToSpin: true
  };

  let avatar = null;
  let idleFrame = null;
  let blinkTimer = null;
  let initialized = false;

  function findAvatar() {
    return document.querySelector(CONFIG.selector);
  }

  function injectStyles() {
    if (document.getElementById("lyra-animation-styles")) return;

    const style = document.createElement("style");
    style.id = "lyra-animation-styles";
    style.textContent = `
      .lyra-animated {
        transform-origin: 50% 78%;
        will-change: transform, filter;
      }

      @keyframes lyraBreathing {
        0%, 100% { transform: translate3d(0,0,0) scale(1); }
        50%      { transform: translate3d(0,-4px,0) scale(1.006); }
      }

      @keyframes lyraBlink {
        0%, 92%, 100% { filter: brightness(1); }
        94% { filter: brightness(.94); }
      }

      @keyframes lyraSpinReaction {
        0%   { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
        18%  { transform: translate3d(-7px,-3px,0) rotate(-1.2deg) scale(1.01); }
        36%  { transform: translate3d(7px,-5px,0) rotate(1.2deg) scale(1.015); }
        55%  { transform: translate3d(-4px,-2px,0) rotate(-.7deg) scale(1.008); }
        75%  { transform: translate3d(3px,-1px,0) rotate(.5deg) scale(1.004); }
        100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
      }

      .lyra-spin-reaction {
        animation: lyraSpinReaction 1.25s ease-in-out;
      }

      @media (prefers-reduced-motion: reduce) {
        .lyra-animated {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function startBreathing() {
    if (!CONFIG.breathing) return;
    avatar.style.animation =
      "lyraBreathing 3.8s ease-in-out infinite";
  }

  function blink() {
    if (!avatar || !CONFIG.blinking) return;

    avatar.animate(
      [
        { filter: "brightness(1)" },
        { filter: "brightness(.88)" },
        { filter: "brightness(1)" }
      ],
      {
        duration: 150,
        easing: "ease-in-out"
      }
    );

    scheduleBlink();
  }

  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(blink, 2200 + Math.random() * 4800);
  }

  function reactToSpin() {
    if (!avatar || !CONFIG.reactionToSpin) return;

    avatar.classList.remove("lyra-spin-reaction");

    // Fuerza al navegador a reconocer nuevamente la animación.
    void avatar.offsetWidth;

    avatar.classList.add("lyra-spin-reaction");

    setTimeout(() => {
      avatar.classList.remove("lyra-spin-reaction");
      startBreathing();
    }, 1300);
  }

  function connectSpinButton() {
    const button =
      document.querySelector("#girar") ||
      document.querySelector("#spin") ||
      document.querySelector("[data-spin]");

    if (!button) return;

    button.addEventListener("click", reactToSpin);
  }

  function init() {
    if (initialized) return;

    avatar = findAvatar();

    if (!avatar) {
      console.warn(
        "LYRA X7: no encontré el elemento .avatar ni #lyraAvatar."
      );
      return;
    }

    initialized = true;
    injectStyles();

    avatar.classList.add("lyra-animated");

    startBreathing();

    if (CONFIG.blinking) {
      scheduleBlink();
    }

    connectSpinButton();

    console.log("LYRA X7: animación JavaScript activa.");
  }

  // Intenta inmediatamente.
  init();

  // También intenta cuando el DOM ya esté listo.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }

  // API pública: permite activar la reacción desde el propio index.html.
  window.LYRA = window.LYRA || {};
  window.LYRA.react = reactToSpin;
})();
