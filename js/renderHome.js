import { getCurrentUser, getUserBooks, updateBookStatus, updateBookRating, removeUserBook } from './store.js';
import { renderCurrentlyReading } from './renderReading.js';

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: '#ffbd59' },
  leyendo:    { label: 'Leyendo',    color: '#4fc3f7' },
  leido:      { label: 'Leído',      color: '#81c784' },
  abandonado: { label: 'Abandonado', color: '#e57373' },
  pausado:    { label: 'Pausado',    color: '#ba68c8' },
  todos:      { label: 'Todos',      color: '#ffbd59' },
};

const ESTADOS_ORDER = ['pendiente', 'leyendo', 'leido', 'abandonado', 'pausado'];

let filtroActual = null;
let searchTerm = '';

function renderEstrellas(libro) {
  const container = document.createElement('div');
  container.className = 'estrellas';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'estrella' + (i <= libro.rating ? ' activa' : '');
    star.textContent = '★';
    container.appendChild(star);
  }
  return container;
}

function renderBadge(estado) {
  const cfg = ESTADOS[estado];
  const span = document.createElement('span');
  span.className = 'badge-estado';
  span.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
  span.style.background = cfg.color;
  span.style.color = '#000';
  return span;
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

  const delOverlay = document.createElement('button');
  delOverlay.className = 'delete-overlay';
  delOverlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  delOverlay.title = 'Eliminar de mi biblioteca';
  delOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('¿Eliminar "' + libro.titulo + '" de tu biblioteca?')) {
      removeUserBook(libro.id);
      renderBiblioteca();
    }
  });
  imgContainer.appendChild(delOverlay);

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
  footer.appendChild(estrellas);

  const estadoSelect = document.createElement('select');
  estadoSelect.className = 'estado-select';
  ESTADOS_ORDER.forEach(est => {
    const opt = document.createElement('option');
    opt.value = est;
    opt.textContent = ESTADOS[est].label;
    if (est === libro.estado) opt.selected = true;
    estadoSelect.appendChild(opt);
  });
  estadoSelect.addEventListener('change', () => {
    updateBookStatus(libro.id, estadoSelect.value);
    renderBiblioteca();
    renderCurrentlyReading();
  });
  footer.appendChild(estadoSelect);

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

  const allEstados = ['todos', ...ESTADOS_ORDER];
  allEstados.forEach(est => {
    const isActive = (est === 'todos' && filtroActual === null) || filtroActual === est;
    const btn = document.createElement('button');
    btn.className = 'filtro-pill' + (isActive ? ' active' : '');
    btn.textContent = ESTADOS[est]?.label || est;
    btn.addEventListener('click', () => {
      filtroActual = est === 'todos' ? null : est;
      renderBiblioteca();
    });
    container.appendChild(btn);
  });
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
    searchInput.addEventListener('input', () => renderBiblioteca());
  }
}

