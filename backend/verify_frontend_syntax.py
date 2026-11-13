# -*- coding: utf-8 -*-
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import re

with open(r'H:\我的雲端硬碟\Fuzzy-Learning-Platform\frontend\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script.*?>([\s\S]*?)</script>', html)
s = scripts[7]

# 移除單行與多行註解
clean = re.sub(r'//.*', '', s)
clean = re.sub(r'/\*[\s\S]*?\*/', '', clean)
# 移除模板字串與一般字串
clean = re.sub(r'`[\s\S]*?`', '""', clean)
clean = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', clean)
clean = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", clean)

print("純 JS 語法結構檢驗：")
print("  Curly 大括號平衡:", clean.count('{') - clean.count('}'))
print("  Paren 圓括號平衡:", clean.count('(') - clean.count(')'))
print("  Bracket 方括號平衡:", clean.count('[') - clean.count(']'))
