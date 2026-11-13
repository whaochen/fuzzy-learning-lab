# -*- coding: utf-8 -*-
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import json
import re

with open(r'H:\我的雲端硬碟\Fuzzy-Learning-Platform\frontend\book_pages.js', 'r', encoding='utf-8') as f:
    text = f.read()

print('Curly balance:', text.count('{') - text.count('}'))
print('Bracket balance:', text.count('[') - text.count(']'))
print('Paren balance:', text.count('(') - text.count(')'))

m = re.search(r'"ch2":\s*(\[[\s\S]*?\n\s*\]),\s*"ch3"', text)
if m:
    ch2_data = json.loads(m.group(1))
    print('ch2 pages count:', len(ch2_data))
    for p in ch2_data:
        print(f"Page {p['page_id']}: {p['section']} | {p['title']} (formulas: {len(p.get('formulas', []))}, examples: {len(p.get('book_examples', []))})")
else:
    print('ch2 not found!')
