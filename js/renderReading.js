import { getCurrentUser, getUserBooks, getReadingStats, addReadingSession, updateBookStatus, startReading, finishReading } from './store.js';
import { renderBiblioteca } from './renderHome.js';

function logPagesModal(book) {
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
  title.textContent = 'Registrar lectura';
  modal.appendChild(title);

  const bookInfo = document.createElement('p');
  bookInfo.className = 'log-book-info';
  bookInfo.textContent = `${book.titulo} — ${book.autor}`;
  modal.appendChild(bookInfo);

  const stats = getReadingStats(book.id);
  const prevTotal = stats ? stats.totalPages : 0;

  const currentLabel = document.createElement('p');
  currentLabel.className = 'settings-label';
  currentLabel.textContent = 'Página actual:';
  modal.appendChild(currentLabel);

  const inputGroup = document.createElement('div');
  inputGroup.className = 'number-input-group';
  modal.appendChild(inputGroup);

  const minusBtn = document.createElement('button');
  minusBtn.className = 'number-spin-btn';
  minusBtn.type = 'button';
  minusBtn.textContent = '\u2212';
  inputGroup.appendChild(minusBtn);

  const input = document.createElement('input');
  input.className = 'login-input';
  input.type = 'number';
  input.min = 1;
  input.placeholder = String(prevTotal + 1);
  inputGroup.appendChild(input);

  const plusBtn = document.createElement('button');
  plusBtn.className = 'number-spin-btn';
  plusBtn.type = 'button';
  plusBtn.textContent = '+';
  inputGroup.appendChild(plusBtn);

  minusBtn.addEventListener('click', () => {
    const val = parseInt(input.value) || prevTotal;
    if (val > 1) input.value = val - 1;
  });

  plusBtn.addEventListener('click', () => {
    const val = parseInt(input.value) || prevTotal;
    input.value = val + 1;
  });

  const today = new Date().toISOString().split('T')[0];
  const dateLabel = document.createElement('p');
  dateLabel.className = 'settings-label';
  dateLabel.textContent = `Fecha: ${today}`;
  modal.appendChild(dateLabel);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'login-create-btn';
  saveBtn.textContent = 'Guardar';
  modal.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'login-cancel-btn';
  cancelBtn.textContent = 'Cancelar';
  modal.appendChild(cancelBtn);

  saveBtn.addEventListener('click', () => {
    const currentPage = parseInt(input.value);
    if (!currentPage || currentPage <= 0) return;
    const pagesRead = currentPage - prevTotal;
    if (pagesRead <= 0) return;
    addReadingSession(book.id, today, pagesRead);
    startReading(book.id);
    overlay.remove();
    renderCurrentlyReading();
  });

  cancelBtn.addEventListener('click', () => overlay.remove());

  input.focus();
}

function renderUpcomingList(books) {
  const container = document.getElementById('upcomingReading');
  if (!container) return;
  container.innerHTML = '';

  const upcoming = books
    .filter(b => b.estado === 'pendiente')
    .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
    .slice(0, 5);

  const title = document.createElement('h3');
  title.className = 'hero-upcoming-title';
  title.textContent = 'Elige tu próxima lectura';
  container.appendChild(title);

  if (upcoming.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'hero-upcoming-empty';
    empty.textContent = 'Sin próximas lecturas';
    container.appendChild(empty);
    return;
  }

  upcoming.forEach(book => {
    const item = document.createElement('div');
    item.className = 'hero-upcoming-item';
    item.addEventListener('click', () => {
      import('./renderDetail.js').then(mod => mod.openDetail(book, item));
    });

    const img = document.createElement('img');
    img.src = book.imagen;
    img.alt = book.titulo;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'hero-upcoming-info';

    const t = document.createElement('span');
    t.className = 'upcoming-title';
    t.textContent = book.titulo;

    const a = document.createElement('span');
    a.className = 'upcoming-author';
    a.textContent = book.autor;

    info.appendChild(t);
    info.appendChild(a);
    item.appendChild(img);
    item.appendChild(info);
    container.appendChild(item);
  });
}

let readingIndex = 0;

export function renderCurrentlyReading() {
  const container = document.getElementById('currentlyReading');
  if (!container) return;
  container.innerHTML = '';

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const user = getCurrentUser();
  if (!user) return;

  const books = getUserBooks(user.id);
  const readingList = books.filter(b => b.estado === 'leyendo');

  if (readingList.length === 0) {
    hero.classList.remove('reading-active');
    container.innerHTML = '';
    renderUpcomingList(books);
    return;
  }

  hero.classList.add('reading-active');

  if (readingIndex >= readingList.length) readingIndex = 0;
  const reading = readingList[readingIndex];

  const stats = getReadingStats(reading.id);
  const total = reading.paginas || 0;
  const leidas = stats ? stats.totalPages : 0;
  const progress = total > 0 ? Math.min(100, Math.round((leidas / total) * 100)) : 0;

  const card = document.createElement('div');
  card.className = 'reading-card';

  const top = document.createElement('div');
  top.className = 'reading-card-top';

  const img = document.createElement('img');
  img.src = reading.imagen;
  img.alt = reading.titulo;
  img.loading = 'lazy';
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => {
    import('./renderDetail.js').then(mod => mod.openDetail(reading, img));
  });

  const info = document.createElement('div');
  info.className = 'reading-info';

  const titulo = document.createElement('strong');
  titulo.textContent = reading.titulo;

  const autor = document.createElement('span');
  autor.className = 'reading-author';
  autor.textContent = reading.autor;

  const barWrapper = document.createElement('div');
  barWrapper.className = 'progress-bar-container';

  const barRow = document.createElement('div');
  barRow.className = 'progress-bar-row';

  const pctText = document.createElement('span');
  pctText.className = 'progress-pct';
  pctText.textContent = progress + '%';

  const barContainer = document.createElement('div');
  barContainer.className = 'progress-bar';

  const bar = document.createElement('div');
  bar.className = 'progress-fill';
  bar.style.width = progress + '%';

  barContainer.appendChild(bar);
  barRow.appendChild(barContainer);
  barRow.appendChild(pctText);
  barWrapper.appendChild(barRow);

  const daysContainer = document.createElement('div');
  daysContainer.className = 'reading-days';

  const pagesText = document.createElement('span');
  pagesText.className = 'progress-pages';
  pagesText.textContent = `${leidas} / ${total} páginas`;

  if (stats && stats.startDate) {
    const start = new Date(stats.startDate);
    const now = new Date();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

    const startP = document.createElement('span');
    startP.textContent = `Desde ${stats.startDate}`;

    const daysP = document.createElement('span');
    daysP.textContent = `${days} día${days !== 1 ? 's' : ''}`;

    daysContainer.appendChild(startP);
    daysContainer.appendChild(daysP);
  }

  daysContainer.appendChild(pagesText);

  const btnContainer = document.createElement('div');
  btnContainer.className = 'reading-btns';

  const logBtn = document.createElement('button');
  logBtn.className = 'reading-btn';
  logBtn.textContent = '+ Registrar páginas';
  logBtn.addEventListener('click', () => logPagesModal(reading));

  const finishBtn = document.createElement('button');
  finishBtn.className = 'reading-btn secondary';
  finishBtn.textContent = 'Marcar como leído';
  finishBtn.addEventListener('click', () => {
    finishReading(reading.id);
    updateBookStatus(reading.id, 'leido');
    renderCurrentlyReading();
    renderBiblioteca();
  });

  btnContainer.appendChild(logBtn);
  btnContainer.appendChild(finishBtn);

  info.appendChild(titulo);
  info.appendChild(autor);
  info.appendChild(btnContainer);
  info.appendChild(daysContainer);

  top.appendChild(img);
  top.appendChild(info);

  card.appendChild(top);
  card.appendChild(barWrapper);

  if (readingList.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'reading-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'reading-arrow';
    prevBtn.innerHTML = '◂';
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      readingIndex = readingIndex === 0 ? readingList.length - 1 : readingIndex - 1;
      renderCurrentlyReading();
    });

    const counter = document.createElement('span');
    counter.className = 'reading-counter';
    counter.textContent = `${readingIndex + 1}/${readingList.length}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'reading-arrow';
    nextBtn.innerHTML = '▸';
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      readingIndex = readingIndex === readingList.length - 1 ? 0 : readingIndex + 1;
      renderCurrentlyReading();
    });

    nav.appendChild(prevBtn);
    nav.appendChild(counter);
    nav.appendChild(nextBtn);
    card.appendChild(nav);
  }

  container.appendChild(card);

  renderUpcomingList(books);
}
