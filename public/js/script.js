/**
 * Vinayak Dental Care — Core Client Script & DOM Hydration Engine
 * Connects CLINIC_CONFIG, i18n, motion, forms, and service cards
 */

(function () {
  'use strict';

  // 1. Safe HTML Escaper Helper
  const esc = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // 2. Hydrate DOM from CLINIC_CONFIG
  const hydrateClinicConfig = () => {
    const cfg = window.CLINIC_CONFIG;
    if (!cfg) return;

    // Replace text elements with [data-config]
    document.querySelectorAll('[data-config]').forEach(el => {
      const key = el.getAttribute('data-config');
      if (cfg[key]) {
        el.textContent = cfg[key];
      }
    });

    // Hydrate tel: links
    if (cfg.clinicPhoneRaw && cfg.clinicPhoneRaw.trim() !== '') {
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = `tel:${cfg.clinicPhoneRaw}`;
      });
      document.querySelectorAll('.call-clinic-link').forEach(el => el.style.display = '');
    } else {
      // Hide phone call buttons/links if owner hasn't supplied number
      document.querySelectorAll('.call-clinic-link, a[href^="tel:"]').forEach(el => {
        if (!el.classList.contains('preserve-visible')) {
          el.style.display = 'none';
        }
      });
    }

    // Hydrate WhatsApp links
    if (cfg.whatsappNumber && cfg.whatsappNumber.trim() !== '' && cfg.whatsappNumber !== '919999900000') {
      const waUrl = `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent('Hello Vinayak Dental Care, I would like to inquire about a dental visit.')}`;
      document.querySelectorAll('.whatsapp-link, .btn-whatsapp, .whatsapp-float').forEach(a => {
        if (a.tagName === 'A') a.href = waUrl;
      });
      document.querySelectorAll('.whatsapp-section, .whatsapp-float, .mobile-bottom-btn.whatsapp').forEach(el => el.style.display = '');
    } else {
      // Hide WhatsApp triggers if unconfigured
      document.querySelectorAll('.whatsapp-link, .whatsapp-float, .mobile-bottom-btn.whatsapp, #confirmWhatsappBtn').forEach(el => {
        el.style.display = 'none';
      });
    }

    // Hydrate Google Map iframe
    const mapIframe = document.querySelector('iframe[data-config-src="mapEmbedUrl"]');
    if (mapIframe) {
      if (cfg.mapEmbedUrl && cfg.mapEmbedUrl.trim() !== '') {
        mapIframe.src = cfg.mapEmbedUrl;
        mapIframe.style.display = 'block';
      } else {
        mapIframe.style.display = 'none';
      }
    }
  };

  // 3. Render Homepage Dynamic Services
  const renderHomeServices = () => {
    const container = document.getElementById('homeServicesGrid');
    if (!container || !window.CLINIC_CONFIG?.services) return;

    const services = window.CLINIC_CONFIG.services.slice(0, 6);
    container.innerHTML = services.map((s, idx) => `
      <div class="spotlight-card reveal" style="--i: ${idx};">
        <div class="card-icon">
          <i class="${esc(s.icon)}"></i>
        </div>
        <h3 class="card-title">${esc(s.name)}</h3>
        <p class="card-desc">${esc(s.shortDesc)}</p>
        <a href="book.html?service=${encodeURIComponent(s.name)}" class="card-action-link">
          <span data-i18n="btn_book_service">Book this treatment</span> <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `).join('');

    if (typeof window.observeAnimations === 'function') {
      window.observeAnimations(container);
    }
  };

  // 4. Render All Services on services.html with Category Filter Chips
  const renderServicesCatalog = () => {
    const container = document.getElementById('servicesListContainer');
    const filterContainer = document.getElementById('servicesFilterContainer');
    if (!container || !window.CLINIC_CONFIG?.services) return;

    const allServices = window.CLINIC_CONFIG.services;

    // Categories
    const categories = ['All', ...new Set(allServices.map(s => s.category || 'General'))];

    if (filterContainer) {
      filterContainer.innerHTML = categories.map((cat, idx) => `
        <button class="chip-symptom ${idx === 0 ? 'active' : ''}" data-category="${esc(cat)}">
          ${esc(cat)}
        </button>
      `).join('');

      filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-category]');
        if (!btn) return;

        filterContainer.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const chosenCat = btn.getAttribute('data-category');
        const filtered = chosenCat === 'All'
          ? allServices
          : allServices.filter(s => (s.category || 'General') === chosenCat);

        renderCards(filtered);
      });
    }

    const renderCards = (list) => {
      container.innerHTML = list.map((s, idx) => `
        <div class="spotlight-card reveal" style="--i: ${idx % 6};">
          <div class="card-icon">
            <i class="${esc(s.icon)}"></i>
          </div>
          <span class="eyebrow" style="font-size: 0.75rem; margin-bottom: 8px;">${esc(s.category || 'Clinical')}</span>
          <h3 class="card-title">${esc(s.name)}</h3>
          <p class="card-desc">${esc(s.fullDesc || s.shortDesc)}</p>
          <a href="book.html?service=${encodeURIComponent(s.name)}" class="btn btn-secondary btn-sm" style="margin-top: auto;">
            <span data-i18n="btn_book_service">Book this treatment</span>
          </a>
        </div>
      `).join('');

      if (typeof window.observeAnimations === 'function') {
        window.observeAnimations(container);
      }
    };

    renderCards(allServices);
  };

  // 5. Render Doctors on Homepage & About
  const renderDoctors = () => {
    const container = document.getElementById('doctorsGridContainer');
    if (!container || !window.CLINIC_CONFIG?.doctorsList) return;

    container.innerHTML = window.CLINIC_CONFIG.doctorsList.map((doc, idx) => `
      <div class="doctor-card reveal" style="--i: ${idx};">
        <div class="doctor-arch-frame">
          ${doc.image && doc.image.trim() !== ''
            ? `<img src="${esc(doc.image)}" alt="${esc(doc.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'doctor-initials-avatar\\'>${esc(doc.initials)}</span>';">`
            : `<span class="doctor-initials-avatar">${esc(doc.initials)}</span>`
          }
        </div>
        <h3 class="doctor-name">${esc(doc.name)}</h3>
        <p class="doctor-role">${esc(doc.role)}</p>
        <p class="doctor-bio">${esc(doc.bio)}</p>
      </div>
    `).join('');

    if (typeof window.observeAnimations === 'function') {
      window.observeAnimations(container);
    }
  };

  // 6. Navigation Active State & Mobile Menu Toggle
  const initNavigation = () => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });

    // Mobile Hamburger Toggle
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerBtn && navLinks) {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      hamburgerBtn.setAttribute('aria-controls', 'navLinksList');
      navLinks.id = 'navLinksList';

      hamburgerBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('nav-open');
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        const icon = hamburgerBtn.querySelector('i');
        if (icon) {
          icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('nav-open')) {
          navLinks.classList.remove('nav-open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          const icon = hamburgerBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        }
      });
    }
  };

  // 7. Quick Inquiry Form Submission (index.html & contact.html)
  const initInquiryForms = () => {
    const forms = document.querySelectorAll('.inquiry-form');
    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const alertBox = form.querySelector('.form-alert') || createAlertBox(form);

        const name = form.name?.value?.trim();
        const phone = form.phone?.value?.trim();
        const email = form.email?.value?.trim();
        const info = form.info?.value?.trim() || form.message?.value?.trim();
        const consent = form.consent?.checked;
        const website = form.website?.value; // Honeypot

        if (!name || !phone || !info) {
          showAlert(alertBox, 'Please complete all required fields.', 'error');
          return;
        }

        if (!consent) {
          showAlert(alertBox, 'Please provide consent to contact you before submitting.', 'error');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
        }

        try {
          const res = await fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, info, consentGiven: true, website })
          });
          const result = await res.json();

          if (res.ok && result.success) {
            showAlert(alertBox, result.message || 'Thank you. Your inquiry has been sent.', 'success');
            form.reset();
          } else {
            showAlert(alertBox, result.message || 'Unable to submit inquiry. Please try again or call the clinic.', 'error');
          }
        } catch (err) {
          showAlert(alertBox, 'A connection error occurred. Please try again.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        }
      });
    });
  };

  const createAlertBox = (form) => {
    const box = document.createElement('div');
    box.className = 'alert-box form-alert';
    box.style.display = 'none';
    form.insertBefore(box, form.firstChild);
    return box;
  };

  const showAlert = (el, msg, type = 'error') => {
    if (!el) return;
    el.className = `alert-box alert-${type} form-alert`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> <span>${esc(msg)}</span>`;
    el.style.display = 'flex';
  };

  // Initialize all scripts on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    hydrateClinicConfig();
    renderHomeServices();
    renderServicesCatalog();
    renderDoctors();
    initNavigation();
    initInquiryForms();
  });
})();
