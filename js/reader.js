/**
 * 小说阅读器 — 卡片渲染、加载、章节导航、进度跟踪
 */
'use strict';

/* ============================================================
   2b. 小说卡片渲染
   ============================================================ */

/** 渲染小说作品卡片 */
function renderWritingCards(novels) {
  const grid = $('#writing-grid');
  if (!grid) return;

  if (!novels || novels.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--color-text-secondary);">还没有发布小说作品</p>';
    return;
  }

  grid.innerHTML = novels.map((novel, i) => `
    <article class="card card-writing fade-in${i === 0 ? ' featured' : ''}" role="listitem"
             data-novel-id="${novel.id}" tabindex="0">
      <span class="card-tag">${novel.type}</span>
      <h3 class="card-title">${novel.title}</h3>
      <p class="card-excerpt">${novel.description || ''}</p>
      <div class="card-meta">
        <span class="card-meta-item">✍️ ${novel.author}</span>
        <span class="card-meta-item">📄 ${(novel.wordCount / 10000).toFixed(1)}万字</span>
        <span class="card-meta-item">📌 ${novel.status}</span>
      </div>
    </article>
  `).join('');

  // 点击卡片跳转到阅读区
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card-writing');
    if (!card) return;
    const novelId = card.dataset.novelId;
    // 切换到阅读区
    document.querySelector('#reader').scrollIntoView({ behavior: 'smooth' });
    // 稍后激活对应小说标签
    setTimeout(() => activateNovelTab(novelId), 600);
  });
}

/* ============================================================
   3. 小说阅读器
   ============================================================ */
let novelList = [];
let currentNovelId = null;
let currentChapterIdx = 0;

async function loadNovelIndex() {
  try {
    const resp = await fetch('novels/index.json');
    if (!resp.ok) throw new Error('Failed to load novel index');
    novelList = await resp.json();
    return novelList;
  } catch (err) {
    console.warn('小说清单加载失败:', err);
    novelList = [];
    return [];
  }
}

async function loadNovelContent(novelId) {
  const novel = novelList.find(n => n.id === novelId);
  if (!novel) return null;
  try {
    const resp = await fetch('novels/' + novel.file);
    if (!resp.ok) throw new Error('Failed to load novel');
    const md = await resp.text();
    return Markdown.parse(md);
  } catch (err) {
    console.warn('小说内容加载失败:', err);
    return null;
  }
}

function renderNovelTabs() {
  const tabs = $('#novel-tabs');
  if (!tabs) return;
  if (novelList.length === 0) {
    tabs.innerHTML = '<p style="text-align:center;color:var(--color-text-secondary);">还没有小说</p>';
    return;
  }
  tabs.innerHTML = novelList.map(n => `
    <button class="novel-tab" data-novel-id="${n.id}" role="tab" aria-selected="false">${n.title}</button>
  `).join('');

  tabs.addEventListener('click', async (e) => {
    const btn = e.target.closest('.novel-tab');
    if (!btn) return;
    const novelId = btn.dataset.novelId;
    await activateNovelTab(novelId);
  });
}

async function activateNovelTab(novelId) {
  // 更新标签状态
  $$('.novel-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.novelId === novelId);
    t.setAttribute('aria-selected', t.dataset.novelId === novelId ? 'true' : 'false');
  });

  // 点击已激活的小说 → 收起
  if (currentNovelId === novelId) {
    closeNovelReader();
    return;
  }
  currentNovelId = novelId;
  currentChapterIdx = 0;

  const content = $('#reader-content');
  const chapterNav = $('#chapter-nav');
  if (!content) return;

  content.innerHTML = '<div class="reader-placeholder"><span class="reader-placeholder-icon">📖</span><p>加载中……</p></div>';

  const chapters = await loadNovelContent(novelId);
  if (!chapters || chapters.length === 0) {
    content.innerHTML = '<div class="reader-placeholder"><span class="reader-placeholder-icon">📖</span><p>加载失败</p></div>';
    return;
  }

  // 存储章节数据
  content._chapters = chapters;

  // 渲染章节导航
  if (chapterNav) {
    chapterNav.innerHTML = chapters.map((ch, i) => `
      <button class="chapter-link${i === 0 ? ' active' : ''}" data-idx="${i}">${ch.title}</button>
    `).join('');
  }

  // 显示第一章
  renderChapter(0);

  // 章节切换事件
  if (chapterNav) {
    chapterNav.onclick = (e) => {
      const link = e.target.closest('.chapter-link');
      if (!link) return;
      const idx = parseInt(link.dataset.idx);
      renderChapter(idx);
    };
  }
}

/** 收起阅读器，回到初始状态 */
function closeNovelReader() {
  currentNovelId = null;
  currentChapterIdx = 0;

  // 清除标签活跃状态
  $$('.novel-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });

  // 清除章节导航
  const chapterNav = $('#chapter-nav');
  if (chapterNav) chapterNav.innerHTML = '';

  // 恢复阅读器占位状态
  const content = $('#reader-content');
  if (content) {
    content._chapters = null;
    content.innerHTML = '<div class="reader-placeholder"><span class="reader-placeholder-icon" aria-hidden="true">📚</span><p>在上方选择一部小说开始阅读</p></div>';
  }
}

function renderChapter(idx) {
  const content = $('#reader-content');
  if (!content || !content._chapters) return;
  const chapters = content._chapters;
  if (idx < 0 || idx >= chapters.length) return;

  currentChapterIdx = idx;

  // 更新导航活跃状态
  $$('.chapter-link').forEach(l => {
    l.classList.toggle('active', parseInt(l.dataset.idx) === idx);
  });

  const ch = chapters[idx];
  content.innerHTML = `
    <div class="reader-progress" id="reader-progress"></div>
    ${ch.title ? `<h2 class="novel-heading">${ch.title}</h2>` : ''}
    ${ch.content}
  `;

  // 滚动到顶部
  document.querySelector('#reader').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 绑定阅读进度
  bindReaderScroll();
}

function bindReaderScroll() {
  const content = $('#reader-content');
  const progress = $('#reader-progress');
  if (!content || !progress) return;

  const updateProgress = () => {
    const rect = content.getBoundingClientRect();
    const totalHeight = content.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) { progress.style.width = '0%'; return; }
    const scrolled = -rect.top;
    const pct = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
    progress.style.width = pct + '%';
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
}
