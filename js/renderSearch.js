import { searchBooks } from './api.js';
import { getCurrentUser, addUserBook } from './store.js';
import { renderBiblioteca } from './renderHome.js';

function transformBook(item) {
  const info = item.volumeInfo || {};
  return {
    bookId: item.id,
    titulo: info.title || 'Sin título',
    autor: (info.authors || ['Desconocido']).join(', '),
    imagen: (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || '',
    sinopsis: info.description || 'Sin descripción disponible',
    paginas: info.pageCount || null,
    genero: (info.categories || ['General'])[0],
    ratingAPI: info.averageRating || 0,
    estado: 'pendiente',
    rating: 0,
  };
}

function createBookCard(libro, user) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const img = document.createElement('img');
  img.src = libro.imagen;
  img.alt = libro.titulo;
  img.loading = 'lazy';
  img.onerror = () => { img.style.display = 'none'; };

  const title = document.createElement('strong');
  title.textContent = libro.titulo;
  const author = document.createElement('span');
  author.className = 'card-meta';
  author.textContent = libro.autor;

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = '+ Añadir';
  addBtn.addEventListener('click', () => {
    const ok = addUserBook(user.id, libro);
    if (ok) {
      addBtn.textContent = '✓ Añadido';
      addBtn.disabled = true;
      renderBiblioteca();
    } else {
      addBtn.textContent = 'Ya está';
      addBtn.disabled = true;
    }
  });

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(author);
  card.appendChild(addBtn);
  return card;
}

function createShowMoreBtn(libros, user, contenedor) {
  const card = document.createElement('div');
  card.className = 'result-card show-more';

  const btn = document.createElement('button');
  btn.className = 'show-more-btn';
  btn.textContent = `+ Ver más (${libros.length - 7})`;

  btn.addEventListener('click', () => {
    card.remove();
    libros.slice(7).forEach(libro => {
      contenedor.appendChild(createBookCard(libro, user));
    });
  });

  card.appendChild(btn);
  return card;
}

export function search() {
  const input = document.getElementById('searchInput');
  const headerSearch = input.closest('.header-search');

  let floatingBar = null;
  let overlay = null;
  let closing = false;
  let headerRect = null;

  function closeOverlay() {
    if (!overlay || closing) return;
    closing = true;

    const barR = floatingBar.getBoundingClientRect();

    floatingBar.style.transition = 'none';
    floatingBar.style.left = barR.left + 'px';
    floatingBar.style.top = barR.top + 'px';
    floatingBar.style.width = barR.width + 'px';
    floatingBar.style.height = barR.height + 'px';
    floatingBar.style.transform = 'none';

    void floatingBar.offsetHeight;

    floatingBar.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    floatingBar.style.left = headerRect.left + 'px';
    floatingBar.style.top = headerRect.top + 'px';
    floatingBar.style.width = headerRect.width + 'px';
    floatingBar.style.height = headerRect.height + 'px';

    headerSearch.style.visibility = '';

    overlay.style.opacity = '0';

    setTimeout(() => {
      floatingBar.remove();
      overlay.remove();
      floatingBar = null;
      overlay = null;
      closing = false;
      document.body.style.overflow = '';
    }, 400);
  }

  function openSearchOverlay() {
    if (overlay || closing) return;

    headerRect = headerSearch.getBoundingClientRect();

    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0);z-index:100;transition:background 0.35s ease;';
    document.body.appendChild(overlay);

    document.body.style.overflow = 'hidden';
    headerSearch.style.visibility = 'hidden';

    floatingBar = headerSearch.cloneNode(true);
    const shortcutSpan = floatingBar.querySelector('.search-shortcut');
    if (shortcutSpan) shortcutSpan.remove();
    const cloneInput = floatingBar.querySelector('input');
    cloneInput.value = '';
    cloneInput.placeholder = input.placeholder;
    cloneInput.style.paddingRight = '16px';

    floatingBar.style.cssText = `
      position: fixed;
      left: ${headerRect.left}px;
      top: ${headerRect.top}px;
      width: ${headerRect.width}px;
      height: ${headerRect.height}px;
      transform: none;
      padding: 0;
      margin: 0;
      background: none;
      border: none;
      z-index: 101;
    `;
    floatingBar.querySelector('input').style.margin = '0';
    document.body.appendChild(floatingBar);

    cloneInput.focus();

    void floatingBar.offsetHeight;

    floatingBar.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    overlay.style.transition = 'background 0.35s ease';

    overlay.style.background = 'rgba(0,0,0,0.85)';
    floatingBar.style.left = '50%';
    floatingBar.style.top = '18vh';
    floatingBar.style.width = '500px';
    floatingBar.style.maxWidth = '80vw';
    floatingBar.style.height = '';
    floatingBar.style.transform = 'translateX(-50%)';
    floatingBar.style.padding = '0';

    const resultsGrid = document.createElement('div');
    resultsGrid.style.cssText = `
      position: fixed;
      top: 26vh;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      max-width: 85vw;
      max-height: 60vh;
      overflow-y: auto;
      opacity: 0;
      transition: opacity 0.3s 0.35s ease;
      z-index: 101;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
      padding-bottom: 40px;
    `;
    overlay.appendChild(resultsGrid);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position: fixed; top: 20px; right: 24px;
      background: none; border: none; color: #666;
      font-size: 1.6rem; cursor: pointer; z-index: 102;
      transition: color 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = '#fff');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = '#666');
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeOverlay(); });
    overlay.appendChild(closeBtn);

    setTimeout(() => { resultsGrid.style.opacity = '1'; }, 50);

    cloneInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && cloneInput.value.trim()) {
        cloneInput.disabled = true;
        resultsGrid.innerHTML = '<p class="search-loading" style="grid-column:1/-1;text-align:center;color:#555;font-family:Roboto Mono,monospace;font-size:0.9rem;padding:30px 0">Buscando...</p>';

        try {
          const data = await searchBooks(cloneInput.value);
          const items = data.items || [];
          const libros = items.map(transformBook);
          resultsGrid.innerHTML = '';

          const user = getCurrentUser();
          if (!user) { cloneInput.disabled = false; return; }

          if (libros.length === 0) {
            resultsGrid.innerHTML = '<p class="search-loading" style="grid-column:1/-1;text-align:center;color:#555;font-family:Roboto Mono,monospace;font-size:0.9rem;padding:30px 0">Sin resultados. Prueba otra búsqueda.</p>';
            cloneInput.disabled = false;
            return;
          }

          const mostrar = libros.slice(0, 7);
          mostrar.forEach(libro => {
            resultsGrid.appendChild(createBookCard(libro, user));
          });

          if (libros.length > 7) {
            resultsGrid.appendChild(createShowMoreBtn(libros, user, resultsGrid));
          }
        } catch (err) {
          resultsGrid.innerHTML = `<p class="search-loading" style="grid-column:1/-1;text-align:center;color:#e57373;font-family:Roboto Mono,monospace;font-size:0.9rem;padding:30px 0">${err.message}</p>`;
        }

        cloneInput.disabled = false;
        cloneInput.focus();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  input.addEventListener('focus', openSearchOverlay);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay) return;
      input.focus({ preventScroll: true });
    }
  });
}