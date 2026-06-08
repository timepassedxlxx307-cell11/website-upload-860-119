import { H as Hls } from './hls.js';

document.querySelectorAll('.movie-player').forEach((video) => {
  const stream = video.getAttribute('data-stream');
  const box = video.closest('.player-box');
  const cover = box ? box.querySelector('.player-cover') : null;
  let attached = false;

  const attach = () => {
    if (attached || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    attached = true;
  };

  const start = async () => {
    attach();
    if (box) {
      box.classList.add('is-playing');
    }
    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });
});
