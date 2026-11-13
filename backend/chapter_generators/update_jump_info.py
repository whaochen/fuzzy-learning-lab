# -*- coding: utf-8 -*-
"""
更新 getJumpPlotInfo 與色彩標籤
"""
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 替換 getJumpPlotInfo
new_jump_code = '''    function getJumpPlotInfo(p) {
      if (!p || !p.page_id) return null;
      const pid = p.parent_chapter_id;
      const pageId = p.page_id;
      const ch = p.chapter;

      if (pid === 'fuzzy_sets') {
        if (ch === 1 || ['2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7'].includes(pageId)) {
          return { plotId: 'a', label: '📊 前往【模擬圖 (a)】邊界過渡驗證', action: "FuzzyWidgets.jumpToCh1Plot('a')" };
        }
        if (['2-8', '2-9'].includes(pageId)) {
          return { plotId: 'b', label: '📐 前往【模擬圖 (b)】歸屬函數造型實驗', action: "FuzzyWidgets.jumpToCh1Plot('b')" };
        }
        if (ch === 3 && ['3-1', '3-2', '3-3', '3-4', '3-5'].includes(pageId)) {
          return { plotId: 'c', label: '⚡ 前往【模擬圖 (c)】模糊聯集/交集/補集運算器', action: "FuzzyWidgets.jumpToCh1Plot('c')" };
        }
        return { plotId: 'd', label: '🔪 前往【模擬圖 (d)】α-截集與核/支集驗證', action: "FuzzyWidgets.jumpToCh1Plot('d')" };
      }

      if (pid === 'fuzzy_relations_inference') {
        if (ch === 4 && ['4-1', '4-2', '4-3', '4-4'].includes(pageId)) {
          return { plotId: 'a', label: '📊 前往【模擬圖 (a)】笛卡兒積熱力與曲面實驗', action: "FuzzyWidgets.jumpToCh2Plot('a')" };
        }
        if (ch === 4) {
          return { plotId: 'b', label: '⚡ 前往【模擬圖 (b)】關係合成運算器 (Max-Min / Product)', action: "FuzzyWidgets.jumpToCh2Plot('b')" };
        }
        if (ch === 5 && parseInt(pageId.split('-')[1] || '0') <= 15) {
          return { plotId: 'c', label: '📐 前往【模擬圖 (c)】單規則截頂 vs 縮放推論', action: "FuzzyWidgets.jumpToCh2Plot('c')" };
        }
        return { plotId: 'd', label: '⚖️ 前往【模擬圖 (d)】四大解模糊化比較器', action: "FuzzyWidgets.jumpToCh2Plot('d')" };
      }

      if (pid === 'fuzzy_control_applications') {
        if (ch === 6 && parseInt(pageId.split('-')[1] || '0') <= 10) {
          return { plotId: 'a', label: '📊 前往【模擬圖 (a)】FAM 冷氣溫控模擬', action: "FuzzyWidgets.jumpToCh3Plot('a')" };
        }
        if (ch === 6 || ch === 7 || ch === 8) {
          return { plotId: 'b', label: '🌐 前往【模擬圖 (b)】3D 非線性控制曲面', action: "FuzzyWidgets.jumpToCh3Plot('b')" };
        }
        if (ch >= 9 && ch <= 10) {
          return { plotId: 'c', label: '⚡ 前往【模擬圖 (c)】Mamdani vs TSK (Sugeno) 對照', action: "FuzzyWidgets.jumpToCh3Plot('c')" };
        }
        return { plotId: 'd', label: '🩺 前往【模擬圖 (d)】重症醫療預警決策', action: "FuzzyWidgets.jumpToCh3Plot('d')" };
      }

      if (pid === 'fuzzy_numbers_extension') {
        if (parseInt(pageId.split('-')[1] || '0') <= 7) {
          return { plotId: 'a', label: '📈 前往【模擬圖 (a)】擴展原理函數映射', action: "FuzzyWidgets.jumpToCh4Plot('a')" };
        }
        return { plotId: 'b', label: '🧮 前往【模擬圖 (b)】模糊數四則運算與 α-Cut', action: "FuzzyWidgets.jumpToCh4Plot('b')" };
      }

      if (pid === 'fuzzy_decision_evaluation') {
        if (ch === 13) {
          return { plotId: 'a', label: '🎯 前往【模擬圖 (a)】Bellman-Zadeh 最佳決策搜尋', action: "FuzzyWidgets.jumpToCh5Plot('a')" };
        }
        return { plotId: 'b', label: '📊 前往【模擬圖 (b)】多指標綜合評判實驗室', action: "FuzzyWidgets.jumpToCh5Plot('b')" };
      }

      if (pid === 'fuzzy_clustering_pattern') {
        if (ch === 12) {
          return { plotId: 'a', label: '🌲 前往【模擬圖 (a)】傳遞閉包分群樹模擬器', action: "FuzzyWidgets.jumpToCh6Plot('a')" };
        }
        return { plotId: 'b', label: '🔬 前往【模擬圖 (b)】FCM 2D 柔性分群散佈圖', action: "FuzzyWidgets.jumpToCh6Plot('b')" };
      }

      if (pid === 'advanced_fuzzy_neuro') {
        if (ch === 11) {
          return { plotId: 'a', label: '🧠 前往【模擬圖 (a)】ANFIS 學習擬合模擬器', action: "FuzzyWidgets.jumpToCh7Plot('a')" };
        }
        return { plotId: 'b', label: '🎛️ 前往【模擬圖 (b)】自適應模糊 vs PID 步階響應', action: "FuzzyWidgets.jumpToCh7Plot('b')" };
      }

      return null;
    }'''

pattern = r"function getJumpPlotInfo\(p\) \{[\s\S]*?return null;\s*\}"
html = re.sub(pattern, new_jump_code.strip(), html, count=1)

# 優化 renderParentBookGallery 中的顏色映射
color_map_code = '''        const colorMap = {
          sky: 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25 border-sky-400',
          indigo: 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/25 border-indigo-400',
          emerald: 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 border-emerald-400',
          amber: 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 border-amber-400',
          rose: 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/25 border-rose-400',
          cyan: 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25 border-cyan-400',
          violet: 'bg-violet-500 text-white font-bold shadow-md shadow-violet-500/25 border-violet-400'
        };
        const colorClass = colorMap[accentColor] || colorMap['sky'];'''

pattern_color = r"const colorClass = accentColor === 'sky'[\s\S]*?border-indigo-400';"
html = re.sub(pattern_color, color_map_code.strip(), html, count=1)

# 也優化 pillActiveClass
pill_map_code = '''      const pillMap = {
        sky: 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25 border-sky-400',
        indigo: 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/25 border-indigo-400',
        emerald: 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 border-emerald-400',
        amber: 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 border-amber-400',
        rose: 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/25 border-rose-400',
        cyan: 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25 border-cyan-400',
        violet: 'bg-violet-500 text-white font-bold shadow-md shadow-violet-500/25 border-violet-400'
      };
      const pillActiveClass = pillMap[accentColor] || pillMap['sky'];'''

pattern_pill = r"const pillActiveClass = accentColor === 'sky'[\s\S]*?border-emerald-400';"
html = re.sub(pattern_pill, pill_map_code.strip(), html, count=1)

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated getJumpPlotInfo and color styling in index.html successfully!')
