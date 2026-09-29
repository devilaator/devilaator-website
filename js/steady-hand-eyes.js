(() => {
  'use strict';

  const previews = document.querySelectorAll(
    '.steady-hand-project .project-preview-area, .steady-hand-page .phone-screen'
  );
  if (!previews.length || typeof window.requestAnimationFrame !== 'function') return;

  const reducedMotion = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const eyes = [];

  for (const preview of previews) {
    const image = preview.querySelector('.project-preview, .phone-screenshot');
    if (!image) continue;

    const layer = document.createElement('div');
    layer.className = 'steady-hand-eyes';
    layer.setAttribute('aria-hidden', 'true');

    for (const side of ['left', 'right']) {
      const eye = document.createElement('span');
      eye.className = `steady-hand-eye steady-hand-eye-${side}`;
      const pupil = document.createElement('span');
      pupil.className = 'steady-hand-pupil';
      const core = document.createElement('span');
      core.className = 'steady-hand-pupil-core';
      pupil.append(core);
      eye.append(pupil);
      layer.append(eye);
      eyes.push({ element: eye, pupil, x: 0, y: 0, targetX: 0, targetY: 0 });
    }
    preview.append(layer);

    const syncLayer = () => {
      const bounds = image.getBoundingClientRect();
      if (!bounds.width || !bounds.height || !image.naturalWidth || !image.naturalHeight) return;
      const scale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      layer.style.width = `${width}px`;
      layer.style.height = `${height}px`;
      layer.style.left = `${(bounds.width - width) / 2}px`;
      layer.style.top = `${(bounds.height - height) / 2}px`;
    };

    image.addEventListener('load', syncLayer, { once: true });
    if ('ResizeObserver' in window) new ResizeObserver(syncLayer).observe(preview);
    else window.addEventListener('resize', syncLayer, { passive: true });
    syncLayer();
  }

  if (!eyes.length) return;

  const finePointer = typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const idleDelay = 2500;
  const autoPeriod = 8000;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let lastPointerMove = finePointer ? performance.now() : -Infinity;
  let lastFrame = performance.now();

  const setPointerTargets = () => {
    for (const eye of eyes) {
      const bounds = eye.element.getBoundingClientRect();
      const pupilBounds = eye.pupil.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const directionX = pointerX - centerX;
      const directionY = pointerY - centerY;
      const maxX = Math.max(0, (bounds.width - pupilBounds.width) * 0.46);
      const maxY = Math.max(0, (bounds.height - pupilBounds.height) * 0.46);
      const ellipseDistance = Math.hypot(directionX / Math.max(maxX, 1), directionY / Math.max(maxY, 1));
      const scale = ellipseDistance > 1 ? 1 / ellipseDistance : 1;
      eye.targetX = directionX * scale;
      eye.targetY = directionY * scale;
    }
  };

  const setAutomaticTargets = timestamp => {
    const angle = (timestamp % autoPeriod) / autoPeriod * Math.PI * 2;
    for (const eye of eyes) {
      const bounds = eye.element.getBoundingClientRect();
      const pupilBounds = eye.pupil.getBoundingClientRect();
      const maxX = Math.max(0, (bounds.width - pupilBounds.width) * 0.46);
      const maxY = Math.max(0, (bounds.height - pupilBounds.height) * 0.46);
      eye.targetX = Math.cos(angle) * maxX * 0.82;
      eye.targetY = Math.sin(angle) * maxY * 0.68;
    }
  };

  const animate = timestamp => {
    const automatic = !finePointer || timestamp - lastPointerMove >= idleDelay;
    if (automatic) setAutomaticTargets(timestamp);
    else setPointerTargets();

    const frameScale = Math.min(3, Math.max(0.5, (timestamp - lastFrame) / 16.67));
    const easing = 1 - Math.pow(0.9, frameScale);
    lastFrame = timestamp;
    for (const eye of eyes) {
      eye.x += (eye.targetX - eye.x) * easing;
      eye.y += (eye.targetY - eye.y) * easing;
      eye.pupil.style.setProperty('--pupil-x', `${eye.x.toFixed(2)}px`);
      eye.pupil.style.setProperty('--pupil-y', `${eye.y.toFixed(2)}px`);
    }
    requestAnimationFrame(animate);
  };

  if (finePointer) {
    window.addEventListener('pointermove', event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMove = performance.now();
    }, { passive: true });
  }

  requestAnimationFrame(animate);
})();
