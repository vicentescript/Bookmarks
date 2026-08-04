import { getCurrentUser, updateBookStatus, updateBookRating, updateBookInfo, getReadingStats } from './store.js';
import { renderBiblioteca } from './renderHome.js';
import { renderCurrentlyReading } from './renderReading.js';

const ESTADOS = ['pendiente', 'leyendo', 'leido', 'abandonado', 'pausado'];
const ESTADOS_LABEL = {
  pendiente: 'Pendiente',
  leyendo: 'Leyendo',
  leido: 'Leído',
  abandonado: 'Abandonado',
  pausado: 'Pausado',
};

function enterEditMode(container, libro, refreshFn) {
  const inputs = container.querySelectorAll('.detail-editable');
  const saveBtn = container.querySelector('.detail-edit-save');
  const cancelBtn = container.querySelector('.detail-edit-cancel');
  const editBtn = container.querySelector('.detail-edit-btn');

  inputs.forEach(el => {
    const field = el.dataset.field;
    const current = libro[field] ?? '';

    if (field === 'imagen') {
      const input = Object.assign(document.createElement('input'), {
        className: 'detail-edit-input',
        value: current,
        type: 'text',
        placeholder: 'URL de la portada...',
      });
      const preview = document.createElement('img');
      preview.className = 'imagen-preview';
      preview.src = current;
      preview.alt = 'Preview';
      el.style.display = 'none';
      el.parentNode.insertBefore(input, el.nextSibling);
      input.parentNode.insertBefore(preview, input.nextSibling);
      input.addEventListener('input', () => { preview.src = input.value; });
    } else {
      const isLong = field === 'sinopsis';
      const input = isLong
        ? Object.assign(document.createElement('textarea'), { className: 'detail-edit-input detail-edit-textarea', value: current })
        : Object.assign(document.createElement('input'), { className: 'detail-edit-input', value: current, type: 'text' });
      el.style.display = 'none';
      el.parentNode.insertBefore(input, el.nextSibling);
    }
  });

  editBtn.style.display = 'none';
  saveBtn.style.display = '';
  cancelBtn.style.display = '';

  saveBtn.onclick = () => {
    const data = {};
    container.querySelectorAll('.detail-edit-input').forEach(inp => {
      const field = inp.previousElementSibling.dataset.field;
      const val = inp.value.trim();
      if (field === 'paginas') data[field] = val ? parseInt(val) : null;
      else if (field === 'imagen') data[field] = val || libro.imagen;
      else if (field === 'sinopsis') data[field] = val || 'Sin descripción disponible';
      else data[field] = val || 'Desconocido';
    });
    updateBookInfo(libro.id, data);
    Object.assign(libro, data);
    renderBiblioteca();
    renderCurrentlyReading();
    refreshFn();
  };

  cancelBtn.onclick = refreshFn;
}

export function openDetail(libro, sourceEl) {
  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.style.opacity = '0';
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  overlay.appendChild(modal);

  if (sourceEl) {
    const srcRect = sourceEl.getBoundingClientRect();
    modal.style.position = 'fixed';
    modal.style.left = srcRect.left + 'px';
    modal.style.top = srcRect.top + 'px';
    modal.style.width = srcRect.width + 'px';
    modal.style.height = srcRect.height + 'px';
    modal.style.borderRadius = '8px';
    modal.style.transition = 'none';
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-close';
  closeBtn.textContent = '✕';
  modal.appendChild(closeBtn);

  function renderContent() {
    modal.querySelector('.detail-body')?.remove();

    const body = document.createElement('div');
    body.className = 'detail-body';

    const coverCol = document.createElement('div');
    coverCol.className = 'detail-cover';

    const img = document.createElement('img');
    img.src = libro.imagen;
    img.alt = libro.titulo;
    img.className = 'detail-editable';
    img.dataset.field = 'imagen';
    coverCol.appendChild(img);

    body.appendChild(coverCol);

    const infoCol = document.createElement('div');
    infoCol.className = 'detail-info';

    const titulo = document.createElement('h2');
    titulo.className = 'detail-title detail-editable';
    titulo.dataset.field = 'titulo';
    titulo.textContent = libro.titulo;
    infoCol.appendChild(titulo);

    const autor = document.createElement('p');
    autor.className = 'detail-author detail-editable';
    autor.dataset.field = 'autor';
    autor.textContent = libro.autor;
    infoCol.appendChild(autor);

    if (libro.sinopsis && libro.sinopsis !== 'Sin descripción disponible') {
      const desc = document.createElement('p');
      desc.className = 'detail-desc detail-editable';
      desc.dataset.field = 'sinopsis';
      desc.textContent = libro.sinopsis;
      infoCol.appendChild(desc);
    }

    const metas = document.createElement('div');
    metas.className = 'detail-metas';

    const pag = document.createElement('span');
    pag.className = 'detail-editable';
    pag.dataset.field = 'paginas';
    pag.textContent = (libro.paginas || '?') + ' pág.';
    metas.appendChild(pag);

    const gen = document.createElement('span');
    gen.className = 'detail-editable';
    gen.dataset.field = 'genero';
    gen.textContent = libro.genero || 'General';
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

    const editBtn = document.createElement('button');
    editBtn.className = 'detail-edit-btn';
    editBtn.textContent = 'Editar';
    actions.appendChild(editBtn);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'detail-edit-save';
    saveBtn.textContent = 'Guardar';
    saveBtn.style.display = 'none';
    actions.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'detail-edit-cancel';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.display = 'none';
    actions.appendChild(cancelBtn);

    infoCol.appendChild(actions);

    editBtn.addEventListener('click', () => enterEditMode(body, libro, renderContent));

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
  }

  renderContent();

  function closeModal() {
    if (sourceEl) {
      const srcRect = sourceEl.getBoundingClientRect();
      modal.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
      modal.style.left = srcRect.left + 'px';
      modal.style.top = srcRect.top + 'px';
      modal.style.width = srcRect.width + 'px';
      modal.style.height = srcRect.height + 'px';
      modal.style.borderRadius = '8px';
    }
    overlay.style.transition = 'opacity 0.35s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 360);
  }

  if (sourceEl) {
    void modal.offsetHeight;
    modal.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.width = '700px';
    modal.style.maxWidth = '90vw';
    modal.style.height = 'auto';
    modal.style.maxHeight = '90vh';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.borderRadius = '16px';
  }

  overlay.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
}
