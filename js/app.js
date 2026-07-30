import { login, renderUserAvatar } from './auth.js';
import { search } from './renderSearch.js';
import { initBiblioteca } from './renderHome.js';
import { renderCurrentlyReading } from './renderReading.js';
import { getCurrentUser } from './store.js';

login();

if (getCurrentUser()) {
  renderUserAvatar();
  search();
  initBiblioteca();
  renderCurrentlyReading();
}
