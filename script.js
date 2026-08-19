/* ============================================================
   Wedding invitation — Version 1 (envelope) + Version 2 (scroll)
   ============================================================ */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const toast = document.getElementById('toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ── Version switcher ── */
  const versionSelect = document.getElementById('version-select');
  const versionPanels = document.querySelectorAll('.version-panel');
  const storedVersion = sessionStorage.getItem('invitation-version');
  let activeVersion = storedVersion || (versionSelect && versionSelect.value) || '1';

  if (versionSelect) versionSelect.value = activeVersion;
  document.body.dataset.activeVersion = activeVersion;

  function applyVersionVisibility(value) {
    versionPanels.forEach((panel) => {
      const active = panel.dataset.version === value;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    document.body.dataset.activeVersion = value;
  }

  applyVersionVisibility(activeVersion);

  function setActiveVersion(version) {
    const value = String(version);
    const previous = activeVersion;
    activeVersion = value;
    sessionStorage.setItem('invitation-version', value);
    applyVersionVisibility(value);

    if (value === '2') {
      document.body.classList.remove('is-handoff');
      ScrollTrigger.getAll().forEach((st) => st.disable(false));
      window.scrollTo(0, 0);
      return;
    }

    /* Returning to Version 1 — hard reset keeps envelope pin healthy */
    if (previous === '2' && value === '1') {
      window.location.reload();
      return;
    }

    window.scrollTo(0, 0);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  if (versionSelect) {
    versionSelect.addEventListener('change', () => {
      setActiveVersion(versionSelect.value);
    });
  }

  /* ── Shared UI helpers ── */
  function bindAccordion(selector) {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panel = btn.nextElementSibling;
        btn.setAttribute('aria-expanded', String(!expanded));
        if (panel) panel.classList.toggle('open', !expanded);
      });
    });
  }

  function bindCopyButtons(selector) {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy || '').then(() => showToast('Copied!'));
      });
    });
  }

  function bindMobileNav(menuBtn, nav, closeBtn) {
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', () => {
        nav.classList.add('open');
        nav.setAttribute('aria-hidden', 'false');
      });
    }
    if (closeBtn && nav) {
      closeBtn.addEventListener('click', () => {
        nav.classList.remove('open');
        nav.setAttribute('aria-hidden', 'true');
      });
    }
    if (nav) {
      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
          nav.setAttribute('aria-hidden', 'true');
        });
      });
    }
  }

  bindAccordion('.accordion-trigger');
  bindAccordion('.v2-accordion-trigger');
  bindCopyButtons('.copy-btn');
  bindCopyButtons('.v2-copy-btn');

  const copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied!'));
    });
  }

  const v2CopyLinkBtn = document.getElementById('v2-copy-link-btn');
  if (v2CopyLinkBtn) {
    v2CopyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied!'));
    });
  }

  bindMobileNav(
    document.querySelector('.menu-btn'),
    document.getElementById('mobile-nav'),
    document.querySelector('.nav-close')
  );
  bindMobileNav(
    document.getElementById('v2-menu-btn'),
    document.getElementById('v2-nav'),
    document.querySelector('.v2-nav-close')
  );

  /* Version 2: envelope click → smooth scroll + word settle */
  const v2Header = document.getElementById('v2-header');
  const v2Envelope = document.getElementById('v2-envelope');
  const v2Join = document.getElementById('v2-join');
  const v2Save = document.getElementById('v2-save');
  let v2HeroRevealed = false;

  function wrapWords(el) {
    if (!el || el.dataset.wordsWrapped === '1') return;
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    nodes.forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) {
        el.appendChild(node);
        return;
      }
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          el.appendChild(document.createTextNode(part));
          return;
        }
        const span = document.createElement('span');
        span.className = 'v2-word';
        span.textContent = part;
        el.appendChild(span);
      });
    });
    el.dataset.wordsWrapped = '1';
  }

  function prepareV2HeroWords() {
    if (v2Join) {
      v2Join.querySelectorAll('.v2-name, .v2-amp').forEach((el) => {
        if (el.dataset.wordsWrapped === '1') return;
        const text = el.textContent;
        el.textContent = '';
        const span = document.createElement('span');
        span.className = 'v2-word';
        span.textContent = text;
        el.appendChild(span);
        el.dataset.wordsWrapped = '1';
      });
      wrapWords(v2Join.querySelector('.v2-datetime'));
    }
    if (v2Save) {
      wrapWords(v2Save.querySelector('.v2-eyebrow'));
      wrapWords(v2Save.querySelector('.v2-datetime'));
      wrapWords(v2Save.querySelector('.v2-venue-lead'));
      wrapWords(v2Save.querySelector('.v2-venue'));
    }
  }

  function revealV2JoinSequence() {
    if (!v2Join || v2HeroRevealed) return;
    v2HeroRevealed = true;
    prepareV2HeroWords();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v2Join.classList.add('is-letter-in', 'is-copy-in');
      v2Join.querySelectorAll('.v2-word').forEach((word) => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      });
      return;
    }

    /* 1) Letter lands softly first */
    requestAnimationFrame(() => {
      v2Join.classList.add('is-letter-in');
    });

    /* 2) Then text + frame */
    window.setTimeout(() => {
      v2Join.classList.add('is-copy-in');

      const joinWords = v2Join.querySelectorAll('.v2-word');
      joinWords.forEach((word, i) => {
        word.style.transition = `opacity 1.15s cubic-bezier(0.22, 1, 0.36, 1) ${0.12 + i * 0.12}s, transform 1.15s cubic-bezier(0.22, 1, 0.36, 1) ${0.12 + i * 0.12}s`;
        requestAnimationFrame(() => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        });
      });
    }, 900);
  }

  function revealV2SaveWords() {
    if (!v2Save || v2Save.dataset.revealed === '1') return;
    v2Save.dataset.revealed = '1';
    prepareV2HeroWords();
    const words = v2Save.querySelectorAll('.v2-word');
    words.forEach((word, i) => {
      word.style.transition = `opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.14}s, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.14}s`;
      requestAnimationFrame(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      });
    });
  }

  function openV2Invitation() {
    const target = v2Join || v2Save;
    if (!target) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      target.scrollIntoView({ behavior: 'auto' });
      revealV2JoinSequence();
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });

    /* Play join entrance only after click-scroll brings the section into view */
    let started = false;
    const tryStart = () => {
      if (started || !v2Join) return;
      const rect = v2Join.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.72) {
        started = true;
        window.removeEventListener('scroll', tryStart);
        revealV2JoinSequence();
      }
    };
    window.addEventListener('scroll', tryStart, { passive: true });
    window.setTimeout(() => {
      window.removeEventListener('scroll', tryStart);
      revealV2JoinSequence();
    }, 1100);
  }

  if (v2Envelope && (v2Join || v2Save)) {
    prepareV2HeroWords();
    v2Envelope.setAttribute('role', 'button');
    v2Envelope.setAttribute('tabindex', '0');
    v2Envelope.setAttribute('aria-label', 'Open the invitation');

    v2Envelope.addEventListener('click', openV2Invitation);
    v2Envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openV2Invitation();
      }
    });

    /* Also play when user scrolls into the join section */
    if (v2Join) {
      const joinObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.22) {
              revealV2JoinSequence();
            }
          });
        },
        { threshold: [0.22, 0.35] }
      );
      joinObserver.observe(v2Join);
    }

    if (v2Save) {
      const saveObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
              revealV2SaveWords();
            }
          });
        },
        { threshold: [0.35] }
      );
      saveObserver.observe(v2Save);
    }
  }

  if (v2Header && v2Envelope) {
    const syncV2Header = () => {
      if (document.body.dataset.activeVersion !== '2') return;
      const past = v2Envelope.getBoundingClientRect().bottom < 80;
      v2Header.classList.toggle('is-visible', past);
    };
    window.addEventListener('scroll', syncV2Header, { passive: true });
    syncV2Header();
  }

  if (v2Join && v2Save) {
    v2Join.addEventListener('click', () => {
      v2Save.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* Version 2 RSVP */
  const v2RsvpModal = document.getElementById('v2-rsvp-modal');
  const v2RsvpOpenButtons = document.querySelectorAll('.js-rsvp-open');
  const v2RsvpClose = document.getElementById('v2-rsvp-close');
  const v2RsvpForm = document.getElementById('v2-rsvp-form');

  function openV2Rsvp() {
    if (!v2RsvpModal) return;
    v2RsvpModal.classList.add('is-open');
    v2RsvpModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('v2-rsvp-modal-open');
    const firstField = v2RsvpModal.querySelector('input[name="name"]');
    if (firstField) firstField.focus();
  }

  function closeV2Rsvp() {
    if (!v2RsvpModal) return;
    v2RsvpModal.classList.remove('is-open');
    v2RsvpModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('v2-rsvp-modal-open');
  }

  v2RsvpOpenButtons.forEach((btn) => btn.addEventListener('click', openV2Rsvp));
  if (v2RsvpClose) v2RsvpClose.addEventListener('click', closeV2Rsvp);
  if (v2RsvpModal) {
    v2RsvpModal.addEventListener('click', (event) => {
      if (event.target === v2RsvpModal) closeV2Rsvp();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && v2RsvpModal && v2RsvpModal.classList.contains('is-open')) {
      closeV2Rsvp();
    }
  });
  if (v2RsvpForm) {
    v2RsvpForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(v2RsvpForm).entries());
      const replies = JSON.parse(localStorage.getItem('wedding-rsvp') || '[]');
      replies.push({ ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem('wedding-rsvp', JSON.stringify(replies));
      v2RsvpForm.reset();
      closeV2Rsvp();
      showToast('참석 여부가 전달되었습니다.');
    });
  }

  /* Version 2 shuttle timetable */
  const v2ShuttleModal = document.getElementById('v2-shuttle-modal');
  const v2ShuttleOpen = document.getElementById('v2-shuttle-open');
  const v2ShuttleClose = document.getElementById('v2-shuttle-close');
  const v2ShuttleTabs = Array.from(document.querySelectorAll('.v2-shuttle-tab'));
  const v2ShuttleHansung = document.getElementById('v2-shuttle-hansung');
  const v2ShuttleAnguk = document.getElementById('v2-shuttle-anguk');

  function openV2Shuttle() {
    if (!v2ShuttleModal) return;
    v2ShuttleModal.classList.add('is-open');
    v2ShuttleModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('v2-shuttle-modal-open');
  }

  function closeV2Shuttle() {
    if (!v2ShuttleModal) return;
    v2ShuttleModal.classList.remove('is-open');
    v2ShuttleModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('v2-shuttle-modal-open');
  }

  function setV2ShuttleTab(name) {
    v2ShuttleTabs.forEach((tab) => {
      const active = tab.dataset.shuttleTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    if (v2ShuttleHansung) {
      v2ShuttleHansung.classList.toggle('is-active', name === 'hansung');
      v2ShuttleHansung.hidden = name !== 'hansung';
    }
    if (v2ShuttleAnguk) {
      v2ShuttleAnguk.classList.toggle('is-active', name === 'anguk');
      v2ShuttleAnguk.hidden = name !== 'anguk';
    }
  }

  if (v2ShuttleOpen) v2ShuttleOpen.addEventListener('click', openV2Shuttle);
  if (v2ShuttleClose) v2ShuttleClose.addEventListener('click', closeV2Shuttle);
  if (v2ShuttleModal) {
    v2ShuttleModal.addEventListener('click', (event) => {
      if (event.target === v2ShuttleModal) closeV2Shuttle();
    });
  }
  v2ShuttleTabs.forEach((tab) => {
    tab.addEventListener('click', () => setV2ShuttleTab(tab.dataset.shuttleTab));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && v2ShuttleModal && v2ShuttleModal.classList.contains('is-open')) {
      closeV2Shuttle();
    }
  });

  /* Version 2 map zoom */
  const v2MapModal = document.getElementById('v2-map-modal');
  const v2MapOpen = document.getElementById('v2-map-open');
  const v2MapClose = document.getElementById('v2-map-close');

  function openV2Map() {
    if (!v2MapModal) return;
    v2MapModal.classList.add('is-open');
    v2MapModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('v2-map-modal-open');
  }

  function closeV2Map() {
    if (!v2MapModal) return;
    v2MapModal.classList.remove('is-open');
    v2MapModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('v2-map-modal-open');
  }

  if (v2MapOpen) v2MapOpen.addEventListener('click', openV2Map);
  if (v2MapClose) v2MapClose.addEventListener('click', closeV2Map);
  if (v2MapModal) {
    v2MapModal.addEventListener('click', (event) => {
      if (event.target === v2MapModal) closeV2Map();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && v2MapModal && v2MapModal.classList.contains('is-open')) {
      closeV2Map();
    }
  });

  /* Version 2 gallery modal */
  const v2GalleryModal = document.getElementById('v2-gallery-modal');
  const v2GalleryModalImage = document.getElementById('v2-gallery-modal-image');
  const v2GalleryClose = document.getElementById('v2-gallery-close');
  const v2GalleryPrev = document.getElementById('v2-gallery-prev');
  const v2GalleryNext = document.getElementById('v2-gallery-next');
  const v2GalleryMain = document.getElementById('v2-gallery-main');
  const v2GalleryMainImage = document.getElementById('v2-gallery-main-image');
  const v2GalleryThumbs = Array.from(document.querySelectorAll('.v2-gallery-thumb'));
  const v2GallerySources = v2GalleryThumbs.map((btn) => {
    const img = btn.querySelector('img');
    return img
      ? { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || 'Gallery image' }
      : { src: '', alt: 'Gallery image' };
  }).filter((item) => item.src);
  let v2GalleryIndex = 0;
  let v2TouchStartX = null;

  function renderV2Gallery(index) {
    if (!v2GallerySources.length) return;
    const count = v2GallerySources.length;
    v2GalleryIndex = (index + count) % count;
    const current = v2GallerySources[v2GalleryIndex];
    if (v2GalleryModalImage) {
      v2GalleryModalImage.src = current.src;
      v2GalleryModalImage.alt = current.alt;
    }
    if (v2GalleryMainImage) {
      v2GalleryMainImage.src = current.src;
      v2GalleryMainImage.alt = current.alt;
    }
    const thumbsRow = document.getElementById('v2-gallery-thumbs');
    v2GalleryThumbs.forEach((btn, i) => {
      const active = i === v2GalleryIndex;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-current', active ? 'true' : 'false');
      if (active && thumbsRow) {
        thumbsRow.scrollTo({
          left: btn.offsetLeft - (thumbsRow.clientWidth - btn.offsetWidth) / 2,
          behavior: 'smooth',
        });
      }
    });
  }

  function openV2Gallery(index) {
    if (!v2GalleryModal || !v2GallerySources.length) return;
    renderV2Gallery(index);
    v2GalleryModal.classList.add('is-open');
    v2GalleryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('v2-gallery-modal-open');
  }

  function closeV2Gallery() {
    if (!v2GalleryModal) return;
    v2GalleryModal.classList.remove('is-open');
    v2GalleryModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('v2-gallery-modal-open');
  }

  function moveV2Gallery(step) {
    renderV2Gallery(v2GalleryIndex + step);
  }

  v2GalleryThumbs.forEach((btn, i) => {
    btn.addEventListener('click', () => renderV2Gallery(i));
  });
  if (v2GalleryMain) {
    v2GalleryMain.addEventListener('click', () => openV2Gallery(v2GalleryIndex));
  }

  if (v2GalleryClose) {
    v2GalleryClose.addEventListener('click', closeV2Gallery);
  }
  if (v2GalleryPrev) {
    v2GalleryPrev.addEventListener('click', () => moveV2Gallery(-1));
  }
  if (v2GalleryNext) {
    v2GalleryNext.addEventListener('click', () => moveV2Gallery(1));
  }
  if (v2GalleryModal) {
    v2GalleryModal.addEventListener('click', (event) => {
      if (event.target === v2GalleryModal) closeV2Gallery();
    });
    v2GalleryModal.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches && event.changedTouches[0];
      v2TouchStartX = touch ? touch.clientX : null;
    }, { passive: true });
    v2GalleryModal.addEventListener('touchend', (event) => {
      const touch = event.changedTouches && event.changedTouches[0];
      if (v2TouchStartX == null || !touch) return;
      const deltaX = touch.clientX - v2TouchStartX;
      if (Math.abs(deltaX) > 40) moveV2Gallery(deltaX > 0 ? -1 : 1);
      v2TouchStartX = null;
    }, { passive: true });
  }

  document.addEventListener('keydown', (event) => {
    if (!v2GalleryModal || !v2GalleryModal.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeV2Gallery();
    if (event.key === 'ArrowLeft') moveV2Gallery(-1);
    if (event.key === 'ArrowRight') moveV2Gallery(1);
  });

  /* Calendar (Version 1) */
  const calendarGrid = document.getElementById('calendar-grid');
  if (calendarGrid) {
    const nov2026 = [
      1, 2, 3, 4, 5, 6, 7,
      8, 9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28,
      29, 30, '', '', '', '', '',
    ];
    nov2026.forEach((day) => {
      const span = document.createElement('span');
      if (day === '') {
        span.className = 'empty';
        span.textContent = '0';
      } else {
        span.textContent = String(day);
        if (day === 14) span.className = 'today';
      }
      calendarGrid.appendChild(span);
    });
  }

  /* Skip envelope setup when Version 2 is active */
  if (activeVersion !== '1') return;

  /* ============================================================
     Version 1 — Envelope sequence
     ============================================================ */
  const sequence = document.getElementById('envelope-sequence');
  const stage = document.getElementById('envelope-stage');
  const stageInner = stage && stage.querySelector('.stage-inner');
  const envelope = document.getElementById('envelope');
  const flap = document.getElementById('flap');
  const seal = document.getElementById('wax-seal');
  const copy = document.getElementById('envelope-copy');
  const letter = document.getElementById('letter');
  const letterWindow = document.getElementById('letter-window');
  const openHint = document.getElementById('open-hint');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const siteHeader = document.getElementById('site-header');

  if (!sequence || !stage || !envelope || !flap || !letter || !letterWindow) return;

  let handoffDone = false;
  let letterEscaped = false;

  function letterHiddenY() {
    const winH = letterWindow.offsetHeight || 1;
    return winH * 1.05;
  }

  function escapeLetterToStage() {
    if (letterEscaped || !stageInner) return;
    letterEscaped = true;
    const rect = letterWindow.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    stageInner.appendChild(letterWindow);
    gsap.set(letterWindow, {
      position: 'absolute',
      left: rect.left - stageRect.left,
      top: rect.top - stageRect.top,
      width: rect.width,
      height: rect.height,
      x: 0,
      xPercent: 0,
      zIndex: 80,
      borderRadius: 0,
      overflow: 'hidden',
    });
  }

  gsap.set(flap, { rotateX: 0, transformOrigin: '50% 0%' });
  gsap.set(seal, { opacity: 1, y: 0, scale: 1, rotation: 0 });
  gsap.set(copy, { opacity: 1 });
  gsap.set(openHint, { opacity: 1 });
  gsap.set(scrollIndicator, { opacity: 1 });
  gsap.set(envelope, { y: 0, opacity: 1 });
  gsap.set(letter, { y: letterHiddenY(), scale: 1 });

  const tl = gsap.timeline({ paused: true });

  tl.to(seal, {
    y: -8,
    scale: 1.08,
    rotation: 6,
    duration: 0.15,
    ease: 'power1.out',
  }, 0.20);

  tl.to(seal, {
    opacity: 0,
    y: -16,
    scale: 0.9,
    duration: 0.08,
    ease: 'power1.in',
  }, 0.35);

  tl.to(flap, {
    rotateX: -168,
    duration: 0.20,
    ease: 'power2.inOut',
  }, 0.35);

  tl.to(copy, { opacity: 0, duration: 0.10 }, 0.35);
  tl.to(openHint, { opacity: 0, duration: 0.08 }, 0.38);

  tl.to(letter, {
    y: () => letterHiddenY() * 0.72,
    duration: 0.05,
    ease: 'power1.out',
  }, 0.55);

  tl.to(letter, {
    y: () => letterHiddenY() * 0.08,
    duration: 0.22,
    ease: 'power2.out',
  }, 0.60);

  tl.to(letter, {
    y: () => -letterHiddenY() * 0.02,
    scale: 1.1,
    duration: 0.13,
    ease: 'power1.inOut',
  }, 0.82);

  tl.to(envelope, {
    y: () => window.innerHeight * 0.22,
    duration: 0.13,
    ease: 'power2.in',
  }, 0.82);

  tl.to(scrollIndicator, { opacity: 0, duration: 0.06 }, 0.82);

  tl.to(letterWindow, {
    width: '70%',
    height: '75%',
    top: '10%',
    duration: 0.13,
    ease: 'power1.inOut',
  }, 0.82);

  tl.to(envelope, {
    y: () => window.innerHeight * 0.6,
    opacity: 0,
    duration: 0.05,
    ease: 'power2.in',
  }, 0.95);

  tl.to(letterWindow, {
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    duration: 0.05,
    ease: 'power2.inOut',
  }, 0.95);

  tl.to(letter, {
    y: 0,
    scale: 1,
    duration: 0.05,
    ease: 'power2.out',
  }, 0.95);

  tl.to(stage, {
    backgroundColor: '#f5f1e9',
    duration: 0.05,
  }, 0.95);

  function doHandoff() {
    if (handoffDone) return;
    handoffDone = true;

    document.body.classList.add('is-handoff');

    const st = ScrollTrigger.getById('envelope-pin');
    if (st) st.kill(true);

    gsap.set([letterWindow, letter, flap, seal, copy, envelope], { clearProps: 'all' });

    const hero = document.getElementById('save-the-date');
    if (hero) {
      const top = hero.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top));
    }

    ScrollTrigger.refresh();
  }

  ScrollTrigger.create({
    id: 'envelope-pin',
    trigger: sequence,
    start: 'top top',
    end: '+=320%',
    scrub: 0.55,
    pin: stage,
    pinSpacing: true,
    anticipatePin: 1,
    animation: tl,
    onLeave: doHandoff,
    onUpdate: (self) => {
      if (self.progress >= 0.945) escapeLetterToStage();
      if (self.progress > 0.94) {
        stage.style.backgroundColor = '#f5f1e9';
      } else if (!handoffDone) {
        stage.style.backgroundColor = '';
      }
    },
  });

  ScrollTrigger.create({
    trigger: '#message',
    start: 'top 70%',
    onEnter: () => {
      if (!handoffDone || !siteHeader) return;
      siteHeader.classList.add('is-visible');
      siteHeader.setAttribute('aria-hidden', 'false');
    },
    onLeaveBack: () => {
      if (!siteHeader) return;
      siteHeader.classList.remove('is-visible');
      siteHeader.setAttribute('aria-hidden', 'true');
    },
  });

  window.addEventListener('resize', () => {
    if (handoffDone) return;
    gsap.set(letter, { y: letterHiddenY() });
    ScrollTrigger.refresh();
  });
})();
