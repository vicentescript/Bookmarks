function openLibraryCoverUrl(coverId) {
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function toOpenLibraryItem(doc) {
  return {
    id: doc.key,
    volumeInfo: {
      title: doc.title || 'Sin título',
      authors: doc.author_name || ['Desconocido'],
      publisher: (doc.publisher || [])[0] || null,
      imageLinks: doc.cover_i
        ? { thumbnail: openLibraryCoverUrl(doc.cover_i) }
        : null,
      pageCount: doc.number_of_pages_median || null,
      categories: doc.subject ? doc.subject.slice(0, 5) : ['General'],
      publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
      description: doc.subtitle || null,
      language: (doc.language || [])[0] || null,
      printType: 'BOOK',
    },
  };
}

export const searchBooks = async (query, signal) => {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    return { items: (data.docs || []).map(toOpenLibraryItem) };
  } catch {
    return null;
  }
};
