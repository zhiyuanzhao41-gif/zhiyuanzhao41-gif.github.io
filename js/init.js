/**
 * 初始化入口 — 窗口 resize 处理 & 启动
 */
'use strict';

/* ============================================================
   13. 窗口 resize 处理（花瓣数量）
   ============================================================ */
let petalResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(petalResizeTimer);
  petalResizeTimer = setTimeout(createPetals, 300);
});

/* ============================================================
   14. 初始化
   ============================================================ */
async function init() {
  renderTech();
  renderHobbies();
  renderGallery();
  createPetals();
  initNavigation();
  initFadeIn();
  initOverlayClose();
  initKeyboard();
  initMusicPlayer();
  initBackToTop();
  initChapterSidebar();

  // 加载小说
  await loadNovelIndex();
  renderWritingCards(novelList);
  renderNovelTabs();
}

document.addEventListener('DOMContentLoaded', init);
