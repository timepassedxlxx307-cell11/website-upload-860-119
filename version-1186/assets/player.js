(function () {
  function bindPlayer(wrap) {
    var video = wrap.querySelector('.movie-player');
    var cover = wrap.querySelector('.player-cover');

    if (!video || !cover) {
      return;
    }

    var url = video.getAttribute('data-hls');
    var hls = null;
    var ready = false;

    function attach() {
      if (ready || !url) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attach();
      wrap.classList.add('is-playing');
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      wrap.classList.add('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player-wrap')).forEach(bindPlayer);
})();
