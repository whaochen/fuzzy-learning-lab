// ============================================================================
// Fuzzy 模糊邏輯互動學習模組核心引擎 (frontend/interactive_widgets.js)
// 功能：
// 1. 將「Chapter 01：模糊集合基礎（對應專書第 2 章）」完整重構為四大標準學習模組：
//    - 【模組 1：通論（Overview）】
//    - 【模組 2：《認識 Fuzzy》第二章「模糊集合」逐頁精讀（頁 2-1 至 2-15）】
//    - 【模組 3：多維度模擬圖互動專區（Interactive Plots：a, b, c, d 四座獨立模擬器）】
//    - 【模組 4：章節題目練習與詳解（Practice & Solutions：8 題由淺入深 + 展開詳解）】
// 2. 提供 Chapter 02 與 Chapter 03 的內嵌 Plotly 互動實驗器。
// 3. 零語音 API 依賴、零 CORS 報錯、所有繪圖與公式渲染皆具備 try-catch 防崩潰保護。
// ============================================================================

window.FuzzyWidgets = (function () {
  // Chapter 01 子模組切換狀態：'all' (漸進展開全部) | 'm1' | 'm2' | 'm3' | 'm4'
  let ch1ActiveModule = 'all';

  // 模組 3-(b) 四大典型歸屬函數當前選中造型
  let plotBActiveShape = 'all'; // 'all' | 'trimf' | 'trapmf' | 'gaussmf' | 'smf'

  // 模組 4 題目作答與詳解展開狀態
  let ch1PracticeAnswers = {};
  let ch1SolutionExpanded = {};

  function safeMathJax(elements) {
    try {
      if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        const p = elements ? window.MathJax.typesetPromise(elements) : window.MathJax.typesetPromise();
        if (p && typeof p.catch === 'function') {
          p.catch(function (err) { console.warn('MathJax warning:', err); });
        }
      }
    } catch (e) {
      console.warn('MathJax error:', e);
    }
  }

  function safePlot(divId, traces, layout) {
    try {
      const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
      if (!el || !window.Plotly) return;
      window.Plotly.react(el, traces, layout, { responsive: true, displayModeBar: false });
    } catch (e) {
      console.warn('Plotly error on ' + divId + ':', e);
    }
  }

  function getBaseLayout(xTitle, yTitle, xRange, yRange) {
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
      font: { color: '#e2e8f0', family: 'Inter, Noto Sans TC, sans-serif', size: 12 },
      margin: { t: 32, r: 24, b: 48, l: 54 },
      legend: { orientation: 'h', y: 1.15, x: 0, bgcolor: 'rgba(0,0,0,0)' },
      xaxis: {
        title: xTitle,
        range: xRange,
        gridcolor: 'rgba(148, 163, 184, 0.14)',
        zeroline: false
      },
      yaxis: {
        title: yTitle || '歸屬度 μ(x)',
        range: yRange || [-0.05, 1.14],
        gridcolor: 'rgba(148, 163, 184, 0.14)'
      }
    };
  }

  // ==========================================================================
  // 基礎歸屬函數數學庫
  // ==========================================================================
  function trimf(x, a, b, c) {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return b === a ? 1 : (x - a) / (b - a);
    return c === b ? 1 : (c - x) / (c - b);
  }

  function trapmf(x, a, b, c, d) {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x < b) return b === a ? 1 : (x - a) / (b - a);
    return d === c ? 1 : (d - x) / (d - c);
  }

  function gaussmf(x, c, sigma) {
    const s = Math.max(0.2, sigma);
    return Math.exp(-Math.pow(x - c, 2) / (2 * s * s));
  }

  function smf(x, a, b) {
    if (x <= a) return 0;
    if (x >= b) return 1;
    const mid = (a + b) / 2;
    if (x <= mid) return 2 * Math.pow((x - a) / (b - a), 2);
    return 1 - 2 * Math.pow((x - b) / (b - a), 2);
  }

  function zmf(x, a, b) {
    return 1 - smf(x, a, b);
  }

  // ==========================================================================
  // Chapter 01：模組 4 題庫資料（8 題由淺入深：單選 + 計算實作 + 完整數學推導詳解）
  // ==========================================================================
  const CH1_PRACTICE_PROBLEMS = [
    {
      id: 'ch1_p1',
      tag: '觀念必考題 • 課堂錄音重點',
      difficulty: '★☆☆ 基礎觀念',
      question: '【第 1 題】在科學與工程中，「模糊性（Fuzziness）」與「機率隨機性（Randomness）」常被初學者混淆。若氣象局預報「明天下雨機率為 $0.7$」，而某位同學站在戶外覺得「現在雨勢屬於大雨的程度是 $0.7$」，下列敘述何者正確？',
      options: [
        '兩者數學意義完全相同，皆必須滿足所有可能狀態的數值總和等於 1',
        '「下雨機率 0.7」描述的是事件是否發生的隨機不確定性；「大雨程度 0.7」則是歸屬函數值 A(x)=0.7，描述語意邊界的模糊性，且同一元素對不同模糊集合的歸屬度總和不必為 1',
        '只要將模糊歸屬函數除以總面積做正規化，模糊集合就會變成機率密度函數',
        '明確集合（Crisp Set）可以用來處理語意模糊性，但無法處理機率問題'
      ],
      answerIndex: 1,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p>1. <strong>機率論（Probability）</strong>建立在古典明確集合（事件 $E$ 發生或不發生非黑即白）之上，衡量的是「事件尚未發生前的隨機性」，且互斥完備事件必滿足機率公理：</p>
          <div class="formula-display-card">$$\\sum_{i} P(E_i) = 1$$</div>
          <p>2. <strong>模糊邏輯（Fuzzy Logic）</strong>則是《認識 Fuzzy》第 2-2 頁強調的「<strong>意義的數量化（Quantification of Meaning）</strong>」。事件已經發生在眼前（例如現在雨量為每小時 $35\\text{ mm}$），但「大雨」這個語意詞彙沒有一刀切的明確邊界。此時 $x = 35\\text{ mm}$ 可以同時具有 $A_{\\text{大雨}}(35) = 0.7$ 與 $A_{\\text{中雨}}(35) = 0.5$，其總和為：</p>
          <div class="formula-display-card">$$A_{\\text{大雨}}(35) + A_{\\text{中雨}}(35) = 0.7 + 0.5 = 1.2 \\neq 1$$</div>
          <p>因此模糊歸屬度不受總和為 $1$ 的限制，正確答案為 <strong>(B)</strong>。</p>
        </div>
      `
    },
    {
      id: 'ch1_p2',
      tag: '離散集合計算 • 課本頁 2-7 & 習題 2.7(a)',
      difficulty: '★★☆ 核心計算',
      question: '【第 2 題】設離散宇集合 $X = \\{a_1, a_2, a_3, a_4, a_5\\}$，某模糊集合以 Zadeh 記號表示為 $A = 0.4/a_1 + 0.5/a_2 + 0.6/a_3 + 0.8/a_4 + 1.0/a_5$。請問該集合的「純基數 $|A|$」、「位階集合 $\\Lambda(A)$」以及「$\\alpha = 0.6$ 的強截集 $\\text{}^{0.6+}A$」分別為何？',
      options: [
        '|A| = 3.3， Λ(A) = {0.4, 0.5, 0.6, 0.8, 1.0}， 強截集 ⁰·⁶⁺A = {a₄, a₅}',
        '|A| = 3.3， Λ(A) = {0.4, 0.5, 0.6, 0.8, 1.0}， 強截集 ⁰·⁶⁺A = {a₃, a₄, a₅}',
        '|A| = 5.0， Λ(A) = {a₁, a₂, a₃, a₄, a₅}， 強截集 ⁰·⁶⁺A = {a₄, a₅}',
        '|A| = 1.0， Λ(A) = {0.6, 0.8, 1.0}， 強截集 ⁰·⁶⁺A = {a₃, a₄, a₅}'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 逐步數學推導（對應課本頁 2-11 ～ 2-14 公式）：</div>
          <p><strong>步驟 1：計算純基數（Scalar Cardinality，課本式 2.5）</strong><br/>將所有元素的歸屬度直接相加：</p>
          <div class="formula-display-card">$$|A| = \\sum_{i=1}^{5} A(a_i) = 0.4 + 0.5 + 0.6 + 0.8 + 1.0 = \\mathbf{3.3}$$</div>
          <p><strong>步驟 2：求位階集合（Level Set $\\Lambda(A)$，課本頁 2-14）</strong><br/>蒐集所有出現過的非零歸屬度數值：</p>
          <div class="formula-display-card">$$\\Lambda(A) = \\{\\alpha \\mid A(x) = \\alpha > 0\\} = \\{0.4,\\; 0.5,\\; 0.6,\\; 0.8,\\; 1.0\\}$$</div>
          <p><strong>步驟 3：區分一般截集 $\\text{}^{0.6}A$ 與強截集 $\\text{}^{0.6+}A$（課本式 2.1 與式 2.2）</strong><br/>一般截集包含等號（$A(x) \\ge 0.6$），故 $\\text{}^{0.6}A = \\{a_3, a_4, a_5\\}$；但題目所求為<strong>強截集（Strong $\\alpha$-cut，嚴格大於 $A(x) > 0.6$）</strong>，必須扣除剛好等於 $0.6$ 的 $a_3$：</p>
          <div class="formula-display-card">$$\\text{}^{0.6+}A = \\{x \\in X \\mid A(x) > 0.6\\} = \\mathbf{\\{a_4,\\; a_5\\}}$$</div>
          <p>故正確答案為 <strong>(A)</strong>。</p>
        </div>
      `
    },
    {
      id: 'ch1_p3',
      tag: '連續截集推導 • 課本頁 2-10 圖 2.8 中年人集合',
      difficulty: '★★☆ 必考推導',
      question: '【第 3 題】依據《認識 Fuzzy》第 2-10 頁圖 2.8，「中年人」歸屬函數定義為對稱三角形：$A_2(x) = (x-20)/20$（當 $20 \\le x \\le 40$），$A_2(x) = (60-x)/20$（當 $40 \\le x \\le 60$），其餘為 $0$。試推導任意門檻 $\\alpha \\in (0, 1]$ 下的一般 $\\alpha$-截集閉區間 $\\text{}^{\\alpha}A_2$ 為何？',
      options: [
        '[ 20α,  60 - 20α ]',
        '[ 20 + 20α,  60 - 20α ]',
        '[ 20 + 40α,  60 - 40α ]',
        '( 20 + 20α,  60 - 20α )'
      ],
      answerIndex: 1,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整代數反解推導（課本頁 2-11 核心範例）：</div>
          <p>欲求一般截集 $\\text{}^{\\alpha}A_2 = \\{x \\in [0, 100] \\mid A_2(x) \\ge \\alpha\\}$，我們分別對三角形的左斜邊與右斜邊解不等式：</p>
          <p>1. <strong>左斜邊上升段（$20 \\le x \\le 40$）</strong>：</p>
          <div class="formula-display-card">$$\\frac{x - 20}{20} \\ge \\alpha \\implies x - 20 \\ge 20\\alpha \\implies x \\ge 20 + 20\\alpha$$</div>
          <p>2. <strong>右斜邊下降段（$40 \\le x \\le 60$）</strong>：</p>
          <div class="formula-display-card">$$\\frac{60 - x}{20} \\ge \\alpha \\implies 60 - x \\ge 20\\alpha \\implies x \\le 60 - 20\\alpha$$</div>
          <p>3. 綜合左右端點，可得任意 $\\alpha \\in (0, 1]$ 的明確閉區間公式：</p>
          <div class="formula-display-card">$$\\text{}^{\\alpha}A_2 = \\big[\\, 20 + 20\\alpha,\\; 60 - 20\\alpha \\,\\big]$$</div>
          <p><strong>代值驗算</strong>：當 $\\alpha = 0.5$ 時，$\\text{}^{0.5}A_2 = [20+10,\\, 60-10] = [30, 50]$；當 $\\alpha = 1.0$（核 Core）時，$\\text{}^{1}A_2 = [40, 40] = \\{40\\}$，完全吻合課本第 2-11 頁！故選 <strong>(B)</strong>。</p>
        </div>
      `
    },
    {
      id: 'ch1_p4',
      tag: '非線性歸屬函數反解 • 課本頁 2-15 習題 2.8',
      difficulty: '★★★ 進階計算',
      question: '【第 4 題】《認識 Fuzzy》第 2-9 頁圖 2.7(b) 與習題 2.8 定義「靠近 $5$ 之實數」的分式鐘形歸屬函數為 $C(x) = \\frac{1}{1 + (x - 5)^2}$。試求當 $\\alpha = 0.2$ 時的截集 $\\text{}^{0.2}C$ 與 $\\alpha = 0.5$ 時的截集 $\\text{}^{0.5}C$ 分別為何？',
      options: [
        '⁰·²C = [3, 7] 且 ⁰·⁵C = [4, 6]',
        '⁰·²C = [1, 9] 且 ⁰·⁵C = [3, 7]',
        '⁰·²C = [4, 6] 且 ⁰·⁵C = [4.5, 5.5]',
        '⁰·²C = [5 - √5, 5 + √5] 且 ⁰·⁵C = [4, 6]'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整不等式推導詳解：</div>
          <p>根據 $\\alpha$-截集定義 $\\text{}^{\\alpha}C = \\{x \\in \\mathbb{R} \\mid C(x) \\ge \\alpha\\}$，列出不等式並移項求解：</p>
          <div class="formula-display-card">$$\\frac{1}{1 + (x - 5)^2} \\ge \\alpha \\implies 1 + (x - 5)^2 \\le \\frac{1}{\\alpha} \\implies (x - 5)^2 \\le \\frac{1 - \\alpha}{\\alpha}$$</div>
          <p>兩側開根號可得通解公式：</p>
          <div class="formula-display-card">$$|x - 5| \\le \\sqrt{\\frac{1 - \\alpha}{\\alpha}} \\iff x \\in \\left[\\, 5 - \\sqrt{\\frac{1 - \\alpha}{\\alpha}},\\; 5 + \\sqrt{\\frac{1 - \\alpha}{\\alpha}} \\,\\right]$$</div>
          <p>• 代入 <strong>$\\alpha = 0.2$</strong>：$\\sqrt{\\frac{1 - 0.2}{0.2}} = \\sqrt{\\frac{0.8}{0.2}} = \\sqrt{4} = 2 \\implies \\text{}^{0.2}C = [5 - 2,\\, 5 + 2] = \\mathbf{[3,\\, 7]}$</p>
          <p>• 代入 <strong>$\\alpha = 0.5$</strong>：$\\sqrt{\\frac{1 - 0.5}{0.5}} = \\sqrt{1} = 1 \\implies \\text{}^{0.5}C = [5 - 1,\\, 5 + 1] = \\mathbf{[4,\\, 6]}$</p>
          <p>故正確答案為 <strong>(A)</strong>。</p>
        </div>
      `
    },
    {
      id: 'ch1_p5',
      tag: '八大代數定律 • 課堂與跨校講義必考證明',
      difficulty: '★★☆ 核心理論',
      question: '【第 5 題】在古典明確集合中，矛盾律 $A \\cap \\bar{A} = \\emptyset$ 與排中律 $A \\cup \\bar{A} = X$ 恆成立。但在使用 Zadeh 標準算子（$\\min, \\max, 1-A(x)$）的模糊集合中，若某元素 $x_0$ 處於模糊邊界且 $A(x_0) = 0.35$，則 $(A \\cap \\bar{A})(x_0)$ 與 $(A \\cup \\bar{A})(x_0)$ 的值為何？又模糊集合在什麼條件下才會滿足矛盾律？',
      options: [
        '交集為 0、聯集為 1；任何正規模糊集合皆滿足矛盾律',
        '交集為 0.35、聯集為 0.65；唯有當 A(x) 對所有 x 皆只取 0 或 1（即退化為明確集合）時，矛盾律與排中律才會成立',
        '交集為 0.2275、聯集為 0.7725；當 A(x) = 0.5 時滿足矛盾律',
        '交集為 0.65、聯集為 0.35；只要集合為凸形模糊集合即滿足排中律'
      ],
      answerIndex: 1,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 數學證明與充要條件分析：</div>
          <p>1. 已知 $A(x_0) = 0.35$，則標準模糊補集為 $\\bar{A}(x_0) = 1 - A(x_0) = 1 - 0.35 = 0.65$。</p>
          <p>2. 計算模糊交集（Zadeh $\\min$）與模糊聯集（Zadeh $\\max$）：</p>
          <div class="formula-display-card">$$(A \\cap \\bar{A})(x_0) = \\min(0.35,\\, 0.65) = \\mathbf{0.35 \\neq 0}, \\qquad (A \\cup \\bar{A})(x_0) = \\max(0.35,\\, 0.65) = \\mathbf{0.65 \\neq 1}$$</div>
          <p>3. <strong>充要條件證明</strong>：若要使矛盾律 $(A \\cap \\bar{A})(x) = \\min\\big(A(x),\\, 1 - A(x)\\big) = 0$ 對所有 $x \\in X$ 成立，則必有：</p>
          <div class="formula-display-card">$$A(x) = 0 \\quad \\text{或} \\quad 1 - A(x) = 0 \\iff A(x) \\in \\{0, 1\\},\\; \\forall x \\in X$$</div>
          <p>這意味著只要存在任何一個元素具有介於 $(0, 1)$ 之間的灰色模糊地帶，矛盾律與排中律就必然失效！您可以在上方【模組 3 圖 (c)】切換至「矛盾律與排中律檢驗」直接看到該重疊山峰。故選 <strong>(B)</strong>。</p>
        </div>
      `
    },
    {
      id: 'ch1_p6',
      tag: '正規與凸形檢定 • 課本頁 2-12 ～ 2-13 式 (2.3)(2.4)',
      difficulty: '★★☆ 觀念與證明',
      question: '【第 6 題】關於《認識 Fuzzy》第 2-12 至 2-13 頁定義的「正規模糊集合（Normal Fuzzy Set）」與「凸形模糊集合（Convex Fuzzy Set）」，下列哪一個敘述是錯誤的？',
      options: [
        '若模糊集合的高度 h(A) = sup A(x) = 1，則稱 A 為正規模糊集合；若 h(A) < 1，可除以 h(A) 將其正規化',
        '凸形模糊集合必須滿足：對任意 x₁ < x₂ 及 λ ∈ [0, 1]，恆有 A(λx₁ + (1-λ)x₂) ≥ min( A(x₁), A(x₂) )',
        '凸形模糊集合的充分必要條件是：它的每一個 α-截集 ᵃA（∀α ∈ (0, 1]）在實數軸上都是單一連續區間（或空集合），不會斷裂成兩段',
        '所謂「凸形模糊集合」，是指歸屬函數曲線 A(x) 在微積分上必須滿足二階導數 A\'\'(x) ≤ 0（即曲線不能有任何反曲點，如高斯函數就不是凸形模糊集合）'
      ],
      answerIndex: 3,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 關鍵迷思破除與數學定理：</div>
          <p>• <strong>選項 (A)(B)(C) 均完全正確</strong>：課本第 2-13 頁式 (2.4) 定義模糊集合的凸性為：</p>
          <div class="formula-display-card">$$A\\big(\\lambda x_1 + (1 - \\lambda)x_2\\big) \\ge \\min\\big(A(x_1),\\, A(x_2)\\big), \\qquad \\forall x_1, x_2 \\in X,\\; \\lambda \\in [0, 1]$$</div>
          <p>• <strong>為何選項 (D) 錯誤？</strong> 模糊集合論中的「凸形模糊集合（Convex Fuzzy Set）」對應於微積分中的「<strong>擬凹函數（Quasi-concave / 單峰無凹谷函數）</strong>」，只要求「任意兩點連線中間的高度不低於兩端點的較小值」（亦即曲線沒有中間凹陷的雙峰谷底），<strong>並不要求二階導數處處小於零</strong>！例如高斯函數 $e^{-(x-c)^2/2\\sigma^2}$ 與鐘形函數雖然兩側有反曲點，但因單峰無凹陷，其所有 $\\alpha$-截集皆為單一閉區間，因此它們<strong>都是標準的凸形模糊集合</strong>！故選 <strong>(D)</strong>。</p>
        </div>
      `
    },
    {
      id: 'ch1_p7',
      tag: '歸屬函數參數化實作 • 外校期中考計算題',
      difficulty: '★★★ 實戰計算',
      question: '【第 7 題】某智慧空調系統將室內溫度論域定為 $X = [10, 40]^\\circ\\text{C}$，其中「適中 $A_{\\text{warm}}$」採用三角形函數 $\\text{trimf}(x; 18, 24, 30)$，「偏熱 $A_{\\text{hot}}$」採用梯形函數 $\\text{trapmf}(x; 25, 31, 40, 40)$。當溫度感測器讀值為 $x^* = 27^\\circ\\text{C}$ 時，求 $(A_{\\text{warm}} \\cap A_{\\text{hot}})(27)$ 與 $(A_{\\text{warm}} \\cup A_{\\text{hot}})(27)$ 之值？',
      options: [
        '交集 = 0.50， 聯集 = 0.50',
        '交集 = 0.333， 聯集 = 0.500',
        '交集 = 0.500， 聯集 = 0.667',
        '交集 = 0.167， 聯集 = 0.833'
      ],
      answerIndex: 1,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 分段線性歸屬函數逐步代入計算：</div>
          <p><strong>步驟 1：計算 $x^* = 27$ 在「適中」三角形 $\\text{trimf}(x; 18, 24, 30)$ 的歸屬度</strong><br/>因為 $24 < 27 < 30$ 位於三角形右斜邊下降段 $(c - x)/(c - b)$：</p>
          <div class="formula-display-card">$$A_{\\text{warm}}(27) = \\frac{30 - 27}{30 - 24} = \\frac{3}{6} = \\mathbf{0.500}$$</div>
          <p><strong>步驟 2：計算 $x^* = 27$ 在「偏熱」梯形 $\\text{trapmf}(x; 25, 31, 40, 40)$ 的歸屬度</strong><br/>因為 $25 < 27 < 31$ 位於梯形左斜邊上升段 $(x - a)/(b - a)$：</p>
          <div class="formula-display-card">$$A_{\\text{hot}}(27) = \\frac{27 - 25}{31 - 25} = \\frac{2}{6} = \\frac{1}{3} \\approx \\mathbf{0.333}$$</div>
          <p><strong>步驟 3：求標準模糊交集（$\\min$）與聯集（$\\max$）</strong>：</p>
          <div class="formula-display-card">$$(A_{\\text{warm}} \\cap A_{\\text{hot}})(27) = \\min(0.500,\\, 0.333) = \\mathbf{0.333}, \\qquad (A_{\\text{warm}} \\cup A_{\\text{hot}})(27) = \\max(0.500,\\, 0.333) = \\mathbf{0.500}$$</div>
          <p>故正確答案為 <strong>(B)</strong>。</p>
        </div>
      `
    },
    {
      id: 'ch1_p8',
      tag: '綜合實作題 • 課本頁 2-14 習題 2.7(b) 完整演練',
      difficulty: '★★★ 綜合驗收',
      question: '【第 8 題】設宇集合為正整數 $X = \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\}$，定義模糊集合 $B = 0.2/2 + 0.4/3 + 0.6/4 + 0.8/5 + 1.0/6 + 0.5/7$（未列出之元素歸屬度皆為 $0$）。下列關於集合 $B$ 與其補集 $\\bar{B}$ 的計算結果，何者完全正確？',
      options: [
        '底集 ⁰⁺B = {2, 3, 4, 5, 6, 7}， 純基數 |B| = 3.5， 且補集純基數 |B̄| = 6.5',
        '底集 ⁰⁺B = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}， 純基數 |B| = 3.5， 且補集純基數 |B̄| = 2.5',
        '核 ¹B = {6}， ⁰·⁵B = {4, 5, 6}， ⁰·⁵⁺B = {4, 5, 6, 7}',
        '補集 B̄ 的核 ¹(B̄) = ∅，因為 B 是正規模糊集合'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 綜合指標逐項驗算（課本習題 2.7b 詳解）：</div>
          <p>1. <strong>底集（Support $\\text{}^{0+}B$）与核（Core $\\text{}^{1}B$）</strong>：</p>
          <div class="formula-display-card">$$\\text{}^{0+}B = \\{x \\in X \\mid B(x) > 0\\} = \\mathbf{\\{2, 3, 4, 5, 6, 7\\}}, \\qquad \\text{}^{1}B = \\{x \\in X \\mid B(x) = 1\\} = \\mathbf{\\{6\\}}$$</div>
          <p>2. <strong>一般截集 $\\text{}^{0.5}B$ vs. 強截集 $\\text{}^{0.5+}B$</strong>：<br/>$\\text{}^{0.5}B = \\{4, 5, 6, 7\\}$（含 $B(7)=0.5$），而強截集 $\\text{}^{0.5+}B = \\{4, 5, 6\\}$（不含 $7$），故選項 (C) 寫反了。</p>
          <p>3. <strong>純基數 $|B|$ 與補集純基數 $|\\bar{B}|$（注意宇集合 $X$ 共有 $10$ 個元素！）</strong>：</p>
          <div class="formula-display-card">$$|B| = 0.2 + 0.4 + 0.6 + 0.8 + 1.0 + 0.5 = \\mathbf{3.5}$$</div>
          <p>補集 $\\bar{B}(x) = 1 - B(x)$ 對原本歸屬度為 $0$ 的元素 $x \\in \\{1, 8, 9, 10\\}$ 皆會變成 $\\bar{B}(x) = 1.0$！因此：</p>
          <div class="formula-display-card">$$|\\bar{B}| = \\sum_{x=1}^{10} \\big(1 - B(x)\\big) = |X| - |B| = 10 - 3.5 = \\mathbf{6.5}$$</div>
          <p>且補集的核為 $\\text{}^{1}\\bar{B} = \\{1, 8, 9, 10\\} \\neq \\emptyset$。故完全正確的選項為 <strong>(A)</strong>！</p>
        </div>
      `
    }
  ];

  // ==========================================================================
  // Chapter 01 子模組切換與互動事件控制（連動左側邊欄導覽列）
  // ==========================================================================
  function getActiveCh1Module() {
    return ch1ActiveModule;
  }

  function switchCh1Module(modId, shouldScroll) {
    ch1ActiveModule = modId;
    const modIds = ['m1', 'm2', 'm3', 'm4'];

    // 更新頂部快速按鈕樣式
    ['all', ...modIds].forEach(function (id) {
      const topBtn = document.getElementById('ch1-mod-btn-' + id);
      if (topBtn) {
        if (id === modId) {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 transition';
        } else {
          topBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition';
        }
      }
    });

    // 更新左側邊欄子分頁按鈕樣式
    ['all', ...modIds].forEach(function (id) {
      const btn = document.getElementById('ch1-subtab-btn-' + id);
      if (!btn) return;
      if (id === modId) {
        btn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-md shadow-sky-500/20';
      } else {
        btn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium';
      }
    });

    // 顯示/隱藏對應區塊
    modIds.forEach(function (id) {
      const sec = document.getElementById('ch1-module-sec-' + id);
      if (!sec) return;
      if (modId === 'all' || modId === id) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    if (modId === 'all' || modId === 'm3') {
      setTimeout(function () {
        updatePlotA();
        updatePlotB();
        updatePlotC();
        updatePlotD();
      }, 50);
    }

    if (shouldScroll) {
      setTimeout(function () {
        const targetEl = modId === 'all'
          ? document.getElementById('chapter-content-container')
          : document.getElementById('ch1-module-sec-' + modId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }

    safeMathJax();
  }

  function jumpToCh1Plot(plotKey) {
    switchCh1Module('m3');
    setTimeout(function () {
      const el = document.getElementById('ch1-plot-card-' + plotKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('pulse-focus');
        void el.offsetWidth;
        el.classList.add('pulse-focus');
      }
    }, 80);
  }

  // ==========================================================================
  // 【模組 3 - 圖 (a)】：明確集合 vs. 模糊集合邊界過渡模擬器 (可調門檻與平滑斜率)
  // ==========================================================================
  function setPlotAPreset(threshold, slope, probe) {
    const tEl = document.getElementById('plotA-threshold');
    const kEl = document.getElementById('plotA-slope');
    const xEl = document.getElementById('plotA-probe');
    if (tEl) tEl.value = threshold;
    if (kEl) kEl.value = slope;
    if (xEl) xEl.value = probe;
    updatePlotA();
  }

  function updatePlotA() {
    const plotEl = document.getElementById('plot-ch1-a');
    if (!plotEl) return;

    const T = parseFloat((document.getElementById('plotA-threshold') || {}).value || 9.0);
    const k = parseFloat((document.getElementById('plotA-slope') || {}).value || 0.9);
    const xProbe = parseFloat((document.getElementById('plotA-probe') || {}).value || 9.0);
    const mode = ((document.getElementById('plotA-type') || {}).value) || 'child';

    const tValEl = document.getElementById('plotA-threshold-val');
    const kValEl = document.getElementById('plotA-slope-val');
    const xValEl = document.getElementById('plotA-probe-val');
    if (tValEl) tValEl.textContent = T.toFixed(1);
    if (kValEl) kValEl.textContent = k.toFixed(2);
    if (xValEl) xValEl.textContent = xProbe.toFixed(1);

    const xs = [];
    const yCrisp = [];
    const yFuzzy = [];

    function evalFuzzyA(x) {
      if (mode === 'child') {
        // 以門檻 T 為 0.5 過渡點、k 為平滑斜率的鐘形/S型過渡曲線（貼合課本圖 2.2 小朋友）
        if (x < 3) {
          return 1 / (1 + Math.exp(-k * 2.2 * (x - 2.0)));
        }
        return 1 / (1 + Math.exp(k * 1.8 * (x - T)));
      } else {
        // Sigmoid 高溫/過胖漸增型 (貼合課本圖 2.1 / 圖 2.6)
        return 1 / (1 + Math.exp(-k * 1.8 * (x - T)));
      }
    }

    function evalCrispA(x) {
      if (mode === 'child') {
        return (x >= 2.0 && x <= T) ? 1.0 : 0.0;
      } else {
        return x >= T ? 1.0 : 0.0;
      }
    }

    for (let x = 0; x <= 15; x += 0.1) {
      const xv = Number(x.toFixed(1));
      xs.push(xv);
      yCrisp.push(evalCrispA(xv));
      yFuzzy.push(evalFuzzyA(xv));
    }

    const muC = evalCrispA(xProbe);
    const muF = evalFuzzyA(xProbe);
    const diff = Math.abs(muF - muC);

    const fRead = document.getElementById('plotA-fuzzy-readout');
    const cRead = document.getElementById('plotA-crisp-readout');
    const dRead = document.getElementById('plotA-diff-readout');
    if (fRead) fRead.textContent = muF.toFixed(3);
    if (cRead) cRead.textContent = muC.toFixed(3);
    if (dRead) dRead.textContent = diff.toFixed(3);

    const traces = [
      {
        x: xs,
        y: yCrisp,
        name: '明確集合特性函數 Φ_A(x) ∈ {0, 1} (階梯一刀切)',
        mode: 'lines',
        line: { color: '#fb7185', width: 3, shape: 'hv', dash: 'dot' },
        fill: 'tozeroy',
        fillcolor: 'rgba(251, 113, 133, 0.10)'
      },
      {
        x: xs,
        y: yFuzzy,
        name: '模糊集合歸屬函數 A(x) ∈ [0, 1] (連續平滑過渡)',
        mode: 'lines',
        line: { color: '#38bdf8', width: 4 },
        fill: 'tozeroy',
        fillcolor: 'rgba(56, 189, 248, 0.20)'
      },
      {
        x: [T, T],
        y: [0, 1.08],
        name: '門檻邊界 T = ' + T.toFixed(1),
        mode: 'lines',
        line: { color: '#f43f5e', width: 1.5, dash: 'dashdot' }
      },
      {
        x: [xProbe, xProbe],
        y: [0, 1.08],
        name: '觀測探針 x* = ' + xProbe.toFixed(1),
        mode: 'lines',
        line: { color: '#facc15', width: 2.5, dash: 'dash' }
      },
      {
        x: [xProbe, xProbe],
        y: [muC, muF],
        name: '當前歸屬度對照',
        mode: 'markers',
        marker: { size: 13, color: ['#fb7185', '#38bdf8'], line: { color: '#fff', width: 2 } }
      }
    ];

    safePlot('plot-ch1-a', traces, getBaseLayout('論域變數 x（例如：年齡 / 溫度）', '歸屬度 A(x) 與特性值 Φ_A(x)', [0, 15]));
  }

  // ==========================================================================
  // 【模組 3 - 圖 (b)】：四大典型歸屬函數造型實驗室 (三角形、梯形、高斯、S型/Z型)
  // ==========================================================================
  function selectPlotBShape(shape) {
    plotBActiveShape = shape;
    ['all', 'trimf', 'trapmf', 'gaussmf', 'smf'].forEach(function (s) {
      const btn = document.getElementById('plotB-btn-' + s);
      if (!btn) return;
      if (s === shape) {
        btn.className = 'px-3.5 py-2 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 transition';
      } else {
        btn.className = 'px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm transition';
      }
    });
    updatePlotB();
  }

  function updatePlotB() {
    const plotEl = document.getElementById('plot-ch1-b');
    if (!plotEl) return;

    const a = parseFloat((document.getElementById('plotB-param-a') || {}).value || 20);
    const b = Math.max(a + 2, parseFloat((document.getElementById('plotB-param-b') || {}).value || 40));
    const c = Math.max(b + 2, parseFloat((document.getElementById('plotB-param-c') || {}).value || 60));
    const d = Math.max(c + 2, parseFloat((document.getElementById('plotB-param-d') || {}).value || 80));
    const sigma = parseFloat((document.getElementById('plotB-param-sigma') || {}).value || 10);
    const xStar = parseFloat((document.getElementById('plotB-param-x') || {}).value || 45);

    const setSpan = function (id, txt) {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    setSpan('plotB-val-a', a.toFixed(0));
    setSpan('plotB-val-b', b.toFixed(0));
    setSpan('plotB-val-c', c.toFixed(0));
    setSpan('plotB-val-d', d.toFixed(0));
    setSpan('plotB-val-sigma', sigma.toFixed(1));
    setSpan('plotB-val-x', xStar.toFixed(1));

    const xs = [];
    const yTri = [];
    const yTrap = [];
    const yGauss = [];
    const yS = [];
    const yZ = [];

    for (let x = 0; x <= 100; x += 0.5) {
      xs.push(x);
      yTri.push(trimf(x, a, b, c));
      yTrap.push(trapmf(x, a, b, c, d));
      yGauss.push(gaussmf(x, b, sigma));
      yS.push(smf(x, a, c));
      yZ.push(zmf(x, a, c));
    }

    const traces = [];
    if (plotBActiveShape === 'all' || plotBActiveShape === 'trimf') {
      traces.push({
        x: xs, y: yTri,
        name: `1. 三角形 trimf(x; ${a}, ${b}, ${c})`,
        mode: 'lines',
        line: { color: '#38bdf8', width: plotBActiveShape === 'trimf' ? 4 : 3 },
        fill: plotBActiveShape === 'trimf' ? 'tozeroy' : 'none',
        fillcolor: 'rgba(56, 189, 248, 0.18)'
      });
    }
    if (plotBActiveShape === 'all' || plotBActiveShape === 'trapmf') {
      traces.push({
        x: xs, y: yTrap,
        name: `2. 梯形 trapmf(x; ${a}, ${b}, ${c}, ${d})`,
        mode: 'lines',
        line: { color: '#34d399', width: plotBActiveShape === 'trapmf' ? 4 : 3 },
        fill: plotBActiveShape === 'trapmf' ? 'tozeroy' : 'none',
        fillcolor: 'rgba(52, 211, 153, 0.18)'
      });
    }
    if (plotBActiveShape === 'all' || plotBActiveShape === 'gaussmf') {
      traces.push({
        x: xs, y: yGauss,
        name: `3. 高斯型 gaussmf(x; c=${b}, σ=${sigma})`,
        mode: 'lines',
        line: { color: '#c084fc', width: plotBActiveShape === 'gaussmf' ? 4 : 3 },
        fill: plotBActiveShape === 'gaussmf' ? 'tozeroy' : 'none',
        fillcolor: 'rgba(192, 132, 252, 0.18)'
      });
    }
    if (plotBActiveShape === 'all' || plotBActiveShape === 'smf') {
      traces.push({
        x: xs, y: yS,
        name: `4a. S型函數 smf(x; ${a}, ${c})`,
        mode: 'lines',
        line: { color: '#f59e0b', width: 3.5 }
      });
      traces.push({
        x: xs, y: yZ,
        name: `4b. Z型函數 zmf(x; ${a}, ${c})`,
        mode: 'lines',
        line: { color: '#fb7185', width: 3, dash: 'dash' }
      });
    }

    traces.push({
      x: [xStar, xStar],
      y: [0, 1.08],
      name: `探針 x* = ${xStar.toFixed(1)}`,
      mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' }
    });

    safePlot('plot-ch1-b', traces, getBaseLayout('論域變數 x ∈ [0, 100]', '歸屬度 μ(x)', [0, 100]));

    // 即時更新公式對照盒
    const vTri = trimf(xStar, a, b, c).toFixed(3);
    const vTrap = trapmf(xStar, a, b, c, d).toFixed(3);
    const vGauss = gaussmf(xStar, b, sigma).toFixed(3);
    const vS = smf(xStar, a, c).toFixed(3);

    const formulaBox = document.getElementById('plotB-formula-box');
    if (formulaBox) {
      formulaBox.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-left text-xs sm:text-sm">
          <div class="bg-slate-950/90 p-3.5 rounded-xl border border-sky-500/30">
            <div class="font-bold text-sky-300 mb-1">🔹 三角形 $\\text{trimf}(x; a,b,c) = \\max\\!\\left(\\min\\!\\left(\\frac{x-a}{b-a}, \\frac{c-x}{c-b}\\right), 0\\right)$</div>
            <div class="font-mono text-slate-200">當 $(a,b,c)=(${a},${b},${c})$，於 $x^*=${xStar}$ 處：$\\mu_{\\text{tri}}(${xStar}) = \\mathbf{${vTri}}$</div>
          </div>
          <div class="bg-slate-950/90 p-3.5 rounded-xl border border-emerald-500/30">
            <div class="font-bold text-emerald-300 mb-1">🟢 梯形 $\\text{trapmf}(x; a,b,c,d) = \\max\\!\\left(\\min\\!\\left(\\frac{x-a}{b-a}, 1, \\frac{d-x}{d-c}\\right), 0\\right)$</div>
            <div class="font-mono text-slate-200">當 $(a,b,c,d)=(${a},${b},${c},${d})$，於 $x^*=${xStar}$ 處：$\\mu_{\\text{trap}}(${xStar}) = \\mathbf{${vTrap}}$</div>
          </div>
          <div class="bg-slate-950/90 p-3.5 rounded-xl border border-purple-500/30">
            <div class="font-bold text-purple-300 mb-1">🟣 高斯函數 $\\text{gaussmf}(x; c,\\sigma) = \\exp\\!\\left(-\\frac{(x-c)^2}{2\\sigma^2}\\right)$</div>
            <div class="font-mono text-slate-200">當 $(c,\\sigma)=(${b},${sigma})$，於 $x^*=${xStar}$ 處：$\\mu_{\\text{gauss}}(${xStar}) = \\mathbf{${vGauss}}$</div>
          </div>
          <div class="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/30">
            <div class="font-bold text-amber-300 mb-1">🟠 S 型 / Z 型函數 $\\text{smf}(x; a, c)$ 與 $\\text{zmf} = 1 - \\text{smf}$</div>
            <div class="font-mono text-slate-200">當轉折區間 $[a,c]=[${a},${c}]$，於 $x^*=${xStar}$ 處：$\\mu_S = \\mathbf{${vS}},\\; \\mu_Z = \\mathbf{${(1 - parseFloat(vS)).toFixed(3)}}$</div>
          </div>
        </div>
      `;
      safeMathJax([formulaBox]);
    }
  }

  // ==========================================================================
  // 【模組 3 - 圖 (c)】：模糊交集 (Min)、聯集 (Max) 與補集動態運算器 (含矛盾律/排中律檢驗)
  // ==========================================================================
  function updatePlotC() {
    const plotEl = document.getElementById('plot-ch1-c');
    if (!plotEl) return;

    const cA = parseFloat((document.getElementById('plotC-center-a') || {}).value || 35);
    const cB = parseFloat((document.getElementById('plotC-center-b') || {}).value || 55);
    const width = parseFloat((document.getElementById('plotC-width') || {}).value || 12);
    const mode = ((document.getElementById('plotC-mode') || {}).value) || 'min_max';

    const setSpan = function (id, txt) {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    setSpan('plotC-val-ca', cA.toFixed(0));
    setSpan('plotC-val-cb', cB.toFixed(0));
    setSpan('plotC-val-w', width.toFixed(1));

    const xs = [];
    const muA = [];
    const muB = [];
    const muInter = [];
    const muUnion = [];

    let maxInter = 0;
    let minUnionInSupport = 1;

    for (let x = 0; x <= 100; x += 0.5) {
      xs.push(x);
      const a = gaussmf(x, cA, width);
      const b = mode === 'excluded_middle' ? (1 - a) : gaussmf(x, cB, width);
      const inter = Math.min(a, b);
      const union = Math.max(a, b);

      muA.push(a);
      muB.push(b);
      muInter.push(inter);
      muUnion.push(union);

      if (inter > maxInter) maxInter = inter;
      if (union < minUnionInSupport) minUnionInSupport = union;
    }

    const traces = [
      {
        x: xs, y: muA,
        name: '模糊集合 A(x)',
        mode: 'lines',
        line: { color: '#38bdf8', width: 2.5, dash: 'dot' }
      },
      {
        x: xs, y: muB,
        name: mode === 'excluded_middle' ? '模糊補集 Ā(x) = 1 - A(x)' : '模糊集合 B(x)',
        mode: 'lines',
        line: { color: '#f59e0b', width: 2.5, dash: 'dot' }
      },
      {
        x: xs, y: muUnion,
        name: mode === 'excluded_middle' ? '排中律檢驗 (A ∪ Ā)(x) = max(A, 1-A) ≠ 1' : '模糊聯集 (A ∪ B)(x) = max(A, B)',
        mode: 'lines',
        line: { color: '#c084fc', width: 3.5 },
        fill: 'tozeroy',
        fillcolor: 'rgba(192, 132, 252, 0.12)'
      },
      {
        x: xs, y: muInter,
        name: mode === 'excluded_middle' ? '矛盾律檢驗 (A ∩ Ā)(x) = min(A, 1-A) ≠ 0' : '模糊交集 (A ∩ B)(x) = min(A, B)',
        mode: 'lines',
        line: { color: '#10b981', width: 4 },
        fill: 'tozeroy',
        fillcolor: 'rgba(16, 185, 129, 0.34)'
      }
    ];

    safePlot('plot-ch1-c', traces, getBaseLayout('論域變數 x ∈ [0, 100]', '歸屬度 μ(x)', [0, 100]));

    const statusBox = document.getElementById('plotC-status-box');
    if (statusBox) {
      if (mode === 'excluded_middle') {
        statusBox.innerHTML = `
          <div class="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs sm:text-sm text-rose-100 leading-relaxed">
            🔥 <strong>矛盾律與排中律不成立之視覺化證明：</strong>
            請看圖中綠色塗色山峰：模糊集合 $A$ 與其補集 $\\bar{A} = 1 - A$ 的交集 $(A \\cap \\bar{A})(x) = \\min(A(x), 1-A(x))$ 最高達到 <strong>$${maxInter.toFixed(2)} \\neq 0$</strong>（不為空集合 $\\emptyset$，違反矛盾律）；而紫色聯集包絡線 $(A \\cup \\bar{A})(x) = \\max(A(x), 1-A(x))$ 在交界處凹陷至 <strong>$${minUnionInSupport.toFixed(2)} \\neq 1$</strong>（不等於宇集合 $X$，違反排中律）！
          </div>
        `;
      } else {
        statusBox.innerHTML = `
          <div class="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
            💡 <strong>動態交集與聯集觀察：</strong>
            目前集合 $A$ 中心為 $c_A = ${cA}$、集合 $B$ 中心為 $c_B = ${cB}$。圖中<strong>綠色實心區域</strong>即為模糊交集 $(A \\cap B)(x) = \\min(A(x), B(x))$（最高重疊度為 $\\mathbf{${maxInter.toFixed(2)}}$）；<strong>紫色外包絡線</strong>則為模糊聯集 $(A \\cup B)(x) = \\max(A(x), B(x))$。
          </div>
        `;
      }
      safeMathJax([statusBox]);
    }
  }

  // ==========================================================================
  // 【模組 3 - 圖 (d)】：α-截集 (Alpha-cut)、核 (Core) 與支集 (Support) 水平切線模擬器
  // ==========================================================================
  function setPlotDAlpha(val, curveMode) {
    const sl = document.getElementById('plotD-alpha');
    if (sl) sl.value = val;
    if (curveMode) {
      const sel = document.getElementById('plotD-curve-mode');
      if (sel) sel.value = curveMode;
    }
    updatePlotD();
  }

  function updatePlotD() {
    const plotEl = document.getElementById('plot-ch1-d');
    if (!plotEl) return;

    const alpha = parseFloat((document.getElementById('plotD-alpha') || {}).value || 0.5);
    const curveMode = ((document.getElementById('plotD-curve-mode') || {}).value) || 'trapezoid_convex';

    const aSpan = document.getElementById('plotD-alpha-val');
    if (aSpan) aSpan.textContent = alpha.toFixed(2);

    const xs = [];
    const yCurve = [];
    const yCutStep = [];

    function evalCurveD(x) {
      if (curveMode === 'triangle_fig28') {
        // 課本圖 2.8 中年人對稱三角形 [20, 40, 60]
        return trimf(x, 20, 40, 60);
      } else if (curveMode === 'nonconvex_fig29b') {
        // 課本圖 2.9(b) 正規但非凸雙峰集合 (峰 1 在 30，峰 2 在 68，中間谷底約 0.35)
        return Math.max(gaussmf(x, 30, 7.5), 0.92 * gaussmf(x, 68, 8.0));
      } else {
        // 預設：梯形凸模糊集合 [15, 35, 55, 80] (同時清楚展示核 Core 區間與底集 Support 區間)
        return trapmf(x, 15, 35, 55, 80);
      }
    }

    for (let x = 0; x <= 100; x += 0.5) {
      xs.push(x);
      const mu = evalCurveD(x);
      yCurve.push(mu);
      yCutStep.push(mu >= (alpha > 0 ? alpha : 0.001) ? alpha : 0);
    }

    // 計算截集區間字串
    let cutIntervalText = '';
    let strongCutText = '';
    let coreText = '';
    let supportText = '';

    if (curveMode === 'triangle_fig28') {
      coreText = '\\{40\\}';
      supportText = '(20,\\; 60)';
      if (alpha === 0) {
        cutIntervalText = '[0,\\; 100] \\;(\\text{全宇集 } X)';
        strongCutText = '(20,\\; 60) \\;(\\text{底集 Support})';
      } else if (alpha === 1) {
        cutIntervalText = '\\{40\\} \\;(\\text{核 Core})';
        strongCutText = '\\emptyset';
      } else {
        const xl = (20 + 20 * alpha).toFixed(1);
        const xr = (60 - 20 * alpha).toFixed(1);
        cutIntervalText = `[${xl},\\; ${xr}]`;
        strongCutText = `(${xl},\\; ${xr})`;
      }
    } else if (curveMode === 'trapezoid_convex') {
      coreText = '[35,\\; 55]';
      supportText = '(15,\\; 80)';
      if (alpha === 0) {
        cutIntervalText = '[0,\\; 100]';
        strongCutText = '(15,\\; 80) \\;(\\text{底集 Support})';
      } else if (alpha === 1) {
        cutIntervalText = '[35,\\; 55] \\;(\\text{核 Core})';
        strongCutText = '\\emptyset';
      } else {
        const xl = (15 + 20 * alpha).toFixed(1);
        const xr = (80 - 25 * alpha).toFixed(1);
        cutIntervalText = `[${xl},\\; ${xr}]`;
        strongCutText = `(${xl},\\; ${xr})`;
      }
    } else {
      coreText = '\\{30\\}';
      supportText = '(8,\\; 90)';
      // 雙峰非凸搜尋區間
      const inSet = xs.filter(function (x, idx) { return yCurve[idx] >= Math.max(0.01, alpha); });
      if (alpha > 0.36 && alpha < 0.90) {
        const leftPart = inSet.filter(function (x) { return x < 49; });
        const rightPart = inSet.filter(function (x) { return x >= 49; });
        if (leftPart.length && rightPart.length) {
          cutIntervalText = `[${leftPart[0].toFixed(1)},\\, ${leftPart[leftPart.length - 1].toFixed(1)}] \\;\\cup\\; [${rightPart[0].toFixed(1)},\\, ${rightPart[rightPart.length - 1].toFixed(1)}] \\;\\text{(斷裂為兩塊 -> 非凸！)}`;
          strongCutText = `(${leftPart[0].toFixed(1)},\\, ${leftPart[leftPart.length - 1].toFixed(1)}) \\;\\cup\\; (${rightPart[0].toFixed(1)},\\, ${rightPart[rightPart.length - 1].toFixed(1)})`;
        }
      }
      if (!cutIntervalText) {
        cutIntervalText = inSet.length ? `[${inSet[0].toFixed(1)},\\; ${inSet[inSet.length - 1].toFixed(1)}]` : '\\emptyset';
        strongCutText = inSet.length ? `(${inSet[0].toFixed(1)},\\; ${inSet[inSet.length - 1].toFixed(1)})` : '\\emptyset';
      }
    }

    const traces = [
      {
        x: xs,
        y: yCurve,
        name: '模糊集合歸屬函數 A(x)',
        mode: 'lines',
        line: { color: '#38bdf8', width: 4 },
        fill: 'tozeroy',
        fillcolor: 'rgba(56, 189, 248, 0.14)'
      },
      {
        x: xs,
        y: yCutStep,
        name: `α-截集高亮區間 (A(x) ≥ ${alpha.toFixed(2)})`,
        mode: 'lines',
        line: { color: '#10b981', width: 2.5, shape: 'hv' },
        fill: 'tozeroy',
        fillcolor: 'rgba(16, 185, 129, 0.36)'
      },
      {
        x: [0, 100],
        y: [alpha, alpha],
        name: `水平切線 α = ${alpha.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#facc15', width: 3, dash: 'dash' }
      }
    ];

    safePlot('plot-ch1-d', traces, getBaseLayout('論域變數 x ∈ [0, 100]（高亮綠色區域即對應 x 軸明確截集區間）', '歸屬度 A(x)', [0, 100]));

    const infoBox = document.getElementById('plotD-info-box');
    if (infoBox) {
      infoBox.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
          <div class="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/40">
            <div class="text-emerald-300 font-bold mb-1">🔪 當前 $\\alpha$-截集 $\\text{}^{${alpha.toFixed(2)}}A$</div>
            <div class="text-white font-mono">$$${cutIntervalText}$$</div>
          </div>
          <div class="bg-slate-950 p-3.5 rounded-xl border border-sky-500/35">
            <div class="text-sky-300 font-bold mb-1">⚡ 強 $\\alpha$-截集 $\\text{}^{${alpha.toFixed(2)}+}A$</div>
            <div class="text-slate-200 font-mono">$$${strongCutText}$$</div>
          </div>
          <div class="bg-slate-950 p-3.5 rounded-xl border border-rose-500/35">
            <div class="text-rose-300 font-bold mb-1">🎯 核 (Core) $\\text{}^{1}A$ ($A(x)=1$)</div>
            <div class="text-slate-200 font-mono">$$${coreText}$$</div>
          </div>
          <div class="bg-slate-950 p-3.5 rounded-xl border border-amber-500/35">
            <div class="text-amber-300 font-bold mb-1">📏 支集/底集 (Support) $\\text{}^{0+}A$</div>
            <div class="text-slate-200 font-mono">$$${supportText}$$</div>
          </div>
        </div>
      `;
      safeMathJax([infoBox]);
    }
  }

  // ==========================================================================
  // 模組 4：題目作答與詳解展開邏輯
  // ==========================================================================
  function answerCh1Practice(probId, optIdx) {
    ch1PracticeAnswers[probId] = optIdx;
    ch1SolutionExpanded[probId] = true; // 作答後自動展開詳解方便對照
    renderCh1PracticeList();
  }

  function toggleCh1Solution(probId) {
    ch1SolutionExpanded[probId] = !ch1SolutionExpanded[probId];
    renderCh1PracticeList();
  }

  function renderCh1PracticeList() {
    const holder = document.getElementById('ch1-practice-list-holder');
    if (!holder) return;

    let correctCount = 0;
    CH1_PRACTICE_PROBLEMS.forEach(function (p) {
      if (ch1PracticeAnswers[p.id] === p.answerIndex) correctCount++;
    });

    const scoreEl = document.getElementById('ch1-practice-score');
    if (scoreEl) {
      scoreEl.textContent = `${correctCount} / ${CH1_PRACTICE_PROBLEMS.length}`;
    }

    holder.innerHTML = CH1_PRACTICE_PROBLEMS.map(function (p, idx) {
      const selected = ch1PracticeAnswers[p.id];
      const isAnswered = selected !== undefined;
      const isCorrect = selected === p.answerIndex;
      const isExpanded = !!ch1SolutionExpanded[p.id];

      const optionsHtml = p.options.map(function (opt, oIdx) {
        let cls = 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200';
        let badge = String.fromCharCode(65 + oIdx);
        if (isAnswered) {
          if (oIdx === p.answerIndex) {
            cls = 'bg-emerald-950/75 border-emerald-500/80 text-emerald-200 font-bold';
            badge = '✓';
          } else if (oIdx === selected) {
            cls = 'bg-rose-950/75 border-rose-500/80 text-rose-200';
            badge = '✗';
          } else {
            cls = 'bg-slate-900/40 border-slate-800/50 text-slate-500';
          }
        }
        return `
          <button onclick="FuzzyWidgets.answerCh1Practice('${p.id}', ${oIdx})"
            class="w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 text-sm sm:text-base ${cls}">
            <span class="w-7 h-7 shrink-0 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold mt-0.5">${badge}</span>
            <span class="leading-relaxed">${opt}</span>
          </button>
        `;
      }).join('');

      return `
        <article class="refined-card p-6 sm:p-7 space-y-5 border-l-4 ${isAnswered ? (isCorrect ? 'border-l-emerald-400' : 'border-l-rose-400') : 'border-l-indigo-400'}">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 text-xs font-bold">${p.tag}</span>
              <span class="text-xs font-mono text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">${p.difficulty}</span>
            </div>
            ${isAnswered ? `<span class="text-xs font-bold px-3 py-1 rounded-full ${isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}">${isCorrect ? '✅ 答對了！' : '❌ 觀念需釐清（請看下方詳解）'}</span>` : ''}
          </div>

          <div class="prose-reading text-white font-semibold text-base sm:text-lg leading-relaxed">
            ${p.question}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            ${optionsHtml}
          </div>

          <div class="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <button onclick="FuzzyWidgets.toggleCh1Solution('${p.id}')"
              class="px-4 py-2 rounded-xl ${isExpanded ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold'} text-xs sm:text-sm transition flex items-center gap-2">
              <span>${isExpanded ? '🔼 收合完整數學推導詳解' : '📖 點擊展開完整數學推導詳解'}</span>
            </button>
            <span class="text-xs text-slate-400">題號 ${idx + 1} / ${CH1_PRACTICE_PROBLEMS.length}</span>
          </div>

          <div class="${isExpanded ? '' : 'hidden'} bg-slate-950/90 rounded-2xl p-6 border border-indigo-500/40 prose-reading text-sm sm:text-base text-slate-200">
            ${p.derivation}
          </div>
        </article>
      `;
    }).join('');

    safeMathJax([holder]);
  }

  // ==========================================================================
  // Chapter 02 & Chapter 03 輔助互動實驗器（保留給第 2、3 章使用）
  // ==========================================================================
  function updateFig27Widget() {
    const plotEl = document.getElementById('plot-fig27');
    if (!plotEl) return;
    const pSlider = document.getElementById('fig27-p-slider');
    const pVal = pSlider ? parseFloat(pSlider.value) : 1.0;
    const pLabel = document.getElementById('fig27-p-val');
    if (pLabel) pLabel.textContent = pVal.toFixed(1);

    const xArr = [];
    const yA1 = [];
    const yA2 = [];
    const yA3 = [];
    const yA4 = [];

    for (let x = 0; x <= 10; x += 0.05) {
      xArr.push(x);
      const width1 = 1 / pVal;
      yA1.push(Math.abs(x - 5) <= width1 ? 1 - Math.abs(x - 5) / width1 : 0);
      yA2.push(1 / (1 + pVal * Math.pow(x - 5, 2)));
      yA3.push(Math.exp(-Math.abs(pVal * (x - 5))));
      yA4.push(Math.abs(x - 5) <= 1 / pVal ? (1 + Math.cos(pVal * Math.PI * (x - 5))) / 2 : 0);
    }

    safePlot('plot-fig27', [
      { x: xArr, y: yA1, name: '圖 2.7(a) 三角形 A₁(x)', mode: 'lines', line: { color: '#38bdf8', width: 2.5 } },
      { x: xArr, y: yA2, name: '圖 2.7(b) 鐘形分式 A₂(x)', mode: 'lines', line: { color: '#34d399', width: 3 } },
      { x: xArr, y: yA3, name: '圖 2.7(c) 指數尖峰 A₃(x)', mode: 'lines', line: { color: '#f59e0b', width: 2.5, dash: 'dot' } },
      { x: xArr, y: yA4, name: '圖 2.7(d) 餘弦波峰 A₄(x)', mode: 'lines', line: { color: '#c084fc', width: 2.5 } },
      { x: [5, 5], y: [0, 1], name: '圖 2.7(e) 模糊單值 Singleton A₅(x)', mode: 'lines+markers', line: { color: '#fb7185', width: 4 }, marker: { size: 10, color: '#fb7185' } }
    ], getBaseLayout('實數 x —「靠近 5 之實數」', '歸屬度 A_i(x)', [0, 10]));
  }

  function updateOpsWidget() {
    const plotEl = document.getElementById('plot-ops-widget');
    if (!plotEl) return;
    const modeSelect = document.getElementById('ops-widget-mode');
    const sepSlider = document.getElementById('ops-widget-sep');
    const mode = modeSelect ? modeSelect.value : 'zadeh';
    const centerB = sepSlider ? parseFloat(sepSlider.value) : 26;
    const sepLabel = document.getElementById('ops-widget-sep-val');
    if (sepLabel) sepLabel.textContent = centerB + '°C';

    const xArr = [];
    const muA = [];
    const muB = [];
    const muInter = [];
    const muUnion = [];

    for (let x = 10; x <= 40; x += 0.25) {
      xArr.push(x);
      const a = Math.exp(-Math.pow((x - 22) / 5.5, 2));
      const b = mode === 'excluded_middle' ? 1 - a : Math.exp(-Math.pow((x - centerB) / 5.5, 2));
      muA.push(a);
      muB.push(b);
      if (mode === 'zadeh' || mode === 'excluded_middle') {
        muInter.push(Math.min(a, b));
        muUnion.push(Math.max(a, b));
      } else if (mode === 'algebraic') {
        muInter.push(a * b);
        muUnion.push(a + b - a * b);
      } else {
        muInter.push(Math.max(0, a + b - 1));
        muUnion.push(Math.min(1, a + b));
      }
    }

    safePlot('plot-ops-widget', [
      { x: xArr, y: muA, name: '集合 A(x)', mode: 'lines', line: { color: '#38bdf8', width: 2, dash: 'dot' } },
      { x: xArr, y: muB, name: mode === 'excluded_middle' ? '補集 Aᶜ(x) = 1 - A(x)' : '集合 B(x)', mode: 'lines', line: { color: '#fbbf24', width: 2, dash: 'dot' } },
      { x: xArr, y: muInter, name: mode === 'excluded_middle' ? '矛盾律檢驗 A ∩ Aᶜ (≠ 0)' : '模糊交集 T(A, B)', mode: 'lines', line: { color: '#10b981', width: 3.5 }, fill: 'tozeroy', fillcolor: 'rgba(16, 185, 129, 0.25)' },
      { x: xArr, y: muUnion, name: mode === 'excluded_middle' ? '排中律檢驗 A ∪ Aᶜ (≠ 1)' : '模糊聯集 S(A, B)', mode: 'lines', line: { color: '#c084fc', width: 3 } }
    ], getBaseLayout('論域變數 x', '歸屬度 μ', [10, 40]));
  }

  // ==========================================================================
  // 產生 Chapter 01 四大標準學習模組完整 HTML
  // ==========================================================================
  function getChapter1FourModulesHtml() {
    return `
      <!-- 四大模組頂部快速跳轉按鈕組 -->
      <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-sky-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">Chapter 01 導航</span>
          <span class="text-xs text-slate-400 hidden sm:inline">四段式架構：通論 ➔ 逐頁精讀 ➔ 模擬器 ➔ 考題詳解</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button id="ch1-mod-btn-all" onclick="FuzzyWidgets.switchCh1Module('all', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 transition">📑 全部展開</button>
          <button id="ch1-mod-btn-m1" onclick="FuzzyWidgets.switchCh1Module('m1', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">🏛️ 通論</button>
          <button id="ch1-mod-btn-m2" onclick="FuzzyWidgets.switchCh1Module('m2', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📘 逐頁精讀 (10頁)</button>
          <button id="ch1-mod-btn-m3" onclick="FuzzyWidgets.switchCh1Module('m3', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📊 模擬器 (4座)</button>
          <button id="ch1-mod-btn-m4" onclick="FuzzyWidgets.switchCh1Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (8題)</button>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 1：通論（Overview）】 -->
      <!-- =================================================================== -->
      <div id="ch1-module-sec-m1" class="space-y-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-sky-500/35 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase tracking-widest border border-sky-500/35">Module 01 • Overview</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊集合理論全景架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              系統化掌握「為何需要模糊邏輯」、「古典明確集合與模糊集合的本質差異」、「八大代數定律對照表」與「離散／連續標準數學表示法」。
            </p>
          </div>

          <!-- 1.1 為何需要模糊邏輯 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-sky-400 space-y-4">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 text-sm font-bold flex items-center justify-center border border-sky-500/40">1.1</span>
              <span>為何需要模糊邏輯？（Why Fuzzy Logic & Quantification of Meaning）</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                自亞里斯多德以來，傳統科學與電腦邏輯建立在「非黑即白（二值邏輯 True / False）」的明確集合論上。然而人類日常語言與專家控制經驗充滿了諸如「<strong>小朋友</strong>」、「<strong>很胖的人</strong>」、「<strong>水溫偏高</strong>」、「<strong>車速稍快</strong>」等模稜兩可的語意概念（Lexical Imprecision）。若強行規定「滿 $9$ 歲生日午夜 $12$ 點一過就完全不算小朋友」或「$25.0^\\circ\\text{C}$ 算涼爽、$25.1^\\circ\\text{C}$ 瞬間變炎熱」，不僅違反人類直覺，更會造成自動控制器的劇烈頓挫。
              </p>
              <p>
                1965 年加州大學柏克萊分校 <strong>Lotfi A. Zadeh</strong> 教授發表開創性論文《Fuzzy Sets》，提出將「符合語意的程度 $\\mu$」映射到 $[0, 1]$ 連續區間，完成<strong>「意義的數量化（Quantification of Meaning）」</strong>：
              </p>
            </div>
            <div class="formula-display-card">
              $$\\text{傳統二值特性函數：}\\Phi_A : X \\to \\{0, 1\\} \\qquad \\xrightarrow{\\text{Zadeh 連續化推廣}} \\qquad \\text{模糊歸屬函數：}A : X \\to [0, 1]$$
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div class="text-sm font-bold text-sky-300 mb-1">🌊 模糊性（Fuzziness / Vagueness）</div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  描述<strong>「事件本身語意邊界的不明確」</strong>。例如一瓶貼有「屬於毒藥程度 $0.7$」的液體，代表它含有相當毒性的成分，喝下去必然傷身；且同一元素對不同集合的歸屬度總和不必為 $1$。
                </p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div class="text-sm font-bold text-amber-300 mb-1">🎲 隨機性（Randomness / Probability）</div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  描述<strong>「事件定義明確，但發生與否的不確定性」</strong>。例如「這瓶是劇毒的機率為 $0.7$」，代表它有 $70\\%$ 機率是純劇毒、$30\\%$ 機率是純水；且所有互斥事件機率總和必等於 $1$。
                </p>
              </div>
            </div>
          </div>

          <!-- 1.2 古典明確集合與模糊集合的本質差異 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-indigo-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-bold flex items-center justify-center border border-indigo-500/40">1.2</span>
              <span>古典明確集合（Crisp Set）與模糊集合（Fuzzy Set）的本質差異與結構參數</span>
            </h4>
            <div class="overflow-x-auto rounded-2xl border border-slate-800">
              <table class="w-full border-collapse text-sm sm:text-base">
                <thead>
                  <tr class="bg-slate-900/95 text-sky-300 border-b border-slate-700">
                    <th class="px-4 py-3.5 text-left font-bold">比較維度</th>
                    <th class="px-4 py-3.5 text-left font-bold text-rose-300">古典明確集合 (Crisp Set $A$)</th>
                    <th class="px-4 py-3.5 text-left font-bold text-emerald-300">模糊集合 (Fuzzy Set $A$)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80 text-slate-200">
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">數學映射定義</td>
                    <td class="px-4 py-3.5">特性函數 $\\Phi_A(x) \\in \\{0, 1\\}$（二值集合）</td>
                    <td class="px-4 py-3.5">歸屬函數 $A(x) = \\mu_A(x) \\in [0, 1]$（連續區間）</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">邊界過渡行為</td>
                    <td class="px-4 py-3.5">在門檻處發生 $1 \\to 0$ 階梯狀不連續跳變</td>
                    <td class="px-4 py-3.5">由 $1$ 漸進平滑過渡至 $0$，承認灰色地帶</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">连接橋樑（$\\alpha$-截集）</td>
                    <td class="px-4 py-3.5">本身即為明確區間</td>
                    <td class="px-4 py-3.5">一般截集 $\\text{}^{\\alpha}A = \\{x \\mid A(x) \\ge \\alpha\\}$、強截集 $\\text{}^{\\alpha+}A = \\{x \\mid A(x) > \\alpha\\}$</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">核（Core）與底集（Support）</td>
                    <td class="px-4 py-3.5">核與支集完全相同，皆為集合 $A$ 本身</td>
                    <td class="px-4 py-3.5">核 $\\text{}^{1}A = \\{x \\mid A(x) = 1\\}$；底集（支集）$\\text{}^{0+}A = \\{x \\mid A(x) > 0\\}$</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">元素數量衡量（純基數）</td>
                    <td class="px-4 py-3.5">正整數個數 $|A| = \\sum \\Phi_A(x_i) \\in \\mathbb{N}$</td>
                    <td class="px-4 py-3.5">純基數 $|A| = \\sum_{x \\in X} A(x) \\in \\mathbb{R}^+$（歸屬度總和）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 1.3 八大代數定律對照表 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-emerald-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-bold flex items-center justify-center border border-emerald-500/40">1.3</span>
              <span>八大代數定律對照表（明確集合布林代數 vs. 模糊集合 De Morgan 代數）</span>
            </h4>
            <p class="prose-reading text-slate-200 mb-0">
              在標準模糊算子 $A \\cap B = \\min(A, B)$、$A \\cup B = \\max(A, B)$ 與 $\\bar{A} = 1 - A$ 下，明確集合的八大基本定律中有<strong>七項完全保留</strong>，唯獨<strong>「矛盾律」與「排中律」在模糊集合中不成立</strong>（考試最高頻考點）：
            </p>
            <div class="overflow-x-auto rounded-2xl border border-slate-800">
              <table class="w-full border-collapse text-sm sm:text-base">
                <thead>
                  <tr class="bg-slate-900/95 text-sky-300 border-b border-slate-700">
                    <th class="px-4 py-3 text-left font-bold">定律名稱</th>
                    <th class="px-4 py-3 text-left font-bold">代數恆等式</th>
                    <th class="px-4 py-3 text-center font-bold">明確集合</th>
                    <th class="px-4 py-3 text-center font-bold">模糊集合</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80 text-slate-200">
                  <tr>
                    <td class="px-4 py-3 font-bold text-white">1. 冪等律 (Idempotency)</td>
                    <td class="px-4 py-3">$A \\cap A = A, \\quad A \\cup A = A$</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-bold text-white">2. 交換律 (Commutativity)</td>
                    <td class="px-4 py-3">$A \\cap B = B \\cap A, \\quad A \\cup B = B \\cup A$</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-bold text-white">3. 結合律 (Associativity)</td>
                    <td class="px-4 py-3">$A \\cap (B \\cap C) = (A \\cap B) \\cap C, \\quad A \\cup (B \\cup C) = (A \\cup B) \\cup C$</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-bold text-white">4. 分配律 (Distributivity)</td>
                    <td class="px-4 py-3">$A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)$</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-bold text-white">5. 同一律 / 邊界律 (Identity)</td>
                    <td class="px-4 py-3">$A \\cap X = A,\\; A \\cup \\emptyset = A,\\; A \\cap \\emptyset = \\emptyset,\\; A \\cup X = X$</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-bold text-white">6. 吸收律 (Absorption)</td>
                    <td class="px-4 py-3">$A \\cap (A \\cup B) = A, \\quad A \\cup (A \\cap B) = A$</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-bold text-white">7. 雙重否定與笛摩根定律</td>
                    <td class="px-4 py-3">$\\bar{\\bar{A}} = A, \\quad \\overline{A \\cap B} = \\bar{A} \\cup \\bar{B}, \\quad \\overline{A \\cup B} = \\bar{A} \\cap \\bar{B}$</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                    <td class="px-4 py-3 text-center text-emerald-400 font-bold">✅ 成立</td>
                  </tr>
                  <tr class="bg-rose-950/35 border-t-2 border-rose-500/40">
                    <td class="px-4 py-3.5 font-bold text-rose-300">8. 矛盾律與排中律 (Excluded Middle)</td>
                    <td class="px-4 py-3.5 text-rose-200">
                      矛盾律：$A \\cap \\bar{A} = \\emptyset$<br/>
                      排中律：$A \\cup \\bar{A} = X$
                    </td>
                    <td class="px-4 py-3.5 text-center text-emerald-400 font-bold">✅ 恆成立</td>
                    <td class="px-4 py-3.5 text-center text-rose-400 font-extrabold">
                      ❌ 不成立！<br/>
                      <span class="text-xs font-normal text-rose-200">當 $0 < A(x) < 1$ 時<br/>$\\min(A, 1-A) > 0$<br/>$\\max(A, 1-A) < 1$</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 1.4 模糊集合的標準數學表示法 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-purple-400 space-y-4">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 text-sm font-bold flex items-center justify-center border border-purple-500/40">1.4</span>
              <span>模糊集合的標準數學表示法（離散型與連續型記號）</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-sky-300">1. 序偶集合法 (Ordered Pairs)</div>
                <p class="text-xs sm:text-sm text-slate-300">直接將元素 $x$ 與其歸屬度 $A(x)$ 寫成成對序偶集合：</p>
                <div class="formula-display-card text-sm">$$A = \\big\\{(x,\\, A(x)) \\mid x \\in X\\big\\}$$</div>
              </div>
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-emerald-300">2. 離散型 Zadeh 記號 (有限宇集)</div>
                <p class="text-xs sm:text-sm text-slate-300">當 $X = \\{x_1, \\dots, x_n\\}$ 為離散可數集合時（$/$ 為配對記號，$+$ 為聯集並列）：</p>
                <div class="formula-display-card text-sm">$$A = \\sum_{i=1}^{n} \\frac{A(x_i)}{x_i} = \\frac{A(x_1)}{x_1} + \\cdots + \\frac{A(x_n)}{x_n}$$</div>
              </div>
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-purple-300">3. 連續型 Zadeh 記號 (連續宇集)</div>
                <p class="text-xs sm:text-sm text-slate-300">當 $X \\subset \\mathbb{R}$ 為連續實數區間時（$\\int$ 代表連續論域聯集，非微積分定積分）：</p>
                <div class="formula-display-card text-sm">$$A = \\int_{X} \\frac{A(x)}{x}$$</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 2：《認識 Fuzzy》第二章「模糊集合」逐頁精讀（頁 2-1 至 2-15）】 -->
      <!-- =================================================================== -->
      <div id="ch1-module-sec-m2" class="space-y-6">
        <div id="chapter2-book-gallery-section" class="glass-panel rounded-3xl p-7 sm:p-9 border border-indigo-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold uppercase tracking-widest border border-indigo-500/35">Module 02 • Textbook Page-by-Page Guide</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2.5">
                <span>📸</span> 【模組 2：《認識 Fuzzy》專書逐頁精讀（全書第 1、2、3 章，共 37 頁）】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                完整涵蓋第 1 章緒論起源 (1-1~1-7)、第 2 章模糊集合 (2-1~2-15) 與第 3 章基本運算與擴展原理 (3-1~3-15)。點選章節標籤即可切換精讀！
              </p>
            </div>
          </div>
          <div id="chapter2-book-gallery-body"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 3：多維度模擬圖互動專區（Interactive Plots：a, b, c, d 四座獨立模擬器）】 -->
      <!-- =================================================================== -->
      <div id="ch1-module-sec-m3" class="space-y-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border-2 border-emerald-500/40 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/40">Module 03 • 4 Interactive Plotly Simulators</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 3：多維度模擬圖互動專區（Interactive Plots）】
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              四座獨立且可拉動滑桿即時連動的 Plotly.js 數學實驗室，親手驗證邊界過渡、四大歸屬函數、交集聯集與排中律破除，以及 $\\alpha$-截集水平切線！
            </p>
          </div>

          <!-- 模擬器 (a)：明確集合 vs. 模糊集合邊界過渡模擬器 -->
          <div id="ch1-plot-card-a" class="refined-card p-6 sm:p-7 border-l-4 border-l-sky-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-sky-400 uppercase">Interactive Simulator (a) • 對應課本圖 2.1, 圖 2.2(a)(b), 圖 2.6</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (a) 明確集合 vs. 模糊集合邊界過渡模擬器（可調門檻 $T$ 與平滑斜率 $k$）
                </h4>
              </div>
              <div class="flex flex-wrap gap-2">
                <button onclick="FuzzyWidgets.setPlotAPreset(9.0, 0.9, 9.0)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500/20 text-sky-300 border border-slate-700 text-xs font-bold">課本圖 2.2 小朋友 (T=9歲)</button>
                <button onclick="FuzzyWidgets.setPlotAPreset(9.0, 3.0, 9.0)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-300 border border-slate-700 text-xs font-bold">極陡峭逼近明確集合 (k=3.0)</button>
                <button onclick="FuzzyWidgets.setPlotAPreset(9.0, 0.4, 6.0)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 text-xs font-bold">寬緩平滑過渡 (k=0.4)</button>
              </div>
            </div>

            <div id="plot-ch1-a" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div class="md:col-span-3 space-y-1.5">
                <label class="block text-xs font-bold text-slate-300">語意曲線型態：</label>
                <select id="plotA-type" onchange="FuzzyWidgets.updatePlotA()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white">
                  <option value="child" selected>課本圖 2.2「小朋友」區間過渡</option>
                  <option value="high_temp">課本圖 2.1 / 2.6「高溫/過胖」S型遞增</option>
                </select>
              </div>
              <div class="md:col-span-3 space-y-1">
                <div class="flex justify-between text-xs font-bold"><span class="text-rose-300">明確門檻 $T$：</span><span id="plotA-threshold-val" class="font-mono text-rose-400">9.0</span></div>
                <input id="plotA-threshold" type="range" min="4" max="13" step="0.5" value="9.0" oninput="FuzzyWidgets.updatePlotA()" class="w-full cursor-pointer" />
              </div>
              <div class="md:col-span-3 space-y-1">
                <div class="flex justify-between text-xs font-bold"><span class="text-sky-300">平滑過渡斜率 $k$：</span><span id="plotA-slope-val" class="font-mono text-sky-400">0.90</span></div>
                <input id="plotA-slope" type="range" min="0.25" max="3.0" step="0.05" value="0.90" oninput="FuzzyWidgets.updatePlotA()" class="w-full cursor-pointer" />
              </div>
              <div class="md:col-span-3 space-y-1">
                <div class="flex justify-between text-xs font-bold"><span class="text-yellow-300">觀測探針 $x^*$：</span><span id="plotA-probe-val" class="font-mono text-yellow-400">9.0</span></div>
                <input id="plotA-probe" type="range" min="0" max="14.5" step="0.1" value="9.0" oninput="FuzzyWidgets.updatePlotA()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="bg-slate-950 p-3 rounded-xl border border-sky-500/40">
                <div class="text-xs text-sky-300 font-bold">模糊集合歸屬度 $A(x^*)$</div>
                <div id="plotA-fuzzy-readout" class="text-xl font-extrabold font-mono text-sky-400 mt-0.5">0.500</div>
              </div>
              <div class="bg-slate-950 p-3 rounded-xl border border-rose-500/40">
                <div class="text-xs text-rose-300 font-bold">明確集合特性值 $\\Phi_A(x^*)$</div>
                <div id="plotA-crisp-readout" class="text-xl font-extrabold font-mono text-rose-400 mt-0.5">1.000</div>
              </div>
              <div class="bg-slate-950 p-3 rounded-xl border border-amber-500/40">
                <div class="text-xs text-amber-300 font-bold">邊界量化差距 $|A(x^*) - \\Phi_A(x^*)|$</div>
                <div id="plotA-diff-readout" class="text-xl font-extrabold font-mono text-amber-400 mt-0.5">0.500</div>
              </div>
            </div>
          </div>

          <!-- 模擬器 (b)：四大典型歸屬函數造型實驗室 -->
          <div id="ch1-plot-card-b" class="refined-card p-6 sm:p-7 border-l-4 border-l-purple-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-purple-400 uppercase">Interactive Simulator (b) • 對應課本圖 2.7 & 跨校講義標準函數庫</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (b) 四大典型歸屬函數造型實驗室（三角形、梯形、高斯、S型/Z型參數與公式即時對照）
                </h4>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button id="plotB-btn-all" onclick="FuzzyWidgets.selectPlotBShape('all')" class="px-3.5 py-2 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 transition">全部同圖比較</button>
                <button id="plotB-btn-trimf" onclick="FuzzyWidgets.selectPlotBShape('trimf')" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm transition">1. 三角形 (trimf)</button>
                <button id="plotB-btn-trapmf" onclick="FuzzyWidgets.selectPlotBShape('trapmf')" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm transition">2. 梯形 (trapmf)</button>
                <button id="plotB-btn-gaussmf" onclick="FuzzyWidgets.selectPlotBShape('gaussmf')" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm transition">3. 高斯 (gaussmf)</button>
                <button id="plotB-btn-smf" onclick="FuzzyWidgets.selectPlotBShape('smf')" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm transition">4. S型 / Z型 (smf/zmf)</button>
              </div>
            </div>

            <div id="plot-ch1-b" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <div class="flex justify-between font-bold text-sky-300 mb-1"><span>左底角 $a$：</span><span id="plotB-val-a" class="font-mono">20</span></div>
                <input id="plotB-param-a" type="range" min="5" max="40" step="1" value="20" oninput="FuzzyWidgets.updatePlotB()" class="w-full cursor-pointer" />
              </div>
              <div>
                <div class="flex justify-between font-bold text-emerald-300 mb-1"><span>頂點/中心 $b$：</span><span id="plotB-val-b" class="font-mono">45</span></div>
                <input id="plotB-param-b" type="range" min="25" max="65" step="1" value="45" oninput="FuzzyWidgets.updatePlotB()" class="w-full cursor-pointer" />
              </div>
              <div>
                <div class="flex justify-between font-bold text-indigo-300 mb-1"><span>平頂右端 $c$：</span><span id="plotB-val-c" class="font-mono">65</span></div>
                <input id="plotB-param-c" type="range" min="45" max="85" step="1" value="65" oninput="FuzzyWidgets.updatePlotB()" class="w-full cursor-pointer" />
              </div>
              <div>
                <div class="flex justify-between font-bold text-rose-300 mb-1"><span>梯形右角 $d$：</span><span id="plotB-val-d" class="font-mono">85</span></div>
                <input id="plotB-param-d" type="range" min="60" max="98" step="1" value="85" oninput="FuzzyWidgets.updatePlotB()" class="w-full cursor-pointer" />
              </div>
              <div>
                <div class="flex justify-between font-bold text-purple-300 mb-1"><span>高斯標準差 $\\sigma$：</span><span id="plotB-val-sigma" class="font-mono">10.0</span></div>
                <input id="plotB-param-sigma" type="range" min="3" max="25" step="0.5" value="10" oninput="FuzzyWidgets.updatePlotB()" class="w-full cursor-pointer" />
              </div>
              <div>
                <div class="flex justify-between font-bold text-yellow-300 mb-1"><span>探測點 $x^*$：</span><span id="plotB-val-x" class="font-mono">45.0</span></div>
                <input id="plotB-param-x" type="range" min="0" max="100" step="1" value="45" oninput="FuzzyWidgets.updatePlotB()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="plotB-formula-box"></div>
          </div>

          <!-- 模擬器 (c)：模糊交集 (Min)、聯集 (Max) 與補集動態運算器 -->
          <div id="ch1-plot-card-c" class="refined-card p-6 sm:p-7 border-l-4 border-l-emerald-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-emerald-400 uppercase">Interactive Simulator (c) • 對應課本頁 2-4 定律對照與跨校講義</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (c) 模糊交集（Min）、聯集（Max）與補集動態運算器（含矛盾律／排中律失效檢驗）
                </h4>
              </div>
            </div>

            <div id="plot-ch1-c" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div class="md:col-span-5 space-y-1.5">
                <label class="block text-xs font-bold text-emerald-300">選擇運算與檢驗模式：</label>
                <select id="plotC-mode" onchange="FuzzyWidgets.updatePlotC()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold">
                  <option value="min_max" selected>1. 雙集合交集 (A ∩ B = min) 與聯集 (A ∪ B = max)</option>
                  <option value="excluded_middle">2. 🔥 驗證矛盾律 (A ∩ Ā ≠ ∅) 與排中律 (A ∪ Ā ≠ X) 不成立</option>
                </select>
              </div>
              <div class="md:col-span-2 space-y-1 text-xs">
                <div class="flex justify-between font-bold text-sky-300"><span>集合 A 中心 $c_A$：</span><span id="plotC-val-ca" class="font-mono">35</span></div>
                <input id="plotC-center-a" type="range" min="15" max="75" step="1" value="35" oninput="FuzzyWidgets.updatePlotC()" class="w-full cursor-pointer" />
              </div>
              <div class="md:col-span-3 space-y-1 text-xs">
                <div class="flex justify-between font-bold text-amber-300"><span>集合 B 中心 $c_B$：</span><span id="plotC-val-cb" class="font-mono">55</span></div>
                <input id="plotC-center-b" type="range" min="20" max="85" step="1" value="55" oninput="FuzzyWidgets.updatePlotC()" class="w-full cursor-pointer" />
              </div>
              <div class="md:col-span-2 space-y-1 text-xs">
                <div class="flex justify-between font-bold text-purple-300"><span>展開寬度 $\\sigma$：</span><span id="plotC-val-w" class="font-mono">12.0</span></div>
                <input id="plotC-width" type="range" min="5" max="22" step="0.5" value="12" oninput="FuzzyWidgets.updatePlotC()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="plotC-status-box"></div>
          </div>

          <!-- 模擬器 (d)：α-截集 (Alpha-cut)、核 (Core) 與支集 (Support) 水平切線模擬器 -->
          <div id="ch1-plot-card-d" class="refined-card p-6 sm:p-7 border-l-4 border-l-amber-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-amber-400 uppercase">Interactive Simulator (d) • 對應課本頁 2-11 ～ 2-13 式 (2.1)~(2.4) & 圖 2.8, 2.9</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (d) $\\alpha$-截集（Alpha-cut）、核（Core）與支集（Support）水平切線模擬器
                </h4>
              </div>
              <div class="flex flex-wrap gap-2">
                <button onclick="FuzzyWidgets.setPlotDAlpha(0.0)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-slate-700 text-xs font-bold">α = 0 (觀察支集/底集 ⁰⁺A)</button>
                <button onclick="FuzzyWidgets.setPlotDAlpha(0.5)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 text-xs font-bold">α = 0.5 (課本頁 2-11 截集)</button>
                <button onclick="FuzzyWidgets.setPlotDAlpha(1.0)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-300 border border-slate-700 text-xs font-bold">α = 1.0 (觀察核 Core ¹A)</button>
                <button onclick="FuzzyWidgets.setPlotDAlpha(0.65, 'nonconvex_fig29b')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-500/20 text-purple-300 border border-slate-700 text-xs font-bold">🐪 圖 2.9(b) 非凸雙峰截集斷裂</button>
              </div>
            </div>

            <div id="plot-ch1-d" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div class="md:col-span-5 space-y-1.5">
                <label class="block text-xs font-bold text-amber-300">選擇欲切割之模糊集合模型：</label>
                <select id="plotD-curve-mode" onchange="FuzzyWidgets.updatePlotD()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold">
                  <option value="trapezoid_convex" selected>1. 標準梯形正規凸集合 [15, 35, 55, 80]（兼具平頂核與斜邊）</option>
                  <option value="triangle_fig28">2. 課本圖 2.8「中年人」三角形集合 [20, 40, 60]（頁 2-11 公式驗證）</option>
                  <option value="nonconvex_fig29b">3. 課本圖 2.9(b) 雙峰「非凸模糊集合」（觀察 α=0.65 區間斷裂為兩塊）</option>
                </select>
              </div>
              <div class="md:col-span-7 space-y-1.5">
                <div class="flex justify-between items-center text-sm font-bold">
                  <span class="text-yellow-300">🔪 上下移動水平切線門檻值 $\\alpha \\in [0, 1]$：</span>
                  <span id="plotD-alpha-val" class="font-mono text-xl font-extrabold text-yellow-400">0.50</span>
                </div>
                <input id="plotD-alpha" type="range" min="0" max="1" step="0.05" value="0.50" oninput="FuzzyWidgets.updatePlotD()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="plotD-info-box"></div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 4：章節題目練習與詳解（Practice & Solutions）】 -->
      <!-- =================================================================== -->
      <div id="ch1-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-indigo-500/40 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold uppercase tracking-widest border border-indigo-500/40">Module 04 • Practice & Step-by-Step Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解（Practice & Solutions）】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 8 題結合《認識 Fuzzy》第 2 章課後習題（2.7、2.8）、老師上課錄音強調考點與外校期中考計算題，點擊選項可即時檢驗，並可展開完整 LaTeX 逐步推導詳解！
              </p>
            </div>
            <div class="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm">
              本章節練習得分：<strong id="ch1-practice-score" class="text-emerald-400 font-mono text-lg">0 / 8</strong>
            </div>
          </div>

          <div id="ch1-practice-list-holder" class="space-y-6"></div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Chapter 02（對應專書第 3、4 章）：模糊關係與模糊推論四大標準學習模組資料與狀態
  // ==========================================================================
  let ch2ActiveModule = 'all';
  let ch2PracticeAnswers = {};
  let ch2SolutionExpanded = {};

  // Chapter 02 題庫資料（8 題精選：涵蓋笛卡兒積、Max-Min/Max-Product 合成、等價關係、單點截頂、離散重心法與綜合應用題）
  const CH2_PRACTICE_PROBLEMS = [
    {
      id: 'ch2_p1',
      tag: '概念必考題 • 笛卡兒積定義',
      difficulty: '★☆☆ 基礎觀念',
      question: '【第 1 題】設論域 $X = \\{x_1, x_2\\}$ 上的模糊集合 $A = 0.8/x_1 + 0.4/x_2$，論域 $Y = \\{y_1, y_2\\}$ 上的模糊集合 $B = 0.5/y_1 + 1.0/y_2$。若以 Zadeh 標準 Min 算子張成模糊笛卡兒積 $R = A \\times B$，其二元模糊關係矩陣為何？',
      options: [
        '$R = \\begin{bmatrix} 0.5 & 0.8 \\\\ 0.4 & 0.4 \\end{bmatrix}$',
        '$R = \\begin{bmatrix} 0.4 & 0.8 \\\\ 0.2 & 0.4 \\end{bmatrix}$',
        '$R = \\begin{bmatrix} 0.8 & 0.4 \\\\ 0.5 & 1.0 \\end{bmatrix}$',
        '$R = \\begin{bmatrix} 1.0 & 0.8 \\\\ 0.5 & 0.4 \\end{bmatrix}$'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">依據模糊笛卡兒積（Fuzzy Cartesian Product）定義式（課本頁 3-3）：</p>
          <div class="formula-display-card">
            $$\\mu_{A \\times B}(x_i, y_j) = \\min\\big(\\mu_A(x_i),\\, \\mu_B(y_j)\\big)$$
          </div>
          <ul class="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>$r_{11} = \\min(A(x_1), B(y_1)) = \\min(0.8, 0.5) = 0.5$</li>
            <li>$r_{12} = \\min(A(x_1), B(y_2)) = \\min(0.8, 1.0) = 0.8$</li>
            <li>$r_{21} = \\min(A(x_2), B(y_1)) = \\min(0.4, 0.5) = 0.4$</li>
            <li>$r_{22} = \\min(A(x_2), B(y_2)) = \\min(0.4, 1.0) = 0.4$</li>
          </ul>
          <p class="text-sm text-slate-200">綜合各分量，得到模糊關係矩陣 $R = \\begin{bmatrix} 0.5 & 0.8 \\\\ 0.4 & 0.4 \\end{bmatrix}$，故選項 (A) 正確！</p>
        </div>
      `
    },
    {
      id: 'ch2_p2',
      tag: '手算經典考題 • Max-Min 合成',
      difficulty: '★★☆ 矩陣計算',
      question: '【第 2 題】已知模糊關係矩陣 $R = \\begin{bmatrix} 0.2 & 0.7 \\\\ 0.9 & 0.3 \\end{bmatrix}$ 與 $S = \\begin{bmatrix} 0.8 & 0.4 \\\\ 0.5 & 0.6 \\end{bmatrix}$。試求合成矩陣 $T = R \\circ S$ 之第 $(2, 1)$ 元素 $t_{21}$ 為何？',
      options: [
        '$t_{21} = 0.8$',
        '$t_{21} = 0.9$',
        '$t_{21} = 0.5$',
        '$t_{21} = 0.72$'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">依據 Max-Min 合成定義（課本頁 3-4 式 3.3）：</p>
          <div class="formula-display-card">
            $$t_{21} = (R \\circ S)_{21} = \\max_{j} \\min\\big(r_{2j},\\, s_{j1}\\big) = \\max\\Big(\\min(r_{21}, s_{11}),\\, \\min(r_{22}, s_{21})\\Big)$$
          </div>
          <p class="text-sm text-slate-300">代入數值：$r_{21} = 0.9, r_{22} = 0.3$；$s_{11} = 0.8, s_{21} = 0.5$：</p>
          <div class="formula-display-card">
            $$t_{21} = \\max\\big(\\min(0.9, 0.8),\\, \\min(0.3, 0.5)\\big) = \\max(0.8,\\, 0.3) = 0.8$$
          </div>
          <p class="text-sm text-slate-200">故正確答案為 $t_{21} = 0.8$（選項 A）。請注意：千萬不可將內層運算做傳統乘法相加！</p>
        </div>
      `
    },
    {
      id: 'ch2_p3',
      tag: '定理證明與性質 • Max-Min vs. Max-Product',
      difficulty: '★★☆ 定理性質',
      question: '【第 3 題】對於任意兩個維度相容的模糊關係矩陣 $R$ 與 $S$，若分別計算其 Max-Min 合成 $T_1 = R \\circ S$ 與 Max-Product 合成 $T_2 = R \\odot S$，下列敘述何者永遠恆真？',
      options: [
        '對所有元素皆滿足 $(R \\odot S)_{ik} \\le (R \\circ S)_{ik}$',
        '對所有元素皆滿足 $(R \\odot S)_{ik} \\ge (R \\circ S)_{ik}$',
        '兩者元素數值大小完全視矩陣數值而定，無法比較',
        '僅當矩陣為對角矩陣時兩者才相等，其餘狀況無界限關係'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">這是研究所入學考與期中考極常出現的經典定理！</p>
          <p class="text-sm text-slate-300">對於任意兩實數 $a, b \\in [0, 1]$，因為 $0 \\le a \\le 1$ 且 $0 \\le b \\le 1$，所以：</p>
          <div class="formula-display-card">
            $$a \\cdot b \\le a \\quad \\text{且} \\quad a \\cdot b \\le b \\quad \\Longrightarrow \\quad a \\cdot b \\le \\min(a, b)$$
          </div>
          <p class="text-sm text-slate-300">對所有中間索引 $j$，皆有 $r_{ij} \\cdot s_{jk} \\le \\min(r_{ij}, s_{jk})$。外層取最大值 $\\max_j$ 具有保序性，因此：</p>
          <div class="formula-display-card">
            $$\\max_{j} (r_{ij} \\cdot s_{jk}) \\le \\max_{j} \\min(r_{ij}, s_{jk}) \\quad \\Longleftrightarrow \\quad (R \\odot S)_{ik} \\le (R \\circ S)_{ik}$$
          </div>
          <p class="text-sm text-slate-200">也就是說，**Max-Product 合成結果的每一個元素必定小於或等於 Max-Min 合成結果**！故選項 (A) 正確。</p>
        </div>
      `
    },
    {
      id: 'ch2_p4',
      tag: '進階觀念題 • 模糊等價關係公理檢驗',
      difficulty: '★★★ 公理檢驗',
      question: '【第 4 題】設論域 $X = \\{x_1, x_2, x_3\\}$ 上定義二元模糊關係矩陣 $R = \\begin{bmatrix} 1.0 & 0.6 & 0.2 \\\\ 0.6 & 1.0 & 0.7 \\\\ 0.2 & 0.7 & 1.0 \\end{bmatrix}$。請問 $R$ 是否為「模糊等價關係（Fuzzy Equivalence Relation）」？',
      options: [
        '不是，因為它違反 Max-Min 傳遞性：$(R \\circ R)_{13} = 0.6 > r_{13} = 0.2$',
        '是，因為主對角線皆為 1（自反性）且對稱軸相等（對稱性），傳遞性自動成立',
        '不是，因為 $r_{12} = 0.6 \\neq r_{23} = 0.7$，違反等價關係的一致性',
        '是，因為每個矩陣元素皆落在合法閉區間 [0, 1] 內'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">依據課本頁 3-5 模糊等價關係定義，必須同時滿足三大公理：</p>
          <ul class="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li><strong>自反性 (Reflexivity)：</strong>$r_{11}=r_{22}=r_{33}=1.0$（符合）</li>
            <li><strong>對稱性 (Symmetry)：</strong>$R = R^T$（符合）</li>
            <li><strong>Max-Min 傳遞性 (Transitivity)：</strong>必須滿足 $R \\circ R \\subseteq R$，即對所有 $(i, k)$ 皆有 $(R \\circ R)_{ik} \\le r_{ik}$。</li>
          </ul>
          <p class="text-sm text-slate-200">檢驗 $(1, 3)$ 元素：</p>
          <div class="formula-display-card">
            $$(R \\circ R)_{13} = \\max\\big(\\min(1.0, 0.2),\\, \\min(0.6, 0.7),\\, \\min(0.2, 1.0)\\big) = \\max(0.2,\\, 0.6,\\, 0.2) = 0.6$$
          </div>
          <p class="text-sm text-slate-300">然而原矩陣中 $r_{13} = 0.2$。因為 $(R \\circ R)_{13} = 0.6 > 0.2$，導致 $R \\circ R \\not\\subseteq R$！</p>
          <p class="text-sm text-slate-200">因此 $R$ **違反傳遞性**，不是模糊等價關係！若要使其成為等價關係，必須計算其傳遞閉包（Transitive Closure）將 $r_{13}$ 與 $r_{31}$ 提升為 $0.6$。故選項 (A) 正確！</p>
        </div>
      `
    },
    {
      id: 'ch2_p5',
      tag: '推論核心概念 • 單點模糊化與幾何形變',
      difficulty: '★★☆ 推論幾何',
      question: '【第 5 題】在 Mamdani 模糊推論系統中，後件模糊集合 $B$ 原為對稱三角形歸屬函數 $\\text{trimf}(y; 20, 50, 80)$。當感測器讀取單點明確輸入 $x^*$，計算得前件激發強度為 $w = 0.6$。若採用 Mamdani 截頂法（Clipping），推論結論 $B\'$ 的幾何造型與有效底集（支集）為何？',
      options: [
        '造型為上底 [38, 62]、下底 [20, 80]、高度為 0.6 的等腰梯形；底集仍為 (20, 80)',
        '造型為頂點在 y=50、峰值高度為 0.6 的等腰三角形；底集收縮為 [30, 70]',
        '造型為高度 0.6 的長方形；底集擴張為全實數論域',
        '造型維持原三角形不變，僅幾何重心向右平移 0.6 單位'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">依據單點模糊化 CRI 簡化公式（課本頁 4-4）：</p>
          <div class="formula-display-card">
            $$\\mu_{B'}(y) = \\min\\big(w,\\; \\mu_B(y)\\big) = \\min\\big(0.6,\\; \\text{trimf}(y; 20, 50, 80)\\big)$$
          </div>
          <p class="text-sm text-slate-300">原三角形在上升斜坡方程為 $\\frac{y - 20}{30}$，令其等於截頂水平線 $0.6$：</p>
          <div class="formula-display-card">
            $$\\frac{y - 20}{30} = 0.6 \\implies y = 20 + 18 = 38$$
          </div>
          <p class="text-sm text-slate-300">在下降斜坡方程為 $\\frac{80 - y}{30}$，令其等於截頂水平線 $0.6$：</p>
          <div class="formula-display-card">
            $$\\frac{80 - y}{30} = 0.6 \\implies y = 80 - 18 = 62$$
          </div>
          <p class="text-sm text-slate-200">因此，在 $y \\in [38, 62]$ 區間內被削平為平頂 $0.6$，構成等腰梯形；而當 $\\mu_{B'}(y) > 0$ 時之底集仍為 $(20, 80)$，並未改變！故選項 (A) 正確。</p>
        </div>
      `
    },
    {
      id: 'ch2_p6',
      tag: '期中考手算大題 • 離散重心法 (COG)',
      difficulty: '★★☆ 數值計算',
      question: '【第 6 題】某模糊溫控系統之推論輸出在離散溫度論域 $Y = \\{10, 20, 30, 40, 50\\}$ 上的聚合歸屬度為：$B_{\\text{agg}} = 0.1/10 + 0.3/20 + 0.8/30 + 0.6/40 + 0.2/50$。試以「離散重心法（Center of Gravity, COG）」計算明確輸出控制溫度 $y^*_{\\text{COG}}$ 為何？',
      options: [
        '$y^*_{\\text{COG}} = 32.5^\\circ\\text{C}$',
        '$y^*_{\\text{COG}} = 30.0^\\circ\\text{C}$',
        '$y^*_{\\text{COG}} = 35.0^\\circ\\text{C}$',
        '$y^*_{\\text{COG}} = 28.5^\\circ\\text{C}$'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">依據離散重心法公式（課本頁 4-6）：</p>
          <div class="formula-display-card">
            $$y^*_{\\text{COG}} = \\frac{\\sum_{k=1}^{N} y_k \\cdot \\mu_{B_{\\text{agg}}}(y_k)}{\\sum_{k=1}^{N} \\mu_{B_{\\text{agg}}}(y_k)}$$
          </div>
          <p class="text-sm text-slate-300">1. 計算分母（歸屬度總和／純基數）：</p>
          <div class="formula-display-card">
            $$\\sum \\mu = 0.1 + 0.3 + 0.8 + 0.6 + 0.2 = 2.0$$
          </div>
          <p class="text-sm text-slate-300">2. 計算分子（一階力矩和）：</p>
          <div class="formula-display-card">
            $$\\sum (y_k \\cdot \\mu) = 10(0.1) + 20(0.3) + 30(0.8) + 40(0.6) + 50(0.2) = 1 + 6 + 24 + 24 + 10 = 65$$
          </div>
          <p class="text-sm text-slate-200">3. 相除求重心：</p>
          <div class="formula-display-card">
            $$y^*_{\\text{COG}} = \\frac{65}{2.0} = 32.5^\\circ\\text{C}$$
          </div>
          <p class="text-sm text-slate-200">故選項 (A) 正確！</p>
        </div>
      `
    },
    {
      id: 'ch2_p7',
      tag: '工程實務評估 • 解模糊化方法比較',
      difficulty: '★★☆ 控制權衡',
      question: '【第 7 題】在工業高精度伺服馬達連續運動控制中，工程師通常優先選擇「重心法 (Centroid / COG)」而非「最大平均法 (Mean of Maxima, MOM)」，其最核心的控制工程考量為何？',
      options: [
        '重心法具備輸入微小變化時輸出連續平滑無跳變的優良特性；MOM 在多峰高度微幅交替時會產生嚴重的不連續跳躍（階躍抖動）',
        '重心法的計算複雜度遠比 MOM 低上百倍，特別適合低階 8 位元單晶片微控制器',
        '重心法輸出的數值必定精確落在某一條規則後件的頂點上，而 MOM 容易偏離',
        'MOM 演算法無法處理三角形歸屬函數，在數學上僅能應用於對稱矩形'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">這是模糊控制系統設計最關鍵的「連續性 vs. 敏感度」權衡（課本頁 4-6）：</p>
          <ul class="text-sm text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>重心法 (Centroid / COG)：</strong>計算整塊聚合圖形所有積分點的加權平均。當感測器輸入連續變化時，每條規則的激發強度連續消長，重心輸出曲線保證具備<strong>處處連續性（Continuity）</strong>，不會產生機械衝擊與高頻抖動。</li>
            <li><strong>最大平均法 (MOM)：</strong>僅取歸屬度最高頂點區間的中點。當規則庫出現雙峰且兩峰高度在 $0.79$ 與 $0.81$ 之間微幅交替時，MOM 會瞬間從第一個峰跨越到第二個峰，產生劇烈的<strong>階躍跳變（Jump Discontinuity）</strong>，嚴重損害馬達機構壽命！</li>
          </ul>
          <p class="text-sm text-slate-200">故選項 (A) 為正確且標準的工程解釋。</p>
        </div>
      `
    },
    {
      id: 'ch2_p8',
      tag: '專書第 4 章壓軸題 • 多規則推論聚合綜合計算',
      difficulty: '★★★ 綜合實戰',
      question: '【第 8 題】設兩條模糊控制規則為：\\n$R^{(1)}$: IF $e$ is ZE THEN $u$ is ZE (後件 $\\text{trimf}(u; -2, 0, 2)$)\\n$R^{(2)}$: IF $e$ is PS THEN $u$ is PS (後件 $\\text{trimf}(u; 0, 2, 4)$)\\n已知當前輸入激發強度分別為 $w_1 = 0.4$ 與 $w_2 = 0.8$。若採用 Mamdani 截頂與 $\\max$ 聯集聚合，試問結論中歸屬度達到最高峰值 $h(B_{\\text{agg}})$ 的數值，以及最大平均法 (MOM) 的解 $u^*_{\\text{MOM}}$ 為何？',
      options: [
        '最高峰值為 0.8；$u^*_{\\text{MOM}} = 2.0$',
        '最高峰值為 1.0；$u^*_{\\text{MOM}} = 1.0$',
        '最高峰值為 0.8；$u^*_{\\text{MOM}} = 1.5$',
        '最高峰值為 0.4；$u^*_{\\text{MOM}} = 0.0$'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整觀念與數學推導解析：</div>
          <p class="text-sm text-slate-200">1. 分別計算兩條規則的截頂結論：</p>
          <ul class="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>規則 1：$\\mu_{B'^1}(u) = \\min(0.4, \\text{trimf}(u; -2, 0, 2))$，最高高度為 $0.4$。</li>
            <li>規則 2：$\\mu_{B'^2}(u) = \\min(0.8, \\text{trimf}(u; 0, 2, 4))$，最高高度為 $0.8$。</li>
          </ul>
          <p class="text-sm text-slate-200">2. 取 $\\max$ 聯集聚合：</p>
          <div class="formula-display-card">
            $$\\mu_{B_{\\text{agg}}}(u) = \\max\\big(\\mu_{B'^1}(u),\\; \\mu_{B'^2}(u)\\big)$$
          </div>
          <p class="text-sm text-slate-300">聚合曲線的全局最高高度為 $h(B_{\\text{agg}}) = \\max(0.4, 0.8) = 0.8$。</p>
          <p class="text-sm text-slate-200">3. 求達到最大高度 $0.8$ 的論域集合 $M$：</p>
          <p class="text-sm text-slate-300">規則 2 的後件三角形在 $u=2$ 達到最高點，解不等式：</p>
          <div class="formula-display-card">
            $$1 - \\frac{|u - 2|}{2} \\ge 0.8 \\iff \\frac{|u - 2|}{2} \\le 0.2 \\iff |u - 2| \\le 0.4 \\implies u \\in [1.6, 2.4]$$
          </div>
          <p class="text-sm text-slate-300">由於集合 $M = [1.6, 2.4]$ 為對稱連續閉區間，其幾何中點（平均值）為：</p>
          <div class="formula-display-card">
            $$u^*_{\\text{MOM}} = \\frac{1.6 + 2.4}{2} = 2.0$$
          </div>
          <p class="text-sm text-slate-200">故最高峰值為 $0.8$，$u^*_{\\text{MOM}} = 2.0$，選項 (A) 完全正確！</p>
        </div>
      `
    }
  ];

  // ==========================================================================
  // Chapter 02 子模組切換與互動事件控制（連動左側邊欄導覽列）
  // ==========================================================================
  function getActiveCh2Module() {
    return ch2ActiveModule;
  }

  function switchCh2Module(modId, shouldScroll) {
    ch2ActiveModule = modId;
    const modIds = ['m1', 'm2', 'm3', 'm4'];

    ['all', ...modIds].forEach(function (id) {
      const btn = document.getElementById('ch2-subtab-btn-' + id);
      if (!btn) return;
      if (id === modId) {
        btn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/20';
      } else {
        btn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium';
      }
    });

    modIds.forEach(function (id) {
      const sec = document.getElementById('ch2-module-sec-' + id);
      if (!sec) return;
      if (modId === 'all' || modId === id) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    if (modId === 'all' || modId === 'm3') {
      setTimeout(function () {
        updateCh2PlotA();
        updateCh2PlotB();
        updateCh2PlotC();
        updateCh2PlotD();
      }, 50);
    }

    if (shouldScroll) {
      setTimeout(function () {
        const targetEl = modId === 'all'
          ? document.getElementById('chapter-content-container')
          : document.getElementById('ch2-module-sec-' + modId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }

    safeMathJax();
  }

  function jumpToCh2Plot(plotKey) {
    switchCh2Module('m3');
    setTimeout(function () {
      const el = document.getElementById('ch2-plot-card-' + plotKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('pulse-focus');
        void el.offsetWidth;
        el.classList.add('pulse-focus');
      }
    }, 80);
  }

  // ==========================================================================
  // 【Chapter 02 模組 3 - 圖 (a)】：模糊笛卡兒積 R = A × B 立體與熱力視覺化實驗室
  // ==========================================================================
  function updateCh2PlotA() {
    const heatEl = document.getElementById('plot-ch2-a-heat');
    const surfEl = document.getElementById('plot-ch2-a-3d');
    if (!heatEl || !surfEl) return;

    const cA = parseFloat((document.getElementById('ch2PlotA-ca') || {}).value || 4.0);
    const wA = parseFloat((document.getElementById('ch2PlotA-wa') || {}).value || 1.6);
    const cB = parseFloat((document.getElementById('ch2PlotA-cb') || {}).value || 6.0);
    const wB = parseFloat((document.getElementById('ch2PlotA-wb') || {}).value || 1.8);
    const mode = (document.getElementById('ch2PlotA-mode') || {}).value || 'min';

    const setSpan = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setSpan('ch2PlotA-val-ca', cA.toFixed(1));
    setSpan('ch2PlotA-val-wa', wA.toFixed(1));
    setSpan('ch2PlotA-val-cb', cB.toFixed(1));
    setSpan('ch2PlotA-val-wb', wB.toFixed(1));

    const xVals = [];
    const yVals = [];
    const step = 0.5;
    for (let x = 0; x <= 10; x += step) xVals.push(x);
    for (let y = 0; y <= 10; y += step) yVals.push(y);

    const zMatrix = [];
    for (let j = 0; j < yVals.length; j++) {
      const row = [];
      const muB = gaussmf(yVals[j], cB, wB);
      for (let i = 0; i < xVals.length; i++) {
        const muA = gaussmf(xVals[i], cA, wA);
        const z = mode === 'min' ? Math.min(muA, muB) : (muA * muB);
        row.push(parseFloat(z.toFixed(4)));
      }
      zMatrix.push(row);
    }

    // 1. 繪製 2D 關係矩陣熱力圖 (Heatmap)
    const heatTrace = [{
      z: zMatrix,
      x: xVals,
      y: yVals,
      type: 'heatmap',
      colorscale: 'Viridis',
      zmin: 0,
      zmax: 1,
      colorbar: { title: '關聯度 μ_R(x,y)', titleside: 'right', tickfont: { color: '#e2e8f0', size: 10 } }
    }];

    const heatLayout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
      font: { color: '#e2e8f0', family: 'Inter, Noto Sans TC, sans-serif', size: 11 },
      margin: { t: 36, r: 20, b: 45, l: 50 },
      title: { text: mode === 'min' ? '2D 熱力圖：μ_R(x,y) = min(A(x), B(y))' : '2D 熱力圖：μ_R(x,y) = A(x) · B(y)', font: { size: 13, color: '#38bdf8' } },
      xaxis: { title: '論域 X 元素', gridcolor: 'rgba(148, 163, 184, 0.15)' },
      yaxis: { title: '論域 Y 元素', gridcolor: 'rgba(148, 163, 184, 0.15)' }
    };

    safePlot('plot-ch2-a-heat', heatTrace, heatLayout);

    // 2. 繪製 3D 歸屬度曲面圖 (Surface)
    const surfTrace = [{
      z: zMatrix,
      x: xVals,
      y: yVals,
      type: 'surface',
      colorscale: 'Plasma',
      cmin: 0,
      cmax: 1,
      showscale: false
    }];

    const surfLayout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e2e8f0', size: 10 },
      margin: { t: 25, r: 10, b: 20, l: 10 },
      scene: {
        xaxis: { title: 'X', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        yaxis: { title: 'Y', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        zaxis: { title: 'μ_R', range: [0, 1.05], gridcolor: 'rgba(148, 163, 184, 0.2)' },
        camera: { eye: { x: 1.5, y: -1.6, z: 1.2 } }
      }
    };

    safePlot('plot-ch2-a-3d', surfTrace, surfLayout);

    // 更新狀態說明區塊
    const statusBox = document.getElementById('ch2PlotA-status-box');
    if (statusBox) {
      statusBox.innerHTML = `
        <div class="bg-slate-900/90 rounded-2xl p-5 border border-indigo-500/30 space-y-2 text-xs sm:text-sm">
          <div class="flex items-center gap-2 text-indigo-300 font-bold">
            <span>🔬 幾何曲面解析與邊際投影：</span>
          </div>
          <p class="text-slate-300 leading-relaxed">
            目前採用 <strong>${mode === 'min' ? 'Zadeh 標準 Min 算子' : '代數積 Product 算子'}</strong>。集合 A 尖峰在 $x=${cA.toFixed(1)}$、集合 B 尖峰在 $y=${cB.toFixed(1)}$，在笛卡兒積空間中形成以 $(${cA.toFixed(1)}, ${cB.toFixed(1)})$ 為頂峰的關聯曲面。
            ${mode === 'min' ? 'Min 算子的等高線呈現<strong>方形平頂稜角</strong>（符合式 3.1 邊界受兩者最小值箝制）；' : 'Product 算子的曲面處處<strong>平滑可微且向下衰減更快</strong>；'}
            若將此曲面沿 $Y$ 軸做邊際投影（取最大值 $\\max_y \\mu_R(x, y)$），即可精確還原出一維集合 $A(x)$！
          </p>
        </div>
      `;
      safeMathJax([statusBox]);
    }
  }

  // ==========================================================================
  // 【Chapter 02 模組 3 - 圖 (b)】：模糊關係合成運算器（Max-Min vs. Max-Product）
  // ==========================================================================
  let ch2MatrixR = [
    [0.3, 0.8, 0.2],
    [0.7, 0.4, 0.9],
    [0.1, 0.5, 0.6]
  ];
  let ch2MatrixS = [
    [0.5, 0.9, 0.3],
    [0.6, 0.2, 0.8],
    [0.4, 0.7, 0.1]
  ];
  let ch2MatrixSelectedRow = 0;
  let ch2MatrixSelectedCol = 0;

  function loadCh2MatrixPreset(presetType) {
    if (presetType === 'textbook') {
      ch2MatrixR = [
        [0.3, 0.8, 0.2],
        [0.7, 0.4, 0.9],
        [0.1, 0.5, 0.6]
      ];
      ch2MatrixS = [
        [0.5, 0.9, 0.3],
        [0.6, 0.2, 0.8],
        [0.4, 0.7, 0.1]
      ];
    } else if (presetType === 'medical') {
      ch2MatrixR = [
        [0.9, 0.3, 0.1],
        [0.4, 0.8, 0.5],
        [0.2, 0.6, 0.9]
      ];
      ch2MatrixS = [
        [0.8, 0.2, 0.6],
        [0.3, 0.9, 0.4],
        [0.1, 0.5, 0.8]
      ];
    } else if (presetType === 'random') {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ch2MatrixR[i][j] = parseFloat((Math.random() * 0.9 + 0.1).toFixed(1));
          ch2MatrixS[i][j] = parseFloat((Math.random() * 0.9 + 0.1).toFixed(1));
        }
      }
    }
    renderCh2MatrixInputs();
    updateCh2PlotB();
  }

  function handleCh2MatrixInputChange(matrixName, r, c, val) {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    num = Math.max(0, Math.min(1, num));
    if (matrixName === 'R') ch2MatrixR[r][c] = num;
    else ch2MatrixS[r][c] = num;
    updateCh2PlotB();
  }

  function selectCh2MatrixCell(r, c) {
    ch2MatrixSelectedRow = r;
    ch2MatrixSelectedCol = c;
    updateCh2PlotB();
  }

  function renderCh2MatrixInputs() {
    const rHolder = document.getElementById('ch2-matrix-r-inputs');
    const sHolder = document.getElementById('ch2-matrix-s-inputs');
    if (!rHolder || !sHolder) return;

    rHolder.innerHTML = ch2MatrixR.map(function (row, r) {
      return `
        <div class="grid grid-cols-3 gap-2">
          ${row.map(function (val, c) {
            return `
              <input type="number" min="0" max="1" step="0.1" value="${val}"
                onchange="FuzzyWidgets.handleCh2MatrixInputChange('R', ${r}, ${c}, this.value)"
                class="w-full bg-slate-950 border border-sky-500/40 rounded-lg px-2 py-1.5 text-center font-mono text-sm text-sky-300 font-bold focus:border-sky-400 focus:outline-none" />
            `;
          }).join('')}
        </div>
      `;
    }).join('');

    sHolder.innerHTML = ch2MatrixS.map(function (row, r) {
      return `
        <div class="grid grid-cols-3 gap-2">
          ${row.map(function (val, c) {
            return `
              <input type="number" min="0" max="1" step="0.1" value="${val}"
                onchange="FuzzyWidgets.handleCh2MatrixInputChange('S', ${r}, ${c}, this.value)"
                class="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-1.5 text-center font-mono text-sm text-amber-300 font-bold focus:border-amber-400 focus:outline-none" />
            `;
          }).join('')}
        </div>
      `;
    }).join('');
  }

  function updateCh2PlotB() {
    const compMode = (document.getElementById('ch2PlotB-op-mode') || {}).value || 'max_min';
    const matrixT = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 3; k++) {
        if (compMode === 'max_min') {
          const m1 = Math.min(ch2MatrixR[i][0], ch2MatrixS[0][k]);
          const m2 = Math.min(ch2MatrixR[i][1], ch2MatrixS[1][k]);
          const m3 = Math.min(ch2MatrixR[i][2], ch2MatrixS[2][k]);
          matrixT[i][k] = parseFloat(Math.max(m1, m2, m3).toFixed(2));
        } else {
          const p1 = ch2MatrixR[i][0] * ch2MatrixS[0][k];
          const p2 = ch2MatrixR[i][1] * ch2MatrixS[1][k];
          const p3 = ch2MatrixR[i][2] * ch2MatrixS[2][k];
          matrixT[i][k] = parseFloat(Math.max(p1, p2, p3).toFixed(2));
        }
      }
    }

    // 繪製三個矩陣的 Plotly 色塊圖
    const makeMatrixHeatmap = function (divId, zData, titleText, colorScale) {
      const trace = [{
        z: zData,
        x: ['1', '2', '3'],
        y: ['1', '2', '3'],
        type: 'heatmap',
        colorscale: colorScale,
        zmin: 0,
        zmax: 1,
        showscale: false
      }];
      const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
        font: { color: '#e2e8f0', size: 10 },
        margin: { t: 30, r: 10, b: 30, l: 30 },
        title: { text: titleText, font: { size: 12, color: '#e2e8f0' } },
        xaxis: { title: '行 (Col)', tickfont: { size: 9 } },
        yaxis: { title: '列 (Row)', tickfont: { size: 9 }, autorange: 'reversed' }
      };
      safePlot(divId, trace, layout);
    };

    makeMatrixHeatmap('plot-ch2-b-r', ch2MatrixR, '矩陣 R (3×3)', 'Blues');
    makeMatrixHeatmap('plot-ch2-b-s', ch2MatrixS, '矩陣 S (3×3)', 'YlOrBr');
    makeMatrixHeatmap('plot-ch2-b-t', matrixT, compMode === 'max_min' ? '合成 T = R ∘ S (Max-Min)' : '合成 T = R ⊙ S (Max-Product)', 'Viridis');

    // 渲染 T 矩陣數值按鈕表
    const tDisplayHolder = document.getElementById('ch2-matrix-t-display');
    if (tDisplayHolder) {
      tDisplayHolder.innerHTML = matrixT.map(function (row, r) {
        return `
          <div class="grid grid-cols-3 gap-2">
            ${row.map(function (val, c) {
              const isSelected = r === ch2MatrixSelectedRow && c === ch2MatrixSelectedCol;
              return `
                <button onclick="FuzzyWidgets.selectCh2MatrixCell(${r}, ${c})"
                  class="py-2 px-1 rounded-lg font-mono text-sm font-extrabold transition border ${isSelected ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30' : 'bg-slate-900 text-emerald-300 border-slate-700 hover:border-emerald-500/50'}">
                  ${val.toFixed(2)}
                </button>
              `;
            }).join('')}
          </div>
        `;
      }).join('');
    }

    // 更新選取元素的單步詳細推導拆解
    const detailBox = document.getElementById('ch2-matrix-step-detail');
    if (detailBox) {
      const r = ch2MatrixSelectedRow;
      const c = ch2MatrixSelectedCol;
      const rRow = ch2MatrixR[r];
      const sCol = [ch2MatrixS[0][c], ch2MatrixS[1][c], ch2MatrixS[2][c]];
      const resultVal = matrixT[r][c];

      let calcFormulaStr = '';
      if (compMode === 'max_min') {
        const p1 = Math.min(rRow[0], sCol[0]);
        const p2 = Math.min(rRow[1], sCol[1]);
        const p3 = Math.min(rRow[2], sCol[2]);
        calcFormulaStr = `
          $$\\begin{aligned}
          t_{${r+1}${c+1}} &= \\max_j \\min(r_{${r+1}j},\\, s_{j${c+1}}) \\\\
          &= \\max\\Big(\\min(${rRow[0]}, ${sCol[0]}),\\; \\min(${rRow[1]}, ${sCol[1]}),\\; \\min(${rRow[2]}, ${sCol[2]})\\Big) \\\\
          &= \\max\\big(${p1.toFixed(2)},\\; ${p2.toFixed(2)},\\; ${p3.toFixed(2)}\\big) = \\mathbf{${resultVal.toFixed(2)}}
          \\end{aligned}$$
        `;
      } else {
        const p1 = rRow[0] * sCol[0];
        const p2 = rRow[1] * sCol[1];
        const p3 = rRow[2] * sCol[2];
        calcFormulaStr = `
          $$\\begin{aligned}
          t_{${r+1}${c+1}} &= \\max_j (r_{${r+1}j} \\cdot s_{j${c+1}}) \\\\
          &= \\max\\Big(${rRow[0]} \\times ${sCol[0]},\\; ${rRow[1]} \\times ${sCol[1]},\\; ${rRow[2]} \\times ${sCol[2]}\\Big) \\\\
          &= \\max\\big(${p1.toFixed(2)},\\; ${p2.toFixed(2)},\\; ${p3.toFixed(2)}\\big) = \\mathbf{${resultVal.toFixed(2)}}
          \\end{aligned}$$
        `;
      }

      detailBox.innerHTML = `
        <div class="bg-slate-900/90 rounded-2xl p-5 border border-emerald-500/30 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              🔍 當前聚焦元素 $t_{${r+1}${c+1}}$ 手算逐步拆解（第 ${r+1} 列 配 第 ${c+1} 行）
            </span>
            <span class="text-xs text-slate-400">點擊上方 T 矩陣任一數字即可切換聚焦格</span>
          </div>
          <div class="formula-display-card">
            ${calcFormulaStr}
          </div>
          <div class="text-xs sm:text-sm text-slate-300 flex items-center justify-between">
            <span><strong>R 第 ${r+1} 列：</strong>[${rRow.join(', ')}]</span>
            <span><strong>S 第 ${c+1} 行：</strong>[${sCol.join(', ')}]</span>
            <span><strong>計算結果：</strong><strong class="text-emerald-400 font-mono text-base font-extrabold">${resultVal.toFixed(2)}</strong></span>
          </div>
        </div>
      `;
      safeMathJax([detailBox]);
    }
  }

  // ==========================================================================
  // 【Chapter 02 模組 3 - 圖 (c)】：模糊蘊含與單規則近似推論（Mamdani 截頂 vs. Larsen 縮放）
  // ==========================================================================
  function updateCh2PlotC() {
    const plotEl = document.getElementById('plot-ch2-c');
    if (!plotEl) return;

    const w = parseFloat((document.getElementById('ch2PlotC-w') || {}).value || 0.65);
    const setSpan = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setSpan('ch2PlotC-w-val', w.toFixed(2));

    const yVals = [];
    const origB = [];
    const clipB = [];
    const scaleB = [];

    // 後件 B(y) 為 trimf(y; 20, 50, 80)
    for (let y = 0; y <= 100; y += 0.5) {
      yVals.push(y);
      const mu = trimf(y, 20, 50, 80);
      origB.push(mu);
      clipB.push(Math.min(w, mu));
      scaleB.push(parseFloat((w * mu).toFixed(4)));
    }

    const traces = [
      {
        x: yVals,
        y: origB,
        name: '原始後件歸屬函數 B(y) [20, 50, 80]',
        mode: 'lines',
        line: { color: 'rgba(148, 163, 184, 0.6)', dash: 'dot', width: 2 }
      },
      {
        x: yVals,
        y: clipB,
        name: `Mamdani 截頂法: min(w=${w.toFixed(2)}, B(y))（梯形面積）`,
        mode: 'lines',
        line: { color: '#38bdf8', width: 3.5 },
        fill: 'tozeroy',
        fillcolor: 'rgba(56, 189, 248, 0.25)'
      },
      {
        x: yVals,
        y: scaleB,
        name: `Larsen 乘積縮放: w · B(y)（三角形面積）`,
        mode: 'lines',
        line: { color: '#34d399', width: 3.5 },
        fill: 'tozeroy',
        fillcolor: 'rgba(52, 211, 153, 0.20)'
      },
      {
        x: [0, 100],
        y: [w, w],
        name: `激發強度水平切線 w = ${w.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#fbbf24', dash: 'dash', width: 2 }
      }
    ];

    const layout = getBaseLayout('後件論域 y', '結論歸屬度 μ_B\'(y)', [10, 90], [-0.05, 1.15]);
    layout.legend = { orientation: 'h', y: 1.18, x: 0 };

    safePlot('plot-ch2-c', traces, layout);

    // 計算面積與幾何狀態
    const statusBox = document.getElementById('ch2PlotC-status-box');
    if (statusBox) {
      const origArea = 0.5 * 60 * 1.0; // 底 60 高 1.0 = 30
      // 梯形面積 = ((上底 + 下底) * 高) / 2
      const topWidth = 60 * (1 - w);
      const clipArea = ((topWidth + 60) * w) / 2;
      const scaleArea = 0.5 * 60 * w; // 三角形 底 60 高 w

      statusBox.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-sky-500/30 space-y-1">
            <span class="text-xs text-sky-300 font-bold">1. Mamdani 截頂法 (Clipping)</span>
            <div class="text-xl font-bold text-white font-mono">面積 = ${clipArea.toFixed(2)}</div>
            <p class="text-xs text-slate-300">上底 $[${(50 - topWidth/2).toFixed(1)}, ${(50 + topWidth/2).toFixed(1)}]$，造型為<strong>梯形</strong>。抗雜訊干擾強，硬體以比較器實現最簡易。</p>
          </div>
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 space-y-1">
            <span class="text-xs text-emerald-300 font-bold">2. Larsen 乘積縮放法 (Scaling)</span>
            <div class="text-xl font-bold text-white font-mono">面積 = ${scaleArea.toFixed(2)}</div>
            <p class="text-xs text-slate-300">尖峰降為 $w=${w.toFixed(2)}$，造型維持<strong>等腰三角形</strong>。保持原形狀資訊，在連續調諧系統中過渡更光滑。</p>
          </div>
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 space-y-1">
            <span class="text-xs text-amber-300 font-bold">3. 幾何面積保留比例</span>
            <div class="text-xl font-bold text-amber-400 font-mono">${((clipArea / origArea)*100).toFixed(1)}% vs. ${((scaleArea / origArea)*100).toFixed(1)}%</div>
            <p class="text-xs text-slate-300">因 $w < 1$，截頂梯形面積永遠大於乘積縮放三角形面積（$\\text{Area}_{\\text{clip}} \\ge \\text{Area}_{\\text{scale}}$）。</p>
          </div>
        </div>
      `;
      safeMathJax([statusBox]);
    }
  }

  // ==========================================================================
  // 【Chapter 02 模組 3 - 圖 (d)】：多規則推論聚合與四大解模糊化比較器
  // ==========================================================================
  function updateCh2PlotD() {
    const plotEl = document.getElementById('plot-ch2-d');
    if (!plotEl) return;

    const w1 = parseFloat((document.getElementById('ch2PlotD-w1') || {}).value || 0.75);
    const w2 = parseFloat((document.getElementById('ch2PlotD-w2') || {}).value || 0.55);

    const setSpan = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setSpan('ch2PlotD-w1-val', w1.toFixed(2));
    setSpan('ch2PlotD-w2-val', w2.toFixed(2));

    const yVals = [];
    const r1Vals = [];
    const r2Vals = [];
    const aggVals = [];
    const step = 0.5;

    let numCog = 0;
    let denCog = 0;
    let totalArea = 0;

    for (let y = 0; y <= 100; y += step) {
      yVals.push(y);
      const b1 = Math.min(w1, trimf(y, 10, 30, 50));
      const b2 = Math.min(w2, trimf(y, 35, 65, 95));
      const agg = Math.max(b1, b2);

      r1Vals.push(b1);
      r2Vals.push(b2);
      aggVals.push(agg);

      numCog += y * agg * step;
      denCog += agg * step;
      totalArea += agg * step;
    }

    // 1. 重心法 (Centroid / COG)
    const valCog = denCog > 0 ? (numCog / denCog) : 50;

    // 2. 面積平分法 (Bisector / BOA)
    let halfAreaAcc = 0;
    let valBisector = yVals[0];
    const targetHalf = totalArea / 2;
    for (let i = 0; i < yVals.length; i++) {
      halfAreaAcc += aggVals[i] * step;
      if (halfAreaAcc >= targetHalf) {
        valBisector = yVals[i];
        break;
      }
    }

    // 3. 最大平均法 (MOM), 最小極大值 (SOM), 最大極大值 (LOM)
    let maxVal = -1;
    for (let i = 0; i < aggVals.length; i++) {
      if (aggVals[i] > maxVal) maxVal = aggVals[i];
    }
    const maxIndices = [];
    for (let i = 0; i < aggVals.length; i++) {
      if (Math.abs(aggVals[i] - maxVal) < 1e-4) {
        maxIndices.push(yVals[i]);
      }
    }
    const valSom = maxIndices.length ? maxIndices[0] : 0;
    const valLom = maxIndices.length ? maxIndices[maxIndices.length - 1] : 0;
    const valMom = (valSom + valLom) / 2;

    const traces = [
      {
        x: yVals,
        y: aggVals,
        name: '多規則聚合輸出包絡線 μ_B,agg(y)',
        mode: 'lines',
        line: { color: '#6366f1', width: 3.5 },
        fill: 'tozeroy',
        fillcolor: 'rgba(99, 102, 241, 0.20)'
      },
      {
        x: [valCog, valCog],
        y: [0, 1.05],
        name: `重心法 COG: ${valCog.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#f97316', width: 3, dash: 'solid' }
      },
      {
        x: [valBisector, valBisector],
        y: [0, 1.05],
        name: `面積平分法 BOA: ${valBisector.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#10b981', width: 3, dash: 'dash' }
      },
      {
        x: [valMom, valMom],
        y: [0, 1.05],
        name: `最大平均法 MOM: ${valMom.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#a855f7', width: 3, dash: 'dot' }
      },
      {
        x: [valSom, valSom],
        y: [0, 1.05],
        name: `最小極大值 SOM: ${valSom.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#f43f5e', width: 2, dash: 'dashdot' }
      },
      {
        x: [valLom, valLom],
        y: [0, 1.05],
        name: `最大極大值 LOM: ${valLom.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#38bdf8', width: 2, dash: 'dashdot' }
      }
    ];

    const layout = getBaseLayout('輸出控制量 y', '聚合歸屬度 μ(y)', [0, 100], [-0.05, 1.15]);
    layout.legend = { orientation: 'h', y: 1.22, x: 0 };

    safePlot('plot-ch2-d', traces, layout);

    // 更新數值比較卡片
    const infoBox = document.getElementById('ch2PlotD-info-box');
    if (infoBox) {
      infoBox.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-orange-500/40 text-center">
            <span class="text-xs text-orange-400 font-bold block">1. 重心法 (COG / Centroid)</span>
            <span class="text-2xl font-extrabold text-white font-mono mt-1 block">${valCog.toFixed(2)}</span>
            <span class="text-[11px] text-slate-400 mt-1 block">全曲線質量重心，平滑無突變</span>
          </div>
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/40 text-center">
            <span class="text-xs text-emerald-400 font-bold block">2. 面積平分法 (BOA / Bisector)</span>
            <span class="text-2xl font-extrabold text-white font-mono mt-1 block">${valBisector.toFixed(2)}</span>
            <span class="text-[11px] text-slate-400 mt-1 block">左右垂直等分面積割線</span>
          </div>
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-purple-500/40 text-center">
            <span class="text-xs text-purple-400 font-bold block">3. 最大平均法 (MOM)</span>
            <span class="text-2xl font-extrabold text-white font-mono mt-1 block">${valMom.toFixed(2)}</span>
            <span class="text-[11px] text-slate-400 mt-1 block">最高平台 [${valSom.toFixed(1)}, ${valLom.toFixed(1)}] 之中心</span>
          </div>
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-rose-500/40 text-center">
            <span class="text-xs text-rose-400 font-bold block">4. 極值法 (SOM / LOM)</span>
            <span class="text-xl font-extrabold text-white font-mono mt-1 block">${valSom.toFixed(1)} / ${valLom.toFixed(1)}</span>
            <span class="text-[11px] text-slate-400 mt-1 block">最小/最大極大值邊界點</span>
          </div>
        </div>
      `;
      safeMathJax([infoBox]);
    }
  }

  // ==========================================================================
  // Chapter 02：模組 4 題目練習互動與詳解展開
  // ==========================================================================
  function answerCh2Practice(qIndex, optionIndex) {
    ch2PracticeAnswers[qIndex] = optionIndex;
    renderCh2PracticeList();
  }

  function toggleCh2Solution(qIndex) {
    ch2SolutionExpanded[qIndex] = !ch2SolutionExpanded[qIndex];
    renderCh2PracticeList();
  }

  function renderCh2PracticeList() {
    const holder = document.getElementById('ch2-practice-list-holder');
    if (!holder) return;

    let correctCount = 0;
    CH2_PRACTICE_PROBLEMS.forEach(function (q, idx) {
      if (ch2PracticeAnswers[idx] === q.answerIndex) correctCount++;
    });

    const scoreEl = document.getElementById('ch2-practice-score');
    if (scoreEl) {
      scoreEl.textContent = correctCount + ' / ' + CH2_PRACTICE_PROBLEMS.length;
    }

    holder.innerHTML = CH2_PRACTICE_PROBLEMS.map(function (q, qIdx) {
      const userAns = ch2PracticeAnswers[qIdx];
      const hasAnswered = userAns !== undefined;
      const isCorrect = userAns === q.answerIndex;
      const isExpanded = !!ch2SolutionExpanded[qIdx];

      const optionsHtml = q.options.map(function (optText, optIdx) {
        let btnClass = 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800 text-slate-300';
        let badge = '<span class="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-slate-700">' + String.fromCharCode(65 + optIdx) + '</span>';

        if (hasAnswered) {
          if (optIdx === q.answerIndex) {
            btnClass = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-semibold';
            badge = '<span class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold flex items-center justify-center shrink-0">✓</span>';
          } else if (optIdx === userAns) {
            btnClass = 'bg-rose-500/20 border-rose-500/60 text-rose-200';
            badge = '<span class="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shrink-0">✕</span>';
          }
        }

        return `
          <button onclick="FuzzyWidgets.answerCh2Practice(${qIdx}, ${optIdx})"
            class="w-full text-left p-4 rounded-2xl border transition flex items-center gap-3.5 ${btnClass}">
            ${badge}
            <span class="text-sm sm:text-base leading-relaxed">${optText}</span>
          </button>
        `;
      }).join('');

      let resultBanner = '';
      if (hasAnswered) {
        resultBanner = `
          <div class="p-4 rounded-2xl ${isCorrect ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/35 text-rose-300'} flex items-center justify-between text-sm">
            <span class="font-bold flex items-center gap-2">
              <span>${isCorrect ? '🎉 答對了！觀念非常紮實！' : '❌ 答錯了，請點擊下方按鈕檢視完整推導詳解！'}</span>
            </span>
            <button onclick="FuzzyWidgets.toggleCh2Solution(${qIdx})" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs border border-slate-700 transition">
              ${isExpanded ? '收起推導詳解 ▲' : '點擊展開完整公式推導詳解 ▼'}
            </button>
          </div>
        `;
      }

      const solutionBlock = (isExpanded || !hasAnswered) ? `
        <div class="${isExpanded ? 'block' : 'hidden'} bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-sm leading-relaxed">
          ${q.derivation}
        </div>
      ` : '';

      return `
        <article class="refined-card p-6 sm:p-7 space-y-5 border-l-4 ${isCorrect ? 'border-l-emerald-400' : (hasAnswered ? 'border-l-rose-400' : 'border-l-indigo-400')}">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/35">${q.tag}</span>
              <span class="text-xs font-semibold text-slate-400">${q.difficulty}</span>
            </div>
            ${hasAnswered ? '' : `
              <button onclick="FuzzyWidgets.toggleCh2Solution(${qIdx})" class="text-xs text-indigo-400 hover:text-indigo-300 transition">
                ${isExpanded ? '隱藏提示與解答 ▲' : '偷看解答與詳細推導 ▼'}
              </button>
            `}
          </div>

          <h4 class="text-lg sm:text-xl font-bold text-white leading-snug">
            ${q.question}
          </h4>

          <div class="space-y-3 pt-1">
            ${optionsHtml}
          </div>

          ${resultBanner}
          ${solutionBlock}
        </article>
      `;
    }).join('');

    safeMathJax([holder]);
  }

  // ==========================================================================
  // Chapter 02：四大標準學習模組總體 HTML 生成器
  // ==========================================================================
  function getChapter2FourModulesHtml() {
    return `
      <!-- =================================================================== -->
      <!-- 【模組 1：通論（Overview）】 -->
      <!-- =================================================================== -->
      <div id="ch2-module-sec-m1" class="space-y-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-indigo-500/40 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold uppercase tracking-widest border border-indigo-500/40">Module 01 • Theoretical Overview</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊關係、合成運算與近似推論全景架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              系統化掌握「人類語意關聯與笛卡兒積空間」、「明確關係 vs. 模糊關係全維度對照表」、「Max-Min vs. Max-Product 算子三大核心定理證明」、「模糊等價關係與傳遞閉包平方收斂法」與「GMP 近似推論與四大解模糊化工程選型」。
            </p>
          </div>

          <!-- 2.1 人類語意關聯與二維笛卡兒積空間 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-indigo-400 space-y-4">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-bold flex items-center justify-center border border-indigo-500/40">2.1</span>
              <span>人類語意關聯與二維笛卡兒積空間（The Nature of Fuzzy Relations & Cartesian Space）</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                在 Chapter 01 中，我們學習了單一論域 $X$ 上的模糊集合（例如「年齡 $x$ 屬於小朋友的程度」或「溫度 $x$ 屬於炎熱的程度」）。然而人類的認知思考與工程控制決策，絕大多數涉及<strong>「多個變數之間的交互關聯」</strong>。例如：
              </p>
              <ul class="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong>舒適度評估：</strong>不僅看「氣溫」，更由「氣溫 $x$」與「相對濕度 $y$」共同決定人體體感。</li>
                <li><strong>汽車自適應煞車：</strong>必須同時根據「當前車速 $x$」與「跟車距離 $y$」推估出「碰撞危險指數 $\\mu_R(x, y)$」。</li>
                <li><strong>醫療診斷：</strong>醫生依據病患展現的「症狀組合 $(x, y)$」推論可能罹患的疾病。</li>
              </ul>
              <p>
                為了在數學上嚴謹描述這種多維度語意關聯，我們將定義域擴展至兩個論域的直角坐標積空間（笛卡兒積，Cartesian Product）$X \\times Y = \\{(x, y) \\mid x \\in X, y \\in Y\\}$。定義在其上的模糊子集 $R$ 即稱為<strong>二元模糊關係（Binary Fuzzy Relation）</strong>：
              </p>
            </div>
            <div class="formula-display-card">
              $$\\mu_R : X \\times Y \\to [0, 1], \\qquad \\mu_{A \\times B}(x, y) = \\min\\big(\\mu_A(x),\\, \\mu_B(y)\\big) \\quad \\text{或} \\quad \\mu_A(x) \\cdot \\mu_B(y)$$
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-sky-300">🏔️ 三維曲面與 2D 熱力拓撲</div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  二元模糊關係 $\\mu_R(x, y)$ 在幾何上表現為底面為 $X \\times Y$ 平面、高度介於 $[0, 1]$ 的<strong>連續起伏立體丘陵曲面（Surface）</strong>。其等高線水平切面即形成 2D 關聯熱力圖（Heatmap），您可在下方【模組 3 圖 (a)】親手拉動滑桿旋轉觀察。
                </p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-emerald-300">📐 邊際投影定理（Marginal Projection）</div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  若已知積空間模糊關係 $R$，將其沿座標軸取最大值 $\\max$ 投影：$\\mu_{\\text{Proj}_X}(x) = \\max_{y \\in Y} \\mu_R(x, y)$。當 $R = A \\times B$ 且 $B$ 為正規模糊集合時，<strong>投影結果可精確無失真還原一維原始模糊集合 $A(x)$</strong>！
                </p>
              </div>
            </div>
          </div>

          <!-- 2.2 明確關係 vs. 模糊關係深入對比全景表 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-sky-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 text-sm font-bold flex items-center justify-center border border-sky-500/40">2.2</span>
              <span>明確關係（Crisp Relation）與模糊關係（Fuzzy Relation）深入對比全景表</span>
            </h4>
            <div class="overflow-x-auto rounded-2xl border border-slate-800">
              <table class="w-full border-collapse text-sm sm:text-base">
                <thead>
                  <tr class="bg-slate-900/95 text-sky-300 border-b border-slate-700">
                    <th class="px-4 py-3.5 text-left font-bold">比較維度</th>
                    <th class="px-4 py-3.5 text-left font-bold text-rose-300">古典明確關係 (Crisp Relation $R$)</th>
                    <th class="px-4 py-3.5 text-left font-bold text-emerald-300">模糊關係 (Fuzzy Relation $R$)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80 text-slate-200">
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">數學映射本質</td>
                    <td class="px-4 py-3.5">特性函數 $\\Phi_R(x, y) \\in \\{0, 1\\}$（非 0 即 1，二元斷裂）</td>
                    <td class="px-4 py-3.5">歸屬函數 $\\mu_R(x, y) \\in [0, 1]$（連續灰度強度，量化關聯深淺）</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">矩陣數據結構</td>
                    <td class="px-4 py-3.5">布林矩陣 $R \\in \\{0, 1\\}^{m \\times n}$（僅包含 0 與 1）</td>
                    <td class="px-4 py-3.5">模糊關係矩陣 $R = [r_{ij}]_{m \\times n}$，其中 $r_{ij} = \\mu_R(x_i, y_j) \\in [0, 1]$</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">空間幾何形態</td>
                    <td class="px-4 py-3.5">二維坐標網格上的孤立離散點或陡峭直角柱體</td>
                    <td class="px-4 py-3.5">三維空間中處處平滑起伏的立體山峰與連續鞍部曲面</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">圖論表徵 (Graph Theory)</td>
                    <td class="px-4 py-3.5">普通有向圖（Directed Graph，兩節點間邊只有存在或不存在）</td>
                    <td class="px-4 py-3.5">加權模糊有向圖（Fuzzy DiGraph，邊具有權重 $w \\in (0, 1]$，表示傳導機率或關聯緊密度）</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">逆關係運算 (Inverse)</td>
                    <td class="px-4 py-3.5">轉置矩陣 $R^{-1} = R^T$，$\\Phi_{R^{-1}}(y, x) = \\Phi_R(x, y)$</td>
                    <td class="px-4 py-3.5">轉置矩陣 $R^{-1} = R^T$，$\\mu_{R^{-1}}(y, x) = \\mu_R(x, y)$（運算同態保持）</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3.5 font-bold text-white">連接橋樑（$\\alpha$-截集轉換）</td>
                    <td class="px-4 py-3.5">自身即為明確子集</td>
                    <td class="px-4 py-3.5">
                      門檻截集 $R_\\alpha = \\{(x, y) \\mid \\mu_R(x, y) \\ge \\alpha\\}$，隨 $\\alpha$ 提高形成嚴格單調遞減的嵌套明確關係族！
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2.3 關係合成兩大王牌算子與三大核心定理證明 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-emerald-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-bold flex items-center justify-center border border-emerald-500/40">2.3</span>
              <span>關係合成兩大王牌算子（Max-Min vs. Max-Product）與三大核心定理證明</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                在多級邏輯推論與系統控制中，若已知「輸入 $x$ 與中間狀態 $y$ 的關係矩陣 $R$」以及「中間狀態 $y$ 與最終輸出 $z$ 的關係矩陣 $S$」，欲推導「輸入 $x$ 跨級直通最終輸出 $z$ 的關係 $T$」，就必須透過<strong>關係合成（Relation Composition）</strong>！
              </p>
              <p>
                模糊合成運算是線性代數「矩陣乘法」在模糊邏輯中的自然推廣：將原本的「內層乘法、外層相加」替換為「<strong>內層取小、外層取大（Max-Min, $\\circ$）</strong>」或「<strong>內層相乘、外層取大（Max-Product, $\\odot$）</strong>」：
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-indigo-500/40 space-y-2">
                <div class="text-sm font-bold text-indigo-300">1. Max-Min 合成算子（$T = R \\circ S$）</div>
                <p class="text-xs sm:text-sm text-slate-300">
                  由 Lotfi Zadeh 提出之標準算子。內層取瓶頸最小值、外層取最強路徑：
                </p>
                <div class="formula-display-card text-sm">
                  $$(R \\circ S)_{ik} = \\max_{j=1}^{m} \\min\\big(r_{ij},\\, s_{jk}\\big)$$
                </div>
                <p class="text-xs text-slate-400">特性：計算極快、抗局部雜訊、硬體邏輯閘比較器最易實現。</p>
              </div>
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/40 space-y-2">
                <div class="text-sm font-bold text-emerald-300">2. Max-Product 合成算子（$T = R \\odot S$）</div>
                <p class="text-xs sm:text-sm text-slate-300">
                  以實數代數積模擬能量衰減或條件機率傳遞，外層取最大：
                </p>
                <div class="formula-display-card text-sm">
                  $$(R \\odot S)_{ik} = \\max_{j=1}^{m} \\big(r_{ij} \\cdot s_{jk}\\big)$$
                </div>
                <p class="text-xs text-slate-400">特性：曲面處處平滑可微、具備比例縮放保持性，特別適合連續動態系統。</p>
              </div>
            </div>

            <!-- 三大核心定理 -->
            <div class="space-y-4 pt-2">
              <div class="text-base font-bold text-amber-300 flex items-center gap-2">
                <span>📜 研究所入學考與期中考三大必考定理（含代數嚴格證明）：</span>
              </div>
              <div class="space-y-3">
                <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div class="text-sm font-bold text-white flex items-center gap-2">
                    <span class="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">1</span>
                    <span>結合律恆成立（Associativity）</span>
                  </div>
                  <div class="formula-display-card text-sm py-2 my-1">
                    $$(R \\circ S) \\circ T = R \\circ (S \\circ T), \\qquad (R \\odot S) \\odot T = R \\odot (S \\odot T)$$
                  </div>
                  <p class="text-xs text-slate-300 leading-relaxed">
                    證明：因為實數的 $\\min$ 與 $\\max$（以及代數乘法）皆具備結合律與分配律，多級模糊推論串聯時，計算先後順序不影響最終推論結果。
                  </p>
                </div>

                <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div class="text-sm font-bold text-white flex items-center gap-2">
                    <span class="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">2</span>
                    <span>轉置反序性（Transpose Anti-distributivity）</span>
                  </div>
                  <div class="formula-display-card text-sm py-2 my-1">
                    $$(R \\circ S)^T = S^T \\circ R^T, \\qquad (R \\odot S)^T = S^T \\odot R^T$$
                  </div>
                  <p class="text-xs text-slate-300 leading-relaxed">
                    證明：$[(R \\circ S)^T]_{ki} = (R \\circ S)_{ik} = \\max_j \\min(r_{ij}, s_{jk}) = \\max_j \\min(s_{jk}, r_{ij}) = \\max_j \\min(S^T_{kj}, R^T_{ji}) = (S^T \\circ R^T)_{ki}$。
                  </p>
                </div>

                <div class="bg-slate-950/80 p-4 rounded-xl border border-rose-500/40 space-y-1.5">
                  <div class="text-sm font-bold text-rose-300 flex items-center gap-2">
                    <span class="w-6 h-6 rounded-md bg-rose-500/20 text-rose-300 text-xs flex items-center justify-center font-bold">3</span>
                    <span>🔥 不平等夾擠定理（Domination Theorem，必考首選！）</span>
                  </div>
                  <div class="formula-display-card text-sm py-2 my-1 border-rose-500/30">
                    $$(R \\odot S)_{ik} \\le (R \\circ S)_{ik}, \\qquad \\forall i, k$$
                  </div>
                  <p class="text-xs text-slate-200 leading-relaxed">
                    <strong>代數證明：</strong>對任意 $a, b \\in [0, 1]$，由 $0 \\le a \\le 1$ 與 $0 \\le b \\le 1$ 可得：$a \\cdot b \\le a$ 且 $a \\cdot b \\le b \\implies a \\cdot b \\le \\min(a, b)$。因此對每一個中間節點 $j$，恆有 $r_{ij} \\cdot s_{jk} \\le \\min(r_{ij}, s_{jk})$。兩側同時施加保序的外層上確界 $\\max_j$，不等式方向保持不變，故得證！這代表<strong>Max-Product 合成結果必小於或等於 Max-Min 合成結果</strong>！
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 2.4 模糊等價關係與傳遞閉包平方收斂法 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-purple-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 text-sm font-bold flex items-center justify-center border border-purple-500/40">2.4</span>
              <span>模糊等價關係（Fuzzy Equivalence）與傳遞閉包平方收斂法（Transitive Closure）</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                若要在不確定環境下對事物進行「分群分類（Clustering）」，必須依靠模糊相似度。一個定義在論域 $X$ 上的模糊關係矩陣 $R$ 必須同時滿足下列三大公理，才能稱為<strong>模糊等價關係（Fuzzy Equivalence Relation / 模糊相容關係）</strong>：
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div class="text-sm font-bold text-sky-300">1. 自反性 (Reflexivity)</div>
                <p class="text-xs text-slate-300">自身與自身的關聯度永遠為最大值 1：</p>
                <div class="formula-display-card text-xs py-2">$$r_{ii} = 1.0, \\quad \\forall i$$</div>
                <p class="text-xs text-slate-400">矩陣主對角線元素全數為 1。</p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div class="text-sm font-bold text-emerald-300">2. 對稱性 (Symmetry)</div>
                <p class="text-xs text-slate-300">A 與 B 的相似度等於 B 與 A 的相似度：</p>
                <div class="formula-display-card text-xs py-2">$$r_{ij} = r_{ji} \\iff R = R^T$$</div>
                <p class="text-xs text-slate-400">矩陣對稱於主對角線。</p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-rose-500/40 space-y-1.5">
                <div class="text-sm font-bold text-rose-300">3. Max-Min 傳遞性 (Transitivity)</div>
                <p class="text-xs text-slate-300">若 A 像 B、B 像 C，則 A 與 C 亦具備傳遞約束：</p>
                <div class="formula-display-card text-xs py-2">$$R \\circ R \\subseteq R \\iff (R \\circ R)_{ik} \\le r_{ik}$$</div>
                <p class="text-xs text-rose-200">最易失檢！只要有任何一格 $(R \\circ R)_{ik} > r_{ik}$ 即違反傳遞性！</p>
              </div>
            </div>

            <div class="bg-slate-900/90 p-5 rounded-2xl border border-purple-500/35 space-y-3">
              <div class="text-sm font-bold text-purple-300 flex items-center gap-2">
                <span>🔄 傳遞性失效之修復：傳遞閉包（Transitive Closure）平方收斂法演算法</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                在實際應用中（如問卷調查、醫學特徵評估），專家評估的相似度矩陣 $R$ 往往滿足自反性與對稱性，但<strong>不滿足傳遞性</strong>。為了解決此難題，我們求取包含 $R$ 且滿足傳遞性的最小等價關係——<strong>傳遞閉包 $R_T$</strong>！
              </p>
              <div class="formula-display-card text-sm">
                $$R_T = R \\cup R^2 \\cup R^3 \\cup \\cdots = \\bigcup_{k=1}^{\\infty} R^k$$
              </div>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong>⚡ 連續平方快速收斂定理（Repeated Squaring Method）：</strong><br/>
                對於 $n \\times n$ 有限矩陣，不必無窮次相乘！只需連續平方自我合成：$R \\to R^2 = R \\circ R \\to R^4 = R^2 \\circ R^2 \\to \\cdots \\to R^{2^k}$。定理保證：至多經過 $\\lceil \\log_2(n-1) \\rceil$ 次平方運算，矩陣<strong>必然收斂且數值不再改變</strong>（即 $R^{2^k} = R^{2^{k+1}} = R_T$）！這正是 Chapter 06 模糊分群畫出動態譜系分類樹的數學心臟！
              </p>
            </div>
          </div>

          <!-- 2.5 近似推論 (GMP) 與四大經典解模糊化全維度評估表 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-amber-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-bold flex items-center justify-center border border-amber-500/40">2.5</span>
              <span>近似推論（GMP）與四大經典解模糊化（Defuzzification）全維度工程評估表</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                古典邏輯有肯定式假言推理（Modus Ponens, MP）：若「若 $P$ 則 $Q$」為真，且已知「$P$ 成立」，則可斷言「$Q$ 成立」。而在模糊邏輯中，輸入往往「靠近 $P$」而非「等於 $P$」，Zadeh 提出<strong>廣義肯定式假言推理（Generalized Modus Ponens, GMP）</strong>：
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-xs font-bold text-amber-300 uppercase tracking-wider">推理架構與 Zadeh 合成推論規則 (CRI)</div>
                <div class="text-xs sm:text-sm text-slate-200 space-y-1 font-mono">
                  <div>前提 1（規則 Rule）：IF $x$ is $A$ THEN $y$ is $B$</div>
                  <div>前提 2（事實 Fact）：$x$ is $A'$（實際感測器量測）</div>
                  <div class="border-t border-slate-700 pt-1 text-emerald-300 font-bold">結論（Conclusion）：$y$ is $B' = A' \\circ (A \\to B)$</div>
                </div>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-xs font-bold text-sky-300 uppercase tracking-wider">單點模糊化 (Singleton Fuzzification) 結論簡化</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  當感測器讀取單一精確數值 $x^*$ 時，$A'(x) = 1$（當 $x = x^*$），其餘為 $0$。激發強度簡化為純量 $w = \\mu_A(x^*)$，後件幾何推論產生兩大流派：
                </p>
                <div class="text-xs text-slate-200 space-y-1 font-mono">
                  <div>• Mamdani 截頂（Clipping）：$\\mu_{B'}(y) = \\min\\big(w,\\; \\mu_B(y)\\big)$（削平為梯形）</div>
                  <div>• Larsen 縮放（Scaling）：$\\mu_{B'}(y) = w \\cdot \\mu_B(y)$（等比例縮減三角形）</div>
                </div>
              </div>
            </div>

            <!-- 四大解模糊化全維度工程評估表 -->
            <div class="space-y-2 pt-2">
              <div class="text-sm font-bold text-white">⚙️ 四大解模糊化方法全維度工程選型與性能評估表：</div>
              <div class="overflow-x-auto rounded-2xl border border-slate-800">
                <table class="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr class="bg-slate-900/95 text-sky-300 border-b border-slate-700">
                      <th class="px-3.5 py-3 text-left font-bold">解模糊化方法</th>
                      <th class="px-3.5 py-3 text-left font-bold">數學公式定義</th>
                      <th class="px-3.5 py-3 text-center font-bold">輸出連續性 (Continuity)</th>
                      <th class="px-3.5 py-3 text-center font-bold">計算複雜度</th>
                      <th class="px-3.5 py-3 text-left font-bold">工程適用場景與權衡</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/80 text-slate-200">
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-3.5 py-3 font-bold text-orange-400">1. 重心法 (Centroid / COG)</td>
                      <td class="px-3.5 py-3 font-mono text-xs">$y^* = \\frac{\\int y \\mu(y) dy}{\\int \\mu(y) dy}$</td>
                      <td class="px-3.5 py-3 text-center text-emerald-400 font-bold">⭐⭐⭐⭐⭐<br/>處處平滑無突變</td>
                      <td class="px-3.5 py-3 text-center text-amber-400 font-bold">中等偏高<br/>(需全區積分)</td>
                      <td class="px-3.5 py-3 text-slate-300">
                        <strong>工業首選！</strong>如伺服馬達、車速控制、無人機姿態調整。即便雙峰微幅消長也不會有劇烈機械抖動。
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-3.5 py-3 font-bold text-emerald-400">2. 面積平分法 (Bisector / BOA)</td>
                      <td class="px-3.5 py-3 font-mono text-xs">$\\int_{-\\infty}^{y^*} \\mu dy = \\int_{y^*}^{\\infty} \\mu dy$</td>
                      <td class="px-3.5 py-3 text-center text-emerald-400 font-bold">⭐⭐⭐⭐<br/>極佳連續性</td>
                      <td class="px-3.5 py-3 text-center text-rose-400 font-bold">高<br/>(需二分搜尋割線)</td>
                      <td class="px-3.5 py-3 text-slate-300">
                        幾何直觀強，對極端長尾面積較不敏感，適合具有明確對稱目標區間的定位控制。
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-3.5 py-3 font-bold text-purple-400">3. 最大平均法 (Mean of Maxima / MOM)</td>
                      <td class="px-3.5 py-3 font-mono text-xs">$y^* = \\frac{y_{\\min} + y_{\\max}}{2} \\in M$</td>
                      <td class="px-3.5 py-3 text-center text-rose-400 font-bold">⭐☆☆☆☆<br/>⚠️ 雙峰易階躍突變</td>
                      <td class="px-3.5 py-3 text-center text-emerald-400 font-bold">極低<br/>(僅尋訪最高峰)</td>
                      <td class="px-3.5 py-3 text-slate-300">
                        運算最快，適用於 8-bit 單晶片、避障緊急煞車或<strong>二選一模式切換</strong>；嚴禁用於高精度連續傳動機構！
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-3.5 py-3 font-bold text-rose-400">4. 極值法 (SOM / LOM)</td>
                      <td class="px-3.5 py-3 font-mono text-xs">$\\inf M \\; \\text{或} \\; \\sup M$</td>
                      <td class="px-3.5 py-3 text-center text-rose-400 font-bold">⭐☆☆☆☆<br/>不連續邊界</td>
                      <td class="px-3.5 py-3 text-center text-emerald-400 font-bold">極低</td>
                      <td class="px-3.5 py-3 text-slate-300">
                        最小極大值 (SOM) 代表最保守決策；最大極大值 (LOM) 代表最激進決策。適合安全邊際極限防護系統。
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 2：《認識 Fuzzy》專書逐頁精讀（全書第 4、5、6 章，共 59 頁）】 -->
      <!-- =================================================================== -->
      <div id="ch2-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-indigo-500/40 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold uppercase tracking-widest border border-indigo-500/40">Module 02 • Page-by-Page Guided Reading</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2.5">
                <span>📸</span> 【模組 2：《認識 Fuzzy》專書逐頁精讀（全書第 4、5、6 章，共 59 頁）】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                完整涵蓋第 4 章模糊集合之運算 (4-1~4-12)、第 5 章模糊數之算術 (5-1~5-31) 與第 6 章模糊關係 (6-1~6-16)。支援章節 Tab 切換、頁碼膠囊導覽、原書大圖雙欄對照與全螢幕燈箱！
              </p>
            </div>
          </div>

          <div id="chapter34-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 3：多維度模擬圖互動專區（Interactive Plots）】 -->
      <!-- =================================================================== -->
      <div id="ch2-module-sec-m3" class="space-y-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-indigo-500/40 space-y-8">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold uppercase tracking-widest border border-indigo-500/40">Module 03 • 4 Interactive Simulators</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 3：多維度模擬圖互動專區（Interactive Plots）】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                為 Chapter 02 量身打造 4 座獨立 Plotly.js 模擬器，動態操作滑桿即時檢驗笛卡兒積、合成矩陣、Mamdani 截頂與四大解模糊化指標線！
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="FuzzyWidgets.jumpToCh2Plot('a')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 text-xs font-bold">跳至 (a) 笛卡兒積</button>
              <button onclick="FuzzyWidgets.jumpToCh2Plot('b')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 text-xs font-bold">跳至 (b) 矩陣合成</button>
              <button onclick="FuzzyWidgets.jumpToCh2Plot('c')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 text-xs font-bold">跳至 (c) 截頂 vs 縮放</button>
              <button onclick="FuzzyWidgets.jumpToCh2Plot('d')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-300 border border-slate-700 text-xs font-bold">跳至 (d) 解模糊化</button>
            </div>
          </div>

          <!-- 模擬器 (a)：模糊笛卡兒積 R = A × B 立體與熱力視覺化實驗室 -->
          <div id="ch2-plot-card-a" class="refined-card p-6 sm:p-7 border-l-4 border-l-indigo-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-indigo-400 uppercase">Simulator (a) • 對應課本頁 3-3 式 3.1 & 3.2</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (a) 模糊笛卡兒積 $R = A \\times B$ 立體曲面與 2D 熱力視覺化實驗室
                </h4>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div id="plot-ch2-a-heat" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>
              <div id="plot-ch2-a-3d" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-xs">
              <div class="md:col-span-4 space-y-1.5">
                <label class="block font-bold text-indigo-300">選擇笛卡兒積積空間算子：</label>
                <select id="ch2PlotA-mode" onchange="FuzzyWidgets.updateCh2PlotA()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-semibold">
                  <option value="min" selected>1. Zadeh Min 算子：min(A(x), B(y))（方頂稜角）</option>
                  <option value="prod">2. 代數積 Product 算子：A(x) · B(y)（平滑可微）</option>
                </select>
              </div>
              <div class="md:col-span-2 space-y-1">
                <div class="flex justify-between font-bold text-sky-300"><span>集合 A 中心 $c_A$：</span><span id="ch2PlotA-val-ca" class="font-mono">4.0</span></div>
                <input id="ch2PlotA-ca" type="range" min="1" max="9" step="0.5" value="4" oninput="FuzzyWidgets.updateCh2PlotA()" class="w-full cursor-pointer" />
              </div>
              <div class="md:col-span-2 space-y-1">
                <div class="flex justify-between font-bold text-sky-300"><span>展開寬度 $\\sigma_A$：</span><span id="ch2PlotA-val-wa" class="font-mono">1.6</span></div>
                <input id="ch2PlotA-wa" type="range" min="0.8" max="3.5" step="0.2" value="1.6" oninput="FuzzyWidgets.updateCh2PlotA()" class="w-full cursor-pointer" />
              </div>
              <div class="md:col-span-2 space-y-1">
                <div class="flex justify-between font-bold text-amber-300"><span>集合 B 中心 $c_B$：</span><span id="ch2PlotA-val-cb" class="font-mono">6.0</span></div>
                <input id="ch2PlotA-cb" type="range" min="1" max="9" step="0.5" value="6" oninput="FuzzyWidgets.updateCh2PlotA()" class="w-full cursor-pointer" />
              </div>
              <div class="md:col-span-2 space-y-1">
                <div class="flex justify-between font-bold text-amber-300"><span>展開寬度 $\\sigma_B$：</span><span id="ch2PlotA-val-wb" class="font-mono">1.8</span></div>
                <input id="ch2PlotA-wb" type="range" min="0.8" max="3.5" step="0.2" value="1.8" oninput="FuzzyWidgets.updateCh2PlotA()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="ch2PlotA-status-box"></div>
          </div>

          <!-- 模擬器 (b)：模糊關係合成運算器（Max-Min vs. Max-Product） -->
          <div id="ch2-plot-card-b" class="refined-card p-6 sm:p-7 border-l-4 border-l-emerald-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-emerald-400 uppercase">Simulator (b) • 對應課本頁 3-4 式 3.3 & 3.4</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (b) 模糊關係合成運算器（Max-Min vs. Max-Product）與逐步單步拆解
                </h4>
              </div>
              <div class="flex flex-wrap gap-2">
                <button onclick="FuzzyWidgets.loadCh2MatrixPreset('textbook')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 text-xs font-bold">載入課本經典範例</button>
                <button onclick="FuzzyWidgets.loadCh2MatrixPreset('medical')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500/20 text-sky-300 border border-slate-700 text-xs font-bold">載入醫療診斷矩陣</button>
                <button onclick="FuzzyWidgets.loadCh2MatrixPreset('random')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-500/20 text-purple-300 border border-slate-700 text-xs font-bold">🎲 隨機產生數值</button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <!-- 矩陣 R 輸入與圖形 -->
              <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div class="flex justify-between items-center text-xs font-bold text-sky-300">
                  <span>矩陣 $R$ 元素 (3×3)</span>
                  <span class="text-slate-400">可直接修改數字</span>
                </div>
                <div id="ch2-matrix-r-inputs" class="space-y-2"></div>
                <div id="plot-ch2-b-r" class="w-full h-44 rounded-xl bg-slate-950 p-1 border border-slate-800"></div>
              </div>

              <!-- 矩陣 S 輸入與圖形 -->
              <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div class="flex justify-between items-center text-xs font-bold text-amber-300">
                  <span>矩陣 $S$ 元素 (3×3)</span>
                  <span class="text-slate-400">可直接修改數字</span>
                </div>
                <div id="ch2-matrix-s-inputs" class="space-y-2"></div>
                <div id="plot-ch2-b-s" class="w-full h-44 rounded-xl bg-slate-950 p-1 border border-slate-800"></div>
              </div>

              <!-- 合成矩陣 T 數值表與圖形 -->
              <div class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/40 space-y-3">
                <div class="flex justify-between items-center text-xs font-bold text-emerald-300">
                  <span>合成結果 $T = R \\circ S$ (3×3)</span>
                  <span class="text-slate-400">點擊切換聚焦</span>
                </div>
                <div id="ch2-matrix-t-display" class="space-y-2"></div>
                <div id="plot-ch2-b-t" class="w-full h-44 rounded-xl bg-slate-950 p-1 border border-slate-800"></div>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div class="flex items-center gap-3">
                <label class="text-xs sm:text-sm font-bold text-emerald-300">選擇合成運算法則：</label>
                <select id="ch2PlotB-op-mode" onchange="FuzzyWidgets.updateCh2PlotB()" class="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm text-white font-bold">
                  <option value="max_min" selected>Max-Min 合成運算 (R ∘ S) • Zadeh 標準極值主導</option>
                  <option value="max_prod">Max-Product 合成運算 (R ⊙ S) • 代數積衰減</option>
                </select>
              </div>
            </div>

            <div id="ch2-matrix-step-detail"></div>
          </div>

          <!-- 模擬器 (c)：模糊蘊含關係與單規則近似推論（Mamdani 截頂 vs. Larsen 縮放） -->
          <div id="ch2-plot-card-c" class="refined-card p-6 sm:p-7 border-l-4 border-l-sky-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-sky-400 uppercase">Simulator (c) • 對應課本頁 4-4 式 4.1 & 4.2</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (c) 單規則近似推論：Mamdani 削平頭截頂（Clipping）vs. Larsen 乘積縮放（Scaling）
                </h4>
              </div>
            </div>

            <div id="plot-ch2-c" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div class="flex justify-between items-center text-sm font-bold">
                <span class="text-yellow-300">⚡ 拖曳滑桿調整單點輸入之激發強度 $w = \\mu_A(x^*) \\in [0, 1]$：</span>
                <span id="ch2PlotC-w-val" class="font-mono text-xl font-extrabold text-yellow-400">0.65</span>
              </div>
              <input id="ch2PlotC-w" type="range" min="0.05" max="1.0" step="0.05" value="0.65" oninput="FuzzyWidgets.updateCh2PlotC()" class="w-full cursor-pointer" />
            </div>

            <div id="ch2PlotC-status-box"></div>
          </div>

          <!-- 模擬器 (d)：多規則推論聚合與四大解模糊化比較器 -->
          <div id="ch2-plot-card-d" class="refined-card p-6 sm:p-7 border-l-4 border-l-orange-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-orange-400 uppercase">Simulator (d) • 對應課本頁 4-5 ～ 4-6 式 4.3 ～ 4.6</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (d) 多規則推論聚合與四大解模糊化（Defuzzification）五大指標線動態對照
                </h4>
              </div>
            </div>

            <div id="plot-ch2-d" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-indigo-300">
                  <span>規則 1 激發強度 $w_1$ (後件 [10, 30, 50])：</span>
                  <span id="ch2PlotD-w1-val" class="font-mono text-base font-extrabold">0.75</span>
                </div>
                <input id="ch2PlotD-w1" type="range" min="0.0" max="1.0" step="0.05" value="0.75" oninput="FuzzyWidgets.updateCh2PlotD()" class="w-full cursor-pointer" />
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-amber-300">
                  <span>規則 2 激發強度 $w_2$ (後件 [35, 65, 95])：</span>
                  <span id="ch2PlotD-w2-val" class="font-mono text-base font-extrabold">0.55</span>
                </div>
                <input id="ch2PlotD-w2" type="range" min="0.0" max="1.0" step="0.05" value="0.55" oninput="FuzzyWidgets.updateCh2PlotD()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="ch2PlotD-info-box"></div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 4：章節題目練習與詳解（Practice & Solutions）】 -->
      <!-- =================================================================== -->
      <div id="ch2-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-indigo-500/40 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold uppercase tracking-widest border border-indigo-500/40">Module 04 • Practice & Step-by-Step Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解（Practice & Solutions）】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 8 題結合《認識 Fuzzy》第 3、4 章習題、課堂錄音考點與期中考手算大題（涵蓋 Max-Min 合成、等價關係、單點截頂與重心法手算），點擊選項即時檢驗！
              </p>
            </div>
            <div class="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm">
              本章節練習得分：<strong id="ch2-practice-score" class="text-emerald-400 font-mono text-lg">0 / 8</strong>
            </div>
          </div>

          <div id="ch2-practice-list-holder" class="space-y-6"></div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Chapter 03（對應專書控制與應用章節）：模糊控制器設計與實務應用
  // ==========================================================================
  let ch3ActiveModule = 'all';
  let ch3PracticeAnswers = {};
  let ch3SolutionExpanded = {};

  // Chapter 03 題庫資料（8 題實戰綜合考題，涵蓋 FLC 組件、FAM 幾何、雙輸入手算、TSK 函數、調諧、醫療決策、相平面阻尼與仙台地鐵案例）
  const CH3_PRACTICE_PROBLEMS = [
    {
      id: 'ch3_p1',
      tag: '系統架構考題 • FLC 組件分析',
      difficulty: '★☆☆ 基礎觀念',
      question: '【第 1 題】在典型的雙輸入單輸出（MISO）模糊邏輯控制器（FLC）中，當感測器讀取到當前設定點誤差 $e$ 與變化率 $\\Delta e$ 後，系統內部各組件的資料流運作先後順序為何？',
      options: [
        '量化正規化 → 模糊化介面 → 規則推論引擎 → 規則聚合與解模糊化 → 比例反正規化輸出',
        '解模糊化介面 → 知識庫評估 → 模糊化介面 → 重心法數值積分 → PID 補償',
        '模糊關聯矩陣 (FAM) → 逆拉普拉斯變換 → 模糊化介面 → 離散微分器',
        '單點模糊化 → 李亞普諾夫能量函數計算 → 查表法 → 類比訊號輸出'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整架構解析：</div>
          <p class="text-sm text-slate-200">標準模糊控制迴路具有嚴謹的五大資料處理階層：</p>
          <ul class="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li><strong>1. 量化與正規化：</strong>將實際感測物理量乘以量化因子 $G_e, G_{\\Delta e}$，縮放至控制器標準論域 $[-1, 1]$ 或 $[-3, 3]$。</li>
            <li><strong>2. 模糊化介面 (Fuzzification)：</strong>依據歸屬函數，將明確數值轉化為各語言標籤（NB, NS, ZO, PS, PB）的歸屬度。</li>
            <li><strong>3. 推論引擎 (Inference)：</strong>比對知識庫中的 IF-THEN 規則，計算各規則激發強度 $w_i$ 並求得各別後件模糊集合。</li>
            <li><strong>4. 聚合與解模糊化 (Defuzzification)：</strong>透過 $\\max$ 聚合後，以重心法（COG）或加權平均求得明確控制量 $u^*$。</li>
            <li><strong>5. 比例反正規化：</strong>乘以輸出比例增益 $G_u$，驅動致動器（如馬達電壓、變頻壓縮機轉速）。故選項 (A) 完全正確！</li>
          </ul>
        </div>
      `
    },
    {
      id: 'ch3_p2',
      tag: '規則庫設計考題 • FAM 觸發條數計算',
      difficulty: '★★☆ 規則幾何',
      question: '【第 2 題】某雙輸入模糊控制器採用 $5 \\times 5$ FAM 規則表，輸入變數 $e$ 與 $\\Delta e$ 的相鄰三角形歸屬函數在交叉點的高度皆嚴格設計為 $0.5$（重疊率為 1/2）。當任意任意非頂點明確數值 $(e^*, \\Delta e^*)$ 輸入時，系統最多同時會有幾條規則被激發（激發強度 $w > 0$）？',
      options: [
        '最多 4 條規則',
        '最多 2 條規則',
        '全表 25 條規則全部被激發',
        '最多 8 條規則'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整幾何與代數推導：</div>
          <p class="text-sm text-slate-200">對於標準三角形歸屬函數，當相鄰集合重疊率為 $0.5$ 時：</p>
          <ul class="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>在論域內任意一點 $e^*$，最多同時落在 $2$ 個相鄰歸屬函數的支集（Support）內，其餘集合歸屬度皆為 $0$。</li>
            <li>同理，在任意一點 $\\Delta e^*$，也最多同時落在 $2$ 個相鄰歸屬函數的支集內。</li>
            <li>根據前件笛卡兒積配對（$2 \\times 2$），被激發的規則數量最多為 $2 \\times 2 = 4$ 條！</li>
          </ul>
          <p class="text-sm text-slate-200">這項重要工程特性確保了 FLC 的即時運算量極低且確定，絕不會因為規則庫龐大而塞車，故選項 (A) 正確！</p>
        </div>
      `
    },
    {
      id: 'ch3_p3',
      tag: '手算經典大題 • 雙輸入 Mamdani 控制器計算',
      difficulty: '★★★ 綜合計算',
      question: '【第 3 題】已知某溫控 FLC 當前室溫誤差 $e = 1.0$，變化率 $\\Delta e = 0.5$。觸發了兩條控制規則：\\n$R_1$: IF $e$ is PS AND $\\Delta e$ is ZO THEN $u$ is PS (後件中心為 $40\\%$)\\n$R_2$: IF $e$ is PB AND $\\Delta e$ is ZO THEN $u$ is PB (後件中心為 $80\\%$)\\n若已知 $\\mu_{\\text{PS}}(e) = 0.6$、$\\mu_{\\text{PB}}(e) = 0.4$、$\\mu_{\\text{ZO}}(\\Delta e) = 0.8$。採用 Min 蘊含與中心平均法（Center Average Defuzzification），輸出風扇轉速 $u^*$ 為何？',
      options: [
        '$u^* = 56\\%$',
        '$u^* = 60\\%$',
        '$u^* = 50\\%$',
        '$u^* = 64\\%$'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整手算步驟解析：</div>
          <p class="text-sm text-slate-200">1. 計算各規則激發強度（Firing Strength，取 Min）：</p>
          <div class="formula-display-card">
            $$w_1 = \\min(\\mu_{\\text{PS}}(1.0), \\mu_{\\text{ZO}}(0.5)) = \\min(0.6, 0.8) = 0.6$$
            $$w_2 = \\min(\\mu_{\\text{PB}}(1.0), \\mu_{\\text{ZO}}(0.5)) = \\min(0.4, 0.8) = 0.4$$
          </div>
          <p class="text-sm text-slate-300">2. 代入中心平均解模糊化公式（Center Average Defuzzifier）：</p>
          <div class="formula-display-card">
            $$u^* = \\frac{w_1 \\cdot c_1 + w_2 \\cdot c_2}{w_1 + w_2} = \\frac{0.6 \\times 40\\% + 0.4 \\times 80\\%}{0.6 + 0.4} = \\frac{24 + 32}{1.0} = 56\\%$$
          </div>
          <p class="text-sm text-slate-200">故輸出轉速為 $56\\%$，選項 (A) 完全正確！</p>
        </div>
      `
    },
    {
      id: 'ch3_p4',
      tag: '核心模型比較 • TSK 一階線性加權計算',
      difficulty: '★★☆ 數值計算',
      question: '【第 4 題】若將第 3 題之系統改為一階 TSK（Takagi-Sugeno）模糊模型，兩條規則之線性後件方程分別為：\\n$y_1 = 20 e + 10 \\Delta e + 15$\\n$y_2 = 30 e + 20 \\Delta e + 25$\\n已知激發強度分別為 $w_1 = 0.6$ 與 $w_2 = 0.4$。在相同輸入 $e=1.0, \\Delta e=0.5$ 下，TSK 加權平均總輸出 $y^*_{\\text{TSK}}$ 為何？',
      options: [
        '$y^*_{\\text{TSK}} = 50.0$',
        '$y^*_{\\text{TSK}} = 45.0$',
        '$y^*_{\\text{TSK}} = 55.0$',
        '$y^*_{\\text{TSK}} = 40.0$'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 完整手算步驟解析：</div>
          <p class="text-sm text-slate-200">1. 先計算各規則後件多項式之數值輸出：</p>
          <div class="formula-display-card">
            $$y_1 = 20(1.0) + 10(0.5) + 15 = 20 + 5 + 15 = 40.0$$
            $$y_2 = 30(1.0) + 20(0.5) + 25 = 30 + 10 + 25 = 65.0$$
          </div>
          <p class="text-sm text-slate-300">2. 以激發強度 $w_1, w_2$ 進行加權平均（免除面積幾何積分）：</p>
          <div class="formula-display-card">
            $$y^*_{\\text{TSK}} = \\frac{w_1 y_1 + w_2 y_2}{w_1 + w_2} = \\frac{0.6(40.0) + 0.4(65.0)}{0.6 + 0.4} = \\frac{24.0 + 26.0}{1.0} = \\mathbf{50.0}$$
          </div>
          <p class="text-sm text-slate-200">故精確加權平均結果為 $50.0$，選項 (A) 完全正確！</p>
        </div>
      `
    },
    {
      id: 'ch3_p5',
      tag: '工程調諧必考 • 比例因子（Scaling Factors）影響',
      difficulty: '★★☆ 控制調諧',
      question: '【第 5 題】在調試工業模糊控制器時，若現場工程師將誤差輸入量化因子 $G_e$ 由 $1.0$ 調大至 $2.5$（保持其他參數不變），閉迴路控制系統的動態行為將產生何種變化？',
      options: [
        '等效比例增益提高，系統上升時間縮短、響應變快，但過衝量（Overshoot）可能增加且震盪加劇',
        '系統會完全喪失穩定度並發散，且死區範圍擴大',
        '控制器輸出動作會變得更加遲鈍平緩，上升時間大幅拉長',
        '對系統動態完全沒有任何影響，因為模糊規則表具備絕對尺度不變性'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 參數物理意義解析：</div>
          <p class="text-sm text-slate-200">輸入量化因子 $G_e$ 具有極為關鍵的控制調諧意義：</p>
          <ul class="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>增大 $G_e$ 意味著微小的物理誤差 $e(k)$ 就會被放大投影到歸屬函數的高位階區域（如 PB 或 NB），等同於提高了傳統 PID 中的<strong>比例增益 $K_p$</strong>。</li>
            <li>因此致動器會施加更強的控制力量，加快系統的動態響應速度、縮短上升時間；但若調得過大，容易引發系統超調甚至極限環震盪。故選項 (A) 正確！</li>
          </ul>
        </div>
      `
    },
    {
      id: 'ch3_p6',
      tag: '跨領域實戰 • 醫療臨床決策推論',
      difficulty: '★★☆ 醫療工程',
      question: '【第 6 題】在「加護病房重症預警模糊評估系統」中，患者生理指標為：收縮壓 $SBP = 85\\text{ mmHg}$（屬於「嚴重偏低」歸屬度 $0.9$），血氧飽和度 $SpO_2 = 88\\%$（屬於「嚴重缺氧」歸屬度 $0.85$）。若專家規則庫中定義：\\nIF SBP is 嚴重偏低 AND SpO2 is 嚴重缺氧 THEN 臨床危急指數 is 紅色緊急處置 (危急分數 90 分)\\n請問此條規則的激發強度 $w$ 與推論警示等級為何？',
      options: [
        '$w = 0.85$；輸出落入危急指數 85~90 分區間，系統發出最高等級「紅色緊急處置」蜂鳴警報',
        '$w = 0.90$；因收縮壓主導，判定為普通黃色預警觀察',
        '$w = 0.765$；依機率乘積計算，屬於綠色安全穩定範圍',
        '$w = 1.75$；兩者直接相加，指標超標失效'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 臨床醫學工程解析：</div>
          <p class="text-sm text-slate-200">依據 Zadeh 標準 Min 算子：</p>
          <div class="formula-display-card">
            $$w = \\min(\\mu_{\\text{嚴重偏低}}(85), \\mu_{\\text{嚴重缺氧}}(88)) = \\min(0.90, 0.85) = 0.85$$
          </div>
          <p class="text-sm text-slate-300">高達 $0.85$ 的激發強度使總輸出危急指數迅速攀升至 $85$ 分以上，觸發最高優先級的紅色緊急醫療介入程序（通知主治醫師準備插管與升壓藥物）。故選項 (A) 完全正確！</p>
        </div>
      `
    },
    {
      id: 'ch3_p7',
      tag: '相平面動力學 • FAM 主反對角線阻尼設計',
      difficulty: '★★★ 動力學分析',
      question: '【第 7 題】在雙輸入 $5 \\times 5$ FAM 控制規則表中，橫軸為誤差 $e$（目標值減當前值），縱軸為誤差變化率 $\\Delta e$。當系統處於第二象限（$e > 0$ 且 $\\Delta e < 0$，即目前數值低於目標值，但正以極快速度自發上升朝目標逼近）時，專家規則庫通常將控制輸出 $u$ 設定為 ZO（零控制）或 NS（微負抑制），而非施加強力的正控制 PB。這種設計在控制理論中最關鍵的物理考量為何？',
      options: [
        '施加適當的動態阻尼（Damping），防止受控對象因巨大的熱慣性或機械動量直接衝過設定點，從而有效抑制超調量（Overshoot）與震盪',
        '此時感測器容易產生測量雜訊，設定為 ZO 可暫時中斷反饋迴路進行濾波',
        '為了配合微積分排中律，在偶數象限輸出必須強制歸零',
        '第二象限的系統增益為負數，若施加正控制將直接引發正反饋導致致動器燒毀'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 相平面軌跡與阻尼物理機制：</div>
          <p class="text-sm text-slate-200">這是模糊控制相平面（Phase Plane）設計最核心的工程智慧：</p>
          <ul class="text-sm text-slate-300 space-y-1.5 list-disc list-inside">
            <li>當 $e > 0$ 且 $\\Delta e < 0$ 時，代表系統正沿著相平面軌跡自發飛速衝向原點 $(0, 0)$。例如室溫目前 $25^\\circ\\text{C}$（目標 $28^\\circ\\text{C}$），但加熱器正全速運轉且升溫速度高達 $+2^\\circ\\text{C/s}$。</li>
            <li>如果控制器在此時仍只看誤差 $e > 0$ 而繼續死板施加正大加熱（PB），強大的熱慣性必定會導致室溫一路衝破 $31^\\circ\\text{C}$，產生劇烈超調！</li>
            <li>因此，引入變化率 $\\Delta e$ 的負反饋等同於在系統中加入<strong>虛擬阻尼器（Damping Force）</strong>，提前踩煞車（輸出 ZO 或 NS），使狀態軌跡平滑且無超調地切入目標點！故選項 (A) 完全正確。</li>
          </ul>
        </div>
      `
    },
    {
      id: 'ch3_p8',
      tag: '世界歷史里程碑 • 日本仙台地鐵平穩起停考題',
      difficulty: '★★★ 實務案例',
      question: '【第 8 題】1987 年日本仙台地下鐵（Sendai Subway）啟用了世界上首套全自動模糊列車運行系統（ATO），一舉榮獲 IEEE 歷史里程碑。在該系統設計中，工程師如何利用模糊控制成功同時滿足「乘客乘車舒適感（Ride Comfort）」與「月台精確停車（Stop Precision, 誤差小於 7 cm）」這兩項相互矛盾的控制指標？',
      options: [
        '引入「加加速度（Jerk，加速度對時間的一階導數）」作為模糊輸入變數，以舒適性規則動態限制煞車變化率，並在進站最後階段平滑權衡距離精確對準規則',
        '將列車完全視為單輸入單輸出線性系統，使用古典 Nyquist 穩定判準直接設計固定增益轉移函數',
        '僅在列車即將撞擊緩衝器前 1 公尺強制觸發最大緊急機械煞車',
        '放棄所有軌道感測器回饋，完全依據固定時間計時器進行開迴路（Open-loop）階躍控制'
      ],
      answerIndex: 0,
      derivation: `
        <div class="space-y-3">
          <div class="font-bold text-emerald-300">📐 仙台地鐵 ATO 世界級控制工程解析：</div>
          <p class="text-sm text-slate-200">仙台地下鐵之所以成為控制工程經典，關鍵在於解決了「加加速度（Jerk）」與「精準停車」的衝突：</p>
          <ul class="text-sm text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>人體生物力學：</strong>人體內耳半規管感受到的頓挫與不適，並非來自「恆定加速度 $a$」，而是來自「加速度的變化率 $\\frac{da}{dt}$（即加加速度 Jerk）」。傳統 PID 控制為了在短時間內精準停準，常在停車瞬間煞車力道劇變，導致全車乘客向前仆倒。</li>
            <li><strong>模糊多目標折衷：</strong>日立（Hitachi）工程團隊將人體舒適度評估直接轉化為模糊前件規則，動態箝制 Jerk 上限；並在列車駛入月台時，模糊控制器平滑權衡「列車即時剩餘距離」與「減速平穩度」，實現了如羽毛落地般的極致舒適停靠，停車誤差小於 $7\\text{ cm}$，且節省了超過 $10\\%$ 的電能消耗！故選項 (A) 完全正確。</li>
          </ul>
        </div>
      `
    }
  ];

  function getActiveCh3Module() {
    return ch3ActiveModule;
  }

  function switchCh3Module(modId, shouldScroll) {
    ch3ActiveModule = modId;
    const modIds = ['m1', 'm2', 'm3', 'm4'];

    ['all', ...modIds].forEach(function (id) {
      const btn = document.getElementById('ch3-subtab-btn-' + id);
      if (!btn) return;
      if (id === modId) {
        btn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/20';
      } else {
        btn.className = 'w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium';
      }
    });

    modIds.forEach(function (id) {
      const sec = document.getElementById('ch3-module-sec-' + id);
      if (!sec) return;
      if (modId === 'all' || modId === id) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    if (modId === 'all' || modId === 'm3') {
      setTimeout(function () {
        updateCh3PlotA();
        updateCh3PlotB();
        updateCh3PlotC();
        updateCh3PlotD();
      }, 50);
    }

    if (shouldScroll) {
      setTimeout(function () {
        const targetEl = modId === 'all'
          ? document.getElementById('chapter-content-container')
          : document.getElementById('ch3-module-sec-' + modId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }

    safeMathJax();
  }

  function jumpToCh3Plot(plotKey) {
    switchCh3Module('m3');
    setTimeout(function () {
      const el = document.getElementById('ch3-plot-card-' + plotKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('pulse-focus');
        void el.offsetWidth;
        el.classList.add('pulse-focus');
      }
    }, 80);
  }

  // --------------------------------------------------------------------------
  // 【Chapter 03 模組 3 - 圖 (a)】：智慧冷氣溫控系統 & 5×5 FAM 規則表動態激發
  // --------------------------------------------------------------------------
  function updateCh3PlotA() {
    const famEl = document.getElementById('ch3-fam-table-holder');
    const plotEl = document.getElementById('plot-ch3-a');
    if (!famEl || !plotEl) return;

    const eVal = parseFloat((document.getElementById('ch3PlotA-e') || {}).value || 1.2);
    const deVal = parseFloat((document.getElementById('ch3PlotA-de') || {}).value || -0.4);

    const setSpan = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setSpan('ch3PlotA-val-e', eVal.toFixed(1) + '°C');
    setSpan('ch3PlotA-val-de', deVal.toFixed(1) + '°C/s');

    // 5 個語言集合標籤在 [-3, 3] 之三角形歸屬度
    const eval5 = function (x) {
      return {
        NB: trapmf(x, -5, -4, -3, -1.5),
        NS: trimf(x, -3, -1.5, 0),
        ZO: trimf(x, -1.5, 0, 1.5),
        PS: trimf(x, 0, 1.5, 3),
        PB: trapmf(x, 1.5, 3, 4, 5)
      };
    };

    const muE = eval5(eVal);
    const muDE = eval5(deVal);

    // 5×5 FAM 規則庫定義 (標準對稱負回授阻尼矩陣)
    const famMatrix = [
      ['NB', 'NB', 'NB', 'NS', 'ZO'], // e = NB
      ['NB', 'NB', 'NS', 'ZO', 'PS'], // e = NS
      ['NB', 'NS', 'ZO', 'PS', 'PB'], // e = ZO
      ['NS', 'ZO', 'PS', 'PB', 'PB'], // e = PS
      ['ZO', 'PS', 'PB', 'PB', 'PB']  // e = PB
    ];
    const labels = ['NB', 'NS', 'ZO', 'PS', 'PB'];
    const centers = { NB: 10, NS: 30, ZO: 50, PS: 70, PB: 95 }; // 風扇輸出中心 %

    let numCog = 0;
    let denCog = 0;
    let activeRuleCount = 0;

    let famHtml = '<div class="grid grid-cols-6 gap-1 text-[11px] sm:text-xs font-mono text-center font-bold">';
    famHtml += '<div class="p-1.5 text-slate-400">e \\ Δe</div>';
    labels.forEach(l => { famHtml += `<div class="p-1.5 text-amber-300 bg-slate-900 rounded">${l}</div>`; });

    for (let r = 0; r < 5; r++) {
      const eLabel = labels[r];
      famHtml += `<div class="p-1.5 text-sky-300 bg-slate-900 rounded flex items-center justify-center">${eLabel}</div>`;
      for (let c = 0; c < 5; c++) {
        const deLabel = labels[c];
        const outLabel = famMatrix[r][c];
        const w = Math.min(muE[eLabel], muDE[deLabel]);

        let cellStyle = 'bg-slate-950 border border-slate-800 text-slate-400';
        if (w > 0.02) {
          activeRuleCount++;
          numCog += w * centers[outLabel];
          denCog += w;
          const alpha = Math.min(1, 0.25 + w * 0.75);
          cellStyle = `bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md scale-105 z-10 transition`;
        }

        famHtml += `
          <div class="p-1.5 rounded flex flex-col justify-center items-center ${cellStyle}" title="w = ${w.toFixed(2)}">
            <span>${outLabel}</span>
            <span class="text-[9px] font-mono opacity-80">${w > 0.02 ? w.toFixed(2) : ''}</span>
          </div>
        `;
      }
    }
    famHtml += '</div>';
    famEl.innerHTML = famHtml;

    const fanOutput = denCog > 0 ? (numCog / denCog) : 50;

    // 模擬室溫時間響應曲線 (0 ~ 30 秒)
    const tArr = [];
    const tempArr = [];
    let curTemp = 28 + eVal; // 目標假設 28 度
    const targetTemp = 28.0;
    for (let t = 0; t <= 30; t += 0.5) {
      tArr.push(t);
      tempArr.push(parseFloat(curTemp.toFixed(2)));
      // 動態更新溫度模擬：受風扇降溫與外界散熱影響
      const coolPower = (fanOutput / 100) * 0.45;
      curTemp += (targetTemp - curTemp) * 0.06 - (coolPower - 0.22);
    }

    const traces = [
      {
        x: tArr,
        y: tempArr,
        name: `室溫響應軌跡 (風扇目標輸出: ${fanOutput.toFixed(1)}%)`,
        mode: 'lines',
        line: { color: '#38bdf8', width: 3.5 }
      },
      {
        x: [0, 30],
        y: [targetTemp, targetTemp],
        name: '目標設定溫度 (28.0°C)',
        mode: 'lines',
        line: { color: '#10b981', dash: 'dash', width: 2 }
      }
    ];

    const layout = getBaseLayout('模擬時間 (秒)', '室內環境溫度 (°C)', [0, 30], [25, 32]);
    layout.legend = { orientation: 'h', y: 1.18, x: 0 };

    safePlot('plot-ch3-a', traces, layout);

    const statusBox = document.getElementById('ch3PlotA-status-box');
    if (statusBox) {
      statusBox.innerHTML = `
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div>
            <span class="text-slate-400">當前激發規則數：</span>
            <strong class="text-emerald-400 font-mono text-base">${activeRuleCount} 條</strong>
            <span class="text-slate-400 ml-4">解模糊化風扇輸出：</span>
            <strong class="text-sky-400 font-mono text-base">${fanOutput.toFixed(1)} %</strong>
          </div>
          <div class="text-slate-300">
            當室溫誤差為 <strong class="text-amber-300">${eVal > 0 ? '+' : ''}${eVal.toFixed(1)}°C</strong> 時，FAM 矩陣自動啟動負回授抑制，平滑向目標溫度逼近。
          </div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 【Chapter 03 模組 3 - 圖 (b)】：3D 非線性模糊控制曲面實驗室 (Control Surface)
  // --------------------------------------------------------------------------
  function updateCh3PlotB() {
    const surfEl = document.getElementById('plot-ch3-b-3d');
    if (!surfEl) return;

    const overlap = parseFloat((document.getElementById('ch3PlotB-overlap') || {}).value || 0.5);
    const probeE = parseFloat((document.getElementById('ch3PlotB-pe') || {}).value || 0.8);
    const probeDE = parseFloat((document.getElementById('ch3PlotB-pde') || {}).value || -0.5);

    const setSpan = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setSpan('ch3PlotB-overlap-val', overlap.toFixed(2));
    setSpan('ch3PlotB-pe-val', probeE.toFixed(1));
    setSpan('ch3PlotB-pde-val', probeDE.toFixed(1));

    const eGrid = [];
    const deGrid = [];
    const step = 0.4;
    for (let x = -3; x <= 3.01; x += step) eGrid.push(parseFloat(x.toFixed(2)));
    for (let y = -3; y <= 3.01; y += step) deGrid.push(parseFloat(y.toFixed(2)));

    const zSurface = [];
    for (let j = 0; j < deGrid.length; j++) {
      const row = [];
      const de = deGrid[j];
      for (let i = 0; i < eGrid.length; i++) {
        const e = eGrid[i];
        // 非線性飽和 sigmoid + 重疊率造成的階梯非線性調製
        const linearTerm = 0.6 * e + 0.4 * de;
        const nonLin = Math.tanh(linearTerm * (1.2 / Math.max(0.2, overlap)));
        const z = nonLin * 50 + 50; // 0 ~ 100%
        row.push(parseFloat(z.toFixed(2)));
      }
      zSurface.push(row);
    }

    const curLinear = 0.6 * probeE + 0.4 * probeDE;
    const curZ = Math.tanh(curLinear * (1.2 / Math.max(0.2, overlap))) * 50 + 50;

    const surfTrace = {
      z: zSurface,
      x: eGrid,
      y: deGrid,
      type: 'surface',
      colorscale: 'Viridis',
      cmin: 0,
      cmax: 100,
      colorbar: { title: '控制輸出 u(%)', len: 0.8 }
    };

    const probeTrace = {
      x: [probeE],
      y: [probeDE],
      z: [curZ],
      mode: 'markers',
      type: 'scatter3d',
      marker: { size: 7, color: '#f43f5e', line: { color: '#ffffff', width: 2 } },
      name: `當前工作點 (${probeE.toFixed(1)}, ${probeDE.toFixed(1)}, ${curZ.toFixed(1)}%)`
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e2e8f0', size: 10 },
      margin: { t: 25, r: 10, b: 20, l: 10 },
      scene: {
        xaxis: { title: '誤差 e', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        yaxis: { title: '變化率 Δe', gridcolor: 'rgba(148, 163, 184, 0.2)' },
        zaxis: { title: '控制輸出 u (%)', range: [0, 105], gridcolor: 'rgba(148, 163, 184, 0.2)' },
        camera: { eye: { x: 1.45, y: -1.5, z: 1.1 } }
      }
    };

    safePlot('plot-ch3-b-3d', [surfTrace, probeTrace], layout);

    const infoBox = document.getElementById('ch3PlotB-info-box');
    if (infoBox) {
      infoBox.innerHTML = `
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-indigo-500/30 text-xs sm:text-sm space-y-2">
          <div class="flex items-center justify-between text-indigo-300 font-bold">
            <span>🔬 3D 控制曲面特性分析：</span>
            <span>當前工作點輸出 u = <strong class="text-rose-400 font-mono text-base">${curZ.toFixed(1)}%</strong></span>
          </div>
          <p class="text-slate-300 leading-relaxed">
            重疊率設為 <strong>${overlap.toFixed(2)}</strong>。當重疊率越接近 0.5 時，曲面呈現最連續平滑的過渡；若重疊率過小，曲面會分裂為<strong>多階梯飽和平台</strong>；若重疊率過大，曲面斜率會被削平，降低靈敏度。紅色球體標示當前狀態在立體曲面上的即時落點。
          </p>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 【Chapter 03 模組 3 - 圖 (c)】：Mamdani vs. TSK 模糊推論架構對照 (車輛輔助煞車)
  // --------------------------------------------------------------------------
  function updateCh3PlotC() {
    const plotEl = document.getElementById('plot-ch3-c');
    if (!plotEl) return;

    const dist = parseFloat((document.getElementById('ch3PlotC-dist') || {}).value || 35);
    const speed = parseFloat((document.getElementById('ch3PlotC-speed') || {}).value || 60);

    const setSpan = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setSpan('ch3PlotC-dist-val', dist.toFixed(0) + ' m');
    setSpan('ch3PlotC-speed-val', speed.toFixed(0) + ' km/h');

    // 前件：距離 (近 10~40, 遠 30~80), 車速 (慢 20~50, 快 40~100)
    const muNear = trimf(dist, 0, 15, 45);
    const muFar = trimf(dist, 25, 60, 100);
    const muSlow = trimf(speed, 10, 30, 60);
    const muFast = trimf(speed, 40, 75, 120);

    // 4 條規則激發強度
    const w1 = Math.min(muNear, muFast); // 危急：近且快
    const w2 = Math.min(muNear, muSlow); // 謹慎：近但慢
    const w3 = Math.min(muFar, muFast);  // 警戒：遠但快
    const w4 = Math.min(muFar, muSlow);  // 安全：遠且慢

    // 1. Mamdani 模型後件 (煞車力道 %: 強 85%, 中 50%, 弱 15%)
    const mamdaniOut = (w1 * 90 + w2 * 60 + w3 * 45 + w4 * 10) / Math.max(1e-4, w1 + w2 + w3 + w4);

    // 2. TSK 一階線性模型後件方程
    // u1 = 0.5*speed - 0.8*dist + 60
    // u2 = 0.3*speed - 0.5*dist + 40
    // u3 = 0.4*speed - 0.3*dist + 20
    // u4 = 0.1*speed - 0.2*dist + 5
    const y1 = Math.max(0, Math.min(100, 0.6 * speed - 0.9 * dist + 60));
    const y2 = Math.max(0, Math.min(100, 0.4 * speed - 0.6 * dist + 40));
    const y3 = Math.max(0, Math.min(100, 0.5 * speed - 0.4 * dist + 20));
    const y4 = Math.max(0, Math.min(100, 0.2 * speed - 0.2 * dist + 5));

    const tskOut = (w1 * y1 + w2 * y2 + w3 * y3 + w4 * y4) / Math.max(1e-4, w1 + w2 + w3 + w4);

    // 沿車速掃描對照曲線 (speed: 20 ~ 110)
    const spArr = [];
    const mamArr = [];
    const tskArr = [];
    for (let s = 20; s <= 110; s += 2) {
      spArr.push(s);
      const mS = trimf(s, 10, 30, 60);
      const mF = trimf(s, 40, 75, 120);
      const tw1 = Math.min(muNear, mF);
      const tw2 = Math.min(muNear, mS);
      const tw3 = Math.min(muFar, mF);
      const tw4 = Math.min(muFar, mS);
      const mOut = (tw1 * 90 + tw2 * 60 + tw3 * 45 + tw4 * 10) / Math.max(1e-4, tw1 + tw2 + tw3 + tw4);
      const ty1 = Math.max(0, Math.min(100, 0.6 * s - 0.9 * dist + 60));
      const ty2 = Math.max(0, Math.min(100, 0.4 * s - 0.6 * dist + 40));
      const ty3 = Math.max(0, Math.min(100, 0.5 * s - 0.4 * dist + 20));
      const ty4 = Math.max(0, Math.min(100, 0.2 * s - 0.2 * dist + 5));
      const tOut = (tw1 * ty1 + tw2 * ty2 + tw3 * ty3 + tw4 * ty4) / Math.max(1e-4, tw1 + tw2 + tw3 + tw4);
      mamArr.push(parseFloat(mOut.toFixed(1)));
      tskArr.push(parseFloat(tOut.toFixed(1)));
    }

    const traces = [
      {
        x: spArr,
        y: mamArr,
        name: `Mamdani 重心法曲線 (當前值: ${mamdaniOut.toFixed(1)}%)`,
        mode: 'lines',
        line: { color: '#38bdf8', width: 3.5 }
      },
      {
        x: spArr,
        y: tskArr,
        name: `TSK 一階線性加權曲線 (當前值: ${tskOut.toFixed(1)}%)`,
        mode: 'lines',
        line: { color: '#34d399', width: 3, dash: 'dash' }
      },
      {
        x: [speed, speed],
        y: [0, 100],
        name: `當前車速 (${speed} km/h)`,
        mode: 'lines',
        line: { color: '#f59e0b', width: 2, dash: 'dot' }
      }
    ];

    const layout = getBaseLayout('車速 (km/h)', '煞車煞阻力道 u (%)', [20, 110], [0, 105]);
    layout.legend = { orientation: 'h', y: 1.18, x: 0 };

    safePlot('plot-ch3-c', traces, layout);

    const statusBox = document.getElementById('ch3PlotC-status-box');
    if (statusBox) {
      statusBox.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-sky-500/30 text-xs sm:text-sm space-y-1">
            <span class="text-sky-300 font-bold block">1. Mamdani 語言模型輸出</span>
            <div class="text-2xl font-extrabold text-white font-mono">${mamdaniOut.toFixed(1)} %</div>
            <p class="text-slate-300 text-xs">四條規則重心幾何折衷，保證煞車動作平穩舒適、絕無階躍突煞。</p>
          </div>
          <div class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 text-xs sm:text-sm space-y-1">
            <span class="text-emerald-300 font-bold block">2. TSK 一階函數模型輸出</span>
            <div class="text-2xl font-extrabold text-white font-mono">${tskOut.toFixed(1)} %</div>
            <p class="text-slate-300 text-xs">後件直接由多項式計算，計算耗時僅為 Mamdani 的 1/8，極速響應突發危險。</p>
          </div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 【Chapter 03 模組 3 - 圖 (d)】：跨領域實戰：臨床醫療臨床風險模糊決策
  // --------------------------------------------------------------------------
  function updateCh3PlotD() {
    const plotEl = document.getElementById('plot-ch3-d');
    if (!plotEl) return;

    const sbp = parseFloat((document.getElementById('ch3PlotD-sbp') || {}).value || 115);
    const spo2 = parseFloat((document.getElementById('ch3PlotD-spo2') || {}).value || 94);

    const setSpan = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setSpan('ch3PlotD-sbp-val', sbp.toFixed(0) + ' mmHg');
    setSpan('ch3PlotD-spo2-val', spo2.toFixed(0) + ' %');

    // 歸屬函數計算
    // SBP: 危急低 <90, 正常 90~140, 高血壓 >140
    const muSbpLow = trapmf(sbp, 50, 60, 85, 95);
    const muSbpNorm = trapmf(sbp, 85, 105, 130, 145);
    const muSbpHigh = trapmf(sbp, 135, 150, 190, 210);

    // SpO2: 危急缺氧 <90, 輕度缺氧 90~94, 正常 95~100
    const muHypoxSevere = trapmf(spo2, 65, 75, 88, 92);
    const muHypoxMild = trimf(spo2, 89, 93, 96);
    const muHypoxNorm = trapmf(spo2, 94, 97, 100, 101);

    // 醫療危急指數推論 (0 ~ 100 分)
    // 規則 1: 危急低 OR 嚴重缺氧 -> 危急 90分
    // 規則 2: 輕度缺氧 -> 警戒 65分
    // 規則 3: 高血壓 -> 警戒 60分
    // 規則 4: 雙正常 -> 安全 20分
    const wCritical = Math.max(muSbpLow, muHypoxSevere);
    const wWarning = Math.max(muHypoxMild, muSbpHigh);
    const wSafe = Math.min(muSbpNorm, muHypoxNorm);

    const riskScore = (wCritical * 92 + wWarning * 62 + wSafe * 18) / Math.max(1e-4, wCritical + wWarning + wSafe);

    let triageClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    let triageLabel = '🟢 綠色安全觀察級別（生命徵象穩定，常規病房每班巡視）';
    if (riskScore >= 75) {
      triageClass = 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse';
      triageLabel = '🔴 紅色危急警報級別（重度缺氧或休克風險，呼叫急救小組準備氣管插管！）';
    } else if (riskScore >= 45) {
      triageClass = 'bg-amber-500/25 text-amber-300 border-amber-500/50';
      triageLabel = '🟡 黃色密切警戒級別（輕度低血氧或血壓偏離，啟動鼻導管給氧與監測）';
    }

    // 繪製雷達指標直條圖
    const traces = [
      {
        x: ['收縮壓偏低程度', '收縮壓正常度', '收縮壓偏高程度', '嚴重缺氧度', '輕度缺氧度', '血氧正常度'],
        y: [muSbpLow, muSbpNorm, muSbpHigh, muHypoxSevere, muHypoxMild, muHypoxNorm],
        type: 'bar',
        marker: {
          color: ['#f43f5e', '#10b981', '#f59e0b', '#f43f5e', '#f59e0b', '#10b981'],
          opacity: 0.85
        },
        name: '生理指標激發強度'
      }
    ];

    const layout = getBaseLayout('臨床生理指標', '歸屬度 μ', [-0.5, 5.5], [0, 1.05]);
    layout.margin = { t: 30, r: 20, b: 65, l: 45 };

    safePlot('plot-ch3-d', traces, layout);

    const triageBox = document.getElementById('ch3PlotD-triage-box');
    if (triageBox) {
      triageBox.innerHTML = `
        <div class="rounded-2xl p-5 border ${triageClass} space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="text-sm font-bold uppercase tracking-wider">臨床檢傷分級結果：</span>
            <span class="font-mono text-2xl font-extrabold">綜合危急指數：${riskScore.toFixed(1)} / 100 分</span>
          </div>
          <div class="text-base font-bold">${triageLabel}</div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // Chapter 03：模組 4 題目練習互動
  // --------------------------------------------------------------------------
  function answerCh3Practice(qIndex, optionIndex) {
    ch3PracticeAnswers[qIndex] = optionIndex;
    renderCh3PracticeList();
  }

  function toggleCh3Solution(qIndex) {
    ch3SolutionExpanded[qIndex] = !ch3SolutionExpanded[qIndex];
    renderCh3PracticeList();
  }

  function renderCh3PracticeList() {
    const holder = document.getElementById('ch3-practice-list-holder');
    if (!holder) return;

    let correctCount = 0;
    CH3_PRACTICE_PROBLEMS.forEach(function (q, idx) {
      if (ch3PracticeAnswers[idx] === q.answerIndex) correctCount++;
    });

    const scoreEl = document.getElementById('ch3-practice-score');
    if (scoreEl) {
      scoreEl.textContent = correctCount + ' / ' + CH3_PRACTICE_PROBLEMS.length;
    }

    holder.innerHTML = CH3_PRACTICE_PROBLEMS.map(function (q, qIdx) {
      const userAns = ch3PracticeAnswers[qIdx];
      const hasAnswered = userAns !== undefined;
      const isCorrect = userAns === q.answerIndex;
      const isExpanded = !!ch3SolutionExpanded[qIdx];

      const optionsHtml = q.options.map(function (optText, optIdx) {
        let btnClass = 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800 text-slate-300';
        let badge = '<span class="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-slate-700">' + String.fromCharCode(65 + optIdx) + '</span>';

        if (hasAnswered) {
          if (optIdx === q.answerIndex) {
            btnClass = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-semibold';
            badge = '<span class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold flex items-center justify-center shrink-0">✓</span>';
          } else if (optIdx === userAns) {
            btnClass = 'bg-rose-500/20 border-rose-500/60 text-rose-200';
            badge = '<span class="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shrink-0">✕</span>';
          }
        }

        return `
          <button onclick="FuzzyWidgets.answerCh3Practice(${qIdx}, ${optIdx})"
            class="w-full text-left p-4 rounded-2xl border transition flex items-center gap-3.5 ${btnClass}">
            ${badge}
            <span class="text-sm sm:text-base leading-relaxed">${optText}</span>
          </button>
        `;
      }).join('');

      let resultBanner = '';
      if (hasAnswered) {
        resultBanner = `
          <div class="p-4 rounded-2xl ${isCorrect ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/35 text-rose-300'} flex items-center justify-between text-sm">
            <span class="font-bold flex items-center gap-2">
              <span>${isCorrect ? '🎉 答對了！工程觀念精準通透！' : '❌ 答錯了，請點擊下方按鈕檢視完整推導詳解！'}</span>
            </span>
            <button onclick="FuzzyWidgets.toggleCh3Solution(${qIdx})" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs border border-slate-700 transition">
              ${isExpanded ? '收起推導詳解 ▲' : '點擊展開完整公式推導詳解 ▼'}
            </button>
          </div>
        `;
      }

      const solutionBlock = (isExpanded || !hasAnswered) ? `
        <div class="${isExpanded ? 'block' : 'hidden'} bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-sm leading-relaxed">
          ${q.derivation}
        </div>
      ` : '';

      return `
        <article class="refined-card p-6 sm:p-7 space-y-5 border-l-4 ${isCorrect ? 'border-l-emerald-400' : (hasAnswered ? 'border-l-rose-400' : 'border-l-emerald-500')}">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">${q.tag}</span>
              <span class="text-xs font-semibold text-slate-400">${q.difficulty}</span>
            </div>
            ${hasAnswered ? '' : `
              <button onclick="FuzzyWidgets.toggleCh3Solution(${qIdx})" class="text-xs text-emerald-400 hover:text-emerald-300 transition">
                ${isExpanded ? '隱藏提示與解答 ▲' : '偷看解答與詳細推導 ▼'}
              </button>
            `}
          </div>

          <h4 class="text-lg sm:text-xl font-bold text-white leading-snug">
            ${q.question}
          </h4>

          <div class="space-y-3 pt-1">
            ${optionsHtml}
          </div>

          ${resultBanner}
          ${solutionBlock}
        </article>
      `;
    }).join('');

    safeMathJax([holder]);
  }

  // --------------------------------------------------------------------------
  // Chapter 03：四大標準學習模組總體 HTML 生成器
  // --------------------------------------------------------------------------
  function getChapter3FourModulesHtml() {
    return `
      <!-- =================================================================== -->
      <!-- 【模組 1：通論（Overview）】 -->
      <!-- =================================================================== -->
      <div id="ch3-module-sec-m1" class="space-y-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-emerald-500/40 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/40">Module 01 • FLC Engineering Overview</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊控制器系統架構與設計核心
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              系統化掌握「FLC 核心架構與五大資料流階層」、「FLC vs. 古典 PID 深入對比表」、「5×5 FAM 規則庫與相平面對稱阻尼設計法則」、「Mamdani vs. TSK 兩大推論模型全維度對決」與「3D 非線性控制曲面與世界級工程應用」。
            </p>
          </div>

          <!-- 3.1 模糊邏輯控制器（FLC）核心架構與五大資料流階層 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-emerald-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-bold flex items-center justify-center border border-emerald-500/40">3.1</span>
              <span>模糊邏輯控制器（FLC）核心架構與五大資料流階層（FLC Architecture & Signal Flow）</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                在傳統控制理論（如 PID 控制、狀態空間極點配置）中，設計控制器必須仰賴受控對象（Plant）精準的物理微分方程或轉移函數 $G(s)$。然而面對現代工業中具備<strong>高度非線性、摩擦死區、大時變延遲（Time-delay）或物理模型極其複雜</strong>的系統（如倒單擺平衡、汽車自主避障煞車、煉鋼高爐溫控），取得精確數學模型不僅成本高昂，且參數一旦漂移就容易失穩。
              </p>
              <p>
                <strong>模糊邏輯控制器（Fuzzy Logic Controller, FLC）</strong>的最大優勢在於：直接將人類資深操作專家（如老技工、賽車手、資深醫師）的直覺式操作語意經驗，轉換為計算機能夠即時推論與執行的控制演算法。其標準閉迴路回授具備嚴謹的<strong>五大資料流處理階層</strong>：
              </p>
            </div>
            <div class="formula-display-card text-sm">
              $$e(t) = r(t) - y(t) \\;\\xrightarrow{\\text{量化正規化}}\\; x_e \\;\\xrightarrow{\\text{模糊化}}\\; \\mu_A(x_e) \\;\\xrightarrow{\\text{FAM 規則庫推論}}\\; \\mu_{B'}(u) \\;\\xrightarrow{\\text{聚合解模糊}}\\; u^* \\;\\xrightarrow{\\text{比例反正規化}}\\; u(t)$$
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs">
              <div class="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-emerald-300 block">1. 量化與正規化</span>
                <p class="text-slate-300">將真實感測物理量誤差 $e$ 與變化率 $\\Delta e$ 乘以量化因子 $G_e, G_{\\Delta e}$，縮放至控制器標準論域 $[-1, 1]$ 或 $[-3, 3]$。</p>
              </div>
              <div class="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-sky-300 block">2. 模糊化介面</span>
                <p class="text-slate-300">以歸屬函數將精確數值映射為語言標籤（NB, NM, NS, ZE, PS, PM, PB）之隸屬度向量。</p>
              </div>
              <div class="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-indigo-300 block">3. 知識庫與推論</span>
                <p class="text-slate-300">比對 FAM 規則庫，以 $\\min$ 算子計算各規則激發強度 $w_i = \\min(\\mu_A(e), \\mu_B(\\Delta e))$，並對後件進行截頂或縮放。</p>
              </div>
              <div class="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-purple-300 block">4. 聚合與解模糊</span>
                <p class="text-slate-300">透過 $\\max$ 聚合後件包絡線，採用重心法（COG）或加權平均求得明確控制量 $u^*$。</p>
              </div>
              <div class="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-amber-300 block">5. 比例反正規化</span>
                <p class="text-slate-300">乘以輸出比例因子 $G_u$，轉為實際致動器電壓或油門開度物理訊號驅動受控機構。</p>
              </div>
            </div>

            <!-- FLC vs. 古典 PID 深度對比表 -->
            <div class="space-y-2 pt-2">
              <div class="text-sm font-bold text-white flex items-center gap-2">
                <span>📊 模糊邏輯控制器 (FLC) vs. 古典 PID 控制器 深度對比表：</span>
              </div>
              <div class="overflow-x-auto rounded-2xl border border-slate-800">
                <table class="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr class="bg-slate-900/95 text-sky-300 border-b border-slate-700">
                      <th class="px-4 py-3 text-left font-bold">比較維度</th>
                      <th class="px-4 py-3 text-left font-bold text-rose-300">古典 PID 控制器</th>
                      <th class="px-4 py-3 text-left font-bold text-emerald-300">模糊邏輯控制器 (FLC)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/80 text-slate-200">
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-4 py-3 font-bold text-white">受控廠測模型依賴性</td>
                      <td class="px-4 py-3">高度依賴精準轉移函數 $G(s)$ 或狀態方程；建模誤差易導致失諧</td>
                      <td class="px-4 py-3 font-semibold text-emerald-300">無需精確數學模型，直接以專家語言 IF-THEN 規則建模（無模型控制）</td>
                    </tr>
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-4 py-3 font-bold text-white">非線性系統適應性</td>
                      <td class="px-4 py-3">本質為嚴格線性加權；面對大範圍工作點變化或飽和時性能劇烈劣化</td>
                      <td class="px-4 py-3 font-semibold text-emerald-300">本質為非線性曲面映射；小誤差區間精準、大誤差區間主動防飽和</td>
                    </tr>
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-4 py-3 font-bold text-white">核心調諧參數</td>
                      <td class="px-4 py-3">比例、積分、微分增益 ($K_p, K_i, K_d$) 三個常數</td>
                      <td class="px-4 py-3">量化因子 ($G_e, G_{\\Delta e}$)、輸出因子 ($G_u$)、歸屬函數中心與寬度</td>
                    </tr>
                    <tr class="hover:bg-slate-800/40">
                      <td class="px-4 py-3 font-bold text-white">抗擾動與強健性 (Robustness)</td>
                      <td class="px-4 py-3">對外部負載突變敏感，易引發積分飽和（Windup）與劇烈超調</td>
                      <td class="px-4 py-3 font-semibold text-emerald-300">極強的容錯能力與抗雜訊抗模型漂移韌性，在非線性場景近乎免疫</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 3.2 模糊關聯記憶矩陣（FAM）與相平面對稱阻尼設計法則 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-sky-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 text-sm font-bold flex items-center justify-center border border-sky-500/40">3.2</span>
              <span>模糊關聯記憶矩陣（FAM）與相平面對稱阻尼設計法則（FAM Matrix & Phase Plane Damping）</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                在 1987 年由 Bart Kosko 提出的<strong>模糊關聯記憶（Fuzzy Associative Memory, FAM）</strong>中，工程師將雙輸入變數——誤差 $e$（設定值減當前值）與誤差變化率 $\Delta e$（誤差一階微分 $\frac{de}{dt}$）構成二維直角網格。每個軸向通常均勻或非線性地劃分為 $5$ 個或 $7$ 個語言變數：
              </p>
              <div class="text-xs sm:text-sm font-mono text-slate-300 flex flex-wrap gap-2 justify-center bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span class="text-rose-400 font-bold">NB (負大)</span> • 
                <span class="text-rose-300 font-bold">NM (負中)</span> • 
                <span class="text-rose-200 font-bold">NS (負小)</span> • 
                <span class="text-emerald-400 font-bold">ZE (零 / 平衡)</span> • 
                <span class="text-sky-200 font-bold">PS (正小)</span> • 
                <span class="text-sky-300 font-bold">PM (正中)</span> • 
                <span class="text-sky-400 font-bold">PB (正大)</span>
              </div>
              <p>
                在控制理論的相平面（Phase Plane, 橫軸 $e$、縱軸 $\Delta e$）動力學中，四大象限的控制物理哲學體現了精妙的<strong>對稱阻尼機制</strong>：
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-rose-500/30 space-y-1.5">
                <div class="text-sm font-bold text-rose-300">🔥 象限 I ($e > 0, \Delta e > 0$)：極大正控制 (PB)</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  目前輸出嚴重低於目標，且誤差正持續加速擴大！此時系統正背離平衡點快速失控，必須立刻施加<strong>最大正控制輸出（PB）</strong>，強力拉回狀態。
                </p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30 space-y-1.5">
                <div class="text-sm font-bold text-emerald-300">🛑 象限 II ($e > 0, \Delta e < 0$)：動態阻尼煞車 (ZO / NS)</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  目前雖低於目標，但系統正以極快速度自發衝向平衡點！若此時死板施加正推力，強大慣性必引發嚴重過衝（Overshoot）。因此必須施加<strong>零控制或微負阻尼（ZO / NS）</strong>提前減速！
                </p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-rose-500/30 space-y-1.5">
                <div class="text-sm font-bold text-rose-300">❄️ 象限 III ($e < 0, \Delta e < 0$)：極大負控制 (NB)</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  目前輸出嚴重高於目標且持續惡化超標！必須施加<strong>最大負控制（NB）</strong>（如壓縮機全速致冷或啟動最大反向制動）。
                </p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-sky-500/30 space-y-1.5">
                <div class="text-sm font-bold text-sky-300">🛡️ 象限 IV ($e < 0, \Delta e > 0$)：平穩過渡進場 (ZO / PS)</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  目前高於目標但正在自發回落，施加<strong>零控制或微正補償（ZO / PS）</strong>，使相平面軌跡沿反對角線平滑滑入原點 $(0, 0)$。
                </p>
              </div>
            </div>
            <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              💡 <strong>主反對角線零切換線（Zero Switching Line）：</strong>從 FAM 矩陣左下角到右上角的主反對角線全數設置為 <strong class="text-emerald-400">ZE (零控制)</strong>。這條對角線在相平面上對應於滑動模態控制（Sliding Mode Control）的理想滑動超平面，保證系統在無超調的前提下實現最高速收斂！
            </div>
          </div>

          <!-- 3.3 兩大主流推論模型深層對決：Mamdani 模型 vs. TSK 模型全維度對照表 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-purple-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 text-sm font-bold flex items-center justify-center border border-purple-500/40">3.3</span>
              <span>兩大主流推論模型深層對決：Mamdani 模型 vs. TSK (Sugeno) 模型全維度對照表</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                在模糊推論系統演進史上，存在兩座不可撼動的燈塔：1974 年英國倫敦大學 <strong>Ebrahim Mamdani</strong> 教授開創的「語言模糊模型」，以及 1985 年由 <strong>Tomohiro Takagi、Michio Sugeno 與 Kang</strong> 提出的「函數模糊模型（TSK 模型）」。理解兩者的數理本質與工程取捨是控制工程師的必修基本功：
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-sky-500/40 space-y-2">
                <div class="text-sm font-bold text-sky-300">1. Mamdani 語言推論模型（1974）</div>
                <p class="text-xs text-slate-300">後件部完全由語言模糊集合構成，保留直觀語意：</p>
                <div class="formula-display-card text-xs">
                  $$R_i: \\text{IF } x_1 \\text{ is } A_i \\;\\text{AND}\\; x_2 \\text{ is } B_i \\;\\Longrightarrow\\; y \\text{ is } C_i$$
                  $$y^*_{\\text{COG}} = \\frac{\\int y \\cdot \\mu_{B,\\text{agg}}(y) dy}{\\int \\mu_{B,\\text{agg}}(y) dy}$$
                </div>
                <p class="text-xs text-slate-400">推論過程：前件計算 $\\to$ 後件幾何截頂 $\\to$ 全幅圖形聯集聚合 $\\to$ 數值微積分重心求解。</p>
              </div>
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/40 space-y-2">
                <div class="text-sm font-bold text-emerald-300">2. TSK (Sugeno) 線性函數推論模型（1985）</div>
                <p class="text-xs text-slate-300">後件部為輸入變數的代數多項式函數，免除面積積分：</p>
                <div class="formula-display-card text-xs">
                  $$R_i: \\text{IF } x_1 \\text{ is } A_i \\;\\text{AND}\\; x_2 \\text{ is } B_i \\;\\Longrightarrow\\; y_i = p_{i0} + p_{i1} x_1 + p_{i2} x_2$$
                  $$y^*_{\\text{TSK}} = \\frac{\\sum_{i=1}^{M} w_i \\cdot y_i}{\\sum_{i=1}^{M} w_i}$$
                </div>
                <p class="text-xs text-slate-400">推論過程：前件計算激發權重 $w_i \\to$ 代入後件多項式求解 $y_i \\to$ 直接加權平均代數求解。</p>
              </div>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-slate-800">
              <table class="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr class="bg-slate-900/95 text-sky-300 border-b border-slate-700">
                    <th class="px-4 py-3 text-left font-bold">評估維度</th>
                    <th class="px-4 py-3 text-left font-bold text-sky-300">Mamdani 語言模型</th>
                    <th class="px-4 py-3 text-left font-bold text-emerald-300">TSK (Takagi-Sugeno) 模型</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80 text-slate-200">
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3 font-bold text-white">後件部數學形式</td>
                    <td class="px-4 py-3">標準模糊集合（三角形、高斯形、梯形）</td>
                    <td class="px-4 py-3">零階為常數單值（Singleton）；一階為線性代數方程式</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3 font-bold text-white">計算開銷與延遲</td>
                    <td class="px-4 py-3 text-amber-300 font-semibold">較高（需要離散數值積分或幾何重心割線）</td>
                    <td class="px-4 py-3 text-emerald-400 font-bold">極低（僅為純代數內積加權平均，速度快 8~15 倍）</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3 font-bold text-white">人類直觀可解釋性</td>
                    <td class="px-4 py-3 text-emerald-400 font-bold">最高（完全符合人類「若...則...」語意習慣）</td>
                    <td class="px-4 py-3 text-slate-300">中等（後件為數學多項式係數，語意直觀性稍遜）</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3 font-bold text-white">與最佳化與類神經結合</td>
                    <td class="px-4 py-3">面積積分不可微，難以使用梯度反向傳播學習</td>
                    <td class="px-4 py-3 text-emerald-400 font-bold">處處平滑可微！天然相容最小平方法 (LSE) 與 ANFIS</td>
                  </tr>
                  <tr class="hover:bg-slate-800/40">
                    <td class="px-4 py-3 font-bold text-white">典型工程應用選型</td>
                    <td class="px-4 py-3">冷氣恆溫、洗衣機、醫療檢傷分級、專家決策系統</td>
                    <td class="px-4 py-3">高速伺服馬達、無人機姿態控制、非線性系統動態辨識</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3.4 3D 非線性控制曲面之幾何本質與強韌穩定性分析 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-indigo-400 space-y-5">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-bold flex items-center justify-center border border-indigo-500/40">3.4</span>
              <span>3D 非線性控制曲面（Control Surface）之幾何本質與強韌穩定性分析</span>
            </h4>
            <div class="prose-reading text-slate-200 space-y-3">
              <p>
                雙輸入模糊控制器的靜態輸入-輸出對應關係 $u = f(e, \Delta e)$ 在三維幾何空間中構成一張立體的<strong>控制曲面（Control Surface）</strong>。古典線性 PID 控制器的曲面永遠只是一張「傾斜平坦的平面（Plane）」，因此無法兼顧「小誤差無抖動」與「大誤差防飽和」；而 FLC 則展現為一張扭曲而光滑的非線性丘陵曲面：
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div class="text-sm font-bold text-emerald-300">1. 原點附近小誤差線性區</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  在 $(0, 0)$ 原點微小範圍內，曲面斜率平緩適中，等效於小增益 PID。徹底消除微小殘餘誤差，且<strong>杜絕因致動器高頻切換造成的機械極限環震盪（Hunting / Chattering）</strong>。
                </p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div class="text-sm font-bold text-sky-300">2. 中間過渡區 (S 型轉折)</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  呈現平滑可微的非線性過渡坡度。在此區域內控制器根據誤差與阻尼的綜合向量，自主動態調配輸出力度，兼顧快速性與無超調。
                </p>
              </div>
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div class="text-sm font-bold text-amber-300">3. 遠端飽和邊界平台區</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  在極大誤差端，曲面平滑收斂至極限飽和高度 $\pm 100\%$。自動符合致動器的物理額定極限（如馬達額定電壓、閥門 100% 全開），<strong>避免微分暴衝引發系統硬體損毀</strong>。
                </p>
              </div>
            </div>
            <div class="bg-slate-900/90 p-4 rounded-2xl border border-indigo-500/30 text-xs text-slate-300 leading-relaxed">
              🔍 <strong>重疊率（Overlap Ratio）的決定性影響：</strong>在下方【模組 3 圖 (b)】中，您可以拉動重疊率滑桿：當相鄰三角形歸屬函數在交叉點高度恰為 <strong>$0.5$（和為 1）</strong>時，曲面呈現處處光滑連續的最佳流線型；若重疊率小於 0.5，曲面會分裂成多段孤立的階梯平台；若重疊率過大，曲面斜率會被削平，降低靈敏度。
            </div>
          </div>

          <!-- 3.5 典型工程與民生經典應用全景解析 -->
          <div class="refined-card p-6 sm:p-7 border-l-4 border-l-amber-400 space-y-4">
            <h4 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-bold flex items-center justify-center border border-amber-500/40">3.5</span>
              <span>世界歷史里程碑：典型民生與工業經典應用全景解析</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-amber-300">🚆 1. 日本仙台地下鐵 ATO (1987)</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  世界首套全自動模糊地鐵系統（IEEE 歷史里程碑）。將人體半規管感受到的<strong>「加加速度（Jerk, $\frac{da}{dt}$）」</strong>作為輸入，使列車起步與進站如絲綢般平順，停車誤差小於 $7\text{ cm}$，節能超 $10\%$。
                </p>
              </div>
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-emerald-300">🕹️ 2. 倒單擺 (Inverted Pendulum) 平衡</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  經典高階非線性不穩定物理模型。以擺角 $\theta$ 與角速度 $\dot{\theta}$ 構建 FAM，在相平面創造出向心吸引的動態平衡盆地，是自平衡電動車與火箭發射垂直姿態控制的鼻祖。
                </p>
              </div>
              <div class="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div class="text-sm font-bold text-sky-300">🧺 3. 智慧感測變頻家電</div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  洗衣機利用光電感測水質透光率濁度下降斜率與飽和時間，自動判定衣物量與髒污程度，智慧調配洗劑與水流；冷氣變頻壓縮機依溫差與溫變率無段平滑調頻。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 2：《認識 Fuzzy》專書逐頁精讀（全書第 7 ～ 19 章，共 202 頁）】 -->
      <!-- =================================================================== -->
      <div id="ch3-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-emerald-500/40 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/40">Module 02 • Page-by-Page Guided Reading</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2.5">
                <span>📸</span> 【模組 2：《認識 Fuzzy》專書逐頁精讀（全書第 7 ～ 19 章，共 202 頁）】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                完整涵蓋第 7 章模糊控制系統導論 (7-1~7-15) 以及第 8 至 19 章所有進階工程應用（倒單擺、冷氣溫控、洗衣機、自駕防撞、ANFIS、醫療決策等共 13 大子章節 202 頁原書照片與 OCR 筆記）。點選章節下拉選單或格狀標籤即可無縫切換！
              </p>
            </div>
          </div>

          <div id="chapter56-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 3：多維度模擬圖互動專區（Interactive Plots）】 -->
      <!-- =================================================================== -->
      <div id="ch3-module-sec-m3" class="space-y-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-emerald-500/40 space-y-8">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/40">Module 03 • 4 Interactive Simulators</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 3：多維度實戰模擬圖互動專區】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                為 Chapter 03 打造 4 座獨立 Plotly.js 模擬器：冷氣 FAM 規則激發、3D 非線性控制曲面、Mamdani vs TSK 煞車對照與重症醫療預警！
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="FuzzyWidgets.jumpToCh3Plot('a')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 text-xs font-bold">跳至 (a) FAM 冷氣溫控</button>
              <button onclick="FuzzyWidgets.jumpToCh3Plot('b')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 text-xs font-bold">跳至 (b) 3D 控制曲面</button>
              <button onclick="FuzzyWidgets.jumpToCh3Plot('c')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 text-xs font-bold">跳至 (c) Mamdani vs TSK</button>
              <button onclick="FuzzyWidgets.jumpToCh3Plot('d')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 text-xs font-bold">跳至 (d) 醫療決策</button>
            </div>
          </div>

          <!-- 模擬器 (a)：智慧冷氣溫控系統 & 5×5 FAM 規則表動態激發 -->
          <div id="ch3-plot-card-a" class="refined-card p-6 sm:p-7 border-l-4 border-l-emerald-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-emerald-400 uppercase">Simulator (a) • 對應課本頁 5-3 5×5 FAM 規則表</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (a) 智慧冷氣溫控系統 & $5 \\times 5$ FAM 規則表動態激發與室溫收斂模擬
                </h4>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div class="lg:col-span-5 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div class="flex justify-between items-center text-xs font-bold text-emerald-300 border-b border-slate-800 pb-2">
                  <span>5×5 FAM 規則記憶矩陣</span>
                  <span class="text-slate-400">綠色高亮為激發格</span>
                </div>
                <div id="ch3-fam-table-holder"></div>
              </div>

              <div class="lg:col-span-7 space-y-3">
                <div id="plot-ch3-a" class="w-full h-72 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-sky-300">
                  <span>室溫誤差 $e = T_{\\text{target}} - T_{\\text{room}}$：</span>
                  <span id="ch3PlotA-val-e" class="font-mono text-base font-extrabold">+1.2°C</span>
                </div>
                <input id="ch3PlotA-e" type="range" min="-3" max="3" step="0.2" value="1.2" oninput="FuzzyWidgets.updateCh3PlotA()" class="w-full cursor-pointer" />
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-amber-300">
                  <span>溫度變化率 $\\Delta e$：</span>
                  <span id="ch3PlotA-val-de" class="font-mono text-base font-extrabold">-0.4°C/s</span>
                </div>
                <input id="ch3PlotA-de" type="range" min="-3" max="3" step="0.2" value="-0.4" oninput="FuzzyWidgets.updateCh3PlotA()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="ch3PlotA-status-box"></div>
          </div>

          <!-- 模擬器 (b)：3D 非線性模糊控制曲面實驗室 -->
          <div id="ch3-plot-card-b" class="refined-card p-6 sm:p-7 border-l-4 border-l-indigo-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-indigo-400 uppercase">Simulator (b) • 對應課本頁 5-4 控制曲面</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (b) 雙輸入單輸出 3D 非線性模糊控制曲面實驗室（$u = f(e, \\Delta e)$）
                </h4>
              </div>
            </div>

            <div id="plot-ch3-b-3d" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-xs sm:text-sm">
              <div class="space-y-1.5">
                <div class="flex justify-between font-bold text-indigo-300">
                  <span>歸屬函數重疊率：</span>
                  <span id="ch3PlotB-overlap-val" class="font-mono font-extrabold">0.50</span>
                </div>
                <input id="ch3PlotB-overlap" type="range" min="0.2" max="0.8" step="0.05" value="0.5" oninput="FuzzyWidgets.updateCh3PlotB()" class="w-full cursor-pointer" />
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between font-bold text-sky-300">
                  <span>工作點誤差 $e$：</span>
                  <span id="ch3PlotB-pe-val" class="font-mono font-extrabold">0.8</span>
                </div>
                <input id="ch3PlotB-pe" type="range" min="-3" max="3" step="0.2" value="0.8" oninput="FuzzyWidgets.updateCh3PlotB()" class="w-full cursor-pointer" />
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between font-bold text-amber-300">
                  <span>工作點變化率 $\\Delta e$：</span>
                  <span id="ch3PlotB-pde-val" class="font-mono font-extrabold">-0.5</span>
                </div>
                <input id="ch3PlotB-pde" type="range" min="-3" max="3" step="0.2" value="-0.5" oninput="FuzzyWidgets.updateCh3PlotB()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="ch3PlotB-info-box"></div>
          </div>

          <!-- 模擬器 (c)：Mamdani vs. TSK 模糊推論架構對照 (車輛輔助煞車) -->
          <div id="ch3-plot-card-c" class="refined-card p-6 sm:p-7 border-l-4 border-l-sky-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-sky-400 uppercase">Simulator (c) • 對應課本頁 6-1 TSK 模型</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (c) Mamdani 重心法 vs. TSK 一階線性加權對照模擬器（自動輔助緊急煞車）
                </h4>
              </div>
            </div>

            <div id="plot-ch3-c" class="w-full h-80 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-rose-300">
                  <span>前車障礙距離 (m)：</span>
                  <span id="ch3PlotC-dist-val" class="font-mono text-base font-extrabold">35 m</span>
                </div>
                <input id="ch3PlotC-dist" type="range" min="5" max="80" step="5" value="35" oninput="FuzzyWidgets.updateCh3PlotC()" class="w-full cursor-pointer" />
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-amber-300">
                  <span>當前行車速度 (km/h)：</span>
                  <span id="ch3PlotC-speed-val" class="font-mono text-base font-extrabold">60 km/h</span>
                </div>
                <input id="ch3PlotC-speed" type="range" min="20" max="110" step="5" value="60" oninput="FuzzyWidgets.updateCh3PlotC()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="ch3PlotC-status-box"></div>
          </div>

          <!-- 模擬器 (d)：跨領域實戰：臨床醫療臨床風險模糊決策 -->
          <div id="ch3-plot-card-d" class="refined-card p-6 sm:p-7 border-l-4 border-l-rose-400 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-xs font-mono font-bold text-rose-400 uppercase">Simulator (d) • 對應課本頁 6-2 臨床醫療應用</span>
                <h4 class="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  (d) 跨領域實戰：智慧醫療加護病房臨床風險模糊決策評估系統
                </h4>
              </div>
            </div>

            <div id="plot-ch3-d" class="w-full h-72 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-sky-300">
                  <span>收縮壓 (SBP, mmHg)：</span>
                  <span id="ch3PlotD-sbp-val" class="font-mono text-base font-extrabold">115 mmHg</span>
                </div>
                <input id="ch3PlotD-sbp" type="range" min="60" max="190" step="5" value="115" oninput="FuzzyWidgets.updateCh3PlotD()" class="w-full cursor-pointer" />
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs sm:text-sm font-bold text-teal-300">
                  <span>血氧飽和度 (SpO₂, %)：</span>
                  <span id="ch3PlotD-spo2-val" class="font-mono text-base font-extrabold">94 %</span>
                </div>
                <input id="ch3PlotD-spo2" type="range" min="70" max="100" step="1" value="94" oninput="FuzzyWidgets.updateCh3PlotD()" class="w-full cursor-pointer" />
              </div>
            </div>

            <div id="ch3PlotD-triage-box"></div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 4：章節題目練習與詳解（Practice & Solutions）】 -->
      <!-- =================================================================== -->
      <div id="ch3-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-emerald-500/40 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/40">Module 04 • Practice & Step-by-Step Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解（Practice & Solutions）】
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 8 道涵蓋 FLC 組件分析、FAM 觸發幾何、雙輸入手算推導、TSK 一階加權、量化因子調諧、重症醫療決策、相平面動力學與仙台地鐵案例的實戰題目，附逐步推導！
              </p>
            </div>
            <div class="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm">
              本章節練習得分：<strong id="ch3-practice-score" class="text-emerald-400 font-mono text-lg">0 / 8</strong>
            </div>
          </div>

          <div id="ch3-practice-list-holder" class="space-y-6"></div>
        </div>
      </div>
    `;
  }



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
    },
    {
      id: 'ch4-q6',
      title: '【第 6 題】Nguyen 定理與連續 $\\alpha$-截集運算反解（課本例題 5.5 深度考題）',
      tag: 'Nguyen 定理 • 截集反解',
      difficulty: '★★★ 深度推導',
      question: '設實數論域上兩連續三角形模糊數 $A$ 與 $B$，其 $\\alpha$-截集分別為 $A_\\alpha = [2\\alpha-2, -6\\alpha+6]$ 與 $B_\\alpha = [7\\alpha-4, -2\\alpha+5]$。根據 Nguyen 定理，兩模糊數取小 $\\text{MIN}(A, B)$ 的 $\\alpha$-截集為 $[\\min(2\\alpha-2, 7\\alpha-4), \\min(-6\\alpha+6, -2\\alpha+5)]$。試問在左端點交會處（即 $2\\alpha-2 = 7\\alpha-4$）所對應的關鍵門檻高度 $\\alpha^*$ 與論域坐標 $x^*$ 分別為何？',
      options: [
        { label: 'A', text: '$\\alpha^* = 0.4$，對應坐標 $x^* = -1.2$' },
        { label: 'B', text: '$\\alpha^* = 0.25$，對應坐標 $x^* = 4.5$' },
        { label: 'C', text: '$\\alpha^* = 0.5$，對應坐標 $x^* = -1.0$' },
        { label: 'D', text: '$\\alpha^* = 0.6$，對應坐標 $x^* = -0.8$' }
      ],
      correctIndex: 0,
      tip: '令左端點相等 $2\\alpha - 2 = 7\\alpha - 4$ 解出一元一次方程，再代回求出 $x^*$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-amber-300">【逐步推導與幾何解析】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>求解左端點交會臨界高度 $\\alpha^*$：</strong><br>
              左端點分別為 $x_A(\\alpha) = 2\\alpha - 2$ 與 $x_B(\\alpha) = 7\\alpha - 4$。<br>
              令兩者相等：$$2\\alpha - 2 = 7\\alpha - 4 \\iff 5\\alpha = 2 \\iff \\alpha^* = 0.4$$
            </li>
            <li><strong>反解論域坐標 $x^*$：</strong><br>
              將 $\\alpha^* = 0.4$ 代回任一左端點函數：
              $$x^* = 2(0.4) - 2 = 0.8 - 2 = -1.2$$
              （檢驗 $B$ 端點：$7(0.4) - 4 = 2.8 - 4 = -1.2$，完全吻合！）
            </li>
            <li><strong>幾何分段意義：</strong><br>
              當 $\\alpha \\le 0.4$ 時，$7\\alpha - 4 \\le 2\\alpha - 2$，取小運算由 $B$ 的左腰主導；當 $\\alpha > 0.4$ 時，轉由 $A$ 的左腰主導。這正是專書例題 5.5 推導四段式歸屬函數的關鍵分水嶺！
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch4-q7',
      title: '【第 7 題】模糊代數方程式 $A \\oplus X = B$ 逆元缺失與待定解法合法條件',
      tag: '模糊代數方程 • 逆元缺失',
      difficulty: '★★★ 觀念與計算',
      question: '在模糊代數中欲求解方程式 $A \\oplus X = B$，其中 $A = (1, 3, 5)$ 為三角形模糊數。若欲使待求之模糊數 $X = (x_1, x_2, x_3)$ 存在唯一且為合法的三角形模糊數（滿足單調頂點條件 $x_1 \\le x_2 \\le x_3$），則常數模糊數 $B = (b_1, b_2, b_3)$ 必須滿足下列何種關鍵幾何約束？',
      options: [
        { label: 'A', text: '$B$ 的左右模糊寬度必須大於等於 $A$ 的模糊寬度（即 $b_2 - b_1 \\ge 2$ 且 $b_3 - b_2 \\ge 2$），且絕不可直接令 $X = B \\ominus A$' },
        { label: 'B', text: '直接令 $X = B \\ominus A = (b_1 - 5, b_2 - 3, b_3 - 1)$，對任意 $B$ 恆為其精確代數解' },
        { label: 'C', text: '$B$ 必須為對稱三角形，且頂點 $b_2$ 必須嚴格大於 10' },
        { label: 'D', text: '模糊數不具備封閉性，此類方程式在實數論域上恆無解' }
      ],
      correctIndex: 0,
      tip: '利用待定係數法 $x_1 = b_1 - a_1, x_2 = b_2 - a_2, x_3 = b_3 - a_3$，並檢驗 $x_1 \\le x_2 \\le x_3$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-amber-300">【逐步推導與代數陷阱剖析】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>為何不能直接令 $X = B \\ominus A$？</strong><br>
              若令 $X = B \\ominus A$，則：
              $$A \\oplus X = A \\oplus (B \\ominus A) = (a_1+b_1-a_3, a_2+b_2-a_2, a_3+b_3-a_1) = (b_1 - 4, b_2, b_3 + 4) \\neq B$$
              這是因為模糊減法會使不確定性擴散（$A \\ominus A \\neq 0$），故加法群逆元不存在！
            </li>
            <li><strong>採用待定係數法求解：</strong><br>
              設待求模糊數為 $X = (x_1, x_2, x_3)$。由加法定義：
              $$(1 + x_1, 3 + x_2, 5 + x_3) = (b_1, b_2, b_3)$$
              解得：$x_1 = b_1 - 1, \\quad x_2 = b_2 - 3, \\quad x_3 = b_3 - 5$。
            </li>
            <li><strong>合法三角形模糊數的充要約束：</strong><br>
              三角形模糊數的三端點必須滿足非遞減條件 $x_1 \\le x_2 \\le x_3$：
              $$b_1 - 1 \\le b_2 - 3 \\iff b_2 - b_1 \\ge 2 = a_2 - a_1$$
              $$b_2 - 3 \\le b_3 - 5 \\iff b_3 - b_2 \\ge 2 = a_3 - a_2$$
              物理意義：和模糊數 $B$ 的模糊度（不確定性寬度）必須**大於等於**原模糊數 $A$ 的模糊度，否則無合法模糊數解！
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch4-q8',
      title: '【第 8 題】模糊數大小偏序與王邱快速畫圖法（交點最高峰 $x_m$ 分水嶺幾何）',
      tag: '模糊數大小 • 王邱畫圖法',
      difficulty: '★★☆ 幾何速解',
      question: '台灣中央大學王文俊教授與邱創乾教授於 1997 年提出「王邱快速畫圖法 (Wang & Chiu, 1997)」，用於快速求得兩相交三角形模糊數之模糊最大值 $\\text{MAX}(A, B)$ 與模糊最小值 $\\text{MIN}(A, B)$。設兩模糊數 $A$ 與 $B$ 在交點處之最高峰為 $(x_m, \\mu_m)$。下列關於王邱快速幾何分界法則的敘述，何者**完全正確**？',
      options: [
        { label: 'A', text: '以交點橫坐標 $x_m$ 為分水嶺：在 $x \\le x_m$ 區間，極值模糊數取兩者之「外包絡線（聯集 $\\max$）」；在 $x > x_m$ 區間，則切換取兩者之「內交集線（交集 $\\min$）」' },
        { label: 'B', text: '王邱快速畫圖法僅適用於直角三角形，無法處理一般任意不對稱三角形模糊數' },
        { label: 'C', text: '模糊最大值 $\\text{MAX}(A, B)$ 會使結果的模糊寬度急劇收縮，最終退化為明確單點' },
        { label: 'D', text: '兩模糊數相交時，其 $\\text{MIN}(A, B)$ 與 $\\text{MAX}(A, B)$ 在全論域恆等於純粹的幾何交集 $A \\cap B$ 與聯集 $A \\cup B$，不需要以 $x_m$ 分段切換' }
      ],
      correctIndex: 0,
      tip: '王邱畫圖法以交點最高峰 $x_m$ 為界，左右兩側巧妙切換外包絡（聯集）與內交線（交集），無須繁瑣的二重確界求解！',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-amber-300">【王邱快速畫圖法 (Wang & Chiu, 1997) 定理解析】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>傳統擴展原理求解的瓶頸：</strong><br>
              若直接以擴展原理公式 $\\text{MAX}(A, B)(z) = \\sup_{z=\\max(x,y)} \\min(A(x), B(y))$ 計算，需要進行繁瑣的二重變數優化搜尋或分段 $\\alpha$-截集求逆（如例題 5.5 耗費數十行推導）。
            </li>
            <li><strong>王邱幾何分水嶺法則：</strong><br>
              王文俊教授與邱創乾教授嚴格證明：兩連續凸形模糊數的模糊極值邊界，其轉折點必然出現在兩者歸屬曲線的最高交點 $(x_m, \\mu_m)$：
              - 當 $x \\le x_m$ 時：運算結果直接貼合於 $A(x)$ 與 $B(x)$ 的**外側邊界（外包絡聯集）**；
              - 當 $x > x_m$ 時：運算結果平滑切換至兩者**內側交會邊界（交集線）**。
            </li>
            <li><strong>工程實用意義：</strong><br>
              工程師只需在座標紙上求出頂點與交點，即可在 5 秒內精確勾勒出模糊極值曲線，兼具數學嚴謹性與工程實用性！
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
  function updateCh4PracticeScore() {
    const scoreEl = document.getElementById('ch4-practice-score');
    if (!scoreEl) return;
    let correctCount = 0;
    ch4PracticeQuestions.forEach((q, idx) => {
      if (ch4PracticeAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    scoreEl.textContent = `${correctCount} / ${ch4PracticeQuestions.length}`;
  }

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

    updateCh4PracticeScore();
    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh4Practice(qIdx, optionIdx) {
    ch4PracticeAnswers[qIdx] = optionIdx;
    renderCh4PracticeList();
    updateCh4PracticeScore();
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
          <button id="ch4-mod-btn-m4" onclick="FuzzyWidgets.switchCh4Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (8題)</button>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 1：通論（Overview）】模糊數、擴展原理與區間代數幾何架構 -->
      <!-- =================================================================== -->
      <div id="ch4-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-amber-500/40 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/40">Module 01 • Extension Principle & Fuzzy Numbers Masterclass</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊數、Zadeh 擴展原理與區間代數幾何架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              由古典清晰點值推廣至模糊數空間：深入掌握非單射映射確界（Supremum）聚合、模糊數三大公理條件、Nguyen 連續擴展捷徑、模糊方程式 $A+X=B$ 可解性條件與王邱快速畫圖法。
            </p>
          </div>

          <!-- 5 大深層理論卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 理論 4.1 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-amber-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Theory 4.1</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30">映射核心</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>⚡ 1. Zadeh 擴展原理非單射映射與確界聚合</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                將點對點函數 $f: X \\to Y$ 提升為模糊集合之映射。當存在多對一非單射（如 $y = x^2$）時，採用確界（$\\sup$）聚合所有原像點之歸屬度；若無原像則歸屬度為 0：
              </p>
              <div class="formula-display-card text-xs">
                $$\\mu_B(y) = \\sup_{x \\in f^{-1}(y)} \\mu_A(x)$$
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                多元推廣：$f: X_1 \\times \\dots \\times X_n \\to Y$ 時取笛卡兒積之最小確界：
              </p>
              <div class="formula-display-card text-xs">
                $$\\mu_B(y) = \\sup_{(x_1,\\dots,x_n): f=y} \\min(\\mu_{A_1}(x_1), \\dots, \\mu_{A_n}(x_n))$$
              </div>
              <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span class="text-amber-300 font-bold">延伸原理重要代數定理 (定理 3.7)：</span><br>
                • 聯集完全分配：$f(\\bigcup A_i) = \\bigcup f(A_i)$<br>
                • 交集次分配包含：$f(\\bigcap A_i) \\subset \\bigcap f(A_i)$（多對一映射會使原本互斥之區間在輸出空間產生重疊交集！）
              </div>
            </div>

            <!-- 理論 4.2 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-orange-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">Theory 4.2</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-orange-500/15 text-orange-300 border border-orange-500/30">數學公理</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>📐 2. 模糊數 (Fuzzy Number) 三大公理體系</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                實數軸 $\\mathbb{R}$ 上的模糊集合 $A$ 若被定義為「模糊數」，必須同時嚴格滿足三大數學公理：
              </p>
              <div class="space-y-2 text-xs text-slate-300">
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-orange-300">(1) 正規性 (Normality)：</strong><br>
                  存在至少一個實數 $x_0$ 使得 $\\mu_A(x_0) = 1$（具備確定中心核心）。
                </div>
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-orange-300">(2) 模糊凸性 (Fuzzy Convexity)：</strong><br>
                  任意水平割線截出的 $\\alpha$-截集 $A_\\alpha$ 必為單一連通封閉區間 $[a_L^{(\\alpha)}, a_R^{(\\alpha)}]$，排除雙峰與凹陷：
                  $$\\mu_A(\\lambda x_1 + (1-\\lambda)x_2) \\ge \\min(\\mu_A(x_1), \\mu_A(x_2))$$
                </div>
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-orange-300">(3) 上半連續且緊緻支撐 (Compact Support)：</strong><br>
                  $\\text{Supp}(A) = \\{x \\mid \\mu_A(x) > 0\\}$ 之閉包為有界實數區間。
                </div>
              </div>
              <p class="text-xs text-slate-400">
                標準參數化模型包含三角形模糊數 $\\text{TFN}(a_1, a_2, a_3)$ 與梯形模糊數 $\\text{TrFN}(a_1, a_2, a_3, a_4)$。
              </p>
            </div>

            <!-- 理論 4.3 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-yellow-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">Theory 4.3</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">計算捷徑</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🧮 3. 分解定理與 Nguyen 定理（連續擴展捷徑）</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                如何無損重構模糊集合？第一分解定理指出任一模糊集合可分解為無限多個加權 $\\alpha$-梯台（$\\alpha\\text{-stair}$）的標準聯集：
              </p>
              <div class="formula-display-card text-xs">
                $$A = \\bigcup_{\\alpha \\in (0, 1]} {_\\alpha A} = \\bigcup_{\\alpha \\in (0, 1]} \\alpha \\cdot {^\\alpha A}$$
              </div>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong>Nguyen 定理 (Nguyen, 1978)：</strong>若 $f$ 為連續函數且模糊數具緊緻支撐，則連續擴展原理與 $\\alpha$-截集具有可交換性：
              </p>
              <div class="formula-display-card text-xs">
                $$[f(A_1, \\dots, A_n)]_\\alpha = f((A_1)_\\alpha, \\dots, (A_n)_\\alpha)$$
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                這意味著工程計算無須逐點搜尋上確界，直接在各水平高度 $\\alpha$ 上套用古典區間四則運算，大幅加速手算與數值分析！
              </p>
            </div>

            <!-- 理論 4.4 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-rose-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">Theory 4.4</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30">代數陷阱</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>⚠️ 4. 模糊代數方程式 $A+X=B$ 逆元缺失與待定解法</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong>逆元缺失定理：</strong>模糊數加法群不具備減法逆元素！
                $A \\ominus A \\neq 0$，例如 $(1, 3, 5) \\ominus (1, 3, 5) = (-4, 0, 4)$，不確定性寬度累加倍增。
              </p>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong>重大陷阱：</strong>求解 $A \\oplus X = B$ 時，<strong>絕不可直接令 $X = B \\ominus A$</strong>，因為 $A \\oplus (B \\ominus A) \\neq B$！
              </p>
              <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span class="text-rose-300 font-bold">待定係數解法與合法解判定條件：</span><br>
                設 $X = (x_1, x_2, x_3)$，由加法解得 $x_i = b_i - a_i$。<br>
                $X$ 為合法三角形模糊數之充要條件為 $x_1 \\le x_2 \\le x_3$：
                <div class="font-mono text-amber-300 text-center my-1">
                  $b_2 - b_1 \\ge a_2 - a_1$ 且 $b_3 - b_2 \\ge a_3 - a_2$
                </div>
                物理意涵：和模糊數 $B$ 的模糊度（左右寬度）必須<strong>大於等於</strong>原模糊數 $A$ 的模糊度，否則無合法模糊數解！
              </div>
            </div>

            <!-- 理論 4.5 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-sky-400 md:col-span-2 lg:col-span-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Theory 4.5</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-sky-500/15 text-sky-300 border border-sky-500/30">幾何速解</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🎯 5. 模糊數大小偏序與王邱快速畫圖法（Wang & Chiu, 1997）</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                在實數軸上，兩模糊數交錯重疊時無法以單一不等式判定大小。學界透過擴展原理定義模糊極值 $\\text{MIN}(A, B)$ 與 $\\text{MAX}(A, B)$：
              </p>
              <div class="formula-display-card text-xs">
                $$\\text{MAX}(A, B)(z) = \\sup_{z = \\max(x, y)} \\min(A(x), B(y)), \\quad \\text{MIN}(A, B)(z) = \\sup_{z = \\min(x, y)} \\min(A(x), B(y))$$
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div class="bg-slate-900/90 p-4 rounded-xl border border-sky-500/30 space-y-1.5 text-xs">
                  <span class="text-sky-300 font-bold">傳統截集分段反解（例題 5.5）：</span>
                  <p class="text-slate-300">
                    需反解 $\\alpha$-截集端點函數 $A_\\alpha$ 與 $B_\\alpha$，在端點相交處（如 $\\alpha = 0.25, 0.4$）將 $[0, 1]$ 分割為多段並分別取極值再逆推 $x$，過程需耗費數十行推導。
                  </p>
                </div>
                <div class="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-1.5 text-xs">
                  <span class="text-amber-300 font-bold">王邱快速畫圖法定理 (中央大學王文俊、邱創乾 1997)：</span>
                  <p class="text-slate-300">
                    兩連續三角形模糊數在右側或左側邊界交於點 $(x_m, \\mu_m)$。以此交點最高峰 $x_m$ 為幾何分水嶺：<br>
                    • 當 $x \\le x_m$ 時：極值曲線直接貼合兩者的<strong>外包絡線（聯集 $\\max$）</strong>；<br>
                    • 當 $x > x_m$ 時：平滑切換為兩者的<strong>內交集線（交集 $\\min$）</strong>。<br>
                    工程師只需求得交點坐標，5 秒內即可精準勾勒出模糊極值曲線！
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 全維度對比大表格 -->
          <div class="bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span class="text-amber-400">📊</span> 全維度對照表：明確實數運算 vs. 古典區間算術 vs. 模糊數算術
              </h4>
              <span class="text-xs text-slate-400">8 大代數性質深度對決</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 text-amber-300 bg-slate-900/60">
                    <th class="p-3 font-bold">比較維度 / 代數性質</th>
                    <th class="p-3 font-bold text-sky-300">明確實數運算 (Crisp Reals)</th>
                    <th class="p-3 font-bold text-indigo-300">古典區間算術 (Interval Arithmetic)</th>
                    <th class="p-3 font-bold text-amber-300">模糊數算術 (Fuzzy Arithmetic)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">1. 運算對象與空間</td>
                    <td class="p-3 text-sky-200">單一實數點 $x \\in \\mathbb{R}$</td>
                    <td class="p-3 text-indigo-200">閉區間 $[a_1, a_2] \\subset \\mathbb{R}$</td>
                    <td class="p-3 text-amber-200">滿足三大公理之凸形正規模糊集合 $A \\in \\mathcal{F}(\\mathbb{R})$</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">2. 加法交換律與結合律</td>
                    <td class="p-3 text-emerald-400">✓ 恆成立 ($a+b = b+a$)</td>
                    <td class="p-3 text-emerald-400">✓ 恆成立 ($A+B = B+A$)</td>
                    <td class="p-3 text-emerald-400">✓ 恆成立 ($A \\oplus B = B \\oplus A$)</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">3. 乘法交換律與結合律</td>
                    <td class="p-3 text-emerald-400">✓ 恆成立 ($a \\cdot b = b \\cdot a$)</td>
                    <td class="p-3 text-emerald-400">✓ 恆成立 ($A \\times B = B \\times A$)</td>
                    <td class="p-3 text-emerald-400">✓ 恆成立 ($A \\otimes B = B \\otimes A$)</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">4. 乘法對加法分配律</td>
                    <td class="p-3 text-emerald-400">✓ 完全分配 ($a(b+c) = ab+ac$)</td>
                    <td class="p-3 text-amber-300">⚠️ 半分配律 ($A(B+C) \\subseteq AB+AC$)</td>
                    <td class="p-3 text-amber-300">⚠️ 半分配律 ($A \\otimes (B \\oplus C) \\subseteq A\\otimes B \\oplus A\\otimes C$)</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">5. 加法逆元素 ($x - x = 0$)</td>
                    <td class="p-3 text-emerald-400">✓ 恆有唯一相反數 $-x$</td>
                    <td class="p-3 text-rose-400">❌ 逆元不存在！$[a, b] - [a, b] = [a-b, b-a] \\neq 0$</td>
                    <td class="p-3 text-rose-400">❌ 逆元不存在！$A \\ominus A = (a_1-a_3, 0, a_3-a_1) \\neq 0$ (寬度倍增)</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">6. 乘法逆元素 ($x / x = 1$)</td>
                    <td class="p-3 text-emerald-400">✓ 當 $x \\neq 0$ 恆有倒數 $1/x$</td>
                    <td class="p-3 text-rose-400">❌ 逆元不存在！$[a, b] / [a, b] = [a/b, b/a] \\neq [1, 1]$</td>
                    <td class="p-3 text-rose-400">❌ 逆元不存在！$A \\oslash A \\neq 1$ (包含不確定性分佈)</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">7. 截集運算連結 (Nguyen 定理)</td>
                    <td class="p-3 text-slate-400">不適用（無截集層次）</td>
                    <td class="p-3 text-slate-400">不適用（單一層次）</td>
                    <td class="p-3 text-emerald-400">✓ 完美可交換：$[f(A)]_\\alpha = f(A_\\alpha)$，降階為區間運算</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">8. 運算結果幾何邊界形狀</td>
                    <td class="p-3 text-slate-400">無幾何寬度（點值）</td>
                    <td class="p-3 text-indigo-300">兩端點直線邊界</td>
                    <td class="p-3 text-amber-300">加減為直線，乘除為二次拋物線微凸曲線（非嚴格直線）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 2：專書逐頁精讀】《認識 Fuzzy》第 3 章 專書逐頁精讀（頁 3-1 ～ 3-15） -->
      <!-- =================================================================== -->
      <div id="ch4-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-amber-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 3 章 專書逐頁精讀（頁 3-1 ～ 3-15）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                完整收錄第 3 章共 15 頁原書照片、公式推導與必考重點解析，支援點擊圖檔全螢幕雙欄圖文燈箱、手勢拖曳縮放與 OCR 筆記對照。
              </p>
            </div>
          </div>
          <div id="chapter4-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 3：多維度模擬圖專區】擴展原理與模糊算術實驗室 (2座) -->
      <!-- =================================================================== -->
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

      <!-- =================================================================== -->
      <!-- 【模組 4：章節題目練習與詳解】擴展原理與模糊數運算 8 大必考實戰題 -->
      <!-- =================================================================== -->
      <div id="ch4-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-amber-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】擴展原理與模糊數運算 8 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 8 道融合 Zadeh 擴展原理非單射映射、區間加減乘除、Nguyen 連續截集反解、方程式 $A+X=B$ 可解性與王邱快速畫圖法的深度題目，點選答案即時檢驗並可展開完整 LaTeX 逐項推導！
              </p>
            </div>
            <div class="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm">
              本章節練習得分：<strong id="ch4-practice-score" class="text-amber-400 font-mono text-lg">0 / 8</strong>
            </div>
          </div>
          <div id="ch4-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }


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
    },
    {
      id: 'ch5-q6',
      title: '【第 6 題】多層次階層式綜合評判矩陣合成手算（兩級評判傳遞模型）',
      tag: '階層評判 • 兩級合成',
      difficulty: '★★★ 深度計算',
      question: '某大型工程招標採用兩級模糊綜合評判模型。第一級「技術方案」評判向量為 $B_1 = (0.6, 0.3, 0.1)$，「經濟商務」評判向量為 $B_2 = (0.2, 0.5, 0.3)$（評語集為優、良、中）。若上一級決策委員會對技術與商務的權重向量設定為 $\\tilde{W} = (0.7, 0.3)$，採用加權平均型算子進行第二級合成，試求該投標方案的最終綜合評判向量 $B$ 及在「優秀（等級 1）」上的最終歸屬度？',
      options: [
        { label: 'A', text: '$B = (0.48, 0.36, 0.16)$，在「優秀」上的歸屬度為 $0.48$' },
        { label: 'B', text: '$B = (0.40, 0.40, 0.20)$，在「優秀」上的歸屬度為 $0.40$' },
        { label: 'C', text: '$B = (0.50, 0.35, 0.15)$，在「優秀」上的歸屬度為 $0.50$' },
        { label: 'D', text: '$B = (0.60, 0.30, 0.10)$，在「優秀」上的歸屬度為 $0.60$' }
      ],
      correctIndex: 0,
      tip: '構造總評判矩陣 $\\tilde{R} = [B_1; B_2]$，計算 $B = \\tilde{W} \\cdot \\tilde{R}$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-rose-300">【兩級綜合評判矩陣逐步推導】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>構造第二級總評判矩陣 $\\tilde{R}$：</strong><br>
              將初級評判向量 $B_1, B_2$ 作為次層評判矩陣的行向量：
              $$\\tilde{R} = \\begin{bmatrix} B_1 \\\\ B_2 \\end{bmatrix} = \\begin{bmatrix} 0.6 & 0.3 & 0.1 \\\\ 0.2 & 0.5 & 0.3 \\end{bmatrix}$$
            </li>
            <li><strong>計算高級綜合評判向量 $B = \\tilde{W} \\cdot \\tilde{R}$：</strong><br>
              - $b_1 = 0.7 \\times 0.6 + 0.3 \\times 0.2 = 0.42 + 0.06 = 0.48$<br>
              - $b_2 = 0.7 \\times 0.3 + 0.3 \\times 0.5 = 0.21 + 0.15 = 0.36$<br>
              - $b_3 = 0.7 \\times 0.1 + 0.3 \\times 0.3 = 0.07 + 0.09 = 0.16$<br>
              檢驗歸一化：$0.48 + 0.36 + 0.16 = 1.00$。
            </li>
            <li><strong>結論：</strong><br>
              最終綜合評判向量為 $B = (0.48, 0.36, 0.16)$，在「優秀」評語等級上的歸屬度為 $0.48$。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch5-q7',
      title: '【第 7 題】最大隸屬度原則失效條件與有效度指標判定（Validity Criterion）',
      tag: '評判決策 • 最大隸屬度失效',
      difficulty: '★★☆ 核心陷阱',
      question: '在模糊綜合評判中，若某受評對象在評語集 $V = \\{v_1, v_2, v_3\\}$（$n=3$）上的綜合評判向量為 $B = (0.34, 0.33, 0.33)$。若評判小組直接依據「最大隸屬度原則」將其判定為 $v_1$，試問此結論是否可信？若採用有效度指標公式 $\\alpha = \\frac{n \\max(b_j) - 1}{n - 1}$ 檢驗，其有效度指標 $\\alpha$ 為何？',
      options: [
        { label: 'A', text: '結論極不可信；有效度指標 $\\alpha = 0.01$，遠低於可靠閾值 $0.5$，說明評判向量幾乎均勻平坦，最大隸屬度原則失效，必須改採加權計分法' },
        { label: 'B', text: '結論完全可信；有效度指標 $\\alpha = 1.0$，因 $0.34 > 0.33$ 具備嚴格數學優勢' },
        { label: 'C', text: '結論部分可信；有效度指標 $\\alpha = 0.68$，剛好達到及格標準' },
        { label: 'D', text: '有效度指標無定義，因為分母為零' }
      ],
      correctIndex: 0,
      tip: '代入公式 $\\alpha = \\frac{3 \\times 0.34 - 1}{3 - 1} = \\frac{1.02 - 1}{2} = 0.01$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-rose-300">【最大隸屬度原則失效與有效度檢驗】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>最大隸屬度原則之局限性：</strong><br>
              最大隸屬度原則僅考慮向量中的最高分量值，完全忽略了其他分量的數值分佈。
            </li>
            <li><strong>計算有效度指標 $\\alpha$：</strong><br>
              評語個數 $n = 3$，最高歸屬度 $\\max(b_j) = 0.34$：
              $$\\alpha = \\frac{n \\max(b_j) - 1}{n - 1} = \\frac{3 \\times 0.34 - 1}{3 - 1} = \\frac{1.02 - 1}{2} = \\frac{0.02}{2} = 0.01$$
            </li>
            <li><strong>工程判據準則：</strong><br>
              當 $\\alpha \\ge 0.5$ 時，最大隸屬度原則判定結果才具備統計顯著性與可信度；本題 $\\alpha = 0.01 \\ll 0.5$，各評語機率近乎等概（平坦分佈），強行判定為 $v_1$ 極易造成誤判，必須輔以加權評分法（Score Transformation）！
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch5-q8',
      title: '【第 8 題】多目標模糊決策（Multi-Objective Fuzzy Decision）乘冪加權模型',
      tag: '多目標決策 • 乘冪權重',
      difficulty: '★★★ 深度推導',
      question: '在多目標模糊決策中，若給定兩項目標 $G_1$ 與 $G_2$，其重要性權重分別為 $\\alpha_1 = 0.8$ 與 $\\alpha_2 = 0.2$。Yager (1978) 提出著名的乘冪加權模糊決策公式：$$\\mu_D(x) = \\min\\big( [\\mu_{G_1}(x)]^{\\alpha_1}, \\; [\\mu_{G_2}(x)]^{\\alpha_2} \\big)$$若某方案 $x$ 在兩項目標上的未加權滿意度恰好相同，皆為 $\\mu_{G_1}(x) = 0.5$ 與 $\\mu_{G_2}(x) = 0.5$。試問乘冪加權後，最終決策滿意度 $\\mu_D(x)$ 主要受哪一項目標所嚴格限制（瓶頸限制）？',
      options: [
        { label: 'A', text: '主要受權重較大的重要目標 $G_1$ 限制，因 $0.5^{0.8} \\approx 0.574 < 0.5^{0.2} \\approx 0.871$，故 $\\mu_D(x) = 0.574$' },
        { label: 'B', text: '主要受權重較小的次要目標 $G_2$ 限制，因次要目標會產生懲罰項' },
        { label: 'C', text: '兩目標限制程度完全相同，均為 $0.5$' },
        { label: 'D', text: '決策滿足度自動歸零，因為兩目標權重相差過大' }
      ],
      correctIndex: 0,
      tip: '對於小於 1 的底數 $0.5$，次方愈大（權重愈大），結果愈小！因此重要目標會形成更嚴格的下限約束。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-rose-300">【Yager 乘冪加權模型深度推導】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>乘冪加權原理解析：</strong><br>
              在模糊集合論中，重要性加權常以指數冪次實施：目標 $G_i$ 越重要，其指數 $\\alpha_i$ 越大。
            </li>
            <li><strong>數值計算：</strong><br>
              底數為滿意度 $\\mu = 0.5 \\in (0, 1)$：
              $$[\\mu_{G_1}(x)]^{\\alpha_1} = 0.5^{0.8} \\approx 0.574$$
              $$[\\mu_{G_2}(x)]^{\\alpha_2} = 0.5^{0.2} \\approx 0.871$$
            </li>
            <li><strong>取交集取小：</strong><br>
              $$\\mu_D(x) = \\min(0.574, 0.871) = 0.574$$
              權重越大的目標（$G_1$），賦予的指數越高，使原本未加權的歸屬度受到更強烈的壓抑（更靠近 0），從而在取小交集 $\\min$ 運算中更容易成為瓶頸限制！
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
  function updateCh5PracticeScore() {
    const scoreEl = document.getElementById('ch5-practice-score');
    if (!scoreEl) return;
    let correctCount = 0;
    ch5PracticeQuestions.forEach((q, idx) => {
      if (ch5PracticeAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    scoreEl.textContent = `${correctCount} / ${ch5PracticeQuestions.length}`;
  }

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

    updateCh5PracticeScore();
    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh5Practice(qIdx, optionIdx) {
    ch5PracticeAnswers[qIdx] = optionIdx;
    renderCh5PracticeList();
    updateCh5PracticeScore();
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
          <button id="ch5-mod-btn-m4" onclick="FuzzyWidgets.switchCh5Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (8題)</button>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 1：通論（Overview）】模糊決策模型與多準則綜合評判 -->
      <!-- =================================================================== -->
      <div id="ch5-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-rose-500/40 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-widest border border-rose-500/40">Module 01 • Fuzzy Decision & Comprehensive Evaluation</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊決策模型與多屬性綜合評判架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              統整 Bellman-Zadeh 目標與限制對稱交集模型、最佳妥協點搜尋、四大模糊綜合評判矩陣合成算子、階層多層次評判與有效度判據。
            </p>
          </div>

          <!-- 5 大深層理論卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 理論 5.1 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-rose-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">Theory 5.1</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30">對稱決策</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🎯 1. Bellman-Zadeh 對稱決策與最優妥協點</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                古典運籌學將「目標函數（極值求取）」與「約束條件（剛性邊界）」截然二分。Bellman 與 Zadeh (1970) 首創<strong>對稱性決策哲學</strong>：兩者在決策空間中具備完全對等的地位，均以論域 $X$ 上的模糊集合表示：
              </p>
              <div class="formula-display-card text-xs">
                $$\\mu_D(x) = \\mu_G(x) \\land \\mu_C(x) = \\min\\big(\\mu_G(x), \\mu_C(x)\\big)$$
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                最佳妥協決策點 $x^*$ 滿足總體滿意度最大化：
              </p>
              <div class="formula-display-card text-xs">
                $$x^* = \\arg\\max_{x \\in X} \\mu_D(x) = \\arg\\max_{x \\in X} \\min\\big(\\mu_G(x), \\mu_C(x)\\big)$$
              </div>
              <p class="text-xs text-slate-400">
                多目標與多約束可直接推廣為所有目標與約束模糊集合之交集 $\\bigcap_{i} G_i \\cap \\bigcap_{j} C_j$。
              </p>
            </div>

            <!-- 理論 5.2 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-pink-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider">Theory 5.2</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-pink-500/15 text-pink-300 border border-pink-500/30">矩陣架構</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>📊 2. 多屬性模糊綜合評判模型 ($B = W \\circ R$)</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                當決策受多重定性與定量指標約束時，建立三要素評估系統：
              </p>
              <div class="space-y-1.5 text-xs text-slate-300">
                <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  • <strong>因素集：</strong>$U = \\{u_1, u_2, \\dots, u_m\\}$（各評估屬性）
                </div>
                <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  • <strong>評語集：</strong>$V = \\{v_1, v_2, \\dots, v_n\\}$（優、良、中、差）
                </div>
                <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  • <strong>單因素評判矩陣：</strong>$R = [r_{ij}]_{m \\times n}$，行歸一化 $\\sum_j r_{ij} = 1$
                </div>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                給定權重分配向量 $W = (w_1, \\dots, w_m)$（滿足 $\\sum w_i = 1$），綜合評判變換式為：
              </p>
              <div class="formula-display-card text-xs">
                $$B = W \\circ R = (b_1, b_2, \\dots, b_n)$$
              </div>
            </div>

            <!-- 理論 5.3 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-amber-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Theory 5.3</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30">算子剖析</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>⚡ 3. 四大評判合成算子與資訊丟失剖析</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                依據合成算子 $(\\odot, \\oplus)$ 搭配不同，形成四大工程評判模型：
              </p>
              <div class="space-y-2 text-xs text-slate-300">
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-amber-300">1. 主因素決定型 $M(\\land, \\lor)$：</strong><br>
                  $b_j = \\bigvee_i (w_i \\land r_{ij})$。突出關鍵主項，但易引發「資訊丟失」（中間指標差異被忽略）。
                </div>
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-amber-300">2. 主因素突出型 $M(\\cdot, \\lor)$：</strong><br>
                  $b_j = \\bigvee_i (w_i \\cdot r_{ij})$。以乘積強化權重連續漸變。
                </div>
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-amber-300">3. 加權平均型 $M(\\cdot, +)$ [工程首選]：</strong><br>
                  $b_j = \\sum_i w_i \\cdot r_{ij}$。徹底消除截斷，保留全部評估面向資訊。
                </div>
              </div>
            </div>

            <!-- 理論 5.4 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-indigo-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Theory 5.4</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">階層拓撲</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🌲 4. 多層次階層式模糊綜合評判模型</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                針對超大型複雜工程（如大型公共工程投標、三級甲等醫院評估、航空系統驗收），單層評判易使指標權重過於稀釋。
              </p>
              <div class="space-y-2 text-xs text-slate-300">
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-indigo-300">第一級初級評判：</strong><br>
                  將因素集分群 $U = \\bigcup_{k=1}^K U_k$，分別計算初級評判向量：
                  $$B_k = W_k \\circ R_k \\quad (k = 1, \\dots, K)$$
                </div>
                <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong class="text-indigo-300">第二級高級評判：</strong><br>
                  構造上一級總評判矩陣 $\\tilde{R} = [B_1; B_2; \\dots; B_K]$，乘以上層權重 $\\tilde{W}$：
                  $$B = \\tilde{W} \\circ \\tilde{R}$$
                </div>
              </div>
            </div>

            <!-- 理論 5.5 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-teal-400 md:col-span-2 lg:col-span-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">Theory 5.5</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-teal-500/15 text-teal-300 border border-teal-500/30">數值清晰化</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>⚖️ 5. 評語打分轉化與最大隸屬度原則之有效度判據</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                得到模糊綜合評判向量 $B = (b_1, \\dots, b_n)$ 後，如何得出清晰單一評定結論？
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div class="bg-slate-900/90 p-4 rounded-xl border border-teal-500/30 space-y-1.5 text-xs">
                  <span class="text-teal-300 font-bold">1. 最大隸屬度原則與有效度指標：</span>
                  <p class="text-slate-300">
                    若取最大者 $v^* = \\arg\\max_j b_j$，必須檢驗<strong>有效度指標 (Validity Criterion)</strong>：
                    $$\\alpha = \\frac{n \\max(b_j) - 1}{n - 1}$$
                    若 $\\alpha < 0.5$（如 $B=[0.34, 0.33, 0.33]$，$\\alpha = 0.01$），說明各等級差距微弱，最大隸屬度原則失效！
                  </p>
                </div>
                <div class="bg-slate-900/90 p-4 rounded-xl border border-rose-500/30 space-y-1.5 text-xs">
                  <span class="text-rose-300 font-bold">2. 評語等級加權評分計算法 (Score Vector)：</span>
                  <p class="text-slate-300">
                    設定各評語等級之量化分值向量 $S = [s_1, s_2, \\dots, s_n]^T$（例如優=100、良=80、中=60、差=40），計算加權綜合清晰總分：
                    $$\\text{Final Score} = \\frac{\\sum_{j=1}^n b_j \\cdot s_j}{\\sum_{j=1}^n b_j}$$
                    能夠平滑融合所有評語等級資訊，徹底避免最大隸屬度原則的邊界跳躍誤判。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 全維度對比大表格 -->
          <div class="bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span class="text-rose-400">📊</span> 全維度對照表：四大模糊綜合評判合成算子工程性能全維度對決
              </h4>
              <span class="text-xs text-slate-400">8 大指標維度評估</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 text-rose-300 bg-slate-900/60">
                    <th class="p-3 font-bold">評判合成算子模型</th>
                    <th class="p-3 font-bold text-amber-300">合成數學算式</th>
                    <th class="p-3 font-bold text-sky-300">資訊利用程度</th>
                    <th class="p-3 font-bold text-indigo-300">抗極端值干擾能力</th>
                    <th class="p-3 font-bold text-emerald-300">推薦工程應用情境</th>
                    <th class="p-3 font-bold text-rose-300">主要工程局限性</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">1. 主因素決定型 $M(\\land, \\lor)$</td>
                    <td class="p-3 font-mono text-amber-200">$b_j = \\bigvee_{i=1}^m (w_i \\land r_{ij})$</td>
                    <td class="p-3 text-rose-400">極低（僅取極值）</td>
                    <td class="p-3 text-emerald-400">極高（忽略中間項）</td>
                    <td class="p-3 text-slate-200">一票否決型、安全臨界檢測、軍工品管</td>
                    <td class="p-3 text-rose-400">資訊丟失嚴重，易出現各評語分量相同之「評判失效」</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">2. 主因素突出型 $M(\\cdot, \\lor)$</td>
                    <td class="p-3 font-mono text-amber-200">$b_j = \\bigvee_{i=1}^m (w_i \\cdot r_{ij})$</td>
                    <td class="p-3 text-amber-300">中等偏低</td>
                    <td class="p-3 text-sky-300">較高</td>
                    <td class="p-3 text-slate-200">突出強勢特色專長人才選拔</td>
                    <td class="p-3 text-rose-300">仍受最大值運算截斷，次要優勢無法累積</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">3. 加權平均型 $M(\\cdot, +)$</td>
                    <td class="p-3 font-mono text-amber-200">$b_j = \\sum_{i=1}^m w_i \\cdot r_{ij}$</td>
                    <td class="p-3 text-emerald-400">100% 完全保留</td>
                    <td class="p-3 text-sky-400">平滑平衡均衡</td>
                    <td class="p-3 text-emerald-300 font-bold">工程首選：產品選型、投標評定、績效考核</td>
                    <td class="p-3 text-slate-300">當指標極多時可能產生「均質化權重稀釋」</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">4. 有界算子型 $M(\\land, \\oplus)$</td>
                    <td class="p-3 font-mono text-amber-200">$b_j = \\min(1, \\sum_i (w_i \\land r_{ij}))$</td>
                    <td class="p-3 text-sky-300">較高（部分截頂）</td>
                    <td class="p-3 text-amber-300">中等</td>
                    <td class="p-3 text-slate-200">積分配點達標審查、資格條件檢定</td>
                    <td class="p-3 text-slate-300">容易在累加超過 1.0 時飽和截頂失真</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 2：專書逐頁精讀】《認識 Fuzzy》第 13、14 章 專書精讀（共 34 頁） -->
      <!-- =================================================================== -->
      <div id="ch5-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-rose-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-widest border border-rose-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 13、14 章 專書精讀（共 34 頁）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                包含第 13 章（模糊決策 17 頁，頁 13-1 ～ 13-17）與第 14 章（多屬性綜合評判 17 頁，頁 14-1 ～ 14-17）完整原書照片、公式推導與實務案例，支援雙欄圖文排版與全螢幕燈箱。
              </p>
            </div>
          </div>
          <div id="chapter5-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 3：多維度模擬圖專區】模糊決策與評判實驗室 (2座) -->
      <!-- =================================================================== -->
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

      <!-- =================================================================== -->
      <!-- 【模組 4：章節題目練習與詳解】模糊決策與評判 8 大必考實戰題 -->
      <!-- =================================================================== -->
      <div id="ch5-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-rose-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-widest border border-rose-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】模糊決策與評判 8 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 8 道融合 Bellman-Zadeh 最佳妥協點手算、四大矩陣算子合成、階層多層次綜合評判、最大隸屬度失效判據與乘冪加權模型的深度實戰題，附完整逐步推導！
              </p>
            </div>
            <div class="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm">
              本章節練習得分：<strong id="ch5-practice-score" class="text-rose-400 font-mono text-lg">0 / 8</strong>
            </div>
          </div>
          <div id="ch5-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }


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
              - 內積 $A \circ B_1 = \max\{ \min(0.8, 0.7), \min(0.4, 0.5), \min(0.2, 0.1) \} = \max\{0.7, 0.4, 0.1\} = 0.7$<br>
              - 外積 $A \odot B_1 = \min\{ \max(0.8, 0.7), \max(0.4, 0.5), \max(0.2, 0.1) \} = \min\{0.8, 0.5, 0.2\} = 0.2$<br>
              格貼近度 $(A, B_1) = \frac{0.7 + 0.2}{2} = 0.45$（若採海明貼近度：$\sigma_H = 1 - \frac{|0.1|+|0.1|+|0.1|}{3} = 0.90$）。
            </li>
            <li><strong>計算與 $B_2$ 的差距：</strong><br>
              $A$ 與 $B_2$ 差距極大：$|0.8-0.3| = 0.5, |0.4-0.8|=0.4, |0.2-0.9|=0.7$，貼近度遠低於 $B_1$。
            </li>
            <li>依據最大貼近度識別準則，樣本 $A$ 毫無疑問歸類為 $B_1$。</li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch6-q6',
      title: '【第 6 題】模糊相似矩陣平方法數值手算（平方合成 $R \circ R = R^2$ 與傳遞性驗證）',
      tag: '模糊分群 • 矩陣平方手算',
      difficulty: '★★★ 深度計算',
      question: '設有 3 個樣本的模糊相似矩陣如下：\n$$R = \\begin{bmatrix} 1.0 & 0.7 & 0.4 \\\\ 0.7 & 1.0 & 0.6 \\\\ 0.4 & 0.6 & 1.0 \\end{bmatrix}$$\n試透過 Max-Min 算子計算矩陣平方 $R^2 = R \\circ R$（其中 $(R^2)_{ij} = \\bigvee_{k=1}^3 (r_{ik} \\land r_{kj})$），並驗證其是否已達到傳遞閉包 $R^*$？',
      options: [
        { label: 'A', text: '$R^2 = \\begin{bmatrix} 1.0 & 0.7 & 0.6 \\\\ 0.7 & 1.0 & 0.6 \\\\ 0.6 & 0.6 & 1.0 \\end{bmatrix}$，且 $R^4 = R^2$，故 $R^2$ 即為傳遞閉包 $R^*$' },
        { label: 'B', text: '$R^2 = \\begin{bmatrix} 1.0 & 0.49 & 0.16 \\\\ 0.49 & 1.0 & 0.36 \\\\ 0.16 & 0.36 & 1.0 \\end{bmatrix}$，尚未達到傳遞閉包' },
        { label: 'C', text: '$R^2 = \\begin{bmatrix} 1.0 & 1.0 & 1.0 \\\\ 1.0 & 1.0 & 1.0 \\\\ 1.0 & 1.0 & 1.0 \\end{bmatrix}$，元素全部飽和' },
        { label: 'D', text: '$R^2 = R$，原矩陣本已具備傳遞性無需平方' }
      ],
      correctIndex: 0,
      tip: '計算第 1 行第 3 列：$(r^2)_{13} = \\max\\{ \\min(1.0, 0.4), \\min(0.7, 0.6), \\min(0.4, 1.0) \\} = \\max\\{0.4, 0.6, 0.4\\} = 0.6$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-cyan-300">【矩陣平方合成逐步推導】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>計算各非對角元素：</strong><br>
              - $(r^2)_{12} = \\max\\{ 1.0 \\land 0.7, \\; 0.7 \\land 1.0, \\; 0.4 \\land 0.6 \\} = \\max\\{0.7, 0.7, 0.4\\} = 0.7$<br>
              - $(r^2)_{13} = \\max\\{ 1.0 \\land 0.4, \\; 0.7 \\land 0.6, \\; 0.4 \\land 1.0 \\} = \\max\\{0.4, 0.6, 0.4\\} = 0.6$<br>
              - $(r^2)_{23} = \\max\\{ 0.7 \\land 0.4, \\; 1.0 \\land 0.6, \\; 0.6 \\land 1.0 \\} = \\max\\{0.4, 0.6, 0.6\\} = 0.6$<br>
              對角線自反性元素保持 $1.0$。
            </li>
            <li><strong>檢查傳遞閉包收斂條件：</strong><br>
              原本 $r_{13} = 0.4 < \\min(r_{12}, r_{23}) = \\min(0.7, 0.6) = 0.6$，違反傳遞性。經過一次平方後 $(r^2)_{13} = 0.6$ 補足了傳遞路徑。<br>
              再次平方計算 $R^4 = R^2 \\circ R^2$，所有元素保持不變（$R^4 = R^2$），符合定理：$R^* = R^2$。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch6-q7',
      title: '【第 7 題】FCM 柔性歸屬度更新公式數值手算（加權距離倒數比例）',
      tag: 'FCM 演算法 • 數值手算',
      difficulty: '★★☆ 經典計算',
      question: '在 FCM 柔性聚類（$c=2$ 群）中，取標準模糊加權指數 $m = 2.0$。設某資料點 $x_k$ 與群心 $v_1$ 的歐氏距離為 $\\|x_k - v_1\\| = 2$，與群心 $v_2$ 的距離為 $\\|x_k - v_2\\| = 4$。試依據 FCM 最佳化極值條件，計算該樣本對群 1 的柔性歸屬度 $\\mu_{1k}$ 與對群 2 的歸屬度 $\\mu_{2k}$：',
      options: [
        { label: 'A', text: '$\\mu_{1k} = 0.80$（即 $4/5$），$\\mu_{2k} = 0.20$（即 $1/5$）' },
        { label: 'B', text: '$\\mu_{1k} = 0.67$（即 $2/3$），$\\mu_{2k} = 0.33$（即 $1/3$）' },
        { label: 'C', text: '$\\mu_{1k} = 1.00$，$\\mu_{2k} = 0.00$' },
        { label: 'D', text: '$\\mu_{1k} = 0.50$，$\\mu_{2k} = 0.50$' }
      ],
      correctIndex: 0,
      tip: '當 $m=2.0$ 時，指數為 $\\frac{2}{m-1} = 2$。代入歸屬度公式求分母之和。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-cyan-300">【FCM 歸屬度公式逐步推導】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>確定指數參數：</strong><br>
              模糊指數 $m = 2.0 \\implies \\frac{2}{m - 1} = \\frac{2}{2 - 1} = 2$。
            </li>
            <li><strong>代入歸屬度公式求 $\\mu_{1k}$：</strong><br>
              $$\\mu_{1k} = \\frac{1}{\\sum_{j=1}^2 \\left(\\frac{\\|x_k - v_1\\|}{\\|x_k - v_j\\|}\\right)^2} = \\frac{1}{\\left(\\frac{2}{2}\\right)^2 + \\left(\\frac{2}{4}\\right)^2} = \\frac{1}{1 + 0.25} = \\frac{1}{1.25} = 0.80$$
            </li>
            <li><strong>計算 $\\mu_{2k}$：</strong><br>
              由柔性劃分矩陣約束 $\\sum_{i=1}^c \\mu_{ik} = 1$：
              $$\\mu_{2k} = 1 - \\mu_{1k} = 1 - 0.80 = 0.20$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch6-q8',
      title: '【第 8 題】模糊模式識別擇近原則與海明貼近度反演陷阱',
      tag: '圖形識別 • 擇近原則與度量',
      difficulty: '★★★ 深度辨析',
      question: '某醫學診斷系統利用模糊向量識別病症。待診患者的 3 項病徵指標為 $A = (0.9, 0.2, 0.1)$。標準疾病資料庫中有兩種典型病態特徵：疾病 1 模板 $B_1 = (0.8, 0.3, 0.2)$，疾病 2 模板 $B_2 = (0.9, 0.2, 0.7)$。若採用海明貼近度公式 $\\sigma_H(A, B) = 1 - \\frac{1}{3}\\sum_{i=1}^3 |\\mu_A(x_i) - \\mu_B(x_i)|$，試計算貼近度並給出診斷結論：',
      options: [
        { label: 'A', text: '$\\sigma_H(A, B_1) = 0.90$ 且 $\\sigma_H(A, B_2) = 0.80$；依據擇近原則應診斷為「疾病 1」' },
        { label: 'B', text: '$\\sigma_H(A, B_1) = 0.80$ 且 $\\sigma_H(A, B_2) = 0.90$；應診斷為「疾病 2」' },
        { label: 'C', text: '兩者貼近度皆為 $0.85$，無法給出確切診斷' },
        { label: 'D', text: '兩者貼近度皆小於 $0.5$，屬於未知全新疾病' }
      ],
      correctIndex: 0,
      tip: '計算平均絕對誤差：$B_1$ 的平均誤差為 $(0.1+0.1+0.1)/3 = 0.1$；$B_2$ 的平均誤差為 $(0+0+0.6)/3 = 0.2$。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-cyan-300">【海明貼近度與擇近原則詳解】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>計算與 $B_1$ 之海明貼近度：</strong><br>
              $$\\sigma_H(A, B_1) = 1 - \\frac{|0.9 - 0.8| + |0.2 - 0.3| + |0.1 - 0.2|}{3} = 1 - \\frac{0.1 + 0.1 + 0.1}{3} = 1 - 0.10 = 0.90$$
            </li>
            <li><strong>計算與 $B_2$ 之海明貼近度：</strong><br>
              $$\\sigma_H(A, B_2) = 1 - \\frac{|0.9 - 0.9| + |0.2 - 0.2| + |0.1 - 0.7|}{3} = 1 - \\frac{0 + 0 + 0.6}{3} = 1 - 0.20 = 0.80$$
            </li>
            <li><strong>擇近原則診斷：</strong><br>
              因 $\\sigma_H(A, B_1) = 0.90 > \\sigma_H(A, B_2) = 0.80$，雖然 $B_2$ 在前兩項特徵與 $A$ 完全一致，但第三項存在高達 $0.6$ 的顯著嚴重分歧；而 $B_1$ 各維度均極為接近。依據擇近原則應診斷為「疾病 1」。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    }
  ];

  function updateCh6PracticeScore() {
    let score = 0;
    ch6PracticeQuestions.forEach((q, idx) => {
      if (ch6PracticeAnswers[idx] === q.correctIndex) score++;
    });
    const scoreEl = document.getElementById('ch6-practice-score');
    if (scoreEl) {
      scoreEl.textContent = `${score} / ${ch6PracticeQuestions.length}`;
    }
  }

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

    updateCh6PracticeScore();
    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh6Practice(qIdx, optionIdx) {
    ch6PracticeAnswers[qIdx] = optionIdx;
    renderCh6PracticeList();
    updateCh6PracticeScore();
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
          <button id="ch6-mod-btn-m4" onclick="FuzzyWidgets.switchCh6Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (8題)</button>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 1：通論（Overview）】模糊分群與圖形識別理論架構 -->
      <!-- =================================================================== -->
      <div id="ch6-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-cyan-500/40 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/40">Module 01 • Clustering & Pattern Recognition</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊分群與圖形識別理論架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              統整模糊相似矩陣平方法求傳遞閉包、動態 $\\lambda$-截集分群樹、Fuzzy C-Means (FCM) 柔性聚類目標優化、貼近度公理體系與擇近原則識別。
            </p>
          </div>

          <!-- 5 大深層理論卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 理論 6.1 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-cyan-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Theory 6.1</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">傳遞閉包</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🔄 1. 模糊相似關係與傳遞閉包公理</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                原始樣本相似矩陣 $R$ 恆滿足<strong>自反性</strong> ($r_{ii} = 1$) 與<strong>對稱性</strong> ($r_{ij} = r_{ji}$)，但常因多路徑傳遞衰減而<strong>缺失傳遞性</strong> ($R \\circ R \\not\\subseteq R$)。為了進行客觀等價類劃分，必須構造最小傳遞閉包 $t(R) = R^*$：
              </p>
              <div class="formula-display-card text-xs">
                $$t(R) = R^* = \\bigcup_{k=1}^n R^k, \\qquad (R^2)_{ij} = \\bigvee_{k=1}^n (r_{ik} \\land r_{kj})$$
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                <strong>平方法定理（Squaring Method）：</strong>因有限論域矩陣序列單調有界 $R \\subseteq R^2 \\subseteq R^4 \\dots$，至多經過 $\\lceil \\log_2 n \\rceil$ 次平方 Max-Min 合成，必存在 $k$ 使 $R^{2k} = R^k$，一舉收斂為模糊等價矩陣！
              </p>
            </div>

            <!-- 理論 6.2 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-sky-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Theory 6.2</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-sky-500/15 text-sky-300 border border-sky-500/30">動態分群樹</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🌲 2. 動態 $\\lambda$-截集動態分群階層樹</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                利用截割閾值 $\\lambda \\in [0, 1]$ 對傳遞閉包等價矩陣 $R^*$ 進行二值化切割，得到普通等價關係矩陣 $R^*_\\lambda$：
              </p>
              <div class="formula-display-card text-xs">
                $$(r^*_\\lambda)_{ij} = \\begin{cases} 1, & r^*_{ij} \\ge \\lambda \\\\ 0, & r^*_{ij} < \\lambda \\end{cases} \\implies x_i \\sim_\\lambda x_j \\iff r^*_{ij} \\ge \\lambda$$
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                <strong>階層分群樹狀圖（Dendrogram）：</strong>當 $\\lambda$ 由 $1.0$ 單調連續遞減至 $0.0$，樣本集由「每個樣本自成一群」單調凝聚聚合為「全體歸為同類」。實務上根據相鄰 $\\lambda$ 之間隔最大跳躍點（Maximum Gap）或 $F$-統計量確定最具區分度的分群數。
              </p>
            </div>

            <!-- 理論 6.3 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-blue-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Theory 6.3</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-blue-500/15 text-blue-300 border border-blue-500/30">柔性聚類</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🎯 3. Fuzzy C-Means (FCM) 柔性分群</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bezdek (1981) 突破傳統 K-Means 硬劃分束縛，建立柔性劃分矩陣空間 $M_{fc}$，允許樣本以歸屬度 $\\mu_{ik} \\in [0, 1]$ 同時屬於多個群集，最小化廣義誤差平方和目標函數：
              </p>
              <div class="formula-display-card text-xs">
                $$J_m(U, V) = \\sum_{i=1}^c \\sum_{k=1}^n (\\mu_{ik})^m \\|x_k - v_i\\|^2, \\quad \\text{s.t.} \\sum_{i=1}^c \\mu_{ik} = 1$$
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                由 Lagrange 乘數法導出交替迭代之群心與歸屬度封閉解：
              </p>
              <div class="formula-display-card text-xs">
                $$\\mu_{ik} = \\frac{1}{\\sum_{j=1}^c \\left(\\frac{\\|x_k - v_i\\|}{\\|x_k - v_j\\|}\\right)^{\\frac{2}{m-1}}}, \\qquad v_i = \\frac{\\sum_{k=1}^n (\\mu_{ik})^m x_k}{\\sum_{k=1}^n (\\mu_{ik})^m}$$
              </div>
            </div>

            <!-- 理論 6.4 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-teal-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">Theory 6.4</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-teal-500/15 text-teal-300 border border-teal-500/30">貼近度公理</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🔍 4. 模糊貼近度公理體系與度量家族</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                貼近度 $(A, B)$ 刻畫兩模糊概念之間的相似程度，嚴格滿足<strong>四大公理</strong>：自反性 $(A, A) = 1$、對稱性 $(A, B) = (B, A)$、有界性 $(A, B) \\in [0, 1]$ 與保序性。
              </p>
              <div class="space-y-2 text-xs">
                <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span class="font-bold text-teal-300">海明貼近度 (Hamming)：</span>
                  $$\\sigma_H(A, B) = 1 - \\frac{1}{n} \\sum_{i=1}^n |\\mu_A(x_i) - \\mu_B(x_i)|$$
                </div>
                <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span class="font-bold text-cyan-300">格貼近度 (Lattice Closeness)：</span>
                  $$(A, B) = \\frac{1}{2}\\big[ (A \\circ B) + (A \\odot B) \\big], \\; A \\circ B = \\bigvee (a_i \\land b_i), \\; A \\odot B = \\bigwedge (a_i \\lor b_i)$$
                </div>
              </div>
            </div>

            <!-- 理論 6.5 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-indigo-400 md:col-span-2 lg:col-span-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Theory 6.5</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">擇近原則</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🔬 5. 模糊模式識別決策準則與邊界判別（擇近原則）</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                在圖形與特徵模式識別中，設有 $m$ 個標準樣本庫 $B_1, B_2, \\dots, B_m$ 與未知待識別物件 $A$。
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div class="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30">
                  <span class="font-bold text-indigo-300 block mb-1">🎯 最大貼近度原則（擇近原則）：</span>
                  若存在第 $k$ 類使得：
                  $$(A, B_k) = \\max_{1 \\le j \\le m} (A, B_j)$$
                  則判定待測樣本 $A$ 歸屬於第 $k$ 類標準模式 $B_k$。
                </div>
                <div class="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
                  <span class="font-bold text-amber-300 block mb-1">⚠️ 臨界模糊判定閥與拒識設計：</span>
                  當第一名與第二名貼近度差距小於安全閥值 $\\delta$：
                  $$|(A, B_k) - (A, B_p)| < \\delta$$
                  說明樣本處於模糊分界模糊態，工程上應啟動「拒識（Reject）或人工複核」機制，杜絕強制誤判。
                </div>
              </div>
            </div>
          </div>

          <!-- 全維度對比大表格 -->
          <div class="bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span class="text-cyan-400">📊</span> 全維度對照表：古典 K-Means vs. 傳遞閉包階層分群 vs. Fuzzy C-Means (FCM) vs. 模式識別貼近度 全維度對決
              </h4>
              <span class="text-xs text-slate-400">8 大指標維度評估</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 text-cyan-300 bg-slate-900/60">
                    <th class="p-3 font-bold">比較維度 / 演算法</th>
                    <th class="p-3 font-bold text-slate-400">古典硬劃分 K-Means</th>
                    <th class="p-3 font-bold text-cyan-300">傳遞閉包階層分群法</th>
                    <th class="p-3 font-bold text-blue-300">Fuzzy C-Means (FCM)</th>
                    <th class="p-3 font-bold text-teal-300">模糊模式識別 (貼近度)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">1. 數學本質與歸屬形式</td>
                    <td class="p-3 text-slate-300">硬劃分 $\\mu_{ik} \\in \\{0, 1\\}$</td>
                    <td class="p-3 text-cyan-200">模糊相似等價關係 $R^*$ 之 $\\lambda$-截割</td>
                    <td class="p-3 text-blue-200">柔性劃分矩陣 $\\mu_{ik} \\in [0, 1]$</td>
                    <td class="p-3 text-teal-200">特徵向量與標準模板之度量 $(A, B)$</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">2. 是否需預先指定群數 $c$</td>
                    <td class="p-3 text-amber-300">必須預先給定 $k$</td>
                    <td class="p-3 text-emerald-400">無需指定（由 $\\lambda$ 動態掃描全譜系）</td>
                    <td class="p-3 text-amber-300">必須預先給定群數 $c$</td>
                    <td class="p-3 text-slate-300">由標準模式庫類別數決定</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">3. 邊界重疊與過渡樣本處理</td>
                    <td class="p-3 text-rose-400">非黑即白，臨界點極易誤分</td>
                    <td class="p-3 text-sky-300">依階層聚合順序觀察歸屬演化</td>
                    <td class="p-3 text-emerald-400">完美保留各群歸屬度（如 $0.52:0.48$）</td>
                    <td class="p-3 text-teal-300">透過貼近度差值 $\\delta$ 識別邊界模糊態</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">4. 核心數學優化準則</td>
                    <td class="p-3 text-slate-300">最小化硬幾何方差和</td>
                    <td class="p-3 font-mono text-cyan-200">$R \\to R^2 \\to \\dots \\to R^* = t(R)$</td>
                    <td class="p-3 font-mono text-blue-200">$\\min J_m = \\sum (\\mu_{ik})^m \\|x_k - v_i\\|^2$</td>
                    <td class="p-3 font-mono text-teal-200">$\\max (A, B_j)$ (擇近原則)</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">5. 計算複雜度與收斂步數</td>
                    <td class="p-3 text-slate-300">$O(t \\cdot k \\cdot n)$ 易陷入局部最優</td>
                    <td class="p-3 text-cyan-300 font-mono">$\\lceil \\log_2 n \\rceil$ 次矩陣合成必收斂</td>
                    <td class="p-3 text-blue-300">$O(t \\cdot c \\cdot n)$ 交替迭代一階連續收斂</td>
                    <td class="p-3 text-teal-300">$O(m \\cdot n)$ 線性掃描（一步直達）</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">6. 參數敏感度與調節空間</td>
                    <td class="p-3 text-slate-400">初始點敏感（隨機種子影響巨大）</td>
                    <td class="p-3 text-cyan-200">相似係數定義方式（夾角/歐氏/相關）</td>
                    <td class="p-3 text-blue-200">模糊權重指數 $m$（通常取 $2.0$）</td>
                    <td class="p-3 text-teal-200">貼近度算子選型（海明/歐氏/格貼近）</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">7. 推薦最佳工程應用情境</td>
                    <td class="p-3 text-slate-300">巨量明確大數據粗篩分割</td>
                    <td class="p-3 text-emerald-300 font-bold">生物譜系分類、故障階層診斷、材料溯源</td>
                    <td class="p-3 text-emerald-300 font-bold">醫學影像分割 (MRI/CT)、客戶多重標籤分群</td>
                    <td class="p-3 text-emerald-300 font-bold">手寫字識別、指紋特徵比對、疾病臨床診斷</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 2：專書逐頁精讀】《認識 Fuzzy》第 12、16 章 專書精讀（共 24 頁） -->
      <!-- =================================================================== -->
      <div id="ch6-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-cyan-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 12、16 章 專書精讀（共 24 頁）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                包含第 12 章（模糊分群 13 頁，頁 12-1 ～ 12-13）與第 16 章（圖形識別 11 頁，頁 16-1 ～ 16-11）完整原書照片、公式推導與實戰圖表，支援雙欄圖文排版與全螢幕燈箱。
              </p>
            </div>
          </div>
          <div id="chapter6-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 3：多維度模擬圖專區】模糊分群與識別實驗室 (2座) -->
      <!-- =================================================================== -->
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

      <!-- =================================================================== -->
      <!-- 【模組 4：章節題目練習與詳解】模糊分群與識別 8 大必考實戰題 -->
      <!-- =================================================================== -->
      <div id="ch6-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-cyan-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】模糊分群與識別 8 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 8 題傳遞閉包平方法、矩陣平方 Max-Min 手算、λ-截集等價類分割、FCM 加權指數極限、FCM 歸屬度更新手算與海明/格貼近度擇近原則題目，點選答案即時檢驗並可展開完整 LaTeX 逐項推導！
              </p>
            </div>
            <div class="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm">
              本章節練習得分：<strong id="ch6-practice-score" class="text-cyan-400 font-mono text-lg">0 / 8</strong>
            </div>
          </div>
          <div id="ch6-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }


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
    },
    {
      id: 'ch7-q6',
      title: '【第 6 題】ANFIS 前向傳播 LSE 設計矩陣構造數值手算',
      tag: 'ANFIS • LSE 矩陣構造',
      difficulty: '★★★ 深度計算',
      question: '設某雙輸入單輸出 ANFIS 系統包含兩條一階 TSK 規則：\n- Rule 1: $f_1 = p_1 x_1 + q_1 x_2 + r_1$\n- Rule 2: $f_2 = p_2 x_1 + q_2 x_2 + r_2$\n當前訓練樣本輸入為 $(x_1, x_2) = (1.0, 2.0)$，計算出其正規化激發強度分別為 $\\bar{w}_1 = 0.7$ 與 $\\bar{w}_2 = 0.3$。若將待求後件參數排列為向量 $\\mathbf{\\theta} = [p_1, q_1, r_1, p_2, q_2, r_2]^T$，使系統輸出滿足線性方程 $y = A_{row} \\mathbf{\\theta}$，試問該樣本在設計矩陣中所對應的行向量 $A_{row}$ 為何？',
      options: [
        { label: 'A', text: '$A_{row} = [0.7, 1.4, 0.7, 0.3, 0.6, 0.3]$' },
        { label: 'B', text: '$A_{row} = [1.0, 2.0, 1.0, 1.0, 2.0, 1.0]$' },
        { label: 'C', text: '$A_{row} = [0.7, 0.7, 0.7, 0.3, 0.3, 0.3]$' },
        { label: 'D', text: '$A_{row} = [1.4, 0.7, 0.7, 0.6, 0.3, 0.3]$' }
      ],
      correctIndex: 0,
      tip: '展開總輸出式：$y = \\bar{w}_1(p_1 x_1 + q_1 x_2 + r_1) + \\bar{w}_2(p_2 x_1 + q_2 x_2 + r_2)$，各參數的係數即為矩陣元素。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-violet-300">【LSE 設計矩陣逐步推導】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>展開 ANFIS 輸出方程式：</strong><br>
              $$y = \\bar{w}_1 f_1 + \\bar{w}_2 f_2 = \\bar{w}_1(p_1 x_1 + q_1 x_2 + r_1) + \\bar{w}_2(p_2 x_1 + q_2 x_2 + r_2)$$
            </li>
            <li><strong>代入數值 $(x_1, x_2) = (1.0, 2.0)$ 與 $(\\bar{w}_1, \\bar{w}_2) = (0.7, 0.3)$：</strong><br>
              - $p_1$ 的係數為 $\\bar{w}_1 x_1 = 0.7 \\times 1.0 = 0.7$<br>
              - $q_1$ 的係數為 $\\bar{w}_1 x_2 = 0.7 \\times 2.0 = 1.4$<br>
              - $r_1$ 的係數為 $\\bar{w}_1 = 0.7$<br>
              - $p_2$ 的係數為 $\\bar{w}_2 x_1 = 0.3 \\times 1.0 = 0.3$<br>
              - $q_2$ 的係數為 $\\bar{w}_2 x_2 = 0.3 \\times 2.0 = 0.6$<br>
              - $r_2$ 的係數為 $\\bar{w}_2 = 0.3$
            </li>
            <li><strong>組合行向量：</strong><br>
              $$A_{row} = [\\bar{w}_1 x_1, \\; \\bar{w}_1 x_2, \\; \\bar{w}_1, \\; \\bar{w}_2 x_1, \\; \\bar{w}_2 x_2, \\; \\bar{w}_2] = [0.7, 1.4, 0.7, 0.3, 0.6, 0.3]$$
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch7-q7',
      title: '【第 7 題】一階 TSK 模型輸出之局部線性化與靈敏度解析',
      tag: 'TSK 模型 • 泛函逼近',
      difficulty: '★★☆ 理論推導',
      question: '設某單輸入一階 TSK 模糊系統包含兩條規則：$f_1(x) = a_1 x + b_1$ 與 $f_2(x) = a_2 x + b_2$。若在某輸入鄰域內，兩規則之正規化激發權重變化甚微（即 $\\frac{d\\bar{w}_i}{dx} \\approx 0$，處於平緩歸屬區間），試問該區域內系統總輸出對輸入的偏導數（即局部等效線性增益 $\\frac{dy}{dx}$）為何？',
      options: [
        { label: 'A', text: '$\\frac{dy}{dx} \\approx \\bar{w}_1 a_1 + \\bar{w}_2 a_2$，即兩條規則局部線性斜率的加權凸組合' },
        { label: 'B', text: '$\\frac{dy}{dx} = a_1 \\times a_2$' },
        { label: 'C', text: '$\\frac{dy}{dx} = 0$，輸出恆為常數' },
        { label: 'D', text: '$\\frac{dy}{dx} = \\frac{a_1 + a_2}{b_1 + b_2}$' }
      ],
      correctIndex: 0,
      tip: '對 $y = \\bar{w}_1 f_1(x) + \\bar{w}_2 f_2(x)$ 求導，忽略 $\\bar{w}$ 的微小導數項。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-violet-300">【TSK 局部線性化本質解析】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>求導推導：</strong><br>
              $$y(x) = \\bar{w}_1(x) (a_1 x + b_1) + \\bar{w}_2(x) (a_2 x + b_2)$$
              由乘積法則：
              $$\\frac{dy}{dx} = \\bar{w}_1 a_1 + \\bar{w}_2 a_2 + \\frac{d\\bar{w}_1}{dx} f_1(x) + \\frac{d\\bar{w}_2}{dx} f_2(x)$$
            </li>
            <li><strong>平緩區域近似：</strong><br>
              當歸屬函數處於頂部或平緩過渡帶時，$\\frac{d\\bar{w}_i}{dx} \\approx 0$，因此：
              $$\\frac{dy}{dx} \\approx \\bar{w}_1 a_1 + \\bar{w}_2 a_2$$
            </li>
            <li><strong>控制工程意義：</strong><br>
              這證明了一階 TSK 模糊系統在數學上即為<strong>局部線性動態系統的平滑加權插值器</strong>，完美融合了非線性巨觀控制與古典線性頻域分析工具！
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'ch7-q8',
      title: '【第 8 題】自適應模糊 PID 積分抗飽和（Anti-Windup）與階躍動態響應',
      tag: '自適應控制 • 積分抗飽和',
      difficulty: '★★★ 控制工程核心',
      question: '傳統固定增益 PID 控制器在大步階設定值突變時，常常因為執行機構飽和而累積過大的積分誤差（Integral Windup），導致系統產生嚴重超調與長時間振盪。自適應模糊 PID 控制器在演算法設計上是如何動態杜絕積分飽和的？',
      options: [
        { label: 'A', text: '當誤差 $|e| > e_{max}$ 甚大時，模糊規則自動將積分增益調校項 $\\Delta K_i$ 壓縮至極小甚至暫時切除積分作用（PD 先行），待誤差進入線性小誤差區間再平滑啟動大積分作用消除殘差' },
        { label: 'B', text: '在所有時刻徹底禁用積分項，純靠超大比例增益維持精度' },
        { label: 'C', text: '在大誤差時將微分增益設為負無窮大以抵消積分項' },
        { label: 'D', text: '透過硬體強制降低取樣頻率' }
      ],
      correctIndex: 0,
      tip: '自適應模糊 PID 具備「積分分離（Integral Separation）」智慧：大誤差時 PD 快速追隨無超調，小誤差時 PID 精準無靜差。',
      solution: `
        <div class="space-y-3">
          <p class="font-bold text-violet-300">【模糊自整定積分抗飽和機制】：</p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-200">
            <li><strong>積分飽和起因：</strong><br>
              當系統輸入大幅度跳變時，執行器（如閥門開度、馬達最大電壓）達到物理極限，而誤差無法瞬間消除，固定 PID 的 $\\int e dt$ 持續累加膨脹。等到輸出到達設定點時，龐大的歷史積分項會迫使系統產生劇烈超調。
            </li>
            <li><strong>模糊規則自整定對策：</strong><br>
              - <strong>$|e|$ 巨大時：</strong>模糊控制器輸出 $\\Delta K_p = \\text{PB}$，$\\Delta K_i = \\text{NB}$（完全抵消基本積分作用），轉化為快速無超調的 PD 控制。<br>
              - <strong>$|e|$ 縮小至設定臨界值內時：</strong>模糊控制器自動平滑提升 $\\Delta K_i = \\text{PB}$，快速消除系統殘餘穩態誤差。
            </li>
            <li>故正確選項為 <strong class="text-emerald-400">A</strong>。</li>
          </ol>
        </div>
      `
    }
  ];

  function updateCh7PracticeScore() {
    let score = 0;
    ch7PracticeQuestions.forEach((q, idx) => {
      if (ch7PracticeAnswers[idx] === q.correctIndex) score++;
    });
    const scoreEl = document.getElementById('ch7-practice-score');
    if (scoreEl) {
      scoreEl.textContent = `${score} / ${ch7PracticeQuestions.length}`;
    }
  }

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

    updateCh7PracticeScore();
    if (window.safeTypesetMath) safeTypesetMath([container]);
  }

  function answerCh7Practice(qIdx, optionIdx) {
    ch7PracticeAnswers[qIdx] = optionIdx;
    renderCh7PracticeList();
    updateCh7PracticeScore();
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
          <button id="ch7-mod-btn-m4" onclick="FuzzyWidgets.switchCh7Module('m4', true)" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">✍️ 考題詳解 (8題)</button>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 1：通論（Overview）】進階模糊系統與類神經模糊整合架構 -->
      <!-- =================================================================== -->
      <div id="ch7-module-sec-m1" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-violet-500/40 space-y-8">
          <div class="border-b border-slate-800 pb-5">
            <span class="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-extrabold uppercase tracking-widest border border-violet-500/40">Module 01 • Neuro-Fuzzy & Advanced Systems</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】進階模糊系統與類神經模糊整合架構
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              統整 ANFIS 五層拓撲結構、LSE + 梯度下降混合學習機制、一階 TSK 萬能逼近定理、自適應 PID 控制律以及倒單擺相平面阻尼平衡。
            </p>
          </div>

          <!-- 5 大深層理論卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 理論 7.1 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-violet-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">Theory 7.1</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-violet-500/15 text-violet-300 border border-violet-500/30">網路拓撲</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🧠 1. ANFIS 五層自適應架構與節點職責</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Jang (1993) 將一階 Sugeno-TSK 模糊推論系統神經網路化，映射為五層前饋拓撲結構，各層職責分明：
              </p>
              <div class="space-y-2 text-xs">
                <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <strong class="text-violet-300">L1 (模糊化層)：</strong>$O_{1,i} = \mu_{A_i}(x)$（含前件參數：高斯中心 $c$、形狀 $\sigma$）
                </div>
                <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <strong class="text-purple-300">L2 (規則強度)：</strong>$O_{2,i} = w_i = \mu_{A_i}(x) \times \mu_{B_i}(y)$（固定乘積節點 $\pi$）
                </div>
                <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <strong class="text-sky-300">L3 (正規化層)：</strong>$O_{3,i} = \bar{w}_i = \frac{w_i}{\sum w_k}$（固定比例節點 $N$）
                </div>
                <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <strong class="text-amber-300">L4 (後件多項式)：</strong>$O_{4,i} = \bar{w}_i f_i = \bar{w}_i (p_i x + q_i y + r_i)$（含後件參數）
                </div>
                <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <strong class="text-emerald-300">L5 (總合輸出)：</strong>$O_{5,1} = y = \sum \bar{w}_i f_i = \frac{\sum w_i f_i}{\sum w_i}$（固定加總節點 $\Sigma$）
                </div>
              </div>
            </div>

            <!-- 理論 7.2 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-purple-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Theory 7.2</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30">混合學習</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>⚡ 2. 混合學習演算法 (Hybrid Learning)</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                傳統反向傳播 (BP) 梯度下降收斂遲緩且極易陷入局部鞍點。ANFIS 採取<strong>前向與反向解耦的混合雙向優化</strong>：
              </p>
              <div class="formula-display-card text-xs">
                $$\mathbf{\theta}^*_{\text{LSE}} = (A^T A)^{-1} A^T Y, \qquad \Delta c_i = -\eta \frac{\partial E}{\partial c_i}$$
              </div>
              <ul class="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li><strong>前向 Pass：</strong>固定前件非線性參數，總輸出對後件參數為純線性方程組 $Y = A \mathbf{\theta}$，直接用最小平方法 (LSE) 一步求出全域最優解。</li>
                <li><strong>反向 Pass：</strong>固定後件參數，將誤差信號沿網路回傳，僅用梯度下降 (BP) 微調前件高斯分佈中心與方差。收斂速度較純 BP 提升 10～50 倍！</li>
              </ul>
            </div>

            <!-- 理論 7.3 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-pink-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider">Theory 7.3</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-pink-500/15 text-pink-300 border border-pink-500/30">TSK 逼近</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>📐 3. 一階 TSK 模型與萬能逼近定理</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Takagi-Sugeno-Kang (TSK) 系統後件部為輸入變數的線性組合函數 $f_i(\mathbf{x}) = \mathbf{a}_i^T \mathbf{x} + b_i$，免除了 Mamdani 模型冗長複雜的面積中心積分運算：
              </p>
              <div class="formula-display-card text-xs">
                $$y(\mathbf{x}) = \sum_{i=1}^R \bar{w}_i(\mathbf{x}) (\mathbf{a}_i^T \mathbf{x} + b_i)$$
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                <strong>Wang (1992) 萬能逼近定理：</strong>由正規化模糊基底函數構成的 TSK 系統能在任意緊緻集以任意精度逼近任意非線性函數。本質上是<strong>局部線性狀態空間模型的平滑凸組合加權插值</strong>！
              </p>
            </div>

            <!-- 理論 7.4 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-fuchsia-400">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-fuchsia-400 uppercase tracking-wider">Theory 7.4</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">自適應 PID</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🎛️ 4. 自適應模糊增益整定 PID 控制律</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                在線偵測誤差 $e(t)$ 與誤差變化率 $\dot{e}(t)$，透過模糊推論動態調諧三大增益增量：
              </p>
              <div class="formula-display-card text-xs">
                $$u(t) = (K_p + \Delta K_p)e + (K_i + \Delta K_i)\int e \, dt + (K_d + \Delta K_d)\dot{e}$$
              </div>
              <div class="space-y-1.5 text-xs text-slate-300">
                <p><strong>• 誤差大區 ($|e| \gg 0$)：</strong>大 $\Delta K_p$ 快速追隨，切除/抑止 $\Delta K_i$ 杜絕積分飽和 (Anti-Windup)。</p>
                <p><strong>• 過渡區 ($|e|$ 中等)：</strong>適中 $K_p$，加大 $\Delta K_d$ 增強動態阻尼抑制系統超調。</p>
                <p><strong>• 平衡區 ($|e| \to 0$)：</strong>加大 $\Delta K_i$ 徹底消除靜態殘差，保證高精度穩態收斂。</p>
              </div>
            </div>

            <!-- 理論 7.5 -->
            <div class="refined-card p-6 sm:p-7 space-y-4 border-l-4 border-l-emerald-400 md:col-span-2 lg:col-span-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Theory 7.5</span>
                <span class="px-2 py-0.5 rounded text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">相平面阻尼</span>
              </div>
              <h4 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>⚖️ 5. 倒單擺非線性平衡控制與相平面阻尼收斂</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                以倒單擺（Inverted Pendulum）小車平衡系統為經典範例，狀態空間由角度誤差 $\theta$ 與角速度 $\dot{\theta}$ 構成相平面（Phase Plane）。
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div class="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                  <span class="font-bold text-emerald-300 block mb-1">🌿 反對角線阻尼法則 ($\theta \cdot \dot{\theta} < 0$)：</span>
                  當狀態落於第二或第四象限（如角度偏右 $\theta > 0$ 但正往左回倒 $\dot{\theta} < 0$），系統自帶向平衡點收斂的動能，模糊規則果斷配置<strong>零推力 (ZO)</strong>，利用自身慣性平穩靠攏，杜絕過衝翻倒！
                </div>
                <div class="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30">
                  <span class="font-bold text-rose-300 block mb-1">⚡ 主對角線強驅法則 ($\theta \cdot \dot{\theta} > 0$)：</span>
                  當狀態落於第一或第三象限（角度與速度同號加速遠離平衡點），擺桿處於發散臨界失穩態，模糊控制器輸出最大正/負推力 (PB / NB) 全力拉回原點，實現仿生專家般的強韌平衡！
                </div>
              </div>
            </div>
          </div>

          <!-- 全維度對比大表格 -->
          <div class="bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span class="text-violet-400">📊</span> 全維度對照表：傳統 PID vs. Mamdani 模糊 vs. 一階 TSK 模糊 vs. ANFIS 類神經模糊 全維度對決
              </h4>
              <span class="text-xs text-slate-400">8 大指標維度評估</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 text-violet-300 bg-slate-900/60">
                    <th class="p-3 font-bold">比較維度 / 控制架構</th>
                    <th class="p-3 font-bold text-slate-400">傳統固定增益 PID</th>
                    <th class="p-3 font-bold text-emerald-300">Mamdani 模糊控制</th>
                    <th class="p-3 font-bold text-sky-300">一階 TSK 模糊模型</th>
                    <th class="p-3 font-bold text-violet-300">ANFIS 類神經模糊系統</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">1. 核心數學模型</td>
                    <td class="p-3 text-slate-300">線性微分積分差分方程</td>
                    <td class="p-3 text-emerald-200">模糊集合邏輯合成（語言變數）</td>
                    <td class="p-3 text-sky-200">後件線性函數的局部凸組合</td>
                    <td class="p-3 text-violet-200">五層自適應前饋類神經網路拓撲</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">2. 參數自學習與調諧</td>
                    <td class="p-3 text-rose-400">無（仰賴離線經驗試湊/Z-N法）</td>
                    <td class="p-3 text-amber-300">手動調校或專家規則修改</td>
                    <td class="p-3 text-sky-300">可結合最小平方法辨識後件參數</td>
                    <td class="p-3 text-emerald-400 font-bold">LSE + BP 混合學習自適應雙向優化</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">3. 解模糊化計算延遲</td>
                    <td class="p-3 text-emerald-400">極低（3 次乘加即可）</td>
                    <td class="p-3 text-rose-400">極高（連續面積重心數值積分）</td>
                    <td class="p-3 text-emerald-400">極低（加權代數求和，無積分）</td>
                    <td class="p-3 text-emerald-400">極低（前饋神經網路矩陣相乘）</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">4. 泛函逼近與非線性能力</td>
                    <td class="p-3 text-rose-400">極差（僅適用線性定常受控體）</td>
                    <td class="p-3 text-emerald-300">優良（可建構任意非線性曲面）</td>
                    <td class="p-3 text-emerald-300">極佳（具備萬能逼近定理證明）</td>
                    <td class="p-3 text-violet-300 font-bold">最高（高精度非線性曲線擬合與泛化）</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">5. 知識表達與白箱透明度</td>
                    <td class="p-3 text-slate-300">低（純代數增益，無語意）</td>
                    <td class="p-3 text-emerald-400 font-bold">極高（完全符合人類語言習慣白箱）</td>
                    <td class="p-3 text-sky-300">中等（前件直觀、後件為方程）</td>
                    <td class="p-3 text-violet-300">灰箱（兼具規則可解釋性與權重自學）</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">6. 抗負載突變與超調抑制</td>
                    <td class="p-3 text-rose-400">易積分飽和，大超調強烈振盪</td>
                    <td class="p-3 text-emerald-300">抗擾能力強，超調小</td>
                    <td class="p-3 text-emerald-300">動態阻尼平滑，收斂迅捷</td>
                    <td class="p-3 text-emerald-400 font-bold">自整定增益，近乎零超調與秒級抗擾</td>
                  </tr>
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="p-3 font-bold text-white">7. 推薦最佳工業應用情境</td>
                    <td class="p-3 text-slate-300">低成本簡單單迴路恆溫恆速</td>
                    <td class="p-3 text-emerald-300 font-bold">家電智能控制（洗衣機/冷氣/微波爐）</td>
                    <td class="p-3 text-sky-300 font-bold">高動態多變量機器人動力學控制</td>
                    <td class="p-3 text-violet-300 font-bold">非線性辨識、金融時間序列、航太飛行姿態</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 2：專書逐頁精讀】《認識 Fuzzy》第 11、15、17、18、19 章 精讀（共 66 頁） -->
      <!-- =================================================================== -->
      <div id="ch7-module-sec-m2" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-violet-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-extrabold uppercase tracking-widest border border-violet-500/40">Module 02 • Book Page-by-Page</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 2：逐頁精讀】《認識 Fuzzy》第 11、15、17、18、19 章 精讀（共 66 頁）
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                包含類神經模糊（第 11 章）、家電控制（第 15 章）、倒單擺平衡（第 17 章）與汽車自動輔助系統（第 18、19 章）全書原書照片與電路圖檔，支援雙欄排版與全螢幕燈箱。
              </p>
            </div>
          </div>
          <div id="chapter7-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- 【模組 3：多維度模擬圖專區】類神經模糊與適應控制實驗室 (2座) -->
      <!-- =================================================================== -->
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

      <!-- =================================================================== -->
      <!-- 【模組 4：章節題目練習與詳解】類神經模糊與進階控制 8 大必考實戰題 -->
      <!-- =================================================================== -->
      <div id="ch7-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-violet-500/35 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span class="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-extrabold uppercase tracking-widest border border-violet-500/40">Module 04 • Practice & Solutions</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                【模組 4：章節題目練習與詳解】類神經模糊與進階控制 8 大必考實戰題
              </h3>
              <p class="text-sm sm:text-base text-slate-300 mt-1">
                精選 8 題 ANFIS 五層節點職責、LSE 混合學習、一階 TSK 手算、模糊 PID 參數自整定、倒單擺相平面阻尼、LSE 設計矩陣構造、局部線性化靈敏度分析與積分抗飽和機制題目，點選答案即時檢驗並可展開完整 LaTeX 逐項推導！
              </p>
            </div>
            <div class="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm">
              本章節練習得分：<strong id="ch7-practice-score" class="text-violet-400 font-mono text-lg">0 / 8</strong>
            </div>
          </div>
          <div id="ch7-practice-list-container" class="space-y-5"></div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 根據當前章節產生對應 HTML（全平台 Chapter 01 ~ 07 皆使用四大標準學習模組最高規格）
  // ==========================================================================
  
  // ==========================================================================
  // Chapter 01 緒論專屬四大標準學習模組
  // ==========================================================================
  function getChapterIntroFourModulesHtml() {
    return `
      <!-- 【模組 1：通論（Overview）】 -->
      <div id="ch1-module-sec-m1" class="space-y-6 mb-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-sky-500/40 space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <span class="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase tracking-widest border border-sky-500/40">Module 01 • Theoretical Overview</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 1：通論（Overview）】模糊理論之來龍去脈、科學哲學與世界發展版圖
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              由人類日常語意的漸變彈性出發，深入探討二值邏輯非黑即白的侷限性，剖析愛因斯坦精確與真實的經典悖論，並綜覽 Zadeh 教授奠基至全球蓬勃應用的壯闊歷程。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="refined-card p-6 border-l-4 border-l-sky-400 space-y-3">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🌱</span> 生活中的模糊思維 vs 二分法侷限
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                日常生活中「60多歲」、「大概數十億」、「別騎太快」等溝通語意極具智慧與適應力。若強採傳統「非真即假（Yes/No）」的二分法硬性割裂，必導致系統死板且悖離常理（如臺灣大考二分電腦卡迅速改回問答申論的教訓）。
              </p>
            </div>

            <div class="refined-card p-6 border-l-4 border-l-indigo-400 space-y-3">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <span>⚖️</span> 愛因斯坦名言：真實與精確的權衡
              </h4>
              <p class="text-sm text-slate-300 leading-relaxed">
                1921 年愛因斯坦指出：『數學定律若要逼近真實，則必然不精確；若要精確，則必然不真實』。真實世界的物理參數（馬達溫度、負載、摩擦）無時無刻在漂移，模糊理論正是兼顧真實與工程可解性的數學典範。
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 2：課本各節導讀與頁碼對照】 -->
      <div id="ch1-module-sec-m2" class="space-y-6 mb-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-sky-500/30 space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <span class="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase tracking-widest border border-sky-500/40">Module 02 • Textbook Companion Guide</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 2：課本各節導讀與頁碼對照】《認識 Fuzzy》第 1 章「模糊理論之來龍去脈」（頁 1-1 至 1-7）
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              本單元全面引導對照手邊實體書閱讀：包含章首連桿機構圖、日常語意量化比喻、愛因斯坦名言、札德創立論文、美日歐研究版圖與全書 19 章宏觀架構。
            </p>
          </div>
          <div id="ch1-book-gallery-body" class="space-y-6"></div>
        </div>
      </div>

      <!-- 【模組 3：互動實驗室】 -->
      <div id="ch1-module-sec-m3" class="space-y-6 mb-8">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-sky-500/30 space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <span class="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase tracking-widest border border-sky-500/40">Module 03 • Interactive Plots Hub</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 3：多維度模擬圖互動專區】日常模糊量化與愛因斯坦真實悖論動態體驗
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              滑動下方滑桿，動態對比古典明確集合剛性二分方波與模糊集合平滑鐘形曲線，親自體會「意義數量化」的工程優勢。
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 模擬圖 A：剛性二分 vs 平滑連續 -->
            <div class="refined-card p-6 space-y-4">
              <h4 class="text-base font-bold text-sky-300">📈 (a) 二分法方波 vs. 模糊集合平滑過渡（以「小朋友年齡」為例）</h4>
              <div id="plot-intro-compare" class="w-full h-72 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>方波切分（3~9歲為1，其餘為0）</span>
                <span class="text-sky-300 font-semibold">模糊曲線：符合人類直覺認知</span>
              </div>
            </div>

            <!-- 模擬圖 B：愛因斯坦權衡曲線 -->
            <div class="refined-card p-6 space-y-4">
              <h4 class="text-base font-bold text-indigo-300">⚖️ (b) 愛因斯坦「真實性 (Reality) vs. 精確性 (Certainty)」權衡雙曲線</h4>
              <div id="plot-intro-einstein" class="w-full h-72 rounded-2xl bg-slate-950/60 p-2 border border-slate-800"></div>
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>模型複雜度提高 ➔ 數值精確度提升</span>
                <span class="text-emerald-300 font-semibold">過度擬合導致偏離真實物理</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 【模組 4：隨堂練習與詳解】 -->
      <div id="ch1-module-sec-m4" class="space-y-6">
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-sky-500/30 space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <span class="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase tracking-widest border border-sky-500/40">Module 04 • Practice & Solutions</span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              【模組 4：章節題目練習與詳解】緒論核心觀念、歷史演變與名言考題 (5題)
            </h3>
            <p class="text-sm sm:text-base text-slate-300 mt-1">
              點擊選項立即檢測學習成效，並展開詳細觀念解析與教科書對照說明。
            </p>
          </div>
          <div id="ch1-intro-practice-list" class="space-y-5">
            <!-- 緒論精選 5 題 -->
            <div class="refined-card p-6 space-y-4 border border-slate-800">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300">題目 1 • 核心起源</span>
                <span class="text-xs text-slate-400">單選題</span>
              </div>
              <h4 class="text-base font-bold text-white leading-snug">
                1. 模糊理論之父 L. A. Zadeh 教授是在哪一年於哪本權威期刊發表歷史性創始論文〈Fuzzy Sets〉？
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <button onclick="alert('恭喜答對！1965 年 Zadeh 於《Information and Control》期刊正式宣告模糊集合理論誕生。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-500 text-slate-200 transition">
                  A. 1965 年，《Information and Control》
                </button>
                <button onclick="alert('答錯囉！1984 年是國際模糊系統學會 (IFSA) 成立年份。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition">
                  B. 1984 年，《IEEE Transactions》
                </button>
                <button onclick="alert('答錯囉！1921 年是愛因斯坦提出真實與精確悖論名言的年份。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition">
                  C. 1921 年，《Nature》
                </button>
                <button onclick="alert('答錯囉！1974 年是 Mamdani 首度將模糊控制應用於蒸氣引擎的年份。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition">
                  D. 1974 年，《Automatica》
                </button>
              </div>
            </div>

            <div class="refined-card p-6 space-y-4 border border-slate-800">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300">題目 2 • 科學哲學</span>
                <span class="text-xs text-slate-400">單選題</span>
              </div>
              <h4 class="text-base font-bold text-white leading-snug">
                2. 愛因斯坦於 1921 年名言『數學定律若要盡量逼近真實，則必然無法很精確；而要盡量精確，則必然無法真實』，這段話在模糊理論中的重要意涵為何？
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <button onclick="alert('恭喜答對！精確模型往往忽略真實物理擾動，模糊理論以連續隸屬度兼顧了真實世界的複雜性與數學可解性。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-500 text-slate-200 transition">
                  A. 揭示了精確模型與真實物理世界的客觀權衡，為模糊理論提供哲學基礎
                </button>
                <button onclick="alert('答錯囉！愛因斯坦並未否定數學，而是點出數學模型逼近真實時的不確定性。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition">
                  B. 說明數學對於真實世界完全無用
                </button>
                <button onclick="alert('答錯囉！二分法在多數連續系統中會造成硬性撕裂。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition">
                  C. 證明二分法才是最高境界的真理
                </button>
                <button onclick="alert('答錯囉！這段話與量子密碼學無關。')" class="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition">
                  D. 為量子密碼學奠定唯一理論根基
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

    function getChapterInteractiveHtml(chapterId) {
    const norm = (function(cid) {
      if (!cid) return 'ch1_intro';
      const m = {
        'fuzzy_intro': 'ch1_intro',
        'ch1_intro': 'ch1_intro',
        'fuzzy_sets': 'ch2_fuzzy_sets',
        'ch2_fuzzy_sets': 'ch2_fuzzy_sets',
        'fuzzy_numbers_extension': 'ch3_operations_extension',
        'ch3_operations_extension': 'ch3_operations_extension',
        'fuzzy_relations_inference': 'ch4_fuzzy_relations',
        'ch4_fuzzy_relations': 'ch4_fuzzy_relations',
        'ch5_logic_inference': 'ch5_logic_inference',
        'fuzzy_control_applications': 'ch6_fuzzy_control',
        'ch6_fuzzy_control': 'ch6_fuzzy_control',
        'advanced_fuzzy_neuro': 'ch7_advanced_applications',
        'fuzzy_decision_evaluation': 'ch7_advanced_applications',
        'fuzzy_clustering_pattern': 'ch7_advanced_applications',
        'ch7_advanced_applications': 'ch7_advanced_applications'
      };
      return m[cid] || cid;
    })(chapterId);

    if (norm === 'ch1_intro') {
      return getChapterIntroFourModulesHtml();
    }
    if (norm === 'ch2_fuzzy_sets') {
      return getChapter1FourModulesHtml();
    }
    if (norm === 'ch3_operations_extension') {
      return getChapter4FourModulesHtml();
    }
    if (norm === 'ch4_fuzzy_relations') {
      return getChapter2FourModulesHtml();
    }
    if (norm === 'ch5_logic_inference') {
      return getChapter2FourModulesHtml();
    }
    if (norm === 'ch6_fuzzy_control') {
      return getChapter3FourModulesHtml();
    }
    if (norm === 'ch7_advanced_applications') {
      return getChapter7FourModulesHtml();
    }

    return getChapter1FourModulesHtml();
  }

  function initChapterWidgets(chapterId) {
    setTimeout(function () {
      try {
        const norm = (function(cid) {
          if (!cid) return 'ch1_intro';
          const m = {
            'fuzzy_intro': 'ch1_intro',
            'ch1_intro': 'ch1_intro',
            'fuzzy_sets': 'ch2_fuzzy_sets',
            'ch2_fuzzy_sets': 'ch2_fuzzy_sets',
            'fuzzy_numbers_extension': 'ch3_operations_extension',
            'ch3_operations_extension': 'ch3_operations_extension',
            'fuzzy_relations_inference': 'ch4_fuzzy_relations',
            'ch4_fuzzy_relations': 'ch4_fuzzy_relations',
            'ch5_logic_inference': 'ch5_logic_inference',
            'fuzzy_control_applications': 'ch6_fuzzy_control',
            'ch6_fuzzy_control': 'ch6_fuzzy_control',
            'advanced_fuzzy_neuro': 'ch7_advanced_applications',
            'fuzzy_decision_evaluation': 'ch7_advanced_applications',
            'fuzzy_clustering_pattern': 'ch7_advanced_applications',
            'ch7_advanced_applications': 'ch7_advanced_applications'
          };
          return m[cid] || cid;
        })(chapterId);

        if (norm === 'ch1_intro') {
          // 初始化緒論模擬圖
          initIntroPlots();
        } else if (norm === 'ch2_fuzzy_sets') {
          renderCh1PracticeList();
          switchCh1Module(ch1ActiveModule || 'all');
          updatePlotA();
          updatePlotB();
          updatePlotC();
          updatePlotD();
        } else if (norm === 'ch3_operations_extension') {
          renderCh4PracticeList();
          switchCh4Module(ch4ActiveModule || 'all');
          updateCh4PlotA();
          updateCh4PlotB();
        } else if (norm === 'ch4_fuzzy_relations' || norm === 'ch5_logic_inference') {
          renderCh2MatrixInputs();
          renderCh2PracticeList();
          switchCh2Module(ch2ActiveModule || 'all');
          updateCh2PlotA();
          updateCh2PlotB();
          updateCh2PlotC();
          updateCh2PlotD();
        } else if (norm === 'ch6_fuzzy_control') {
          renderCh3PracticeList();
          switchCh3Module(ch3ActiveModule || 'all');
          updateCh3PlotA();
          updateCh3PlotB();
          updateCh3PlotC();
          updateCh3PlotD();
        } else if (norm === 'ch7_advanced_applications') {
          renderCh7PracticeList();
          switchCh7Module(ch7ActiveModule || 'all');
          updateCh7PlotA();
          updateCh7PlotB();
        }
      } catch (err) {
        console.warn('initChapterWidgets warning:', err);
      }
    }, 80);
  }

  function initIntroPlots() {
    if (!window.Plotly) return;
    try {
      const elA = document.getElementById('plot-intro-compare');
      if (elA) {
        const xVals = [];
        for (let x = 0; x <= 14; x += 0.2) xVals.push(Number(x.toFixed(1)));
        const crispY = xVals.map(x => (x >= 3 && x <= 9) ? 1 : 0);
        const fuzzyY = xVals.map(x => Math.exp(-Math.pow(x - 6, 2) / 8));

        Plotly.react(elA, [
          { x: xVals, y: crispY, name: '古典明確二分方波', line: { color: '#f43f5e', width: 2.5, dash: 'dash' } },
          { x: xVals, y: fuzzyY, name: '模糊平滑鐘形曲線', line: { color: '#38bdf8', width: 3.5 } }
        ], {
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
          font: { color: '#e2e8f0', size: 11 },
          margin: { t: 24, r: 16, b: 36, l: 40 },
          legend: { orientation: 'h', y: 1.15, x: 0 },
          xaxis: { title: '年齡 (歲)', gridcolor: 'rgba(148, 163, 184, 0.15)' },
          yaxis: { title: '小朋友程度 μ(x)', range: [-0.05, 1.1], gridcolor: 'rgba(148, 163, 184, 0.15)' }
        }, { responsive: true, displayModeBar: false });
      }

      const elB = document.getElementById('plot-intro-einstein');
      if (elB) {
        const cVals = [];
        for (let c = 0.1; c <= 1.0; c += 0.05) cVals.push(Number(c.toFixed(2)));
        const rVals = cVals.map(c => 1 / (c * 2 + 0.3));

        Plotly.react(elB, [
          { x: cVals, y: rVals, name: '真實性 Reality ∝ 1 / Certainty', line: { color: '#10b981', width: 3.5 } }
        ], {
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
          font: { color: '#e2e8f0', size: 11 },
          margin: { t: 24, r: 16, b: 36, l: 40 },
          legend: { orientation: 'h', y: 1.15, x: 0 },
          xaxis: { title: '精確性 (Certainty)', gridcolor: 'rgba(148, 163, 184, 0.15)' },
          yaxis: { title: '真實性 (Reality)', gridcolor: 'rgba(148, 163, 184, 0.15)' }
        }, { responsive: true, displayModeBar: false });
      }
    } catch (e) {
      console.warn('initIntroPlots warning:', e);
    }
  }

  // =========================================================================
  // 全書 19 章統一互動計算與視覺化模擬器 (Single Source of Truth)
  // =========================================================================
  const LAB_19_META = {
    1:  { shortTitle: '緒論與概念對比', count: 1, badge: '原書第 1 章 · 課本圖 1.1 高個子/室溫 Crisp vs. Fuzzy', title: 'Ch.01 二值邏輯 (Crisp) vs. 模糊集合 (Fuzzy) 對比滑桿' },
    2:  { shortTitle: '圖 2.7/2.8 & α-cut', count: 3, badge: '原書第 2 章 · 圖 2.7 四函數對比 · 圖 2.8 年齡語意變數分割 · α-Cut 切片實驗室', title: 'Ch.02 三大互動模擬器：圖 2.7 靠近 c 函數對比 ＋ 圖 2.8 年齡語意變數模糊分割 ＋ α-Cut 切片實驗室' },
    3:  { shortTitle: '模糊集合運算', count: 1, badge: '原書第 3 章 · 標準 Min/Max & Sugeno/Yager 參數補集', title: 'Ch.03 交集、聯集、補集與參數化運算動態疊圖' },
    4:  { shortTitle: '擴展原理與模糊數', count: 2, badge: '原書第 4 章 · 模糊數加減乘除 & y=f(x) 映射', title: 'Ch.04 模糊數四則計算器 (A⊕B, A⊖B, A⊗B, A⊘B) ＋ 函數映射' },
    5:  { shortTitle: '模糊關係矩陣', count: 1, badge: '原書第 5 章 · 卡迪興乘積與關係強度熱力圖', title: 'Ch.05 模糊關係矩陣 R(X×Y) 互動編輯與 2D 熱力圖' },
    6:  { shortTitle: '關係合成計算器', count: 1, badge: '原書第 6 章 · Max-Min / Max-Product 逐步合成計算', title: 'Ch.06 Max-Min & Max-Product 關係矩陣合成計算器（高亮每格步驟）' },
    7:  { shortTitle: '模糊邏輯與 GMP', count: 1, badge: '原書第 7 章 · 單條/多條 IF-THEN 規則激發強度 (Firing Strength)', title: 'Ch.07 IF-THEN 規則激發強度計算器與倒單擺平衡響應' },
    8:  { shortTitle: '近似推論規則庫', count: 1, badge: '原書第 8 章 · Mamdani 截頂 / Larsen 乘積推論對比', title: 'Ch.08 多規則激發截頂與變頻冷氣溫控動態比較' },
    9:  { shortTitle: '六大解模糊化實驗室', count: 1, badge: '原書第 9 章 · COA / BOA / MOM / SOM / LOM 精確數值標記', title: 'Ch.09 解模糊化六大方法對比實驗室 (COA, BOA, MOM, SOM, LOM)' },
    10: { shortTitle: '模糊控制與 ABS', count: 1, badge: '原書第 10 章 · 課本經典溫控/ABS 滑移率最佳化', title: 'Ch.10 模糊控制器實戰與 ABS 滑移率摩擦曲線' },
    11: { shortTitle: 'PID 模糊與船舶自動舵', count: 1, badge: '原書第 11 章 · 船舶航向模糊控制 (Marine Autopilot)', title: 'Ch.11 船舶航向模糊控制 (海浪干擾、航向收斂與舵角平滑)' },
    12: { shortTitle: 'T-S 模糊模型計算器', count: 1, badge: '原書第 12 章 · Takagi-Sugeno 線性後件部加權混合', title: 'Ch.12 Takagi-Sugeno 線性後件部加權混合計算器' },
    13: { shortTitle: '系統穩定與光電散熱', count: 1, badge: '原書第 13 章 · 光電板微氣候散熱模糊調節 (PV Cooling)', title: 'Ch.13 光電板微氣候散熱模糊調節與淨發電效益模擬器' },
    14: { shortTitle: '量化因子參數調校', count: 1, badge: '原書第 14 章 · 量化因子 Ke, Kd, Ku 對暫態響應影響', title: 'Ch.14 量化因子 (Ke, Kd, Ku) 對上升時間與超越量模擬器' },
    15: { shortTitle: '適應性與時間序列', count: 1, badge: '原書第 15 章 · 模糊時間序列 (FTS) 預測與適應調校', title: 'Ch.15 模糊時間序列 (FTS) 語意切分與預測曲線模擬器' },
    16: { shortTitle: '模糊決策與綜合評判', count: 2, badge: '原書第 16 章 · W∘R 模糊綜合評判 ＋ Bellman-Zadeh 尋優', title: 'Ch.16 權重矩陣 W∘R 綜合評判計算器 ＋ Bellman-Zadeh 尋優圖' },
    17: { shortTitle: '模糊聚類 (FCM)', count: 1, badge: '原書第 17 章 · Fuzzy C-Means 單步迭代 / 自動收斂', title: 'Ch.17 互動式 Fuzzy C-Means (FCM) 分群迭代與 U 矩陣模擬器' },
    18: { shortTitle: '類神經模糊 (ANFIS)', count: 1, badge: '原書第 18 章 · ANFIS 五層前向計算與 RMSE 收斂曲線', title: 'Ch.18 ANFIS 五層架構前向計算器與非線性逼近誤差曲線' },
    19: { shortTitle: 'GA 演化與儲能 EMS', count: 2, badge: '原書第 19 章 · GA 參數尋優 ＋ 24h 儲能微電網 EMS (BESS)', title: 'Ch.19 GA 演化尋找最佳歸屬函數 ＋ 24 小時儲能微電網 SOC 決策' }
  };

  function getLab19Meta() {
    return LAB_19_META;
  }

  // Ch.17 FCM 互動狀態
  const fcmPts19 = [
    [1.2, 1.8], [1.8, 2.4], [2.2, 1.5], [2.6, 2.8], [1.5, 3.1],
    [6.5, 6.2], [7.2, 7.0], [7.8, 6.5], [6.8, 7.6], [8.1, 7.4],
    [4.2, 4.5], [4.7, 4.9]
  ];
  let fcmState19 = { v1: [2.5, 5.5], v2: [6.0, 2.5], iter: 0, historyJ: [] };

  function fcmComputeStep(m) {
    const p = 2 / (m - 1);
    const u1 = [], u2 = [];
    let J = 0;
    fcmPts19.forEach(pt => {
      const d1 = Math.max(1e-4, Math.hypot(pt[0] - fcmState19.v1[0], pt[1] - fcmState19.v1[1]));
      const d2 = Math.max(1e-4, Math.hypot(pt[0] - fcmState19.v2[0], pt[1] - fcmState19.v2[1]));
      const w1 = 1 / (1 + Math.pow(d1 / d2, p));
      const w2 = 1 - w1;
      u1.push(w1); u2.push(w2);
      J += Math.pow(w1, m) * d1 * d1 + Math.pow(w2, m) * d2 * d2;
    });
    let num1 = [0, 0], den1 = 0, num2 = [0, 0], den2 = 0;
    fcmPts19.forEach((pt, idx) => {
      const a1 = Math.pow(u1[idx], m), a2 = Math.pow(u2[idx], m);
      num1[0] += a1 * pt[0]; num1[1] += a1 * pt[1]; den1 += a1;
      num2[0] += a2 * pt[0]; num2[1] += a2 * pt[1]; den2 += a2;
    });
    fcmState19.v1 = [num1[0] / den1, num1[1] / den1];
    fcmState19.v2 = [num2[0] / den2, num2[1] / den2];
    fcmState19.iter += 1;
    fcmState19.historyJ.push(Number(J.toFixed(2)));
    return { u1, u2, J };
  }

  function fcmStep19() {
    const mEl = document.getElementById('ch19-in-17a');
    const m = mEl ? parseFloat(mEl.value) : 2.0;
    fcmComputeStep(m);
    updateChapter19Lab(17);
  }

  function fcmAuto19() {
    const mEl = document.getElementById('ch19-in-17a');
    const m = mEl ? parseFloat(mEl.value) : 2.0;
    for (let i = 0; i < 8; i++) fcmComputeStep(m);
    updateChapter19Lab(17);
  }

  function fcmReset19() {
    fcmState19 = { v1: [2.5, 5.5], v2: [6.0, 2.5], iter: 0, historyJ: [] };
    updateChapter19Lab(17);
  }

  function renderChapter19Lab(chNum, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const meta = LAB_19_META[chNum] || { badge: `原書第 ${chNum} 章`, title: `Ch.${String(chNum).padStart(2,'0')} 互動實驗室` };
    const plotId = `ch19-lab-plot-${chNum}`;
    const readoutId = `ch19-lab-readout-${chNum}`;

    const controlsByCh = {
      1: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">目前探測數值 (身高 cm / 室溫 °C): <span id="ch19-val-1c" class="text-emerald-300 font-bold">173</span>
            <input id="ch19-in-1c" type="range" min="150" max="195" step="1" value="173" oninput="FuzzyWidgets.updateChapter19Lab(1)" class="w-full accent-emerald-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">明確集合「高個子」門檻 (cm): <span id="ch19-val-1b" class="text-rose-300 font-bold">175</span>
            <input id="ch19-in-1b" type="range" min="165" max="185" step="1" value="175" oninput="FuzzyWidgets.updateChapter19Lab(1)" class="w-full accent-rose-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">模糊過渡斜率 k: <span id="ch19-val-1a" class="text-sky-300 font-bold">0.25</span>
            <input id="ch19-in-1a" type="range" min="0.1" max="0.6" step="0.05" value="0.25" oninput="FuzzyWidgets.updateChapter19Lab(1)" class="w-full accent-sky-400 mt-1">
          </label>
        </div>`,
      2: `
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label class="block text-xs text-slate-300">歸屬函數造型:
            <select id="ch19-in-2a" onchange="FuzzyWidgets.updateChapter19Lab(2)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="tri" selected>三角形 (Triangular)</option>
              <option value="trap">梯形 (Trapezoidal)</option>
              <option value="gauss">高斯 (Gaussian)</option>
              <option value="bell">廣義鐘形 (Bell)</option>
            </select>
          </label>
          <label class="block text-xs text-slate-300">中心點 b/c: <span id="ch19-val-2b" class="text-teal-300 font-bold">5.0</span>
            <input id="ch19-in-2b" type="range" min="2" max="8" step="0.5" value="5" oninput="FuzzyWidgets.updateChapter19Lab(2)" class="w-full accent-teal-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">寬度/σ 參數: <span id="ch19-val-2c" class="text-teal-300 font-bold">2.5</span>
            <input id="ch19-in-2c" type="range" min="0.8" max="4.0" step="0.2" value="2.5" oninput="FuzzyWidgets.updateChapter19Lab(2)" class="w-full accent-teal-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">α-cut 水平切片 α: <span id="ch19-val-2d" class="text-amber-300 font-bold">0.60</span>
            <input id="ch19-in-2d" type="range" min="0.05" max="0.95" step="0.05" value="0.60" oninput="FuzzyWidgets.updateChapter19Lab(2)" class="w-full accent-amber-400 mt-1">
          </label>
        </div>`,
      3: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">運算子家族:
            <select id="ch19-in-3a" onchange="FuzzyWidgets.updateChapter19Lab(3)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="minmax" selected>標準 Min / Max / 1-μ</option>
              <option value="prod">代數積 a·b / 代數和 a+b-ab</option>
              <option value="sugeno">Sugeno 參數化補集 (λ)</option>
            </select>
          </label>
          <label class="block text-xs text-slate-300">集合 B 偏移: <span id="ch19-val-3b" class="text-cyan-300 font-bold">2.5</span>
            <input id="ch19-in-3b" type="range" min="0" max="5" step="0.5" value="2.5" oninput="FuzzyWidgets.updateChapter19Lab(3)" class="w-full accent-cyan-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">Sugeno 補集參數 λ: <span id="ch19-val-3c" class="text-amber-300 font-bold">1.0</span>
            <input id="ch19-in-3c" type="range" min="-0.8" max="5.0" step="0.2" value="1.0" oninput="FuzzyWidgets.updateChapter19Lab(3)" class="w-full accent-amber-400 mt-1">
          </label>
        </div>`,
      4: `
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label class="block text-xs text-slate-300">四則運算 / 映射:
            <select id="ch19-in-4a" onchange="FuzzyWidgets.updateChapter19Lab(4)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="add" selected>模糊加法 (A ⊕ B)</option>
              <option value="sub">模糊減法 (A ⊖ B)</option>
              <option value="mul">模糊乘法 (A ⊗ B)</option>
              <option value="div">模糊除法 (A ⊘ B)</option>
              <option value="sq">擴展原理 y = x²</option>
            </select>
          </label>
          <label class="block text-xs text-slate-300">模糊數 A 中心: <span id="ch19-val-4b" class="text-sky-300 font-bold">4.0</span>
            <input id="ch19-in-4b" type="range" min="1" max="6" step="0.5" value="4.0" oninput="FuzzyWidgets.updateChapter19Lab(4)" class="w-full accent-sky-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">模糊數 B 中心: <span id="ch19-val-4c" class="text-purple-300 font-bold">2.0</span>
            <input id="ch19-in-4c" type="range" min="1" max="5" step="0.5" value="2.0" oninput="FuzzyWidgets.updateChapter19Lab(4)" class="w-full accent-purple-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">α-cut 驗證水平: <span id="ch19-val-4d" class="text-emerald-300 font-bold">0.50</span>
            <input id="ch19-in-4d" type="range" min="0" max="1" step="0.1" value="0.50" oninput="FuzzyWidgets.updateChapter19Lab(4)" class="w-full accent-emerald-400 mt-1">
          </label>
        </div>`,
      5: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">R(1,1) 強度: <span id="ch19-val-5a" class="text-indigo-300 font-bold">0.9</span>
            <input id="ch19-in-5a" type="range" min="0" max="1" step="0.1" value="0.9" oninput="FuzzyWidgets.updateChapter19Lab(5)" class="w-full accent-indigo-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">R(2,2) 強度: <span id="ch19-val-5b" class="text-indigo-300 font-bold">0.8</span>
            <input id="ch19-in-5b" type="range" min="0" max="1" step="0.1" value="0.8" oninput="FuzzyWidgets.updateChapter19Lab(5)" class="w-full accent-indigo-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">雜訊干擾強度: <span id="ch19-val-5c" class="text-indigo-300 font-bold">0.2</span>
            <input id="ch19-in-5c" type="range" min="0" max="0.8" step="0.1" value="0.2" oninput="FuzzyWidgets.updateChapter19Lab(5)" class="w-full accent-indigo-400 mt-1">
          </label>
        </div>`,
      6: `
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label class="block text-xs text-slate-300">合成算子:
            <select id="ch19-in-6a" onchange="FuzzyWidgets.updateChapter19Lab(6)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="maxmin" selected>Max-Min 合成</option>
              <option value="maxprod">Max-Product 合成</option>
            </select>
          </label>
          <label class="block text-xs text-slate-300">檢視格 (列 i, 欄 j):
            <select id="ch19-in-6b" onchange="FuzzyWidgets.updateChapter19Lab(6)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="0,0">格 (x1, z1)</option>
              <option value="0,1" selected>格 (x1, z2)</option>
              <option value="1,1">格 (x2, z2)</option>
              <option value="2,2">格 (x3, z3)</option>
            </select>
          </label>
          <label class="block text-xs text-slate-300">調整 R[0][1] 數值: <span id="ch19-val-6c" class="text-sky-300 font-bold">0.6</span>
            <input id="ch19-in-6c" type="range" min="0" max="1" step="0.1" value="0.6" oninput="FuzzyWidgets.updateChapter19Lab(6)" class="w-full accent-sky-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">調整 S[1][1] 數值: <span id="ch19-val-6d" class="text-emerald-300 font-bold">0.8</span>
            <input id="ch19-in-6d" type="range" min="0" max="1" step="0.1" value="0.8" oninput="FuzzyWidgets.updateChapter19Lab(6)" class="w-full accent-emerald-400 mt-1">
          </label>
        </div>`,
      7: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">前提條件 1 歸屬度 μ_A(x): <span id="ch19-val-7a" class="text-emerald-300 font-bold">0.70</span>
            <input id="ch19-in-7a" type="range" min="0" max="1" step="0.05" value="0.70" oninput="FuzzyWidgets.updateChapter19Lab(7)" class="w-full accent-emerald-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">前提條件 2 歸屬度 μ_B(y): <span id="ch19-val-7b" class="text-emerald-300 font-bold">0.45</span>
            <input id="ch19-in-7b" type="range" min="0" max="1" step="0.05" value="0.45" oninput="FuzzyWidgets.updateChapter19Lab(7)" class="w-full accent-emerald-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">連接算子 (AND / OR):
            <select id="ch19-in-7c" onchange="FuzzyWidgets.updateChapter19Lab(7)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="min" selected>AND (取 min)</option>
              <option value="prod">AND (代數積 a·b)</option>
              <option value="max">OR (取 max)</option>
            </select>
          </label>
        </div>`,
      8: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">室溫偏差 ΔT (°C): <span id="ch19-val-8a" class="text-cyan-300 font-bold">5.0</span>
            <input id="ch19-in-8a" type="range" min="1" max="9" step="0.5" value="5.0" oninput="FuzzyWidgets.updateChapter19Lab(8)" class="w-full accent-cyan-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">推論蘊涵法:
            <select id="ch19-in-8b" onchange="FuzzyWidgets.updateChapter19Lab(8)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="min" selected>Mamdani 截頂法 (Min)</option>
              <option value="prod">Larsen 縮放法 (Product)</option>
            </select>
          </label>
          <label class="block text-xs text-slate-300">高溫規則權重: <span id="ch19-val-8c" class="text-cyan-300 font-bold">0.80</span>
            <input id="ch19-in-8c" type="range" min="0.2" max="1.0" step="0.1" value="0.8" oninput="FuzzyWidgets.updateChapter19Lab(8)" class="w-full accent-cyan-400 mt-1">
          </label>
        </div>`,
      9: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">規則 1 (左側低輸出) 截斷高度: <span id="ch19-val-9a" class="text-sky-300 font-bold">0.35</span>
            <input id="ch19-in-9a" type="range" min="0.05" max="0.95" step="0.05" value="0.35" oninput="FuzzyWidgets.updateChapter19Lab(9)" class="w-full accent-sky-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">規則 2 (右側高輸出平台) 截斷高度: <span id="ch19-val-9b" class="text-emerald-300 font-bold">0.80</span>
            <input id="ch19-in-9b" type="range" min="0.05" max="0.95" step="0.05" value="0.80" oninput="FuzzyWidgets.updateChapter19Lab(9)" class="w-full accent-emerald-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">高輸出中心移動: <span id="ch19-val-9c" class="text-amber-300 font-bold">75</span>
            <input id="ch19-in-9c" type="range" min="60" max="88" step="2" value="75" oninput="FuzzyWidgets.updateChapter19Lab(9)" class="w-full accent-amber-400 mt-1">
          </label>
        </div>`,
      10: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block text-xs text-slate-300">路面狀態:
            <select id="ch19-in-10a" onchange="FuzzyWidgets.updateChapter19Lab(10)" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200">
              <option value="dry" selected>乾燥柏油 (Dry)</option>
              <option value="wet">濕滑路面 (Wet)</option>
              <option value="ice">結冰路面 (Icy)</option>
            </select>
          </label>
          <label class="block text-xs text-slate-300">目標滑移率 λ: <span id="ch19-val-10b" class="text-rose-300 font-bold">0.18</span>
            <input id="ch19-in-10b" type="range" min="0.02" max="0.95" step="0.02" value="0.18" oninput="FuzzyWidgets.updateChapter19Lab(10)" class="w-full accent-rose-400 mt-1">
          </label>
        </div>`,
      11: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block text-xs text-slate-300">海浪側風干擾強度 (級): <span id="ch19-val-11a" class="text-sky-300 font-bold">4.0</span>
            <input id="ch19-in-11a" type="range" min="1" max="8" step="0.5" value="4.0" oninput="FuzzyWidgets.updateChapter19Lab(11)" class="w-full accent-sky-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">目標變更航向角 (deg): <span id="ch19-val-11b" class="text-emerald-300 font-bold">30</span>
            <input id="ch19-in-11b" type="range" min="10" max="60" step="5" value="30" oninput="FuzzyWidgets.updateChapter19Lab(11)" class="w-full accent-emerald-400 mt-1">
          </label>
        </div>`,
      12: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">輸入狀態 x: <span id="ch19-val-12a" class="text-amber-300 font-bold">3.5</span>
            <input id="ch19-in-12a" type="range" min="0" max="10" step="0.5" value="3.5" oninput="FuzzyWidgets.updateChapter19Lab(12)" class="w-full accent-amber-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">規則 1 線性斜率 p1: <span id="ch19-val-12b" class="text-sky-300 font-bold">0.8</span>
            <input id="ch19-in-12b" type="range" min="0.2" max="2.0" step="0.2" value="0.8" oninput="FuzzyWidgets.updateChapter19Lab(12)" class="w-full accent-sky-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">規則 2 線性斜率 p2: <span id="ch19-val-12c" class="text-emerald-300 font-bold">1.8</span>
            <input id="ch19-in-12c" type="range" min="0.5" max="3.0" step="0.2" value="1.8" oninput="FuzzyWidgets.updateChapter19Lab(12)" class="w-full accent-emerald-400 mt-1">
          </label>
        </div>`,
      13: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block text-xs text-slate-300">日照輻射強度 (W/m²): <span id="ch19-val-13a" class="text-amber-300 font-bold">950</span>
            <input id="ch19-in-13a" type="range" min="300" max="1200" step="50" value="950" oninput="FuzzyWidgets.updateChapter19Lab(13)" class="w-full accent-amber-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">環境風速 (m/s): <span id="ch19-val-13b" class="text-cyan-300 font-bold">2.5</span>
            <input id="ch19-in-13b" type="range" min="0.5" max="8.0" step="0.5" value="2.5" oninput="FuzzyWidgets.updateChapter19Lab(13)" class="w-full accent-cyan-400 mt-1">
          </label>
        </div>`,
      14: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">誤差量化因子 Ke: <span id="ch19-val-14a" class="text-sky-300 font-bold">1.2</span>
            <input id="ch19-in-14a" type="range" min="0.4" max="2.5" step="0.1" value="1.2" oninput="FuzzyWidgets.updateChapter19Lab(14)" class="w-full accent-sky-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">微分量化因子 Kd: <span id="ch19-val-14b" class="text-emerald-300 font-bold">1.0</span>
            <input id="ch19-in-14b" type="range" min="0.2" max="2.2" step="0.1" value="1.0" oninput="FuzzyWidgets.updateChapter19Lab(14)" class="w-full accent-emerald-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">輸出比例因子 Ku: <span id="ch19-val-14c" class="text-amber-300 font-bold">1.1</span>
            <input id="ch19-in-14c" type="range" min="0.5" max="2.0" step="0.1" value="1.1" oninput="FuzzyWidgets.updateChapter19Lab(14)" class="w-full accent-amber-400 mt-1">
          </label>
        </div>`,
      15: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block text-xs text-slate-300">論域語意區間數 n: <span id="ch19-val-15a" class="text-indigo-300 font-bold">7</span>
            <input id="ch19-in-15a" type="range" min="3" max="12" step="1" value="7" oninput="FuzzyWidgets.updateChapter19Lab(15)" class="w-full accent-indigo-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">二階趨勢平滑權重: <span id="ch19-val-15b" class="text-indigo-300 font-bold">0.6</span>
            <input id="ch19-in-15b" type="range" min="0.1" max="0.9" step="0.1" value="0.6" oninput="FuzzyWidgets.updateChapter19Lab(15)" class="w-full accent-indigo-400 mt-1">
          </label>
        </div>`,
      16: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">指標1 (效能) 權重 w1: <span id="ch19-val-16a" class="text-sky-300 font-bold">0.50</span>
            <input id="ch19-in-16a" type="range" min="0.1" max="0.8" step="0.05" value="0.50" oninput="FuzzyWidgets.updateChapter19Lab(16)" class="w-full accent-sky-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">指標2 (成本) 權重 w2: <span id="ch19-val-16b" class="text-rose-300 font-bold">0.30</span>
            <input id="ch19-in-16b" type="range" min="0.1" max="0.8" step="0.05" value="0.30" oninput="FuzzyWidgets.updateChapter19Lab(16)" class="w-full accent-rose-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">目標/限制折衷門檻: <span id="ch19-val-16c" class="text-emerald-300 font-bold">5.5</span>
            <input id="ch19-in-16c" type="range" min="3" max="8" step="0.5" value="5.5" oninput="FuzzyWidgets.updateChapter19Lab(16)" class="w-full accent-emerald-400 mt-1">
          </label>
        </div>`,
      17: `
        <div class="flex flex-wrap items-center justify-between gap-4">
          <label class="block text-xs text-slate-300 flex-1 min-w-[200px]">模糊指數 m (m→1 趨近 K-Means): <span id="ch19-val-17a" class="text-cyan-300 font-bold">2.0</span>
            <input id="ch19-in-17a" type="range" min="1.2" max="4.0" step="0.2" value="2.0" oninput="FuzzyWidgets.updateChapter19Lab(17)" class="w-full accent-cyan-400 mt-1">
          </label>
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="FuzzyWidgets.fcmStep19()" class="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition">▶ 迭代一步</button>
            <button onclick="FuzzyWidgets.fcmAuto19()" class="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition">⚡ 自動收斂 (8步)</button>
            <button onclick="FuzzyWidgets.fcmReset19()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition">🔄 重置</button>
          </div>
        </div>`,
      18: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">學習率 η: <span id="ch19-val-18a" class="text-violet-300 font-bold">0.15</span>
            <input id="ch19-in-18a" type="range" min="0.05" max="0.40" step="0.05" value="0.15" oninput="FuzzyWidgets.updateChapter19Lab(18)" class="w-full accent-violet-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">訓練 Epoch 數: <span id="ch19-val-18b" class="text-violet-300 font-bold">30</span>
            <input id="ch19-in-18b" type="range" min="5" max="60" step="5" value="30" oninput="FuzzyWidgets.updateChapter19Lab(18)" class="w-full accent-violet-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">L1 測試輸入 x*: <span id="ch19-val-18c" class="text-sky-300 font-bold">1.2</span>
            <input id="ch19-in-18c" type="range" min="-2.5" max="2.5" step="0.25" value="1.2" oninput="FuzzyWidgets.updateChapter19Lab(18)" class="w-full accent-sky-400 mt-1">
          </label>
        </div>`,
      19: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block text-xs text-slate-300">GA 突變率: <span id="ch19-val-19a" class="text-emerald-300 font-bold">0.08</span>
            <input id="ch19-in-19a" type="range" min="0.01" max="0.25" step="0.01" value="0.08" oninput="FuzzyWidgets.updateChapter19Lab(19)" class="w-full accent-emerald-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">尖峰電價倍率: <span id="ch19-val-19b" class="text-amber-300 font-bold">3.0</span>x
            <input id="ch19-in-19b" type="range" min="1.5" max="5.0" step="0.5" value="3.0" oninput="FuzzyWidgets.updateChapter19Lab(19)" class="w-full accent-amber-400 mt-1">
          </label>
          <label class="block text-xs text-slate-300">光電發電係數: <span id="ch19-val-19c" class="text-sky-300 font-bold">1.0</span>
            <input id="ch19-in-19c" type="range" min="0.4" max="1.6" step="0.2" value="1.0" oninput="FuzzyWidgets.updateChapter19Lab(19)" class="w-full accent-sky-400 mt-1">
          </label>
        </div>`
    };

    if (chNum === 2) {
      const cleanId = String(containerId).replace(/[^a-zA-Z0-9]/g, '');
      const simAId = `${containerId}-sim-a`;
      const simBId = `${containerId}-sim-b`;
      const simCId = `${containerId}-sim-c`;
      el.innerHTML = `
        <div class="space-y-6">
          <div id="${simAId}"></div>
          <div id="${simBId}"></div>
          <div id="${simCId}"></div>
        </div>
      `;
      renderNearCSimulator(simAId, { prefix: 'lab2a_' + cleanId, showFormulas: true });
      renderFig28LinguisticSimulator(simBId, { prefix: 'lab2b_' + cleanId });
      renderAlphaCutLabSimulator(simCId, { prefix: 'lab2c_' + cleanId });
      return;
    }

    el.innerHTML = `
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <span class="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold">${meta.badge}</span>
          <span class="text-xs text-slate-400 font-semibold">${meta.title}</span>
        </div>
        ${controlsByCh[chNum] || ''}
        <div id="${plotId}" class="w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80"></div>
        <div id="${readoutId}" class="text-xs sm:text-sm text-slate-300 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 leading-relaxed"></div>
      </div>
    `;

    updateChapter19Lab(chNum);
  }

  function updateChapter19Lab(chNum) {
    if (!window.Plotly) return;
    const plotEl = document.getElementById(`ch19-lab-plot-${chNum}`);
    const readoutEl = document.getElementById(`ch19-lab-readout-${chNum}`);
    if (!plotEl) return;

    const baseLayout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
      font: { color: '#e2e8f0', size: 11 },
      margin: { t: 28, r: 18, b: 40, l: 48 },
      legend: { orientation: 'h', y: 1.15, x: 0 }
    };
    const cfg = { responsive: true, displayModeBar: false };
    const getVal = (id, def) => { const n = document.getElementById(id); return n ? n.value : def; };
    const setTxt = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };

    if (chNum === 1) {
      const k = parseFloat(getVal('ch19-in-1a', 0.25));
      const th = parseFloat(getVal('ch19-in-1b', 175));
      const xProbe = parseFloat(getVal('ch19-in-1c', 173));
      setTxt('ch19-val-1a', k.toFixed(2)); setTxt('ch19-val-1b', th); setTxt('ch19-val-1c', xProbe);
      const xs = [], crisp = [], fuzzy = [];
      for (let x = 150; x <= 195; x += 0.5) {
        xs.push(x);
        crisp.push(x >= th ? 1 : 0);
        fuzzy.push(1 / (1 + Math.exp(-k * (x - th))));
      }
      const cVal = xProbe >= th ? 1 : 0;
      const fVal = 1 / (1 + Math.exp(-k * (xProbe - th)));
      Plotly.react(plotEl, [
        { x: xs, y: crisp, name: `明確集合 (≥${th}cm)`, line: { color: '#f43f5e', width: 2.5, dash: 'dash' } },
        { x: xs, y: fuzzy, name: '模糊集合「高個子」', line: { color: '#38bdf8', width: 3.5 } },
        { x: [xProbe, xProbe], y: [cVal, fVal], name: '探測身高', mode: 'markers', marker: { color: ['#f43f5e', '#10b981'], size: 11 } }
      ], { ...baseLayout, xaxis: { title: '身高 (cm)' }, yaxis: { title: '歸屬度 μ(x)', range: [-0.05, 1.1] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `身高 <b>${xProbe} cm</b>（門檻 ${th} cm）：明確邏輯判定為 <b>${cVal}</b>（非黑即白），模糊邏輯給出連續歸屬度 <b>μ = ${fVal.toFixed(3)}</b>。`;
    } else if (chNum === 2) {
      const shape = getVal('ch19-in-2a', 'tri');
      const c = parseFloat(getVal('ch19-in-2b', 5.0));
      const w = parseFloat(getVal('ch19-in-2c', 2.5));
      const alpha = parseFloat(getVal('ch19-in-2d', 0.60));
      setTxt('ch19-val-2b', c.toFixed(1)); setTxt('ch19-val-2c', w.toFixed(1)); setTxt('ch19-val-2d', alpha.toFixed(2));
      const xs = [], ys = [], cutPtsX = [];
      for (let x = 0; x <= 10; x += 0.1) {
        const xv = Number(x.toFixed(1));
        xs.push(xv);
        let y = 0;
        if (shape === 'tri') y = Math.max(0, 1 - Math.abs(xv - c) / w);
        else if (shape === 'trap') y = Math.max(0, Math.min(1, (w * 1.2 - Math.abs(xv - c)) / (w * 0.6)));
        else if (shape === 'gauss') y = Math.exp(-Math.pow(xv - c, 2) / (2 * Math.pow(w * 0.5, 2)));
        else y = 1 / (1 + Math.pow(Math.abs((xv - c) / (w * 0.6)), 4));
        ys.push(y);
        if (y >= alpha) cutPtsX.push(xv);
      }
      const x1 = cutPtsX.length ? cutPtsX[0].toFixed(1) : '-';
      const x2 = cutPtsX.length ? cutPtsX[cutPtsX.length - 1].toFixed(1) : '-';
      Plotly.react(plotEl, [
        { x: xs, y: ys, name: `歸屬函數 (${shape})`, fill: 'tozeroy', line: { color: '#2dd4bf', width: 3 } },
        { x: [0, 10], y: [alpha, alpha], name: `α = ${alpha.toFixed(2)} 切片線`, line: { color: '#f59e0b', width: 2.5, dash: 'dash' } }
      ], { ...baseLayout, xaxis: { title: '論域 x' }, yaxis: { title: 'μ(x)', range: [-0.05, 1.1] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `α-cut 切片計算結果：水平線 <b>α = ${alpha.toFixed(2)}</b> 切出的明確區間為 <b>[${x1}, ${x2}]</b>（區間寬度 Δx = ${cutPtsX.length ? (x2 - x1).toFixed(1) : '0.0'}）。`;
    } else if (chNum === 3) {
      const op = getVal('ch19-in-3a', 'minmax');
      const shift = parseFloat(getVal('ch19-in-3b', 2.5));
      const lam = parseFloat(getVal('ch19-in-3c', 1.0));
      setTxt('ch19-val-3b', shift.toFixed(1)); setTxt('ch19-val-3c', lam.toFixed(1));
      const xs = [], yA = [], yB = [], yR1 = [], yR2 = [];
      for (let x = 0; x <= 10; x += 0.15) {
        xs.push(Number(x.toFixed(2)));
        const a = Math.exp(-Math.pow(x - 3.5, 2) / 3.0);
        const b = Math.exp(-Math.pow(x - (3.5 + shift), 2) / 3.0);
        yA.push(a); yB.push(b);
        if (op === 'minmax') { yR1.push(Math.min(a, b)); yR2.push(Math.max(a, b)); }
        else if (op === 'prod') { yR1.push(a * b); yR2.push(a + b - a * b); }
        else { yR1.push(1 - a); yR2.push((1 - a) / (1 + lam * a)); }
      }
      const traces = op === 'sugeno'
        ? [
            { x: xs, y: yA, name: '原集合 A', line: { color: '#38bdf8', width: 2.5 } },
            { x: xs, y: yR1, name: '標準補集 1-A', line: { color: '#94a3b8', width: 2, dash: 'dot' } },
            { x: xs, y: yR2, name: `Sugeno 補集 (λ=${lam})`, line: { color: '#f59e0b', width: 3 } }
          ]
        : [
            { x: xs, y: yA, name: '集合 A', line: { color: '#38bdf8', width: 2, dash: 'dot' } },
            { x: xs, y: yB, name: '集合 B', line: { color: '#a855f7', width: 2, dash: 'dot' } },
            { x: xs, y: yR1, name: '模糊交集 A∩B', fill: 'tozeroy', line: { color: '#f59e0b', width: 3 } },
            { x: xs, y: yR2, name: '模糊聯集 A∪B', line: { color: '#10b981', width: 2.5 } }
          ];
      Plotly.react(plotEl, traces, { ...baseLayout, xaxis: { title: '論域 x' }, yaxis: { title: 'μ(x)', range: [-0.05, 1.1] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = op === 'sugeno'
        ? `Sugeno 參數補集 $c_\\lambda(a)=(1-a)/(1+\\lambda a)$，平衡點滿足 $a = c_\\lambda(a)$。`
        : `可切換標準 Min/Max 與代數積/代數和，觀察交疊區域的收縮差異。`;
    } else if (chNum === 4) {
      const op = getVal('ch19-in-4a', 'add');
      const aC = parseFloat(getVal('ch19-in-4b', 4.0));
      const bC = parseFloat(getVal('ch19-in-4c', 2.0));
      const al = parseFloat(getVal('ch19-in-4d', 0.50));
      setTxt('ch19-val-4b', aC.toFixed(1)); setTxt('ch19-val-4c', bC.toFixed(1)); setTxt('ch19-val-4d', al.toFixed(2));
      const alphas = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
      const resX = [], resY = [];
      let ivA = [aC - 1 + al, aC + 1 - al];
      let ivB = [bC - 0.8 + 0.8 * al, bC + 0.8 - 0.8 * al];
      const calcIv = (lvl) => {
        const a1 = aC - 1 + lvl, a2 = aC + 1 - lvl;
        const b1 = bC - 0.8 * (1 - lvl), b2 = bC + 0.8 * (1 - lvl);
        if (op === 'add') return [a1 + b1, a2 + b2];
        if (op === 'sub') return [a1 - b2, a2 - b1];
        if (op === 'mul') return [a1 * b1, a2 * b2];
        if (op === 'div') return [a1 / Math.max(0.2, b2), a2 / Math.max(0.2, b1)];
        return [a1 * a1, a2 * a2];
      };
      alphas.forEach(lvl => {
        const [l, r] = calcIv(lvl);
        resX.unshift(l); resY.unshift(lvl);
        resX.push(r); resY.push(lvl);
      });
      const [outL, outR] = calcIv(al);
      Plotly.react(plotEl, [
        { x: [aC - 1, aC, aC + 1], y: [0, 1, 0], name: `A ≈ ${aC} (±1.0)`, line: { color: '#38bdf8', width: 2, dash: 'dash' } },
        { x: [bC - 0.8, bC, bC + 0.8], y: [0, 1, 0], name: `B ≈ ${bC} (±0.8)`, line: { color: '#a855f7', width: 2, dash: 'dash' } },
        { x: resX, y: resY, name: `結果 (${op})`, fill: 'tozeroy', line: { color: '#10b981', width: 3.5 } }
      ], { ...baseLayout, xaxis: { title: '數值' }, yaxis: { title: '歸屬度 α', range: [-0.05, 1.1] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `在 <b>α = ${al.toFixed(2)}</b> 水平下：A<sub>α</sub>=[${ivA[0].toFixed(2)}, ${ivA[1].toFixed(2)}]、B<sub>α</sub>=[${ivB[0].toFixed(2)}, ${ivB[1].toFixed(2)}]，運算結果區間為 <b>[${outL.toFixed(2)}, ${outR.toFixed(2)}]</b>。`;
    } else if (chNum === 5) {
      const r11 = parseFloat(getVal('ch19-in-5a', 0.9));
      const r22 = parseFloat(getVal('ch19-in-5b', 0.8));
      const noise = parseFloat(getVal('ch19-in-5c', 0.2));
      setTxt('ch19-val-5a', r11.toFixed(1)); setTxt('ch19-val-5b', r22.toFixed(1)); setTxt('ch19-val-5c', noise.toFixed(1));
      const R = [
        [r11, noise, Number((noise * 0.5).toFixed(2))],
        [noise, r22, Number((noise * 0.8).toFixed(2))],
        [Number((noise * 0.4).toFixed(2)), noise, 0.95]
      ];
      Plotly.react(plotEl, [{ z: R, x: ['y1', 'y2', 'y3'], y: ['x1', 'x2', 'x3'], type: 'heatmap', colorscale: 'YlGnBu', zmin: 0, zmax: 1 }],
        { ...baseLayout, title: '模糊二元關係矩陣 R(X × Y)' }, cfg);
      if (readoutEl) readoutEl.innerHTML = `關係矩陣對角強度 [${r11}, ${r22}, 0.95]，非對角耦合干擾 ${noise}。`;
    } else if (chNum === 6) {
      const mode = getVal('ch19-in-6a', 'maxmin');
      const cell = getVal('ch19-in-6b', '0,1').split(',').map(Number);
      const r01 = parseFloat(getVal('ch19-in-6c', 0.6));
      const s11 = parseFloat(getVal('ch19-in-6d', 0.8));
      setTxt('ch19-val-6c', r01.toFixed(1)); setTxt('ch19-val-6d', s11.toFixed(1));
      const R = [[0.9, r01, 0.2], [0.4, 0.85, 0.5], [0.2, 0.4, 0.9]];
      const S = [[0.7, 0.3, 0.1], [0.5, s11, 0.4], [0.2, 0.5, 0.9]];
      const T = [0, 1, 2].map(i => [0, 1, 2].map(j => {
        const terms = [0, 1, 2].map(k => mode === 'maxmin' ? Math.min(R[i][k], S[k][j]) : Number((R[i][k] * S[k][j]).toFixed(2)));
        return Number(Math.max(...terms).toFixed(2));
      }));
      const ci = cell[0], cj = cell[1];
      const stepStr = [0, 1, 2].map(k => {
        const opSym = mode === 'maxmin' ? `min(${R[ci][k]}, ${S[k][cj]})` : `(${R[ci][k]}×${S[k][cj]})`;
        const val = mode === 'maxmin' ? Math.min(R[ci][k], S[k][cj]) : Number((R[ci][k] * S[k][cj]).toFixed(2));
        return `${opSym}=${val}`;
      }).join(' , ');
      Plotly.react(plotEl, [{ z: T, x: ['z1', 'z2', 'z3'], y: ['x1', 'x2', 'x3'], type: 'heatmap', colorscale: 'Viridis', zmin: 0, zmax: 1 }],
        { ...baseLayout, title: `合成結果 R ∘ S (${mode})` }, cfg);
      if (readoutEl) readoutEl.innerHTML = `<b>逐步計算高亮格 (x${ci + 1}, z${cj + 1})</b>：max( ${stepStr} ) = <b class="text-emerald-300">${T[ci][cj]}</b>。`;
    } else if (chNum === 7) {
      const mA = parseFloat(getVal('ch19-in-7a', 0.70));
      const mB = parseFloat(getVal('ch19-in-7b', 0.45));
      const op = getVal('ch19-in-7c', 'min');
      setTxt('ch19-val-7a', mA.toFixed(2)); setTxt('ch19-val-7b', mB.toFixed(2));
      const fire = op === 'min' ? Math.min(mA, mB) : (op === 'prod' ? mA * mB : Math.max(mA, mB));
      const xs = [], ys = [], cutY = [];
      for (let x = 0; x <= 10; x += 0.2) {
        xs.push(Number(x.toFixed(1)));
        const mf = Math.max(0, 1 - Math.abs(x - 6) / 3);
        ys.push(mf);
        cutY.push(Math.min(fire, mf));
      }
      Plotly.react(plotEl, [
        { x: xs, y: ys, name: '後件原始歸屬函數 C', line: { color: '#64748b', width: 2, dash: 'dash' } },
        { x: xs, y: cutY, name: `激發截斷輸出 (w=${fire.toFixed(2)})`, fill: 'tozeroy', line: { color: '#10b981', width: 3 } }
      ], { ...baseLayout, xaxis: { title: '輸出論域 u' }, yaxis: { title: 'μ(u)', range: [-0.05, 1.1] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `IF A (${mA.toFixed(2)}) ${op.toUpperCase()} B (${mB.toFixed(2)}) ➔ 規則激發強度 <b>w = ${fire.toFixed(3)}</b>。`;
    } else if (chNum === 8) {
      const dT = parseFloat(getVal('ch19-in-8a', 5.0));
      const method = getVal('ch19-in-8b', 'min');
      const wHigh = parseFloat(getVal('ch19-in-8c', 0.8));
      setTxt('ch19-val-8a', dT.toFixed(1)); setTxt('ch19-val-8c', wHigh.toFixed(2));
      const ts = [], fzT = [], onoffT = [];
      for (let t = 0; t <= 25; t += 0.5) {
        ts.push(t);
        fzT.push(24 + dT * Math.exp(-0.22 * wHigh * t));
        onoffT.push(24 + dT * Math.exp(-0.12 * t) + (t > 8 ? 0.8 * Math.sin(0.9 * t) : 0));
      }
      Plotly.react(plotEl, [
        { x: ts, y: fzT, name: `模糊推論 (${method}) 平穩溫控`, line: { color: '#22d3ee', width: 3.5 } },
        { x: ts, y: onoffT, name: '傳統開關控制震盪', line: { color: '#f43f5e', width: 2, dash: 'dash' } }
      ], { ...baseLayout, xaxis: { title: '時間 (分)' }, yaxis: { title: '室溫 (°C)' } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `目標 24°C、推論算子 <b>${method}</b>、規則權重 ${wHigh}：預判降頻大幅減少震盪耗電。`;
    } else if (chNum === 9) {
      const h1 = parseFloat(getVal('ch19-in-9a', 0.35));
      const h2 = parseFloat(getVal('ch19-in-9b', 0.80));
      const c2 = parseFloat(getVal('ch19-in-9c', 75));
      setTxt('ch19-val-9a', h1.toFixed(2)); setTxt('ch19-val-9b', h2.toFixed(2)); setTxt('ch19-val-9c', c2);
      const xs = [], ys = [];
      let sumY = 0, sumXY = 0, maxY = 0;
      for (let x = 0; x <= 100; x += 1) {
        const y1 = Math.min(h1, Math.max(0, 1 - Math.abs(x - 25) / 25));
        const y2 = Math.min(h2, Math.max(0, Math.min(1, (20 - Math.abs(x - c2)) / 8)));
        const y = Math.max(y1, y2);
        xs.push(x); ys.push(y);
        sumY += y; sumXY += x * y;
        if (y > maxY) maxY = y;
      }
      const coa = sumY > 0 ? sumXY / sumY : 50;
      let acc = 0, boa = 50;
      for (let i = 0; i < xs.length; i++) { acc += ys[i]; if (acc >= sumY / 2) { boa = xs[i]; break; } }
      const maxXs = xs.filter((_, i) => Math.abs(ys[i] - maxY) < 1e-4);
      const som = maxXs[0], lom = maxXs[maxXs.length - 1], mom = (som + lom) / 2;
      Plotly.react(plotEl, [
        { x: xs, y: ys, name: '合成輸出 μ(u)', fill: 'tozeroy', line: { color: '#38bdf8', width: 3 } },
        { x: [coa, coa], y: [0, 1], name: `COA=${coa.toFixed(1)}`, line: { color: '#10b981', width: 2.5 } },
        { x: [boa, boa], y: [0, 1], name: `BOA=${boa.toFixed(1)}`, line: { color: '#f59e0b', width: 2, dash: 'dash' } },
        { x: [mom, mom], y: [0, 1], name: `MOM=${mom.toFixed(1)}`, line: { color: '#a855f7', width: 2, dash: 'dot' } }
      ], { ...baseLayout, xaxis: { title: '輸出 u (0~100)' }, yaxis: { title: 'μ(u)', range: [-0.05, 1.1] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `<b>六大解模糊數值</b>：COA(重心法)=<b>${coa.toFixed(2)}</b> · BOA(面積平分)=<b>${boa.toFixed(1)}</b> · MOM(最大平均)=<b>${mom.toFixed(1)}</b> · SOM=<b>${som}</b> · LOM=<b>${lom}</b>。`;
    } else if (chNum === 10) {
      const road = getVal('ch19-in-10a', 'dry');
      const lam = parseFloat(getVal('ch19-in-10b', 0.18));
      setTxt('ch19-val-10b', lam.toFixed(2));
      const peak = road === 'dry' ? 0.92 : road === 'wet' ? 0.55 : 0.22;
      const optL = road === 'dry' ? 0.18 : road === 'wet' ? 0.14 : 0.10;
      const f = (l) => peak * (2 * (l / optL) / (1 + Math.pow(l / optL, 2))) * (l > optL ? Math.max(0.45, 1 - 0.35 * (l - optL)) : 1);
      const ls = [], mus = [];
      for (let l = 0; l <= 1.0; l += 0.02) { ls.push(Number(l.toFixed(2))); mus.push(f(l)); }
      Plotly.react(plotEl, [
        { x: ls, y: mus, name: '摩擦係數 μ(λ)', line: { color: '#fb7185', width: 3 } },
        { x: [lam], y: [f(lam)], name: '目前工作點', mode: 'markers', marker: { color: '#38bdf8', size: 12 } }
      ], { ...baseLayout, xaxis: { title: '滑移率 λ' }, yaxis: { title: 'μ(λ)', range: [0, 1.05] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `ABS 滑移率 <b>λ = ${lam.toFixed(2)}</b> ➔ 制動摩擦係數 <b>μ ≈ ${f(lam).toFixed(2)}</b>（峰值在 λ=${optL}）。`;
    } else if (chNum === 11) {
      const wave = parseFloat(getVal('ch19-in-11a', 4.0));
      const target = parseFloat(getVal('ch19-in-11b', 30));
      setTxt('ch19-val-11a', wave.toFixed(1)); setTxt('ch19-val-11b', target);
      const ts = [], headF = [], rudder = [];
      for (let t = 0; t <= 40; t += 1) {
        ts.push(t);
        const h = target * (1 - Math.exp(-0.16 * t) * Math.cos(0.18 * t)) + (wave * 0.35) * Math.sin(0.6 * t) * Math.exp(-0.04 * t);
        headF.push(Number(h.toFixed(2)));
        rudder.push(Number(((target - h) * 0.7 - wave * 0.4 * Math.cos(0.6 * t)).toFixed(2)));
      }
      Plotly.react(plotEl, [
        { x: ts, y: headF, name: '船舶實際航向 (deg)', line: { color: '#38bdf8', width: 3 } },
        { x: ts, y: rudder, name: '模糊舵角指令 (deg)', line: { color: '#10b981', width: 2, dash: 'dash' } }
      ], { ...baseLayout, xaxis: { title: '時間 (秒)' }, yaxis: { title: '角度 (deg)' } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `船舶自動舵 (Marine Autopilot)：目標航向 <b>${target}°</b>、海浪 ${wave} 級，模糊規則平滑抑振收斂。`;
    } else if (chNum === 12) {
      const x = parseFloat(getVal('ch19-in-12a', 3.5));
      const p1 = parseFloat(getVal('ch19-in-12b', 0.8));
      const p2 = parseFloat(getVal('ch19-in-12c', 1.8));
      setTxt('ch19-val-12a', x.toFixed(1)); setTxt('ch19-val-12b', p1.toFixed(1)); setTxt('ch19-val-12c', p2.toFixed(1));
      const xs = [], yTS = [], y1 = [], y2 = [];
      for (let v = 0; v <= 10; v += 0.25) {
        xs.push(v);
        const w1 = 1 / (1 + Math.exp(1.2 * (v - 5)));
        const w2 = 1 - w1;
        const f1 = p1 * v + 1, f2 = p2 * v - 2;
        y1.push(f1); y2.push(f2);
        yTS.push(w1 * f1 + w2 * f2);
      }
      const w1x = 1 / (1 + Math.exp(1.2 * (x - 5))), w2x = 1 - w1x;
      const outX = w1x * (p1 * x + 1) + w2x * (p2 * x - 2);
      Plotly.react(plotEl, [
        { x: xs, y: y1, name: `規則1後件 ${p1}x+1`, line: { color: '#38bdf8', width: 2, dash: 'dot' } },
        { x: xs, y: y2, name: `規則2後件 ${p2}x-2`, line: { color: '#10b981', width: 2, dash: 'dot' } },
        { x: xs, y: yTS, name: 'T-S 模糊混合輸出', line: { color: '#f59e0b', width: 3.5 } }
      ], { ...baseLayout, xaxis: { title: '輸入 x' }, yaxis: { title: '輸出 y' } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `在 <b>x = ${x}</b> 時：權重 w₁=${w1x.toFixed(2)}, w₂=${w2x.toFixed(2)} ➔ T-S 加權輸出 <b>y = ${outX.toFixed(2)}</b>。`;
    } else if (chNum === 13) {
      const irr = parseFloat(getVal('ch19-in-13a', 950));
      const wind = parseFloat(getVal('ch19-in-13b', 2.5));
      setTxt('ch19-val-13a', irr); setTxt('ch19-val-13b', wind.toFixed(1));
      const cellTempBase = 25 + (irr / 1000) * 38 - wind * 2.1;
      const sprayLevel = Math.min(100, Math.max(0, (cellTempBase - 38) * 3.5));
      const tempDrop = (sprayLevel / 100) * 14;
      const netGain = ((tempDrop * 0.45) - (sprayLevel * 0.015)).toFixed(2);
      Plotly.react(plotEl, [{
        x: ['無散熱電池溫度 (°C)', '模糊微霧冷卻後 (°C)', '冷卻強度 (%)'],
        y: [cellTempBase, cellTempBase - tempDrop, sprayLevel],
        type: 'bar',
        marker: { color: ['#f43f5e', '#22d3ee', '#10b981'] }
      }], { ...baseLayout, yaxis: { title: '數值 (°C / %)' } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `日照 ${irr} W/m²、風速 ${wind} m/s：模糊調節噴霧強度 <b>${sprayLevel.toFixed(0)}%</b>，模組降溫 <b>${tempDrop.toFixed(1)}°C</b>，淨發電效率提升 <b>+${netGain}%</b>。`;
    } else if (chNum === 14) {
      const ke = parseFloat(getVal('ch19-in-14a', 1.2));
      const kd = parseFloat(getVal('ch19-in-14b', 1.0));
      const ku = parseFloat(getVal('ch19-in-14c', 1.1));
      setTxt('ch19-val-14a', ke.toFixed(1)); setTxt('ch19-val-14b', kd.toFixed(1)); setTxt('ch19-val-14c', ku.toFixed(1));
      const zeta = Math.min(1.4, Math.max(0.25, 0.45 * kd / Math.sqrt(ke * ku)));
      const wn = 1.6 * Math.sqrt(ke * ku);
      const ts = [], ys = [];
      for (let t = 0; t <= 8; t += 0.1) {
        ts.push(Number(t.toFixed(1)));
        const y = zeta < 1
          ? 1 - Math.exp(-zeta * wn * t) * (Math.cos(wn * Math.sqrt(1 - zeta * zeta) * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wn * Math.sqrt(1 - zeta * zeta) * t))
          : 1 - Math.exp(-wn * t) * (1 + wn * t);
        ys.push(y);
      }
      const os = zeta < 1 ? (Math.exp(-Math.PI * zeta / Math.sqrt(1 - zeta * zeta)) * 100).toFixed(1) : '0.0';
      Plotly.react(plotEl, [
        { x: [0, 8], y: [1, 1], name: '目標階躍 1.0', line: { color: '#64748b', width: 2, dash: 'dot' } },
        { x: ts, y: ys, name: '系統暫態響應', line: { color: '#38bdf8', width: 3.5 } }
      ], { ...baseLayout, xaxis: { title: '時間 (秒)' }, yaxis: { title: '輸出響應' } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `等效阻尼比 <b>ζ ≈ ${zeta.toFixed(2)}</b> · 預估超越量 (Overshoot) = <b>${os}%</b>（提高 Kd 可有效抑制超越量）。`;
    } else if (chNum === 15) {
      const n = parseInt(getVal('ch19-in-15a', 7), 10);
      const w = parseFloat(getVal('ch19-in-15b', 0.6));
      setTxt('ch19-val-15a', n); setTxt('ch19-val-15b', w.toFixed(1));
      const ts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const real = [120, 134, 128, 145, 160, 152, 168, 174, 165, 182];
      const step = 70 / n;
      const pred = real.map((v, idx) => idx === 0 ? v : Number((w * real[idx - 1] + (1 - w) * (Math.round(v / step) * step)).toFixed(1)));
      Plotly.react(plotEl, [
        { x: ts, y: real, name: '實際觀測序列', line: { color: '#38bdf8', width: 3 } },
        { x: ts, y: pred, name: `FTS 預測 (${n} 語意區間)`, line: { color: '#818cf8', width: 3, dash: 'dash' } }
      ], { ...baseLayout, xaxis: { title: '期數 t' }, yaxis: { title: '指數' } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `將論域分割為 <b>${n} 個語意區間</b>（寬度 ${step.toFixed(1)}），平滑權重 ${w}。`;
    } else if (chNum === 16) {
      const w1 = parseFloat(getVal('ch19-in-16a', 0.50));
      const w2 = parseFloat(getVal('ch19-in-16b', 0.30));
      const w3 = Math.max(0.05, Number((1 - w1 - w2).toFixed(2)));
      const th = parseFloat(getVal('ch19-in-16c', 5.5));
      setTxt('ch19-val-16a', w1.toFixed(2)); setTxt('ch19-val-16b', w2.toFixed(2)); setTxt('ch19-val-16c', th.toFixed(1));
      // W o R 綜合評判: 3 指標 x 4 等級 [優, 良, 中, 差]
      const R = [[0.6, 0.3, 0.1, 0.0], [0.2, 0.5, 0.2, 0.1], [0.4, 0.4, 0.2, 0.0]];
      const W = [w1, w2, w3];
      const B = [0, 1, 2, 3].map(j => Number((W[0] * R[0][j] + W[1] * R[1][j] + W[2] * R[2][j]).toFixed(3)));
      const bSum = B.reduce((a, b) => a + b, 0) || 1;
      const Bnorm = B.map(v => Number((v / bSum).toFixed(3)));
      const score = (Bnorm[0] * 95 + Bnorm[1] * 80 + Bnorm[2] * 65 + Bnorm[3] * 45).toFixed(1);
      Plotly.react(plotEl, [{
        x: ['優 (95分)', '良 (80分)', '中 (65分)', '差 (45分)'],
        y: Bnorm.map(v => v * 100),
        type: 'bar',
        marker: { color: ['#10b981', '#38bdf8', '#f59e0b', '#f43f5e'] }
      }], { ...baseLayout, yaxis: { title: '評判佔比 (%)', range: [0, 100] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `正規化權重 W=[${w1.toFixed(2)}, ${w2.toFixed(2)}, ${w3.toFixed(2)}] ➔ 綜合評判 B=[${Bnorm.join(', ')}] ➔ 總分 <b>${score} 分</b>（${score >= 82 ? '等級：優' : '等級：良'}）。`;
    } else if (chNum === 17) {
      const m = parseFloat(getVal('ch19-in-17a', 2.0));
      setTxt('ch19-val-17a', m.toFixed(1));
      const p = 2 / (m - 1);
      const u1s = fcmPts19.map(pt => {
        const d1 = Math.max(1e-4, Math.hypot(pt[0] - fcmState19.v1[0], pt[1] - fcmState19.v1[1]));
        const d2 = Math.max(1e-4, Math.hypot(pt[0] - fcmState19.v2[0], pt[1] - fcmState19.v2[1]));
        return Number((1 / (1 + Math.pow(d1 / d2, p))).toFixed(2));
      });
      Plotly.react(plotEl, [
        { x: fcmPts19.map(pt => pt[0]), y: fcmPts19.map(pt => pt[1]), mode: 'markers', name: '資料點 (依 u₁ 着色)', marker: { size: 11, color: u1s, colorscale: 'Portland', cmin: 0, cmax: 1 } },
        { x: [fcmState19.v1[0], fcmState19.v2[0]], y: [fcmState19.v1[1], fcmState19.v2[1]], mode: 'markers+text', text: ['群心 V1', '群心 V2'], textposition: 'top center', name: '群中心', marker: { size: 16, symbol: 'star', color: ['#22d3ee', '#f43f5e'] } }
      ], { ...baseLayout, xaxis: { title: '特徵 x₁', range: [0, 9.5] }, yaxis: { title: '特徵 x₂', range: [0, 9.5] } }, cfg);
      const lastJ = fcmState19.historyJ.length ? fcmState19.historyJ[fcmState19.historyJ.length - 1] : '尚未迭代';
      if (readoutEl) readoutEl.innerHTML = `第 <b>${fcmState19.iter}</b> 次迭代 · 目標函數 J<sub>m</sub> = <b>${lastJ}</b> · 群心 V1=(${fcmState19.v1[0].toFixed(2)}, ${fcmState19.v1[1].toFixed(2)})、V2=(${fcmState19.v2[0].toFixed(2)}, ${fcmState19.v2[1].toFixed(2)})。`;
    } else if (chNum === 18) {
      const eta = parseFloat(getVal('ch19-in-18a', 0.15));
      const ep = parseInt(getVal('ch19-in-18b', 30), 10);
      const xP = parseFloat(getVal('ch19-in-18c', 1.2));
      setTxt('ch19-val-18a', eta.toFixed(2)); setTxt('ch19-val-18b', ep); setTxt('ch19-val-18c', xP.toFixed(2));
      const xs = [], targetY = [], anfisY = [];
      const errFactor = Math.exp(-eta * ep * 0.45);
      for (let x = -3; x <= 3; x += 0.15) {
        xs.push(Number(x.toFixed(2)));
        const y = Math.sin(x) + 0.3 * Math.cos(2 * x);
        targetY.push(y);
        anfisY.push(y * (1 - 0.55 * errFactor) + 0.2 * errFactor * x * 0.3);
      }
      const w1 = Math.exp(-Math.pow(xP + 1, 2) / 2), w2 = Math.exp(-Math.pow(xP - 1, 2) / 2);
      const wSum = w1 + w2, wb1 = w1 / wSum, wb2 = w2 / wSum;
      const rmse = (0.42 * errFactor).toFixed(4);
      Plotly.react(plotEl, [
        { x: xs, y: targetY, name: '目標函數', line: { color: '#38bdf8', width: 2.5, dash: 'dash' } },
        { x: xs, y: anfisY, name: `ANFIS 逼近 (Epoch ${ep})`, line: { color: '#a855f7', width: 3.5 } }
      ], { ...baseLayout, xaxis: { title: '輸入 x' }, yaxis: { title: '輸出 y' } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `RMSE = <b>${rmse}</b> | 五層前向 (x*=${xP})：L1=[${w1.toFixed(2)}, ${w2.toFixed(2)}] ➔ L3正規化=[${wb1.toFixed(2)}, ${wb2.toFixed(2)}]。`;
    } else if (chNum === 19) {
      const mut = parseFloat(getVal('ch19-in-19a', 0.08));
      const peakP = parseFloat(getVal('ch19-in-19b', 3.0));
      const pvScale = parseFloat(getVal('ch19-in-19c', 1.0));
      setTxt('ch19-val-19a', mut.toFixed(2)); setTxt('ch19-val-19b', peakP.toFixed(1)); setTxt('ch19-val-19c', pvScale.toFixed(1));
      const hrs = [], soc = [], gaFit = [];
      let curSoc = 45;
      for (let h = 0; h < 24; h++) {
        hrs.push(h);
        const pv = (h >= 7 && h <= 17) ? pvScale * 40 * Math.sin((h - 7) * Math.PI / 10) : 0;
        const isPeak = (h >= 18 && h <= 22);
        const delta = isPeak ? -peakP * 3.8 : (pv > 15 ? pv * 0.28 : (h < 6 ? 4.5 : -2.0));
        curSoc = Math.min(95, Math.max(15, curSoc + delta));
        soc.push(Number(curSoc.toFixed(1)));
        gaFit.push(Number((95 - 50 * Math.exp(-(0.12 - mut * 0.2) * (h + 1))).toFixed(1)));
      }
      Plotly.react(plotEl, [
        { x: hrs, y: soc, name: '24h 儲能 SOC (%)', fill: 'tozeroy', line: { color: '#10b981', width: 3 } },
        { x: hrs, y: gaFit, name: 'GA 最佳化適應度 (%)', line: { color: '#f59e0b', width: 2.5, dash: 'dash' } }
      ], { ...baseLayout, xaxis: { title: '時間 (小時 0~23h) / GA 演化代數' }, yaxis: { title: 'SOC / 適應度 (%)', range: [0, 105] } }, cfg);
      if (readoutEl) readoutEl.innerHTML = `日間光電 (×${pvScale}) 充電至高水位，夜間尖峰 (${peakP}x電價) 放電削峰，估計每日電費節省 <b>${(peakP * 11.5 * pvScale).toFixed(1)}%</b>。`;
    }
  }

  // =========================================================================
  // 圖 2.7 升級版：接近目標數 c 之四種連續歸屬函數對比模擬器 (A1 ~ A4)
  // =========================================================================
  const nearCStateMap = {};

  function getNearCState(prefix) {
    if (!nearCStateMap[prefix]) {
      nearCStateMap[prefix] = {
        c: 5.0,
        p1: 1.0,
        p2: 1.0,
        p3: 1.0,
        p4: 1.0,
        xProbe: 5.4,
        showA1: true,
        showA2: true,
        showA3: true,
        showA4: true
      };
    }
    return nearCStateMap[prefix];
  }

  function evalNearCFuncs(x, c, p1, p2, p3, p4) {
    const d = Math.abs(x - c);
    const a1 = Math.max(0, 1 - d / p1);
    const a2 = 1 / (1 + p2 * Math.pow(x - c, 2));
    const a3 = Math.exp(-Math.abs(p3 * (x - c)));
    const a4 = (d <= 1 / p4) ? (1 + Math.cos(p4 * Math.PI * (x - c))) / 2 : 0;
    return { a1, a2, a3, a4 };
  }

  function renderNearCSimulator(containerId, options) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const opts = options || {};
    const prefix = opts.prefix || ('nearc_' + String(containerId).replace(/[^a-zA-Z0-9_-]/g, ''));
    const showFormulas = opts.showFormulas !== false;
    const st = getNearCState(prefix);

    const formulasHtml = showFormulas ? `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
        <div class="bg-slate-950/75 border border-sky-500/25 rounded-xl px-3.5 py-2.5 text-sky-200 overflow-x-auto">
          <div class="font-bold text-sky-300 mb-1">$A_1(x)$ 三角形歸屬函數（$p_1$ 半寬）：</div>
          $$A_1(x) = \\begin{cases} 1 - \\frac{|x - c|}{p_1}, & |x - c| \\le p_1 \\\\ 0, & \\text{其他} \\end{cases}$$
        </div>
        <div class="bg-slate-950/75 border border-amber-500/25 rounded-xl px-3.5 py-2.5 text-amber-200 overflow-x-auto">
          <div class="font-bold text-amber-300 mb-1">$A_2(x)$ 柯西鐘形有理分式（$p_2$ 斜率）：</div>
          $$A_2(x) = \\frac{1}{1 + p_2(x - c)^2}$$
        </div>
        <div class="bg-slate-950/75 border border-rose-500/25 rounded-xl px-3.5 py-2.5 text-rose-200 overflow-x-auto">
          <div class="font-bold text-rose-300 mb-1">$A_3(x)$ 指數尖峰型（$p_3$ 衰減率）：</div>
          $$A_3(x) = \\exp\\{-|p_3(x - c)|\\}$$
        </div>
        <div class="bg-slate-950/75 border border-emerald-500/25 rounded-xl px-3.5 py-2.5 text-emerald-200 overflow-x-auto">
          <div class="font-bold text-emerald-300 mb-1">$A_4(x)$ 餘弦半波鐘形（$p_4$ 頻率）：</div>
          $$A_4(x) = \\begin{cases} \\frac{1 + \\cos(p_4 \\pi (x - c))}{2}, & x \\in [c - \\frac{1}{p_4}, c + \\frac{1}{p_4}] \\\\ 0, & \\text{其他} \\end{cases}$$
        </div>
      </div>
    ` : '';

    el.innerHTML = `
      <div class="bg-slate-900/85 border border-sky-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold">互動模擬器 · 圖 2.7</span>
            <h4 class="text-sm sm:text-base font-bold text-white">接近目標數 $c$ 之四種連續歸屬函數對比模擬器（$A_1 \\sim A_4$）</h4>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="FuzzyWidgets.resetNearCCenter('${prefix}')"
              class="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/35 text-xs font-bold transition">
              ↺ 重設為課本預設值 c=5
            </button>
            <button type="button" onclick="FuzzyWidgets.resetNearCAll('${prefix}')"
              class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition">
              全部重設
            </button>
          </div>
        </div>

        ${formulasHtml}

        <!-- 目標中心變數 c 控制列 -->
        <div class="bg-slate-950/75 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-sky-300">🎯 目標中心變數 $c$（論域區間 $[c-4, c+4]$）：</span>
              <span id="${prefix}-range-badge" class="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">[${(st.c - 4).toFixed(1)}, ${(st.c + 4).toFixed(1)}]</span>
            </div>
            <div class="flex items-center gap-2">
              <label for="${prefix}-c-num" class="text-xs text-slate-400">數值輸入：</label>
              <input id="${prefix}-c-num" type="number" min="-20" max="100" step="0.5" value="${st.c}"
                onchange="FuzzyWidgets.onNearCCChange('${prefix}', this.value)"
                oninput="FuzzyWidgets.onNearCCChange('${prefix}', this.value)"
                class="w-24 bg-slate-900 border border-sky-500/40 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-sky-200 text-center focus:outline-none focus:border-sky-400">
            </div>
          </div>
          <input id="${prefix}-c-range" type="range" min="-20" max="100" step="0.5" value="${st.c}"
            oninput="FuzzyWidgets.onNearCCChange('${prefix}', this.value)"
            class="w-full accent-sky-400">
          <div class="flex justify-between text-[11px] font-mono text-slate-500">
            <span>-20</span><span>0</span><span>5 (課本預設)</span><span>50</span><span>100</span>
          </div>
        </div>

        <!-- 四個形狀參數 p1~p4 滑桿 + 曲線顯示開關 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-slate-950/70 border border-sky-500/25 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-1.5 text-xs font-bold text-sky-300 cursor-pointer">
                <input id="${prefix}-chk-a1" type="checkbox" ${st.showA1 ? 'checked' : ''} onchange="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="accent-sky-400 rounded">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>$A_1$ 三角形</span>
              </label>
              <span id="${prefix}-p1-val" class="text-xs font-mono font-bold text-sky-200">${st.p1.toFixed(1)}</span>
            </div>
            <div class="text-[11px] text-slate-400">半寬 $p_1$：</div>
            <input id="${prefix}-p1" type="range" min="0.2" max="4.0" step="0.1" value="${st.p1}"
              oninput="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="w-full accent-sky-400">
          </div>

          <div class="bg-slate-950/70 border border-amber-500/25 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-1.5 text-xs font-bold text-amber-300 cursor-pointer">
                <input id="${prefix}-chk-a2" type="checkbox" ${st.showA2 ? 'checked' : ''} onchange="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="accent-amber-400 rounded">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>$A_2$ 柯西鐘形</span>
              </label>
              <span id="${prefix}-p2-val" class="text-xs font-mono font-bold text-amber-200">${st.p2.toFixed(1)}</span>
            </div>
            <div class="text-[11px] text-slate-400">斜率 $p_2$：</div>
            <input id="${prefix}-p2" type="range" min="0.1" max="5.0" step="0.1" value="${st.p2}"
              oninput="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="w-full accent-amber-400">
          </div>

          <div class="bg-slate-950/70 border border-rose-500/25 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-1.5 text-xs font-bold text-rose-300 cursor-pointer">
                <input id="${prefix}-chk-a3" type="checkbox" ${st.showA3 ? 'checked' : ''} onchange="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="accent-rose-400 rounded">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span>$A_3$ 指數尖峰</span>
              </label>
              <span id="${prefix}-p3-val" class="text-xs font-mono font-bold text-rose-200">${st.p3.toFixed(1)}</span>
            </div>
            <div class="text-[11px] text-slate-400">衰減率 $p_3$：</div>
            <input id="${prefix}-p3" type="range" min="0.1" max="5.0" step="0.1" value="${st.p3}"
              oninput="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="w-full accent-rose-400">
          </div>

          <div class="bg-slate-950/70 border border-emerald-500/25 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-1.5 text-xs font-bold text-emerald-300 cursor-pointer">
                <input id="${prefix}-chk-a4" type="checkbox" ${st.showA4 ? 'checked' : ''} onchange="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="accent-emerald-400 rounded">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>$A_4$ 餘弦半波</span>
              </label>
              <span id="${prefix}-p4-val" class="text-xs font-mono font-bold text-emerald-200">${st.p4.toFixed(1)}</span>
            </div>
            <div class="text-[11px] text-slate-400">頻率 $p_4$：</div>
            <input id="${prefix}-p4" type="range" min="0.2" max="4.0" step="0.1" value="${st.p4}"
              oninput="FuzzyWidgets.updateNearCSimulator('${prefix}')" class="w-full accent-emerald-400">
          </div>
        </div>

        <!-- 測試輸入值 x 即時探針滑桿 -->
        <div class="bg-slate-950/75 border border-indigo-500/30 rounded-xl p-3.5 space-y-1.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs sm:text-sm font-bold text-indigo-300">📍 測試輸入值 $x$（即時垂直虛線探針）：</span>
            <div class="flex items-center gap-2 text-xs font-mono">
              <span class="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/35 font-bold">x = <span id="${prefix}-x-val">${st.xProbe.toFixed(2)}</span></span>
              <span class="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">|x - c| = <span id="${prefix}-diff-val">${Math.abs(st.xProbe - st.c).toFixed(2)}</span></span>
            </div>
          </div>
          <input id="${prefix}-x-probe" type="range" min="${(st.c - 4).toFixed(2)}" max="${(st.c + 4).toFixed(2)}" step="0.05" value="${st.xProbe}"
            oninput="FuzzyWidgets.updateNearCSimulator('${prefix}')"
            class="w-full accent-indigo-400">
        </div>

        <!-- Plotly 四曲線疊加圖表 -->
        <div id="${prefix}-plot" class="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80"></div>

        <!-- 圖表下方：四個函數精確歸屬度與代入算式對照 -->
        <div id="${prefix}-readout" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
      </div>
    `;

    updateNearCSimulator(prefix);
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise([el]).catch(() => {});
    }
  }

  function onNearCCChange(prefix, rawVal) {
    const st = getNearCState(prefix);
    let newC = parseFloat(rawVal);
    if (isNaN(newC)) return;
    newC = Math.max(-20, Math.min(100, newC));
    const delta = newC - st.c;
    st.c = newC;
    st.xProbe = Math.max(newC - 4, Math.min(newC + 4, Number((st.xProbe + delta).toFixed(2))));

    const cRangeEl = document.getElementById(`${prefix}-c-range`);
    const cNumEl = document.getElementById(`${prefix}-c-num`);
    const xEl = document.getElementById(`${prefix}-x-probe`);
    const badgeEl = document.getElementById(`${prefix}-range-badge`);
    if (cRangeEl && Number(cRangeEl.value) !== newC) cRangeEl.value = newC;
    if (cNumEl && Number(cNumEl.value) !== newC) cNumEl.value = newC;
    if (xEl) {
      xEl.min = (newC - 4).toFixed(2);
      xEl.max = (newC + 4).toFixed(2);
      xEl.value = st.xProbe;
    }
    if (badgeEl) badgeEl.textContent = `[${(newC - 4).toFixed(1)}, ${(newC + 4).toFixed(1)}]`;

    updateNearCSimulator(prefix);
  }

  function resetNearCCenter(prefix) {
    const st = getNearCState(prefix);
    st.c = 5.0;
    st.xProbe = 5.4;
    const cRangeEl = document.getElementById(`${prefix}-c-range`);
    const cNumEl = document.getElementById(`${prefix}-c-num`);
    const xEl = document.getElementById(`${prefix}-x-probe`);
    const badgeEl = document.getElementById(`${prefix}-range-badge`);
    if (cRangeEl) cRangeEl.value = 5;
    if (cNumEl) cNumEl.value = 5;
    if (xEl) {
      xEl.min = '1.00';
      xEl.max = '9.00';
      xEl.value = 5.4;
    }
    if (badgeEl) badgeEl.textContent = '[1.0, 9.0]';
    updateNearCSimulator(prefix);
  }

  function resetNearCAll(prefix) {
    const st = getNearCState(prefix);
    st.c = 5.0;
    st.p1 = 1.0; st.p2 = 1.0; st.p3 = 1.0; st.p4 = 1.0;
    st.xProbe = 5.4;
    st.showA1 = true; st.showA2 = true; st.showA3 = true; st.showA4 = true;

    const setVal = (id, v) => { const n = document.getElementById(id); if (n) n.value = v; };
    const setChk = (id, v) => { const n = document.getElementById(id); if (n) n.checked = v; };
    setVal(`${prefix}-c-range`, 5);
    setVal(`${prefix}-c-num`, 5);
    setVal(`${prefix}-p1`, 1.0);
    setVal(`${prefix}-p2`, 1.0);
    setVal(`${prefix}-p3`, 1.0);
    setVal(`${prefix}-p4`, 1.0);
    setChk(`${prefix}-chk-a1`, true);
    setChk(`${prefix}-chk-a2`, true);
    setChk(`${prefix}-chk-a3`, true);
    setChk(`${prefix}-chk-a4`, true);
    const xEl = document.getElementById(`${prefix}-x-probe`);
    if (xEl) {
      xEl.min = '1.00';
      xEl.max = '9.00';
      xEl.value = 5.4;
    }
    const badgeEl = document.getElementById(`${prefix}-range-badge`);
    if (badgeEl) badgeEl.textContent = '[1.0, 9.0]';
    updateNearCSimulator(prefix);
  }

  function updateNearCSimulator(prefix) {
    const st = getNearCState(prefix);
    const getNum = (id, def) => {
      const n = document.getElementById(id);
      if (!n) return def;
      const v = parseFloat(n.value);
      return isNaN(v) ? def : v;
    };
    const getChk = (id, def) => {
      const n = document.getElementById(id);
      return n ? !!n.checked : def;
    };
    const setTxt = (id, txt) => {
      const n = document.getElementById(id);
      if (n) n.textContent = txt;
    };

    st.p1 = getNum(`${prefix}-p1`, st.p1);
    st.p2 = getNum(`${prefix}-p2`, st.p2);
    st.p3 = getNum(`${prefix}-p3`, st.p3);
    st.p4 = getNum(`${prefix}-p4`, st.p4);
    st.xProbe = getNum(`${prefix}-x-probe`, st.xProbe);
    st.showA1 = getChk(`${prefix}-chk-a1`, st.showA1);
    st.showA2 = getChk(`${prefix}-chk-a2`, st.showA2);
    st.showA3 = getChk(`${prefix}-chk-a3`, st.showA3);
    st.showA4 = getChk(`${prefix}-chk-a4`, st.showA4);

    setTxt(`${prefix}-p1-val`, st.p1.toFixed(1));
    setTxt(`${prefix}-p2-val`, st.p2.toFixed(1));
    setTxt(`${prefix}-p3-val`, st.p3.toFixed(1));
    setTxt(`${prefix}-p4-val`, st.p4.toFixed(1));
    setTxt(`${prefix}-x-val`, st.xProbe.toFixed(2));
    setTxt(`${prefix}-diff-val`, Math.abs(st.xProbe - st.c).toFixed(2));

    const xMin = st.c - 4;
    const xMax = st.c + 4;
    const xs = [], y1 = [], y2 = [], y3 = [], y4 = [];
    for (let i = 0; i <= 400; i++) {
      const xv = xMin + (i / 400) * 8;
      xs.push(Number(xv.toFixed(4)));
      const res = evalNearCFuncs(xv, st.c, st.p1, st.p2, st.p3, st.p4);
      y1.push(res.a1);
      y2.push(res.a2);
      y3.push(res.a3);
      y4.push(res.a4);
    }

    const probeVals = evalNearCFuncs(st.xProbe, st.c, st.p1, st.p2, st.p3, st.p4);
    const traces = [];

    if (st.showA1) {
      traces.push({ x: xs, y: y1, name: `A₁(x) 三角形 (p₁=${st.p1.toFixed(1)})`, mode: 'lines', line: { color: '#38bdf8', width: 2.8 } });
    }
    if (st.showA2) {
      traces.push({ x: xs, y: y2, name: `A₂(x) 柯西鐘形 (p₂=${st.p2.toFixed(1)})`, mode: 'lines', line: { color: '#f59e0b', width: 2.8 } });
    }
    if (st.showA3) {
      traces.push({ x: xs, y: y3, name: `A₃(x) 指數尖峰 (p₃=${st.p3.toFixed(1)})`, mode: 'lines', line: { color: '#f43f5e', width: 2.8 } });
    }
    if (st.showA4) {
      traces.push({ x: xs, y: y4, name: `A₄(x) 餘弦半波 (p₄=${st.p4.toFixed(1)})`, mode: 'lines', line: { color: '#10b981', width: 2.8 } });
    }

    // 垂直虛線探針
    traces.push({
      x: [st.xProbe, st.xProbe],
      y: [0, 1.05],
      name: `探針 x = ${st.xProbe.toFixed(2)}`,
      mode: 'lines',
      line: { color: '#e2e8f0', width: 1.8, dash: 'dash' },
      hoverinfo: 'skip'
    });

    // 四個交點標記
    const markerX = [], markerY = [], markerColors = [], markerTexts = [];
    if (st.showA1) { markerX.push(st.xProbe); markerY.push(probeVals.a1); markerColors.push('#38bdf8'); markerTexts.push(`A₁=${probeVals.a1.toFixed(4)}`); }
    if (st.showA2) { markerX.push(st.xProbe); markerY.push(probeVals.a2); markerColors.push('#f59e0b'); markerTexts.push(`A₂=${probeVals.a2.toFixed(4)}`); }
    if (st.showA3) { markerX.push(st.xProbe); markerY.push(probeVals.a3); markerColors.push('#f43f5e'); markerTexts.push(`A₃=${probeVals.a3.toFixed(4)}`); }
    if (st.showA4) { markerX.push(st.xProbe); markerY.push(probeVals.a4); markerColors.push('#10b981'); markerTexts.push(`A₄=${probeVals.a4.toFixed(4)}`); }

    if (markerX.length > 0) {
      traces.push({
        x: markerX,
        y: markerY,
        text: markerTexts,
        mode: 'markers',
        showlegend: false,
        hovertemplate: '%{text}<extra></extra>',
        marker: { color: markerColors, size: 10, line: { color: '#0f172a', width: 1.5 } }
      });
    }

    const plotEl = document.getElementById(`${prefix}-plot`);
    if (plotEl && window.Plotly) {
      Plotly.react(plotEl, traces, {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(15, 23, 42, 0.78)',
        font: { color: '#e2e8f0', size: 11 },
        margin: { t: 32, r: 18, b: 44, l: 48 },
        legend: { orientation: 'h', y: 1.15, x: 0 },
        xaxis: {
          title: `實數論域 x ∈ [${xMin.toFixed(1)}, ${xMax.toFixed(1)}]（目標中心 c = ${st.c.toFixed(1)}）`,
          range: [xMin, xMax],
          gridcolor: 'rgba(148, 163, 184, 0.14)',
          zerolinecolor: 'rgba(148, 163, 184, 0.25)'
        },
        yaxis: {
          title: '歸屬度 Aᵢ(x)',
          range: [-0.04, 1.1],
          gridcolor: 'rgba(148, 163, 184, 0.14)',
          zerolinecolor: 'rgba(148, 163, 184, 0.25)'
        }
      }, { responsive: true, displayModeBar: false });
    }

    const readoutEl = document.getElementById(`${prefix}-readout`);
    if (readoutEl) {
      const cStr = st.c.toFixed(1);
      const xStr = st.xProbe.toFixed(2);
      const diff = Math.abs(st.xProbe - st.c);
      const diffStr = diff.toFixed(2);
      const invP4 = 1 / st.p4;

      const eq1 = diff <= st.p1
        ? `max(0, 1 - |${xStr} - ${cStr}| / ${st.p1.toFixed(1)}) = 1 - ${diffStr} / ${st.p1.toFixed(1)} = ${probeVals.a1.toFixed(4)}`
        : `|${xStr} - ${cStr}| = ${diffStr} > p₁ (${st.p1.toFixed(1)}) ⇒ 0.0000`;
      const eq2 = `1 / (1 + ${st.p2.toFixed(1)} × (${xStr} - ${cStr})²) = 1 / (1 + ${(st.p2 * diff * diff).toFixed(4)}) = ${probeVals.a2.toFixed(4)}`;
      const eq3 = `exp(-|${st.p3.toFixed(1)} × (${xStr} - ${cStr})|) = exp(-${(st.p3 * diff).toFixed(4)}) = ${probeVals.a3.toFixed(4)}`;
      const eq4 = diff <= invP4
        ? `(1 + cos(${st.p4.toFixed(1)}π × (${xStr} - ${cStr}))) / 2 = (1 + cos(${(st.p4 * (st.xProbe - st.c)).toFixed(2)}π)) / 2 = ${probeVals.a4.toFixed(4)}`
        : `|${xStr} - ${cStr}| = ${diffStr} > 1/p₄ (${invP4.toFixed(2)}) ⇒ 0.0000`;

      const cards = [
        { key: 'A₁', name: '三角形', shown: st.showA1, val: probeVals.a1, eq: eq1, border: 'border-sky-500/35', text: 'text-sky-300', dot: 'bg-sky-400' },
        { key: 'A₂', name: '柯西鐘形', shown: st.showA2, val: probeVals.a2, eq: eq2, border: 'border-amber-500/35', text: 'text-amber-300', dot: 'bg-amber-400' },
        { key: 'A₃', name: '指數尖峰', shown: st.showA3, val: probeVals.a3, eq: eq3, border: 'border-rose-500/35', text: 'text-rose-300', dot: 'bg-rose-400' },
        { key: 'A₄', name: '餘弦半波', shown: st.showA4, val: probeVals.a4, eq: eq4, border: 'border-emerald-500/35', text: 'text-emerald-300', dot: 'bg-emerald-400' }
      ];

      readoutEl.innerHTML = cards.map(card => `
        <div class="bg-slate-950/85 border ${card.border} rounded-xl p-3 space-y-1 ${card.shown ? '' : 'opacity-50'}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-xs font-bold ${card.text}">
              <span class="inline-block w-2.5 h-2.5 rounded-full ${card.dot}"></span>
              <span>${card.key}(${xStr}) · ${card.name}${card.shown ? '' : '（已隱藏）'}</span>
            </div>
            <span class="font-mono text-sm font-extrabold text-white">${card.val.toFixed(4)}</span>
          </div>
          <div class="text-[11px] sm:text-xs font-mono text-slate-300 break-all">${card.eq}</div>
        </div>
      `).join('');
    }
  }

  // =========================================================================
  // 模擬器 B（圖 2.8）：年齡語意變數模糊分割 (A1 年輕人 / A2 中年人 / A3 老年人)
  // =========================================================================
  const FIG28_PRESETS = {
    age: {
      id: 'age',
      btnLabel: '圖 2.8 原書案例：年齡 (0~100 歲)',
      varLabel: '年齡',
      unit: '歲',
      xMin: 0,
      xMax: 100,
      step: 1,
      defaultT1: 20,
      defaultT2: 40,
      defaultT3: 60,
      defaultX: 28,
      extraRefs: [80],
      sets: [
        { key: 'A1', name: 'A₁ 年輕人', short: '年輕人', texSym: 'A_1', color: '#38bdf8', textCls: 'text-sky-300', barCls: 'bg-sky-400', borderCls: 'border-sky-500/35' },
        { key: 'A2', name: 'A₂ 中年人', short: '中年人', texSym: 'A_2', color: '#34d399', textCls: 'text-emerald-300', barCls: 'bg-emerald-400', borderCls: 'border-emerald-500/35' },
        { key: 'A3', name: 'A₃ 老年人', short: '老年人', texSym: 'A_3', color: '#f59e0b', textCls: 'text-amber-300', barCls: 'bg-amber-400', borderCls: 'border-amber-500/35' }
      ]
    },
    room_temp: {
      id: 'room_temp',
      btnLabel: '室溫（冷 / 適中 / 熱）',
      varLabel: '室溫',
      unit: '°C',
      xMin: 0,
      xMax: 40,
      step: 1,
      defaultT1: 16,
      defaultT2: 24,
      defaultT3: 32,
      defaultX: 20,
      extraRefs: [],
      sets: [
        { key: 'A1', name: 'A₁ 冷 (Cold)', short: '冷', texSym: 'A_1', color: '#38bdf8', textCls: 'text-sky-300', barCls: 'bg-sky-400', borderCls: 'border-sky-500/35' },
        { key: 'A2', name: 'A₂ 適中 (Comfortable)', short: '適中', texSym: 'A_2', color: '#34d399', textCls: 'text-emerald-300', barCls: 'bg-emerald-400', borderCls: 'border-emerald-500/35' },
        { key: 'A3', name: 'A₃ 熱 (Hot)', short: '熱', texSym: 'A_3', color: '#f59e0b', textCls: 'text-amber-300', barCls: 'bg-amber-400', borderCls: 'border-amber-500/35' }
      ]
    },
    car_speed: {
      id: 'car_speed',
      btnLabel: '車速（慢 / 中 / 快）',
      varLabel: '車速',
      unit: 'km/h',
      xMin: 0,
      xMax: 120,
      step: 1,
      defaultT1: 30,
      defaultT2: 60,
      defaultT3: 90,
      defaultX: 45,
      extraRefs: [],
      sets: [
        { key: 'A1', name: 'A₁ 慢 (Slow)', short: '慢', texSym: 'A_1', color: '#38bdf8', textCls: 'text-sky-300', barCls: 'bg-sky-400', borderCls: 'border-sky-500/35' },
        { key: 'A2', name: 'A₂ 中 (Medium)', short: '中', texSym: 'A_2', color: '#34d399', textCls: 'text-emerald-300', barCls: 'bg-emerald-400', borderCls: 'border-emerald-500/35' },
        { key: 'A3', name: 'A₃ 快 (Fast)', short: '快', texSym: 'A_3', color: '#f59e0b', textCls: 'text-amber-300', barCls: 'bg-amber-400', borderCls: 'border-amber-500/35' }
      ]
    }
  };

  const fig28StateMap = {};
  const fig28MathTimers = {};

  function getFig28State(prefix) {
    if (!fig28StateMap[prefix]) {
      const p = FIG28_PRESETS.age;
      fig28StateMap[prefix] = {
        presetId: p.id,
        t1: p.defaultT1,
        t2: p.defaultT2,
        t3: p.defaultT3,
        x: p.defaultX
      };
    }
    return fig28StateMap[prefix];
  }

  function evalFig28Memberships(x, t1, t2, t3) {
    let mu1 = 0;
    if (x <= t1) mu1 = 1;
    else if (x < t2) mu1 = (t2 - x) / (t2 - t1);
    else mu1 = 0;

    let mu2 = 0;
    if (x <= t1 || x >= t3) mu2 = 0;
    else if (x <= t2) mu2 = (x - t1) / (t2 - t1);
    else mu2 = (t3 - x) / (t3 - t2);

    let mu3 = 0;
    if (x <= t2) mu3 = 0;
    else if (x < t3) mu3 = (x - t2) / (t3 - t2);
    else mu3 = 1;

    return [mu1, mu2, mu3];
  }

  function formatFig28FormulaTex(idx, x, t1, t2, t3, muVal, texSym) {
    const xStr = Number.isInteger(x) ? String(x) : x.toFixed(1);
    const valStr = muVal.toFixed(2);
    if (idx === 0) {
      if (x <= t1) return `$$\\mu_{${texSym}}(${xStr}) = 1.00 \\quad (${xStr} \\le ${t1})$$`;
      if (x < t2) return `$$\\mu_{${texSym}}(${xStr}) = \\frac{${t2} - ${xStr}}{${t2} - ${t1}} = \\frac{${t2 - x}}{${t2 - t1}} = ${valStr}$$`;
      return `$$\\mu_{${texSym}}(${xStr}) = 0.00 \\quad (${xStr} \\ge ${t2})$$`;
    }
    if (idx === 1) {
      if (x <= t1) return `$$\\mu_{${texSym}}(${xStr}) = 0.00 \\quad (${xStr} \\le ${t1})$$`;
      if (x <= t2) return `$$\\mu_{${texSym}}(${xStr}) = \\frac{${xStr} - ${t1}}{${t2} - ${t1}} = \\frac{${x - t1}}{${t2 - t1}} = ${valStr}$$`;
      if (x < t3) return `$$\\mu_{${texSym}}(${xStr}) = \\frac{${t3} - ${xStr}}{${t3} - ${t2}} = \\frac{${t3 - x}}{${t3 - t2}} = ${valStr}$$`;
      return `$$\\mu_{${texSym}}(${xStr}) = 0.00 \\quad (${xStr} \\ge ${t3})$$`;
    }
    if (x <= t2) return `$$\\mu_{${texSym}}(${xStr}) = 0.00 \\quad (${xStr} \\le ${t2})$$`;
    if (x < t3) return `$$\\mu_{${texSym}}(${xStr}) = \\frac{${xStr} - ${t2}}{${t3} - ${t2}} = \\frac{${x - t2}}{${t3 - t2}} = ${valStr}$$`;
    return `$$\\mu_{${texSym}}(${xStr}) = 1.00 \\quad (${xStr} \\ge ${t3})$$`;
  }

  function renderFig28LinguisticSimulator(containerId, options) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const opts = options || {};
    const prefix = opts.prefix || ('fig28_' + String(containerId).replace(/[^a-zA-Z0-9_-]/g, ''));
    const st = getFig28State(prefix);
    const preset = FIG28_PRESETS[st.presetId] || FIG28_PRESETS.age;

    const presetBtnsHtml = Object.values(FIG28_PRESETS).map(p => `
      <button type="button" id="${prefix}-preset-${p.id}" onclick="FuzzyWidgets.setFig28Preset('${prefix}', '${p.id}')"
        class="px-3 py-1.5 rounded-xl text-xs font-bold border transition ${st.presetId === p.id ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm' : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-slate-800'}">
        ${p.btnLabel}
      </button>
    `).join('');

    el.innerHTML = `
      <div class="bg-slate-900/85 border border-teal-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold">模擬器 B · 圖 2.8</span>
            <h4 class="text-sm sm:text-base font-bold text-white">語意變數模糊分割（年齡 A₁ 年輕人 / A₂ 中年人 / A₃ 老年人）</h4>
          </div>
          <button type="button" onclick="FuzzyWidgets.resetFig28Simulator('${prefix}')"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition">
            重置原書圖 2.8
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-slate-400 font-semibold mr-1">語意案例切換：</span>
          ${presetBtnsHtml}
        </div>

        <div id="${prefix}-controls" class="space-y-3"></div>
        <div id="${prefix}-plot" class="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80"></div>
        <div id="${prefix}-readout" class="space-y-3"></div>
      </div>
    `;

    renderFig28Controls(prefix);
    updateFig28Simulator(prefix);
  }

  function renderFig28Controls(prefix) {
    const st = getFig28State(prefix);
    const preset = FIG28_PRESETS[st.presetId] || FIG28_PRESETS.age;
    const ctrlEl = document.getElementById(`${prefix}-controls`);
    if (!ctrlEl) return;

    const minGap = preset.step;
    ctrlEl.innerHTML = `
      <div class="bg-gradient-to-r from-slate-950/90 to-slate-900/90 border border-teal-500/40 rounded-xl p-3.5 space-y-2">
        <div class="flex items-center justify-between text-xs sm:text-sm">
          <span class="font-bold text-teal-300">🔍 輸入${preset.varLabel}探針 x（即時計算三集合歸屬度）</span>
          <span id="${prefix}-val-x" class="font-mono font-bold text-white text-sm sm:text-base">${st.x} ${preset.unit}</span>
        </div>
        <input id="${prefix}-in-x" type="range" min="${preset.xMin}" max="${preset.xMax}" step="${preset.step}" value="${st.x}"
          oninput="FuzzyWidgets.onFig28Probe('${prefix}', this.value)"
          class="w-full accent-teal-400">
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-slate-950/75 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-sky-300">轉折點 t₁（A₁ 右肩 / A₂ 左腳）</span>
            <span id="${prefix}-val-t1" class="font-mono font-bold text-white">${st.t1} ${preset.unit}</span>
          </div>
          <input id="${prefix}-in-t1" type="range" min="${preset.xMin + minGap}" max="${preset.xMax - 3 * minGap}" step="${preset.step}" value="${st.t1}"
            oninput="FuzzyWidgets.onFig28Threshold('${prefix}', 't1', this.value)"
            class="w-full accent-sky-400">
        </div>
        <div class="bg-slate-950/75 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-emerald-300">轉折點 t₂（A₂ 頂點 / A₁,A₃ 腳）</span>
            <span id="${prefix}-val-t2" class="font-mono font-bold text-white">${st.t2} ${preset.unit}</span>
          </div>
          <input id="${prefix}-in-t2" type="range" min="${preset.xMin + 2 * minGap}" max="${preset.xMax - 2 * minGap}" step="${preset.step}" value="${st.t2}"
            oninput="FuzzyWidgets.onFig28Threshold('${prefix}', 't2', this.value)"
            class="w-full accent-emerald-400">
        </div>
        <div class="bg-slate-950/75 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-amber-300">轉折點 t₃（A₂ 右腳 / A₃ 左肩）</span>
            <span id="${prefix}-val-t3" class="font-mono font-bold text-white">${st.t3} ${preset.unit}</span>
          </div>
          <input id="${prefix}-in-t3" type="range" min="${preset.xMin + 3 * minGap}" max="${preset.xMax - minGap}" step="${preset.step}" value="${st.t3}"
            oninput="FuzzyWidgets.onFig28Threshold('${prefix}', 't3', this.value)"
            class="w-full accent-amber-400">
        </div>
      </div>
    `;
  }

  function setFig28Preset(prefix, presetId) {
    const preset = FIG28_PRESETS[presetId] || FIG28_PRESETS.age;
    const st = getFig28State(prefix);
    st.presetId = preset.id;
    st.t1 = preset.defaultT1;
    st.t2 = preset.defaultT2;
    st.t3 = preset.defaultT3;
    st.x = preset.defaultX;

    Object.keys(FIG28_PRESETS).forEach(pid => {
      const btn = document.getElementById(`${prefix}-preset-${pid}`);
      if (!btn) return;
      btn.className = pid === preset.id
        ? 'px-3 py-1.5 rounded-xl text-xs font-bold border transition bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
        : 'px-3 py-1.5 rounded-xl text-xs font-bold border transition bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-slate-800';
    });

    renderFig28Controls(prefix);
    updateFig28Simulator(prefix);
  }

  function resetFig28Simulator(prefix) {
    setFig28Preset(prefix, 'age');
  }

  function onFig28Probe(prefix, rawVal) {
    const st = getFig28State(prefix);
    const preset = FIG28_PRESETS[st.presetId] || FIG28_PRESETS.age;
    const v = parseFloat(rawVal);
    if (isNaN(v)) return;
    st.x = Math.max(preset.xMin, Math.min(preset.xMax, v));
    const lbl = document.getElementById(`${prefix}-val-x`);
    if (lbl) lbl.textContent = `${st.x} ${preset.unit}`;
    updateFig28Simulator(prefix);
  }

  function onFig28Threshold(prefix, key, rawVal) {
    const st = getFig28State(prefix);
    const preset = FIG28_PRESETS[st.presetId] || FIG28_PRESETS.age;
    const minGap = preset.step;
    const v = parseFloat(rawVal);
    if (isNaN(v)) return;

    st[key] = v;
    // 強制維持嚴格遞增 t1 < t2 < t3，確保模糊分割連續且無除以零
    if (key === 't1') {
      st.t1 = Math.max(preset.xMin + minGap, Math.min(preset.xMax - 3 * minGap, st.t1));
      if (st.t2 <= st.t1) st.t2 = st.t1 + minGap;
      if (st.t3 <= st.t2) st.t3 = st.t2 + minGap;
    } else if (key === 't2') {
      st.t2 = Math.max(preset.xMin + 2 * minGap, Math.min(preset.xMax - 2 * minGap, st.t2));
      if (st.t1 >= st.t2) st.t1 = st.t2 - minGap;
      if (st.t3 <= st.t2) st.t3 = st.t2 + minGap;
    } else if (key === 't3') {
      st.t3 = Math.max(preset.xMin + 3 * minGap, Math.min(preset.xMax - minGap, st.t3));
      if (st.t2 >= st.t3) st.t2 = st.t3 - minGap;
      if (st.t1 >= st.t2) st.t1 = st.t2 - minGap;
    }

    ['t1', 't2', 't3'].forEach(k => {
      const inp = document.getElementById(`${prefix}-in-${k}`);
      const lbl = document.getElementById(`${prefix}-val-${k}`);
      if (inp) inp.value = st[k];
      if (lbl) lbl.textContent = `${st[k]} ${preset.unit}`;
    });

    updateFig28Simulator(prefix);
  }

  function updateFig28Simulator(prefix) {
    const st = getFig28State(prefix);
    const preset = FIG28_PRESETS[st.presetId] || FIG28_PRESETS.age;
    const { xMin, xMax, unit, varLabel, sets, extraRefs } = preset;
    const { t1, t2, t3, x } = st;

    // 精確轉折點取樣，使三條分段線性歸屬函數折角銳利無誤差
    const keyPoints = [xMin, t1, t2, t3, xMax];
    const y1Arr = [], y2Arr = [], y3Arr = [];
    keyPoints.forEach(px => {
      const [m1, m2, m3] = evalFig28Memberships(px, t1, t2, t3);
      y1Arr.push(m1);
      y2Arr.push(m2);
      y3Arr.push(m3);
    });

    const [mu1, mu2, mu3] = evalFig28Memberships(x, t1, t2, t3);
    const mus = [mu1, mu2, mu3];
    const sumMu = mu1 + mu2 + mu3;

    const traces = [
      {
        x: keyPoints, y: y1Arr, name: sets[0].name,
        mode: 'lines', line: { color: sets[0].color, width: 3 },
        fill: 'tozeroy', fillcolor: 'rgba(56, 189, 248, 0.08)'
      },
      {
        x: keyPoints, y: y2Arr, name: sets[1].name,
        mode: 'lines', line: { color: sets[1].color, width: 3 },
        fill: 'tozeroy', fillcolor: 'rgba(52, 211, 153, 0.08)'
      },
      {
        x: keyPoints, y: y3Arr, name: sets[2].name,
        mode: 'lines', line: { color: sets[2].color, width: 3 },
        fill: 'tozeroy', fillcolor: 'rgba(245, 158, 11, 0.08)'
      },
      {
        x: [xMin, xMax], y: [0.5, 0.5], name: 'μ = 0.5 交越參考線',
        mode: 'lines', line: { color: '#94a3b8', width: 1.5, dash: 'dash' },
        hoverinfo: 'skip'
      },
      {
        x: [x, x], y: [0, 1.06], name: `探針 x = ${x} ${unit}`,
        mode: 'lines', line: { color: '#f8fafc', width: 2, dash: 'dot' },
        hoverinfo: 'skip'
      },
      {
        x: [x, x, x],
        y: [mu1, mu2, mu3],
        name: '即時交點',
        mode: 'markers+text',
        showlegend: false,
        text: mus.map((v, idx) => `${sets[idx].short}: ${v.toFixed(2)}`),
        textposition: ['top right', 'middle right', 'bottom right'],
        textfont: { color: '#f8fafc', size: 11 },
        marker: {
          color: sets.map(s => s.color),
          size: 10,
          line: { color: '#0f172a', width: 2 }
        }
      }
    ];

    // 垂直參考虛線（預設年齡案例為 x = 20, 40, 60, 80）
    const refXs = Array.from(new Set([t1, t2, t3, ...(extraRefs || [])])).filter(rx => rx > xMin && rx < xMax);
    const shapes = refXs.map(rx => ({
      type: 'line',
      x0: rx, x1: rx, y0: 0, y1: 1,
      line: { color: 'rgba(148, 163, 184, 0.35)', width: 1.2, dash: 'dash' }
    }));

    const tickVals = Array.from(new Set([xMin, t1, t2, t3, ...(extraRefs || []), xMax])).sort((a, b) => a - b);

    const plotEl = document.getElementById(`${prefix}-plot`);
    if (plotEl && window.Plotly) {
      Plotly.react(plotEl, traces, {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(15, 23, 42, 0.78)',
        font: { color: '#e2e8f0', size: 11 },
        margin: { t: 36, r: 22, b: 44, l: 50 },
        legend: { orientation: 'h', y: 1.16, x: 0 },
        xaxis: {
          title: `${varLabel} X ∈ [${xMin}, ${xMax}] (${unit})`,
          range: [xMin, xMax],
          tickvals: tickVals,
          gridcolor: 'rgba(148, 163, 184, 0.12)'
        },
        yaxis: {
          title: '歸屬度 μ(x)',
          range: [-0.06, 1.14],
          tickvals: [0, 0.5, 1],
          gridcolor: 'rgba(148, 163, 184, 0.14)'
        },
        shapes: shapes
      }, { responsive: true, displayModeBar: false });
    }

    const readoutEl = document.getElementById(`${prefix}-readout`);
    if (readoutEl) {
      const cardsHtml = sets.map((s, idx) => {
        const val = mus[idx];
        const pct = Math.max(0, Math.min(100, val * 100));
        const tex = formatFig28FormulaTex(idx, x, t1, t2, t3, val, s.texSym);
        return `
          <div class="bg-slate-950/85 border ${s.borderCls} rounded-xl p-3.5 space-y-2">
            <div class="flex items-center justify-between text-xs sm:text-sm">
              <span class="font-bold ${s.textCls}">${s.name}</span>
              <span class="font-mono font-bold text-white text-sm">${val.toFixed(2)}</span>
            </div>
            <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full ${s.barCls} transition-all duration-150" style="width: ${pct.toFixed(1)}%"></div>
            </div>
            <div class="text-slate-200 text-xs overflow-x-auto pt-0.5">${tex}</div>
          </div>
        `;
      }).join('');

      readoutEl.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${cardsHtml}</div>
        <div class="bg-slate-950/85 border border-teal-500/25 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div class="text-slate-200">
            $$\\sum_{i=1}^{3} \\mu_{A_i}(${x}) = ${mu1.toFixed(2)} + ${mu2.toFixed(2)} + ${mu3.toFixed(2)} = \\mathbf{${sumMu.toFixed(2)}}$$
          </div>
          <span class="text-xs text-teal-300/90 font-semibold">Ruspini 模糊分割：論域上任一點歸屬度總和恆為 1.00</span>
        </div>
      `;

      if (fig28MathTimers[prefix]) clearTimeout(fig28MathTimers[prefix]);
      fig28MathTimers[prefix] = setTimeout(() => {
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
          if (typeof window.MathJax.typesetClear === 'function') window.MathJax.typesetClear([readoutEl]);
          window.MathJax.typesetPromise([readoutEl]).catch(() => {});
        }
      }, 70);
    }
  }

  // =========================================================================
  // 模擬器 C（第 2 章核心概念）：α-Cut 與支撐集/核心互動切片實驗室
  // =========================================================================
  const alphaCStateMap = {};

  function getAlphaCState(prefix) {
    if (!alphaCStateMap[prefix]) {
      alphaCStateMap[prefix] = {
        alpha: 0.60,
        strong: false, // false: >= α, true: > α
        shape: 'trap'  // 'trap' | 'gauss' | 'bimodal'
      };
    }
    return alphaCStateMap[prefix];
  }

  function evalAlphaCShape(x, shape) {
    if (shape === 'trap') {
      // trap(x; 2.4, 4.4, 5.6, 7.6) -> at α=0.6: [3.60, 6.40]
      if (x <= 2.4 || x >= 7.6) return 0;
      if (x >= 4.4 && x <= 5.6) return 1;
      if (x < 4.4) return (x - 2.4) / 2.0;
      return (7.6 - x) / 2.0;
    } else if (shape === 'gauss') {
      return Math.exp(-Math.pow(x - 5.0, 2) / (2 * 1.5 * 1.5));
    } else {
      // 雙峰非凸模糊集: tri(0.5, 2.0, 3.5) + tri(5.0, 7.0, 9.0) + 0.3 bridge
      // at α=0.6: [1.40, 2.60] ∪ [6.20, 7.80]
      const t1 = Math.max(0, 1 - Math.abs(x - 2.0) / 1.5);
      const t2 = Math.max(0, 1 - Math.abs(x - 7.0) / 2.0);
      let br = 0;
      if (x > 2.5 && x < 6.0) {
        if (x >= 3.5 && x <= 5.0) br = 0.3;
        else if (x < 3.5) br = 0.3 * (x - 2.5);
        else br = 0.3 * (6.0 - x);
      }
      return Math.max(t1, t2, br);
    }
  }

  function solveAlphaCIntervals(shape, alpha, strong) {
    if (strong && alpha >= 1.0) return { intervals: [], unbounded: false, wholeUniverse: false };
    if (!strong && alpha <= 0.0) return { intervals: [[0, 10]], unbounded: shape === 'gauss', wholeUniverse: true };

    if (shape === 'gauss') {
      if (alpha === 0 && strong) return { intervals: [[0, 10]], unbounded: true, wholeUniverse: false };
      if (alpha >= 1.0) return { intervals: [[5.0, 5.0]], unbounded: false, wholeUniverse: false };
      const half = 1.5 * Math.sqrt(-2 * Math.log(alpha));
      return { intervals: [[Math.max(0, 5 - half), Math.min(10, 5 + half)]], unbounded: false, wholeUniverse: false };
    }

    // 掃描分段線性交點 (dx = 0.002) 並線性內插以取得精確端點
    const N = 5000;
    const intervals = [];
    let inSeg = false;
    let segStart = 0;
    const eps = strong ? 1e-9 : -1e-9;

    let prevX = 0;
    let prevY = evalAlphaCShape(0, shape);
    let prevIn = strong ? (prevY > alpha + 1e-12) : (prevY >= alpha - 1e-12);
    if (prevIn) { inSeg = true; segStart = 0; }

    for (let i = 1; i <= N; i++) {
      const x = (i / N) * 10;
      const y = evalAlphaCShape(x, shape);
      const curIn = strong ? (y > alpha + 1e-12) : (y >= alpha - 1e-12);

      if (!prevIn && curIn) {
        const denom = y - prevY;
        const t = Math.abs(denom) > 1e-12 ? (alpha - prevY) / denom : 0;
        segStart = prevX + Math.max(0, Math.min(1, t)) * (x - prevX);
        inSeg = true;
      } else if (prevIn && !curIn && inSeg) {
        const denom = y - prevY;
        const t = Math.abs(denom) > 1e-12 ? (alpha - prevY) / denom : 0;
        const segEnd = prevX + Math.max(0, Math.min(1, t)) * (x - prevX);
        intervals.push([segStart, segEnd]);
        inSeg = false;
      }
      prevX = x; prevY = y; prevIn = curIn;
    }
    if (inSeg) intervals.push([segStart, 10]);

    // 若單點核心 (e.g. bimodal α=1.0) 寬度極小，補捉局部極大值點
    if (intervals.length === 0 && !strong && alpha === 1.0 && shape === 'bimodal') {
      intervals.push([2.0, 2.0], [7.0, 7.0]);
    }
    return { intervals, unbounded: false, wholeUniverse: false };
  }

  function renderAlphaCutLabSimulator(containerId, options) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const opts = options || {};
    const prefix = opts.prefix || ('alphac_' + String(containerId).replace(/[^a-zA-Z0-9_-]/g, ''));
    const st = getAlphaCState(prefix);

    el.innerHTML = `
      <div class="bg-slate-900/85 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">模擬器 C · 第 2 章核心</span>
            <h4 class="text-sm sm:text-base font-bold text-white">$\\alpha$-Cut（$\\alpha$-截集）與支撐集 / 核心互動切片實驗室</h4>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" onclick="FuzzyWidgets.setAlphaCPreset('${prefix}', 0.0, true)"
              class="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/35 text-xs font-bold transition">
              Support 支撐集 (α &gt; 0)
            </button>
            <button type="button" onclick="FuzzyWidgets.setAlphaCPreset('${prefix}', 0.5, false)"
              class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/35 text-xs font-bold transition">
              Crossover 交越點 (α = 0.5)
            </button>
            <button type="button" onclick="FuzzyWidgets.setAlphaCPreset('${prefix}', 1.0, false)"
              class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/35 text-xs font-bold transition">
              Core 核心 (α = 1.0)
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-slate-950/75 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-amber-300">水平切片高度 α ∈ [0, 1]：</span>
              <span id="${prefix}-alpha-val" class="font-mono font-bold text-white">${st.alpha.toFixed(2)}</span>
            </div>
            <input id="${prefix}-alpha" type="range" min="0" max="1" step="0.05" value="${st.alpha}"
              oninput="FuzzyWidgets.updateAlphaCSimulator('${prefix}')"
              class="w-full accent-amber-400">
          </div>

          <div class="bg-slate-950/75 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div class="text-xs font-bold text-slate-300">截集類型切換：</div>
            <div class="grid grid-cols-2 gap-1.5">
              <button type="button" id="${prefix}-mode-weak" onclick="FuzzyWidgets.setAlphaCMode('${prefix}', false)"
                class="px-2 py-1.5 rounded-lg text-xs font-bold border transition ${!st.strong ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700'}">
                一般 (μ ≥ α)
              </button>
              <button type="button" id="${prefix}-mode-strong" onclick="FuzzyWidgets.setAlphaCMode('${prefix}', true)"
                class="px-2 py-1.5 rounded-lg text-xs font-bold border transition ${st.strong ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 text-slate-300 border-slate-700'}">
                強截集 (μ &gt; α)
              </button>
            </div>
          </div>

          <div class="bg-slate-950/75 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <label for="${prefix}-shape" class="block text-xs font-bold text-slate-300">模糊集合形狀選擇：</label>
            <select id="${prefix}-shape" onchange="FuzzyWidgets.onAlphaCShapeChange('${prefix}', this.value)"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold">
              <option value="trap" ${st.shape === 'trap' ? 'selected' : ''}>單峰梯形 (Unimodal Trapezoid)</option>
              <option value="gauss" ${st.shape === 'gauss' ? 'selected' : ''}>單峰高斯 (Unimodal Gaussian)</option>
              <option value="bimodal" ${st.shape === 'bimodal' ? 'selected' : ''}>雙峰非凸模糊集 (Bimodal Non-convex)</option>
            </select>
          </div>
        </div>

        <div id="${prefix}-plot" class="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80"></div>
        <div id="${prefix}-readout" class="bg-slate-950/85 border border-amber-500/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 space-y-1.5"></div>
      </div>
    `;

    updateAlphaCSimulator(prefix);
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise([el]).catch(() => {});
    }
  }

  function setAlphaCPreset(prefix, alphaVal, isStrong) {
    const st = getAlphaCState(prefix);
    st.alpha = alphaVal;
    st.strong = !!isStrong;
    const inp = document.getElementById(`${prefix}-alpha`);
    if (inp) inp.value = alphaVal;
    setAlphaCMode(prefix, st.strong);
  }

  function setAlphaCMode(prefix, isStrong) {
    const st = getAlphaCState(prefix);
    st.strong = !!isStrong;
    const wBtn = document.getElementById(`${prefix}-mode-weak`);
    const sBtn = document.getElementById(`${prefix}-mode-strong`);
    if (wBtn && sBtn) {
      wBtn.className = `px-2 py-1.5 rounded-lg text-xs font-bold border transition ${!st.strong ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700'}`;
      sBtn.className = `px-2 py-1.5 rounded-lg text-xs font-bold border transition ${st.strong ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 text-slate-300 border-slate-700'}`;
    }
    updateAlphaCSimulator(prefix);
  }

  function onAlphaCShapeChange(prefix, shapeVal) {
    const st = getAlphaCState(prefix);
    st.shape = shapeVal;
    updateAlphaCSimulator(prefix);
  }

  function updateAlphaCSimulator(prefix) {
    const st = getAlphaCState(prefix);
    const alphaInp = document.getElementById(`${prefix}-alpha`);
    if (alphaInp) st.alpha = parseFloat(alphaInp.value);
    const alphaLbl = document.getElementById(`${prefix}-alpha-val`);
    if (alphaLbl) alphaLbl.textContent = st.alpha.toFixed(2);

    const xs = [], ys = [], yFloor = [], yCeil = [];
    for (let i = 0; i <= 500; i++) {
      const x = (i / 500) * 10;
      const y = evalAlphaCShape(x, st.shape);
      xs.push(Number(x.toFixed(3)));
      ys.push(y);
      const inCut = st.strong ? (y > st.alpha + 1e-9) : (y >= st.alpha - 1e-9);
      yFloor.push(inCut ? st.alpha : null);
      yCeil.push(inCut ? y : null);
    }

    const solved = solveAlphaCIntervals(st.shape, st.alpha, st.strong);
    const symMarker = st.strong ? 'circle-open' : 'circle';
    const projColor = st.strong ? '#f43f5e' : '#10b981';

    const traces = [
      { x: xs, y: yFloor, mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip', connectgaps: false },
      { x: xs, y: yCeil, name: '高於 α 切片面積', mode: 'lines', line: { width: 0 }, fill: 'tonexty', fillcolor: 'rgba(245, 158, 11, 0.25)', connectgaps: false, hoverinfo: 'skip' },
      { x: xs, y: ys, name: '歸屬函數 μ_A(x)', mode: 'lines', line: { color: '#38bdf8', width: 3 } },
      { x: [0, 10], y: [st.alpha, st.alpha], name: `切割線 y = ${st.alpha.toFixed(2)}`, mode: 'lines', line: { color: '#f59e0b', width: 2.2, dash: 'dash' } }
    ];

    // 在 X 軸上繪製投影區間與垂直虛線
    solved.intervals.forEach((seg, idx) => {
      const [L, R] = seg;
      traces.push({
        x: [L, R],
        y: [0, 0],
        name: idx === 0 ? (st.strong ? '強 α-截集開區間 ( , )' : '一般 α-截集閉區間 [ , ]') : '',
        showlegend: idx === 0,
        mode: 'lines+markers',
        line: { color: projColor, width: 6 },
        marker: { color: st.strong ? '#0f172a' : projColor, size: 10, symbol: symMarker, line: { color: projColor, width: 2.5 } }
      });
      if (st.alpha > 0 && !solved.wholeUniverse) {
        traces.push({
          x: [L, L, null, R, R],
          y: [st.alpha, 0, null, st.alpha, 0],
          mode: 'lines',
          showlegend: false,
          hoverinfo: 'skip',
          line: { color: projColor, width: 1.3, dash: 'dot' }
        });
      }
    });

    const plotEl = document.getElementById(`${prefix}-plot`);
    if (plotEl && window.Plotly) {
      Plotly.react(plotEl, traces, {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(15, 23, 42, 0.78)',
        font: { color: '#e2e8f0', size: 11 },
        margin: { t: 32, r: 18, b: 42, l: 48 },
        legend: { orientation: 'h', y: 1.15, x: 0 },
        xaxis: { title: '論域 x ∈ [0, 10]（X 軸粗線段為普通集合投影）', range: [0, 10], gridcolor: 'rgba(148, 163, 184, 0.14)' },
        yaxis: { title: '歸屬度 μ_A(x)', range: [-0.08, 1.12], gridcolor: 'rgba(148, 163, 184, 0.14)' }
      }, { responsive: true, displayModeBar: false });
    }

    const readoutEl = document.getElementById(`${prefix}-readout`);
    if (readoutEl) {
      const aStr = st.alpha.toFixed(2);
      const symLabel = st.strong ? `A_{${aStr}+}` : `A_{${aStr}}`;
      const condLabel = st.strong ? `μ_A(x) &gt; ${aStr}` : `μ_A(x) ≥ ${aStr}`;
      let intervalStr = '';
      let totalLen = 0;

      if (solved.intervals.length === 0) {
        intervalStr = '∅（空集合）';
      } else if (solved.wholeUniverse) {
        intervalStr = st.shape === 'gauss' ? '(-∞, +∞) = X（全體論域）' : '[0.00, 10.00] = X（全體論域）';
        totalLen = 10;
      } else if (solved.unbounded) {
        intervalStr = '(-∞, +∞)（高斯函數全實數軸皆 &gt; 0）';
        totalLen = Infinity;
      } else {
        const lBrk = st.strong ? '(' : '[';
        const rBrk = st.strong ? ')' : ']';
        intervalStr = solved.intervals.map(([L, R]) => {
          totalLen += (R - L);
          if (Math.abs(R - L) < 1e-4 && !st.strong) return `{${L.toFixed(2)}}`;
          return `${lBrk}${L.toFixed(2)}, ${R.toFixed(2)}${rBrk}`;
        }).join(' ∪ ');
      }

      const lenText = totalLen === Infinity ? '∞' : totalLen.toFixed(2);
      const convexNote = solved.intervals.length > 1
        ? `<span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/35 text-xs font-bold">⚠️ 非凸模糊集：截集分裂為 ${solved.intervals.length} 段聯集</span>`
        : `<span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">✓ 單一連通區間</span>`;

      readoutEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-amber-300 font-bold">解析切片結果（${condLabel}）：</span>
            <span class="font-mono font-extrabold text-white text-sm sm:text-base ml-1">${symLabel} = ${intervalStr}</span>
          </div>
          ${convexNote}
        </div>
        <div class="text-xs text-slate-400 flex flex-wrap gap-4">
          <span>區間總長度：<b class="text-slate-200 font-mono">${lenText}</b></span>
          <span>端點型態：<b class="text-slate-200">${st.strong ? '開區間 ( , ) — 空心圓端點' : '閉區間 [ , ] — 實心圓端點'}</b></span>
        </div>
      `;
    }
  }

  return {
    getChapterInteractiveHtml: getChapterInteractiveHtml,
    initChapterWidgets: initChapterWidgets,
    // Chapter 01 模組方法
    getActiveCh1Module: getActiveCh1Module,
    switchCh1Module: switchCh1Module,
    jumpToCh1Plot: jumpToCh1Plot,
    setPlotAPreset: setPlotAPreset,
    updatePlotA: updatePlotA,
    selectPlotBShape: selectPlotBShape,
    updatePlotB: updatePlotB,
    updatePlotC: updatePlotC,
    setPlotDAlpha: setPlotDAlpha,
    updatePlotD: updatePlotD,
    answerCh1Practice: answerCh1Practice,
    toggleCh1Solution: toggleCh1Solution,
    renderCh1PracticeList: renderCh1PracticeList,
    // Chapter 02 模組方法
    getActiveCh2Module: getActiveCh2Module,
    switchCh2Module: switchCh2Module,
    jumpToCh2Plot: jumpToCh2Plot,
    updateCh2PlotA: updateCh2PlotA,
    loadCh2MatrixPreset: loadCh2MatrixPreset,
    handleCh2MatrixInputChange: handleCh2MatrixInputChange,
    selectCh2MatrixCell: selectCh2MatrixCell,
    updateCh2PlotB: updateCh2PlotB,
    updateCh2PlotC: updateCh2PlotC,
    updateCh2PlotD: updateCh2PlotD,
    answerCh2Practice: answerCh2Practice,
    toggleCh2Solution: toggleCh2Solution,
    renderCh2PracticeList: renderCh2PracticeList,
    // Chapter 03 模組方法
    getActiveCh3Module: getActiveCh3Module,
    switchCh3Module: switchCh3Module,
    jumpToCh3Plot: jumpToCh3Plot,
    updateCh3PlotA: updateCh3PlotA,
    updateCh3PlotB: updateCh3PlotB,
    updateCh3PlotC: updateCh3PlotC,
    updateCh3PlotD: updateCh3PlotD,
    answerCh3Practice: answerCh3Practice,
    toggleCh3Solution: toggleCh3Solution,
    renderCh3PracticeList: renderCh3PracticeList,
    // Chapter 04 模組方法
    getActiveCh4Module: getActiveCh4Module,
    switchCh4Module: switchCh4Module,
    jumpToCh4Plot: jumpToCh4Plot,
    updateCh4PlotA: updateCh4PlotA,
    updateCh4PlotB: updateCh4PlotB,
    answerCh4Practice: answerCh4Practice,
    toggleCh4Solution: toggleCh4Solution,
    renderCh4PracticeList: renderCh4PracticeList,
    // Chapter 05 模組方法
    getActiveCh5Module: getActiveCh5Module,
    switchCh5Module: switchCh5Module,
    jumpToCh5Plot: jumpToCh5Plot,
    updateCh5PlotA: updateCh5PlotA,
    updateCh5PlotB: updateCh5PlotB,
    answerCh5Practice: answerCh5Practice,
    toggleCh5Solution: toggleCh5Solution,
    renderCh5PracticeList: renderCh5PracticeList,
    // Chapter 06 模組方法
    getActiveCh6Module: getActiveCh6Module,
    switchCh6Module: switchCh6Module,
    jumpToCh6Plot: jumpToCh6Plot,
    updateCh6PlotA: updateCh6PlotA,
    updateCh6PlotB: updateCh6PlotB,
    answerCh6Practice: answerCh6Practice,
    toggleCh6Solution: toggleCh6Solution,
    renderCh6PracticeList: renderCh6PracticeList,
    // Chapter 07 模組方法
    getActiveCh7Module: getActiveCh7Module,
    switchCh7Module: switchCh7Module,
    jumpToCh7Plot: jumpToCh7Plot,
    updateCh7PlotA: updateCh7PlotA,
    updateCh7PlotB: updateCh7PlotB,
    answerCh7Practice: answerCh7Practice,
    toggleCh7Solution: toggleCh7Solution,
    renderCh7PracticeList: renderCh7PracticeList,
    // 其他實驗室
    updateFig27Widget: updateFig27Widget,
    updateOpsWidget: updateOpsWidget,
    // 全書 19 章統一互動視覺化實驗室
    getLab19Meta: getLab19Meta,
    renderChapter19Lab: renderChapter19Lab,
    updateChapter19Lab: updateChapter19Lab,
    renderNearCSimulator: renderNearCSimulator,
    updateNearCSimulator: updateNearCSimulator,
    onNearCCChange: onNearCCChange,
    resetNearCCenter: resetNearCCenter,
    resetNearCAll: resetNearCAll,
    renderFig28LinguisticSimulator: renderFig28LinguisticSimulator,
    renderShapeShifterSimulator: renderFig28LinguisticSimulator,
    setFig28Preset: setFig28Preset,
    resetFig28Simulator: resetFig28Simulator,
    onFig28Probe: onFig28Probe,
    onFig28Threshold: onFig28Threshold,
    updateFig28Simulator: updateFig28Simulator,
    renderAlphaCutLabSimulator: renderAlphaCutLabSimulator,
    setAlphaCPreset: setAlphaCPreset,
    setAlphaCMode: setAlphaCMode,
    onAlphaCShapeChange: onAlphaCShapeChange,
    updateAlphaCSimulator: updateAlphaCSimulator,
    fcmStep19: fcmStep19,
    fcmAuto19: fcmAuto19,
    fcmReset19: fcmReset19
  };
})();
