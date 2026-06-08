(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });
    play();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    if (!forms.length || !window.SEARCH_INDEX) {
      return;
    }
    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var results = form.nextElementSibling;
      if (!input || !results || !results.hasAttribute("data-search-results")) {
        return;
      }
      function render(items) {
        if (!items.length) {
          results.innerHTML = '<div class="search-item"><span></span><span><strong>没有找到相关影片</strong><small>换个关键词试试</small></span></div>';
          results.classList.add("is-visible");
          return;
        }
        results.innerHTML = items.slice(0, 12).map(function (item) {
          return '<a class="search-item" href="' + item.url + '">' +
            '<span class="search-thumb" style="background-image: linear-gradient(180deg, rgba(17, 24, 39, 0.05), rgba(17, 24, 39, 0.66)), url(\'' + item.cover + '\');"></span>' +
            '<span><strong>' + item.title + '</strong><small>' + item.meta + '</small><span>' + item.text + '</span></span>' +
            '</a>';
        }).join("");
        results.classList.add("is-visible");
      }
      function search() {
        var q = normalize(input.value);
        if (!q) {
          results.classList.remove("is-visible");
          results.innerHTML = "";
          return;
        }
        var terms = q.split(/\s+/).filter(Boolean);
        var matches = window.SEARCH_INDEX.filter(function (item) {
          var haystack = normalize([item.title, item.meta, item.text, item.tags].join(" "));
          return terms.every(function (term) {
            return haystack.indexOf(term) !== -1;
          });
        });
        render(matches);
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        search();
      });
      input.addEventListener("input", search);
    });
  }

  window.initMoviePlayer = function (source) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      var overlay = document.getElementById("movieOverlay");
      var button = document.getElementById("moviePlayButton");
      var message = document.getElementById("playerMessage");
      if (!video || !overlay || !source) {
        return;
      }
      var attached = false;
      var hls = null;
      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
      }
      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("视频加载失败，请稍后再试");
            }
          });
        } else {
          video.src = source;
        }
      }
      function start() {
        attachSource();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }
      overlay.addEventListener("click", start);
      if (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          start();
        });
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
}());
