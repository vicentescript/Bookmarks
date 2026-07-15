 function renderizarLibros(){
  const contenedor = document.querySelector('.mis-libros');

  libros.forEach(libro => {
    const article = document.createElement('article');
    article.className = 'libros';

    const imgContainer = document.createElement('div');
    imgContainer.className = 'ficha-libro';

    const img = document.createElement('img');
    img.src = libro.imagen;
    img.alt = libro.titulo;
    imgContainer.appendChild(img);

    const infoLibro = document.createElement('div');
    infoLibro.className = 'info-libro';

    const titulo = document.createElement('h3');
    titulo.className = 'titulo';
    titulo.textContent = libro.titulo;

    const autor = document.createElement('p');
    autor.className = 'autor';
    autor.textContent = libro.autor;

    infoLibro.appendChild(titulo);
    infoLibro.appendChild(autor);

    const extraInfo = document.createElement('div');
    extraInfo.className = 'extra-info';

    const sinopsis = document.createElement('p');
    sinopsis.className = 'sinopsis';
    sinopsis.textContent = libro.sinopsis;

    const meta = document.createElement('div');
    meta.className = 'meta';

    const paginas = document.createElement('span');
    paginas.className = 'paginas';
    paginas.textContent = libro.paginas + ' pág.';
    meta.appendChild(paginas);

    const genero = document.createElement('span');
    genero.className = 'genero';
    genero.textContent = libro.genero;
    meta.appendChild(genero);

    const rating = document.createElement('span');
    rating.className = 'rating';
    rating.textContent = '★ ' + libro.rating;
    meta.appendChild(rating);

    extraInfo.appendChild(sinopsis);
    extraInfo.appendChild(meta);

    imgContainer.appendChild(infoLibro);
    imgContainer.appendChild(extraInfo);
    article.appendChild(imgContainer);
    contenedor.appendChild(article);

  });

 }

 renderizarLibros();


