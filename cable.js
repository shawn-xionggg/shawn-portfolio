export function setupCable(onConnectionChange) {
  const stage = document.querySelector('.rig-stage');
  const plug = stage.querySelector('.cable-plug');
  const jack = stage.querySelector('.amp-jack');
  const cable = stage.querySelector('.patch-cable');
  const paths = cable.querySelectorAll('path');
  const hint = document.querySelector('#cable-hint');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const point = {x: 24, y: 280};
  let connected = false, drag = null, frame = 0, suppressClick = false;
  let geometry;

  function measure() {
    const box = stage.getBoundingClientRect();
    const socket = jack.getBoundingClientRect();
    const svg = stage.querySelector('.electric-guitar');
    const anchor = new DOMPoint(96, 187).matrixTransform(svg.getScreenCTM());
    geometry = {box, width: box.width, height: box.height,
      jackX: socket.x + socket.width / 2 - box.x,
      jackY: socket.y + socket.height / 2 - box.y,
      startX: anchor.x - box.x, startY: anchor.y - box.y};
    cable.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  }

  function constrain() {
    point.x = Math.max(0, Math.min(geometry.width - 72, point.x));
    point.y = Math.max(0, Math.min(geometry.height - 48, point.y));
  }

  function render() {
    frame = 0;
    plug.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    const {startX, startY, height} = geometry;
    const slack = Math.min(height - 8, Math.max(startY, point.y + 24) + 60);
    const endX = point.x + 10, endY = point.y + 24;
    const middle = (startX + endX) / 2;
    const direction = Math.sign(endX - startX) || 1;
    const d = `M ${startX} ${startY} C ${startX + 30} ${startY + 45}, ${middle - direction * 35} ${slack}, ${middle} ${slack} C ${middle + direction * 35} ${slack}, ${Math.max(6, endX - 40)} ${endY}, ${endX} ${endY}`;
    paths.forEach(path => path.setAttribute('d', d));
  }

  function scheduleRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function nearJack() {
    return Math.hypot(point.x + 64 - geometry.jackX, point.y + 24 - geometry.jackY) < 34;
  }

  function syncConnection(next, announce = false) {
    const changed = connected !== next;
    connected = next;
    document.documentElement.dataset.amp = connected ? 'on' : 'off';
    stage.classList.toggle('is-connected', connected);
    plug.setAttribute('aria-pressed', String(connected));
    plug.setAttribute('aria-label', connected ? 'Disconnect guitar cable' : 'Connect guitar cable');
    jack.setAttribute('aria-label', connected ? 'Unplug amplifier' : 'Plug into amplifier');
    hint.textContent = connected ? 'Plugged in. Pull it out to go clean.' : 'Hold the plug. Drag it into the amp.';
    if (changed || !geometry) onConnectionChange(connected);
    if (announce && changed) {
      const status = document.querySelector('.rig-status');
      status.textContent = connected ? 'Amplifier connected. Distortion on.' : 'Amplifier disconnected. Quiet clean tone.';
    }
  }

  function dock() {
    // Seat the grip's collar against the jack; the metal shaft goes inside.
    point.x = geometry.jackX - 39;
    point.y = geometry.jackY - 24;
  }

  function toggleConnection() {
    if (drag) return;
    measure();
    syncConnection(!connected, true);
    if (connected) dock();
    else { point.x = 24; point.y = geometry.height - 58; constrain(); }
    render();
    if (connected && !reduced.matches) {
      stage.querySelector('.amp-grille').animate([{opacity:.65},{opacity:1}], {duration:180, easing:'ease-out'});
    }
  }

  function endDrag(cancelled = false) {
    if (!drag) return;
    const previous = drag;
    drag = null;
    stage.classList.remove('is-dragging', 'near-jack');
    suppressClick = previous.moved || cancelled;
    if (cancelled) {
      syncConnection(previous.connected);
      Object.assign(point, previous.point);
    } else if (previous.moved) {
      syncConnection(nearJack(), true);
      if (connected) dock();
    }
    cancelAnimationFrame(frame); frame = 0; render();
    if (plug.hasPointerCapture(previous.id)) plug.releasePointerCapture(previous.id);
  }

  plug.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    measure(); suppressClick = false;
    drag = {id:event.pointerId, x:event.clientX, y:event.clientY,
      point:{...point}, connected, moved:false};
    plug.setPointerCapture(event.pointerId);
    stage.classList.add('is-dragging');
  });
  plug.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) { drag.moved = true; syncConnection(false); }
    point.x = drag.point.x + dx; point.y = drag.point.y + dy;
    constrain();
    const near = nearJack();
    stage.classList.toggle('near-jack', near);
    hint.textContent = near ? 'Release to plug in.' : 'Drag the silver tip into the input.';
    scheduleRender();
  });
  plug.addEventListener('pointerup', event => { if (event.pointerId === drag?.id) endDrag(); });
  plug.addEventListener('pointercancel', () => endDrag(true));
  plug.addEventListener('lostpointercapture', () => endDrag(true));
  plug.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    toggleConnection();
  });
  jack.addEventListener('click', toggleConnection);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') endDrag(true); });
  window.addEventListener('blur', () => endDrag(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) endDrag(true); });
  window.addEventListener('scroll', () => endDrag(true), {passive: true});
  new ResizeObserver(() => {
    endDrag(true); measure();
    if (connected) dock(); else constrain();
    render();
  }).observe(stage);
  syncConnection(false);
  measure(); point.y = geometry.height - 58; constrain(); render();
  plug.disabled = false; jack.disabled = false;
}
