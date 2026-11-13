// ============================================================================
// Web FIS Studio: 全功能網頁版模糊邏輯設計工具箱 (MATLAB Fuzzy Logic Designer 完整教學引導版)
// frontend/fis_studio.js
// 特色：
// 1. 🎓 5大步驟新手闖關設計嚮導 (Step-by-Step Guided Wizard) 與老師小學堂解說
// 2. 💡 經典範本情境深度導讀（為什麼要載入範本？不載入從零自建會怎樣？）
// 3. ⚙️ FIS Properties: Mamdani (幾何圖形) vs Sugeno (公式) 推論模式與五大算子深入對比
// 4. 📈 MF Editor: 論域範圍、三角/梯形/高斯/廣義鐘型函數視覺化塑形與人類語意量化
// 5. 📜 Rule Editor: 自然語言 IF-THEN 組裝、權重控制與 $N \times M$ FAM 規則矩陣表
// 6. 🔍 Rule Viewer: MATLAB 經典小圖矩陣、紅色即時滑桿、激發幾何截頂與重心解模糊化
// 7. 🌐 Surface & Export: 3D 控制曲面檢驗、MATLAB .fis 格式匯出與 Python scikit-fuzzy 生成
// ============================================================================

window.WebFISStudio = (function () {
  'use strict';

  // 模式：true (開啟 5 大步驟新手教學引導嚮導) | false (專家自由建模)
  let isGuidedMode = true;

  // 當前引導步驟 (1 到 5)：
  // 1: 確立控制目標與推論架構 (FIS Properties)
  // 2: 定義物理邊界與論域 (Universe & Variables)
  // 3: 雕塑人類語意歸屬函數 (MF Editor)
  // 4: 注入專家經驗規則庫 (Rule Editor & FAM)
  // 5: 動態推論驗證與曲面檢驗 (Rule Viewer & Surface)
  let currentGuideStep = 1;

  // 當前作用中的子工作區標籤：'properties' | 'mf' | 'rules' | 'viewer' | 'surface'
  // 教學引導模式預設從步驟 1 (properties) 開始，依序引導讀者到步驟 5 (viewer)
  let activeSubTab = 'properties';

  // 當前選中的變數索引與類型（用於 MF Editor）：{ type: 'input'|'output', index: 0, mfIndex: 0 }
  let selectedVar = { type: 'input', index: 0, mfIndex: 0 };

  // Rule Viewer 的當前各輸入變數動態數值 (key: inputIndex -> value)
  let viewerInputs = {};

  // Rule Editor 檢視模式：'list' (條列清單) | 'fam' (二維 FAM 規則矩陣表)
  let ruleViewMode = 'list';

  // 當前選中的範本代碼：'tipping' | 'aircon' | 'pendulum' | 'autobrake' | 'custom_blank'
  let currentPresetKey = 'tipping';

  // 是否展開範本詳細情境解說抽屜
  let isStoryExpanded = true;

  // 區間第二型模糊 (Interval Type-2 FOU) 模式控制
  let isType2Enabled = false;
  let type2FOUWidth = 0.15; // 預設 15% 不確定性半徑幅度

  // =========================================================================
  // 經典範本定義庫（附帶深度的教學情境導讀與工程實務哲學）
  // =========================================================================
  const PRESET_SYSTEMS = {
    tipping: {
      key: "tipping",
      name: "TippingProblem",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "☕",
        title: "經典餐廳小費折衷決策問題 (Tipping Problem)",
        category: "經典入門示範 • MATLAB 官方數十年標準教材",
        oneLineSummary: "評估服務生態度 (0~10分) 與菜餚美味度 (0~10分)，決定給予多少比例小費 (0%~30%)",
        problemStatement: "你在一家高級餐廳享用晚餐，餐後需要決定給服務生多少比例的小費 (0% ~ 30%)。傳統兩值或線性數學很難精準描述人類的感受（例如你很難寫出『小費 = 服務×1.5 + 菜餚×0.8』這種死板公式），但模糊推論卻能完美模擬人類的評價折衷經驗！",
        whyFuzzy: "一般人給小費並不是嚴苛套用乘除算式，而是憑日常直覺：『只要服務很爛，哪怕牛排再美味，小費依然很少；如果服務極致尊榮，或是牛排人間美味，都會慷慨給予高額小費』。這正是模糊邏輯中 OR（取大）與 MIN（削平）的典型應用！",
        inputsDesc: [
          "service [0 ~ 10 分]：服務生的服務品質，分為 糟糕 (poor)、良好 (good)、極致卓越 (excellent)。",
          "food [0 ~ 10 分]：餐點的美味程度，分為 難以下嚥 (rancid)、頂級美味 (delicious)。"
        ],
        outputsDesc: [
          "tip [0% ~ 30%]：小費給予比例，分為 吝嗇 (cheap: ~5%)、標準平均 (average: ~15%)、慷慨犒賞 (generous: ~25%)。"
        ],
        rulesPhilosophy: "透過 3 條常理規則，就能覆蓋所有可能的用餐體驗，產生平滑優美的決策曲面。"
      },
      inputs: [
        {
          name: "service",
          range: [0, 10],
          mfs: [
            { name: "poor", type: "gaussmf", params: [1.5, 0] },
            { name: "good", type: "gaussmf", params: [1.5, 5] },
            { name: "excellent", type: "gaussmf", params: [1.5, 10] }
          ]
        },
        {
          name: "food",
          range: [0, 10],
          mfs: [
            { name: "rancid", type: "trapmf", params: [0, 0, 1, 3] },
            { name: "delicious", type: "trapmf", params: [7, 9, 10, 10] }
          ]
        }
      ],
      outputs: [
        {
          name: "tip",
          range: [0, 30],
          mfs: [
            { name: "cheap", type: "trimf", params: [0, 5, 10] },
            { name: "average", type: "trimf", params: [10, 15, 20] },
            { name: "generous", type: "trimf", params: [20, 25, 30] }
          ]
        }
      ],
      rules: [
        {
          id: "r1",
          enabled: true,
          connection: "or",
          weight: 1.0,
          antecedents: [
            { varIndex: 0, mfIndex: 0, isNot: false }, // service is poor
            { varIndex: 1, mfIndex: 0, isNot: false }  // food is rancid
          ],
          consequents: [
            { varIndex: 0, mfIndex: 0 } // tip is cheap
          ]
        },
        {
          id: "r2",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [
            { varIndex: 0, mfIndex: 1, isNot: false }, // service is good
            { varIndex: 1, mfIndex: -1, isNot: false } // none
          ],
          consequents: [
            { varIndex: 0, mfIndex: 1 } // tip is average
          ]
        },
        {
          id: "r3",
          enabled: true,
          connection: "or",
          weight: 1.0,
          antecedents: [
            { varIndex: 0, mfIndex: 2, isNot: false }, // service is excellent
            { varIndex: 1, mfIndex: 1, isNot: false }  // food is delicious
          ],
          consequents: [
            { varIndex: 0, mfIndex: 2 } // tip is generous
          ]
        }
      ]
    },

    aircon: {
      key: "aircon",
      name: "AirConditioner",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "❄️",
        title: "變頻冷氣智慧溫控系統 (Air Conditioner Inverter Control)",
        category: "家電工業經典 • 日本 1980 年代引爆全球商機之代表作",
        oneLineSummary: "根據室溫誤差 (-5~+5°C) 與降溫速度 (-2~+2°C/min)，平滑調節壓縮機轉速 (0%~100%)",
        problemStatement: "傳統定頻冷氣只有『全速運轉』與『關機』兩種狀態，導致室溫忽冷忽熱且極度耗電。日本工程師在 1980 年代引進 Fuzzy 控制，讓冷氣機能根據『當前室溫與設定溫度的差距』以及『溫度變化的快慢』，平滑微調變頻壓縮機的運轉頻率 (0% ~ 100%)。",
        whyFuzzy: "當室溫與目標只差 0.5 度時，定頻冷氣會頻繁啟閉耗損壓縮機；Fuzzy 冷氣則懂得用低頻維持舒適室溫，既安靜又省電高達 30% 以上！",
        inputsDesc: [
          "temp_error [-5°C ~ +5°C]：室溫誤差（當前溫度 - 設定溫度）。負值代表太冷，0 代表剛好，正值代表太熱。",
          "error_dot [-2°C/min ~ +2°C/min]：溫度變化率（降溫速度或升溫速度）。"
        ],
        outputsDesc: [
          "frequency [0% ~ 100%]：變頻壓縮機輸出運轉頻率，分為 停機 (Stop)、低速 (Low)、中速 (Medium)、高速 (High)、強力運轉 (Turbo)。"
        ],
        rulesPhilosophy: "5 條核心規則組成的 FAM 對稱矩陣：太熱且升溫快時開強力 (Turbo)，達到設定溫且穩定時維持低速 (Low) 保溫。"
      },
      inputs: [
        {
          name: "temp_error",
          range: [-5, 5],
          mfs: [
            { name: "Negative", type: "trapmf", params: [-5, -5, -3, -0.5] },
            { name: "Zero", type: "trimf", params: [-2, 0, 2] },
            { name: "Positive", type: "trapmf", params: [0.5, 3, 5, 5] }
          ]
        },
        {
          name: "error_dot",
          range: [-2, 2],
          mfs: [
            { name: "Negative", type: "trapmf", params: [-2, -2, -1, 0] },
            { name: "Zero", type: "trimf", params: [-0.8, 0, 0.8] },
            { name: "Positive", type: "trapmf", params: [0, 1, 2, 2] }
          ]
        }
      ],
      outputs: [
        {
          name: "frequency",
          range: [0, 100],
          mfs: [
            { name: "Stop", type: "trimf", params: [0, 0, 25] },
            { name: "Low", type: "trimf", params: [15, 35, 55] },
            { name: "Medium", type: "trimf", params: [40, 60, 80] },
            { name: "High", type: "trimf", params: [65, 85, 100] },
            { name: "Turbo", type: "trapmf", params: [80, 95, 100, 100] }
          ]
        }
      ],
      rules: [
        {
          id: "ac_r1",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 0, isNot: false }, { varIndex: 1, mfIndex: 0, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 0 }]
        },
        {
          id: "ac_r2",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 0, isNot: false }, { varIndex: 1, mfIndex: 1, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 1 }]
        },
        {
          id: "ac_r3",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 1, isNot: false }, { varIndex: 1, mfIndex: 1, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 2 }]
        },
        {
          id: "ac_r4",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 2, isNot: false }, { varIndex: 1, mfIndex: 1, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 3 }]
        },
        {
          id: "ac_r5",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 2, isNot: false }, { varIndex: 1, mfIndex: 2, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 4 }]
        }
      ]
    },

    pendulum: {
      key: "pendulum",
      name: "InvertedPendulum",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "🕹️",
        title: "倒單擺滑車平衡控制系統 (Inverted Pendulum Balancing)",
        category: "控制工程聖杯 • 火箭發射與 Segway 平衡車核心原理",
        oneLineSummary: "根據擺桿傾角 (-30~+30°) 與傾倒角速度 (-10~+10°/s)，決定滑車馬達推力 (-50~+50N)",
        problemStatement: "想像你用手掌頂著一支垂直立起的掃帚，為了不讓掃帚倒下，你的手必須根據『掃帚傾斜的角度』以及『傾倒的速度』快速左右移動。倒單擺是高度非線性且開迴路極不穩定的系統，也是火箭垂直起飛姿勢控制的縮影！",
        whyFuzzy: "傳統精確微分方程需要極為繁瑣的矩陣計算，且一旦有微風干擾就容易發散；但雜技演員憑直覺就能穩穩頂住掃帚，Fuzzy 控制器正是直接把人類『倒得快就推大力一點搶回重心』的直覺轉譯為控制規則！",
        inputsDesc: [
          "angle [-30° ~ +30°]：擺桿傾斜角。負代表向左倒，0 代表正垂直，正代表向右倒。",
          "angular_vel [-10°/s ~ +10°/s]：傾倒角速度。負代表向左加速倒，正代表向右加速倒。"
        ],
        outputsDesc: [
          "force [-50N ~ +50N]：滑車底部馬達施加的水平推力。負代表向左推，正代表向右推。"
        ],
        rulesPhilosophy: "當角度向右且正在向右倒時，必須向右猛力推動滑車搶回重心；當傾斜角度不大且速度反向時，只需施加微小阻尼力矩。"
      },
      inputs: [
        {
          name: "angle",
          range: [-30, 30],
          mfs: [
            { name: "NegLarge", type: "trapmf", params: [-30, -30, -18, -6] },
            { name: "Zero", type: "trimf", params: [-12, 0, 12] },
            { name: "PosLarge", type: "trapmf", params: [6, 18, 30, 30] }
          ]
        },
        {
          name: "angular_vel",
          range: [-10, 10],
          mfs: [
            { name: "NegFast", type: "trapmf", params: [-10, -10, -6, -1] },
            { name: "Zero", type: "trimf", params: [-3, 0, 3] },
            { name: "PosFast", type: "trapmf", params: [1, 6, 10, 10] }
          ]
        }
      ],
      outputs: [
        {
          name: "force",
          range: [-50, 50],
          mfs: [
            { name: "PushLeft", type: "trapmf", params: [-50, -50, -30, -10] },
            { name: "Hold", type: "trimf", params: [-15, 0, 15] },
            { name: "PushRight", type: "trapmf", params: [10, 30, 50, 50] }
          ]
        }
      ],
      rules: [
        {
          id: "p_r1",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 0, isNot: false }, { varIndex: 1, mfIndex: 0, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 0 }]
        },
        {
          id: "p_r2",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 1, isNot: false }, { varIndex: 1, mfIndex: 1, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 1 }]
        },
        {
          id: "p_r3",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 2, isNot: false }, { varIndex: 1, mfIndex: 2, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 2 }]
        },
        {
          id: "p_r4",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 0, isNot: false }, { varIndex: 1, mfIndex: 2, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 1 }]
        },
        {
          id: "p_r5",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 2, isNot: false }, { varIndex: 1, mfIndex: 0, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 1 }]
        }
      ]
    },

    autobrake: {
      key: "autobrake",
      name: "AutoBrakeAssist",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "🚗",
        title: "汽車主動防撞與智慧自動煞車輔助 (Auto Brake Assist)",
        category: "智慧自駕 (ADAS) • 兼顧安全與乘坐舒適性的非線性權衡",
        oneLineSummary: "根據車距 (0~100m) 與相對逼近車速 (0~120 km/h)，動態決定煞車力道 (0%~100%)",
        problemStatement: "車載毫米波雷達探測到前方慢車。控制器需要根據『與前車的距離』與『兩車的接近速差』，決定是否煞車以及煞車力道多大。如果動不動就緊急急煞，不僅乘客容易暈車受傷，還極易引發後車追撞；但若反應太慢，則會釀成嚴重車禍。",
        whyFuzzy: "純粹依靠固定距離（如 30 公尺）觸發煞車是不合理的：市區塞車時時速只有 10 km/h，距離 10 公尺根本無需急煞；但在高速公路上以 110 km/h 行駛時，距離 50 公尺就必須開始減速。Fuzzy 能同時柔性權衡安全距離與速度兩大維度！",
        inputsDesc: [
          "distance [0m ~ 100m]：前車距離。極近危急 (VeryClose)、近距離 (Medium)、安全範圍 (Safe)。",
          "relative_speed [0 ~ 120 km/h]：兩車相對接近時速。慢速 (Slow)、中速 (Moderate)、高速逼近 (Fast)。"
        ],
        outputsDesc: [
          "brake_force [0% ~ 100%]：主動煞車油壓控制力道。不干預 (None)、微踩點煞 (Light)、重踩煞車 (Hard)、緊急煞停 (Emergency)。"
        ],
        rulesPhilosophy: "距離遠且速差小則不干預；高速逼近且距離縮短時立即階梯式加大煞車力道，危急時觸發最大油壓保護生命。"
      },
      inputs: [
        {
          name: "distance",
          range: [0, 100],
          mfs: [
            { name: "VeryClose", type: "trapmf", params: [0, 0, 15, 30] },
            { name: "Medium", type: "trimf", params: [20, 45, 70] },
            { name: "Safe", type: "trapmf", params: [60, 80, 100, 100] }
          ]
        },
        {
          name: "relative_speed",
          range: [0, 120],
          mfs: [
            { name: "Slow", type: "trapmf", params: [0, 0, 20, 40] },
            { name: "Moderate", type: "trimf", params: [30, 60, 90] },
            { name: "Fast", type: "trapmf", params: [80, 100, 120, 120] }
          ]
        }
      ],
      outputs: [
        {
          name: "brake_force",
          range: [0, 100],
          mfs: [
            { name: "None", type: "trimf", params: [0, 0, 20] },
            { name: "Light", type: "trimf", params: [15, 35, 55] },
            { name: "Hard", type: "trimf", params: [45, 70, 90] },
            { name: "Emergency", type: "trapmf", params: [80, 95, 100, 100] }
          ]
        }
      ],
      rules: [
        {
          id: "b_r1",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 2, isNot: false }, { varIndex: 1, mfIndex: 0, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 0 }]
        },
        {
          id: "b_r2",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 1, isNot: false }, { varIndex: 1, mfIndex: 1, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 1 }]
        },
        {
          id: "b_r3",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 0, isNot: false }, { varIndex: 1, mfIndex: 1, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 2 }]
        },
        {
          id: "b_r4",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 0, isNot: false }, { varIndex: 1, mfIndex: 2, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 3 }]
        }
      ]
    },

    custom_blank: {
      key: "custom_blank",
      name: "MyCustomController",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "🌱",
        title: "從零自訂空白專案 (Start from Scratch)",
        category: "自主探索模式 • 打造專屬於你的智慧控制器",
        oneLineSummary: "空白控制器畫布，由你親自定義輸入物理量、語意集合與控制經驗規則",
        problemStatement: "這是一個完全由你掌控的全新專案！你可以把它設計成任何你想自動化的系統，例如：『溫室自動澆花（土壤濕度＋日照 $\\to$ 水閥開度）』、『烤箱溫度控制（溫度＋濕度 $\\to$ 加熱管功率）』或『無人機抗風定高控制』。",
        whyFuzzy: "從零開始建立系統是真正掌握模糊理論的精隨！你將親手走過『定義感測器測量範圍 $\\to$ 劃分形容詞 $\\to$ 撰寫專家大腦規則 $\\to$ 觀察控制曲面』的完整歷程。",
        inputsDesc: [
          "input1 [0 ~ 10]：自訂第一個輸入物理量（例如：溫度、濕度、速度、光照）。",
          "input2 [0 ~ 10]：自訂第二個輸入物理量（例如：變化率、偏差、加速度）。"
        ],
        outputsDesc: [
          "output1 [0 ~ 100]：自訂最終控制致動器（例如：馬達轉速、閥門開度、加熱功率）。"
        ],
        rulesPhilosophy: "先用最基礎的 3 條規則起步，在 Rule Viewer 觀察測試，再逐步補充 FAM 矩陣！"
      },
      inputs: [
        {
          name: "input1",
          range: [0, 10],
          mfs: [
            { name: "low", type: "trimf", params: [0, 0, 5] },
            { name: "medium", type: "trimf", params: [2, 5, 8] },
            { name: "high", type: "trimf", params: [5, 10, 10] }
          ]
        },
        {
          name: "input2",
          range: [0, 10],
          mfs: [
            { name: "low", type: "trimf", params: [0, 0, 5] },
            { name: "medium", type: "trimf", params: [2, 5, 8] },
            { name: "high", type: "trimf", params: [5, 10, 10] }
          ]
        }
      ],
      outputs: [
        {
          name: "output1",
          range: [0, 100],
          mfs: [
            { name: "small", type: "trimf", params: [0, 0, 50] },
            { name: "medium", type: "trimf", params: [25, 50, 75] },
            { name: "large", type: "trimf", params: [50, 100, 100] }
          ]
        }
      ],
      rules: [
        {
          id: "c_r1",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 0, isNot: false }, { varIndex: 1, mfIndex: 0, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 0 }]
        },
        {
          id: "c_r2",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 1, isNot: false }, { varIndex: 1, mfIndex: 1, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 1 }]
        },
        {
          id: "c_r3",
          enabled: true,
          connection: "and",
          weight: 1.0,
          antecedents: [{ varIndex: 0, mfIndex: 2, isNot: false }, { varIndex: 1, mfIndex: 2, isNot: false }],
          consequents: [{ varIndex: 0, mfIndex: 2 }]
        }
      ]
    },

    marine_autopilot: {
      key: "marine_autopilot",
      name: "MarineAutopilot",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "🚢",
        title: "船舶自動舵航向與減搖控制系統 (Marine Autopilot Control)",
        category: "海洋輪機工程 • 船舶流體力學與強風浪自適應操舵",
        oneLineSummary: "監控航向偏差角 (-30°~+30°) 與偏航角速度 (-10~+10°/s)，即時指令舵機最佳舵角 (-35°~+35°)",
        problemStatement: "大型商船與特種軍艦航行於惡劣海況時，面臨洶湧風浪湧流的非線性擾動。傳統線性 PID 自動舵在風浪劇烈時容易造成舵機頻繁劇烈打舵（Smiting），導致液壓舵機油溫過高、燃油劇增甚至引發船體橫搖失穩。模糊控制器能像具備數十年經驗的老舵手一樣：微小風浪時保持正舵節省動力，遇到大角速度急劇偏航時果斷打大舵壓制！",
        whyFuzzy: "船舶水動力學具有強非線性、時變與時滯特性。模糊控制直接利用人類老舵手的直覺：『偏向左側且還在往左加速時，重力打右舵抑制；偏差即將歸零時提前回舵防過衝』，在 5×5 FAM 規則表下實現極致平滑的減搖與精準保向。",
        inputsDesc: [
          "heading_error ψ_e [-30° ~ +30°]：船首當前航向與預設航向之偏差角。5 個語意集合：NB (大左偏 -30°), NS (微左偏 -10°), ZO (航向正確 0°), PS (微右偏 +10°), PB (大右偏 +30°)。",
          "yaw_rate ψ_dot [-10°/s ~ +10°/s]：陀螺羅經測得的偏航角速度。5 個語意集合：NB (快速左旋), NS (慢速左旋), ZO (角速度為零), PS (慢速右旋), PB (快速右旋)。"
        ],
        outputsDesc: [
          "rudder_angle δ_c [-35° ~ +35°]：液壓舵機控制命令。5 個語意集合：NB (大左舵 -35°), NS (微左舵 -10°), ZO (正舵 0°), PS (微右舵 +10°), PB (大右舵 +35°)。"
        ],
        rulesPhilosophy: "標準對角線穩定型 5×5 FAM 規則矩陣（共 25 條規則）。當偏差與角速度同向時果斷輸出極限舵角阻尼；當兩者異號時輸出軟阻尼抑制超調，兼顧航向精度與油耗舵耗！"
      },
      inputs: [
        {
          name: "heading_error",
          range: [-30, 30],
          mfs: [
            { name: "NB", type: "trapmf", params: [-30, -30, -20, -10] },
            { name: "NS", type: "trimf", params: [-20, -10, 0] },
            { name: "ZO", type: "trimf", params: [-10, 0, 10] },
            { name: "PS", type: "trimf", params: [0, 10, 20] },
            { name: "PB", type: "trapmf", params: [10, 20, 30, 30] }
          ]
        },
        {
          name: "yaw_rate",
          range: [-10, 10],
          mfs: [
            { name: "NB", type: "trapmf", params: [-10, -10, -7, -3] },
            { name: "NS", type: "trimf", params: [-6, -3, 0] },
            { name: "ZO", type: "trimf", params: [-3, 0, 3] },
            { name: "PS", type: "trimf", params: [0, 3, 6] },
            { name: "PB", type: "trapmf", params: [3, 7, 10, 10] }
          ]
        }
      ],
      outputs: [
        {
          name: "rudder_angle",
          range: [-35, 35],
          mfs: [
            { name: "NB", type: "trapmf", params: [-35, -35, -25, -12] },
            { name: "NS", type: "trimf", params: [-20, -10, 0] },
            { name: "ZO", type: "trimf", params: [-8, 0, 8] },
            { name: "PS", type: "trimf", params: [0, 10, 20] },
            { name: "PB", type: "trapmf", params: [12, 25, 35, 35] }
          ]
        }
      ],
      rules: (function() {
        const famTable = [
          [4, 4, 3, 2, 1], // in2=NB: PB, PB, PS, ZO, NS
          [4, 3, 3, 1, 0], // in2=NS: PB, PS, PS, NS, NB
          [4, 3, 2, 1, 0], // in2=ZO: PB, PS, ZO, NS, NB
          [4, 3, 1, 1, 0], // in2=PS: PB, PS, NS, NS, NB
          [3, 2, 1, 0, 0]  // in2=PB: PS, ZO, NS, NB, NB
        ];
        const rList = [];
        for (let j = 0; j < 5; j++) {
          for (let i = 0; i < 5; i++) {
            rList.push({
              id: `marine_r${j}_${i}`,
              enabled: true,
              connection: "and",
              weight: 1.0,
              antecedents: [
                { varIndex: 0, mfIndex: i, isNot: false },
                { varIndex: 1, mfIndex: j, isNot: false }
              ],
              consequents: [
                { varIndex: 0, mfIndex: famTable[j][i] }
              ]
            });
          }
        }
        return rList;
      })()
    },

    solar_pv_cooling: {
      key: "solar_pv_cooling",
      name: "SolarPVCooling",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "☀️",
        title: "太陽光電微氣候熱力學散熱控制 (Solar PV Microclimate Cooling)",
        category: "新能源綠能科技 • 晶矽太陽能板光電轉換效率熱斑抑制",
        oneLineSummary: "監控日照輻照度 (0~1200 W/m²) 與模組溫升 (0~40°C)，智控冷卻水霧與風扇功率 (0%~100%)",
        problemStatement: "太陽能電池板在吸收光能時，超過 80% 的太陽能會轉換為熱能。矽晶片溫度每上升 1°C，光電轉換效率就會衰退約 0.4%~0.5%，高溫更會誘發熱斑效應加速封裝膠膜老化。然而，盲目全開冷卻水泵會浪費大量寄生電能與冷卻水資源。模糊散熱控制器能在高光照且高溫升時果斷觸發高效降溫，在弱光陰天時關閉散熱，實現發電增益極大化與節水節能最佳折衷！",
        whyFuzzy: "大氣微氣候（風速、濕度、雲層遮蔽）具備極強的不可預測性與熱滯後效應。透過日照強度與溫升的二元模糊決策，能建立階梯式、非線性的柔性散熱曲面，有效防止水泵頻繁啟停，保護設備壽命。",
        inputsDesc: [
          "irradiance G [0 ~ 1200 W/m²]：表面太陽輻照強度。5 語意：VL (晨昏弱光), L (陰天散光), M (標準日照), H (強烈晴天), VH (酷暑頂峰)。",
          "temp_rise ΔT [0 ~ 40°C]：模組表面溫度超出環境基準之溫升。5 語意：VL (正常 <5°C), L (微升 ~12°C), M (溫熱 ~22°C), H (高溫警示 ~32°C), VH (臨界危險 >36°C)。"
        ],
        outputsDesc: [
          "cooling_power P_cool [0% ~ 100%]：變頻散熱風扇與壓電冷卻水霧閥門功率。5 語意：OFF (關閉 0%), LOW (微風 25%), MED (中等 50%), HIGH (強力 75%), MAX (全開 100%)。"
        ],
        rulesPhilosophy: "光強且溫高 ⇒ 全力冷卻 (MAX)；光弱且溫低 ⇒ 完全關閉 (OFF)；高溫但弱光 ⇒ 溫和散熱 (MED)。25 條 FAM 規則全覆蓋！"
      },
      inputs: [
        {
          name: "irradiance",
          range: [0, 1200],
          mfs: [
            { name: "VL", type: "trapmf", params: [0, 0, 150, 300] },
            { name: "L", type: "trimf", params: [150, 350, 550] },
            { name: "M", type: "trimf", params: [400, 650, 850] },
            { name: "H", type: "trimf", params: [700, 900, 1050] },
            { name: "VH", type: "trapmf", params: [900, 1050, 1200, 1200] }
          ]
        },
        {
          name: "temp_rise",
          range: [0, 40],
          mfs: [
            { name: "VL", type: "trapmf", params: [0, 0, 5, 10] },
            { name: "L", type: "trimf", params: [5, 12, 20] },
            { name: "M", type: "trimf", params: [15, 22, 30] },
            { name: "H", type: "trimf", params: [25, 32, 38] },
            { name: "VH", type: "trapmf", params: [32, 36, 40, 40] }
          ]
        }
      ],
      outputs: [
        {
          name: "cooling_power",
          range: [0, 100],
          mfs: [
            { name: "OFF", type: "trapmf", params: [0, 0, 5, 15] },
            { name: "LOW", type: "trimf", params: [10, 25, 45] },
            { name: "MED", type: "trimf", params: [35, 50, 65] },
            { name: "HIGH", type: "trimf", params: [55, 75, 90] },
            { name: "MAX", type: "trapmf", params: [80, 92, 100, 100] }
          ]
        }
      ],
      rules: (function() {
        const famTable = [
          [0, 0, 0, 1, 2], // in2=VL: OFF, OFF, OFF, LOW, MED
          [0, 0, 1, 2, 3], // in2=L:  OFF, OFF, LOW, MED, HIGH
          [0, 1, 2, 3, 3], // in2=M:  OFF, LOW, MED, HIGH, HIGH
          [1, 2, 3, 3, 4], // in2=H:  LOW, MED, HIGH, HIGH, MAX
          [2, 3, 3, 4, 4]  // in2=VH: MED, HIGH, HIGH, MAX, MAX
        ];
        const rList = [];
        for (let j = 0; j < 5; j++) {
          for (let i = 0; i < 5; i++) {
            rList.push({
              id: `pv_r${j}_${i}`,
              enabled: true,
              connection: "and",
              weight: 1.0,
              antecedents: [
                { varIndex: 0, mfIndex: i, isNot: false },
                { varIndex: 1, mfIndex: j, isNot: false }
              ],
              consequents: [
                { varIndex: 0, mfIndex: famTable[j][i] }
              ]
            });
          }
        }
        return rList;
      })()
    },

    bess_dispatch: {
      key: "bess_dispatch",
      name: "BESSMicrogridDispatch",
      type: "mamdani",
      andMethod: "min",
      orMethod: "max",
      impMethod: "min",
      aggMethod: "max",
      defuzzMethod: "centroid",
      story: {
        icon: "🔋",
        title: "電池儲能微電網充放電調度系統 (BESS Microgrid Dispatch)",
        category: "智慧電網工程 • 鋰電池儲能壽命管理與微電網負載平抑",
        oneLineSummary: "即時評估電池荷電狀態 SOC (0~100%) 與電網負載偏差 (-50~+50 kW)，精準調度充放電功率 (-100%~+100%)",
        problemStatement: "微電網包含間歇性再生能源（風力、太陽能）與隨機變動負載，電網淨負載偏差 ΔP 波動劇烈。電池儲能系統 (BESS) 必須快速充放電以穩定頻率與電壓。然而鋰電池有其化學物理極限：過度充放電（SOC 過低或過高）會引發不可逆鋰枝晶沉積與壽命急劇縮短。模糊調度器能在電網缺電時及時放電支援，但又會在電池電量逼近危險邊界時柔性退避、自我保護！",
        whyFuzzy: "電網調度涉及多元衝突目標（電網頻率穩定度 vs. 電池循環健康度 SOH）。透過模糊多準則折衷推理，能平滑協調儲能系統在不同 SOC 水位下的響應靈敏度，比生硬的兩值遲滯切換更能延長數倍電池壽命。",
        inputsDesc: [
          "soc [0% ~ 100%]：電池組即時荷電狀態。5 語意：VLow (過放危險 <20%), Low (偏低 32%), Med (黃金儲備 50%), High (充沛 70%), Full (飽和危險 >85%)。",
          "power_deviation ΔP [-50 kW ~ +50 kW]：微電網母線功率偏差（負值代表發電過剩需吸收充電，正值代表尖峰缺電需放電）。5 語意：NB (嚴重過剩), NS (微幅過剩), ZO (功率平衡), PS (輕度缺電), PB (嚴重缺電)。"
        ],
        outputsDesc: [
          "p_cmd [-100% ~ +100%]：雙向變流器 (PCS) 充放電命令（負值為吸收充電 Charge，正值為釋放功率放電 Discharge）。5 語意：FastCharge (快充 -100%), SlowCharge (緩充 -35%), Idle (待機 0%), SlowDischarge (緩放 +35%), FastDischarge (滿載放電 +100%)。"
        ],
        rulesPhilosophy: "SOC 瀕臨枯竭時絕對禁止放電、強制快速充電；SOC 飽和時絕對禁止充電、放手放電；SOC 居中時完全按負載偏差全力補償！25 條 FAM 規則全覆蓋！"
      },
      inputs: [
        {
          name: "soc",
          range: [0, 100],
          mfs: [
            { name: "VLow", type: "trapmf", params: [0, 0, 15, 25] },
            { name: "Low", type: "trimf", params: [18, 32, 45] },
            { name: "Med", type: "trimf", params: [38, 50, 65] },
            { name: "High", type: "trimf", params: [58, 70, 85] },
            { name: "Full", type: "trapmf", params: [75, 88, 100, 100] }
          ]
        },
        {
          name: "power_deviation",
          range: [-50, 50],
          mfs: [
            { name: "NB", type: "trapmf", params: [-50, -50, -35, -20] },
            { name: "NS", type: "trimf", params: [-30, -15, 0] },
            { name: "ZO", type: "trimf", params: [-10, 0, 10] },
            { name: "PS", type: "trimf", params: [0, 15, 30] },
            { name: "PB", type: "trapmf", params: [20, 35, 50, 50] }
          ]
        }
      ],
      outputs: [
        {
          name: "p_cmd",
          range: [-100, 100],
          mfs: [
            { name: "FastCharge", type: "trapmf", params: [-100, -100, -75, -50] },
            { name: "SlowCharge", type: "trimf", params: [-60, -35, 0] },
            { name: "Idle", type: "trimf", params: [-20, 0, 20] },
            { name: "SlowDischarge", type: "trimf", params: [0, 35, 60] },
            { name: "FastDischarge", type: "trapmf", params: [50, 75, 100, 100] }
          ]
        }
      ],
      rules: (function() {
        const famTable = [
          [0, 0, 1, 2, 2], // in1=VLow: FastCharge, FastCharge, SlowCharge, Idle, Idle
          [0, 1, 1, 2, 3], // in1=Low:  FastCharge, SlowCharge, SlowCharge, Idle, SlowDischarge
          [0, 1, 2, 3, 4], // in1=Med:  FastCharge, SlowCharge, Idle, SlowDischarge, FastDischarge
          [1, 2, 3, 4, 4], // in1=High: SlowCharge, Idle, SlowDischarge, FastDischarge, FastDischarge
          [2, 2, 3, 4, 4]  // in1=Full: Idle, Idle, SlowDischarge, FastDischarge, FastDischarge
        ];
        const rList = [];
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            rList.push({
              id: `bess_r${i}_${j}`,
              enabled: true,
              connection: "and",
              weight: 1.0,
              antecedents: [
                { varIndex: 0, mfIndex: i, isNot: false },
                { varIndex: 1, mfIndex: j, isNot: false }
              ],
              consequents: [
                { varIndex: 0, mfIndex: famTable[i][j] }
              ]
            });
          }
        }
        return rList;
      })()
    }
  };

  // 當前系統狀態（深拷貝預設 tipping 系統）
  let currentFIS = JSON.parse(JSON.stringify(PRESET_SYSTEMS.tipping));

  // =========================================================================
  // 數學工具函式庫 (MF 評估、推論運算子、解模糊化)
  // =========================================================================

  function evalTrimf(x, a, b, c) {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return (b === a) ? 1 : (x - a) / (b - a);
    return (c === b) ? 1 : (c - x) / (c - b);
  }

  function evalTrapmf(x, a, b, c, d) {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x < b) return (b === a) ? 1 : (x - a) / (b - a);
    return (d === c) ? 1 : (d - x) / (d - c);
  }

  function evalGaussmf(x, sigma, c) {
    if (sigma <= 0) sigma = 0.0001;
    const diff = x - c;
    return Math.exp(-0.5 * (diff * diff) / (sigma * sigma));
  }

  function evalGbellmf(x, a, b, c) {
    if (a <= 0) a = 0.0001;
    const tmp = Math.pow(Math.abs((x - c) / a), 2 * b);
    return 1 / (1 + tmp);
  }

  function evalMF(type, params, x) {
    switch (type) {
      case 'trimf':
        return evalTrimf(x, params[0], params[1], params[2]);
      case 'trapmf':
        return evalTrapmf(x, params[0], params[1], params[2], params[3]);
      case 'gaussmf':
        return evalGaussmf(x, params[0], params[1]);
      case 'gbellmf':
        return evalGbellmf(x, params[0], params[1], params[2]);
      case 'constant': // Sugeno
        return params[0] || 0;
      default:
        return 0;
    }
  }

  // 取得歸屬函數預設參數
  function getDefaultParams(type, range) {
    const min = range[0];
    const max = range[1];
    const span = max - min;
    switch (type) {
      case 'trimf':
        return [min + span * 0.2, min + span * 0.5, min + span * 0.8];
      case 'trapmf':
        return [min + span * 0.1, min + span * 0.3, min + span * 0.7, min + span * 0.9];
      case 'gaussmf':
        return [span * 0.15, min + span * 0.5];
      case 'gbellmf':
        return [span * 0.2, 2.5, min + span * 0.5];
      case 'constant':
        return [min + span * 0.5];
      default:
        return [min, min + span * 0.5, max];
    }
  }

  // 推論引擎：輸入一組輸入值物件 (key: varIndex -> value)
  function inferFIS(inputValues, outputIdx = 0) {
    const fis = currentFIS;
    const outVar = fis.outputs[outputIdx] || fis.outputs[0];
    if (!outVar) return null;

    const outRange = outVar.range;
    const nPoints = 121;
    const dy = (outRange[1] - outRange[0]) / (nPoints - 1);
    const yDomain = [];
    for (let i = 0; i < nPoints; i++) {
      yDomain.push(outRange[0] + i * dy);
    }

    const ruleDetails = [];
    let aggEnvelope = new Array(nPoints).fill(0);

    // Sugeno 模式加權變數
    let sugenoNum = 0;
    let sugenoDen = 0;

    fis.rules.forEach((rule, rIdx) => {
      if (!rule.enabled) {
        ruleDetails.push({
          ruleIndex: rIdx,
          firingStrength: 0,
          consequentY: new Array(nPoints).fill(0),
          enabled: false
        });
        return;
      }

      // 1. 計算該規則的前件部歸屬度
      const muList = [];
      rule.antecedents.forEach(ante => {
        if (ante.mfIndex < 0) return; // 無限制
        const inVar = fis.inputs[ante.varIndex];
        if (!inVar) return;
        const xVal = (inputValues[ante.varIndex] !== undefined)
          ? inputValues[ante.varIndex]
          : ((inVar.range[0] + inVar.range[1]) / 2);
        const mf = inVar.mfs[ante.mfIndex];
        if (!mf) return;

        let mu = evalMF(mf.type, mf.params, xVal);
        if (ante.isNot) mu = 1 - mu;
        muList.push(mu);
      });

      // 2. 前件部連接算子 (AND / OR)
      let w = 1.0;
      if (muList.length === 0) {
        w = 1.0;
      } else if (rule.connection === 'or') {
        if (fis.orMethod === 'max') {
          w = Math.max(...muList);
        } else { // probor
          w = muList.reduce((acc, v) => acc + v - acc * v, 0);
        }
      } else { // and
        if (fis.andMethod === 'min') {
          w = Math.min(...muList);
        } else { // prod
          w = muList.reduce((acc, v) => acc * v, 1);
        }
      }

      w = w * (rule.weight !== undefined ? rule.weight : 1.0);
      w = Math.max(0, Math.min(1, w));

      // 3. 後件部計算
      const cons = rule.consequents.find(c => c.varIndex === outputIdx) || rule.consequents[0];
      const consY = new Array(nPoints).fill(0);

      if (fis.type === 'sugeno') {
        const outMF = outVar.mfs[cons.mfIndex];
        let zVal = 0;
        if (outMF) {
          if (outMF.type === 'constant') {
            zVal = outMF.params[0] || 0;
          } else {
            zVal = outMF.params[0] || 0;
            fis.inputs.forEach((inV, iIdx) => {
              const xVal = inputValues[iIdx] || ((inV.range[0] + inV.range[1]) / 2);
              const p = outMF.params[iIdx + 1] || 0;
              zVal += p * xVal;
            });
          }
        }
        sugenoNum += w * zVal;
        sugenoDen += w;

        ruleDetails.push({
          ruleIndex: rIdx,
          firingStrength: w,
          consequentY: consY,
          sugenoZ: zVal,
          enabled: true
        });
      } else {
        const outMF = outVar.mfs[cons ? cons.mfIndex : 0];
        if (outMF) {
          for (let i = 0; i < nPoints; i++) {
            const y = yDomain[i];
            const baseMu = evalMF(outMF.type, outMF.params, y);
            const cutMu = (fis.impMethod === 'prod') ? (w * baseMu) : Math.min(w, baseMu);
            consY[i] = cutMu;

            if (fis.aggMethod === 'sum') {
              aggEnvelope[i] = Math.min(1, aggEnvelope[i] + cutMu);
            } else {
              aggEnvelope[i] = Math.max(aggEnvelope[i], cutMu);
            }
          }
        }

        ruleDetails.push({
          ruleIndex: rIdx,
          firingStrength: w,
          consequentY: consY,
          enabled: true
        });
      }
    });

    // 4. 解模糊化 (Defuzzification)
    let defuzzValue = (outRange[0] + outRange[1]) / 2;

    if (fis.type === 'sugeno') {
      if (fis.defuzzMethod === 'wtsum') {
        defuzzValue = sugenoNum;
      } else {
        defuzzValue = sugenoDen > 0 ? (sugenoNum / sugenoDen) : defuzzValue;
      }
    } else {
      const sumMu = aggEnvelope.reduce((a, b) => a + b, 0);

      if (sumMu > 0.000001) {
        if (fis.defuzzMethod === 'centroid') { // COG
          let num = 0;
          for (let i = 0; i < nPoints; i++) num += yDomain[i] * aggEnvelope[i];
          defuzzValue = num / sumMu;
        } else if (fis.defuzzMethod === 'bisector') {
          const halfArea = sumMu / 2;
          let accum = 0;
          for (let i = 0; i < nPoints; i++) {
            accum += aggEnvelope[i];
            if (accum >= halfArea) {
              defuzzValue = yDomain[i];
              break;
            }
          }
        } else if (fis.defuzzMethod === 'mom') {
          const maxMu = Math.max(...aggEnvelope);
          const maxPoints = [];
          for (let i = 0; i < nPoints; i++) {
            if (Math.abs(aggEnvelope[i] - maxMu) < 0.0001) maxPoints.push(yDomain[i]);
          }
          if (maxPoints.length) defuzzValue = maxPoints.reduce((a, b) => a + b, 0) / maxPoints.length;
        } else if (fis.defuzzMethod === 'som') {
          const maxMu = Math.max(...aggEnvelope);
          for (let i = 0; i < nPoints; i++) {
            if (Math.abs(aggEnvelope[i] - maxMu) < 0.0001) {
              defuzzValue = yDomain[i];
              break;
            }
          }
        } else if (fis.defuzzMethod === 'lom') {
          const maxMu = Math.max(...aggEnvelope);
          for (let i = nPoints - 1; i >= 0; i--) {
            if (Math.abs(aggEnvelope[i] - maxMu) < 0.0001) {
              defuzzValue = yDomain[i];
              break;
            }
          }
        }
      }
    }

    return {
      outputVariable: outVar,
      yDomain: yDomain,
      aggEnvelope: aggEnvelope,
      ruleDetails: ruleDetails,
      defuzzValue: defuzzValue
    };
  }

  // =========================================================================
  // 初始化與引導狀態管理
  // =========================================================================

  function init() {
    initViewerInputs();
    renderAll();
  }

  function initViewerInputs() {
    viewerInputs = {};
    currentFIS.inputs.forEach((inp, idx) => {
      viewerInputs[idx] = (inp.range[0] + inp.range[1]) / 2;
    });
  }

  function loadPreset(presetKey) {
    if (!PRESET_SYSTEMS[presetKey]) return;
    currentPresetKey = presetKey;
    currentFIS = JSON.parse(JSON.stringify(PRESET_SYSTEMS[presetKey]));
    selectedVar = { type: 'input', index: 0, mfIndex: 0 };
    initViewerInputs();
    renderAll();
  }

  function toggleGuidedMode(enable) {
    isGuidedMode = enable;
    renderAll();
  }

  function setGuidedStep(stepNum) {
    currentGuideStep = stepNum;
    // 步驟與子分頁映射
    const stepTabMap = {
      1: 'properties',
      2: 'mf',
      3: 'mf',
      4: 'rules',
      5: 'viewer'
    };
    switchSubTab(stepTabMap[stepNum] || 'viewer');
  }

  function nextStep() {
    if (currentGuideStep < 5) {
      setGuidedStep(currentGuideStep + 1);
    }
  }

  function prevStep() {
    if (currentGuideStep > 1) {
      setGuidedStep(currentGuideStep - 1);
    }
  }

  function toggleStoryDrawer() {
    isStoryExpanded = !isStoryExpanded;
    renderPresetStoryCard();
  }

  function toggleType2Mode(enable) {
    if (enable !== undefined) {
      isType2Enabled = enable;
    } else {
      isType2Enabled = !isType2Enabled;
    }
    renderMFEditor();
    if (activeSubTab === 'viewer') {
      renderRuleViewer();
    }
  }

  function setType2FOUWidth(w) {
    type2FOUWidth = Math.max(0.05, Math.min(0.4, w));
    renderMFPlot();
  }

  function switchSubTab(tabName) {
    activeSubTab = tabName;
    const tabs = ['properties', 'mf', 'rules', 'viewer', 'surface'];
    tabs.forEach(t => {
      const btn = document.getElementById(`fis-tab-btn-${t}`);
      const panel = document.getElementById(`fis-panel-${t}`);
      if (btn && panel) {
        if (t === tabName) {
          btn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25';
          panel.classList.remove('hidden');
        } else {
          btn.className = 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800';
          panel.classList.add('hidden');
        }
      }
    });

    // 同步更新當前引導步驟按鈕樣式
    renderGuidedStepper();

    setTimeout(() => {
      if (tabName === 'mf') {
        renderMFPlot();
      } else if (tabName === 'viewer') {
        renderRuleViewerPlots();
      } else if (tabName === 'surface') {
        renderSurfacePlot();
      }
    }, 60);
  }

  function renderAll() {
    renderSystemHeader();
    renderPresetStoryCard();
    renderGuidedStepper();
    renderPropertiesPanel();
    renderMFEditor();
    renderRuleEditor();
    renderRuleViewer();
    renderExportCode();
    switchSubTab(activeSubTab);
  }

  // =========================================================================
  // 頂部教學故事卡片：徹底解開「載入範本會怎樣？不載入會怎樣？」的疑惑
  // =========================================================================

  function renderPresetStoryCard() {
    const container = document.getElementById('fis-story-banner-container');
    if (!container) return;

    const preset = PRESET_SYSTEMS[currentPresetKey] || PRESET_SYSTEMS.tipping;
    const story = preset.story;

    container.innerHTML = `
      <div class="glass-panel rounded-3xl p-6 sm:p-7 border border-amber-500/40 bg-gradient-to-r from-slate-900/95 via-indigo-950/30 to-slate-900/95 space-y-4 shadow-xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <span class="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/35 shrink-0">
              ${story.icon}
            </span>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  ${story.category}
                </span>
                <span class="text-xs text-slate-400">當前範本：<strong class="text-white">${preset.name}</strong></span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-white mt-1">${story.title}</h3>
              <p class="text-sm text-slate-300 mt-0.5">${story.oneLineSummary}</p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 shrink-0">
            <button onclick="WebFISStudio.toggleStoryDrawer()"
              class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${isStoryExpanded ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 hover:text-white'}">
              <span>${isStoryExpanded ? '收合情境解說 ▲' : '展開情境故事與原理 ▼'}</span>
            </button>
          </div>
        </div>

        ${isStoryExpanded ? `
          <div class="pt-4 border-t border-slate-800/80 space-y-4 text-sm text-slate-200">
            <!-- 核心問題對比框：載入 vs 不載入 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="refined-card p-4 border-l-4 border-l-emerald-400 bg-slate-950/70 space-y-1.5">
                <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💡 點選載入經典範本會怎樣？</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  系統會<strong>自動填入控制工程師驗證過的一整套完整參數</strong>（變數論域、歸屬函數造型與規則庫）。初學者可以<strong>直接在步驟 5 拉動滑桿觀察動態推論與 3D 曲面</strong>，觀摩成熟控制器是如何運作的，不必一開始面對空白畫布抓瞎！
                </p>
              </div>

              <div class="refined-card p-4 border-l-4 border-l-sky-400 bg-slate-950/70 space-y-1.5">
                <div class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💡 點選「從零自訂空白專案」會怎樣？</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  系統會為你<strong>開啟一張空白畫布</strong>，由你親自扮演工程師：定義你想控制的物理問題（例如：溫室澆花、烤箱控溫）、親手劃分論域與語意形容詞、寫下你的第一條 IF-THEN 規則，真正體驗自主建模的成就感！
                </p>
              </div>
            </div>

            <!-- 本範例背景與為什麼需要 Fuzzy -->
            <div class="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
              <div>
                <strong class="text-amber-300 flex items-center gap-1.5 mb-1">
                  <span>📖</span> 案例工程情境：
                </strong>
                <p class="text-slate-300 leading-relaxed">${story.problemStatement}</p>
              </div>
              <div class="pt-2 border-t border-slate-800/80">
                <strong class="text-sky-300 flex items-center gap-1.5 mb-1">
                  <span>🧠</span> 為什麼傳統二值邏輯做不到，一定要用 Fuzzy？
                </strong>
                <p class="text-slate-300 leading-relaxed">${story.whyFuzzy}</p>
              </div>
            </div>

            <!-- 變數與規則結構導讀 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-sky-400 font-bold block mb-1">📥 輸入變數設計</span>
                <ul class="list-disc list-inside space-y-1 text-slate-300">
                  ${story.inputsDesc.map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>
              <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-emerald-400 font-bold block mb-1">📤 輸出致動控制量</span>
                <ul class="list-disc list-inside space-y-1 text-slate-300">
                  ${story.outputsDesc.map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>
              <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-indigo-400 font-bold block mb-1">📜 專家規則核心靈魂</span>
                <p class="text-slate-300 leading-relaxed">${story.rulesPhilosophy}</p>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // =========================================================================
  // 5 大步驟闖關步進器 (Step-by-Step Guided Stepper)
  // =========================================================================

  function renderGuidedStepper() {
    const container = document.getElementById('fis-guided-stepper-container');
    if (!container) return;

    const steps = [
      { num: 1, title: "步驟 1：確立架構與目標", subtitle: "Mamdani vs Sugeno 模式選擇", tab: "properties" },
      { num: 2, title: "步驟 2：劃分變數與論域", subtitle: "感測器測量邊界 [min, max]", tab: "mf", varSub: "var" },
      { num: 3, title: "步驟 3：雕塑語意歸屬函數", subtitle: "三角形/梯形/高斯曲線量化", tab: "mf", varSub: "mf" },
      { num: 4, title: "步驟 4：建立專家經驗規則", subtitle: "IF-THEN 組裝與 FAM 矩陣", tab: "rules" },
      { num: 5, title: "步驟 5：動態推論與 3D 曲面", subtitle: "Rule Viewer 測試與代碼匯出", tab: "viewer" }
    ];

    container.innerHTML = `
      <div class="glass-panel rounded-2xl p-4 sm:p-5 border border-sky-500/30 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">🧭</span>
            <span class="text-xs font-bold uppercase tracking-wider text-sky-400">新手設計引導步進器 (Design Stepper)</span>
            <span class="text-xs text-slate-400">跟隨 5 大標準步驟完成控制器建模</span>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="WebFISStudio.prevStep()" ${currentGuideStep === 1 ? 'disabled' : ''}
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentGuideStep === 1 ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}">
              ❮ 上一步
            </button>
            <span class="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              第 ${currentGuideStep} / 5 步
            </span>
            <button onclick="WebFISStudio.nextStep()" ${currentGuideStep === 5 ? 'disabled' : ''}
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentGuideStep === 5 ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold shadow-sm'}">
              下一步 ❯
            </button>
          </div>
        </div>

        <!-- 步進節點膠囊列 -->
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          ${steps.map(st => {
            const isActive = currentGuideStep === st.num;
            const isDone = currentGuideStep > st.num;
            return `
              <button onclick="WebFISStudio.setGuidedStep(${st.num})"
                class="p-2.5 rounded-xl text-left transition flex items-center gap-2.5 ${isActive ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-md shadow-sky-500/20' : (isDone ? 'bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-slate-800')}">
                <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${isActive ? 'bg-white text-slate-950' : (isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')}">
                  ${isDone ? '✓' : st.num}
                </span>
                <div class="min-w-0">
                  <div class="text-xs truncate ${isActive ? 'text-white font-bold' : ''}">${st.title.split('：')[1]}</div>
                  <div class="text-[10px] text-slate-400 truncate">${st.subtitle}</div>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 1. 系統 Header 與 FIS Properties 工作區
  // =========================================================================

  function renderSystemHeader() {
    const titleEl = document.getElementById('fis-system-title');
    if (titleEl) titleEl.textContent = currentFIS.name;
    const badgeEl = document.getElementById('fis-system-badge');
    if (badgeEl) {
      badgeEl.textContent = `${currentFIS.type.toUpperCase()} • ${currentFIS.inputs.length} Inputs • ${currentFIS.outputs.length} Outputs • ${currentFIS.rules.length} Rules`;
    }
  }

  function renderPropertiesPanel() {
    const fis = currentFIS;
    const container = document.getElementById('fis-properties-content');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- 步驟 1 老師引導小學堂 -->
        <div class="refined-card p-5 border-l-4 border-l-amber-400 bg-amber-500/10 space-y-2">
          <div class="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>📘 步驟 1 老師小學堂：為什麼要決定推論架構？</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">
            模糊系統就像人類專家大腦。在開始拉滑桿之前，你必須先回答兩個最根本的工程問題：<br/>
            <strong>1. Mamdani 模式（適合直觀幾何）</strong>：規則的後件部也是三角形或梯形圖形，推論時透過幾何「截頂削平」後取重心，最直覺、最容易向非工程師客戶解釋。<br/>
            <strong>2. Sugeno (TSK) 模式（適合快速運算）</strong>：後件部直接輸出常數或線性方程，推論時直接做加權平均（不需要做複雜的幾何積分），計算速度快幾十倍，最適合燒錄到車載晶片或微控制器 (MCU)！
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- 左側：推論引擎各項運算子配置表單 -->
          <div class="lg:col-span-6 space-y-6">
            <div class="refined-card p-6 border-sky-500/30 space-y-5">
              <h3 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>⚙️</span> FIS 推論引擎運算子配置 (FIS Architecture & Operators)
              </h3>

              <!-- 系統名稱 -->
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">系統專案名稱 (System Name)</label>
                <input type="text" id="prop-sys-name" value="${fis.name}" onchange="WebFISStudio.updateSystemProp('name', this.value)"
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-sky-400 focus:outline-none" />
              </div>

              <!-- 推論模式 Mamdani vs Sugeno -->
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">推論模式 (Inference Type)</label>
                <div class="grid grid-cols-2 gap-3">
                  <button onclick="WebFISStudio.updateSystemProp('type', 'mamdani')"
                    class="p-3 rounded-xl border text-sm font-bold transition flex items-center justify-center gap-2 ${fis.type === 'mamdani' ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
                    <span>🏛️</span> Mamdani
                  </button>
                  <button onclick="WebFISStudio.updateSystemProp('type', 'sugeno')"
                    class="p-3 rounded-xl border text-sm font-bold transition flex items-center justify-center gap-2 ${fis.type === 'sugeno' ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
                    <span>⚡</span> Sugeno (TSK)
                  </button>
                </div>
              </div>

              <!-- 算子設定群組 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-300">AND 方法 (AndMethod)</label>
                  <select onchange="WebFISStudio.updateSystemProp('andMethod', this.value)"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-sky-300 focus:border-sky-400">
                    <option value="min" ${fis.andMethod === 'min' ? 'selected' : ''}>min (取小 - 常用標準)</option>
                    <option value="prod" ${fis.andMethod === 'prod' ? 'selected' : ''}>prod (代數積)</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-300">OR 方法 (OrMethod)</label>
                  <select onchange="WebFISStudio.updateSystemProp('orMethod', this.value)"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-sky-300 focus:border-sky-400">
                    <option value="max" ${fis.orMethod === 'max' ? 'selected' : ''}>max (取大 - 常用標準)</option>
                    <option value="probor" ${fis.orMethod === 'probor' ? 'selected' : ''}>probor (代數和)</option>
                  </select>
                </div>

                <div class="space-y-1.5 ${fis.type === 'sugeno' ? 'opacity-50' : ''}">
                  <label class="text-xs font-semibold text-slate-300">蘊含方法 (Implication)</label>
                  <select ${fis.type === 'sugeno' ? 'disabled' : ''} onchange="WebFISStudio.updateSystemProp('impMethod', this.value)"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-indigo-300 focus:border-indigo-400">
                    <option value="min" ${fis.impMethod === 'min' ? 'selected' : ''}>min (截頂削平 - 最常見)</option>
                    <option value="prod" ${fis.impMethod === 'prod' ? 'selected' : ''}>prod (尺度縮放)</option>
                  </select>
                </div>

                <div class="space-y-1.5 ${fis.type === 'sugeno' ? 'opacity-50' : ''}">
                  <label class="text-xs font-semibold text-slate-300">聚合方法 (Aggregation)</label>
                  <select ${fis.type === 'sugeno' ? 'disabled' : ''} onchange="WebFISStudio.updateSystemProp('aggMethod', this.value)"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-indigo-300 focus:border-indigo-400">
                    <option value="max" ${fis.aggMethod === 'max' ? 'selected' : ''}>max (極大聚合 - 輪廓包絡)</option>
                    <option value="sum" ${fis.aggMethod === 'sum' ? 'selected' : ''}>sum (邊界求和)</option>
                  </select>
                </div>

                <div class="sm:col-span-2 space-y-1.5">
                  <label class="text-xs font-semibold text-slate-300">解模糊化方法 (Defuzzification)</label>
                  <select onchange="WebFISStudio.updateSystemProp('defuzzMethod', this.value)"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-emerald-300 focus:border-emerald-400">
                    ${fis.type === 'sugeno' ? `
                      <option value="wtaver" ${fis.defuzzMethod === 'wtaver' ? 'selected' : ''}>wtaver (加權平均 Weighted Average - 預設推薦)</option>
                      <option value="wtsum" ${fis.defuzzMethod === 'wtsum' ? 'selected' : ''}>wtsum (加權和 Weighted Sum)</option>
                    ` : `
                      <option value="centroid" ${fis.defuzzMethod === 'centroid' ? 'selected' : ''}>centroid (重心法 COG - 預設最平滑不突變)</option>
                      <option value="bisector" ${fis.defuzzMethod === 'bisector' ? 'selected' : ''}>bisector (面積平分線)</option>
                      <option value="mom" ${fis.defuzzMethod === 'mom' ? 'selected' : ''}>mom (最大平均法 Mean of Maxima)</option>
                      <option value="som" ${fis.defuzzMethod === 'som' ? 'selected' : ''}>som (最小最大值 Smallest of Maxima)</option>
                      <option value="lom" ${fis.defuzzMethod === 'lom' ? 'selected' : ''}>lom (最大最大值 Largest of Maxima)</option>
                    `}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 右側：FIS 系統拓撲架構圖視覺化卡片 -->
          <div class="lg:col-span-6 space-y-6">
            <div class="refined-card p-6 border-indigo-500/30 space-y-5">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <span>🌐</span> 系統拓撲與變數流向架構圖 (System Diagram)
                </h3>
                <span class="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  ${fis.inputs.length} in ➔ 1 rules ➔ ${fis.outputs.length} out
                </span>
              </div>

              <!-- 視覺化拓撲連線 -->
              <div class="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <!-- 輸入變數欄 -->
                  <div class="space-y-3 w-full sm:w-1/3">
                    <div class="text-xs font-bold text-sky-400 uppercase tracking-wider text-center">輸入變數 (Inputs)</div>
                    ${fis.inputs.map((inp, idx) => `
                      <div class="p-3 rounded-xl bg-slate-900 border border-sky-500/40 text-center space-y-1">
                        <div class="text-sm font-bold text-white">${inp.name}</div>
                        <div class="text-[11px] text-sky-300 font-mono">[${inp.range[0]}, ${inp.range[1]}]</div>
                        <div class="text-[10px] text-slate-400">${inp.mfs.length} 個歸屬函數</div>
                      </div>
                    `).join('')}
                  </div>

                  <!-- 核心推論引擎中心方塊 -->
                  <div class="w-full sm:w-1/3 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-indigo-900/40 to-slate-900 border border-indigo-500/50 text-center shadow-lg">
                    <span class="text-3xl mb-1">🧠</span>
                    <div class="text-base font-extrabold text-white">${fis.name}</div>
                    <div class="text-xs font-bold text-indigo-300 uppercase tracking-widest mt-0.5">(${fis.type})</div>
                    <div class="text-xs text-slate-400 mt-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                      ${fis.rules.length} 條啟用規則
                    </div>
                  </div>

                  <!-- 輸出變數欄 -->
                  <div class="space-y-3 w-full sm:w-1/3">
                    <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider text-center">輸出變數 (Outputs)</div>
                    ${fis.outputs.map((out, idx) => `
                      <div class="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-center space-y-1">
                        <div class="text-sm font-bold text-white">${out.name}</div>
                        <div class="text-[11px] text-emerald-300 font-mono">[${out.range[0]}, ${out.range[1]}]</div>
                        <div class="text-[10px] text-slate-400">${out.mfs.length} 個輸出集合</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- 快速下一步引導 -->
              <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>已確認架構？點擊右側按鈕前進至第 2 步設定感測器物理論域：</span>
                <button onclick="WebFISStudio.setGuidedStep(2)" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-md">
                  <span>下一步：定義變數與物理論域 (Step 2) ➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updateSystemProp(propName, value) {
    if (propName === 'type') {
      currentFIS.type = value;
      if (value === 'sugeno') {
        currentFIS.defuzzMethod = 'wtaver';
        currentFIS.outputs.forEach(out => {
          out.mfs.forEach((mf, i) => {
            if (mf.type !== 'constant') {
              const mid = (out.range[0] + out.range[1]) / 2;
              mf.type = 'constant';
              mf.params = [mid + (i - 1) * ((out.range[1] - out.range[0]) / 4)];
            }
          });
        });
      } else {
        currentFIS.defuzzMethod = 'centroid';
      }
    } else {
      currentFIS[propName] = value;
    }
    renderAll();
  }

  // =========================================================================
  // 2. 歸屬函數編輯器 (MF Editor) 工作區
  // =========================================================================

  function renderMFEditor() {
    const fis = currentFIS;
    const container = document.getElementById('fis-mf-content');
    if (!container) return;

    const isInput = selectedVar.type === 'input';
    const varList = isInput ? fis.inputs : fis.outputs;
    const curVar = varList[selectedVar.index] || varList[0];
    if (!curVar) return;

    const curMF = curVar.mfs[selectedVar.mfIndex] || curVar.mfs[0];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- 步驟 2/3 老師引導小學堂 -->
        <div class="refined-card p-5 border-l-4 border-l-sky-400 bg-sky-500/10 space-y-2">
          <div class="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>📘 步驟 2 & 3 老師小學堂：什麼是論域與歸屬函數？</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong>1. 論域範圍 [min, max]（物理邊界）</strong>：代表感測器所能測量的最低到最高數值（例如溫度 -5°C 到 5°C）。不能設太窄以免感測器爆表，也不能太寬以免解析度不足。<br/>
            <strong>2. 歸屬函數造型（人類語言的量化）</strong>：
            ・<strong>⬡ 梯形 (trapmf)</strong>：兩側端點平頂飽和，代表「絕對毫無疑問」的狀態（如溫度 > 30°C 一律算酷熱）。<br/>
            ・<strong>🔺 三角形 (trimf)</strong>：只有一個最完美的中心頂點，往兩旁線性衰減（如 24°C 最舒適）。<br/>
            ・<strong>🔔 高斯 (gaussmf)</strong>：鐘型平滑曲線，能給出最自然柔順、不劇烈抖動的控制訊號！
          </p>
        </div>

        <!-- 上方：Plotly 即時曲線畫布 -->
        <div class="glass-panel rounded-3xl p-6 border border-sky-500/30 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${isInput ? '📥' : '📤'}</span>
              <div>
                <h3 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>${curVar.name}</span>
                  <span class="text-xs px-2.5 py-0.5 rounded-full ${isInput ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'} font-mono">
                    ${isInput ? '輸入變數 (Input)' : '輸出變數 (Output)'}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">論域範圍：[${curVar.range[0]}, ${curVar.range[1]}] • 包含 ${curVar.mfs.length} 個歸屬函數</p>
              </div>
            </div>

            <!-- 切換變數快速膠囊 -->
            <div class="flex flex-wrap items-center gap-2">
              ${fis.inputs.map((inp, idx) => `
                <button onclick="WebFISStudio.selectVariable('input', ${idx})"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${isInput && selectedVar.index === idx ? 'bg-sky-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'}">
                  📥 ${inp.name}
                </button>
              `).join('')}
              ${fis.outputs.map((out, idx) => `
                <button onclick="WebFISStudio.selectVariable('output', ${idx})"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${!isInput && selectedVar.index === idx ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'}">
                  📤 ${out.name}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Type-1 / Interval Type-2 (FOU) 視覺化切換工具列 -->
          <div class="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/35">
            <div class="flex items-center gap-3">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="it2-toggle-check" ${isType2Enabled ? 'checked' : ''} onchange="WebFISStudio.toggleType2Mode(this.checked)" class="sr-only peer">
                <div class="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
              </label>
              <div>
                <span class="text-xs sm:text-sm font-bold ${isType2Enabled ? 'text-indigo-300' : 'text-slate-300'} flex items-center gap-1.5">
                  <span>🎭 開啟區間第二型模糊 (Interval Type-2 FOU 不確定性上下界)</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full ${isType2Enabled ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-500'} font-mono">
                    ${isType2Enabled ? 'IT2 ACTIVE' : 'TYPE-1'}
                  </span>
                </span>
                <p class="text-[11px] text-slate-400">
                  ${isType2Enabled ? '已在圖表中繪製上歸屬函數 (UMF) 與下歸屬函數 (LMF) 陰影帶，展現面對強風巨浪/微氣候擾動/電網雜訊的強健性 (Robustness)' : '當前為傳統第一型模糊集合 (Type-1)。開啟開關即可即時渲染面對感測器雜訊時的 FOU 不確定性足跡'}
                </p>
              </div>
            </div>

            ${isType2Enabled ? `
              <div class="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                <span class="text-xs text-slate-400 font-mono">FOU 擾動寬度:</span>
                <input type="range" min="0.05" max="0.35" step="0.02" value="${type2FOUWidth}"
                  oninput="WebFISStudio.setType2FOUWidth(parseFloat(this.value)); document.getElementById('it2-width-label').textContent = Math.round(this.value * 100) + '%';"
                  class="w-24 cursor-pointer accent-indigo-400">
                <span id="it2-width-label" class="text-xs font-mono font-bold text-indigo-300 w-8 text-right">${Math.round(type2FOUWidth * 100)}%</span>
              </div>
            ` : ''}
          </div>

          <!-- Plotly 圖表容器 -->
          <div id="fis-mf-plot-container" class="w-full h-80 rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800/80"></div>
        </div>

        <!-- 下方：雙欄編輯管理控制台 -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- 左側：變數論域管理 (Variable Manager) -->
          <div class="lg:col-span-5 refined-card p-6 border-slate-800 space-y-5">
            <h4 class="text-base font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>變數屬性設定 (Variable Properties)</span>
              <div class="flex items-center gap-1.5">
                <button onclick="WebFISStudio.addVariable('input')" class="text-xs px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 font-bold transition">
                  + 新增輸入
                </button>
                <button onclick="WebFISStudio.addVariable('output')" class="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold transition">
                  + 新增輸出
                </button>
              </div>
            </h4>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-400">變數名稱 (Variable Name)</label>
                <input type="text" value="${curVar.name}" onchange="WebFISStudio.updateVarProp('name', this.value)"
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-sky-400" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400">論域下界 (Min Range)</label>
                  <input type="number" step="any" value="${curVar.range[0]}" onchange="WebFISStudio.updateVarProp('rangeMin', parseFloat(this.value))"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-sky-400" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400">論域上界 (Max Range)</label>
                  <input type="number" step="any" value="${curVar.range[1]}" onchange="WebFISStudio.updateVarProp('rangeMax', parseFloat(this.value))"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-sky-400" />
                </div>
              </div>

              <div class="pt-2">
                <button onclick="WebFISStudio.deleteCurrentVariable()"
                  class="w-full py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition">
                  🗑️ 刪除此變數 (${curVar.name})
                </button>
              </div>
            </div>
          </div>

          <!-- 右側：歸屬函數管理 (Membership Functions Manager) -->
          <div class="lg:col-span-7 refined-card p-6 border-slate-800 space-y-5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 class="text-base font-bold text-white flex items-center gap-2">
                <span>歸屬函數集合 (Linguistic Terms)</span>
              </h4>
              <button onclick="WebFISStudio.addMF()" class="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold transition shadow-sm">
                + 新增歸屬函數
              </button>
            </div>

            <!-- MF 列表膠囊 -->
            <div class="flex flex-wrap items-center gap-2 pb-2">
              ${curVar.mfs.map((mf, idx) => `
                <button onclick="WebFISStudio.selectMF(${idx})"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${selectedVar.mfIndex === idx ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'}">
                  <span class="w-2 h-2 rounded-full ${selectedVar.mfIndex === idx ? 'bg-white' : 'bg-indigo-400'}"></span>
                  <span>${mf.name}</span>
                  <span class="text-[10px] text-slate-400">(${mf.type})</span>
                </button>
              `).join('')}
            </div>

            <!-- 選中 MF 的詳細參數編輯區 -->
            ${curMF ? `
              <div class="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-slate-400">函數名稱 (MF Name)</label>
                    <input type="text" value="${curMF.name}" onchange="WebFISStudio.updateMFProp('name', this.value)"
                      class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-indigo-400" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-slate-400">函數形態 (Type)</label>
                    <select onchange="WebFISStudio.updateMFProp('type', this.value)"
                      class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-indigo-300 focus:border-indigo-400">
                      ${(!isInput && fis.type === 'sugeno') ? `
                        <option value="constant" selected>constant (常數)</option>
                      ` : `
                        <option value="trimf" ${curMF.type === 'trimf' ? 'selected' : ''}>trimf (三角形 Triangle)</option>
                        <option value="trapmf" ${curMF.type === 'trapmf' ? 'selected' : ''}>trapmf (梯形 Trapezoidal)</option>
                        <option value="gaussmf" ${curMF.type === 'gaussmf' ? 'selected' : ''}>gaussmf (高斯分佈 Gaussian)</option>
                        <option value="gbellmf" ${curMF.type === 'gbellmf' ? 'selected' : ''}>gbellmf (廣義鐘型 Generalized Bell)</option>
                      `}
                    </select>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span>數值參數向量 [params]</span>
                    <span class="text-[11px] text-indigo-300 font-mono">
                      ${curMF.type === 'trimf' ? '[a, b, c]' :
                        curMF.type === 'trapmf' ? '[a, b, c, d]' :
                        curMF.type === 'gaussmf' ? '[sigma, c]' :
                        curMF.type === 'gbellmf' ? '[a, b, c]' : '[constant]'}
                    </span>
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    ${curMF.params.map((val, pIdx) => `
                      <div>
                        <input type="number" step="any" value="${val}"
                          onchange="WebFISStudio.updateMFParam(${pIdx}, parseFloat(this.value))"
                          class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:border-indigo-400" />
                        <span class="text-[10px] text-slate-500 font-mono block text-center mt-0.5">p${pIdx + 1}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div class="pt-2 flex justify-between items-center border-t border-slate-800">
                  <button onclick="WebFISStudio.setGuidedStep(4)" class="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md">
                    <span>下一步：組裝專家經驗規則庫 (Step 4) ➔</span>
                  </button>
                  <button onclick="WebFISStudio.deleteCurrentMF()"
                    class="text-xs px-3 py-1.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition">
                    🗑️ 刪除此歸屬函數
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    setTimeout(renderMFPlot, 40);
  }

  function renderMFPlot() {
    const fis = currentFIS;
    const isInput = selectedVar.type === 'input';
    const varList = isInput ? fis.inputs : fis.outputs;
    const curVar = varList[selectedVar.index] || varList[0];
    const container = document.getElementById('fis-mf-plot-container');
    if (!container || !curVar || !window.Plotly) return;

    const range = curVar.range;
    const nPts = 200;
    const dx = (range[1] - range[0]) / (nPts - 1);
    const xVals = [];
    for (let i = 0; i < nPts; i++) xVals.push(range[0] + i * dx);

    const colors = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#2dd4bf'];
    const traces = [];

    curVar.mfs.forEach((mf, idx) => {
      const isSelected = selectedVar.mfIndex === idx;
      const col = colors[idx % colors.length];

      if (isType2Enabled) {
        // 計算 UMF 與 LMF 參數
        const span = (curVar.range[1] - curVar.range[0]) * type2FOUWidth * 0.25;

        // 上界曲線 (UMF)
        const umfParams = mf.params.map((p, pIdx) => {
          if (mf.type === 'trimf') {
            if (pIdx === 0) return p - span;
            if (pIdx === 1) return p;
            if (pIdx === 2) return p + span;
          } else if (mf.type === 'trapmf') {
            if (pIdx === 0) return p - span;
            if (pIdx === 1) return Math.max(curVar.range[0], p - span * 0.4);
            if (pIdx === 2) return Math.min(curVar.range[1], p + span * 0.4);
            if (pIdx === 3) return p + span;
          } else if (mf.type === 'gaussmf') {
            if (pIdx === 0) return p * (1 + type2FOUWidth * 0.8);
            return p;
          }
          return p;
        });

        // 下界曲線 (LMF)
        const lmfParams = mf.params.map((p, pIdx) => {
          if (mf.type === 'trimf') {
            if (pIdx === 0) return p + span * 0.7;
            if (pIdx === 1) return p;
            if (pIdx === 2) return p - span * 0.7;
          } else if (mf.type === 'trapmf') {
            if (pIdx === 0) return p + span * 0.6;
            if (pIdx === 1) return p + span * 0.2;
            if (pIdx === 2) return p - span * 0.2;
            if (pIdx === 3) return p - span * 0.6;
          } else if (mf.type === 'gaussmf') {
            if (pIdx === 0) return Math.max(0.01, p * (1 - type2FOUWidth * 0.6));
            return p;
          }
          return p;
        });

        const yUMF = xVals.map(x => Math.min(1.0, evalMF(mf.type, umfParams, x)));
        const yLMF = xVals.map(x => Math.max(0, evalMF(mf.type, lmfParams, x) * (1 - type2FOUWidth * 0.25)));

        // 1. LMF 基準線 (虛線)
        traces.push({
          x: xVals,
          y: yLMF,
          mode: 'lines',
          line: { color: col, width: 1.5, dash: 'dot' },
          name: `${mf.name} (LMF)`,
          showlegend: false,
          hoverinfo: 'none'
        });

        // 2. UMF 上界線 (實線)，並使用 tonexty 填充 FOU 陰影足跡
        traces.push({
          x: xVals,
          y: yUMF,
          mode: 'lines',
          line: { color: col, width: isSelected ? 3.5 : 2 },
          fill: 'tonexty',
          fillcolor: isSelected ? `${col}44` : `${col}22`,
          name: `${mf.name} [IT2-FOU]`
        });

      } else {
        // 標準第一型 (Type-1)
        const yVals = xVals.map(x => evalMF(mf.type, mf.params, x));
        traces.push({
          x: xVals,
          y: yVals,
          name: `${mf.name} (${mf.type})`,
          mode: 'lines',
          line: {
            color: col,
            width: isSelected ? 4 : 2,
            dash: 'solid'
          },
          fill: isSelected ? 'tozeroy' : 'none',
          fillcolor: isSelected ? `${col}22` : undefined
        });
      }
    });

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
      font: { color: '#94a3b8', family: 'sans-serif' },
      margin: { l: 45, r: 25, t: 30, b: 40 },
      xaxis: {
        title: `${curVar.name} 論域`,
        range: [range[0], range[1]],
        gridcolor: 'rgba(51, 65, 85, 0.4)',
        zerolinecolor: 'rgba(51, 65, 85, 0.8)'
      },
      yaxis: {
        title: '歸屬度 μ',
        range: [-0.05, 1.1],
        gridcolor: 'rgba(51, 65, 85, 0.4)',
        zerolinecolor: 'rgba(51, 65, 85, 0.8)'
      },
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.15,
        font: { size: 11 }
      }
    };

    Plotly.react('fis-mf-plot-container', traces, layout, { responsive: true, displayModeBar: false });
  }

  function selectVariable(type, index) {
    selectedVar.type = type;
    selectedVar.index = index;
    selectedVar.mfIndex = 0;
    renderMFEditor();
  }

  function selectMF(mfIdx) {
    selectedVar.mfIndex = mfIdx;
    renderMFEditor();
  }

  function updateVarProp(prop, val) {
    const isInput = selectedVar.type === 'input';
    const varList = isInput ? currentFIS.inputs : currentFIS.outputs;
    const curVar = varList[selectedVar.index];
    if (!curVar) return;

    if (prop === 'name') curVar.name = val;
    else if (prop === 'rangeMin') curVar.range[0] = val;
    else if (prop === 'rangeMax') curVar.range[1] = val;

    renderAll();
  }

  function updateMFProp(prop, val) {
    const isInput = selectedVar.type === 'input';
    const varList = isInput ? currentFIS.inputs : currentFIS.outputs;
    const curVar = varList[selectedVar.index];
    if (!curVar) return;
    const curMF = curVar.mfs[selectedVar.mfIndex];
    if (!curMF) return;

    if (prop === 'name') {
      curMF.name = val;
    } else if (prop === 'type') {
      curMF.type = val;
      curMF.params = getDefaultParams(val, curVar.range);
    }
    renderAll();
  }

  function updateMFParam(idx, val) {
    const isInput = selectedVar.type === 'input';
    const varList = isInput ? currentFIS.inputs : currentFIS.outputs;
    const curVar = varList[selectedVar.index];
    if (!curVar) return;
    const curMF = curVar.mfs[selectedVar.mfIndex];
    if (!curMF || isNaN(val)) return;

    curMF.params[idx] = val;
    renderMFPlot();
    renderRuleViewer();
  }

  function addVariable(type) {
    const isInput = type === 'input';
    const defaultRange = isInput ? [0, 10] : [0, 100];
    const newName = isInput ? `input${currentFIS.inputs.length + 1}` : `output${currentFIS.outputs.length + 1}`;
    const newVar = {
      name: newName,
      range: defaultRange,
      mfs: [
        { name: "low", type: "trimf", params: [0, 0, 5] },
        { name: "med", type: "trimf", params: [2, 5, 8] },
        { name: "high", type: "trimf", params: [5, 10, 10] }
      ]
    };
    if (isInput) currentFIS.inputs.push(newVar);
    else currentFIS.outputs.push(newVar);

    currentFIS.rules.forEach(r => {
      if (isInput) r.antecedents.push({ varIndex: currentFIS.inputs.length - 1, mfIndex: -1, isNot: false });
      else r.consequents.push({ varIndex: currentFIS.outputs.length - 1, mfIndex: 0 });
    });

    selectVariable(type, isInput ? currentFIS.inputs.length - 1 : currentFIS.outputs.length - 1);
    initViewerInputs();
    renderAll();
  }

  function deleteCurrentVariable() {
    const isInput = selectedVar.type === 'input';
    const varList = isInput ? currentFIS.inputs : currentFIS.outputs;
    if (varList.length <= 1) {
      alert(`系統至少必須保留一個${isInput ? '輸入' : '輸出'}變數！`);
      return;
    }

    const delIdx = selectedVar.index;
    varList.splice(delIdx, 1);

    currentFIS.rules.forEach(r => {
      if (isInput) {
        r.antecedents.splice(delIdx, 1);
        r.antecedents.forEach((a, i) => { a.varIndex = i; });
      } else {
        r.consequents.splice(delIdx, 1);
        r.consequents.forEach((c, i) => { c.varIndex = i; });
      }
    });

    selectedVar.index = Math.max(0, delIdx - 1);
    selectedVar.mfIndex = 0;
    initViewerInputs();
    renderAll();
  }

  function addMF() {
    const isInput = selectedVar.type === 'input';
    const varList = isInput ? currentFIS.inputs : currentFIS.outputs;
    const curVar = varList[selectedVar.index];
    if (!curVar) return;

    const newMF = {
      name: `mf${curVar.mfs.length + 1}`,
      type: "trimf",
      params: getDefaultParams("trimf", curVar.range)
    };
    curVar.mfs.push(newMF);
    selectedVar.mfIndex = curVar.mfs.length - 1;
    renderAll();
  }

  function deleteCurrentMF() {
    const isInput = selectedVar.type === 'input';
    const varList = isInput ? currentFIS.inputs : currentFIS.outputs;
    const curVar = varList[selectedVar.index];
    if (!curVar || curVar.mfs.length <= 1) {
      alert("每個變數至少需保留一個歸屬函數！");
      return;
    }

    curVar.mfs.splice(selectedVar.mfIndex, 1);
    selectedVar.mfIndex = Math.max(0, selectedVar.mfIndex - 1);
    renderAll();
  }

  // =========================================================================
  // 3. 規則庫編輯器 (Rule Editor) 工作區
  // =========================================================================

  function renderRuleEditor() {
    const fis = currentFIS;
    const container = document.getElementById('fis-rules-content');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- 步驟 4 老師引導小學堂 -->
        <div class="refined-card p-5 border-l-4 border-l-emerald-400 bg-emerald-500/10 space-y-2">
          <div class="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>📘 步驟 4 老師小學堂：專家經驗規則庫怎麼寫？</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong>1. IF-THEN 是人類大腦直覺的結晶</strong>：你不需要懂複雜的偏微分方程，只要用日常語言寫下：『如果溫度偏高 (PB) 且還在持續升溫 (P)，那麼冷氣就全速開到強力 (Turbo)』！<br/>
            <strong>2. FAM (Fuzzy Associative Memory) 矩陣表是除錯神器</strong>：當你有 2 個輸入時，強烈推薦點選下方「📊 FAM 矩陣表」按鈕！就像九九乘法表一樣，每個格子都應該被規則填滿。若有空白格子，代表遇到某種突發情境時控制器會『當機發呆』！
          </p>
        </div>

        <!-- 上方：自然語意規則組裝器 (Rule Builder) -->
        <div class="glass-panel rounded-3xl p-6 border border-emerald-500/30 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <span>✍️</span> 視覺化規則組裝器 (Rule Builder)
            </h3>
            <span class="text-xs text-slate-400">組裝自訂的 IF [條件] THEN [決策] 語意規則</span>
          </div>

          <div class="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <span class="font-bold text-sky-400 px-2 py-1 rounded bg-sky-500/15">IF</span>

              <!-- 前件部下拉選單 -->
              ${fis.inputs.map((inp, idx) => `
                <div class="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400 font-mono">${inp.name} is</span>
                  <select id="rule-builder-in-${idx}" class="bg-slate-950 text-sky-300 font-semibold rounded-lg px-2 py-1 border border-slate-700 text-xs">
                    <option value="-1">-- 無論 (Any) --</option>
                    ${inp.mfs.map((mf, mfIdx) => `
                      <option value="${mfIdx}">${mf.name}</option>
                    `).join('')}
                  </select>
                </div>
                ${idx < fis.inputs.length - 1 ? `
                  <select id="rule-builder-conn" class="bg-slate-900 text-indigo-300 font-bold rounded-lg px-2 py-1 border border-indigo-500/30 text-xs">
                    <option value="and">AND (且)</option>
                    <option value="or">OR (或)</option>
                  </select>
                ` : ''}
              `).join('')}

              <span class="font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/15">THEN</span>

              <!-- 後件部下拉選單 -->
              ${fis.outputs.map((out, idx) => `
                <div class="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400 font-mono">${out.name} is</span>
                  <select id="rule-builder-out-${idx}" class="bg-slate-950 text-emerald-300 font-semibold rounded-lg px-2 py-1 border border-slate-700 text-xs">
                    ${out.mfs.map((mf, mfIdx) => `
                      <option value="${mfIdx}">${mf.name}</option>
                    `).join('')}
                  </select>
                </div>
              `).join('')}

              <div class="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <span class="text-xs text-slate-400 font-mono">Weight:</span>
                <input id="rule-builder-weight" type="number" step="0.1" min="0" max="1" value="1.0" class="w-16 bg-slate-950 text-white font-mono text-xs rounded px-2 py-1 border border-slate-700" />
              </div>

              <button onclick="WebFISStudio.addRuleFromBuilder()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5">
                <span>➕</span> 新增此條規則
              </button>
            </div>
          </div>
        </div>

        <!-- 下方：現有規則清單 / FAM 矩陣表切換視圖 -->
        <div class="refined-card p-6 border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span>📜</span> 規則庫檢視 (Rules Base, 共 ${fis.rules.length} 條)
              </h3>
              <!-- 模式切換按鈕組 -->
              <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button onclick="WebFISStudio.setRuleViewMode('list')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${ruleViewMode === 'list' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
                  📋 條列清單
                </button>
                <button onclick="WebFISStudio.setRuleViewMode('fam')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${ruleViewMode === 'fam' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
                  📊 FAM 矩陣表
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="WebFISStudio.toggleAllRules(true)" class="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white">全部啟用</button>
              <button onclick="WebFISStudio.toggleAllRules(false)" class="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white">全部停用</button>
              <button onclick="WebFISStudio.clearAllRules()" class="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30">清空規則</button>
            </div>
          </div>

          ${ruleViewMode === 'fam' ? `
            <!-- FAM 矩陣檢視模式 -->
            ${fis.inputs.length === 2 ? `
              <div class="overflow-x-auto space-y-3">
                <div class="text-xs text-slate-400 flex items-center justify-between">
                  <span>直軸：<strong>${fis.inputs[0].name}</strong> • 橫軸：<strong>${fis.inputs[1].name}</strong> • 儲存格：輸出 <strong>${fis.outputs[0].name}</strong></span>
                  <span class="text-[11px] text-indigo-300">💡 點選儲存格可快速設置或修改輸出決策</span>
                </div>
                <table class="w-full border-collapse border border-slate-800 rounded-xl overflow-hidden text-center text-xs sm:text-sm">
                  <thead>
                    <tr class="bg-slate-900/90 text-slate-300">
                      <th class="p-3 border border-slate-800 font-mono text-sky-400">${fis.inputs[0].name} \\ ${fis.inputs[1].name}</th>
                      ${fis.inputs[1].mfs.map(mf => `
                        <th class="p-3 border border-slate-800 font-bold text-sky-300">${mf.name}</th>
                      `).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${fis.inputs[0].mfs.map((mf1, iIdx) => `
                      <tr class="hover:bg-slate-900/40 transition">
                        <td class="p-3 border border-slate-800 font-bold text-sky-300 bg-slate-900/60">${mf1.name}</td>
                        ${fis.inputs[1].mfs.map((mf2, jIdx) => {
                          const ruleIdx = fis.rules.findIndex(r => {
                            const a1 = r.antecedents.find(a => a.varIndex === 0);
                            const a2 = r.antecedents.find(a => a.varIndex === 1);
                            return a1 && a1.mfIndex === iIdx && a2 && a2.mfIndex === jIdx;
                          });

                          if (ruleIdx >= 0) {
                            const r = fis.rules[ruleIdx];
                            const cons = r.consequents[0];
                            const outMF = fis.outputs[0].mfs[cons ? cons.mfIndex : 0];
                            return `
                              <td class="p-2.5 border border-slate-800">
                                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                                  <span>${outMF ? outMF.name : '?'}</span>
                                  <button onclick="WebFISStudio.deleteRule(${ruleIdx})" title="刪除此規則" class="text-rose-400 hover:text-rose-200 ml-1">✕</button>
                                </div>
                              </td>
                            `;
                          } else {
                            return `
                              <td class="p-2.5 border border-slate-800">
                                <button onclick="WebFISStudio.quickAddFamRule(${iIdx}, ${jIdx})"
                                  class="text-[11px] px-2.5 py-1 rounded-lg border border-dashed border-slate-700 hover:border-sky-400 text-slate-500 hover:text-sky-300 transition">
                                  + 設規則
                                </button>
                              </td>
                            `;
                          }
                        }).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="p-8 text-center text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                FAM 規則矩陣圖適用於 2 個輸入變數之系統（當前系統有 ${fis.inputs.length} 個輸入），請點擊右上角切換至「📋 條列清單」模式進行編輯。
              </div>
            `}
          ` : `
            <!-- 條列清單檢視模式 -->
            <div class="space-y-3">
              ${fis.rules.map((r, rIdx) => {
                const anteTexts = r.antecedents.map(a => {
                  if (a.mfIndex < 0) return null;
                  const inV = fis.inputs[a.varIndex];
                  const mf = inV ? inV.mfs[a.mfIndex] : null;
                  return `${inV ? inV.name : 'in'} is ${a.isNot ? 'NOT ' : ''}<strong class="text-sky-300">${mf ? mf.name : '?'}</strong>`;
                }).filter(Boolean);

                const consTexts = r.consequents.map(c => {
                  const outV = fis.outputs[c.varIndex];
                  const mf = outV ? outV.mfs[c.mfIndex] : null;
                  return `${outV ? outV.name : 'out'} is <strong class="text-emerald-300">${mf ? mf.name : '?'}</strong>`;
                });

                const ruleStr = `IF ${anteTexts.join(` <span class="text-indigo-400 font-bold uppercase">${r.connection}</span> `)} THEN ${consTexts.join(', ')}`;

                return `
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition ${r.enabled ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'}">
                    <div class="flex items-center gap-3">
                      <span class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center justify-center shrink-0">
                        ${rIdx + 1}
                      </span>
                      <label class="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="WebFISStudio.toggleRule(${rIdx})" class="sr-only peer">
                        <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <div class="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                        ${ruleStr} <span class="text-slate-500 text-xs font-mono">(w=${r.weight || 1.0})</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <button onclick="WebFISStudio.deleteRule(${rIdx})" class="text-xs px-2.5 py-1 rounded-lg text-rose-400 hover:bg-rose-500/20 border border-rose-500/25 transition">
                        🗑️ 刪除
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}

          <!-- 下一步引導按鈕 -->
          <div class="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span class="text-xs text-slate-400">規則庫已完備？進入最精彩的動態推論驗證：</span>
            <button onclick="WebFISStudio.setGuidedStep(5)" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <span>下一步：MATLAB 動態推論與曲面驗證 (Step 5) ➔</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function setRuleViewMode(mode) {
    ruleViewMode = mode;
    renderRuleEditor();
  }

  function quickAddFamRule(in1MFIdx, in2MFIdx, outMFIdx = 0) {
    const fis = currentFIS;
    fis.rules.push({
      id: `r_${Date.now()}`,
      enabled: true,
      connection: "and",
      weight: 1.0,
      antecedents: [
        { varIndex: 0, mfIndex: in1MFIdx, isNot: false },
        { varIndex: 1, mfIndex: in2MFIdx, isNot: false }
      ],
      consequents: [
        { varIndex: 0, mfIndex: outMFIdx }
      ]
    });
    renderAll();
  }

  function addRuleFromBuilder() {
    const fis = currentFIS;
    const antecedents = [];
    let hasValidAnte = false;

    fis.inputs.forEach((inp, idx) => {
      const el = document.getElementById(`rule-builder-in-${idx}`);
      const val = el ? parseInt(el.value) : -1;
      antecedents.push({ varIndex: idx, mfIndex: val, isNot: false });
      if (val >= 0) hasValidAnte = true;
    });

    if (!hasValidAnte) {
      alert("請至少為一個輸入變數選擇具體的歸屬集合！");
      return;
    }

    const connEl = document.getElementById('rule-builder-conn');
    const connection = connEl ? connEl.value : 'and';

    const consequents = [];
    fis.outputs.forEach((out, idx) => {
      const el = document.getElementById(`rule-builder-out-${idx}`);
      const val = el ? parseInt(el.value) : 0;
      consequents.push({ varIndex: idx, mfIndex: val });
    });

    const weightEl = document.getElementById('rule-builder-weight');
    const weight = weightEl ? Math.max(0, Math.min(1, parseFloat(weightEl.value) || 1.0)) : 1.0;

    fis.rules.push({
      id: `r_${Date.now()}`,
      enabled: true,
      connection: connection,
      weight: weight,
      antecedents: antecedents,
      consequents: consequents
    });

    renderAll();
  }

  function toggleRule(idx) {
    if (currentFIS.rules[idx]) {
      currentFIS.rules[idx].enabled = !currentFIS.rules[idx].enabled;
      renderAll();
    }
  }

  function toggleAllRules(state) {
    currentFIS.rules.forEach(r => { r.enabled = state; });
    renderAll();
  }

  function clearAllRules() {
    if (confirm("確定要清空所有規則嗎？")) {
      currentFIS.rules = [];
      renderAll();
    }
  }

  function deleteRule(idx) {
    currentFIS.rules.splice(idx, 1);
    renderAll();
  }

  // =========================================================================
  // 4. MATLAB 經典「規則推論動態檢視器 (Rule Viewer)」工作區
  // =========================================================================

  function renderRuleViewer() {
    const fis = currentFIS;
    const container = document.getElementById('fis-viewer-content');
    if (!container) return;

    const inferResult = inferFIS(viewerInputs, 0);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- 步驟 5 老師引導小學堂 -->
        <div class="refined-card p-5 border-l-4 border-l-indigo-400 bg-indigo-500/10 space-y-2">
          <div class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>📘 步驟 5 老師小學堂：怎麼看懂 MATLAB 經典 Rule Viewer？</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">
            這是模糊邏輯最迷人的瞬間！請依序觀察這 4 個視覺元素：<br/>
            <strong>1. 紅色垂直輸入指標線</strong>：代表當前感測器測量到的即時數值（拖動下方滑桿試試看！）。<br/>
            <strong>2. 每一列是一條規則</strong>：前件部小圖中，紅色指標線與藍色曲線的交點，就是該規則前件的「活化強度」。<br/>
            <strong>3. 後件部黃色截頂面積</strong>：這條規則被活化了多少，後件部的幾何圖形就被「削平」到多高。<br/>
            <strong>4. 最右下角聚合幾何與紅色粗線</strong>：將所有規則的黃色圖形取聯集疊加在一起，算出它的<strong>物理重心 (COG)</strong>，那條紅色粗線對應的數字就是控制器輸出給馬達或閥門的最終控制量！
          </p>
        </div>

        <!-- 頂部：各輸入變數紅色指標滑桿控制台 (Interactive Inputs) -->
        <div class="glass-panel rounded-3xl p-6 border border-sky-500/30 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <span>🔍</span> 經典 MATLAB 規則動態推論檢視器 (Interactive Rule Viewer)
            </h3>
            <div class="flex items-center gap-2 text-xs font-mono">
              <span class="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse"></span>
              <span class="text-red-400 font-bold">紅色指示線為即時輸入值</span>
            </div>
          </div>

          <!-- 各輸入變數滑桿列 -->
          <div style="display: grid; grid-template-columns: repeat(${Math.min(3, fis.inputs.length)}, minmax(0, 1fr)); gap: 1.5rem;">
            ${fis.inputs.map((inp, idx) => {
              const curVal = viewerInputs[idx] !== undefined ? viewerInputs[idx] : (inp.range[0] + inp.range[1]) / 2;
              return `
                <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white">${inp.name}</span>
                    <span id="viewer-in-val-${idx}" class="text-base font-bold text-sky-400 font-mono">${curVal.toFixed(2)}</span>
                  </div>
                  <input type="range" min="${inp.range[0]}" max="${inp.range[1]}" step="${(inp.range[1] - inp.range[0]) / 200}"
                    value="${curVal}" oninput="WebFISStudio.updateViewerInput(${idx}, parseFloat(this.value))"
                    class="w-full cursor-pointer accent-red-500" />
                  <div class="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>${inp.range[0]}</span>
                    <span class="text-slate-400 font-bold">Range [${inp.range[0]}, ${inp.range[1]}]</span>
                    <span>${inp.range[1]}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 中間：MATLAB 經典規則小圖網格矩陣 (Rule Matrix) -->
        <div class="refined-card p-6 border-slate-800 space-y-4 overflow-x-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 min-w-[700px]">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
              每一列為一條規則 (Rule) • 每一欄為變數 (Variable) • 激發面積以幾何截頂視覺化
            </span>
            <span class="text-xs font-mono text-emerald-400 font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              ${fis.outputs[0] ? fis.outputs[0].name : 'Output'} = ${inferResult ? inferResult.defuzzValue.toFixed(3) : '--'}
            </span>
          </div>

          <!-- 網格小圖畫布容器 -->
          <div id="fis-rule-viewer-matrix" class="space-y-4 min-w-[700px]">
            <!-- 由 JS 動態生成各列小圖 -->
          </div>
        </div>
      </div>
    `;

    setTimeout(renderRuleViewerPlots, 40);
  }

  let viewerThrottleTimer = null;
  function updateViewerInput(idx, val) {
    viewerInputs[idx] = val;
    const labelEl = document.getElementById(`viewer-in-val-${idx}`);
    if (labelEl) labelEl.textContent = val.toFixed(2);

    if (viewerThrottleTimer) clearTimeout(viewerThrottleTimer);
    viewerThrottleTimer = setTimeout(renderRuleViewerPlots, 20);
  }

  function renderRuleViewerPlots() {
    const fis = currentFIS;
    const matrixContainer = document.getElementById('fis-rule-viewer-matrix');
    if (!matrixContainer || !window.Plotly) return;

    const inferResult = inferFIS(viewerInputs, 0);
    if (!inferResult) return;

    const outVar = fis.outputs[0];
    const totalCols = fis.inputs.length + 1;

    let matrixHtml = `
      <!-- 表頭欄位標題 -->
      <div style="display: grid; grid-template-columns: repeat(${totalCols}, minmax(0, 1fr)); gap: 0.75rem;" class="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 text-center">
        ${fis.inputs.map(inp => `<div>${inp.name}</div>`).join('')}
        <div class="text-emerald-400">${outVar.name} (Output)</div>
      </div>
    `;

    fis.rules.forEach((rule, rIdx) => {
      matrixHtml += `
        <div style="display: grid; grid-template-columns: repeat(${totalCols}, minmax(0, 1fr)); gap: 0.75rem;" class="items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          ${fis.inputs.map((inp, inIdx) => `
            <div id="viewer-plot-r${rIdx}-in${inIdx}" class="h-28 rounded-lg overflow-hidden bg-slate-900/80"></div>
          `).join('')}
          <div id="viewer-plot-r${rIdx}-out" class="h-28 rounded-lg overflow-hidden bg-slate-900/80"></div>
        </div>
      `;
    });

    matrixHtml += `
      <div style="display: grid; grid-template-columns: repeat(${totalCols}, minmax(0, 1fr)); gap: 0.75rem;" class="items-center bg-slate-900/90 p-4 rounded-2xl border-2 border-emerald-500/40 shadow-xl mt-4">
        <div style="grid-column: span ${fis.inputs.length} / span ${fis.inputs.length};" class="text-sm text-slate-300 flex items-center justify-between px-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚖️</span>
            <div>
              <strong class="text-white">聚合總輸出與解模糊化</strong>
              <div class="text-xs text-slate-400">算子：${fis.aggMethod.toUpperCase()} 聚合 + ${fis.defuzzMethod.toUpperCase()} 解模糊化</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-400">精準控制量輸出值</div>
            <div class="text-2xl font-black text-emerald-400 font-mono">${inferResult.defuzzValue.toFixed(3)}</div>
          </div>
        </div>
        <div id="viewer-plot-aggregate-defuzz" class="h-32 rounded-xl overflow-hidden bg-slate-950 border border-emerald-500/30"></div>
      </div>
    `;

    matrixContainer.innerHTML = matrixHtml;

    fis.rules.forEach((rule, rIdx) => {
      const detail = inferResult.ruleDetails[rIdx];

      fis.inputs.forEach((inp, inIdx) => {
        const divId = `viewer-plot-r${rIdx}-in${inIdx}`;
        const ante = rule.antecedents.find(a => a.varIndex === inIdx);
        const xCur = viewerInputs[inIdx] !== undefined ? viewerInputs[inIdx] : (inp.range[0] + inp.range[1]) / 2;
        const nP = 80;
        const dx = (inp.range[1] - inp.range[0]) / (nP - 1);
        const xV = [];
        for (let i = 0; i < nP; i++) xV.push(inp.range[0] + i * dx);

        const traces = [];

        if (ante && ante.mfIndex >= 0) {
          const mf = inp.mfs[ante.mfIndex];
          if (mf) {
            const yV = xV.map(x => evalMF(mf.type, mf.params, x));
            traces.push({
              x: xV,
              y: yV,
              mode: 'lines',
              line: { color: '#38bdf8', width: 2 },
              fill: 'tozeroy',
              fillcolor: 'rgba(56, 189, 248, 0.15)'
            });
          }
        }

        traces.push({
          x: [xCur, xCur],
          y: [0, 1.05],
          mode: 'lines',
          line: { color: '#ef4444', width: 2 }
        });

        const layout = {
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
          margin: { l: 20, r: 10, t: 15, b: 20 },
          xaxis: { range: inp.range, showticklabels: false, showgrid: false },
          yaxis: { range: [0, 1.1], showticklabels: false, showgrid: false },
          showlegend: false
        };

        Plotly.react(divId, traces, layout, { responsive: true, displayModeBar: false });
      });

      const outDivId = `viewer-plot-r${rIdx}-out`;
      const outTraces = [];
      const cons = rule.consequents[0];
      const outMF = outVar.mfs[cons ? cons.mfIndex : 0];

      if (outMF && detail) {
        const baseCurve = inferResult.yDomain.map(y => evalMF(outMF.type, outMF.params, y));
        outTraces.push({
          x: inferResult.yDomain,
          y: baseCurve,
          mode: 'lines',
          line: { color: 'rgba(16, 185, 129, 0.4)', width: 1.5, dash: 'dot' }
        });

        outTraces.push({
          x: inferResult.yDomain,
          y: detail.consequentY,
          mode: 'lines',
          line: { color: '#f59e0b', width: 2 },
          fill: 'tozeroy',
          fillcolor: 'rgba(245, 158, 11, 0.35)'
        });
      }

      const outLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
        margin: { l: 20, r: 10, t: 15, b: 20 },
        xaxis: { range: outVar.range, showticklabels: false, showgrid: false },
        yaxis: { range: [0, 1.1], showticklabels: false, showgrid: false },
        showlegend: false
      };

      Plotly.react(outDivId, outTraces, outLayout, { responsive: true, displayModeBar: false });
    });

    const aggTraces = [
      {
        x: inferResult.yDomain,
        y: inferResult.aggEnvelope,
        name: '聚合後模糊集',
        mode: 'lines',
        line: { color: '#10b981', width: 3 },
        fill: 'tozeroy',
        fillcolor: 'rgba(16, 185, 129, 0.35)'
      },
      {
        x: [inferResult.defuzzValue, inferResult.defuzzValue],
        y: [0, 1.1],
        name: `重心解模糊值 = ${inferResult.defuzzValue.toFixed(2)}`,
        mode: 'lines',
        line: { color: '#ef4444', width: 3.5 }
      }
    ];

    const aggLayout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
      margin: { l: 30, r: 15, t: 15, b: 30 },
      xaxis: { range: outVar.range, gridcolor: 'rgba(51, 65, 85, 0.4)' },
      yaxis: { range: [0, 1.15], gridcolor: 'rgba(51, 65, 85, 0.4)' },
      showlegend: false
    };

    Plotly.react('viewer-plot-aggregate-defuzz', aggTraces, aggLayout, { responsive: true, displayModeBar: false });
  }

  // =========================================================================
  // 5. 3D 控制曲面檢視器 (Surface Viewer) 與程式碼匯出
  // =========================================================================

  function renderSurfacePlot() {
    const fis = currentFIS;
    const container = document.getElementById('fis-surface-plot-container');
    if (!container || !window.Plotly) return;

    if (fis.inputs.length < 2) {
      container.innerHTML = `<div class="p-12 text-center text-slate-400">3D 控制曲面至少需要 2 個輸入變數方可繪製。</div>`;
      return;
    }

    const inX = fis.inputs[0];
    const inY = fis.inputs[1];
    const outZ = fis.outputs[0];

    const gridN = 25;
    const dx = (inX.range[1] - inX.range[0]) / (gridN - 1);
    const dy = (inY.range[1] - inY.range[0]) / (gridN - 1);

    const xVals = [];
    const yVals = [];
    for (let i = 0; i < gridN; i++) {
      xVals.push(inX.range[0] + i * dx);
      yVals.push(inY.range[0] + i * dy);
    }

    const zMatrix = [];
    for (let j = 0; j < gridN; j++) {
      const row = [];
      const yVal = yVals[j];
      for (let i = 0; i < gridN; i++) {
        const xVal = xVals[i];
        const inputsObj = { 0: xVal, 1: yVal };
        const res = inferFIS(inputsObj, 0);
        row.push(res ? res.defuzzValue : (outZ.range[0] + outZ.range[1]) / 2);
      }
      zMatrix.push(row);
    }

    // 當前工作點計算
    const curX = viewerInputs[0] !== undefined ? viewerInputs[0] : (inX.range[0] + inX.range[1]) / 2;
    const curY = viewerInputs[1] !== undefined ? viewerInputs[1] : (inY.range[0] + inY.range[1]) / 2;
    const curRes = inferFIS(viewerInputs, 0);
    const curZ = curRes ? curRes.defuzzValue : (outZ.range[0] + outZ.range[1]) / 2;

    const surfaceTrace = {
      x: xVals,
      y: yVals,
      z: zMatrix,
      type: 'surface',
      colorscale: 'Viridis',
      name: '3D控制曲面',
      contours: {
        z: { show: true, usecolormap: true, highlightcolor: "#4299e1", project: { z: true } }
      }
    };

    // 立體紅色工作點 Marker
    const currentPointTrace = {
      type: 'scatter3d',
      mode: 'markers+text',
      x: [curX],
      y: [curY],
      z: [curZ],
      marker: {
        size: 9,
        color: '#ef4444',
        symbol: 'circle',
        line: { color: '#ffffff', width: 2.5 }
      },
      text: [`當前工作點: (${curX.toFixed(1)}, ${curY.toFixed(1)}) → ${curZ.toFixed(2)}`],
      textposition: 'top center',
      textfont: { color: '#fca5a5', size: 12, family: 'monospace' },
      name: '即時工作點'
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0.75)',
      margin: { l: 20, r: 20, t: 20, b: 20 },
      scene: {
        xaxis: { title: inX.name, gridcolor: '#334155', color: '#94a3b8' },
        yaxis: { title: inY.name, gridcolor: '#334155', color: '#94a3b8' },
        zaxis: { title: outZ.name, gridcolor: '#334155', color: '#94a3b8' },
        camera: { eye: { x: 1.5, y: -1.5, z: 1.2 } }
      }
    };

    Plotly.react('fis-surface-plot-container', [surfaceTrace, currentPointTrace], layout, { responsive: true });
  }

  function generateMatlabFisCode() {
    const fis = currentFIS;
    let code = `[System]\n`;
    code += `Name='${fis.name}'\n`;
    code += `Type='${fis.type}'\n`;
    code += `Version=2.0\n`;
    code += `NumInputs=${fis.inputs.length}\n`;
    code += `NumOutputs=${fis.outputs.length}\n`;
    code += `NumRules=${fis.rules.length}\n`;
    code += `AndMethod='${fis.andMethod}'\n`;
    code += `OrMethod='${fis.orMethod}'\n`;
    code += `ImpMethod='${fis.impMethod}'\n`;
    code += `AggMethod='${fis.aggMethod}'\n`;
    code += `DefuzzMethod='${fis.defuzzMethod}'\n\n`;

    fis.inputs.forEach((inp, idx) => {
      code += `[Input${idx + 1}]\n`;
      code += `Name='${inp.name}'\n`;
      code += `Range=[${inp.range[0]} ${inp.range[1]}]\n`;
      code += `NumMFs=${inp.mfs.length}\n`;
      inp.mfs.forEach((mf, mIdx) => {
        code += `MF${mIdx + 1}='${mf.name}':'${mf.type}',[${mf.params.join(' ')}]\n`;
      });
      code += `\n`;
    });

    fis.outputs.forEach((out, idx) => {
      code += `[Output${idx + 1}]\n`;
      code += `Name='${out.name}'\n`;
      code += `Range=[${out.range[0]} ${out.range[1]}]\n`;
      code += `NumMFs=${out.mfs.length}\n`;
      out.mfs.forEach((mf, mIdx) => {
        code += `MF${mIdx + 1}='${mf.name}':'${mf.type}',[${mf.params.join(' ')}]\n`;
      });
      code += `\n`;
    });

    code += `[Rules]\n`;
    fis.rules.forEach(r => {
      const anteIndices = r.antecedents.map(a => (a.mfIndex < 0 ? 0 : (a.mfIndex + 1) * (a.isNot ? -1 : 1)));
      const consIndices = r.consequents.map(c => c.mfIndex + 1);
      const conn = r.connection === 'or' ? 2 : 1;
      code += `${anteIndices.join(' ')}, ${consIndices.join(' ')} (${r.weight || 1.0}) : ${conn}\n`;
    });

    return code;
  }

  function generatePythonCode() {
    const fis = currentFIS;
    let py = `import numpy as np\nimport skfuzzy as fuzz\nfrom skfuzzy import control as ctrl\n\n`;
    py += `# 1. 建立 Antecedent 與 Consequent 物件\n`;

    fis.inputs.forEach(inp => {
      py += `${inp.name} = ctrl.Antecedent(np.linspace(${inp.range[0]}, ${inp.range[1]}, 101), '${inp.name}')\n`;
    });

    fis.outputs.forEach(out => {
      py += `${out.name} = ctrl.Consequent(np.linspace(${out.range[0]}, ${out.range[1]}, 101), '${out.name}')\n`;
    });

    py += `\n# 2. 定義歸屬函數\n`;
    fis.inputs.forEach(inp => {
      inp.mfs.forEach(mf => {
        if (mf.type === 'trimf') {
          py += `${inp.name}['${mf.name}'] = fuzz.trimf(${inp.name}.universe, [${mf.params.join(', ')}])\n`;
        } else if (mf.type === 'trapmf') {
          py += `${inp.name}['${mf.name}'] = fuzz.trapmf(${inp.name}.universe, [${mf.params.join(', ')}])\n`;
        } else if (mf.type === 'gaussmf') {
          py += `${inp.name}['${mf.name}'] = fuzz.gaussmf(${inp.name}.universe, ${mf.params[1]}, ${mf.params[0]})\n`;
        }
      });
    });

    fis.outputs.forEach(out => {
      out.mfs.forEach(mf => {
        if (mf.type === 'trimf') {
          py += `${out.name}['${mf.name}'] = fuzz.trimf(${out.name}.universe, [${mf.params.join(', ')}])\n`;
        } else if (mf.type === 'trapmf') {
          py += `${out.name}['${mf.name}'] = fuzz.trapmf(${out.name}.universe, [${mf.params.join(', ')}])\n`;
        }
      });
    });

    py += `\n# 3. 建立模糊規則庫\n`;
    py += `rules = [\n`;
    fis.rules.forEach((r, idx) => {
      const anteParts = [];
      r.antecedents.forEach(a => {
        if (a.mfIndex < 0) return;
        const inV = fis.inputs[a.varIndex];
        const mf = inV.mfs[a.mfIndex];
        anteParts.push(`${inV.name}['${mf.name}']`);
      });
      const consPart = `${fis.outputs[0].name}['${fis.outputs[0].mfs[r.consequents[0].mfIndex].name}']`;
      const op = r.connection === 'or' ? ' | ' : ' & ';
      py += `    ctrl.Rule(${anteParts.join(op)}, ${consPart}),\n`;
    });
    py += `]\n\n`;

    py += `# 4. 建立控制器系統並執行模擬\n`;
    py += `system_ctrl = ctrl.ControlSystem(rules)\n`;
    py += `sim = ctrl.ControlSystemSimulation(system_ctrl)\n\n`;
    py += `# 測試輸入\n`;
    fis.inputs.forEach(inp => {
      const mid = (inp.range[0] + inp.range[1]) / 2;
      py += `sim.input['${inp.name}'] = ${mid}\n`;
    });
    py += `sim.compute()\n`;
    py += `print("${fis.outputs[0].name} =", sim.output['${fis.outputs[0].name}'])\n`;

    return py;
  }

  // 產生嵌入式 C 語言輕量化控制器與 11x11 Lookup Table (LUT) 雙線性插值陣列
  function generateEmbeddedCCode() {
    const fis = currentFIS;
    const in1 = fis.inputs[0];
    const in2 = fis.inputs[1] || fis.inputs[0];
    const out = fis.outputs[0];

    const N = 11;
    const lut = [];
    const in1Vals = [];
    const in2Vals = [];

    for (let i = 0; i < N; i++) {
      const v1 = in1.range[0] + (i / (N - 1)) * (in1.range[1] - in1.range[0]);
      in1Vals.push(v1);
    }
    for (let j = 0; j < N; j++) {
      const v2 = in2.range[0] + (j / (N - 1)) * (in2.range[1] - in2.range[0]);
      in2Vals.push(v2);
    }

    for (let i = 0; i < N; i++) {
      const row = [];
      for (let j = 0; j < N; j++) {
        const testInputs = { 0: in1Vals[i], 1: in2Vals[j] };
        const res = inferFIS(testInputs, 0);
        row.push(res ? res.defuzzValue : (out.range[0] + out.range[1]) / 2);
      }
      lut.push(row);
    }

    let c = `/* ============================================================================\n`;
    c += ` * 嵌入式微控制器專用輕量化模糊控制器與 2D 查表陣列 (Embedded Fuzzy LUT Controller)\n`;
    c += ` * 系統名稱: ${fis.name} (${fis.type.toUpperCase()})\n`;
    c += ` * 特性: 零動態記憶體配置 (Zero Malloc)、微秒級響應 (O(1) 雙線性插值)、相容 C99 / MISRA-C\n`;
    c += ` * 適用平台: STM32, ESP32, Arduino, ARM Cortex-M, TI C2000, DSP\n`;
    c += ` * ============================================================================ */\n\n`;
    c += `#include <stdio.h>\n#include <stdint.h>\n#include <math.h>\n\n`;
    c += `/* --- 1. 論域上下限定義 --- */\n`;
    c += `#define FIS_IN1_MIN   (${in1.range[0].toFixed(2)}f)  /* ${in1.name} 下限 */\n`;
    c += `#define FIS_IN1_MAX   (${in1.range[1].toFixed(2)}f)  /* ${in1.name} 上限 */\n`;
    c += `#define FIS_IN2_MIN   (${in2.range[0].toFixed(2)}f)  /* ${in2.name} 下限 */\n`;
    c += `#define FIS_IN2_MAX   (${in2.range[1].toFixed(2)}f)  /* ${in2.name} 上限 */\n`;
    c += `#define FIS_OUT_MIN   (${out.range[0].toFixed(2)}f)  /* ${out.name} 下限 */\n`;
    c += `#define FIS_OUT_MAX   (${out.range[1].toFixed(2)}f)  /* ${out.name} 上限 */\n\n`;
    c += `#define FIS_LUT_GRID_N  (11)\n\n`;
    c += `/* --- 2. 預先離散計算之 11x11 2D 控制輸出查表矩陣 (LUT[11][11]) --- */\n`;
    c += `static const float FUZZY_LUT_11x11[11][11] = {\n`;
    lut.forEach((r, idx) => {
      c += `    { ${r.map(v => v.toFixed(3) + 'f').join(', ')} }${idx < N - 1 ? ',' : ''} /* row ${idx}: ${in1.name} ≈ ${in1Vals[idx].toFixed(1)} */\n`;
    });
    c += `};\n\n`;
    c += `/* --- 3. 雙線性插值即時推論函式 (Bilinear Interpolation) --- */\n`;
    c += `float ${fis.name.toLowerCase()}_eval(float in1, float in2) {\n`;
    c += `    /* 輸入邊界截斷飽和 (Saturation) */\n`;
    c += `    if (in1 < FIS_IN1_MIN) in1 = FIS_IN1_MIN;\n`;
    c += `    if (in1 > FIS_IN1_MAX) in1 = FIS_IN1_MAX;\n`;
    c += `    if (in2 < FIS_IN2_MIN) in2 = FIS_IN2_MIN;\n`;
    c += `    if (in2 > FIS_IN2_MAX) in2 = FIS_IN2_MAX;\n\n`;
    c += `    /* 正規化映射至 [0, 10] 浮點網格坐標 */\n`;
    c += `    float u = (in1 - FIS_IN1_MIN) / (FIS_IN1_MAX - FIS_IN1_MIN) * 10.0f;\n`;
    c += `    float v = (in2 - FIS_IN2_MIN) / (FIS_IN2_MAX - FIS_IN2_MIN) * 10.0f;\n\n`;
    c += `    int i = (int)u;\n`;
    c += `    int j = (int)v;\n`;
    c += `    if (i >= 10) i = 9;\n`;
    c += `    if (j >= 10) j = 9;\n\n`;
    c += `    float s = u - (float)i;\n`;
    c += `    float t = v - (float)j;\n\n`;
    c += `    /* 四相鄰網格頂點查表 */\n`;
    c += `    float q11 = FUZZY_LUT_11x11[i][j];\n`;
    c += `    float q12 = FUZZY_LUT_11x11[i][j + 1];\n`;
    c += `    float q21 = FUZZY_LUT_11x11[i + 1][j];\n`;
    c += `    float q22 = FUZZY_LUT_11x11[i + 1][j + 1];\n\n`;
    c += `    /* 雙線性權重合成 */\n`;
    c += `    float r1 = (1.0f - s) * q11 + s * q21;\n`;
    c += `    float r2 = (1.0f - s) * q12 + s * q22;\n`;
    c += `    float out = (1.0f - t) * r1 + t * r2;\n\n`;
    c += `    /* 輸出防護截斷 */\n`;
    c += `    if (out < FIS_OUT_MIN) out = FIS_OUT_MIN;\n`;
    c += `    if (out > FIS_OUT_MAX) out = FIS_OUT_MAX;\n`;
    c += `    return out;\n`;
    c += `}\n\n`;
    c += `/* --- 4. 測試主程式 (可於本機 gcc / clang 編譯驗證) --- */\n`;
    c += `#ifdef FUZZY_STANDALONE_TEST\n`;
    c += `int main(void) {\n`;
    c += `    float test_in1 = (FIS_IN1_MIN + FIS_IN1_MAX) * 0.5f;\n`;
    c += `    float test_in2 = (FIS_IN2_MIN + FIS_IN2_MAX) * 0.5f;\n`;
    c += `    float output = ${fis.name.toLowerCase()}_eval(test_in1, test_in2);\n`;
    c += `    printf("[Fuzzy Controller Output] in1=%.2f, in2=%.2f => out=%.3f\\n", test_in1, test_in2, output);\n`;
    c += `    return 0;\n`;
    c += `}\n`;
    c += `#endif\n`;

    return c;
  }

  function renderExportCode() {
    const fisCodeEl = document.getElementById('fis-code-matlab');
    if (fisCodeEl) fisCodeEl.value = generateMatlabFisCode();

    const pyCodeEl = document.getElementById('fis-code-python');
    if (pyCodeEl) pyCodeEl.value = generatePythonCode();

    const cCodeEl = document.getElementById('fis-code-c');
    if (cCodeEl) cCodeEl.value = generateEmbeddedCCode();
  }

  function copyCode(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    navigator.clipboard.writeText(el.value).then(() => {
      alert("程式碼已成功複製到剪貼簿！");
    }).catch(err => {
      el.select();
      document.execCommand('copy');
      alert("程式碼已複製！");
    });
  }

  function downloadFile(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function downloadMatlabFis() {
    const code = generateMatlabFisCode();
    downloadFile(`${currentFIS.name}.fis`, code);
  }

  function downloadPythonScript() {
    const code = generatePythonCode();
    downloadFile(`fuzzy_${currentFIS.name}.py`, code);
  }

  function downloadEmbeddedC() {
    const code = generateEmbeddedCCode();
    downloadFile(`fuzzy_${currentFIS.name.toLowerCase()}_lut.c`, code);
  }

  return {
    init: init,
    switchSubTab: switchSubTab,
    loadPreset: loadPreset,
    toggleGuidedMode: toggleGuidedMode,
    toggleType2Mode: toggleType2Mode,
    setType2FOUWidth: setType2FOUWidth,
    setGuidedStep: setGuidedStep,
    nextStep: nextStep,
    prevStep: prevStep,
    toggleStoryDrawer: toggleStoryDrawer,
    updateSystemProp: updateSystemProp,
    selectVariable: selectVariable,
    selectMF: selectMF,
    updateVarProp: updateVarProp,
    updateMFProp: updateMFProp,
    updateMFParam: updateMFParam,
    addVariable: addVariable,
    deleteCurrentVariable: deleteCurrentVariable,
    addMF: addMF,
    deleteCurrentMF: deleteCurrentMF,
    addRuleFromBuilder: addRuleFromBuilder,
    setRuleViewMode: setRuleViewMode,
    quickAddFamRule: quickAddFamRule,
    toggleRule: toggleRule,
    toggleAllRules: toggleAllRules,
    clearAllRules: clearAllRules,
    deleteRule: deleteRule,
    updateViewerInput: updateViewerInput,
    renderMFPlot: renderMFPlot,
    renderRuleViewerPlots: renderRuleViewerPlots,
    renderSurfacePlot: renderSurfacePlot,
    renderExportCode: renderExportCode,
    generateMatlabFisCode: generateMatlabFisCode,
    generatePythonCode: generatePythonCode,
    generateEmbeddedCCode: generateEmbeddedCCode,
    copyCode: copyCode,
    downloadMatlabFis: downloadMatlabFis,
    downloadPythonScript: downloadPythonScript,
    downloadEmbeddedC: downloadEmbeddedC
  };
})();
