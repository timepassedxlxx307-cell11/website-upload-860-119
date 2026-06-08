(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = links.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var search = scope.querySelector("[data-card-search]");
            var type = scope.querySelector("[data-card-type]");
            var year = scope.querySelector("[data-card-year]");
            var category = scope.querySelector("[data-card-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (search && query) {
                search.value = query;
            }
            function apply() {
                var text = normalize(search && search.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var categoryValue = normalize(category && category.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var data = normalize(card.getAttribute("data-search"));
                    var ok = true;
                    if (text && data.indexOf(text) === -1) {
                        ok = false;
                    }
                    if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                        ok = false;
                    }
                    if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                        ok = false;
                    }
                    if (categoryValue && normalize(card.getAttribute("data-category")) !== categoryValue) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [search, type, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.CinemaPlayer = {
        init: function (videoId, layerId, source) {
            var video = document.getElementById(videoId);
            var layer = document.getElementById(layerId);
            if (!video || !source) {
                return;
            }
            var loaded = false;
            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            function start() {
                load();
                if (layer) {
                    layer.classList.add("is-hidden");
                }
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }
            if (layer) {
                layer.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
