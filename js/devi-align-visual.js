/* Joondab ekraanipildi esimese sisulise lõigu algusega, arvestades fondi ja vaate laiust. */
(() => {
  const hero = document.querySelector('.devi-product .devi-hero');
  const intro = hero?.querySelector('.devi-copy .devi-intro');
  if (!hero || !intro) return;
  const align = () => {
    if (window.matchMedia('(max-width: 1100px)').matches) {
      hero.style.removeProperty('--devi-intro-offset');
      return;
    }
    const offset = intro.getBoundingClientRect().top - hero.getBoundingClientRect().top;
    hero.style.setProperty('--devi-intro-offset', `${Math.max(0, Math.round(offset))}px`);
  };
  window.addEventListener('resize', align, { passive: true });
  window.addEventListener('load', align);
  if (document.fonts?.ready) document.fonts.ready.then(align);
  align();
})();
