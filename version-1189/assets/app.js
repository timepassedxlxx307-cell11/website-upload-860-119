(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-card-filter]');

  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('card-hidden', value && text.indexOf(value) === -1);
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="movie-card-poster" href="./' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
      '</a>' +
      '<div class="movie-card-content">' +
      '<div class="movie-card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.SEARCH_MOVIES) {
    var query = getQuery();
    var searchInput = document.querySelector('[data-search-input]');
    var titleNode = document.querySelector('[data-search-title]');

    if (searchInput) {
      searchInput.value = query;
    }

    var normalized = query.toLowerCase();
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      if (!normalized) {
        return movie.featured;
      }
      return movie.search.indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (titleNode) {
      titleNode.textContent = query ? '与“' + query + '”相关的影片' : '推荐影片';
    }

    searchResults.innerHTML = matches.map(createCard).join('') || '<div class="side-card"><h2>未找到相关内容</h2><p>可以尝试更换影片名称、题材、年份或地区继续搜索。</p></div>';
  }

  window.initVideoPlayer = function (source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    var hlsInstance = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      ready = true;
    }

    function beginPlayback() {
      attachSource();
      video.controls = true;

      if (overlay) {
        overlay.classList.add('hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
