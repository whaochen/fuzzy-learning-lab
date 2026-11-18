// ============================================================================
// 全站數學公式「中英文口語朗讀對照資料庫」與「智慧 LaTeX 轉口語解析引擎」
// 提供台灣控制工程課堂中文念法、標準學術英文念法、Web Speech API 試聽與 PPT 備忘稿複製
// ============================================================================
(function (global) {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. 台灣控制工程課堂常用希臘字母與數學符號中英文對照表
  // --------------------------------------------------------------------------
  const GREEK_MAP = {
    '\\alpha': { zh: '阿爾法 (α)', en: 'alpha' },
    '\\beta': { zh: '貝塔 (β)', en: 'beta' },
    '\\gamma': { zh: '伽馬 (γ)', en: 'gamma' },
    '\\delta': { zh: '德爾塔 (δ)', en: 'delta' },
    '\\Delta': { zh: '大德爾塔 (Δ)', en: 'Delta' },
    '\\epsilon': { zh: '艾普西隆 (ε)', en: 'epsilon' },
    '\\varepsilon': { zh: '艾普西隆 (ε)', en: 'epsilon' },
    '\\zeta': { zh: '澤塔 (ζ)', en: 'zeta' },
    '\\eta': { zh: '艾塔 (η)', en: 'eta' },
    '\\theta': { zh: '西塔 (θ)', en: 'theta' },
    '\\vartheta': { zh: '西塔 (ϑ)', en: 'theta' },
    '\\Theta': { zh: '大西塔 (Θ)', en: 'Theta' },
    '\\iota': { zh: '艾歐塔 (ι)', en: 'iota' },
    '\\kappa': { zh: '卡帕 (κ)', en: 'kappa' },
    '\\lambda': { zh: '蘭姆達 (λ)', en: 'lambda' },
    '\\Lambda': { zh: '大蘭姆達 (Λ)', en: 'Lambda' },
    '\\mu': { zh: '謬 (μ)', en: 'mu' },
    '\\nu': { zh: '紐 (ν)', en: 'nu' },
    '\\xi': { zh: '克西 (ξ)', en: 'xi' },
    '\\Xi': { zh: '大克西 (Ξ)', en: 'Xi' },
    '\\pi': { zh: '拍 (π)', en: 'pi' },
    '\\Pi': { zh: '大拍 (Π)', en: 'Pi' },
    '\\rho': { zh: '柔 (ρ)', en: 'rho' },
    '\\sigma': { zh: '西格瑪 (σ)', en: 'sigma' },
    '\\Sigma': { zh: '大西格瑪 (Σ)', en: 'Sigma' },
    '\\tau': { zh: '套 (τ)', en: 'tau' },
    '\\upsilon': { zh: '宇普西隆 (υ)', en: 'upsilon' },
    '\\phi': { zh: '發依 (φ)', en: 'phi' },
    '\\varphi': { zh: '發依 (φ)', en: 'phi' },
    '\\Phi': { zh: '大發依 (Φ)', en: 'Phi' },
    '\\chi': { zh: '凱 (χ)', en: 'chi' },
    '\\psi': { zh: '普賽 (ψ)', en: 'psi' },
    '\\Psi': { zh: '大普賽 (Ψ)', en: 'Psi' },
    '\\omega': { zh: '歐美加 (ω)', en: 'omega' },
    '\\Omega': { zh: '大歐美加 (Ω)', en: 'Omega' }
  };

  // --------------------------------------------------------------------------
  // 2. 《認識 Fuzzy》第 1～19 章重點方程式：中英文口語朗讀精選資料庫
  // --------------------------------------------------------------------------
  const CURATED_SPOKEN_FORMULAS = [
    {
      id: 'zadeh-discrete',
      title: 'Zadeh 離散模糊集合表示法',
      test: (n) => /A=\\sum_\{i=1\}\^n\\frac\{\\mu_A\(x_i\)\}\{x_i\}/.test(n) || /A=\\sum_\{i\}\\frac\{\\mu_A\(x_i\)\}\{x_i\}/.test(n),
      zh: '模糊集合 A 等於 i 從 1 加總到 n，每一項是元素 x 下標 i 對應的歸屬度「謬」(μ) 下標 A of x 下標 i 除以 x 下標 i；注意這裡的加號代表集合元素的並列，斜線代表歸屬度與元素的綁定關係，不是真的在做除法或相加。',
      en: 'Fuzzy set A equals the Zadeh summation over i from 1 to n of mu sub A of x sub i over x sub i, where the plus sign denotes union of discrete elements and the slash pairs each element with its membership degree.'
    },
    {
      id: 'zadeh-continuous',
      title: 'Zadeh 連續模糊集合表示法',
      test: (n) => /\\int_X\\frac\{\\mu_A\(x\)\}\{x\}/.test(n),
      zh: '在連續論域 X 上，模糊集合 A 記為在 X 上對「謬」(μ) 下標 A of x 除以 x 取積分符號，表示集合由所有連續元素 x 與其對應的歸屬度所構成。',
      en: 'On a continuous universe X, fuzzy set A is represented as the integral over X of mu sub A of x over x.'
    },
    {
      id: 'zadeh-both',
      title: 'Zadeh 離散與連續表示法對照',
      test: (n) => /\\sum_\{i=1\}\^n\\frac\{\\mu_A\(x_i\)\}\{x_i\}.*\\int_X\\frac\{\\mu_A\(x\)\}\{x\}/.test(n) || /\\sum_\{i\}\\frac\{\\mu_A\(x_i\)\}\{x_i\}.*\\int_X\\frac\{\\mu_A\(x\)\}\{x\}/.test(n),
      zh: '離散論域時，模糊集合 A 寫成 i 從 1 到 n 的「謬」(μ) 下標 A of x 下標 i 除以 x 下標 i 的總和；連續論域時，則寫成在論域 X 上對「謬」(μ) 下標 A of x 除以 x 的積分表示。',
      en: 'For a discrete universe, fuzzy set A equals the summation of mu sub A of x sub i over x sub i; for a continuous universe, it is written as the integral over X of mu sub A of x over x.'
    },
    {
      id: 'membership-mapping',
      title: '歸屬度函數映射定義',
      test: (n) => /(\\mu_A|A):X\\to\[0,1\]/.test(n),
      zh: '模糊集合 A 的歸屬度函數「謬」(μ) 下標 A，是將論域 X 映射到 0 到 1 閉區間的函數；也就是對論域中的每一個元素 x，都賦予一個介於 0 與 1 之間的歸屬度。',
      en: 'The membership function mu sub A maps the universe of discourse X into the closed unit interval from zero to one.'
    },
    {
      id: 'characteristic-function',
      title: '明確集合特徵函數',
      test: (n) => /\\Phi_A\(x\)=\\begin\{cases\}/.test(n),
      zh: '明確集合 A 的特徵函數「大發依」(Φ) 下標 A of x 定義為：當 x 屬於 A 時函數值為 1，當 x 不屬於 A 時函數值為 0，只能非黑即白地映射到 0 或 1。',
      en: 'The characteristic function Phi sub A of x equals 1 when x is in A, and 0 when x is not in A, mapping X to the crisp binary set zero and one.'
    },
    {
      id: 'support-and-core',
      title: '支集 (Support) 與核 (Core)',
      test: (n) => /Supp\(A\).*Core\(A\)/.test(n),
      zh: '模糊集合 A 的支集 Supp of A，是指論域 X 中所有歸屬度「謬」(μ) 下標 A of x 嚴格大於 0 的元素集合；而核 Core of A，則是指所有歸屬度完全等於 1 的元素集合。',
      en: 'The support of A is the set of all x in X such that mu sub A of x is strictly greater than zero; the core of A is the set of all x in X where mu sub A of x equals one.'
    },
    {
      id: 'alpha-cut-both',
      title: 'α-截集與強 α-截集',
      test: (n) => /(\{\}\^\\alphaA|A_\\alpha)=\\\{x.*\\ge\\alpha\\\}.*(\{\}\^\{\\alpha\+\}A|A_\{\\alpha\+\})=\\\{x.*>\\alpha\\\}/.test(n),
      zh: '「阿爾法」(α) 截集，是指所有歸屬度大於或等於「阿爾法」(α) 的元素 x 所組成的明確集合；而強「阿爾法」(α) 截集，則是歸屬度嚴格大於「阿爾法」(α) 的元素集合。',
      en: 'The alpha-cut of A is the crisp set of all elements x whose membership degree is greater than or equal to alpha; the strong alpha-cut requires the membership degree to be strictly greater than alpha.'
    },
    {
      id: 'alpha-cut-single',
      title: 'α-截集定義',
      test: (n) => /^A_\\alpha=\\\{x\\inX\\mid\\mu_A\(x\)\\ge\\alpha\\\}$/.test(n),
      zh: '「阿爾法」(α) 截集 A 下標「阿爾法」(α)，等於論域 X 中滿足「謬」(μ) 下標 A of x 大於等於「阿爾法」(α) 的所有 x 所構成的集合。',
      en: 'The alpha-cut A sub alpha equals the set of all x in X such that mu sub A of x is greater than or equal to alpha.'
    },
    {
      id: 'decomposition-theorem',
      title: '模糊集合分解定理',
      test: (n) => /\\bigcup_\{\\alpha\\in\[0,1\]\}\\alpha\\cdotA_\\alpha/.test(n),
      zh: '模糊集合分解定理：任何模糊集合 A 都可以表達成對所有介於 0 到 1 的「阿爾法」(α)，將「阿爾法」(α) 乘以對應截集 A 下標「阿爾法」(α) 後取聯集；換言之，「謬」(μ) 下標 A of x 等於「阿爾法」(α) 乘以截集特徵函數之上確界 supremum。',
      en: 'By the decomposition theorem, fuzzy set A equals the union over all alpha in zero to one of alpha times the alpha-cut A sub alpha; equivalently, mu sub A of x equals the supremum over alpha of alpha times the characteristic function of A sub alpha.'
    },
    {
      id: 'normal-height',
      title: '模糊集合高度與正規性',
      test: (n) => /h\(A\)=\\max_\{x\\inX\}A\(x\)/.test(n),
      zh: '模糊集合 A 的高度 h of A，等於 A of x 在整個論域 X 上的最大值；當高度 h of A 等於 1 時，我們稱這個模糊集合為正規模糊集合 Normal Fuzzy Set。',
      en: 'The height h of A equals the maximum of A of x over all x in X; when h of A equals one, the fuzzy set is called normal.'
    },
    {
      id: 'convex-fuzzy',
      title: '凸模糊集合條件',
      test: (n) => /A\(\\lambdax_1\+\(1-\\lambda\)x_2\)\\ge\\min\(A\(x_1\),A\(x_2\)\)/.test(n),
      zh: '凸形條件：對任意介於 0 到 1 的「蘭姆達」(λ)，x 1 與 x 2 線性組合後的歸屬度 A of「蘭姆達」(λ) x 1 加上 1 減「蘭姆達」(λ) x 2，必須大於等於 A of x 1 與 A of x 2 兩者的最小值。',
      en: 'Convexity condition: for any lambda in zero to one, A of lambda x 1 plus one minus lambda times x 2 is greater than or equal to the minimum of A of x 1 and A of x 2.'
    },
    {
      id: 'scalar-cardinality',
      title: '純基數 (Scalar Cardinality)',
      test: (n) => /\|A\|=\\sum_\{x\\inX\}A\(x\)/.test(n),
      zh: '模糊集合 A 的純基數，記為 A 的絕對值，等於論域 X 中所有元素歸屬度 A of x 的總和。',
      en: 'The scalar cardinality of fuzzy set A, denoted by the absolute value of A, equals the summation of A of x over all x in X.'
    },
    {
      id: 'triangular-mf',
      title: '三角形歸屬度函數解析式',
      test: (n) => /\\text\{trimf\}/.test(n) || /A_1\(x\)=\\begin\{cases\}\(x-5\)\+1/.test(n),
      zh: '三角形歸屬度函數：由左端點、頂點與右端點三個參數決定，在左斜坡呈線性遞增至頂點 1，再於右斜坡線性遞減至 0，超出支集範圍則歸屬度為 0。',
      en: 'Triangular membership function: defined by three parameters for the left foot, peak, and right foot, rising linearly to one at the peak and falling linearly to zero outside the support.'
    },
    {
      id: 'bell-rational-mf',
      title: '鐘形有理分式歸屬度函數',
      test: (n) => /A_2\(x\)=\\frac\{1\}\{1\+p_2\(x-5\)\^2\}/.test(n),
      zh: '鐘形有理分式歸屬度函數 A 2 of x，等於 1 除以「1 加上 p 2 乘以 x 減 5 的平方」，當 x 等於中心點 5 時達到最大值 1，並隨距離平滑衰減。',
      en: 'Bell-shaped rational membership function A 2 of x equals one over one plus p 2 times the quantity x minus 5 squared.'
    },
    {
      id: 'gaussian-mf',
      title: '高斯歸屬度函數',
      test: (n) => /exp\(-\\frac\{\(x-[a-zA-Z0-9_]+\)\^2\}\{2\\sigma\^2\}\)/.test(n) || /gaussmf/.test(n),
      zh: '高斯型歸屬度函數，等於自然指數 exp 負的分子「x 減中心點 c 的平方」除以分母「2 倍的西格瑪 (σ) 平方」，其中 c 為中心位置，「西格瑪」(σ) 控制鐘形曲線的寬度。',
      en: 'Gaussian membership function equals the exponential of negative quantity x minus c squared over two times sigma squared, where c is the center and sigma controls the width.'
    },
    {
      id: 'fuzzy-contradiction',
      title: '模糊交集不滿足傳統矛盾律',
      test: (n) => /\\mu_\{A\\cap\\bar\{A\}\}\(x\)=\\min\(\\mu_A\(x\),1-\\mu_A\(x\)\)\\le0\.5/.test(n),
      zh: '集合 A 與其補集 A bar 的交集歸屬度，等於「謬」(μ) 下標 A of x 與「1 減謬 (μ) 下標 A of x」取最小值，其結果恆小於等於 0.5；這說明模糊集合允許部分重疊，不嚴格遵守傳統矛盾律。',
      en: 'The membership degree of A intersection A complement equals the minimum of mu sub A of x and one minus mu sub A of x, which is always less than or equal to 0.5, showing that fuzzy sets violate the classical law of non-contradiction.'
    },
    {
      id: 'sugeno-complement',
      title: 'Sugeno 參數化模糊補集',
      test: (n) => /c_\\lambda\(a\)=\\frac\{1-a\}\{1\+\\lambdaa\}/.test(n),
      zh: 'Sugeno 模糊補集 c 下標「蘭姆達」(λ) of a，等於分子「1 減 a」除以分母「1 加上蘭姆達 (λ) 乘以 a」，其中「蘭姆達」(λ) 須大於負 1。',
      en: 'Sugeno fuzzy complement c sub lambda of a equals one minus a over one plus lambda times a, where lambda is strictly greater than negative one.'
    },
    {
      id: 't-norm-s-norm',
      title: 'T-norm 與 S-norm 邊界條件',
      test: (n) => /T\(a,b\)\\le\\min\(a,b\).*S\(a,b\)\\ge\\max\(a,b\)/.test(n),
      zh: '所有廣義交集運算 T-norm T of a, b 皆小於等於 a 與 b 的最小值；所有廣義聯集運算 S-norm S of a, b 皆大於等於 a 與 b 的最大值。',
      en: 'Any T-norm T of a and b is less than or equal to the minimum of a and b, while any S-norm S of a and b is greater than or equal to the maximum of a and b.'
    },
    {
      id: 'extension-principle',
      title: 'Zadeh 擴張原理 (Extension Principle)',
      test: (n) => /\\mu_B\(y\)=\\sup_\{x:f\(x\)=y\}\\mu_A\(x\)/.test(n) || /\\mu_\{f\(A,B\)\}\(y\)=\\sup_\{y=f\(x_1,x_2\)\}/.test(n),
      zh: '擴張原理：輸出模糊集合的歸屬度「謬」(μ) of y，等於對所有滿足「f of x 等於 y」的輸入點，取其輸入歸屬度的上確界 supremum；若有兩個輸入變量，則取兩者歸屬度最小值的上確界。',
      en: 'By the Extension Principle, the output membership mu of y equals the supremum over all pre-images satisfying f of x equals y of the input membership degrees.'
    },
    {
      id: 'fuzzy-arithmetic-alpha',
      title: '模糊數 α-截集區間加減法',
      test: (n) => /\(A\+B\)_\\alpha=.*\(A-B\)_\\alpha=/.test(n),
      zh: '模糊數加減法於「阿爾法」(α) 截集層級進行區間運算：A 加 B 的「阿爾法」(α) 截集等於「下界 a 1 加 b 1」到「上界 a 2 加 b 2」；而 A 減 B 則是「a 1 減 b 2」到「a 2 減 b 1」，注意減法上下界須交叉相減。',
      en: 'Interval arithmetic on alpha-cuts: the alpha-cut of A plus B is from a 1 plus b 1 to a 2 plus b 2, whereas A minus B is from a 1 minus b 2 to a 2 minus b 1.'
    },
    {
      id: 'max-min-composition',
      title: '模糊關係 Max-Min 合成運算',
      test: (n) => /\\mu_\{R\\circS\}\(x,z\)=\\max_\{y\\inY\}\\min/.test(n),
      zh: '模糊關係 R 與 S 的合成「R 圈 S」在點 (x, z) 的歸屬度，等於對所有中間元素 y 屬於 Y，先取「謬」(μ) 下標 R of x, y 與「謬」(μ) 下標 S of y, z 兩者的最小值，再對所有 y 取最大值，即著名的 Max-Min 合成運算。',
      en: 'The Max-Min composition of fuzzy relations R and S at (x, z) equals the maximum over y in Y of the minimum of mu sub R of x, y and mu sub S of y, z.'
    },
    {
      id: 'fuzzy-rule-if-then',
      title: '模糊控制 IF-THEN 規則',
      test: (n) => /\\text\{IF\}e\\text\{is\}PB\\text\{AND\}\\dot\{e\}\\text\{is\}ZO/.test(n),
      zh: '標準模糊控制規則：如果誤差 e 為正大 (PB)，且誤差變化率 e dot 為零 (ZO)，那麼控制輸出 u 應設為正大 (PB)。',
      en: 'Fuzzy control rule: IF error e is Positive Big AND error derivative e-dot is Zero, THEN control output u is Positive Big.'
    },
    {
      id: 'aggregation-max',
      title: '多規則輸出聚合 (Aggregation)',
      test: (n) => /\\mu_\{\\tilde\{B\}_\{\\text\{agg\}\}\}\(y\)=\\max_/.test(n),
      zh: '聚合後的輸出模糊集合歸屬度「謬」(μ) 下標 B tilde agg of y，等於對第 1 到第 3 條規則推論結果取最大值聯集包絡線。',
      en: 'The aggregated output membership mu sub B-tilde-agg of y equals the maximum across all active rules l in 1, 2, 3.'
    },
    {
      id: 'cog-integral',
      title: '重心法解模糊化 (連續積分型 COG)',
      test: (n) => /u\^\*=\\frac\{\\intu\\cdot\\mu_\{out\}\(u\)\\,du\}\{\\int\\mu_\{out\}\(u\)\\,du\}/.test(n),
      zh: '重心法解模糊化：最佳控制輸出 u 星號，等於分子「u 乘以輸出歸屬度謬 (μ) 下標 out of u 對 u 的積分」，除以分母「輸出歸屬度謬 (μ) 下標 out of u 對 u 的積分」，物理意義就是求輸出面積的形心座標。',
      en: 'Center of Gravity defuzzification: the crisp output u-star equals the integral of u times mu sub out of u du divided by the integral of mu sub out of u du.'
    },
    {
      id: 'cog-discrete',
      title: '重心法解模糊化 (離散加總型 COG)',
      test: (n) => /y\^\*_\{\\text\{COG\}\}=\\frac\{\\sum_\{k\}y_k/.test(n) || /T_\{wash\}=\\frac\{\\sum_\{k=1\}\^Mw_k\\cdott_k\}/.test(n),
      zh: '離散重心法（加權平均解模糊化）：將每個離散點或規則輸出乘上對應的歸屬度權重後加總作為分子，再除以所有歸屬度權重的總和作為分母，即可得到精確的單一輸出值。',
      en: 'Discrete Center of Gravity defuzzification: the crisp output equals the weighted sum of output values multiplied by their membership weights, divided by the sum of all weights.'
    },
    {
      id: 'ts-anfis-output',
      title: 'T-S 模型 / ANFIS 第五層加權總輸出',
      test: (n) => /f=\\sum_\{i\}\\bar\{w\}_if_i=\\sum_i\\bar\{w\}_i\(p_ix\+q_iy\+r_i\)/.test(n),
      zh: 'Takagi-Sugeno 模型與 ANFIS 總輸出 f，等於各條規則正規化激發強度「w bar」下標 i 乘以線性後件函數 f 下標 i 的總和；展開即為 w bar 下標 i 乘以「p i x 加上 q i y 加上 r i」的加總。',
      en: 'In the Takagi-Sugeno model and ANFIS, the overall output f equals the summation over i of normalized firing strength w-bar sub i times the linear consequent function f sub i, which is p sub i x plus q sub i y plus r sub i.'
    },
    {
      id: 'anfis-gradient',
      title: 'ANFIS 前件參數梯度下降更新律',
      test: (n) => /\\theta_\{premise\}\(t\+1\)=\\theta_\{premise\}\(t\)-\\eta\\frac\{\\partialE\}\{\\partial\\theta_\{premise\}\}/.test(n),
      zh: 'ANFIS 前件參數更新式：下一時刻的「西塔」(θ) 下標 premise，等於當前時刻的「西塔」(θ) 下標 premise 減去學習率「艾塔」(η) 乘以誤差函數 E 對「西塔」(θ) 下標 premise 的偏微分梯度。',
      en: 'ANFIS premise parameter update rule: theta sub premise at step t plus 1 equals theta sub premise at step t minus learning rate eta times the partial derivative of error E with respect to theta sub premise.'
    },
    {
      id: 'fcm-objective',
      title: 'FCM 模糊 C-均值聚類目標函數',
      test: (n) => /J_m\(U,V\)=\\sum_\{i=1\}\^c\\sum_\{j=1\}\^nu_\{ij\}\^m/.test(n),
      zh: '模糊 C-均值聚類 FCM 目標函數 J 下標 m of U, V，等於對所有群組 i 從 1 到 c、所有樣本 j 從 1 到 n，將隸屬度 u 下標 i j 的 m 次方乘以樣本 x 下標 j 與群心 v 下標 i 歐氏距離的平方進行雙重加總；同時滿足每個樣本對所有群組的隸屬度總和為 1。',
      en: 'Fuzzy C-Means objective function J sub m of U and V equals the double summation over cluster i from 1 to c and sample j from 1 to n of u sub i j to the power m times the squared Euclidean distance between x sub j and cluster center v sub i, subject to the sum of u sub i j over i equals one.'
    },
    {
      id: 'fcm-updates',
      title: 'FCM 群心與隸屬度更新方程式',
      test: (n) => /v_i=\\frac\{\\sum_\{j=1\}\^nu_\{ij\}\^mx_j\}/.test(n),
      zh: 'FCM 最佳化疊代更新式：第 i 群的群心 v 下標 i，等於所有樣本 x 下標 j 以隸屬度 u 下標 i j 的 m 次方為權重的加權平均；而隸屬度 u 下標 i j 則依據樣本到第 i 群與到各群 k 的距離比值之「2 除以 m 減 1」次方加總後取倒數來更新。',
      en: 'FCM iterative updates: cluster center v sub i is the weighted average of samples x sub j weighted by u sub i j to the m; membership u sub i j is updated as the inverse sum of distance ratios raised to the power 2 over m minus 1.'
    },
    {
      id: 'ga-itae',
      title: '遺傳模糊系統適應度函數與 ITAE 指標',
      test: (n) => /Fitness=\\frac\{1\}\{1\+ITAE\}/.test(n),
      zh: '適應度函數 Fitness 等於 1 除以「1 加上 ITAE」，其中 ITAE 是時間 t 乘以誤差絕對值從 0 到 T 的積分；當誤差隨時間越快收斂時，ITAE 越小，適應度就越高。',
      en: 'Fitness equals one over one plus ITAE, where ITAE is the integral from zero to T of time t times the absolute error e of t dt.'
    },
    {
      id: 'universal-approximator',
      title: '模糊系統萬能逼近定理',
      test: (n) => /\|\\hat\{f\}\(x\\mid\\theta\)-f\(x\)\|<\\varepsilon/.test(n),
      zh: '萬能逼近定理：在緊緻論域 U 上的任意連續函數 f of x，我們總能找到一組參數「西塔」(θ)，使得模糊系統輸出 f hat of x given「西塔」(θ) 與真實函數 f of x 之誤差絕對值小於任意給定的正數「艾普西隆」(ε)。',
      en: 'Universal Approximation Theorem: the absolute difference between the fuzzy approximator f-hat of x given theta and the target continuous function f of x is strictly less than epsilon for all x in U.'
    },
    {
      id: 'adaptive-fuzzy-law',
      title: '適應性模糊控制參數調整律',
      test: (n) => /\\dot\{\\theta\}=\\gamma\\cdote\^TPb\\cdot\\xi\(x\)/.test(n),
      zh: 'Lyapunov 適應律：參數向量「西塔」(θ) 的時間微分「西塔 dot」，等於適應增益「伽馬」(γ) 乘以誤差向量轉置 e transpose、正定矩陣 P、向量 b 以及模糊基底函數向量「克西」(ξ) of x 的乘積，確保閉迴路系統穩定收斂。',
      en: 'Adaptive law: theta-dot equals adaptation gain gamma times e-transpose P b times fuzzy basis function vector xi of x.'
    },
    {
      id: 'type2-fuzzy',
      title: 'Type-2 二型模糊集合與 FOU',
      test: (n) => /\\tilde\{A\}=\\int_\{x\\inX\}\\int_\{u\\inJ_x/.test(n),
      zh: '二型模糊集合 A tilde 表達為論域 x 與次要歸屬度集合 J x 的雙重積分，其不確定性足跡 FOU 等於所有 x 對應之區間 J x 的聯集，能同時建模語意本身的不確定性。',
      en: 'A Type-2 fuzzy set A-tilde is represented as the double integral over x in X and u in J sub x of one over (x, u), with its Footprint of Uncertainty FOU equal to the union of J sub x over all x.'
    },
    {
      id: 'abs-slip-ratio',
      title: 'ABS 防鎖死煞車車輪滑移率',
      test: (n) => /\\lambda=\\frac\{v-\\omegaR\}\{v\}/.test(n),
      zh: '車輪滑移率「蘭姆達」(λ)，等於車速 v 減去車輪角速度「歐美加」(ω) 乘以車輪半徑 R，再除以車速 v，數值介於 0 到 1 之間。',
      en: 'Wheel slip ratio lambda equals vehicle speed v minus wheel angular velocity omega times radius R, all divided by v, lying in the interval zero to one.'
    },
    {
      id: 'bellman-zadeh-decision',
      title: 'Bellman-Zadeh 模糊多目標決策',
      test: (n) => /\\mu_D\(x\)=\\min\(\\mu_G\(x\),\\mu_C\(x\)\)/.test(n),
      zh: '模糊決策歸屬度「謬」(μ) 下標 D of x，等於目標歸屬度「謬」(μ) 下標 G of x 與限制條件歸屬度「謬」(μ) 下標 C of x 兩者的最小值；最佳決策 x 星號即為使決策歸屬度最大化的 x。',
      en: 'Fuzzy decision membership mu sub D of x equals the minimum of goal membership mu sub G of x and constraint membership mu sub C of x; the optimal decision x-star maximizes mu sub D of x.'
    },
    {
      id: 'pv-mppt',
      title: '太陽光電 MPPT 最大功率點追蹤條件',
      test: (n) => /\\frac\{dP\}\{dV\}=0/.test(n) || /\\DeltaP\/\\DeltaV/.test(n),
      zh: '光電系統最大功率點追蹤 MPPT 條件：功率 P 對電壓 V 的導數 dP 除以 dV 等於 0；模糊 MPPT 控制器即是透過觀測功率變化量「德爾塔」(Δ) P 與電壓變化量「德爾塔」(Δ) V 的比值，動態調整工作週期步階。',
      en: 'Photovoltaic MPPT optimality condition: the derivative of power P with respect to voltage V, dP over dV, equals zero.'
    },
    {
      id: 'ship-heading-ess',
      title: '船舶航向 / 儲能系統模糊控制',
      test: (n) => /(\\delta_r|SOC|P_\{ESS\}|\\psi_d)/.test(n),
      zh: '系統狀態誤差 e 與誤差變化率「e dot」經模糊化與推論規則庫合成後，輸出對應的控制訊號（如船舶舵角或儲能充放電功率調控量），兼顧快速響應與抑制超調。',
      en: 'The state error and its rate of change are fuzzified and processed by the fuzzy rule base to compute the control action, such as ship rudder angle or energy storage power dispatch.'
    }
  ];

  // --------------------------------------------------------------------------
  // 3. 智慧 LaTeX 轉口語解析引擎 (Fallback 自動解析任意通用 LaTeX)
  // --------------------------------------------------------------------------
  function normalizeForMatch(latex) {
    return (latex || '')
      .replace(/\\,|\\;|\\:|\\!|\\quad|\\qquad/g, '')
      .replace(/\\left|\\right|\\big|\\Big|\\bigg|\\Bigg/g, '')
      .replace(/\s+/g, '');
  }

  function readBracedGroup(str, startIdx) {
    if (startIdx >= str.length || str[startIdx] !== '{') return null;
    let depth = 0;
    for (let i = startIdx; i < str.length; i++) {
      if (str[i] === '\\' && i + 1 < str.length) {
        i++;
        continue;
      }
      if (str[i] === '{') depth++;
      else if (str[i] === '}') {
        depth--;
        if (depth === 0) {
          return {
            content: str.slice(startIdx + 1, i),
            endIdx: i + 1
          };
        }
      }
    }
    return null;
  }

  function replaceCommand2Args(str, cmd, formatter) {
    let out = str;
    let guard = 0;
    while (guard++ < 40) {
      const idx = out.indexOf(cmd);
      if (idx === -1) break;
      let cursor = idx + cmd.length;
      while (cursor < out.length && /\s/.test(out[cursor])) cursor++;
      const g1 = readBracedGroup(out, cursor);
      if (!g1) break;
      cursor = g1.endIdx;
      while (cursor < out.length && /\s/.test(out[cursor])) cursor++;
      const g2 = readBracedGroup(out, cursor);
      if (!g2) break;
      const rep = formatter(g1.content, g2.content);
      out = out.slice(0, idx) + rep + out.slice(g2.endIdx);
    }
    return out;
  }

  function replaceCommand1Arg(str, cmd, formatter) {
    let out = str;
    let guard = 0;
    while (guard++ < 50) {
      const idx = out.indexOf(cmd);
      if (idx === -1) break;
      let cursor = idx + cmd.length;
      while (cursor < out.length && /\s/.test(out[cursor])) cursor++;
      const g1 = readBracedGroup(out, cursor);
      if (!g1) break;
      const rep = formatter(g1.content);
      out = out.slice(0, idx) + rep + out.slice(g1.endIdx);
    }
    return out;
  }

  function translateExpression(raw, lang) {
    let s = (raw || '').trim();
    const isZh = lang === 'zh';

    // 移除純排版命令
    s = s
      .replace(/\\left|\\right|\\bigl|\\bigr|\\Bigl|\\Bigr|\\big|\\Big|\\bigg|\\Bigg/g, ' ')
      .replace(/\\,|\\;|\\:|\\!|\\quad|\\qquad/g, ' ')
      .replace(/&=/g, ' = ')
      .replace(/&/g, ' , ');

    // 處理 \begin{cases}...\end{cases}
    s = s.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_, body) => {
      const rows = body.split(/\\\\/).map(r => r.trim()).filter(Boolean);
      const translatedRows = rows.map((row, idx) => {
        const parts = row.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const val = translateExpression(parts[0], lang);
          const cond = translateExpression(parts.slice(1).join(', '), lang);
          return isZh
            ? `情況 ${idx + 1}：值為 ${val}，條件為 ${cond}`
            : `case ${idx + 1}, ${val} when ${cond}`;
        }
        return translateExpression(row, lang);
      });
      return isZh ? `分段定義如下，${translatedRows.join('；')}` : `piecewise: ${translatedRows.join('; ')}`;
    });

    // 處理 \begin{aligned}...\end{aligned}
    s = s.replace(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g, (_, body) => {
      const rows = body.split(/\\\\/).map(r => r.trim()).filter(Boolean);
      return rows.map(r => translateExpression(r, lang)).join(isZh ? '；' : '; ');
    });

    // 處理 \text{...}, \mathbf{...}, \mathrm{...}
    s = replaceCommand1Arg(s, '\\text', (inner) => ` ${inner} `);
    s = replaceCommand1Arg(s, '\\mathbf', (inner) => ` ${inner} `);
    s = replaceCommand1Arg(s, '\\mathrm', (inner) => ` ${inner} `);

    // 處理修飾符號 \bar, \tilde, \hat, \dot, \ddot, \overline
    s = replaceCommand1Arg(s, '\\bar', (inner) => isZh ? `${inner} bar（補集或平均）` : `${inner} bar`);
    s = replaceCommand1Arg(s, '\\overline', (inner) => isZh ? `${inner} bar（整體補集）` : `${inner} bar`);
    s = replaceCommand1Arg(s, '\\tilde', (inner) => isZh ? `${inner} tilde（模糊量）` : `${inner} tilde`);
    s = replaceCommand1Arg(s, '\\hat', (inner) => isZh ? `${inner} hat（估計值）` : `${inner} hat`);
    s = replaceCommand1Arg(s, '\\dot', (inner) => isZh ? `${inner} dot（一次微分）` : `${inner} dot`);
    s = replaceCommand1Arg(s, '\\ddot', (inner) => isZh ? `${inner} double dot（二次微分）` : `${inner} double dot`);
    s = replaceCommand1Arg(s, '\\sqrt', (inner) => isZh ? `根號「${inner}」` : `square root of ${inner}`);

    // 處理 \frac{A}{B}
    s = replaceCommand2Args(s, '\\frac', (num, den) => {
      const isSimple = num.length <= 10 && den.length <= 10 && !num.includes('\\sum') && !den.includes('\\sum');
      if (isZh) {
        return isSimple ? `${num} 除以 ${den}` : `分子為「${num}」，分母為「${den}」`;
      }
      return isSimple ? `${num} over ${den}` : `the fraction with numerator ${num} and denominator ${den}`;
    });

    // 處理大型運算子與上下標：\sum, \int, \bigcup, \bigcap, \max, \min, \sup, \inf
    s = s.replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, (_, lo, hi) =>
      isZh ? `從 ${lo} 到 ${hi} 的連加總和` : `the summation from ${lo} to ${hi} of`
    );
    s = s.replace(/\\sum_([A-Za-z0-9]+)\^([A-Za-z0-9]+)/g, (_, lo, hi) =>
      isZh ? `從 ${lo} 到 ${hi} 的連加總和` : `the summation from ${lo} to ${hi} of`
    );
    s = s.replace(/\\sum_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `對所有 ${lo} 取總和` : `the summation over ${lo} of`
    );
    s = s.replace(/\\sum_([A-Za-z0-9]+)/g, (_, lo) =>
      isZh ? `對所有 ${lo} 取總和` : `the summation over ${lo} of`
    );
    s = s.replace(/\\sum/g, isZh ? '連加總和' : 'the summation of');

    s = s.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, (_, lo, hi) =>
      isZh ? `從 ${lo} 到 ${hi} 的積分` : `the integral from ${lo} to ${hi} of`
    );
    s = s.replace(/\\int_([A-Za-z0-9]+)\^([A-Za-z0-9]+)/g, (_, lo, hi) =>
      isZh ? `從 ${lo} 到 ${hi} 的積分` : `the integral from ${lo} to ${hi} of`
    );
    s = s.replace(/\\int_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `在 ${lo} 上的積分` : `the integral over ${lo} of`
    );
    s = s.replace(/\\int_([A-Za-z0-9]+)/g, (_, lo) =>
      isZh ? `在 ${lo} 上的積分` : `the integral over ${lo} of`
    );
    s = s.replace(/\\int/g, isZh ? '積分' : 'the integral of');

    s = s.replace(/\\bigcup_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `對所有 ${lo} 取聯集` : `the union over ${lo} of`
    );
    s = s.replace(/\\bigcap_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `對所有 ${lo} 取交集` : `the intersection over ${lo} of`
    );
    s = s.replace(/\\arg\\max_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `使目標最大化的 ${lo}` : `arg max over ${lo} of`
    );
    s = s.replace(/\\max_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `對 ${lo} 取最大值` : `the maximum over ${lo} of`
    );
    s = s.replace(/\\min_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `對 ${lo} 取最小值` : `the minimum over ${lo} of`
    );
    s = s.replace(/\\sup_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `在 ${lo} 條件下的上確界 supremum` : `the supremum over ${lo} of`
    );
    s = s.replace(/\\inf_\{([^}]*)\}/g, (_, lo) =>
      isZh ? `在 ${lo} 條件下的下確界 infimum` : `the infimum over ${lo} of`
    );

    s = s
      .replace(/\\max\b/g, isZh ? '最大值' : 'maximum of')
      .replace(/\\min\b/g, isZh ? '最小值' : 'minimum of')
      .replace(/\\sup\b/g, isZh ? '上確界' : 'supremum of')
      .replace(/\\inf\b/g, isZh ? '下確界' : 'infimum of')
      .replace(/\\exp\b/g, isZh ? '自然指數 exp' : 'exponential of')
      .replace(/\\cos\b/g, isZh ? '餘弦函數 cos' : 'cosine of')
      .replace(/\\sin\b/g, isZh ? '正弦函數 sin' : 'sine of')
      .replace(/\\log\b/g, isZh ? '對數 log' : 'log of');

    // 希臘字母替換
    for (const [cmd, names] of Object.entries(GREEK_MAP)) {
      const re = new RegExp(cmd.replace('\\', '\\\\') + '(?![A-Za-z])', 'g');
      s = s.replace(re, ` ${names[lang]} `);
    }

    // 集合與邏輯運算子
    const OP_MAP = [
      [/\\notin\b/g, '不屬於', 'not in'],
      [/\\in\b/g, '屬於', 'in'],
      [/\\forall\b/g, '對於所有的', 'for all'],
      [/\\exists\b/g, '存在', 'there exists'],
      [/\\subseteq\b/g, '包含於', 'is a subset of'],
      [/\\subset\b/g, '真包含於', 'is a proper subset of'],
      [/\\supseteq\b/g, '包含', 'is a superset of'],
      [/\\supset\b/g, '真包含', 'strictly contains'],
      [/\\cup\b/g, '聯集', 'union'],
      [/\\cap\b/g, '交集', 'intersection'],
      [/\\emptyset\b/g, '空集合', 'the empty set'],
      [/\\infty\b/g, '無窮大', 'infinity'],
      [/\\circ\b/g, '合成', 'composed with'],
      [/\\times\b/g, '乘以', 'times'],
      [/\\cdot\b/g, '乘以', 'times'],
      [/\\oplus\b/g, '模糊相加', 'fuzzy sum'],
      [/\\otimes\b/g, '張量積', 'tensor product'],
      [/\\bullet\b/g, '內積', 'inner product'],
      [/\\odot\b/g, '外積', 'outer product'],
      [/\\ge\b|\\geq\b/g, '大於等於', 'is greater than or equal to'],
      [/\\le\b|\\leq\b/g, '小於等於', 'is less than or equal to'],
      [/\\neq\b/g, '不等於', 'is not equal to'],
      [/\\approx\b/g, '約等於', 'is approximately equal to'],
      [/\\equiv\b/g, '恆等於', 'is equivalent to'],
      [/\\propto\b/g, '正比於', 'is proportional to'],
      [/\\implies\b/g, '可推得', 'implies'],
      [/\\iff\b/g, '若且唯若', 'if and only if'],
      [/\\to\b|\\rightarrow\b/g, '映射到', 'maps to'],
      [/\\partial\b/g, '偏微分', 'partial derivative'],
      [/\\nabla\b/g, '梯度 nabla', 'gradient'],
      [/\\dots\b|\\cdots\b|\\ldots\b/g, '等等', 'and so on'],
      [/\\mid\b/g, '滿足', 'such that'],
      [/\\\|/g, '範數', 'norm']
    ];
    for (const [re, zhRep, enRep] of OP_MAP) {
      s = s.replace(re, ` ${isZh ? zhRep : enRep} `);
    }

    // 常見括號、上下標與符號處理
    s = s
      .replace(/\\\{/g, isZh ? '集合「' : 'the set of ')
      .replace(/\\\}/g, isZh ? '」' : '')
      .replace(/\^2(?![0-9])/g, isZh ? ' 的平方' : ' squared')
      .replace(/\^3(?![0-9])/g, isZh ? ' 的立方' : ' cubed')
      .replace(/\^\{-1\}/g, isZh ? ' 的負一次方（反函數或倒數）' : ' to the negative one')
      .replace(/\^\*/g, isZh ? ' 星號（最佳值）' : ' star')
      .replace(/\^T(?![A-Za-z])/g, isZh ? ' 的轉置' : ' transpose')
      .replace(/\^\{([^}]+)\}/g, (_, sup) => isZh ? ` 的 ${sup} 次方` : ` to the power of ${sup}`)
      .replace(/\^([A-Za-z0-9+])/g, (_, sup) => isZh ? ` 的 ${sup} 次方` : ` to the ${sup}`)
      .replace(/_\{([^}]+)\}/g, (_, sub) => isZh ? ` 下標 ${sub}` : ` sub ${sub}`)
      .replace(/_([A-Za-z0-9])/g, (_, sub) => isZh ? ` 下標 ${sub}` : ` sub ${sub}`)
      .replace(/=/g, isZh ? ' 等於 ' : ' equals ')
      .replace(/</g, isZh ? ' 小於 ' : ' is less than ')
      .replace(/>/g, isZh ? ' 大於 ' : ' is greater than ')
      .replace(/\+/g, isZh ? ' 加 ' : ' plus ')
      .replace(/\{|\}/g, ' ')
      .replace(/\\/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return s;
  }

  function getSpokenPronunciation(latex) {
    const cleanLatex = (latex || '').trim();
    const norm = normalizeForMatch(cleanLatex);

    for (const entry of CURATED_SPOKEN_FORMULAS) {
      if (entry.test(norm)) {
        return {
          source: 'curated',
          title: entry.title,
          latex: cleanLatex,
          zh: entry.zh,
          en: entry.en
        };
      }
    }

    return {
      source: 'auto',
      title: '智慧 LaTeX 語法解析',
      latex: cleanLatex,
      zh: translateExpression(cleanLatex, 'zh') || cleanLatex,
      en: translateExpression(cleanLatex, 'en') || cleanLatex
    };
  }

  // --------------------------------------------------------------------------
  // 4. Web Speech API (speechSynthesis) 雙語試聽控制器
  // --------------------------------------------------------------------------
  let activeTtsBtn = null;

  function cleanTextForTts(text, lang) {
    if (!text) return '';
    if (lang === 'zh-TW') {
      // 移除括號內的希臘符號提示 (例如 "(μ)")，讓 zh-TW 語音引擎念起來最流暢自然
      return text
        .replace(/\([α-ωΑ-Ω]\)/g, '')
        .replace(/「|」/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  function resetActiveTtsBtn() {
    if (activeTtsBtn) {
      activeTtsBtn.textContent = '🔊 試聽';
      activeTtsBtn.classList.remove('is-speaking');
      activeTtsBtn = null;
    }
  }

  function speakText(text, lang, btnEl) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('您的瀏覽器目前不支援 Web Speech API 語音朗讀功能。');
      return;
    }

    const wasSameActive = activeTtsBtn === btnEl;
    window.speechSynthesis.cancel();
    resetActiveTtsBtn();

    if (wasSameActive) {
      return;
    }

    const utter = new SpeechSynthesisUtterance(cleanTextForTts(text, lang));
    utter.lang = lang;
    utter.rate = lang === 'zh-TW' ? 0.96 : 0.92;
    utter.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    if (voices && voices.length > 0) {
      const langPrefix = lang.toLowerCase();
      const matched =
        voices.find(v => (v.lang || '').toLowerCase() === langPrefix) ||
        voices.find(v => (v.lang || '').toLowerCase().startsWith(langPrefix.split('-')[0]));
      if (matched) utter.voice = matched;
    }

    activeTtsBtn = btnEl;
    btnEl.textContent = '⏹️ 停止';
    btnEl.classList.add('is-speaking');

    utter.onend = () => {
      if (activeTtsBtn === btnEl) resetActiveTtsBtn();
    };
    utter.onerror = () => {
      if (activeTtsBtn === btnEl) resetActiveTtsBtn();
    };

    window.speechSynthesis.speak(utter);
  }

  // --------------------------------------------------------------------------
  // 5. 演講者提詞面板 UI 建構與展開/收合控制
  // --------------------------------------------------------------------------
  function buildSpokenPanel(box, spoken) {
    const panel = document.createElement('div');
    panel.className = 'formula-spoken-panel';

    const badgeText = spoken.source === 'curated'
      ? `📖 ${spoken.title || '課堂精選口語對照'}`
      : '⚡ 智慧 LaTeX 語法解析';

    panel.innerHTML = `
      <div class="formula-spoken-header">
        <span class="formula-spoken-badge">${badgeText}</span>
        <button type="button" class="formula-spoken-close" title="收合提詞面板">✕</button>
      </div>
      <div class="formula-spoken-row">
        <div class="formula-spoken-lang">
          <span class="formula-spoken-flag">🇹🇼 中文課堂念法</span>
          <button type="button" class="formula-tts-btn" data-lang="zh-TW">🔊 試聽</button>
        </div>
        <p class="formula-spoken-text" data-role="zh"></p>
      </div>
      <div class="formula-spoken-row">
        <div class="formula-spoken-lang">
          <span class="formula-spoken-flag">🇺🇸 英文學術念法</span>
          <button type="button" class="formula-tts-btn" data-lang="en-US">🔊 試聽</button>
        </div>
        <p class="formula-spoken-text formula-spoken-text-en" data-role="en"></p>
      </div>
      <div class="formula-spoken-footer">
        <button type="button" class="formula-ppt-notes-btn">📝 複製 PPT 演講者備忘稿</button>
      </div>
    `;

    panel.querySelector('[data-role="zh"]').textContent = spoken.zh;
    panel.querySelector('[data-role="en"]').textContent = spoken.en;

    const closeBtn = panel.querySelector('.formula-spoken-close');
    closeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      panel.classList.remove('is-open');
      const triggerBtn = box.querySelector('.formula-spoken-btn');
      if (triggerBtn) triggerBtn.classList.remove('is-active');
    });

    const zhBtn = panel.querySelector('[data-lang="zh-TW"]');
    zhBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      speakText(spoken.zh, 'zh-TW', zhBtn);
    });

    const enBtn = panel.querySelector('[data-lang="en-US"]');
    enBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      speakText(spoken.en, 'en-US', enBtn);
    });

    const pptBtn = panel.querySelector('.formula-ppt-notes-btn');
    pptBtn.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const notesText = [
        '【數學公式 LaTeX】',
        spoken.latex,
        '',
        '【中文課堂念法】',
        spoken.zh,
        '',
        '【英文學術念法】',
        spoken.en
      ].join('\n');

      try {
        if (typeof global.writePlainTextFallback === 'function') {
          await global.writePlainTextFallback(notesText);
        } else if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(notesText);
        }
        if (typeof global.flashCopyBtn === 'function') {
          global.flashCopyBtn(pptBtn, '✅ 已複製 PPT 演講者備忘稿！');
        } else {
          pptBtn.textContent = '✅ 已複製 PPT 演講者備忘稿！';
          setTimeout(() => { pptBtn.textContent = '📝 複製 PPT 演講者備忘稿'; }, 2000);
        }
      } catch (err) {
        console.warn('Copy PPT notes failed:', err);
      }
    });

    return panel;
  }

  function toggleFormulaSpokenPanel(box, triggerBtn, extractMathFn) {
    if (!box) return;
    let panel = box.querySelector(':scope > .formula-spoken-panel');
    if (!panel) {
      const extracted = typeof extractMathFn === 'function' ? extractMathFn(box) : { latex: '' };
      const spoken = getSpokenPronunciation(extracted.latex);
      panel = buildSpokenPanel(box, spoken);
      box.appendChild(panel);
      // 強制 reflow 以觸發平滑展開動畫
      void panel.offsetHeight;
      panel.classList.add('is-open');
      if (triggerBtn) triggerBtn.classList.add('is-active');
      return;
    }

    const willOpen = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', willOpen);
    if (triggerBtn) triggerBtn.classList.toggle('is-active', willOpen);
  }

  global.getSpokenPronunciation = getSpokenPronunciation;
  global.toggleFormulaSpokenPanel = toggleFormulaSpokenPanel;
})(window);
