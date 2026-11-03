export function setupSeafloorLab(scene, reduced) {
  const dog = scene.querySelector('.ocean-lab');
  const floor = scene.querySelector('.ocean-floor');
  let walk = null, progress = 0, finished = false;

  function reset() {
    if (walk) { walk.onfinish = null; walk.cancel(); walk = null; }
    finished = false;
    dog.classList.remove('is-walking');
    dog.style.opacity = '0';
  }
  function update(value = progress) {
    progress = value;
    if (progress < .8) { reset(); return; }
    if (reduced.matches) {
      reset();
      dog.style.opacity = progress >= .9 ? '1' : '0';
      dog.style.transform = 'translate3d(20vw,-18px,0)';
      return;
    }
    const active = progress >= .9 && !document.hidden;
    if (active && !walk && !finished) {
      const height = floor.getBoundingClientRect().height;
      const width = innerWidth;
      dog.style.opacity = '1';
      walk = dog.animate([
        { transform: `translate3d(-220px,${-height * .3}px,0)` },
        { transform: `translate3d(${width * .2}px,${-height * .12}px,0)`, offset: .3 },
        { transform: `translate3d(${width * .5}px,0,0)`, offset: .55 },
        { transform: `translate3d(${width * .8}px,${-height * .18}px,0)`, offset: .8 },
        { transform: `translate3d(${width + 220}px,${-height * .3}px,0)` }
      ], { duration: Math.max(14000, (width + 440) / 65 * 1000), easing: 'linear', fill: 'forwards' });
      walk.onfinish = () => {
        finished = true;
        dog.style.opacity = '0';
        dog.classList.remove('is-walking');
      };
    }
    dog.classList.toggle('is-walking', active && !finished);
    if (walk && !finished) active ? walk.play() : walk.pause();
  }
  document.addEventListener('visibilitychange', () => update());
  addEventListener('resize', () => { reset(); update(); });
  reduced.addEventListener('change', () => { reset(); update(); });
  return update;
}
