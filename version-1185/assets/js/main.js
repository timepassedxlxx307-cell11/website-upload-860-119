(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var activeIndex = 0;

      function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
          slide.classList.toggle("active", current === activeIndex);
        });
        dots.forEach(function (dot, current) {
          dot.classList.toggle("active", current === activeIndex);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5200);
      }
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    var filterList = document.querySelector("[data-filter-list]");

    if (filterPanel && filterList) {
      var input = filterPanel.querySelector("[data-filter-input]");
      var year = filterPanel.querySelector("[data-filter-year]");
      var type = filterPanel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

      function filterCards() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-category"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var matchedType = !typeValue || card.getAttribute("data-type").indexOf(typeValue) !== -1;
          card.classList.toggle("hidden-card", !(matchedKeyword && matchedYear && matchedType));
        });
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", filterCards);
          element.addEventListener("change", filterCards);
        }
      });
    }

    var searchInput = document.getElementById("siteSearchInput");
    var searchType = document.getElementById("siteSearchType");
    var searchResults = document.getElementById("searchResults");

    if (searchInput && searchResults && window.SITE_MOVIES) {
      function buildResult(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";

        var link = document.createElement("a");
        link.className = "poster-link";
        link.href = movie.url;

        var image = document.createElement("img");
        image.src = movie.cover;
        image.alt = movie.title;
        image.loading = "lazy";

        var gradient = document.createElement("span");
        gradient.className = "poster-gradient";

        var type = document.createElement("span");
        type.className = "card-type";
        type.textContent = movie.type;

        link.appendChild(image);
        link.appendChild(gradient);
        link.appendChild(type);

        var body = document.createElement("div");
        body.className = "card-body";

        var title = document.createElement("h3");
        var titleLink = document.createElement("a");
        titleLink.href = movie.url;
        titleLink.textContent = movie.title;
        title.appendChild(titleLink);

        var description = document.createElement("p");
        description.textContent = movie.description;

        var meta = document.createElement("div");
        meta.className = "card-meta";
        [movie.year, movie.region, movie.category].forEach(function (value) {
          var span = document.createElement("span");
          span.textContent = value;
          meta.appendChild(span);
        });

        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(meta);
        article.appendChild(link);
        article.appendChild(body);
        return article;
      }

      function renderSearch() {
        var keyword = searchInput.value.trim().toLowerCase();
        var typeValue = searchType ? searchType.value : "";
        var results = window.SITE_MOVIES.filter(function (movie) {
          var text = [movie.title, movie.region, movie.type, movie.category, movie.tags, movie.year].join(" ").toLowerCase();
          var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
          var typeMatched = !typeValue || movie.type.indexOf(typeValue) !== -1;
          return keywordMatched && typeMatched;
        }).slice(0, 80);

        searchResults.innerHTML = "";
        results.forEach(function (movie) {
          searchResults.appendChild(buildResult(movie));
        });
      }

      searchInput.addEventListener("input", renderSearch);
      if (searchType) {
        searchType.addEventListener("change", renderSearch);
      }
      renderSearch();
    }
  });
})();
