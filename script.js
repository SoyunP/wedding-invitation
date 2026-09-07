/* ============================================================
   Wedding invitation
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

  const activeVersion = '4';
  document.body.dataset.activeVersion = activeVersion;
  document.querySelectorAll('.version-panel').forEach((panel) => {
    const active = panel.dataset.version === activeVersion;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });

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

  function bindCopyButtons(selector, message) {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy || '').then(() => showToast(message || 'Copied!'));
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
  bindCopyButtons('.v5-account-card', '계좌번호가 복사되었습니다.');
  bindCopyButtons('#v4-account .v3-account-card', '계좌번호가 복사되었습니다.');

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
    } else if (header && (prefix === 'v3' || prefix === 'v4')) {
      header.classList.add('is-visible');
      header.setAttribute('aria-hidden', 'false');
    }

    if (prefix === 'v3' || prefix === 'v4') {
      const letterScene = prefix === 'v3' ? id('invitation') : null;
      const letterInner = letterScene && letterScene.querySelector('.v3-letter-inner');
      const letterSticky = letterScene && letterScene.querySelector('.v3-letter-sticky');
      const envelopeFlaps = letterScene && letterScene.querySelector('.envelope-flaps');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      const family = id('family');
      const couplePair = family && family.querySelector('.v3-couple-pair');
      const parentsEl = family && family.querySelector('.v3-celebrate-parents');
      const parentsClip = family && family.querySelector('.v3-parents-clip');

      function coupleHasSlidIn() {
        return !!(couplePair && couplePair.classList.contains('is-in'));
      }

      function syncParentsReveal() {
        if (!parentsEl || !parentsClip || document.body.dataset.activeVersion !== String(versionKey)) return;
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
        if (!letterScene || document.body.dataset.activeVersion !== String(versionKey)) return;
        if (reduceMotion.matches) {
          letterScene.style.setProperty('--reveal', '1');
          if (letterInner) letterInner.style.transform = '';
          if (envelopeFlaps) envelopeFlaps.style.setProperty('--env-t', '1');
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
        if (envelopeFlaps) {
          let envT = 0;
          if (progress >= 0.55) envT = 1;
          else if (progress > 0.15) {
            const u = (progress - 0.15) / 0.4;
            envT = u * u * (3 - 2 * u);
          }
          envelopeFlaps.style.setProperty('--env-t', envT.toFixed(4));
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
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== String(versionKey)) return;
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

      const timelineSection = id('timeline');
      if (timelineSection) {
        if (reduceMotion.matches) {
          timelineSection.classList.add('is-in');
        } else {
          const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== String(versionKey)) return;
              timelineSection.classList.add('is-in');
              timelineObserver.disconnect();
            });
          }, { threshold: 0.22, rootMargin: '0px 0px -10% 0px' });
          timelineObserver.observe(timelineSection);
        }
      }

      const dateSection = id('date');
      if (dateSection) {
        if (reduceMotion.matches) {
          dateSection.classList.add('is-in');
        } else {
          const dateObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== String(versionKey)) return;
              dateSection.classList.add('is-in');
              dateObserver.disconnect();
            });
          }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
          dateObserver.observe(dateSection);
        }
      }
    }

    if (prefix === 'v5') {
      const reducePolaroidMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const people = Array.from(root.querySelectorAll('.v5-person'));
      function revealPolaroid(person) {
        const polaroid = person.querySelector('.v5-polaroid');
        if (polaroid) polaroid.classList.add('is-in');
      }
      const mailStage = root.querySelector('.v5-mail-stage');
      const photostrip = root.querySelector('.v5-photostrip');
      if (reducePolaroidMotion.matches) {
        people.forEach(revealPolaroid);
        if (photostrip) photostrip.classList.add('is-in');
      } else {
        people.forEach((person) => {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== String(versionKey)) return;
              revealPolaroid(person);
              observer.disconnect();
            });
          }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
          observer.observe(person);
        });
        if (mailStage && photostrip) {
          const mailObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || document.body.dataset.activeVersion !== String(versionKey)) return;
              photostrip.classList.add('is-in');
              mailObserver.disconnect();
            });
          }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
          mailObserver.observe(mailStage);
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
          (!attending || data.get('phone')) &&
          (!attending || data.get('meal')) &&
          data.get('consent') === 'yes'
        );
      }

      function syncAttendingFields() {
        if (!isV3Form) return;
        const attendingFields = rsvpForm.querySelector('.v3-rsvp-attending-only');
        const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');
        const hide = Boolean(attendance && attendance.value === '불가');
        if (attendingFields) attendingFields.hidden = hide;

        const phoneInput = rsvpForm.querySelector('input[name="phone"]');
        if (phoneInput) {
          phoneInput.required = !hide;
          if (hide) phoneInput.value = '';
        }

        rsvpForm.querySelectorAll('input[name="meal"]').forEach((input) => {
          input.required = !hide;
          if (hide) input.checked = false;
        });

        if (hide) setGuestCount(0);

        const declineFields = rsvpForm.querySelector('.v3-rsvp-decline-only');
        if (declineFields) declineFields.hidden = !hide;

        const messageInput = rsvpForm.querySelector('textarea[name="message"]');
        if (messageInput && !hide) messageInput.value = '';
      }

      if (isV3Form) {
        rsvpForm.addEventListener('input', updateRsvpSubmit);
        rsvpForm.addEventListener('change', () => {
          syncAttendingFields();
          updateRsvpSubmit();
        });
        syncAttendingFields();
        updateRsvpSubmit();
      }

      let rsvpSending = false;
      const rsvpSheetUrl = 'https://script.google.com/macros/s/AKfycbw3mVLf00yM7S5GU2ubBdnmT1hBa7h10QvbZvNruW3m3r50_QMVogTvyVXQ_Bsovpjt/exec';

      rsvpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (rsvpSending) return;

        const formData = new FormData(rsvpForm);
        const attendanceRaw = String(formData.get('attendance') || '');
        const attending = attendanceRaw !== '불가';
        const name = String(formData.get('name') || '').trim();
        const side = String(formData.get('side') || '');
        const contact = String(formData.get('phone') || '').trim();
        const meal = String(formData.get('meal') || '');
        const additionalGuests = guestCount();
        const consent = formData.get('consent');

        const valid = Boolean(
          name &&
          side &&
          attendanceRaw &&
          consent === 'yes' &&
          (!attending || contact) &&
          (!attending || meal)
        );
        if (!valid) return;

        const data = Object.fromEntries(formData.entries());

        if (prefix !== 'v5') {
          const replies = JSON.parse(localStorage.getItem('wedding-rsvp') || '[]');
          replies.push({ ...data, submittedAt: new Date().toISOString(), version: versionKey });
          localStorage.setItem('wedding-rsvp', JSON.stringify(replies));
          rsvpForm.reset();
          if (isV3Form) {
            setGuestCount(0);
            syncAttendingFields();
            updateRsvpSubmit();
          }
          closeRsvp();
          showToast('참석 여부가 전달되었습니다.');
          return;
        }

        rsvpSending = true;
        if (rsvpSubmit) rsvpSubmit.disabled = true;

        fetch(rsvpSheetUrl, {
          method: 'POST',
          body: JSON.stringify({
            attendance: attendanceRaw === '불가' ? '참석 불가' : '참석 가능',
            name,
            side,
            contact: attending ? contact : '',
            additionalGuests,
            meal: attending ? meal : '',
          }),
        })
          .then((response) => {
            if (!response.ok) throw new Error('rsvp-failed');
          })
          .then(() => {
            rsvpForm.reset();
            setGuestCount(0);
            syncAttendingFields();
            updateRsvpSubmit();
            closeRsvp();
            showToast('참석 의사가 전달되었습니다.');
          })
          .catch(() => {
            showToast('전송 중 문제가 발생했습니다. 다시 시도해주세요.');
            updateRsvpSubmit();
          })
          .finally(() => {
            rsvpSending = false;
          });
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
    const photostripOpen = id('photostrip-open');
    if (photostripOpen) {
      photostripOpen.addEventListener('click', () => {
        const photo = photostripOpen.querySelector('img');
        openMap(
          photo ? photo.getAttribute('src') : 'assets/v5-photostrip.png',
          (photo && photo.getAttribute('alt')) || '포토스트립'
        );
      });
    }
    root.querySelectorAll('.v5-polaroid-open').forEach((btn) => {
      btn.addEventListener('click', () => {
        const photo = btn.querySelector('.v5-polaroid-photo');
        if (!photo) return;
        openMap(photo.getAttribute('src'), photo.getAttribute('alt') || '사진');
      });
    });
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
    const galleryCount = id('gallery-count');
    const galleryClose = id('gallery-close');
    const galleryPrev = id('gallery-prev');
    const galleryNext = id('gallery-next');
    const galleryMain = id('gallery-main');
    const galleryMainImage = id('gallery-main-image');
    const galleryThumbs = Array.from(root.querySelectorAll('.v2-gallery-thumb'));
    const gallerySlides = Array.from(root.querySelectorAll('.v3-gallery-slide'));
    const galleryItems = gallerySlides.length ? gallerySlides : galleryThumbs;
    const gallerySources = galleryItems.map((btn) => {
    const img = btn.querySelector('img');
    return img
      ? { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || 'Gallery image' }
      : { src: '', alt: 'Gallery image' };
  }).filter((item) => item.src);
    const galleryTrack = id('gallery-track');
    const galleryGrid = id('gallery-grid');
    const galleryGridInner = id('gallery-grid-inner');
    const galleryGridClose = id('gallery-grid-close');
    let galleryIndex = 0;
    let gridBuilt = false;
    let galleryAutoTimer = null;
    let galleryInView = true;
    let galleryUserPause = false;
    let galleryAnimating = false;
    let galleryAnimFrame = null;

    function syncGalleryLock() {
      const gridOpen = galleryGrid && galleryGrid.classList.contains('is-open');
      const lightboxOpen = galleryModal && galleryModal.classList.contains('is-open');
      document.body.classList.toggle('v2-gallery-modal-open', Boolean(gridOpen || lightboxOpen));
    }

    function buildGalleryGrid() {
      if (!galleryGridInner || gridBuilt) return;
      gallerySources.forEach((item, i) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'v3-gallery-grid-cell';
        cell.setAttribute('aria-label', item.alt || ('갤러리 사진 ' + (i + 1)));
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        cell.appendChild(img);
        cell.addEventListener('click', () => openGallery(i));
        galleryGridInner.appendChild(cell);
      });
      gridBuilt = true;
    }

    function openGrid() {
      if (!galleryGrid || !gallerySources.length) return;
      buildGalleryGrid();
      galleryGrid.classList.add('is-open');
      galleryGrid.setAttribute('aria-hidden', 'false');
      syncGalleryLock();
    }

    function closeGrid() {
      if (!galleryGrid) return;
      closeGallery();
      galleryGrid.classList.remove('is-open');
      galleryGrid.setAttribute('aria-hidden', 'true');
      syncGalleryLock();
    }

    function gallerySlideLeft(index) {
      const slide = gallerySlides[index];
      if (!galleryTrack || !slide) return 0;
      return slide.offsetLeft - (galleryTrack.clientWidth - slide.offsetWidth) / 2;
    }

    function stopGalleryScrollAnim() {
      if (galleryAnimFrame) {
        cancelAnimationFrame(galleryAnimFrame);
        galleryAnimFrame = null;
      }
      if (typeof gsap !== 'undefined' && galleryTrack) gsap.killTweensOf(galleryTrack);
      galleryAnimating = false;
      if (galleryTrack) galleryTrack.classList.remove('is-animating');
    }

    function scrollGalleryTrack(index, behavior) {
      if (!galleryTrack || !gallerySlides[index]) return;
      const left = gallerySlideLeft(index);
      const wrapping = Math.abs(index - galleryIndex) > 1 && (index === 0 || galleryIndex === 0);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const instant = behavior === 'auto' || wrapping || reduced;
      stopGalleryScrollAnim();
      galleryTrack.classList.add('is-animating');
      void galleryTrack.offsetWidth;
      if (instant) {
        galleryTrack.scrollLeft = left;
        galleryTrack.classList.remove('is-animating');
        return;
      }
      galleryAnimating = true;
      const start = galleryTrack.scrollLeft;
      const delta = left - start;
      const duration = 850;
      const startTime = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        galleryTrack.scrollLeft = start + delta * eased;
        if (t < 1) {
          galleryAnimFrame = requestAnimationFrame(tick);
          return;
        }
        galleryTrack.scrollLeft = left;
        galleryAnimFrame = null;
        galleryAnimating = false;
        galleryTrack.classList.remove('is-animating');
      }
      galleryAnimFrame = requestAnimationFrame(tick);
    }

    function renderGallery(index, behavior) {
      if (!gallerySources.length) return;
      const count = gallerySources.length;
      const nextIndex = (index + count) % count;
      if (galleryTrack && gallerySlides[nextIndex]) {
        scrollGalleryTrack(nextIndex, behavior);
      }
      galleryIndex = nextIndex;
      const current = gallerySources[galleryIndex];
      if (galleryCount) {
        galleryCount.textContent = (galleryIndex + 1) + ' / ' + count;
      }
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
      pauseGalleryAuto();
      renderGallery(index, 'auto');
      galleryModal.classList.add('is-open');
      galleryModal.setAttribute('aria-hidden', 'false');
      syncGalleryLock();
    }

    function closeGallery() {
      if (!galleryModal) return;
      galleryModal.classList.remove('is-open');
      galleryModal.setAttribute('aria-hidden', 'true');
      syncGalleryLock();
    }

    function moveGallery(step) {
      renderGallery(galleryIndex + step);
    }

    function galleryLightboxOpen() {
      return Boolean(galleryModal && galleryModal.classList.contains('is-open'));
    }

    function stopGalleryAuto() {
      if (galleryAutoTimer) {
        window.clearInterval(galleryAutoTimer);
        galleryAutoTimer = null;
      }
    }

    function startGalleryAuto() {
      stopGalleryAuto();
      if ((prefix !== 'v3' && prefix !== 'v4' && prefix !== 'v5') || !galleryTrack || gallerySources.length < 2) return;
      galleryAutoTimer = window.setInterval(() => {
        if (!galleryInView || galleryUserPause || galleryAnimating || document.hidden || galleryLightboxOpen()) return;
        renderGallery(galleryIndex + 1);
      }, 2500);
    }

    function pauseGalleryAuto() {
      galleryUserPause = true;
      stopGalleryScrollAnim();
      window.clearTimeout(pauseGalleryAuto.resumeTimer);
      pauseGalleryAuto.resumeTimer = window.setTimeout(() => {
        galleryUserPause = false;
      }, 5000);
    }

    galleryThumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        renderGallery(i);
        if (!galleryMain && !galleryTrack) openGallery(i);
      });
    });
    if (galleryMain) {
      galleryMain.addEventListener('click', () => {
        openGallery(galleryIndex);
      });
    }
    if (galleryGridClose) galleryGridClose.addEventListener('click', closeGrid);

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

    if (galleryTrack) {
      let dragPointer = null;
      let dragStartX = 0;
      let dragStartScroll = 0;
      let pressX = 0;
      let pressY = 0;
      let pressSlide = null;
      let didDrag = false;
      let openedOnPointerUp = false;

      function nearestSlideIndex() {
        const center = galleryTrack.scrollLeft + galleryTrack.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        gallerySlides.forEach((slide, i) => {
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const dist = Math.abs(slideCenter - center);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        return best;
      }

      function slideFromEvent(event) {
        const node = event.target && event.target.closest
          ? event.target.closest('.v3-gallery-slide')
          : null;
        return node && galleryTrack.contains(node) ? node : null;
      }

      function openSlide(slide) {
        const i = gallerySlides.indexOf(slide);
        if (i < 0) return;
        openGallery(i);
      }

      galleryTrack.addEventListener('scroll', () => {
        galleryIndex = nearestSlideIndex();
      }, { passive: true });

      galleryTrack.addEventListener('pointerdown', (event) => {
        pressSlide = slideFromEvent(event);
        pressX = event.clientX;
        pressY = event.clientY;
        dragStartX = event.clientX;
        dragStartScroll = galleryTrack.scrollLeft;
        didDrag = false;
        openedOnPointerUp = false;
        pauseGalleryAuto();
        if (event.pointerType === 'touch') {
          dragPointer = null;
          return;
        }
        dragPointer = event.pointerId;
      });

      galleryTrack.addEventListener('pointermove', (event) => {
        if (dragPointer == null || event.pointerId !== dragPointer) return;
        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - pressY;
        if (!didDrag && Math.hypot(deltaX, deltaY) > 8) {
          didDrag = true;
          galleryTrack.classList.add('is-dragging');
          if (galleryTrack.setPointerCapture) galleryTrack.setPointerCapture(event.pointerId);
        }
        if (!didDrag) return;
        galleryTrack.scrollLeft = dragStartScroll - deltaX;
      });

      function endTrackPointer(event) {
        const slide = pressSlide;
        const startScroll = dragStartScroll;
        if (event.pointerType === 'touch') {
          pressSlide = null;
          dragPointer = null;
          if (event.type === 'pointercancel') return;
          const scrolled = Math.abs(galleryTrack.scrollLeft - startScroll);
          if (scrolled < 10 && slide) {
            openedOnPointerUp = true;
            openSlide(slide);
          }
          return;
        }
        if (dragPointer == null || (event && event.pointerId !== dragPointer)) return;
        const dragged = didDrag;
        dragPointer = null;
        pressSlide = null;
        galleryTrack.classList.remove('is-dragging');
        if (event.type === 'pointercancel') {
          didDrag = false;
          return;
        }
        if (dragged) {
          galleryIndex = nearestSlideIndex();
          renderGallery(galleryIndex, 'smooth');
          didDrag = false;
          return;
        }
        if (slide) {
          openedOnPointerUp = true;
          openSlide(slide);
        }
      }

      galleryTrack.addEventListener('pointerup', endTrackPointer);
      galleryTrack.addEventListener('pointercancel', endTrackPointer);

      galleryTrack.addEventListener('click', (event) => {
        const slide = slideFromEvent(event);
        if (openedOnPointerUp || didDrag || !slide) {
          if (openedOnPointerUp || didDrag) {
            event.preventDefault();
            event.stopPropagation();
          }
          openedOnPointerUp = false;
          didDrag = false;
          return;
        }
        event.preventDefault();
        openSlide(slide);
      }, true);

      root.querySelectorAll('[data-gallery-tab]').forEach((tab) => {
        tab.addEventListener('click', () => {
          root.querySelectorAll('[data-gallery-tab]').forEach((btn) => {
            const active = btn === tab;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', String(active));
          });
          pauseGalleryAuto();
          renderGallery(0, 'auto');
        });
      });

      const gallerySection = id('gallery');
      if ('IntersectionObserver' in window && gallerySection) {
        const observer = new IntersectionObserver((entries) => {
          galleryInView = entries.some((entry) => entry.isIntersecting);
        }, { threshold: [0, 0.08, 0.2, 0.4] });
        observer.observe(gallerySection);
      }

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) startGalleryAuto();
      });

      startGalleryAuto();
    }

    if (galleryClose) galleryClose.addEventListener('click', closeGallery);
    if (galleryPrev) galleryPrev.addEventListener('click', () => moveGallery(-1));
    if (galleryNext) galleryNext.addEventListener('click', () => moveGallery(1));
    if (galleryModal) {
      galleryModal.addEventListener('dblclick', (event) => {
        event.preventDefault();
      });
      ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
        galleryModal.addEventListener(type, (event) => event.preventDefault());
      });

      let swipeStartX = null;
      let swipeStartY = null;
      let swipeHandled = false;

      function swipeTargetIsChrome(target) {
        return Boolean(target && target.closest && target.closest('.v2-gallery-close, .v2-gallery-nav'));
      }

      function onSwipeStart(x, y, target) {
        if (!galleryLightboxOpen() || swipeTargetIsChrome(target)) {
          swipeStartX = null;
          return;
        }
        swipeStartX = x;
        swipeStartY = y;
        swipeHandled = false;
      }

      function onSwipeEnd(x, y) {
        if (swipeStartX == null) return;
        const dx = x - swipeStartX;
        const dy = y - swipeStartY;
        swipeStartX = null;
        swipeStartY = null;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
        swipeHandled = true;
        moveGallery(dx < 0 ? 1 : -1);
      }

      galleryModal.addEventListener('touchstart', (event) => {
        const touch = event.changedTouches[0];
        if (!touch) return;
        onSwipeStart(touch.clientX, touch.clientY, event.target);
      }, { passive: true });

      galleryModal.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        if (!touch) return;
        onSwipeEnd(touch.clientX, touch.clientY);
      }, { passive: true });

      galleryModal.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch') return;
        onSwipeStart(event.clientX, event.clientY, event.target);
      });

      galleryModal.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'touch') return;
        onSwipeEnd(event.clientX, event.clientY);
      });
    }

    document.addEventListener('keydown', (event) => {
      const lightboxOpen = galleryModal && galleryModal.classList.contains('is-open');
      const gridOpen = galleryGrid && galleryGrid.classList.contains('is-open');
      if (!lightboxOpen && !gridOpen) return;
      if (event.key === 'Escape') {
        if (lightboxOpen) closeGallery();
        else closeGrid();
        return;
      }
      if (!lightboxOpen) return;
      if (event.key === 'ArrowLeft') moveGallery(-1);
      if (event.key === 'ArrowRight') moveGallery(1);
    });
  }

  initScrollInvitation('v5', '4');

  function fillDateCalendar(calendar) {
    if (!calendar) return;
    const firstWeekday = new Date(2026, 10, 1).getDay();
    const daysInMonth = 30;
    for (let i = 0; i < firstWeekday; i += 1) {
      const empty = document.createElement('span');
      empty.className = 'is-empty';
      empty.textContent = '0';
      calendar.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const cell = document.createElement('span');
      cell.textContent = String(day);
      if (day === 14) cell.className = 'is-wedding';
      calendar.appendChild(cell);
    }
  }

  fillDateCalendar(document.getElementById('v3-date-calendar'));
  fillDateCalendar(document.getElementById('v4-date-calendar'));

  function fillCountdown(el) {
    if (!el) return;
    const wedding = new Date(2026, 10, 14);
    const today = new Date();
    wedding.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const days = Math.round((wedding.getTime() - today.getTime()) / 86400000);
    if (days > 0) el.textContent = 'D-' + days + '일 ♡';
    else if (days === 0) el.textContent = 'D-DAY ♡';
    else el.textContent = 'D+' + Math.abs(days) + '일 ♡';
  }

  fillCountdown(document.getElementById('v3-date-countdown'));
  fillCountdown(document.getElementById('v4-date-countdown'));

  const bgm = document.getElementById('bgm');
  const bgmToggle = document.getElementById('bgm-toggle');
  const bgmByVersion = {
    4: 'assets/v5-bgm.mp3',
  };
  const defaultBgm = 'assets/wedding-song.mp3';

  function syncBgmSource(version) {
    if (!bgm) return;
    const next = bgmByVersion[String(version)] || defaultBgm;
    const source = bgm.querySelector('source');
    const current = (source && source.getAttribute('src')) || bgm.getAttribute('src') || '';
    if (current === next) return;
    const wasPlaying = !bgm.paused && bgm.currentTime > 0;
    if (source) source.setAttribute('src', next);
    bgm.src = next;
    bgm.load();
    if (wasPlaying) bgm.play().catch(() => {});
  }

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

    syncBgmSource(activeVersion);
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

})();
