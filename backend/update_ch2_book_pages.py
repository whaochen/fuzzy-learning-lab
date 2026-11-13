# -*- coding: utf-8 -*-
"""
更新《認識 Fuzzy》第二章（頁 2-1 ～ 2-15）深度精讀 OCR 數據至 frontend/book_pages.js
"""

import json
import re
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BOOK_PAGES_JS_PATH = r"H:\我的雲端硬碟\Fuzzy-Learning-Platform\frontend\book_pages.js"

CH2_EXTRACTED = [
    {
        "page_id": "2-1",
        "chapter": 2,
        "page_num": 1,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-1.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-1.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-1.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-1.jpg",
        "section": "第二章 章首扉頁",
        "title": "第二章：模糊集合 (Fuzzy Sets) 章首扉頁與單擺機構示意",
        "summary": "本頁為《認識 Fuzzy》全書核心根基篇章——第二章「模糊集合 (Fuzzy Sets)」之章首扉頁。扉頁繪製了經典倒單擺與機械手臂連桿機構之運動示意圖，預示著模糊集合將從人類直覺思維出發，跨越至現代非線性自動控制的重大工程使命。",
        "formulas": [],
        "book_examples": [
            "章首插圖：單擺/機械手臂運動機構示意圖，象徵模糊集合理論是自動控制與非線性系統控制的核心數學基石。"
        ]
    },
    {
        "page_id": "2-2",
        "chapter": 2,
        "page_num": 2,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-2.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-2.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-2.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-2.jpg",
        "section": "2.1 簡介",
        "title": "人類語意的不確定性與「意義的數量化 (Quantification of Meaning)」",
        "summary": "人類日常生活語言中充滿了模稜兩可、邊界混淆的不確定性形容詞（如「很胖的人」、「很老的狗」），現實中從未精確界定幾公斤以上叫胖、幾歲以上叫老，純粹是一種直覺與習慣。在工程控制領域中，形容系統狀態（如水溫太熱、轉速太快）亦具備相同的模糊特質。作者提出建立二維直角座標系：將形容詞所描述的客觀物理量（體重、年齡、溫度）標註於橫軸，而將人類認定的不確定程度（歸屬度 $\\mu$）數量化於縱軸，規定當 $\\mu \\to 1$ 表示程度愈重或愈符合，$\\mu \\to 0$ 則表示程度愈輕。這種透過座標曲線將抽象語言具象化的數學方法，稱為「意義的數量化 (Quantification of Meaning)」，正是模糊集合理論的發源。",
        "formulas": [
            "$$\\mu \\to 1 \\;(\\text{程度愈重 / 完全符合}), \\qquad \\mu \\to 0 \\;(\\text{程度愈輕 / 完全不符})$$"
        ],
        "book_examples": [
            "圖 2.1(a)「胖」的人：橫軸標示體重 50, 100, 150 公斤，縱軸標示胖的程度 $\\mu$。在 50 公斤以下 $\\mu \\approx 0$；50~150 公斤之間平滑上升，在 100 公斤處 $\\mu = 0.5$；150 公斤以上趨近於 1。",
            "圖 2.1(b)「老」的狗：橫軸標示狗的年齡 0, 10, 20 歲，縱軸標示老的程度 $\\mu$。曲線自 0 歲隨年齡平滑上升，約在 10 歲處達 $\\mu = 0.5$，20 歲以上趨近於 1。"
        ]
    },
    {
        "page_id": "2-3",
        "chapter": 2,
        "page_num": 3,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-3.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-3.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-3.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-3.jpg",
        "section": "2.1 簡介 / 2.2 明確集合之複習",
        "title": "明確集合 (Crisp Set)、特性函數 $\\Phi_A(x)$ 與宇集合 $X$",
        "summary": "模糊理論是奠基於「意義的數量化」並結合傳統集合論推廣而成。本節先系統化複習古典明確集合（Crisp Set）：明確集合中元素的歸屬界線涇渭分明，元素非屬即不屬。數學上以「特性函數 (Characteristic Function) $\\Phi_A(x)$」刻畫歸屬關係，若 $x \\in A$ 則 $\\Phi_A(x)=1$，若 $x \\notin A$ 則 $\\Phi_A(x)=0$。所有討論元素的來源母集稱為「宇集合／全集合 (Universal Set 或 Universe of Discourse) $X$」。本頁同時整理古典集合的基本關係：部分集合（子集 $A \\subset B$）、差集（$B - A$）、補集合（$\\bar{A}$）、空集合（$\\phi$）與宇集合互補性（$\\bar{\\phi} = X, \\bar{X} = \\phi$），以及雙重補集恆等性 $\\bar{\\bar{A}} = A$。",
        "formulas": [
            "$$\\Phi_A(x) = \\begin{cases} 1, & \\text{當 } x \\in A \\\\ 0, & \\text{當 } x \\notin A \\end{cases} \\qquad (\\Phi_A : X \\to \\{0, 1\\})$$",
            "$$B - A = \\{x \\mid x \\in B, \\text{但 } x \\notin A\\}, \\qquad \\bar{A} = \\{x \\mid x \\notin A, x \\in X\\}$$",
            "$$\\bar{\\bar{A}} = A, \\qquad \\bar{\\phi} = X, \\qquad \\bar{X} = \\phi$$"
        ],
        "book_examples": [
            "明確集合列舉法：$A_1 = \\{a, b, c\\}$，其中 $a \\in A_1, d \\notin A_1$。",
            "明確集合描述法：$A_2 = \\{x \\mid 2x + 4 = 0, x \\in \\mathbb{R}\\}$，解得 $x = -2 \\in A_2$，而 $x = 0 \\notin A_2$。"
        ]
    },
    {
        "page_id": "2-4",
        "chapter": 2,
        "page_num": 4,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-4.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-4.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-4.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-4.jpg",
        "section": "2.2 明確集合之複習 / 2.3 模糊集合之基本型態",
        "title": "古典集合八大基本運算性質與模糊集合歸屬函數之誕生",
        "summary": "整理明確集合之交集與聯集運算，並條列古典集合八大基本性質：交換律、結合律、分配律、同一律、吸入律、恆等律、矛盾律（$A \\cap \\bar{A} = \\phi$）、排中律（$A \\cup \\bar{A} = X$）與笛摩根定律。隨後正式引出「論域 (Universe of Discourse)」名詞，並開啟「2.3 模糊集合之基本型態」：當集合 $A$ 的特性函數不再侷限於二值 $\\{0, 1\\}$，而是推廣為可取值於實數區間 $[0, 1]$ 內的任意連續實數時，代表元素屬於集合的程度（Grade / Degree of Membership）有了輕重之別。這種具有漸變隸屬關係的集合稱為「模糊集合 (Fuzzy Sets)」，而其特性函數即稱為「歸屬函數 (Membership Function)」，記為 $\\mu_A(x)$ 或簡記為 $A(x)$。",
        "formulas": [
            "$$A \\cap B = \\{x \\mid x \\in A \\text{ 且 } x \\in B\\}, \\qquad A \\cup B = \\{x \\mid x \\in A \\text{ 或 } x \\in B\\}$$",
            "$$A \\cap \\bar{A} = \\phi \\;(\\text{矛盾律}), \\qquad A \\cup \\bar{A} = X \\;(\\text{排中律})$$",
            "$$\\overline{A \\cap B} = \\bar{A} \\cup \\bar{B}, \\qquad \\overline{A \\cup B} = \\bar{A} \\cap \\bar{B} \\;(\\text{笛摩根定律})$$"
        ],
        "book_examples": [
            "重要概念辨析：宇集合 $X$ 在中文文獻常譯為「論域」，歸屬函數 $\\mu_A(x)$ 值介於 0 與 1 之間，數值愈大代表歸屬程度愈高。"
        ]
    },
    {
        "page_id": "2-5",
        "chapter": 2,
        "page_num": 5,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-5.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-5.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-5.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-5.jpg",
        "section": "2.3 模糊集合之基本型態",
        "title": "歸屬函數數學映射定義與例 2.1「小朋友」之模糊 vs 明確對比",
        "summary": "嚴格定義歸屬函數的數學映射表示式：$\\mu_A : X \\to [0, 1]$ 或簡記為 $A : X \\to [0, 1]$。作者特別約定全書後續皆統一以 $A(x)$ 代表模糊集合 $A$ 之歸屬函數，以 $A$ 代表模糊集合本身。接著以例題 2.1「小朋友之年齡」深入剖析模糊集合與古典明確集合的本質差異：若用明確集合界定小朋友為 $[3, 9]$ 歲（方波分佈），未滿 3 歲完全不算，一過 3 歲生日瞬間百分之百算小朋友，一過 9 歲生日又瞬間完全不算，這種剛性切分顯得「強人所難」且脫離常理；反觀模糊集合以鐘形曲線平滑過渡，完美符合人類客觀認知。",
        "formulas": [
            "$$A : X \\to [0, 1], \\qquad (0 \\le A(x) \\le 1, \\; x \\in X)$$"
        ],
        "book_examples": [
            "例題 2.1 圖 2.2(a) 模糊集合曲線：橫軸年齡 1~13 歲，6 歲小孩 $A(6) = 1.0$（百分之百是小朋友）；4 歲小孩 $A(4) = 0.7$（七成是小朋友）；10 歲小孩 $A(10) = 0.5$；12 歲少年 $A(12) = 0.1$（歸類為青少年更恰當）。",
            "例題 2.1 圖 2.2(b) 明確集合方波：在 $[3, 9]$ 歲間為 1，其餘為 0。書中特別指出「這種描述法太過強人所難，悖離人性」。"
        ]
    },
    {
        "page_id": "2-6",
        "chapter": 2,
        "page_num": 6,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-6.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-6.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-6.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-6.jpg",
        "section": "2.3 模糊集合之基本型態",
        "title": "主觀性與環境依賴性：學歷教育程度、天氣開水溫差與美女評估",
        "summary": "探討歸屬函數的兩大核心特性：第一為「環境與對象依賴性」——如圖 2.4 所示，同樣是「高溫」，在氣象天氣領域 40°C 即為極限高溫（$\\mu=1$），但在日常開水領域 40°C 僅為微溫，須達 80°C~100°C 才是真正的高溫；第二為「評估者主觀意識性」——即使受測對象相同，不同人可能給出不同的歸屬度評估，如圖 2.5 中甲、乙兩位男士對 7 位女生進行「美女程度」評比，因女友不同，甲給自己女友 $a_4$ 評定為 1.0，而乙給自己女友 $a_2$ 評定為 1.0。本頁亦藉由圖 2.3 分析學歷教育程度的模糊集合覆蓋。",
        "formulas": [],
        "book_examples": [
            "圖 2.3 學歷與教育程度模糊集合：橫軸由文盲、小學、國中、高中、學士、碩士至博士。學士在初等教育為 0，中等教育為 0.8，高等教育為 0.6；博士在高等教育為 1.0，初等教育為 0。",
            "圖 2.5 美女評估主觀差異：受測女性 $a_1 \\sim a_7$，甲評定其女友 $a_4$ 為 1.0，乙評定其女友 $a_2$ 為 1.0，體現主觀經驗的量化包容性。"
        ]
    },
    {
        "page_id": "2-7",
        "chapter": 2,
        "page_num": 7,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-7.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-7.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-7.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-7.jpg",
        "section": "2.3 模糊集合之基本型態",
        "title": "有限離散模糊集合表示法、連續型 vs 離散型與基本特徵不可顛倒",
        "summary": "引入有限離散宇集合中模糊集合的標準代數符號記法：採用加號符號 $+$（此處非算術相加，而是聯集/組合意涵）與斜線 $/$（表示歸屬度與元素之綁定對應，非除法）。對比連續型模糊集合（論域具備實數稠密性，如溫度、年齡）與離散型模糊集合（論域為有限個獨立物件，如人員、物件清單）。作者在此提出極重要之哲學與工程準則：客觀性較大的模糊集合（如「熱天氣」），雖然容許個人主觀感受差異，但「基本客觀特徵絕不可顛倒是非」（如溫度越高必須越熱，不可出現溫度上升歸屬度反而下降的矛盾）。",
        "formulas": [
            "$$\\text{美女}_{(\\text{乙})} = \\frac{0.4}{a_1} + \\frac{1}{a_2} + \\frac{0.8}{a_3} + \\frac{0.6}{a_4} + \\frac{0.8}{a_5} + \\frac{0.4}{a_6} + \\frac{0.2}{a_7}$$",
            "$$A = \\sum_{i=1}^n \\frac{\\mu_A(x_i)}{x_i} \\qquad (\\text{離散表示法，}+ \\text{ 代表集合元素之並列，}/ \\text{ 代表歸屬度綁定})$$"
        ],
        "book_examples": [
            "圖 2.4(a) 天氣高溫：5°C 以下為 0，5°C~40°C 線性爬升至 1，40°C 以上恆為 1。",
            "圖 2.4(b) 開水高溫：30°C 以下為 0，30°C~80°C 平滑非線性上升至 1，80°C 以上恆為 1。",
            "圖 2.5(a)(b) 針狀離散圖：甲給定 $a_1:0.3, a_2:0.5, a_3:0.7, a_4:1.0, a_5:0.9, a_6:0.6, a_7:0.4$；乙給定 $a_1:0.4, a_2:1.0, a_3:0.8, a_4:0.6, a_5:0.8, a_6:0.4, a_7:0.2$。"
        ]
    },
    {
        "page_id": "2-8",
        "chapter": 2,
        "page_num": 8,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-8.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-8.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-8.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-8.jpg",
        "section": "2.3 模糊集合之基本型態",
        "title": "「熱天氣」合理 vs 不合理曲線辨析與常用連續歸屬函數型態",
        "summary": "透過圖 2.6 嚴格對比「熱天氣」之合理與不合理歸屬曲線：圖 2.6(a)(b) 隨溫度升高歸屬度單調遞增，符合物理規律；圖 2.6(c) 在 20~40°C 歸屬度為 1，但超過 40°C（如 50°C、60°C）歸屬度竟暴跌至 0，屬違反客觀常識之荒謬曲線。隨後展示工程中最常用的五種標準連續歸屬函數型態——圖 2.7 以「靠近 5 之實數」為例，展示三角形分段線性、鐘形有理分式、指數尖峰形、餘弦平滑鐘形與垂直單值線（Singleton）。",
        "formulas": [],
        "book_examples": [
            "圖 2.6(a)(b) 合理曲線：20°C 以下為 0，20°C~40°C 線性或 S 型平滑上升，40°C 以上為 1。",
            "圖 2.6(c) 不合理曲線：40°C 以上歸屬度驟降，書中明斥為「顛倒是非之錯誤建模」。",
            "圖 2.7(a) 三角形歸屬函數：中心為 5，支撐區間為 $[4, 6]$。",
            "圖 2.7(b) 鐘形分式歸屬函數：頂點為 5，兩側平滑對稱漸近遞減。"
        ]
    },
    {
        "page_id": "2-9",
        "chapter": 2,
        "page_num": 9,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-9.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-9.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-9.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-9.jpg",
        "section": "2.3 模糊集合之基本型態",
        "title": "圖 2.7「靠近 5 之實數」四種標準連續歸屬函數數學解析式",
        "summary": "正式給出圖 2.7 中四種連續型歸屬函數的嚴謹數學解析方程式 $A_1(x) \\sim A_4(x)$。其中參數 $p_i$ 代表曲線的胖瘦、上升率與收斂擴散速度，是模糊控制器設計時關鍵的調整參數（Tuning Parameters）：(a) 分段線性三角形歸屬函數 $A_1(x)$；(b) 柯西鐘形有理分式歸屬函數 $A_2(x)$；(c) 雙邊指數衰減尖峰歸屬函數 $A_3(x)$；(d) 平滑餘弦半波歸屬函數 $A_4(x)$。",
        "formulas": [
            "$$A_1(x) = \\begin{cases} (x - 5) + 1, & x \\in [4, 5] \\\\ (5 - x) + 1, & x \\in [5, 6] \\\\ 0, & \\text{其他} \\end{cases} \\qquad (\\text{三角形})$$",
            "$$A_2(x) = \\frac{1}{1 + p_2(x - 5)^2} \\qquad (\\text{鐘形有理分式})$$",
            "$$A_3(x) = \\exp\\{-|p_3(x - 5)|\\} \\qquad (\\text{指數尖峰型})$$",
            "$$A_4(x) = \\begin{cases} \\frac{1 + \\cos(p_4 \\pi (x - 5))}{2}, & x \\in [5 - \\frac{1}{p_4}, 5 + \\frac{1}{p_4}] \\\\ 0, & \\text{其他} \\end{cases} \\qquad (\\text{餘弦鐘形})$$"
        ],
        "book_examples": [
            "圖 2.7(c) 指數尖峰：在中心 $x=5$ 處斜率不連續，具備極佳的極值鎖定能力。",
            "圖 2.7(d) 餘弦鐘形：當 $p_4 = 1$ 時，支撐區間為 $[4, 6]$，且在頂部與兩端具備一階連續導數，利於梯度優化。"
        ]
    },
    {
        "page_id": "2-10",
        "chapter": 2,
        "page_num": 10,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-10.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-10.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-10.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-10.jpg",
        "section": "2.3 模糊集合基本型態 / 2.4 模糊集合之基本觀念",
        "title": "模糊單值 (Singleton) 與圖 2.8 年齡三集合分段架構",
        "summary": "介紹圖 2.7(e) 特殊的極限型態——「模糊單值 (Singleton)」，在 $x=5$ 處歸屬度為 1，其餘處處為 0，本質上即為傳統明確實數 $x=5$ 在模糊論域中的退化映射，廣泛應用於 TSK（Sugeno）模糊推論模型之後件部常數項。隨後進入「2.4 模糊集合之基本觀念」，正式推出貫穿全書基礎概念之黃金範例——圖 2.8「年齡之三個模糊集合」：年輕人 $A_1$、中年人 $A_2$ 與老年人 $A_3$。",
        "formulas": [
            "$$A_5(x) = \\begin{cases} 1, & x = 5 \\\\ 0, & x \\neq 5 \\end{cases} \\qquad (\\text{模糊單值 Singleton})$$"
        ],
        "book_examples": [
            "圖 2.8 年齡分佈：論域 $X = [0, 100]$ 歲。$A_1$ 年輕人在 0~20 歲為 1，20~40 歲線性降至 0；$A_2$ 中年人在 20~40 歲升至 1（40 歲為頂點），40~60 歲降至 0；$A_3$ 老年人在 40~60 歲升至 1，60~100 歲維持為 1。"
        ]
    },
    {
        "page_id": "2-11",
        "chapter": 2,
        "page_num": 11,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-11.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-11.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-11.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-11.jpg",
        "section": "2.4 模糊集合之基本觀念",
        "title": "圖 2.8 數學解析式、$\\alpha$-截集 ($\\alpha$-Cut) 與強截集 (Strong $\\alpha$-Cut)",
        "summary": "詳列圖 2.8 年齡三集合 $A_1(x), A_2(x), A_3(x)$ 在論域 $X=[0, 100]$ 上的完整分段函數方程式。隨後引入模糊集合論最重要的橋樑概念——「$\\alpha$-截集 ($\\alpha$-Cut, ${}^\\alpha A$)」與「$\\alpha$-強截集 (Strong $\\alpha$-Cut, ${}^{\\alpha+} A$)」。作者特別著重強調：雖然 $A$ 是模糊集合，但 ${}^\\alpha A$ 與 ${}^{\\alpha+} A$ 是百分之百的「明確集合 (Crisp Set)」，它將歸屬度大於等於（或大於）門檻值 $\\alpha$ 的元素挑選出來，成為模糊集合溝通傳統數學與區間分析的關鍵通道。本頁計算當 $\\alpha = 0.5$ 時的具體區間數值。",
        "formulas": [
            "$$A_1(x) = \\begin{cases} 1, & x \\le 20 \\\\ \\frac{40-x}{20}, & 20 < x < 40 \\\\ 0, & x \\ge 40 \\end{cases}, \\quad A_2(x) = \\begin{cases} 0, & x \\le 20 \\text{ 或 } x \\ge 60 \\\\ \\frac{x-20}{20}, & 20 < x \\le 40 \\\\ \\frac{60-x}{20}, & 40 \\le x < 60 \\end{cases}, \\quad A_3(x) = \\begin{cases} 0, & x \\le 40 \\\\ \\frac{x-40}{20}, & 40 < x < 60 \\\\ 1, & x \\ge 60 \\end{cases}$$",
            "$${}^\\alpha A = \\{x \\mid A(x) \\ge \\alpha\\} \\;(\\text{式 2.1}), \\qquad {}^{\\alpha+} A = \\{x \\mid A(x) > \\alpha\\} \\;(\\text{式 2.2})$$",
            "$${}^{0.5}A_1 = [0, 30], \\qquad {}^{0.5}A_2 = [30, 50], \\qquad {}^{0.5}A_3 = [50, 100]$$"
        ],
        "book_examples": [
            "$\\alpha=0.5$ 截集對比：中年人 ${}^{0.5}A_2 = [30, 50]$ 包含端點（閉區間），強截集 ${}^{0.5+}A_2 = (30, 50)$ 為不包含端點之開區間。"
        ]
    },
    {
        "page_id": "2-12",
        "chapter": 2,
        "page_num": 12,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-12.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-12.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-12.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-12.jpg",
        "section": "2.4 模糊集合之基本觀念",
        "title": "支集/底集 (Support)、核 (Core)、高度 (Height)、正規性與凸形集合條件",
        "summary": "深入探討幾大核心幾何概念：(1) **底集 / 支集 (Support)**：${}^{0+}A$ 為歸屬度大於 0 的全體元素集合。作者特別註明中文翻譯通常稱 Support 為支集，但他認為「底集」更符合圖形意義，全書統一採用「底集」；(2) **核 (Core)**：${}^1 A$ 為歸屬度恆等於 1 的全體元素集合；(3) **高度 (Height, $h(A)$)**：模糊集合歸屬度的最大上確界；(4) **正規 (Normal) 模糊集合**：凡 $h(A) = 1$ 即為正規模糊集合；(5) **凸形集合 (Convex Set)**：式 (2.4) 要求兩點連線上任意內插點 $x_k$ 之歸屬度，皆不小於兩端點歸屬度的較小者，代表幾何圖形單峰無凹陷。",
        "formulas": [
            "$$h(A) = \\max_{x \\in X} A(x) \\;(\\text{式 2.3}) \\qquad (\\text{當 } h(A)=1 \\text{ 稱為正規 Normal})$$",
            "$$A(\\lambda x_1 + (1-\\lambda)x_2) \\ge \\min(A(x_1), A(x_2)), \\quad \\lambda \\in [0, 1] \\;(\\text{式 2.4, 凸形條件})$$",
            "$${}^{0+}A_1 = [0, 40), \\qquad {}^{0+}A_2 = (20, 60), \\qquad {}^{0+}A_3 = (40, 100]$$"
        ],
        "book_examples": [
            "圖 2.8 數值驗證：$h(A_1)=h(A_2)=h(A_3)=1$ 皆為正規模糊集合；${}^0 A_i = [0, 100] = X$（全體宇集合）。"
        ]
    },
    {
        "page_id": "2-13",
        "chapter": 2,
        "page_num": 13,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-13.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-13.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-13.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-13.jpg",
        "section": "2.4 模糊集合之基本觀念",
        "title": "圖 2.9 正規凸形 vs 正規非凸形（雙峰凹陷）對比與位階集合 $\\Lambda(A)$",
        "summary": "透過圖 2.9(a) 與 2.9(b) 呈現極具啟發性的視覺幾何對照：圖 2.9(a) 為單峰鐘形曲線，最高點達 1，任意割線的水平截割區間均為單一連續線段，屬「正規且凸形」；圖 2.9(b) 雖最高點亦達 1（故為正規），但因中間出現凹陷谷底（雙峰分佈），水平截線會被切分成兩段分離區間，不滿足凸形條件式 (2.4)，故為「正規但非凸形」。隨後證明單調包含關係：門檻越高截集越小（$\\alpha_1 < \\alpha_2 \\implies {}^\\alpha_1 A \\supset {}^\\alpha_2 A$）。文末定義「位階集合 (Level Set, $\\Lambda(A)$)」為集合中所有實際出現過的歸屬度數值集合。",
        "formulas": [
            "$$\\alpha_1 < \\alpha_2 \\implies {}^{\\alpha_1} A \\supset {}^{\\alpha_2} A \\quad \\text{且} \\quad {}^{\\alpha_1+} A \\supset {}^{\\alpha_2+} A$$",
            "$$\\Lambda(A) = \\{\\alpha \\mid A(x) = \\alpha, \\; x \\in X\\} \\qquad (\\text{位階集合 Level Set})$$"
        ],
        "book_examples": [
            "圖 2.9(a) 正規凸形：標註底集 ${}^{0+}A$、$\\alpha$-截集 ${}^\\alpha A$ 與高度 $h(A)=1$。",
            "圖 2.9(b) 正規非凸形：雙峰曲線中間凹陷，生動呈現違反凸形定義之反例。",
            "位階集合範例：圖 2.8 連續集合 $\\Lambda(A_1) = \\Lambda(A_2) = \\Lambda(A_3) = [0, 1]$。"
        ]
    },
    {
        "page_id": "2-14",
        "chapter": 2,
        "page_num": 14,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-14.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-14.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-14.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-14.jpg",
        "section": "2.4 模糊集合基本觀念 / 2.5 本章總結與習題",
        "title": "純基數 (Scalar Cardinality) $|A|$、第二章重點總結與課堂習題 (2.1~2.7a)",
        "summary": "定義有限離散模糊集合所有元素歸屬度之代數總和為「純基數 (Scalar Cardinality, $|A|$)」，代表模糊集合的模糊元素總量。以圖 2.5(b) 乙心目中的美女集合為例，將 7 位女生的歸屬度加總求得純基數為 4.2。隨後進入「2.5 本章總結」，系統化回顧模糊集合定義、意義數量化、歸屬函數、$\\alpha$-截集、高度、底集、正規性與凸形性。文末收錄課堂必考習題 2.1 至 2.7(a)，涵蓋基礎理論問答與離散集合高度與純基數的手算演練。",
        "formulas": [
            "$$|A| = \\sum_{x \\in X} A(x) \\;(\\text{式 2.5, 純基數 Scalar Cardinality})$$",
            "$$|\\text{美女}_{(\\text{乙})}| = 0.4 + 1.0 + 0.8 + 0.6 + 0.8 + 0.4 + 0.2 = 4.2$$"
        ],
        "book_examples": [
            "習題 2.1~2.6 觀念題：模糊集合與明確集合本質差異、$\\alpha$-截集是否為明確集合、如何判定正規性與凸形性。",
            "習題 2.7(a) 計算題：$A = 0.4/a + 0.5/b + 0.6/c + 0.8/d + 1/e$，求高度 $h(A) = 1$ 與純基數 $|A| = 0.4+0.5+0.6+0.8+1 = 3.3$。"
        ]
    },
    {
        "page_id": "2-15",
        "chapter": 2,
        "page_num": 15,
        "chapter_title": "第 2 章：模糊集合理論與基礎定義",
        "parent_chapter_id": "fuzzy_sets",
        "file_name": "2-15.jpg",
        "relative_path": "../materials/book_photos/chapter2_photos/2-15.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-15.jpg",
        "image_path": "../materials/book_photos/chapter2_photos/2-15.jpg",
        "section": "2.5 習題 (綜合計算題)",
        "title": "第二章壓軸習題：離散集合 $B$ 與分式函數集合 $C(x)$ 之純基數與 $\\alpha$-截集運算",
        "summary": "收錄第二章壓軸實戰習題 2.7(b)(c) 與 2.8：題 2.7(b) 給定離散集合 $B = 1/w + 1/t + 1/u$，求得其高度 $h(B)=1$、純基數 $|B|=3$；題 2.7(c) 給定定義在有限整數論域 $X=\\{0, 1, 2, \\dots, 10\\}$ 上的有理分式歸屬函數 $C(x) = \\frac{x}{x+2}$，檢驗非線性函數在離散論域的數值分佈；題 2.8 要求針對 $A, B, C$ 分別求出 $\\alpha = 0.6$ 時的截集 ${}^{0.6}A, {}^{0.6}B, {}^{0.6}C$，其中 ${}^{0.6}C$ 解不等式 $\\frac{x}{x+2} \\ge 0.6 \\iff x \\ge 3$，求得明確整數集合 $\\{3, 4, 5, 6, 7, 8, 9, 10\\}$。",
        "formulas": [
            "$$B = 1/w + 1/t + 1/u \\implies h(B) = 1, \\quad |B| = 3$$",
            "$$C(x) = \\frac{x}{x+2}, \\quad x \\in \\{0, 1, 2, \\dots, 10\\} = X$$",
            "$$\\frac{x}{x+2} \\ge 0.6 \\iff x \\ge 0.6x + 1.2 \\iff 0.4x \\ge 1.2 \\iff x \\ge 3 \\implies {}^{0.6}C = \\{3, 4, 5, 6, 7, 8, 9, 10\\}$$"
        ],
        "book_examples": [
            "習題 2.8(a)：${}^{0.6}A = \\{c, d, e\\}$（因 $c:0.6, d:0.8, e:1.0 \\ge 0.6$）。",
            "習題 2.8(b)：${}^{0.6}B = \\{w, t, u\\}$（因元素歸屬度皆為 1.0）。",
            "習題 2.8(c)：代數解集合不等式，完美示範 $\\alpha$-截集由模糊函數轉化為明確數值集合之完整推導。"
        ]
    }
]

def main():
    print("讀取 book_pages.js...")
    with open(BOOK_PAGES_JS_PATH, "r", encoding="utf-8") as f:
        js_text = f.read()

    # 1. 替換 window.BOOK_PHOTOS 的 "ch2" 陣列
    ch2_json = json.dumps(CH2_EXTRACTED, ensure_ascii=False, indent=4)
    # 縮進 4 空格
    indented_ch2 = "\n".join("  " + line if line.strip() else "" for line in ch2_json.split("\n"))

    pattern_ch2 = r'("ch2":\s*\[)[\s\S]*?(\n\s*\],\s*"ch3":)'
    if re.search(pattern_ch2, js_text):
        js_text = re.sub(pattern_ch2, r'\1' + "\n" + indented_ch2.strip()[1:-1] + r'\2', js_text, count=1)
        print("✅ 成功替換 window.BOOK_PHOTOS['ch2']！")
    else:
        print("❌ 未匹配到 window.BOOK_PHOTOS['ch2'] 模式，請手動檢查！")
        return

    # 2. 同步更新 window.BOOK_PHOTOS_ALL 中對應的 2-1 ~ 2-15
    for page in CH2_EXTRACTED:
        pid = page["page_id"]
        # 尋找 BOOK_PHOTOS_ALL 中的對應項並更新其 section, title, summary, formulas, book_examples
        pid_pat = rf'(\{{\s*"page_id":\s*"{pid}",)[\s\S]*?(\n\s*\}}(?:,|\s*\]))'
        page_json = json.dumps(page, ensure_ascii=False, indent=4)
        indented_page = "\n".join("  " + line for line in page_json.split("\n")).strip()
        # 僅替換 BOOK_PHOTOS_ALL 中的匹配
        # 我們先分割 window.BOOK_PHOTOS_ALL
        if "window.BOOK_PHOTOS_ALL = [" in js_text:
            parts = js_text.split("window.BOOK_PHOTOS_ALL = [")
            all_part = parts[1]
            all_part_new = re.sub(pid_pat, indented_page + r'\2', all_part, count=1)
            js_text = parts[0] + "window.BOOK_PHOTOS_ALL = [" + all_part_new

    # 寫回檔案
    with open(BOOK_PAGES_JS_PATH, "w", encoding="utf-8") as f:
        f.write(js_text)

    print("🎉 成功將第二章 15 頁深度精讀內容寫入 frontend/book_pages.js！")

if __name__ == "__main__":
    main()
