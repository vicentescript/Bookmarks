const STORAGE_USERS = 'bookmarks_users';
const STORAGE_CURRENT = 'bookmarks_currentUser';
const STORAGE_BOOKS = 'bookmarks_books';
const STORAGE_LISTS = 'bookmarks_lists';

const GOOGLE_BOOKS_KEY = 'AIzaSyC394XaV60CW3kCwC_L8RoKur-oABYi0ts';

export function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
}

export function saveUser(name) {
  const users = getUsers();
  const user = { id: crypto.randomUUID(), name };
  users.push(user);
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  return user;
}

export function setCurrentUser(id) {
  localStorage.setItem(STORAGE_CURRENT, id);
}

export function getCurrentUser() {
  const id = localStorage.getItem(STORAGE_CURRENT);
  if(!id) return null;
  return getUsers().find(u => u.id === id) || null;
}

export function getUserBooks(userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  return all.filter(b => b.userId === userId);
}

export function addUserBook(userId, book) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const existe = all.some(b => b.userId === userId && b.bookId === book.bookId);
  if (existe) return false;
  all.push({ ...book, userId, id: crypto.randomUUID(), addedAt: Date.now() });
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
  return true;
}

export function updateBookStatus(bookId, estado) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return;
  book.estado = estado;
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
}

export function updateBookRating(bookId, rating) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return;
  book.rating = rating;
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
}

export function updateBookPages(bookId, paginas) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return;
  book.paginas = paginas;
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
}

export function updateBookInfo(bookId, data) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return;
  Object.assign(book, data);
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
}

export function removeUserBook(bookId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const filtered = all.filter(b => b.id !== bookId);
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(filtered));
}

function ensureSessions(book) {
  if (!book.sessions) book.sessions = [];
}

export function startReading(bookId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return;
  book.startDate = book.startDate || new Date().toISOString().split('T')[0];
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
}

export function finishReading(bookId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return;
  book.endDate = new Date().toISOString().split('T')[0];
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
}

export function addReadingSession(bookId, date, pages) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return;
  ensureSessions(book);
  const existing = book.sessions.find(s => s.date === date);
  if (existing) {
    existing.pages += pages;
  } else {
    book.sessions.push({ date, pages });
  }
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
}

export function getReadingStats(bookId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const book = all.find(b => b.id === bookId);
  if (!book) return null;
  ensureSessions(book);
  return {
    startDate: book.startDate,
    endDate: book.endDate,
    sessions: book.sessions,
    totalPages: book.sessions.reduce((sum, s) => sum + s.pages, 0),
    paginasTotal: book.paginas || 0,
  };
}

export function getSessionsByMonth(userId, year, month) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const userBooks = all.filter(b => b.userId === userId);
  const result = [];

  userBooks.forEach(book => {
    ensureSessions(book);
    book.sessions.forEach(s => {
      const [y, m] = s.date.split('-').map(Number);
      if (y === year && m === month) {
        result.push({
          date: s.date,
          pages: s.pages,
          book: { titulo: book.titulo, imagen: book.imagen, id: book.id },
        });
      }
    });
  });

  return result;
}

export function getUserLists(userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_LISTS)) || [];
  return all.filter(l => l.userId === userId);
}

export function createList(userId, name, thumbnail) {
  const all = JSON.parse(localStorage.getItem(STORAGE_LISTS)) || [];
  const list = {
    id: crypto.randomUUID(),
    userId,
    name,
    thumbnail: thumbnail || '',
    bookIds: [],
    createdAt: Date.now(),
  };
  all.push(list);
  localStorage.setItem(STORAGE_LISTS, JSON.stringify(all));
  return list;
}

export function updateList(listId, data) {
  const all = JSON.parse(localStorage.getItem(STORAGE_LISTS)) || [];
  const list = all.find(l => l.id === listId);
  if (!list) return;
  Object.assign(list, data);
  localStorage.setItem(STORAGE_LISTS, JSON.stringify(all));
}

export function deleteList(listId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_LISTS)) || [];
  const filtered = all.filter(l => l.id !== listId);
  localStorage.setItem(STORAGE_LISTS, JSON.stringify(filtered));
}

export function addBookToList(listId, bookId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_LISTS)) || [];
  const list = all.find(l => l.id === listId);
  if (!list || list.bookIds.includes(bookId)) return false;
  list.bookIds.push(bookId);
  localStorage.setItem(STORAGE_LISTS, JSON.stringify(all));
  return true;
}

export function removeBookFromList(listId, bookId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_LISTS)) || [];
  const list = all.find(l => l.id === listId);
  if (!list) return;
  list.bookIds = list.bookIds.filter(id => id !== bookId);
  localStorage.setItem(STORAGE_LISTS, JSON.stringify(all));
}

export function getListBooks(listId) {
  const allLists = JSON.parse(localStorage.getItem(STORAGE_LISTS)) || [];
  const list = allLists.find(l => l.id === listId);
  if (!list) return [];
  const allBooks = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  return list.bookIds.map(id => allBooks.find(b => b.id === id)).filter(Boolean);
}

export async function updateAllGenres(userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_BOOKS)) || [];
  const userBooks = all.filter(b => b.userId === userId && b.bookId);
  let updated = 0;

  for (const book of userBooks) {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${book.bookId}?key=${GOOGLE_BOOKS_KEY}`);
      if (!res.ok) continue;
      const data = await res.json();
      const cats = data.volumeInfo?.categories;
      if (cats && cats.length > 0) {
        book.genero = cats.join(', ');
        updated++;
      }
    } catch (e) {}
  }

  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(all));
  return updated;
}
