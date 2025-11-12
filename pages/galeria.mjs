// /pages/galeria.mjs
const grid = document.getElementById('gl-grid');
const modal = document.getElementById('gl-modal');
const imgFull = document.getElementById('gl-full');

const btnClose = document.getElementById('gl-close');
const btnPrev  = document.getElementById('gl-prev');
const btnNext  = document.getElementById('gl-next');
const btnFirst = document.getElementById('gl-first');
const btnLast  = document.getElementById('gl-last');

const BASE = '../img/galeria/';

// Reemplaza con tus archivos reales (o usa el generador de patrón más abajo)
//const IMAGES = [
//  { full: 'imagen01.jpg', thumb: 'imagen01_thumb.jpg', alt: 'Ilustración 1' },
//  { full: 'imagen02.jpg', thumb: 'imagen02_thumb.jpg', alt: 'Ilustración 2' },
//  { full: 'imagen03.jpg', thumb: 'imagen03_thumb.jpg', alt: 'Ilustración 3' },
//  { full: 'imagen04.jpg', thumb: 'imagen04_thumb.jpg', alt: 'Ilustración 4' },
//  { full: 'imagen05.jpg', thumb: 'imagen05_thumb.jpg', alt: 'Ilustración 5' },
//];

// Ejemplo generador por patrón:
const IMAGES = Array.from({ length: 61 }, (_, i) => {
  return { full: `galeria${i + 1}.jpg`, alt: `Ilustración ${i + 1}` };
});

let currentIndex = 0;

function renderThumbs(list) {
  grid.innerHTML = list.map((it, idx) => `
    <a class="gl-thumb" href="${BASE + it.full}" data-index="${idx}">
      <img src="${BASE + (it.thumb || it.full)}" alt="${it.alt || ''}" loading="lazy" decoding="async" />
    </a>
  `).join('');
}

function openAt(index) {
  if (index < 0 || index >= IMAGES.length) return;
  currentIndex = index;
  const it = IMAGES[currentIndex];
  imgFull.src = BASE + it.full;
  imgFull.alt = it.alt || '';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  imgFull.src = '';
  document.body.style.overflow = '';
}

function next()  { if (currentIndex < IMAGES.length - 1) openAt(currentIndex + 1); }
function prev()  { if (currentIndex > 0) openAt(currentIndex - 1); }
function first() { openAt(0); }
function last()  { openAt(IMAGES.length - 1); }

function handleThumbClick(e) {
  const a = e.target.closest('a.gl-thumb');
  if (!a) return;
  e.preventDefault();
  const idx = parseInt(a.dataset.index, 10);
  openAt(idx);
}

function handleKey(e) {
  if (modal.getAttribute('aria-hidden') === 'true') return;
  switch (e.key) {
    case 'Escape': closeModal(); break;
    case 'ArrowRight': next(); break;
    case 'ArrowLeft': prev(); break;
    case 'Home': first(); break;
    case 'End': last(); break;
  }
}

function handleBackgroundClick(e) {
  if (e.target === modal || e.target.classList.contains('gl-stage')) {
    closeModal();
  }
}

function init() {
  renderThumbs(IMAGES);
  grid.addEventListener('click', handleThumbClick);

  btnClose.addEventListener('click', closeModal);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  btnFirst.addEventListener('click', first);
  btnLast.addEventListener('click', last);

  document.addEventListener('keydown', handleKey);
  modal.addEventListener('click', handleBackgroundClick);
}

document.addEventListener('DOMContentLoaded', init);
