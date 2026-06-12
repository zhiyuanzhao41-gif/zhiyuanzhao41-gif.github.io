/**
 * 统一阅读页面 — 技术文章 & 小说共用
 * URL 参数：?type=tech&id=t1  或  ?type=novel&id=n1&ch=0
 */
'use strict';

/* ============================================================
   1. URL 参数解析
   ============================================================ */
const params = new URLSearchParams(window.location.search);
const readType = params.get('type');   // 'tech' | 'novel'
const readId   = params.get('id');

/* ============================================================
   2. DOM 引用（$ / $$ 由 site-data.js 提供）
   ============================================================ */
const body       = $('#reader-body');
const sidebar    = $('#reader-sidebar');
const chapters   = $('#sidebar-chapters');
const toggle     = $('#sidebar-toggle');
const progress   = $('#reader-progress');
const loading    = $('#reader-loading');
const pageTitle  = $('#page-title');
const readerType = $('#reader-type');

/* ============================================================
   3. 初始化入口
   ============================================================ */
(async function init() {
  if (readType === 'tech' && readId) {
    await renderTech(readId);
  } else if (readType === 'novel' && readId) {
    const ch = parseInt(params.get('ch') || '0');
    await renderNovel(readId, ch);
  } else {
    showError('缺少参数 — 请从博客首页进入阅读。<br><a href="index.html">← 返回博客</a>');
  }
})();

/* ============================================================
   4. 技术文章
   ============================================================ */
async function renderTech(id) {
  const article = siteData.tech.find(t => t.id === id);
  if (!article) {
    showError('文章未找到。<br><a href="index.html">← 返回博客</a>');
    return;
  }

  // 页面标题
  document.title = `${article.title} | Zhiyuan Zhao`;
  if (pageTitle) pageTitle.textContent = `${article.title} | Zhiyuan Zhao`;
  if (readerType) readerType.textContent = '文章阅读';

  // 正文
  body.innerHTML = `
    <div class="reader-progress" id="reader-progress" aria-hidden="true"></div>
    <div class="reader-meta">
      <span class="reader-tag">${article.category}</span>
      <span class="reader-date">📅 ${article.date}</span>
    </div>
    <h1 class="reader-title">${article.title}</h1>
    ${article.content}
  `;

  // 刷新 progress DOM 引用
  bindProgress();
}

/* ============================================================
   5. 小说阅读器
   ============================================================ */
let novelData = null;       // 小说元信息
let novelChapters = null;   // 章节数组 [{title, content}]
let currentCh = 0;

async function renderNovel(id, ch) {
  // 加载小说索引
  let novelList = [];
  try {
    const resp = await fetch('novels/index.json');
    if (!resp.ok) throw new Error('Failed');
    novelList = await resp.json();
  } catch (err) {
    showError('小说目录加载失败。<br><a href="index.html">← 返回博客</a>');
    return;
  }

  novelData = novelList.find(n => n.id === id);
  if (!novelData) {
    showError('小说未找到。<br><a href="index.html">← 返回博客</a>');
    return;
  }

  // 页面标题
  document.title = `${novelData.title} | Zhiyuan Zhao`;
  if (pageTitle) pageTitle.textContent = `${novelData.title} | Zhiyuan Zhao`;
  if (readerType) readerType.textContent = '小说阅读';

  // 加载小说内容
  try {
    const resp = await fetch('novels/' + novelData.file);
    if (!resp.ok) throw new Error('Failed');
    const md = await resp.text();
    novelChapters = Markdown.parse(md);
  } catch (err) {
    showError('小说内容加载失败。<br><a href="index.html">← 返回博客</a>');
    return;
  }

  if (!novelChapters || novelChapters.length === 0) {
    showError('小说内容为空。<br><a href="index.html">← 返回博客</a>');
    return;
  }

  // 显示侧边栏
  sidebar.classList.remove('hidden');

  // 渲染章节导航
  chapters.innerHTML = novelChapters.map((ch, i) => `
    <button class="chapter-link${i === 0 ? ' active' : ''}" data-idx="${i}">${ch.title}</button>
  `).join('');

  // 侧边栏折叠
  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      toggle.textContent = sidebar.classList.contains('collapsed') ? '☰' : '☰ 目录';
    });
  }

  // 章节点击
  chapters.addEventListener('click', (e) => {
    const link = e.target.closest('.chapter-link');
    if (!link) return;
    const idx = parseInt(link.dataset.idx);
    switchChapter(idx);
  });

  // 渲染初始章节
  const startCh = (ch >= 0 && ch < novelChapters.length) ? ch : 0;
  switchChapter(startCh);
}

function switchChapter(idx) {
  if (!novelChapters || idx < 0 || idx >= novelChapters.length) return;
  currentCh = idx;

  // 更新导航活跃状态
  $$('.chapter-link', chapters).forEach(l => {
    l.classList.toggle('active', parseInt(l.dataset.idx) === idx);
  });

  const ch = novelChapters[idx];
  body.innerHTML = `
    <div class="reader-progress" id="reader-progress" aria-hidden="true"></div>
    ${ch.title ? `<h2 class="novel-heading">${ch.title}</h2>` : ''}
    ${ch.content}
  `;

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 更新 URL（不刷新）
  const url = new URL(window.location);
  url.searchParams.set('ch', idx);
  window.history.replaceState({ ch: idx, id: readId }, '', url);

  // 刷新进度条
  bindProgress();
}

/* ============================================================
   6. 阅读进度条
   ============================================================ */
function bindProgress() {
  // 重新获取 DOM（因为 innerHTML 替换了）
  const prog = $('#reader-progress');
  if (!prog) return;

  let ticking = false;
  const update = () => {
    const rect = body.getBoundingClientRect();
    const totalH = body.scrollHeight - window.innerHeight;
    if (totalH <= 0) { prog.style.width = '0%'; return; }
    const scrolled = -rect.top;
    const pct = Math.min(100, Math.max(0, (scrolled / totalH) * 100));
    prog.style.width = pct + '%';
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // 初始值
  update();
}

/* ============================================================
   7. 错误 / 加载状态
   ============================================================ */
function showError(msg) {
  if (loading) loading.remove();
  if (body) {
    body.innerHTML = `
      <div class="reader-error">
        <span class="reader-error-icon">📖</span>
        <p>${msg}</p>
      </div>
    `;
  }
}
