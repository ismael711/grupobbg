/**
 * BBG Confecções — slider.js
 * Lightweight hero / banner carousel (no dependencies)
 */

'use strict';

class Slider {
  /**
   * @param {string|Element} selector  - CSS selector or DOM element
   * @param {object}         options
   * @param {number}  [options.autoplay=5000]  - ms between slides (0 = no autoplay)
   * @param {boolean} [options.loop=true]       - loop back to first slide
   * @param {string}  [options.effect='slide']  - 'slide' | 'fade'
   * @param {boolean} [options.dots=true]        - show dot indicators
   * @param {boolean} [options.arrows=true]      - show prev/next arrows
   */
  constructor(selector, options = {}) {
    this.wrap = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.wrap) return;

    this.opts = {
      autoplay: 5000,
      loop:     true,
      effect:   'slide',
      dots:     true,
      arrows:   true,
      ...options,
    };

    this.track     = this.wrap.querySelector('.slider__track');
    this.slides    = this.wrap.querySelectorAll('.slider__slide');
    this.total     = this.slides.length;
    this.current   = 0;
    this.autoTimer = null;
    this.dragging  = false;
    this.startX    = 0;
    this.threshold = 50;

    if (this.total < 2) {
      // Single slide — just show it
      this.slides[0]?.classList.add('is-active');
      return;
    }

    this._setup();
    this._bindEvents();
    if (this.opts.autoplay) this._startAuto();
  }

  /* ── Setup ──────────────────────────────────────────────── */
  _setup() {
    this.wrap.classList.add('slider--ready');
    this.slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
      if (i === 0) slide.classList.add('is-active');
    });

    if (this.opts.effect === 'slide') {
      this.wrap.style.overflow = 'hidden';
      if (this.track) {
        this.track.style.display     = 'flex';
        this.track.style.transition  = 'transform 0.6s cubic-bezier(.4,0,.2,1)';
        this._updateTrackPos(false);
      }
    }

    if (this.opts.arrows) this._buildArrows();
    if (this.opts.dots)   this._buildDots();
  }

  /* ── Build arrows ───────────────────────────────────────── */
  _buildArrows() {
    const prev = this._createBtn('slider__btn slider__btn--prev', '←', 'Slide anterior');
    const next = this._createBtn('slider__btn slider__btn--next', '→', 'Próximo slide');

    prev.addEventListener('click', () => this.prev());
    next.addEventListener('click', () => this.next());

    this.wrap.appendChild(prev);
    this.wrap.appendChild(next);
  }

  _createBtn(cls, text, label) {
    const btn = document.createElement('button');
    btn.className = cls;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = text;
    return btn;
  }

  /* ── Build dots ─────────────────────────────────────────── */
  _buildDots() {
    const nav = document.createElement('div');
    nav.className = 'slider__dots';
    nav.setAttribute('role', 'tablist');

    this.dots = [];
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className   = 'slider__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', () => this.go(i));
      nav.appendChild(dot);
      this.dots.push(dot);
    });

    this.wrap.appendChild(nav);
  }

  /* ── Events ─────────────────────────────────────────────── */
  _bindEvents() {
    // Keyboard
    this.wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Touch / drag
    this.wrap.addEventListener('pointerdown',  this._dragStart.bind(this), { passive: true });
    this.wrap.addEventListener('pointerup',    this._dragEnd.bind(this));
    this.wrap.addEventListener('pointercancel',this._dragEnd.bind(this));

    // Pause on hover
    this.wrap.addEventListener('mouseenter', () => this._stopAuto());
    this.wrap.addEventListener('mouseleave',  () => {
      if (this.opts.autoplay) this._startAuto();
    });

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this._stopAuto();
      else if (this.opts.autoplay) this._startAuto();
    });
  }

  _dragStart(e) {
    this.startX   = e.clientX;
    this.dragging = true;
  }

  _dragEnd(e) {
    if (!this.dragging) return;
    this.dragging = false;
    const delta = e.clientX - this.startX;
    if (Math.abs(delta) < this.threshold) return;
    delta < 0 ? this.next() : this.prev();
  }

  /* ── Navigation ─────────────────────────────────────────── */
  go(index) {
    this.slides[this.current].classList.remove('is-active');
    this.slides[this.current].setAttribute('aria-hidden', 'true');
    if (this.dots) this.dots[this.current].classList.remove('is-active');

    this.current = index;

    this.slides[this.current].classList.add('is-active');
    this.slides[this.current].setAttribute('aria-hidden', 'false');
    if (this.dots) this.dots[this.current].classList.add('is-active');

    if (this.opts.effect === 'slide') this._updateTrackPos(true);
  }

  next() {
    const next = this.current < this.total - 1
      ? this.current + 1
      : (this.opts.loop ? 0 : this.current);
    this.go(next);
    this._resetAuto();
  }

  prev() {
    const prev = this.current > 0
      ? this.current - 1
      : (this.opts.loop ? this.total - 1 : 0);
    this.go(prev);
    this._resetAuto();
  }

  /* ── Track position ─────────────────────────────────────── */
  _updateTrackPos(animate) {
    if (!this.track) return;
    if (!animate) this.track.style.transition = 'none';
    this.track.style.transform = `translateX(-${this.current * 100}%)`;
    if (!animate) {
      // Force reflow then re-enable
      void this.track.offsetWidth;
      this.track.style.transition = 'transform 0.6s cubic-bezier(.4,0,.2,1)';
    }
  }

  /* ── Autoplay ───────────────────────────────────────────── */
  _startAuto() {
    this._stopAuto();
    this.autoTimer = setInterval(() => this.next(), this.opts.autoplay);
  }

  _stopAuto() {
    clearInterval(this.autoTimer);
    this.autoTimer = null;
  }

  _resetAuto() {
    if (this.opts.autoplay) {
      this._stopAuto();
      this._startAuto();
    }
  }

  /* ── Public API ─────────────────────────────────────────── */
  destroy() {
    this._stopAuto();
    this.wrap.classList.remove('slider--ready');
  }
}

/* ── Auto-init sliders in the page ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-slider]').forEach(wrap => {
    const opts = {
      autoplay: parseInt(wrap.dataset.autoplay || '5000', 10),
      effect:   wrap.dataset.effect || 'slide',
      dots:     wrap.dataset.dots   !== 'false',
      arrows:   wrap.dataset.arrows !== 'false',
      loop:     wrap.dataset.loop   !== 'false',
    };
    new Slider(wrap, opts);
  });
});

/* Export for manual use */
if (typeof module !== 'undefined') module.exports = Slider;
