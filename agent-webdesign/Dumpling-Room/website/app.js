/**
 * Dumpling Room — Premium JavaScript
 * Author: Web Designer AI Agent
 * Version: 2.0 — 2026
 */

'use strict';

/* ============================================================
   1. UTILITY HELPERS
   ============================================================ */

/** Debounce a function */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** Query selector shorthand */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   2. HEADER — SCROLL BEHAVIOUR
   ============================================================ */
function initHeader() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial run
}

/* ============================================================
   3. MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  const closeLinks = $$('[data-close]', mobileMenu);

  if (!hamburger || !mobileMenu) return;

  const openMenu  = () => {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  closeLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ============================================================
   4. SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initScrollReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  els.forEach(el => observer.observe(el));
}

/* ============================================================
   5. SMOOTH SCROLL — ANCHOR LINKS
   ============================================================ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = $(link.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const offset = document.getElementById('header')?.offsetHeight || 76;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ============================================================
   6. ACTIVE NAV LINK — SCROLL SPY
   ============================================================ */
function initScrollSpy() {
  const sections = $$('section[id], div[id]');
  const navLinks = $$('.nav__link[href^="#"]');

  if (!navLinks.length) return;

  const onScroll = debounce(() => {
    const scrollY = window.scrollY + 120;

    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });

    navLinks.forEach(link => {
      const matches = link.getAttribute('href') === `#${current}`;
      link.style.color    = matches ? 'var(--gold-light)' : '';
      link.style.background = matches && !link.classList.contains('nav__link--cta')
        ? 'rgba(212,175,55,0.1)' : '';
    });
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ============================================================
   7. MENU TABS
   ============================================================ */
function initMenuTabs() {
  const tabs   = $$('.menu-tab');
  const panels = $$('.menu-panel');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all
      tabs.forEach(t => {
        t.classList.remove('menu-tab--active');
        t.setAttribute('aria-selected', 'false');
      });

      // Hide all panels
      panels.forEach(p => {
        p.classList.remove('menu-panel--active');
        p.hidden = true;
      });

      // Activate clicked tab
      tab.classList.add('menu-tab--active');
      tab.setAttribute('aria-selected', 'true');

      const panelId = `tab-${tab.dataset.tab}`;
      const panel   = $(`#${panelId}`);
      if (panel) {
        panel.classList.add('menu-panel--active');
        panel.hidden = false;

        // Re-trigger reveal animations for newly shown items
        $$('.reveal-up', panel).forEach((el, i) => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), i * 60);
        });
      }
    });
  });
}

/* ============================================================
   8. BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const toggle = () => {
    if (window.scrollY > 500) {
      btn.removeAttribute('hidden');
    } else {
      btn.setAttribute('hidden', '');
    }
  };

  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   9. CONTACT FORM — VALIDATION & SUBMIT
   ============================================================ */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const validate = () => {
    let valid = true;

    $$('[required]', form).forEach(field => {
      const group = field.closest('.form-group');
      const error = group?.querySelector('.form-error');

      let msg = '';

      if (!field.value.trim()) {
        msg   = 'This field is required.';
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        msg   = 'Please enter a valid email address.';
        valid = false;
      } else if (field.type === 'date') {
        const chosen = new Date(field.value);
        const today  = new Date();
        today.setHours(0, 0, 0, 0);
        if (chosen < today) {
          msg   = 'Please select a future date.';
          valid = false;
        }
      }

      if (error) error.textContent = msg;
      field.style.borderColor = msg ? 'var(--red)' : '';
    });

    return valid;
  };

  // Live clear on input
  $$('[required]', form).forEach(field => {
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      const error = group?.querySelector('.form-error');
      if (error) error.textContent = '';
      field.style.borderColor = '';
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validate()) return;

    const btnText   = form.querySelector('.btn__text');
    const btnLoader = form.querySelector('.btn__loader');
    const submitBtn = form.querySelector('[type="submit"]');

    // Simulate loading state
    submitBtn.disabled = true;
    btnText.hidden     = true;
    btnLoader.hidden   = false;

    // Simulate API delay (replace with real fetch to your backend)
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Success state
    form.innerHTML = `
      <div style="text-align:center; padding: 3rem 1rem;">
        <div style="
          width:72px; height:72px; border-radius:50%;
          background: linear-gradient(135deg, #2ECC71, #27AE60);
          display:flex; align-items:center; justify-content:center;
          margin: 0 auto var(--space-lg);
          box-shadow: 0 8px 24px rgba(46,204,113,0.3);
        ">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        <h3 style="font-family:var(--font-display); font-size:1.5rem; color:var(--ink); margin-bottom:var(--space-md);">
          Reservation Request Sent!
        </h3>
        <p style="color:var(--ink-60); line-height:1.7;">
          Thank you! We'll confirm your table within 2 hours.<br>
          Alternatively, call us at <a href="tel:+61295161640" style="color:var(--red); font-weight:600;">(02) 9516 1640</a>.
        </p>
      </div>
    `;
  });
}

/* ============================================================
   10. HERO PARTICLES — FLOATING DOTS
   ============================================================ */
function initParticles() {
  const container = $('#particles');
  if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = 20;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 4 + 1;
    const x    = Math.random() * 100;
    const y    = Math.random() * 100;
    const dur  = Math.random() * 20 + 15;
    const del  = Math.random() * -20;
    const isGold = Math.random() > 0.5;

    dot.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${isGold ? 'rgba(212,175,55,' : 'rgba(253,248,240,'}${(Math.random() * 0.3 + 0.1).toFixed(2)});
      animation: particleFloat ${dur}s ${del}s ease-in-out infinite;
      pointer-events: none;
    `;

    container.appendChild(dot);
  }

  // Add particle keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25%       { transform: translate(${Math.random() > 0.5 ? '+' : '-'}15px, -20px) scale(1.2); }
      50%       { transform: translate(${Math.random() > 0.5 ? '+' : '-'}10px, -10px) scale(0.8); }
      75%       { transform: translate(${Math.random() > 0.5 ? '+' : '-'}20px, -30px) scale(1.1); }
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   11. GALLERY — LIGHTBOX EFFECT
   ============================================================ */
function initGallery() {
  const items = $$('.gallery-item');
  if (!items.length) return;

  items.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    const activate = () => {
      const label = item.querySelector('.gallery-item__overlay span')?.textContent || 'Dish';
      showLightbox(item, label);
    };

    item.addEventListener('click', activate);
    item.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

function showLightbox(sourceEl, label) {
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', label);
  overlay.setAttribute('aria-modal', 'true');

  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(15, 8, 5, 0.96);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1.5rem;
    animation: lightboxIn 0.3s ease;
    cursor: zoom-out;
  `;

  // Extract and display the image
  const art = sourceEl.querySelector('.gallery-item__art');
  const img = art?.querySelector('.gallery-item__image');

  const container = document.createElement('div');
  container.style.cssText = `
    position: relative;
    width: min(90vw, 900px);
    height: min(90vh, 900px);
    border-radius: 24px;
    border: 1px solid rgba(212,175,55,0.3);
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
    animation: lightboxScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: auto;
  `;

  if (img) {
    const imgClone = img.cloneNode(true);
    imgClone.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    `;
    container.appendChild(imgClone);
  } else if (art) {
    const clone = art.cloneNode(true);
    clone.style.cssText = `
      width: 100%;
      height: 100%;
    `;
    container.appendChild(clone);
  }

  const clone = container;

  const caption = document.createElement('p');
  caption.style.cssText = `
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    color: var(--parchment, #FDF8F0);
    opacity: 0;
    animation: fadeIn 0.5s 0.2s ease forwards;
    letter-spacing: 0.05em;
  `;
  caption.textContent = label;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.style.cssText = `
    position: absolute;
    top: 1.5rem; right: 1.5rem;
    width: 48px; height: 48px;
    border-radius: 50%;
    border: 1px solid rgba(253,248,240,0.2);
    background: transparent;
    color: rgba(253,248,240,0.7);
    font-size: 1.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: all 0.2s;
  `;

  overlay.appendChild(clone);
  overlay.appendChild(caption);
  overlay.appendChild(closeBtn);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes lightboxIn    { from { opacity: 0; } to { opacity: 1; } }
    @keyframes lightboxScale { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `;
  overlay.appendChild(style);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.style.animation = 'none';
    overlay.style.opacity   = '0';
    overlay.style.transition = 'opacity 0.2s';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 200);
  };

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
  });
}

/* ============================================================
   12. TESTIMONIALS — AUTO ROTATE (MOBILE CAROUSEL)
   ============================================================ */
function initTestimonials() {
  const track  = $('#testimonialsTrack');
  const dots   = $$('.dot');

  if (!track || !dots.length) return;

  // Only auto-rotate on mobile
  if (window.innerWidth > 1024) return;

  const cards  = $$('.testimonial-card', track);
  let current  = 0;
  let interval;

  const goTo = (idx) => {
    current = idx;
    cards.forEach((c, i) => {
      c.style.display = (i === idx) ? 'block' : 'none';
    });
    dots.forEach((d, i) => d.classList.toggle('dot--active', i === idx));
  };

  const next = () => goTo((current + 1) % cards.length);

  // Start
  goTo(0);
  interval = setInterval(next, 5000);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      goTo(i);
      interval = setInterval(next, 5000);
    });
  });
}

/* ============================================================
   13. PARALLAX — SUBTLE HERO LAYER
   ============================================================ */
function initParallax() {
  const layers = $$('.hero__bg-layer');
  if (!layers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    layers[0].style.transform = `translateY(${scrollY * 0.08}px)`;
    if (layers[1]) layers[1].style.transform = `translateY(${scrollY * 0.04}px)`;
  }, { passive: true });
}

/* ============================================================
   14. SECTION PROGRESS COUNTER ANIMATION
   ============================================================ */
function initCounters() {
  const nums = $$('.about__stat-num');
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+)([^0-9]*)$/);

      if (!match) return; // text like "Daily" — skip
      const target = parseInt(match[1], 10);
      const suffix = match[2];
      let start = 0;
      const duration = 1200;
      const step     = duration / target;

      const tick = () => {
        start = Math.min(start + 1, target);
        el.textContent = start + suffix;
        if (start < target) setTimeout(tick, step);
      };

      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
}

/* ============================================================
   15. DELIVERY BUTTON HOVER EFFECT
   ============================================================ */
function initDeliveryButtons() {
  $$('.delivery-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px) scale(1.02)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ============================================================
   16. LOGO — CHINESE CHARACTER ANIMATION
   ============================================================ */
function initLogoGlow() {
  const symbols = $$('.logo__symbol');

  symbols.forEach(sym => {
    sym.addEventListener('mouseenter', () => {
      sym.style.filter = 'drop-shadow(0 0 12px rgba(212,175,55,0.8))';
      sym.style.transform = 'scale(1.15) rotate(5deg)';
      sym.style.transition = 'all 0.3s ease';
    });
    sym.addEventListener('mouseleave', () => {
      sym.style.filter = 'drop-shadow(0 2px 4px rgba(212,175,55,0.4))';
      sym.style.transform = '';
    });
  });
}

/* ============================================================
   17. SPECIALTY CARD MAGNETIC EFFECT
   ============================================================ */
function initMagneticCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  $$('.specialty-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left - rect.width  / 2;
      const y      = e.clientY - rect.top  - rect.height / 2;
      const tiltX  = -(y / rect.height) * 8;
      const tiltY  =  (x / rect.width)  * 8;

      card.style.transform     = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      card.style.transition    = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s ease';
    });
  });
}

/* ============================================================
   18. CURRENT DATE — SET MIN DATE ON FORM
   ============================================================ */
function initDateField() {
  const dateInput = $('#date');
  if (!dateInput) return;

  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

/* ============================================================
   19. KEYBOARD NAVIGATION — MENU TABS
   ============================================================ */
function initTabKeyNav() {
  const tabs = $$('.menu-tab');
  if (!tabs.length) return;

  tabs.forEach((tab, i) => {
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tabs[(i + 1) % tabs.length].focus();
        tabs[(i + 1) % tabs.length].click();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tabs[(i - 1 + tabs.length) % tabs.length].focus();
        tabs[(i - 1 + tabs.length) % tabs.length].click();
      }
    });
  });
}

/* ============================================================
   18. COUNTDOWN TIMER
   ============================================================ */
function initCountdownTimer() {
  const timerElement = document.getElementById('countdownTimer');
  if (!timerElement) return;

  // Set expiration date to 7 days from page load
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  const updateTimer = () => {
    const now = new Date();
    const diff = expirationDate - now;

    if (diff <= 0) {
      timerElement.textContent = 'This preview has expired';
      timerElement.parentElement.style.color = 'rgba(196,30,58,0.5)';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      timerElement.textContent = `This preview expires in ${days}d ${hours}h`;
    } else if (hours > 0) {
      timerElement.textContent = `This preview expires in ${hours}h ${minutes}m`;
    } else {
      timerElement.textContent = `This preview expires in ${minutes}m`;
    }
  };

  updateTimer();
  setInterval(updateTimer, 60000); // Update every minute
}

/* ============================================================
   19. GALLERY IMAGES LOADER
   ============================================================ */
function initGalleryImages() {
  // Load real images from /images folder with fallback to CSS art
  const images = $$('.gallery-item__image');

  images.forEach(img => {
    const dataSrc = img.getAttribute('data-src');
    if (!dataSrc) return;

    const paths = dataSrc.split(',').map(p => p.trim());

    const tryLoad = (index = 0) => {
      if (index >= paths.length) {
        img.style.display = 'none';
        const fallback = img.parentElement.querySelector('.food-art');
        if (fallback) fallback.style.display = 'flex';
        return;
      }

      const testImg = new Image();
      testImg.onload = () => {
        img.src = paths[index];
        img.style.opacity = '0';
        setTimeout(() => { img.style.opacity = '1'; }, 50);
      };
      testImg.onerror = () => tryLoad(index + 1);
      testImg.src = paths[index];
    };

    tryLoad();
  });
}

/* ============================================================
   20. INITIALISE ALL MODULES
   ============================================================ */
function init() {
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initScrollSpy();
  initScrollReveal();
  initMenuTabs();
  initBackToTop();
  initContactForm();
  initParticles();
  initGallery();
  initTestimonials();
  initParallax();
  initCounters();
  initDeliveryButtons();
  initLogoGlow();
  initMagneticCards();
  initDateField();
  initTabKeyNav();
  initCountdownTimer();
  initGalleryImages();
}

/* ============================================================
   BOOT
   ============================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
