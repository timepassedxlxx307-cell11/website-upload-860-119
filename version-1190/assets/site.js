(function () {
    const body = document.body;
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            const open = mobilePanel.classList.toggle('is-open');
            body.classList.toggle('menu-open', open);
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
                dot.setAttribute('aria-current', i === current ? 'true' : 'false');
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startTimer();
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            startTimer();
            hero.addEventListener('mouseenter', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
            });
            hero.addEventListener('mouseleave', startTimer);
        }
    }

    const filterBars = Array.from(document.querySelectorAll('[data-filter-bar]'));
    filterBars.forEach(function (bar) {
        const scopeSelector = bar.getAttribute('data-filter-bar');
        const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        if (!scope) {
            return;
        }
        const cards = Array.from(scope.querySelectorAll('[data-card]'));
        const keyword = bar.querySelector('[data-filter-keyword]');
        const type = bar.querySelector('[data-filter-type]');
        const region = bar.querySelector('[data-filter-region]');
        const year = bar.querySelector('[data-filter-year]');
        const empty = document.querySelector('[data-no-results]');

        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : '';
        }

        function applyFilters() {
            const q = valueOf(keyword);
            const t = valueOf(type);
            const r = valueOf(region);
            const y = valueOf(year);
            let visible = 0;

            cards.forEach(function (card) {
                const hay = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                const ok = (!q || hay.indexOf(q) !== -1) &&
                    (!t || String(card.dataset.type || '').toLowerCase().indexOf(t) !== -1) &&
                    (!r || String(card.dataset.region || '').toLowerCase().indexOf(r) !== -1) &&
                    (!y || String(card.dataset.year || '').toLowerCase() === y);

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [keyword, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q && keyword) {
            keyword.value = q;
        }
        applyFilters();
    });

    const players = Array.from(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
        const video = player.querySelector('video');
        const cover = player.querySelector('[data-player-cover]');
        const src = player.getAttribute('data-video-url');
        let hls = null;
        let started = false;

        if (!video || !cover || !src) {
            return;
        }

        function attachSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                return;
            }
            video.src = src;
        }

        function play() {
            if (!started) {
                started = true;
                attachSource();
            }
            cover.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            const attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    cover.classList.remove('is-hidden');
                });
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
