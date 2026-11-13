# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'id="book-photo-modal"' in l:
        print('Found modal at line', i+1)
        for j in range(i, min(i+100, len(lines))):
            print(f'{j+1}: {lines[j]}', end='')
        break
