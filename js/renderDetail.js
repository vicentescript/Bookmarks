import { getCurrentUser, updateBookStatus, updateBookRating, updateBookInfo, getReadingStats, removeUserBook } from './store.js';
import { renderBiblioteca, renderEstrellas } from './renderHome.js';
import { renderCurrentlyReading } from './renderReading.js';

function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function renderMd(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    .replace(/\n/g, '<br>');
}

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
  modal.style.opacity = '0';
  overlay.appendChild(modal);

  const srcRect = sourceEl ? sourceEl.getBoundingClientRect() : null;
  let flyingClone = null;

  if (sourceEl) {
    modal.style.position = 'fixed';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.width = '850px';
    modal.style.maxWidth = '90vw';
    modal.style.height = 'auto';
    modal.style.maxHeight = '90vh';
    modal.style.borderRadius = '16px';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.pointerEvents = 'none';

    flyingClone = sourceEl.cloneNode(true);
    flyingClone.style.cssText = `
      position: fixed;
      left: ${srcRect.left}px;
      top: ${srcRect.top}px;
      width: ${srcRect.width}px;
      height: ${srcRect.height}px;
      border-radius: var(--radius);
      object-fit: cover;
      z-index: 200;
      pointer-events: none;
      transition: none;
      margin: 0;
    `;
    document.body.appendChild(flyingClone);
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-close';
  closeBtn.textContent = '✕';
  modal.appendChild(closeBtn);

  let currentView = 'main';
  let activeTab = 'info';

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

    const tabsHeader = document.createElement('div');
    tabsHeader.className = 'detail-tabs-header';

    const tabs = [
      { id: 'info', label: 'Info' },
      { id: 'sinopsis', label: 'Sinopsis' },
    ];

    const stats = getReadingStats(libro.id);
    const hasStats = stats && stats.sessions.length > 0;
    if (libro.estado === 'leyendo' || (libro.estado === 'leido' && hasStats)) {
      tabs.push({ id: 'progreso', label: libro.estado === 'leyendo' ? 'Progreso' : 'Lectura' });
    }

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'detail-tab-btn' + (activeTab === tab.id ? ' detail-tab-btn--active' : '');
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        activeTab = tab.id;
        renderContent();
      });
      tabsHeader.appendChild(btn);
    });

    infoCol.appendChild(tabsHeader);

    const tabContent = document.createElement('div');
    tabContent.className = 'detail-tab-content';

    if (activeTab === 'info') {
      renderInfoTab(tabContent);
    } else if (activeTab === 'sinopsis') {
      renderSinopsisTab(tabContent);
    } else if (activeTab === 'progreso') {
      renderProgresoTab(tabContent, stats);
    }

    infoCol.appendChild(tabContent);

    body.appendChild(infoCol);
    modal.appendChild(body);
  }

  function renderInfoTab(container) {
    container.innerHTML = '';

    const metas = document.createElement('div');
    metas.className = 'detail-metas';

    const pag = document.createElement('span');
    pag.textContent = (libro.paginas || '?') + ' pág.';
    metas.appendChild(pag);

    const gen = document.createElement('span');
    gen.textContent = libro.genero || 'General';
    metas.appendChild(gen);

    container.appendChild(metas);

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

      container.appendChild(ratingSection);
    }

    const startBtnContainer = document.createElement('div');
    startBtnContainer.className = 'detail-start-dropdown';

    const startBtn = document.createElement('button');
    startBtn.className = 'detail-start-btn';
    startBtn.textContent = `${ESTADOS_LABEL[libro.estado]} ▾`;
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startBtnContainer.classList.toggle('open');
    });

    const menu = document.createElement('div');
    menu.className = 'estado-quick-menu';
    ESTADOS.forEach(est => {
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

    const editInfoBtn = document.createElement('button');
    editInfoBtn.className = 'detail-edit-info-btn';
    editInfoBtn.textContent = 'Editar';
    editInfoBtn.addEventListener('click', () => {
      renderEditForm(container);
    });

    const actionsRow = document.createElement('div');
    actionsRow.className = 'detail-actions-row';
    actionsRow.appendChild(startBtnContainer);
    actionsRow.appendChild(editInfoBtn);

    container.appendChild(actionsRow);
  }

  function renderEditForm(container) {
    container.innerHTML = '';
    const tabsHeader = modal.querySelector('.detail-tabs-header');
    const titleEl = modal.querySelector('.detail-title');
    const authorEl = modal.querySelector('.detail-author');
    if (tabsHeader) tabsHeader.style.display = 'none';
    if (titleEl) titleEl.style.display = 'none';
    if (authorEl) authorEl.style.display = 'none';

    const form = document.createElement('div');
    form.className = 'detail-edit-form';

    const fields = [
      { key: 'titulo', label: 'Título', type: 'text', value: libro.titulo },
      { key: 'autor', label: 'Autor', type: 'text', value: libro.autor },
      { key: 'imagen', label: 'Portada (URL)', type: 'text', value: libro.imagen },
      { key: 'paginas', label: 'Páginas', type: 'number', value: libro.paginas || '' },
      { key: 'genero', label: 'Género', type: 'text', value: libro.genero || '' },
      { key: 'sinopsis', label: 'Sinopsis', type: 'textarea', value: libro.sinopsis === 'Sin descripción disponible' ? '' : (libro.sinopsis || '') },
    ];

    fields.forEach(f => {
      const label = document.createElement('label');
      label.className = 'detail-edit-label';
      label.textContent = f.label;

      let input;
      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'detail-edit-input detail-edit-textarea';
        input.value = f.value;
      } else {
        input = document.createElement('input');
        input.className = 'detail-edit-input';
        input.type = f.type;
        input.value = f.value;
      }
      input.dataset.field = f.key;

      form.appendChild(label);
      form.appendChild(input);
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'detail-edit-btns';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'detail-edit-save';
    saveBtn.textContent = 'Guardar';
    saveBtn.addEventListener('click', () => {
      const titulo = form.querySelector('[data-field="titulo"]');
      const autor = form.querySelector('[data-field="autor"]');
      const paginas = form.querySelector('[data-field="paginas"]');

      let valid = true;

      [titulo, autor].forEach(inp => {
        if (!inp.value.trim()) {
          inp.style.boxShadow = '0 0 0 2px var(--danger)';
          valid = false;
        } else {
          inp.style.boxShadow = '';
        }
      });

      if (!paginas.value.trim() || isNaN(parseInt(paginas.value)) || parseInt(paginas.value) <= 0) {
        paginas.style.boxShadow = '0 0 0 2px var(--danger)';
        valid = false;
      } else {
        paginas.style.boxShadow = '';
      }

      if (!valid) return;

      const data = {};
      form.querySelectorAll('.detail-edit-input').forEach(inp => {
        const field = inp.dataset.field;
        const val = inp.value.trim();
        if (field === 'paginas') data[field] = parseInt(val);
        else if (field === 'imagen') data[field] = val || libro.imagen;
        else if (field === 'sinopsis') data[field] = val || 'Sin descripción disponible';
        else data[field] = val;
      });
      updateBookInfo(libro.id, data);
      Object.assign(libro, data);
      renderBiblioteca();
      renderCurrentlyReading();
      if (tabsHeader) tabsHeader.style.display = '';
      if (titleEl) titleEl.style.display = '';
      if (authorEl) authorEl.style.display = '';
      renderContent();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'detail-edit-cancel';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => {
      if (tabsHeader) tabsHeader.style.display = '';
      if (titleEl) titleEl.style.display = '';
      if (authorEl) authorEl.style.display = '';
      renderInfoTab(container);
    });

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);

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
    btnRow.appendChild(delBtn);

    form.appendChild(btnRow);

    container.appendChild(form);
  }

  function renderSinopsisTab(container) {
    if (libro.sinopsis && libro.sinopsis !== 'Sin descripción disponible') {
      const desc = document.createElement('div');
      desc.className = 'detail-desc detail-editable';
      desc.dataset.field = 'sinopsis';
      desc.innerHTML = renderMd(libro.sinopsis);
      container.appendChild(desc);
    } else {
      const empty = document.createElement('p');
      empty.className = 'detail-desc';
      empty.textContent = 'Sin sinopsis disponible';
      empty.style.opacity = '0.4';
      container.appendChild(empty);
    }
  }

  function renderProgresoTab(container, stats) {
    if (!stats || stats.sessions.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'detail-desc';
      empty.textContent = 'Sin datos de lectura';
      empty.style.opacity = '0.4';
      container.appendChild(empty);
      return;
    }

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
      startP.textContent = `Inicio: ${fmtDate(stats.startDate)}`;
      statsDiv.appendChild(startP);
    }

    if (libro.estado === 'leyendo' && stats.totalPages > 0 && libro.paginas) {
      const progress = Math.min(100, Math.round((stats.totalPages / libro.paginas) * 100));
      const barContainer = document.createElement('div');
      barContainer.className = 'detail-progress';

      const bar = document.createElement('div');
      bar.className = 'detail-progress-fill';
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = progress + '%';
        });
      });

      const label = document.createElement('span');
      label.className = 'detail-progress-label';
      label.textContent = `${progress}%`;

      barContainer.appendChild(bar);
      barContainer.appendChild(label);
      statsDiv.appendChild(barContainer);
    }

    container.appendChild(statsDiv);

    const sessionList = document.createElement('div');
    sessionList.className = 'detail-sessions';

    const sortedSessions = [...stats.sessions].sort((a, b) => b.date.localeCompare(a.date));

    sortedSessions.forEach(s => {
      const row = document.createElement('div');
      row.className = 'detail-session-row';

      const date = document.createElement('span');
      date.className = 'detail-session-date';
      date.textContent = fmtDate(s.date);

      const pages = document.createElement('span');
      pages.className = 'detail-session-pages';
      pages.textContent = `+${s.pages} pág.`;

      row.appendChild(date);
      row.appendChild(pages);
      sessionList.appendChild(row);
    });

    container.appendChild(sessionList);
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
      const desc = document.createElement('div');
      desc.className = 'detail-desc detail-editable';
      desc.dataset.field = 'sinopsis';
      desc.innerHTML = renderMd(libro.sinopsis);
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
    if (flyingClone && srcRect) {
      flyingClone.style.transition = 'none';
      void flyingClone.offsetHeight;

      const coverEl = modal.querySelector('.detail-cover img');
      if (coverEl) coverEl.style.opacity = '0';

      modal.style.transition = 'opacity 0.3s ease';
      modal.style.opacity = '0';

      flyingClone.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      flyingClone.style.left = srcRect.left + 'px';
      flyingClone.style.top = srcRect.top + 'px';
      flyingClone.style.width = srcRect.width + 'px';
      flyingClone.style.height = srcRect.height + 'px';

      flyingClone.addEventListener('transitionend', function onClose() {
        flyingClone.removeEventListener('transitionend', onClose);
        flyingClone.remove();
        flyingClone = null;
      });

      setTimeout(() => {
        if (flyingClone) {
          flyingClone.remove();
          flyingClone = null;
        }
        overlay.remove();
      }, 550);
    } else {
      overlay.style.transition = 'opacity 0.25s ease';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
  }

  function animateCoverIn() {
    if (!flyingClone || !srcRect) {
      modal.style.opacity = '1';
      modal.style.pointerEvents = '';
      return;
    }

    const coverEl = modal.querySelector('.detail-cover img');
    if (!coverEl) {
      modal.style.opacity = '1';
      modal.style.pointerEvents = '';
      return;
    }

    const infoEls = modal.querySelectorAll('.detail-info > *');

    requestAnimationFrame(() => {
      const targetRect = coverEl.getBoundingClientRect();

      coverEl.style.opacity = '0';
      infoEls.forEach(el => { el.style.opacity = '0'; el.style.transition = 'none'; });

      modal.style.opacity = '1';
      modal.style.pointerEvents = '';

      flyingClone.style.transition = 'none';
      void flyingClone.offsetHeight;

      flyingClone.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      flyingClone.style.left = targetRect.left + 'px';
      flyingClone.style.top = targetRect.top + 'px';
      flyingClone.style.width = targetRect.width + 'px';
      flyingClone.style.height = targetRect.height + 'px';
      flyingClone.style.borderRadius = '6px';

      infoEls.forEach((el, i) => {
        setTimeout(() => {
          el.style.transition = 'opacity 0.4s ease';
          el.style.opacity = '1';
        }, 250 + i * 80);
      });

      flyingClone.addEventListener('transitionend', function handler() {
        flyingClone.removeEventListener('transitionend', handler);
        coverEl.style.transition = 'opacity 0.3s ease';
        coverEl.style.opacity = '1';
        infoEls.forEach(el => { el.style.transition = 'opacity 0.3s ease'; el.style.opacity = '1'; });
        setTimeout(() => {
          flyingClone.remove();
          flyingClone = null;
        }, 300);
      });
    });
  }

  overlay.style.transition = 'opacity 0.25s ease';
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    animateCoverIn();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
}
