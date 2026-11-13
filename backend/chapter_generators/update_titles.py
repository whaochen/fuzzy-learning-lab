# -*- coding: utf-8 -*-
"""
更新首頁標題與說明文字以完整反映 7 大篇章與 282 頁原書圖檔
"""
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. 頂部副標題
html = html.replace(
    '智慧學習地圖導引 × 《認識 Fuzzy》第二章書頁精讀 × 課堂錄音考點 × Mamdani 互動實驗室',
    '智慧學習地圖導引 × 《認識 Fuzzy》全書 19 章 282 頁精讀 × 七大核心篇章 × Plotly 互動實驗室'
)

# 2. 地圖頂部標籤與說明
old_map_header = '''              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span>📸 已載入《認識 Fuzzy》chapter2_photos (15 頁原圖與公式)</span>
              </div>
            </div>
            <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Fuzzy 模糊邏輯・四大階段闖關學習地圖
            </h2>
            <p class="prose-reading text-slate-300 mb-0">
              循序漸進從「《認識 Fuzzy》第 2 章模糊集合根基（頁 2-1～2-15）」跨越到「歸屬函數建模」、「Mamdani 推論引擎」與「重心法互動控制實驗」。點擊任一地圖節點即可自動跳轉並高亮對應的專書書頁精讀、上課錄音重點或隨堂測驗，學完打勾即可解鎖下一階段！
            </p>'''

new_map_header = '''              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span>📸 已掛載《認識 Fuzzy》全書 19 大章節共 282 頁原書圖檔與高畫質照片燈箱</span>
              </div>
            </div>
            <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Fuzzy 模糊邏輯・七大核心篇章闖關學習地圖 (Stage 01 ～ 07)
            </h2>
            <p class="prose-reading text-slate-300 mb-0">
              循序漸進涵蓋「模糊集合基礎」、「模糊關係與推論」、「模糊控制器設計」、「模糊數與擴展原理」、「模糊決策與評判」、「模糊分群與識別」與「類神經模糊系統 (ANFIS)」。點擊任一關卡節點即可自動切換至對應章節四大模組（通論、逐頁精讀、互動模擬器、考題詳解），學完打勾即可解鎖下一關！
            </p>'''

html = html.replace(old_map_header, new_map_header)

# 3. 關卡預設文字
html = html.replace(
    '已完成 0 / 11 個核心關卡',
    '已完成 0 / 28 個核心關卡'
)

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Homepage headers and roadmap descriptions updated successfully!")
