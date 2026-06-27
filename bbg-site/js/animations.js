/**
 * BBG Confecções — animations.js
 * Intersection Observer reveals, counters, process line, parallax
 */

'use strict';

/* ── Scroll reveal ──────────────────────────────────────────── */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(el => {
    io.observe(el);
  });
}

/* ── Animated counters ──────────────────────────────────────── */
function animateCounter(el, start, end, duration, suffix) {
  const startTime = performance.now();

  const step = (currentTime) => {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(start + (end - start) * eased);

    el.textContent = (start === 0 ? (current > 0 ? '+' : '') : '') + current + suffix;

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = (end > 0 && start === 0 ? '+' : '') + end + suffix;
  };

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(el => {
      const end    = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.suffix || '';
      el.textContent = end + suffix;
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const end    = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = parseInt(el.dataset.duration, 10) || 1600;
      animateCounter(el, 0, end, dur, suffix);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });

  counters.forEach(el => io.observe(el));
}

/* ── Process track animation ────────────────────────────────── */
function initProcessTrack() {
  const track = document.querySelector('.process-track');
  if (!track) return;

  if (!('IntersectionObserver' in window)) {
    track.classList.add('animated');
    track.querySelectorAll('.process-step').forEach(s => s.classList.add('active'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      track.classList.add('animated');

      // Progressively activate each step
      const steps = track.querySelectorAll('.process-step');
      steps.forEach((step, i) => {
        setTimeout(() => step.classList.add('active'), i * 220);
      });

      io.unobserve(track);
    });
  }, { threshold: 0.3 });

  io.observe(track);
}

/* ── Light parallax on hero shapes ─────────────────────────── */
function initParallax() {
  const shapes = document.querySelectorAll('.hero__shape');
  if (!shapes.length) return;

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      shapes.forEach((shape, i) => {
        const factor = (i + 1) * 0.06;
        shape.style.transform = `translateY(${y * factor}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
}

/* ── Catalog search & filter ────────────────────────────────── */
function initCatalogSearch() {
  const searchInput = document.querySelector('.search-input');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const cards       = document.querySelectorAll('[data-category]');

  if (!searchInput && !filterBtns.length) return;

  let activeFilter = 'all';

  function filterCards() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.dataset.category || '';
      const title    = (card.querySelector('.line-card__title, .product-card__title, h3')?.textContent || '').toLowerCase();
      const desc     = (card.querySelector('.line-card__desc, .product-card__desc, p')?.textContent || '').toLowerCase();

      const matchFilter = activeFilter === 'all' || category === activeFilter;
      const matchSearch = !query || title.includes(query) || desc.includes(query) || category.includes(query);

      const visible = matchFilter && matchSearch;
      card.style.display  = visible ? '' : 'none';
      card.style.opacity  = visible ? '' : '0';
      if (visible) visibleCount++;
    });

    // Empty state
    const emptyEl = document.querySelector('.catalog-empty');
    if (emptyEl) emptyEl.style.display = visibleCount === 0 ? '' : 'none';
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      filterCards();
    });
  });
}

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCounters();
  initProcessTrack();
  initParallax();
  initCatalogSearch();
});
