/**
 * 简易客户端 Markdown → HTML 解析器
 * 支持：# 标题、## 章节标题、**粗体**、段落拆分
 * 用于在浏览器中将 novels/*.md 转换为可渲染的 HTML
 */
'use strict';

const Markdown = (() => {

  /**
   * 解析 markdown 文本为章节数组
   * @param {string} md - markdown 原文
   * @returns {{ title: string, content: string }[]}
   */
  function parse(md) {
    // 标准化换行
    const text = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 按 ## 标题拆分为章节
    // 先找到第一个 ## 的位置
    const h2Regex = /^## (.+)$/gm;
    const chapters = [];

    // 找到所有 ## 标题的位置
    let match;
    const splits = [];
    while ((match = h2Regex.exec(text)) !== null) {
      splits.push({ title: match[1].trim(), index: match.index });
    }

    if (splits.length === 0) {
      // 没有章节，整篇作为一个章节
      chapters.push({
        title: '',
        content: parseInline(text)
      });
      return chapters;
    }

    // 提取每个章节的内容
    for (let i = 0; i < splits.length; i++) {
      const start = splits[i].index;
      const end = i + 1 < splits.length ? splits[i + 1].index : text.length;
      const rawContent = text.slice(start, end);

      // 去掉 ## 标题行本身
      const firstNewline = rawContent.indexOf('\n');
      const body = firstNewline >= 0 ? rawContent.slice(firstNewline + 1) : '';

      chapters.push({
        title: splits[i].title,
        content: parseInline(body.trim())
      });
    }

    return chapters;
  }

  /**
   * 解析行内格式：粗体
   */
  function parseInline(text) {
    // 按空行拆段落
    const paragraphs = text.split(/\n\n+/);
    let html = '';

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      let p = trimmed;

      // 单行判断：忽略 # 开头的顶级标题（适用于小说正文前的标题）
      // 如果段落只有一行且以 # 或 ## 开头，作为 heading
      const lines = p.split('\n');
      if (lines.length === 1 && /^#{1,2}\s/.test(p)) {
        const level = p.startsWith('## ') ? 2 : 1;
        const headingText = p.replace(/^#{1,2}\s/, '');
        html += `<h${level} class="novel-heading">${inlineFormat(headingText)}</h${level}>`;
        continue;
      }

      // 处理段落内的换行（单换行 → <br>）
      if (lines.length > 1) {
        p = lines.map(line => inlineFormat(line)).join('<br>');
      } else {
        p = inlineFormat(p);
      }

      html += `<p>${p}</p>`;
    }

    return html;
  }

  /**
   * 行内格式转换：**粗体**、*斜体*
   */
  function inlineFormat(text) {
    // 先粗体后斜体，避免 * 互相干扰
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  /**
   * 获取小说简介（第一段非标题文字）
   */
  function getExcerpt(md, maxLen = 150) {
    const text = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // 跳过标题行和空行，找到第一段正文
    const lines = text.split('\n');
    let paragraph = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      paragraph += trimmed;
      if (paragraph.length >= maxLen) break;
    }
    // 去掉 ** 标记
    const clean = paragraph.replace(/\*\*/g, '');
    return clean.length > maxLen ? clean.slice(0, maxLen) + '……' : clean;
  }

  return { parse, getExcerpt };
})();
