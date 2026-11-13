# -*- coding: utf-8 -*-
"""
Chapter 04: 模糊數與擴展原理 JavaScript 代碼生成器
"""

def get_ch4_code():
    return r'''
  // ==========================================================================
  // Chapter 04（對應專書擴展原理與模糊數章節）：模糊數與擴展原理
  // ==========================================================================
  let ch4ActiveModule = 'all';
  let ch4PracticeAnswers = {};
  let ch4PracticeExpanded = {};

  const ch4PracticeQuestions = [
    {
      id: 'ch4-q1',
      title: '【第 1 題】Zadeh 擴展原理非單射映射計算（$y = x^2$）',
      tag: '擴展原理 • 核心計算',
      difficulty: '★★☆ 進階計算',
      question: '設模糊集合 $A$ 定義於實數論域 $\\mathbb{R}$，其歸屬函數為三角形模糊數 $A = (-2, 0, 2)$，即頂點在 $0$、左右底集端點在 $-2$ 與 $2$。若映射函數為 $f(x) = x^2$，試求映射後模糊集合 $B = f(A)$ 在 $y = 1$ 與 $y = 4$ 處的歸屬度 $\\mu_B(1)$ 與 $\\mu_B(4)$ 分別為何？',
      options: [
        { label: 'A', text: '$\\mu_B(1) = 0.5$ 且 $\\mu_B(4) = 0$' },
        { label: 'B', text: '$\\mu_B(1) = 0.25$ 且 $\\mu_B(4) = 0.5$' },
        { label: 'C', text: '$\\mu_B(1) = 0.75$ 且 $\\mu_B(4) = 0$' },
        { label: 'D', text: '$\\mu_B(1) = 1.0$ 且 $\\mu_B(4) = 0.5$' }
      ],
      correctIndex: 0,
      tip: '根據擴展原理：$\\mu_B(y) = \\sup_{x: x^2=y} \\mu_A(x) = \\max(\\mu_A(\\sqrt{y}), \\mu_A(-\\sqrt{y}))$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>分析原模糊集合 $\\mu_A(x)$：</strong><br>
              $\\mu_A(x)$ 為以 $0$ 為中心、寬度為 $2$ 的對稱三角形：
              $$\\mu_A(x) = \\begin{cases} 1 - \\frac{|x|}{2}, & |x| \\le 2 \\\\ 0, & |x| > 2 \\end{cases}$$
            </li>
            <li><strong>套用 Zadeh 擴展原理：</strong><br>
              對於映射 $y = f(x) = x^2$，原像點為 $x = \\pm \\sqrt{y}$（當 $y \\ge 0$）：
              $$\\mu_B(y) = \\sup_{x: x^2=y} \\mu_A(x) = \\max\\left( \\mu_A(\\sqrt{y}), \\mu_A(-\\sqrt{y}) \\right)$$
              因為 $\\mu_A$ 是偶函數（對稱於原點），故 $\\mu_A(\\sqrt{y}) = \\mu_A(-\\sqrt{y}) = 1 - \\frac{\\sqrt{y}}{2}$。
            </li>
            <li><strong>計算數值：</strong><br>
              - 當 $y = 1$ 時：$\\mu_B(1) = 1 - \\frac{\\sqrt{1}}{2} = 1 - 0.5 = 0.5$。<br>
              - 當 $y = 4$ 時：$\\mu_B(4) = 1 - \\frac{\\sqrt{4}}{2} = 1 - 1 = 0$。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch4-q2',
      title: '【第 2 題】三角形模糊數之區間加法與 $\\alpha$-cut 性質',
      tag: '模糊數加法 • 區間算術',
      difficulty: '★☆☆ 基礎觀念',
      question: '給定兩個三角形模糊數 $A = (2, 5, 8)$ 與 $B = (1, 3, 6)$。試問其模糊和 $C = A \\oplus B$ 在 $\\alpha = 0.5$ 截集下的區間 $C_{0.5}$ 為何？',
      options: [
        { label: 'A', text: '$C_{0.5} = [5.5, 11.0]$' },
        { label: 'B', text: '$C_{0.5} = [3.5, 7.0]$' },
        { label: 'C', text: '$C_{0.5} = [4.0, 10.5]$' },
        { label: 'D', text: '$C_{0.5} = [6.0, 12.0]$' }
      ],
      correctIndex: 0,
      tip: '三角形模糊數的 $\\alpha$-cut 為 $A_\\alpha = [a_1 + \\alpha(a_2-a_1), a_3 - \\alpha(a_3-a_2)]$，區間加法為左右端點直接相加。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>求 $A_{0.5}$ 的區間：</strong><br>
              $A = (2, 5, 8)$，左端點 $2 + 0.5 \\times (5-2) = 2 + 1.5 = 3.5$；<br>
              右端點 $8 - 0.5 \\times (8-5) = 8 - 1.5 = 6.5$。<br>
              故 $A_{0.5} = [3.5, 6.5]$。
            </li>
            <li><strong>求 $B_{0.5}$ 的區間：</strong><br>
              $B = (1, 3, 6)$，左端點 $1 + 0.5 \\times (3-1) = 1 + 1 = 2.0$；<br>
              右端點 $6 - 0.5 \\times (6-3) = 6 - 1.5 = 4.5$。<br>
              故 $B_{0.5} = [2.0, 4.5]$。
            </li>
            <li><strong>執行區間加法：</strong><br>
              $$C_{0.5} = A_{0.5} + B_{0.5} = [3.5 + 2.0, 6.5 + 4.5] = [5.5, 11.0]$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch4-q3',
      title: '【第 3 題】模糊數減法的不確定性擴散定理（$A \\ominus A \\neq 0$）',
      tag: '模糊數減法 • 核心陷阱',
      difficulty: '★★☆ 必考陷阱',
      question: '在古典明確數中，若 $a$ 為實數則 $a - a = 0$。但在模糊數中，設 $A = (1, 3, 5)$ 為一對稱三角形模糊數，試計算 $A \\ominus A$ 的結果，並說明其物理意義：',
      options: [
        { label: 'A', text: '$A \\ominus A = (-4, 0, 4)$，表示減法運算使模糊度（不確定性）進一步擴大，而非相互抵消' },
        { label: 'B', text: '$A \\ominus A = (0, 0, 0)$，與古典代數完全相同，必然歸零' },
        { label: 'C', text: '$A \\ominus A = (1, 0, 1)$，僅保留端點不確定性' },
        { label: 'D', text: '$A \\ominus A = (-2, 0, 2)$，模糊寬度減半' }
      ],
      correctIndex: 0,
      tip: '區間減法定律：$[a_1, a_2] - [b_1, b_2] = [a_1 - b_2, a_2 - b_1]$。當兩個相同模糊數相減時，極小值減極大值會產生負向擴展。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>三角形模糊數參數減法：</strong><br>
              設 $A = (a_1, a_2, a_3) = (1, 3, 5)$。根據擴展原理與區間減法：
              $$A \\ominus B = (a_1 - b_3, a_2 - b_2, a_3 - b_1)$$
              當 $B = A$ 時：
              $$A \\ominus A = (1 - 5, 3 - 3, 5 - 1) = (-4, 0, 4)$$
            </li>
            <li><strong>物理意涵分析：</strong><br>
              模糊數代表「大約是 3」的測量值。兩次獨立抽取的「大約是 3」的測量值相減，可能出現最大差距 $(5 - 1 = 4)$ 或最小差距 $(1 - 5 = -4)$，因此不確定性反而累加擴散，這是模糊算術中群（Group）可逆反元素不存在的根本原因！
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch4-q4',
      title: '【第 4 題】正模糊數乘法與非線性邊界形狀',
      tag: '模糊數乘法 • 形狀畸變',
      difficulty: '★★★ 深度推導',
      question: '設正三角形模糊數 $A = (1, 2, 3)$ 與 $B = (2, 3, 4)$。若計算 $C = A \\otimes B$，下列敘述何者**錯誤**？',
      options: [
        { label: 'A', text: '映射結果 $C$ 的兩側邊界依然是嚴格的直線三角形' },
        { label: 'B', text: '$C$ 的頂點位置恰好在 $2 \\times 3 = 6$（歸屬度為 1）' },
        { label: 'C', text: '$C$ 的底集支撐區間為 $(1 \\times 2, 3 \\times 4) = (2, 12)$' },
        { label: 'D', text: '在任意 $\\alpha \\in (0, 1)$ 下，$C_\\alpha = [(1+\\alpha)(2+\\alpha), (3-\\alpha)(4-\\alpha)]$，其邊界為二次拋物線曲線' }
      ],
      correctIndex: 0,
      tip: '兩個一次多項式相乘產生二次多項式，因此乘積模糊數的邊界曲線呈現微幅彎曲的拋物線，不再是純直線！',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>檢驗各選項：</strong><br>
              - <strong>選項 B 正確：</strong>在 $\\alpha = 1$ 處，頂點為 $2 \\times 3 = 6$。<br>
              - <strong>選項 C 正確：</strong>在 $\\alpha = 0$ 處，底集端點為 $[1 \\times 2, 3 \\times 4] = [2, 12]$。<br>
              - <strong>選項 D 正確：</strong>$A_\\alpha = [1+\\alpha, 3-\\alpha]$，$B_\\alpha = [2+\\alpha, 4-\\alpha]$，其積端點包含 $\\alpha^2$ 項，為非線性二次拋物線。<br>
              - <strong>選項 A 錯誤：</strong>因為邊界函數為 $\\alpha$ 的二次方程，因此歸屬曲線 $y(x)$ 包含根號非線性，不是純直線三角形！
            </li>
            <li>題目詢問何者「錯誤」，故選 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch4-q5',
      title: '【第 5 題】模糊數除法之分母跨零奇異點判別',
      tag: '模糊數除法 • 奇異性',
      difficulty: '★★☆ 概念判定',
      question: '在定義模糊數除法 $C = A \\oslash B$ 時，為了保證結果 $C$ 仍為一個良定義（Well-defined）且有界支撐的模糊數，分母模糊數 $B$ 必須滿足下列哪項關鍵充要條件？',
      options: [
        { label: 'A', text: '實數 $0$ 不能包含在 $B$ 的底集支撐區間內（即 $0 \\notin \\text{Supp}(B)$，全正或全負）' },
        { label: 'B', text: '$B$ 的頂點必須大於等於 $1$' },
        { label: 'C', text: '$B$ 必須為對稱三角形模糊數' },
        { label: 'D', text: '$A$ 的寬度必須小於 $B$ 的寬度' }
      ],
      correctIndex: 0,
      tip: '區間除法 $[a_1, a_2] / [b_1, b_2] = [a_1, a_2] \\times [1/b_2, 1/b_1]$，若 $0 \\in [b_1, b_2]$ 則倒數會發散至無窮大。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>區間除法定義：</strong><br>
              $$[a_1, a_2] \\oslash [b_1, b_2] = [a_1, a_2] \\times [1/b_2, 1/b_1]$$
              只有在 $b_1 > 0$（全正）或 $b_2 < 0$（全負）時，$1/b$ 才是連續且有界的封閉區間。
            </li>
            <li><strong>跨零奇異點分析：</strong><br>
              若 $0 \\in \\text{Supp}(B) = (b_1, b_3)$，則當 $\\alpha \\to 0$ 時分母區間包含 $0$，導致倒數區間包含 $\\pm \\infty$，運算結果將發散破壞模糊數的有界性。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    }
  ];

  function getActiveCh4Module() {
    return ch4ActiveModule;
  }

  function switchCh4Module(modId, doScroll) {
    ch4ActiveModule = modId;
    ['all', 'm1', 'm2', 'm3', 'm4'].forEach(id => {
      const topBtn = document.getElementById(`ch4-mod-btn-${id}`);
      if (topBtn) {
        if (id === modId) {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 transition';
        } else {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition';
        }
      }
      const sideBtn = document.getElementById(`ch4-subtab-btn-${id}`);
      if (sideBtn) {
        if (id === modId) {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md shadow-amber-500/20';
        } else {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium';
        }
      }
    });

    ['m1', 'm2', 'm3', 'm4'].forEach(id => {
      const sec = document.getElementById(`ch4-module-sec-${id}`);
      if (sec) {
        if (modId === 'all' || modId === id) {
          sec.classList.remove('hidden');
        } else {
          sec.classList.add('hidden');
        }
      }
    });

    if (modId === 'm2' || modId === 'all') {
      if (typeof window.renderChapter4BookPagesSection === 'function') {
        window.renderChapter4BookPagesSection();
      }
    }
    if (modId === 'm3' || modId === 'all') {
      setTimeout(() => {
        updateCh4PlotA();
        updateCh4PlotB();
      }, 50);
    }

    if (doScroll) {
      const targetId = (modId === 'all') ? 'ch4-module-sec-m1' : `ch4-module-sec-${modId}`;
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function jumpToCh4Plot(plotId) {
    switchCh4Module('m3', false);
    setTimeout(() => {
      const card = document.getElementById(`ch4-plot-card-${plotId}`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // ==========================================================================
  // 【Chapter 04 模組 3 - 圖 (a)】：Zadeh 擴展原理非線性函數映射模擬器
  // ==========================================================================
  function updateCh4PlotA() {
    const plotEl = document.getElementById('plot-ch4-widget-a');
    if (!plotEl || !window.Plotly) return;

    const funcType = document.getElementById('ch4-plot-a-func') ? document.getElementById('ch4-plot-a-func').value : 'sq';
    const cVal = parseFloat(document.getElementById('ch4-plot-a-center') ? document.getElementById('ch4-plot-a-center').value : '1.0');
    const wVal = parseFloat(document.getElementById('ch4-plot-a-width') ? document.getElementById('ch4-plot-a-width').value : '1.2');

    const cDisplay = document.getElementById('ch4-plot-a-center-val');
    if (cDisplay) cDisplay.textContent = cVal.toFixed(1);
    const wDisplay = document.getElementById('ch4-plot-a-width-val');
    if (wDisplay) wDisplay.textContent = wVal.toFixed(1);

    // 產生輸入空間 X 的歸屬度曲線 A(x)
    const xVals = [];
    const aVals = [];
    const xMin = -3.5, xMax = 4.5, steps = 180;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      xVals.push(x);
      let mu = 0;
      if (Math.abs(x - cVal) < wVal) {
        mu = 1 - Math.abs(x - cVal) / wVal;
      }
      aVals.push(mu);
    }

    // 產生輸出空間 Y 的歸屬度曲線 B(y) = f(A)
    const yVals = [];
    const bVals = [];
    if (funcType === 'sq') { // y = x^2 (多對一映射)
      const yMin = 0, yMax = 12, ySteps = 160;
      for (let j = 0; j <= ySteps; j++) {
        const y = yMin + (yMax - yMin) * (j / ySteps);
        yVals.push(y);
        const xPos = Math.sqrt(y);
        const xNeg = -Math.sqrt(y);
        let muPos = 0, muNeg = 0;
        if (Math.abs(xPos - cVal) < wVal) muPos = 1 - Math.abs(xPos - cVal) / wVal;
        if (Math.abs(xNeg - cVal) < wVal) muNeg = 1 - Math.abs(xNeg - cVal) / wVal;
        bVals.push(Math.max(muPos, muNeg));
      }
    } else { // y = 2x + 1 (線性映射)
      const yMin = -6, yMax = 10, ySteps = 160;
      for (let j = 0; j <= ySteps; j++) {
        const y = yMin + (yMax - yMin) * (j / ySteps);
        yVals.push(y);
        const origX = (y - 1) / 2;
        let mu = 0;
        if (Math.abs(origX - cVal) < wVal) mu = 1 - Math.abs(origX - cVal) / wVal;
        bVals.push(mu);
      }
    }

    const traceInput = {
      x: xVals,
      y: aVals,
      mode: 'lines',
      name: '輸入模糊集合 A(x)',
      line: { color: '#38bdf8', width: 3 },
      fill: 'tozeroy',
      fillcolor: 'rgba(56, 189, 248, 0.15)'
    };

    const traceOutput = {
      x: yVals,
      y: bVals,
      mode: 'lines',
      name: funcType === 'sq' ? '映射模糊集合 B(y) = A(x²)' : '映射模糊集合 B(y) = A((y-1)/2)',
      line: { color: '#f59e0b', width: 3, dash: 'solid' },
      fill: 'tozeroy',
      fillcolor: 'rgba(245, 158, 11, 0.2)'
    };

    const layout = {
      title: {
        text: `Zadeh 擴展原理動態映射 (${funcType === 'sq' ? '非線性多對一: y = x²' : '單調線性: y = 2x + 1'})`,
        font: { color: '#e2e8f0', size: 14 }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 38, b: 38 },
      xaxis: { title: '變數軸 (X / Y 共同展示)', color: '#94a3b8', gridcolor: '#1e293b' },
      yaxis: { title: '歸屬度 μ', range: [-0.05, 1.15], color: '#94a3b8', gridcolor: '#1e293b' },
      legend: { orientation: 'h', y: 1.18, font: { color: '#cbd5e1', size: 11 } }
    };

    Plotly.react(plotEl, [traceInput, traceOutput], layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // 【Chapter 04 模組 3 - 圖 (b)】：三角形模糊數四則運算與 α-cut 區間動態合成圖表
  // ==========================================================================
  function updateCh4PlotB() {
    const plotEl = document.getElementById('plot-ch4-widget-b');
    if (!plotEl || !window.Plotly) return;

    const opType = document.getElementById('ch4-plot-b-op') ? document.getElementById('ch4-plot-b-op').value : 'add';
    const cA = parseFloat(document.getElementById('ch4-plot-b-ca') ? document.getElementById('ch4-plot-b-ca').value : '3.0');
    const wA = parseFloat(document.getElementById('ch4-plot-b-wa') ? document.getElementById('ch4-plot-b-wa').value : '1.5');
    const cB = parseFloat(document.getElementById('ch4-plot-b-cb') ? document.getElementById('ch4-plot-b-cb').value : '4.0');
    const wB = parseFloat(document.getElementById('ch4-plot-b-wb') ? document.getElementById('ch4-plot-b-wb').value : '1.2');
    const alphaVal = parseFloat(document.getElementById('ch4-plot-b-alpha') ? document.getElementById('ch4-plot-b-alpha').value : '0.5');

    const caEl = document.getElementById('ch4-plot-b-ca-val'); if (caEl) caEl.textContent = cA.toFixed(1);
    const waEl = document.getElementById('ch4-plot-b-wa-val'); if (waEl) waEl.textContent = wA.toFixed(1);
    const cbEl = document.getElementById('ch4-plot-b-cb-val'); if (cbEl) cbEl.textContent = cB.toFixed(1);
    const wbEl = document.getElementById('ch4-plot-b-wb-val'); if (wbEl) wbEl.textContent = wB.toFixed(1);
    const alphaEl = document.getElementById('ch4-plot-b-alpha-val'); if (alphaEl) alphaEl.textContent = alphaVal.toFixed(2);

    // α-cut 計算
    const aL = cA - wA * (1 - alphaVal);
    const aR = cA + wA * (1 - alphaVal);
    const bL = cB - wB * (1 - alphaVal);
    const bR = cB + wB * (1 - alphaVal);

    let resL = 0, resR = 0;
    let resCenter = 0, resLeft0 = 0, resRight0 = 0;

    if (opType === 'add') {
      resL = aL + bL; resR = aR + bR;
      resCenter = cA + cB;
      resLeft0 = (cA - wA) + (cB - wB);
      resRight0 = (cA + wA) + (cB + wB);
    } else if (opType === 'sub') {
      resL = aL - bR; resR = aR - bL;
      resCenter = cA - cB;
      resLeft0 = (cA - wA) - (cB + wB);
      resRight0 = (cA + wA) - (cB - wB);
    } else if (opType === 'mul') {
      resL = aL * bL; resR = aR * bR;
      resCenter = cA * cB;
      resLeft0 = (cA - wA) * (cB - wB);
      resRight0 = (cA + wA) * (cB + wB);
    } else if (opType === 'div') {
      if (bL > 0) {
        resL = aL / bR; resR = aR / bL;
        resCenter = cA / cB;
        resLeft0 = (cA - wA) / (cB + wB);
        resRight0 = (cA + wA) / (cB - wB);
      } else {
        resL = 0; resR = 0; resCenter = 0;
      }
    }

    const cardEl = document.getElementById('ch4-plot-b-result-card');
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="bg-slate-900/90 p-3 rounded-xl border border-sky-500/30">
            <span class="text-sky-300 font-bold">模糊數 A 區間：</span><br>
            A[α=${alphaVal.toFixed(2)}] = [${aL.toFixed(2)}, ${aR.toFixed(2)}]
          </div>
          <div class="bg-slate-900/90 p-3 rounded-xl border border-indigo-500/30">
            <span class="text-indigo-300 font-bold">模糊數 B 區間：</span><br>
            B[α=${alphaVal.toFixed(2)}] = [${bL.toFixed(2)}, ${bR.toFixed(2)}]
          </div>
          <div class="bg-slate-900/90 p-3 rounded-xl border border-amber-500/30">
            <span class="text-amber-300 font-bold">運算結果區間 C = A ${opType === 'add' ? '⊕' : opType === 'sub' ? '⊖' : opType === 'mul' ? '⊗' : '⊘'} B：</span><br>
            C[α=${alphaVal.toFixed(2)}] = <strong class="text-white font-mono">[${resL.toFixed(2)}, ${resR.toFixed(2)}]</strong>
          </div>
        </div>
      `;
    }

    // 繪製 A、B 與結果曲線
    const traceA = {
      x: [cA - wA, cA, cA + wA],
      y: [0, 1, 0],
      mode: 'lines',
      name: '模糊數 A',
      line: { color: '#38bdf8', width: 2.5 }
    };
    const traceB = {
      x: [cB - wB, cB, cB + wB],
      y: [0, 1, 0],
      mode: 'lines',
      name: '模糊數 B',
      line: { color: '#818cf8', width: 2.5 }
    };
    const traceRes = {
      x: [resLeft0, resCenter, resRight0],
      y: [0, 1, 0],
      mode: 'lines',
      name: `合成結果 C (${opType})`,
      line: { color: '#f59e0b', width: 3 },
      fill: 'tozeroy',
      fillcolor: 'rgba(245, 158, 11, 0.15)'
    };
    const traceCutLine = {
      x: [Math.min(cA - wA, resLeft0) - 1, Math.max(cB + wB, resRight0) + 1],
      y: [alphaVal, alphaVal],
      mode: 'lines',
      name: `α-Cut (${alphaVal.toFixed(2)}) 水平線`,
      line: { color: '#ef4444', width: 1.8, dash: 'dot' }
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 30, b: 35 },
      xaxis: { title: '實數論域 X', color: '#94a3b8', gridcolor: '#1e293b' },
      yaxis: { title: '歸屬度 μ', range: [-0.05, 1.15], color: '#94a3b8', gridcolor: '#1e293b' },
      legend: { orientation: 'h', y: 1.18, font: { color: '#cbd5e1', size: 10 } }
    };

    Plotly.react(plotEl, [traceA, traceB, traceRes, traceCutLine], layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // Chapter 04 模組 4：題目練習邏輯
  // ==========================================================================
  function renderCh4PracticeList() {
    const container = document.getElementById('ch4-practice-list-container');
    if (!container) return;

    container.innerHTML = ch4PracticeQuestions.map((q, qIdx) => {
      const selectedOpt = ch4PracticeAnswers[qIdx];
      const isAnswered = selectedOpt !== undefined;
      const isExpanded = ch4PracticeExpanded[qIdx] || false;

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
          <button onclick="FuzzyWidgets.answerCh4Practice(${qIdx}, ${optIdx})"
            class="w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${optStyle}">
            <span class="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">${opt.label}</span>
            <span class="text-xs sm:text-sm mt-0.5">${opt.text}</span>
          </button>
        `;
      }).join('');

      return `
        <article class="glass-panel rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-800 hover:border-amber-500/35 transition">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <span class="text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">${q.tag}</span>
            <span class="text-xs text-amber-400 font-mono">${q.difficulty}</span>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-white leading-relaxed">${q.title}</h4>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${q.question}</p>
          <div class="space-y-2.5 pt-1">${optionsHtml}</div>
          <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
            <span class="text-xs text-slate-400 italic">💡 提示：${q.tip}</span>
            <button onclick="FuzzyWidgets.toggleCh4Solution(${qIdx})"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${isExpanded ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'}">
              ${isExpanded ? '收起完整推導詳解 ▲' : '展開完整推導詳解 ▼'}
            </button>
          </div>
          ${isExpanded ? `<div class="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/25 mt-3 text-xs sm:text-sm leading-relaxed">${q.solution}</div>` : ''}
        </article>
      `;
    }).join('');

    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh4Practice(qIdx, optionIdx) {
    ch4PracticeAnswers[qIdx] = optionIdx;
    renderCh4PracticeList();
  }

  function toggleCh4Solution(qIdx) {
    ch4PracticeExpanded[qIdx] = !ch4PracticeExpanded[qIdx];
    renderCh4PracticeList();
  }

  // ==========================================================================
  // Chapter 04 四大標準學習模組總體 HTML 生成器
  // ==========================================================================
  function getChapter4FourModulesHtml() {
    return `
      <!-- 四大模組頂部快速跳轉按鈕組 -->
      <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">Chapter 04 導航</span>
          <span class="text-xs text-slate-400 hidden sm:inline">四段式架構：通論 ➔ 逐頁精讀 ➔ 模擬器 ➔ 考題詳解</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button id="ch4-mod-btn-all" onclick="FuzzyWidgets.switchCh4Module('all', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 transition">📑 全部展開</button>
          <button id="ch4-mod-btn-m1" onclick="FuzzyWidgets.switchCh4Module('m1', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">🏛️ 通論</button>
          <button id="ch4-mod-btn-m2" onclick="FuzzyWidgets.switchCh4Module('m2', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📘 逐頁精讀 (15頁)</button>
          <button id="ch4-mod-btn-m3" onclick="FuzzyWidgets.switchCh4Module('m3', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📊 模擬器 (2座)</button>
          <button id="ch4-mod-btn-m4" onclick="FuzzyWidgets.switchCh4Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (5題)</button>
        </div>
      </div>

      <!-- 【模組 1：通論（Overview）】 -->
      <div id="ch4-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-amber-500/40 space-y-7">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/40">Module 01 • Extension & Numbers Overview</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊數與 Zadeh 擴展原理解析
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              由古典清晰點值推廣至模糊數空間：Zadeh 擴展原理非單射映射架構、模糊數三大公理條件與 α-cut 區間算術運算定理。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="refined-card p-6 space-y-3 border-l-4 border-l-amber-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡ 1. Zadeh 擴展原理核心定理</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                將點對點函數 $f: X \\to Y$ 提升為模糊集合之映射。當存在多對一映射時，採用確界（$\\sup$）聚合所有原像：
              </p>
              <div class="formula-display-card text-xs">
                $$\\mu_B(y) = \\sup_{x: f(x)=y} \\mu_A(x)$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-orange-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>📐 2. 模糊數 (Fuzzy Number) 三大公理</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                實數軸上的模糊集合 $A$ 若被稱為模糊數，必須同時滿足：(1) 正規性 (Normality)；(2) 凸性 (Convexity，所有 $\\alpha$-cut 為封閉區間)；(3) 分段連續且支撐有界。
              </p>
              <div class="formula-display-card text-xs">
                $$\\mu_A(\\lambda x_1 + (1-\\lambda)x_2) \\ge \\min(\\mu_A(x_1), \\mu_A(x_2))$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-yellow-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🧮 3. α-cut 區間四則運算</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                將模糊數運算化簡為各水平高度 $\\alpha$ 上的古典閉區間運算：加法、減法、乘法與除法（分母不能包含 0），大幅加速手算與工程求解。
              </p>
              <div class="formula-display-card text-xs">
                $$[a_1, a_2] \\pm [b_1, b_2] = [a_1 \\pm b_2, a_2 \\pm b_1]$$
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 2：專書逐頁精讀】 -->
      <div id="ch4-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-amber-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 3 章 專書逐頁精讀（頁 3-1 ～ 3-15）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                完整收錄第 3 章共 15 頁原書照片、公式推導與必考重點解析，支援點擊圖檔全螢幕燈箱檢視。
              </p>
            </div>
          </div>
          <div id="chapter4-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- 【模組 3：多維度模擬圖專區】 -->
      <div id="ch4-module-sec-m3" class="space-y-8">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <span class="text-amber-400">📊</span> 【模組 3：多維度模擬圖專區】擴展原理與模糊算術實驗室 (2座)
          </h3>
        </div>

        <!-- 模擬圖 (a)：擴展原理函數映射動態模擬器 -->
        <div id="ch4-plot-card-a" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase border border-amber-500/40">Simulator 4.1</span>
              <h4 class="text-xl font-bold text-white mt-1.5">📈 (a) Zadeh 擴展原理非線性函數映射動態模擬器</h4>
            </div>
            <select id="ch4-plot-a-func" onchange="FuzzyWidgets.updateCh4PlotA()" class="bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2">
              <option value="sq" selected>非線性映射：y = x² (多對一 Sup 聚合)</option>
              <option value="lin">單調線性映射：y = 2x + 1</option>
            </select>
          </div>
          <div id="plot-ch4-widget-a" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <div class="flex justify-between text-xs font-bold text-amber-300 mb-1">
                <span>輸入模糊數中心位置 (c)：</span>
                <span id="ch4-plot-a-center-val" class="font-mono">1.0</span>
              </div>
              <input id="ch4-plot-a-center" type="range" min="-1.5" max="3.0" step="0.1" value="1.0" oninput="FuzzyWidgets.updateCh4PlotA()" class="w-full cursor-pointer" />
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-sky-300 mb-1">
                <span>模糊數寬度 (w)：</span>
                <span id="ch4-plot-a-width-val" class="font-mono">1.2</span>
              </div>
              <input id="ch4-plot-a-width" type="range" min="0.5" max="2.5" step="0.1" value="1.2" oninput="FuzzyWidgets.updateCh4PlotA()" class="w-full cursor-pointer" />
            </div>
          </div>
        </div>

        <!-- 模擬圖 (b)：三角形模糊數四則運算與 α-cut 區間動態合成圖表 -->
        <div id="ch4-plot-card-b" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-orange-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-extrabold uppercase border border-orange-500/40">Simulator 4.2</span>
              <h4 class="text-xl font-bold text-white mt-1.5">🧮 (b) 三角形模糊數四則運算與 α-Cut 區間動態合成圖表</h4>
            </div>
            <select id="ch4-plot-b-op" onchange="FuzzyWidgets.updateCh4PlotB()" class="bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2">
              <option value="add" selected>加法運算 (A ⊕ B)</option>
              <option value="sub">減法運算 (A ⊖ B)</option>
              <option value="mul">乘法運算 (A ⊗ B)</option>
              <option value="div">除法運算 (A ⊘ B)</option>
            </select>
          </div>
          <div id="plot-ch4-widget-b" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div id="ch4-plot-b-result-card"></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <div class="flex justify-between text-xs font-bold text-sky-300 mb-1">
                <span>模糊數 A 頂點：</span>
                <span id="ch4-plot-b-ca-val" class="font-mono">3.0</span>
              </div>
              <input id="ch4-plot-b-ca" type="range" min="1.0" max="5.0" step="0.2" value="3.0" oninput="FuzzyWidgets.updateCh4PlotB()" class="w-full cursor-pointer" />
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-indigo-300 mb-1">
                <span>模糊數 B 頂點：</span>
                <span id="ch4-plot-b-cb-val" class="font-mono">4.0</span>
              </div>
              <input id="ch4-plot-b-cb" type="range" min="2.0" max="6.0" step="0.2" value="4.0" oninput="FuzzyWidgets.updateCh4PlotB()" class="w-full cursor-pointer" />
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-rose-300 mb-1">
                <span>α-Cut 切割高度：</span>
                <span id="ch4-plot-b-alpha-val" class="font-mono">0.50</span>
              </div>
              <input id="ch4-plot-b-alpha" type="range" min="0.0" max="1.0" step="0.05" value="0.5" oninput="FuzzyWidgets.updateCh4PlotB()" class="w-full cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 4：章節題目練習與詳解】 -->
      <div id="ch4-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-amber-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】擴展原理與模糊數運算 5 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 5 題融合 Zadeh 擴展原理非單射映射、區間加減乘除與奇異點防範題目，點選答案即時檢驗並可展開完整 LaTeX 逐項推導！
              </p>
            </div>
          </div>
          <div id="ch4-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }
''';
