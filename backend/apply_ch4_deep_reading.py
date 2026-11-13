# -*- coding: utf-8 -*-
"""
將《認識 Fuzzy》第四章（12頁，頁 4-1 ～ 4-12）深度精讀 OCR 數據
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
# 第四章 12 頁 OCR 萃取內容 (4-1 ~ 4-12)
# ==========================================
CH4_PAGES = [
    {
        "page_id": "4-1",
        "section": "第四章 模糊集合之運算 章首扉頁",
        "title": "模糊集合之運算導引與扉頁意象",
        "summary": "本頁為《認識 Fuzzy》第四章「模糊集合之運算」的章首扉頁。承接第三章所建立之模糊集合基本表示法與隸屬度函數（如三角型、梯型、鐘型等），本章正式邁入模糊集合代數運算體系。在古典明確集合論（Crisp Set Theory）中，交集、聯集與補集之定義唯一且封閉（由二值布林邏輯完全約束）；然而在模糊集合論中，元素的隸屬程度介於 [0, 1] 之間的連續區間，運算子不再受限於傳統直覺的取極小（min）或取極大（max），而是開展出多樣化、具備嚴謹公理化架構的參數化運算子族（如 t-norm、s-norm、Sugeno 與 Yager 參數化補集）。扉頁中央繪製之旋轉操作扳手示意圖，象徵模糊運算子具備如旋鈕般連續微調參數的工程適應性，決策者可依據實際系統之嚴苛度（如保守決策、寬鬆容許）靈活選擇最適運算子。",
        "formulas": [],
        "book_examples": [
            "扉頁概念圖：中央繪製一支轉動中的機械扳手，象徵模糊集合運算子具備參數調節特性，能如同工程工具般依據推論情境靈活旋轉調節其寬鬆與嚴苛程度。"
        ]
    },
    {
        "page_id": "4-2",
        "section": "4.1 模糊集合運算之種類 / 4.2 模糊補集",
        "title": "模糊三大基本運算概說、標準運算與模糊補集定義",
        "summary": "本頁開啟第四章正文。第 4.1 節確立模糊集合論的三大核心運算：模糊補集（Complement）、模糊交集（Intersection）與模糊聯集（Union）。第三章提出的「標準運算」為：補集取反 $\\bar{A}(x)=1-A(x)$、交集取小 $(A \\cap B)(x)=\\min(A(x), B(x))$、聯集取大 $(A \\cup B)(x)=\\max(A(x), B(x))$。本頁特別強調：「標準運算」在模糊集合論中絕非唯一，僅是實務上最直觀常用的一種特殊情況。在現代模糊數學文獻中，模糊交集通稱為 t-基準（t-norms），模糊聯集通稱為 s-基準或 t-反基（s-norms 或 t-conorms）。傳統明確集合運算具備唯一性，而模糊運算則具備多樣性與豐富的參數族，這是模糊數學與古典數學的最重大分水嶺。接續進入第 4.2 節「模糊補集」，定義 $A^c(x)$ 或 $c(A(x))$ 代表元素 $x$ 屬於補集 $A^c$ 之程度（即 $x$ 不屬於 $A$ 之程度），且嚴格規範其值域落於 $[0, 1]$ 區間。",
        "formulas": [
            "$$\\bar{A}(x) = 1 - A(x) \\quad (4.1(a))$$",
            "$$(A \\cap B)(x) = \\min(A(x), B(x)) \\quad (4.1(b))$$",
            "$$(A \\cup B)(x) = \\max(A(x), B(x)) \\quad (4.1(c))$$",
            "$$0 \\le A^c(x) \\le 1$$"
        ],
        "book_examples": [
            "古典與模糊之核心哲學對比：明確集合中補集、交集、聯集運算是唯一的（布林邏輯）；而模糊集合論中，標準運算（1-A, min, max）僅為眾多運算子之一，具備多樣性。",
            "國際標準學術術語規範：模糊交集通稱為 t-基準（t-norms），模糊聯集通稱為 s-基準或 t-反基（s-norms 或 t-conorms），模糊補集以 c(·) 或 A^c 表達。"
        ]
    },
    {
        "page_id": "4-3",
        "section": "4.2 模糊補集",
        "title": "非標準模糊補集：門檻式補集與 Sugeno 參數化補集",
        "summary": "本頁深入探討非標準模糊補集的具體數學建構。除標準補集 $c(z)=1-z$ 外，常用的補集函數尚有：(1) 門檻式補集（Threshold Complement），定義為階梯函數：當隸屬度 $z \\le l$ 時輸出 1，當 $z > l$ 時驟降為 0，其中門檻值 $l \\in [0, 1)$。門檻式補集將連續的模糊隸屬度硬性切分為二值狀態，破壞了連續性。(2) Sugeno 式補集（Sugeno's Complement），由日本學者 Michio Sugeno 提出，其代數結構為 $c_s(z) = \\frac{1-z}{1+sz}$，其中參數 $s \\in (-1, \\infty)$。Sugeno 補集透過參數 $s$ 實現連續且可平滑調節的非線性補集行為：當 $s=0$ 時，函數退化為標準線性補集 $1-z$；當 $s > 0$ 時，曲線呈現向下凹陷，使得補集歸屬度受到更強烈的壓抑；當 $-1 < s < 0$ 時，曲線向上凸出，賦予較高的補集歸屬度。",
        "formulas": [
            "$$c(z) = \\begin{cases} 1, & \\text{當 } z \\le l \\\\ 0, & \\text{當 } z > l \\end{cases} \\quad (4.3)$$",
            "$$z = A(x) \\in [0, 1] \\quad \\text{及} \\quad l \\in [0, 1)$$",
            "$$c_s(z) = \\frac{1 - z}{1 + sz}, \\quad s \\in (-1, \\infty) \\quad (4.4)$$"
        ],
        "book_examples": [
            "圖 4.1：門檻式補集函數幾何圖形。展示在門檻值 l 處由 1 垂直下墜至 0 的剛性階梯轉變，體現極端非連續性切分。",
            "Sugeno 補集之參數效應：s 充當幾何曲率調節器。當 s = 0 時 c_0(z) = 1 - z（即標準補集）；當 s 趨近於 -1 時補集值偏大；當 s 趨近無窮大時補集值偏小。"
        ]
    },
    {
        "page_id": "4-4",
        "section": "4.2 模糊補集",
        "title": "Yager 參數化補集與補集函數之平衡點 (Equilibrium)",
        "summary": "本頁首先展示 Sugeno 補集曲線族（圖 4.2），接著介紹第三種經典非標準補集：由美國學者 Ronald R. Yager 提出的 Yager 式補集，其公式為 $c_y(z) = (1 - z^y)^{1/y}$，其中參數 $y \\in (0, \\infty)$。圖 4.3 詳細繪製了 Yager 補集在不同 $y$ 值下的曲線變化：當 $y=1$ 時即為標準補集 $1-z$；當 $y < 1$（如 $y=0.5$）時曲線向原點方向下凹；當 $y > 1$（如 $y=2$）時曲線向右上凸出（在平面上形成四分之一圓弧軌跡）。隨後，本頁正式引入補集函數的核心概念——「平衡點（Equilibrium）」。若某個歸屬度數值 $z$ 滿足 $c(z) = z$，則稱 $z$ 為該補集函數的平衡點。從幾何視角而言，平衡點即補集曲線 $c(z)$ 與 45 度對角直線 $c(z)=z$ 的交點座標。",
        "formulas": [
            "$$c_y(z) = (1 - z^y)^{\\frac{1}{y}}, \\quad y \\in (0, \\infty) \\quad (4.5)$$",
            "$$c(z) = z \\quad [\\text{補集函數平衡點方程式}]$$"
        ],
        "book_examples": [
            "圖 4.2：Sugeno 式補集曲線族。對比 s = -0.5（上凸）、s = 0（直線）、s = 2 與 s = 10（下凹）之形態，所有曲線端點均嚴格通過 (0, 1) 與 (1, 0)。",
            "圖 4.3：Yager 式補集曲線族。對比 y = 0.5（下凹）、y = 1（線性標準補集）、y = 2（上凸圓弧）之形態，端點亦固定於 (0, 1) 與 (1, 0)。",
            "平衡點幾何意象：平衡點為補集函數圖形與 y = x 對角線之交點，代表在此隸屬度下「屬於原集合」與「屬於補集合」之程度完全平衡相等。"
        ]
    },
    {
        "page_id": "4-5",
        "section": "4.2 模糊補集 / 4.3 模糊集合之交集(t-基準；t-norms)",
        "title": "補集平衡點計算、存在唯一性定理與 t-基準公理引言",
        "summary": "本頁推導演練各補集之平衡點數值求解：(1) 標準補集 $c(z)=1-z=z \\implies z = 0.5$；(2) 門檻式補集當 $l \\in (0, 1)$ 時與對角線無交點，故不存在平衡點；(3) Sugeno 補集在 $s=1$ 時，由 $\\frac{1-z}{1+z}=z$ 整理得一元二次方程式 $z^2+2z-1=0$，取正實數根得平衡點 $z = \\sqrt{2}-1 \\approx 0.414$；(4) Yager 補集之平衡點留供練習，推導可得 $z = (1/2)^{1/y}$。接著提出兩大重要理論：定理 4.2 指出任何模糊補集最多只有一個平衡點，亦可能完全沒有（如門檻式）；定理 4.3 證明連續之模糊補集函數必存在唯一的平衡點。文末包含一個極為關鍵的名詞辨析：第三章 3.1 節定義的「模糊集合之平衡點」是指令 $A(x)=0.5$ 的宇集合元素 $x \\in X$；而本章之「補集函數平衡點」是指滿足 $c(z)=z$ 的純量隸屬度 $z \\in [0, 1]$，兩者對象迥異不可混淆。最後進入第 4.3 節「模糊交集（t-基準；t-norms）」，以二元算子 $(A \\cap B)(x) = t(A(x), B(x))$ 開啟交集理論。",
        "formulas": [
            "$$c(z) = 1 - z = z \\implies z = \\frac{1}{2} \\quad [\\text{標準補集之平衡點}]$$",
            "$$\\frac{1 - z}{1 + z} = z \\implies z^2 + 2z - 1 = 0 \\implies z = \\sqrt{2} - 1 \\quad [\\text{Sugeno 式 } (s=1) \\text{ 之平衡點}]$$",
            "$$(A \\cap B)(x) = t(A(x), B(x)), \\quad x \\in X \\quad (4.6)$$"
        ],
        "book_examples": [
            "Sugeno (s=1) 平衡點手算推導：(1-z)/(1+z)=z => 1-z = z + z^2 => z^2 + 2z - 1 = 0，由二次公式得 z = (-2 ± sqrt(4 - 4(1)(-1)))/2 = -1 ± sqrt(2)，因 z 必須落於 [0, 1]，捨負根得 z = sqrt(2) - 1 ≈ 0.414。",
            "定理 4.2 與 4.3 摘要：非連續補集（門檻式）可能無平衡點；任意滿足連續遞減之補集函數則具備嚴格唯一之平衡點。",
            "概念辨析註記：模糊集合平衡點為 x 軸上的特定元素點 x（令歸屬度為半高值 0.5）；補集函數平衡點為 y 軸上的隸屬度值 z（令補集運算保持自守相等 c(z)=z）。"
        ]
    },
    {
        "page_id": "4-6",
        "section": "4.3 模糊集合之交集(t-基準；t-norms)",
        "title": "常用四大 t-基準運算子、極值偏序關係與 Schweizer-Sklar 交集",
        "summary": "本頁系統化建立模糊交集算子體系。令 $p, q \\in [0, 1]$ 代表兩集合之歸屬度值，模糊交集通稱為 t-基準 $t(p, q)$。書中詳細定義了四種最常用的模糊交集：(1) 標準交集（Standard Intersection）：$t(p, q) = \\min(p, q)$；(2) 代數乘積（Algebraic Product）：$t(p, q) = p \\cdot q$；(3) 有界差異（Bounded Difference）：$t(p, q) = \\max(0, p + q - 1)$；(4) 徹底交集（Drastic Intersection）：若 $q=1$ 則為 $p$，若 $p=1$ 則為 $q$，其餘情況全為 0。本頁揭示了模糊數學中至關重要的大小偏序關係鏈：$t_{\\text{drastic}}(p, q) \\le t_{\\text{bounded}}(p, q) \\le t_{\\text{algebraic}}(p, q) \\le t_{\\text{standard}}(p, q)$，即公式 (4.10) $\\le$ (4.9) $\\le$ (4.8) $\\le$ (4.7)。此偏序鏈說明標準交集 $\\min(p, q)$ 是所有可能 t-norm 的理論最大上限，而徹底交集是理論最小下限。頁末並引述 B. Schweizer 與 A. Sklar 於 1963 年提出的廣義參數化交集族 $t_s(p, q) = [\\max(0, p^s + q^s - 1)]^{1/s}$ ($s \\ne 0$)。",
        "formulas": [
            "$$t(p, q) = \\min(p, q) \\quad (4.7) \\quad [\\text{標準交集 Standard Intersection}]$$",
            "$$t(p, q) = p \\cdot q \\quad (4.8) \\quad [\\text{代數乘積 Algebraic Product}]$$",
            "$$t(p, q) = \\max(0, p + q - 1) \\quad (4.9) \\quad [\\text{有界差異 Bounded Difference}]$$",
            "$$t(p, q) = \\begin{cases} p, & \\text{當 } q = 1 \\\\ q, & \\text{當 } p = 1 \\\\ 0, & \\text{其他} \\end{cases} \\quad (4.10) \\quad [\\text{徹底交集 Drastic Intersection}]$$",
            "$$(4.10) \\le (4.9) \\le (4.8) \\le (4.7) \\quad [\\text{交集算子強度偏序關係}]$$",
            "$$t_s(p, q) = [\\max(0, p^s + q^s - 1)]^{\\frac{1}{s}}, \\quad s \\ne 0 \\quad (4.11) \\quad [\\text{Schweizer \\& Sklar, 1963}]$$"
        ],
        "book_examples": [
            "四大常用交集算子特性解析：標準交集最寬鬆保守；代數乘積具備機率獨立性思維；有界差異當兩者總和不足 1 時歸零；徹底交集最嚴酷，非全真即歸零。",
            "t-基準大小關係鏈定理：對於區間 [0, 1] 內任意 p, q，徹底交集 ≤ 有界差異 ≤ 代數乘積 ≤ 標準交集 恆成立。"
        ]
    },
    {
        "page_id": "4-7",
        "section": "4.3 模糊集合之交集(t-基準；t-norms)",
        "title": "Yager、Frank、Yu 廣義交集族與例 4.3 離散集合手算演練",
        "summary": "本頁接續列出文獻中三大著名廣義參數化 t-基準：(b) P. R. Yager (1980) 提出之 $t_y(p, q) = 1 - \\min\\{1, [(1-p)^y + (1-q)^y]^{1/y}\\}$, $y > 0$；(c) M. J. Frank (1979) 提出之對數型交集 $t_f(p, q) = \\log_f [1 + \\frac{(f^p - 1)(f^q - 1)}{f - 1}]$, $f > 0, f \\ne 1$；(d) Y. D. Yu (1985) 提出之 $t_u(p, q) = \\max[0, (1+\\lambda)(p+q-1) - \\lambda pq]$, $\\lambda > -1$。書中再次強調核心不等式界限：所有合法 t-基準必定嚴格夾在徹底交集與標準交集之間，即 $(4.10) \\le t(p, q) \\le (4.7)$。緊接著進入「例 4.3」，給定宇集合 $X=\\{0, 1, 2, 3\\}$ 上的兩個離散模糊集合：$A = 0.4/0 + 0.6/1 + 0.8/2 + 1/3$ 及 $B = 1/0 + 0.8/1 + 0.6/2 + 0.4/3$，逐項展開手算演練：(a) 標準交集 min 得 $0.4/0 + 0.6/1 + 0.6/2 + 0.4/3$；(b) 代數乘積 $p \\cdot q$ 得 $0.4/0 + 0.48/1 + 0.48/2 + 0.4/3$；(c) 有界差異 $\\max(0, p+q-1)$ 得 $0.4/0 + 0.4/1 + 0.4/2 + 0.4/3$。",
        "formulas": [
            "$$t_y(p, q) = 1 - \\min\\{1, [(1 - p)^y + (1 - q)^y]^{\\frac{1}{y}}\\}, \\quad y > 0 \\quad (4.12) \\quad [\\text{Yager, 1980}]$$",
            "$$t_f(p, q) = \\log_f \\left[ 1 + \\frac{(f^p - 1)(f^q - 1)}{f - 1} \\right], \\quad f > 0, f \\ne 1 \\quad (4.13) \\quad [\\text{Frank, 1979}]$$",
            "$$t_u(p, q) = \\max[0, (1 + \\lambda)(p + q - 1) - \\lambda p q], \\quad \\lambda > -1 \\quad (4.14) \\quad [\\text{Yu, 1985}]$$",
            "$$(4.10) \\le t(p, q) \\le (4.7), \\quad \\forall p, q \\in [0, 1] \\quad [\\text{廣義 t-基準極值邊界界限}]$$",
            "$$A = 0.4/0 + 0.6/1 + 0.8/2 + 1/3, \\quad B = 1/0 + 0.8/1 + 0.6/2 + 0.4/3$$"
        ],
        "book_examples": [
            "例 4.3(a) 標準交集手算步驟：x=0: min(0.4, 1)=0.4；x=1: min(0.6, 0.8)=0.6；x=2: min(0.8, 0.6)=0.6；x=3: min(1, 0.4)=0.4，組合得 0.4/0 + 0.6/1 + 0.6/2 + 0.4/3。",
            "例 4.3(b) 代數乘積手算步驟：x=0: 0.4×1=0.4；x=1: 0.6×0.8=0.48；x=2: 0.8×0.6=0.48；x=3: 1×0.4=0.4，組合得 0.4/0 + 0.48/1 + 0.48/2 + 0.4/3。",
            "例 4.3(c) 有界差異手算步驟：x=0: max(0, 0.4+1-1)=0.4；x=1: max(0, 0.6+0.8-1)=0.4；x=2: max(0, 0.8+0.6-1)=0.4；x=3: max(0, 1+0.4-1)=0.4，得均勻的 0.4/0 + 0.4/1 + 0.4/2 + 0.4/3。"
        ]
    },
    {
        "page_id": "4-8",
        "section": "4.3 模糊集合之交集 / 4.4 模糊聯集(t-反基(s-norms 或 t-conorms))",
        "title": "例 4.3 廣義交集續解、模糊聯集概念與四大常用 s-基準",
        "summary": "本頁上半部完成例 4.3 後續各算子手算求解：(d) 徹底交集：因中間元素 $p, q < 1$，故 $x=1, 2$ 處之值驟降為 0，得 $0.4/0 + 0/1 + 0/2 + 0.4/3$；(e) Schweizer-Sklar ($s=1$)：代入公式退化為有界差異，得 $0.4/0 + 0.4/1 + 0.4/2 + 0.4/3$；(f) Yager ($y=2$)：得 $0.4/0 + 0.55/1 + 0.55/2 + 0.4/3$；(g) Frank ($f=2$)：得 $0.4/0 + 0.47/1 + 0.47/2 + 0.4/3$；(h) Yu ($\\lambda=1$)：得 $0.4/0 + 0.32/1 + 0.32/2 + 0.4/3$。數值具體展現了各算子在徹底交集 (0) 與標準交集 (0.6) 之間連續平滑過渡。下半部正式開啟第 4.4 節「模糊聯集（t-反基；s-norms 或 t-conorms）」，定義二元運算 $(A \\cup B)(x) = s(A(x), B(x))$。隨後定義四大常用模糊聯集算子：(1) 標準聯集（Standard Union）：$s(p, q) = \\max(p, q)$；(2) 代數加法（Algebraic Sum）：$s(p, q) = p + q - pq$；(3) 有界加法（Bounded Sum）：$s(p, q) = \\min(1, p + q)$；(4) 徹底聯集（Drastic Union）：若 $q=0$ 則為 $p$，若 $p=0$ 則為 $q$，否則為 1。",
        "formulas": [
            "$$t(A, B)|_{\\text{drastic}} = 0.4/0 + 0/1 + 0/2 + 0.4/3 \\quad [\\text{例 4.3(d)}]$$",
            "$$t_s(A, B)|_{s=1} = 0.4/0 + 0.4/1 + 0.4/2 + 0.4/3 \\quad [\\text{例 4.3(e)}]$$",
            "$$t_y(A, B)|_{y=2} = 0.4/0 + 0.55/1 + 0.55/2 + 0.4/3 \\quad [\\text{例 4.3(f)}]$$",
            "$$t_f(A, B)|_{f=2} = 0.4/0 + 0.47/1 + 0.47/2 + 0.4/3 \\quad [\\text{例 4.3(g)}]$$",
            "$$t_u(A, B)|_{\\lambda=1} = 0.4/0 + 0.32/1 + 0.32/2 + 0.4/3 \\quad [\\text{例 4.3(h)}]$$",
            "$$(A \\cup B)(x) = s(A(x), B(x)), \\quad x \\in X \\quad (4.15)$$",
            "$$s(p, q) = \\max(p, q) \\quad (4.16) \\quad [\\text{標準聯集 Standard Union}]$$",
            "$$s(p, q) = p + q - p \\cdot q \\quad (4.17) \\quad [\\text{代數加法 Algebraic Sum}]$$",
            "$$s(p, q) = \\min(1, p + q) \\quad (4.18) \\quad [\\text{有界加法 Bounded Sum}]$$",
            "$$s(p, q) = \\begin{cases} p, & \\text{當 } q = 0 \\\\ q, & \\text{當 } p = 0 \\\\ 1, & \\text{其他} \\end{cases} \\quad (4.19) \\quad [\\text{徹底聯集 Drastic Union}]$$"
        ],
        "book_examples": [
            "例 4.3(f) Yager(y=2) 手算細節：x=1 時，1 - min(1, sqrt((1-0.6)^2 + (1-0.8)^2)) = 1 - sqrt(0.16 + 0.04) = 1 - sqrt(0.20) ≈ 1 - 0.4472 = 0.5528 ≈ 0.55。",
            "四大模糊聯集運算子本質探討：標準聯集取 max 是最保守的聯集；代數加法將兩者視為獨立事件之機率聯集；有界加法實施線性加總並在 1.0 處平頂飽和；徹底聯集只要任一元素微大於 0 即全面飽和為 1。"
        ]
    },
    {
        "page_id": "4-9",
        "section": "4.4 模糊聯集(t-反基(s-norms 或 t-conorms))",
        "title": "s-基準偏序階層鏈、廣義參數化聯集族與極值界限",
        "summary": "本頁開篇揭示模糊聯集（s-基準）的大小不等式偏序關係：$(4.16) \\le (4.17) \\le (4.18) \\le (4.19)$，即 $\\text{標準聯集} \\le \\text{代數加法} \\le \\text{有界加法} \\le \\text{徹底聯集}$。此處呈現與交集（t-norm）完全對偶的深刻數學現象：標準聯集 $\\max(p, q)$ 是所有可能 s-基準的理論最小下限，而徹底聯集則是理論最大上限。接著引述文獻中三大廣義參數化 s-基準定義：(a) Schweizer & Sklar (1963) 提出之 $s_s(p, q) = 1 - [\\max(0, (1-p)^s + (1-q)^s - 1)]^{1/s}$, $s \\ne 0$；(b) P. R. Yager (1980) 提出之 $s_y(p, q) = \\min[1, (p^y + q^y)^{1/y}]$, $y > 0$；(c) M. J. Frank (1979) 提出之 $s_f(p, q) = 1 - \\log_f [1 + \\frac{(f^{1-p}-1)(f^{1-q}-1)}{f-1}]$, $f > 0, f \\ne 1$。頁面歸納出核心極值不等式 $(4.16) \\le s(p, q) \\le (4.19)$ (4.23)，確立所有合法 s-基準皆受界定。頁末帶入例 4.4，以同於例 4.3 的集合 $A, B$ 準備進行手算。",
        "formulas": [
            "$$(4.16) \\le (4.17) \\le (4.18) \\le (4.19) \\quad [\\text{聯集算子強度偏序關係}]$$",
            "$$s_s(p, q) = 1 - [\\max(0, (1 - p)^s + (1 - q)^s - 1)]^{\\frac{1}{s}}, \\quad s \\ne 0 \\quad (4.20) \\quad [\\text{Schweizer \\& Sklar, 1963}]$$",
            "$$s_y(p, q) = \\min[1, (p^y + q^y)^{\\frac{1}{y}}], \\quad y > 0 \\quad (4.21) \\quad [\\text{Yager, 1980}]$$",
            "$$s_f(p, q) = 1 - \\log_f \\left[ 1 + \\frac{(f^{1 - p} - 1)(f^{1 - q} - 1)}{f - 1} \\right], \\quad f > 0, f \\ne 1 \\quad (4.22) \\quad [\\text{Frank, 1979}]$$",
            "$$(4.16) \\le s(p, q) \\le (4.19) \\quad (4.23) \\quad [\\text{廣義 s-基準極值邊界界限}]$$"
        ],
        "book_examples": [
            "t-norm 與 s-norm 極值對偶律：交集算子中標準交集是最大值 (最大上限)，而在聯集算子中標準聯集反而是最小值 (最小下限)；交集徹底算子最小，聯集徹底算子最大。",
            "廣義聯集公式構造解析：Schweizer-Sklar 與 Frank 的 s-基準公式均利用對偶變形 1 - t(1-p, 1-q) 衍生構造；Yager 的 s-基準則以 Minkowski 距離模式 min(1, ||(p, q)||_y) 構造。"
        ]
    },
    {
        "page_id": "4-10",
        "section": "4.4 模糊聯集(例 4.4 續) / 4.5 混合運算",
        "title": "例 4.4 聯集手算演練、笛摩根定律與對應三組 (Dual Triple)",
        "summary": "本頁上半部完成例 4.4 各聯集算子手算數值解：(a) 標準聯集 (4.16)：$A \\cup B = 1/0 + 0.8/1 + 0.8/2 + 1/3$；(b) 代數加法 (4.17)：$p+q-pq$ 算得 $1/0 + 0.92/1 + 0.92/2 + 1/3$；(c) 有界加法 (4.18)：$\\min(1, p+q)$ 使得所有元素皆達上限 1，得 $1/0 + 1/1 + 1/2 + 1/3$；(d) 徹底聯集 (4.19)：因 $p, q > 0$ 全部飽和為 1；(e) Schweizer-Sklar ($s=1$)：等同有界加法全為 1；(f) Yager ($y=2$)：$\\min(1, \\sqrt{0.6^2+0.8^2}) = \\min(1, 1) = 1$，亦全為 1；(g) Frank ($f=2$)：算得 $1/0 + 0.93/1 + 0.93/2 + 1/3$。數值完全印證聯集偏序鏈。下半部進入第 4.5 節「混合運算」，回顧傳統布林邏輯之笛摩根定律（De Morgan's Laws）：$\\overline{A \\cap B} = \\bar{A} \\cup \\bar{B}$ 與 $\\overline{A \\cup B} = \\bar{A} \\cap \\bar{B}$ (4.24)。書中嚴肅提出核心問題：模糊集合中任意給定的補集、t-norm 與 s-norm 是否皆滿足笛摩根定律？答案為「不盡然」！唯有滿足算子對偶恆等式 $c(t(p, q)) = s(c(p), c(q))$ (4.25a) 及 $c(s(p, q)) = t(c(p), c(q))$ (4.25b) 的運算組合，才被賦予「對應三組（Dual Triple）」的榮譽地位。",
        "formulas": [
            "$$A \\cup B = 1/0 + 0.8/1 + 0.8/2 + 1/3 \\quad [\\text{例 4.4(a) 標準聯集}]$$",
            "$$s(A, B)|_{\\text{algebraic}} = 1/0 + 0.92/1 + 0.92/2 + 1/3 \\quad [\\text{例 4.4(b) 代數加法}]$$",
            "$$s(A, B)|_{\\text{bounded}} = 1/0 + 1/1 + 1/2 + 1/3 \\quad [\\text{例 4.4(c) 有界加法}]$$",
            "$$s_f(A, B)|_{f=2} = 1/0 + 0.93/1 + 0.93/2 + 1/3 \\quad [\\text{例 4.4(g) Frank 聯集}]$$",
            "$$\\begin{cases} \\overline{A \\cap B} = \\bar{A} \\cup \\bar{B} \\\\ \\overline{A \\cup B} = \\bar{A} \\cap \\bar{B} \\end{cases} \\quad (4.24) \\quad [\\text{古典笛摩根定律}]$$",
            "$$c(t(p, q)) = s(c(p), c(q)) \\quad (4.25(a)) \\quad [\\text{模糊笛摩根第一型}]$$",
            "$$c(s(p, q)) = t(c(p), c(q)) \\quad (4.25(b)) \\quad [\\text{模糊笛摩根第二型}]$$"
        ],
        "book_examples": [
            "例 4.4 手算對比：標準聯集在 x=1,2 為 0.8；代數加法為 0.92；Frank(f=2) 為 0.93；而有界加法與 Yager(y=2) 直接飽和達到 1.0，完全體現 (4.16) ≤ (4.17) ≤ (4.18) ≤ (4.19) 偏序階層。",
            "「對應三組 (Dual Triple)」命名由來：並非所有 t 與 s 均能隨意配對；若一組運算子滿足 c(t(p,q)) = s(c(p), c(q)) 與 c(s(p,q)) = t(c(p), c(q))，稱這三種運算 (c, t, s) 構成一個 Dual Triple。"
        ]
    },
    {
        "page_id": "4-11",
        "file_name": "4-11.jpg",
        "section": "4.5 混合運算",
        "title": "定理 4.4 對應三組之笛摩根證明與矛盾律/排中律破裂之爭議",
        "summary": "本頁上半部正式提出「定理 4.4」：列舉出滿足笛摩根定律的四組經典對應三組（Dual Triple）：(i) 標準三組 $\{(4.1a), (4.1b), (4.1c)\}$（標準補集、標準交集、標準聯集）；(ii) 代數三組 $\{(4.1a), (4.8), (4.17)\}$（標準補集、代數乘積、代數加法）；(iii) 有界三組 $\{(4.1a), (4.9), (4.18)\}$（標準補集、有界差異、有界加法）；(iv) 徹底三組 $\{(4.1a), (4.10), (4.19)\}$（標準補集、徹底交集、徹底聯集）。作者於本頁給出組別 (i) 的嚴謹分段證明：由 $c(\\min(p, q)) = 1 - \\min(p, q)$ 與 $s(1-p, 1-q) = \\max(1-p, 1-q)$ 出發，分別討論 $p \\ge q$ 與 $p \\le q$ 兩狀況，皆精確推導出兩側恆等式，完成證明。下半部展開本章最具哲學深度的批判反思：檢視一般明確集合論的九大基本性質（交換律、結合律、分配律、笛摩根定律等），若在模糊標準運算下檢驗，會赫然發現其中「七個性質皆完美成立」，但有「兩個性質徹底無法滿足」——即「矛盾律（Law of Contradiction: $A \\cap A^c = \\emptyset$）」與「排中律（Law of Excluded Middle: $A \\cup A^c = X$）」！在平衡點 $A(x)=0.5$ 處，交集隸屬度為 $\\min(0.5, 0.5)=0.5 \\ne 0$，聯集為 $\\max(0.5, 0.5)=0.5 \\ne 1$。這正是正統集合論學者長期對模糊集合論持保留與批判態度的根本核心。",
        "formulas": [
            "$$\\text{Dual Triple (i): } \\{c(z)=1-z, \\; t(p, q)=\\min(p, q), \\; s(p, q)=\\max(p, q)\\}$$",
            "$$\\text{Dual Triple (ii): } \\{c(z)=1-z, \\; t(p, q)=p \\cdot q, \\; s(p, q)=p + q - p \\cdot q\\}$$",
            "$$\\text{Dual Triple (iii): } \\{c(z)=1-z, \\; t(p, q)=\\max(0, p + q - 1), \\; s(p, q)=\\min(1, p + q)\\}$$",
            "$$\\text{Dual Triple (iv): } \\{c(z)=1-z, \\; t(p, q)=t_{\\text{drastic}}(p, q), \\; s(p, q)=s_{\\text{drastic}}(p, q)\\}$$",
            "$$c(\\min(p, q)) = 1 - \\min(p, q) \\quad (4.26)$$",
            "$$s[(1 - p), (1 - q)] = \\max[(1 - p), (1 - q)] \\quad (4.27)$$"
        ],
        "book_examples": [
            "定理 4.4(i) 分段手算證明：當 p ≥ q 時，1 - min(p, q) = 1 - q；而 1 - p ≤ 1 - q 故 max(1 - p, 1 - q) = 1 - q，兩者相等。同理當 p ≤ q 時兩者皆為 1 - p，得證 c(min(p, q)) = max(c(p), c(q))。",
            "矛盾律與排中律在模糊邏輯中的失效手繪驗證：若取對稱三角形模糊集合，畫圖即可看出 A ∩ A^c 形成的頂點高度為 0.5 而非空集合（矛盾律失效）；A ∪ A^c 在中央谷底高度為 0.5 而非全集合 1.0（排中律失效）。此為模糊學派與古典布林學派歷史論戰的核心。"
        ]
    },
    {
        "page_id": "4-12",
        "file_name": "4-12.jpg",
        "section": "4.6 本章總結與習題",
        "title": "第四章核心總結與課後習題 (連續三角形模糊數運算推導)",
        "summary": "本頁為第四章的收官之頁。第 4.6 節「本章總結」綜述全章四大核心支柱：(1) 模糊補集之多樣性（標準補集、門檻式、Sugeno 式、Yager 式及其平衡點存在唯一性）；(2) 模糊交集之 t-基準（標準交集、代數乘積、有界差異、徹底交集與參數族）及其大小偏序階層；(3) 模糊聯集之 s-基準（標準聯集、代數加法、有界加法、徹底聯集與參數族）及其對偶偏序階層；(4) 笛摩根定律與對應三組（Dual Triple）及古典集合論矛盾律/排中律失效之爭議。接續提供兩道極富啟發性的課後習題：習題 4.1 要求證明定理 4.4 之 (ii)~(iv) 對應三組，考驗代數展開與分段分析技巧；習題 4.2 給定兩個定義於連續實數域的對稱三角形模糊數：$A(x)$ 定義於 $[1, 3]$（頂點在 2），$B(x)$ 定義於 $[2, 4]$（頂點在 3），要求讀者採用不同的 t-基準與 s-基準定義，逐一精確手算並繪製交疊區間 $[2, 3]$ 上的交集 $A \\cap B$、補集交集 $\\bar{A} \\cap \\bar{B}$、聯集補集 $\\overline{A \\cup B}$ 以及聯集 $A \\cup B$ 之連續隸屬函數曲線。",
        "formulas": [
            "$$A(x) = \\begin{cases} x - 1, & x \\in [1, 2] \\\\ 3 - x, & x \\in [2, 3] \\\\ 0, & \\text{其它} \\end{cases}$$",
            "$$B(x) = \\begin{cases} x - 2, & \\text{當 } x \\in [2, 3] \\\\ 4 - x, & \\text{當 } x \\in [3, 4] \\\\ 0, & \\text{其它} \\end{cases}$$",
            "$$\\text{習題 4.2 求解目標：} A \\cap B, \\quad \\bar{A} \\cap \\bar{B}, \\quad \\overline{A \\cup B}, \\quad A \\cup B$$"
        ],
        "book_examples": [
            "習題 4.1 手算證明提示：針對代數三組，展開驗證 1 - pq = (1 - p) + (1 - q) - (1 - p)(1 - q) = 1 - p + 1 - q - (1 - p - q + pq) = 1 - pq；針對有界三組，驗證 1 - max(0, p+q-1) = min(1, (1-p) + (1-q))。",
            "習題 4.2 連續三角形模糊數交疊分析：A(x) 在 [2, 3] 區間呈遞減直線 (3-x)，B(x) 在 [2, 3] 區間呈遞增直線 (x-2)。當計算標準交集 min 時，在 x=2.5 處達到交叉點隸屬度 0.5；代數乘積交集在 [2, 3] 則為二次曲線 (3-x)(x-2)；有界差異交集在 [2, 3] 為 max(0, (3-x)+(x-2)-1) = 0。"
        ]
    }
]

def main():
    print("1. 讀取 course_data.json...")
    with open(COURSE_DATA_JSON, 'r', encoding='utf-8') as f:
        course_data = json.load(f)

    # 建立查找字典
    enrich_map = {}
    for p in CH4_PAGES:
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
                item['chapter_title'] = "第 4 章：模糊集合之運算"
                updated_count += 1
    print(f"all_book_pages 已更新 {updated_count} 頁 (Ch4)。")

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
