export function setupSeafloorLab(scene, reduced) {
  const dog = document.querySelector('.ocean-lab');
  const photo = document.querySelector('.lab-photo');
  const floor = scene.querySelector('.ocean-floor');
  let walk = null, progress = 0, finished = false;
  let photoOpen = false, hovering = false, focused = false, pinned = false, dismissed = false, leaveTimer = 0;

  function hidePhoto() {
    clearTimeout(leaveTimer);
    photoOpen = hovering = focused = pinned = false;
    photo.classList.remove('is-open');
    photo.setAttribute('aria-hidden', 'true');
    dog.setAttribute('aria-expanded', 'false');
  }
  function showDog(visible) {
    dog.style.opacity = visible ? '1' : '0';
    dog.style.visibility = visible ? 'visible' : 'hidden';
    dog.inert = !visible;
  }
  function positionPhoto() {
    let bounds = dog.getBoundingClientRect();
    // A keyboard user can reach the dog while it is entering at the edge.
    if (walk && (bounds.right < 30 || bounds.left > innerWidth - 30)) {
      walk.currentTime = walk.effect.getTiming().duration * .5;
      bounds = dog.getBoundingClientRect();
    }
    const size = photo.offsetWidth;
    const center = bounds.left + bounds.width * .65;
    const left = Math.max(12, Math.min(innerWidth - size - 12, center - size / 2));
    const top = Math.max(12, bounds.top - size - 18);
    photo.style.left = `${left}px`;
    photo.style.top = `${top}px`;
    photo.style.transformOrigin = `${center - left}px ${bounds.top + bounds.height / 2 - top}px`;
  }
  function syncPhoto() {
    const open = (hovering || focused || pinned) && !dismissed && progress >= .9 && !finished && !document.hidden;
    if (open === photoOpen) return;
    photoOpen = open;
    if (open) {
      walk?.pause();
      positionPhoto();
    }
    photo.classList.toggle('is-open', open);
    photo.setAttribute('aria-hidden', String(!open));
    dog.setAttribute('aria-expanded', String(open));
    update();
  }
  for (const target of [dog, photo]) {
    target.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      clearTimeout(leaveTimer);
      hovering = true;
      dismissed = false;
      syncPhoto();
    });
    target.addEventListener('pointerleave', event => {
      if (event.pointerType === 'touch') return;
      leaveTimer = setTimeout(() => { hovering = false; syncPhoto(); }, 140);
    });
  }
  dog.addEventListener('focus', () => {
    if (!dog.matches(':focus-visible')) return;
    focused = true;
    dismissed = false;
    syncPhoto();
  });
  dog.addEventListener('blur', () => { focused = pinned = false; syncPhoto(); });
  dog.addEventListener('click', () => {
    pinned = !pinned;
    dismissed = !pinned;
    syncPhoto();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !photoOpen) return;
    dismissed = true;
    pinned = false;
    syncPhoto();
  });
  document.addEventListener('pointerdown', event => {
    if (!photoOpen || dog.contains(event.target) || photo.contains(event.target)) return;
    dismissed = true;
    pinned = false;
    syncPhoto();
  });
  addEventListener('scroll', () => {
    if (!photoOpen) return;
    hidePhoto();
    update();
  }, { passive: true });

  function reset() {
    hidePhoto();
    if (walk) { walk.onfinish = null; walk.cancel(); walk = null; }
    finished = false;
    dog.classList.remove('is-walking');
    showDog(false);
  }
  function update(value = progress) {
    progress = value;
    if (progress < .8) { reset(); return; }
    if (progress < .9 || document.hidden) hidePhoto();
    if (reduced.matches) {
      showDog(progress >= .9);
      dog.style.transform = 'translate3d(20vw,-18px,0)';
      return;
    }
    const active = progress >= .9 && !document.hidden && !photoOpen;
    if (active && !walk && !finished) {
      const height = floor.getBoundingClientRect().height;
      const width = innerWidth;
      showDog(true);
      walk = dog.animate([
        { transform: `translate3d(-220px,${-height * .3}px,0)` },
        { transform: `translate3d(${width * .2}px,${-height * .12}px,0)`, offset: .3 },
        { transform: `translate3d(${width * .5}px,0,0)`, offset: .55 },
        { transform: `translate3d(${width * .8}px,${-height * .18}px,0)`, offset: .8 },
        { transform: `translate3d(${width + 220}px,${-height * .3}px,0)` }
      ], { duration: Math.max(14000, (width + 440) / 65 * 1000), easing: 'linear', fill: 'forwards' });
      walk.onfinish = () => {
        finished = true;
        hidePhoto();
        showDog(false);
        dog.classList.remove('is-walking');
      };
    }
    showDog(progress >= .9 && !finished);
    dog.classList.toggle('is-walking', active && !finished);
    if (walk && !finished) active ? walk.play() : walk.pause();
  }
  document.addEventListener('visibilitychange', () => update());
  addEventListener('resize', () => { reset(); update(); });
  reduced.addEventListener('change', () => { reset(); update(); });
  return update;
}
