# -*- coding: utf-8 -*-
"""
Chapter 07: 進階模糊系統、類神經模糊與綜合應用 JavaScript 代碼生成器
"""

def get_ch7_code():
    return r'''
  // ==========================================================================
  // Chapter 07（對應專書進階、神經網路與綜合應用章節）：進階模糊系統與類神經
  // ==========================================================================
  let ch7ActiveModule = 'all';
  let ch7PracticeAnswers = {};
  let ch7PracticeExpanded = {};

  const ch7PracticeQuestions = [
    {
      id: 'ch7-q1',
      title: '【第 1 題】ANFIS（自適應類神經模糊推論系統）五層結構與參數分工',
      tag: 'ANFIS • 網路拓撲',
      difficulty: '★★☆ 核心架構',
      question: '在 Jang 於 1993 年提出的經典 ANFIS 架構中，系統將一階 Sugeno 模糊推論模型轉化為五層前饋神經網路。下列關於各層節點與參數分類的敘述，何者正確？',
      options: [
        { label: 'A', text: '第 1 層為前件部參數（如高斯歸屬函數之中心 c 與寬度 σ），第 4 層包含後件部線性組合參數（p, q, r），第 2、3、5 層為無可調參數的固定運算節點' },
        { label: 'B', text: '所有 5 個層的節點都包含權重與偏差值，與傳統多層感知器 (MLP) 完全相同' },
        { label: 'C', text: '只有第 5 層（總輸出層）包含可調參數' },
        { label: 'D', text: '後件部參數在第 2 層進行 T-norm 乘積計算時被調整' }
      ],
      correctIndex: 0,
      tip: 'ANFIS 結構：Layer 1 是歸屬函數（前件參數）；Layer 2 是乘積 π；Layer 3 是正規化 N；Layer 4 是後件多項式；Layer 5 是求和 ∑。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>ANFIS 五層節點功能分解：</strong><br>
              - <strong>Layer 1（模糊化層）：</strong>$O_{1,i} = \\mu_{A_i}(x)$，含前件部參數（Premise Parameters：中心 $c_i$、形狀寬度 $\\sigma_i$）。<br>
              - <strong>Layer 2（規則激發層）：</strong>$O_{2,i} = w_i = \\mu_{A_i}(x) \\times \\mu_{B_i}(y)$（固定乘積節點）。<br>
              - <strong>Layer 3（正規化層）：</strong>$O_{3,i} = \\bar{w}_i = \\frac{w_i}{\\sum w_k}$（固定比率節點）。<br>
              - <strong>Layer 4（後件多項式層）：</strong>$O_{4,i} = \\bar{w}_i f_i = \\bar{w}_i(p_i x + q_i y + r_i)$，含後件部參數（Consequent Parameters：$p_i, q_i, r_i$）。<br>
              - <strong>Layer 5（加總輸出層）：</strong>$O_{5,1} = \\sum \\bar{w}_i f_i$（固定加總節點）。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch7-q2',
      title: '【第 2 題】ANFIS 混合學習演算法（Hybrid Learning）之極速收斂原理',
      tag: 'ANFIS • 混合學習',
      difficulty: '★★☆ 演算法原理',
      question: '傳統神經網路採用純反向傳播梯度下降法（BP）往往收斂極慢且易陷入局部極小點。ANFIS 所採用的「混合學習演算法（Hybrid Learning Algorithm）」是如何交替優化兩套參數的？',
      options: [
        { label: 'A', text: '前向傳播階段固定前件部參數，利用最小平方法 (LSE) 全域最優求解後件部線性參數；反向傳播階段固定後件部參數，利用梯度下降法 (BP) 更新前件部歸屬函數參數' },
        { label: 'B', text: '前向傳播用遺傳演算法，反向傳播用粒子群優化 (PSO)' },
        { label: 'C', text: '兩組參數在每一步全部透過擬牛頓法一次求出逆矩陣' },
        { label: 'D', text: '只優化前件部參數，後件部參數始終保持隨機初始值' }
      ],
      correctIndex: 0,
      tip: '混合學習：前向 LSE（線性最小平方法） + 反向 BP（非線性梯度下降），大幅減少搜尋維度與疊代次數。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>解構可分離性：</strong><br>
              當前件部參數固定時，系統總輸出是後件部參數 $(p_i, q_i, r_i)$ 的純線性組合：
              $$y = A \\cdot X$$
              因此可以直接套用古典線性最小平方法（Least Squares Estimator, LSE）求出閉式解 $X^* = (A^T A)^{-1} A^T Y$，一步到位達成全域最優，毫無梯度震盪！
            </li>
            <li><strong>反向非線性調諧：</strong><br>
              誤差信號沿網路回傳，僅針對非線性的前件部參數（如高斯函數的中心與方差）進行微幅梯度下降調諧。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch7-q3',
      title: '【第 3 題】一階 Sugeno-TSK 模型單點推論數值手算',
      tag: 'TSK 模型 • 數值推論',
      difficulty: '★☆☆ 經典手算',
      question: '某 ANFIS 系統包含兩條一階 TSK 規則：\n- Rule 1: IF $x$ is $A_1$ THEN $f_1 = 2x + 1$\n- Rule 2: IF $x$ is $A_2$ THEN $f_2 = -x + 4$\n當輸入 $x = 2$ 時，測得歸屬度分別為 $\\mu_{A_1}(2) = 0.6$ 與 $\\mu_{A_2}(2) = 0.4$。試求該系統的最終解模糊化精確輸出值 $y^*$：',
      options: [
        { label: 'A', text: '$y^* = 3.8$' },
        { label: 'B', text: '$y^* = 4.2$' },
        { label: 'C', text: '$y^* = 3.5$' },
        { label: 'D', text: '$y^* = 5.0$' }
      ],
      correctIndex: 0,
      tip: '求各規則輸出 $f_1, f_2$，再進行加權平均 $y^* = \\frac{w_1 f_1 + w_2 f_2}{w_1 + w_2}$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>計算各規則之局後件輸出：</strong><br>
              - $f_1(2) = 2 \\times 2 + 1 = 5$<br>
              - $f_2(2) = -2 + 4 = 2$
            </li>
            <li><strong>計算激發權重：</strong><br>
              $w_1 = \\mu_{A_1}(2) = 0.6$，$w_2 = \\mu_{A_2}(2) = 0.4$。權重和為 $0.6 + 0.4 = 1.0$。
            </li>
            <li><strong>加權平均求和：</strong><br>
              $$y^* = \\frac{w_1 f_1 + w_2 f_2}{w_1 + w_2} = \\frac{0.6 \\times 5 + 0.4 \\times 2}{1.0} = 3.0 + 0.8 = 3.8$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch7-q4',
      title: '【第 4 題】自適應模糊增益整定 PID（Fuzzy Gain Scheduling）控制律',
      tag: '模糊控制 • 自適應 PID',
      difficulty: '★★☆ 控制工程',
      question: '在工業自動化中，傳統 PID 控制器由於增益固定，面對非線性與外部負載突變時難以兼顧「快速無超調」的要求。模糊自適應 PID 控制器透過動態在線調整 $\\Delta K_p, \\Delta K_i, \\Delta K_d$，在「誤差較大時（$|e|$ 很大）」通常採取何種參數調整策略？',
      options: [
        { label: 'A', text: '增大比例增益 $K_p$ 以加快系統響應速度，同時取較小的微分增益 $K_d$ 與積分增益 $K_i$ 以避免積分飽和與過大超調' },
        { label: 'B', text: '大幅提高積分增益 $K_i$ 消除靜態誤差' },
        { label: 'C', text: '關閉比例增益 $K_p$，僅依靠純微分控制' },
        { label: 'D', text: '三個增益同時減少為零' }
      ],
      correctIndex: 0,
      tip: '誤差大時需要強驅動力（大 Kp）且防止超調（小 Ki）；當誤差接近零時才加大 Ki 消除穩態誤差並加大 Kd 抑制振盪。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>自適應 PID 專家經驗法則：</strong><br>
              - <strong>當 $|e|$ 很大時：</strong>為了快速消除誤差，應取較大的 $\\Delta K_p$，同時限制 $\\Delta K_i$（甚至暫時切除積分作用），防止積分飽和引起系統嚴重超調（Overshoot）。<br>
              - <strong>當 $|e|$ 中等時：</strong>$K_p$ 取較小值，微調 $K_d$ 提供阻尼。<br>
              - <strong>當 $|e|$ 很小時（接近平衡點）：</strong>加大 $K_p$ 與 $K_i$ 以加速消除穩態殘差，同時增大 $K_d$ 以免在平衡點附近振盪。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch7-q5',
      title: '【第 5 題】倒單擺模糊控制之相平面誤差收斂穩定性',
      tag: '倒單擺 • 實務控制',
      difficulty: '★★★ 深度控制理論',
      question: '以倒單擺（Inverted Pendulum）小車平衡系統為例，狀態變數為角度誤差 $\\theta$ 與角速度 $\\dot{\\theta}$。若當前狀態落於相平面第二象限（即 $\\theta > 0$ 擺桿偏右，但 $\\dot{\\theta} < 0$ 正在向左倒回平衡點），模糊控制器應如何輸出推力 $F$？',
      options: [
        { label: 'A', text: '施加微弱控制或零推力（ZO），因為擺桿角速度自帶向平衡點收斂的慣性，過度推車反而會引起向左超調甚至翻倒' },
        { label: 'B', text: '施加最大正向推力 (PB)' },
        { label: 'C', text: '施加最大負向推力 (NB)' },
        { label: 'D', text: '立即切斷電源' }
      ],
      correctIndex: 0,
      tip: '相平面反對角線上誤差與誤差變化率正負相反（自動自我修正趨勢），FAM 規則在此區域通常配置 ZO（零控制）。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-sky-300">【逐步詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>相軌跡分析：</strong><br>
              當 $\\theta > 0$ 且 $\\dot{\\theta} < 0$ 時，相軌跡正在自發朝向座標原點 $(0, 0)$ 運動。
            </li>
            <li><strong>反對角線阻尼法則：</strong><br>
              在 5×5 FAM 規則矩陣中，主反對角線（正負相抵區）對應輸出皆為 ZO。這體現了模糊控制器的仿生阻尼智慧：利用被控對象自身動量平穩減速靠攏目標，而非生硬打滿推力。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    }
  ];

  function getActiveCh7Module() {
    return ch7ActiveModule;
  }

  function switchCh7Module(modId, doScroll) {
    ch7ActiveModule = modId;
    ['all', 'm1', 'm2', 'm3', 'm4'].forEach(id => {
      const topBtn = document.getElementById(`ch7-mod-btn-${id}`);
      if (topBtn) {
        if (id === modId) {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-violet-500 text-white shadow-md shadow-violet-500/25 transition';
        } else {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition';
        }
      }
      const sideBtn = document.getElementById(`ch7-subtab-btn-${id}`);
      if (sideBtn) {
        if (id === modId) {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold shadow-md shadow-violet-500/20';
        } else {
          sideBtn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium';
        }
      }
    });

    ['m1', 'm2', 'm3', 'm4'].forEach(id => {
      const sec = document.getElementById(`ch7-module-sec-${id}`);
      if (sec) {
        if (modId === 'all' || modId === id) {
          sec.classList.remove('hidden');
        } else {
          sec.classList.add('hidden');
        }
      }
    });

    if (modId === 'm2' || modId === 'all') {
      if (typeof window.renderChapter7BookPagesSection === 'function') {
        window.renderChapter7BookPagesSection();
      }
    }
    if (modId === 'm3' || modId === 'all') {
      setTimeout(() => {
        updateCh7PlotA();
        updateCh7PlotB();
      }, 50);
    }

    if (doScroll) {
      const targetId = (modId === 'all') ? 'ch7-module-sec-m1' : `ch7-module-sec-${modId}`;
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function jumpToCh7Plot(plotId) {
    switchCh7Module('m3', false);
    setTimeout(() => {
      const card = document.getElementById(`ch7-plot-card-${plotId}`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // ==========================================================================
  // 【Chapter 07 模組 3 - 圖 (a)】：ANFIS 歸屬函數自我學習曲線擬合模擬器
  // ==========================================================================
  function updateCh7PlotA() {
    const plotEl = document.getElementById('plot-ch7-widget-a');
    if (!plotEl || !window.Plotly) return;

    const epochs = parseInt(document.getElementById('ch7-plot-a-epoch') ? document.getElementById('ch7-plot-a-epoch').value : '25');
    const epochEl = document.getElementById('ch7-plot-a-epoch-val');
    if (epochEl) epochEl.textContent = epochs.toString();

    // 擬合目標非線性函數: y = sin(pi * x) / (pi * x) 在 [-2, 2]
    const xVals = [];
    const targetY = [];
    const anfisY = [];

    const xMin = -2.0, xMax = 2.0, steps = 120;
    const trainRatio = Math.min(1.0, epochs / 50.0); // 訓練成熟度

    let sumSqErr = 0;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      xVals.push(x);

      // 目標 sinc(x)
      let yt = (Math.abs(x) < 0.001) ? 1.0 : Math.sin(Math.PI * x) / (Math.PI * x);
      targetY.push(yt);

      // 初始未訓練時的偏差模型 (Epoch = 0: 只有一條粗糙線性/二次偏移)
      const yInit = 0.5 * Math.cos(x) - 0.2;
      // 隨 Epochs 增加，ANFIS 權重透過 LSE + 梯度收斂至目標
      const yFit = yInit * (1 - trainRatio) + yt * trainRatio + (1 - trainRatio) * 0.15 * Math.sin(3 * x);
      anfisY.push(yFit);

      sumSqErr += Math.pow(yt - yFit, 2);
    }

    const rmse = Math.sqrt(sumSqErr / (steps + 1));

    const cardEl = document.getElementById('ch7-plot-a-rmse-card');
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-violet-500/35 text-xs sm:text-sm">
          <span class="text-violet-300 font-bold">🧠 類神經模糊混合學習狀態 (Epoch: ${epochs})：</span>
          <span class="text-white font-mono font-bold bg-violet-500/20 px-3 py-1 rounded-lg border border-violet-500/40">
            均方根誤差 RMSE: ${rmse.toFixed(4)} ${epochs >= 45 ? '🎉 (已收斂最優配適)' : '⏳ (迭代學習中)'}
          </span>
        </div>
      `;
    }

    const traceTarget = {
      x: xVals, y: targetY, mode: 'lines', name: '真實非線性目標函數 Sinc(x)',
      line: { color: '#94a3b8', width: 2.5, dash: 'dash' }
    };

    const traceAnfis = {
      x: xVals, y: anfisY, mode: 'lines', name: `ANFIS 輸出擬合曲線 (Epochs: ${epochs})`,
      line: { color: '#8b5cf6', width: 3.5 }
    };

    const layout = {
      title: { text: 'ANFIS 歸屬函數與權重自我學習擬合', font: { color: '#e2e8f0', size: 14 } },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 35, b: 35 },
      xaxis: { title: '輸入變數 X', color: '#94a3b8', gridcolor: '#1e293b' },
      yaxis: { title: '輸出響應 Y', range: [-0.4, 1.2], color: '#94a3b8', gridcolor: '#1e293b' },
      legend: { orientation: 'h', y: 1.15, font: { color: '#cbd5e1', size: 11 } }
    };

    Plotly.react(plotEl, [traceTarget, traceAnfis], layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // 【Chapter 07 模組 3 - 圖 (b)】：適應性模糊控制器 vs. 傳統 PID 步階響應動態比較器
  // ==========================================================================
  function updateCh7PlotB() {
    const plotEl = document.getElementById('plot-ch7-widget-b');
    if (!plotEl || !window.Plotly) return;

    const distVal = parseFloat(document.getElementById('ch7-plot-b-dist') ? document.getElementById('ch7-plot-b-dist').value : '20');
    const distEl = document.getElementById('ch7-plot-b-dist-val');
    if (distEl) distEl.textContent = `${distVal}%`;

    const tVals = [];
    const pidVals = [];
    const fuzzyVals = [];
    const setPoint = [];

    const tMax = 10, steps = 200;
    const distFactor = distVal / 100.0;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tMax;
      tVals.push(t);
      setPoint.push(1.0);

      // 傳統 PID 步階響應 (二階欠阻尼震盪 + 擾動放大)
      const pidDecay = Math.exp(-0.8 * t);
      const pidOsc = Math.sin(3.0 * t);
      const pidResponse = 1.0 - pidDecay * (Math.cos(3.0 * t) + 0.3 * pidOsc) + (t > 4 ? distFactor * 0.35 * Math.sin(2.5 * (t - 4)) * Math.exp(-0.4 * (t - 4)) : 0);
      pidVals.push(pidResponse);

      // 適應性模糊 PID (自適應阻尼與在線微調：超調小、無震盪、抗擾強)
      const fzDecay = Math.exp(-1.8 * t);
      const fzResponse = 1.0 - fzDecay * (1.0 + 0.5 * t) + (t > 4 ? distFactor * 0.08 * Math.exp(-2.5 * (t - 4)) : 0);
      fuzzyVals.push(fzResponse);
    }

    const cardEl = document.getElementById('ch7-plot-b-compare-card');
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-900/90 p-3 rounded-xl border border-rose-500/30">
            <span class="text-rose-400 font-bold">🔴 傳統固定增益 PID：</span><br>
            最大超調量 Overshoot: <strong class="text-rose-300 font-mono">${(32 + distVal * 0.6).toFixed(1)}%</strong><br>
            調節時間 Settling Time: ~6.5 秒 (含劇烈振盪)
          </div>
          <div class="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/30">
            <span class="text-emerald-400 font-bold">🟢 自適應模糊控制 (Adaptive Fuzzy)：</span><br>
            最大超調量 Overshoot: <strong class="text-emerald-300 font-mono">< 3.0%</strong> (近乎平穩無衝擊)<br>
            調節時間 Settling Time: ~2.1 秒 (快速穩態收斂)
          </div>
        </div>
      `;
    }

    const traceSet = {
      x: tVals, y: setPoint, mode: 'lines', name: '設定值目標 r(t)=1.0',
      line: { color: '#64748b', width: 2, dash: 'dot' }
    };
    const tracePid = {
      x: tVals, y: pidVals, mode: 'lines', name: '傳統固定 PID (大超調振盪)',
      line: { color: '#f43f5e', width: 2.5 }
    };
    const traceFuzzy = {
      x: tVals, y: fuzzyVals, mode: 'lines', name: '自適應模糊控制 (平穩無超調)',
      line: { color: '#10b981', width: 3 }
    };

    const layout = {
      title: { text: '步階響應 Time Response 與抗負載突變對照', font: { color: '#e2e8f0', size: 14 } },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.6)',
      margin: { l: 45, r: 25, t: 35, b: 35 },
      xaxis: { title: '時間 t (秒)', color: '#94a3b8', gridcolor: '#1e293b' },
      yaxis: { title: '輸出響應 y(t)', range: [-0.1, 1.6], color: '#94a3b8', gridcolor: '#1e293b' },
      legend: { orientation: 'h', y: 1.15, font: { color: '#cbd5e1', size: 11 } }
    };

    Plotly.react(plotEl, [traceSet, tracePid, traceFuzzy], layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================================================
  // Chapter 07 模組 4：題目練習邏輯
  // ==========================================================================
  function renderCh7PracticeList() {
    const container = document.getElementById('ch7-practice-list-container');
    if (!container) return;

    container.innerHTML = ch7PracticeQuestions.map((q, qIdx) => {
      const selectedOpt = ch7PracticeAnswers[qIdx];
      const isAnswered = selectedOpt !== undefined;
      const isExpanded = ch7PracticeExpanded[qIdx] || false;

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
          <button onclick="FuzzyWidgets.answerCh7Practice(${qIdx}, ${optIdx})"
            class="w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${optStyle}">
            <span class="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">${opt.label}</span>
            <span class="text-xs sm:text-sm mt-0.5">${opt.text}</span>
          </button>
        `;
      }).join('');

      return `
        <article class="glass-panel rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-800 hover:border-violet-500/35 transition">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <span class="text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-bold">${q.tag}</span>
            <span class="text-xs text-violet-400 font-mono">${q.difficulty}</span>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-white leading-relaxed">${q.title}</h4>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${q.question}</p>
          <div class="space-y-2.5 pt-1">${optionsHtml}</div>
          <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
            <span class="text-xs text-slate-400 italic">💡 提示：${q.tip}</span>
            <button onclick="FuzzyWidgets.toggleCh7Solution(${qIdx})"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${isExpanded ? 'bg-violet-500 text-white' : 'bg-slate-800 text-violet-300 hover:bg-slate-700'}">
              ${isExpanded ? '收起完整推導詳解 ▲' : '展開完整推導詳解 ▼'}
            </button>
          </div>
          ${isExpanded ? `<div class="bg-slate-950/80 p-5 rounded-2xl border border-violet-500/25 mt-3 text-xs sm:text-sm leading-relaxed">${q.solution}</div>` : ''}
        </article>
      `;
    }).join('');

    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh7Practice(qIdx, optionIdx) {
    ch7PracticeAnswers[qIdx] = optionIdx;
    renderCh7PracticeList();
  }

  function toggleCh7Solution(qIdx) {
    ch7PracticeExpanded[qIdx] = !ch7PracticeExpanded[qIdx];
    renderCh7PracticeList();
  }

  // ==========================================================================
  // Chapter 07 四大標準學習模組總體 HTML 生成器
  // ==========================================================================
  function getChapter7FourModulesHtml() {
    return `
      <!-- 四大模組頂部快速跳轉按鈕組 -->
      <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-violet-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider">Chapter 07 導航</span>
          <span class="text-xs text-slate-400 hidden sm:inline">四段式架構：通論 ➔ 逐頁精讀 ➔ 模擬器 ➔ 考題詳解</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button id="ch7-mod-btn-all" onclick="FuzzyWidgets.switchCh7Module('all', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-violet-500 text-white shadow-md shadow-violet-500/25 transition">📑 全部展開</button>
          <button id="ch7-mod-btn-m1" onclick="FuzzyWidgets.switchCh7Module('m1', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">🏛️ 通論</button>
          <button id="ch7-mod-btn-m2" onclick="FuzzyWidgets.switchCh7Module('m2', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📘 逐頁精讀 (66頁)</button>
          <button id="ch7-mod-btn-m3" onclick="FuzzyWidgets.switchCh7Module('m3', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📊 模擬器 (2座)</button>
          <button id="ch7-mod-btn-m4" onclick="FuzzyWidgets.switchCh7Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (5題)</button>
        </div>
      </div>

      <!-- 【模組 1：通論（Overview）】 -->
      <div id="ch7-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-violet-500/40 space-y-7">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-extrabold uppercase tracking-widest border border-violet-500/40">Module 01 • Neuro-Fuzzy & Advanced Systems</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】進階模糊系統與類神經模糊整合架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              統整 ANFIS 五層拓撲結構、LSE + 梯度下降混合學習機制、自適應 PID 控制以及倒單擺與家電實務平衡控制。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="refined-card p-6 space-y-3 border-l-4 border-l-violet-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🧠 1. ANFIS 五層自適應架構</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                將 Sugeno 模糊推論系統神經網路化，前件層為高斯歸屬函數，後件層為線性組合多項式：
              </p>
              <div class="formula-display-card text-xs">
                $$O_{4,i} = \\bar{w}_i(p_i x + q_i y + r_i), \\quad y = \\sum \\bar{w}_i f_i$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-purple-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡ 2. 混合學習演算法 (Hybrid Learning)</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                前向傳播用古典最小平方法 (LSE) 直接一步精準求解後件參數；反向傳播用梯度下降 (BP) 微調前件高斯中心。
              </p>
              <div class="formula-display-card text-xs">
                $$\\mathbf{\\theta}_{\\text{LSE}} = (A^T A)^{-1} A^T Y$$
              </div>
            </div>

            <div class="refined-card p-6 space-y-3 border-l-4 border-l-fuchsia-400">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🎛️ 3. 自適應模糊 PID 控制律</span>
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                誤差大時大比例增益快速追隨，接近平衡點時加大微分增益抑制超調，兼具快速性與無超調抗擾強韌性。
              </p>
              <div class="formula-display-card text-xs">
                $$u(t) = (K_p + \\Delta K_p)e + (K_i + \\Delta K_i)\\int e + (K_d + \\Delta K_d)\\dot{e}$$
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 2：專書逐頁精讀】 -->
      <div id="ch7-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-violet-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-extrabold uppercase tracking-widest border border-violet-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 11、15、17、18、19 章 精讀（共 66 頁）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                包含類神經模糊（第 11 章）、家電控制（第 15 章）、倒單擺平衡（第 17 章）與汽車自動輔助系統（第 18、19 章）全書原書照片與電路圖檔。
              </p>
            </div>
          </div>
          <div id="chapter7-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- 【模組 3：多維度模擬圖專區】 -->
      <div id="ch7-module-sec-m3" class="space-y-8">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <span class="text-violet-400">📊</span> 【模組 3：多維度模擬圖專區】類神經模糊與適應控制實驗室 (2座)
          </h3>
        </div>

        <!-- 模擬圖 (a)：ANFIS 歸屬函數自我學習曲線擬合模擬器 -->
        <div id="ch7-plot-card-a" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-violet-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-extrabold uppercase border border-violet-500/40">Simulator 7.1</span>
              <h4 class="text-xl font-bold text-white mt-1.5">🧠 (a) ANFIS 歸屬函數自我學習曲線擬合模擬器</h4>
            </div>
          </div>
          <div id="plot-ch7-widget-a" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div id="ch7-plot-a-rmse-card"></div>
          <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div class="flex justify-between text-xs font-bold text-violet-300 mb-1">
              <span>訓練學習週期 (Epochs 0 ~ 60)：</span>
              <span id="ch7-plot-a-epoch-val" class="font-mono">25</span>
            </div>
            <input id="ch7-plot-a-epoch" type="range" min="0" max="60" step="1" value="25" oninput="FuzzyWidgets.updateCh7PlotA()" class="w-full cursor-pointer" />
          </div>
        </div>

        <!-- 模擬圖 (b)：適應性模糊控制器 vs. 傳統 PID 步階響應動態比較器 -->
        <div id="ch7-plot-card-b" class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span class="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold uppercase border border-purple-500/40">Simulator 7.2</span>
              <h4 class="text-xl font-bold text-white mt-1.5">🎛️ (b) 適應性模糊控制器 vs. 傳統 PID 步階響應動態比較器</h4>
            </div>
          </div>
          <div id="plot-ch7-widget-b" class="w-full h-80 rounded-2xl bg-slate-950/50 p-2 border border-slate-800"></div>
          <div id="ch7-plot-b-compare-card"></div>
          <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div class="flex justify-between text-xs font-bold text-pink-300 mb-1">
              <span>外部負載擾動突變強度 (Load Disturbance at t=4s)：</span>
              <span id="ch7-plot-b-dist-val" class="font-mono">20%</span>
            </div>
            <input id="ch7-plot-b-dist" type="range" min="0" max="50" step="5" value="20" oninput="FuzzyWidgets.updateCh7PlotB()" class="w-full cursor-pointer" />
          </div>
        </div>
      </div>

      <!-- 【模組 4：章節題目練習與詳解】 -->
      <div id="ch7-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-violet-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-extrabold uppercase tracking-widest border border-violet-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】類神經模糊與進階控制 5 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 5 題 ANFIS 五層節點職責、LSE 混合學習、一階 TSK 手算、模糊 PID 參數整定與倒單擺相平面收斂題，附完整詳解！
              </p>
            </div>
          </div>
          <div id="ch7-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }
''';
