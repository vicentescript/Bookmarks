import { getCurrentUser, getSessionsByMonth, getUserBooks } from './store.js';

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function firstWeekday(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

let currentYear;
let currentMonth;

function renderCalendarContent(container) {
  const user = getCurrentUser();
  if (!user) return;

  container.innerHTML = '';

  const sessions = getSessionsByMonth(user.id, currentYear, currentMonth);
  const days = daysInMonth(currentYear, currentMonth);
  const startDay = firstWeekday(currentYear, currentMonth);

  const header = document.createElement('div');
  header.className = 'cal-header';

  const prev = document.createElement('button');
  prev.className = 'cal-nav';
  prev.textContent = '‹';
  prev.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 1) { currentMonth = 12; currentYear--; }
    renderCalendarContent(container);
  });

  const title = document.createElement('span');
  title.className = 'cal-title';
  title.textContent = `${MONTHS[currentMonth - 1]} ${currentYear}`;

  const next = document.createElement('button');
  next.className = 'cal-nav';
  next.textContent = '›';
  next.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    renderCalendarContent(container);
  });

  header.appendChild(prev);
  header.appendChild(title);
  header.appendChild(next);

  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  WEEKDAYS.forEach(d => {
    const dh = document.createElement('div');
    dh.className = 'cal-day-header';
    dh.textContent = d;
    grid.appendChild(dh);
  });

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= days; d++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const daySessions = sessions.filter(s => s.date === dateStr);

    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day' + (daySessions.length > 0 ? ' has-reading' : '');

    const num = document.createElement('span');
    num.className = 'cal-day-num';
    num.textContent = d;
    dayEl.appendChild(num);

    if (daySessions.length > 0) {
      const covers = document.createElement('div');
      covers.className = 'cal-covers';
      const maxShow = 2;
      const shown = daySessions.slice(0, maxShow);
      shown.forEach(s => {
        const cover = document.createElement('img');
        cover.src = s.book.imagen;
        cover.alt = s.book.titulo;
        cover.title = s.book.titulo;
        cover.loading = 'lazy';
        cover.addEventListener('click', (e) => {
          e.stopPropagation();
          const fullBook = getUserBooks(user.id).find(b => b.id === s.book.id);
          if (fullBook) import('./renderDetail.js').then(mod => mod.openDetail(fullBook));
        });
        covers.appendChild(cover);
      });
      if (daySessions.length > maxShow) {
        const more = document.createElement('span');
        more.className = 'cal-more';
        more.textContent = `+${daySessions.length - maxShow}`;
        covers.appendChild(more);
      }
      dayEl.appendChild(covers);

      dayEl.addEventListener('click', (e) => {
        if (e.target.closest('.cal-covers img')) return;
        const existing = document.querySelector('.cal-popup');
        if (existing) { existing.remove(); return; }

        const rect = dayEl.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'cal-popup';
        popup.style.left = Math.max(8, rect.left + rect.width / 2) + 'px';
        popup.style.top = (rect.bottom + 4) + 'px';

        daySessions.forEach(s => {
          const cover = document.createElement('img');
          cover.src = s.book.imagen;
          cover.alt = s.book.titulo;
          cover.loading = 'lazy';
          cover.addEventListener('click', (e) => {
            e.stopPropagation();
            const fullBook = getUserBooks(user.id).find(b => b.id === s.book.id);
            if (fullBook) import('./renderDetail.js').then(mod => mod.openDetail(fullBook));
          });
          popup.appendChild(cover);
        });

        document.body.appendChild(popup);
        setTimeout(() => {
          document.addEventListener('click', (e) => {
            if (!popup.contains(e.target)) popup.remove();
          }, { once: true });
        }, 0);
      });
    }

    grid.appendChild(dayEl);
  }

  container.appendChild(header);
  container.appendChild(grid);
}

export function openCalendar() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth() + 1;

  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'cal-modal';
  overlay.appendChild(modal);

  renderCalendarContent(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
