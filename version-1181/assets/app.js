(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setSearchForms() {
    document.querySelectorAll("form.site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + "?q=" + encodeURIComponent(value);
      });
    });
  }

  function setMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function setHero() {
    document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    });
  }

  function setFilters() {
    document.querySelectorAll(".filter-toolbar").forEach(function (toolbar) {
      var scope = toolbar.parentElement || document;
      var buttons = Array.prototype.slice.call(toolbar.querySelectorAll(".filter-button"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-target"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var values = card.getAttribute("data-filter-set") || "";
            var visible = value === "all" || values.indexOf(value) !== -1;
            card.classList.toggle("is-hidden", !visible);
          });
        });
      });
    });
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearch() {
    var results = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    if (!results || !status || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var box = document.querySelector(".big-search input[name='q']");
    if (box) {
      box.value = query;
    }
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var text = movie.search.toLowerCase();
      return terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
    }).slice(0, 120);
    status.textContent = matches.length ? "搜索结果：" + query : "没有找到匹配内容";
    results.innerHTML = matches.map(function (movie) {
      return [
        '<article class="movie-card movie-card-default">',
        '  <a class="poster-link" href="' + escapeText(movie.link) + '">',
        '    <img src="' + escapeText(movie.image) + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
        '    <span class="score-badge">' + escapeText(movie.score) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta"><a href="' + escapeText(movie.categoryLink) + '">' + escapeText(movie.category) + '</a><span>' + escapeText(movie.year) + '</span><span>' + escapeText(movie.type) + '</span></div>',
        '    <h3><a href="' + escapeText(movie.link) + '">' + escapeText(movie.title) + '</a></h3>',
        '    <p>' + escapeText(movie.description) + '</p>',
        '    <div class="card-foot"><span>' + escapeText(movie.genre) + '</span><a href="' + escapeText(movie.link) + '">立即观看</a></div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  window.initMoviePlayer = function (videoId, buttonId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !mediaUrl) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }
    function play() {
      prepare();
      video.controls = true;
      button.classList.add("is-hidden");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  ready(function () {
    setSearchForms();
    setMobileMenu();
    setHero();
    setFilters();
    renderSearch();
  });
})();
