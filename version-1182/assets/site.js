(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(to) {
      if (!slides.length) {
        return;
      }
      index = (to + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initQuickFilter() {
    var input = document.getElementById('quick-search');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', value && haystack.indexOf(value) === -1);
      });
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card compact" data-card>',
      '<a class="poster-frame" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-glow"></span><span class="card-play">播放</span></a>',
      '<div class="card-body"><div class="card-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-tags">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div></article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var result = document.getElementById('search-result');
    if (!result || !window.MovieIndex) {
      return;
    }
    var input = document.getElementById('search-input');
    var type = document.getElementById('search-type');
    var category = document.getElementById('search-category');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;

    function render() {
      var query = input.value.trim().toLowerCase();
      var typeValue = type.value;
      var categoryValue = category.value;
      var matched = window.MovieIndex.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.category, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        if (categoryValue && movie.category !== categoryValue) {
          return false;
        }
        return true;
      }).slice(0, 120);
      result.innerHTML = matched.map(movieCard).join('');
    }

    input.addEventListener('input', render);
    type.addEventListener('change', render);
    category.addEventListener('change', render);
    render();
  }

  function initMoviePlayer(streamUrl) {
    var video = document.querySelector('.movie-video');
    var layer = document.querySelector('.play-layer');
    if (!video || !layer || !streamUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function begin() {
      attach();
      layer.classList.add('is-hidden');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    layer.addEventListener('click', begin);
    video.addEventListener('play', function () {
      layer.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        layer.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    initMobileMenu();
    initHero();
    initQuickFilter();
    initSearchPage();
  });
})();
