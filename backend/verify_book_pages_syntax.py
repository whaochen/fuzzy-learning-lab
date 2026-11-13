# -*- coding: utf-8 -*-
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import re

with open(r'H:\我的雲端硬碟\Fuzzy-Learning-Platform\frontend\book_pages.js', 'r', encoding='utf-8') as f:
    js_text = f.read()

# 移除註解與字串
clean = re.sub(r'//.*', '', js_text)
clean = re.sub(r'/\*[\s\S]*?\*/', '', clean)
clean = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', clean)

print("book_pages.js 純 JS 語法結構檢驗：")
print("  Curly 大括號平衡:", clean.count('{') - clean.count('}'))
print("  Paren 圓括號平衡:", clean.count('(') - clean.count(')'))
print("  Bracket 方括號平衡:", clean.count('[') - clean.count(']'))
