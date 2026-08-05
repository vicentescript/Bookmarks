# BOOKMARKS

**Track the pages. Keep the memories. Quantify your curiosity.**

Aplicación web para gestionar tu biblioteca personal, seguir tu progreso de lectura y descubrir libros nuevos a través de Google Books API.

## Demo

[vicentescript.github.io/Bookmarks](https://vicentescript.github.io/Bookmarks)

---

## Funcionalidades

### Búsqueda y descubrimiento
- Búsqueda de libros vía **Google Books API** con hasta 20 resultados por consulta
- Atajo de teclado **Ctrl+K** / **Cmd+K** para abrir la búsqueda desde cualquier punto
- Barra de búsqueda animada que se expande desde la cabecera hasta el centro de la pantalla
- Lógica de reintentos con backoff exponencial si la API falla (hasta 10s)
- Imágenes de portada mejoradas a alta resolución (HTTPS, zoom=2)
- Paginación con botón "Ver más" (muestra 7 resultados inicialmente)
- Detección de duplicados al añadir libros

### Biblioteca personal
- Organización por **5 estados**: Pendiente, Leyendo, Leído, Abandonado, Pausado
- **Filtros animados** por estado con pills de colores
- **Búsqueda en tiempo real** por título o autor dentro de la biblioteca
- Tarjetas de libro con portada, título, autor y badge de estado
- Panel de sinopsis que se desliza al hacer hover (con detección de dirección automática)
- **Eliminación** con confirmación y overlay hover-revelado
- Transiciones de entrada/salida animadas al cambiar filtros

### Añadir libros manualmente
- Botón **"+ Añadir"** en la cabecera de "Mi Biblioteca"
- Formulario modal con campos: Título, Autor, Portada (URL), Sinopsis, Páginas, Género
- **Preview de portada** en tiempo real al pegar una URL
- **Selector de páginas** con botones +/− para ajustar el número
- Validación de campos obligatorios (Título y Autor)
- Los libros se añaden como "Pendiente" por defecto
- Cierre del formulario al hacer clic fuera del modal

### Seguimiento de lectura
- Registro de **página actual** — el sistema calcula automáticamente las páginas leídas
- **Barra de progreso** visual con porcentaje y conteo de páginas
- Conteo de **días transcurridos** desde el inicio de lectura
- **Carousel multi-libro** con navegación prev/next para usuarios con varios libros en lectura
- Botón "Marcar como leído" para finalizar un libro con un clic
- **Calendario mensual** con portadas de libros en los días leídos y popup interactivo
- **Selector de páginas** con botones +/− personalizados en vez de las flechas nativas del navegador
- Cierre del modal de registro al hacer clic fuera

### Detalle y edición
- **Modal de detalle** con animación FLIP desde la tarjeta de origen
- **Modo edición inline** para: título, autor, sinopsis, portada (con preview en tiempo real), páginas y género
- **Valoración de 1 a 5 estrellas** con toggle (clic para puntuar, clic mismo para limpiar)
- Panel de estadísticas: total leído, sesiones, fecha de inicio, progreso

### Multiusuario
- Sistema de **múltiples usuarios** con nombre y avatar emoji
- Selector de usuario al iniciar sesión
- Menú de usuario con: cambiar usuario, calendario, ajustes, cerrar sesión
- Editor de perfil con selección de 20 emojis

### Diseño y UX
- **Tema oscuro** con acentos dorados (#ffbd59)
- **3 fuentes personalizadas**: League Gothic (títulos), Roboto Mono (cuerpo), Kanit (hero)
- **4 breakpoints responsive**: 1260px, 1000px, 900px, 620px
- Hero con imagen en escala de grises y degradado
- Tarjeta de lectura actual en el hero con portada, info y barra de progreso
- Footer con marca, tagline y enlaces
- **PWA** — instalable como aplicación en pantalla de inicio (Android/iOS)
- Comportamiento de cursor limpio — se quita el foco al hacer clic fuera de campos de texto

---

## Tecnologías

| Categoría | Tecnología |
|---|---|
| Lenguaje | JavaScript vanilla (ES Modules) |
| Estilos | CSS puro (Grid, Flexbox, animations) |
| Bundler | Vite |
| API externa | Google Books Data API |
| Persistencia | localStorage |
| PWA | Web App Manifest |

---

## Estructura del proyecto

```
bookmarks/
├── index.html
├── manifest.json
├── package.json
├── assets/
│   └── images/
│       ├── favicon.png
│       ├── hero.jpg
│       └── default.jpg
├── css/
│   └── styles.css
└── js/
    ├── app.js            # Punto de entrada, orquesta módulos
    ├── api.js            # Integración con Google Books API
    ├── store.js          # CRUD con localStorage
    ├── auth.js           # Login, usuarios, avatar
    ├── renderSearch.js   # Búsqueda animada y resultados
    ├── renderHome.js     # Grid de biblioteca y filtros
    ├── renderReading.js  # Tarjeta de lectura actual
    ├── renderCalendar.js # Calendario mensual
    ├── renderDetail.js   # Modal de detalle con edición
    └── renderAddManual.js # Formulario de añadido manual
```

---

## Modelo de datos

Cada libro en localStorage contiene:

```json
{
  "id": "UUID",
  "bookId": "Google Books ID",
  "userId": "UUID del usuario",
  "titulo": "string",
  "autor": "string",
  "imagen": "URL de la portada",
  "sinopsis": "string",
  "paginas": 320,
  "genero": "Ficción",
  "ratingAPI": 4.2,
  "estado": "pendiente | leyendo | leido | abandonado | pausado",
  "rating": 0-5,
  "addedAt": "timestamp",
  "startDate": "2025-01-15",
  "endDate": "2025-02-20",
  "sessions": [{ "date": "2025-01-15", "pages": 30 }]
}
```

---

## Licencia

Proyecto personal — Vicente Script (vicentescript@gmail.com)
