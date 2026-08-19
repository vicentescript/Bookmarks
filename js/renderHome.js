import { getCurrentUser, getUserBooks, updateBookStatus, updateBookRating, removeUserBook } from './store.js';
import { renderCurrentlyReading } from './renderReading.js';
import { resetToBooksView } from './renderLists.js';

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: '#4fc3f7' },
  leyendo:    { label: 'Leyendo',    color: '#ffbd59' },
  leido:      { label: 'Leído',      color: '#81c784' },
  abandonado: { label: 'Abandonado', color: '#e57373' },
  pausado:    { label: 'Pausado',    color: '#9c7cf4' },
  todos:      { label: 'Todos',      color: '#fff' },
};

const ESTADOS_ORDER = ['pendiente', 'leyendo', 'leido', 'abandonado', 'pausado'];

let filtroActual = null;
let searchTerm = '';

export function renderEstrellas(libro, onRate) {
  if (!libro.rating && !onRate) return null;
  const container = document.createElement('div');
  container.className = 'estrellas';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'estrella';
    if (libro.rating >= i) {
      star.classList.add('activa');
    } else if (libro.rating >= i - 0.5) {
      star.classList.add('media');
    }
    star.textContent = '★';

    if (onRate) {
      const halfLeft = document.createElement('span');
      halfLeft.className = 'estrella-half left';
      halfLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        onRate(i - 0.5);
      });

      const halfRight = document.createElement('span');
      halfRight.className = 'estrella-half right';
      halfRight.addEventListener('click', (e) => {
        e.stopPropagation();
        onRate(i);
      });

      star.appendChild(halfLeft);
      star.appendChild(halfRight);
    }

    container.appendChild(star);
  }
  return container;
}

function bookmarkSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 577 577">
<path fill="${color}" d="M257 8.93C352.97 8.93 448.44 8.93 543.9 8.93C544.03 9.24 544.15 9.55 544.28 9.86C540.03 12.77 535.68 15.55 531.56 18.62C506.94 36.98 492.7 61.44 488.92 91.91C488.27 97.18 487.91 102.52 487.91 107.82C487.86 256.13 487.88 404.43 487.88 552.73C487.88 554.69 487.88 556.64 487.88 559.98C485.68 558.34 484.36 557.58 483.31 556.55C456.6 530.04 429.97 503.45 403.22 476.98C362.86 437.06 322.37 397.25 282.06 357.28C279.12 354.36 277.48 354.82 274.83 357.46C235.83 396.21 196.77 434.87 157.7 473.54C129.76 501.19 101.79 528.82 73.82 556.44C72.8 557.45 71.63 558.3 69.55 560.04C69.37 557.23 69.18 555.53 69.18 553.83C69.18 408.53 69.76 263.22 68.9 117.92C68.61 69.71 98 33.34 137.72 17.87C152.76 12.01 168.39 9.05 184.52 8.98C208.51 8.88 232.51 8.94 257 8.93Z"/>
</svg>`;
}

const SVG_ICONS = {
  leyendo: bookmarkSvg('#ffbd59'),
  leido: bookmarkSvg('#81c784'),
  abandonado: bookmarkSvg('#e57373'),
  pausado: bookmarkSvg('#9c7cf4'),
};

function renderBadge(estado) {
  const wrapper = document.createElement('span');
  wrapper.className = 'badge-estado-top';
  wrapper.innerHTML = SVG_ICONS[estado] || '';
  return wrapper;
}

function renderCard(libro) {
  const article = document.createElement('article');
  article.className = 'libros';

  const imgContainer = document.createElement('div');
  imgContainer.className = 'ficha-libro';

  const img = document.createElement('img');
  img.src = libro.imagen;
  img.alt = libro.titulo;
  img.loading = 'lazy';
  imgContainer.appendChild(img);

  const badge = renderBadge(libro.estado);
  badge.className = 'badge-estado-top';
  imgContainer.appendChild(badge);

  const infoLibro = document.createElement('div');
  infoLibro.className = 'info-libro';

  const titulo = document.createElement('h3');
  titulo.className = 'titulo';
  titulo.textContent = libro.titulo;

  const autor = document.createElement('p');
  autor.className = 'autor';
  autor.textContent = libro.autor;

  infoLibro.appendChild(titulo);
  infoLibro.appendChild(autor);

  const estrellas = renderEstrellas(libro);
  if (estrellas) infoLibro.appendChild(estrellas);

  imgContainer.appendChild(infoLibro);



  article.appendChild(imgContainer);

  article.addEventListener('mouseenter', () => {
    const grid = article.closest('.mis-libros');
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const cardRect = article.getBoundingClientRect();
    article.classList.toggle('flip', cardRect.right + 260 > gridRect.right);
  });
  article.addEventListener('mouseleave', () => {
    article.classList.remove('flip');
  });

  article.addEventListener('click', (e) => {
    if (e.target.closest('.badge-estado-top') || e.target.closest('.synopsis-panel')) return;
    import('./renderDetail.js').then(mod => mod.openDetail(libro, article));
  });

  return article;
}

function initFiltros() {
  const container = document.getElementById('filtrosEstados');
  container.innerHTML = '';

  const dropdown = document.createElement('div');
  dropdown.className = 'estado-dropdown';

  const btn = document.createElement('button');
  btn.className = 'estado-dropdown-btn';
  updateDropdownBtn(btn);
  dropdown.appendChild(btn);

  const menu = document.createElement('div');
  menu.className = 'estado-dropdown-menu';

  const allEstados = ['todos', ...ESTADOS_ORDER];
  allEstados.forEach(est => {
    const item = document.createElement('button');
    item.className = 'estado-dropdown-item';
    item.dataset.estado = est;

    const dot = document.createElement('span');
    dot.className = 'estado-dot';
    dot.style.background = ESTADOS[est].color;

    const label = document.createElement('span');
    label.textContent = ESTADOS[est].label;

    item.appendChild(dot);
    item.appendChild(label);

    item.addEventListener('click', () => {
      filtroActual = est === 'todos' ? null : est;
      menu.classList.remove('open');
      resetToBooksView();
      renderBiblioteca();
    });

    menu.appendChild(item);
  });

  dropdown.appendChild(menu);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    menu.classList.remove('open');
  });

  container.appendChild(dropdown);
}

function updateDropdownBtn(btn) {
  const label = filtroActual ? ESTADOS[filtroActual].label : 'Todos';
  const color = filtroActual ? ESTADOS[filtroActual].color : '#fff';
  btn.innerHTML = `<span class="estado-dot" style="background:${color}"></span> ${label} <span class="dropdown-arrow">▾</span>`;
}

export function renderBiblioteca() {
  initFiltros();
  const user = getCurrentUser();
  if (!user) return;

  const contenedor = document.querySelector('.mis-libros');

  const animar = contenedor.querySelector('.libros') != null;

  if (animar) {
    contenedor.querySelectorAll('.libros').forEach(el => el.classList.add('exit'));
  }

  const rebuild = () => {
    contenedor.innerHTML = '';

    let libros = getUserBooks(user.id);
    if (filtroActual) {
      libros = libros.filter(b => b.estado === filtroActual);
    }
    searchTerm = document.getElementById('librarySearch').value.toLowerCase().trim();
    if (searchTerm) {
      libros = libros.filter(b =>
        b.titulo.toLowerCase().includes(searchTerm) ||
        b.autor.toLowerCase().includes(searchTerm)
      );
    }

    if (libros.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-msg';
      empty.textContent = searchTerm
        ? 'No hay libros que coincidan con "' + searchTerm + '".'
        : filtroActual
          ? 'No hay libros en esta categoría.'
          : 'Tu biblioteca está vacía. Busca libros y añádelos desde la búsqueda.';
      contenedor.appendChild(empty);
      return;
    }

    libros.forEach((libro, i) => {
      const card = renderCard(libro);
      card.classList.add('enter');
      card.style.animationDelay = (i * 40) + 'ms';
      contenedor.appendChild(card);
    });
  };

  if (animar) {
    setTimeout(rebuild, 280);
  } else {
    rebuild();
  }
}

export function initBiblioteca() {
  initFiltros();
  renderBiblioteca();
  const searchInput = document.getElementById('librarySearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      resetToBooksView();
      renderBiblioteca();
    });
  }
}

