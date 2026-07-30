export const searchBooks = async (query) => {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${import.meta.env.VITE_GOOGLE_BOOKS_KEY}`);
  if (!res.ok) {
    const msg = res.status === 503
      ? 'El servicio de Google Books no está disponible ahora. Inténtalo en unos segundos.'
      : `Error al consultar Google Books (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
};
