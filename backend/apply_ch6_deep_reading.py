"""
自動將《認識 Fuzzy》第 6 章（共 16 頁，6-1 ~ 6-16）的全真 OCR 深度萃取內容
寫入 frontend/course_data.json、frontend/course_data.js，並重新生成 frontend/book_pages.js。
"""

import os
import sys
import json
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = r"H:\我的雲端硬碟\Fuzzy-Learning-Platform"
COURSE_DATA_JSON = os.path.join(PROJECT_ROOT, "frontend", "course_data.json")
COURSE_DATA_JS = os.path.join(PROJECT_ROOT, "frontend", "course_data.js")
SCAN_SCRIPT = os.path.join(PROJECT_ROOT, "backend", "scan_book_photos.py")
PYTHON_EXE = r"C:\Strawberry\c\lib\python3.9\venv\scripts\nt\python.exe"

def fix_json_escapes(raw_text):
    out = []
    in_string = False
    i = 0
    n = len(raw_text)
    while i < n:
        c = raw_text[i]
        if c == '"':
            bs_count = 0
            j = i - 1
            while j >= 0 and raw_text[j] == '\\':
                bs_count += 1
                j -= 1
            if bs_count % 2 == 0:
                in_string = not in_string
            out.append(c)
            i += 1
        elif c == '\\' and in_string:
            if i + 1 < n and raw_text[i+1] == '\\':
                out.append('\\\\')
                i += 2
            elif i + 1 < n and raw_text[i+1] == '"':
                out.append('\\"')
                i += 2
            elif i + 1 < n and raw_text[i+1] in ('n', 'r', 't') and (i + 2 < n and raw_text[i+2] not in (' ', '\t', '\r', '\n', '$', '\\', '"', '{', '}', ',', ':', ';')):
                out.append('\\\\')
                i += 1
            elif i + 1 < n and raw_text[i+1] in ('b', 'f'):
                out.append('\\\\')
                i += 1
            else:
                out.append('\\\\')
                i += 1
        elif in_string and c in ('\n', '\r'):
            if c == '\n':
                out.append('\\n')
            i += 1
        else:
            out.append(c)
            i += 1
    return "".join(out)

def run_update():
    # 1. 從 Subagent (6-1 ~ 6-16) 讀取資料
    sub_log = r"C:\Users\aaron\.gemini\antigravity\brain\5972f7f6-f413-4853-9331-b48c21ec1651\.system_generated\logs\transcript_full.jsonl"
    all_ch6_pages = []
    with open(sub_log, 'r', encoding='utf-8') as f:
        for line in reversed(f.readlines()):
            d = json.loads(line)
            for call in d.get('tool_calls', []):
                if call.get('name') == 'send_message' or call.get('tool_name') == 'send_message':
                    raw_msg = (call.get('args') or call.get('parameters', {})).get('Message', '')
                    fixed = fix_json_escapes(raw_msg)
                    all_ch6_pages = json.loads(fixed)
                    break
            if all_ch6_pages:
                break

    print(f"Total Ch6 pages collected: {len(all_ch6_pages)}")
    if not all_ch6_pages:
        print("Error: No pages found from subagent transcript.")
        sys.exit(1)

    ch6_dict = {p['page_id']: p for p in all_ch6_pages}

    # 2. 讀取並更新 frontend/course_data.json
    print("1. 讀取 course_data.json...")
    with open(COURSE_DATA_JSON, 'r', encoding='utf-8') as f:
        course_data = json.load(f)

    updated_count = 0
    existing_page_ids = set()

    if 'all_book_pages' in course_data:
        for item in course_data['all_book_pages']:
            pid = item.get('page_id')
            existing_page_ids.add(pid)
            if pid in ch6_dict:
                meta = ch6_dict[pid]
                item['section'] = meta['section']
                item['title'] = meta['title']
                item['summary'] = meta['summary']
                item['formulas'] = meta['formulas']
                item['book_examples'] = meta.get('book_examples', [])
                item['exam_focus'] = meta.get('exam_focus', '')
                item['notes'] = meta.get('notes', '')
                item['chapter_title'] = "第 6 章：模糊關係"
                updated_count += 1

        for pid, meta in ch6_dict.items():
            if pid not in existing_page_ids:
                new_item = {
                    "page_id": pid,
                    "chapter": 6,
                    "chapter_title": "第 6 章：模糊關係",
                    "section": meta['section'],
                    "title": meta['title'],
                    "summary": meta['summary'],
                    "formulas": meta['formulas'],
                    "book_examples": meta.get('book_examples', []),
                    "exam_focus": meta.get('exam_focus', ''),
                    "notes": meta.get('notes', ''),
                    "source_file": f"../materials/book_photos/chapter6_photos/{pid}.jpg"
                }
                course_data['all_book_pages'].append(new_item)
                updated_count += 1

    print(f"all_book_pages 已更新/補入 {updated_count} 頁 (Ch6)。")

    with open(COURSE_DATA_JSON, 'w', encoding='utf-8') as f:
        json.dump(course_data, f, ensure_ascii=False, indent=2)
    print("✅ 已成功寫回 frontend/course_data.json")

    # 3. 更新 frontend/course_data.js
    js_content = f"window.FUZZY_COURSE_DATA = {json.dumps(course_data, ensure_ascii=False, indent=2)};\n"
    with open(COURSE_DATA_JS, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("✅ 已成功更新 frontend/course_data.js")

    # 4. 更新 backend/scan_book_photos.py 中的章名定義
    with open(SCAN_SCRIPT, 'r', encoding='utf-8') as f:
        scan_code = f.read()
    if '6: "第 6 章：模糊控制器基本架構與原理"' in scan_code:
        scan_code = scan_code.replace('6: "第 6 章：模糊控制器基本架構與原理"', '6: "第 6 章：模糊關係"')
        with open(SCAN_SCRIPT, 'w', encoding='utf-8') as f:
            f.write(scan_code)
        print("✅ 已更新 scan_book_photos.py 之第 6 章真實章名：第 6 章：模糊關係")

    # 5. 重新執行 scan_book_photos.py 產生規範化的 book_pages.js
    print("2. 重新執行 scan_book_photos 產生規範化的 book_pages.js...")
    res = subprocess.run([PYTHON_EXE, SCAN_SCRIPT], capture_output=True, text=True, encoding='utf-8')
    print(res.stdout)
    if res.stderr:
        print("Stderr:", res.stderr)

    print("✅ Chapter 6 深度精讀內容已全面成功更新！")

if __name__ == '__main__':
    run_update()
