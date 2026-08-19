import { getCurrentUser, updateBookStatus, updateBookRating, updateBookInfo, getReadingStats, removeUserBook } from './store.js';
import { renderBiblioteca, renderEstrellas } from './renderHome.js';
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
  const delBtn = container.querySelector('.detail-delete-btn');

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
  if (delBtn) delBtn.style.display = 'none';
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

  const srcRect = sourceEl ? sourceEl.getBoundingClientRect() : null;

  if (sourceEl) {
    modal.style.position = 'fixed';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.width = '700px';
    modal.style.maxWidth = '90vw';
    modal.style.height = 'auto';
    modal.style.maxHeight = '90vh';
    modal.style.borderRadius = '16px';
    modal.style.transition = 'none';
    modal.style.opacity = '0';
    modal.style.transform = `translate(-50%, -50%) scale(${srcRect.width / 700})`;
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-close';
  closeBtn.textContent = '✕';
  modal.appendChild(closeBtn);

  let currentView = 'main';

  function renderContent() {
    modal.querySelector('.detail-body')?.remove();

    if (currentView === 'main') {
      renderMainView();
    } else {
      renderDetailsView();
    }
  }

  function renderMainView() {
    const body = document.createElement('div');
    body.className = 'detail-body detail-body-main';

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

    if (libro.estado === 'leido' || (libro.rating && libro.rating > 0)) {
      const ratingSection = document.createElement('div');
      ratingSection.className = 'detail-rating';

      const onRate = (nuevoRating) => {
        updateBookRating(libro.id, nuevoRating);
        libro.rating = nuevoRating;
        renderBiblioteca();
        renderCurrentlyReading();
        const updatedStars = renderEstrellas(libro, onRate);
        updatedStars.classList.add('detail-stars', 'interactive');
        ratingSection.innerHTML = '';
        ratingSection.appendChild(updatedStars);
        if (nuevoRating > 0) {
          ratingSection.appendChild(clearBtn);
        }
      };

      const stars = renderEstrellas(libro, onRate);
      if (stars) {
        stars.classList.add('detail-stars', 'interactive');
        ratingSection.appendChild(stars);
      }

      const clearBtn = document.createElement('button');
      clearBtn.className = 'rating-clear-btn';
      clearBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      clearBtn.title = 'Borrar rating';
      clearBtn.addEventListener('click', () => {
        updateBookRating(libro.id, 0);
        libro.rating = 0;
        renderBiblioteca();
        renderCurrentlyReading();
        ratingSection.innerHTML = '';
        const newStars = renderEstrellas(libro, onRate);
        if (newStars) {
          newStars.classList.add('detail-stars', 'interactive');
          ratingSection.appendChild(newStars);
        }
      });
      if (libro.rating > 0) {
        ratingSection.appendChild(clearBtn);
      }

      infoCol.appendChild(ratingSection);
    }

    const metas = document.createElement('div');
    metas.className = 'detail-metas';

    const pag = document.createElement('span');
    pag.textContent = (libro.paginas || '?') + ' pág.';
    metas.appendChild(pag);

    const gen = document.createElement('span');
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

    const startBtnContainer = document.createElement('div');
    startBtnContainer.className = 'detail-start-dropdown';

    const startBtn = document.createElement('button');
    startBtn.className = 'detail-start-btn';
    if (libro.estado === 'leyendo') {
      startBtn.textContent = 'Leyendo ▾';
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startBtnContainer.classList.toggle('open');
      });

      const menu = document.createElement('div');
      menu.className = 'estado-quick-menu';
      const otrosEstados = ESTADOS.filter(est => est !== 'leyendo');
      otrosEstados.forEach(est => {
        const item = document.createElement('button');
        item.className = 'estado-quick-item';
        item.textContent = ESTADOS_LABEL[est];
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          updateBookStatus(libro.id, est);
          libro.estado = est;
          renderBiblioteca();
          renderCurrentlyReading();
          renderContent();
        });
        menu.appendChild(item);
      });

      startBtnContainer.appendChild(startBtn);
      startBtnContainer.appendChild(menu);

      document.addEventListener('click', () => {
        startBtnContainer.classList.remove('open');
      });
    } else {
      startBtn.textContent = 'Empezar a leer';
      startBtn.addEventListener('click', () => {
        updateBookStatus(libro.id, 'leyendo');
        libro.estado = 'leyendo';
        renderBiblioteca();
        renderCurrentlyReading();
        renderContent();
      });
      startBtnContainer.appendChild(startBtn);
    }

    const actionsRow = document.createElement('div');
    actionsRow.className = 'detail-actions-row';

    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'detail-details-btn';
    detailsBtn.textContent = '+ Info';
    detailsBtn.addEventListener('click', () => {
      currentView = 'details';
      renderContent();
    });
    actionsRow.appendChild(startBtnContainer);
    actionsRow.appendChild(detailsBtn);
    infoCol.appendChild(actionsRow);

    body.appendChild(infoCol);
    modal.appendChild(body);
  }

  function renderDetailsView() {
    const body = document.createElement('div');
    body.className = 'detail-body detail-body-details';

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
    titulo.className = 'detail-title detail-editable';
    titulo.dataset.field = 'titulo';
    titulo.textContent = libro.titulo;
    infoCol.appendChild(titulo);

    if (libro.sinopsis && libro.sinopsis !== 'Sin descripción disponible') {
      const desc = document.createElement('p');
      desc.className = 'detail-desc detail-editable';
      desc.dataset.field = 'sinopsis';
      desc.textContent = libro.sinopsis;
      infoCol.appendChild(desc);
    }

    const actions = document.createElement('div');
    actions.className = 'detail-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'detail-edit-btn';
    editBtn.textContent = 'Editar';
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'detail-delete-btn';
    delBtn.textContent = 'Eliminar';
    delBtn.addEventListener('click', () => {
      if (confirm('¿Eliminar "' + libro.titulo + '" de tu biblioteca?')) {
        removeUserBook(libro.id);
        overlay.remove();
        renderBiblioteca();
        renderCurrentlyReading();
      }
    });
    actions.appendChild(delBtn);

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

    const backBtn = document.createElement('button');
    backBtn.className = 'detail-back-btn';
    backBtn.textContent = '← Volver';
    backBtn.addEventListener('click', () => {
      currentView = 'main';
      renderContent();
    });
    infoCol.appendChild(backBtn);

    body.appendChild(infoCol);
    modal.appendChild(body);
  }

  renderContent();

  function closeModal() {
    overlay.style.transition = 'opacity 0.25s ease';
    overlay.style.opacity = '0';

    if (sourceEl) {
      const srcRect = sourceEl.getBoundingClientRect();
      modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 1, 1)';
      modal.style.transform = `translate(-50%, -50%) scale(${srcRect.width / 700})`;
      modal.style.opacity = '0';
    }

    setTimeout(() => overlay.remove(), 300);
  }

  if (sourceEl) {
    void modal.offsetHeight;
    modal.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    modal.style.transform = 'translate(-50%, -50%) scale(1)';
    modal.style.opacity = '1';
  }

  overlay.style.transition = 'opacity 0.25s ease';
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
}
