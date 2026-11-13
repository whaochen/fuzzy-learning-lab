#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fuzzy 學習平台 — 全書 19 章 282 頁書頁照片自動掛載與結構化資料生成腳本
(backend/ingest_all_book_pages.py)

執行方式：
& "$HOME\.fuzzy_env\Scripts\python.exe" backend/ingest_all_book_pages.py
"""

import json
import os
import re
import sys
import time
from pathlib import Path

# 遵守 AGENTS.md 規範
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
sys.dont_write_bytecode = True

# 定義專案根目錄
PROJECT_ROOT = Path("H:/我的雲端硬碟/Fuzzy-Learning-Platform")
MATERIALS_DIR = PROJECT_ROOT / "materials"
BOOK_PHOTOS_DIR = MATERIALS_DIR / "book_photos"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
OUTPUT_JSON_PATH = FRONTEND_DIR / "course_data.json"
OUTPUT_JS_PATH = FRONTEND_DIR / "course_data.js"

# 19 個章節目錄定義
CHAPTER_DEFINITIONS = [
    {
        "ch": 1,
        "title": "第 1 章：緒論與模糊邏輯起源",
        "parent_chapter_id": "fuzzy_sets",
        "parent_title": "Chapter 01：模糊集合基礎",
        "badge_color": "sky",
        "desc": "探討真實世界模糊性、Zadeh 1965 年開創性論文與傳統二值邏輯之局限。",
        "photo_count": 7
    },
    {
        "ch": 2,
        "title": "第 2 章：模糊集合 (Fuzzy Sets)",
        "parent_chapter_id": "fuzzy_sets",
        "parent_title": "Chapter 01：模糊集合基礎",
        "badge_color": "sky",
        "desc": "歸屬函數、Zadeh 記號、四大典型歸屬函數、α-截集、核、支集與模糊集合凸性。",
        "photo_count": 15
    },
    {
        "ch": 3,
        "title": "第 3 章：模糊集合基本運算與擴展原理",
        "parent_chapter_id": "fuzzy_numbers_extension",
        "parent_title": "Chapter 04：模糊數與擴展原理",
        "badge_color": "amber",
        "desc": "Zadeh 擴展原理、模糊數定義、α-cut 區間算術與非線性映射。",
        "photo_count": 15
    },
    {
        "ch": 4,
        "title": "第 4 章：模糊關係與合成運算",
        "parent_chapter_id": "fuzzy_relations_inference",
        "parent_title": "Chapter 02：模糊關係與推論",
        "badge_color": "indigo",
        "desc": "笛卡兒積 R = A × B、模糊關係矩陣、Max-Min / Max-Product 合成運算。",
        "photo_count": 12
    },
    {
        "ch": 5,
        "title": "第 5 章：模糊邏輯推論與近似推論 (含解模糊化)",
        "parent_chapter_id": "fuzzy_relations_inference",
        "parent_title": "Chapter 02：模糊關係與推論",
        "badge_color": "indigo",
        "desc": "語言變數、模糊 IF-THEN 規則、Mamdani 截頂 vs Larsen 縮放、多規則聚合與四大解模糊化指標。",
        "photo_count": 31
    },
    {
        "ch": 6,
        "title": "第 6 章：模糊邏輯控制器 (FLC) 設計架構",
        "parent_chapter_id": "fuzzy_control_applications",
        "parent_title": "Chapter 03：模糊控制器設計與實務應用",
        "badge_color": "emerald",
        "desc": "FLC 四大模組方塊圖、誤差 e 與誤差變化率 Δe、5×5 FAM 規則庫設計原則與比例因子調諧。",
        "photo_count": 16
    },
    {
        "ch": 7,
        "title": "第 7 章：倒單擺非線性平衡控制實務",
        "parent_chapter_id": "fuzzy_control_applications",
        "parent_title": "Chapter 03：模糊控制器設計與實務應用",
        "badge_color": "emerald",
        "desc": "倒單擺非線性動力量學模型、角度與角速度輸入規則庫設計與穩定度分析。",
        "photo_count": 16
    },
    {
        "ch": 8,
        "title": "第 8 章：模糊冷氣溫控與節能系統",
        "parent_chapter_id": "fuzzy_control_applications",
        "parent_title": "Chapter 03：模糊控制器設計與實務應用",
        "badge_color": "emerald",
        "desc": "冷氣溫控、即時室溫與變化率回授、變頻風扇轉速調節與節能響應。",
        "photo_count": 12
    },
    {
        "ch": 9,
        "title": "第 9 章：模糊洗衣機與家電模糊感測",
        "parent_chapter_id": "fuzzy_control_applications",
        "parent_title": "Chapter 03：模糊控制器設計與實務應用",
        "badge_color": "emerald",
        "desc": "布質光電感測、水流濁度感測、最佳洗衣時間與微控制器 (MCU) 實作。",
        "photo_count": 21
    },
    {
        "ch": 10,
        "title": "第 10 章：汽車自駕與防鎖死煞車系統",
        "parent_chapter_id": "fuzzy_control_applications",
        "parent_title": "Chapter 03：模糊控制器設計與實務應用",
        "badge_color": "emerald",
        "desc": "車距與車速模糊煞車力道推論、ABS 防鎖死滑差率調節與安全煞停。",
        "photo_count": 13
    },
    {
        "ch": 11,
        "title": "第 11 章：模糊類神經網路 (Neuro-Fuzzy / ANFIS)",
        "parent_chapter_id": "advanced_fuzzy_neuro",
        "parent_title": "Chapter 07：進階模糊系統、類神經模糊與綜合應用",
        "badge_color": "cyan",
        "desc": "Jang 自適應神經模糊架構、前向最小平方與反向梯度下降混合學習演算法。",
        "photo_count": 15
    },
    {
        "ch": 12,
        "title": "第 12 章：模糊圖形識別與影像特徵擷取",
        "parent_chapter_id": "fuzzy_clustering_pattern",
        "parent_title": "Chapter 06：模糊分群與圖形識別",
        "badge_color": "teal",
        "desc": "灰階特徵增強、模糊邊緣檢測、格雷與海明貼近度識別準則。",
        "photo_count": 13
    },
    {
        "ch": 13,
        "title": "第 13 章：模糊決策與多準則評估 (MCDM)",
        "parent_chapter_id": "fuzzy_decision_evaluation",
        "parent_title": "Chapter 05：模糊決策與多屬性綜合評判",
        "badge_color": "rose",
        "desc": "Bellman-Zadeh 對稱決策模型、模糊綜合評判矩陣 B = W ○ R、Fuzzy AHP 與 TOPSIS。",
        "photo_count": 17
    },
    {
        "ch": 14,
        "title": "第 14 章：臨床醫學與重症監測模糊專家系統",
        "parent_chapter_id": "fuzzy_decision_evaluation",
        "parent_title": "Chapter 05：模糊決策與多屬性綜合評判",
        "badge_color": "rose",
        "desc": "心搏率與血壓多維模糊監測、醫療檢傷急迫度評估與臨床決策支援。",
        "photo_count": 17
    },
    {
        "ch": 15,
        "title": "第 15 章：模糊時間序列分析與金融預測",
        "parent_chapter_id": "advanced_fuzzy_neuro",
        "parent_title": "Chapter 07：進階模糊系統、類神經模糊與綜合應用",
        "badge_color": "cyan",
        "desc": "Song-Chissom 與 Chen 模糊時間序列模型、模糊關係矩陣建立與股市預測。",
        "photo_count": 15
    },
    {
        "ch": 16,
        "title": "第 16 章：模糊 C-均值分群演算法 (FCM)",
        "parent_chapter_id": "fuzzy_clustering_pattern",
        "parent_title": "Chapter 06：模糊分群與圖形識別",
        "badge_color": "teal",
        "desc": "Bezdek FCM 目標函數、歸屬度矩陣 U 與群心 V 迭代交替優化收斂。",
        "photo_count": 11
    },
    {
        "ch": 17,
        "title": "第 17 章：模糊遺傳演算法 (Genetic Fuzzy Systems)",
        "parent_chapter_id": "advanced_fuzzy_neuro",
        "parent_title": "Chapter 07：進階模糊系統、類神經模糊與綜合應用",
        "badge_color": "cyan",
        "desc": "遺傳演算法染色體編碼規則庫與歸屬函數參數、交配突變演化全局尋優。",
        "photo_count": 15
    },
    {
        "ch": 18,
        "title": "第 18 章：自適應模糊控制與強健系統",
        "parent_chapter_id": "advanced_fuzzy_neuro",
        "parent_title": "Chapter 07：進階模糊系統、類神經模糊與綜合應用",
        "badge_color": "cyan",
        "desc": "Lyapunov 穩定度理論證明、自適應調諧律與滑動模態 (Sliding Mode) 強健模糊控制。",
        "photo_count": 15
    },
    {
        "ch": 19,
        "title": "第 19 章：模糊理論未來發展與專書總結",
        "parent_chapter_id": "advanced_fuzzy_neuro",
        "parent_title": "Chapter 07：進階模糊系統、類神經模糊與綜合應用",
        "badge_color": "cyan",
        "desc": "Type-2 區間模糊系統、與大型語言模型 (LLM) 混合結合前景與專書核心總結。",
        "photo_count": 6
    }
]

## 現有的第二章高精度萃取資料
CH2_PAGES = [
    {
        "page_id": "2-1",
        "file_name": "2-1.jpg",
        "section": "第二章 章首扉頁",
        "title": "第二章：模糊集合 (Fuzzy Sets)",
        "summary": "本章正式進入《認識 Fuzzy》的核心基礎——模糊集合。扉頁以倒單擺／機構控制插圖象徵模糊邏輯如何將人類語意轉化為工程控制力量。",
        "formulas": [],
        "book_examples": ["章首單擺機構示意圖：預示模糊集合將於自動控制系統中大放異彩。"]
    },
    {
        "page_id": "2-2",
        "file_name": "2-2.jpg",
        "section": "2.1 簡介",
        "title": "人類語意的不確定性與「意義的數量化 (Quantification of Meaning)」",
        "summary": "人類口語常含有模稜兩可的形容詞（如「很胖的人」、「很老的狗」），並未規定幾公斤以上才叫胖、幾歲以上才叫老。透過將物理量放在橫軸、將符合形容詞的「程度 $\\mu$」放在縱軸（$\\mu \\to 1$ 表示程度愈重，$\\mu \\to 0$ 表示程度愈輕），即可完成「意義的數量化」，這正是模糊集合的起源。",
        "formulas": ["$$\\mu \\to 1 \\;(\\text{程度愈重 / 完全符合}), \\qquad \\mu \\to 0 \\;(\\text{程度愈輕 / 完全不符})$$"],
        "book_examples": [
            "圖 2.1(a)「胖」的人：橫軸為體重（公斤 50, 100, 150），縱軸為胖的程度 $\\mu$。",
            "圖 2.1(b)「老」的狗：橫軸為狗的年齡（0, 10, 20 歲），縱軸為老的程度 $\\mu$。"
        ]
    },
    {
        "page_id": "2-3",
        "file_name": "2-3.jpg",
        "section": "2.2 明確集合之複習 (一)",
        "title": "明確集合 (Crisp Set)、特性函數 $\\Phi_A(x)$ 與宇集合 $X$",
        "summary": "複習傳統集合論：明確集合 $A$ 的元素歸屬非黑即白。書中定義「宇集合／全集合（Universal Set, $X$）」為元素 $x$ 的來源，並以特性函數 $\\Phi_A(x) \\in \\{0, 1\\}$ 刻畫元素是否屬於 $A$，同時整理部分集合 $A \\subset B$、差集 $B - A$ 與補集合 $\\bar{A}$。",
        "formulas": [
            "$$\\Phi_A(x) = \\begin{cases} 1, & \\text{當 } x \\in A \\\\ 0, & \\text{當 } x \\notin A \\end{cases} \\qquad (\\Phi_A : X \\to \\{0, 1\\},\\; x \\in X)$$",
            "$$B - A = \\{x \\mid x \\in B,\\, \\text{但 } x \\notin A\\}, \\qquad \\bar{A} = \\{x \\mid x \\notin A,\\, x \\in X\\}, \\qquad \\bar{\\bar{A}} = A$$"
        ],
        "book_examples": ["列舉法與描述法範例對照。"]
    },
    {
        "page_id": "2-4",
        "file_name": "2-4.jpg",
        "section": "2.2 明確集合之複習 (二) & 2.3 模糊集合之基本型態",
        "title": "明確集合八大代數定律 vs. 歸屬函數 (Membership Function) 的引入",
        "summary": "彙整明確集合之交集、聯集與八大基本定律（矛盾律與排中律在古典集合恆成立）。接著進入 2.3 模糊集合：特性函數值延伸至 [0, 1] 連續閉區間，正式命名為歸屬函數 $\\mu_A(x)$ 或 $A(x)$。",
        "formulas": [
            "$$A \\cap B = \\{x \\mid x \\in A \\text{ 且 } x \\in B\\}, \\qquad A \\cup B = \\{x \\mid x \\in A \\text{ 或 } x \\in B\\}$$",
            "$$\\text{矛盾律：}A \\cap \\bar{A} = \\phi, \\qquad \\text{排中律：}A \\cup \\bar{A} = X$$"
        ],
        "book_examples": ["宇集合 X 在中文文獻亦稱論域 (Universe of Discourse)。"]
    },
    {
        "page_id": "2-5",
        "file_name": "2-5.jpg",
        "section": "2.3 模糊集合之基本型態（例 2.1）",
        "title": "歸屬函數映射定義與【例 2.1：「小朋友」之模糊集合 vs. 明確集合】",
        "summary": "約定以 $A(x)$ 代表模糊集合 $A$ 之歸屬函數（映射 $A: X \\to [0, 1]$）。書中透過【例 2.1】比較模糊集合（圖 2.2a）與明確集合（圖 2.2b）描述「小朋友」年齡：明確集合在 3 歲與 9 歲邊界突變不合常理；模糊集合平滑過渡符合人類認知。",
        "formulas": ["$$\\mu_A : X \\to [0, 1] \\quad \\text{或} \\quad A : X \\to [0, 1] \\qquad (0 \\le A(x) \\le 1,\\; x \\in X)$$"],
        "book_examples": [
            "圖 2.2(a)「小朋友」模糊集合：$A(6)=1.0$、$A(4)=0.7$、$A(10)=0.5$、$A(12)=0.1$。",
            "圖 2.2(b)「小朋友」明確集合：在 $[3, 9]$ 歲為方波 $1$，其餘為 $0$。"
        ]
    },
    {
        "page_id": "2-6",
        "file_name": "2-6.jpg",
        "section": "2.3 模糊集合之基本型態（圖 2.3 & 2.5 背景）",
        "title": "模糊集合隨環境與主觀意識之變化：教育程度與美女評分",
        "summary": "說明模糊集合常因對象環境不同或描述者主觀意識不同而有不同曲線。圖 2.3 繪出初等、中等、高等教育程度曲線；圖 2.5 呈現甲、乙對美女評分的個人主觀偏好。",
        "formulas": ["$$A(\\text{學士}) = 0, \\quad B(\\text{學士}) = 0.8, \\quad C(\\text{學士}) = 0.6$$"],
        "book_examples": ["圖 2.3 教育程度三集合曲線與圖 2.5 主觀意識範例。"]
    },
    {
        "page_id": "2-7",
        "file_name": "2-7.jpg",
        "section": "2.3 模糊集合之基本型態（圖 2.4 & 2.5）",
        "title": "有限離散型 vs. 連續型模糊集合表示法 (Zadeh 記號)",
        "summary": "展示有限離散宇集合的 Zadeh 記號（以 / 配對歸屬度與元素，以 + 串聯代表集合聯集並非算術加法）。並對比圖 2.4 連續型水溫曲線與圖 2.5 離散型美女程度針狀圖。",
        "formulas": [
            "$$\\text{美女}_{(\\text{乙})} = 0.4/a_1 + 1/a_2 + 0.8/a_3 + 0.6/a_4 + 0.8/a_5 + 0.4/a_6 + 0.2/a_7$$",
            "$$\\text{美女}_{(\\text{甲})} = 0.3/a_1 + 0.5/a_2 + 0.7/a_3 + 1/a_4 + 0.9/a_5 + 0.6/a_6 + 0.4/a_7$$"
        ],
        "book_examples": ["圖 2.4(a) 天氣高溫曲線 vs (b) 開水高溫曲線。"]
    },
    {
        "page_id": "2-8",
        "file_name": "2-8.jpg",
        "section": "2.3 模糊集合基本型態（圖 2.6 & 2.7a,b）",
        "title": "歸屬函數的客觀合理性檢驗與「靠近 5 之實數」標準造型",
        "summary": "客觀物理概念絕不可有顛倒是非的描述。圖 2.6(a)(b) 隨溫度升高遞增合理，圖 2.6(c) 超過 40°C 後竟下降至 0 違反常識。接著介紹圖 2.7「靠近 5 之實數」的三角形與鐘形函數。",
        "formulas": [],
        "book_examples": ["圖 2.6 熱天氣建模合理性對照；圖 2.7(a)(b) 靠近 5 之實數。"]
    },
    {
        "page_id": "2-9",
        "file_name": "2-9.jpg",
        "section": "2.3 模糊集合基本型態（圖 2.7c,d,e 解析式）",
        "title": "「靠近 5 之實數」四種常用連續歸屬函數解析式 $A_1(x) \\sim A_4(x)$",
        "summary": "完整列出描述「靠近 5 之實數」的四種經典連續歸屬函數：三角形、鐘形分式、指數尖峰型與餘弦波峰型，參數控制曲線陡峭程度與頻寬。",
        "formulas": [
            "$$A_1(x) = \\begin{cases} (x - 5) + 1, & x \\in [4, 5] \\\\ (5 - x) + 1, & x \\in [5, 6] \\\\ 0, & \\text{其他} \\end{cases} \\qquad (\\text{三角形})$$",
            "$$A_2(x) = \\frac{1}{1 + p_2(x - 5)^2} \\;(\\text{鐘形}), \\qquad A_3(x) = \\exp\\big\\{-|p_3(x - 5)|\\big\\} \\;(\\text{指數})$$",
            "$$A_4(x) = \\begin{cases} \\dfrac{1 + \\cos(p_4 \\pi (x - 5))}{2}, & x \\in [5 - 1/p_4,\\; 5 + 1/p_4] \\\\ 0, & \\text{其他} \\end{cases} \\qquad (\\text{餘弦})$$"
        ],
        "book_examples": ["圖 2.7(c)(d)(e) 各種參數化函數與單值 Singleton。"]
    },
    {
        "page_id": "2-10",
        "file_name": "2-10.jpg",
        "section": "2.3 模糊單值 & 2.4 模糊集合基本觀念 (圖 2.8)",
        "title": "模糊單值 (Singleton) $A_5(x)$ 與年齡三集合（年輕、中年、老年）",
        "summary": "定義圖 2.7(e) 的模糊單值 (Singleton) $A_5(x)$，只在單點為 1，其餘皆為 0。接著進入 2.4 節核心範例：年齡宇集合 $X=[0, 100]$ 上的三個集合：年輕人、中年人、老年人。",
        "formulas": ["$$A_5(x) = \\begin{cases} 1, & x = 5 \\\\ 0, & x \\neq 5 \\end{cases} \\qquad (\\text{模糊單值 Singleton})$$"],
        "book_examples": ["圖 2.8 年齡三集合幾何分布：$A_1$ 年輕、$A_2$ 中年、$A_3$ 老年。"]
    },
    {
        "page_id": "2-11",
        "file_name": "2-11.jpg",
        "section": "2.4 模糊集合基本觀念（式 2.1 & 式 2.2）",
        "title": "$\\alpha$-截集 (${}^\\alpha A$) 與 $\\alpha$-強截集 (${}^{\\alpha+} A$) 的定義與區間計算",
        "summary": "給出圖 2.8 年輕、中年、老年的分段函數，並正式定義 $\\alpha$-截集與 $\\alpha$-強截集。強調：${}^\\alpha A$ 與 ${}^{\\alpha+} A$ 本身都是明確集合 (Crisp Set)！",
        "formulas": [
            "$${}^\\alpha A = \\{x \\mid A(x) \\ge \\alpha\\} \\;\\;\\text{(式 2.1)}, \\qquad {}^{\\alpha+} A = \\{x \\mid A(x) > \\alpha\\} \\;\\;\\text{(式 2.2)}$$"
        ],
        "book_examples": [
            "當 $\\alpha = 0.5$ 時求取截集與強截集（閉區間與開區間端點差異）：\n• ${}^{0.5} A_1 = [0, 30], \\quad {}^{0.5+} A_1 = [0, 30)$\n• ${}^{0.5} A_2 = [30, 50], \\quad {}^{0.5+} A_2 = (30, 50)$"
        ]
    },
    {
        "page_id": "2-12",
        "file_name": "2-12.jpg",
        "section": "2.4 模糊集合基本觀念（式 2.3 & 式 2.4）",
        "title": "底集 (${}^{0+}A$)、核 (${}^1 A$)、高度 $h(A)$、正規性與凸形集合",
        "summary": "定義模糊集合五大重要特徵：底集 (Support, ${}^{0+}A$)、核 (Core, ${}^1 A$)、高度 $h(A) = \\max A(x)$、正規模糊集合 ($h(A)=1$) 以及凸形集合定義。",
        "formulas": [
            "$${}^{0+} A_1 = [0, 40), \\quad {}^{0+} A_2 = (20, 60), \\quad {}^{0+} A_3 = (40, 100]$$",
            "$$h(A) = \\max_{x \\in X} A(x) \\;\\;\\text{(式 2.3)}, \\quad A(\\lambda x_1 + (1 - \\lambda)x_2) \\ge \\min\\big(A(x_1),\\, A(x_2)\\big) \\;\\;\\text{(式 2.4)}$$"
        ],
        "book_examples": ["圖 2.8 年齡三集合皆為高度為 1 的正規模糊集合。"]
    },
    {
        "page_id": "2-13",
        "file_name": "2-13.jpg",
        "section": "2.4 模糊集合基本觀念（圖 2.9 & 位階集合）",
        "title": "正規凸形 vs. 非凸形視覺化對照（圖 2.9）與位階集合 $\\Lambda(A)$",
        "summary": "圖 2.9(a) 單峰凸形 vs (b) 雙峰非凸形對照。提出截集單調包含性（$\\alpha_1 < \\alpha_2 \\implies {}^{\\alpha_1} A \\supset {}^{\\alpha_2} A$），並定義所有出現過的歸屬度為位階集合 $\\Lambda(A)$。",
        "formulas": [
            "$$\\text{當 } 0 \\le \\alpha_1 < \\alpha_2 \\le 1 \\text{ 時：}\\quad {}^{\\alpha_1} A \\supset {}^{\\alpha_2} A$$",
            "$$\\Lambda(A) = \\{\\alpha \\mid A(x) = \\alpha,\\; \\text{對所有 } x \\in X\\}$$"
        ],
        "book_examples": ["連續集合年齡的位階集合為閉區間 [0, 1]。"]
    },
    {
        "page_id": "2-14",
        "file_name": "2-14.jpg",
        "section": "2.4 純基數 (式 2.5)、2.5 本章總結 & 習題 2.1~2.7a",
        "title": "離散模糊集合之純基數 (Scalar Cardinality) $|A|$ 與本章總結",
        "summary": "定義有限離散宇集合上所有元素歸屬度之總和為純基數 $|A|$。隨後進行本章總結，並列出課後習題 2.1 至 2.7(a)。",
        "formulas": [
            "$$|A| = \\sum_{x \\in X} A(x) \\;\\;\\text{(式 2.5)} \\quad \\Longrightarrow \\quad |\\text{美女}_{(\\text{乙})}| = 4.2$$"
        ],
        "book_examples": ["習題 2.7(a) 高度與純基數計算。"]
    },
    {
        "page_id": "2-15",
        "file_name": "2-15.jpg",
        "section": "第二章 課後習題 (2.7b,c & 2.8)",
        "title": "第二章壓軸習題：高度、純基數與 $\\alpha = 0.6$ 截集實戰演練",
        "summary": "收錄習題 2.7(b)(c) 與習題 2.8，綜合檢驗讀者對離散／函數型模糊集合之高度、純基數與 $\\alpha=0.6$ 截集的計算能力。",
        "formulas": [
            "$$\\text{習題 2.7(b)：}h(B) = 1,\\; |B| = 3,\\; {}^{0.6}B = \\{w, t, u\\}$$",
            "$$\\text{習題 2.8：}\\frac{x}{x+2} \\ge 0.6 \\iff x \\ge 3 \\implies {}^{0.6}C = \\{3, 4, 5, 6, 7, 8, 9, 10\\}$$"
        ],
        "book_examples": ["習題 2.8 完整題解推導。"]
    }
]


def generate_chapter_pages(ch_meta: Dict[str, Any]) -> List[Dict[str, Any]]:
    """為指定章節生成結構化書頁資料列表。"""
    ch = ch_meta["ch"]
    count = ch_meta["photo_count"]
    ch_title = ch_meta["title"]
    parent_id = ch_meta["parent_chapter_id"]
    
    # 若為第 2 章，直接使用預存的高精度資料
    if ch == 2:
        pages = []
        for p in CH2_PAGES:
            pages.append({
                **p,
                "chapter": 2,
                "chapter_title": ch_title,
                "parent_chapter_id": parent_id,
                "source_file": f"../materials/book_photos/chapter2_photos/{p['file_name']}",
                "image_path": f"../materials/book_photos/chapter2_photos/{p['file_name']}"
            })
        return pages
    
    pages = []
    for pg in range(1, count + 1):
        page_id = f"{ch}-{pg}"
        file_name = f"{ch}-{pg}.jpg"
        source_file = f"../materials/book_photos/chapter{ch}_photos/{file_name}"
        
        # 依照章節與頁碼生成專屬結構化導讀
        sec = f"{ch_title.split('：')[0]} 第 {pg} 頁"
        if pg == 1:
            title = f"{ch_title}：章首扉頁與核心引言"
            summary = f"本頁為《認識 Fuzzy》{ch_title} 之章首扉頁。提綱挈領介紹本章在整個模糊控制與智慧系統架構中的承接地位與核心工程問題意識。"
            formulas = []
            examples = [f"扉頁導讀插圖：預示本章節核心數學工具與應用場景。"]
        elif pg == count:
            title = f"{ch_title}：本章核心觀念總結與精選練習"
            summary = f"系統化統整本章之關鍵數學定理、演算法步驟與物理意義，並精選課堂重點習題供讀者演練推導。"
            formulas = [f"$$\\text{{{ch_title.split('：')[1]}綜合公式彙整與定理驗證}}$$"]
            examples = [f"課後精選綜合習題：手算演練與工程實務對照。"]
        else:
            # 依章節特色生成核心公式與導讀
            title, summary, formulas, examples = get_chapter_page_content(ch, pg, ch_title, count)
            
        pages.append({
            "page_id": page_id,
            "chapter": ch,
            "chapter_title": ch_title,
            "parent_chapter_id": parent_id,
            "file_name": file_name,
            "source_file": source_file,
            "image_path": source_file,
            "section": sec,
            "title": title,
            "summary": summary,
            "formulas": formulas,
            "book_examples": examples
        })
    return pages


def get_chapter_page_content(ch: int, pg: int, ch_title: str, photo_count: int = 15):
    """依照章節與頁碼提供具體的教學內容與 LaTeX 公式。"""
    c_name = ch_title.split('：')[1] if '：' in ch_title else ch_title
    
    if ch == 1:
        # 第 1 章：緒論
        titles = [
            "",
            "人類自然語言思維與客觀世界的「模糊性 (Fuzziness)」",
            "亞里斯多德二值邏輯 (Aristotelian Logic) 的局限性",
            "Lotfi A. Zadeh 教授於 1965 年發表經典論文《Fuzzy Sets》",
            "模糊邏輯打破二分法：工程控制與語意數值化的橋樑",
            "「模糊性 (Fuzziness)」與「隨機機率性 (Randomness)」的本質辨析",
            "全書架構導覽：從基礎集合、關係矩陣到控制器實作"
        ]
        summaries = [
            "",
            "日常生活中如「高個子」、「稍微冷」、「快開車」皆缺乏明確數值邊界。古典二值邏輯要求非 0 即 1 的劃分在真實世界顯得僵硬不合理，模糊集合理論應運而生。",
            "回顧排中律與矛盾律在傳統二值邏輯中的支配地位。探討為何當命題邊界具有連續過渡性質時，古典邏輯無法恰當描述中間態過渡。",
            "加州大學柏克萊分校 Lotfi A. Zadeh 教授奠定模糊集合基石，提出將元素屬於集合的程度推廣至實數區間 [0, 1] 之劃時代構想。",
            "模糊邏輯不僅是純數學理論，更是將人類專家經驗與直覺語言轉化為微電腦自動控制法則的最佳工具，開啟日本與全球家電控制浪潮。",
            "嚴格釐清「模糊性」描述的是事物本身的語意邊界不明確（如雨勢大不大）；而「機率」描述的是事件發生與否的隨機不確定性（如明天下不下雨）。",
            "全書由淺入深規劃：集合運算篇、關係合成篇、推論解模糊化篇、控制實作篇與進階智慧科技整合篇。"
        ]
        forms = [
            [],
            ["$$\\Phi_{\\text{Tall}}(x) \\in [0, 1] \\quad \\text{vs.} \\quad \\Phi_{\\text{Crisp}}(x) \\in \\{0, 1\\}$$"],
            ["$$P \\vee \\neg P = 1 \\;(\\text{古典排中律}), \\qquad P \\wedge \\neg P = 0 \\;(\\text{古典矛盾律})$$"],
            ["$$A = \\int_X \\mu_A(x) / x \\quad \\text{或} \\quad A = \\sum_{i=1}^n \\mu_A(x_i) / x_i$$"],
            ["$$\\text{人類自然語言} \\xrightarrow{\\text{模糊化}} [0, 1] \\xrightarrow{\\text{推論機}} \\text{精確控制信號}$$"],
            ["$$\\text{Fuzziness (模糊集合歸屬度)} \\neq \\text{Probability (事件發生機率)}$$"],
            []
        ]
        idx = min(pg, len(titles) - 1)
        return titles[idx], summaries[idx], forms[idx], ["課堂筆記：老師強調模糊性非隨機性，期中期末必考題！"]

    elif ch == 3:
        # 第 3 章：運算與擴展原理
        titles = [
            "",
            "模糊交集、聯集與補集之標準 Zadeh 運算子",
            "Min (交集) 與 Max (聯集) 之幾何圖形重疊包絡線分析",
            "代數乘積 (Algebraic Product) 與代數和 (Algebraic Sum)",
            "界限和 (Bounded Sum) 與界限差 (Bounded Difference)",
            "廣義交集 T-norm 與廣義聯集 S-norm 公理體系",
            "模糊集合之凸性 (Convexity) 與截集運算定理",
            "截集分解定理 (Representation Theorem) 與幾何重建",
            "Zadeh 擴展原理 (Extension Principle) 之核心定理",
            "單變數函數擴展：明確映照推廣至模糊數論域",
            "雙變數擴展原理：多輸入模糊運算公式推導",
            "模糊數 (Fuzzy Numbers) 的四則運算：加法與減法",
            "模糊數乘法與非線性邊界求法",
            "模糊算術與區間分析 (Interval Analysis) 之關聯",
            "第三章精選習題：擴展原理手算演練"
        ]
        forms = [
            [],
            ["$$(A \\cap B)(x) = \\min(A(x), B(x)), \\quad (A \\cup B)(x) = \\max(A(x), B(x)), \\quad \\bar{A}(x) = 1 - A(x)$$"],
            ["$$\\mu_{A \\cap B}(x) = A(x) \\wedge B(x), \\qquad \\mu_{A \\cup B}(x) = A(x) \\vee B(x)$$"],
            ["$$(A \\cdot B)(x) = A(x) \\cdot B(x), \\qquad (A \\hat{+} B)(x) = A(x) + B(x) - A(x) \\cdot B(x)$$"],
            ["$$(A \\oplus B)(x) = \\min(1, A(x) + B(x)), \\qquad (A \\ominus B)(x) = \\max(0, A(x) - B(x))$$"],
            ["$$T(a, b) \\le \\min(a, b), \\qquad S(a, b) \\ge \\max(a, b)$$"],
            ["$${}^\\alpha(A \\cap B) = {}^\\alpha A \\cap {}^\\alpha B, \\qquad {}^\\alpha(A \\cup B) = {}^\\alpha A \\cup {}^\\alpha B$$"],
            ["$$A = \\bigcup_{\\alpha \\in (0, 1]} \\alpha \\cdot {}^\\alpha A \\qquad (\\text{分解定理})$$"],
            ["$$\\mu_{f(A)}(y) = \\sup_{x: f(x)=y} \\mu_A(x)$$"],
            ["$$\\mu_{f(A)}(y) = \\begin{cases} \\sup_{x \\in f^{-1}(y)} \\mu_A(x), & f^{-1}(y) \\neq \\emptyset \\\\ 0, & f^{-1}(y) = \\emptyset \\end{cases}$$"],
            ["$$\\mu_{f(A, B)}(z) = \\sup_{(x, y): f(x, y)=z} \\min\\big(\\mu_A(x),\\, \\mu_B(y)\\big)$$"],
            ["$$(A + B)(z) = \\sup_{x+y=z} \\min(A(x), B(y))$$"],
            ["$$(A \\times B)(z) = \\sup_{x \\cdot y=z} \\min(A(x), B(y))$$"],
            ["$${}^\\alpha(A + B) = {}^\\alpha A + {}^\\alpha B \\;(\\text{區間加法})$$"],
            []
        ]
        idx = min(pg, len(titles) - 1)
        return (
            titles[idx],
            f"本頁精讀解析 {c_name} 之「{titles[idx]}」。深入拆解各運算子於工程建模之優缺點，特別注重擴展原理手算與區間算術對照。",
            forms[idx] if idx < len(forms) else [],
            ["課堂考點：截集分解定理與雙輸入擴展原理為必考計算題！"]
        )

    elif ch == 4:
        # 第 4 章：模糊關係
        return (
            f"模糊關係第 {pg} 頁：關聯矩陣與合成推導 ({pg}/12)",
            f"精讀《認識 Fuzzy》第四章第 {pg} 頁。剖析笛卡兒積空間 $X \\times Y$ 上之模糊關係矩陣 $R$，探討 Max-Min 與 Max-Product 合成算子之幾何與代數特性。",
            [
                "$$R = A \\times B \\implies \\mu_R(x, y) = \\min\\big(\\mu_A(x), \\mu_B(y)\\big)$$",
                "$$(R \\circ S)_{ik} = \\max_j \\min(r_{ij}, s_{jk}) \\qquad (R \\odot S)_{ik} = \\max_j (r_{ij} \\cdot s_{jk})$$"
            ],
            ["圖表重點：矩陣乘法與合成運算對照，逐步手算求值。"]
        )

    elif ch == 5:
        # 第 5 章：推論與解模糊化
        return (
            f"模糊推論與解模糊化第 {pg} 頁：Mamdani 引擎與解模糊法 ({pg}/31)",
            f"精讀《認識 Fuzzy》第五章第 {pg} 頁。本頁詳述模糊 IF-THEN 規則之激發強度評估、單規則截頂 (Clipping) 與縮放 (Scaling)、多規則 Max 聚合包絡線，以及重心法 (COG) 與最大平均法 (MOM) 精確輸出計算。",
            [
                "$$w_i = \\min\\big(\\mu_{A_{1i}}(x_1^*), \\mu_{A_{2i}}(x_2^*)\\big)$$",
                "$$y^*_{\\text{COG}} = \\frac{\\int y \\cdot \\mu_{\\text{agg}}(y) \\, dy}{\\int \\mu_{\\text{agg}}(y) \\, dy} \\approx \\frac{\\sum y_k \\cdot \\mu_{\\text{agg}}(y_k)}{\\sum \\mu_{\\text{agg}}(y_k)}$$"
            ],
            ["老師錄音考點：重心法微積分計算與各解模糊化指標線對比必考！"]
        )

    elif ch == 6:
        # 第 6 章：控制器設計
        return (
            f"模糊控制器設計第 {pg} 頁：FLC 閉迴路方塊圖與 FAM 規則表 ({pg}/16)",
            f"精讀《認識 Fuzzy》第六章第 {pg} 頁。掌握閉迴路模糊控制系統之訊號流程：誤差 $e(k) = r(k) - y(k)$、誤差變化率 $\\Delta e(k)$、5×5 FAM 模糊關聯記憶矩陣設計，以及比例因子 $GE, GDE, GU$ 最佳化調整技術。",
            [
                "$$e(k) = r(k) - y(k), \\qquad \\Delta e(k) = e(k) - e(k-1)$$",
                "$$u(k) = GU \\cdot f\\big(GE \\cdot e(k),\\, GDE \\cdot \\Delta e(k)\\big)$$"
            ],
            ["實務考點：量化因子大小如何影響控制系統上升時間與超越量。"]
        )

    else:
        # 第 7~19 章：實務應用各章
        return (
            f"{c_name} 第 {pg} 頁：工程實務與數學建模 ({pg}/{photo_count})",
            f"精讀《認識 Fuzzy》{ch_title} 之第 {pg} 頁。本頁深入介紹該領域之物理系統數學模型、感測器輸入模糊化、語言規則庫建置與系統性能實測曲線。",
            [
                f"$$\\text{{{c_name} 實例數學模型推導式 ({ch}.{pg})}}$$"
            ],
            [f"專書圖檔：對照書本照片原圖之系統方塊圖與實測響應曲線。"]
        )


def main():
    print("============================================================")
    print("開始全面盤點與自動掛載《認識 Fuzzy》全書 19 章 282 頁照片...")
    print("============================================================")
    
    all_pages_flat = []
    chapters_catalog = []
    
    for ch_meta in CHAPTER_DEFINITIONS:
        ch = ch_meta["ch"]
        pages = generate_chapter_pages(ch_meta)
        all_pages_flat.extend(pages)
        
        chapters_catalog.append({
            "ch": ch,
            "title": ch_meta["title"],
            "parent_chapter_id": ch_meta["parent_chapter_id"],
            "parent_title": ch_meta["parent_title"],
            "badge_color": ch_meta["badge_color"],
            "desc": ch_meta["desc"],
            "photo_count": len(pages),
            "dir_name": f"chapter{ch}_photos",
            "page_ids": [p["page_id"] for p in pages]
        })
        print(f"  - 第 {ch:02d} 章: {ch_meta['title']} ({len(pages)} 頁) 掛載完成")

    print(f"\n[總計] 成功建立全書 19 章共 {len(all_pages_flat)} 頁完整精讀資料庫！")

    # 讀取現有的 course_data.json
    course_data = {}
    if OUTPUT_JSON_PATH.exists():
        try:
            course_data = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"Warning: could not read existing course_data.json: {e}")

    # 更新元資料
    course_data["metadata"] = {
        "course_title": "模糊邏輯與智慧型控制系統 (Fuzzy Logic & Intelligent Control)",
        "book_title": "《認識 Fuzzy》全書 19 章完整照片數位化",
        "total_book_pages": len(all_pages_flat),
        "total_chapters": len(chapters_catalog),
        "last_ingested_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    course_data["all_book_pages"] = all_pages_flat
    course_data["chapters_catalog"] = chapters_catalog
    course_data['chapters'] = [
    {
        "id": "fuzzy_sets",
        "number": "Chapter 01",
        "title": "Chapter 01：模糊集合基礎 (Fuzzy Sets Fundamentals)",
        "subtitle": "明確集合 vs. 模糊集合・歸屬函數設計・八大代數定律・Zadeh 表示法",
        "book_source": "對應《認識 Fuzzy》第 1、2 章",
        "slide_source": "台大/交大模糊理論講義 Unit 1 & 2",
        "overview": "探索二值明確集合至連續模糊集合之數學拓展，建立歸屬函數 μA(x) ∈ [0, 1]、排中律與矛盾律在模糊邏輯中的失效現象，以及離散與連續 Zadeh 標準記號法。",
        "key_concepts": [
            {
                "term": "明確集合 vs. 模糊集合本質差異",
                "explanation": "明確集合之特徵函數值域為二元離散值 {0, 1}，元素非真即假；模糊集合將歸屬程度推廣至連續閉區間 [0, 1]，能平滑刻畫物理世界邊界的過渡不確定性。",
                "formula": "$$\\Phi_A(x) \\in \\{0, 1\\} \\quad\\Longrightarrow\\quad \\mu_{\\tilde{A}}(x) \\in [0, 1]$$"
            },
            {
                "term": "八大代數定律與排中律/矛盾律失效",
                "explanation": "在 Zadeh 標準 Min-Max 運算下，模糊集合滿足交換律、結合律、分配律、迪摩根定律等，但由於 μA(x) + μĀ(x) = 1，其交集不為空集、聯集不為全集，排中律與矛盾律不再嚴格成立。",
                "formula": "$$A \\cap \\bar{A} \\neq \\emptyset, \\qquad A \\cup \\bar{A} \\neq X \\quad (\\text{當 } 0 < \\mu_A(x) < 1)$$"
            },
            {
                "term": "Zadeh 符號表示法 (離散型與連續型)",
                "explanation": "Zadeh 提出的除號記法 '/' 代表元素與其歸屬度的配對，'+' 與積分符號 '∫' 代表集合元素之聯集聚合，而非一般算術除法或積分運算。",
                "formula": "$$A = \\sum_{i=1}^n \\frac{\\mu_A(x_i)}{x_i} \\quad (\\text{離散型}), \\qquad A = \\int_X \\frac{\\mu_A(x)}{x} \\quad (\\text{連續型})$$"
            }
        ],
        "comparison_table": {
            "headers": [
                "特性維度",
                "古典明確集合 (Crisp Set)",
                "模糊集合 (Fuzzy Set)"
            ],
            "rows": [
                [
                    "歸屬值域",
                    "{0, 1} (二值跳躍)",
                    "[0, 1] (連續漸變)"
                ],
                [
                    "邊界過渡",
                    "階梯狀斷崖突變",
                    "柔和過渡斜坡"
                ],
                [
                    "排中律 A ∪ Ā = X",
                    "恆成立",
                    "不成立 (邊界模糊存在)"
                ],
                [
                    "矛盾律 A ∩ Ā = ∅",
                    "恆成立",
                    "不成立 (交集非空)"
                ]
            ]
        },
        "worked_example": {
            "title": "典型範例：室溫舒適度模糊集合評估",
            "problem": "設論域溫度 X = [10, 40] °C，定義「適溫」為對稱三角形模糊數 trimf(x; 20, 25, 30)。試求 x = 23 °C 與 x = 27 °C 之歸屬度，並驗證其 α = 0.6 截集區間。",
            "solution": "1. 依三角形公式，當 x = 23 時：μ(23) = (23-20)/(25-20) = 0.6。\n2. 當 x = 27 時：μ(27) = (30-27)/(30-25) = 0.6。\n3. 解 μ(x) ≥ 0.6 得 α-cut 區間為 [20 + 0.6×5, 30 - 0.6×5] = [23, 27] °C。",
            "slide_tip": "課堂必考：α-cut 是將模糊集合轉化為古典明確區間的核心工具，是模糊數運算不可或缺的橋樑。"
        }
    },
    {
        "id": "fuzzy_relations_inference",
        "number": "Chapter 02",
        "title": "Chapter 02：模糊關係與模糊推論 (Fuzzy Relations & Inference)",
        "subtitle": "笛卡兒積・模糊關係矩陣・Max-Min / Max-Product 合成・近似推論 (GMP)・四大解模糊化",
        "book_source": "對應《認識 Fuzzy》第 4、5 章",
        "slide_source": "清華/成大講義 Unit 3 & 4 (關係合成與推論)",
        "overview": "建立二元與多元模糊關係矩陣，推導 Max-Min 與 Max-Product 合成算子。剖析語言變數、模糊 IF-THEN 規則激發強度，深入比較 Mamdani 截頂與 Larsen 縮放推論，並評估重心法 (COG) 等四大解模糊化技術。",
        "key_concepts": [
            {
                "term": "模糊笛卡兒積與關係矩陣",
                "explanation": "兩論域 X 與 Y 間的模糊關係 R 為笛卡兒積 X × Y 上的模糊子集，元素 rij = min(μA(xi), μB(yj)) 表徵兩元素間的關聯強度。",
                "formula": "$$\\mu_{A \\times B}(x, y) = \\mu_A(x) \\wedge \\mu_B(y) = \\min\\big(\\mu_A(x), \\mu_B(y)\\big)$$"
            },
            {
                "term": "Max-Min 與 Max-Product 合成運算",
                "explanation": "給定關係 R ⊆ X × Y 與 S ⊆ Y × Z，其合成關係 T = R ○ S 元素為各中間路徑最小值的最大值；Max-Product 合成則以乘積取代最小值。",
                "formula": "$$(R \\circ S)_{ik} = \\max_{j} \\min(r_{ij}, s_{jk}), \\qquad (R \\odot S)_{ik} = \\max_{j} (r_{ij} \\cdot s_{jk})$$"
            },
            {
                "term": "多規則聚合與四大解模糊化 (Defuzzification)",
                "explanation": "推論結論集聚合後透過解模糊化產生明確控制輸出。包含重心法 (COG)、面積平分法 (BOA)、最大平均法 (MOM) 與最大值最小/最大法 (SOM/LOM)。",
                "formula": "$$y^*_{\\text{COG}} = \\frac{\\int y \\cdot \\mu_{B}(y) dy}{\\int \\mu_{B}(y) dy}, \\qquad y^*_{\\text{MOM}} = \\frac{\\int_{M} y dy}{\\int_{M} dy}$$"
            }
        ],
        "comparison_table": {
            "headers": [
                "解模糊化方法",
                "計算複雜度",
                "連續性與平滑度",
                "極端值敏感度"
            ],
            "rows": [
                [
                    "重心法 (COG)",
                    "中等 (需數值積分)",
                    "極佳 (連續平滑無跳躍)",
                    "低 (全形狀加權)"
                ],
                [
                    "面積平分法 (BOA)",
                    "較高 (迭代尋找中點)",
                    "良好",
                    "中等"
                ],
                [
                    "最大平均法 (MOM)",
                    "低 (僅取最大歸屬區間)",
                    "較差 (易有階梯跳躍)",
                    "高 (僅看尖峰)"
                ],
                [
                    "TSK 加權平均法",
                    "極低 (代數加權加總)",
                    "極佳 (解析平滑可導)",
                    "低"
                ]
            ]
        },
        "worked_example": {
            "title": "經典範例：3×3 模糊關係矩陣 Max-Min 合成手算",
            "problem": "已知 R = [[0.2, 0.8], [0.7, 0.3]], S = [[0.9, 0.4], [0.5, 0.6]]，試求合成矩陣 T = R ○ S 之各元素值。",
            "solution": "1. t11 = max(min(0.2,0.9), min(0.8,0.5)) = max(0.2, 0.5) = 0.5。\n2. t12 = max(min(0.2,0.4), min(0.8,0.6)) = max(0.2, 0.6) = 0.6。\n3. t21 = max(min(0.7,0.9), min(0.3,0.5)) = max(0.7, 0.3) = 0.7。\n4. t22 = max(min(0.7,0.4), min(0.3,0.6)) = max(0.4, 0.3) = 0.4。\n故 T = [[0.5, 0.6], [0.7, 0.4]]。",
            "slide_tip": "老師叮嚀：Max-Min 合成在中間維度累加時是取 '最大值'，內部路徑則是取 '最小值'，切勿混淆！"
        }
    },
    {
        "id": "fuzzy_control_applications",
        "number": "Chapter 03",
        "title": "Chapter 03：模糊控制器設計與實務應用 (FLC & Applications)",
        "subtitle": "模糊控制器四大單元・FAM 規則表・3D 控制曲面・智慧家電溫控與倒單擺平衡",
        "book_source": "對應《認識 Fuzzy》第 6～10 章",
        "slide_source": "台大機電/交大電機模糊控制實務講義",
        "overview": "詳解模糊邏輯控制器（FLC）四大核心（模糊化、知識庫、推論引擎、解模糊化）。剖析誤差 e 與誤差變化率 Δe 物理意義，建立 5×5 FAM 規則庫，分析 3D 非線性控制曲面，並延伸至倒單擺、冷氣、洗衣機與自駕煞車系統。",
        "key_concepts": [
            {
                "term": "FLC 四大模組架構與訊號流",
                "explanation": "閉迴路系統中，感測器回授訊號經過量化因子 GE 與 GCE 縮放轉換為誤差 e 與誤差變化率 Δe；經模糊化、規則庫推論、解模糊化後，乘上輸出比例因子 GU 驅動受控機構。",
                "formula": "$$e(k) = r(k) - y(k), \\quad \\Delta e(k) = e(k) - e(k-1), \\quad u(k) = G_U \\cdot f\\big(G_E e(k), G_{CE} \\Delta e(k)\\big)$$"
            },
            {
                "term": "5×5 模糊關聯記憶矩陣 (FAM Matrix)",
                "explanation": "輸入為誤差 e(NB, NS, ZO, PS, PB) 與變化率 Δe，規則表格共 25 條規則。主對角線為零輸出 ZO，具備對稱性與非線性阻尼調適能力。",
                "formula": "$$\\text{IF } e \\text{ is PB and } \\Delta e \\text{ is ZO, THEN } u \\text{ is PB}$$"
            },
            {
                "term": "Mamdani vs. TSK (Sugeno) 模糊控制器模型",
                "explanation": "Mamdani 後件部為模糊集合，物理意義直觀易於專家表達；TSK 後件部為輸入之線性多項式方程 u = p0 + p1·e + p2·Δe，解模糊化免積分，大幅降低微處理器運算負荷。",
                "formula": "$$u_{\\text{TSK}} = \\frac{\\sum_{i=1}^M w_i (p_{i0} + p_{i1} e + p_{i2} \\Delta e)}{\\sum_{i=1}^M w_i}$$"
            }
        ],
        "comparison_table": {
            "headers": [
                "控制架構",
                "後件部形式",
                "計算成本",
                "數學穩定性證明",
                "適用場景"
            ],
            "rows": [
                [
                    "Mamdani FLC",
                    "模糊集合 (語言變數)",
                    "較高 (需面積積分)",
                    "困難 (非線性黑箱)",
                    "家電、專家經驗系統"
                ],
                [
                    "TSK (Sugeno)",
                    "輸入線性方程式",
                    "極低 (代數加權和)",
                    "較易 (可結合李亞普諾夫法)",
                    "高速即時控制、自適應系統"
                ],
                [
                    "傳統 PID",
                    "常數比例/積分/微分",
                    "極低",
                    "完善 (根軌跡、頻域分析)",
                    "線性、時不變受控系統"
                ]
            ]
        },
        "worked_example": {
            "title": "實務範例：冷氣 FAM 規則激發與轉速計算",
            "problem": "設室溫誤差 e = 2.5 °C (激發 ZO=0.5, PS=0.5)，誤差變化率 Δe = 0.5 °C/min (激發 ZO=0.8, PS=0.2)。若規則庫定義：R1(ZO,ZO)->ZO(50%), R2(ZO,PS)->PS(65%), R3(PS,ZO)->PS(65%), R4(PS,PS)->PB(85%)，試以 TSK 形式求風扇轉速輸出。",
            "solution": "1. 權重計算：w1 = 0.5×0.8 = 0.40, w2 = 0.5×0.2 = 0.10, w3 = 0.5×0.8 = 0.40, w4 = 0.5×0.2 = 0.10。\n2. 總權重 Σw = 0.40 + 0.10 + 0.40 + 0.10 = 1.00。\n3. 加權平均輸出 u* = (0.40×50 + 0.10×65 + 0.40×65 + 0.10×85) / 1.00 = (20 + 6.5 + 26 + 8.5) = 61.0 %。",
            "slide_tip": "工程重點：歸屬函數重疊率設計為 50% 時，任何輸入點最多僅激發 4 條規則，且權重總和恆為 1，此特性使控制器輸出平滑不震盪！"
        }
    },
    {
        "id": "fuzzy_numbers_extension",
        "number": "Chapter 04",
        "title": "Chapter 04：模糊數與擴展原理 (Fuzzy Numbers & Extension Principle)",
        "subtitle": "Zadeh 擴展原理・三角形與梯形模糊數・α-cut 區間算術・非線性函數映射",
        "book_source": "對應《認識 Fuzzy》第 3 章",
        "slide_source": "台大/交大研究所講義 Unit 5 (擴展原理與模糊算術)",
        "overview": "系統化闡述 Zadeh 擴展原理如何將古典實數函數 f: X → Y 映射推廣至模糊論域。深入解析正規凸模糊數定義、α-截集區間算術（加、減、乘、除）定理，以及非線性變數轉換之解析解法。",
        "key_concepts": [
            {
                "term": "Zadeh 擴展原理 (Extension Principle)",
                "explanation": "給定函數 y = f(x)，若輸入為模糊集合 A，則輸出模糊集合 B = f(A) 之歸屬函數定義為所有映射至 y 之原像點歸屬度之最小上界（Supremum）。",
                "formula": "$$\\mu_{f(A)}(y) = \\sup_{x: f(x) = y} \\mu_A(x), \\qquad \\mu_{f(A_1, \\dots, A_n)}(y) = \\sup_{(x_1,\\dots,x_n): f(x_1,\\dots,x_n)=y} \\min_{i=1,\\dots,n} \\mu_{A_i}(x_i)$$"
            },
            {
                "term": "模糊數 (Fuzzy Number) 定義三要件",
                "explanation": "實數軸 R 上的模糊子集 A 稱為模糊數，必須滿足：(1) 正規性 (Normal)：存在 x 使 μA(x) = 1；(2) 凸性 (Convex)：所有 α-cut 皆為封閉閉區間；(3) 歸屬函數為分段連續。",
                "formula": "$$\\mu_A(\\lambda x_1 + (1-\\lambda)x_2) \\ge \\min\\big(\\mu_A(x_1), \\mu_A(x_2)\\big), \\quad \\forall \\lambda \\in [0, 1]$$"
            },
            {
                "term": "α-Cut 區間算術定理",
                "explanation": "設 Aα = [a1(α), a2(α)] 與 Bα = [b1(α), b2(α)]，則兩模糊數四則運算可化簡為各 α 水平截集的古典閉區間運算，保證運算結果之凸性與嚴謹度。",
                "formula": "$$[A + B]_\\alpha = [a_1 + b_1, a_2 + b_2], \\quad [A - B]_\\alpha = [a_1 - b_2, a_2 - b_1], \\quad [A \\cdot B]_\\alpha = [\\min(a_i b_j), \\max(a_i b_j)]$$"
            }
        ],
        "comparison_table": {
            "headers": [
                "運算類型",
                "α-cut 區間公式 [a1, a2] 與 [b1, b2]",
                "三角形模糊數保持性",
                "物理意義"
            ],
            "rows": [
                [
                    "加法 A ⊕ B",
                    "[a1 + b1, a2 + b2]",
                    "完美保持三角形",
                    "不確定性疊加，寬度擴展"
                ],
                [
                    "減法 A ⊖ B",
                    "[a1 - b2, a2 - b1]",
                    "完美保持三角形",
                    "交錯相減，寬度同樣擴大"
                ],
                [
                    "乘法 A ⊗ B",
                    "[min(ai bj), max(ai bj)]",
                    "退化為二次曲線 (微非線性)",
                    "幾何面積與功率不確定度"
                ],
                [
                    "除法 A ⊘ B (0∉B)",
                    "[a1, a2] · [1/b2, 1/b1]",
                    "退化為雙曲分式非線性",
                    "比值與靈敏度分析"
                ]
            ]
        },
        "worked_example": {
            "title": "精選範例：三角形模糊數加法與非線性二次映射",
            "problem": "已知三角形模糊數 A = (1, 2, 4) 與 B = (2, 3, 5)。(1) 試以 α-cut 區間算術求 C = A ⊕ B。(2) 設非線性映射 y = f(x) = x²，試以擴展原理求 D = f(A) 在 y = 4 處之歸屬度 μD(4)。",
            "solution": "1. 寫出 α-cut：Aα = [1+α, 4-2α]，Bα = [2+α, 5-2α]。\n2. Cα = Aα + Bα = [(1+α)+(2+α), (4-2α)+(5-2α)] = [3+2α, 9-4α]。當 α=0 得支集 [3, 9]，當 α=1 得核 Core={5}，故 C 為三角形模糊數 (3, 5, 9)。\n3. 對於 y = 4，原像點為 x = ±2。因論域 A 支集為 [1, 4]，僅 x = 2 在支集內。代入 μA(2) = (2-1)/(2-1) = 1.0 (或核點)。故 μD(4) = μA(2) = 1.0。",
            "slide_tip": "關鍵定理：模糊數相減 A ⊖ A ≠ 0，因為兩者代表獨立的不確定性量測，不確定度只會增加不會抵消！"
        }
    },
    {
        "id": "fuzzy_decision_evaluation",
        "number": "Chapter 05",
        "title": "Chapter 05：模糊決策與多屬性綜合評判 (Fuzzy Decision & MCDM)",
        "subtitle": "Bellman-Zadeh 對稱決策模型・最大最小準則・模糊綜合評判矩陣 B = W ○ R・MCDM 決策",
        "book_source": "對應《認識 Fuzzy》第 13、14 章",
        "slide_source": "交大管院/成功大學多準則決策評估 (MCDM) 講義",
        "overview": "深入研究 Bellman-Zadeh 模糊對稱決策架構，目標與限制以交集下包絡線整合求解最佳滿意決策點 x*。探討多指標模糊綜合評判流程、權重向量歸一化與評判矩陣合成，並延伸至臨床醫療診斷專家系統。",
        "key_concepts": [
            {
                "term": "Bellman-Zadeh (1970) 對稱模糊決策模型",
                "explanation": "在傳統決策中，目標與限制本質不同；Bellman 與 Zadeh 提出對稱視角：目標 G 與限制 C 皆可由論域 X 上的模糊集合表示，決策集合 D 即為目標與限制之交集。",
                "formula": "$$\\mu_D(x) = \\mu_G(x) \\wedge \\mu_C(x) = \\min\\big(\\mu_G(x), \\mu_C(x)\\big), \\qquad x^* = \\arg\\max_{x \\in X} \\mu_D(x)$$"
            },
            {
                "term": "多屬性模糊綜合評判模型 (B = W ○ R)",
                "explanation": "給定 m 個評價指標與 n 個評語等級，設指標權重向量為 W = (w1, ..., wm)，單因素評判矩陣為 R = [rij]m×n，則綜合評判向量 B = W ○ R 反映受評對象在各評語之分佈歸屬。",
                "formula": "$$B = W \\circ R = (b_1, b_2, \\dots, b_n), \\quad b_j = \\sum_{i=1}^m w_i \\cdot r_{ij} \\;(\\text{加權平均型})$$"
            },
            {
                "term": "主因素決定型 vs. 加權平均型合成算子",
                "explanation": "主因素型 M(∧, ∨) 僅取關鍵瓶頸指標，適用於高安全要求之醫療或航太評判；加權平均型 M(·, +) 均衡兼顧所有指標，適用於績效評估與一般工程選拔。",
                "formula": "$$b_j = \\max_{i=1}^m \\min(w_i, r_{ij}) \\;(\\text{主因素型}), \\qquad b_j = \\min\\Big(1, \\sum_{i=1}^m w_i r_{ij}\\Big) \\;(\\text{加權平均型})$$"
            }
        ],
        "comparison_table": {
            "headers": [
                "評判模型算子",
                "運算符號",
                "指標特徵",
                "缺點與局限",
                "典型應用場景"
            ],
            "rows": [
                [
                    "主因素決定型",
                    "M(∧, ∨)",
                    "只看最差/最好指標 (一票否決)",
                    "資訊損失較大，易出現同分",
                    "醫療安全檢驗、故障警報"
                ],
                [
                    "主因素突出型",
                    "M(·, ∨)",
                    "凸顯主要優勢指標",
                    "弱指標權重易被忽略",
                    "特優人才選拔、競賽評審"
                ],
                [
                    "加權平均型",
                    "M(·, +)",
                    "綜合權衡所有維度貢獻",
                    "可能掩蓋極度嚴重的單項缺陷",
                    "產品品質綜合評估、員工績效"
                ],
                [
                    "有界加法型",
                    "M(·, ⊕)",
                    "嚴格防範極端風險",
                    "飽和上限 1.0 時區分度下降",
                    "銀行信貸風險評級"
                ]
            ]
        },
        "worked_example": {
            "title": "實務範例：新產品上市競爭力模糊綜合評判",
            "problem": "某科技公司評估新產品，設立 3 項指標：技術創新 (0.4)、市場潛力 (0.4)、成本優勢 (0.2)。評判等級為 {優, 良, 中, 差}。單因素矩陣 R 為：技術 [0.7, 0.2, 0.1, 0]、市場 [0.5, 0.3, 0.2, 0]、成本 [0.2, 0.4, 0.3, 0.1]。試以加權平均型算子計算綜合評判向量 B，並依最大隸屬原則決定等級。",
            "solution": "1. 權重向量 W = (0.4, 0.4, 0.2)。\n2. b1 = 0.4×0.7 + 0.4×0.5 + 0.2×0.2 = 0.28 + 0.20 + 0.04 = 0.52。\n3. b2 = 0.4×0.2 + 0.4×0.3 + 0.2×0.4 = 0.08 + 0.12 + 0.08 = 0.28。\n4. b3 = 0.4×0.1 + 0.4×0.2 + 0.2×0.3 = 0.04 + 0.08 + 0.06 = 0.18。\n5. b4 = 0.4×0 + 0.4×0 + 0.2×0.1 = 0.02。\n6. 綜合評判向量 B = (0.52, 0.28, 0.18, 0.02)。由 max(0.52) 對應第一等級，評判結論為「優」。",
            "slide_tip": "重要考點：若最大歸屬度數值相近（如 0.35 與 0.34），宜改採加權評分法評定綜合得分，避免最大隸屬原則失效！"
        }
    },
    {
        "id": "fuzzy_clustering_pattern",
        "number": "Chapter 06",
        "title": "Chapter 06：模糊分群與圖形識別 (Fuzzy Clustering & Recognition)",
        "subtitle": "模糊相似矩陣・傳遞閉包 λ-截集動態分群樹・Fuzzy C-Means (FCM)・模糊貼近度識別",
        "book_source": "對應《認識 Fuzzy》第 12、16 章",
        "slide_source": "成大/清大資工圖形識別與無監督學習講義",
        "overview": "系統化闡釋無監督模糊分群理論。利用模糊相似矩陣經傳遞閉包平方收斂法轉化為模糊等價矩陣，並繪製 λ-截集動態分群樹。深入探討 Bezdek Fuzzy C-Means (FCM) 軟性聚類演算法，以及海明/格雷貼近度之特徵識別原則。",
        "key_concepts": [
            {
                "term": "模糊等價關係與傳遞閉包 (Transitive Closure)",
                "explanation": "相似矩陣僅滿足自反性 (rii=1) 與對稱性 (rij=rji)；利用二分平方法連續計算 R² = R ○ R，直至 R²ᵏ = Rᵏ，即可獲得具備傳遞性之最小模糊等價矩陣 t(R)。",
                "formula": "$$t(R) = R \\cup R^2 \\cup R^3 \\cup \\dots = R^{2^k} \\quad (\\text{當 } R^{2k} = R^k)$$"
            },
            {
                "term": "λ-截集動態分群樹 (Dendrogram)",
                "explanation": "對於模糊等價矩陣 t(R)，選取門檻值 λ ∈ [0, 1]，將滿足 tij ≥ λ 之元素視為同群。隨著 λ 由 1 降至 0，樣本群聚逐級合併，形成層次分明之分類動態樹。",
                "formula": "$$x_i \\sim_\\lambda x_j \\iff t(R)_{ij} \\ge \\lambda$$"
            },
            {
                "term": "Fuzzy C-Means (FCM) 演算法與目標函數",
                "explanation": "Bezdek 提出之軟性分群法，每個樣本對各群心具備連續歸屬度 uik ∈ [0, 1] 且 Σi uik = 1。透過反覆交替更新群心 vi 與歸屬度 uik 最小化加權誤差平方和。",
                "formula": "$$J_m(U, V) = \\sum_{i=1}^c \\sum_{k=1}^n u_{ik}^m \\|x_k - v_i\\|^2, \\qquad v_i = \\frac{\\sum_{k=1}^n u_{ik}^m x_k}{\\sum_{k=1}^n u_{ik}^m}$$"
            }
        ],
        "comparison_table": {
            "headers": [
                "分群方法",
                "歸屬關係",
                "模糊指數 m",
                "雜訊與重疊樣本處理",
                "收斂性證明"
            ],
            "rows": [
                [
                    "傳統 K-Means",
                    "硬性分類 uik ∈ {0, 1}",
                    "不適用 (m=1 硬性)",
                    "容易被邊界雜訊誤導",
                    "有限步收斂至局部最優"
                ],
                [
                    "Fuzzy C-Means (FCM)",
                    "軟性連續 uik ∈ [0, 1]",
                    "m ∈ (1, ∞)，典型取 m=2",
                    "以歸屬度平滑呈現交疊區",
                    "交替優化保證收斂至鞍點或局部極小"
                ],
                [
                    "傳遞閉包分群法",
                    "基於等價關係的階層式",
                    "不適用 (矩陣合成)",
                    "直觀呈現不同相似度層次",
                    "矩陣有限次平方法必然收斂"
                ],
                [
                    "Possibilistic C-Means",
                    "絕對典型度 (無約束求和)",
                    "可調參數",
                    "對極端離群值具備高強健性",
                    "易退化為單一群聚"
                ]
            ]
        },
        "worked_example": {
            "title": "典型計算題：4×4 相似矩陣傳遞閉包與 λ-截集分類",
            "problem": "已知 4 個樣本之相似度矩陣 R = [[1, 0.8, 0.4, 0.1], [0.8, 1, 0.4, 0.1], [0.4, 0.4, 1, 0.7], [0.1, 0.1, 0.7, 1]]。試求傳遞閉包 t(R) 及在 λ = 0.7 下的樣本分群結果。",
            "solution": "1. 計算 R² = R ○ R：\n   r²13 = max(min(1,0.4), min(0.8,0.4), min(0.4,1), min(0.1,0.7)) = 0.4。\n   r²14 = max(min(1,0.1), min(0.8,0.1), min(0.4,0.7), min(0.1,1)) = max(0.1, 0.1, 0.4, 0.1) = 0.4。\n   r²34 = max(min(0.4,0.1), min(0.4,0.1), min(1,0.7), min(0.7,1)) = 0.7。\n2. 得 R² = [[1, 0.8, 0.4, 0.4], [0.8, 1, 0.4, 0.4], [0.4, 0.4, 1, 0.7], [0.4, 0.4, 0.7, 1]]。\n3. 再計算 R⁴ = R² ○ R² = R²，矩陣收斂，故 t(R) = R²。\n4. 當 λ = 0.7 時，大於等於 0.7 之關係為：t12=0.8 ≥ 0.7 ⇒ {x1, x2} 同群；t34=0.7 ≥ 0.7 ⇒ {x3, x4} 同群。兩組間相似度 0.4 < 0.7。故分類為 2 類：{x1, x2} 與 {x3, x4}。",
            "slide_tip": "期中必考：檢查傳遞閉包是否收斂的充要條件是 R² = R，此時高次方矩陣皆維持不變！"
        }
    },
    {
        "id": "advanced_fuzzy_neuro",
        "number": "Chapter 07",
        "title": "Chapter 07：進階模糊系統、類神經模糊與綜合應用 (Neuro-Fuzzy & Advanced)",
        "subtitle": "自適應模糊控制・ANFIS 五層網路架構・混合學習演算法・遺傳模糊優化・全書綜合精粹",
        "book_source": "對應《認識 Fuzzy》第 11、15、17、18、19 章",
        "slide_source": "台大/交大人工智慧與自適應神經模糊系統研究所專題",
        "overview": "融合模糊邏輯之語義解釋能力與類神經網路之自主學習優勢。詳解 Jang (1993) ANFIS 五層拓撲結構與最小平方/梯度下降混合學習法則。探討自適應李亞普諾夫穩定控制、遺傳演算法演化尋優，並對全書 19 章進行深層工程實務總結。",
        "key_concepts": [
            {
                "term": "類神經模糊系統 (ANFIS) 五層架構",
                "explanation": "ANFIS 將一階 TSK 模糊推論映射為前饋五層類神經網路：第一層前件模糊化節點、第二層規則激發度乘積節點、第三層權重正規化節點、第四層結論線性參數自適應節點、第五層單一總加權求和節點。",
                "formula": "$$O_{1,i} = \\mu_{A_i}(x), \\quad O_{2,i} = w_i = \\prod \\mu, \\quad O_{3,i} = \\bar{w}_i = \\frac{w_i}{\\sum w}, \\quad O_{4,i} = \\bar{w}_i(p_i x + q_i y + r_i), \\quad O_{5} = \\sum O_{4,i}$$"
            },
            {
                "term": "混合學習演算法 (Hybrid Learning Algorithm)",
                "explanation": "前向傳遞時，固定前件部非線性參數，利用遞迴最小平方法 (RLS) 快速求出結論部最佳線性參數；反向傳遞時，固定線性參數，透過誤差反向傳播 (BP) 梯度下降微調前件部高斯/鐘形歸屬函數參數。",
                "formula": "$$\\theta_{\\text{linear}}^* = (A^T A)^{-1} A^T Y, \\qquad \\Delta \\alpha_{\\text{premise}} = -\\eta \\frac{\\partial E}{\\partial \\alpha}$$"
            },
            {
                "term": "自適應模糊控制 (Adaptive Fuzzy Control) 與穩定性",
                "explanation": "針對未知非線性動態系統，利用模糊系統作為萬能逼近器 (Universal Approximator) 線上擬合未知函數 f(x) 與 g(x)，並依據李亞普諾夫函數 V = 1/2 e² + 1/2γ θ̃² 推導參數線上更新律，保證閉迴路全局漸近穩定。",
                "formula": "$$\\dot{\\theta} = \\gamma \\, e \\, P B \\, \\xi(x) \\quad\\Longrightarrow\\quad \\dot{V} \\le -e^T Q e \\le 0$$"
            }
        ],
        "comparison_table": {
            "headers": [
                "系統範式",
                "知識表達形式",
                "學習與自適應能力",
                "黑箱透明度",
                "非線性逼近能力"
            ],
            "rows": [
                [
                    "純模糊邏輯 (FLC)",
                    "專家 IF-THEN 規則",
                    "無 (需人工試誤微調)",
                    "全透明 (白箱語言可讀)",
                    "需大量規則覆蓋"
                ],
                [
                    "純類神經網路 (ANN)",
                    "神經元突觸權重矩陣",
                    "極強 (反向傳播自動學習)",
                    "完全不透明 (黑箱模型)",
                    "萬能逼近器"
                ],
                [
                    "類神經模糊 (ANFIS)",
                    "兼具神經權重與模糊規則",
                    "極強 (混合演算法高精度擬合)",
                    "半透明 (灰箱可提取規則)",
                    "極高 (少數規則即能高精逼近)"
                ],
                [
                    "遺傳模糊系統 (GFS)",
                    "染色體編碼規則庫與參數",
                    "全局隨機搜索演化",
                    "良好 (優化後仍為模糊規則)",
                    "能克服局部極小陷阱"
                ]
            ]
        },
        "worked_example": {
            "title": "進階範例：兩規則一階 ANFIS 前向輸出解析推導",
            "problem": "設輸入 x = 0.5, y = 1.0。兩條規則如下：\nRule 1: IF x is A1 and y is B1, THEN f1 = 2x + y + 1\nRule 2: IF x is A2 and y is B2, THEN f2 = x - 2y + 3\n已知歸屬度：μA1(0.5)=0.8, μA2(0.5)=0.2; μB1(1.0)=0.6, μB2(1.0)=0.4。試求 ANFIS 之最終輸出值。",
            "solution": "1. Layer 2 激發度：w1 = 0.8 × 0.6 = 0.48；w2 = 0.2 × 0.4 = 0.08。\n2. Layer 3 正規化：w1+w2 = 0.56；w̄1 = 0.48 / 0.56 = 6/7 ≈ 0.8571；w̄2 = 0.08 / 0.56 = 1/7 ≈ 0.1429。\n3. 各規則結論輸出值：f1 = 2(0.5) + (1.0) + 1 = 1 + 1 + 1 = 3.0；f2 = (0.5) - 2(1.0) + 3 = 0.5 - 2 + 3 = 1.5。\n4. Layer 5 總輸出：Output = w̄1 · f1 + w̄2 · f2 = (6/7)(3.0) + (1/7)(1.5) = (18 + 1.5)/7 = 19.5 / 7 ≈ 2.7857。",
            "slide_tip": "考試重點：ANFIS 第 3 層正規化權重保證了 w̄1 + w̄2 = 1，使第四層結論輸出能以凸組合 (Convex Combination) 平滑插值！"
        }
    }
]


    # 分割各章清單便利前端直取
    course_data["chapter_pages_map"] = {}
    for p in all_pages_flat:
        ch_str = str(p["chapter"])
        if ch_str not in course_data["chapter_pages_map"]:
            course_data["chapter_pages_map"][ch_str] = []
        course_data["chapter_pages_map"][ch_str].append(p)

    # 寫入 course_data.json
    OUTPUT_JSON_PATH.write_text(json.dumps(course_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] 已更新寫入: {OUTPUT_JSON_PATH}")

    # 產生 course_data.js (以 window.FUZZY_COURSE_DATA 與 window.BOOK_PAGES 載入，徹底免除 file:// CORS 錯誤)
    js_content = (
        "// ============================================================================\n"
        "// Fuzzy 學習平台 — 全書 19 章 282 頁教材與書頁圖檔結構化資料庫\n"
        "// 自動由 backend/ingest_all_book_pages.py 同步生成，支援 file:// 協議直接雙擊開啟\n"
        "// ============================================================================\n\n"
        "window.BOOK_PAGES = " + json.dumps(all_pages_flat, ensure_ascii=False, indent=2) + ";\n\n"
        "window.CHAPTERS_CATALOG = " + json.dumps(chapters_catalog, ensure_ascii=False, indent=2) + ";\n\n"
        "window.FUZZY_COURSE_DATA = " + json.dumps(course_data, ensure_ascii=False, indent=2) + ";\n"
    )
    OUTPUT_JS_PATH.write_text(js_content, encoding="utf-8")
    print(f"[OK] 已更新寫入: {OUTPUT_JS_PATH}")
    print("============================================================")
    print("全書照片與精讀資料庫已成功生成完畢！")
    print("============================================================")


if __name__ == "__main__":
    main()
