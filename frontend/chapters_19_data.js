// ============================================================================
// 《認識 Fuzzy》全書 19 章統一資料模型 (Single Source of Truth)
// 涵蓋 Ch.01 ~ Ch.19 完整通論、先備知識、核心公式、互動實驗室映射與 57 題隨堂練習
// ============================================================================
window.CHAPTERS_19_DATA = [
  {
    ch: 1,
    code: "Ch.01",
    title: "第 1 章：緒論與模糊邏輯起源",
    subtitle: "Introduction & Origins of Fuzzy Theory",
    stageGroup: "基礎理論篇",
    color: "sky",
    icon: "🌱",
    pageRange: "1-1 ~ 1-7",
    prerequisites: ["日常語意認知", "二元邏輯常識"],
    overview: "認識「模糊 (Fuzzy)」並非含糊不清，而是處理人類語意與複雜真實世界不確定性的數學工具。從愛因斯坦「精確與真實的權衡」到 1965 年 Zadeh 教授發表《Fuzzy Sets》，理解為何傳統非黑即白的二分法無法描述漸變現象，並掌握模糊理論在美、日、歐的發展脈絡。",
    keyConcepts: [
      {
        term: "精確性與真實性的不相容原理 (Principle of Incompatibility)",
        explanation: "當系統複雜度增加時，我們對系統行為做出「既精確又有意義」描述的能力會急遽下降，直到精確與真實幾乎互不相容。",
        formula: "$$\\text{Complexity} \\uparrow \\implies \\text{Precision} \\times \\text{Relevance} \\approx \\text{const}$$"
      },
      {
        term: "模糊理論 vs. 機率論",
        explanation: "機率描述「隨機事件是否發生」的不確定性（如明天下雨機率 70%）；模糊描述「概念邊界本身」的程度歸屬（如這杯水有多燙 0.8）。",
        formula: "$$P(A) \\in [0,1] \\text{ (隨機性)} \\quad \\text{vs.} \\quad \\mu_A(x) \\in [0,1] \\text{ (語意模糊度)}$$"
      }
    ],
    labConfig: {
      id: "lab-ch01",
      title: "古典二分法 vs. 模糊連續歸屬曲線 & 精確真實權衡",
      subtitle: "觀察「小朋友年齡」在明確集合方波與模糊鐘形曲線的差異，以及愛因斯坦權衡曲線。",
      widgetType: "intro_dual"
    },
    quizzes: [
      {
        id: "q1_1",
        question: "下列何者最能說明「模糊集合」與「機率論」的本質差異？",
        options: [
          "機率論處理事件發生的隨機性，模糊集合處理概念邊界與語意程度的漸變性",
          "模糊集合只能用於離散資料，機率論只能用於連續資料",
          "兩者完全相同，只是數學符號不同",
          "模糊集合的歸屬度總和必須等於 1，機率則不需要"
        ],
        answer_index: 0,
        explanation: "機率回答「事件發生的可能性」，而模糊理論回答「元素屬於某語意概念的程度」，兩者處理不同維度的不確定性。"
      },
      {
        id: "q1_2",
        question: "1965 年正式提出《Fuzzy Sets》奠定模糊理論基礎的學者是誰？",
        options: ["Lotfi A. Zadeh", "Ebrahim Mamdani", "Michio Sugeno", "George Boole"],
        answer_index: 0,
        explanation: "加州大學柏克萊分校的 Lotfi A. Zadeh 教授於 1965 年在《Information and Control》期刊發表開創性論文《Fuzzy Sets》。"
      },
      {
        id: "q1_3",
        question: "關於 Zadeh 提出的「不相容原理 (Principle of Incompatibility)」，下列敘述何者正確？",
        options: [
          "系統越複雜，我們越難同時保有高度精確與高度實質意義",
          "模糊邏輯與古典微積分無法在同一個系統中共存",
          "感測器越精準，系統控制效果一定越差",
          "只有線性系統才能使用模糊理論建模"
        ],
        answer_index: 0,
        explanation: "複雜系統若強求極致精確往往會失去對真實行為的直覺掌握，模糊語言變數恰好提供了有效的高階描述。"
      }
    ]
  },
  {
    ch: 2,
    code: "Ch.02",
    title: "第 2 章：模糊集合理論與基礎定義",
    subtitle: "Fuzzy Sets Fundamentals & Membership Functions",
    stageGroup: "基礎理論篇",
    color: "teal",
    icon: "📐",
    pageRange: "2-1 ~ 2-15",
    prerequisites: ["Ch.01 緒論", "基礎函數圖形"],
    overview: "正式進入模糊集合的數學定義：從明確集合的特性函數 $\\Phi_A(x)\\in\\{0,1\\}$ 推廣至模糊歸屬函數 $\\mu_A(x)\\in[0,1]$。學習離散與連續模糊集合的 Zadeh 表示法、正則性 (Normality)、支撐集 (Support)、核心 (Core)、凸性 (Convexity) 以及常見的三角形、梯形與高斯歸屬函數。",
    keyConcepts: [
      {
        term: "模糊集合與 Zadeh 表示法",
        explanation: "在宇集合 $X$ 中，模糊集合 $A$ 由序對 $(x, \\mu_A(x))$ 組成；離散時以 $\\sum$ 表示，連續時以 $\\int$ 表示（僅為集合記號，非加減或積分運算）。",
        formula: "$$A = \\sum_{i} \\frac{\\mu_A(x_i)}{x_i} \\quad \\text{或} \\quad A = \\int_X \\frac{\\mu_A(x)}{x}$$"
      },
      {
        term: "支撐集 (Support)、核心 (Core) 與正則性",
        explanation: "支撐集為歸屬度大於 0 的明確集合；核心為歸屬度等於 1 的明確集合；若 $\\sup_x \\mu_A(x) = 1$ 則稱 $A$ 為正則模糊集合。",
        formula: "$$\\text{Supp}(A) = \\{x \\in X \\mid \\mu_A(x) > 0\\}, \\quad \\text{Core}(A) = \\{x \\in X \\mid \\mu_A(x) = 1\\}$$"
      }
    ],
    labConfig: {
      id: "lab-ch02",
      title: "Ch.01~02 歸屬函數造型實驗室（三角、梯形、高斯、S 形）",
      subtitle: "拖曳參數觀察不同歸屬函數造型、中心點與斜率對 $\\mu_A(x)$ 的影響。",
      widgetType: "ch1_plots"
    },
    quizzes: [
      {
        id: "q2_1",
        question: "在連續模糊集合表示法 $A = \\int_X \\mu_A(x)/x$ 中，符號 $\\int$ 代表什麼意義？",
        options: [
          "代表宇集合 $X$ 上所有元素與其歸屬度的聯集記號，並非微積分積分",
          "代表必須對歸屬函數進行定積分且面積必須等於 1",
          "代表取歸屬函數的導數",
          "代表機率密度函數的累積分佈"
        ],
        answer_index: 0,
        explanation: "Zadeh 表示法中的 $\\sum$ 與 $\\int$ 僅為「集合枚舉/聯集」符號，斜線 $/$ 也不是除法。"
      },
      {
        id: "q2_2",
        question: "若模糊集合 $A$ 滿足 $\\max_{x\\in X} \\mu_A(x) = 1$，我們稱 $A$ 具有什麼性質？",
        options: ["正則性 (Normality)", "對稱性 (Symmetry)", "互斥性 (Disjointness)", "完備性 (Completeness)"],
        answer_index: 0,
        explanation: "至少有一個元素的歸屬度達到最大值 1 的模糊集合稱為正則模糊集合 (Normal Fuzzy Set)。"
      },
      {
        id: "q2_3",
        question: "關於凸模糊集合 (Convex Fuzzy Set) 的定義，下列何者正確？",
        options: [
          "對任意 $x_1 < x_2$ 與 $\\lambda\\in[0,1]$，滿足 $\\mu_A(\\lambda x_1 + (1-\\lambda)x_2) \\ge \\min(\\mu_A(x_1), \\mu_A(x_2))$",
          "歸屬函數圖形必須是嚴格遞增函數",
          "歸屬函數只能有單一峰值且不能是梯形",
          "支撐集必須是有限集合"
        ],
        answer_index: 0,
        explanation: "凸性等價於「所有 $\\alpha$-截集皆為凸集」，即圖形中間不能有向下凹陷的雙峰谷底。"
      }
    ]
  },
  {
    ch: 3,
    code: "Ch.03",
    title: "第 3 章：模糊集合之基本性質與 α-截集",
    subtitle: "Alpha-Cuts & Decomposition Theorem",
    stageGroup: "基礎理論篇",
    color: "cyan",
    icon: "✂️",
    pageRange: "3-1 ~ 3-15",
    prerequisites: ["Ch.02 模糊集合定義"],
    overview: "掌握連結「模糊集合」與「古典明確集合」的最重要橋樑——$\\alpha$-截集 ($\\alpha$-cut) 與強 $\\alpha$-截集。理解截集基本性質、幾何意義與分解定理 (Decomposition Theorem)，學會如何將任何模糊集合拆解為不同水平高度的明確區間來進行運算與推論。",
    keyConcepts: [
      {
        term: "$\\alpha$-截集 ($\\alpha$-cut) 與強 $\\alpha$-截集",
        explanation: "將歸屬度大於等於（或嚴格大於）門檻 $\\alpha$ 的所有元素取出，形成一個古典明確集合。",
        formula: "$$A_\\alpha = \\{x \\in X \\mid \\mu_A(x) \\ge \\alpha\\}, \\quad A_{\\alpha+} = \\{x \\in X \\mid \\mu_A(x) > \\alpha\\}$$"
      },
      {
        term: "分解定理 (Decomposition Theorem)",
        explanation: "任何模糊集合 $A$ 都可以表示為其所有 $\\alpha$-截集的聯集疊加，這是模糊數學與明確區間數學轉換的核心。",
        formula: "$$A = \\bigcup_{\\alpha \\in [0,1]} \\alpha \\cdot A_\\alpha, \\quad \\mu_A(x) = \\sup_{\\alpha \\in [0,1]} [\\alpha \\cdot \\Phi_{A_\\alpha}(x)]$$"
      }
    ],
    labConfig: {
      id: "lab-ch03",
      title: "α-截集水平切割與分解定理互動圖",
      subtitle: "調整水平高度 $\\alpha \\in [0, 1]$，即時觀察被切出的明確區間 $A_\\alpha$ 範圍與凸性驗證。",
      widgetType: "ch1_alpha"
    },
    quizzes: [
      {
        id: "q3_1",
        question: "當 $\\alpha_1 < \\alpha_2$ 時，同一個模糊集合 $A$ 的兩個截集 $A_{\\alpha_1}$ 與 $A_{\\alpha_2}$ 之間有什麼包含關係？",
        options: [
          "$A_{\\alpha_2} \\subseteq A_{\\alpha_1}$（水平越高，切出的集合越小）",
          "$A_{\\alpha_1} \\subseteq A_{\\alpha_2}$（水平越高，切出的集合越大）",
          "兩者完全相等",
          "兩者交集必為空集合"
        ],
        answer_index: 0,
        explanation: "門檻 $\\alpha$ 越高，符合 $\\mu_A(x) \\ge \\alpha$ 的元素條件越嚴格，因此所切出的集合範圍會單調縮小或相等。"
      },
      {
        id: "q3_2",
        question: "在 $\\alpha$-截集的運算性質中，$(A \\cap B)_\\alpha$ 與 $(A \\cup B)_\\alpha$ 分別等於什麼？",
        options: [
          "$A_\\alpha \\cap B_\\alpha$ 與 $A_\\alpha \\cup B_\\alpha$",
          "$A_\\alpha \\cup B_\\alpha$ 與 $A_\\alpha \\cap B_\\alpha$",
          "僅能各自取補集後相減",
          "無法與明確集合運算對應"
        ],
        answer_index: 0,
        explanation: "在標準交集 (min) 與標準聯集 (max) 下，截集運算完全滿足同態性：$(A\\cap B)_\\alpha = A_\\alpha \\cap B_\\alpha$ 且 $(A\\cup B)_\\alpha = A_\\alpha \\cup B_\\alpha$。"
      },
      {
        id: "q3_3",
        question: "模糊集合 $A$ 的 $\\alpha = 0^+$ 強截集 $A_{0+}$ 恰好對應哪一個基礎集合概念？",
        options: ["支撐集 Support(A)", "核心 Core(A)", "平衡點 Equilibrium", "補集 $\\bar{A}$"],
        answer_index: 0,
        explanation: "$A_{0+} = \\{x \\mid \\mu_A(x) > 0\\}$ 正好就是支撐集 $\\text{Supp}(A)$。"
      }
    ]
  },
  {
    ch: 4,
    code: "Ch.04",
    title: "第 4 章：模糊集合之運算",
    subtitle: "Fuzzy Operations, t-norms & t-conorms",
    stageGroup: "基礎理論篇",
    color: "amber",
    icon: "⚙️",
    pageRange: "4-1 ~ 4-12",
    prerequisites: ["Ch.02 模糊集合", "Ch.03 α-截集"],
    overview: "深入探討模糊補集 (Complement)、交集 (t-norm) 與聯集 (t-conorm / s-norm) 的公理化定義與多樣化運算子。除了標準的 $\\min / \\max / 1-\\mu$ 外，更進一步認識 Sugeno、Yager 參數化補集，以及代數積、有界和等 t-norm/s-norm 家族，並理解為何模糊集合會違反矛盾律與排中律。",
    keyConcepts: [
      {
        term: "標準模糊運算與排中律的打破",
        explanation: "標準運算為 $\\mu_{\\bar{A}}(x)=1-\\mu_A(x)$、$\\mu_{A\\cap B}=\\min(\\mu_A,\\mu_B)$、$\\mu_{A\\cup B}=\\max(\\mu_A,\\mu_B)$。當 $\\mu_A(x)=0.5$ 時，$A \\cap \\bar{A} \\neq \\emptyset$。",
        formula: "$$\\mu_{A\\cap\\bar{A}}(x) = \\min(\\mu_A(x), 1-\\mu_A(x)) \\le 0.5$$"
      },
      {
        term: "Sugeno 參數化補集與平衡點",
        explanation: "透過參數 $\\lambda \\in (-1, \\infty)$ 調整補集曲線的凹/凸程度，當 $\\lambda=0$ 時退化為標準補集。",
        formula: "$$c_\\lambda(a) = \\frac{1 - a}{1 + \\lambda a}, \\quad \\lambda > -1$$"
      }
    ],
    labConfig: {
      id: "lab-ch04",
      title: "模糊交集 (t-norm)、聯集 (s-norm) 與參數化補集實驗室",
      subtitle: "比較標準 min/max、代數積、有界差等運算子對兩模糊集合交疊區域的影響。",
      widgetType: "ch1_ops"
    },
    quizzes: [
      {
        id: "q4_1",
        question: "若 $\\mu_A(x) = 0.6$，使用標準模糊補集後，其交集 $\\mu_{A \\cap \\bar{A}}(x)$ 的值為何？",
        options: ["0.4", "0", "0.6", "1.0"],
        answer_index: 0,
        explanation: "$\\mu_{\\bar{A}}(x) = 1 - 0.6 = 0.4$，故 $\\min(0.6, 0.4) = 0.4 \\neq 0$，顯示模糊集合違反古典矛盾律。"
      },
      {
        id: "q4_2",
        question: "下列何者「不是」合法的 t-norm (模糊交集) 運算子？",
        options: [
          "$T(a, b) = \\max(a, b)$",
          "$T(a, b) = \\min(a, b)$",
          "$T(a, b) = a \\cdot b$",
          "$T(a, b) = \\max(0, a + b - 1)$"
        ],
        answer_index: 0,
        explanation: "$\\max(a, b)$ 是標準模糊聯集 (t-conorm)，不滿足 t-norm 的邊界條件 $T(a, 1) = a$。"
      },
      {
        id: "q4_3",
        question: "在 Sugeno 補集 $c_\\lambda(a) = (1-a)/(1+\\lambda a)$ 中，當 $\\lambda = 0$ 時會得到什麼結果？",
        options: [
          "退化為標準模糊補集 $1 - a$",
          "恆等於 1",
          "恆等於 0",
          "產生無窮大未定義"
        ],
        answer_index: 0,
        explanation: "將 $\\lambda=0$ 代入分母 $1+0\\cdot a = 1$，因此 $c_0(a) = 1 - a$。"
      }
    ]
  },
  {
    ch: 5,
    code: "Ch.05",
    title: "第 5 章：模糊數之算術與擴展原理",
    subtitle: "Fuzzy Numbers Arithmetic & Extension Principle",
    stageGroup: "基礎理論篇",
    color: "indigo",
    icon: "🧮",
    pageRange: "5-1 ~ 5-31",
    prerequisites: ["Ch.03 α-截集", "Ch.04 模糊運算"],
    overview: "學習如何讓模糊集合「做加減乘除」：包含 Zadeh 擴展原理 (Extension Principle) 與基於 $\\alpha$-截集的區間算術 (Interval Arithmetic)。理解模糊數必備的正則性、凸性與底集有界性，並實際推導三角/梯形模糊數的加減乘除公式。",
    keyConcepts: [
      {
        term: "Zadeh 擴展原理 (Extension Principle)",
        explanation: "將明確映射 $y = f(x_1, x_2)$ 推廣至模糊集合輸入，輸出元素的歸屬度取所有能映射到該輸出的輸入組合之最大最小值。",
        formula: "$$\\mu_{f(A,B)}(y) = \\sup_{y = f(x_1, x_2)} \\min(\\mu_A(x_1), \\mu_B(x_2))$$"
      },
      {
        term: "基於 α-截集的區間加法與減法",
        explanation: "若 $A_\\alpha = [a_1^\\alpha, a_2^\\alpha]$ 且 $B_\\alpha = [b_1^\\alpha, b_2^\\alpha]$，則區間加法與減法可直接由端點算術求得。",
        formula: "$$(A + B)_\\alpha = [a_1^\\alpha + b_1^\\alpha,\\; a_2^\\alpha + b_2^\\alpha], \\quad (A - B)_\\alpha = [a_1^\\alpha - b_2^\\alpha,\\; a_2^\\alpha - b_1^\\alpha]$$"
      }
    ],
    labConfig: {
      id: "lab-ch05",
      title: "模糊數區間算術與擴展原理視覺化 (Ch.03/05)",
      subtitle: "調整兩個三角模糊數 $A$ 與 $B$ 的參數與運算類型 ($+, -, \\times$)，觀察結果形狀與誤差擴散。",
      widgetType: "ch3_plots"
    },
    quizzes: [
      {
        id: "q5_1",
        question: "設兩個模糊區間在 $\\alpha=0.5$ 時分別為 $A_{0.5} = [2, 4]$ 與 $B_{0.5} = [1, 3]$，則 $(A - B)_{0.5}$ 為何？",
        options: ["$[-1, 3]$", "$[1, 1]$", "$[1, 3]$", "$[-3, 1]$"],
        answer_index: 0,
        explanation: "區間減法為 $[a_1 - b_2,\\; a_2 - b_1] = [2 - 3,\\; 4 - 1] = [-1, 3]$。注意不可直接同端點相減。"
      },
      {
        id: "q5_2",
        question: "一個模糊集合要成為「模糊數 (Fuzzy Number)」，通常必須同時滿足哪幾項條件？",
        options: [
          "正則性 (Normal)、凸性 (Convex)、以及支撐集有界",
          "只能是對稱三角形且中心必須大於 0",
          "歸屬度函數必須是線性遞增",
          "只能定義在正整數集合上"
        ],
        answer_index: 0,
        explanation: "模糊數用來表達「大約是某實數」，因此必須是正則（頂點達 1）、凸集（單峰不凹陷）且有界。"
      },
      {
        id: "q5_3",
        question: "兩個三角模糊數相加後，結果通常是什麼形狀？仍是三角形嗎？那相乘呢？",
        options: [
          "相加仍是精確三角模糊數；相乘則邊界會變成微彎的曲線（通常以三角近似）",
          "相加與相乘都會變成完全對稱的矩形",
          "相加會變成雙峰，相乘則是三角形",
          "兩者都無法用 α-截集計算"
        ],
        answer_index: 0,
        explanation: "線性組合（加減、純量乘）保持三角線性邊界；兩模糊數相乘則因端點相乘產生二次項而呈微彎曲線。"
      }
    ]
  },
  {
    ch: 6,
    code: "Ch.06",
    title: "第 6 章：模糊關係與合成運算",
    subtitle: "Fuzzy Relations & Max-Min Composition",
    stageGroup: "基礎理論篇",
    color: "indigo",
    icon: "🕸️",
    pageRange: "6-1 ~ 6-16",
    prerequisites: ["Ch.04 模糊運算", "基礎矩陣運算"],
    overview: "從二元明確關係矩陣推廣至「模糊關係矩陣」$R \\subseteq X \\times Y$，學習如何量化兩個不同論域之間的關聯強度（如症狀與疾病、身高與體重）。核心重點在於關係合成 (Composition)——包含 Max-Min 合成與 Max-Product 合成，這也是下一階段「模糊推論」的數學引擎。",
    keyConcepts: [
      {
        term: "卡迪興乘積與模糊關係矩陣",
        explanation: "模糊關係 $R(X, Y)$ 是定義在乘積空間 $X \\times Y$ 上的模糊集合，每個矩陣元素 $r_{ij} = \\mu_R(x_i, y_j) \\in [0,1]$。",
        formula: "$$R = \\int_{X\\times Y} \\frac{\\mu_R(x,y)}{(x,y)}, \\quad r_{ij} \\in [0,1]$$"
      },
      {
        term: "Max-Min 合成運算 ($R \\circ S$)",
        explanation: "類似矩陣乘法，但將「乘」換成 $\\min$、將「加總」換成 $\\max$，用來串聯兩段關係 $X\\to Y$ 與 $Y\\to Z$。",
        formula: "$$\\mu_{R \\circ S}(x, z) = \\max_{y \\in Y} \\min\\big(\\mu_R(x, y),\\; \\mu_S(y, z)\\big)$$"
      }
    ],
    labConfig: {
      id: "lab-ch06",
      title: "模糊關係熱圖與 Max-Min 合成矩陣實驗室",
      subtitle: "互動編輯關係矩陣 $R$ 與 $S$，即時計算並視覺化 3D 關係曲面與合成結果 $R \\circ S$。",
      widgetType: "ch2_plots"
    },
    quizzes: [
      {
        id: "q6_1",
        question: "已知向量 $A = [0.8,\\; 0.3]$ 與關係矩陣 $R = \\begin{bmatrix} 0.5 & 0.9 \\\\ 0.7 & 0.2 \\end{bmatrix}$，進行 Max-Min 合成 $A \\circ R$ 的結果為何？",
        options: ["$[0.5,\\; 0.8]$", "$[0.7,\\; 0.9]$", "$[0.3,\\; 0.2]$", "$[0.61,\\; 0.78]$"],
        answer_index: 0,
        explanation: "第一欄：$\\max(\\min(0.8,0.5), \\min(0.3,0.7)) = \\max(0.5, 0.3) = 0.5$；第二欄：$\\max(\\min(0.8,0.9), \\min(0.3,0.2)) = \\max(0.8, 0.2) = 0.8$。"
      },
      {
        id: "q6_2",
        question: "在 Max-Min 合成運算中，為何結果的數值永遠不會大於兩者原本最大的歸屬度？",
        options: [
          "因為 $\\min$ 與 $\\max$ 皆為封閉於 $[0,1]$ 的保序運算，不會產生大於輸入的數值",
          "因為每次運算後都會強制除以 2",
          "因為矩陣必須先經過標準化使其和為 1",
          "這只發生在對稱矩陣"
        ],
        answer_index: 0,
        explanation: "$\\min$ 與 $\\max$ 只會挑選既有數值中的較小或較大者，不會像加法一樣累積超過 1。"
      },
      {
        id: "q6_3",
        question: "Max-Min 合成運算與 Max-Product 合成運算的主要差別在於？",
        options: [
          "後者以代數乘積 $a\\cdot b$ 取代 $\\min(a,b)$，使微弱證據有更平滑的衰減效果",
          "後者以加法取代 $\\max$",
          "前者只能用在 2×2 矩陣",
          "兩者計算結果在所有輸入下永遠完全相同"
        ],
        answer_index: 0,
        explanation: "Max-Product 使用 $a \\cdot b$ 進行激發強度衰減，常使曲面更加平滑。"
      }
    ]
  },
  {
    ch: 7,
    code: "Ch.07",
    title: "第 7 章：倒單擺非線性平衡控制實務",
    subtitle: "Inverted Pendulum Nonlinear Fuzzy Control",
    stageGroup: "工程控制篇",
    color: "emerald",
    icon: "⚖️",
    pageRange: "7-1 ~ 7-16",
    prerequisites: ["Ch.06 模糊關係", "基本物理力學直覺"],
    overview: "從理論走向實務的第一個經典非線性控制案例：台車上的倒單擺平衡系統。系統同時具備不穩定平衡點與強非線性，透過讀取擺角誤差 $e=\\theta$ 與角速度變化率 $\\dot{e}=\\dot{\\theta}$，建立 2D 模糊控制規則表 (FAM Table) 並以重心法解模糊化輸出台車推力 $u$。",
    keyConcepts: [
      {
        term: "倒單擺模糊控制雙輸入與規則表",
        explanation: "以角度誤差 $e$（向左傾/垂直/向右傾）與角速度 $\\dot{e}$ 作為雙輸入，決定台車應向左或向右施加多大推力。",
        formula: "$$\\text{IF } e \\text{ is } PB \\text{ AND } \\dot{e} \\text{ is } ZO \\text{ THEN } u \\text{ is } PB$$"
      },
      {
        term: "重心法解模糊化 (Center of Gravity, COG)",
        explanation: "將所有被觸發規則推論出的輸出模糊集合聯集後，計算其幾何重心作為最終給馬達的明確電流/推力指令。",
        formula: "$$u^* = \\frac{\\int u \\cdot \\mu_{out}(u)\\, du}{\\int \\mu_{out}(u)\\, du}$$"
      }
    ],
    labConfig: {
      id: "lab-ch07",
      title: "Mamdani 模糊控制架構與倒單擺推力決策模擬",
      subtitle: "調整輸入誤差與變化率，實時觀察各規則激發強度、截頂面積與重心法 $u^*$ 輸出。",
      widgetType: "ch3_plots"
    },
    quizzes: [
      {
        id: "q7_1",
        question: "在倒單擺模糊控制中，當單擺「已經向右傾斜 ($e > 0$) 且正繼續快速向右倒下 ($\\dot{e} > 0$)」時，台車應如何動作以挽救平衡？",
        options: [
          "快速向右加速追趕單擺下方 (正大推力 PB)",
          "立即向左全力倒車 (負大推力 NB)",
          "完全停止不動 (零輸出 ZO)",
          "僅輸出極微小的阻力"
        ],
        answer_index: 0,
        explanation: "台車必須往單擺傾倒的同方向快速移動，才能把支點重新帶回重心下方產生反方向恢復力矩。"
      },
      {
        id: "q7_2",
        question: "一個標準 Mamdani 模糊邏輯控制器 (FLC) 的四大核心模組順序為何？",
        options: [
          "模糊化 $\\to$ 規則庫 $\\to$ 推論引擎 $\\to$ 解模糊化",
          "解模糊化 $\\to$ 模糊化 $\\to$ 規則庫 $\\to$ 推論引擎",
          "規則庫 $\\to$ 重心法 $\\to$ 卡迪興乘積 $\\to$ 模糊化",
          "僅需規則庫即可直接輸出馬達電壓"
        ],
        answer_index: 0,
        explanation: "感測器數值先經模糊化轉為歸屬度，再經規則庫與推論引擎合成輸出集合，最後經解模糊化轉為明確控制訊號。"
      },
      {
        id: "q7_3",
        question: "相較於傳統線性 PID 控制，模糊控制應用於倒單擺時有何優勢？",
        options: [
          "不需精確推導非線性微分方程模型，可直接將人類平衡經驗編寫為 IF-THEN 規則",
          "完全不需要感測器量測角度",
          "硬體成本永遠為零",
          "只能控制靜止不動的物體"
        ],
        answer_index: 0,
        explanation: "倒單擺在較大傾角下呈高度非線性，模糊控制能以專家規則平滑涵蓋大角度與小角度區域。"
      }
    ]
  },
  {
    ch: 8,
    code: "Ch.08",
    title: "第 8 章：模糊冷氣溫控與節能系統",
    subtitle: "Fuzzy Air-Conditioning & Energy-Saving Control",
    stageGroup: "工程控制篇",
    color: "cyan",
    icon: "❄️",
    pageRange: "8-1 ~ 8-12",
    prerequisites: ["Ch.07 模糊控制架構"],
    overview: "分析智慧家電中最具代表性的模糊變頻冷氣溫控系統。相較於傳統定頻冷氣「高於設定溫度就全速運轉、低於就停機」的震盪與耗電，模糊冷氣透過「室溫誤差 $\\Delta T$」與「溫差變化率 $d(\\Delta T)/dt$」連續調節壓縮機轉速頻率，兼顧體感舒適度與節能省電。",
    keyConcepts: [
      {
        term: "舒適度指標與變頻壓縮機連續調控",
        explanation: "依據室溫與目標溫度差距 $\\Delta T$ 以及升溫速度，決定壓縮機轉速（極低頻、低頻、中頻、高頻）。",
        formula: "$$f_{comp} = \\text{Defuzzify}\\big(\\mu_{\\Delta T}(e) \\circ \\mu_{\\dot{T}}(\\dot{e}) \\circ R_{AC}\\big)$$"
      },
      {
        term: "模糊溫控 vs. 傳統繼電器開關控制",
        explanation: "傳統開關控制存在遲滯區間與過衝 (Overshoot)；模糊控制能在接近目標溫度時提前降頻，消除溫度波動。",
        formula: "$$\\text{Energy Saved} \\propto \\int |f_{on/off}(t) - f_{fuzzy}(t)|^2 dt$$"
      }
    ],
    labConfig: {
      id: "lab-ch08",
      title: "Ch.08 模糊變頻冷氣溫控雙輸入模擬器",
      subtitle: "調整室溫偏差 $\\Delta T$ 與室溫變化率 $dT/dt$，即時比較模糊變頻輸出頻率與傳統定頻震盪曲線。",
      widgetType: "ch8_ac"
    },
    quizzes: [
      {
        id: "q8_1",
        question: "當室溫目前僅比目標溫度高 $0.5^\\circ\\text{C}$，但室外西曬導致室溫正「快速上升」時，模糊冷氣控制器應如何輸出？",
        options: [
          "提前提高壓縮機運轉頻率（中高頻），預先抵銷升溫趨勢",
          "等到室溫超過目標 $3^\\circ\\text{C}$ 再啟動",
          "維持最低頻率不變",
          "直接關閉壓縮機"
        ],
        answer_index: 0,
        explanation: "引入溫差變化率 $dT/dt$ 作為第二輸入，正是一種前瞻預測機制，能在誤差擴大前先行抑制。"
      },
      {
        id: "q8_2",
        question: "為何模糊變頻冷氣能比傳統定頻冷氣更省電？",
        options: [
          "避免壓縮機反覆「全速啟動—停機」的巨大啟動電流浪費，改以低頻平穩維持室溫",
          "因為模糊冷氣不使用冷媒",
          "因為模糊控制器會自動把目標溫度調高 $10^\\circ\\text{C}$",
          "僅靠降低風扇轉速達成"
        ],
        answer_index: 0,
        explanation: "在低負載穩態時以低頻連續運轉，效率遠高於頻繁啟停壓縮機。"
      },
      {
        id: "q8_3",
        question: "在冷氣溫控系統中，若使用者反應「每次降溫都太慢」，應如何微調模糊控制器？",
        options: [
          "調整「溫度偏高」語意集合的論域尺度或增加規則輸出權重",
          "把所有規則輸出都設為 0 Hz",
          "取消重心法，改用隨機數輸出",
          "減少溫度感測器的取樣頻率至每小時一次"
        ],
        answer_index: 0,
        explanation: "調整輸入比例因子 (Scaling Factor) 或規則後件中心值，即可直接改變系統的響應速度與強健度。"
      }
    ]
  },
  {
    ch: 9,
    code: "Ch.09",
    title: "第 9 章：模糊洗衣機與家電模糊感測",
    subtitle: "Fuzzy Washing Machine & Smart Sensor Fusion",
    stageGroup: "工程控制篇",
    color: "sky",
    icon: "🫧",
    pageRange: "9-1 ~ 9-21",
    prerequisites: ["Ch.07 模糊控制", "Ch.08 雙輸入規則庫"],
    overview: "日本家電革命的經典代表——松下 (Matsushita) 愛妻號模糊洗衣機！沒有單一感測器能直接測量「衣服有多髒」，工程師巧妙利用光敏電阻感測洗滌水的「濁度 (Turbidity)」與「濁度變化飽和時間」，搭配衣物重量感測，推論出最佳的洗滌時間、水流強度與洗劑建議量。",
    keyConcepts: [
      {
        term: "軟感測與間接特徵推論 (Soft Sensing)",
        explanation: "透過光線穿透洗滌水的透光率變化，間接推論衣物髒污量與髒污種類（泥沙型快速變濁 vs. 油漬型緩慢溶出）。",
        formula: "$$\\text{Dirtiness} = \\text{FuzzyInfer}(\\text{Turbidity},\\; \\text{Saturation Time})$$"
      },
      {
        term: "多規則加權推論洗衣時間",
        explanation: "結合「衣物重量」、「水質濁度」與「濁度變化率」三項感測指標，自動決定 5 到 25 分鐘的無段式最佳洗程。",
        formula: "$$T_{wash} = \\frac{\\sum_{k=1}^M w_k \\cdot t_k}{\\sum_{k=1}^M w_k}$$"
      }
    ],
    labConfig: {
      id: "lab-ch09",
      title: "Ch.09 模糊洗衣機濁度感測與最佳洗程決策圖",
      subtitle: "調整水質濁度、飽和時間與衣物重量，即時檢視光電濁度曲線與最佳洗滌時間輸出。",
      widgetType: "ch9_washer"
    },
    quizzes: [
      {
        id: "q9_1",
        question: "模糊洗衣機主要透過什麼物理原理來判斷衣物的「髒污程度」與「髒污種類」？",
        options: [
          "利用光電感測器量測洗滌水的「濁度」與「濁度達到飽和的時間」",
          "使用微型攝影機對每件衣服拍照辨識",
          "測量洗衣機馬達的溫度",
          "僅憑使用者手動輸入衣服顏色"
        ],
        answer_index: 0,
        explanation: "光敏電阻感測透光率下降速度與最終濁度：泥沙溶出快（飽和時間短），油污溶出慢（飽和時間長）。"
      },
      {
        id: "q9_2",
        question: "當濁度「很低」且衣物重量「很輕」時，模糊洗衣機通常會如何決策？",
        options: [
          "大幅縮短洗滌與注水時間，使用柔和短程水流以節水省電保護衣物",
          "延長洗滌時間至最高上限以確保萬無一失",
          "自動切換至強力脫水 30 分鐘",
          "發出故障警報停止運作"
        ],
        answer_index: 0,
        explanation: "這正是模糊家電的核心價值：依實際感測狀態動態最佳化資源消耗，不浪費水電。"
      },
      {
        id: "q9_3",
        question: "為何模糊洗衣機只需要一個按鍵（一鍵啟動）就能取代繁瑣的傳統設定？",
        options: [
          "因為內部感測融合與模糊規則庫能自動取代人類對水量、水流與時間的經驗判斷",
          "因為它固定只有一種 15 分鐘洗程",
          "因為它移除了脫水功能",
          "因為它透過網路連線到氣象局決定洗法"
        ],
        answer_index: 0,
        explanation: "將洗衣專家經驗內建為模糊規則，讓感測器直接驅動智慧決策。"
      }
    ]
  },
  {
    ch: 10,
    code: "Ch.10",
    title: "第 10 章：汽車自駕與防鎖死煞車系統 (ABS)",
    subtitle: "Automotive ABS & Slip Ratio Fuzzy Control",
    stageGroup: "工程控制篇",
    color: "rose",
    icon: "🚗",
    pageRange: "10-1 ~ 10-13",
    prerequisites: ["Ch.07 非線性控制", "輪胎滑移率物理意義"],
    overview: "探討車輛緊急煞車時的關鍵安全系統——防鎖死煞車系統 (ABS)。當車輪完全鎖死（滑移率 $\\lambda=1$）時，輪胎與路面的靜摩擦變為滑動摩擦，不僅煞車距離變長更會失去轉向能力。模糊 ABS 透過車速、輪速與減速度即時調節煞車油壓，將滑移率精準鎖定在最大摩擦力區間 ($\\lambda \\approx 0.15 \\sim 0.25$)。",
    keyConcepts: [
      {
        term: "輪胎滑移率 (Slip Ratio) $\\lambda$",
        explanation: "定義車速 $v$ 與車輪切線速度 $\\omega R$ 的相對差值；$\\lambda=0$ 為純滾動，$\\lambda=1$ 為完全鎖死打滑。",
        formula: "$$\\lambda = \\frac{v - \\omega R}{v} \\in [0, 1]$$"
      },
      {
        term: "不同路面下的最佳摩擦峰值區間",
        explanation: "乾燥柏油、濕滑路面或冰雪路面的摩擦係數曲線 $\\mu(\\lambda)$ 差異極大，模糊規則能自適應調節油壓脈衝防止鎖死。",
        formula: "$$\\text{Goal: } \\lambda \\to \\lambda_{opt} \\approx 0.18 \\implies \\max \\mu(\\lambda)$$"
      }
    ],
    labConfig: {
      id: "lab-ch10",
      title: "Ch.10 汽車 ABS 滑移率摩擦曲線與模糊油壓控制模擬",
      subtitle: "切換路面狀況（乾柏油/濕地/結冰）與煞車力度，觀察滑移率 $\\lambda$ 與煞車油壓控制響應。",
      widgetType: "ch10_abs"
    },
    quizzes: [
      {
        id: "q10_1",
        question: "車輛緊急煞車時，為何不能讓車輪「完全鎖死」($\\lambda = 1$)？",
        options: [
          "鎖死時輪胎摩擦係數下降使煞車距離變長，且橫向抓地力歸零導致車輛失控打滑",
          "鎖死時車輛會立刻加速往前衝",
          "鎖死會讓車燈熄滅",
          "其實鎖死時煞車距離最短，ABS 只是為了省煞車皮"
        ],
        answer_index: 0,
        explanation: "最大縱向制動力與可維持轉向能力的橫向力，皆位於滑移率 $15\\%\\sim 25\\%$ 區間，完全鎖死將失去轉向能力。"
      },
      {
        id: "q10_2",
        question: "若車速 $v = 20\\,\\text{m/s}$，車輪切線速度 $\\omega R = 16\\,\\text{m/s}$，此時滑移率 $\\lambda$ 為多少？",
        options: ["$0.20\\;(20\\%)$", "$0.80\\;(80\\%)$", "$0.25\\;(25\\%)$", "$0.04\\;(4\\%)$"],
        answer_index: 0,
        explanation: "$\\lambda = (20 - 16) / 20 = 4 / 20 = 0.20$，正好落在乾燥路面最佳煞車區間附近。"
      },
      {
        id: "q10_3",
        question: "模糊邏輯特別適合用於 ABS 與路況辨識的主要原因為何？",
        options: [
          "路面摩擦係數無法直接以單一線性方程準確預測，模糊規則可依減速度與滑移趨勢動態適應乾濕冰路面",
          "模糊控制只允許開與關兩種油壓值",
          "ABS 不需要任何即時計算",
          "模糊控制器可以取代輪胎橡膠"
        ],
        answer_index: 0,
        explanation: "路面狀態高度非線性且隨時變化，模糊推論具有良好的強健性 (Robustness)。"
      }
    ]
  },
  {
    ch: 11,
    code: "Ch.11",
    title: "第 11 章：模糊類神經網路 (Neuro-Fuzzy / ANFIS)",
    subtitle: "Adaptive Neuro-Fuzzy Inference System",
    stageGroup: "智慧演算法與進階應用篇",
    color: "violet",
    icon: "🧠",
    pageRange: "11-1 ~ 11-15",
    prerequisites: ["Ch.07 模糊推論", "基礎梯度下降與類神經概念"],
    overview: "當系統複雜到專家也寫不出完整規則時怎麼辦？本章介紹將「模糊邏輯的可解釋性」與「類神經網路的資料學習能力」結合的混合架構——ANFIS (Adaptive-Network-based Fuzzy Inference System)。理解 Takagi-Sugeno-Kang (TSK) 一階推論如何展開為五層前饋網路，並透過混合學習演算法（最小平方法 + 反向傳播）自動微調歸屬函數參數。",
    keyConcepts: [
      {
        term: "ANFIS 五層網路架構",
        explanation: "依序為：L1 模糊化層（可調前提參數）、L2 規則激發層（乘積）、L3 正規化層、L4 後件線性推論層（可調結論參數）、L5 總和輸出層。",
        formula: "$$f = \\sum_{i} \\bar{w}_i f_i = \\sum_i \\bar{w}_i (p_i x + q_i y + r_i)$$"
      },
      {
        term: "混合學習法 (Hybrid Learning Algorithm)",
        explanation: "前向傳遞固定前提參數並以最小平方法 (LSE) 求解線性結論參數 $(p_i, q_i, r_i)$；反向傳遞固定結論參數並以梯度下降更新歸屬函數參數。",
        formula: "$$\\theta_{premise}(t+1) = \\theta_{premise}(t) - \\eta \\frac{\\partial E}{\\partial \\theta_{premise}}$$"
      }
    ],
    labConfig: {
      id: "lab-ch11",
      title: "Ch.11 ANFIS 自適應函數擬合與訓練收斂曲線模擬",
      subtitle: "調整學習率 $\\eta$、規則數量與訓練迭代次數，觀察 ANFIS 如何自動微調隸屬函數以逼近目標非線性曲線。",
      widgetType: "ch11_anfis"
    },
    quizzes: [
      {
        id: "q11_1",
        question: "結合「模糊系統」與「類神經網路」的 ANFIS 架構，各自彌補了對方的哪一項缺點？",
        options: [
          "類神經提供「從資料自動學習參數」的能力，模糊系統提供「語意規則可解釋性與先驗知識嵌入」",
          "類神經讓系統失去推論速度，模糊系統移除所有權重",
          "兩者結合後不再需要任何訓練資料",
          "兩者結合只為了減少程式行數"
        ],
        answer_index: 0,
        explanation: "純類神經是黑盒子難解釋；純模糊需要人工調參。Neuro-Fuzzy 取兩者所長，既可訓練又具備規則結構。"
      },
      {
        id: "q11_2",
        question: "ANFIS 架構通常採用哪一種模糊推論模型作為骨幹，使其第 4 層能以最小平方法快速求解？",
        options: [
          "Takagi-Sugeno-Kang (TSK) 線性後件模型",
          "純二元布林邏輯模型",
          "僅使用 Max-Min 的純圖形重心法",
          "蒙地卡羅隨機樹"
        ],
        answer_index: 0,
        explanation: "TSK 模型的結論為輸入變數的線性組合 $p_i x + q_i y + r_i$，對參數呈線性關係，故能用最小平方法一步求得最佳解。"
      },
      {
        id: "q11_3",
        question: "在 ANFIS 的五層結構中，第 3 層的主要功能為何？",
        options: [
          "計算每條規則激發強度的正規化權重 $\\bar{w}_i = w_i / \\sum_j w_j$",
          "對輸入影像進行卷積濾波",
          "將輸出轉換為圖片",
          "隨機刪除一半的規則"
        ],
        answer_index: 0,
        explanation: "第 3 層（Normalized Firing Strength）將各規則激發強度歸一化，使總和為 1。"
      }
    ]
  },
  {
    ch: 12,
    code: "Ch.12",
    title: "第 12 章：模糊圖形識別與影像特徵擷取",
    subtitle: "Fuzzy Pattern Recognition & Image Enhancement",
    stageGroup: "智慧演算法與進階應用篇",
    color: "amber",
    icon: "🖼️",
    pageRange: "12-1 ~ 12-13",
    prerequisites: ["Ch.02 歸屬函數", "灰階影像像素概念"],
    overview: "真實影像常受限於光線不均、雜訊與物體邊界模糊。本章學習如何把影像灰階值 $g \\in [0, 255]$ 映射到模糊亮度平面 $[0, 1]$，運用 Pal-King 模糊對比度增強算子 (INT Operator) 凸顯邊緣，並透過模糊貼近度 (Fuzzy Similarity / Closeness) 進行圖形分類與目標識別。",
    keyConcepts: [
      {
        term: "模糊影像對比度增強算子 (INT Operator)",
        explanation: "對模糊亮度平面上的歸屬度 $\\mu_{mn}$ 進行二次方增強，將大於 0.5 的亮部推向 1、小於 0.5 的暗部推向 0，達到去霧與強化邊界的效果。",
        formula: "$$\\mu'_{mn} = \\begin{cases} 2[\\mu_{mn}]^2, & 0 \\le \\mu_{mn} \\le 0.5 \\\\ 1 - 2[1 - \\mu_{mn}]^2, & 0.5 < \\mu_{mn} \\le 1 \\end{cases}$$"
      },
      {
        term: "模糊貼近度與最近鄰樣板識別",
        explanation: "計算待測特徵模糊集合 $B$ 與各標準類別樣板 $A_k$ 的格貼近度（內積與外積比值或海明距離），選取最大貼近度作為分類結果。",
        formula: "$$\\sigma(A, B) = \\frac{1}{2}\\big[ (A \\bullet B) + (1 - A \\odot B) \\big]$$"
      }
    ],
    labConfig: {
      id: "lab-ch12",
      title: "Ch.12 模糊影像對比增強 (INT Operator) 灰階轉換曲線",
      subtitle: "調整渡越點 (Crossover Point) 與迭代增強次數，即時觀察灰階像素映射與邊緣銳利度變化。",
      widgetType: "ch12_image"
    },
    quizzes: [
      {
        id: "q12_1",
        question: "使用模糊增強算子 (INT Operator) 處理一張曝光不足、邊界模糊的灰階影像時，它對 $\\mu > 0.5$ 與 $\\mu < 0.5$ 的像素分別做什麼處理？",
        options: [
          "將 $>0.5$ 的像素歸屬度推向 1（更亮），將 $<0.5$ 的推向 0（更暗），拉大對比",
          "將所有像素都平均成 0.5（完全灰暗）",
          "隨機交換亮部與暗部像素",
          "直接刪除大於 0.5 的所有像素"
        ],
        answer_index: 0,
        explanation: "INT 算子是一個以 0.5 為對稱中心的 S 形非線性強化函數，可顯著降低影像的模糊指數 (Index of Fuzziness)。"
      },
      {
        id: "q12_2",
        question: "在模糊圖形識別中，「擇近原則」是指什麼？",
        options: [
          "計算未知樣本與各標準類別模糊樣板的貼近度，將其歸類至貼近度最高的那一類",
          "只看圖形左下角最近的像素",
          "把所有類別合併成單一類別",
          "隨機挑選距離最遠的類別"
        ],
        answer_index: 0,
        explanation: "擇近原則是模糊模式識別的核心準則，利用貼近度 (Closeness) 或相似度量度完成軟性分類。"
      },
      {
        id: "q12_3",
        question: "影像像素的「模糊度 (Index of Fuzziness)」越接近 0，代表這張影像呈現什麼特性？",
        options: [
          "黑白分明、邊界對比極度清晰",
          "整張影像呈現均勻中灰色、完全看不清輪廓",
          "影像解析度變成 1×1",
          "影像檔案損毀"
        ],
        answer_index: 0,
        explanation: "當所有像素歸屬度都趨近 0 或 1（遠離 0.5 的最大不確定區）時，模糊度趨近於 0。"
      }
    ]
  },
  {
    ch: 13,
    code: "Ch.13",
    title: "第 13 章：模糊決策與多準則評估 (MCDM)",
    subtitle: "Fuzzy Decision Making & Multi-Criteria Evaluation",
    stageGroup: "智慧演算法與進階應用篇",
    color: "rose",
    icon: "⚖️",
    pageRange: "13-1 ~ 13-17",
    prerequisites: ["Ch.04 模糊交集與聯集", "Ch.05 模糊數"],
    overview: "真實世界的工程選型、投資評估與管理決策往往充滿主觀語意（「成本偏高」、「可靠性極佳」）與彼此衝突的目標。本章學習 Bellman-Zadeh 模糊決策模型（目標與限制條件之交集）、模糊綜合評判 (Fuzzy Comprehensive Evaluation) 與模糊權重矩陣運算，將專家語意轉化為客觀可排序的綜合評分。",
    keyConcepts: [
      {
        term: "Bellman-Zadeh 模糊決策模型",
        explanation: "將模糊目標 $G$ 與模糊限制 $C$ 視為同等地位的模糊集合，決策集合 $D = G \\cap C$，最佳方案為使 $D$ 歸屬度最大化者。",
        formula: "$$\\mu_D(x) = \\min\\big(\\mu_G(x),\\; \\mu_C(x)\\big), \\quad x^* = \\arg\\max_{x\\in X} \\mu_D(x)$$"
      },
      {
        term: "模糊綜合評判 ($B = W \\circ R$)",
        explanation: "結合各指標權重向量 $W$ 與專家對方案的評價矩陣 $R$，透過模糊合成得出綜合評語分佈向量 $B$。",
        formula: "$$B = W \\circ R = (b_1, b_2, \\dots, b_m)$$"
      }
    ],
    labConfig: {
      id: "lab-ch13",
      title: "Ch.13 Bellman-Zadeh 模糊決策交集與多準則評估實驗室",
      subtitle: "調整決策目標「高性能」與限制條件「低成本」曲線，找出最佳折衷點 $x^*$ 與綜合評判雷達。",
      widgetType: "ch13_decision"
    },
    quizzes: [
      {
        id: "q13_1",
        question: "在 Bellman-Zadeh 模糊決策模型中，若模糊目標為 $G$、模糊限制條件為 $C$，則「決策集合 $D$」如何定義？",
        options: [
          "$D = G \\cap C$（必須同時滿足目標與限制的交集）",
          "$D = G \\cup C$（只要滿足其中一個即可）",
          "$D = \\bar{G} \\cap \\bar{C}$",
          "$D = G - C$"
        ],
        answer_index: 0,
        explanation: "決策必須在目標與限制之間取得同時滿足程度最高的方案，因此取交集 $D = G \\cap C$ 並求其最大值。"
      },
      {
        id: "q13_2",
        question: "進行模糊綜合評判 $B = W \\circ R$ 時，向量 $W$ 的所有權重元素通常需要滿足什麼條件？",
        options: [
          "各指標權重非負且總和為 1（正規化權重分佈）",
          "全部權重都必須大於 10",
          "只能有單一指標非零",
          "權重必須是負數"
        ],
        answer_index: 0,
        explanation: "權重向量代表各項評估準則的相對重要性佔比，通常正規化為 $\\sum w_i = 1$。"
      },
      {
        id: "q13_3",
        question: "如果評估後有兩個方案的綜合評語向量 $B$ 非常接近，最常用的最終排序方法為何？",
        options: [
          "將評語等級賦予分數並計算加權重心總分進行明確比較",
          "直接放棄兩個方案",
          "隨機抽籤決定",
          "只看第一個指標而忽略其餘所有指標"
        ],
        answer_index: 0,
        explanation: "賦予評語等級量化分數（如優=90, 良=75, 中=60）後計算加權期望值，即可得出明確的單一排序分數。"
      }
    ]
  },
  {
    ch: 14,
    code: "Ch.14",
    title: "第 14 章：臨床醫學與重症監測模糊專家系統",
    subtitle: "Medical Diagnosis & ICU Fuzzy Expert Systems",
    stageGroup: "智慧演算法與進階應用篇",
    color: "teal",
    icon: "🏥",
    pageRange: "14-1 ~ 14-17",
    prerequisites: ["Ch.06 模糊關係", "Ch.13 模糊決策"],
    overview: "醫療診斷往往面臨「正常值與異常值之間沒有絕對界線」（例如發燒、高血壓、呼吸急促）以及症狀重疊的挑戰。本章介紹如何將資深醫師的臨床經驗轉化為模糊關係矩陣與多生理參數（心率、血氧、血壓、體溫）監測規則，打造能即時評估病患風險等級與減少假警報的臨床輔助專家系統。",
    keyConcepts: [
      {
        term: "醫療生理指標的模糊語意化",
        explanation: "體溫 $37.4^\\circ\\text{C}$ 不應被硬性判為「完全正常」，而是同時具有「微燒 0.4」與「正常 0.6」的雙重歸屬，提供早期預警。",
        formula: "$$\\text{Risk Level} = \\text{FuzzyFuse}(\\text{HR},\\; \\text{SpO}_2,\\; \\text{Temp},\\; \\text{BP})$$"
      },
      {
        term: "症狀—疾病模糊關係推論",
        explanation: "透過臨床統計建立症狀與疾病關聯矩陣 $R$，由病患症狀強度向量 $S$ 推論各疾病可能程度 $D = S \\circ R$。",
        formula: "$$d_j = \\max_i \\min(s_i,\\; r_{ij})$$"
      }
    ],
    labConfig: {
      id: "lab-ch14",
      title: "Ch.14 ICU 重症生理參數模糊風險評估儀表板",
      subtitle: "即時調整病患體溫、心率與血氧飽和度 ($\\text{SpO}_2$)，觀察各指標模糊警示程度與綜合風險指數。",
      widgetType: "ch14_medical"
    },
    quizzes: [
      {
        id: "q14_1",
        question: "傳統 ICU 生理監視器常因單一固定門檻（如心率 > 100 就響鈴）產生大量誤報；導入模糊專家系統後如何改善？",
        options: [
          "整合多項生理參數變化趨勢與邊界平滑度，過濾短暫微小波動並準確分級風險",
          "把所有警報聲音都永久靜音",
          "把警報門檻提高到不可能達到的數值",
          "每天只檢查一次病患數值"
        ],
        answer_index: 0,
        explanation: "多參數融合與連續歸屬度能區分「短暫誤差波動」與「多指標同時惡化」，大幅降低臨床警報疲勞。"
      },
      {
        id: "q14_2",
        question: "在醫療診斷模糊關係 $D = S \\circ R$ 中，若某病患完全沒有症狀 $i$（即 $s_i = 0$），該症狀對疾病 $j$ 的 Max-Min 貢獻為何？",
        options: ["$\\min(0, r_{ij}) = 0$（沒有貢獻）", "$r_{ij}$", "1", "會變成負數"],
        answer_index: 0,
        explanation: "$\\min(0, r_{ij}) = 0$，因此未出現的症狀不會造成錯誤激發。"
      },
      {
        id: "q14_3",
        question: "為何臨床醫師通常更信任模糊專家系統而非純黑盒深度學習模型作為輔助工具？",
        options: [
          "模糊規則以人類可讀的 IF-THEN 邏輯呈現，醫師能明確檢視是哪幾項指標觸發了風險評估",
          "模糊專家系統不需要任何電力運作",
          "模糊系統永遠不會有任何誤差",
          "醫師不需要知道病患數值"
        ],
        answer_index: 0,
        explanation: "醫療決策重視「可解釋性 (Explainability)」與問責性，這正是模糊規則庫的強項。"
      }
    ]
  },
  {
    ch: 15,
    code: "Ch.15",
    title: "第 15 章：模糊時間序列分析與金融預測",
    subtitle: "Fuzzy Time Series & Financial Forecasting",
    stageGroup: "智慧演算法與進階應用篇",
    color: "indigo",
    icon: "📈",
    pageRange: "15-1 ~ 15-15",
    prerequisites: ["Ch.02 論域分割", "Ch.06 模糊關係"],
    overview: "傳統時間序列 (如 ARIMA) 要求數據平穩且常受限於線性假設，面對股市指數、匯率與用電負載等充滿雜訊與語意波動的資料時表現受限。Song 與 Chissom 提出的「模糊時間序列 (FTS)」將數值論域分割為語意區間，建立模糊邏輯關係群 (FLRG) 來捕捉歷史轉移規律。",
    keyConcepts: [
      {
        term: "論域分割與語意化轉換",
        explanation: "將歷史數值範圍 $[D_{\\min}-D_1,\\; D_{\\max}+D_2]$ 切分為 $n$ 個模糊集合 $A_1, A_2, \\dots, A_n$，將每年/每日數值轉換為語意序列。",
        formula: "$$F(t-1) \\to F(t) \\implies A_i \\to A_j$$"
      },
      {
        term: "模糊邏輯關係群 (FLRG) 與去模糊化預測",
        explanation: "將相同前件的轉移規則分組（如 $A_i \\to A_{j1}, A_{j2}$），並取後件區間中點的平均或加權值作為下一期預測值。",
        formula: "$$\\hat{y}(t) = \\frac{1}{k}\\sum_{r=1}^k m(A_{j_r})$$"
      }
    ],
    labConfig: {
      id: "lab-ch15",
      title: "Ch.15 模糊時間序列 (FTS) 語意區間切分與走勢預測模擬",
      subtitle: "調整論域切分區間數與平滑權重，觀察歷史序列轉化為模糊預測曲線的擬合誤差 (RMSE)。",
      widgetType: "ch15_fts"
    },
    quizzes: [
      {
        id: "q15_1",
        question: "建立模糊時間序列 (Fuzzy Time Series) 預測模型的第一個關鍵步驟為何？",
        options: [
          "定義論域 $U$ 並將其分割為數個等距或不等距的模糊語意區間",
          "把所有歷史數據全部刪除只留最後一筆",
          "計算數據的標準差並全部乘以 0",
          "將數據轉換成二進位圖片"
        ],
        answer_index: 0,
        explanation: "只有先完成論域分割與定義模糊集合 $A_1 \\dots A_n$，才能將數值時間序列模糊化並歸納出轉移規則。"
      },
      {
        id: "q15_2",
        question: "在模糊邏輯關係群 (FLRG) 中，若歷史上曾出現 $A_2 \\to A_3$ 與 $A_2 \\to A_5$ 兩種轉移，當目前狀態落在 $A_2$ 時，標準 Chen 方法如何計算預測值？",
        options: [
          "取 $A_3$ 與 $A_5$ 兩個區間中點 (Midpoint) 的算術平均作為預測輸出",
          "只採用 $A_3$ 而忽略 $A_5$",
          "預測下一期為 0",
          "無法進行預測必須報錯"
        ],
        answer_index: 0,
        explanation: "Chen 的經典方法透過取所有可能後件區間中點的平均值（或加權平均）來計算預測數值。"
      },
      {
        id: "q15_3",
        question: "相較於傳統統計時間序列，模糊時間序列特別適合處理什麼情境？",
        options: [
          "資料筆數有限、具非線性波動且需要直覺語意規則描述的預測問題",
          "資料完全是嚴格週期性正弦波的情況",
          "樣本數必須超過十億筆的情況",
          "只能用於純文字分類的情況"
        ],
        answer_index: 0,
        explanation: "FTS 不需要嚴格的機率分佈與平穩性假設，在小樣本與高雜訊數據中常展現優異的強健性。"
      }
    ]
  },
  {
    ch: 16,
    code: "Ch.16",
    title: "第 16 章：模糊 C-均值分群演算法 (FCM)",
    subtitle: "Fuzzy C-Means Clustering Algorithm",
    stageGroup: "智慧演算法與進階應用篇",
    color: "cyan",
    icon: "🫧",
    pageRange: "16-1 ~ 16-11",
    prerequisites: ["Ch.02 歸屬度", "歐幾里得距離與向量平均"],
    overview: "傳統 K-Means 屬於「硬分群 (Hard Clustering)」，每個資料點只能非黑即白地歸屬於單一中心；然而在邊界交疊的資料集中，這種強制指派往往不合理。本章學習 Bezdek 提出的模糊 C-均值分群 (FCM)，允許每個資料點以不同歸屬度 $u_{ij} \\in [0,1]$ 同時屬於多個群組（且 $\\sum_i u_{ij} = 1$），並推導目標函數最佳化之交替迭代公式。",
    keyConcepts: [
      {
        term: "FCM 目標函數與模糊度指數 $m$",
        explanation: "最小化加權平方距離和；其中模糊度指數 $m > 1$（常取 $m=2$）控制分群結果的模糊程度，$m\\to 1$ 時退化為 K-Means。",
        formula: "$$J_m(U, V) = \\sum_{i=1}^c \\sum_{j=1}^n u_{ij}^m \\|x_j - v_i\\|^2, \\quad \\sum_{i=1}^c u_{ij} = 1$$"
      },
      {
        term: "群中心 $v_i$ 與歸屬矩陣 $u_{ij}$ 迭代更新式",
        explanation: "透過 Lagrange 乘數法求極值，交替更新各群中心位置與各資料點對群中心的歸屬度直到收斂。",
        formula: "$$v_i = \\frac{\\sum_{j=1}^n u_{ij}^m x_j}{\\sum_{j=1}^n u_{ij}^m}, \\quad u_{ij} = \\left[\\sum_{k=1}^c \\left(\\frac{\\|x_j - v_i\\|}{\\|x_j - v_k\\|}\\right)^{\\frac{2}{m-1}}\\right]^{-1}$$"
      }
    ],
    labConfig: {
      id: "lab-ch16",
      title: "Ch.16 模糊 C-均值分群 (FCM) 2D 散佈圖與歸屬度模擬",
      subtitle: "調整群數 $c$ 與模糊度指數 $m$，即時觀察資料點分群邊界、群中心移動與目標函數 $J_m$ 收斂。",
      widgetType: "ch16_fcm"
    },
    quizzes: [
      {
        id: "q16_1",
        question: "在模糊 C-均值分群 (FCM) 中，單一資料點 $x_j$ 對所有 $c$ 個群組的歸屬度 $u_{ij}$ 必須滿足什麼條件？",
        options: [
          "$\\sum_{i=1}^c u_{ij} = 1$ 且 $u_{ij} \\in [0, 1]$",
          "$\\sum_{i=1}^c u_{ij} = c$",
          "每個 $u_{ij}$ 只能是 0 或 1",
          "歸屬度可以是任意負數"
        ],
        answer_index: 0,
        explanation: "FCM 屬於機率型模糊分割 (Probabilistic Fuzzy Partition)，同一個點對所有群的歸屬度加總恆等於 1。"
      },
      {
        id: "q16_2",
        question: "當模糊度指數 $m$ 越來越接近 $1^+$ 時，FCM 演算法的行為會趨近於什麼？",
        options: [
          "退化為傳統的硬式 K-Means 分群（歸屬度趨近 0 或 1）",
          "所有群中心全部重疊在原點",
          "歸屬度全部變成 $1/c$",
          "演算法將無法計算距離"
        ],
        answer_index: 0,
        explanation: "指數 $2/(m-1)$ 在 $m\\to 1^+$ 時趨近無窮大，使最近群的歸屬度趨近 1、其餘趨近 0；反之 $m\\to\\infty$ 則趨近均等 $1/c$。"
      },
      {
        id: "q16_3",
        question: "若一個資料點恰好位於兩個相同大小群組的正中間，FCM 會給予該點什麼樣的歸屬度？",
        options: [
          "對兩個群組各約 $0.5$ 的歸屬度，精準反映其「位於交界處」的模糊性",
          "隨機指派為 1 與 0",
          "將該資料點從資料集中刪除",
          "回傳 NaN 錯誤"
        ],
        answer_index: 0,
        explanation: "當兩距離相等時，比值為 1，依公式 $u_{1j} = u_{2j} = 1/2 = 0.5$，這正是軟分群優於硬分群之處。"
      }
    ]
  },
  {
    ch: 17,
    code: "Ch.17",
    title: "第 17 章：模糊遺傳演算法 (Genetic Fuzzy Systems)",
    subtitle: "Evolutionary Optimization of Fuzzy Rule Bases",
    stageGroup: "智慧演算法與進階應用篇",
    color: "emerald",
    icon: "🧬",
    pageRange: "17-1 ~ 17-15",
    prerequisites: ["Ch.07 規則庫設計", "Ch.11 ANFIS 概念"],
    overview: "當目標函數不可微分（例如不連續控制誤差、實機硬體評分）時，依賴梯度的 ANFIS 便難以發揮。本章介紹如何結合達爾文演化理論與遺傳演算法 (GA)，將模糊規則庫與歸屬函數參數編碼為「染色體 (Chromosome)」，透過選擇、交配 (Crossover) 與突變 (Mutation) 進行全域最佳化搜尋。",
    keyConcepts: [
      {
        term: "模糊參數的染色體編碼 (Pittsburgh vs. Michigan)",
        explanation: "將各輸入/輸出三角形的頂點座標 $(a_i, b_i, c_i)$ 與規則後件索引串接成實數或二進位基因向量，讓整個模糊系統一起演化。",
        formula: "$$\\text{Chromosome} = [a_1, b_1, c_1, \\dots, \\text{rule}_1, \\text{rule}_2, \\dots]$$"
      },
      {
        term: "適應度函數 (Fitness Function) 與全域搜尋",
        explanation: "以控制誤差積分（如 ITAE）或分類準確率的倒數作為適應度，不需計算梯度即可跳脫區域最佳解。",
        formula: "$$\\text{Fitness} = \\frac{1}{1 + \\text{ITAE}}, \\quad \\text{ITAE} = \\int_0^T t \\cdot |e(t)|\\, dt$$"
      }
    ],
    labConfig: {
      id: "lab-ch17",
      title: "Ch.17 遺傳演算法 (GA) 最佳化模糊系統適應度演化模擬",
      subtitle: "設定族群大小、突變率與演化世代數，觀察最佳適應度曲線收斂與參數搜尋過程。",
      widgetType: "ch17_ga"
    },
    quizzes: [
      {
        id: "q17_1",
        question: "相較於基於梯度下降的類神經調參法，使用遺傳演算法 (GA) 調校模糊系統最大的優勢為何？",
        options: [
          "不要求目標函數可微分，且透過多點平行搜尋較不易陷入區域最佳解 (Local Minimum)",
          "只需 1 次運算就能保證找到宇宙終極解",
          "不需要定義任何適應度評估指標",
          "只能在離線單變數線性函數上運作"
        ],
        answer_index: 0,
        explanation: "GA 僅需評估每個個體的 Fitness 分數即可演化，非常適合非線性、不連續或多目標最佳化問題。"
      },
      {
        id: "q17_2",
        question: "在遺傳演算法的三個主要算子「選擇、交配、突變」中，「突變 (Mutation)」扮演什麼關鍵角色？",
        options: [
          "引入基因多樣性，幫助族群跳脫過早收斂的區域最佳解",
          "複製完全一模一樣的最佳染色體",
          "直接把族群數量減少為 1",
          "將適應度函數清零"
        ],
        answer_index: 0,
        explanation: "適度的突變率能探索尚未覆蓋的搜尋空間，維持族群演化活力。"
      },
      {
        id: "q17_3",
        question: "若在編碼三角形歸屬函數 $(a, b, c)$ 時沒有加入排序限制，演化後可能會發生什麼問題？",
        options: [
          "出現 $a > b$ 或 $b > c$ 的無效三角形，因此在解碼或編碼階段常使用「遞增間距編碼」確保有序性",
          "三角形會自動變成圓形",
          "計算速度會變快十倍",
          "不會有任何影響"
        ],
        answer_index: 0,
        explanation: "採用基準點加正向偏移量 $(a, \\delta_1, \\delta_2)$ 編碼可天然保證 $a \\le b \\le c$ 的幾何合法性。"
      }
    ]
  },
  {
    ch: 18,
    code: "Ch.18",
    title: "第 18 章：自適應模糊控制與強健系統",
    subtitle: "Adaptive Fuzzy Control & Robust Systems",
    stageGroup: "智慧演算法與進階應用篇",
    color: "violet",
    icon: "🛡️",
    pageRange: "18-1 ~ 18-15",
    prerequisites: ["Ch.07 模糊控制", "Ch.11 逼近理論"],
    overview: "當受控體的物理參數隨時間漂移（如機器手臂負載改變、飛行器燃料消耗）或遭遇外部未知干擾時，固定規則的模糊控制器可能效能下降。本章介紹直接/間接自適應模糊控制，結合李亞普諾夫 (Lyapunov) 穩定性理論即時在線更新後件參數向量 $\\theta$，從數學上嚴格保證閉迴路系統的漸近穩定與強健性。",
    keyConcepts: [
      {
        term: "通用函數逼近特性 (Universal Approximator)",
        explanation: "根據 Wang-Mendel 定理，具備高斯歸屬函數、乘積推論與中心平均解模糊化的模糊系統，能以任意精確度逼近緊集上的任何連續非線性函數。",
        formula: "$$|\\hat{f}(x \\mid \\theta) - f(x)| < \\varepsilon, \\quad \\forall x \\in U$$"
      },
      {
        term: "基於 Lyapunov 穩定性的線上參數適應律",
        explanation: "選取 Lyapunov 函數 $V(e, \\tilde{\\theta})$ 並推導使 $\\dot{V} \\le 0$ 的參數更新律，確保追蹤誤差收斂且所有信號有界。",
        formula: "$$\\dot{\\theta} = \\gamma \\cdot e^T P b \\cdot \\xi(x)$$"
      }
    ],
    labConfig: {
      id: "lab-ch18",
      title: "Ch.18 自適應模糊控制對比固定控制抗干擾響應模擬",
      subtitle: "設定系統負載突變干擾強度與適應增益 $\\gamma$，比較固定控制器與自適應模糊控制的追蹤誤差收斂。",
      widgetType: "ch18_adaptive"
    },
    quizzes: [
      {
        id: "q18_1",
        question: "相較於傳統固定規則庫的模糊控制器，「自適應模糊控制器 (Adaptive Fuzzy Controller)」的核心特色為何？",
        options: [
          "能在系統運行期間依追蹤誤差線上即時調整規則參數，以抵抗負載變化或未知干擾",
          "控制器出廠後參數永久鎖死不可改變",
          "只能用於開迴路系統不需要回授",
          "必須人工每天重新輸入表格"
        ],
        answer_index: 0,
        explanation: "自適應律會根據實際誤差動態更新權重 $\\theta$，補償系統未建模動態與外部擾動。"
      },
      {
        id: "q18_2",
        question: "在自適應模糊控制設計中，引入 Lyapunov 穩定性分析的主要目的為何？",
        options: [
          "從數學上嚴格證明閉迴路系統誤差收斂且控制信號不會發散",
          "用來美化使用者介面",
          "用來取代感測器接線",
          "用來把非線性系統強制變成零"
        ],
        answer_index: 0,
        explanation: "Lyapunov 直接法是檢驗非線性控制與適應律是否穩定的黃金標準。"
      },
      {
        id: "q18_3",
        question: "模糊系統之所以能擔任「未知非線性函數逼近器」，是依據哪一項重要性質？",
        options: [
          "通用函數逼近定理 (Universal Approximation Theorem)",
          "畢氏定理",
          "熱力學第二定律",
          "大數法則"
        ],
        answer_index: 0,
        explanation: "只要規則足夠且基底覆蓋論域，模糊系統能逼近任意連續非線性函數。"
      }
    ]
  },
  {
    ch: 19,
    code: "Ch.19",
    title: "第 19 章：模糊理論未來發展與專書總結",
    subtitle: "Future Trends, Type-2 Fuzzy & Explainable AI",
    stageGroup: "智慧演算法與進階應用篇",
    color: "sky",
    icon: "🚀",
    pageRange: "19-1 ~ 19-6",
    prerequisites: ["Ch.01 ~ Ch.18 全書知識"],
    overview: "回顧從 1965 年 Zadeh 提出第一型模糊集合 (Type-1 Fuzzy) 到今日的完整演進藍圖：進一步展望能處理「歸屬度本身也有不確定性」的第二型模糊集合 (Interval Type-2 Fuzzy)、模糊大數據與可解釋人工智慧 (XAI) 的深度融合，總結學完《認識 Fuzzy》後的實務工程設計心法。",
    keyConcepts: [
      {
        term: "Type-1 vs. Interval Type-2 Fuzzy Sets",
        explanation: "當多位專家對同一個語意詞的歸屬曲線意見不一致時，Type-2 模糊集合以「不確定足跡 (FOU)」取代單一曲線，大幅提升高雜訊環境下的強健性。",
        formula: "$$\\tilde{A} = \\int_{x\\in X} \\int_{u \\in J_x \\subseteq [0,1]} \\frac{1}{(x, u)}, \\quad \\text{FOU}(\\tilde{A}) = \\bigcup_{x\\in X} J_x$$"
      },
      {
        term: "軟計算 (Soft Computing) 三大支柱融合",
        explanation: "結合模糊邏輯（語意推論）、類神經網路（資料學習）與演化演算法（全域尋優），構成現代智慧系統的基石。",
        formula: "$$\\text{Computational Intelligence} = \\text{Fuzzy} + \\text{Neural} + \\text{Evolutionary}$$"
      }
    ],
    labConfig: {
      id: "lab-ch19",
      title: "Ch.19 Type-2 模糊不確定足跡 (FOU) 與全書技術能力雷達",
      subtitle: "調整不確定帶寬度 (FOU Width)，觀察 Type-2 上下歸屬函數包絡線與全書各領域應用強項雷達圖。",
      widgetType: "ch19_future"
    },
    quizzes: [
      {
        id: "q19_1",
        question: "相較於第一型模糊集合 (Type-1)，第二型模糊集合 (Type-2 Fuzzy) 最大的突破在於？",
        options: [
          "歸屬度本身不再是單一確定數值，而是一個模糊區間 (FOU)，能處理語意定義本身的不確定性",
          "計算量永遠只需要一次加法",
          "取消了宇集合的概念",
          "只能使用 0 和 1 兩個值"
        ],
        answer_index: 0,
        explanation: "Type-2 模糊集合透過 Footprint of Uncertainty (FOU) 容納多個專家或高雜訊感測器的分歧。"
      },
      {
        id: "q19_2",
        question: "Zadeh 所倡導的「軟計算 (Soft Computing)」三大核心成員通常包含哪些技術？",
        options: [
          "模糊邏輯 (Fuzzy Logic)、類神經網路 (Neural Networks) 與演化計算/遺傳演算法 (Evolutionary Computing)",
          "僅有二元邏輯與組合語言",
          "只有資料庫 SQL 與網頁 HTML",
          "僅限於量子力學"
        ],
        answer_index: 0,
        explanation: "軟計算強調「容許不精確與不確定性，以換取低成本、高強健性與貼近人類思維的智慧解決方案」。"
      },
      {
        id: "q19_3",
        question: "在當代可解釋人工智慧 (XAI) 趨勢下，模糊邏輯扮演什麼重要角色？",
        options: [
          "提供人類可直接閱讀與稽核的語意規則結構，打破深度學習黑盒子",
          "將模型的權重加密使任何人都看不懂",
          "全面取代資料蒐集與感測器",
          "只用於產生隨機藝術圖像"
        ],
        answer_index: 0,
        explanation: "透明可追溯的 IF-THEN 規則與語意歸屬度，使模糊系統成為高風險決策領域（醫療、自駕、工業控制）的重要可解釋工具。"
      }
    ]
  }
];
