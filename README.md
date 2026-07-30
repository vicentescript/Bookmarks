# BOOKMARKS

Track the pages, keep the memories, quantify your curiosity.

App web para gestionar tu biblioteca personal, seguir tu progreso de lectura y descubrir libros nuevos.

## Demo

[vicentescript.github.io/Bookmarks](https://vicentescript.github.io/Bookmarks)

## Features

- Busca libros en Google Books API y añádelos a tu biblioteca
- Organiza por estado: pendiente, leyendo, leído, abandonado, pausado
- Registro de páginas leídas por sesión con fecha
- Calendario con los días que has leído y portadas visibles
- Valoraciones de 1 a 5 estrellas
- Filtros animados por estado
- Modal de detalle con edición inline (título, autor, sinopsis, páginas, género)
- Atajo Ctrl+K para búsqueda rápida
- Multiusuario con nombre y emoji (localStorage)

## Tecnologías

HTML, CSS, JS vanilla, Vite, Google Books API.

## Uso

```bash
npm install
npm run dev
```

Crea un `.env` en la raíz con:

```
VITE_GOOGLE_BOOKS_KEY=tu_clave
```
