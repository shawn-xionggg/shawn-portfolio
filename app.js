(() => {
  'use strict';
  const guitar = document.querySelector('.guitar');
  const caption = document.querySelector('#guitar-caption');
  const soundButton = document.querySelector('.sound-toggle');
  const dot = document.querySelector('.name-dot');
  const hint = document.querySelector('.secret-hint');
  const message = document.querySelector('.little-message');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  function syncTheme() {
    const dark = root.dataset.theme !== 'light';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#0b0e14' : '#f5f3ed';
    guitar.setAttribute('aria-label', dark ? 'Strum the electric guitar' : 'Strum the acoustic guitar');
    document.querySelector('#guitar-type').textContent = dark ? 'Electric' : 'Acoustic';
    caption.textContent = dark ? 'Plugged in. Tap to strum.' : 'Unplugged. Tap to strum.';
  }
  themeButton.hidden = false;
  syncTheme();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    document.body.classList.remove('after-hours');
    stopSound();
    clearTimeout(captionTimer);
    syncTheme();
    applyTone();
    try { localStorage.setItem('shawn-theme', root.dataset.theme); } catch {}
  });
  const chords = [
    {name: 'G5', notes: [98, 146.83, 196]},
    {name: 'D5', notes: [146.83, 220, 293.66]},
    {name: 'E5', notes: [82.41, 123.47, 164.81]},
    {name: 'C5', notes: [130.81, 196, 261.63]}
  ];
  const acousticChords = [
    {name: 'G', notes: [98, 123.47, 146.83, 196, 246.94, 392]},
    {name: 'D', notes: [146.83, 220, 293.66, 369.99]},
    {name: 'Em', notes: [82.41, 123.47, 164.81, 196, 246.94, 329.63]},
    {name: 'C', notes: [130.81, 164.81, 196, 261.63, 329.63]},
  ];
  const voices = new Set();
  const buffers = new Map();
  let reset, captionTimer, messageTimer, chordIndex = 0, sound = true, soundRequest = 0;
  let audio, output, cleanGain, driveGain, typed = '', lastKey = 0, hintIndex = 0;
  soundButton.hidden = false;
  hint.hidden = false;

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
    const electric = root.dataset.theme !== 'light';
    cleanGain.gain.value = electric ? 0 : 1;
    driveGain.gain.value = electric ? 1 : 0;
    output.gain.value = electric ? .18 : .3;
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

  function animateGuitar() {
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
    const collection = root.dataset.theme === 'light' ? acousticChords : chords;
    const chord = collection[chordIndex++ % collection.length];
    animateGuitar(); stopSound();
    const request = soundRequest;
    caption.textContent = chord.name + (chordIndex % 4 === 0 ? ' — back to the chorus' : ' — one more?');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => { caption.textContent = root.dataset.theme === 'light' ? 'Unplugged. Tap to strum.' : 'Plugged in. Tap to strum.'; }, 2600);
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
    say(active ? 'Encore. Stage lights on. (Esc to leave)' : 'Back to the main set.');
  }
  const hints = [
    'That glowing dot in my name looks a little suspicious.',
    'The guitar knows four chords. Click it a few times.',
    'One more song? Type ENCORE anywhere on the page.'
  ];
  hint.addEventListener('click', () => {
    if (hintIndex < hints.length) say(hints[hintIndex++]);
    else { encore(); hintIndex = 0; }
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

  // Animate once as a section arrives; content is never hidden while waiting for JS.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!reduced.matches) entry.target.classList.add('arrive');
        observer.unobserve(entry.target);
      });
    }, {threshold: .12});
    document.querySelectorAll('.project, .text-section, .contact').forEach(section => observer.observe(section));
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

  // A small companion to the native cursor. Never intercept clicks or text selection.
  const pick = document.querySelector('.cursor-pick');
  const glow = document.querySelector('.cursor-glow');
  const aura = glow.firstElementChild;
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let pickFrame = 0, lastFrame = 0, pickVisible = false;
  const position = {x: 0, y: 0, targetX: 0, targetY: 0, angle: -14, targetAngle: -14};

  function placePick() {
    pick.style.transform = `translate3d(${position.x.toFixed(2)}px, ${position.y.toFixed(2)}px, 0) rotate(${position.angle.toFixed(2)}deg)`;
    aura.style.transform = `translate3d(${(position.x - 249).toFixed(2)}px, ${(position.y - 246).toFixed(2)}px, 0)`;
  }
  function followPick(now) {
    pickFrame = 0;
    const elapsed = lastFrame ? Math.min(now - lastFrame, 50) : 16;
    lastFrame = now;
    const ease = 1 - Math.exp(-elapsed / 45);
    position.x += (position.targetX - position.x) * ease;
    position.y += (position.targetY - position.y) * ease;
    position.angle += (position.targetAngle - position.angle) * ease;
    const moving = Math.abs(position.targetX - position.x) + Math.abs(position.targetY - position.y) + Math.abs(position.targetAngle - position.angle) > .15;
    if (!moving) {
      position.x = position.targetX; position.y = position.targetY; position.angle = position.targetAngle;
    }
    placePick();
    if (moving && pickVisible) pickFrame = requestAnimationFrame(followPick);
    else lastFrame = 0;
  }
  function hidePick() {
    pickVisible = false; pick.classList.remove('visible', 'over-link');
    glow.classList.remove('visible');
    cancelAnimationFrame(pickFrame); pickFrame = 0; lastFrame = 0;
    pick.style.transform = 'translate3d(-100px, -100px, 0)';
  }
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || forcedColors.matches || document.hidden) { hidePick(); return; }
    const targetX = Math.max(8, Math.min(innerWidth - 38, event.clientX + 15));
    position.targetAngle = -14 + Math.max(-12, Math.min(12, (targetX - position.targetX) * .16));
    position.targetX = targetX;
    position.targetY = Math.max(8, Math.min(innerHeight - 42, event.clientY + 17));
    pick.classList.toggle('over-link', Boolean(event.target.closest?.('a, button, summary')));
    if (!pickVisible || reduced.matches) {
      position.x = position.targetX; position.y = position.targetY; position.angle = -14;
      cancelAnimationFrame(pickFrame); pickFrame = 0; lastFrame = 0;
      placePick();
    }
    pickVisible = true; pick.classList.add('visible');
    glow.classList.add('visible');
    if (!reduced.matches && !pickFrame) pickFrame = requestAnimationFrame(followPick);
  }, {passive: true});
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) hidePick(); });
  window.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') hidePick(); }, {passive: true});
  window.addEventListener('blur', hidePick);
  window.addEventListener('resize', hidePick, {passive: true});
  window.addEventListener('pagehide', hidePick);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hidePick(); });
  document.addEventListener('keydown', event => { if (event.key === 'Tab' || event.key === 'Escape') hidePick(); });
  finePointer.addEventListener('change', hidePick);
  forcedColors.addEventListener('change', hidePick);
  reduced.addEventListener('change', hidePick);
})();

if (import.meta.env?.DEV) {
  import('./dev-toolbar.jsx');
}
