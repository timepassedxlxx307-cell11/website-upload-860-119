(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    panels.forEach(function (panel) {
      var video = panel.querySelector("video");
      var trigger = panel.querySelector("[data-play-trigger]");
      var stream = video ? video.getAttribute("data-stream") : "";
      var started = false;
      var hls = null;

      function start() {
        if (!video || !stream) {
          return;
        }

        if (!started) {
          started = true;
          panel.classList.add("is-playing");

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
        }

        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  });
})();
