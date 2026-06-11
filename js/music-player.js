/**
 * 背景音乐播放器
 */
'use strict';

/* ============================================================
   6. 背景音乐播放器
   ============================================================ */

/** 播放列表：在此添加/修改音乐（将文件放入 assets/music/ 目录） */
const playlist = [
  { title: 'キセキ～未来へ～', artist: 'whiteeeen', src: 'assets/music/whiteeeen - キセキ～未来へ～.mp3' },
  { title: 'Hana', artist: 'Will Stetson', src: 'assets/music/Will Stetson - Hana.mp3' },
];

let currentTrackIdx = 0;

function initMusicPlayer() {
  const audio = $('#bgm-audio');
  const playBtn = $('#music-play-btn');
  const icon = $('.music-icon', playBtn);
  const volumeSlider = $('#volume-slider');
  const player = $('#music-player');
  const titleEl = $('#music-title');
  const artistEl = $('#music-artist');
  const indexEl = $('#music-index');

  if (!audio || !playBtn) return;

  // 音量初始化
  const savedVol = localStorage.getItem('bgm-volume');
  audio.volume = savedVol ? parseFloat(savedVol) : 0.3;
  if (volumeSlider) volumeSlider.value = audio.volume * 100;

  let isPlaying = false;

  /** 加载指定索引的歌曲 */
  function loadTrack(idx) {
    if (playlist.length === 0) return;
    idx = ((idx % playlist.length) + playlist.length) % playlist.length;
    currentTrackIdx = idx;
    const track = playlist[idx];
    audio.src = track.src;
    audio.load();

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (indexEl) indexEl.textContent = `${idx + 1}/${playlist.length}`;

    // 更新 prev/next 按钮状态
    if (playlist.length <= 1) {
      $$('.music-prev, .music-next').forEach(b => b.style.opacity = '0.35');
    } else {
      $$('.music-prev, .music-next').forEach(b => b.style.opacity = '');
    }
  }

  /** 播放或暂停 */
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      player.classList.remove('playing');
      playBtn.setAttribute('aria-label', '播放音乐');
      playBtn.title = '播放';
      icon.textContent = '▶';
      isPlaying = false;
    } else {
      audio.play().then(() => {
        player.classList.add('playing');
        playBtn.setAttribute('aria-label', '暂停音乐');
        playBtn.title = '暂停';
        icon.textContent = '⏸';
        isPlaying = true;
      }).catch(err => {
        console.log('音乐播放需要用户交互:', err);
      });
    }
  }

  /** 上一首 */
  function prevTrack() {
    if (playlist.length <= 1) return;
    const wasPlaying = isPlaying;
    loadTrack(currentTrackIdx - 1);
    if (wasPlaying) {
      audio.play().then(() => {
        isPlaying = true;
        player.classList.add('playing');
        icon.textContent = '⏸';
      }).catch(() => {});
    }
  }

  /** 下一首 */
  function nextTrack() {
    if (playlist.length <= 1) return;
    const wasPlaying = isPlaying;
    loadTrack(currentTrackIdx + 1);
    if (wasPlaying) {
      audio.play().then(() => {
        isPlaying = true;
        player.classList.add('playing');
        icon.textContent = '⏸';
      }).catch(() => {});
    }
  }

  // 播放/暂停按钮
  playBtn.addEventListener('click', togglePlay);

  // 上一首 / 下一首
  $('.music-prev', player)?.addEventListener('click', prevTrack);
  $('.music-next', player)?.addEventListener('click', nextTrack);

  // 播放结束自动切下一首
  audio.addEventListener('ended', () => {
    if (playlist.length > 1) {
      loadTrack(currentTrackIdx + 1);
      audio.play().then(() => {
        player.classList.add('playing');
        icon.textContent = '⏸';
        isPlaying = true;
      }).catch(() => {
        isPlaying = false;
        player.classList.remove('playing');
        icon.textContent = '▶';
      });
    } else {
      // 单曲循环
      isPlaying = false;
      player.classList.remove('playing');
      icon.textContent = '▶';
    }
  });

  // 音量滑块
  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value / 100;
      localStorage.setItem('bgm-volume', audio.volume);
    });
  }

  // 音频加载失败
  audio.addEventListener('error', () => {
    console.warn('音频加载失败:', audio.src);
    player.style.opacity = '0.5';
    playBtn.title = '音频加载失败';
  });

  // 键盘快捷键：空格键控制播放/暂停
  document.addEventListener('keydown', (e) => {
    // 不在输入框中时响应空格
    if (e.code === 'Space' && document.activeElement === document.body) {
      e.preventDefault();
      togglePlay();
    }
  });

  // 初始化第一首
  loadTrack(0);
}
