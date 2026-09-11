import { login, renderUserAvatar } from './auth.js';
import { search } from './renderSearch.js';
import { initBiblioteca } from './renderHome.js';
import { renderCurrentlyReading } from './renderReading.js';
import { initAddManual } from './renderAddManual.js';
import { initLists } from './renderLists.js';
import { getCurrentUser } from './store.js';

login();

document.addEventListener('mousedown', (e) => {
  const tag = e.target.tagName;
  if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT' && !e.target.isContentEditable) {
    document.activeElement.blur();
  }
});

if (getCurrentUser()) {
  const user = getCurrentUser();
  renderUserAvatar();
  search();
  initBiblioteca();
  renderCurrentlyReading();
  initAddManual();
  initLists();
}

document.querySelector('.parent').classList.remove('loading');
