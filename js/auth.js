import { getCurrentUser, getUsers, setCurrentUser, saveUser } from "./store.js"
import { openCalendar } from './renderCalendar.js';

export function login() {
  if (getCurrentUser())
    return;

  const overlay = document.createElement("div");
  overlay.className = "login-overlay";
  document.body.appendChild(overlay);

  const modal = document.createElement("div");
  modal.className = "login-modal";
  overlay.appendChild(modal);

  const title = document.createElement("h2");
  title.className = "login-title";
  title.textContent = "Selecciona usuario";
  modal.appendChild(title);

  const lista = document.createElement("div");
  lista.className = "login-users";
  modal.appendChild(lista);

  getUsers().forEach((user) => {
    const btn = document.createElement("button");
    btn.className = "login-user-btn";
    btn.innerHTML = (user.emoji ? user.emoji + ' ' : '') + user.name;
    lista.appendChild(btn);

    btn.addEventListener("click", () => {
      setCurrentUser(user.id);
      overlay.remove();
      location.reload();
    });
  });

  const input = document.createElement("input");
  input.className = "login-input";
  input.placeholder = "Nombre de usuario";
  modal.appendChild(input);

  const createBtn = document.createElement("button");
  createBtn.className = "login-create-btn";
  createBtn.textContent = "Crear usuario";
  modal.appendChild(createBtn);

  createBtn.addEventListener("click", () => {
    if (!input.value.trim()) return;
    const newUser = saveUser(input.value.trim());
    overlay.remove();
    location.reload();
  });
}

const EMOJIS = ['📚', '📖', '🔥', '⭐', '🎯', '💡', '🎨', '🚀', '🌈', '🦊', '🐱', '🐶', '🦁', '🐉', '🌙', '☀️', '🎵', '🎮', '🏆', '💎'];

function showSettings(user) {
  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'login-modal';
  overlay.appendChild(modal);

  const title = document.createElement('h2');
  title.className = 'login-title';
  title.textContent = 'Ajustes de usuario';
  modal.appendChild(title);

  const preview = document.createElement('div');
  preview.className = 'settings-preview';
  preview.textContent = user.emoji || user.name.charAt(0).toUpperCase();
  modal.appendChild(preview);

  const nameLabel = document.createElement('p');
  nameLabel.className = 'settings-label';
  nameLabel.textContent = 'Nombre:';
  modal.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.className = 'login-input';
  nameInput.value = user.name;
  modal.appendChild(nameInput);

  const emojiLabel = document.createElement('p');
  emojiLabel.className = 'settings-label';
  emojiLabel.textContent = 'Elige un emoji:';
  modal.appendChild(emojiLabel);

  const emojiGrid = document.createElement('div');
  emojiGrid.className = 'emoji-grid';
  modal.appendChild(emojiGrid);

  let selectedEmoji = user.emoji || '';

  EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'emoji-option';
    btn.textContent = e;
    if (e === selectedEmoji) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      emojiGrid.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
      selectedEmoji = e;
      preview.textContent = e;
    });
    emojiGrid.appendChild(btn);
  });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'login-create-btn';
  saveBtn.textContent = 'Guardar';
  modal.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'login-cancel-btn';
  cancelBtn.textContent = 'Cancelar';
  modal.appendChild(cancelBtn);

  saveBtn.addEventListener('click', () => {
    if (!nameInput.value.trim()) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].name = nameInput.value.trim();
      users[idx].emoji = selectedEmoji;
      localStorage.setItem('bookmarks_users', JSON.stringify(users));
    }
    overlay.remove();
    location.reload();
  });

  cancelBtn.addEventListener('click', () => overlay.remove());
}

export function renderUserAvatar() {
  const user = getCurrentUser();
  if (!user) return;

  const header = document.querySelector('header');
  const container = document.createElement('div');
  container.className = 'user-menu';

  const avatar = document.createElement('div');
  avatar.className = 'user-avatar';
  avatar.textContent = user.emoji || user.name.charAt(0).toUpperCase();

  const dropdown = document.createElement('div');
  dropdown.className = 'user-dropdown';

  const switchBtn = document.createElement('div');
  switchBtn.className = 'dropdown-item';
  switchBtn.textContent = 'Cambiar de usuario';

  const calendarBtn = document.createElement('div');
  calendarBtn.className = 'dropdown-item';
  calendarBtn.textContent = 'Calendario';

  const settingsBtn = document.createElement('div');
  settingsBtn.className = 'dropdown-item';
  settingsBtn.textContent = 'Ajustes';

  const logoutBtn = document.createElement('div');
  logoutBtn.className = 'dropdown-item';
  logoutBtn.textContent = 'Cerrar sesión';

  avatar.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('visible');
  });

  switchBtn.addEventListener('click', () => {
    localStorage.removeItem('bookmarks_currentUser');
    location.reload();
  });

  calendarBtn.addEventListener('click', () => {
    dropdown.classList.remove('visible');
    openCalendar();
  });

  settingsBtn.addEventListener('click', () => {
    dropdown.classList.remove('visible');
    showSettings(user);
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('bookmarks_currentUser');
    location.reload();
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('visible');
  });

  dropdown.appendChild(switchBtn);
  dropdown.appendChild(calendarBtn);
  dropdown.appendChild(settingsBtn);
  dropdown.appendChild(logoutBtn);

  container.appendChild(avatar);
  container.appendChild(dropdown);
  header.appendChild(container);
}
