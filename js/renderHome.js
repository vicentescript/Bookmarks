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

const SVG_ICONS = {
  pendiente: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path fill="#4fc3f7" d="M416 480L256 357.41L96 480V32h320Z"/></svg>`,
  leyendo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path fill="#ffbd59" d="M416 480L256 357.41L96 480V32h320Z"/></svg>`,
  leido: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path fill="#81c784" d="M416 480L256 357.41L96 480V32h320Z"/></svg>`,
  abandonado: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path fill="#e57373" d="M416 480L256 357.41L96 480V32h320Z"/></svg>`,
  pausado: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path fill="#9c7cf4" d="M416 480L256 357.41L96 480V32h320Z"/></svg>`,
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

  imgContainer.appendChild(infoLibro);

  const synopsisPanel = document.createElement('div');
  synopsisPanel.className = 'synopsis-panel';
  const synopsisContent = document.createElement('div');
  synopsisContent.className = 'synopsis-content';
  synopsisContent.textContent = libro.sinopsis;
  synopsisPanel.appendChild(synopsisContent);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const estrellas = renderEstrellas(libro);
  if (estrellas) footer.appendChild(estrellas);

  article.appendChild(imgContainer);
  article.appendChild(footer);
  article.appendChild(synopsisPanel);

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
    if (e.target.closest('.card-footer') || e.target.closest('.badge-estado-top') || e.target.closest('.synopsis-panel')) return;
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

