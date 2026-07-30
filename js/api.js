const GOOGLE_BOOKS_KEY = 'AIzaSyC394XaV60CW3kCwC_L8RoKur-oABYi0ts';

export const searchBooks = async (query) => {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${GOOGLE_BOOKS_KEY}`);
  if (!res.ok) return null;
  return res.json();
};
