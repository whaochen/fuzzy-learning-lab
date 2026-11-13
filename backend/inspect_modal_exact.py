# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(655, 745):
    if i < len(lines):
        print(f'{i+1}: {lines[i]}', end='')
