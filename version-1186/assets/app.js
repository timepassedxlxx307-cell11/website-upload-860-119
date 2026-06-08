(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('[data-card-filter]');
  if (filterInput) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.getElementById('search-results');
  var searchTitle = document.querySelector('[data-search-title]');

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function buildCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    var link = document.createElement('a');
    link.className = 'movie-card-link';
    link.href = './' + item.file;
    var poster = document.createElement('div');
    poster.className = 'poster-wrap';
    var img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title;
    img.loading = 'lazy';
    var badge = document.createElement('span');
    badge.className = 'poster-badge';
    badge.textContent = item.type || '影视';
    poster.appendChild(img);
    poster.appendChild(badge);
    var body = document.createElement('div');
    body.className = 'card-body';
    var meta = document.createElement('div');
    meta.className = 'card-meta';
    var year = document.createElement('span');
    year.textContent = item.year || '';
    var region = document.createElement('span');
    region.textContent = item.region || '';
    meta.appendChild(year);
    meta.appendChild(region);
    var title = document.createElement('h3');
    title.textContent = item.title;
    var desc = document.createElement('p');
    desc.textContent = item.oneLine || '';
    var tags = document.createElement('div');
    tags.className = 'tag-row';
    var c = document.createElement('span');
    c.textContent = item.category || '';
    var g = document.createElement('span');
    g.textContent = item.genre || '';
    tags.appendChild(c);
    tags.appendChild(g);
    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(tags);
    link.appendChild(poster);
    link.appendChild(body);
    article.appendChild(link);
    return article;
  }

  function renderSearch() {
    if (!searchResults || !window.SiteSearchData) {
      return;
    }

    var query = (params().get('q') || '').trim();
    if (searchInput) {
      searchInput.value = query;
    }

    var normalized = query.toLowerCase();
    var data = window.SiteSearchData;
    var filtered = data.filter(function (item) {
      if (!normalized) {
        return true;
      }
      return item.index.indexOf(normalized) !== -1;
    }).slice(0, normalized ? 120 : 80);

    if (searchTitle) {
      searchTitle.textContent = normalized ? '“' + query + '”的搜索结果' : '热门影片';
    }

    searchResults.innerHTML = '';
    if (!filtered.length) {
      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有找到匹配影片';
      searchResults.appendChild(empty);
      return;
    }

    filtered.forEach(function (item) {
      searchResults.appendChild(buildCard(item));
    });
  }

  renderSearch();
})();
