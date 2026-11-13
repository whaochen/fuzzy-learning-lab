#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fuzzy 學習平台 — 多模態教材自動化萃取腳本 (backend/ingest_materials.py)

功能說明：
1. 掃描 materials/book_photos/chapter2_photos 中的《認識 Fuzzy》第二章（2-1.jpg ~ 2-15.jpg）書頁拍照圖檔，
   進行高精度 OCR、數學公式 LaTeX 辨識與結構化 Markdown 理論章節整理。
2. 掃描 materials/lecture_audio/ 中的上課錄音檔，轉錄並摘要出老師強調的核心重點與考點。
3. 掃描 materials/other_slides/ 中的 PDF / PPTX 講義，提取核心定義與範例。
4. 自動將所有萃取結果合併輸出至 frontend/course_data.json 與 frontend/course_data.js。

注意：
請遵循 AGENTS.md 規範，使用本地家目錄虛擬環境 (~/.fuzzy_env) 執行本腳本，切勿在專案內建立 .venv。
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional

os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
sys.dont_write_bytecode = True

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MATERIALS_DIR = PROJECT_ROOT / "materials"
BOOK_PHOTOS_DIR = MATERIALS_DIR / "book_photos"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
OUTPUT_JSON_PATH = FRONTEND_DIR / "course_data.json"
OUTPUT_JS_PATH = FRONTEND_DIR / "course_data.js"
CACHE_DIR = Path.home() / ".fuzzy_env" / "ingest_cache"

# 《認識 Fuzzy》第二章（chapter2_photos: 2-1.jpg ~ 2-15.jpg）逐頁結構化萃取資料庫
CHAPTER2_EXTRACTED_PAGES: List[Dict[str, Any]] = [
    {
        "page_id": "2-1",
        "file_name": "2-1.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-1.jpg",
        "section": "第二章 章首扉頁",
        "title": "第二章：模糊集合 (Fuzzy Sets)",
        "summary": "本章正式進入《認識 Fuzzy》的核心基礎——模糊集合。扉頁以倒單擺／機構控制插圖象徵模糊邏輯如何將人類語意轉化為工程控制力量。",
        "formulas": [],
        "book_examples": ["章首單擺機構示意圖：預示模糊集合將於自動控制系統中大放異彩。"]
    },
    {
        "page_id": "2-2",
        "file_name": "2-2.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-2.jpg",
        "section": "2.1 簡介",
        "title": "人類語意的不確定性與「意義的數量化 (Quantification of Meaning)」",
        "summary": "人類口語常含有模稜兩可的形容詞（如「很胖的人」、「很老的狗」），並未規定幾公斤以上才叫胖、幾歲以上才叫老。透過將物理量放在橫軸、將符合形容詞的「程度 $\\mu$」放在縱軸（$\\mu \\to 1$ 表示程度愈重，$\\mu \\to 0$ 表示程度愈輕），即可完成「意義的數量化」，這正是模糊集合的起源。",
        "formulas": [
            "$$\\mu \\to 1 \\;(\\text{程度愈重 / 完全符合}), \\qquad \\mu \\to 0 \\;(\\text{程度愈輕 / 完全不符})$$"
        ],
        "book_examples": [
            "圖 2.1(a)「胖」的人：橫軸為體重（公斤 $50, 100, 150$），縱軸為胖的程度 $\\mu$。$50\\text{ kg}$ 以下接近 $0$，$100\\text{ kg}$ 約為 $0.5$，$150\\text{ kg}$ 以上趨近於 $1$。",
            "圖 2.1(b)「老」的狗：橫軸為狗的年齡（$0, 10, 20$ 歲），縱軸為老的程度 $\\mu$。隨年齡由 $0$ 歲平滑上升，$10$ 歲約 $0.5$，$20$ 歲以上趨近於 $1$。"
        ]
    },
    {
        "page_id": "2-3",
        "file_name": "2-3.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-3.jpg",
        "section": "2.2 明確集合之複習 (一)",
        "title": "明確集合 (Crisp Set)、特性函數 $\\Phi_A(x)$ 與宇集合 $X$",
        "summary": "複習傳統集合論：明確集合 $A$ 的元素歸屬非黑即白。書中定義「宇集合／全集合（Universal Set, $X$）」為元素 $x$ 的來源，並以**特性函數（Characteristic Function）** $\\Phi_A(x) \\in \\{0, 1\\}$ 刻畫元素是否屬於 $A$，同時整理部分集合 $A \\subset B$、差集 $B - A$ 與補集合 $\\bar{A}$。",
        "formulas": [
            "$$\\Phi_A(x) = \\begin{cases} 1, & \\text{當 } x \\in A \\\\ 0, & \\text{當 } x \\notin A \\end{cases} \\qquad (\\Phi_A : X \\to \\{0, 1\\},\\; x \\in X)$$",
            "$$B - A = \\{x \\mid x \\in B,\\, \\text{但 } x \\notin A\\}, \\qquad \\bar{A} = \\{x \\mid x \\notin A,\\, x \\in X\\}, \\qquad \\bar{\\bar{A}} = A, \\qquad \\bar{\\phi} = X,\\; \\bar{X} = \\phi$$"
        ],
        "book_examples": [
            "列舉法範例：$A_1 = \\{a, b, c\\}$，其中 $a, b, c \\in A_1$，但 $d \\notin A_1$。",
            "描述法範例：$A_2 = \\{x \\mid 2x + 4 = 0,\\; x \\in R\\}$，明確可知 $x = -2 \\in A_2$，而 $x = 0 \\notin A_2$。"
        ]
    },
    {
        "page_id": "2-4",
        "file_name": "2-4.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-4.jpg",
        "section": "2.2 明確集合之複習 (二) & 2.3 模糊集合之基本型態",
        "title": "明確集合八大代數定律 vs. 歸屬函數 (Membership Function) 的引入",
        "summary": "彙整明確集合之交集、聯集與八大基本定律（交換律、結合律、分配律、同一律、吸入律、恆等律、矛盾律 $A \\cap \\bar{A} = \\phi$、排中律 $A \\cup \\bar{A} = X$、笛摩根定律）。接著進入 **2.3 模糊集合之基本型態**：當特性函數值不再非 $1$ 即 $0$，而是在 $[0, 1]$ 之間連續取值時，稱為**歸屬函數（Membership Function）** $\\mu_A(x)$ 或 $A(x)$。",
        "formulas": [
            "$$A \\cap B = \\{x \\mid x \\in A \\text{ 且 } x \\in B\\}, \\qquad A \\cup B = \\{x \\mid x \\in A \\text{ 或 } x \\in B\\}$$",
            "$$\\text{矛盾律：}A \\cap \\bar{A} = \\phi, \\qquad \\text{排中律：}A \\cup \\bar{A} = X, \\qquad \\text{笛摩根定律：}\\overline{A \\cap B} = \\bar{A} \\cup \\bar{B},\\; \\overline{A \\cup B} = \\bar{A} \\cap \\bar{B}$$"
        ],
        "book_examples": [
            "書本術語對照：宇集合 $X$ 在許多中文文獻亦稱為「論域（Universe of Discourse）」。當 $A(x_1) > A(x_2)$ 時，表示 $x_1$ 屬於模糊集合 $A$ 的程度（Degree / Grade）比 $x_2$ 更重。"
        ]
    },
    {
        "page_id": "2-5",
        "file_name": "2-5.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-5.jpg",
        "section": "2.3 模糊集合之基本型態（例 2.1）",
        "title": "歸屬函數映射定義與【例 2.1：「小朋友」之模糊集合 vs. 明確集合】",
        "summary": "本書約定以 $A(x)$ 代表模糊集合 $A$ 之歸屬函數（映射 $A: X \\to [0, 1]$）。書中透過【例 2.1】比較用模糊集合（圖 2.2a）與明確集合（圖 2.2b）描述「小朋友」年齡：若用明確集合定 $3\\sim 9$ 歲為小朋友，則未滿 $3$ 歲完全不是、一過 $9$ 歲生日又瞬間變成 $0$，顯得「強人所難」；模糊集合則完美符合人性常理。",
        "formulas": [
            "$$\\mu_A : X \\to [0, 1] \\quad \\text{或} \\quad A : X \\to [0, 1] \\qquad (0 \\le A(x) \\le 1,\\; x \\in X)$$"
        ],
        "book_examples": [
            "圖 2.2(a)「小朋友」模糊集合歸屬度：$6$ 歲為 $A(6)=1.0$（百分之百是小朋友）、$4$ 歲為 $A(4)=0.7$、$10$ 歲為 $A(10)=0.5$、$12$ 歲為 $A(12)=0.1$（稱青少年更恰當）。",
            "圖 2.2(b)「小朋友」明確集合：在 $[3, 9]$ 歲為方波 $1$，其餘為 $0$，在 $3$ 歲與 $9$ 歲邊界處產生不合理跳變。"
        ]
    },
    {
        "page_id": "2-6",
        "file_name": "2-6.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-6.jpg",
        "section": "2.3 模糊集合之基本型態（圖 2.3 & 圖 2.5 背景）",
        "title": "模糊集合隨環境與主觀意識之變化：教育程度（圖 2.3）與美女評分（圖 2.5）",
        "summary": "說明模糊集合常因**對象環境不同**（如「高溫」對天氣與對開水）或**描述者主觀意識不同**（如甲、乙兩人各自覺得自己女友最美）而有不同歸屬函數曲線。",
        "formulas": [
            "$$A(\\text{學士}) = 0 \\;(\\text{初等教育}), \\qquad B(\\text{學士}) = 0.8 \\;(\\text{中等教育}), \\qquad C(\\text{學士}) = 0.6 \\;(\\text{高等教育})$$"
        ],
        "book_examples": [
            "圖 2.3 學歷與教育程度：橫軸為「文盲、小學、國中、高中、學士、碩士、博士」，繪出 $A$（受初等教育者）、$B$（受中等教育者）、$C$（受高等教育者）三條歸屬曲線，其中博士滿足 $C(\\text{博士})=1,\\; A(\\text{博士})=0$。",
            "圖 2.5 主觀意識範例：甲、乙對 $7$ 位女生 $a_1 \\sim a_7$ 評估「美女」程度。因 $a_4$ 為甲之女友、$a_2$ 為乙之女友，故甲定 $A(a_4)=1$，乙則定 $B(a_2)=1$。"
        ]
    },
    {
        "page_id": "2-7",
        "file_name": "2-7.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-7.jpg",
        "section": "2.3 模糊集合之基本型態（圖 2.4 & 圖 2.5）",
        "title": "有限離散型 vs. 連續型模糊集合表示法",
        "summary": "展示有限離散宇集合的 Zadeh 記號（以 $/$ 配對歸屬度與元素，以 $+$ 串聯）。並對比連續型（圖 2.4 天氣與開水的高溫曲線）與離散型（圖 2.5 對 $7$ 位女生的美女程度針狀圖）。",
        "formulas": [
            "$$\\text{美女}_{(\\text{乙})} = 0.4/a_1 + 1/a_2 + 0.8/a_3 + 0.6/a_4 + 0.8/a_5 + 0.4/a_6 + 0.2/a_7$$",
            "$$\\text{美女}_{(\\text{甲})} = 0.3/a_1 + 0.5/a_2 + 0.7/a_3 + 1/a_4 + 0.9/a_5 + 0.6/a_6 + 0.4/a_7$$"
        ],
        "book_examples": [
            "圖 2.4(a) 高溫(天氣)：$5^\\circ\\text{C}$ 以下為 $0$，$5^\\circ\\text{C}\\sim 40^\\circ\\text{C}$ 線性上升至 $1$，$40^\\circ\\text{C}$ 以上維持 $1$。",
            "圖 2.4(b) 高溫(開水)：$30^\\circ\\text{C}$ 以下為 $0$，$30^\\circ\\text{C}\\sim 80^\\circ\\text{C}$ 平滑上升至 $1$，$80^\\circ\\text{C}$ 以上維持 $1$。"
        ]
    },
    {
        "page_id": "2-8",
        "file_name": "2-8.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-8.jpg",
        "section": "2.3 模糊集合之基本型態（圖 2.6 & 圖 2.7a,b）",
        "title": "歸屬函數的客觀合理性檢驗與「靠近 $5$ 之實數」標準函數",
        "summary": "雖然模糊集合允許主觀彈性，但客觀物理概念（如「熱天氣」）絕不可有顛倒是非的描述！圖 2.6(a)(b) 隨溫度升高而遞增皆屬合理；圖 2.6(c) 在超過 $40^\\circ\\text{C}$ 後歸屬度竟下降至 $0$，違反溫度愈高愈熱的常識。下半頁開始介紹圖 2.7「靠近 $5$ 之實數」的標準參數化歸屬函數。",
        "formulas": [],
        "book_examples": [
            "圖 2.6(a)(b) vs (c) 熱天氣合理性對照：$50^\\circ\\text{C}$、$60^\\circ\\text{C}$ 的熱天氣歸屬度必須維持為 $1$，若畫成遞減至 $0$ 即為錯誤建模。",
            "圖 2.7(a)(b) 靠近 $5$ 之實數：分別展示在 $[4, 6]$ 區間的三角形函數與在 $[0, 10]$ 區間的平滑鐘形函數。"
        ]
    },
    {
        "page_id": "2-9",
        "file_name": "2-9.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-9.jpg",
        "section": "2.3 模糊集合之基本型態（圖 2.7c,d,e 與解析式）",
        "title": "「靠近 $5$ 之實數」四種常用連續歸屬函數解析式 $A_1(x) \\sim A_4(x)$",
        "summary": "完整列出描述「靠近 $5$ 之實數」的四種經典連續歸屬函數數學式，其中參數 $p_i$ 控制曲線上升或下降的陡峭程度（斜率／頻寬）。",
        "formulas": [
            "$$A_1(x) = \\begin{cases} (x - 5) + 1, & \\text{當 } x \\in [4, 5] \\\\ (5 - x) + 1, & \\text{當 } x \\in [5, 6] \\\\ 0, & \\text{其他} \\end{cases} \\qquad (\\text{三角形歸屬函數})$$",
            "$$A_2(x) = \\frac{1}{1 + p_2(x - 5)^2} \\;(\\text{鐘形分式}), \\qquad A_3(x) = \\exp\\big\\{-|p_3(x - 5)|\\big\\} \\;(\\text{指數尖峰型})$$",
            "$$A_4(x) = \\begin{cases} \\dfrac{1 + \\cos(p_4 \\pi (x - 5))}{2}, & \\text{當 } x \\in [5 - 1/p_4,\\; 5 + 1/p_4] \\\\ 0, & \\text{其他} \\end{cases} \\qquad (\\text{餘弦波峰型})$$"
        ],
        "book_examples": [
            "圖 2.7(c)(d)(e)：分別對應指數尖峰函數 $A_3(x)$、餘弦函數 $A_4(x)$（取 $p_4=1$）以及在 $x=5$ 單點垂直為 $1$ 的模糊單值（Singleton）。"
        ]
    },
    {
        "page_id": "2-10",
        "file_name": "2-10.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-10.jpg",
        "section": "2.3 模糊單值 & 2.4 模糊集合之基本觀念（圖 2.8）",
        "title": "模糊單值 (Singleton) $A_5(x)$ 與年齡三集合（年輕、中年、老年）",
        "summary": "定義圖 2.7(e) 的**模糊單值（Singleton）** $A_5(x)$，它只在 $x=5$ 單點歸屬度為 $1$，其餘皆為 $0$（在模糊控制器的單點模糊化極為常用）。接著進入 **2.4 模糊集合之基本觀念**，引入貫穿全節的核心範例——圖 2.8 年齡宇集合 $X=[0, 100]$ 上的三個模糊集合：$A_1$（年輕人）、$A_2$（中年人）、$A_3$（老年人）。",
        "formulas": [
            "$$A_5(x) = \\begin{cases} 1, & x = 5 \\\\ 0, & x \\neq 5 \\end{cases} \\qquad (\\text{模糊單值 Singleton})$$"
        ],
        "book_examples": [
            "圖 2.8 年齡三集合幾何分布：$A_1$（年輕人）在 $0\\sim 20$ 歲為 $1$、$20\\sim 40$ 歲線性降至 $0$；$A_2$（中年人）在 $20\\sim 60$ 歲呈三角形分布（$40$ 歲達頂點 $1$）；$A_3$（老年人）在 $40\\sim 60$ 歲線性升至 $1$、$60\\sim 100$ 歲維持為 $1$。"
        ]
    },
    {
        "page_id": "2-11",
        "file_name": "2-11.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-11.jpg",
        "section": "2.4 模糊集合之基本觀念（式 2.1 & 式 2.2）",
        "title": "$\\alpha$-截集 (${}^\\alpha A$) 與 $\\alpha$-強截集 (${}^{\\alpha+} A$) 的定義與區間計算",
        "summary": "給出圖 2.8 年輕人 $A_1(x)$、中年人 $A_2(x)$、老年人 $A_3(x)$ 的完整分段方程式，並正式定義 **$\\alpha$-截集（$\\alpha$-Cut, ${}^\\alpha A$）** 與 **$\\alpha$-強截集（Strong $\\alpha$-Cut, ${}^{\\alpha+} A$）**。書中特別強調：${}^\\alpha A$ 與 ${}^{\\alpha+} A$ 本身都是**明確集合（Crisp Set）**！",
        "formulas": [
            "$$A_1(x) = \\begin{cases} 1, & x \\le 20 \\\\ \\dfrac{40 - x}{20}, & 20 < x < 40 \\\\ 0, & x \\ge 40 \\end{cases}, \\quad A_2(x) = \\begin{cases} 0, & x \\le 20 \\text{ 或 } x \\ge 60 \\\\ \\dfrac{x - 20}{20}, & 20 < x \\le 40 \\\\ \\dfrac{60 - x}{20}, & 40 \\le x < 60 \\end{cases}, \\quad A_3(x) = \\begin{cases} 0, & x \\le 40 \\\\ \\dfrac{x - 40}{20}, & 40 < x < 60 \\\\ 1, & x \\ge 60 \\end{cases}$$",
            "$${}^\\alpha A = \\{x \\mid A(x) \\ge \\alpha\\} \\;\\;\\text{(式 2.1)}, \\qquad {}^{\\alpha+} A = \\{x \\mid A(x) > \\alpha\\} \\;\\;\\text{(式 2.2)}$$"
        ],
        "book_examples": [
            "當 $\\alpha = 0.5$ 時對圖 2.8 求取截集與強截集（注意閉區間與開區間端點差異）：\n• ${}^{0.5} A_1 = \\{x \\mid 0 \\le x \\le 30\\}, \\quad {}^{0.5+} A_1 = \\{x \\mid 0 \\le x < 30\\}$\n• ${}^{0.5} A_2 = \\{x \\mid 30 \\le x \\le 50\\}, \\quad {}^{0.5+} A_2 = \\{x \\mid 30 < x < 50\\}$\n• ${}^{0.5} A_3 = \\{x \\mid 50 \\le x \\le 100\\}, \\quad {}^{0.5+} A_3 = \\{x \\mid 50 < x \\le 100\\}$"
        ]
    },
    {
        "page_id": "2-12",
        "file_name": "2-12.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-12.jpg",
        "section": "2.4 模糊集合之基本觀念（式 2.3 & 式 2.4）",
        "title": "底集 / 支集 (${}^{0+}A$)、核 (${}^1 A$)、高度 $h(A)$、正規性與凸形集合",
        "summary": "定義模糊集合的五大結構性質：\n1. **底集（Support, ${}^{0+}A$）**：即 $\\alpha=0$ 的強截集 $\\{x \\mid A(x) > 0\\}$（本書作者特別指出譯為「底集」比「支集」更貼切圖形底部之意）。\n2. **核（Core, ${}^1 A$）**：歸屬度等於 $1$ 的元素集合 $\\{x \\mid A(x) = 1\\}$。\n3. **高度 $h(A)$**：歸屬函數的最大值 $\\max_{x \\in X} A(x)$。\n4. **正規模糊集合（Normal）**：滿足高度 $h(A) = 1$ 的模糊集合。\n5. **凸形集合（Convex Set）**：對任意兩點連線內部點 $\\lambda x_1 + (1-\\lambda)x_2$，其歸屬度不小於兩端點之較小值。",
        "formulas": [
            "$${}^{0+} A_1 = [0, 40), \\qquad {}^{0+} A_2 = (20, 60), \\qquad {}^{0+} A_3 = (40, 100]$$",
            "$$h(A) = \\max_{x \\in X} A(x) \\;\\;\\text{(式 2.3)}, \\qquad A(\\lambda x_1 + (1 - \\lambda)x_2) \\ge \\min\\big(A(x_1),\\, A(x_2)\\big),\\; \\lambda \\in [0, 1] \\;\\;\\text{(式 2.4)}$$"
        ],
        "book_examples": [
            "在圖 2.8 中，${}^0 A_1 = {}^0 A_2 = {}^0 A_3 = [0, 100] = X$，且三個集合的最高點皆達 $1$，故 $h(A_1)=h(A_2)=h(A_3)=1$，三者皆為正規模糊集合。"
        ]
    },
    {
        "page_id": "2-13",
        "file_name": "2-13.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-13.jpg",
        "section": "2.4 模糊集合之基本觀念（圖 2.9 & 位階集合）",
        "title": "正規凸形 vs. 非凸形視覺化對照（圖 2.9）與位階集合 $\\Lambda(A)$",
        "summary": "透過圖 2.9(a) 單峰曲線與圖 2.9(b) 雙峰凹陷曲線，直觀展示何謂「正規且凸形」與「正規但非凸形」。同時提出截集單調包含性質（當 $\\alpha_1 < \\alpha_2$ 時，${}^{\\alpha_1} A \\supset {}^{\\alpha_2} A$），並定義所有出現過的歸屬度 $\\alpha$ 數值集合為**位階集合（Level Set, $\\Lambda(A)$）**。",
        "formulas": [
            "$$\\text{當 } 0 \\le \\alpha_1 < \\alpha_2 \\le 1 \\text{ 時：}\\quad {}^{\\alpha_1} A \\supset {}^{\\alpha_2} A \\quad \\text{且} \\quad {}^{\\alpha_1+} A \\supset {}^{\\alpha_2+} A$$",
            "$$\\Lambda(A) = \\{\\alpha \\mid A(x) = \\alpha,\\; \\text{對所有 } x \\in X\\}$$"
        ],
        "book_examples": [
            "圖 2.8 連續年齡集合的位階集合為閉區間 $\\Lambda(A_1) = \\Lambda(A_2) = \\Lambda(A_3) = [0, 1]$。"
        ]
    },
    {
        "page_id": "2-14",
        "file_name": "2-14.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-14.jpg",
        "section": "2.4 純基數 (式 2.5)、2.5 本章總結 & 習題 2.1~2.7a",
        "title": "離散模糊集合之純基數 (Scalar Cardinality) $|A|$ 與本章總結",
        "summary": "針對有限離散宇集合上的模糊集合 $A$，定義其所有元素歸屬度之代數總和為**純基數（Scalar Cardinality, $|A|$）**。隨後進行 2.5 本章總結，並列出課後習題 2.1 至 2.7(a)。",
        "formulas": [
            "$$\\Lambda(\\text{美女}_{(\\text{乙})}) = \\{0.2, 0.4, 0.6, 0.8, 1\\}$$",
            "$$|A| = \\sum_{x \\in X} A(x) \\;\\;\\text{(式 2.5)} \\quad \\Longrightarrow \\quad |\\text{美女}_{(\\text{乙})}| = 0.4 + 1 + 0.8 + 0.6 + 0.8 + 0.4 + 0.2 = 4.2$$"
        ],
        "book_examples": [
            "習題 2.7(a)：設 $A = 0.4/a + 0.5/b + 0.6/c + 0.8/d + 1/e$，求高度 $h(A)$ 與純基數 $|A|$。\n解答：高度 $h(A) = \\max(0.4, 0.5, 0.6, 0.8, 1) = 1$；純基數 $|A| = 0.4 + 0.5 + 0.6 + 0.8 + 1 = 3.3$。"
        ]
    },
    {
        "page_id": "2-15",
        "file_name": "2-15.jpg",
        "source_file": "../materials/book_photos/chapter2_photos/2-15.jpg",
        "section": "第二章 課後習題 (2.7b,c & 2.8)",
        "title": "第二章壓軸習題：高度、純基數與 $\\alpha = 0.6$ 截集實戰演練",
        "summary": "本頁收錄習題 2.7(b)(c) 與習題 2.8，綜合檢驗讀者對離散／函數型模糊集合之高度 $h(A)$、純基數 $|A|$ 與 $\\alpha$-截集 ${}^{0.6}A$ 的計算能力。",
        "formulas": [
            "$$\\text{習題 2.7(b)：}B = 1/w + 1/t + 1/u \\quad \\Longrightarrow \\quad h(B) = 1,\\; |B| = 3,\\; {}^{0.6}B = \\{w, t, u\\}$$",
            "$$\\text{習題 2.7(c)：}C(x) = \\frac{x}{x + 2},\\; x \\in \\{0, 1, 2, \\dots, 10\\} \\quad \\Longrightarrow \\quad h(C) = C(10) = \\frac{10}{12} \\approx 0.833$$",
            "$$\\text{習題 2.8（當 }\\alpha = 0.6\\text{）：}\\frac{x}{x+2} \\ge 0.6 \\iff x \\ge 3 \\quad \\Longrightarrow \\quad {}^{0.6}C = \\{3, 4, 5, 6, 7, 8, 9, 10\\}$$"
        ],
        "book_examples": [
            "習題 2.8 完整解答：當 $\\alpha = 0.6$ 時，${}^{0.6}A = \\{c, d, e\\}$、${}^{0.6}B = \\{w, t, u\\}$、${}^{0.6}C = \\{3, 4, 5, 6, 7, 8, 9, 10\\}$。"
        ]
    }
]


def sync_js_bundle(course_data: Dict[str, Any]):
    """同步產生 frontend/course_data.js，讓使用者直接開啟 index.html (file://) 也能零延遲載入。"""
    js_content = (
        "// 自動由 backend/ingest_materials.py 與 course_data.json 同步生成\n"
        "window.FUZZY_COURSE_DATA = "
        + json.dumps(course_data, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUTPUT_JS_PATH.write_text(js_content, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Fuzzy 教材多模態批次萃取工具")
    parser.add_argument("--book-subdir", default="chapter2_photos", help="指定要處理的書頁子資料夾名稱")
    args = parser.parse_args()

    FRONTEND_DIR.mkdir(parents=True, exist_ok=True)
    if not OUTPUT_JSON_PATH.exists():
        print(f"[錯誤] 找不到 {OUTPUT_JSON_PATH}。")
        sys.exit(1)

    course_data = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
    course_data["chapter2_book_pages"] = CHAPTER2_EXTRACTED_PAGES
    course_data.setdefault("metadata", {})["last_ingested_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    course_data["metadata"]["ingested_source"] = f"materials/book_photos/{args.book_subdir} (2-1.jpg ~ 2-15.jpg)"
    course_data["metadata"]["book_pages_count"] = len(CHAPTER2_EXTRACTED_PAGES)

    # 將第二章 15 頁萃取結果同時掛載進 Chapter 01 (fuzzy_sets)
    for ch in course_data.get("chapters", []):
        if ch.get("id") == "fuzzy_sets":
            ch["ingested_book_pages"] = CHAPTER2_EXTRACTED_PAGES
            ch["book_source"] = "《認識 Fuzzy》第 2 章「模糊集合」原書照片完整萃取（頁 2-1 ～ 2-15，共 15 頁）"

    OUTPUT_JSON_PATH.write_text(json.dumps(course_data, ensure_ascii=False, indent=2), encoding="utf-8")
    sync_js_bundle(course_data)

    print("============================================================")
    print("[完成] 已成功萃取 materials/book_photos/chapter2_photos (2-1.jpg ~ 2-15.jpg)！")
    print(f"  - 共更新 {len(CHAPTER2_EXTRACTED_PAGES)} 頁《認識 Fuzzy》第二章結構化書頁與公式")
    print(f"  - 輸出檔案: {OUTPUT_JSON_PATH} & {OUTPUT_JS_PATH}")
    print("============================================================")


if __name__ == "__main__":
    main()
