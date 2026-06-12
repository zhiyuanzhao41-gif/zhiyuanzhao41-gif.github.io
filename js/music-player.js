/**
 * 背景音乐播放器 — 右下角圆形 / 点击展开
 */
'use strict';

/* ============================================================
   1. 播放列表
   ============================================================ */

/** 播放列表：在此添加/修改音乐（将文件放入 assets/music/ 目录） */
const playlist = [
  { title: '枝江', artist: '九重临', src: 'assets/music/九重临,小心台階 - 枝江.mp3' },
  { title: 'キリトリセン（剪切线）', artist: '小日向美香', src: 'assets/music/小日向美香,长崎素世 - キリトリセン.mp3' },
  { title: 'キセキ～未来へ～', artist: 'whiteeeen', src: 'assets/music/whiteeeen - キセキ～未来へ～.mp3' }
];

let currentTrackIdx = 0;

/* ============================================================
   2. 初始化
   ============================================================ */
function initMusicPlayer() {
  const audio       = $('#bgm-audio');
  const player      = $('#music-player');
  const toggleBtn   = $('#music-toggle');
  const toggleIcon  = $('#music-toggle-icon');
  const panel       = $('#music-panel');
  const playBtn     = $('#music-play-btn');
  const playIcon    = $('.music-icon', playBtn);
  const volumeSlider = $('#volume-slider');
  const titleEl     = $('#music-title');
  const artistEl    = $('#music-artist');
  const indexEl     = $('#music-index');

  if (!audio || !toggleBtn || !panel) return;

  // 音量初始化
  const savedVol = localStorage.getItem('bgm-volume');
  audio.volume = savedVol ? parseFloat(savedVol) : 0.3;
  if (volumeSlider) volumeSlider.value = audio.volume * 100;

  let isPlaying = false;
  let expanded = false;

  /* ============================================================
     3. 歌曲加载
     ============================================================ */
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

    // 单曲时隐藏 prev/next
    if (playlist.length <= 1) {
      $$('.music-prev, .music-next').forEach(b => b.style.opacity = '0.35');
    } else {
      $$('.music-prev, .music-next').forEach(b => b.style.opacity = '');
    }
  }

  /* ============================================================
     4. 播放 / 暂停
     ============================================================ */
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      player.classList.remove('playing');
      setIcons('▶');
    } else {
      audio.play().then(() => {
        isPlaying = true;
        player.classList.add('playing');
        setIcons('⏸');
      }).catch(err => {
        console.log('音乐播放需要用户交互:', err);
      });
    }
  }

  function setIcons(icon) {
    if (toggleIcon) toggleIcon.textContent = icon;
    if (playIcon) playIcon.textContent = icon;
  }

  /* ============================================================
     5. 展开 / 收起
     ============================================================ */
  function expandPanel() {
    expanded = true;
    player.classList.add('expanded');
    toggleBtn.setAttribute('aria-label', '播放/暂停');
    toggleBtn.title = '播放/暂停';
  }

  function collapsePanel() {
    expanded = false;
    player.classList.remove('expanded');
    // 收起后图标恢复音符
    if (toggleIcon && !isPlaying) toggleIcon.textContent = '🎵';
    toggleBtn.setAttribute('aria-label', '展开音乐播放器');
    toggleBtn.title = '展开播放器';
  }

  /* ============================================================
     6. 事件绑定
     ============================================================ */

  // 圆形切换按钮：收起时展开，展开时播放/暂停
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!expanded) {
      expandPanel();
      // 展开后自动开始播放
      if (!isPlaying) togglePlay();
    } else {
      togglePlay();
    }
  });

  // 面板内播放按钮
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  // 上一首 / 下一首
  $$('.music-prev, .music-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (playlist.length <= 1) return;
      const wasPlaying = isPlaying;
      if (btn.classList.contains('music-prev')) {
        loadTrack(currentTrackIdx - 1);
      } else {
        loadTrack(currentTrackIdx + 1);
      }
      if (wasPlaying) {
        audio.play().then(() => {
          isPlaying = true;
          player.classList.add('playing');
          setIcons('⏸');
        }).catch(() => {});
      }
    });
  });

  // 点击播放器外部 → 收起面板
  document.addEventListener('click', (e) => {
    if (expanded && !player.contains(e.target)) {
      collapsePanel();
    }
  });

  // 播放结束自动切下一首
  audio.addEventListener('ended', () => {
    if (playlist.length > 1) {
      loadTrack(currentTrackIdx + 1);
      audio.play().then(() => {
        isPlaying = true;
        player.classList.add('playing');
        setIcons('⏸');
      }).catch(() => {
        isPlaying = false;
        player.classList.remove('playing');
        setIcons('▶');
      });
    } else {
      isPlaying = false;
      player.classList.remove('playing');
      setIcons('▶');
      if (!expanded && toggleIcon) toggleIcon.textContent = '🎵';
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
  });

  // 键盘快捷键：空格键控制播放/暂停
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement === document.body) {
      e.preventDefault();
      if (!expanded) expandPanel();
      togglePlay();
    }
  });

  // 初始化第一首
  loadTrack(0);
}
