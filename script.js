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
  let activeVersion = storedVersion || (versionSelect && versionSelect.value) || '3';

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

    if (value === '2' || value === '3') {
      document.body.classList.remove('is-handoff');
      ScrollTrigger.getAll().forEach((st) => st.disable(false));
      window.scrollTo(0, 0);
      return;
    }

    /* Returning to Version 1 — hard reset keeps envelope pin healthy */
    if ((previous === '2' || previous === '3') && value === '1') {
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

  function initScrollInvitation(prefix, versionKey) {
    const root = document.getElementById('version-' + versionKey);
    const id = (name) => document.getElementById(prefix + '-' + name);
    if (!root) return;

    const copyLinkBtn = id('copy-link-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied!'));
      });
    }

    bindMobileNav(id('menu-btn'), id('nav'), root.querySelector('.v2-nav-close'));

    const accountTabs = Array.from(root.querySelectorAll('[data-account-tab]'));
    const accountPanels = Array.from(root.querySelectorAll('[data-account-panel]'));
    function setAccountSide(side) {
      accountTabs.forEach((tab) => {
        const active = tab.dataset.accountTab === side;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      accountPanels.forEach((panel) => {
        const active = panel.dataset.accountPanel === side;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    }
    accountTabs.forEach((tab) => {
      tab.addEventListener('click', () => setAccountSide(tab.dataset.accountTab));
    });

    const header = id('header');
    const envelope = id('envelope');
    const join = id('join');
    const save = id('save');
    let heroRevealed = false;

    function prepareHeroWords() {
      if (join) {
        join.querySelectorAll('.v2-name, .v2-amp').forEach((el) => {
          if (el.dataset.wordsWrapped === '1') return;
          const text = el.textContent;
          el.textContent = '';
          const span = document.createElement('span');
          span.className = 'v2-word';
          span.textContent = text;
          el.appendChild(span);
          el.dataset.wordsWrapped = '1';
        });
        wrapWords(join.querySelector('.v2-datetime'));
      }
      if (save) {
        wrapWords(save.querySelector('.v2-eyebrow'));
        wrapWords(save.querySelector('.v2-datetime'));
        wrapWords(save.querySelector('.v2-venue-lead'));
        wrapWords(save.querySelector('.v2-venue'));
      }
    }

    function revealJoinSequence() {
      if (!join || heroRevealed) return;
      heroRevealed = true;
      prepareHeroWords();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        join.classList.add('is-letter-in', 'is-copy-in');
        join.querySelectorAll('.v2-word').forEach((word) => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        });
        return;
      }

      requestAnimationFrame(() => {
        join.classList.add('is-letter-in');
      });

      window.setTimeout(() => {
        join.classList.add('is-copy-in');
        const joinWords = join.querySelectorAll('.v2-word');
        joinWords.forEach((word, i) => {
          word.style.transition = `opacity 1.15s cubic-bezier(0.22, 1, 0.36, 1) ${0.12 + i * 0.12}s, transform 1.15s cubic-bezier(0.22, 1, 0.36, 1) ${0.12 + i * 0.12}s`;
          requestAnimationFrame(() => {
            word.style.opacity = '1';
            word.style.transform = 'translateY(0)';
          });
        });
      }, 900);
    }

    function revealSaveWords() {
      if (!save || save.dataset.revealed === '1') return;
      save.dataset.revealed = '1';
      prepareHeroWords();
      const words = save.querySelectorAll('.v2-word');
      words.forEach((word, i) => {
        word.style.transition = `opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.14}s, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.14}s`;
        requestAnimationFrame(() => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        });
      });
    }

    function scrollToY(top, duration) {
      const startY = window.scrollY;
      const delta = top - startY;
      if (Math.abs(delta) < 2) return;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, startY + delta * ease);
        if (t < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    function openInvitation() {
      const target = root.querySelector('.v2-main > .v2-section') || join || save;
      if (!target) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        target.scrollIntoView({ behavior: 'auto' });
        if (target === join) revealJoinSequence();
        return;
      }

      const top = target.getBoundingClientRect().top + window.scrollY;
      scrollToY(top, 2200);

      if (target !== join) return;

      let started = false;
      const tryStart = () => {
        if (started || !join) return;
        const rect = join.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.72) {
          started = true;
          window.removeEventListener('scroll', tryStart);
          revealJoinSequence();
        }
      };
      window.addEventListener('scroll', tryStart, { passive: true });
      window.setTimeout(() => {
        window.removeEventListener('scroll', tryStart);
        revealJoinSequence();
      }, 2300);
    }

    if (envelope) {
      prepareHeroWords();
      envelope.setAttribute('role', 'button');
      envelope.setAttribute('tabindex', '0');
      envelope.setAttribute('aria-label', 'Open the invitation');

      envelope.addEventListener('click', openInvitation);
      envelope.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openInvitation();
        }
      });

      if (join) {
        const joinObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.22) {
                revealJoinSequence();
              }
            });
          },
          { threshold: [0.22, 0.35] }
        );
        joinObserver.observe(join);
      }

      if (save) {
        const saveObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
                revealSaveWords();
              }
            });
          },
          { threshold: [0.35] }
        );
        saveObserver.observe(save);
      }
    }

    if (header && envelope) {
      const syncHeader = () => {
        if (document.body.dataset.activeVersion !== String(versionKey)) return;
        const past = envelope.getBoundingClientRect().bottom < 80;
        header.classList.toggle('is-visible', past);
      };
      window.addEventListener('scroll', syncHeader, { passive: true });
      syncHeader();
    } else if (header && versionKey === '3') {
      header.classList.add('is-visible');
      header.setAttribute('aria-hidden', 'false');
    }

    if (versionKey === '3') {
      const letterScene = document.getElementById('v3-invitation');
      const letterInner = letterScene && letterScene.querySelector('.v3-letter-inner');
      const letterSticky = letterScene && letterScene.querySelector('.v3-letter-sticky');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      const couplePair = document.querySelector('#v3-family .v3-couple-pair');
      const parentsEl = document.querySelector('#v3-family .v3-celebrate-parents');
      const parentsClip = document.querySelector('#v3-family .v3-parents-clip');

      function coupleHasSlidIn() {
        return !!(couplePair && couplePair.classList.contains('is-in'));
      }

      function syncParentsReveal() {
        if (!parentsEl || !parentsClip || document.body.dataset.activeVersion !== '3') return;
        if (reduceMotion.matches) {
          parentsEl.style.transform = 'none';
          parentsEl.style.opacity = '1';
          return;
        }
        if (!coupleHasSlidIn()) {
          parentsEl.style.transform = 'translateY(-60%)';
          parentsEl.style.opacity = '0';
          return;
        }
        const clipRect = parentsClip.getBoundingClientRect();
        const start = window.innerHeight * 1.02;
        const end = window.innerHeight * 0.74;
        let progress = (start - clipRect.top) / Math.max(1, start - end);
        progress = Math.min(1, Math.max(0, progress));
        const ease = 1 - Math.pow(1 - progress, 3);
        parentsEl.style.transform = 'translateY(-' + ((1 - ease) * 60).toFixed(2) + '%)';
        parentsEl.style.opacity = ease.toFixed(3);
      }

      function syncLetterReveal() {
        if (!letterScene || document.body.dataset.activeVersion !== '3') return;
        if (reduceMotion.matches) {
          letterScene.style.setProperty('--reveal', '1');
          if (letterInner) letterInner.style.transform = '';
          return;
        }
        const max = Math.max(1, letterScene.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -letterScene.getBoundingClientRect().top / max));
        const reveal = progress * progress * (3 - 2 * progress);
        letterScene.style.setProperty('--reveal', reveal.toFixed(4));
        if (letterInner && letterSticky) {
          const extra = Math.max(0, letterInner.scrollHeight - letterSticky.clientHeight + 48);
          letterInner.style.transform = 'translateY(' + (-extra * reveal) + 'px)';
        }
      }

      function syncV3Scroll() {
        syncLetterReveal();
        syncParentsReveal();
      }

      window.addEventListener('scroll', syncV3Scroll, { passive: true });
      window.addEventListener('resize', syncV3Scroll);
      syncV3Scroll();

      if (couplePair) {
        if (reduceMotion.matches) {
          couplePair.classList.add('is-in');
          syncParentsReveal();
        } else {
          const coupleObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== '3') return;
              coupleObserver.disconnect();
              window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                  couplePair.classList.add('is-in');
                  syncParentsReveal();
                });
              });
            });
          }, { threshold: 0.28, rootMargin: '0px 0px -6% 0px' });
          coupleObserver.observe(couplePair);
        }
      }

      const timelineSection = document.getElementById('v3-timeline');
      if (timelineSection) {
        if (reduceMotion.matches) {
          timelineSection.classList.add('is-in');
        } else {
          const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== '3') return;
              timelineSection.classList.add('is-in');
              timelineObserver.disconnect();
            });
          }, { threshold: 0.22, rootMargin: '0px 0px -10% 0px' });
          timelineObserver.observe(timelineSection);
        }
      }

      const dateSection = document.getElementById('v3-date');
      if (dateSection) {
        if (reduceMotion.matches) {
          dateSection.classList.add('is-in');
        } else {
          const dateObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== '3') return;
              dateSection.classList.add('is-in');
              dateObserver.disconnect();
            });
          }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
          dateObserver.observe(dateSection);
        }
      }
    }

    if (join && save && (join.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      join.addEventListener('click', () => {
        save.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const rsvpModal = id('rsvp-modal');
    const rsvpOpenButtons = root.querySelectorAll('.js-rsvp-open');
    const rsvpClose = id('rsvp-close');
    const rsvpForm = id('rsvp-form');

    function openRsvp() {
      if (!rsvpModal) return;
      rsvpModal.classList.add('is-open');
      rsvpModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('v2-rsvp-modal-open');
      const firstField = rsvpModal.querySelector('input[name="name"]');
      if (firstField) firstField.focus();
    }

    function closeRsvp() {
      if (!rsvpModal) return;
      rsvpModal.classList.remove('is-open');
      rsvpModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('v2-rsvp-modal-open');
    }

    rsvpOpenButtons.forEach((btn) => btn.addEventListener('click', openRsvp));
    if (rsvpClose) rsvpClose.addEventListener('click', closeRsvp);
    if (rsvpModal) {
      rsvpModal.addEventListener('click', (event) => {
        if (event.target === rsvpModal) closeRsvp();
      });
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && rsvpModal && rsvpModal.classList.contains('is-open')) {
        closeRsvp();
      }
    });
    if (rsvpForm) {
      const guestInput = rsvpForm.querySelector('input[name="guests"]');
      const guestDisplay = rsvpForm.querySelector('[data-guest-count]');
      const rsvpSubmit = rsvpForm.querySelector('[type="submit"]');
      const isV3Form = rsvpForm.classList.contains('v3-rsvp-form');

      function guestCount() {
        return Number(guestInput && guestInput.value ? guestInput.value : 0);
      }

      function setGuestCount(next) {
        const value = Math.max(0, Math.min(20, next));
        if (guestInput) guestInput.value = String(value);
        if (guestDisplay) guestDisplay.textContent = String(value);
      }

      rsvpForm.querySelectorAll('[data-guest-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
          setGuestCount(guestCount() + Number(btn.dataset.guestStep));
        });
      });

      function updateRsvpSubmit() {
        if (!isV3Form || !rsvpSubmit) return;
        const data = new FormData(rsvpForm);
        const attending = data.get('attendance') !== '불가';
        rsvpSubmit.disabled = !(
          data.get('name') &&
          data.get('side') &&
          data.get('attendance') &&
          data.get('phone') &&
          (!attending || data.get('meal')) &&
          data.get('consent') === 'yes'
        );
      }

      function syncMealVisibility() {
        if (!isV3Form) return;
        const mealField = rsvpForm.querySelector('input[name="meal"]')?.closest('fieldset');
        if (!mealField) return;
        const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');
        const hide = Boolean(attendance && attendance.value === '불가');
        mealField.hidden = hide;
        rsvpForm.querySelectorAll('input[name="meal"]').forEach((input) => {
          input.required = !hide;
          if (hide) input.checked = false;
        });
      }

      if (isV3Form) {
        rsvpForm.addEventListener('input', updateRsvpSubmit);
        rsvpForm.addEventListener('change', () => {
          syncMealVisibility();
          updateRsvpSubmit();
        });
        syncMealVisibility();
        updateRsvpSubmit();
      }

      rsvpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(rsvpForm).entries());
        const replies = JSON.parse(localStorage.getItem('wedding-rsvp') || '[]');
        replies.push({ ...data, submittedAt: new Date().toISOString(), version: versionKey });
        localStorage.setItem('wedding-rsvp', JSON.stringify(replies));
        rsvpForm.reset();
        if (isV3Form) {
          setGuestCount(0);
          syncMealVisibility();
          updateRsvpSubmit();
        }
        closeRsvp();
        showToast('참석 여부가 전달되었습니다.');
      });
    }

    const shuttleModal = id('shuttle-modal');
    const shuttleOpen = id('shuttle-open');
    const shuttleClose = id('shuttle-close');
    const shuttleTabs = Array.from(root.querySelectorAll('.v2-shuttle-tab'));
    const shuttleHansung = id('shuttle-hansung');
    const shuttleAnguk = id('shuttle-anguk');

    function openShuttle() {
      if (!shuttleModal) return;
      shuttleModal.classList.add('is-open');
      shuttleModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('v2-shuttle-modal-open');
    }

    function closeShuttle() {
      if (!shuttleModal) return;
      shuttleModal.classList.remove('is-open');
      shuttleModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('v2-shuttle-modal-open');
    }

    function setShuttleTab(name) {
      shuttleTabs.forEach((tab) => {
        const active = tab.dataset.shuttleTab === name;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      if (shuttleHansung) {
        shuttleHansung.classList.toggle('is-active', name === 'hansung');
        shuttleHansung.hidden = name !== 'hansung';
      }
      if (shuttleAnguk) {
        shuttleAnguk.classList.toggle('is-active', name === 'anguk');
        shuttleAnguk.hidden = name !== 'anguk';
      }
    }

    if (shuttleOpen) shuttleOpen.addEventListener('click', openShuttle);
    if (shuttleClose) shuttleClose.addEventListener('click', closeShuttle);
    if (shuttleModal) {
      shuttleModal.addEventListener('click', (event) => {
        if (event.target === shuttleModal) closeShuttle();
      });
    }
    shuttleTabs.forEach((tab) => {
      tab.addEventListener('click', () => setShuttleTab(tab.dataset.shuttleTab));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && shuttleModal && shuttleModal.classList.contains('is-open')) {
        closeShuttle();
      }
    });

    const mapModal = id('map-modal');
    const mapOpen = id('map-open');
    const mapClose = id('map-close');
    const yakdoOpen = id('yakdo-open');
    const mapModalImage = mapModal ? mapModal.querySelector('.v2-map-modal-image') : null;
    const defaultMapSrc = mapModalImage ? mapModalImage.getAttribute('src') : '';
    const defaultMapAlt = mapModalImage ? mapModalImage.getAttribute('alt') : '';

    function openMap(src, alt) {
      if (!mapModal) return;
      if (mapModalImage && src) {
        mapModalImage.src = src;
        mapModalImage.alt = alt || defaultMapAlt || '';
      }
      mapModal.classList.add('is-open');
      mapModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('v2-map-modal-open');
    }

    function closeMap() {
      if (!mapModal) return;
      mapModal.classList.remove('is-open');
      mapModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('v2-map-modal-open');
    }

    if (mapOpen) {
      mapOpen.addEventListener('click', () => openMap(defaultMapSrc, defaultMapAlt));
    }
    if (yakdoOpen) {
      yakdoOpen.addEventListener('click', () => {
        openMap('assets/v2-samcheonggak-yakdo.png', '삼청각 약도');
      });
    }
    if (mapClose) mapClose.addEventListener('click', closeMap);
    if (mapModal) {
      mapModal.addEventListener('click', (event) => {
        if (event.target === mapModal) closeMap();
      });
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mapModal && mapModal.classList.contains('is-open')) {
        closeMap();
      }
    });

    const galleryModal = id('gallery-modal');
    const galleryModalImage = id('gallery-modal-image');
    const galleryClose = id('gallery-close');
    const galleryPrev = id('gallery-prev');
    const galleryNext = id('gallery-next');
    const galleryMain = id('gallery-main');
    const galleryMainImage = id('gallery-main-image');
    const galleryThumbs = Array.from(root.querySelectorAll('.v2-gallery-thumb'));
    const gallerySources = galleryThumbs.map((btn) => {
      const img = btn.querySelector('img');
      return img
        ? { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || 'Gallery image' }
        : { src: '', alt: 'Gallery image' };
    }).filter((item) => item.src);
    let galleryIndex = 0;
    let touchStartX = null;

    function renderGallery(index) {
      if (!gallerySources.length) return;
      const count = gallerySources.length;
      galleryIndex = (index + count) % count;
      const current = gallerySources[galleryIndex];
      if (galleryModalImage) {
        galleryModalImage.src = current.src;
        galleryModalImage.alt = current.alt;
      }
      if (galleryMainImage) {
        galleryMainImage.src = current.src;
        galleryMainImage.alt = current.alt;
      }
      const thumbsRow = id('gallery-thumbs');
      galleryThumbs.forEach((btn, i) => {
        const active = i === galleryIndex;
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

    function openGallery(index) {
      if (!galleryModal || !gallerySources.length) return;
      renderGallery(index);
      galleryModal.classList.add('is-open');
      galleryModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('v2-gallery-modal-open');
    }

    function closeGallery() {
      if (!galleryModal) return;
      galleryModal.classList.remove('is-open');
      galleryModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('v2-gallery-modal-open');
    }

    function moveGallery(step) {
      renderGallery(galleryIndex + step);
    }

    galleryThumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => renderGallery(i));
    });
    if (galleryMain) {
      galleryMain.addEventListener('click', () => openGallery(galleryIndex));
    }

    const galleryMainPrev = id('gallery-main-prev');
    const galleryMainNext = id('gallery-main-next');
    if (galleryMainPrev) {
      galleryMainPrev.addEventListener('click', (event) => {
        event.stopPropagation();
        moveGallery(-1);
      });
    }
    if (galleryMainNext) {
      galleryMainNext.addEventListener('click', (event) => {
        event.stopPropagation();
        moveGallery(1);
      });
    }

    const thumbsRow = id('gallery-thumbs');
    const thumbsPrev = id('gallery-thumbs-prev');
    const thumbsNext = id('gallery-thumbs-next');

    function scrollThumbs(direction) {
      if (!thumbsRow) return;
      const amount = Math.max(thumbsRow.clientWidth * 0.75, 180);
      thumbsRow.scrollBy({ left: direction * amount, behavior: 'smooth' });
    }

    function syncThumbsNav() {
      if (!thumbsRow) return;
      const max = thumbsRow.scrollWidth - thumbsRow.clientWidth - 2;
      if (thumbsPrev) thumbsPrev.disabled = thumbsRow.scrollLeft <= 2;
      if (thumbsNext) thumbsNext.disabled = thumbsRow.scrollLeft >= max;
    }

    if (thumbsPrev) thumbsPrev.addEventListener('click', () => scrollThumbs(-1));
    if (thumbsNext) thumbsNext.addEventListener('click', () => scrollThumbs(1));
    if (thumbsRow) {
      thumbsRow.addEventListener('scroll', syncThumbsNav, { passive: true });
      window.addEventListener('resize', syncThumbsNav);
      syncThumbsNav();

      let dragPointer = null;
      let dragStartX = 0;
      let dragStartScroll = 0;
      let didDrag = false;

      thumbsRow.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch') return;
        dragPointer = event.pointerId;
        dragStartX = event.clientX;
        dragStartScroll = thumbsRow.scrollLeft;
        didDrag = false;
        thumbsRow.classList.add('is-dragging');
        thumbsRow.setPointerCapture(event.pointerId);
      });

      thumbsRow.addEventListener('pointermove', (event) => {
        if (dragPointer == null || event.pointerId !== dragPointer) return;
        const delta = event.clientX - dragStartX;
        if (Math.abs(delta) > 4) didDrag = true;
        thumbsRow.scrollLeft = dragStartScroll - delta;
      });

      function endThumbsDrag(event) {
        if (dragPointer == null || (event && event.pointerId !== dragPointer)) return;
        dragPointer = null;
        thumbsRow.classList.remove('is-dragging');
      }

      thumbsRow.addEventListener('pointerup', endThumbsDrag);
      thumbsRow.addEventListener('pointercancel', endThumbsDrag);
      thumbsRow.addEventListener('click', (event) => {
        if (!didDrag) return;
        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
      }, true);
    }

    if (galleryClose) galleryClose.addEventListener('click', closeGallery);
    if (galleryPrev) galleryPrev.addEventListener('click', () => moveGallery(-1));
    if (galleryNext) galleryNext.addEventListener('click', () => moveGallery(1));
    if (galleryModal) {
      galleryModal.addEventListener('click', (event) => {
        if (event.target === galleryModal) closeGallery();
      });
      galleryModal.addEventListener('touchstart', (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        touchStartX = touch ? touch.clientX : null;
      }, { passive: true });
      galleryModal.addEventListener('touchend', (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        if (touchStartX == null || !touch) return;
        const deltaX = touch.clientX - touchStartX;
        if (Math.abs(deltaX) > 40) moveGallery(deltaX > 0 ? -1 : 1);
        touchStartX = null;
      }, { passive: true });
    }

    document.addEventListener('keydown', (event) => {
      if (!galleryModal || !galleryModal.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft') moveGallery(-1);
      if (event.key === 'ArrowRight') moveGallery(1);
    });
  }

  initScrollInvitation('v2', '2');
  initScrollInvitation('v3', '3');

  const v3DateCalendar = document.getElementById('v3-date-calendar');
  if (v3DateCalendar) {
    const firstWeekday = new Date(2026, 10, 1).getDay();
    const daysInMonth = 30;
    for (let i = 0; i < firstWeekday; i += 1) {
      const empty = document.createElement('span');
      empty.className = 'is-empty';
      empty.textContent = '0';
      v3DateCalendar.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const cell = document.createElement('span');
      cell.textContent = String(day);
      if (day === 14) cell.className = 'is-wedding';
      v3DateCalendar.appendChild(cell);
    }
  }

  const v3Countdown = document.getElementById('v3-date-countdown');
  if (v3Countdown) {
    const wedding = new Date(2026, 10, 14);
    const today = new Date();
    wedding.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const days = Math.round((wedding.getTime() - today.getTime()) / 86400000);
    if (days > 0) v3Countdown.textContent = 'D-' + days + '일 ♡';
    else if (days === 0) v3Countdown.textContent = 'D-DAY ♡';
    else v3Countdown.textContent = 'D+' + Math.abs(days) + '일 ♡';
  }

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
  const bgm = document.getElementById('bgm');
  const bgmToggle = document.getElementById('bgm-toggle');

  function syncBgmButton() {
    if (!bgmToggle || !bgm) return;
    bgmToggle.classList.toggle('is-playing', !bgm.paused);
  }

  if (bgm && bgmToggle) {
    const unlockBgm = () => {
      bgm.play().catch(() => {});
      document.removeEventListener('click', unlockBgm);
      document.removeEventListener('touchstart', unlockBgm);
    };

    bgm.addEventListener('play', syncBgmButton);
    bgm.addEventListener('pause', syncBgmButton);
    syncBgmButton();

    bgm.play().catch(() => {});

    document.addEventListener('click', unlockBgm);
    document.addEventListener('touchstart', unlockBgm, { passive: true });

    bgmToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bgm.paused) {
        bgm.play().catch(() => {});
      } else {
        bgm.pause();
      }
      document.removeEventListener('click', unlockBgm);
      document.removeEventListener('touchstart', unlockBgm);
    });
  }

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
