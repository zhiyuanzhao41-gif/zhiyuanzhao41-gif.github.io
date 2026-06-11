/**
 * 模态框 & 灯箱 — 文章阅读弹窗、图片浏览、关闭事件、键盘导航
 */
'use strict';

/* ============================================================
   4. 模态框（文章阅读）
   ============================================================ */
let modalActive = false;
let modalFocusBefore = null;

function openModal(articleId) {
  const article = siteData.tech.find(t => t.id === articleId);
  if (!article) return;

  const overlay = $('#modal-overlay');
  if (!overlay) return;

  $('#modal-tag').textContent = article.category;
  $('#modal-title').textContent = article.title;
  $('#modal-date').textContent = article.date;
  $('#modal-text').innerHTML = article.content;

  modalFocusBefore = document.activeElement;
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('open'));
  overlay.setAttribute('aria-hidden', 'false');
  modalActive = true;

  // 焦点进入模态框
  const closeBtn = $('.modal-close', overlay);
  if (closeBtn) closeBtn.focus();

  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = $('#modal-overlay');
  if (!overlay) return;

  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  modalActive = false;
  document.body.style.overflow = '';

  setTimeout(() => overlay.classList.add('hidden'), 310);

  if (modalFocusBefore) modalFocusBefore.focus();
}

/* ============================================================
   5. 灯箱（图片浏览）
   ============================================================ */
let lightboxIndex = 0;
let lightboxOpen = false;

function openLightbox(index) {
  const lb = $('#lightbox');
  if (!lb) return;

  lightboxIndex = index;
  lightboxOpen = true;
  updateLightboxImage();

  lb.classList.remove('hidden');
  requestAnimationFrame(() => lb.classList.add('open'));
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  $('.lightbox-close', lb).focus();
}

function closeLightbox() {
  const lb = $('#lightbox');
  if (!lb) return;

  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  lightboxOpen = false;
  document.body.style.overflow = '';

  setTimeout(() => lb.classList.add('hidden'), 310);
}

function updateLightboxImage() {
  const item = siteData.gallery[lightboxIndex];
  if (!item) return;

  const img = $('#lightbox-img');
  const caption = $('#lightbox-caption');
  const counter = $('#lightbox-counter');

  if (item.src) {
    img.src = item.src;
    img.alt = item.alt;
    img.style.display = '';
    // 找到下一个兄弟占位元素
    const placeholders = $$('.gallery-placeholder');
  } else {
    // 占位图在灯箱中不显示图片
    img.style.display = 'none';
  }

  if (caption) caption.textContent = item.alt || item.emoji || '';
  if (counter) counter.textContent = `${lightboxIndex + 1} / ${siteData.gallery.length}`;
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % siteData.gallery.length;
  updateLightboxImage();
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + siteData.gallery.length) % siteData.gallery.length;
  updateLightboxImage();
}

/* ============================================================
   9. 模态框 & 灯箱关闭事件
   ============================================================ */
function initOverlayClose() {
  // 模态框关闭
  const modalOverlay = $('#modal-overlay');
  if (modalOverlay) {
    $('.modal-close', modalOverlay).addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // 灯箱关闭
  const lightbox = $('#lightbox');
  if (lightbox) {
    $('.lightbox-close', lightbox).addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    $('.lightbox-next', lightbox).addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxNext();
    });
    $('.lightbox-prev', lightbox).addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxPrev();
    });
  }
}

/* ============================================================
   10. 键盘导航
   ============================================================ */
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Escape → 关闭模态框或灯箱
    if (e.key === 'Escape') {
      if (lightboxOpen) {
        closeLightbox();
        return;
      }
      if (modalActive) {
        closeModal();
        return;
      }
    }

    // 灯箱下的左右键切换
    if (lightboxOpen) {
      if (e.key === 'ArrowRight') { lightboxNext(); }
      if (e.key === 'ArrowLeft') { lightboxPrev(); }
    }

    // 模态框下的焦点陷阱
    if (modalActive && e.key === 'Tab') {
      const modal = $('#modal-overlay');
      if (!modal) return;
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
