import { getCurrentUser, addUserBook } from './store.js';
import { renderBiblioteca } from './renderHome.js';

export function initAddManual() {
  const btn = document.getElementById('addManualBtn');
  if (!btn) return;
  btn.addEventListener('click', openAddManual);
}

export function openAddManual() {
  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'login-modal add-manual-modal';
  overlay.appendChild(modal);

  const title = document.createElement('h2');
  title.className = 'login-title';
  title.textContent = 'Añadir libro manualmente';
  modal.appendChild(title);

  const textFields = [
    { label: 'Título', field: 'titulo', type: 'text', required: true },
    { label: 'Autor', field: 'autor', type: 'text', required: true },
    { label: 'Portada (URL)', field: 'imagen', type: 'text', required: false },
    { label: 'Sinopsis', field: 'sinopsis', type: 'textarea', required: false },
    { label: 'Género', field: 'genero', type: 'text', required: false },
  ];

  const inputs = {};

  textFields.forEach(f => {
    const label = document.createElement('p');
    label.className = 'settings-label';
    label.textContent = f.label + (f.required ? ' *' : '');
    modal.appendChild(label);

    if (f.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.className = 'login-input';
      textarea.rows = 3;
      textarea.style.resize = 'vertical';
      textarea.style.width = '100%';
      modal.appendChild(textarea);
      inputs[f.field] = textarea;
    } else {
      const input = document.createElement('input');
      input.className = 'login-input';
      input.type = f.type;
      input.style.width = '100%';
      modal.appendChild(input);
      inputs[f.field] = input;
    }
  });

  const pagesLabel = document.createElement('p');
  pagesLabel.className = 'settings-label';
  pagesLabel.textContent = 'Páginas';
  modal.appendChild(pagesLabel);

  const inputGroup = document.createElement('div');
  inputGroup.className = 'number-input-group';
  modal.appendChild(inputGroup);

  const minusBtn = document.createElement('button');
  minusBtn.className = 'number-spin-btn';
  minusBtn.type = 'button';
  minusBtn.textContent = '\u2212';
  inputGroup.appendChild(minusBtn);

  const pagesInput = document.createElement('input');
  pagesInput.className = 'login-input';
  pagesInput.type = 'number';
  pagesInput.min = 1;
  pagesInput.placeholder = '0';
  inputGroup.appendChild(pagesInput);
  inputs.paginas = pagesInput;

  const plusBtn = document.createElement('button');
  plusBtn.className = 'number-spin-btn';
  plusBtn.type = 'button';
  plusBtn.textContent = '+';
  inputGroup.appendChild(plusBtn);

  minusBtn.addEventListener('click', () => {
    const val = parseInt(pagesInput.value) || 0;
    if (val > 0) pagesInput.value = val - 1;
  });

  plusBtn.addEventListener('click', () => {
    const val = parseInt(pagesInput.value) || 0;
    pagesInput.value = val + 1;
  });

  const previewContainer = document.createElement('div');
  previewContainer.style.marginTop = '8px';
  previewContainer.style.display = 'none';
  modal.appendChild(previewContainer);

  const previewImg = document.createElement('img');
  previewImg.style.maxWidth = '120px';
  previewImg.style.borderRadius = '8px';
  previewImg.style.display = 'block';
  previewContainer.appendChild(previewImg);

  inputs.imagen.addEventListener('input', () => {
    const url = inputs.imagen.value.trim();
    if (url) {
      previewImg.src = url;
      previewContainer.style.display = 'block';
      previewImg.onerror = () => { previewContainer.style.display = 'none'; };
    } else {
      previewContainer.style.display = 'none';
    }
  });

  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.gap = '10px';
  btnGroup.style.marginTop = '16px';
  modal.appendChild(btnGroup);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'login-create-btn';
  saveBtn.textContent = 'Añadir';
  btnGroup.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'login-cancel-btn';
  cancelBtn.textContent = 'Cancelar';
  btnGroup.appendChild(cancelBtn);

  saveBtn.addEventListener('click', () => {
    const titulo = inputs.titulo.value.trim();
    const autor = inputs.autor.value.trim();
    if (!titulo || !autor) return;

    const user = getCurrentUser();
    if (!user) return;

    const book = {
      titulo,
      autor,
      imagen: inputs.imagen.value.trim() || '',
      sinopsis: inputs.sinopsis.value.trim() || '',
      paginas: parseInt(inputs.paginas.value) || null,
      genero: inputs.genero.value.trim() || '',
      ratingAPI: 0,
      estado: 'pendiente',
      rating: 0,
    };

    addUserBook(user.id, book);
    overlay.remove();
    renderBiblioteca();
  });

  cancelBtn.addEventListener('click', () => overlay.remove());

  inputs.titulo.focus();
}
