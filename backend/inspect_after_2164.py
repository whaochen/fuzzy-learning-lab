# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for j in range(2164, min(2300, len(lines))):
    if 'function ' in lines[j] or 'render' in lines[j]:
        print(f'{j+1}: {lines[j].strip()}')
