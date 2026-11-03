import { setupWaveRipples } from './waves.js';
import { setupSeafloorLab } from './lab.js';

// CSS scroll timelines own the scene. JS only updates the small depth label
// and discrete states; it never drives background transforms during scroll.
export function setupOcean() {
  const scene = document.querySelector('.ocean');
  const gauge = document.querySelector('.depth-gauge');
  if (!scene || !gauge) return;
  const reading = gauge.querySelector('.depth-reading');
  const zone = gauge.querySelector('.depth-zone');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stageLights = document.querySelector('.stage-lights');
  const intro = document.querySelector('.intro');
  const work = document.querySelector('#work');
  const waterline = document.querySelector('.dive-waterline');
  const pauseLights = () => stageLights?.classList.toggle('is-paused', document.hidden);
  document.addEventListener('visibilitychange', pauseLights);
  pauseLights();
  setupWaveRipples(document.querySelector('.ocean-sonar'), reduced);
  const updateLab = setupSeafloorLab(scene, reduced);
  let range = 1, timer = 0, measureFrame = 0;
  let lastDepth = -1, lastBand = -1, lastLabBand = -1;

  function updateStatus() {
    clearTimeout(timer);
    timer = 0;
    const progress = Math.max(0, Math.min(1, scrollY / range));
    const depth = Math.round(progress * 120);
    const band = progress >= .65 ? 2 : progress >= .12 ? 1 : 0;
    const labBand = progress >= .9 ? 2 : progress >= .8 ? 1 : 0;
    if (depth !== lastDepth) {
      reading.firstChild.textContent = String(depth).padStart(3, '0');
      const label = depth < 8 ? 'Surface' : depth < 65 ? 'Descending' : 'Deep water';
      if (zone.textContent !== label) zone.textContent = label;
      lastDepth = depth;
    }
    if (band !== lastBand) {
      scene.classList.toggle('is-submerged', band > 0);
      scene.classList.toggle('is-deep', band === 2);
      gauge.dataset.depthBand = String(band);
      lastBand = band;
    }
    if (labBand !== lastLabBand) {
      updateLab(labBand === 2 ? .95 : labBand === 1 ? .85 : 0);
      lastLabBand = labBand;
    }
  }
  function scheduleStatus() {
    if (!timer) timer = setTimeout(updateStatus, 80);
  }
  function measure() {
    measureFrame = 0;
    // Read layout together, then set timeline ranges only after layout changes.
    range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const start = Math.max(80, (work?.offsetTop || innerHeight) - innerHeight * .9);
    const end = start + innerHeight * .85;
    for (const element of [intro, waterline]) {
      if (!element) continue;
      element.style.animationRangeStart = `${start}px`;
      element.style.animationRangeEnd = `${end}px`;
    }
    updateStatus();
  }
  function scheduleMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }
  gauge.hidden = false;
  addEventListener('scroll', scheduleStatus, { passive: true });
  addEventListener('scrollend', updateStatus);
  addEventListener('resize', scheduleMeasure, { passive: true });
  addEventListener('pageshow', scheduleMeasure);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleMeasure).observe(document.body);
  document.addEventListener('toggle', scheduleMeasure, true);
  document.fonts?.ready.then(scheduleMeasure);
  reduced.addEventListener('change', () => { lastLabBand = -1; updateStatus(); });
  scheduleMeasure();
}
