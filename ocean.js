// Scroll schedules one paint; the scene sleeps whenever the page is still.
export function setupOcean() {
  const scene = document.querySelector('.ocean');
  const gauge = document.querySelector('.depth-gauge');
  if (!scene || !gauge) return;
  const surface = scene.querySelector('.ocean-surface');
  const light = scene.querySelector('.ocean-light');
  const deep = scene.querySelector('.ocean-deep');
  const current = scene.querySelector('.ocean-current');
  const marker = gauge.querySelector('.depth-track > span');
  const reading = gauge.querySelector('.depth-reading');
  const zone = gauge.querySelector('.depth-zone');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, range = 1, lastDepth = -1;

  function paint() {
    frame = 0;
    const progress = Math.max(0, Math.min(1, scrollY / range));
    const motion = reduced.matches ? 0 : progress;
    deep.style.opacity = (progress * .94).toFixed(3);
    light.style.opacity = (.82 - progress * .72).toFixed(3);
    light.style.transform = `translate3d(0,${-motion * 240}px,0) scale(${1 + motion * .18})`;
    surface.style.opacity = Math.max(0, 1 - progress * 4).toFixed(3);
    surface.style.transform = `translate3d(0,${-motion * 1200}px,0)`;
    current.style.transform = `translate3d(${motion * -60}px,${-motion * 180}px,0)`;
    current.style.opacity = (.14 + Math.sin(progress * Math.PI) * .2).toFixed(3);
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
    schedule();
  }
  gauge.hidden = false;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  reduced.addEventListener('change', schedule);
  // Native disclosures and font loading can change the total diving distance.
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  document.addEventListener('toggle', measure, true);
  document.fonts?.ready.then(measure);
  measure();
}
