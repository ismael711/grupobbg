/**
 * BBG Confecções — main.js
 * Core site functionality: header, nav, back-to-top, ripple, lazy images
 */

'use strict';

/* ── DOM ready helper ──────────────────────────────────────── */
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/* ── Header scroll behaviour ───────────────────────────────── */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;

  const update = () => {
    const y = window.scrollY;

    if (y > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = y;
  };

  window.addEventListener('scroll', update, { passive: true });
  update(); // run once on load
}

/* ── Mobile nav toggle ──────────────────────────────────────── */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.header__nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)) {
      toggle.classList.remove('open');
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ── Active nav link ────────────────────────────────────────── */
function initActiveNav() {
  const links   = document.querySelectorAll('.nav__link');
  const current = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const match = href === current ||
                  href === './' + current ||
                  (current === '' && href === 'index.html') ||
                  (current === 'index.html' && href === './');

    if (match) link.classList.add('active');
  });
}

/* ── Back to top button ─────────────────────────────────────── */
function initBackToTop() {
  const btn = document.querySelector('.back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Button ripple effect ───────────────────────────────────── */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top)  + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ── Lazy load images ───────────────────────────────────────── */
function initLazyImages() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      io.unobserve(img);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
}

/* ── Smooth anchor scrolling ────────────────────────────────── */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h-sm')
      ) || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── Bootstrap all modules ─────────────────────────────────── */
ready(() => {
  initHeader();
  initMobileNav();
  initActiveNav();
  initBackToTop();
  initRipple();
  initLazyImages();
  initSmoothAnchors();
});
