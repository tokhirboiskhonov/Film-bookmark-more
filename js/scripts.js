let genreArray = [];
let bookmarksArr = JSON.parse(window.localStorage.getItem("bookmarks")) || [];

// Custom functions
let findElement = (selectorName) => document.querySelector(selectorName);
let makeElement = (tagName) => document.createElement(tagName);

// Elements
let searchForm = findElement(".js-form");

let movieList = findElement(".movies__list");
let genresSelect = findElement(".genres-select");
let searchInput = findElement(".js-input");
let sortSelect = findElement(".js-sort");

let bookmarksList = findElement(".bookmark-list");

// Movie Info Modal
let modal = findElement(".modal");
let modalCloseBtn = findElement(".modal__btn");

// Movie Bookmark Modal
let bookmarkBtn = findElement(".bookmarks__btn");
let bookmarkModal = findElement(".bookmark-modal");

// Movie Template
let movieTemplate = findElement("#movie-template").content;

// Get Hour Function
function normalizeDate (dateFormat) {

  let date = new Date (dateFormat);
  let day = String(date.getDate()).padStart(2, 0);
  let month = String(date.getMonth() + 1).padStart(2, 0);
  let year = String(date.getFullYear()).padStart(2, 0);

  return (day + '.' + month + '.' + year);
}

// Aa-Zz sort function
let sortAz = function (a, b) {
  if (a.title > b.title) {
    return 1;
  }

  if (b.title > a.title) {
    return -1;
  }

  return 0;
};

// Zz-Aa sort function
let sortZa = function (a, b) {
  if (a.title > b.title) {
    return -1;
  }

  if (b.title > a.title) {
    return 1;
  }

  return 0;
};

// New-Old sort function
let sortNewOld = function (a, b) {
  return a.release_date - b.release_date;
};

// Old-New sort function
let sortOldNew = function (a, b) {
  return b.release_date - a.release_date;
};

// Sorts Object Functions
let sortFunctions = {
  0: sortAz,
  1: sortZa,
  2: sortNewOld,
  3: sortOldNew,
};

// Get Movies Genre Function
function getMovieGenre(genre) {
  if (!genreArray.includes(genre)) {
    genreArray.push(genre);

    let genreOption = makeElement("option");
    genreOption.textContent = genre;
    genreOption.value = genre;

    genresSelect.appendChild(genreOption);
  }
}

// Create New Movie Element
function createMovie(movie) {
  let elMovie = movieTemplate.cloneNode(true);

  elMovie.querySelector(".movie-img").src = movie.poster;
  elMovie.querySelector(".movie-img").width = "300";
  elMovie.querySelector(".movie-title").textContent = movie.title;

  movie.genres.forEach((genre) => {
    let newGenreLi = makeElement("li");

    newGenreLi.textContent = genre;
    elMovie.querySelector(".genre-list").appendChild(newGenreLi);

    getMovieGenre(genre);
  });

  elMovie.querySelector(".movie-year").textContent = normalizeDate(movie.release_date);
  elMovie.querySelector(".item-btn").dataset.id = movie.id;
  elMovie.querySelector(".bookmark-btn").dataset.id = movie.id;

  movieList.appendChild(elMovie);
}

// Search Movie Function
function searchMovie(evt) {
  evt.preventDefault();

  movieList.innerHTML = null;

  let genreValue = genresSelect.value;
  let searchValue = searchInput.value.trim();
  let sortValue = sortSelect.value;

  let newRegExp = new RegExp(searchValue, "gi");

  let foundFilms = films
    .filter((kino) => {
      if (genreValue === "All") {
        return kino;
      }

      return kino.genres.includes(genreValue);
    })
    .filter((kino) => {
      return kino.title.match(newRegExp);
    })
    .sort(sortFunctions[sortValue]);

  foundFilms.forEach((kino) => {
    createMovie(kino);
  });
}

films.forEach((film) => {
  createMovie(film);
});

let bookmarkTemplate = findElement(".bookmark-template").content;
let bookmarksFragment = document.createDocumentFragment();

function renderBookmarks(bookmarkMovie) {
  elBookmark = bookmarkTemplate.cloneNode(true);

  elBookmark.querySelector(".movie-name").textContent = bookmarkMovie.title;
  elBookmark.querySelector(".remove-btn").dataset.id = bookmarkMovie.id;

  bookmarksFragment.appendChild(elBookmark);
}

searchForm.addEventListener("submit", searchMovie);

movieList.addEventListener("click", function (evt) {
  if (evt.target.matches(".item-btn")) {
    modal.classList.add("modal__open");

    let foundMovie = films.find((movie) => movie.id === evt.target.dataset.id);

    modal.querySelector(".modal__title").textContent = foundMovie.title;
    modal.querySelector(".modal__text").textContent = foundMovie.overview;

    // Modal close function
    document.addEventListener("keyup", function (evt) {
      if (evt.keyCode === 27) {
        modal.classList.remove("modal__open");
      }
    });

    modal.addEventListener("click", function (evt) {
      if (evt.target === modal) {
        modal.classList.remove("modal__open");
      }
    });

    modalCloseBtn.addEventListener("click", function () {
      modal.classList.remove("modal__open");
    });
  }

  if (evt.target.matches(".bookmark-btn")) {
    let foundMovie = films.find((movie) => movie.id === evt.target.dataset.id);
    if (!bookmarksArr.includes(foundMovie)) {
      bookmarksArr.push(foundMovie);

      window.localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
    }

    bookmarksList.innerHTML = null;

    bookmarksArr.forEach((movie) => renderBookmarks(movie));

    bookmarksList.appendChild(bookmarksFragment);
  }
});

bookmarksArr.forEach((movie) => renderBookmarks(movie));
bookmarksList.appendChild(bookmarksFragment);

// Bookmark Modal
bookmarkBtn.addEventListener("click", function () {
  bookmarkModal.classList.add("modal__open");

  bookmarkModal.addEventListener("click", function (evt) {
    if (evt.target === bookmarkModal) {
      bookmarkModal.classList.remove("modal__open");
    }
  });
});

// Remove Bookmark
bookmarksList.addEventListener("click", function (evt) {
  if (evt.target.matches(".remove-btn")) {
    let foundIndex = bookmarksArr.findIndex(
      (item) => item.id === evt.target.dataset.id
    );

    bookmarksArr.splice(foundIndex, 1);

    bookmarksArr.forEach((movie) => renderBookmarks(movie));

    bookmarksList.innerHTML = null;
    bookmarksList.appendChild(bookmarksFragment);

    window.localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
  }
});
