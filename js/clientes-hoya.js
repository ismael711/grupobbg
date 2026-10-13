/**
 * BBG Confecções — clientes-hoya.js
 * Página Clientes Hoya: cards, carrossel de fotos e visões de produto por hash
 */

'use strict';

document.querySelectorAll('[data-detail-url]').forEach(function (card) {
  card.addEventListener('click', function (event) {
    if (!event.target.closest('a, button')) window.location.href = card.dataset.detailUrl;
  });
});
document.querySelectorAll('.hoya-photo-option').forEach(function (button) {
  button.addEventListener('click', function () {
    const card = button.closest('.product-card');
    card.querySelectorAll('.product-card__image img').forEach(function (image) {
      image.hidden = image.id !== button.dataset.photo;
    });
    card.querySelectorAll('.hoya-photo-option').forEach(function (option) {
      option.setAttribute('aria-pressed', String(option === button));
    });
  });
});
document.addEventListener('keydown', function (event) {
  const toggle = document.querySelector('.nav-toggle');
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    toggle.click();
    toggle.focus();
  }
});

document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
  const images = Array.from(carousel.querySelectorAll('.product-card__image img'));
  const counter = carousel.querySelector('.hoya-carousel-count');
  let current = 0;
  function move(step) {
    current = (current + step + images.length) % images.length;
    images.forEach(function (image, index) { image.hidden = index !== current; });
    counter.textContent = (current + 1) + ' / ' + images.length;
  }
  carousel.querySelectorAll('[data-carousel-step]').forEach(function (button) {
    button.addEventListener('click', function () { move(Number(button.dataset.carouselStep)); });
  });
  carousel.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let touchStart = null;
  carousel.addEventListener('touchstart', function (event) {
    if (event.touches.length === 1) touchStart = event.touches[0].clientX;
  }, {passive:true});
  carousel.addEventListener('touchend', function (event) {
    if (touchStart !== null && event.changedTouches.length) {
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
    }
    touchStart = null;
  }, {passive:true});
  carousel.addEventListener('touchcancel', function () { touchStart = null; }, {passive:true});
});

function showHoyaView() {
  const hash = window.location.hash;
  const requested = hash.startsWith('#produto/') ? decodeURIComponent(hash.slice(9)) : 'inicio';
  const views = Array.from(document.querySelectorAll('[data-hoya-view]'));
  const selected = views.find(view => view.dataset.hoyaView === requested) || views.find(view => view.dataset.hoyaView === 'inicio');
  views.forEach(view => { view.hidden = view !== selected; });
  const nav = document.querySelector('.header__nav');
  const toggle = document.querySelector('.nav-toggle');
  nav.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
  if (selected.dataset.hoyaView !== 'inicio') {
    const details = selected.querySelector('.hoya-product-detail');
    const header = document.querySelector('.header');
    const headerHeight = header.getBoundingClientRect().height;
    const top = details.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
    window.scrollTo({top:Math.max(0,top),behavior:'instant'});
    document.title = selected.querySelector('h1').textContent + ' | Clientes Hoya';
  } else {
    document.title = 'Clientes Hoya | BBG Confecções';
    const target = document.getElementById(hash.slice(1) || 'conteudo');
    if (target) target.scrollIntoView();
  }
}
window.addEventListener('hashchange',showHoyaView);
document.addEventListener('click',function(event) {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.location.hash = anchor.getAttribute('href');
  showHoyaView();
},true);
showHoyaView();
