# -*- coding: utf-8 -*-
"""
整合並更新 interactive_widgets.js 與 index.html
"""
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import gen_ch4
import gen_ch5
import gen_ch6
import gen_ch7

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend'))
WIDGETS_JS_PATH = os.path.join(FRONTEND_DIR, 'interactive_widgets.js')
INDEX_HTML_PATH = os.path.join(FRONTEND_DIR, 'index.html')

print("1. Updating interactive_widgets.js...")
with open(WIDGETS_JS_PATH, 'r', encoding='utf-8') as f:
    widgets_code = f.read()

# 生成 4 個章節的代碼
ch4_code = gen_ch4.get_ch4_code()
ch5_code = gen_ch5.get_ch5_code()
ch6_code = gen_ch6.get_ch6_code()
ch7_code = gen_ch7.get_ch7_code()

all_new_chapters_code = "\n" + ch4_code + "\n" + ch5_code + "\n" + ch6_code + "\n" + ch7_code + "\n"

# 找到 getChapterInteractiveHtml 的位置並插入代碼
anchor = "  // ==========================================================================\n  // 根據當前章節產生對應 HTML"
if anchor not in widgets_code:
    # 嘗試較短的匹配
    anchor = "function getChapterInteractiveHtml(chapterId) {"
    idx = widgets_code.rfind(anchor)
    if idx == -1:
        raise ValueError("Cannot find insertion point in interactive_widgets.js")
    # 往前找註解
    comment_idx = widgets_code.rfind("// 根據當前章節產生對應 HTML", 0, idx)
    if comment_idx != -1:
        insert_idx = comment_idx
    else:
        insert_idx = idx
else:
    insert_idx = widgets_code.rfind(anchor)

part1 = widgets_code[:insert_idx]
part2 = widgets_code[insert_idx:]

# 在 getChapterInteractiveHtml 中加入 4 個新章節的判定
html_hook = "    if (chapterId === 'fuzzy_control_applications') {\n      return getChapter3FourModulesHtml();\n    }\n"
new_html_branches = """    if (chapterId === 'fuzzy_control_applications') {
      return getChapter3FourModulesHtml();
    }

    if (chapterId === 'fuzzy_numbers_extension') {
      return getChapter4FourModulesHtml();
    }

    if (chapterId === 'fuzzy_decision_evaluation') {
      return getChapter5FourModulesHtml();
    }

    if (chapterId === 'fuzzy_clustering_pattern') {
      return getChapter6FourModulesHtml();
    }

    if (chapterId === 'advanced_fuzzy_neuro') {
      return getChapter7FourModulesHtml();
    }
"""
if html_hook in part2:
    part2 = part2.replace(html_hook, new_html_branches, 1)
else:
    print("Warning: html_hook not matched exactly, trying regex...")
    part2 = re.sub(
        r"if\s*\(\s*chapterId\s*===\s*'fuzzy_control_applications'\s*\)\s*\{\s*return\s+getChapter3FourModulesHtml\(\);\s*\}",
        new_html_branches.strip(),
        part2,
        count=1
    )

# 在 initChapterWidgets 中加入 4 個新章節的初始化
init_hook = """        } else if (chapterId === 'fuzzy_control_applications') {
          renderCh3PracticeList();
          switchCh3Module(ch3ActiveModule || 'all');
          updateCh3PlotA();
          updateCh3PlotB();
          updateCh3PlotC();
          updateCh3PlotD();
        }"""

new_init_branches = """        } else if (chapterId === 'fuzzy_control_applications') {
          renderCh3PracticeList();
          switchCh3Module(ch3ActiveModule || 'all');
          updateCh3PlotA();
          updateCh3PlotB();
          updateCh3PlotC();
          updateCh3PlotD();
        } else if (chapterId === 'fuzzy_numbers_extension') {
          renderCh4PracticeList();
          switchCh4Module(ch4ActiveModule || 'all');
          updateCh4PlotA();
          updateCh4PlotB();
        } else if (chapterId === 'fuzzy_decision_evaluation') {
          renderCh5PracticeList();
          switchCh5Module(ch5ActiveModule || 'all');
          updateCh5PlotA();
          updateCh5PlotB();
        } else if (chapterId === 'fuzzy_clustering_pattern') {
          renderCh6PracticeList();
          switchCh6Module(ch6ActiveModule || 'all');
          updateCh6PlotA();
          updateCh6PlotB();
        } else if (chapterId === 'advanced_fuzzy_neuro') {
          renderCh7PracticeList();
          switchCh7Module(ch7ActiveModule || 'all');
          updateCh7PlotA();
          updateCh7PlotB();
        }"""

if init_hook in part2:
    part2 = part2.replace(init_hook, new_init_branches, 1)
else:
    print("Warning: init_hook not matched exactly, trying regex...")
    part2 = re.sub(
        r"\}\s*else\s+if\s*\(\s*chapterId\s*===\s*'fuzzy_control_applications'\s*\)\s*\{[^}]*updateCh3PlotD\(\);\s*\}",
        new_init_branches.strip(),
        part2,
        count=1
    )

# 在 return { ... } 中匯出新方法
export_hook = "    renderCh3PracticeList: renderCh3PracticeList,\n"
new_exports = """    renderCh3PracticeList: renderCh3PracticeList,
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
"""
if export_hook in part2:
    part2 = part2.replace(export_hook, new_exports, 1)
else:
    print("Warning: export_hook not matched exactly, trying regex...")
    part2 = re.sub(
        r"renderCh3PracticeList:\s*renderCh3PracticeList,\s*",
        new_exports,
        part2,
        count=1
    )

updated_widgets = part1 + all_new_chapters_code + part2

with open(WIDGETS_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(updated_widgets)

print("interactive_widgets.js successfully updated! Total length:", len(updated_widgets))

# =========================================================================
# 2. Updating index.html
# =========================================================================
print("\n2. Updating index.html...")
with open(INDEX_HTML_PATH, 'r', encoding='utf-8') as f:
    html_code = f.read()

# 2.1 更新 ROADMAP_STAGES 為 7 大階段
new_roadmap_stages_js = r'''    const ROADMAP_STAGES = [
      {
        stageId: 'stage_1',
        stageNumber: 'Stage 01',
        title: '基礎根基篇：Chapter 01 模糊集合基礎',
        subtitle: '通論、專書 1~2 章 22 頁精讀、四大歸屬函數與 8 題測驗',
        accentColor: 'sky',
        badgeIcon: '🌱',
        nodes: [
          {
            id: 's1_n1',
            code: '1-1',
            title: '【模組 1：通論】明確集合 vs. 模糊集合與 Zadeh 標準表示法',
            desc: '掌握明確特徵函數與模糊歸屬度閉區間 [0, 1] 差異、八大代數定律（矛盾律與排中律失效）與連續積分記號。',
            typeTag: '🧭 模組 1：通論 (Overview)',
            action: { tab: 'theory', chapterId: 'fuzzy_sets', ch1Module: 'm1', scrollTo: 'ch1-module-sec-m1' }
          },
          {
            id: 's1_n2',
            code: '1-2',
            title: '【模組 2：逐頁精讀】《認識 Fuzzy》第 1、2 章書頁原圖導讀（共 22 頁）',
            desc: '依序精讀第 1 章緒論與第 2 章模糊集合定義、圖 2.1~2.9 與公式，支援點擊全螢幕照片燈箱。',
            typeTag: '📸 模組 2：22 頁逐頁精讀',
            action: { tab: 'theory', chapterId: 'fuzzy_sets', ch1Module: 'm2', scrollTo: 'ch1-module-sec-m2' }
          },
          {
            id: 's1_n3',
            code: '1-3',
            title: '【模組 3：多維度模擬圖】(a)邊界過渡 (b)四大函數造型 (c)交聯補集 (d)α-截集切線',
            desc: '操作 4 座獨立 Plotly.js 互動模擬器，驗證平滑邊界、三角/高斯造型、排中律破除與水平截割。',
            typeTag: '📊 模組 3：4 座互動模擬圖',
            action: { tab: 'theory', chapterId: 'fuzzy_sets', ch1Module: 'm3', scrollTo: 'ch1-module-sec-m3' }
          },
          {
            id: 's1_n4',
            code: '1-4',
            title: '【模組 4：章節題目練習與詳解】課堂必考觀念、課後習題與跨校考題 (8題)',
            desc: '挑戰 8 道由淺入深的選擇與計算題（含純基數、底集、強截集與凸性判別），附完整推導詳解。',
            typeTag: '✍️ 模組 4：題目練習與詳解',
            action: { tab: 'theory', chapterId: 'fuzzy_sets', ch1Module: 'm4', scrollTo: 'ch1-module-sec-m4' }
          }
        ]
      },
      {
        stageId: 'stage_2',
        stageNumber: 'Stage 02',
        title: '模糊關係篇：Chapter 02 模糊關係與模糊推論',
        subtitle: '笛卡兒積、Max-Min 矩陣合成、Mamdani 截頂 vs 縮放與四大解模糊化',
        accentColor: 'indigo',
        badgeIcon: '📐',
        nodes: [
          {
            id: 's2_n1',
            code: '2-1',
            title: '【模組 1：通論】明確關係 vs. 模糊關係、笛卡兒積與等價關係',
            desc: '關聯度由 0/1 推廣至連續閉區間 [0, 1]，掌握笛卡兒積 R = A × B 與等價關係三大公理。',
            typeTag: '🏛️ 模組 1：理論架構',
            action: { tab: 'theory', chapterId: 'fuzzy_relations_inference', ch2Module: 'm1', scrollTo: 'ch2-module-sec-m1' }
          },
          {
            id: 's2_n2',
            code: '2-2',
            title: '【模組 2：逐頁精讀】《認識 Fuzzy》第 4、5 章書頁精讀（共 43 頁）',
            desc: '精讀模糊關係矩陣推導、投影算子、近似推論與解模糊化公式，支援原書照片放大檢視。',
            typeTag: '📘 模組 2：43 頁精讀',
            action: { tab: 'theory', chapterId: 'fuzzy_relations_inference', ch2Module: 'm2', scrollTo: 'ch2-module-sec-m2' }
          },
          {
            id: 's2_n3',
            code: '2-3',
            title: '【模組 3：模擬器 (a)(b)(c)(d)】笛卡兒積 3D 曲面、3×3 矩陣合成、截頂縮放與四大解模糊化',
            desc: '拉動滑桿體驗 3D 關係熱力曲面、逐步手算 Max-Min/Max-Product，並對照重心法 COG 等四條指標線。',
            typeTag: '📊 模組 3：4 座互動模擬圖',
            action: { tab: 'theory', chapterId: 'fuzzy_relations_inference', ch2Module: 'm3', scrollTo: 'ch2-plot-card-a' }
          },
          {
            id: 's2_n4',
            code: '2-4',
            title: '【模組 4：題目練習與詳解】Max-Min 合成、等價關係與離散重心法手算 (8題)',
            desc: '挑戰 8 道精選題目（包含定理證明、單點截頂梯形底集、離散重心法與 MOM 計算），附完整詳解。',
            typeTag: '✍️ 模組 4：題目練習與詳解',
            action: { tab: 'theory', chapterId: 'fuzzy_relations_inference', ch2Module: 'm4', scrollTo: 'ch2-module-sec-m4' }
          }
        ]
      },
      {
        stageId: 'stage_3',
        stageNumber: 'Stage 03',
        title: '控制實務篇：Chapter 03 模糊控制器設計與實務應用',
        subtitle: 'FLC 四大模組、5×5 FAM 規則矩陣高亮激發、3D 控制曲面與重症決策',
        accentColor: 'emerald',
        badgeIcon: '🎛️',
        nodes: [
          {
            id: 's3_n1',
            code: '3-1',
            title: '【模組 1：通論】FLC 四大核心模組、量化因子與 5×5 FAM 反對角線阻尼法則',
            desc: '掌握閉迴路 FLC 訊號流、誤差 e 與變化率 Δe 物理意義，以及 Mamdani 與 TSK 控制器工程權衡。',
            typeTag: '🏛️ 模組 1：系統架構',
            action: { tab: 'theory', chapterId: 'fuzzy_control_applications', ch3Module: 'm1', scrollTo: 'ch3-module-sec-m1' }
          },
          {
            id: 's3_n2',
            code: '3-2',
            title: '【模組 2：逐頁精讀】《認識 Fuzzy》第 6~10 章 控制與實務精讀（共 78 頁）',
            desc: '涵蓋模糊控制設計步驟、冷氣溫控、洗衣機與家電實務，支援 78 頁原書照片前後翻頁燈箱。',
            typeTag: '📘 模組 2：78 頁精讀',
            action: { tab: 'theory', chapterId: 'fuzzy_control_applications', ch3Module: 'm2', scrollTo: 'ch3-module-sec-m2' }
          },
          {
            id: 's3_n3',
            code: '3-3',
            title: '【模組 3：模擬器 (a)(b)(c)(d)】冷氣 5×5 FAM 高亮、3D 控制曲面、TSK 煞車與醫療預警',
            desc: '操作 4 座實戰模擬器：拉動誤差高亮規則格、3D 非線性控制曲面、Sugeno 煞車加權與臨床檢傷決策。',
            typeTag: '📊 模組 3：4 座實戰模擬圖',
            action: { tab: 'theory', chapterId: 'fuzzy_control_applications', ch3Module: 'm3', scrollTo: 'ch3-plot-card-a' }
          },
          {
            id: 's3_n4',
            code: '3-4',
            title: '【模組 4：題目練習與詳解】FAM 觸發幾何、雙輸入手算與 TSK 線性方程 (6題)',
            desc: '挑戰 6 道精選實戰題（涵蓋 FLC 組件分析、最大 4 條規則激發證明與 TSK 加權平均），附完整詳解。',
            typeTag: '✍️ 模組 4：題目練習與詳解',
            action: { tab: 'theory', chapterId: 'fuzzy_control_applications', ch3Module: 'm4', scrollTo: 'ch3-module-sec-m4' }
          }
        ]
      },
      {
        stageId: 'stage_4',
        stageNumber: 'Stage 04',
        title: '擴展算術篇：Chapter 04 模糊數與擴展原理',
        subtitle: 'Zadeh 擴展原理非單射映射、模糊數三大公理、α-cut 區間加減乘除',
        accentColor: 'amber',
        badgeIcon: '⚡',
        nodes: [
          {
            id: 's4_n1',
            code: '4-1',
            title: '【模組 1：通論】Zadeh 擴展原理定理、模糊數定義與區間算術對照表',
            desc: '系統化掌握非單射映射確界（Supremum）聚合、模糊數凸性與正規性，以及 α-cut 區間四則運算。',
            typeTag: '🧭 模組 1：通論 (Overview)',
            action: { tab: 'theory', chapterId: 'fuzzy_numbers_extension', ch4Module: 'm1', scrollTo: 'ch4-module-sec-m1' }
          },
          {
            id: 's4_n2',
            code: '4-2',
            title: '【模組 2：逐頁精讀】《認識 Fuzzy》第 3 章 專書精讀（共 15 頁）',
            desc: '逐頁研讀擴展原理、三角形模糊數加減乘除手算範例與非線性映射曲線，支援點擊全螢幕照片燈箱。',
            typeTag: '📘 模組 2：15 頁精讀',
            action: { tab: 'theory', chapterId: 'fuzzy_numbers_extension', ch4Module: 'm2', scrollTo: 'ch4-module-sec-m2' }
          },
          {
            id: 's4_n3',
            code: '4-3',
            title: '【模組 3：模擬器 (a)(b)】y = x² 函數映射動態模擬器 & 三角形模糊數四則運算合成',
            desc: '拉動滑桿觀察非單射映射如何產生 Sup 聚合，並即時切換加減乘除觀察 α-cut 水平切割區間。',
            typeTag: '📊 模組 3：2 座互動模擬圖',
            action: { tab: 'theory', chapterId: 'fuzzy_numbers_extension', ch4Module: 'm3', scrollTo: 'ch4-plot-card-a' }
          },
          {
            id: 's4_n4',
            code: '4-4',
            title: '【模組 4：章節題目練習與詳解】擴展原理非單射映射、區間算術與奇異點 (5題)',
            desc: '挑戰 5 道深度計算題（含 y=x² 頂點底集、模糊數相減不確定性擴散與除法分母非零條件），附完整推導。',
            typeTag: '✍️ 模組 4：題目練習與詳解',
            action: { tab: 'theory', chapterId: 'fuzzy_numbers_extension', ch4Module: 'm4', scrollTo: 'ch4-module-sec-m4' }
          }
        ]
      },
      {
        stageId: 'stage_5',
        stageNumber: 'Stage 05',
        title: '決策評判篇：Chapter 05 模糊決策與多屬性綜合評判',
        subtitle: 'Bellman-Zadeh 目標限制對稱模型、最佳決策點 x* 與綜合評判矩陣 B = W ○ R',
        accentColor: 'rose',
        badgeIcon: '🎯',
        nodes: [
          {
            id: 's5_n1',
            code: '5-1',
            title: '【模組 1：通論】Bellman-Zadeh 對稱決策原理與多屬性綜合評判模型',
            desc: '掌握目標與限制之對稱交集決策 D = G ∩ C，以及主因素決定型與加權平均型評判矩陣算子。',
            typeTag: '🏛️ 模組 1：通論 (Overview)',
            action: { tab: 'theory', chapterId: 'fuzzy_decision_evaluation', ch5Module: 'm1', scrollTo: 'ch5-module-sec-m1' }
          },
          {
            id: 's5_n2',
            code: '5-2',
            title: '【模組 2：逐頁精讀】《認識 Fuzzy》第 13、14 章 專書精讀（共 34 頁）',
            desc: '精讀模糊決策矩陣、多指標權重設定、人事評估與工程方案選型案例，支援 34 頁高畫質照片燈箱。',
            typeTag: '📘 模組 2：34 頁精讀',
            action: { tab: 'theory', chapterId: 'fuzzy_decision_evaluation', ch5Module: 'm2', scrollTo: 'ch5-module-sec-m2' }
          },
          {
            id: 's5_n3',
            code: '5-3',
            title: '【模組 3：模擬器 (a)(b)】Bellman-Zadeh 最佳決策搜尋 & 多指標評判權重實驗室',
            desc: '拉動目標斜率與預算門檻動態搜尋最優決策點 x*，並微調三項權重即時生成評語長條分佈。',
            typeTag: '📊 模組 3：2 座互動模擬圖',
            action: { tab: 'theory', chapterId: 'fuzzy_decision_evaluation', ch5Module: 'm3', scrollTo: 'ch5-plot-card-a' }
          },
          {
            id: 's5_n4',
            code: '5-4',
            title: '【模組 4：章節題目練習與詳解】最優決策點手算、評判矩陣合成與算子失效 (5題)',
            desc: '挑戰 5 道實務題目（包含兩直線交點手算、Min-Max 矩陣乘法與加權評分轉換），附完整逐步詳解。',
            typeTag: '✍️ 模組 4：題目練習與詳解',
            action: { tab: 'theory', chapterId: 'fuzzy_decision_evaluation', ch5Module: 'm4', scrollTo: 'ch5-module-sec-m4' }
          }
        ]
      },
      {
        stageId: 'stage_6',
        stageNumber: 'Stage 06',
        title: '分群識別篇：Chapter 06 模糊分群與圖形識別',
        subtitle: '傳遞閉包平方法、λ-截集動態分群樹、FCM 柔性分群與海明貼近度',
        accentColor: 'cyan',
        badgeIcon: '🔬',
        nodes: [
          {
            id: 's6_n1',
            code: '6-1',
            title: '【模組 1：通論】模糊相似矩陣、傳遞閉包平方法與 FCM 演算法架構',
            desc: '掌握自反與對稱矩陣之傳遞性補足、平方法快速收斂定理、FCM 目標函數優化與模糊指數 m 意涵。',
            typeTag: '🏛️ 模組 1：通論 (Overview)',
            action: { tab: 'theory', chapterId: 'fuzzy_clustering_pattern', ch6Module: 'm1', scrollTo: 'ch6-module-sec-m1' }
          },
          {
            id: 's6_n2',
            code: '6-2',
            title: '【模組 2：逐頁精讀】《認識 Fuzzy》第 12、16 章 專書精讀（共 24 頁）',
            desc: '精讀模糊群聚演算法、階層分群樹狀圖繪製、特徵抽取與海明/歐氏貼近度圖形識別手算步驟。',
            typeTag: '📘 模組 2：24 頁精讀',
            action: { tab: 'theory', chapterId: 'fuzzy_clustering_pattern', ch6Module: 'm2', scrollTo: 'ch6-module-sec-m2' }
          },
          {
            id: 's6_n3',
            code: '6-3',
            title: '【模組 3：模擬器 (a)(b)】傳遞閉包 λ-Cut 分割樹 & FCM 2D 柔性分群散佈圖',
            desc: '拉動 λ 滑桿觀察等價類動態分割，並調整模糊係數 m 觀察資料點歸屬度漸層色與群心坐標。',
            typeTag: '📊 模組 3：2 座互動模擬圖',
            action: { tab: 'theory', chapterId: 'fuzzy_clustering_pattern', ch6Module: 'm3', scrollTo: 'ch6-plot-card-a' }
          },
          {
            id: 's6_n4',
            code: '6-4',
            title: '【模組 4：章節題目練習與詳解】傳遞閉包手算、λ-截集分群與貼近度辨識 (5題)',
            desc: '挑戰 5 道深度計算題（含有限步收斂證明、4 樣本截割等價類劃分與 FCM 退化極限），附完整詳解。',
            typeTag: '✍️ 模組 4：題目練習與詳解',
            action: { tab: 'theory', chapterId: 'fuzzy_clustering_pattern', ch6Module: 'm4', scrollTo: 'ch6-module-sec-m4' }
          }
        ]
      },
      {
        stageId: 'stage_7',
        stageNumber: 'Stage 07',
        title: '進階智能篇：Chapter 07 進階模糊系統、類神經模糊與綜合應用',
        subtitle: 'ANFIS 五層拓撲架構、混合學習演算法 (LSE+BP)、自適應模糊 PID 與倒單擺平衡',
        accentColor: 'violet',
        badgeIcon: '🧠',
        nodes: [
          {
            id: 's7_n1',
            code: '7-1',
            title: '【模組 1：通論】ANFIS 自適應類神經網路、混合學習與模糊自整定 PID',
            desc: '掌握前件部高斯函數與後件部線性多項式分離優化、前向 LSE 與反向 BP 梯度，以及自整定增益法則。',
            typeTag: '🏛️ 模組 1：通論 (Overview)',
            action: { tab: 'theory', chapterId: 'advanced_fuzzy_neuro', ch7Module: 'm1', scrollTo: 'ch7-module-sec-m1' }
          },
          {
            id: 's7_n2',
            code: '7-2',
            title: '【模組 2：逐頁精讀】《認識 Fuzzy》第 11、15、17、18、19 章 精讀（共 66 頁）',
            desc: '精讀類神經模糊、家電控制、倒單擺平衡與汽車輔助煞車全書原版電路與實務，支援 66 頁原圖燈箱。',
            typeTag: '📘 模組 2：66 頁精讀',
            action: { tab: 'theory', chapterId: 'advanced_fuzzy_neuro', ch7Module: 'm2', scrollTo: 'ch7-module-sec-m2' }
          },
          {
            id: 's7_n3',
            code: '7-3',
            title: '【模組 3：模擬器 (a)(b)】ANFIS 函數自我學習擬合 & 自適應模糊 vs PID 步階響應',
            desc: '拉動 Epochs 觀察歸屬函數收斂與 RMSE 下降，並調整負載擾動對比超調量與調節時間曲線。',
            typeTag: '📊 模組 3：2 座互動模擬圖',
            action: { tab: 'theory', chapterId: 'advanced_fuzzy_neuro', ch7Module: 'm3', scrollTo: 'ch7-plot-card-a' }
          },
          {
            id: 's7_n4',
            code: '7-4',
            title: '【模組 4：章節題目練習與詳解】ANFIS 節點推導、一階 TSK 手算與相平面收斂 (5題)',
            desc: '挑戰 5 道高階題目（含混合學習解耦、TSK 加權平均值、自適應增益整定與倒單擺反對角阻尼），附詳解。',
            typeTag: '✍️ 模組 4：題目練習與詳解',
            action: { tab: 'theory', chapterId: 'advanced_fuzzy_neuro', ch7Module: 'm4', scrollTo: 'ch7-module-sec-m4' }
          }
        ]
      }
    ];'''

# 替換 ROADMAP_STAGES
pattern_roadmap = r"const ROADMAP_STAGES = \[[\s\S]*?\];\s*// 全域狀態"
html_code = re.sub(pattern_roadmap, new_roadmap_stages_js + "\n\n    // 全域狀態", html_code, count=1)

# 2.2 更新 currentBookSubChapter 與 currentBookPageFilter
new_book_subch = r'''    // 各大主章節當前選中的書本子章節與頁碼過濾器
    let currentBookSubChapter = {
      fuzzy_sets: 2,
      fuzzy_relations_inference: 4,
      fuzzy_control_applications: 6,
      fuzzy_numbers_extension: 3,
      fuzzy_decision_evaluation: 13,
      fuzzy_clustering_pattern: 12,
      advanced_fuzzy_neuro: 11
    };

    let currentBookPageFilter = {
      fuzzy_sets: 'all',
      fuzzy_relations_inference: 'all',
      fuzzy_control_applications: 'all',
      fuzzy_numbers_extension: 'all',
      fuzzy_decision_evaluation: 'all',
      fuzzy_clustering_pattern: 'all',
      advanced_fuzzy_neuro: 'all'
    };'''

pattern_subch = r"// 各大主章節當前選中的書本子章節與頁碼過濾器[\s\S]*?advanced_fuzzy_neuro[^\n]*\n\s*\};"
if re.search(pattern_subch, html_code):
    html_code = re.sub(pattern_subch, new_book_subch, html_code, count=1)
else:
    pattern_old_subch = r"// 各大主章節當前選中的書本子章節與頁碼過濾器[\s\S]*?fuzzy_control_applications:\s*'all'\s*\};"
    html_code = re.sub(pattern_old_subch, new_book_subch, html_code, count=1)

# 2.3 更新 switchBookSubChapter 與 filterBookSubPage
new_switch_book = r'''    function refreshParentBookGallery(parentChapterId) {
      if (parentChapterId === 'fuzzy_sets') {
        renderChapter2BookPagesSection();
      } else if (parentChapterId === 'fuzzy_relations_inference') {
        renderChapter34BookPagesSection();
      } else if (parentChapterId === 'fuzzy_control_applications') {
        renderChapter56BookPagesSection();
      } else if (parentChapterId === 'fuzzy_numbers_extension') {
        renderChapter4BookPagesSection();
      } else if (parentChapterId === 'fuzzy_decision_evaluation') {
        renderChapter5BookPagesSection();
      } else if (parentChapterId === 'fuzzy_clustering_pattern') {
        renderChapter6BookPagesSection();
      } else if (parentChapterId === 'advanced_fuzzy_neuro') {
        renderChapter7BookPagesSection();
      }
    }

    function switchBookSubChapter(parentChapterId, subChapterNum) {
      currentBookSubChapter[parentChapterId] = Number(subChapterNum);
      currentBookPageFilter[parentChapterId] = 'all';
      refreshParentBookGallery(parentChapterId);
    }

    function filterBookSubPage(parentChapterId, pageId) {
      currentBookPageFilter[parentChapterId] = pageId;
      refreshParentBookGallery(parentChapterId);
    }'''

pattern_switch = r"function switchBookSubChapter\(parentChapterId, subChapterNum\) \{[\s\S]*?renderChapter56BookPagesSection\(\);\s*\}\s*\}"
html_code = re.sub(pattern_switch, new_switch_book, html_code, count=1)

# 2.4 新增 renderChapter4 ~ renderChapter7 BookPagesSection
new_gallery_funcs = r'''    function renderChapter2BookPagesSection() {
      renderParentBookGallery('fuzzy_sets', 'chapter2-book-gallery-body', 'sky');
    }

    function renderChapter34BookPagesSection() {
      renderParentBookGallery('fuzzy_relations_inference', 'chapter34-book-gallery-body', 'indigo');
    }

    function renderChapter56BookPagesSection() {
      renderParentBookGallery('fuzzy_control_applications', 'chapter56-book-gallery-body', 'emerald');
    }

    function renderChapter4BookPagesSection() {
      renderParentBookGallery('fuzzy_numbers_extension', 'chapter4-book-gallery-body', 'amber');
    }

    function renderChapter5BookPagesSection() {
      renderParentBookGallery('fuzzy_decision_evaluation', 'chapter5-book-gallery-body', 'rose');
    }

    function renderChapter6BookPagesSection() {
      renderParentBookGallery('fuzzy_clustering_pattern', 'chapter6-book-gallery-body', 'cyan');
    }

    function renderChapter7BookPagesSection() {
      renderParentBookGallery('advanced_fuzzy_neuro', 'chapter7-book-gallery-body', 'violet');
    }'''

pattern_gallery_old = r"function renderChapter2BookPagesSection\(\) \{[\s\S]*?renderParentBookGallery\('fuzzy_control_applications', 'chapter56-book-gallery-body', 'emerald'\);\s*\}"
html_code = re.sub(pattern_gallery_old, new_gallery_funcs, html_code, count=1)

# 2.5 更新 selectChapter 的節點對應
new_select_map = r'''      const chapterToNodeMap = {
        fuzzy_sets: 's1_n1',
        fuzzy_relations_inference: 's2_n1',
        fuzzy_control_applications: 's3_n1',
        fuzzy_numbers_extension: 's4_n1',
        fuzzy_decision_evaluation: 's5_n1',
        fuzzy_clustering_pattern: 's6_n1',
        advanced_fuzzy_neuro: 's7_n1'
      };'''
pattern_select_map = r"const chapterToNodeMap = \{[\s\S]*?fuzzy_inference:\s*'s3_n1'\s*\};"
html_code = re.sub(pattern_select_map, new_select_map, html_code, count=1)

# 2.6 更新 renderChapterNav 支援所有 7 個章節的子選單按鈕
new_render_nav = r'''    function renderChapterNav() {
      const navList = document.getElementById('chapter-nav-list');
      const getActiveMod = (fn) => (window.FuzzyWidgets && typeof fn === 'function') ? fn() : 'all';

      const modStateMap = {
        fuzzy_sets: { mod: getActiveMod(window.FuzzyWidgets && FuzzyWidgets.getActiveCh1Module), chNum: 1, color: 'sky', switchFn: 'switchCh1Module' },
        fuzzy_relations_inference: { mod: getActiveMod(window.FuzzyWidgets && FuzzyWidgets.getActiveCh2Module), chNum: 2, color: 'indigo', switchFn: 'switchCh2Module' },
        fuzzy_control_applications: { mod: getActiveMod(window.FuzzyWidgets && FuzzyWidgets.getActiveCh3Module), chNum: 3, color: 'emerald', switchFn: 'switchCh3Module' },
        fuzzy_numbers_extension: { mod: getActiveMod(window.FuzzyWidgets && FuzzyWidgets.getActiveCh4Module), chNum: 4, color: 'amber', switchFn: 'switchCh4Module' },
        fuzzy_decision_evaluation: { mod: getActiveMod(window.FuzzyWidgets && FuzzyWidgets.getActiveCh5Module), chNum: 5, color: 'rose', switchFn: 'switchCh5Module' },
        fuzzy_clustering_pattern: { mod: getActiveMod(window.FuzzyWidgets && FuzzyWidgets.getActiveCh6Module), chNum: 6, color: 'cyan', switchFn: 'switchCh6Module' },
        advanced_fuzzy_neuro: { mod: getActiveMod(window.FuzzyWidgets && FuzzyWidgets.getActiveCh7Module), chNum: 7, color: 'violet', switchFn: 'switchCh7Module' }
      };

      navList.innerHTML = courseData.chapters.map(ch => {
        const isActive = ch.id === activeChapterId;
        const info = modStateMap[ch.id];

        let subMenuHtml = '';
        if (isActive && info) {
          const num = info.chNum;
          const curMod = info.mod;
          const fn = info.switchFn;
          const col = info.color;
          const activeBg = `bg-gradient-to-r from-${col}-500 to-${col === 'amber' ? 'orange' : col === 'sky' ? 'indigo' : col === 'rose' ? 'pink' : col === 'cyan' ? 'blue' : 'purple'}-600 text-white font-bold shadow-md`;

          subMenuHtml = `
            <div class="mt-1.5 ml-3 pl-3 border-l-2 border-${col}-500/35 space-y-1.5 py-1.5">
              <div class="text-[11px] font-bold uppercase tracking-wider text-${col}-400/90 px-2 pb-0.5">
                Chapter 0${num} 四大標準學習模組
              </div>
              <button id="ch${num}-subtab-btn-all" onclick="FuzzyWidgets.${fn}('all', true)"
                class="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 ${curMod === 'all' ? activeBg : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'}">
                <span>📑</span>
                <span>展開全部 4 大模組</span>
              </button>
              <button id="ch${num}-subtab-btn-m1" onclick="FuzzyWidgets.${fn}('m1', true)"
                class="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 ${curMod === 'm1' ? activeBg : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'}">
                <span>🏛️</span>
                <span>【模組 1】通論 (Overview)</span>
              </button>
              <button id="ch${num}-subtab-btn-m2" onclick="FuzzyWidgets.${fn}('m2', true)"
                class="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 ${curMod === 'm2' ? activeBg : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'}">
                <span>📘</span>
                <span>【模組 2】專書逐頁精讀</span>
              </button>
              <button id="ch${num}-subtab-btn-m3" onclick="FuzzyWidgets.${fn}('m3', true)"
                class="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 ${curMod === 'm3' ? activeBg : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'}">
                <span>📊</span>
                <span>【模組 3】多維度模擬圖</span>
              </button>
              <button id="ch${num}-subtab-btn-m4" onclick="FuzzyWidgets.${fn}('m4', true)"
                class="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 ${curMod === 'm4' ? activeBg : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'}">
                <span>✍️</span>
                <span>【模組 4】題目練習與詳解</span>
              </button>
            </div>
          `;
        }

        return `
          <div class="space-y-1">
            <button onclick="selectChapter('${ch.id}')"
              class="w-full text-left px-4 py-3 rounded-xl transition flex flex-col gap-0.5 ${isActive ? 'chapter-active font-bold' : 'hover:bg-slate-800/70 text-slate-300'}">
              <span class="text-xs uppercase tracking-wider ${isActive ? 'text-sky-400' : 'text-slate-500'}">${ch.number}</span>
              <span class="text-base leading-snug">${ch.title.split(' (')[0]}</span>
            </button>
            ${subMenuHtml}
          </div>
        `;
      }).join('');
    }'''

pattern_render_nav = r"function renderChapterNav\(\) \{[\s\S]*?return `\s*<div class=\"space-y-1\">[\s\S]*?\}\)\.join\(''\);\s*\}"
html_code = re.sub(pattern_render_nav, new_render_nav, html_code, count=1)

# 2.7 更新 renderChapterContent 支持全 7 章渲染四大模組
new_render_chapter_content = r'''    function renderChapterContent(chapterId) {
      const ch = courseData.chapters.find(c => c.id === chapterId);
      if (!ch) return;

      const container = document.getElementById('chapter-content-container');

      const headerCardHtml = `
        <!-- 章節標頭卡 -->
        <div class="glass-panel rounded-3xl p-7 sm:p-9 border border-sky-500/25 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">${ch.number}</span>
            <div class="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-300">
              <span class="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">📘 ${ch.book_source}</span>
              <span class="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">📑 ${ch.slide_source}</span>
            </div>
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl sm:text-3xl font-bold text-white leading-tight">${ch.title}</h2>
            <p class="text-base sm:text-lg text-sky-300 font-medium">${ch.subtitle}</p>
          </div>
          <div class="prose-reading border-t border-slate-800/90 pt-5 mb-0">
            <p class="mb-0">${formatRichText(ch.overview)}</p>
          </div>
        </div>
      `;

      const footerNavHtml = `
        <!-- 章節底部打卡與下一關引導 -->
        <div class="glass-panel rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <button onclick="switchTab('roadmap')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition">
            🗺️ 返回智慧學習地圖
          </button>
          <button onclick="toggleCurrentNodeComplete()" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20">
            ✅ 學完本章節・標記完成並前往下一關 →
          </button>
        </div>
      `;

      const chapterGalleryMap = {
        fuzzy_sets: renderChapter2BookPagesSection,
        fuzzy_relations_inference: renderChapter34BookPagesSection,
        fuzzy_control_applications: renderChapter56BookPagesSection,
        fuzzy_numbers_extension: renderChapter4BookPagesSection,
        fuzzy_decision_evaluation: renderChapter5BookPagesSection,
        fuzzy_clustering_pattern: renderChapter6BookPagesSection,
        advanced_fuzzy_neuro: renderChapter7BookPagesSection
      };

      if (chapterGalleryMap[chapterId]) {
        container.innerHTML = `
          ${headerCardHtml}
          ${window.FuzzyWidgets ? FuzzyWidgets.getChapterInteractiveHtml(chapterId) : ''}
          ${footerNavHtml}
        `;
        chapterGalleryMap[chapterId]();
        if (window.FuzzyWidgets && typeof FuzzyWidgets.initChapterWidgets === 'function') {
          setTimeout(() => FuzzyWidgets.initChapterWidgets(chapterId), 60);
        }
        safeTypesetMath([container]);
        return;
      }'''

pattern_render_content = r"function renderChapterContent\(chapterId\) \{[\s\S]*?// 若為 Chapter 03 \(fuzzy_control_applications\)[\s\S]*?safeTypesetMath\(\[container\]\);\s*return;\s*\}"
html_code = re.sub(pattern_render_content, new_render_chapter_content, html_code, count=1)

# 2.8 匯出新函式至 window
new_window_exports = r'''    window.renderChapter4BookPagesSection = renderChapter4BookPagesSection;
    window.renderChapter5BookPagesSection = renderChapter5BookPagesSection;
    window.renderChapter6BookPagesSection = renderChapter6BookPagesSection;
    window.renderChapter7BookPagesSection = renderChapter7BookPagesSection;
    window.refreshParentBookGallery = refreshParentBookGallery;
    window.selectChapter = selectChapter;'''
pattern_window_exports = r"window\.selectChapter\s*=\s*selectChapter;"
html_code = re.sub(pattern_window_exports, new_window_exports, html_code, count=1)

with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
    f.write(html_code)

print("index.html successfully updated! Total length:", len(html_code))
