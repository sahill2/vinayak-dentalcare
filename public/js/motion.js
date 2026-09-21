/**
 * Vinayak Dental Care — Lightweight Vanilla Motion Engine (<6KB)
 * Implements: BlurText, ScrollReveal, SpotlightCard, Magnet, CountUp, AmbientDrift
 */

(function () {
  'use strict';

  // Mark HTML with 'js' class for progressive enhancement
  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Header Scroll Shadow
  const initHeaderScroll = () => {
    const header = document.querySelector('header');
    if (!header) return;
    const handleScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  };

  // 2. BlurText for Hero Headline
  const initBlurText = () => {
    if (prefersReducedMotion) return;
    const heroTitle = document.querySelector('.hero-title[data-blur-text]');
    if (!heroTitle) return;

    const originalText = heroTitle.textContent.trim();
    heroTitle.setAttribute('aria-label', originalText);

    // Parse HTML child elements like <em> while wrapping words
    const nodes = Array.from(heroTitle.childNodes);
    heroTitle.innerHTML = '';

    let wordIndex = 0;
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/\s+/).filter(Boolean);
        words.forEach(word => {
          const span = document.createElement('span');
          span.className = 'blur-word';
          span.setAttribute('aria-hidden', 'true');
          span.style.setProperty('--delay', `${wordIndex * 60}ms`);
          span.textContent = word + ' ';
          heroTitle.appendChild(span);
          wordIndex++;
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        const wrapper = document.createElement(tag);
        if (node.className) wrapper.className = node.className;
        const words = node.textContent.split(/\s+/).filter(Boolean);
        words.forEach(word => {
          const span = document.createElement('span');
          span.className = 'blur-word';
          span.setAttribute('aria-hidden', 'true');
          span.style.setProperty('--delay', `${wordIndex * 60}ms`);
          span.textContent = word + ' ';
          wrapper.appendChild(span);
          wordIndex++;
        });
        heroTitle.appendChild(wrapper);
      }
    });

    // Trigger reveal
    requestAnimationFrame(() => {
      heroTitle.classList.add('blur-text-active');
    });
  };

  // 3. ScrollReveal with IntersectionObserver
  let revealObserver = null;

  const observeAnimations = (root = document) => {
    if (prefersReducedMotion) {
      root.querySelectorAll('.reveal, .animate-on-scroll').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
      });
    }

    const elements = root.querySelectorAll('.reveal, .animate-on-scroll:not(.is-revealed)');
    elements.forEach((el, index) => {
      if (!el.style.getPropertyValue('--i')) {
        el.style.setProperty('--i', String(index % 8));
      }
      revealObserver.observe(el);
    });
  };

  // Expose global observer for dynamically hydrated content
  window.observeAnimations = observeAnimations;

  // 4. Spotlight Card Radial Hover Glow
  const initSpotlightCards = () => {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let ticking = false;

    const handlePointerMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!ticking) {
        requestAnimationFrame(() => {
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
          ticking = false;
        });
        ticking = true;
      }
    };

    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('pointermove', handlePointerMove);
    });
  };

  // 5. Magnetic CTA Button (Max 6px displacement)
  const initMagneticButton = () => {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    magneticBtns.forEach(btn => {
      let isMoving = false;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;

        // Cap at 6px
        const maxDist = 6;
        const clampedX = Math.max(-maxDist, Math.min(maxDist, deltaX));
        const clampedY = Math.max(-maxDist, Math.min(maxDist, deltaY));

        if (!isMoving) {
          requestAnimationFrame(() => {
            btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
            isMoving = false;
          });
          isMoving = true;
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  };

  // 6. Ambient Hero Background Tab Pause
  const initAmbientDrift = () => {
    const ambientBg = document.querySelector('.ambient-hero-bg');
    if (!ambientBg) return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        ambientBg.style.animationPlayState = 'paused';
      } else if (!prefersReducedMotion) {
        ambientBg.style.animationPlayState = 'running';
      }
    });
  };

  // 7. Live Clinic Open / Closed Status Chip
  const initClinicStatusChip = () => {
    const chip = document.getElementById('clinicStatusChip');
    if (!chip || !window.CLINIC_CONFIG?.openingHours?.schedule) return;

    try {
      // Get current date & time in Asia/Kolkata
      const kolkataTimeStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const now = new Date(kolkataTimeStr);
      const day = now.getDay(); // 0 = Sun, 1 = Mon ...
      const hour = now.getHours();
      const min = now.getMinutes();
      const currentDecTime = hour + min / 60;

      const todaySchedule = window.CLINIC_CONFIG.openingHours.schedule[day];

      if (todaySchedule && currentDecTime >= todaySchedule.open && currentDecTime < todaySchedule.close) {
        const closeTime = todaySchedule.close > 12 ? `${todaySchedule.close - 12} PM` : `${todaySchedule.close} AM`;
        chip.innerHTML = `<span class="status-dot open"></span> <span data-i18n="status_open">Open now</span> · <span data-i18n="status_until">until</span> ${closeTime}`;
        chip.classList.add('status-open');
        chip.style.display = 'inline-flex';
      } else {
        // Closed
        chip.innerHTML = `<span class="status-dot closed"></span> <span data-i18n="status_closed">Closed</span> · <span data-i18n="status_opens_mon">opens Mon 9:00 AM</span>`;
        chip.classList.add('status-closed');
        chip.style.display = 'inline-flex';
      }
    } catch (e) {
      chip.style.display = 'none';
    }
  };

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initBlurText();
    observeAnimations();
    initSpotlightCards();
    initMagneticButton();
    initAmbientDrift();
    initClinicStatusChip();
  });
})();
