(() => {
  'use strict';

  const moreNavigation = document.querySelector('.elva-nav-more');
  const moreToggle = document.querySelector('#elva-more-toggle');
  const moreMenu = document.querySelector('#elva-more-menu');

  function closeMoreNavigation() {
    if (!moreNavigation || !moreToggle) return;
    moreNavigation.classList.remove('is-open');
    moreToggle.setAttribute('aria-expanded', 'false');
  }

  if (moreNavigation && moreToggle && moreMenu) {
    moreToggle.addEventListener('click', () => {
      const open = moreToggle.getAttribute('aria-expanded') !== 'true';
      moreNavigation.classList.toggle('is-open', open);
      moreToggle.setAttribute('aria-expanded', String(open));
    });
    moreMenu.addEventListener('click', event => {
      if (event.target.closest('a')) closeMoreNavigation();
    });
    document.addEventListener('click', event => {
      if (!moreNavigation.contains(event.target)) closeMoreNavigation();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMoreNavigation();
    });
  }

  const form = document.querySelector('#elva-join-form');
  if (form) {
    const status = document.querySelector('#elva-form-status');
    // UI preview only: never send or persist the values, including on Enter.
    form.addEventListener('submit', event => {
      event.preventDefault();
      status.textContent = 'See on näidisvorm. Andmeid ei saadetud ega salvestatud. Liitumise võimalus lisandub hiljem.';
    });
    form.querySelector('button[type="submit"]').disabled = false;
  }

  const eventTypes = Object.freeze({
    training: 'TRENN',
    camp: 'LAAGER',
    competition: 'VÕISTLUS',
    'special-event': 'ÜRITUS',
    'training-cancelled': 'TRENN JÄÄB ÄRA'
  });
  const eventSymbols = Object.freeze({
    training: '✓',
    camp: '◆',
    competition: '★',
    'special-event': '●',
    'training-cancelled': '✕'
  });

  const regularTrainingRules = Object.freeze([
    { weekdays: [1, 3, 5], type: 'training', group: 'small', title: 'Väiksed 4–8 a', calendarLabel: '4–8 a', mobileLabel: '4–8', time: '17.30–18.15' },
    { weekdays: [1, 2, 4], type: 'training', group: 'students', title: 'Õpilased 9–17 a', calendarLabel: '9–17 a', mobileLabel: '9–17', time: '19.00–20.00' },
    { weekdays: [3], type: 'training', group: 'playful', title: 'Mänguline treening', calendarLabel: 'Mänguline', mobileLabel: 'Mäng.', time: '18.30–19.15' }
  ]);

  // Later this array can be replaced by Supabase rows without changing the calendar renderer.
  // A cancellation can include `replaces: 'Väiksed 4–8 a'` to hide that regular session.
  const calendarEvents = Object.freeze([
    // { date: 'YYYY-MM-DD', type: 'training-cancelled', replaces: 'Väiksed 4–8 a' },
    // { date: 'YYYY-MM-DD', type: 'camp', title: 'Laagri nimi', time: '10.00' },
    // { date: 'YYYY-MM-DD', type: 'competition', title: 'Võistluse nimi', time: '12.00' },
    // { date: 'YYYY-MM-DD', type: 'special-event', title: 'Klubiüritus', time: '18.00' }
  ]);

  // These arrays are ready for future admin/Supabase data.
  const competitionResults = Object.freeze([
    // { date: '2026-10-05', competition: '', athlete: '', result: '' }
  ]);
  const partners = Object.freeze([
    { name: 'DEVILAATOR', website: 'www.devilaator.ee', logo: '', link: 'https://www.devilaator.ee' },
    { name: 'ELVA SPORT', website: '', logo: '', link: '' },
    { name: 'ELVA VALD', website: '', logo: '', link: '' }
  ]);

  const resultsList = document.querySelector('#elva-results-list');
  const resultsEmpty = document.querySelector('#elva-results-empty');
  if (resultsList && resultsEmpty && competitionResults.length) {
    resultsEmpty.hidden = true;
    competitionResults.forEach(result => {
      const article = document.createElement('article');
      article.className = 'elva-result';
      const date = document.createElement('time');
      date.dateTime = result.date;
      date.textContent = new Intl.DateTimeFormat('et-EE').format(new Date(`${result.date}T12:00:00`));
      const competition = document.createElement('strong');
      competition.textContent = result.competition;
      const athlete = document.createElement('span');
      athlete.textContent = result.athlete;
      const outcome = document.createElement('b');
      outcome.textContent = result.result;
      article.append(date, competition, athlete, outcome);
      resultsList.append(article);
    });
  }

  const partnersSection = document.querySelector('#partnerid');
  const partnersList = document.querySelector('#elva-partners-list');
  if (partnersSection && partnersList && partners.length) {
    partners.forEach(partner => {
      const item = document.createElement(partner.link ? 'a' : 'div');
      item.className = 'elva-partner';
      if (partner.link) {
        item.href = partner.link;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }
      if (partner.logo) {
        const logo = document.createElement('img');
        logo.src = partner.logo;
        logo.alt = partner.name;
        logo.loading = 'lazy';
        logo.width = 240;
        logo.height = 120;
        item.append(logo);
      }

      const name = document.createElement('strong');
      name.className = 'elva-partner-name';
      name.textContent = partner.name;
      item.append(name);

      if (partner.website) {
        const website = document.createElement('span');
        website.className = 'elva-partner-website';
        website.textContent = partner.website;
        item.append(website);
      }

      partnersList.append(item);
    });
    partnersSection.hidden = false;
  }

  const calendarGrid = document.querySelector('#elva-calendar-grid');
  const monthLabel = document.querySelector('#elva-calendar-month');
  const details = document.querySelector('#elva-calendar-details');
  const previousButton = document.querySelector('#elva-calendar-prev');
  const nextButton = document.querySelector('#elva-calendar-next');
  const todayButton = document.querySelector('#elva-calendar-today');

  if (calendarGrid && monthLabel && details && previousButton && nextButton && todayButton) {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const minimumMonth = new Date(today.getFullYear(), today.getMonth() - 12, 1);
    const maximumMonth = new Date(today.getFullYear(), today.getMonth() + 12, 1);
    let visibleMonth = new Date(currentMonth);
    let selectedDate = toIsoDate(today);

    function toIsoDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function eventsForDate(date) {
      const isoDate = toIsoDate(date);
      const exceptions = calendarEvents.filter(event => event.date === isoDate);
      const replacedTitles = new Set(
        exceptions
          .filter(event => event.type === 'training-cancelled' && event.replaces)
          .map(event => event.replaces)
      );
      const normalizedExceptions = exceptions.map(event => {
        if (event.type !== 'training-cancelled') return event;
        const replacedRule = regularTrainingRules.find(rule => rule.title === event.replaces);
        return {
          ...replacedRule,
          ...event,
          title: event.title || replacedRule?.title || 'Treening',
          time: event.time || replacedRule?.time || '',
          group: event.group || replacedRule?.group,
          calendarLabel: event.calendarLabel || replacedRule?.calendarLabel || event.title || 'Treening',
          mobileLabel: event.mobileLabel || replacedRule?.mobileLabel || event.title || 'Trenn'
        };
      });
      const regular = regularTrainingRules
        .filter(rule => rule.weekdays.includes(date.getDay()) && !replacedTitles.has(rule.title))
        .map(rule => ({ ...rule, date: isoDate }));
      return [...regular, ...normalizedExceptions];
    }

    function renderDetails(date, events) {
      details.replaceChildren();
      if (!events.length) {
        details.hidden = true;
        return;
      }

      details.hidden = false;
      const heading = document.createElement('h3');
      heading.textContent = new Intl.DateTimeFormat('et-EE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      }).format(date);
      details.append(heading);

      const list = document.createElement('ul');
      events.forEach(event => {
        const item = document.createElement('li');
        item.dataset.eventType = event.type;
        if (event.group) item.dataset.trainingGroup = event.group;
        const type = document.createElement('span');
        const symbol = document.createElement('b');
        symbol.setAttribute('aria-hidden', 'true');
        symbol.textContent = eventSymbols[event.type] || '•';
        type.append(symbol, eventTypes[event.type] || event.type);
        const copy = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = event.title;
        copy.append(title);
        if (event.time) {
          const time = document.createElement('time');
          time.textContent = event.time;
          copy.append(time);
        }
        if (event.type === 'training-cancelled') {
          const cancelled = document.createElement('em');
          cancelled.textContent = 'Treening jääb ära';
          copy.append(cancelled);
        }
        item.append(type, copy);
        list.append(item);
      });
      details.append(list);
    }

    function renderCalendar() {
      calendarGrid.replaceChildren();
      monthLabel.textContent = new Intl.DateTimeFormat('et-EE', {
        month: 'long', year: 'numeric'
      }).format(visibleMonth).toLocaleUpperCase('et-EE');

      const year = visibleMonth.getFullYear();
      const month = visibleMonth.getMonth();
      const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let index = 0; index < firstWeekday; index += 1) {
        const empty = document.createElement('span');
        empty.className = 'elva-calendar-empty';
        calendarGrid.append(empty);
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const isoDate = toIsoDate(date);
        const events = eventsForDate(date);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'elva-calendar-day';
        button.dataset.date = isoDate;
        const eventSummary = events.map(event => {
          const status = event.type === 'training-cancelled' ? 'trenn jääb ära' : eventTypes[event.type].toLocaleLowerCase('et-EE');
          return `${status}: ${event.title}${event.time ? ` ${event.time}` : ''}`;
        }).join('; ');
        button.setAttribute('aria-label', `${day}. ${monthLabel.textContent.toLocaleLowerCase('et-EE')}, ${events.length} ${events.length === 1 ? 'sündmus' : 'sündmust'}${eventSummary ? `. ${eventSummary}` : ''}`);
        button.setAttribute('aria-pressed', String(isoDate === selectedDate));
        if (isoDate === toIsoDate(today)) button.classList.add('is-today');
        if (events.length) button.classList.add('has-events');

        const number = document.createElement('span');
        number.className = 'elva-calendar-number';
        number.textContent = day;
        button.append(number);

        if (events.length) {
          const eventList = document.createElement('span');
          eventList.className = 'elva-calendar-events';
          events.forEach(event => {
            const entry = document.createElement('span');
            entry.className = 'elva-calendar-event';
            entry.dataset.eventType = event.type;
            if (event.group) entry.dataset.trainingGroup = event.group;
            const symbol = document.createElement('span');
            symbol.className = 'elva-calendar-event-symbol';
            symbol.setAttribute('aria-hidden', 'true');
            symbol.textContent = eventSymbols[event.type] || '•';
            const name = document.createElement('span');
            name.className = 'elva-calendar-event-name';
            const fullName = document.createElement('span');
            fullName.className = 'elva-calendar-event-name-full';
            fullName.textContent = event.calendarLabel || event.title;
            const shortName = document.createElement('span');
            shortName.className = 'elva-calendar-event-name-short';
            shortName.textContent = event.mobileLabel || event.calendarLabel || event.title;
            name.append(fullName, shortName);
            entry.append(symbol, name);
            if (event.time) {
              const time = document.createElement('time');
              time.textContent = event.time.split(/[–-]/)[0].replace('.', ':');
              entry.append(time);
            }
            entry.title = event.type === 'training-cancelled'
              ? `${event.title} — treening jääb ära`
              : `${event.title}${event.time ? ` — ${event.time}` : ''}`;
            eventList.append(entry);
          });
          button.append(eventList);
        }

        button.addEventListener('click', () => {
          selectedDate = isoDate;
          calendarGrid.querySelectorAll('.elva-calendar-day').forEach(dayButton => {
            dayButton.setAttribute('aria-pressed', String(dayButton === button));
          });
          renderDetails(date, events);
        });
        calendarGrid.append(button);
      }

      previousButton.disabled = visibleMonth <= minimumMonth;
      nextButton.disabled = visibleMonth >= maximumMonth;
      const selected = calendarGrid.querySelector(`[data-date="${selectedDate}"]`);
      if (selected) {
        const selectedDateObject = new Date(`${selectedDate}T12:00:00`);
        renderDetails(selectedDateObject, eventsForDate(selectedDateObject));
      } else {
        details.replaceChildren();
        details.hidden = true;
      }
    }

    function changeMonth(offset) {
      const candidate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
      if (candidate < minimumMonth || candidate > maximumMonth) return;
      visibleMonth = candidate;
      selectedDate = '';
      renderCalendar();
    }

    previousButton.addEventListener('click', () => changeMonth(-1));
    nextButton.addEventListener('click', () => changeMonth(1));
    todayButton.addEventListener('click', () => {
      visibleMonth = new Date(currentMonth);
      selectedDate = toIsoDate(today);
      renderCalendar();
    });
    renderCalendar();
  }

  document.querySelectorAll('.elva-faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.setAttribute('aria-hidden', String(expanded));
      answer.inert = expanded;
    });
  });

  const galleryItems = [...document.querySelectorAll('.elva-gallery-item')];
  const lightbox = document.querySelector('#elva-lightbox');
  const lightboxMedia = document.querySelector('#elva-lightbox-media');
  const lightboxCaption = document.querySelector('#elva-lightbox-caption');
  let galleryIndex = 0;
  let galleryOpener = null;
  let touchStartX = 0;

  function showGalleryItem(index) {
    if (!galleryItems.length || !lightboxMedia || !lightboxCaption) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[galleryIndex];
    lightboxMedia.replaceChildren();
    if (item.dataset.fullSrc) {
      const image = document.createElement('img');
      image.src = item.dataset.fullSrc;
      image.alt = item.dataset.alt || `Elva Poksiklubi galerii foto ${galleryIndex + 1}`;
      image.decoding = 'async';
      lightboxMedia.append(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'elva-photo-empty';
      placeholder.textContent = 'FOTO LISANDUB';
      lightboxMedia.append(placeholder);
    }
    lightboxCaption.textContent = item.dataset.alt || `Galerii pildikoht ${galleryIndex + 1} / ${galleryItems.length}`;
  }

  if (galleryItems.length && lightbox) {
    galleryItems.forEach((item, index) => item.addEventListener('click', () => {
      galleryOpener = item;
      showGalleryItem(index);
      lightbox.showModal();
    }));
    lightbox.querySelector('.elva-lightbox-close').addEventListener('click', () => lightbox.close());
    lightbox.querySelector('.elva-lightbox-prev').addEventListener('click', () => showGalleryItem(galleryIndex - 1));
    lightbox.querySelector('.elva-lightbox-next').addEventListener('click', () => showGalleryItem(galleryIndex + 1));
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') showGalleryItem(galleryIndex - 1);
      if (event.key === 'ArrowRight') showGalleryItem(galleryIndex + 1);
    });
    lightbox.addEventListener('touchstart', event => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', event => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) < 45) return;
      showGalleryItem(galleryIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });
    lightbox.addEventListener('close', () => galleryOpener?.focus());
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.documentElement.classList.add('elva-reveal-ready');
    const targets = [
      document.querySelector('.elva-training-panel'),
      document.querySelector('.elva-calendar-panel'),
      ...document.querySelectorAll('.elva-page > .elva-section:not(#treeningud):not(#kalender)')
    ].filter(Boolean);
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -45px' });
    targets.forEach(target => {
      target.classList.add('elva-reveal');
      revealObserver.observe(target);
    });
    reducedMotion.addEventListener('change', () => {
      if (!reducedMotion.matches) return;
      revealObserver.disconnect();
      targets.forEach(target => target.classList.add('is-visible'));
    });
  }
})();
