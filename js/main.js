(() => {
  'use strict';
  // SUPABASE SEADISTUS — kleebi siia oma projekti kaks avalikku väärtust.
  // Need on tavalised JS-konstandid; GitHub Pages ei loe .env faile.
  const NEXT_PUBLIC_SUPABASE_URL 
  = 'https://atmzrmvzopydbpwwffjx.supabase.co'; // Näiteks https://YOUR_PROJECT.supabase.co
  const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 
  = 'sb_publishable_PYTBA2nEa9SK0xYlG-7BHg_2Q16kQQb'; // Projekti publishable key

  // Jagatud avalik seadistus admin-vaatele; kontaktvormi Auth-seanss jääb eraldatuks.
  window.DEVILAATOR_SUPABASE_CONFIG = Object.freeze({
    url: readPublicConfig(NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    key: readPublicConfig(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  });
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
  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = submitButton.textContent;
  let sending = false;
  let contactClient;
  // Toetab nii puhast väärtust kui ka kopeeritud kujul NIMI=väärtus seadistust.
  // Algseid seadistuskonstante ei muudeta.
  function readPublicConfig(value, name) {
    let result = String(value ?? '').trim();
    const prefix = new RegExp(`^${name}\\s*=\\s*`);
    result = result.replace(prefix, '').trim();
    if ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith("'") && result.endsWith("'"))) {
      result = result.slice(1, -1).trim();
    }
    return result;
  }
  form.noValidate = true;
  submitButton.disabled = false;
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
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const invalid = fields.filter(field => !validate(field));
    if (invalid.length) {
      status.textContent = 'Palun paranda märgitud väljad.';
      invalid[0].focus();
      return;
    }
    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim()
    };
    sending = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Saadan…';
    form.setAttribute('aria-busy', 'true');
    fields.forEach(field => { field.readOnly = true; });
    status.textContent = 'Sõnumi saatmine…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const supabaseUrl = readPublicConfig(NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
      const supabaseKey = readPublicConfig(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase public URL or publishable key is missing.');
      }
      if (!URL.canParse(supabaseUrl) || new URL(supabaseUrl).protocol !== 'https:') {
        throw new Error('Supabase URL must be a valid HTTPS project URL.');
      }
      if (typeof window.supabase?.createClient !== 'function') {
        throw new Error('Supabase CDN client did not load. Check the CDN script in Network.');
      }
      contactClient ??= window.supabase.createClient(
        supabaseUrl,
        supabaseKey,
        { db: { schema: 'public' }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
      );
      // Ainult INSERT: ei küsi ridu tagasi. status, id ja created_at tulevad andmebaasist.
      const { error } = await contactClient.from('contact_messages').insert(payload).abortSignal(controller.signal);
      if (error) throw error;
      form.reset();
      fields.forEach(field => {
        field.removeAttribute('aria-invalid');
        document.getElementById(`${field.id}-error`).textContent = '';
      });
      status.textContent = 'Sõnum saadetud. Aitäh!';
    } catch (error) {
      console.error('Supabase contact error:', error);
      status.textContent = controller.signal.aborted
        ? 'Saatmise kinnitust ei saabunud õigel ajal. Sõnum võis kohale jõuda; palun oota enne uuesti saatmist.'
        : 'Sõnumi saatmine ei õnnestunud. Palun kontrolli internetiühendust ja proovi hiljem uuesti.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      submitButton.disabled = false;
      submitButton.textContent = submitLabel;
      form.removeAttribute('aria-busy');
      fields.forEach(field => { field.readOnly = false; });
    }
  });
})();
