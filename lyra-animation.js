/* ============================================================
   LYRA X7 — PUPPET 2D REALISTA
   Archivo externo: lyra-animation.js

   Capas:
     fondo/cuerpo + torso + cabeza
   Estados:
     reposo, respiración, parpadeo, habla, reacción al giro

   IMPORTANTE:
   Este JS NO crea ni duplica la imagen del avatar.
   ============================================================ */
(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  function init() {
    const puppet = $("lyraPuppet");
    const head = $("lyraHeadLayer");
    const torso = $("lyraTorsoLayer");
    const spin = $("girar");

    if (!puppet || !head || !torso) {
      console.error("LYRA Puppet: faltan capas del avatar.");
      return;
    }

    if (puppet.dataset.lyraPuppetReady === "1") return;
    puppet.dataset.lyraPuppetReady = "1";

    const NORMAL = "lyra-head.png";
    const BLINK = "lyra-head-blink.png";
    const TALK = "lyra-head-talk.png";

    let start = performance.now();
    let reactionUntil = 0;
    let talkingUntil = 0;
    let nextTalk = 0;
    let nextBlink = performance.now() + 2500 + Math.random() * 3500;
    let blinkUntil = 0;

    function scheduleTalk(now) {
      nextTalk = now + 5000 + Math.random() * 9000;
    }
    scheduleTalk(start);

    function setHead(src) {
      if (!head.src.endsWith(src)) head.src = src;
    }

    function animate(now) {
      const t = (now - start) / 1000;

      // Respiración del torso: pecho/hombros, no escala de toda LYRA.
      const breath = Math.sin(t * 1.65) * 1.25;
      const torsoRot = Math.sin(t * 0.82 + .7) * 0.18;
      torso.style.transform =
        `translate3d(${Math.sin(t*.55)*0.45}px,${breath.toFixed(2)}px,0) ` +
        `rotate(${torsoRot.toFixed(2)}deg)`;

      // Micro movimientos de cabeza independientes.
      let hx = Math.sin(t * .92) * 1.35;
      let hy = Math.sin(t * 1.78 + .8) * .9;
      let hr = Math.sin(t * .66 + .3) * .42;

      // Reacción al giro: giro de cabeza + inclinación, no zoom.
      if (now < reactionUntil) {
        const p = Math.max(0, (reactionUntil - now) / 1400);
        const wave = Math.sin((1 - p) * Math.PI * 5.2);
        hx += wave * 4.0 * p;
        hy -= Math.abs(wave) * 1.4 * p;
        hr += wave * 1.25 * p;
      }

      head.style.transform =
        `translate3d(${hx.toFixed(2)}px,${hy.toFixed(2)}px,0) ` +
        `rotate(${hr.toFixed(2)}deg)`;

      // Parpadeo breve con un frame facial real, no un efecto de zoom.
      if (now >= nextBlink && blinkUntil === 0) {
        blinkUntil = now + 125;
        nextBlink = now + 3000 + Math.random() * 5000;
      }
      if (blinkUntil > 0) {
        if (now < blinkUntil) {
          setHead(BLINK);
        } else {
          blinkUntil = 0;
          setHead(NORMAL);
        }
      }

      // Habla: cambia a un frame con boca abierta durante breves intervalos.
      if (now >= nextTalk && talkingUntil === 0) {
        talkingUntil = now + 900;
        nextTalk = now + 6500 + Math.random() * 10000;
      }
      if (talkingUntil > now && blinkUntil === 0) {
        setHead(TALK);
      } else if (talkingUntil <= now && blinkUntil === 0) {
        setHead(NORMAL);
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    function react() {
      reactionUntil = performance.now() + 1400;
    }

    if (spin) spin.addEventListener("click", react, {passive:true});

    // API para la ruleta u otros módulos.
    window.LYRA = window.LYRA || {};
    window.LYRA.react = react;
    window.LYRA.talk = () => {
      talkingUntil = performance.now() + 1200;
    };

    console.log("LYRA X7 Puppet 2D: capas y animación activas.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {once:true});
  } else {
    init();
  }
})();
