/**
 * 渲染函数 — 技术卡片、兴趣爱好、画廊、花瓣、淡入动画
 */
'use strict';

/* ============================================================
   2. 渲染函数
   ============================================================ */

/** 渲染技术文章卡片 */
function renderTech() {
  const grid = $('#tech-grid');
  const filters = $('#tech-filters');
  if (!grid || !filters) return;

  // 收集标签
  const categories = [...new Set(siteData.tech.map(t => t.category))];

  // 渲染标签筛选按钮
  filters.innerHTML = `
    <button class="tag-pill active" data-cat="all">全部</button>
    ${categories.map(c => `<button class="tag-pill" data-cat="${c}">${c}</button>`).join('')}
  `;

  // 渲染卡片
  grid.innerHTML = siteData.tech.map((item, i) => `
    <article class="card card-tech fade-in" role="listitem" data-category="${item.category}" data-id="${item.id}">
      <span class="card-tag">${item.category}</span>
      <h3 class="card-title">${item.title}</h3>
      <p class="card-excerpt">${item.excerpt}</p>
      <div class="card-meta">
        <span class="card-meta-item">📅 ${item.date}</span>
      </div>
    </article>
  `).join('');

  // 筛选事件
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-pill');
    if (!btn) return;
    filters.querySelectorAll('.tag-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.cat;
    grid.querySelectorAll('.card-tech').forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
    });
  });
}

/** 渲染兴趣爱好 */
function renderHobbies() {
  const grid = $('#hobbies-grid');
  if (!grid) return;

  grid.innerHTML = siteData.hobbies.map((h, i) => `
    <div class="hobby-card fade-in" role="listitem" data-hobby-id="${h.id}" tabindex="0">
      <span class="hobby-emoji" aria-hidden="true">${h.emoji}</span>
      <h3 class="hobby-name">${h.name}</h3>
      <p class="hobby-desc">${h.desc}</p>
    </div>
  `).join('');

  // 点击展开/收起
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.hobby-card');
    if (!card) return;
    const wasExpanded = card.classList.contains('expanded');
    // 收起其他卡片
    grid.querySelectorAll('.hobby-card.expanded').forEach(c => c.classList.remove('expanded'));
    if (!wasExpanded) card.classList.add('expanded');
  });
}

/** 渲染画廊 */
function renderGallery() {
  const grid = $('#gallery-grid');
  if (!grid) return;

  grid.innerHTML = siteData.gallery.map((item, i) => {
    if (item.src) {
      return `
        <div class="gallery-item fade-in" role="listitem" data-index="${i}" tabindex="0">
          <img src="${item.src}" alt="${item.alt}" loading="lazy">
          <div class="gallery-caption-overlay">${item.alt}</div>
        </div>`;
    }
    return `
      <div class="gallery-item fade-in" role="listitem" data-index="${i}" tabindex="0">
        <div class="gallery-placeholder" style="background: linear-gradient(${item.gradient});">
          <span class="placeholder-emoji" aria-hidden="true">${item.emoji}</span>
        </div>
      </div>`;
  }).join('');
}

/** 创建樱花花瓣 */
function createPetals() {
  const container = $('#petals-container');
  if (!container) return;
  container.innerHTML = '';
  const count = window.matchMedia('(max-width: 768px)').matches ? 6 : 12;
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = '🌸';
    petal.setAttribute('aria-hidden', 'true');
    container.appendChild(petal);
  }
}

/* ============================================================
   8. 滚动淡入动画
   ============================================================ */
function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  // 延迟观察，等 DOM 渲染完成
  setTimeout(() => {
    $$('.fade-in').forEach(el => observer.observe(el));
  }, 200);

  // MutationObserver 用于动态添加的元素也支持 fade-in
  const mutationObs = new MutationObserver(() => {
    $$('.fade-in').forEach(el => {
      if (!el.classList.contains('visible') && !el.dataset.fadeObserved) {
        el.dataset.fadeObserved = '1';
        observer.observe(el);
      }
    });
  });
  mutationObs.observe(document.body, { childList: true, subtree: true });
}
