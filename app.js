import { setupCable } from './cable.js';
import { setupOcean } from './ocean.js';

setupOcean();

(() => {
  'use strict';
  const guitar = document.querySelector('.guitar');
  const caption = document.querySelector('#guitar-caption');
  const soundButton = document.querySelector('.sound-toggle');
  const dot = document.querySelector('.name-dot');
  const hint = document.querySelector('.secret-hint');
  const message = document.querySelector('.little-message');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let plugged = false;
  const chords = [
    {name: 'G5', notes: [98, 146.83, 196]},
    {name: 'D5', notes: [146.83, 220, 293.66]},
    {name: 'E5', notes: [82.41, 123.47, 164.81]},
    {name: 'C5', notes: [130.81, 196, 261.63]}
  ];
  const voices = new Set();
  const buffers = new Map();
  let reset, captionTimer, messageTimer, chordIndex = 0, sound = true, soundRequest = 0;
  let audio, output, cleanGain, driveGain, typed = '', lastKey = 0;
  soundButton.hidden = false;
  hint.hidden = false;
  setupCable(connected => {
    plugged = connected;
    stopSound(); clearTimeout(captionTimer); applyTone();
    document.querySelector('#guitar-type').textContent = connected ? 'Amp / driven' : 'Clean / quiet';
    caption.textContent = connected ? 'Amp on. Tap to strum.' : 'Clean & quiet. Tap the guitar.';
  });

  function say(text) {
    clearTimeout(messageTimer);
    message.textContent = text;
    message.classList.add('visible');
    messageTimer = setTimeout(() => message.classList.remove('visible'), 3800);
  }

  function stopSound() {
    soundRequest++;
    for (const voice of voices) { try { voice.stop(); } catch {} }
    voices.clear();
  }

  function applyTone() {
    if (!audio || audio.state === 'closed' || !cleanGain) return;
    const electric = plugged;
    cleanGain.gain.value = electric ? 0 : 1;
    driveGain.gain.value = electric ? 1 : 0;
    output.gain.value = electric ? .16 : .12;
  }

  async function prepareAudio() {
    if (!audio || audio.state === 'closed') {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Audio unavailable');
      audio = new Audio(); buffers.clear();
      const compressor = audio.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.ratio.value = 6;
      const drive = audio.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(4 * (i * 2 / (curve.length - 1) - 1));
      drive.curve = curve; drive.oversample = '4x';
      const lowCut = audio.createBiquadFilter();
      lowCut.type = 'highpass'; lowCut.frequency.value = 95; lowCut.Q.value = .7;
      const cabinet = audio.createBiquadFilter();
      cabinet.type = 'lowpass'; cabinet.frequency.value = 3200; cabinet.Q.value = .7;
      output = audio.createGain(); output.gain.value = .18;
      cleanGain = audio.createGain(); driveGain = audio.createGain();
      const preamp = audio.createGain(); preamp.gain.value = 18;
      cleanGain.connect(compressor);
      driveGain.connect(lowCut); lowCut.connect(preamp); preamp.connect(drive);
      drive.connect(cabinet); cabinet.connect(compressor);
      compressor.connect(output); output.connect(audio.destination);
      applyTone();
    }
    await audio.resume();
    if (audio.state !== 'running') throw new Error('Audio suspended');
  }

  function playChord(chord) {
    if (!sound || !audio || audio.state !== 'running') return;
    stopSound();
    chord.notes.forEach((frequency, index) => {
      if (!buffers.has(frequency)) {
        const rate = audio.sampleRate, period = Math.round(rate / frequency);
        const buffer = audio.createBuffer(1, Math.ceil(rate * 2), rate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < period; i++) data[i] = Math.random() * 2 - 1;
        for (let i = period; i < data.length; i++) data[i] = .496 * (data[i-period] + data[i-period+1]);
        buffers.set(frequency, buffer);
      }
      const source = audio.createBufferSource(), gain = audio.createGain();
      source.buffer = buffers.get(frequency);
      const start = audio.currentTime + index * .025;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.24, start + .005);
      gain.gain.exponentialRampToValueAtTime(.0001, start + 1.9);
      source.connect(gain); gain.connect(cleanGain); gain.connect(driveGain); voices.add(source);
      source.onended = () => { voices.delete(source); source.disconnect(); gain.disconnect(); };
      source.start(start); source.stop(start + 2);
    });
  }

  function animateGuitar(strum = false) {
    if (reduced.matches) return;
    clearTimeout(reset);
    guitar.classList.remove('is-strumming');
    guitar.getAnimations({subtree: true}).forEach(animation => animation.cancel());
    guitar.classList.add('is-strumming');
    guitar.querySelectorAll('.guitar-strings').forEach(strings => {
      strings.animate([
        {transform:'translateX(0)'}, {transform:'translateX(2px)'},
        {transform:'translateX(-1.5px)'}, {transform:'translateX(1px)'}, {transform:'translateX(0)'},
      ], {duration: 280, easing: 'ease-out'});
    });
    if (strum) {
      guitar.querySelectorAll('.guitar-drawing').forEach(drawing => {
        drawing.animate([
          {transform: 'rotate(0)'}, {transform: 'rotate(-3deg)', offset: .2},
          {transform: 'rotate(1deg)', offset: .55}, {transform: 'rotate(0)'},
        ], {duration: 280, easing: 'ease-out'});
      });
      guitar.querySelectorAll('.strum-ring').forEach((ring, index) => {
        ring.animate([
          {transform: 'scale(.6)', opacity: 0},
          {transform: 'scale(.85)', opacity: .45, offset: .2},
          {transform: 'scale(1.5)', opacity: 0},
        ], {duration: 260, delay: index * 35, easing: 'ease-out'});
      });
    }
    reset = setTimeout(() => guitar.classList.remove('is-strumming'), 300);
  }

  function audioUnavailable() {
    sound = false; soundButton.setAttribute('aria-pressed', 'false');
    soundButton.textContent = 'Sound off'; say('No audio here, but the guitar still has moves.');
  }

  // Hover is silent. The first strum unlocks audio through a user gesture.
  guitar.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') animateGuitar();
  });
  guitar.addEventListener('click', async () => {
    const collection = chords;
    const chord = collection[chordIndex++ % collection.length];
    animateGuitar(true); stopSound();
    const request = soundRequest;
    caption.textContent = chord.name + (chordIndex % 4 === 0 ? ' — back to the chorus' : ' — one more?');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => { caption.textContent = plugged ? 'Amp on. Tap to strum.' : 'Clean & quiet. Tap the guitar.'; }, 2600);
    if (chordIndex === 4) say('Four chords. A suspicious number of songs.');
    if (sound) {
      try {
        await prepareAudio();
        if (sound && request === soundRequest) playChord(chord);
      } catch { if (request === soundRequest) audioUnavailable(); }
    }
  });
  soundButton.addEventListener('click', async () => {
    sound = !sound;
    soundButton.setAttribute('aria-pressed', String(sound));
    soundButton.textContent = sound ? 'Sound on' : 'Sound off';
    if (!sound) { stopSound(); return; }
    try {
      await prepareAudio();
      if (sound) say('Sound on. Give the guitar a strum.');
    } catch {
      audioUnavailable();
    }
  });

  function clearNotes() { document.querySelectorAll('.floating-note').forEach(note => note.remove()); }
  dot.addEventListener('click', () => {
    say('You found the tiny gig. Try the guitar next.');
    if (reduced.matches) return;
    clearNotes();
    const box = dot.getBoundingClientRect();
    for (let i = 0; i < 7; i++) {
      const note = document.createElement('span');
      note.className = 'floating-note'; note.textContent = i % 2 ? '\u266a' : '\u266b';
      note.setAttribute('aria-hidden', 'true');
      note.style.left = (box.left + box.width / 2) + 'px';
      note.style.top = (box.top + box.height * .75) + 'px';
      const center = box.left + box.width / 2;
      const drift = Math.max(12 - center, Math.min(innerWidth - 28 - center, -85 + i * 27));
      note.style.setProperty('--dx', drift + 'px');
      note.style.setProperty('--dy', (-55 - Math.sin(i) * 30) + 'px');
      note.style.setProperty('--turn', (-25 + i * 8) + 'deg');
      document.body.append(note);
      note.addEventListener('animationend', () => note.remove(), {once:true});
      setTimeout(() => note.remove(), 1400);
    }
  });

  function encore() {
    const active = document.body.classList.toggle('after-hours');
    document.querySelector('[data-extra="encore"]').setAttribute('aria-pressed', String(active));
    say(active ? 'Encore. Violet accents on. (Esc to leave)' : 'Back to the main set.');
  }
  const extras = document.querySelector('#easter-eggs');
  function showExtras() {
    extras.open = true;
    extras.scrollIntoView({block: 'center', behavior: 'instant'});
    extras.querySelector('summary').focus({preventScroll: true});
  }
  hint.addEventListener('click', () => {
    showExtras();
  });
  document.querySelector('.discover-link').addEventListener('click', event => {
    event.preventDefault(); showExtras();
  });
  document.querySelectorAll('[data-extra]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      if (button.dataset.extra === 'encore') { encore(); return; }
      const target = button.dataset.extra === 'notes' ? dot : guitar;
      target.scrollIntoView({block: 'center', behavior: 'instant'});
      target.focus({preventScroll: true}); target.click();
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('after-hours')) encore();
      stopSound(); clearNotes(); typed = ''; return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat ||
        event.target.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    if (event.key.length !== 1) { typed = ''; return; }
    const now = performance.now();
    if (now - lastKey > 1600) typed = '';
    lastKey = now;
    typed = (typed + event.key.toLowerCase()).slice(-6);
    if (typed === 'encore') { encore(); typed = ''; }
  });

  // Offscreen panels unfold on arrival; without JS every panel stays visible.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const revealTargets = [...document.querySelectorAll('.work, .text-section, .project, .content-block, .easter-eggs, .contact')];
    const positions = revealTargets.map(target => target.getBoundingClientRect().top);
    document.querySelectorAll('.project-list, .section-content').forEach(group => {
      [...group.children].forEach((child, index) => child.style.setProperty('--unfold-delay', `${Math.min(index, 3) * 65}ms`));
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      });
    }, {threshold: 0, rootMargin: '0px 0px -10% 0px'});
    revealTargets.forEach((target, index) => {
      target.classList.add('scroll-reveal');
      if (positions[index] >= innerHeight * .9) {
        target.classList.add('reveal-pending');
        observer.observe(target);
      }
    });
    document.addEventListener('focusin', event => {
      for (let target = event.target; target; target = target.parentElement) {
        if (target.classList?.contains('reveal-pending')) {
          target.classList.remove('reveal-pending');
          observer.unobserve(target);
        }
      }
    });
    reduced.addEventListener('change', () => {
      if (!reduced.matches) return;
      observer.disconnect();
      revealTargets.forEach(target => target.classList.remove('reveal-pending'));
    });
  }
  reduced.addEventListener('change', () => {
    clearTimeout(reset); guitar.classList.remove('is-strumming'); clearNotes();
    guitar.getAnimations({subtree: true}).forEach(animation => animation.cancel());
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSound(); });
  window.addEventListener('blur', stopSound);
  window.addEventListener('pagehide', () => {
    stopSound(); clearNotes();
    if (audio && audio.state !== 'closed') audio.close().catch(() => {});
  });

  // A soft light follows the native cursor; no custom cursor or pick.
  const glow = document.querySelector('.cursor-glow');
  const aura = glow.firstElementChild;
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let glowFrame = 0, lastGlowFrame = 0, glowVisible = false;
  let glowX = 0, glowY = 0, targetX = 0, targetY = 0;
  function placeGlow() {
    aura.style.transform = `translate3d(${glowX - 260}px, ${glowY - 260}px, 0)`;
  }
  function followGlow(now) {
    glowFrame = 0;
    const elapsed = lastGlowFrame ? Math.min(now - lastGlowFrame, 50) : 16;
    lastGlowFrame = now;
    const ease = 1 - Math.exp(-elapsed / 45);
    glowX += (targetX - glowX) * ease; glowY += (targetY - glowY) * ease;
    const moving = Math.abs(targetX - glowX) + Math.abs(targetY - glowY) > .15;
    if (!moving) { glowX = targetX; glowY = targetY; }
    placeGlow();
    if (moving && glowVisible) glowFrame = requestAnimationFrame(followGlow);
    else lastGlowFrame = 0;
  }
  function hideGlow() {
    glowVisible = false; glow.classList.remove('visible');
    cancelAnimationFrame(glowFrame); glowFrame = 0; lastGlowFrame = 0;
  }
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || forcedColors.matches || document.hidden) { hideGlow(); return; }
    targetX = event.clientX; targetY = event.clientY;
    if (!glowVisible || reduced.matches) {
      glowX = targetX; glowY = targetY;
      cancelAnimationFrame(glowFrame); glowFrame = 0; lastGlowFrame = 0;
      placeGlow();
    }
    glowVisible = true; glow.classList.add('visible');
    if (!reduced.matches && !glowFrame) glowFrame = requestAnimationFrame(followGlow);
  }, {passive: true});
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) hideGlow(); });
  window.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') hideGlow(); }, {passive: true});
  window.addEventListener('blur', hideGlow);
  window.addEventListener('resize', hideGlow, {passive: true});
  window.addEventListener('pagehide', hideGlow);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hideGlow(); });
  document.addEventListener('keydown', event => { if (event.key === 'Tab' || event.key === 'Escape') hideGlow(); });
  finePointer.addEventListener('change', hideGlow);
  forcedColors.addEventListener('change', hideGlow);
  reduced.addEventListener('change', hideGlow);
})();

if (import.meta.env?.DEV) {
  import('./dev-toolbar.jsx');
}
