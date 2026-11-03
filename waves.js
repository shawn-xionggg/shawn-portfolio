const SVG_NS = 'http://www.w3.org/2000/svg';

// Draw an uneven, smoothly joined contour once. During playback only its
// transform and opacity change; no per-frame path work or distortion filters.
function contour(phase, radius) {
  const sample = angle => {
    const r = radius * (1 + .045 * Math.sin(3 * angle + phase) + .025 * Math.sin(5 * angle - phase));
    const dr = radius * (.135 * Math.cos(3 * angle + phase) + .125 * Math.cos(5 * angle - phase));
    return { x: r * Math.cos(angle), y: r * Math.sin(angle),
      dx: dr * Math.cos(angle) - r * Math.sin(angle),
      dy: dr * Math.sin(angle) + r * Math.cos(angle) };
  };
  const step = Math.PI * 2 / 32;
  let previous = sample(0);
  let d = `M${previous.x} ${previous.y}`;
  for (let i = 1; i <= 32; i++) {
    const next = sample(i * step);
    d += `C${previous.x + previous.dx * step / 3} ${previous.y + previous.dy * step / 3} ${next.x - next.dx * step / 3} ${next.y - next.dy * step / 3} ${next.x} ${next.y}`;
    previous = next;
  }
  return `${d}Z`;
}

export function setupWaveRipples(container, reduced) {
  if (!container) return;
  const active = new Set();
  let strum = 0;

  function remove(crest) {
    crest.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    crest.remove();
    active.delete(crest);
  }
  function stop() { [...active].forEach(remove); }

  document.querySelector('.guitar')?.addEventListener('click', event => {
    if (reduced.matches || document.hidden) return;
    const driven = document.documentElement.dataset.amp === 'on';
    const duration = driven ? 1600 : 3200;
    const spacing = driven ? 180 : 360;
    const bounds = event.currentTarget.getBoundingClientRect();
    const phase = ++strum * 1.37;

    for (let index = 0; index < 2; index++) {
      // Let successive strums overlap, while bounding the number of layers.
      if (active.size >= 6) remove(active.values().next().value);
      const crest = document.createElement('span');
      crest.className = `wave-crest${driven ? ' wave-driven' : ''}`;
      crest.style.left = `${bounds.left + bounds.width / 2}px`;
      crest.style.top = `${bounds.top + bounds.height * .65}px`;
      const shape = document.createElementNS(SVG_NS, 'svg');
      shape.setAttribute('viewBox', '-560 -560 1120 1120');
      shape.setAttribute('fill', 'none');
      shape.setAttribute('aria-hidden', 'true');
      for (let layer = 0; layer < 3; layer++) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', contour(phase + index * .8 + layer * .15, 450 - layer * 14));
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        if (layer === 2) path.setAttribute('stroke-dasharray', '130 90 45 170');
        shape.append(path);
      }
      crest.append(shape);
      container.append(crest);
      active.add(crest);

      const direction = index ? -1 : 1;
      const drift = (driven ? 100 : 60) * direction;
      const expansion = crest.animate([
        { transform: 'translate(-50%,-50%) scale(.025)', opacity: 0 },
        { transform: `translate(calc(-50% + ${drift * .08}px),-51%) scale(.17,.14)`, opacity: driven ? .85 : .62, offset: .14 },
        { transform: `translate(calc(-50% + ${drift * .5}px),-54%) scale(.72,.62)`, opacity: driven ? .62 : .42, offset: .55 },
        { transform: `translate(calc(-50% + ${drift}px),-58%) scale(1.4,1.16)`, opacity: 0 }
      ], { duration, delay: index * spacing, easing: 'cubic-bezier(.2,.45,.45,1)', fill: 'backwards' });
      shape.animate([
        { transform: `rotate(${phase * 12}deg) scale(1,.94) skewX(-3deg)` },
        { transform: `rotate(${phase * 12 + direction * 12}deg) scale(.94,1.08) skewX(4deg)`, offset: .45 },
        { transform: `rotate(${phase * 12 + direction * 28}deg) scale(1.08,.96) skewX(-2deg)` }
      ], { duration, delay: index * spacing, easing: 'ease-in-out', fill: 'backwards' });
      expansion.onfinish = () => remove(crest);
    }
  });
  reduced.addEventListener('change', stop);
  addEventListener('blur', stop);
  addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
}
