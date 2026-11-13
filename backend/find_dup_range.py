# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2015, 2285):
    line = lines[i]
    if 'function renderChapter' in line or 'function renderChapterNav' in line or 'function filterChapter' in line:
        print(f'{i+1}: {line.strip()[:80]}')
