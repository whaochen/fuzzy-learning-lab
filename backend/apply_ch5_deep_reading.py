"""
自動將《認識 Fuzzy》第 5 章（共 31 頁，5-1 ~ 5-31）的全真 OCR 深度萃取內容
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

# 輔助函式：修復含有未跳脫反斜線之 JSON 字串
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

# 1. 從 Subagent 1 (5-1 ~ 5-15) 讀取資料
sub1_log = r"C:\Users\aaron\.gemini\antigravity\brain\6087d6b9-8d6d-412a-8982-52cd3e98f998\.system_generated\logs\transcript_full.jsonl"
data1 = []
with open(sub1_log, 'r', encoding='utf-8') as f:
    for line in reversed(f.readlines()):
        d = json.loads(line)
        for call in d.get('tool_calls', []):
            if call.get('name') == 'send_message' or call.get('tool_name') == 'send_message':
                raw_msg = (call.get('args') or call.get('parameters', {})).get('Message', '')
                fixed = fix_json_escapes(raw_msg)
                data1 = json.loads(fixed)
                break
        if data1:
            break

# 2. 從 Subagent 2 (5-16 ~ 5-31) 讀取資料
sub2_log = r"C:\Users\aaron\.gemini\antigravity\brain\5a2ed157-3da8-4a2b-a521-d9248c15be05\.system_generated\logs\transcript_full.jsonl"
data2 = []
with open(sub2_log, 'r', encoding='utf-8') as f:
    for line in reversed(f.readlines()):
        d = json.loads(line)
        for call in d.get('tool_calls', []):
            if call.get('name') == 'send_message' or call.get('tool_name') == 'send_message':
                raw_msg = (call.get('args') or call.get('parameters', {})).get('Message', '')
                fixed = fix_json_escapes(raw_msg)
                data2 = json.loads(fixed)
                break
        if data2:
            break

all_ch5_pages = data1 + data2
print(f"Total Ch5 pages collected: {len(all_ch5_pages)} (Part 1: {len(data1)}, Part 2: {len(data2)})")

ch5_dict = {p['page_id']: p for p in all_ch5_pages}

# 3. 讀取並更新 frontend/course_data.json
print("1. 讀取 course_data.json...")
with open(COURSE_DATA_JSON, 'r', encoding='utf-8') as f:
    course_data = json.load(f)

updated_count = 0
existing_page_ids = set()

if 'all_book_pages' in course_data:
    for item in course_data['all_book_pages']:
        pid = item.get('page_id')
        existing_page_ids.add(pid)
        if pid in ch5_dict:
            meta = ch5_dict[pid]
            item['section'] = meta['section']
            item['title'] = meta['title']
            item['summary'] = meta['summary']
            item['formulas'] = meta['formulas']
            item['book_examples'] = meta.get('book_examples', [])
            item['exam_focus'] = meta.get('exam_focus', '')
            item['notes'] = meta.get('notes', '')
            item['chapter_title'] = "第 5 章：模糊數之算術"
            updated_count += 1

    # 若有未存在者，則補上
    for pid, meta in ch5_dict.items():
        if pid not in existing_page_ids:
            new_item = {
                "page_id": pid,
                "chapter": 5,
                "chapter_title": "第 5 章：模糊數之算術",
                "section": meta['section'],
                "title": meta['title'],
                "summary": meta['summary'],
                "formulas": meta['formulas'],
                "book_examples": meta.get('book_examples', []),
                "exam_focus": meta.get('exam_focus', ''),
                "notes": meta.get('notes', ''),
                "source_file": f"../materials/book_photos/chapter5_photos/{pid}.jpg"
            }
            course_data['all_book_pages'].append(new_item)
            updated_count += 1

print(f"all_book_pages 已更新/補入 {updated_count} 頁 (Ch5)。")

with open(COURSE_DATA_JSON, 'w', encoding='utf-8') as f:
    json.dump(course_data, f, ensure_ascii=False, indent=2)
print("✅ 已成功寫回 frontend/course_data.json")

# 4. 更新 frontend/course_data.js
js_content = f"window.FUZZY_COURSE_DATA = {json.dumps(course_data, ensure_ascii=False, indent=2)};\n"
with open(COURSE_DATA_JS, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("✅ 已成功更新 frontend/course_data.js")

# 5. 重新執行 scan_book_photos 產生規範化的 book_pages.js
print("2. 重新執行 scan_book_photos 產生規範化的 book_pages.js...")
python_exe = sys.executable
res = subprocess.run([python_exe, SCAN_SCRIPT], capture_output=True, text=True, encoding='utf-8')
print(res.stdout)
if res.stderr:
    print("Stderr:", res.stderr)

print("✅ Chapter 5 深度精讀內容已全面成功更新！")
