# Documentación del Proyecto Animatch

> **Repositorio original:** `/home/Vicente/bootcamp/animatch`  
> **Demo en vivo:** [https://vicentescript.github.io/Animatch](https://vicentescript.github.io/Animatch)  
> **Autor:** vicentescript

---

## Índice

1. [Introducción e Idea del Proyecto](#1-introducción-e-idea-del-proyecto)
2. [Arquitectura General](#2-arquitectura-general)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Análisis Detallado de Cada Archivo](#4-análisis-detallado-de-cada-archivo)
   - 4.1. `package.json` — Gestión de dependencias y scripts
   - 4.2. `vite.config.js` — Configuración del bundler
   - 4.3. `pnpm-workspace.yaml` — Configuración del monorepo
   - 4.4. `.gitignore` — Archivos ignorados por Git
   - 4.5. `.vscode/extensions.json` — Extensiones recomendadas
   - 4.6. `src/index.html` — Punto de entrada HTML
   - 4.7. `src/index.css` — Estilos globales
   - 4.8. `src/index.js` — Lógica principal de la aplicación
   - 4.9. `src/data/animales.js` — Base de datos de animales
   - 4.10. `src/components/AnimalCard.js` — Web Component de tarjeta individual
   - 4.11. `src/components/AnimalDeck.js` — Web Component de navegación
   - 4.12. `public/` — Recursos estáticos (imágenes y sonidos)
5. [Flujo de la Aplicación Paso a Paso](#5-flujo-de-la-aplicación-paso-a-paso)
6. [Historias de Usuario y Funcionalidades](#6-historias-de-usuario-y-funcionalidades)
7. [Decisiones Técnicas](#7-decisiones-técnicas)
8. [Evolución del Código (Git History)](#8-evolución-del-código-git-history)
9. [Posibles Mejoras](#9-posibles-mejoras)
10. [Conclusión](#10-conclusión)

---

## 1. Introducción e Idea del Proyecto

Animatch es una aplicación web interactiva diseñada para que niños pequeños aprendan los animales de forma lúdica y sensorial. La idea nace de la necesidad de combinar tres estímulos clave en el aprendizaje infantil:

- **Estímulo visual:** Fotografías reales de cada animal.
- **Estímulo auditivo:** Nombre del animal leído en voz alta con una voz amable.
- **Estímulo sonoro:** Sonido real que emite cada animal.

La aplicación permite navegar entre tarjetas de animales, organizados por grupos (Domésticos, Granja, Selva, Marinos), con fondos temáticos que cambian según la categoría seleccionada.

El público objetivo son niños en edad preescolar (2-6 años), por lo que la interfaz prioriza:
- Botones grandes y fáciles de pulsar.
- Transiciones suaves y no bruscas.
- Colores contrastados y elementos visuales claros.
- Navegación simple: solo adelante y atrás.
- Sin textos complejos ni menús anidados.

---

## 2. Arquitectura General

El proyecto sigue una arquitectura basada en **Web Components nativos** (Custom Elements v1) con **Shadow DOM**, montados sobre un bundler **Vite 8.x** y empaquetados para su despliegue en **GitHub Pages**.

```
┌─────────────────────────────────────────────────────────────┐
│                      src/index.html                          │
│                     (Punto de entrada)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    src/index.css              src/index.js
  (Estilos globales)        (Lógica principal)
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
          src/data/animales.js   AnimalCard.js  AnimalDeck.js
          (Datos estáticos)      (Web Component) (Web Component)
                    │
                    │  (importa GRUPOS para fondos)
                    └──────────────────────────────────┘
```

**Patrón de diseño:** MVP (Model-View-Presenter) ligero:
- **Modelo:** `src/data/animales.js` — datos estructurados de animales y grupos.
- **Vista:** `src/index.html` + `src/index.css` — estructura y estilos globales.
- **Presentador/Control:** `src/index.js` — orquesta los componentes y maneja eventos de UI.
- **Componentes reutilizables:** `AnimalCard` y `AnimalDeck` — encapsulan la lógica de presentación con Shadow DOM.

---

## 3. Estructura del Proyecto

```
animatch/
├── .git/                          # Repositorio Git
├── .gitignore                     # Archivos ignorados
├── .vscode/extensions.json        # Extensiones recomendadas para VSCode
├── README.md                      # Documentación del proyecto
├── package.json                   # Dependencias y scripts
├── pnpm-lock.yaml                 # Lockfile de pnpm
├── pnpm-workspace.yaml            # Workspace config
├── vite.config.js                 # Configuración de Vite
├── public/                        # Recursos estáticos (copia directa a dist)
│   └── assets/
│       ├── images/
│       │   ├── favicon.webp       # Icono de pestaña
│       │   ├── logo.webp          # Logo de la pantalla de inicio
│       │   ├── animales/          # 23 imágenes de animales (.webp)
│       │   └── fondos/            # 5 fondos temáticos (.webp)
│       └── sounds/                # 21 sonidos de animales (.mp3)
├── src/                           # Código fuente
│   ├── index.html                 # HTML principal
│   ├── index.js                   # JS principal (entrada)
│   ├── index.css                  # Estilos globales
│   ├── components/
│   │   ├── AnimalCard.js          # Componente de tarjeta de animal
│   │   └── AnimalDeck.js          # Componente de mazo/navegación
│   └── data/
│       └── animales.js            # Datos de animales y grupos
└── dist/                          # Build de producción (generado por Vite)
```

### ¿Por qué esta estructura?

- **`public/`**: Vite copia todo lo que está en `public/` directamente al directorio de salida sin transformarlo. Es el lugar ideal para imágenes, sonidos y otros assets estáticos.
- **`src/`**: Contiene el código fuente que Vite procesará (bundling, minificación, etc.).
- **`src/components/`**: Cada Web Component en su propio archivo, siguiendo el principio de responsabilidad única.
- **`src/data/`**: Separación de datos y lógica. Los datos de animales son independientes de la UI, lo que permite cambiarlos o ampliarlos sin tocar los componentes.
- **`dist/`**: Output del build. No se versiona (está en `.gitignore`).

---

## 4. Análisis Detallado de Cada Archivo

### 4.1. `package.json`

```json
{
  "name": "animatch",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "stylelint": "stylelint src/**/*.css",
    "stylelint:fix": "stylelint src/**/*.css --fix"
  },
  "devDependencies": {
    "eslint": "^10.7.0",
    "gh-pages": "^6.3.0",
    "stylelint": "^17.14.0",
    "vite": "^8.1.4",
    "vite-tsconfig-paths": "^6.1.1"
  }
}
```

**Análisis línea por línea:**

- **`"type": "module"`**: Habilita los módulos ES nativos en Node.js, permitiendo usar `import`/`export` en lugar de `require`.
- **Scripts:**
  - `"dev"`: Arranca el servidor de desarrollo de Vite con HMR (Hot Module Replacement).
  - `"build"`: Genera el build de producción en `dist/`.
  - `"preview"`: Sirve el build de producción localmente para probarlo.
  - `"deploy"`: Publica el contenido de `dist/` en GitHub Pages usando el paquete `gh-pages`.
  - `"lint"` / `"lint:fix"`: Análisis estático del código JS con ESLint.
  - `"stylelint"` / `"stylelint:fix"`: Análisis estático del CSS con Stylelint.
- **Dependencias:** Todas son `devDependencies` porque el proyecto es 100% frontend estático. Vite y las herramientas de linting solo se necesitan en desarrollo.

### 4.2. `vite.config.js`

```js
import { defineConfig } from "vite";
import path from "node:path";

const isGitHubPages = true;
const repo = "Animatch";
const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const base = mode === "production" && isGitHubPages ? "/" + repo + "/" : "/";

export default defineConfig({
  root: "src",
  base,
  mode,
  envDir: "../",
  publicDir: "../public",
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  },
  build: {
    outDir: "../dist",
    assetsDir: "./"
  }
});
```

**Análisis:**

- **`root: "src"`**: Vite usa `src/` como directorio raíz del servidor de desarrollo. Esto permite que `index.html` esté dentro de `src/` y las rutas relativas funcionen correctamente.
- **`base`**: La clave del despliegue en GitHub Pages. Cuando se despliega en `https://vicentescript.github.io/Animatch/`, la aplicación debe servir los assets bajo la ruta `/Animatch/...`. En desarrollo, es `/`. Esta variable `base` se inyecta en el código mediante `import.meta.env.BASE_URL`.
- **`publicDir: "../public"`**: Indica que la carpeta `public/` está un nivel arriba de `src/`.
- **`resolve.alias`**: Define el alias `@` para referirse a `src/`. Aunque en el código actual no se usa, está preparado para importaciones más limpias como `import x from "@/data/animales.js"`.
- **`build.outDir: "../dist"`**: El build se genera en `dist/` (al mismo nivel que `src/`).
- **`build.assetsDir: "./"`**: Los assets del build se ponen en la raíz de `dist/` en lugar de en una subcarpeta `assets/`. Esto es importante porque los archivos JS/CSS generados por Vite deben estar accesibles desde la ruta base.

### 4.3. `pnpm-workspace.yaml`

```yaml
minimumReleaseAge: 1440
```

Configuración mínima del workspace de pnpm. `minimumReleaseAge: 1440` significa que los paquetes publicados deben tener al menos 1440 minutos (1 día) de antigüedad antes de que pnpm los considere actualizables. Esto es una medida de seguridad para evitar actualizaciones a paquetes maliciosos publicados recientemente.

### 4.4. `.gitignore`

```
node_modules
dist
```

Ignora las dependencias instaladas y el build de producción, que no deben versionarse.

### 4.5. `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint",
    "esbenp.prettier-vscode",
    "Tobermory.es6-string-html",
    "wix.vscode-import-cost",
    "oderwat.indent-rainbow"
  ]
}
```

Extensiones recomendadas para trabajar en el proyecto:
- **ESLint**: Análisis de código JavaScript.
- **Stylelint**: Análisis de código CSS.
- **Prettier**: Formateador de código.
- **ES6 String HTML**: Resalta sintaxis HTML dentro de template literals (muy útil para los Web Components que usan `innerHTML` con strings).
- **Import Cost**: Muestra el peso de los imports.
- **Indent Rainbow**: Colorea la indentación para mejor legibilidad.

### 4.6. `src/index.html`

```html
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animatch</title>
  <link rel="icon" type="image/webp" href="/assets/images/favicon.webp">
  <link rel="stylesheet" href="./index.css">
  <script type="module" src="./index.js"></script>
</head>

<body>
  <section id="inicio">
    <img src="/assets/images/logo.webp" alt="Animatch" class="logo">
    <p>¡Aprende los animales!</p>
    <div id="grupos"></div>
    <button id="jugar">¡Jugar!</button>
  </section>

  <section id="juego" hidden>
    <animal-deck></animal-deck>
  </section>
</body>

</html>
```

**Análisis:**

- **`lang="es"`**: Idioma español, importante para accesibilidad y para que los lectores de pantalla usen la pronunciación correcta.
- **`<script type="module">`**: Carga `index.js` como un módulo ES6, permitiendo imports.
- **`<section id="inicio">`**: Pantalla de bienvenida con:
  - Logo de la aplicación.
  - Mensaje de bienvenida.
  - Contenedor `<div id="grupos">` que se llena dinámicamente con los botones de grupo desde JavaScript.
  - Botón "¡Jugar!" que inicia el juego.
- **`<section id="juego" hidden>`**: Pantalla de juego, oculta inicialmente. Contiene el Web Component `<animal-deck>`.
- **Uso de `hidden`**: El atributo HTML nativo `hidden` oculta la sección. Cuando se hace clic en "Jugar", se oculta la sección de inicio y se muestra la de juego.

### 4.7. `src/index.css`

```css
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-family: system-ui, sans-serif;
}

#bg-1, #bg-2 {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: center / cover no-repeat;
  transition: opacity 0.8s ease;
}

#inicio::before {
  content: "";
  position: fixed;
  inset: 0;
  backdrop-filter: blur(4px);
  z-index: -1;
}

#inicio {
  text-align: center;
  position: relative;
}

.logo { max-width: 300px; height: auto; }

#inicio p {
  font-size: 1.2rem;
  margin: 0.5rem 0 2rem;
  opacity: 0.8;
}

#grupos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.grupo-btn {
  padding: 0.6rem 1.2rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  background: transparent;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.grupo-btn:hover { background: rgba(255,255,255,0.1); }
.grupo-btn.activo { border-color: #fff; background: rgba(255,255,255,0.2); }

#jugar {
  margin-top: 2rem;
  padding: 1rem 3rem;
  font-size: 1.5rem;
  border: none;
  border-radius: 16px;
  background: #fff;
  color: #171717;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

#jugar:hover { transform: scale(1.05); }

#juego {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

#juego[hidden] { display: none; }
```

**Análisis de decisiones de diseño:**

- **`body` como flex container**: Centra todo el contenido tanto horizontal como verticalmente. `min-height: 100vh` asegura que ocupe al menos toda la pantalla.
- **`#bg-1` y `#bg-2`**: Dos capas de fondo superpuestas que permiten la transición crossfade. `position: fixed; inset: 0` las extiende por toda la pantalla. `z-index: -1` las coloca detrás de todo el contenido. La `transition: opacity 0.8s ease` suaviza el cambio entre fondos.
- **`#inicio::before` con `backdrop-filter: blur(4px)`**: Aplica un desenfoque sutil al fondo detrás de la pantalla de inicio, mejorando la legibilidad del texto sobre la imagen de fondo.
- **`.grupo-btn`**: Botones con bordes semitransparentes y bordes redondeados (12px). El estado `activo` resalta el botón seleccionado con borde blanco sólido y fondo semitransparente.
- **`#jugar`**: Botón grande, blanco, con texto oscuro para alto contraste. El `hover` escala ligeramente (1.05) dando feedback visual.
- **`#juego[hidden]`**: Asegura que `display: none` se aplique correctamente al atributo `hidden` (override del valor por defecto de Flexbox).

### 4.8. `src/index.js` — Lógica Principal

```js
import "./components/AnimalCard.js";
import "./components/AnimalDeck.js";
import { GRUPOS, ANIMALES } from "./data/animales.js";

const BASE = import.meta.env.BASE_URL;
const bgInicio = document.createElement("div");
bgInicio.id = "bg-1";
bgInicio.style.backgroundImage = `url(${BASE}assets/images/fondos/fondo.webp)`;
bgInicio.style.opacity = "1";
document.body.prepend(bgInicio);

let grupoActivo = "todos";

GRUPOS.forEach(g => {
  const btn = document.createElement("button");
  btn.className = "grupo-btn" + (g.id === "todos" ? " activo" : "");
  btn.textContent = `${g.icono} ${g.nombre}`;
  btn.dataset.grupo = g.id;
  btn.addEventListener("click", () => {
    document.querySelectorAll(".grupo-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    grupoActivo = g.id;
  });
  document.getElementById("grupos").appendChild(btn);
});

document.getElementById("jugar").addEventListener("click", () => {
  document.getElementById("inicio").hidden = true;
  document.getElementById("juego").hidden = false;

  const filtrados = grupoActivo === "todos"
    ? ANIMALES
    : ANIMALES.filter(a => a.grupo === grupoActivo);

  document.querySelector("animal-deck").animales = filtrados;
});
```

**Análisis línea por línea:**

1. **Imports**: Carga los dos Web Components (para que se registren con `customElements.define`) y los datos de animales y grupos.

2. **`const BASE = import.meta.env.BASE_URL`**: Esta es una variable de entorno de Vite que contiene la ruta base de la aplicación. En desarrollo es `/`, en producción (GitHub Pages) es `/Animatch/`. Esto es crítico para que todas las rutas a assets funcionen correctamente en ambos entornos.

3. **Creación del fondo inicial**:
   - Se crea un `<div>` con `id="bg-1"` y se le asigna la imagen `fondo.webp` como background.
   - Se inserta al principio del `<body>` con `prepend()` para que quede detrás de todo.
   - `opacity = "1"` lo hace visible inmediatamente.

4. **`let grupoActivo = "todos"`**: Estado que guarda el grupo seleccionado. Por defecto, "todos".

5. **Generación dinámica de botones de grupo**:
   - Itera sobre `GRUPOS` (que incluye "todos", "domésticos", "granja", "selva", "marinos").
   - Para cada grupo, crea un `<button>` con el icono y nombre (ej: "🐾 Domésticos").
   - El botón "todos" inicia con la clase `activo`.
   - Cada botón almacena su grupo en `dataset.grupo`.
   - Al hacer clic, se quita la clase `activo` de todos los botones y se añade al pulsado, actualizando `grupoActivo`.

6. **Evento del botón "Jugar"**:
   - Oculta la pantalla de inicio y muestra la de juego.
   - Filtra los animales según el grupo activo.
   - Asigna el array filtrado a la propiedad `.animales` del Web Component `<animal-deck>`, lo que dispara la renderización del mazo.

### 4.9. `src/data/animales.js` — Base de Datos de Animales

```js
const BASE = import.meta.env.BASE_URL;

export const GRUPOS = [
  { id: "domesticos", nombre: "Domésticos", icono: "🐾", fondo: "linear-gradient(135deg, #f5af19, #f12711)", fondoImg: `${BASE}assets/images/fondos/domesticos.webp` },
  { id: "granja",     nombre: "Granja",     icono: "🐮", fondo: "linear-gradient(135deg, #a8e063, #56ab2f)", fondoImg: `${BASE}assets/images/fondos/granja.webp` },
  { id: "selva",      nombre: "Selva",      icono: "🦁", fondo: "linear-gradient(135deg, #1a512e, #0d3b1e)", fondoImg: `${BASE}assets/images/fondos/salvajes.webp` },
  { id: "marinos",    nombre: "Marinos",    icono: "🐬", fondo: "linear-gradient(135deg, #00b4db, #0083b0)", fondoImg: `${BASE}assets/images/fondos/marinos.webp` },
  { id: "todos",      nombre: "Todos",      icono: "🌟", fondo: "linear-gradient(135deg, #667eea, #764ba2)", fondoImg: null }
];

const S = name => `${BASE}assets/sounds/${name}.mp3`;

export const ANIMALES = [
  { id: "perro",    nombre: "Perro",    grupo: "domesticos", emoji: "🐶", img: `${BASE}assets/images/animales/perro.webp`, sonido: S("perro") },
  { id: "gato",     nombre: "Gato",     grupo: "domesticos", emoji: "🐱", img: `${BASE}assets/images/animales/gato.webp`, sonido: S("gato") },
  // ... 21 animales más
];
```

**Análisis:**

- **`GRUPOS`**: Array con 5 objetos, cada uno representa un grupo de animales:
  - `id`: Identificador único usado para filtrado y emparejamiento.
  - `nombre`: Nombre legible para mostrar en botones.
  - `icono`: Emoji representativo del grupo.
  - `fondo`: Color degradado CSS de respaldo.
  - `fondoImg`: Ruta a la imagen de fondo del grupo (null para "todos" porque no tiene fondo específico).

- **`S(name)`**: Función helper que construye la ruta completa a un archivo de sonido MP3. Ejemplo: `S("perro")` → `/Animatch/assets/sounds/perro.mp3`.

- **`ANIMALES`**: Array con 23 animales, cada uno con:
  - `id`: Identificador único.
  - `nombre`: Nombre en español (con tildes y mayúsculas según corresponda).
  - `grupo`: Referencia al `id` de un grupo.
  - `emoji`: Emoji del animal.
  - `img`: Ruta a la imagen del animal.
  - `sonido`: Ruta al sonido del animal.

**Distribución de animales:**
| Grupo | Animales |
|-------|----------|
| Domésticos | Perro, Gato, Pez, Conejo, Tortuga, Loro |
| Granja | Vaca, Oveja, Caballo, Cerdo, Gallina, Pato |
| Selva | León, Elefante, Mono, Jirafa, Tigre, Cebra |
| Marinos | Delfín, Ballena, Pez Payaso, Tortuga Marina, Foca |

**Toma de decisiones:**
- Los datos son estáticos porque la aplicación no necesita backend ni actualizaciones en tiempo real.
- Se usa `const BASE` para todas las rutas, garantizando que funcionen tanto en desarrollo como en producción con GitHub Pages.
- Los emojis se usan como `alt` text para imágenes y como identificadores visuales.
- `grupo` es un string que referencia `GRUPOS[].id`, creando una relación clave-valor simple y eficiente.

### 4.10. `src/components/AnimalCard.js` — Web Component de Tarjeta

```js
let audioActual = null;
document.addEventListener("stop-sound", () => {
  if (audioActual) { audioActual.pause(); audioActual = null; }
});

speechSynthesis.getVoices();

class AnimalCard extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(){
    const emoji = this.getAttribute("emoji");
    const nombre= this.getAttribute("nombre");
    const imagen= this.getAttribute("imagen");
    const sonido= this.getAttribute("sonido");
    this.shadowRoot.innerHTML= `...`;
    // Event listeners para botones
  }
}
customElements.define("animal-card", AnimalCard);
```

**Análisis detallado:**

#### Sistema de sonido global (`audioActual` y evento `stop-sound`)

```js
let audioActual = null;
document.addEventListener("stop-sound", () => {
  if (audioActual) { audioActual.pause(); audioActual = null; }
});
```

- **`audioActual`**: Variable global (a nivel de módulo) que guarda la referencia al audio que se está reproduciendo actualmente. Solo puede haber un audio reproduciéndose a la vez.
- **`stop-sound`**: Evento personalizado disparado desde `AnimalDeck` cuando el usuario navega a otra tarjeta. Al recibirlo, se detiene cualquier sonido en reproducción. Esto evita que dos sonidos se solapen o que un sonido siga sonando cuando ya se cambió de animal.

#### `speechSynthesis.getVoices()`

```js
speechSynthesis.getVoices();
```

Esta llamada inicial fuerza al navegador a cargar la lista de voces disponibles. Algunos navegadores cargan las voces de forma asíncrona, y llamar a `getVoices()` al inicio "despierta" el motor de síntesis para que las voces estén disponibles cuando se necesiten.

#### Clase `AnimalCard`

- **`constructor()`**: Llama a `super()` y crea un Shadow DOM con modo `"open"`, lo que permite que el DOM encapsulado sea accesible desde fuera si es necesario.

- **`connectedCallback()`**: Se ejecuta automáticamente cuando el elemento se inserta en el DOM. Extrae los atributos del elemento HTML (`emoji`, `nombre`, `imagen`, `sonido`) y renderiza la estructura interna.

#### Template del Shadow DOM

```html
<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .card {
    width: 320px;
    height: 320px;
    border-radius: 20px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 30px 30px rgba(0,0,1,1);
  }
  .card img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .actions {
    display: flex;
    gap: 1rem;
  }
  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 10px;
    font-size: 1.5rem;
    cursor: pointer;
    background: rgba(255,255,255,0.2);
    color: #fff;
    backdrop-filter: blur(4px);
  }
  button:hover { background: rgba(255,255,255,0.4); }
  @media (max-width: 600px) {
    .card { width: min(85vw, 320px); height: auto; aspect-ratio: 1; }
    button { font-size: 1.2rem; padding: 0.4rem 0.8rem; }
  }
</style>
<div class="wrapper">
  <div class="card">
    <img src="${imagen}" alt="${emoji}">
  </div>
  <div class="actions">
    <button id="voz">🔊 Nombre</button>
    <button id="sonido">🎶 Sonido</button>
  </div>
</div>
```

**Decisiones de diseño del Shadow DOM:**

- **`<style>` encapsulado**: Los estilos dentro del Shadow DOM no afectan al exterior ni viceversa, garantizando aislamiento total.
- **`.card` de 320×320px**: Tamaño cuadrado con esquinas redondeadas (20px), fondo blanco y sombra pronunciada (`0 30px 30px rgba(0,0,1,1)`) para dar efecto de tarjeta elevada.
- **`object-fit: contain`**: La imagen del animal se escala para caber dentro del contenedor manteniendo su proporción, sin recortarse.
- **Botones semitransparentes**: `background: rgba(255,255,255,0.2)` con `backdrop-filter: blur(4px)` para un efecto de vidrio esmerilado que se integra con cualquier fondo.
- **Responsive**: En pantallas menores a 600px, la tarjeta se adapta al 85% del ancho de la ventana (máximo 320px) y mantiene relación de aspecto 1:1 con `aspect-ratio`.

#### Botón "🔊 Nombre" (Voz)

```js
this.shadowRoot.getElementById("voz").addEventListener("click", () => {
  speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(nombre);
  msg.lang = "es-ES";

  const voces = speechSynthesis.getVoices();
  const voz = voces.find(v => v.name.includes("Laura") && v.lang.startsWith("es"));
  if (voz) msg.voice = voz;

  msg.pitch = 1.8;
  msg.rate = 0.7;
  speechSynthesis.speak(msg);
});
```

**Análisis:**

- **`speechSynthesis.cancel()`**: Cancela cualquier locución en curso antes de empezar una nueva, evitando superposiciones.
- **`SpeechSynthesisUtterance`**: API nativa del navegador para convertir texto a voz.
- **`msg.lang = "es-ES"`**: Fija el idioma a español de España para una pronunciación correcta.
- **Búsqueda de voz "Laura"**: Busca específicamente la voz de "Laura" (una voz femenina española incluida en algunos sistemas como Windows o ChromeOS). Si no está disponible, usa la voz por defecto en español.
- **`msg.pitch = 1.8`**: Tono agudo, más amigable para niños.
- **`msg.rate = 0.7`**: Velocidad lenta (0.7×), fácil de entender para niños pequeños.

#### Botón "🎶 Sonido" (Sonido real)

```js
this.shadowRoot.getElementById("sonido").addEventListener("click", () => {
  if (!sonido) return;
  if (audioActual) { audioActual.pause(); audioActual = null; }
  audioActual = new Audio(sonido);
  audioActual.volume = 0.7;
  audioActual.play();
});
```

- **`if (!sonido) return`**: Si el animal no tiene sonido asignado (ruta vacía), no hace nada.
- **Detiene el audio anterior**: Si hay otro sonido reproduciéndose, lo detiene.
- **`audioActual.volume = 0.7`**: Volumen al 70% para no ser estridente.
- **`audioActual.play()`**: Reproduce el sonido real del animal (ladrido, maullido, rugido, etc.).

### 4.11. `src/components/AnimalDeck.js` — Web Component de Navegación

```js
import { GRUPOS } from "../data/animales.js";

class AnimalDeck extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._animales = [];
    this._indice = 0;
  }
  // ...métodos
}
customElements.define("animal-deck", AnimalDeck);
```

**Análisis completo:**

#### Propiedades y estado interno

```js
this._animales = [];
this._indice = 0;
```

- `_animales`: Array de animales a mostrar (ya filtrados por grupo).
- `_indice`: Índice del animal actual dentro del array.

#### Setter `animales` — Punto de entrada de datos

```js
set animales(lista) {
  this._animales = this.aleatorizar([...lista]);
  this._indice = 0;
  this.render();
  this.animarEntrada();
  this.agregarEventos();
  this.actualizarFondo();
}
```

Cuando el `index.js` asigna `document.querySelector("animal-deck").animales = filtrados`, se ejecuta este setter que:
1. **Baraja los animales** con `aleatorizar()` para que aparezcan en orden diferente cada vez.
2. **Resetea el índice** a 0 (primer animal).
3. **Renderiza** la tarjeta del animal actual.
4. **Anima la entrada** con una transición suave.
5. **Agrega eventos** a los botones de navegación.
6. **Actualiza el fondo** según el grupo del animal.

#### Método `aleatorizar` — Algoritmo Fisher-Yates

```js
aleatorizar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

Implementación del algoritmo **Fisher-Yates** (o Knuth shuffle), considerado el estándar para barajar arrays de forma imparcial. Cada permutación tiene la misma probabilidad de ocurrir. La sintaxis `[a, b] = [b, a]` usa destructuring assignment para intercambiar valores sin variable temporal.

#### Método `actualizarFondo` — Sistema de crossfade

```js
actualizarFondo() {
  const animal = this._animales[this._indice];
  const grupo = GRUPOS.find(g => g.id === animal.grupo);
  if (!grupo || !grupo.fondoImg) return;

  let bg1 = document.getElementById("bg-1");
  let bg2 = document.getElementById("bg-2");

  if (!bg1) { bg1 = document.createElement("div"); bg1.id = "bg-1"; document.body.prepend(bg1); }
  if (!bg2) { bg2 = document.createElement("div"); bg2.id = "bg-2"; document.body.prepend(bg2); }

  const activa = bg1.style.opacity !== "0" ? bg1 : bg2;
  const inactiva = activa === bg1 ? bg2 : bg1;

  inactiva.style.backgroundImage = `url(${grupo.fondoImg})`;
  inactiva.style.opacity = "1";
  activa.style.opacity = "0";
}
```

**Sistema de dos capas para transición crossfade:**

1. Busca los dos divs de fondo (`#bg-1` y `#bg-2`). Si no existen (por ejemplo, si se llegó directo al juego desde el HTML), los crea.
2. Determina cuál está activo (opacidad distinta de 0) y cuál está inactivo (opacidad 0).
3. Asigna la nueva imagen de fondo al div inactivo y lo hace visible (`opacity: 1`).
4. Oculta el div activo (`opacity: 0`), lo que activa la transición CSS `transition: opacity 0.8s ease` definida en `index.css`.

El resultado es un crossfade suave entre fondos cada vez que se cambia de animal de un grupo diferente.

#### Método `render` — Generación del HTML

```js
render() {
  if (this._animales.length === 0) return;
  const animal = this._animales[this._indice];

  this.shadowRoot.innerHTML = `
    <style>
      h1 { font-family: 'Playwrite ID', cursive; font-size: 3.5rem; ... }
      .row { display: flex; align-items: center; gap: 1.5rem; }
      .row button { width: 80px; height: 80px; border-radius: 50%; ... }
      .btn-salir { ... }
      @media (max-width: 600px) { h1 { font-size: 2.2rem; } ... }
    </style>
    <div class="wrapper">
      <h1>${animal.nombre}</h1>
      <div class="row">
        <button id="prev">◀</button>
        <div class="card-container">
          <animal-card ...></animal-card>
        </div>
        <button id="next">▶</button>
      </div>
      <button id="reset" class="btn-salir">Salir</button>
    </div>
  `;

  this.shadowRoot.getElementById("reset")?.addEventListener("click", () => {
    document.getElementById("juego").hidden = true;
    document.getElementById("inicio").hidden = false;
    // Restaurar fondo inicial
  });
}
```

**Estructura renderizada:**
```
┌─────────────────────────────────┐
│        Nombre del animal        │  ← h1 con fuente Playwrite ID
│  ◀  [Tarjeta del animal]  ▶    │  ← Botones circulares laterales
│            [Salir]              │  ← Botón para volver al menú
└─────────────────────────────────┘
```

- **`<h1>`**: Muestra el nombre del animal con la fuente decorativa "Playwrite ID" (cursiva, tipo caligráfica infantil). Aunque la fuente se importa en el `dist/index.html`, en el entorno de desarrollo se usa la fuente del sistema como fallback.
- **Botones `◀` y `▶`**: Botones circulares grandes (80×80px) con fondo semitransparente, fáciles de pulsar para manos pequeñas.
- **`<animal-card>`**: El Web Component de tarjeta, anidado dentro de `AnimalDeck`. Recibe atributos `emoji`, `nombre`, `imagen` y `sonido`.
- **Botón "Salir"**: Vuelve a la pantalla de inicio y restaura el fondo inicial (`fondo.webp`).

#### Métodos de navegación

```js
siguiente() {
  document.dispatchEvent(new CustomEvent("stop-sound"));
  const container = this.shadowRoot.querySelector(".card-container");
  container.style.transform = "translateX(-100%)";
  container.style.opacity = "0";

  setTimeout(() => {
    this._indice = (this._indice + 1) % this._animales.length;
    this.render();
    this.agregarEventos();
    this.animarEntrada();
    this.actualizarFondo();
  }, 300);
}

anterior() {
  // Similar pero con translateX(100%)
}
```

**Mecanismo de transición:**

1. **`dispatchEvent(new CustomEvent("stop-sound"))`**: Dispara el evento global que detiene el sonido del animal actual (manejado en `AnimalCard.js`).
2. **Animación de salida**: La tarjeta actual se desplaza hacia la izquierda (`-100%`) o derecha (`100%`) y se desvanece, en 300ms (definido en CSS: `transition: transform 0.3s ease, opacity 0.3s ease`).
3. **`setTimeout(..., 300)`**: Espera a que termine la transición (300ms) y entonces:
   - Actualiza el índice (con módulo para ciclo infinito).
   - Vuelve a renderizar la tarjeta.
   - Reasigna eventos (ya que el Shadow DOM se regeneró completamente).
   - Anima la entrada de la nueva tarjeta.
   - Cambia el fondo si el grupo es diferente.

```js
animarEntrada() {
  requestAnimationFrame(() => {
    const container = this.shadowRoot.querySelector(".card-container");
    if (container) {
      container.style.transform = "translateX(0)";
      container.style.opacity = "1";
    }
  });
}
```

Usa `requestAnimationFrame` para asegurar que la animación de entrada ocurra después de que el navegador haya renderizado el nuevo contenido. Esto evita que la transición se "rompa" por aplicar estilos antes de que el elemento esté en el DOM.

### 4.12. `public/` — Recursos Estáticos

```
public/assets/
├── images/
│   ├── favicon.webp          # Icono de la pestaña del navegador
│   ├── logo.webp             # Logo de la pantalla de inicio
│   ├── animales/             # 23 imágenes de animales en formato WebP
│   │   ├── ballena.webp
│   │   ├── caballo.webp
│   │   └── ...
│   └── fondos/               # Fondos temáticos en WebP
│       ├── domesticos.webp
│       ├── fondo.webp        # Fondo de la pantalla de inicio
│       ├── granja.webp
│       ├── marinos.webp
│       └── salvajes.webp     # Fondo del grupo Selva
└── sounds/                   # 21 sonidos de animales en MP3
    ├── ballena.mp3
    ├── caballo.mp3
    └── ...
```

**¿Por qué WebP y MP3?**
- **WebP**: Formato de imagen moderno con compresión superior a JPEG y PNG. Ofrece buena calidad a menor tamaño, ideal para una aplicación web.
- **MP3**: Formato de audio universal compatible con todos los navegadores.
- **Convención de nombres**: Todos los archivos usan minúsculas y sin espacios, coincidiendo con los `id` de los animales en `animales.js`.

---

## 5. Flujo de la Aplicación Paso a Paso

### 5.1. Carga inicial

1. El navegador carga `src/index.html`.
2. Se descarga `index.css` y se aplican los estilos globales (fondo negro, layout centrado).
3. Se ejecuta `index.js` como módulo ES6.
4. `index.js` importa `AnimalCard.js` y `AnimalDeck.js`, registrando los custom elements `animal-card` y `animal-deck` en el navegador.
5. `index.js` importa los datos de `animales.js` (`GRUPOS` y `ANIMALES`).
6. Se crea el div `#bg-1` con la imagen `fondo.webp` como fondo de la pantalla de inicio.
7. Se generan dinámicamente los botones de grupo dentro de `#grupos`.
8. La página muestra la pantalla de inicio con logo, botones de grupo y botón "Jugar".

### 5.2. Selección de grupo (opcional)

1. El usuario hace clic en un botón de grupo (ej: "🐾 Domésticos").
2. Se actualiza la variable `grupoActivo` a `"domesticos"`.
3. El botón seleccionado se resalta con la clase `activo`.
4. Si no se selecciona nada, el grupo activo sigue siendo `"todos"`.

### 5.3. Inicio del juego

1. El usuario hace clic en "¡Jugar!".
2. Se oculta `#inicio` y se muestra `#juego`.
3. Se filtran los animales según `grupoActivo`.
4. Se asigna el array filtrado a `document.querySelector("animal-deck").animales`.
5. El setter `animales` del Web Component:
   - Baraja los animales.
   - Renderiza el primero con nombre, tarjeta y botones.
   - Aplica la animación de entrada.
   - Establece el fondo correspondiente al grupo del primer animal.

### 5.4. Navegación entre animales

1. El usuario ve la tarjeta del animal con:
   - Nombre grande en la parte superior.
   - Imagen del animal en una tarjeta blanca.
   - Botón "🔊 Nombre" para escuchar el nombre.
   - Botón "🎶 Sonido" para escuchar el sonido real.
   - Botones ◀ y ▶ para navegar.
2. Si pulsa "🔊 Nombre", el navegador lee el nombre con voz femenina española (tono agudo, velocidad lenta).
3. Si pulsa "🎶 Sonido", se reproduce el sonido real del animal (MP3).
4. Si pulsa ▶, la tarjeta se desliza hacia la izquierda y aparece la siguiente.
5. Si pulsa ◀, la tarjeta se desliza hacia la derecha y aparece la anterior.
6. Al navegar, cualquier sonido en reproducción se detiene automáticamente.
7. El fondo cambia suavemente si el nuevo animal pertenece a un grupo diferente.

### 5.5. Vuelta al menú

1. El usuario pulsa "Salir".
2. Se oculta `#juego` y se muestra `#inicio`.
3. El fondo vuelve a ser `fondo.webp`.

---

## 6. Historias de Usuario y Funcionalidades

### HU1: Aprender animales por grupos
> "Como niño pequeño, quiero ver animales de un tipo específico para aprenderlos por categorías."

**Implementación:** Botones de grupo en la pantalla de inicio que filtran los animales. Cada grupo tiene su propio fondo temático para asociación visual.

### HU2: Ver la imagen del animal
> "Como niño, quiero ver una foto bonita del animal para reconocerlo."

**Implementación:** Tarjeta blanca de 320×320px con la imagen del animal en formato WebP, centrada y con bordes redondeados.

### HU3: Escuchar el nombre del animal
> "Como niño, quiero escuchar cómo se dice el nombre del animal para aprender a pronunciarlo."

**Implementación:** Botón "🔊 Nombre" que usa la Web Speech API con voz femenina española, tono agudo y velocidad lenta.

### HU4: Escuchar el sonido del animal
> "Como niño, quiero escuchar qué sonido hace el animal para asociarlo."

**Implementación:** Botón "🎶 Sonido" que reproduce el MP3 del animal correspondiente.

### HU5: Navegar entre animales
> "Como niño, quiero pasar al siguiente animal fácilmente para seguir aprendiendo."

**Implementación:** Botones grandes ◀ y ▶ con transiciones animadas suaves.

### HU6: Jugar con todos los animales
> "Como niño, quiero ver todos los animales mezclados para sorprenderme."

**Implementación:** Opción "🌟 Todos" que incluye todos los animales barajados aleatoriamente.

### HU7: Volver al menú principal
> "Como niño o adulto, quiero poder salir del juego en cualquier momento."

**Implementación:** Botón "Salir" que restaura la pantalla de inicio.

### HU8: Uso en móvil
> "Como padre, quiero que la app funcione en mi teléfono para que mi hijo juegue donde sea."

**Implementación:** Diseño responsive con media queries que adaptan el tamaño de tarjetas y botones en pantallas menores a 600px.

---

## 7. Decisiones Técnicas

### 7.1. ¿Por qué Vanilla JS y no un framework (React, Vue)?

- **Propósito educativo**: El proyecto parece ser parte de un bootcamp de programación. Usar JavaScript vanilla obliga a entender los fundamentos del DOM, los Web Components y las APIs del navegador.
- **Ligereza**: Sin dependencias de framework, el bundle final es más pequeño y rápido de cargar.
- **Web Components nativos**: Los Custom Elements v1 y Shadow DOM son estándares web que no requieren ningún framework. Son compatibles con todos los navegadores modernos.
- **Simplicidad**: Para una aplicación con dos vistas y pocos componentes, un framework habría sido sobredimensionado.

### 7.2. ¿Por qué Shadow DOM?

- **Aislamiento de estilos**: Los estilos definidos dentro del Shadow DOM no afectan al resto de la página ni viceversa. Esto permite que los componentes tengan sus propios estilos sin conflictos.
- **Encapsulación**: La estructura interna del componente está oculta del DOM principal, lo que evita manipulaciones accidentales.
- **Estándar**: Es una API nativa del navegador, sin dependencias externas.

### 7.3. ¿Por qué Vite?

- **Rapidez**: Vite usa ES modules nativos en desarrollo, lo que proporciona un servidor de desarrollo extremadamente rápido con HMR (Hot Module Replacement).
- **Optimización de producción**: Vite usa Rollup para el build de producción, generando bundles optimizados con code splitting.
- **Gestión de assets**: Copia automáticamente los archivos de `public/` al output y resuelve rutas de assets.
- **Variables de entorno**: `import.meta.env.BASE_URL` permite que el código funcione en diferentes entornos (desarrollo local vs GitHub Pages).

### 7.4. ¿Por qué pnpm y no npm?

- **Eficiencia**: pnpm usa un almacén global de dependencias con hard links, ahorrando espacio en disco y tiempo de instalación.
- **Rapidez**: Es más rápido que npm y yarn en la mayoría de los casos.
- **Seguridad**: `pnpm-workspace.yaml` con `minimumReleaseAge` añade una capa de seguridad contra actualizaciones maliciosas.

### 7.5. ¿Por qué el sistema de dos capas para fondos?

El uso de dos divs superpuestos (`#bg-1` y `#bg-2`) permite realizar transiciones crossfade suaves. Cuando se cambia de animal:
1. Se asigna la nueva imagen al div inactivo (opacidad 0).
2. Se eleva su opacidad a 1.
3. Se reduce la opacidad del div activo a 0.

La transición CSS `transition: opacity 0.8s ease` hace que el cambio sea gradual. Sin este sistema, el fondo cambiaría abruptamente.

### 7.6. ¿Por qué regenerar todo el Shadow DOM en lugar de actualizar solo partes?

```js
this.shadowRoot.innerHTML = `...`; // Se regenera completo
```

En lugar de actualizar selectivamente partes del DOM, `AnimalDeck` regenera todo el `innerHTML` del Shadow DOM en cada navegación. Esto es intencional:
- **Simplicidad**: Es más fácil de leer y mantener que un sistema de diff/update.
- **Rendimiento**: Para un componente con pocos elementos (un título, tres botones, una tarjeta), la regeneración completa es prácticamente instantánea.
- **Consistencia**: Se evitan estados inconsistentes entre el modelo y el DOM.

Sin embargo, esto requiere reasignar los event listeners después de cada render, que es lo que hace `agregarEventos()`.

### 7.7. ¿Por qué la fuente "Playwrite ID"?

"Playwrite ID" es una fuente caligráfica decorativa que imita la escritura infantil. Se usa para el nombre del animal en la pantalla de juego, dando un toque lúdico y amigable. La fuente se carga desde Google Fonts.

### 7.8. ¿Por qué la voz "Laura" específicamente?

"Laura" es una voz femenina española disponible en sistemas Windows y algunos navegadores Chrome. Se selecciona porque:
- Es una voz clara y natural en español.
- El tono femenino suele ser percibido como más cálido y amigable por los niños.
- Si no está disponible, se usa la voz por defecto del sistema en español.

---

## 8. Evolución del Código (Git History)

El proyecto se desarrolló en aproximadamente 24 horas (15-16 de julio de 2026), siguiendo esta secuencia:

| Commit | Fecha | Descripción |
|--------|-------|-------------|
| `5cdf4fa` | 2026-07-15 | **Inicial**: Setup inicial con componentes `AnimalCard` y `AnimalDeck` |
| `df4d839` | 2026-07-15 | **README**: Añade documentación básica |
| `40ea950` | 2026-07-16 | **Assets**: Añade imágenes de animales, fondos y mejoras de layout |
| `1f35f0f` | 2026-07-16 | **Audio**: Añade sonidos de animales y voz Laura para lector de nombres |
| `a5a2931` | 2026-07-16 | **README**: Elimina secciones de desarrollo y deploy |
| `102c426` | 2026-07-16 | **README**: Expande con funcionalidades, enlace demo y lista de animales |
| `98a8347` | 2026-07-16 | **Fix**: Corrige base path de Vite para coincidir con el nombre del repo |
| `0e40bf3` | 2026-07-16 | **Style**: Añade layout responsive para móviles (max-width: 600px) |
| `9b1fa3e` | 2026-07-16 | **Fix**: Detiene sonido animal al navegar entre tarjetas |
| `b493ba0` | 2026-07-16 | **Feature**: Añade sonido de tortuga, asignado a tortuga y tortuga marina |
| `66c790f` | 2026-07-16 | **README**: Actualiza documentación |
| `83f1531` | 2026-07-16 | **README**: Actualiza documentación |

### Análisis de la evolución:

1. **Fase 1 (Setup)**: Creación del proyecto Vite, estructura de carpetas y Web Components básicos.
2. **Fase 2 (Assets)**: Incorporación de imágenes (23 animales, 5 fondos), favorito y logo.
3. **Fase 3 (Audio)**: Integración de la Web Speech API y archivos MP3 de sonidos reales.
4. **Fase 4 (Refinamiento)**: Corrección de rutas para GitHub Pages, diseño responsive, mejora de la experiencia de usuario (detener sonido al navegar).
5. **Fase 5 (Documentación)**: README detallado con features, demo y guía de uso.

---

## 9. Posibles Mejoras

### Funcionales

| Mejora | Descripción |
|--------|-------------|
| **Contador de animales** | Mostrar "Animal 3 de 6" para que el niño sepa cuántos quedan |
| **Modo aleatorio** | Botón "🎲 Aleatorio" que muestre un animal al azar |
| **Juego de memoria** | Modalidad donde el niño debe identificar el animal por su sonido |
| **Ampliar animales** | Añadir más animales por grupo (ej: más marinos, añadir aves) |
| **Sonidos ambientales** | Añadir sonido ambiente del hábitat (selva, granja, etc.) |
| **Animaciones** | Animación más elaborada al cambiar de tarjeta (como volteo 3D) |

### Técnicas

| Mejora | Descripción |
|--------|-------------|
| **Lazy loading** | Cargar imágenes solo cuando se necesiten para mejorar rendimiento |
| **Service Worker** | Convertir en PWA para funcionar offline |
| **Web Animations API** | Reemplazar transiciones CSS con animaciones más controladas |
| **Tests** | Añadir tests unitarios con Vitest |
| **Accesibilidad** | Añadir atributos ARIA, soporte para teclado (flechas) |
| **Estados de carga** | Mostrar indicador mientras se cargan imágenes y sonidos |

---

## 10. Conclusión

Animatch es un proyecto demostrativo de **aplicación web infantil** construido con tecnologías web nativas (Custom Elements, Shadow DOM, Web Speech API). Su arquitectura es simple pero efectiva:

- **Datos**: Separados en `animales.js` como fuente única de verdad.
- **Lógica de negocio**: En `index.js`, que orquesta la interacción entre los componentes.
- **Presentación**: En Web Components encapsulados con Shadow DOM.
- **Estilos**: CSS global para layout general + estilos encapsulados por componente.

El proyecto cumple su objetivo principal: ofrecer una experiencia interactiva para que niños aprendan animales mediante estímulos visuales y auditivos. La elección de tecnologías sin framework lo hace ligero, rápido y fácil de mantener, ideal tanto para el aprendizaje del desarrollo web como para su uso en producción.

La estructura modular y la separación de responsabilidades permitirían escalar la aplicación sin grandes cambios arquitectónicos: añadir más animales es solo agregar entradas en `animales.js`, y crear nuevas funcionalidades (juegos, quizzes) sería añadir nuevos componentes sin modificar los existentes.

---

*Documentación generada a partir del análisis del código fuente del proyecto Animatch.*
