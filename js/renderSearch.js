import { searchBooks } from './api.js';
import { getCurrentUser, addUserBook } from './store.js';
import { renderBiblioteca } from './renderHome.js';

function transformBook(item) {
  const info = item.volumeInfo || {};
  return {
    bookId: item.id,
    titulo: info.title || 'Sin título',
    autor: (info.authors || ['Desconocido']).join(', '),
    imagen: (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || 'assets/images/favicon.png',
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
  const contenedor = document.querySelector('.resultados-busqueda');

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      contenedor.classList.add('visible');
      contenedor.innerHTML = '<p class="search-loading">Buscando...</p>';
      input.disabled = true;

      try {
        const data = await searchBooks(input.value);
        const items = data.items || [];
        const libros = items.map(transformBook);
        contenedor.innerHTML = '';

        const user = getCurrentUser();
        if (!user) { input.disabled = false; return; }

        if (libros.length === 0) {
          contenedor.innerHTML = '<p class="search-loading">Sin resultados. Prueba otra búsqueda.</p>';
          input.disabled = false;
          return;
        }

        const mostrar = libros.slice(0, 7);
        mostrar.forEach(libro => {
          contenedor.appendChild(createBookCard(libro, user));
        });

        if (libros.length > 7) {
          contenedor.appendChild(createShowMoreBtn(libros, user, contenedor));
        }
      } catch (err) {
        contenedor.innerHTML = `<p class="search-loading error">${err.message}</p>`;
      }

      input.disabled = false;
      input.focus();
    }
  });

  input.addEventListener('input', () => {
    if (!input.value.trim()) {
      contenedor.classList.remove('visible');
    }
  });
}