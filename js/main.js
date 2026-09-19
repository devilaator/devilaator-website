(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 750px)');
  const header = document.querySelector('header');
  const menu = document.querySelector('#primary-nav');
  const toggle = document.querySelector('.menu-toggle');
  function closeMenu(focus = false) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    if (focus) toggle.focus();
  }
  if (toggle && menu) {
    header.classList.add('menu-ready');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
    header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) closeMenu(); });
    mobile.addEventListener('change', () => closeMenu(mobile.matches && menu.contains(document.activeElement)));
    menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  }
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      closeMenu();
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    });
  });
  const links = menu ? [...menu.querySelectorAll('a[href^="#"]')].map(link => ({ link, section: document.getElementById(link.hash.slice(1)) })).filter(item => item.section) : [];
  if (links.length) {
    let scheduled = false;
    function update() {
      scheduled = false;
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const marker = Math.max(header.getBoundingClientRect().height + 32, scrollPadding + 2);
      let active = links[0];
      for (const item of links) if (item.section.getBoundingClientRect().top <= marker) active = item;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) active = links[links.length - 1];
      for (const item of links) {
        if (item === active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      }
    }
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('load', schedule);
    update();
  }
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.05 });
    document.querySelectorAll('.hero-copy, .hero-illustration, .project-card, #about, #contact').forEach(element => {
      element.classList.add('reveal', 'reveal-pending');
      observer.observe(element);
    });
    motion.addEventListener('change', () => {
      if (!motion.matches) return;
      observer.disconnect();
      document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
    });
  }
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const fields = [...form.querySelectorAll('input, textarea')];
  const status = document.querySelector('#contact-status');
  form.noValidate = true;
  form.querySelector('button[type="submit"]').disabled = false;
  function validate(field) {
    const value = field.value.trim();
    let error = '';
    if (!value) error = { name: 'Palun sisesta nimi.', email: 'Palun sisesta e-post.', message: 'Palun kirjuta sõnum.' }[field.name];
    else if (field.type === 'email' && (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) error = 'Palun sisesta korrektne e-posti aadress.';
    else if (field.maxLength > 0 && value.length > field.maxLength) error = `Lubatud on kuni ${field.maxLength} märki.`;
    document.getElementById(`${field.id}-error`).textContent = error;
    field.setAttribute('aria-invalid', String(Boolean(error)));
    return !error;
  }
  fields.forEach(field => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      status.textContent = '';
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = fields.filter(field => !validate(field));
    if (invalid.length) {
      status.textContent = 'Palun paranda märgitud väljad.';
      invalid[0].focus();
      return;
    }
    // Liidestuskoht: saada FormData serveri kontaktiteenusele. Server peab
    // valideerima sisendi ja piirama päringuid; saaja aadress jääb serverisse.
    // Eduteade ja vormi tühjendamine ainult pärast serveri kinnitust.
    status.textContent = 'Väljad on korrektsed, kuid saatmine pole veel avatud. Sõnumit ei saadetud. Seni leiad mind GitHubist.';
  });
})();
