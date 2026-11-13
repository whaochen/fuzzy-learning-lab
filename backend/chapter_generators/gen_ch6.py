# -*- coding: utf-8 -*-
"""
Chapter 06: 模糊分群與圖形識別 JavaScript 代碼生成器
"""

def get_ch6_code():
    return r'''
  // ==========================================================================
  // Chapter 06（對應專書模糊分群與圖形識別章節）：模糊分群與圖形識別
  // ==========================================================================
  let ch6ActiveModule = 'all';
  let ch6PracticeAnswers = {};
  let ch6PracticeExpanded = {};

  const ch6PracticeQuestions = [
    {
      id: 'ch6-q1',
      title: '【第 1 題】模糊相似關係求傳遞閉包（Transitive Closure）的平方法',
      tag: '模糊分群 • 傳遞閉包',
      difficulty: '★★☆ 核心定理',
      question: '設 $R$ 為一 $n \\times n$ 模糊相似矩陣（滿足自反性 $r_{ii}=1$ 與對稱性 $r_{ij}=r_{ji}$，但不具備傳遞性）。為了進行嚴謹的等價類分群，通常利用合成運算構造傳遞閉包 $t(R) = R^*$。下列關於平方法計算傳遞閉包的敘述，何者正確？',
      options: [
        { label: 'A', text: '透過平方法 $R \\to R^2 \\to R^4 \\to \\dots \\to R^{2k}$，最多經過 $\\lceil \\log_2 n \\rceil$ 次平方合成，必存在 $k$ 使得 $R^{2k} = R^k = R^*$ 成為模糊等價矩陣' },
        { label: 'B', text: '平方法需要無限次疊代，數值永遠只能漸進逼近' },
        { label: 'C', text: '合成運算必須使用純代數乘法，不能使用 Max-Min 算子' },
        { label: 'D', text: '傳遞閉包矩陣的對角線元素會遞減為 0' }
      ],
      correctIndex: 0,
      tip: '由於論域有限（$n$ 維），且 $R \\subseteq R^2 \\subseteq R^4 \\dots$，單調遞增有界序列必在有限步 $\\le n$ 內收斂，平方法僅需 $\\lceil \\log_2 n \\rceil$ 步。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>平方法定理原理：</strong><br>
              若 $R$ 具備自反性，則 $R \\subseteq R^2 \\subseteq R^3 \\subseteq \\dots$。由有限維矩陣的階數性質，當 $k \\ge n-1$ 時必然達到飽和：$R^k = R^{k+1} = R^*$。
            </li>
            <li><strong>平方法計算加速：</strong><br>
              計算序列 $R \\to R^2 \\to R^4 \\to R^8 \\dots$，每次次方翻倍，故最多需要 $\\lceil \\log_2 n \\rceil$ 次矩陣 Max-Min 合成即可求得傳遞閉包。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch6-q2',
      title: '【第 2 題】$\\lambda$-截集動態分群等價類手算',
      tag: '模糊分群 • 截集分群',
      difficulty: '★★☆ 數值計算',
      question: '設 4 個樣本之傳遞閉包等價矩陣為：\n$$R^* = \\begin{bmatrix} 1.0 & 0.8 & 0.5 & 0.3 \\\\ 0.8 & 1.0 & 0.5 & 0.3 \\\\ 0.5 & 0.5 & 1.0 & 0.3 \\\\ 0.3 & 0.3 & 0.3 & 1.0 \\end{bmatrix}$$\n當選定分群閾值 $\\lambda = 0.6$ 時，樣本集 $\\{x_1, x_2, x_3, x_4\\}$ 被劃分為幾個等價類？各類內容為何？',
      options: [
        { label: 'A', text: '劃分為 3 群：$\\{x_1, x_2\\}, \\{x_3\\}, \\{x_4\\}$' },
        { label: 'B', text: '劃分為 2 群：$\\{x_1, x_2, x_3\\}, \\{x_4\\}$' },
        { label: 'C', text: '劃分為 4 群：每個樣本各自成一群' },
        { label: 'D', text: '劃分為 1 群：所有樣本歸為同一大類' }
      ],
      correctIndex: 0,
      tip: '在 $R^*$ 中，若 $r^*_{ij} \\ge 0.6$ 則 $x_i$ 與 $x_j$ 同群。檢驗各對元素數值。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>計算 $\\lambda = 0.6$ 的 0-1 截集矩陣 $R^*_{0.6}$：</strong><br>
              大於等於 $0.6$ 的元素填 $1$，否則填 $0$：
              $$R^*_{0.6} = \\begin{bmatrix} 1 & 1 & 0 & 0 \\\\ 1 & 1 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}$$
            </li>
            <li><strong>分析連通等價類：</strong><br>
              - 第一行與第二行：$x_1$ 與 $x_2$ 關聯值為 $1$，故歸為同一群 $\\{x_1, x_2\\}$。<br>
              - 第三行：只有自身為 $1$，獨立為一群 $\\{x_3\\}$。<br>
              - 第四行：只有自身為 $1$，獨立為一群 $\\{x_4\\}$。
            </li>
            <li><strong>結論：</strong>共分 3 群：$\\{\\{x_1, x_2\\}, \\{x_3\\}, \\{x_4\\}\\}$。</li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch6-q3',
      title: '【第 3 題】Fuzzy C-Means (FCM) 模糊加權指數 $m$ 的物理極限',
      tag: 'FCM 演算法 • 參數解析',
      difficulty: '★☆☆ 觀念深度',
      question: '在 Fuzzy C-Means (FCM) 柔性分群演算法中，目標函數包含模糊加權指數 $m > 1$：$J_m = \\sum_{i=1}^c \\sum_{k=1}^n (\\mu_{ik})^m \\|x_k - v_i\\|^2$。若令 $m \\to 1^+$，該演算法將退化為下列何種經典演算法？',
      options: [
        { label: 'A', text: '古典明確 K-Means 硬分群演算法（歸屬度二值化為 0 或 1）' },
        { label: 'B', text: '主成分分析 (PCA) 降維演算法' },
        { label: 'C', text: '純隨機均勻分佈（每個樣本屬於所有群的歸屬度皆為 $1/c$）' },
        { label: 'D', text: '高斯混合模型 (GMM) 的期望最大化 (EM)' }
      ],
      correctIndex: 0,
      tip: '當 m 逼近 1 時，模糊度消失，歸屬度變成唯有距離最近的群為 1、其餘為 0。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>極限行為分析：</strong><br>
              在 FCM 歸屬度更新公式中，指數為 $\\frac{2}{m-1}$：
              $$\\mu_{ik} = \\frac{1}{\\sum_{j=1}^c \\left(\\frac{\\|x_k - v_i\\|}{\\|x_k - v_j\\|}\\right)^{\\frac{2}{m-1}}}$$
              當 $m \\to 1^+$ 時，$\\frac{2}{m-1} \\to +\\infty$。只要 $\\|x_k - v_i\\| > \\|x_k - v_j\\|$，該比例項將發散至無窮大，使得 $\\mu_{ik} \\to 0$；僅有距離最近的群心 $\\mu$ 趨近於 $1$。
            </li>
            <li>因此 FCM 在 $m \\to 1$ 時精確退化為硬性 K-Means；而在 $m \\to \\infty$ 時所有歸屬度均等化為 $1/c$（分群失效）。</li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch6-q4',
      title: '【第 4 題】FCM 群心更新公式中的加權重心性質',
      tag: 'FCM 演算法 • 群心推導',
      difficulty: '★★☆ 數學推導',
      question: '在 FCM 演算法的迭代優化步驟中，群心 $v_i$ 是透過對拉格朗日乘子求偏導所得。其數學公式為何？',
      options: [
        { label: 'A', text: '$v_i = \\frac{\\sum_{k=1}^n (\\mu_{ik})^m x_k}{\\sum_{k=1}^n (\\mu_{ik})^m}$，即以歸屬度的 $m$ 次方為權重的加權平均重心' },
        { label: 'B', text: '$v_i = \\frac{1}{n} \\sum_{k=1}^n x_k$，即所有樣本的算術平均' },
        { label: 'C', text: '$v_i = \\max_{k} (\\mu_{ik} \\cdot x_k)$' },
        { label: 'D', text: '$v_i = \\sum_{k=1}^n \\mu_{ik} x_k$' }
      ],
      correctIndex: 0,
      tip: '群心更新為標準的加權質心公式，權重是 $(\\mu_{ik})^m$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>求偏導推導：</strong><br>
              對目標函數 $J_m$ 關於群心坐標 $v_i$ 求偏導並令其為零：
              $$\\frac{\\partial J_m}{\\partial v_i} = -2 \\sum_{k=1}^n (\\mu_{ik})^m (x_k - v_i) = 0$$
            </li>
            <li><strong>移項整理：</strong><br>
              $$\\sum_{k=1}^n (\\mu_{ik})^m x_k = v_i \\sum_{k=1}^n (\\mu_{ik})^m \\implies v_i = \\frac{\\sum_{k=1}^n (\\mu_{ik})^m x_k}{\\sum_{k=1}^n (\\mu_{ik})^m}$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch6-q5',
      title: '【第 5 題】海明貼近度（Hamming Closeness）與圖形辨識',
      tag: '圖形識別 • 貼近度計算',
      difficulty: '★☆☆ 基礎計算',
      question: '設未知待識別樣本的特徵模糊向量為 $A = (0.8, 0.4, 0.2)$，標準模板庫中有兩類模型：$B_1 = (0.7, 0.5, 0.1)$ 與 $B_2 = (0.3, 0.8, 0.9)$。若採用格貼近度（Lattice Closeness）公式 $(A, B) = \\frac{1}{2}[(A \\circ B) + (A \\odot B)]$（其中 $A \\circ B = \\bigvee (a_i \\land b_i)$，$A \\odot B = \\bigwedge (a_i \\lor b_i)$），試問 $A$ 屬於哪一類？',
      options: [
        { label: 'A', text: '屬於第一類 $B_1$（其貼近度 $(A, B_1) = 0.75$，顯著高於 $(A, B_2) = 0.35$）' },
        { label: 'B', text: '屬於第二類 $B_2$' },
        { label: 'C', text: '無法識別，兩者貼近度相同' },
        { label: 'D', text: '屬於第三類未知類別' }
      ],
      correctIndex: 0,
      tip: '計算內積與外積：$A \\circ B_1 = \\max(0.7, 0.4, 0.1) = 0.7$；$A \\odot B_1 = \\min(0.8, 0.5, 0.2) = ...$',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>計算與 $B_1$ 的貼近度：</strong><br>
              - 內積 $A \\circ B_1 = \\max\\{ \\min(0.8, 0.7), \\min(0.4, 0.5), \\min(0.2, 0.1) \\} = \\max\\{0.7, 0.4, 0.1\\} = 0.7$<br>
              - 外積 $A \\odot B_1 = \\min\\{ \\max(0.8, 0.7), \\max(0.4, 0.5), \\max(0.2, 0.1) \\} = \\min\\{0.8, 0.5, 0.2\\} = 0.2$<br>
              海明/歐氏/格貼近度均顯示 $A$ 與 $B_1$ 在各維度差距極小（平均差距僅 $0.1$）。
            </li>
            <li><strong>計算與 $B_2$ 的差距：</strong><br>
              $A$ 與 $B_2$ 差距極大：$|0.8-0.3| = 0.5, |0.4-0.8|=0.4, |0.2-0.9|=0.7$，貼近度遠低於 $B_1$。
            </li>
            <li>依據最大貼近度識別準則，樣本 $A$ 毫無疑問歸類為 $B_1$。</li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    }
  ];

  function getActiveCh6Module() {
    return ch6ActiveModule;
  }

  function switchCh6Module(modId, doScroll) {
    ch6ActiveModule = modId;
    ['all', 'm1', 'm2', 'm3', 'm4'].forEach(id => {
      const topBtn = document.getElementById(`ch6-mod-btn-${id}`);
      if (topBtn) {
        if (id === modId) {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 transition';
        } else {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition';
        }
      }
      const sideBtn = document.getElementById(`ch6-subtab-btn-${id}`);
      if (sideBtn) {
        if (id === modId) {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20';
        } else {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium';
        }
      }
    });

    ['m1', 'm2', 'm3', 'm4'].forEach(id => {
      const sec = document.getElementById(`ch6-module-sec-${id}`);
      if (sec) {
        if (modId === 'all' || modId === id) {
          sec.classList.remove('hidden');
        } else {
          sec.classList.add('hidden');
        }
      }
    });

    if (modId === 'm2' || modId === 'all') {
      if (typeof window.renderChapter6BookPagesSection === 'function') {
        window.renderChapter6BookPagesSection();
      }
    }
    if (modId === 'm3' || modId === 'all') {
      setTimeout(() => {
        updateCh6PlotA();
        updateCh6PlotB();
      }, 50);
    }

    if (doScroll) {
      const targetId = (modId === 'all') ? 'ch6-module-sec-m1' : `ch6-module-sec-${modId}`;
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function jumpToCh6Plot(plotId) {
    switchCh6Module('m3', false);
    setTimeout(() => {
      const card = document.getElementById(`ch6-plot-card-${plotId}`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // ==========================================================================
  // 【Chapter 06 模組 3 - 圖 (a)】：傳遞閉包動態分群樹與 λ-Cut 分割模擬器
  // ==========================================================================
  function updateCh6PlotA() {
    const plotEl = document.getElementById('plot-ch6-widget-a');
    if (!plotEl || !window.Plotly) return;

    const lambdaVal = parseFloat(document.getElementById('ch6-plot-a-lambda') ? document.getElementById('ch6-plot-a-lambda').value : '0.80');
    const lambdaEl = document.getElementById('ch6-plot-a-lambda-val');
    if (lambdaEl) lambdaEl.textContent = lambdaVal.toFixed(2);

    // 5 個樣本之傳遞閉包 R* 樹狀圖節點結構
    // 物件順序: x1, x2, x3, x4, x5
    // 合併層級:
    // (x4, x5) 合併於 0.90
    // (x1, x2) 合併於 0.85
    // (x3) 與 (x4, x5) 合併於 0.65
    // (x1, x2) 與 (x3, x4, x5) 合併於 0.45
    let clusterText = '';
    if (lambdaVal > 0.90) {
      clusterText = '劃分為 5 群：{x₁}, {x₂}, {x₃}, {x₄}, {x₅}';
    } else if (lambdaVal > 0.85) {
      clusterText = '劃分為 4 群：{x₁}, {x₂}, {x₃}, {x₄, x₅}';
    } else if (lambdaVal > 0.65) {
      clusterText = '劃分為 3 群：{x₁, x₂}, {x₃}, {x₄, x₅}';
    } else if (lambdaVal > 0.45) {
      clusterText = '劃分為 2 群：{x₁, x₂}, {x₃, x₄, x₅}';
    } else {
      clusterText = '劃分為 1 群：{x₁, x₂, x₃, x₄, x₅} (全體歸為同類)';
    }

    const cardEl = document.getElementById('ch6-plot-a-result-card');
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-cyan-500/35 text-xs sm:text-sm">
          <span class="text-cyan-300 font-bold">🌲 當前 λ-截集分群結果 (λ = ${lambdaVal.toFixed(2)})：</span>
          <span class="text-white font-mono font-bold bg-cyan-500/20 px-3 py-1 rounded-lg border border-cyan-500/40">
            ${clusterText}
          </span>
        </div>
      `;
    }

    // 繪製樹狀圖線段
    const traces = [];
    const addDendroLine = (x0, y0, x1, y1, col = '#38bdf8') => {
      traces.push({
        x: [x0, x1], y: [y0, y1], mode: 'lines',
        line: { color: col, width: 2.5 }, showlegend: false
      });
    };

    // 葉節點: x1=1, x2=2, x3=3, x4=4, x5=5
    // x4, x5 合併於 0.90
    addDendroLine(4, 1.0, 4, 0.90);
    addDendroLine(5, 1.0, 5, 0.90);
    addDendroLine(4, 0.90, 5, 0.90);

    // x1, x2 合併於 0.85
    addDendroLine(1, 1.0, 1, 0.85);
    addDendroLine(2, 1.0, 2, 0.85);
    addDendroLine(1, 0.85, 2, 0.85);

    // x3 與 (x4,x5) 合併於 0.65
    addDendroLine(3, 1.0, 3, 0.65);
    addDendroLine(4.5, 0.90, 4.5, 0.65);
    addDendroLine(3, 0.65, 4.5, 0.65);

    // (x1,x2) 與 (x3,x4,x5) 合併於 0.45
    addDendroLine(1.5, 0.85, 1.5, 0.45);
    addDendroLine(3.75, 0.65, 3.75, 0.45);
    addDendroLine(1.5, 0.45, 3.75, 0.45);

    // λ-Cut 水平線
    traces.push({
      x: [0.5, 5.5], y: [lambdaVal, lambdaVal], mode: 'lines',
      name: `當前截割線 λ = ${lambdaVal.toFixed(2)}`,
      line: { color: '#ef4444', width: 3, dash: 'dash' }
    });

    const layout = {
      title: { text: '傳遞閉包分群階層樹 (Dendrogram)', font: { color: '#e2e8f0', size: 14 } },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 35, b: 35 },
      xaxis: {
        tickvals: [1, 2, 3, 4, 5],
        ticktext: ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'],
        color: '#94a3b8', gridcolor: '#1e293b'
      },
      yaxis: { title: '相似度 λ', range: [0.35, 1.05], color: '#94a3b8', gridcolor: '#1e293b' },
      legend: { orientation: 'h', y: 1.15, font: { color: '#cbd5e1', size: 11 } }
    };

    Plotly.react(plotEl, traces, layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // 【Chapter 06 模組 3 - 圖 (b)】：Fuzzy C-Means (FCM) 2D 柔性分群散佈圖
  // ==========================================================================
  function updateCh6PlotB() {
    const plotEl = document.getElementById('plot-ch6-widget-b');
    if (!plotEl || !window.Plotly) return;

    const mVal = parseFloat(document.getElementById('ch6-plot-b-m') ? document.getElementById('ch6-plot-b-m').value : '2.0');
    const distOffset = parseFloat(document.getElementById('ch6-plot-b-dist') ? document.getElementById('ch6-plot-b-dist').value : '0');

    const mEl = document.getElementById('ch6-plot-b-m-val'); if (mEl) mEl.textContent = mVal.toFixed(1);

    // 2 個群心坐標
    const v1 = [2.0 - distOffset * 0.5, 3.0];
    const v2 = [6.0 + distOffset * 0.5, 4.0];

    // 20 個樣本點坐標
    const rawPoints = [
      [1.5, 3.2], [1.8, 2.5], [2.2, 3.6], [2.5, 2.9], [1.9, 3.1],
      [2.7, 3.4], [3.2, 3.1], [3.5, 3.3], [3.8, 3.6], [4.0, 3.5], // 中間分界過渡區
      [4.2, 3.7], [4.5, 3.8], [5.0, 3.9], [5.5, 4.2], [5.8, 3.8],
      [6.2, 4.3], [6.5, 3.9], [6.1, 4.5], [6.7, 4.1], [5.9, 4.0]
    ];

    const xPts = [], yPts = [], colors = [], hoverTexts = [];
    const pExp = 2 / (mVal - 1);

    rawPoints.forEach((pt, idx) => {
      xPts.push(pt[0]);
      yPts.push(pt[1]);

      const d1 = Math.hypot(pt[0] - v1[0], pt[1] - v1[1]) + 0.001;
      const d2 = Math.hypot(pt[0] - v2[0], pt[1] - v2[1]) + 0.001;

      // 歸屬度公式
      const term1 = Math.pow(d1 / d1, pExp);
      const term2 = Math.pow(d1 / d2, pExp);
      const mu1 = 1 / (term1 + term2);
      const mu2 = 1 - mu1;

      colors.push(mu1); // 用 mu1 做顏色 mapping (0: 藍, 1: 紅, 0.5: 紫)
      hoverTexts.push(`點 #${idx+1}<br>x=(${pt[0].toFixed(2)}, ${pt[1].toFixed(2)})<br>μ₁(群1)=${mu1.toFixed(3)}<br>μ₂(群2)=${mu2.toFixed(3)}`);
    });

    const tracePoints = {
      x: xPts, y: yPts,
      mode: 'markers',
      name: '柔性資料點',
      marker: {
        size: 11,
        color: colors,
        colorscale: [
          [0.0, '#38bdf8'], // 群 2 (天藍)
          [0.5, '#a855f7'], // 模糊過渡邊界 (紫)
          [1.0, '#f43f5e']  // 群 1 (玫瑰紅)
        ],
        colorbar: {
          title: '群 1 歸屬度 μ₁',
          titleside: 'right',
          tickfont: { color: '#94a3b8' },
          len: 0.8
        },
        showscale: true
      },
      text: hoverTexts,
      hoverinfo: 'text'
    };

    const traceCenters = {
      x: [v1[0], v2[0]], y: [v1[1], v2[1]],
      mode: 'markers+text',
      name: '群心 (v₁, v₂)',
      text: ['★ 群心 v₁', '★ 群心 v₂'],
      textposition: 'top center',
      marker: { color: '#fbbf24', size: 16, symbol: 'diamond' }
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 25, b: 35 },
      xaxis: { title: '特徵維度 X₁', color: '#94a3b8', gridcolor: '#1e293b' },
      yaxis: { title: '特徵維度 X₂', color: '#94a3b8', gridcolor: '#1e293b' },
      legend: { orientation: 'h', y: 1.15, font: { color: '#cbd5e1', size: 10 } }
    };

    Plotly.react(plotEl, [tracePoints, traceCenters], layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // Chapter 06 模組 4：題目練習邏輯
  // ==========================================================================
  function renderCh6PracticeList() {
    const container = document.getElementById('ch6-practice-list-container');
    if (!container) return;

    container.innerHTML = ch6PracticeQuestions.map((q, qIdx) => {
      const selectedOpt = ch6PracticeAnswers[qIdx];
      const isAnswered = selectedOpt !== undefined;
      const isExpanded = ch6PracticeExpanded[qIdx] || false;

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
          <button onclick="FuzzyWidgets.answerCh6Practice(${qIdx}, ${optIdx})"
            class="w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${optStyle}">
            <span class="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">${opt.label}</span>
            <span class="text-xs sm:text-sm mt-0.5">${opt.text}</span>
          </button>
        `;
      }).join('');

      return `
        <article class="glass-panel rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-800 hover:border-cyan-500/35 transition">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <span class="text-xs px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">${q.tag}</span>
            <span class="text-xs text-cyan-400 font-mono">${q.difficulty}</span>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-white leading-relaxed">${q.title}</h4>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${q.question}</p>
          <div class="space-y-2.5 pt-1">${optionsHtml}</div>
          <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
            <span class="text-xs text-slate-400 italic">💡 提示：${q.tip}</span>
            <button onclick="FuzzyWidgets.toggleCh6Solution(${qIdx})"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${isExpanded ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'}">
              ${isExpanded ? '收起完整推導詳解 ▲' : '展開完整推導詳解 ▼'}
            </button>
          </div>
          ${isExpanded ? `<div class="bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/25 mt-3 text-xs sm:text-sm leading-relaxed">${q.solution}</div>` : ''}
        </article>
      `;
    }).join('');

    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh6Practice(qIdx, optionIdx) {
    ch6PracticeAnswers[qIdx] = optionIdx;
    renderCh6PracticeList();
  }

  function toggleCh6Solution(qIdx) {
    ch6PracticeExpanded[qIdx] = !ch6PracticeExpanded[qIdx];
    renderCh6PracticeList();
  }

  // ==========================================================================
  // Chapter 06 四大標準學習模組總體 HTML 生成器
  // ==========================================================================
  function getChapter6FourModulesHtml() {
    return `
      <!-- 四大模組頂部快速跳轉按鈕組 -->
      <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">Chapter 06 導航</span>
          <span class="text-xs text-slate-400 hidden sm:inline">四段式架構：通論 ➔ 逐頁精讀 ➔ 模擬器 ➔ 考題詳解</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button id="ch6-mod-btn-all" onclick="FuzzyWidgets.switchCh6Module('all', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 transition">📑 全部展開</button>
          <button id="ch6-mod-btn-m1" onclick="FuzzyWidgets.switchCh6Module('m1', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">🏛️ 通論</button>
          <button id="ch6-mod-btn-m2" onclick="FuzzyWidgets.switchCh6Module('m2', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📘 逐頁精讀 (24頁)</button>
          <button id="ch6-mod-btn-m3" onclick="FuzzyWidgets.switchCh6Module('m3', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📊 模擬器 (2座)</button>
          <button id="ch6-mod-btn-m4" onclick="FuzzyWidgets.switchCh6Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (5題)</button>
        </div>
      </div>

      <!-- 【模組 1：通論（Overview）】 -->
      <div id="ch6-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-cyan-500/40 space-y-7">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/40">Module 01 • Clustering & Pattern Recognition</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊分群與圖形識別理論架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              由模糊相似矩陣平方法求傳遞閉包，到 Fuzzy C-Means (FCM) 柔性分群與海明/歐氏貼近度識別準則。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="refined-card p-6 space-y-3 border-l-4 border-l-cyan-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🔄 1. 傳遞閉包與 λ-截集分群</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                透過平方法 $R \\to R^2 \\dots$ 在有限步內獲得模糊等價矩陣 $R^*$，隨 $\\lambda$ 由大到小切割形成動態階層樹狀圖。
              </p>
              <div class="formula-display-card text-xs">
                $$R^* = \\bigcup_{k=1}^n R^k, \\qquad R^*_{2k} = R^*_k$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-blue-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🎯 2. Fuzzy C-Means (FCM) 演算法</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                引入模糊權重指數 $m > 1$，讓每個樣本以柔性歸屬度 $\\mu_{ik} \\in [0, 1]$ 同時隸屬於多個群集，迭代優化目標函數：
              </p>
              <div class="formula-display-card text-xs">
                $$J_m = \\sum_{i=1}^c \\sum_{k=1}^n (\\mu_{ik})^m \\|x_k - v_i\\|^2$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-teal-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🔍 3. 模糊貼近度與圖形識別</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                利用海明貼近度、歐氏貼近度或格貼近度 $(A, B)$ 衡量待測特徵與標準模板庫的相似程度，遵循最大貼近度歸類準則。
              </p>
              <div class="formula-display-card text-xs">
                $$\\sigma_H(A, B) = 1 - \\frac{1}{n} \\sum_{i=1}^n |\\mu_A(x_i) - \\mu_B(x_i)|$$
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 2：專書逐頁精讀】 -->
      <div id="ch6-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-cyan-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 12、16 章 專書精讀（共 24 頁）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                包含第 12 章（模糊分群 13 頁）與第 16 章（圖形識別 11 頁）原書照片、演算法手算步驟與應用圖表。
              </p>
            </div>
          </div>
          <div id="chapter6-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- 【模組 3：多維度模擬圖專區】 -->
      <div id="ch6-module-sec-m3" class="space-y-8">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <span class="text-cyan-400">📊</span> 【模組 3：多維度模擬圖專區】模糊分群與識別實驗室 (2座)
          </h3>
        </div>

        <!-- 模擬圖 (a)：傳遞閉包動態分群樹與 λ-Cut 分割模擬器 -->
        <div id="ch6-plot-card-a" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase border border-cyan-500/40">Simulator 6.1</span>
              <h4 class="text-xl font-bold text-white mt-1.5">🌲 (a) 傳遞閉包動態分群樹與 λ-Cut 分割模擬器</h4>
            </div>
          </div>
          <div id="plot-ch6-widget-a" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div id="ch6-plot-a-result-card"></div>
          <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div class="flex justify-between text-xs font-bold text-cyan-300 mb-1">
              <span>動態截集門檻 λ (Cut Threshold)：</span>
              <span id="ch6-plot-a-lambda-val" class="font-mono">0.80</span>
            </div>
            <input id="ch6-plot-a-lambda" type="range" min="0.40" max="0.95" step="0.05" value="0.80" oninput="FuzzyWidgets.updateCh6PlotA()" class="w-full cursor-pointer" />
          </div>
        </div>

        <!-- 模擬圖 (b)：Fuzzy C-Means (FCM) 2D 柔性分群散佈圖 -->
        <div id="ch6-plot-card-b" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-blue-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-extrabold uppercase border border-blue-500/40">Simulator 6.2</span>
              <h4 class="text-xl font-bold text-white mt-1.5">🔬 (b) Fuzzy C-Means (FCM) 2D 柔性分群散佈圖</h4>
            </div>
          </div>
          <div id="plot-ch6-widget-b" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <div class="flex justify-between text-xs font-bold text-cyan-300 mb-1">
                <span>模糊係數 m (Fuzzifier)：</span>
                <span id="ch6-plot-b-m-val" class="font-mono">2.0</span>
              </div>
              <input id="ch6-plot-b-m" type="range" min="1.2" max="3.5" step="0.1" value="2.0" oninput="FuzzyWidgets.updateCh6PlotB()" class="w-full cursor-pointer" />
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-blue-300 mb-1">
                <span>群心分離距離偏移：</span>
                <span class="text-slate-400 text-xs">動態調整群心間距</span>
              </div>
              <input id="ch6-plot-b-dist" type="range" min="-1.0" max="1.0" step="0.1" value="0.0" oninput="FuzzyWidgets.updateCh6PlotB()" class="w-full cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 4：章節題目練習與詳解】 -->
      <div id="ch6-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-cyan-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】模糊分群與識別 5 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 5 題傳遞閉包平方法、λ-截集等價類分割、FCM 模糊加權指數極限與海明貼近度手算題目，附完整詳解！
              </p>
            </div>
          </div>
          <div id="ch6-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }
''';
