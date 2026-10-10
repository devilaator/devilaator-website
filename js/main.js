(() => {
  'use strict';

  // SUPABASE SEADISTUS
  // GitHub Pages ei loe .env-faile, seega on avalikud väärtused siin konstantidena.
  const NEXT_PUBLIC_SUPABASE_URL =
    'https://atmzrmvzopydbpwwffjx.supabase.co';

  const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_PYTBA2nEa9SK0xYlG-7BHg_2Q16kQQb';

  /**
   * Loeb avaliku seadistusväärtuse.
   * Toetab nii puhast väärtust kui ka kuju NIMI=väärtus.
   */
  function readPublicConfig(value, name) {
    let result = String(value ?? '').trim();
    const prefix = new RegExp(`^${name}\\s*=\\s*`);

    result = result.replace(prefix, '').trim();

    const hasDoubleQuotes =
      result.startsWith('"') && result.endsWith('"');

    const hasSingleQuotes =
      result.startsWith("'") && result.endsWith("'");

    if (hasDoubleQuotes || hasSingleQuotes) {
      result = result.slice(1, -1).trim();
    }

    return result;
  }

  // Jagatud avalik seadistus admin-vaatele.
  // Kontaktvormi Auth-seanss jääb eraldatuks.
  window.DEVILAATOR_SUPABASE_CONFIG = Object.freeze({
    url: readPublicConfig(
      NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL'
    ),
    key: readPublicConfig(
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    )
  });

  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  const mobile = matchMedia(
    document.body.classList.contains('home-page')
      ? '(max-width: 768px)'
      : '(max-width: 750px)'
  );

  const header = document.querySelector('header');
  const menu = document.querySelector('#primary-nav');
  const toggle = document.querySelector('.menu-toggle');
  const mobileHeader = document.querySelector(
    '.home-page > header.site-header'
  );

  let requestedSection = null;

  function updateMobileHeader() {
    if (!mobileHeader) {
      return;
    }

    mobileHeader.classList.toggle(
      'mobile-scrolled',
      mobile.matches && window.scrollY > 50
    );
  }

  function closeMenu(shouldFocusToggle = false) {
    if (!toggle || !menu) {
      return;
    }

    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');

    if (shouldFocusToggle) {
      toggle.focus();
    }
  }

  function setupMobileMenu() {
    if (!toggle || !menu) {
      return;
    }

    header.classList.add('menu-ready');

    toggle.addEventListener('click', () => {
      const isOpen =
        toggle.getAttribute('aria-expanded') !== 'true';

      toggle.setAttribute(
        'aria-expanded',
        String(isOpen)
      );

      menu.classList.toggle(
        'is-open',
        isOpen
      );
    });

    document.addEventListener('keydown', event => {
      const isOpen =
        toggle.getAttribute('aria-expanded') === 'true';

      if (event.key === 'Escape' && isOpen) {
        closeMenu(true);
      }
    });

    document.addEventListener('click', event => {
      if (!header.contains(event.target)) {
        closeMenu();
      }
    });

    header.addEventListener('focusout', event => {
      if (!header.contains(event.relatedTarget)) {
        closeMenu();
      }
    });

    mobile.addEventListener('change', () => {
      closeMenu(
        mobile.matches &&
        menu.contains(document.activeElement)
      );
    });

    menu.addEventListener('click', event => {
      if (event.target.closest('a')) {
        closeMenu();
      }
    });
  }

  function setupAnchorNavigation() {
    document
      .querySelectorAll('a[href*="#"]')
      .forEach(link => {
        link.addEventListener('click', event => {
          const isModifiedClick =
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey;

          if (isModifiedClick) {
            return;
          }

          const url = new URL(link.href);

          const isCurrentPage =
            url.origin === location.origin &&
            url.pathname === location.pathname &&
            url.search === location.search;

          if (!isCurrentPage) {
            return;
          }

          const targetId = decodeURIComponent(
            url.hash.slice(1)
          );

          const target =
            document.getElementById(targetId);

          if (!target) {
            return;
          }

          event.preventDefault();
          closeMenu();

          target.setAttribute('tabindex', '-1');
          target.focus({
            preventScroll: true
          });

          const matchingNavLink = menu
            ? [...menu.querySelectorAll('a[href^="#"]')]
                .find(item => item.hash === url.hash)
            : null;

          if (matchingNavLink) {
            requestedSection = target;

            menu
              .querySelectorAll('a[aria-current]')
              .forEach(item => {
                item.removeAttribute('aria-current');
              });

            matchingNavLink.setAttribute(
              'aria-current',
              'location'
            );
          }

          target.scrollIntoView({
            behavior: motion.matches
              ? 'instant'
              : 'smooth',
            block: 'start'
          });

          if (location.hash !== url.hash) {
            history.pushState(
              null,
              '',
              url.hash
            );
          }
        });
      });
  }

  function getNavigationSections() {
    if (!menu) {
      return [];
    }

    const items = [
      ...menu.querySelectorAll('a[href^="#"]')
    ]
      .map(link => ({
        link,
        section: document.getElementById(
          link.hash.slice(1)
        )
      }))
      .filter(item => item.section);

    // Järjestame sektsioonid dokumendi järjekorra järgi,
    // isegi kui menüüs on need teises järjekorras.
    items.sort((a, b) => {
      if (a.section === b.section) {
        return 0;
      }

      return a.section.compareDocumentPosition(
        b.section
      ) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;
    });

    return items;
  }

  function setupActiveSectionTracking(links) {
    if (!links.length) {
      return;
    }

    let scheduled = false;

    function update() {
      scheduled = false;

      updateMobileHeader();

      const scrollPadding =
        parseFloat(
          getComputedStyle(
            document.documentElement
          ).scrollPaddingTop
        ) || 0;

      const marker = Math.max(
        header.getBoundingClientRect().height + 32,
        scrollPadding + 2
      );

      let active = null;

      for (const item of links) {
        if (
          item.section
            .getBoundingClientRect()
            .top <= marker
        ) {
          active = item;
        }
      }

      const atBottom =
        innerHeight + scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        active = links[links.length - 1];
      }

      if (requestedSection) {
        const requestedItem = links.find(
          item =>
            item.section === requestedSection
        );

        if (requestedItem) {
          active = requestedItem;
        }

        const requestedTop =
          requestedSection
            .getBoundingClientRect()
            .top;

        const reachedTarget =
          Math.abs(
            requestedTop - marker
          ) <= 4 || atBottom;

        if (reachedTarget) {
          requestedSection = null;
        }
      }

      for (const item of links) {
        if (item === active) {
          item.link.setAttribute(
            'aria-current',
            'location'
          );
        } else {
          item.link.removeAttribute(
            'aria-current'
          );
        }
      }
    }

    function schedule() {
      if (scheduled) {
        return;
      }

      scheduled = true;

      requestAnimationFrame(update);
    }

    addEventListener(
      'scroll',
      schedule,
      { passive: true }
    );

    addEventListener(
      'resize',
      schedule
    );

    addEventListener(
      'load',
      schedule
    );

    addEventListener(
      'wheel',
      () => {
        requestedSection = null;
      },
      { passive: true }
    );

    addEventListener(
      'touchstart',
      () => {
        requestedSection = null;
      },
      { passive: true }
    );

    update();
  }

  function setupRevealAnimations() {
    if (
      !('IntersectionObserver' in window) ||
      motion.matches
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            entry.target.classList.remove(
              'reveal-pending'
            );

            observer.unobserve(
              entry.target
            );
          }
        },
        {
          threshold: 0.05
        }
      );

    const elements =
      document.querySelectorAll(
        '.hero-copy, ' +
        '.hero-illustration, ' +
        '.project-card, ' +
        '#about, ' +
        '#contact'
      );

    elements.forEach(element => {
      element.classList.add(
        'reveal',
        'reveal-pending'
      );

      observer.observe(element);
    });

    motion.addEventListener(
      'change',
      () => {
        if (!motion.matches) {
          return;
        }

        observer.disconnect();

        document
          .querySelectorAll(
            '.reveal-pending'
          )
          .forEach(element => {
            element.classList.remove(
              'reveal-pending'
            );
          });
      }
    );
  }

  function setupContactForm() {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    const fields = [...form.querySelectorAll('input, textarea')];
    const status = form.querySelector('#contact-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = submitButton?.querySelector('.contact-submit-label');

    if (!status || !submitButton || !submitLabel) return;

    const defaultSubmitText = submitLabel.textContent;
    let sending = false;
    let contactClient;

    form.noValidate = true;
    submitButton.disabled = false;

    function validate(field) {
      const value = field.value.trim();
      let error = '';

      if (!value) {
        error = {
          name: 'Sisestage nimi.',
          email: 'Sisestage e-post.',
          message: 'Kirjutage sõnum.'
        }[field.name] || 'Palun täida väli.';
      } else if (
        field.type === 'email' &&
        (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      ) {
        error = 'Palun sisesta korrektne e-posti aadress.';
      } else if (field.maxLength > 0 && value.length > field.maxLength) {
        error = `Lubatud on kuni ${field.maxLength} märki.`;
      }

      const errorElement = document.getElementById(`${field.id}-error`);
      if (errorElement) errorElement.textContent = error;
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

      const invalidFields = fields.filter(field => !validate(field));
      if (invalidFields.length) {
        status.textContent = 'Palun paranda märgitud väljad.';
        invalidFields[0].focus();
        return;
      }

      const payload = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim()
      };

      sending = true;
      submitButton.disabled = true;
      submitLabel.textContent = 'Saadan…';
      form.setAttribute('aria-busy', 'true');
      fields.forEach(field => { field.readOnly = true; });
      status.textContent = 'Sõnumi saatmine…';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const supabaseUrl = readPublicConfig(
          NEXT_PUBLIC_SUPABASE_URL,
          'NEXT_PUBLIC_SUPABASE_URL'
        );
        const supabaseKey = readPublicConfig(
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
        );

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase public URL or publishable key is missing.');
        }

        if (!URL.canParse(supabaseUrl) || new URL(supabaseUrl).protocol !== 'https:') {
          throw new Error('Supabase URL must be a valid HTTPS project URL.');
        }

        if (typeof window.supabase?.createClient !== 'function') {
          throw new Error('Supabase CDN client did not load. Check the CDN script in Network.');
        }

        contactClient ??= window.supabase.createClient(supabaseUrl, supabaseKey, {
          db: { schema: 'public' },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        });

        // Ainult INSERT; id/status/created_at tulevad andmebaasist.
        const { error } = await contactClient
          .from('contact_messages')
          .insert(payload)
          .abortSignal(controller.signal);

        if (error) throw error;

        form.reset();
        fields.forEach(field => {
          field.removeAttribute('aria-invalid');
          const errorElement = document.getElementById(`${field.id}-error`);
          if (errorElement) errorElement.textContent = '';
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
        submitLabel.textContent = defaultSubmitText;
        form.removeAttribute('aria-busy');
        fields.forEach(field => { field.readOnly = false; });
      }
    });
  }

  updateMobileHeader();
  setupMobileMenu();
  setupAnchorNavigation();

  const navigationSections =
    getNavigationSections();

  setupActiveSectionTracking(
    navigationSections
  );

  setupRevealAnimations();
  setupContactForm();
})();


(() => {
  'use strict';

  const trigger = document.getElementById('devilaatoristLink');
  const dialog = document.getElementById('devError');
  const closeButton = document.getElementById('devErrorClose');

  if (!trigger || !dialog || !closeButton) return;

  function openDialog() {
    dialog.classList.add('show');
    dialog.setAttribute('aria-hidden', 'false');
    closeButton.focus();
  }

  function closeDialog() {
    dialog.classList.remove('show');
    dialog.setAttribute('aria-hidden', 'true');
    trigger.focus();
  }

  trigger.addEventListener('click', openDialog);
  closeButton.addEventListener('click', closeDialog);

  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.classList.contains('show')) {
      closeDialog();
    }
  });
})();