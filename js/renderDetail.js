import { getCurrentUser, updateBookStatus, updateBookRating, getReadingStats } from './store.js';
import { renderBiblioteca } from './renderHome.js';
import { renderCurrentlyReading } from './renderReading.js';

const ESTADOS = ['pendiente', 'leyendo', 'leido', 'abandonado', 'pausado'];
const ESTADOS_LABEL = {
  pendiente: '📚 Pendiente',
  leyendo: '📖 Leyendo',
  leido: '✅ Leído',
  abandonado: '❌ Abandonado',
  pausado: '⏸️ Pausado',
};

export function openDetail(libro) {
  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  overlay.appendChild(modal);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => overlay.remove());
  modal.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'detail-body';

  const coverCol = document.createElement('div');
  coverCol.className = 'detail-cover';

  const img = document.createElement('img');
  img.src = libro.imagen;
  img.alt = libro.titulo;
  coverCol.appendChild(img);

  body.appendChild(coverCol);

  const infoCol = document.createElement('div');
  infoCol.className = 'detail-info';

  const titulo = document.createElement('h2');
  titulo.className = 'detail-title';
  titulo.textContent = libro.titulo;
  infoCol.appendChild(titulo);

  const autor = document.createElement('p');
  autor.className = 'detail-author';
  autor.textContent = libro.autor;
  infoCol.appendChild(autor);

  if (libro.sinopsis && libro.sinopsis !== 'Sin descripción disponible') {
    const desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = libro.sinopsis;
    infoCol.appendChild(desc);
  }

  const metas = document.createElement('div');
  metas.className = 'detail-metas';

  const pag = document.createElement('span');
  pag.textContent = '📄 ' + (libro.paginas || '?') + ' pág.';
  metas.appendChild(pag);

  const gen = document.createElement('span');
  gen.textContent = '📖 ' + (libro.genero || 'General');
  metas.appendChild(gen);

  infoCol.appendChild(metas);

  const stats = getReadingStats(libro.id);
  if (stats && stats.sessions.length > 0) {
    const statsDiv = document.createElement('div');
    statsDiv.className = 'detail-stats';

    const total = document.createElement('p');
    total.textContent = `Total leído: ${stats.totalPages} pág.`;
    statsDiv.appendChild(total);

    const days = document.createElement('p');
    days.textContent = `Sesiones: ${stats.sessions.length} día${stats.sessions.length !== 1 ? 's' : ''}`;
    statsDiv.appendChild(days);

    if (stats.startDate) {
      const startP = document.createElement('p');
      startP.textContent = `Inicio: ${stats.startDate}`;
      statsDiv.appendChild(startP);
    }

    if (libro.estado === 'leyendo' && stats.totalPages > 0 && libro.paginas) {
      const progress = Math.min(100, Math.round((stats.totalPages / libro.paginas) * 100));
      const barContainer = document.createElement('div');
      barContainer.className = 'detail-progress';

      const bar = document.createElement('div');
      bar.className = 'detail-progress-fill';
      bar.style.width = progress + '%';

      const label = document.createElement('span');
      label.className = 'detail-progress-label';
      label.textContent = `${progress}%`;

      barContainer.appendChild(bar);
      barContainer.appendChild(label);
      statsDiv.appendChild(barContainer);
    }

    infoCol.appendChild(statsDiv);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const estadoLabel = document.createElement('span');
  estadoLabel.className = 'detail-estado-label';
  estadoLabel.textContent = 'Estado:';
  actions.appendChild(estadoLabel);

  const estadoSelect = document.createElement('select');
  estadoSelect.className = 'detail-estado-select';
  ESTADOS.forEach(est => {
    const opt = document.createElement('option');
    opt.value = est;
    opt.textContent = ESTADOS_LABEL[est];
    if (est === libro.estado) opt.selected = true;
    estadoSelect.appendChild(opt);
  });
  estadoSelect.addEventListener('change', () => {
    updateBookStatus(libro.id, estadoSelect.value);
    renderBiblioteca();
    renderCurrentlyReading();
  });
  actions.appendChild(estadoSelect);

  infoCol.appendChild(actions);

  const ratingSection = document.createElement('div');
  ratingSection.className = 'detail-rating';

  const stars = document.createElement('div');
  stars.className = 'estrellas detail-stars';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'estrella' + (i <= libro.rating ? ' activa' : '');
    star.textContent = '★';
    star.addEventListener('click', () => {
      const nuevoRating = i === libro.rating ? 0 : i;
      updateBookRating(libro.id, nuevoRating);
      renderBiblioteca();
      renderCurrentlyReading();
      const allStars = stars.querySelectorAll('.estrella');
      allStars.forEach((s, idx) => {
        s.classList.toggle('activa', idx < nuevoRating);
      });
    });
    stars.appendChild(star);
  }
  ratingSection.appendChild(stars);
  coverCol.appendChild(ratingSection);

  body.appendChild(infoCol);
  modal.appendChild(body);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
