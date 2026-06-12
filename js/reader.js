/**
 * 小说作品 — 卡片渲染、数据加载
 */
'use strict';

/* ============================================================
   1. 小说卡片渲染
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
    <article class="card card-writing fade-in" role="listitem"
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

  // 点击卡片 → 新标签页打开阅读页
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card-writing');
    if (!card) return;
    const novelId = card.dataset.novelId;
    window.open(`reader.html?type=novel&id=${novelId}`, '_blank');
  });
}

/* ============================================================
   2. 小说数据加载
   ============================================================ */
let novelList = [];

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
