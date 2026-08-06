import { getCurrentUser, getUserBooks, getUserLists, createList, deleteList, updateList, addBookToList, removeBookFromList, getListBooks } from './store.js';
import { renderBiblioteca } from './renderHome.js';

let currentView = 'books';

export function initLists() {
  const container = document.getElementById('viewToggleContainer');
  if (!container) return;

  container.innerHTML = '';

  const toggle = document.createElement('div');
  toggle.className = 'view-toggle';

  const pill = document.createElement('div');
  pill.className = 'view-toggle-pill';
  toggle.appendChild(pill);

  const booksBtn = document.createElement('button');
  booksBtn.className = 'view-toggle-btn active';
  booksBtn.textContent = 'Libros';
  booksBtn.addEventListener('click', () => switchView('books', pill));

  const listsBtn = document.createElement('button');
  listsBtn.className = 'view-toggle-btn';
  listsBtn.textContent = 'Listas';
  listsBtn.addEventListener('click', () => switchView('lists', pill));

  toggle.appendChild(booksBtn);
  toggle.appendChild(listsBtn);

  let hideTimeout;
  toggle.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    toggle.classList.add('stay-visible');
  });
  toggle.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
      toggle.classList.remove('stay-visible');
    }, 1000);
  });

  container.appendChild(toggle);

  const addListBtn = document.createElement('button');
  addListBtn.className = 'add-list-btn';
  addListBtn.id = 'addListBtn';
  addListBtn.textContent = '+';
  addListBtn.title = 'Nueva lista';
  addListBtn.addEventListener('click', openCreateListModal);
  container.appendChild(addListBtn);
}

export function resetToBooksView() {
  if (currentView === 'books') return;
  currentView = 'books';
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === 'Libros');
  });
  const pill = document.querySelector('.view-toggle-pill');
  if (pill) pill.classList.remove('right');
  const addListBtn = document.getElementById('addListBtn');
  if (addListBtn) addListBtn.classList.remove('visible');
}

function switchView(view, pill) {
  currentView = view;
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === (view === 'books' ? 'libros' : 'listas'));
  });

  pill.classList.toggle('right', view === 'lists');

  const addListBtn = document.getElementById('addListBtn');
  if (addListBtn) {
    addListBtn.classList.toggle('visible', view === 'lists');
  }

  if (view === 'books') {
    renderBiblioteca();
  } else {
    renderListsView();
  }
}

function renderListsView() {
  const user = getCurrentUser();
  if (!user) return;

  const container = document.querySelector('.mis-libros');
  container.innerHTML = '';

  const lists = getUserLists(user.id);

  if (lists.length === 0) {
    container.innerHTML = '<p class="empty-msg">No tienes listas creadas. Crea una para organizar tus libros.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'lists-grid';

  lists.forEach(list => {
    const card = document.createElement('div');
    card.className = 'list-card';

    const books = getListBooks(list.id);
    const coverGrid = document.createElement('div');
    coverGrid.className = 'list-covers';

    const coversToShow = books.slice(0, 2);
    coversToShow.forEach(book => {
      const img = document.createElement('img');
      img.src = book.imagen || 'assets/images/default.jpg';
      img.alt = book.titulo;
      img.loading = 'lazy';
      coverGrid.appendChild(img);
    });

    for (let i = coversToShow.length; i < 2; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'list-cover-placeholder';
      coverGrid.appendChild(placeholder);
    }

    const info = document.createElement('div');
    info.className = 'list-info';

    const name = document.createElement('h3');
    name.className = 'list-name';
    name.textContent = list.name;

    const count = document.createElement('span');
    count.className = 'list-count';
    count.textContent = `${books.length} libro${books.length !== 1 ? 's' : ''}`;

    info.appendChild(name);
    info.appendChild(count);

    const actions = document.createElement('div');
    actions.className = 'list-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'list-action-btn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditListModal(list);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'list-action-btn danger';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`¿Eliminar la lista "${list.name}"?`)) {
        deleteList(list.id);
        renderListsView();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(coverGrid);
    card.appendChild(info);
    card.appendChild(actions);

    card.addEventListener('click', () => openListDetail(list));

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function openCreateListModal() {
  const user = getCurrentUser();
  if (!user) return;

  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'login-modal';
  overlay.appendChild(modal);

  const title = document.createElement('h2');
  title.className = 'login-title';
  title.textContent = 'Crear lista';
  modal.appendChild(title);

  const nameLabel = document.createElement('p');
  nameLabel.className = 'settings-label';
  nameLabel.textContent = 'Nombre *';
  modal.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.className = 'login-input';
  nameInput.type = 'text';
  nameInput.placeholder = 'Mi lista de favoritos';
  nameInput.style.width = '100%';
  modal.appendChild(nameInput);

  const thumbLabel = document.createElement('p');
  thumbLabel.className = 'settings-label';
  thumbLabel.textContent = 'Miniatura (emoji o URL)';
  modal.appendChild(thumbLabel);

  const thumbInput = document.createElement('input');
  thumbInput.className = 'login-input';
  thumbInput.type = 'text';
  thumbInput.placeholder = '📚';
  thumbInput.style.width = '100%';
  modal.appendChild(thumbInput);

  const preview = document.createElement('div');
  preview.style.marginTop = '8px';
  modal.appendChild(preview);

  const previewContent = document.createElement('span');
  previewContent.style.fontSize = '2rem';
  preview.appendChild(previewContent);

  const previewImg = document.createElement('img');
  previewImg.style.cssText = 'max-width:48px;border-radius:6px;display:none;';
  preview.appendChild(previewImg);

  thumbInput.addEventListener('input', () => {
    const val = thumbInput.value.trim();
    if (!val) {
      previewContent.style.display = 'none';
      previewImg.style.display = 'none';
    } else if (val.match(/^https?:\/\//)) {
      previewContent.style.display = 'none';
      previewImg.src = val;
      previewImg.style.display = 'block';
    } else {
      previewImg.style.display = 'none';
      previewContent.textContent = val;
      previewContent.style.display = 'inline';
    }
  });

  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.gap = '10px';
  btnGroup.style.marginTop = '16px';
  modal.appendChild(btnGroup);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'login-create-btn';
  saveBtn.textContent = 'Crear';
  btnGroup.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'login-cancel-btn';
  cancelBtn.textContent = 'Cancelar';
  btnGroup.appendChild(cancelBtn);

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    createList(user.id, name, thumbInput.value.trim());
    overlay.remove();
    renderListsView();
  });

  cancelBtn.addEventListener('click', () => overlay.remove());
  nameInput.focus();
}

function openEditListModal(list) {
  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'login-modal';
  overlay.appendChild(modal);

  const title = document.createElement('h2');
  title.className = 'login-title';
  title.textContent = 'Editar lista';
  modal.appendChild(title);

  const nameLabel = document.createElement('p');
  nameLabel.className = 'settings-label';
  nameLabel.textContent = 'Nombre';
  modal.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.className = 'login-input';
  nameInput.type = 'text';
  nameInput.value = list.name;
  nameInput.style.width = '100%';
  modal.appendChild(nameInput);

  const thumbLabel = document.createElement('p');
  thumbLabel.className = 'settings-label';
  thumbLabel.textContent = 'Miniatura (emoji o URL)';
  modal.appendChild(thumbLabel);

  const thumbInput = document.createElement('input');
  thumbInput.className = 'login-input';
  thumbInput.type = 'text';
  thumbInput.value = list.thumbnail || '';
  thumbInput.style.width = '100%';
  modal.appendChild(thumbInput);

  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.gap = '10px';
  btnGroup.style.marginTop = '16px';
  modal.appendChild(btnGroup);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'login-create-btn';
  saveBtn.textContent = 'Guardar';
  btnGroup.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'login-cancel-btn';
  cancelBtn.textContent = 'Cancelar';
  btnGroup.appendChild(cancelBtn);

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    updateList(list.id, { name, thumbnail: thumbInput.value.trim() });
    overlay.remove();
    renderListsView();
  });

  cancelBtn.addEventListener('click', () => overlay.remove());
  nameInput.focus();
}

function openListDetail(list) {
  const user = getCurrentUser();
  if (!user) return;

  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'login-modal list-detail-modal';
  overlay.appendChild(modal);

  const header = document.createElement('div');
  header.className = 'list-detail-header';

  const listName = document.createElement('h2');
  listName.className = 'login-title';
  listName.textContent = list.name;
  header.appendChild(listName);

  const addBookBtn = document.createElement('button');
  addBookBtn.className = 'login-create-btn';
  addBookBtn.textContent = '+ Añadir libro';
  addBookBtn.addEventListener('click', () => {
    overlay.remove();
    openAddBookToListModal(list);
  });
  header.appendChild(addBookBtn);

  modal.appendChild(header);

  const books = getListBooks(list.id);

  if (books.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'settings-label';
    empty.textContent = 'Esta lista está vacía. Añade libros con el botón de arriba.';
    empty.style.textAlign = 'center';
    empty.style.padding = '20px';
    modal.appendChild(empty);
  } else {
    const bookList = document.createElement('div');
    bookList.className = 'list-detail-books';

    books.forEach(book => {
      const row = document.createElement('div');
      row.className = 'list-book-row';

      const img = document.createElement('img');
      img.src = book.imagen || 'assets/images/default.jpg';
      img.alt = book.titulo;
      img.loading = 'lazy';
      img.addEventListener('click', () => {
        overlay.remove();
        import('./renderDetail.js').then(mod => mod.openDetail(book, img));
      });

      const info = document.createElement('div');
      info.className = 'list-book-info';

      const bookTitle = document.createElement('span');
      bookTitle.className = 'list-book-title';
      bookTitle.textContent = book.titulo;

      const bookAuthor = document.createElement('span');
      bookAuthor.className = 'list-book-author';
      bookAuthor.textContent = book.autor;

      info.appendChild(bookTitle);
      info.appendChild(bookAuthor);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'list-action-btn danger';
      removeBtn.textContent = 'Quitar';
      removeBtn.addEventListener('click', () => {
        removeBookFromList(list.id, book.id);
        overlay.remove();
        openListDetail(list);
      });

      row.appendChild(img);
      row.appendChild(info);
      row.appendChild(removeBtn);
      bookList.appendChild(row);
    });

    modal.appendChild(bookList);
  }
}

function openAddBookToListModal(list) {
  const user = getCurrentUser();
  if (!user) return;

  const allBooks = getUserBooks(user.id);
  const listBooks = getListBooks(list.id);
  let availableBooks = allBooks.filter(b => !listBooks.some(lb => lb.id === b.id));

  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'login-modal list-detail-modal';
  overlay.appendChild(modal);

  const title = document.createElement('h2');
  title.className = 'login-title';
  title.textContent = `Añadir a "${list.name}"`;
  modal.appendChild(title);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'library-search';
  searchInput.placeholder = 'Buscar libro...';
  searchInput.style.width = '100%';
  searchInput.style.marginBottom = '12px';
  modal.appendChild(searchInput);

  const bookList = document.createElement('div');
  bookList.className = 'list-detail-books';
  modal.appendChild(bookList);

  function renderBookList(filter = '') {
    bookList.innerHTML = '';
    const filtered = availableBooks.filter(b =>
      b.titulo.toLowerCase().includes(filter.toLowerCase()) ||
      b.autor.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'settings-label';
      empty.textContent = filter ? 'No se encontraron libros.' : 'No hay más libros disponibles para añadir.';
      empty.style.textAlign = 'center';
      empty.style.padding = '20px';
      bookList.appendChild(empty);
      return;
    }

    filtered.forEach(book => {
      const row = document.createElement('div');
      row.className = 'list-book-row';

      const img = document.createElement('img');
      img.src = book.imagen || 'assets/images/default.jpg';
      img.alt = book.titulo;
      img.loading = 'lazy';

      const info = document.createElement('div');
      info.className = 'list-book-info';

      const bookTitle = document.createElement('span');
      bookTitle.className = 'list-book-title';
      bookTitle.textContent = book.titulo;

      const bookAuthor = document.createElement('span');
      bookAuthor.className = 'list-book-author';
      bookAuthor.textContent = book.autor;

      info.appendChild(bookTitle);
      info.appendChild(bookAuthor);

      const addBtn = document.createElement('button');
      addBtn.className = 'list-action-btn add';
      addBtn.textContent = 'Añadir';
      addBtn.addEventListener('click', () => {
        addBookToList(list.id, book.id);
        addBtn.textContent = 'Añadido';
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
      });

      row.appendChild(img);
      row.appendChild(info);
      row.appendChild(addBtn);
      bookList.appendChild(row);
    });
  }

  searchInput.addEventListener('input', () => renderBookList(searchInput.value));
  renderBookList();

  const closeBtn = document.createElement('button');
  closeBtn.className = 'login-cancel-btn';
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.marginTop = '16px';
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    openListDetail(list);
  });
  modal.appendChild(closeBtn);
}
