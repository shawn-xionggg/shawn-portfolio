import { setupWaveRipples } from './waves.js';
import { setupSeafloorLab } from './lab.js';

// Scroll schedules one paint; the scene sleeps whenever the page is still.
export function setupOcean() {
  const scene = document.querySelector('.ocean');
  const gauge = document.querySelector('.depth-gauge');
  if (!scene || !gauge) return;
  const surface = scene.querySelector('.ocean-surface');
  const light = scene.querySelector('.ocean-light');
  const deep = scene.querySelector('.ocean-deep');
  const current = scene.querySelector('.ocean-current');
  const currents = [...current.children];
  const rockLeft = scene.querySelector('.ocean-rock-left');
  const rockRight = scene.querySelector('.ocean-rock-right');
  const floor = scene.querySelector('.ocean-floor');
  const waterline = document.querySelector('.dive-waterline');
  const waterCrests = [...(waterline?.children || [])];
  const intro = document.querySelector('.intro');
  const work = document.querySelector('#work');
  const sonar = document.querySelector('.ocean-sonar');
  const marker = gauge.querySelector('.depth-track > span');
  const reading = gauge.querySelector('.depth-reading');
  const zone = gauge.querySelector('.depth-zone');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stageLights = document.querySelector('.stage-lights');
  const pauseLights = () => stageLights?.classList.toggle('is-paused', document.hidden);
  document.addEventListener('visibilitychange', pauseLights);
  pauseLights();
  let frame = 0, range = 1, lastDepth = -1, diveStart = 0, diveDistance = 1;
  const clamp = value => Math.max(0, Math.min(1, value));
  setupWaveRipples(sonar, reduced);
  const updateLab = setupSeafloorLab(scene, reduced);

  function paint() {
    frame = 0;
    const progress = clamp(scrollY / range);
    const motion = reduced.matches ? 0 : progress;
    const dive = clamp((scrollY - diveStart) / diveDistance);
    updateLab(progress);
    // Separate cliff planes emerge at different depths and pass at different
    // speeds; the seabed only comes into view near the bottom of the page.
    rockLeft.style.opacity = (clamp((progress - .12) / .28) * .85).toFixed(3);
    rockRight.style.opacity = (clamp((progress - .28) / .3) * .8).toFixed(3);
    floor.style.opacity = clamp((progress - .65) / .35).toFixed(3);
    rockLeft.style.transform = reduced.matches ? 'none' : `translate3d(0,${(1 - progress) * 380 - 100}px,0)`;
    rockRight.style.transform = reduced.matches ? 'none' : `translate3d(0,${(1 - progress) * 600 - 60}px,0)`;
    floor.style.transform = reduced.matches ? 'none' : `translate3d(0,${(1 - progress) * 180}px,0)`;
    deep.style.opacity = (progress * .94).toFixed(3);
    light.style.opacity = (.82 - progress * .72).toFixed(3);
    light.style.transform = `translate3d(${Math.sin(motion * Math.PI) * -120}px,${-motion * 560}px,0) scale(${1 + motion * .8}) rotate(${motion * -12}deg)`;
    surface.style.opacity = Math.max(0, 1 - progress * 4).toFixed(3);
    surface.style.transform = `translate3d(0,${-motion * 1800}px,0) scale(${1 + motion * 2})`;
    current.style.transform = `translate3d(${motion * -200}px,${-motion * 650}px,0) scale(${1 + motion * .45}) rotate(${motion * -8}deg)`;
    current.style.opacity = (.14 + Math.sin(progress * Math.PI) * .35).toFixed(3);
    currents.forEach((path, index) => {
      const phase = motion * Math.PI * 3 + index * .65;
      path.style.transform = reduced.matches ? 'none' : `translate(${Math.sin(phase) * 45}px,${Math.cos(phase) * 28}px) scaleY(${1 + Math.sin(phase) * .07})`;
    });
    if (waterline) {
      waterline.style.opacity = reduced.matches ? '0' : (Math.sin(dive * Math.PI) * .85).toFixed(3);
      waterline.style.transform = reduced.matches ? 'none' : `translate3d(0,${(1 - dive) * innerHeight * 1.3 - innerHeight * .45}px,0) rotate(${-5 + dive * 10}deg)`;
      waterCrests.forEach((crest, index) => {
        const phase = dive * Math.PI * 3 + index * 1.2;
        crest.style.transform = reduced.matches ? 'none' : `translate3d(${Math.sin(phase) * 55}px,${Math.cos(phase) * 20}px,0) rotate(${Math.sin(phase) * 3}deg) scale(1.06,${1 + Math.cos(phase) * .16})`;
      });
    }
    // Recede the opening as the waterline passes; focus keeps controls stationary.
    if (intro) {
      const retreat = reduced.matches || intro.querySelector(':focus-visible') ? 0 : dive;
      intro.style.transform = retreat ? `perspective(1200px) translateY(${-retreat * 110}px) rotateX(${retreat * 10}deg) scale(${1 - retreat * .18})` : 'none';
    }
    marker.style.transform = `translateY(${progress * 156}px)`;
    const depth = Math.round(progress * 120);
    if (depth !== lastDepth) {
      reading.firstChild.textContent = String(depth).padStart(3, '0');
      zone.textContent = depth < 8 ? 'Surface' : depth < 65 ? 'Descending' : 'Deep water';
      lastDepth = depth;
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function measure() {
    range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    diveStart = Math.max(80, (work?.offsetTop || innerHeight) - innerHeight * .9);
    diveDistance = Math.max(1, innerHeight * .85);
    schedule();
  }
  gauge.hidden = false;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  reduced.addEventListener('change', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  // Native disclosures and font loading can change the total diving distance.
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  document.addEventListener('toggle', measure, true);
  document.fonts?.ready.then(measure);
  measure();
}
