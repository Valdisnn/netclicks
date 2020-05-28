document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2",
    API_KEY = "3d7022d1750d182ef9b0480839d69a60",
    SERVER = "https://api.themoviedb.org/3";

  const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    locReload = document.querySelector('.loc_reload'),
    setTimeOnPage = document.querySelector('.set_data');

  const loading = document.createElement('div');
  loading.className = 'loading';

  const DBService = class {
    getData = async (url) => {
      const res = await fetch(url);
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(`Не удалось получить данные по адресу ${url}`)
      }
    };

    getTestData = () => {
      return this.getData('test.json');
    };

    getTestCard = () => {
      return this.getData('card.json');
    };

    getSearchResult = query => {
      return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-Ru`);
    };

    getTvShow = id => {
      return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-Ru`);
    };
  }

  const renderCard = (responce) => {
    'use strict';
    tvShowsList.textContent = '';

    if (responce.results.length) {
      tvShowsHead.textContent = 'Результат поиска';
      responce.results.forEach(item => {
        const {
          backdrop_path: backdrop,
          name: title,
          poster_path: poster,
          vote_average: vote,
          id
        } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.classList.add('tv-shows__item');
        card.innerHTML = `
        <a href="#" data-id=${id} class="tv-card">
          ${voteElem}
          <img class="tv-card__img"
              src="${posterIMG}"
              data-backdrop="${backdropIMG}"
              alt="${title}">
          <h4 class="tv-card__head">${title}</h4>
        </a>
      `;
        loading.remove();
        tvShowsList.append(card);
      });
    } else {
      loading.remove();
      tvShowsHead.textContent = 'По вашему запросу сериалов не найдено.'
    }
  };

  //поиск и вывод результатов поиска
  searchForm.addEventListener('submit', (event) => {
    'use strict';
    event.preventDefault();
    const value = searchFormInput.value.trim();
    if (value) {
      tvShows.append(loading);
      new DBService().getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = '';
  });

  //меню
  hamburger.addEventListener('click', () => {
    'use strict';
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
  });

  document.body.addEventListener('click', event => {
    'use strict';
    if (!event.target.closest('.left-menu')) {
      leftMenu.classList.remove('openMenu');
      hamburger.classList.remove('open');
    }
  });

  leftMenu.addEventListener('click', event => {
    'use strict';
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
      dropdown.classList.toggle('active');
      leftMenu.classList.add('openMenu');
      hamburger.classList.add('open');
    }
  });

  //смена карточки
  const swapAttrs = () => {
    'use strict';
    const card = event.target.closest('.tv-shows__item');
    if (card) {
      const img = card.querySelector('.tv-card__img');
      if (img.dataset.backdrop) {
        [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
      }
    }
  };

  tvShowsList.addEventListener('mouseover', swapAttrs);
  tvShowsList.addEventListener('mouseout', swapAttrs);

  //включение модального окна
  tvShowsList.addEventListener('click', (event) => {
    'use strict';
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');
    if (card) {
      tvShows.append(loading);

      new DBService().getTvShow(card.dataset.id)
        .then(responce => {

          if (responce.backdrop_path) {
            tvCardImg.src = IMG_URL + responce.poster_path;
            tvCardImg.alt = responce.name;
            posterWrapper.classList.remove('hide');
          } else {
            posterWrapper.classList.add('hide');
          }
          modalTitle.textContent = responce.name;
          genresList.innerHTML = '';
          for (const item of responce.genres) {
            genresList.innerHTML += `<li>${item.name}</li>`;
          }
          rating.textContent = responce.vote_average;
          description.textContent = responce.overview;
          modalLink.href = responce.homepage;

        })
        .then(() => {
          loading.remove();
          modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
          document.body.style.overfow = 'hidden';
          modal.classList.remove('hide');
        });

    }
  });

  // дата
  const timer = () => {
    'use strict';
    let now = new Date();
    let options = {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timezone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    setTimeOnPage.innerHTML = 'Привет, сейчас ' + now.toLocaleString('ru',options);
  };

  setInterval(timer, 1);

  // выключение модального окна
  modal.addEventListener('click', (event) => {
    'use strict';
    if (event.target.closest('.cross') ||
      event.target.classList.contains('modal')) {
      document.body.style.overflow = '';
      modal.classList.add('hide');
    }
  });

  // перезагрузка страницы
  locReload.addEventListener('click', () => {
    'use strict';
    location.reload();
  });
});