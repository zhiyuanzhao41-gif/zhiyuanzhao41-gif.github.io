/**
 * 站点数据 & DOM 工具
 */
'use strict';

/* ============================================================
   0. 站点数据
   ============================================================ */

const siteData = {
  // 技术文章
  tech: [
    {
      id: 't1',
      category: 'JavaScript',
      title: '深入理解 async/await 异步编程模型',
      excerpt: '从 Promise 到 Generator，再到 async/await，本文梳理了 JavaScript 异步编程的演进历程，并通过大量实例帮助你彻底掌握这套现代异步方案。',
      date: '2026-05',
      content: '<p>async/await 是 JavaScript 中处理异步操作最优雅的方式。它基于 Promise 构建，但提供了更直观的同步式写法。</p><p>在本文中，我们将从基础概念出发，逐步深入到错误处理、并发控制、以及 V8 引擎底层的微任务调度机制。</p><p>一个常见的误区是认为 await 会阻塞整个线程——实际上它只是暂停当前 async 函数的执行，将控制权交还给事件循环。</p><p>对于需要高性能的场景，理解和正确使用 Promise.all、Promise.allSettled 等并发原语至关重要。本文也对比了它们在错误处理上的细微差异。</p>'
    },
    {
      id: 't2',
      category: 'Architecture',
      title: '微服务架构下的数据一致性保障',
      excerpt: '在分布式系统中，如何在微服务之间保证数据一致性是一个核心挑战。本文介绍 Saga 模式和事件溯源在实战中的应用。',
      date: '2026-04',
      content: '<p>在单体架构中，数据库事务可以轻松保证数据一致性。但当我们把系统拆分为微服务后，这个看似简单的问题变得异常复杂。</p><p>Saga 模式通过将一个大事务拆分为一系列本地事务，并提供补偿操作来保证最终一致性。</p><p>事件溯源（Event Sourcing）则从另一个角度解决问题——不直接存储当前状态，而是记录所有状态变更事件。</p>'
    },
    {
      id: 't3',
      category: 'CSS',
      title: '现代 CSS 布局：Grid vs Flexbox 场景选择指南',
      excerpt: 'Grid 和 Flexbox 各有所长，本文通过 12 个真实布局场景，总结出最清晰的选择策略。',
      date: '2026-03',
      content: '<p>Flexbox 擅长一维布局——要么是行，要么是列。当你需要让一组元素在一个方向上灵活排列时，Flexbox 是最佳选择。</p><p>Grid 则是二维布局的王者。当你的设计包含行和列的交错关系时，Grid 能让你用最少的代码实现最复杂的效果。</p>'
    },
    {
      id: 't4',
      category: 'AI',
      title: 'LLM 应用开发入门：从 Prompt 设计到 Agent 框架',
      excerpt: '大语言模型正在改变软件开发的方式。本文从 prompt engineering 基础讲起，逐步构建一个简单的 AI Agent。',
      date: '2026-02',
      content: '<p>大语言模型（LLM）的能力远不止聊天对话。通过精心设计的 prompt 和工具调用机制，我们可以让 LLM 成为能够自主规划和执行复杂任务的 Agent。</p><p>本文将从 prompt engineering 的基本原则开始，介绍 few-shot、chain-of-thought 等关键技术，然后逐步构建一个能够搜索、计算、调用 API 的智能代理。</p>'
    },
    {
      id: 't5',
      category: 'JavaScript',
      title: 'TypeScript 高级类型体操：一行代码理解 infer 关键字',
      excerpt: 'TypeScript 的类型系统堪称图灵完备，而 infer 是实现高级类型推导的核心。本文用直观的例子拆解它的工作原理。',
      date: '2026-01',
      content: '<p>infer 关键字允许我们在条件类型中声明一个类型变量，然后让 TypeScript 去推断（infer）这个变量应该是什么类型。</p><p>这听起来有点抽象，但通过几个实际场景——提取函数返回值类型、提取 Promise 内部类型、提取数组元素类型——你会很快掌握它。</p>'
    },
    {
      id: 't6',
      category: 'Design',
      title: '动漫风格 UI 设计：从配色到动效的系统化指南',
      excerpt: '将日系动漫的美学融入网页设计需要系统的方法。本文总结了一套可复用的设计令牌和动效规范。',
      date: '2025-12',
      content: '<p>动漫风格的 UI 设计不仅仅是"用粉色"那么简单。它需要一整套相互呼应的设计决策：柔和的渐变、圆润的边角、克制的阴影、富有节奏感的动画。</p><p>本文将这套设计语言系统化为 CSS 自定义属性，让你可以在任何项目中快速应用。</p>'
    }
  ],

  // 兴趣爱好
  hobbies: [
    {
      id: 'h1',
      emoji: '🎮',
      name: '游戏',
      desc: '热衷于 JRPG 和视觉小说，喜欢探讨游戏叙事与玩法机制的融合。最爱 Persona 系列和最终幻想。'
    },
    {
      id: 'h2',
      emoji: '📷',
      name: '摄影',
      desc: '喜欢用相机记录城市的天际线和街头的人文瞬间，偶尔也拍拍风景和星空。'
    },
    {
      id: 'h3',
      emoji: '🎵',
      name: '音乐',
      desc: 'J-Pop 和动漫 OST 是写代码时的最佳伴侣。whiteeeen、Aimer 和 RADWIMPS 是最喜欢的歌手。'
    },
    {
      id: 'h4',
      emoji: '📚',
      name: '阅读',
      desc: '科幻和小说的重度爱好者。喜欢大刘、村上春树，也在尝试创作自己的原创故事。'
    },
    {
      id: 'h5',
      emoji: '🍳',
      name: '烹饪',
      desc: '周末的厨房是第二实验室。正在挑战日式料理和中式面点，最近迷上了做可颂。'
    },
    {
      id: 'h6',
      emoji: '🏂',
      name: '滑雪',
      desc: '冬天最好的运动。虽然还是个菜鸟，但每次从雪道上飞驰而下的感觉都让人上瘾。'
    }
  ],

  // 图片画廊
  gallery: [
    { src: 'assets/images/gallery/photo1.jpg', alt: '晓美焰', caption: '' },
    { src: 'assets/images/gallery/photo4.png', alt: '萝莉百合', caption: '' },
    { src: 'assets/images/gallery/photo2.jpg', alt: '慈姐', caption: '' },
    { src: 'assets/images/gallery/photo5.jpeg', alt: '樱羽艾玛', caption: '' },
    { src: 'assets/images/gallery/photo6.jpg', alt: '夏美桃', caption: '' },
    { src: 'assets/images/gallery/photo3.jpg', alt: '三角初音', caption: '' }

  ]
};

/* ============================================================
   1. DOM 引用缓存
   ============================================================ */
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
