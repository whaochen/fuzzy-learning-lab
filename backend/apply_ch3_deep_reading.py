# -*- coding: utf-8 -*-
"""
將《認識 Fuzzy》第三章（15頁，頁 3-1 ～ 3-15）深度精讀 OCR 數據
全面同步至 frontend/course_data.json, frontend/course_data.js, 與 frontend/book_pages.js
"""

import os
import sys
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')
COURSE_DATA_JSON = os.path.join(FRONTEND_DIR, 'course_data.json')
COURSE_DATA_JS = os.path.join(FRONTEND_DIR, 'course_data.js')
BOOK_PAGES_JS = os.path.join(FRONTEND_DIR, 'book_pages.js')

# ==========================================
# 第三章 15 頁 OCR 萃取內容 (3-1 ~ 3-15)
# ==========================================
CH3_PAGES = [
    {
        "page_id": "3-1",
        "section": "第三章 模糊集合之基本性質 章首扉頁",
        "title": "第三章 模糊集合之基本性質 扉頁導引與雙連桿機械手臂示意",
        "summary": "第三章標題為「模糊集合之基本性質」。本章作為模糊集合論的核心理論承接章節，主要目的在於架構模糊集合與明確集合（Crisp Sets）之間的橋樑（透過 α-截集與強截集），深入探討模糊運算的集合論性質、層次分解機制，以及如何將傳統明確函數映射擴展至模糊領域的關鍵理論——「延伸原理 (Extension Principle)」。扉頁附圖展示了一具雙連桿機械手臂（Robotic Linkage Arm）在不同關節角度與姿態下的運動結構示意，象徵本章的模糊理論（特別是延伸原理與非線性映射）廣泛應用於機器人逆向運動學、非線性機構控制與狀態不確定性評估等工程實務。",
        "formulas": [],
        "book_examples": [
            "章首插圖：雙連桿機械手臂機構示意圖，展現模糊集合性質與延伸原理在連桿關節角度與末端位姿非線性轉換中的工程應用背景。"
        ]
    },
    {
        "page_id": "3-2",
        "section": "3.1 截集之一些性質",
        "title": "α-截集的橋樑角色、標準補集與平衡點",
        "summary": "本頁開啟第 3.1 節「截集之一些性質」。作者特別強調 α-截集（α-cut）及 α-強截集（strong α-cut）在模糊集合論中扮演著極其關鍵的橋樑角色，因為它們成功將模糊概念降維轉換為經典的「明確集合（Crisp Sets）」，使得傳統數學工具能直接應用於模糊系統。作者嚴正提醒：「模糊集合之 α-截集及 α-強截集是『明確集合』，而非模糊集合」，這是學習模糊理論必須牢記的根本觀念。接著導入定義在宇集合 X 上的模糊集合之基本運算：標準補集合 (Standard Complement) 以 $\\bar{A}$ 表示，定義為 $\\bar{A}(x) = 1 - A(x)$；若宇集合中之元素 $x \\in X$ 滿足 $\\bar{A}(x) = A(x)$，則該點稱為模糊集合 A 之平衡點 (Equilibrium Points)。代入定義即 $1 - A(x) = A(x) \\iff A(x) = 0.5$，代表歸屬與不歸屬程度完全相等的交界臨界點。頁尾並引出標準交集之預告。",
        "formulas": [
            "$$\\bar{A}(x) = 1 - A(x) \\quad (3.1)$$",
            "$$\\bar{A}(x) = A(x) \\iff A(x) = 0.5$$"
        ],
        "book_examples": [
            "圖 3.1：模糊集合 A 與其標準補集合 $\\bar{A}$ 的歸屬函數幾何圖形。圖中明確標示兩者相交於歸屬度 0.5 之處，交點對應的橫坐標 $\\hat{x}_1$ 與 $\\hat{x}_2$ 即為該模糊集合 A 之平衡點 (Equilibrium Points)。",
            "重要觀念提醒：模糊集合之 α-截集 ($^\\alpha A$) 與 α-強截集 ($^{\\alpha+} A$) 本質上均為「明確集合」，絕非模糊集合。"
        ]
    },
    {
        "page_id": "3-3",
        "section": "3.1 截集之一些性質",
        "title": "標準交集、標準聯集與截集基本定理 (定理 3.1)",
        "summary": "本頁定義了標準交集 (Standard Intersection) 與標準聯集 (Standard Union)。在定義域 X 上，對任意兩個模糊集合 A 與 B：標準交集以最小運算元（min operator）定義為 $(A \\cap B)(x) = \\min(A(x), B(x))$；標準聯集以最大運算元（max operator）定義為 $(A \\cup B)(x) = \\max(A(x), B(x))$。作者註記模糊集合的補集、交集與聯集尚有許多不同之廣義定義（如第四章將詳述的 t-norm 與 s-norm），本章凡符號 $\\bar{A}, A \\cap B, A \\cup B$ 均指標準型運算。接著提出本章核心定理——「定理 3.1」（截集的基本包含與交聯補運算性質）：設 A, B 為宇集合 X 上之模糊集合，$\\alpha, \\beta \\in [0, 1]$，則滿足五大性質：(i) $^{\\alpha+}A \\subset {^\\alpha A}$（強截集包含於同閾值截集）；(ii) 若 $\\alpha \\le \\beta$，則 ${^\\alpha A} \\supset {^\\beta A}$ 且 $^{\\alpha+}A \\supset {^{\\beta+}A}$（閾值越高，截集越小之單調性）；(iii) ${^\\alpha(A \\cap B)} = {^\\alpha A} \\cap {^\\alpha B}$ 且 ${^\\alpha(A \\cup B)} = {^\\alpha A} \\cup {^\\alpha B}$（交集與聯集的截集分配性）；(iv) $^{\\alpha+}(A \\cap B) = {^{\\alpha+}A} \\cap {^{\\alpha+}B}$ 且 $^{\\alpha+}(A \\cup B) = {^{\\alpha+}A} \\cup {^{\\alpha+}B}$（強截集分配性）；(v) ${^\\alpha(\\bar{A})} = \\overline{^{(1-\\alpha)+}A}$（補集之截集等於原集合之 $(1-\\alpha)$-強截集的明確補集合）。",
        "formulas": [
            "$$(A \\cap B)(x) = \\min(A(x), B(x)) \\quad (3.2)$$",
            "$$(A \\cup B)(x) = \\max(A(x), B(x)) \\quad (3.3)$$",
            "$$^{\\alpha+}A \\subset {^\\alpha A}$$",
            "$$\\alpha \\le \\beta \\implies {^\\alpha A} \\supset {^\\beta A} \\quad \\text{及} \\quad ^{\\alpha+}A \\supset {^{\\beta+}A}$$",
            "$${^\\alpha(A \\cap B)} = {^\\alpha A} \\cap {^\\alpha B} \\quad \\text{及} \\quad {^\\alpha(A \\cup B)} = {^\\alpha A} \\cup {^\\alpha B}$$",
            "$$^{\\alpha+}(A \\cap B) = {^{\\alpha+}A} \\cap {^{\\alpha+}B} \\quad \\text{及} \\quad ^{\\alpha+}(A \\cup B) = {^{\\alpha+}A} \\cup {^{\\alpha+}B}$$",
            "$${^\\alpha(\\bar{A})} = \\overline{^{(1-\\alpha)+}A}$$"
        ],
        "book_examples": [
            "定理 3.1 數學證明提示：可由集合論定義推導，或參閱原文參考文獻[1] Klir & Folger (1988) 第 35 頁之證明，本章以圖形幾何直觀方式輔助說明。",
            "性質 (v) 結構解析：先對模糊集合 A 取補集再取 α-截集，等價於先對 A 取 (1-α)-強截集，再在宇集合 X 中取經典明確補集。"
        ]
    },
    {
        "page_id": "3-4",
        "section": "3.1 截集之一些性質",
        "title": "截集運算性質之幾何圖解驗證 (圖 3.2 與 圖 3.3)",
        "summary": "本頁以清晰的幾何圖解，逐一驗證並展示定理 3.1 之各項性質：圖 3.2(a) 圖解性質 (i)，對於單峰三角形模糊集合 A，以高度 α 截取，強截集 $^{\\alpha+}A = \\{x \\mid A(x) > \\alpha\\}$ 呈現為開區間（端點為空心虛點），普通截集 ${^\\alpha A} = \\{x \\mid A(x) \\ge \\alpha\\}$ 呈現為閉區間（端點為實心點），直觀佐證 $^{\\alpha+}A \\subset {^\\alpha A}$；圖 3.2(b) 圖解性質 (ii)，當截切高度由 α 提高至 β (α ≤ β) 時，截集區間明顯向內收縮，說明閾值越高限制越嚴格，故 ${^\\alpha A} \\supset {^\\beta A}$；圖 3.3 圖解性質 (iii) 與 (iv)，考慮兩三角形模糊集合 A 與 B，高度 α 橫切線與兩集合波形交點所劃出的區間關係清楚展現：${^\\alpha(A \\cap B)} = {^\\alpha A} \\cap {^\\alpha B}$ 以及 ${^\\alpha(A \\cup B)} = {^\\alpha A} \\cup {^\\alpha B}$。作者註記圖 3.2(b) 與圖 3.3 中若將端點實點改為虛端點，即完全適用於強截集。",
        "formulas": [
            "$${^\\alpha A} = \\{x \\mid A(x) \\ge \\alpha\\}$$",
            "$$^{\\alpha+}A = \\{x \\mid A(x) > \\alpha\\}$$",
            "$${^\\alpha(A \\cap B)} = {^\\alpha A} \\cap {^\\alpha B}$$",
            "$${^\\alpha(A \\cup B)} = {^\\alpha A} \\cup {^\\alpha B}$$"
        ],
        "book_examples": [
            "圖 3.2(a)：截集包含強截集幾何圖。截面實線端點代表實心點 ($^\\alpha A$)，虛線端點代表空心點 ($^{\\alpha+} A$)，清楚顯示開區間包含於閉區間。",
            "圖 3.2(b)：截集單調性圖。低門檻 α 對應的外圍大區間，完全包含高門檻 β 對應的內部小區間。",
            "圖 3.3：兩模糊集合交集與聯集的截集幾何分解圖。直接看出橫切高度 α 與兩集合波形交點所劃出的區間關係：$^\\alpha(A \\cap B) = {^\\alpha A} \\cap {^\\alpha B}$ 以及 $^\\alpha(A \\cup B) = {^\\alpha A} \\cup {^\\alpha B}$。"
        ]
    },
    {
        "page_id": "3-5",
        "section": "3.1 截集之一些性質",
        "title": "補集截集之幾何對偶性與無限族截集包含定理 (定理 3.2)",
        "summary": "本頁首先透過圖 3.4 深入解釋定理 3.1(v) 的幾何意義：模糊集合 A 與其補集 $\\bar{A}$ 互為倒影（以歸屬度 0.5 呈對稱）。若對補集 $\\bar{A}$ 取高度 α 之截集，其在橫軸上包含的區間為 $\\bar{A}(x) \\ge \\alpha$，等價於 $1 - A(x) \\ge \\alpha \\iff A(x) \\le 1 - \\alpha$。其補集合即為 $A(x) > 1 - \\alpha$，也就是 A 的 $(1-\\alpha)$-強截集！因此 ${^\\alpha(\\bar{A})} = \\overline{^{(1-\\alpha)+}A}$。作者嚴正提出常犯迷思（公式 3.4）：${^\\alpha(\\bar{A})} \\ne \\overline{^\\alpha A}$ 且 ${^{\\alpha+}(\\bar{A})} \\ne \\overline{^{\\alpha+}A}$，即「補集的截集」絕對不等於「截集的明確補集」。接著推廣至由任意指標集 I 索引的多個模糊集合族 $\\{A_i\\}_{i \\in I}$，提出「定理 3.2」：(i) $\\bigcup_{i \\in I} {^\\alpha A_i} \\subset {^\\alpha(\\bigcup_{i \\in I} A_i)}$ 且 $\\bigcap_{i \\in I} {^\\alpha A_i} = {^\\alpha(\\bigcap_{i \\in I} A_i)}$；(ii) $\\bigcup_{i \\in I} {^{\\alpha+}A_i} = {^{\\alpha+}(\\bigcup_{i \\in I} A_i)}$ 且 $\\bigcap_{i \\in I} {^{\\alpha+}A_i} \\supset {^{\\alpha+}(\\bigcap_{i \\in I} A_i)}$。作者深入解釋為何在無限族情況下，定理 3.1 的等號會退化為包含符號。",
        "formulas": [
            "$${^\\alpha(\\bar{A})} \\ne \\overline{^\\alpha A} \\quad \\text{且} \\quad {^{\\alpha+}(\\bar{A})} \\ne \\overline{^{\\alpha+}A} \\quad (3.4)$$",
            "$$\\bigcup_{i \\in I} {^\\alpha A_i} \\subset {^\\alpha\\left(\\bigcup_{i \\in I} A_i\\right)} \\quad \\text{且} \\quad \\bigcap_{i \\in I} {^\\alpha A_i} = {^\\alpha\\left(\\bigcap_{i \\in I} A_i\\right)} \\quad (3.5)$$",
            "$$\\bigcup_{i \\in I} {^{\\alpha+}A_i} = {^{\\alpha+}\\left(\\bigcup_{i \\in I} A_i\\right)} \\quad \\text{且} \\quad \\bigcap_{i \\in I} {^{\\alpha+}A_i} \\supset {^{\\alpha+}\\left(\\bigcap_{i \\in I} A_i\\right)} \\quad (3.6)$$"
        ],
        "book_examples": [
            "圖 3.4：補集截集幾何對偶性圖解。圖中在縱軸高度 α 處作水平線交於 $\\bar{A}$ 產生兩側區間 $^\\alpha(\\bar{A})$；在高度 $1-\\alpha$ 處作水平線交於 A 產生中央區間 $^{(1-\\alpha)+}A$。兩側區間剛好是中央區間在全集上的明確補集，幾何直觀證明了 $^\\alpha(\\bar{A}) = \\overline{^{(1-\\alpha)+}A}$。",
            "迷思辨析註記：千萬不能將 $^\\alpha(\\bar{A})$ 誤寫為 $\\overline{^\\alpha A}$，因為 $^\\alpha A$ 已經是丟失了高於 α 以外連續資訊的明確區間，直接取補集無法還原出高度對偶反轉後的界限。"
        ]
    },
    {
        "page_id": "3-6",
        "section": "3.1 截集之一些性質",
        "title": "無限族截集嚴格真子集之極限反例 (例 3.1)",
        "summary": "本頁針對定理 3.2 中 (3.5) 式之「⊂」為何不能取等號，提供了經典且透徹的數學反例（例 3.1）。核心機制在於：當集合個數為無限多時，聯集運算由最小上界（Supremum, $\\sup$）決定。若存在一個元素在各集合中的歸屬度序列能無限趨近於門檻 α 但每一項皆嚴格小於 α，則在取聯集後，該點的歸屬度可剛好達到極限值 α，從而落入聯集的截集中；然而該元素卻不會出現在任何單一集合的截集內！例 3.1 定義一組無限多個模糊集合族 $A_i(x) = 1 - \\frac{1}{i+1}$ ($x \\in X, i \\in \\mathbb{N}$)。聯集後的歸屬函數為 $(\\bigcup_i A_i)(x) = \\sup_i (1 - \\frac{1}{i+1}) = 1$。當取截集閾值 $\\alpha = 1$ 時：聯集的 1-cut 為 ${^1(\\bigcup_i A_i)} = X$（全集）；但對任意單一模糊集合 $A_i$，因 $1 - \\frac{1}{i+1} < 1$，其 1-cut 皆為空集 ${^1 A_i} = \\emptyset$；全體 1-cut 的聯集為 $\\bigcup_i {^1 A_i} = \\emptyset$。出現嚴格真子集 $\\emptyset \\subsetneq X$，證明了在無限族時等式不成立。",
        "formulas": [
            "$$A_i(x) = 1 - \\frac{1}{i+1}, \\quad x \\in X, \\quad i \\text{ 是自然數} \\quad (3.7)$$",
            "$$\\left(\\bigcup_i A_i\\right)(x) = \\sup_i A_i(x) = \\sup_i \\left(1 - \\frac{1}{i+1}\\right) = 1$$",
            "$${^1\\left(\\bigcup_i A_i\\right)} = X = \\text{宇集合}$$",
            "$${^1 A_i} = \\emptyset \\quad \\left(\\text{因 } 1 - \\frac{1}{i+1} < 1\\right)$$",
            "$$\\bigcup_i {^1 A_i} = \\bigcup_i \\emptyset = \\emptyset \\ne X = {^1\\left(\\bigcup_i A_i\\right)}$$"
        ],
        "book_examples": [
            "例 3.1 完整手算步驟：1. 構造 $A_i(x) = 1 - 1/(i+1)$，隨 i 增加歸屬度為 1/2, 2/3, 3/4, 4/5, ...；2. 取全體聯集：$(\\bigcup_i A_i)(x) = \\sup_i (1 - 1/(i+1)) = 1$；3. 對聯集取 $\\alpha=1$ 截集得 X；4. 各別取 $\\alpha=1$ 截集均為 $\\emptyset$；5. 截集取聯集得 $\\emptyset$；6. 結論：$\\emptyset \\ne X$。"
        ]
    },
    {
        "page_id": "3-7",
        "section": "3.1 截集之一些性質",
        "title": "Supremum 與 Maximum 觀念辨析及模糊集合等價判定 (定理 3.3)",
        "summary": "本頁首先進行精闢的數學觀念辨析：比較「sup (Supremum, 最小上界) 與 max (Maximum, 最大值)」，以及「inf (Infimum, 最大下界) 與 min (Minimum, 最小值)」的本質區別。當定義域為開區間或無限序列時，函數值可能無限逼近某極限卻無法達到，此時 max 無解（不存在最大值），但 sup 依然存在！例如對於 $x > 0$，求 $1/(1+x)$ 的最大值無解，因為 x 可以無限小但不能等於 0；然而其最小上界 $\\sup_{x>0} 1/(1+x) = 1$。同理 $\\min_{x>0} (x-1)$ 無解，而 $\\inf_{x>0} (x-1) = -1$。唯有在元素個數為有限或達到極值時，sup=max 且 inf=min。頁尾提出重要定理——「定理 3.3」（以截集判定模糊集合的包含與相等關係）：設 A, B 為定義在 X 上的模糊集合，則 (i) $A \\subset B \\iff {^\\alpha A} \\subset {^\\alpha B} \\iff {^{\\alpha+}A} \\subset {^{\\alpha+}B}$（對所有 $\\alpha \\in [0, 1]$）；(ii) $A = B \\iff {^\\alpha A} = {^\\alpha B} \\iff {^{\\alpha+}A} = {^{\\alpha+}B}$（對所有 $\\alpha \\in [0, 1]$）。",
        "formulas": [
            "$$\\sup_{x>0} \\frac{1}{1+x} = \\max_{x\\ge 0} \\frac{1}{1+x} = \\sup_{x\\ge 0} \\frac{1}{1+x} = 1$$",
            "$$\\inf_{x>0} (x-1) = \\min_{x\\ge 0} (x-1) = \\inf_{x\\ge 0} (x-1) = -1$$",
            "$$\\sup_x f(x) = \\max_x f(x) \\quad \\text{且} \\quad \\inf_x f(x) = \\min_x f(x) \\quad (x \\text{ 為有限個數時})$$",
            "$$A \\subset B \\iff {^\\alpha A} \\subset {^\\alpha B} \\quad \\text{及} \\quad A \\subset B \\iff {^{\\alpha+}A} \\subset {^{\\alpha+}B}$$",
            "$$A = B \\iff {^\\alpha A} = {^\\alpha B} \\quad \\text{及} \\quad A = B \\iff {^{\\alpha+}A} = {^{\\alpha+}B}$$"
        ],
        "book_examples": [
            "數學概念實例解析：深入說明為什麼 $\\max_{x>0} 1/(1+x)$ 無解而 $\\sup_{x>0} 1/(1+x) = 1$。隱約中可見 $\\sup f(x)$ 蘊含著「極限」之數學意涵，而 $\\max$ 則嚴格要求在定義域中實際取到該點。",
            "有限與無限區別：若集合元素個數有限，上確界必然等於最大值，下確界必然等於最小值。"
        ]
    },
    {
        "page_id": "3-8",
        "section": "3.2 模糊集合之表示法及分解定理 (Decomposition Theorem)",
        "title": "模糊集合包含圖解與離散模糊集合表示法",
        "summary": "本頁上半部透過圖 3.5 說明定理 3.3(i) 的幾何意義：當模糊集合 A 的歸屬曲線完全落在模糊集合 B 之下（即 $A(x) \\le B(x), \\forall x$），則在任何高度 α 作橫切線，A 的截集區間 $^\\alpha A$ 必然完全被 B 的截集區間 $^\\alpha B$ 所包覆（即 A 完全被 B 蓋住）；若兩者在所有層次截集完全重合，則兩模糊集合完全相等。接著進入第 3.2 節「模糊集合之表示法及分解定理 (Decomposition Theorem)」。作者介紹了兩種常見的離散型模糊集合（Discrete Fuzzy Sets）書寫符號：連加符號表示法 $A = 0.2/x_1 + 0.4/x_2 + 0.6/x_3 + 0.8/x_4 + 1/x_5$ (式 3.8a) 以及集合括號表示法 $A = \\{0.2/x_1, 0.4/x_2, 0.6/x_3, 0.8/x_4, 1/x_5\\}$ (式 3.8b)。其中分子表示該元素的歸屬度，分母表示宇集合中的元素，加號「+」並非算術加法，而是代表集合元素的彙整聯集。本書習慣採用式 (3.8a) 的表示法。最後引導讀者回顧截集定義 ${^\\alpha A} \\triangleq \\{x \\mid A(x) \\ge \\alpha\\}$，準備引入階梯台重構概念。",
        "formulas": [
            "$$A = 0.2/x_1 + 0.4/x_2 + 0.6/x_3 + 0.8/x_4 + 1/x_5 \\quad (3.8\\text{a})$$",
            "$$A = \\{0.2/x_1, 0.4/x_2, 0.6/x_3, 0.8/x_4, 1/x_5\\} \\quad (3.8\\text{b})$$",
            "$${^\\alpha A} \\triangleq \\{x \\mid A(x) \\ge \\alpha\\}$$"
        ],
        "book_examples": [
            "圖 3.5：模糊集合包含關係幾何圖。三角形 A 包含在較大的三角形 B 之內。任意水平線 α 截出的線段 $^\\alpha A$ 顯然包含於 $^\\alpha B$ 之內，直觀佐證 $A \\subset B \\iff {^\\alpha A} \\subset {^\\alpha B}$。",
            "符號約定解析：在離散模糊集合表示式 $A = \\sum \\mu_A(x)/x$ 中，「/」代表歸屬度與元素的配對，「+」代表模糊集合各元素的聯集彙整，絕非代數除法與加法。"
        ]
    },
    {
        "page_id": "3-9",
        "section": "3.2 模糊集合之表示法及分解定理 (Decomposition Theorem)",
        "title": "α-梯台 (α-stair) 定義與第一分解定理 (定理 3.4)",
        "summary": "本頁提出了由作者命名之關鍵輔助概念——「模糊集合之 α–梯台 (α-stair)」，符號記為 ${_\\alpha A}$（下標 α）：${_\\alpha A(x)} \\triangleq \\alpha \\cdot {^\\alpha A(x)}$ (式 3.9)，其中 ${^\\alpha A(x)}$ 為明確截集 ${^\\alpha A}$ 的特徵函數（若 $x \\in {^\\alpha A}$ 則為 1，否則為 0）。因此 ${_\\alpha A}$ 本身是一個「模糊集合」，其幾何形狀為一水平頂部的矩形平台，支撐集為明確截集 ${^\\alpha A}$，高度固定為 α。接著導入劃時代的「定理 3.4 (第一分解定理 First Decomposition Theorem)」：對任一定義在宇集合 X 上的模糊集合 A，可以完全由其所有連續層次 $[0, 1]$ 上的 α-梯台做標準聯集（取最大值）而無損重構出來：$A = \\bigcup_{\\alpha \\in [0, 1]} {_\\alpha A}$ (式 3.10)。分解定理的重大哲學與數學意義在於：任何複雜的模糊集合，均可被徹底「分解」為無限多個明確集合（經過高度加權的梯台）；反之，利用明確截集亦可完美「合成」出原始模糊集合！這奠定了模糊集合論與經典明確集合論之間的對偶重構基礎。",
        "formulas": [
            "$${_\\alpha A(x)} \\triangleq \\alpha \\cdot {^\\alpha A(x)} \\quad (3.9)$$",
            "$$A = \\bigcup_{\\alpha \\in [0, 1]} {_\\alpha A} \\quad (3.10)$$"
        ],
        "book_examples": [
            "圖 3.6：α-梯台幾何定義圖。左側為原模糊集合 A(x) 與高度 α 截線；右側為對應的 ${_\\alpha A}$，清楚呈現一個頂部高度為固定值 α、寬度與 $^\\alpha A$ 相同的矩形模糊集合。",
            "計算實例：以式 (3.8a) 的離散集合為例，當 $\\alpha = 0.6$ 時，截集 $^\\alpha A = \\{x_3, x_4, x_5\\}$，其對應的 α-梯台為 ${_\\alpha A} = 0/x_1 + 0/x_2 + 0.6/x_3 + 0.6/x_4 + 0.6/x_5$。"
        ]
    },
    {
        "page_id": "3-10",
        "section": "3.2 模糊集合之表示法及分解定理 (Decomposition Theorem)",
        "title": "階梯相疊逼近與第三分解定理 (定理 3.5)",
        "summary": "本頁以圖 3.7 直觀詮釋第一分解定理的物理圖景：模糊集合 A 可以被視為由多個高度為 $\\alpha_i$ 的矩形階梯（梯台 ${_{\\alpha_i}A}$）層層相疊（聯集取最大值）而成。階梯劃分越細密（$\\alpha_i$ 數量越多），重疊出的階梯狀外輪廓就越逼近模糊集合 A 的真實平滑曲面；當階梯數趨向無窮多時，極限就是第一分解定理。作者註記：第二分解定理（利用強截集之分解）可參閱原文獻[1]第 41 頁，本書予以省略。隨後引出專門適用於離散型模糊集合的「定理 3.5 (第三分解定理 Third Decomposition Theorem)」：對任一定義在宇集合 X 上的模糊集合 A，$A = \\bigcup_{\\alpha \\in \\Lambda(A)} {_\\alpha A}$ (式 3.11)，其中 $\\Lambda(A) \\triangleq \\{\\alpha \\mid A(x) = \\alpha, \\text{對所有 } x \\in X\\}$ 稱為集合 A 的「水準集 (Level Set)」，即歸屬函數所有實際出現的取值集合。第三分解定理的精妙之處在於：當模糊集合為離散型或階梯型時，我們不需要對無限多個 $\\alpha \\in [0, 1]$ 進行聯集，僅需對其有限個實質出現的層次水準集 $\\alpha \\in \\Lambda(A)$ 進行梯台聯集，即可精準復原出模糊集合 A！",
        "formulas": [
            "$$A = \\bigcup_{\\alpha \\in \\Lambda(A)} {_\\alpha A} \\quad (3.11)$$",
            "$$\\Lambda(A) = \\{\\alpha \\mid A(x) = \\alpha, \\text{對所有 } x \\in X\\}$$"
        ],
        "book_examples": [
            "圖 3.7：階梯疊加逼近幾何圖。展示三角形模糊集合被水平切成 $\\alpha_1, \\alpha_2, \\dots, \\alpha_5$ 共 5 個階梯梯台 ${_{\\alpha_i} A}$。層層相疊後呈現鋸齒狀輪廓，生動詮釋離散梯台逼近連續模糊集合的過程。",
            "第一與第三分解定理的核心差異：第一分解定理適用於連續型模糊集合，聯集取遍 $[0, 1]$ 所有實數；第三分解定理適用於離散/階梯型模糊集合，聯集僅需遍歷有限水準集 $\\Lambda(A)$。"
        ]
    },
    {
        "page_id": "3-11",
        "section": "3.2 模糊集合之表示法及分解定理 (Decomposition Theorem)",
        "title": "階梯模糊集合之水準集梯台分解實例 (圖 3.8)",
        "summary": "本頁以極具代表性的階梯式模糊集合 B（圖 3.8(a)），具體演示第三分解定理的完整分解與重組過程。階梯式模糊集合 B(x) 定義在宇集合 X 上，其歸屬函數依序呈現階梯上升：在 $[x_1, x_2)$ 區間歸屬度為 0.25；在 $[x_2, x_3)$ 區間歸屬度為 0.5；在 $[x_3, x_4)$ 區間歸屬度為 0.75；在 $[x_4, x_5]$ 區間歸屬度為 1.0；其餘區間為 0。其水準集為有限集合：$\\Lambda(B) = \\{0, 0.25, 0.5, 0.75, 1\\}$。根據第三分解定理，集合 B 可精確分解為五個 α-梯台的聯集：$B = ({_0 B}) \\cup ({_{0.25} B}) \\cup ({_{0.5} B}) \\cup ({_{0.75} B}) \\cup ({_1 B})$。本頁各分圖展示各梯台的形狀與區間：圖 3.8(b) 為 ${_{0.25}B}$（高度 0.25，區間 $[x_1, x_5]$）；圖 3.8(c) 為 ${_{0.5}B}$（高度 0.5，區間 $[x_2, x_5]$）；圖 3.8(d) 為 ${_{0.75}B}$（高度 0.75，區間 $[x_3, x_5]$）；圖 3.8(e) 為 ${_1 B}$（高度 1.0，區間 $[x_4, x_5]$）。此例完美驗證了多層階梯如何由下而上、寬度遞減的矩形梯台重疊而成。",
        "formulas": [
            "$$\\Lambda(B) = \\{0, 0.25, 0.5, 0.75, 1\\}$$",
            "$$B = ({_0 B}) \\cup ({_{0.25} B}) \\cup ({_{0.5} B}) \\cup ({_{0.75} B}) \\cup ({_1 B})$$"
        ],
        "book_examples": [
            "圖 3.8(a)：階梯式模糊集合 B(x) 原圖，在 $x_1 \\sim x_5$ 呈現 4 段臺階。",
            "圖 3.8(b) ~ 圖 3.8(e)：依據各水準值分解出之 4 個基礎梯台圖：\n- ${_0 B}$ 為零值（底層）；\n- ${_{0.25} B}$ 為底座最寬之矩形（高度 0.25，跨越 $x_1 \\sim x_5$）；\n- ${_{0.5} B}$ 為次層矩形（高度 0.5，跨越 $x_2 \\sim x_5$）；\n- ${_{0.75} B}$ 為第三層矩形（高度 0.75，跨越 $x_3 \\sim x_5$）；\n- ${_1 B}$ 為頂層矩形（高度 1.0，跨越 $x_4 \\sim x_5$）。\n將此 5 個矩形在每一 x 處取最大值聯集，即嚴格等於原始圖 3.8(a)。"
        ]
    },
    {
        "page_id": "3-12",
        "section": "3.3 延伸原理 (Extension Principle)",
        "title": "延伸原理 (Extension Principle) 定義與離散非線性映射 (定理 3.6 與 例 3.2)",
        "summary": "本頁正式進入模糊理論中最為重要的核心基石——第 3.3 節「延伸原理 (Extension Principle)」。傳統數學函數 $f: X \\to Y$ 僅能映射明確點 $x \\in X$ 至明確點 $y \\in Y$。延伸原理旨在解決：「如何將明確點對點的函數 f，推廣以接受輸入為模糊集合 A（定義在 X 上），並輸出其對應的模糊集合 B（定義在 Y 上）？」「定理 3.6 (延伸原理)」定義：$B(y) = (f(A))(y) \\triangleq \\sup_{x \\mid y = f(x)} A(x)$ (式 3.12)。其數學意義：輸出端某特定點 y 的模糊歸屬度，等於所有經 f 映射後會落於該點 y 的輸入原像點 x 之中，歸屬度 A(x) 的最小上界（在離散情況下即為最大值 max）。若某 y 無任何原像對應，則 $B(y) = 0$。本頁給出清楚的計算範例（例 3.2）：設映射函數為多對一非線性二次函數 $f(x) = 4x^2 = y$。輸入定義域 $X = \\{-1, 1, -2, 2\\}$，輸出值域 $Y = \\{4, 16\\}$。輸入模糊集合為 $A = 0.4/{-1} + 0.6/1 + 0.5/{-2} + 1/2$。計算輸出模糊集合 $B = f(A)$：$x = -1$ 與 $x = 1$ 均映射至 $y = 4$，取最大值 $\\max(0.4, 0.6) = 0.6$；$x = -2$ 與 $x = 2$ 均映射至 $y = 16$，取最大值 $\\max(0.5, 1) = 1$。故得到輸出模糊集合 $f(A) = 0.6/4 + 1/16 = B$。",
        "formulas": [
            "$$f : X \\to Y$$",
            "$$B(y) = (f(A))(y) \\triangleq \\sup_{x \\mid y = f(x)} A(x) \\quad (3.12)$$",
            "$$f(x) = 4x^2 = y$$",
            "$$A = 0.4/{-1} + 0.6/1 + 0.5/{-2} + 1/2$$",
            "$$f(A) = 0.6/4 + 1/16 = B \\quad (3.13)$$"
        ],
        "book_examples": [
            "例 3.2 離散多對一延伸原理計算示範：\n- 映射關係：$f(-1)=4, f(1)=4$；$f(-2)=16, f(2)=16$。\n- 衝突消解：當多個 x 映射至同一個 y 時，取歸屬度的最大值（max）。\n- 計算得 $B(4) = 0.6, B(16) = 1.0$，得到 $B = 0.6/4 + 1/16$。"
        ]
    },
    {
        "page_id": "3-13",
        "section": "3.3 延伸原理 (Extension Principle)",
        "title": "單調映射簡化與延伸原理保序及分配性質 (定理 3.7)",
        "summary": "本頁上半部承接例 3.2 的詳細手算式：$B(4) = \\max_{x \\mid 4=f(x)} A(x) = \\max(A(1), A(-1)) = \\max(0.4, 0.6) = 0.6$；$B(16) = \\max_{x \\mid 16=f(x)} A(x) = \\max(A(2), A(-2)) = \\max(0.5, 1) = 1$。接著討論連續單調映射情況：若函數 f(x) 是一對一且嚴格單調遞增（Strictly Monotonically Increasing），則對於值域中的任一 y，存在唯一的原像 $x = f^{-1}(y)$。此時不需要進行任何上確界或最大值比選，式 (3.12) 中的 sup 可直接去除，化簡為點對點直接等值傳遞：$B(y) = A(f^{-1}(y))$。隨後提出「定理 3.7 (延伸原理之重要運算性質)」：設 $f : X \\to Y$，$A_i$ 為 X 上之模糊集合，$B_i$ 為 Y 上之模糊集合，則延伸原理滿足四大優良結構性質：(i) 空集合保持性：$A_i = \\emptyset \\iff f(A_i) = \\emptyset$；(ii) 單調包含性：若 $A_1 \\subset A_2$，則 $f(A_1) \\subset f(A_2)$；(iii) 聯集之完全分配性：$f(\\bigcup_i A_i) = \\bigcup_i f(A_i)$；(iv) 交集之次分配包含性：$f(\\bigcap_i A_i) \\subset \\bigcap_i f(A_i)$。注意交集的影像包含於影像的交集，因為多對一映射可能使得原本互斥的輸入點映射到同一個 y，造成輸出端交集變大。",
        "formulas": [
            "$$B(4) = \\max_{x \\mid 4=f(x)} A(x) = \\max(A(1), A(-1)) = \\max(0.4, 0.6) = 0.6$$",
            "$$B(16) = \\max_{x \\mid 16=f(x)} A(x) = \\max(A(2), A(-2)) = \\max(0.5, 1) = 1$$",
            "$$B_2(y_1) = A_2(x_1) \\quad \\text{且} \\quad f(x_1) = y_1$$",
            "$$A_i = \\emptyset \\iff f(A_i) = \\emptyset$$",
            "$$A_1 \\subset A_2 \\implies f(A_1) \\subset f(A_2)$$",
            "$$f\\left(\\bigcup_i A_i\\right) = \\bigcup_i f(A_i)$$",
            "$$f\\left(\\bigcap_i A_i\\right) \\subset \\bigcap_i f(A_i)$$"
        ],
        "book_examples": [
            "連續單調函數映射說明：當 f(x) 為一對一且嚴格單調時，每個 y 恰好對應唯一 x，無需比較多個候選點，運算大幅簡化。",
            "交集次分配性重要觀念：$f(\\bigcap_i A_i) \\subset \\bigcap_i f(A_i)$，之所以是包含於而非等號，乃因 f 若為多對一映射時，在 X 空間中不相交的兩集合可能被壓印至 Y 空間的相同點，使右式產生交集而左式為空集。"
        ]
    },
    {
        "page_id": "3-14",
        "section": "3.4 本章總結",
        "title": "連續單調映射圖解、本章總結與課後習題 3.1",
        "summary": "本頁上半部透過圖 3.9 展示延伸原理在連續單調遞增函數 f(x) 下的幾何傳遞：輸入軸 X 上的模糊集合 $A_1, A_2$ 繪於下方橫軸（開口朝下），經曲線 $y = f(x)$ 投射至左側縱軸 Y，直接生成對應的輸出模糊集合 $B_1, B_2$。圖中清晰展示幾何對應：$x_1$ 經 f 對應至 $y_1$，其歸屬度高度完全不變地平移至 $B_2(y_1) = A_2(x_1)$。接著進入第 3.4 節「本章總結」：回顧全章兩大核心支柱：1. 模糊集合之分解定理 (Decomposition Theorem)，透過 α-梯台與水準集，確立明確截集重構模糊集合的層次關係；2. 模糊集合之延伸原理 (Extension Principle)，確立明確函數推廣至模糊集合映射的數學法則與保序性質；3. 輔助工具：sup 與 inf 極限上下界在無限族運算中的精確數學意義。頁尾開始給出課後習題：習題 3.1 給定離散模糊集合 $A = 0.2/x_1 + 0.4/x_2 + 0.6/x_3 + 0.8/x_4 + 1/x_5$，要求列出其在 $\\alpha = 0, 0.2, 0.4, 0.6, 0.8, 1$ 時的所有 α-截集與 α-強截集，並畫出各階梯台 ${_\\alpha A}$。",
        "formulas": [
            "$$y = f(x)$$",
            "$$B_2(y_1) = A_2(x_1) \\quad \\text{且} \\quad f(x_1) = y_1$$",
            "$$A = 0.2/{x_1} + 0.4/{x_2} + 0.6/{x_3} + 0.8/{x_4} + 1/{x_5}$$"
        ],
        "book_examples": [
            "圖 3.9：連續單調映射延伸原理幾何圖。底部的模糊集合 $A_1, A_2$ 通過上升的函數曲線 f(x) 投影到縱軸，生成輸出模糊集合 $B_1, B_2$。充分體現「保形映射」的幾何美感。",
            "習題 3.1 題意解析：要求讀者動手練習 α-截集（閉條件 $\\ge \\alpha$）與強截集（開條件 $> \\alpha$）的區別，並繪製 6 個不同高度的矩形梯台 ${_\\alpha A}$。"
        ]
    },
    {
        "page_id": "3-15",
        "section": "3.4 本章總結",
        "title": "章末深度思考與實踐習題 (習題 3.2 ~ 3.4)",
        "summary": "本頁為第三章的章末習題頁，涵蓋了全章各核心定理的實踐計算與理論證明題：習題 3.2 給定由 10 個離散點構成的模糊集合 $B = 0.1/{-4} + 0.2/{-3} + 0.3/{-2} + 0.4/{-1} + 0.5/0 + 0.6/1 + 0.7/2 + 0.8/3 + 0.9/4 + 1/5$。要求計算：1. 平移映射 $f(x) = x + 1 = y$（一對一線性映射），求 $[f(B)](y)$；2. 多對一非線性平方映射 $g(x) = x^2 = z$（多對一映射），求 $[g(B)](z)$，檢驗對稱點取最大值的運算。習題 3.3 給定圖 3.10(a) 中定義在 $[1, 3]$ 上的連續對稱三角形模糊集合 A（頂點在 $x=2$，高度為 1），以及圖 3.10(b) 中的分段非線性函數 f(x)（在 $[1, 2]$ 為平坦高原常數），要求運用延伸原理圖示映射後之模糊集合。理論亮點：當 f(x) 在某區間為水平常數線時，多個不同輸入點映射到同一個常數值，該點的歸屬度將取該區間內輸入歸屬度的最大值，導致輸出模糊集合產生脈衝尖峰或形變！習題 3.4 則要求證明定理 3.7（延伸原理之保空性、單調包含性、聯集分配性與交集次分配性）。",
        "formulas": [
            "$$B = 0.1/{-4} + 0.2/{-3} + 0.3/{-2} + 0.4/{-1} + 0.5/0 + 0.6/1 + 0.7/2 + 0.8/3 + 0.9/4 + 1/5$$",
            "$$f(x) = x + 1 = y, \\quad x \\in X, \\quad y \\in Y = \\{-3, -2, -1, 0, 1, 2, 3, 4, 5, 6\\}$$",
            "$$g(x) = x^2 = z, \\quad x \\in X, \\quad z \\in Z = \\{0, 1, 4, 9, 16, 25\\}$$"
        ],
        "book_examples": [
            "習題 3.2 延伸原理手算解析：\n- 對 $f(x) = x+1$，為一對一平移，各點歸屬度保持原樣位移一個單位。\n- 對 $g(x) = x^2$，負數與正數平方重疊，如 $g(-1)=1$ (歸屬度 0.4) 與 $g(1)=1$ (歸屬度 0.6)，依延伸原理取最大值 $\\max(0.4, 0.6) = 0.6/1$；$g(-2)=4$ (0.3) 與 $g(2)=4$ (0.7) $\\to \\max(0.3, 0.7) = 0.7/4$ 等。",
            "圖 3.10(a) 與 圖 3.10(b) 習題分析：A 為頂點在 2 的三角形，但 f(x) 在 $[1, 2]$ 為水平段，意味著 $x \\in [1, 2]$ 全部映射到同一 y 值，其輸出歸屬度為 $\\sup_{x \\in [1, 2]} A(x) = A(2) = 1$。此題展示非單調或含平坦區間之函數如何造成模糊集合「凝聚」效應。"
        ]
    }
]

def main():
    print("1. 讀取 course_data.json...")
    with open(COURSE_DATA_JSON, 'r', encoding='utf-8') as f:
        course_data = json.load(f)

    # 建立查找字典
    enrich_map = {}
    for p in CH3_PAGES:
        enrich_map[p['page_id']] = p

    # 更新 all_book_pages
    updated_count = 0
    if 'all_book_pages' in course_data:
        for item in course_data['all_book_pages']:
            pid = item.get('page_id')
            if pid in enrich_map:
                meta = enrich_map[pid]
                item['section'] = meta['section']
                item['title'] = meta['title']
                item['summary'] = meta['summary']
                item['formulas'] = meta['formulas']
                item['book_examples'] = meta['book_examples']
                updated_count += 1
    print(f"all_book_pages 已更新 {updated_count} 頁 (Ch3)。")

    # 寫回 course_data.json
    with open(COURSE_DATA_JSON, 'w', encoding='utf-8') as f:
        json.dump(course_data, f, ensure_ascii=False, indent=2)
    print("✅ 已成功寫回 frontend/course_data.json")

    # 寫入 course_data.js
    js_course_data = f"window.FUZZY_COURSE_DATA = {json.dumps(course_data, ensure_ascii=False, indent=2)};\n"
    with open(COURSE_DATA_JS, 'w', encoding='utf-8') as f:
        f.write(js_course_data)
    print("✅ 已成功更新 frontend/course_data.js")

    # 2. 重新執行 scan_book_photos 產生規範化的 book_pages.js
    print("2. 重新執行 scan_book_photos 產生規範化的 book_pages.js...")
    from scan_book_photos import scan_all_book_photos
    ch_cnt, photos_cnt = scan_all_book_photos()
    print(f"✅ book_pages.js 重新生成完畢！總章節數：{ch_cnt}，總照片數：{photos_cnt}")

    # 3. 驗證產出之 book_pages.js 括號平衡與語法
    with open(BOOK_PAGES_JS, 'r', encoding='utf-8') as f:
        text = f.read()
    c_diff = text.count('{') - text.count('}')
    b_diff = text.count('[') - text.count(']')
    p_diff = text.count('(') - text.count(')')
    print(f"括號檢驗：Curly diff={c_diff}, Bracket diff={b_diff}, Paren diff={p_diff}")

if __name__ == '__main__':
    main()
