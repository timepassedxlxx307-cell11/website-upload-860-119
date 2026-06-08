(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  if (header && toggle) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var heroIndex = 0;
  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      var active = idx === heroIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle("is-active", idx === heroIndex);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5600);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector("[data-empty-state]");
  var activeFilter = "all";

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var query = normalize(filterInput ? filterInput.value : "");
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchFilter = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
      var show = matchQuery && matchFilter;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      filterInput.value = query;
    }
    filterInput.addEventListener("input", applyFilter);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter-value") || "all";
      Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applyFilter();
    });
  });

  applyFilter();
})();

function initializeMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !source) {
    return;
  }
  var attached = false;
  var hls = null;

  function attach() {
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
    } else {
      video.src = source;
    }
  }

  function play() {
    attach();
    button.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (!attached) {
      play();
    }
  });
  video.addEventListener("ended", function () {
    button.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
