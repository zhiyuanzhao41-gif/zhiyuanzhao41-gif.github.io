/**
 * 导航系统 — 汉堡菜单、平滑滚动、滚动监听、返回顶部、章节侧边栏
 */
'use strict';

/* ============================================================
   7. 导航系统
   ============================================================ */
function initNavigation() {
  const hamburger = $('#hamburger');
  const navLinks = $('#nav-links');
  const navbar = $('#navbar');

  // 汉堡菜单
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      const expanded = hamburger.classList.contains('active');
      hamburger.setAttribute('aria-expanded', expanded);
    });

    // 点击导航链接关闭菜单
    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 平滑滚动
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

	// 技术文章卡片点击 → 新标签页打开统一阅读页
  const techGrid = $('#tech-grid');
  if (techGrid) {
    techGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.card-tech');
      if (!card) return;
      window.open(`reader.html?type=tech&id=${card.dataset.id}`, '_blank');
    });
  }

  // 画廊点击 → 灯箱
  const galleryGrid = $('#gallery-grid');
  if (galleryGrid) {
    galleryGrid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;
      const idx = parseInt(item.dataset.index);
      openLightbox(idx);
    });
  }

  // 滚动监听：导航栏样式 + 活跃链接高亮 + 返回顶部
  const sections = $$('section[id]');
  const navItems = $$('.nav-links a[data-section]');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollState(sections, navItems, navbar);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function updateScrollState(sections, navItems, navbar) {
  const scrollY = window.scrollY;

  // 导航栏阴影
  if (navbar) {
    navbar.classList.toggle('scrolled', scrollY > 50);
  }

  // 活跃链接
  let currentId = '';
  for (const section of sections) {
    const top = section.offsetTop - 100;
    if (scrollY >= top) {
      currentId = section.id;
    }
  }
  navItems.forEach(link => {
    link.classList.toggle('active', link.dataset.section === currentId);
  });

  // 返回顶部按钮
  const backBtn = $('#back-to-top');
  if (backBtn) {
    backBtn.classList.toggle('visible', scrollY > 500);
  }
}

/* ============================================================
   11. 返回顶部按钮
   ============================================================ */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.id = 'back-to-top';
  btn.textContent = '↑';
  btn.setAttribute('aria-label', '返回顶部');
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(btn);
}

/* ============================================================
   12. 章节侧边栏切换
   ============================================================ */
function initChapterSidebar() {
  const toggle = $('#chapter-toggle');
  const sidebar = $('#chapter-sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggle.textContent = sidebar.classList.contains('collapsed') ? '☰' : '☰ 目录';
    toggle.setAttribute('aria-label',
      sidebar.classList.contains('collapsed') ? '展开目录' : '收起目录'
    );
  });
}
