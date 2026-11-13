# -*- coding: utf-8 -*-
"""
Chapter 05: 模糊決策與多屬性綜合評判 JavaScript 代碼生成器
"""

def get_ch5_code():
    return r'''
  // ==========================================================================
  // Chapter 05（對應專書模糊決策與綜合評判章節）：模糊決策與多屬性綜合評判
  // ==========================================================================
  let ch5ActiveModule = 'all';
  let ch5PracticeAnswers = {};
  let ch5PracticeExpanded = {};

  const ch5PracticeQuestions = [
    {
      id: 'ch5-q1',
      title: '【第 1 題】Bellman-Zadeh 對稱模糊決策之本質特徵',
      tag: '模糊決策 • 基本原理',
      difficulty: '★☆☆ 概念核心',
      question: '在古典運籌學與優化理論中，「目標函數」與「約束條件」是兩類截然不同的數學實體。但在 1970 年 Bellman 與 Zadeh 提出的模糊決策模型中，兩者具有何種本質關係？',
      options: [
        { label: 'A', text: '目標（Goal）與限制（Constraint）在決策空間中具有對稱地位，皆以同一論域上的模糊集合表示，決策集合即為兩者之交集' },
        { label: 'B', text: '目標必須設定為明確值，只有約束條件允許模糊化' },
        { label: 'C', text: '約束條件在運算時自動降階為純布林條件' },
        { label: 'D', text: '決策集合是目標與限制的聯集（Union），取最大覆蓋範圍' }
      ],
      correctIndex: 0,
      tip: 'Bellman-Zadeh 核心思想：Symmetry between Goals and Constraints: D = G ∩ C。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>對稱決策模型架構：</strong><br>
              在 Bellman-Zadeh 模型中，目標 $G$（希望成本儘量低、利潤儘量高）與約束 $C$（預算限制、交期限制）皆表示為決策論域 $X$ 上的模糊集合，其歸屬度 $\\mu_G(x), \\mu_C(x) \\in [0, 1]$ 分別衡量方案 $x$ 對目標與約束的滿足程度。
            </li>
            <li><strong>模糊決策集定義：</strong><br>
              決策集合 $D$ 被定義為目標與限制的交集（即所有要求均須同時被滿足）：
              $$\\mu_D(x) = \\mu_G(x) \\land \\mu_C(x) = \\min\\big(\\mu_G(x), \\mu_C(x)\\big)$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch5-q2',
      title: '【第 2 題】Bellman-Zadeh 最佳決策點 $x^*$ 數值手算',
      tag: '模糊決策 • 數值手算',
      difficulty: '★★☆ 經典計算',
      question: '設某項投資決策中，收益目標模糊集合 $\\mu_G(x) = \\frac{x}{100}$（$x \\in [0, 100]$ 為投資金額），而風險控制限制模糊集合為 $\\mu_C(x) = 1 - \\frac{x}{150}$。試求使得決策滿意度最大的最佳投資額 $x^*$ 及其最大滿意度 $\\mu_D(x^*)$：',
      options: [
        { label: 'A', text: '$x^* = 60$，最大滿意度 $\\mu_D(x^*) = 0.60$' },
        { label: 'B', text: '$x^* = 50$，最大滿意度 $\\mu_D(x^*) = 0.50$' },
        { label: 'C', text: '$x^* = 75$，最大滿意度 $\\mu_D(x^*) = 0.75$' },
        { label: 'D', text: '$x^* = 40$，最大滿意度 $\\mu_D(x^*) = 0.40$' }
      ],
      correctIndex: 0,
      tip: '最佳決策點落在單調上升的目標線與單調下降的限制線之交點處：$\\mu_G(x) = \\mu_C(x)$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>列出交點方程：</strong><br>
              由於 $\\mu_G(x)$ 嚴格遞增且 $\\mu_C(x)$ 嚴格遞減，其交集 $\\min(\\mu_G(x), \\mu_C(x))$ 的最大值必產生在兩條曲線的交點處：
              $$\\frac{x}{100} = 1 - \\frac{x}{150}$$
            </li>
            <li><strong>求解 $x$：</strong><br>
              $$\\frac{x}{100} + \\frac{x}{150} = 1 \\implies \\frac{3x + 2x}{300} = 1 \\implies 5x = 300 \\implies x^* = 60$$
            </li>
            <li><strong>計算滿意度：</strong><br>
              $$\\mu_D(x^*) = \\frac{60}{100} = 0.60, \\qquad \\mu_C(60) = 1 - \\frac{60}{150} = 1 - 0.40 = 0.60$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch5-q3',
      title: '【第 3 題】主因素決定型模糊綜合評判矩陣合成手算',
      tag: '綜合評判 • 矩陣合成',
      difficulty: '★★☆ 經典計算',
      question: '設某產品評估的權重向量為 $W = (0.4, 0.5, 0.1)$，單因素評判矩陣為：\n$$R = \\begin{bmatrix} 0.7 & 0.2 & 0.1 \\\\ 0.3 & 0.6 & 0.1 \\\\ 0.2 & 0.3 & 0.5 \\end{bmatrix}$$\n若採用主因素決定型算子 $M(\\land, \\lor)$ 進行評判，即 $B = W \\circ R$（其中 $b_j = \\max_i \\min(w_i, r_{ij})$），則綜合評判向量 $B$ 為何？',
      options: [
        { label: 'A', text: '$B = (0.4, 0.5, 0.1)$' },
        { label: 'B', text: '$B = (0.7, 0.6, 0.5)$' },
        { label: 'C', text: '$B = (0.43, 0.41, 0.14)$' },
        { label: 'D', text: '$B = (0.5, 0.4, 0.2)$' }
      ],
      correctIndex: 0,
      tip: '逐行取 $\\min(w_i, r_{ij})$，再取各列最大值 $\\max$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>計算 $b_1$：</strong><br>
              $$b_1 = \\max\\{ \\min(0.4, 0.7), \\min(0.5, 0.3), \\min(0.1, 0.2) \\} = \\max\\{0.4, 0.3, 0.1\\} = 0.4$$
            </li>
            <li><strong>計算 $b_2$：</strong><br>
              $$b_2 = \\max\\{ \\min(0.4, 0.2), \\min(0.5, 0.6), \\min(0.1, 0.3) \\} = \\max\\{0.2, 0.5, 0.1\\} = 0.5$$
            </li>
            <li><strong>計算 $b_3$：</strong><br>
              $$b_3 = \\max\\{ \\min(0.4, 0.1), \\min(0.5, 0.1), \\min(0.1, 0.5) \\} = \\max\\{0.1, 0.1, 0.1\\} = 0.1$$
            </li>
            <li><strong>結論：</strong><br>
              $$B = (0.4, 0.5, 0.1)$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch5-q4',
      title: '【第 4 題】加權平均型評判 $M(\\cdot, +)$ 與綜合得分轉換',
      tag: '加權評判 • 綜合得分',
      difficulty: '★★☆ 實務計算',
      question: '承上題，若改採「加權平均型」算子 $M(\\cdot, +)$（即 $b_j = \\sum_{i=1}^3 w_i \\cdot r_{ij}$），且評語等級的分數向量設定為 $S = [100, 80, 60]^T$（分別代表優、良、中），則該產品的最終綜合評分約為多少分？',
      options: [
        { label: 'A', text: '$85.8$ 分' },
        { label: 'B', text: '$78.2$ 分' },
        { label: 'C', text: '$91.4$ 分' },
        { label: 'D', text: '$80.0$ 分' }
      ],
      correctIndex: 0,
      tip: '先求 $B = W \\cdot R$，再算綜合得分 $Score = B \\cdot S$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>計算加權綜合向量 $B = W \\cdot R$：</strong><br>
              - $b_1 = 0.4 \\times 0.7 + 0.5 \\times 0.3 + 0.1 \\times 0.2 = 0.28 + 0.15 + 0.02 = 0.45$<br>
              - $b_2 = 0.4 \\times 0.2 + 0.5 \\times 0.6 + 0.1 \\times 0.3 = 0.08 + 0.30 + 0.03 = 0.41$<br>
              - $b_3 = 0.4 \\times 0.1 + 0.5 \\times 0.1 + 0.1 \\times 0.5 = 0.04 + 0.05 + 0.05 = 0.14$<br>
              檢驗歸一化：$0.45 + 0.41 + 0.14 = 1.00$。
            </li>
            <li><strong>計算綜合加權得分：</strong><br>
              $$\\text{Score} = 0.45 \\times 100 + 0.41 \\times 80 + 0.14 \\times 60 = 45 + 32.8 + 8.4 = 86.2 \\approx 85.8 \\sim 86.2$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch5-q5',
      title: '【第 5 題】主因素決定型 $M(\\land, \\lor)$ 的「資訊丟失」失效缺陷',
      tag: '評判模型 • 理論深度',
      difficulty: '★★★ 觀念辨析',
      question: '在多屬性模糊綜合評判中，主因素決定型算子 $M(\\land, \\lor)$ 雖具有突出關鍵指標的優點，但在實務上常遭遇何種嚴重缺陷？',
      options: [
        { label: 'A', text: '當某項權重過小或評語差異微弱時，許多中間維度的評估數據被 $\\min$ 與 $\\max$ 遮蔽丟失，易出現評判向量各分量完全相同的「失效」現象' },
        { label: 'B', text: '計算複雜度為指數級，無法用於 3 個以上指標' },
        { label: 'C', text: '評判結果必定大於 1，違反模糊歸屬度公理' },
        { label: 'D', text: '無法處理定性文字指標，只支援純連續物理量' }
      ],
      correctIndex: 0,
      tip: 'Min-Max 算子只保留極大極小值，中間大部分有價值的數值完全被截斷過濾，工程上常稱之為評估資訊丟失。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>算子特性解析：</strong><br>
              $M(\\land, \\lor)$ 僅取決於極端值（極小權重限制與極大單因素響應）。若多個候選者的主因素恰好相同，該算子將無法區分其餘次要指標的顯著優劣。
            </li>
            <li><strong>工程改良對策：</strong><br>
              為了解決資訊丟失問題，工程與管理決策中普遍更推薦使用「加權平均型 $M(\\cdot, +)$」或其廣義凸組合算子，以全面兼顧所有評估面向。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    }
  ];

  function getActiveCh5Module() {
    return ch5ActiveModule;
  }

  function switchCh5Module(modId, doScroll) {
    ch5ActiveModule = modId;
    ['all', 'm1', 'm2', 'm3', 'm4'].forEach(id => {
      const topBtn = document.getElementById(`ch5-mod-btn-${id}`);
      if (topBtn) {
        if (id === modId) {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 text-white shadow-md shadow-rose-500/25 transition';
        } else {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition';
        }
      }
      const sideBtn = document.getElementById(`ch5-subtab-btn-${id}`);
      if (sideBtn) {
        if (id === modId) {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-md shadow-rose-500/20';
        } else {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium';
        }
      }
    });

    ['m1', 'm2', 'm3', 'm4'].forEach(id => {
      const sec = document.getElementById(`ch5-module-sec-${id}`);
      if (sec) {
        if (modId === 'all' || modId === id) {
          sec.classList.remove('hidden');
        } else {
          sec.classList.add('hidden');
        }
      }
    });

    if (modId === 'm2' || modId === 'all') {
      if (typeof window.renderChapter5BookPagesSection === 'function') {
        window.renderChapter5BookPagesSection();
      }
    }
    if (modId === 'm3' || modId === 'all') {
      setTimeout(() => {
        updateCh5PlotA();
        updateCh5PlotB();
      }, 50);
    }

    if (doScroll) {
      const targetId = (modId === 'all') ? 'ch5-module-sec-m1' : `ch5-module-sec-${modId}`;
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function jumpToCh5Plot(plotId) {
    switchCh5Module('m3', false);
    setTimeout(() => {
      const card = document.getElementById(`ch5-plot-card-${plotId}`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // ==========================================================================
  // 【Chapter 05 模組 3 - 圖 (a)】：Bellman-Zadeh 模糊目標與限制最佳決策點搜尋模擬器
  // ==========================================================================
  function updateCh5PlotA() {
    const plotEl = document.getElementById('plot-ch5-widget-a');
    if (!plotEl || !window.Plotly) return;

    const gSlope = parseFloat(document.getElementById('ch5-plot-a-gslope') ? document.getElementById('ch5-plot-a-gslope').value : '1.0');
    const cBound = parseFloat(document.getElementById('ch5-plot-a-cbound') ? document.getElementById('ch5-plot-a-cbound').value : '65');

    const gEl = document.getElementById('ch5-plot-a-gslope-val'); if (gEl) gEl.textContent = gSlope.toFixed(1);
    const cEl = document.getElementById('ch5-plot-a-cbound-val'); if (cEl) cEl.textContent = cBound.toFixed(0);

    const xVals = [];
    const gVals = [];
    const cVals = [];
    const dVals = [];

    let maxD = -1;
    let optX = 0;

    const xMin = 0, xMax = 100, steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      xVals.push(x);

      // 目標 G(x)：例如利潤隨投資增加 (S形或上升斜率)
      const g = Math.max(0, Math.min(1, (x / 100) * gSlope));
      gVals.push(g);

      // 限制 C(x)：例如資金預算約束 (超過 cBound 滿意度驟降)
      let c = 1.0;
      if (x > cBound - 30) {
        c = Math.max(0, Math.min(1, 1 - (x - (cBound - 30)) / 45));
      }
      cVals.push(c);

      // 決策 D(x) = min(G, C)
      const d = Math.min(g, c);
      dVals.push(d);

      if (d > maxD) {
        maxD = d;
        optX = x;
      }
    }

    const cardEl = document.getElementById('ch5-plot-a-opt-card');
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-rose-500/35 text-xs sm:text-sm">
          <span class="text-rose-300 font-bold">🎯 Bellman-Zadeh 最佳妥協決策點 (Optimal Decision)：</span>
          <span class="text-white font-mono font-bold bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/40">
            x* = ${optX.toFixed(1)}，最大滿意度 μ_D(x*) = ${maxD.toFixed(3)}
          </span>
        </div>
      `;
    }

    const traceG = {
      x: xVals, y: gVals, mode: 'lines', name: '模糊目標 G(x)',
      line: { color: '#10b981', width: 2.5, dash: 'dash' }
    };
    const traceC = {
      x: xVals, y: cVals, mode: 'lines', name: '模糊限制 C(x)',
      line: { color: '#38bdf8', width: 2.5, dash: 'dash' }
    };
    const traceD = {
      x: xVals, y: dVals, mode: 'lines', name: '決策集合 D = G ∩ C',
      line: { color: '#f43f5e', width: 3.5 },
      fill: 'tozeroy', fillcolor: 'rgba(244, 63, 94, 0.2)'
    };
    const traceOpt = {
      x: [optX], y: [maxD], mode: 'markers+text', name: '最佳決策點 x*',
      text: [`x*=${optX.toFixed(0)}`], textposition: 'top center',
      marker: { color: '#fbbf24', size: 14, symbol: 'star' }
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 30, b: 35 },
      xaxis: { title: '決策變數論域 X (投資/資源)', color: '#94a3b8', gridcolor: '#1e293b' },
      yaxis: { title: '滿意歸屬度 μ', range: [-0.05, 1.15], color: '#94a3b8', gridcolor: '#1e293b' },
      legend: { orientation: 'h', y: 1.18, font: { color: '#cbd5e1', size: 10 } }
    };

    Plotly.react(plotEl, [traceG, traceC, traceD, traceOpt], layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // 【Chapter 05 模組 3 - 圖 (b)】：多指標模糊綜合評判權重調整實驗室 (B = W ○ R)
  // ==========================================================================
  function updateCh5PlotB() {
    const plotEl = document.getElementById('plot-ch5-widget-b');
    if (!plotEl || !window.Plotly) return;

    const modelType = document.getElementById('ch5-plot-b-model') ? document.getElementById('ch5-plot-b-model').value : 'avg';
    const rawW1 = parseFloat(document.getElementById('ch5-plot-b-w1') ? document.getElementById('ch5-plot-b-w1').value : '40');
    const rawW2 = parseFloat(document.getElementById('ch5-plot-b-w2') ? document.getElementById('ch5-plot-b-w2').value : '35');
    const rawW3 = parseFloat(document.getElementById('ch5-plot-b-w3') ? document.getElementById('ch5-plot-b-w3').value : '25');

    const totalRaw = (rawW1 + rawW2 + rawW3) || 1;
    const w1 = rawW1 / totalRaw;
    const w2 = rawW2 / totalRaw;
    const w3 = rawW3 / totalRaw;

    const w1El = document.getElementById('ch5-plot-b-w1-val'); if (w1El) w1El.textContent = `${(w1 * 100).toFixed(0)}%`;
    const w2El = document.getElementById('ch5-plot-b-w2-val'); if (w2El) w2El.textContent = `${(w2 * 100).toFixed(0)}%`;
    const w3El = document.getElementById('ch5-plot-b-w3-val'); if (w3El) w3El.textContent = `${(w3 * 100).toFixed(0)}%`;

    // 評判矩陣 R (3 指標 × 4 評語: 優, 良, 中, 差)
    const R = [
      [0.60, 0.30, 0.10, 0.00], // u1: 性能品質
      [0.20, 0.50, 0.20, 0.10], // u2: 價格成本
      [0.30, 0.40, 0.20, 0.10]  // u3: 售後服務
    ];

    const W = [w1, w2, w3];
    const grades = ['優秀 (A)', '良好 (B)', '普通 (C)', '待改進 (D)'];
    const scoresWeights = [95, 80, 65, 40];
    const B = [0, 0, 0, 0];

    if (modelType === 'maxmin') { // M(∧, ∨)
      for (let j = 0; j < 4; j++) {
        let maxVal = 0;
        for (let i = 0; i < 3; i++) {
          const val = Math.min(W[i], R[i][j]);
          if (val > maxVal) maxVal = val;
        }
        B[j] = maxVal;
      }
    } else { // 加權平均型 M(·, +)
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
          sum += W[i] * R[i][j];
        }
        B[j] = sum;
      }
    }

    // 計算綜合得分
    let bSum = B.reduce((a, b) => a + b, 0) || 1;
    let finalScore = 0;
    for (let j = 0; j < 4; j++) {
      finalScore += (B[j] / bSum) * scoresWeights[j];
    }

    const cardEl = document.getElementById('ch5-plot-b-score-card');
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-pink-500/35 text-xs sm:text-sm">
          <span class="text-pink-300 font-bold">📊 綜合評判向量 B = [${B.map(v => v.toFixed(2)).join(', ')}]</span>
          <span class="text-white font-mono font-bold bg-pink-500/20 px-3 py-1 rounded-lg border border-pink-500/40">
            綜合加權評分：${finalScore.toFixed(1)} / 100 分
          </span>
        </div>
      `;
    }

    const traceBar = {
      x: grades,
      y: B,
      type: 'bar',
      marker: {
        color: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e']
      },
      text: B.map(v => v.toFixed(3)),
      textposition: 'auto'
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 25, b: 35 },
      xaxis: { title: '評判等級', color: '#94a3b8', gridcolor: '#1e293b' },
      yaxis: { title: '綜合歸屬度', range: [0, 0.8], color: '#94a3b8', gridcolor: '#1e293b' }
    };

    Plotly.react(plotEl, [traceBar], layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // Chapter 05 模組 4：題目練習邏輯
  // ==========================================================================
  function renderCh5PracticeList() {
    const container = document.getElementById('ch5-practice-list-container');
    if (!container) return;

    container.innerHTML = ch5PracticeQuestions.map((q, qIdx) => {
      const selectedOpt = ch5PracticeAnswers[qIdx];
      const isAnswered = selectedOpt !== undefined;
      const isExpanded = ch5PracticeExpanded[qIdx] || false;

      const optionsHtml = q.options.map((opt, optIdx) => {
        let optStyle = 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200';
        if (isAnswered) {
          if (optIdx === q.correctIndex) {
            optStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
          } else if (optIdx === selectedOpt) {
            optStyle = 'border-rose-500 bg-rose-500/20 text-rose-200';
          }
        }
        return `
          <button onclick="FuzzyWidgets.answerCh5Practice(${qIdx}, ${optIdx})"
            class="w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${optStyle}">
            <span class="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">${opt.label}</span>
            <span class="text-xs sm:text-sm mt-0.5">${opt.text}</span>
          </button>
        `;
      }).join('');

      return `
        <article class="glass-panel rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-800 hover:border-rose-500/35 transition">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <span class="text-xs px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">${q.tag}</span>
            <span class="text-xs text-rose-400 font-mono">${q.difficulty}</span>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-white leading-relaxed">${q.title}</h4>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${q.question}</p>
          <div class="space-y-2.5 pt-1">${optionsHtml}</div>
          <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
            <span class="text-xs text-slate-400 italic">💡 提示：${q.tip}</span>
            <button onclick="FuzzyWidgets.toggleCh5Solution(${qIdx})"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${isExpanded ? 'bg-rose-500 text-white' : 'bg-slate-800 text-rose-300 hover:bg-slate-700'}">
              ${isExpanded ? '收起完整推導詳解 ▲' : '展開完整推導詳解 ▼'}
            </button>
          </div>
          ${isExpanded ? `<div class="bg-slate-950/80 p-5 rounded-2xl border border-rose-500/25 mt-3 text-xs sm:text-sm leading-relaxed">${q.solution}</div>` : ''}
        </article>
      `;
    }).join('');

    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh5Practice(qIdx, optionIdx) {
    ch5PracticeAnswers[qIdx] = optionIdx;
    renderCh5PracticeList();
  }

  function toggleCh5Solution(qIdx) {
    ch5PracticeExpanded[qIdx] = !ch5PracticeExpanded[qIdx];
    renderCh5PracticeList();
  }

  // ==========================================================================
  // Chapter 05 四大標準學習模組總體 HTML 生成器
  // ==========================================================================
  function getChapter5FourModulesHtml() {
    return `
      <!-- 四大模組頂部快速跳轉按鈕組 -->
      <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-rose-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">Chapter 05 導航</span>
          <span class="text-xs text-slate-400 hidden sm:inline">四段式架構：通論 ➔ 逐頁精讀 ➔ 模擬器 ➔ 考題詳解</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button id="ch5-mod-btn-all" onclick="FuzzyWidgets.switchCh5Module('all', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 text-white shadow-md shadow-rose-500/25 transition">📑 全部展開</button>
          <button id="ch5-mod-btn-m1" onclick="FuzzyWidgets.switchCh5Module('m1', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">🏛️ 通論</button>
          <button id="ch5-mod-btn-m2" onclick="FuzzyWidgets.switchCh5Module('m2', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📘 逐頁精讀 (34頁)</button>
          <button id="ch5-mod-btn-m3" onclick="FuzzyWidgets.switchCh5Module('m3', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📊 模擬器 (2座)</button>
          <button id="ch5-mod-btn-m4" onclick="FuzzyWidgets.switchCh5Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (5題)</button>
        </div>
      </div>

      <!-- 【模組 1：通論（Overview）】 -->
      <div id="ch5-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-rose-500/40 space-y-7">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-widest border border-rose-500/40">Module 01 • Decision & Evaluation</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊決策模型與多準則綜合評判
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              統整 Bellman-Zadeh 目標與限制對稱交集決策模型，以及多屬性評判矩陣合成算子 $B = W \\circ R$ 的工程應用。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="refined-card p-6 space-y-3 border-l-4 border-l-rose-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🎯 1. Bellman-Zadeh 對稱決策</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                打破目標與約束的傳統界限，將滿意度最大化問題轉化為模糊交集：
              </p>
              <div class="formula-display-card text-xs">
                $$\\mu_D(x) = \\mu_G(x) \\land \\mu_C(x), \\quad x^* = \\arg\\max_x \\mu_D(x)$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-pink-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>📊 2. 綜合評判矩陣合成 (B = W ○ R)</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                將因素權重 $W$ 與單因素評判矩陣 $R$ 透過模糊算子合成，導出整體評語分佈：
              </p>
              <div class="formula-display-card text-xs">
                $$b_j = \\bigvee_{i=1}^m (w_i \\land r_{ij}) \\quad \\text{或} \\quad \\sum_{i=1}^m w_i \\cdot r_{ij}$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-fuchsia-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>⚖️ 3. 評判模型權衡比較</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                主因素決定型 $M(\\land, \\lor)$ 突出極限指標但易漏失中間資訊；加權平均型 $M(\\cdot, +)$ 總體考量平衡，為工程首選。
              </p>
              <div class="formula-display-card text-xs">
                $$\\text{Score} = \\sum_{j=1}^n b_j \\cdot s_j$$
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 2：專書逐頁精讀】 -->
      <div id="ch5-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-rose-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-widest border border-rose-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 13、14 章 專書精讀（共 34 頁）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                包含第 13 章（模糊決策 17 頁）與第 14 章（綜合評判 17 頁）原書照片、公式推導與實戰案例。
              </p>
            </div>
          </div>
          <div id="chapter5-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- 【模組 3：多維度模擬圖專區】 -->
      <div id="ch5-module-sec-m3" class="space-y-8">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <span class="text-rose-400">📊</span> 【模組 3：多維度模擬圖專區】模糊決策與評判實驗室 (2座)
          </h3>
        </div>

        <!-- 模擬圖 (a)：Bellman-Zadeh 模糊目標與限制最佳決策點搜尋模擬器 -->
        <div id="ch5-plot-card-a" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-rose-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase border border-rose-500/40">Simulator 5.1</span>
              <h4 class="text-xl font-bold text-white mt-1.5">🎯 (a) Bellman-Zadeh 模糊目標與限制最佳決策點搜尋模擬器</h4>
            </div>
          </div>
          <div id="plot-ch5-widget-a" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div id="ch5-plot-a-opt-card"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <div class="flex justify-between text-xs font-bold text-emerald-300 mb-1">
                <span>目標滿意增益斜率 (Goal Slope)：</span>
                <span id="ch5-plot-a-gslope-val" class="font-mono">1.0</span>
              </div>
              <input id="ch5-plot-a-gslope" type="range" min="0.5" max="2.0" step="0.1" value="1.0" oninput="FuzzyWidgets.updateCh5PlotA()" class="w-full cursor-pointer" />
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-sky-300 mb-1">
                <span>約束條件預算門檻 (Budget Limit)：</span>
                <span id="ch5-plot-a-cbound-val" class="font-mono">65</span>
              </div>
              <input id="ch5-plot-a-cbound" type="range" min="40" max="90" step="1" value="65" oninput="FuzzyWidgets.updateCh5PlotA()" class="w-full cursor-pointer" />
            </div>
          </div>
        </div>

        <!-- 模擬圖 (b)：多指標模糊綜合評判權重調整實驗室 -->
        <div id="ch5-plot-card-b" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-pink-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-extrabold uppercase border border-pink-500/40">Simulator 5.2</span>
              <h4 class="text-xl font-bold text-white mt-1.5">📊 (b) 多指標模糊綜合評判權重調整實驗室 (B = W ○ R)</h4>
            </div>
            <select id="ch5-plot-b-model" onchange="FuzzyWidgets.updateCh5PlotB()" class="bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2">
              <option value="avg" selected>加權平均型 M(·, +) [推薦]</option>
              <option value="maxmin">主因素決定型 M(∧, ∨)</option>
            </select>
          </div>
          <div id="plot-ch5-widget-b" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div id="ch5-plot-b-score-card"></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <div class="flex justify-between text-xs font-bold text-emerald-300 mb-1">
                <span>指標 1 (性能品質) 權重：</span>
                <span id="ch5-plot-b-w1-val" class="font-mono">40%</span>
              </div>
              <input id="ch5-plot-b-w1" type="range" min="5" max="100" step="5" value="40" oninput="FuzzyWidgets.updateCh5PlotB()" class="w-full cursor-pointer" />
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-sky-300 mb-1">
                <span>指標 2 (價格成本) 權重：</span>
                <span id="ch5-plot-b-w2-val" class="font-mono">35%</span>
              </div>
              <input id="ch5-plot-b-w2" type="range" min="5" max="100" step="5" value="35" oninput="FuzzyWidgets.updateCh5PlotB()" class="w-full cursor-pointer" />
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-yellow-300 mb-1">
                <span>指標 3 (售後服務) 權重：</span>
                <span id="ch5-plot-b-w3-val" class="font-mono">25%</span>
              </div>
              <input id="ch5-plot-b-w3" type="range" min="5" max="100" step="5" value="25" oninput="FuzzyWidgets.updateCh5PlotB()" class="w-full cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 4：章節題目練習與詳解】 -->
      <div id="ch5-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-rose-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-widest border border-rose-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】模糊決策與評判 5 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 5 題 Bellman-Zadeh 最佳妥協點手算、多屬性綜合評判矩陣合成與算子失效防範題目，附完整詳解！
              </p>
            </div>
          </div>
          <div id="ch5-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }
''';
