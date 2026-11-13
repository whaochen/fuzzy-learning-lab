# -*- coding: utf-8 -*-
"""
照片掃描與整理腳本：
1. 掃描專案資料夾內所有圖片檔案 (.jpg, .jpeg, .png, .webp)
2. 依照章節與頁碼進行 Natural Sort 自然排序 (如 2-2 在 2-10 前面)
3. 計算相對於 frontend/index.html 的相對路徑
4. 輸出 frontend/book_pages.js，定義 window.BOOK_PHOTOS, window.BOOK_PHOTOS_ALL, window.BOOK_CATALOG
"""
import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')
BOOK_PAGES_JS = os.path.join(FRONTEND_DIR, 'book_pages.js')
COURSE_DATA_JSON = os.path.join(FRONTEND_DIR, 'course_data.json')

IMG_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')

# 專書 19 大章節標題對照表
BOOK_CHAPTER_TITLES = {
    1: "第 1 章：緒論與模糊邏輯起源",
    2: "第 2 章：模糊集合理論與基礎定義",
    3: "第 3 章：模糊集合之基本運算與擴展原理",
    4: "第 4 章：模糊集合之運算",
    5: "第 5 章：模糊數之算術",
    6: "第 6 章：模糊關係",
    7: "第 7 章：模糊控制洗衣機系統設計",
    8: "第 8 章：模糊控制冷氣空調溫控系統",
    9: "第 9 章：模糊控制攝錄影機防手震與對焦",
    10: "第 10 章：模糊控制吸塵器與家電系統",
    11: "第 11 章：類神經網路與模糊邏輯整合 (ANFIS)",
    12: "第 12 章：模糊分群分析與分類演算法",
    13: "第 13 章：模糊決策與最佳化分析",
    14: "第 14 章：多屬性模糊綜合評判分析",
    15: "第 15 章：模糊微處理機與硬體架構",
    16: "第 16 章：模糊圖形識別與影像處理",
    17: "第 17 章：倒單擺非線性平衡控制實務",
    18: "第 18 章：汽車防鎖死煞車與循跡控制",
    19: "第 19 章：模糊理論未來展望與綜合回顧"
}

# 19 個專書章節歸屬至 7 大核心學習篇章
PARENT_CHAPTER_MAPPING = {
    1: "fuzzy_sets",
    2: "fuzzy_sets",
    3: "fuzzy_numbers_extension",
    4: "fuzzy_relations_inference",
    5: "fuzzy_relations_inference",
    6: "fuzzy_relations_inference",
    7: "fuzzy_control_applications",
    8: "fuzzy_control_applications",
    9: "fuzzy_control_applications",
    10: "fuzzy_control_applications",
    11: "advanced_fuzzy_neuro",
    12: "fuzzy_clustering_pattern",
    13: "fuzzy_decision_evaluation",
    14: "fuzzy_decision_evaluation",
    15: "advanced_fuzzy_neuro",
    16: "fuzzy_clustering_pattern",
    17: "advanced_fuzzy_neuro",
    18: "advanced_fuzzy_neuro",
    19: "advanced_fuzzy_neuro"
}

def natural_sort_key(s):
    """自然排序 key：將字串中的數字轉為 int 比對，確保 2-2 排在 2-10 前面"""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def scan_all_book_photos():
    print(f"正在掃描專案目錄：{PROJECT_ROOT}")
    
    existing_meta = {}
    if os.path.exists(COURSE_DATA_JSON):
        try:
            with open(COURSE_DATA_JSON, 'r', encoding='utf-8') as f:
                cd = json.load(f)
                for p in cd.get('all_book_pages', []):
                    existing_meta[p.get('page_id')] = p
        except Exception as e:
            print(f"讀取現有 metadata 警告: {e}")

    found_by_chapter = {}
    total_images_count = 0

    for root, dirs, files in os.walk(PROJECT_ROOT):
        if '.git' in root or '.venv' in root or 'node_modules' in root:
            continue
        
        for f in files:
            if f.lower().endswith(IMG_EXTENSIONS):
                full_path = os.path.join(root, f)
                rel_to_project = os.path.relpath(full_path, PROJECT_ROOT).replace('\\', '/')
                rel_to_frontend = os.path.relpath(full_path, FRONTEND_DIR).replace('\\', '/')

                m_ch = re.search(r'chapter(\d+)_photos', rel_to_project, re.IGNORECASE)
                m_page = re.search(r'(\d+)-(\d+)\.(jpg|jpeg|png|webp)', f, re.IGNORECASE)
                
                ch_num = None
                page_sub_num = None
                page_id = None

                if m_ch and m_page:
                    ch_num = int(m_ch.group(1))
                    page_sub_num = int(m_page.group(2))
                    page_id = f"{ch_num}-{page_sub_num}"
                elif m_page:
                    ch_num = int(m_page.group(1))
                    page_sub_num = int(m_page.group(2))
                    page_id = f"{ch_num}-{page_sub_num}"
                elif m_ch:
                    ch_num = int(m_ch.group(1))
                    digits = re.findall(r'\d+', f)
                    page_sub_num = int(digits[0]) if digits else 1
                    page_id = f"{ch_num}-{page_sub_num}"
                else:
                    continue

                if ch_num not in found_by_chapter:
                    found_by_chapter[ch_num] = []

                meta = existing_meta.get(page_id, {})
                title = meta.get('title') or f"《認識 Fuzzy》第 {ch_num} 章 第 {page_sub_num} 頁"
                summary = meta.get('summary') or f"本頁為《認識 Fuzzy》第 {ch_num} 章核心書頁 (頁 {page_id})，包含理論推導、演算法架構與實例圖表。"
                formulas = meta.get('formulas', [])
                book_examples = meta.get('book_examples', [f"對照原書圖表 {f}"])
                parent_id = PARENT_CHAPTER_MAPPING.get(ch_num, "fuzzy_sets")
                chapter_title = BOOK_CHAPTER_TITLES.get(ch_num, f"第 {ch_num} 章")

                item = {
                    "page_id": page_id,
                    "chapter": ch_num,
                    "page_num": page_sub_num,
                    "chapter_title": chapter_title,
                    "parent_chapter_id": parent_id,
                    "file_name": f,
                    "relative_path": rel_to_frontend,
                    "source_file": rel_to_frontend,
                    "image_path": rel_to_frontend,
                    "section": meta.get('section') or f"第 {ch_num} 章 第 {page_sub_num} 頁",
                    "title": title,
                    "summary": summary,
                    "formulas": formulas,
                    "book_examples": book_examples
                }

                found_by_chapter[ch_num].append(item)
                total_images_count += 1

    all_photos_flat = []
    book_photos_obj = {}
    catalog_list = []

    sorted_chapters = sorted(found_by_chapter.keys())
    for ch in sorted_chapters:
        found_by_chapter[ch].sort(key=lambda x: (x['page_num'], natural_sort_key(x['file_name'])))
        book_photos_obj[f"ch{ch}"] = found_by_chapter[ch]
        all_photos_flat.extend(found_by_chapter[ch])
        
        catalog_list.append({
            "ch": ch,
            "title": BOOK_CHAPTER_TITLES.get(ch, f"第 {ch} 章"),
            "parent_chapter_id": PARENT_CHAPTER_MAPPING.get(ch, "fuzzy_sets"),
            "photo_count": len(found_by_chapter[ch]),
            "first_page": found_by_chapter[ch][0]['page_id'],
            "last_page": found_by_chapter[ch][-1]['page_id']
        })

    js_content = f"""/**
 * 《認識 Fuzzy》全書 19 大章節完整書頁照片資料庫 (自動掃描產生)
 * 總章節數: {len(sorted_chapters)} 個章節
 * 總書頁照片數: {total_images_count} 頁
 * 採用自然排序 (Natural Sort) 並計算正確相對路徑，零 CORS 讀取問題
 */

// 1. 各章分類物件 (格式: window.BOOK_PHOTOS.ch1, window.BOOK_PHOTOS.ch2, ...)
window.BOOK_PHOTOS = {json.dumps(book_photos_obj, ensure_ascii=False, indent=2)};

// 2. 全書 282 頁扁平化陣列 (供全螢幕電子書燈箱前後翻頁檢視)
window.BOOK_PHOTOS_ALL = {json.dumps(all_photos_flat, ensure_ascii=False, indent=2)};

// 3. 全書 19 大章節目錄清單 (供 Sub-tabs 與快速導覽)
window.BOOK_CATALOG = {json.dumps(catalog_list, ensure_ascii=False, indent=2)};

// 4. 頁碼快速字典 (依據 page_id 如 "2-4", "10-12" O(1) 查找)
window.BOOK_PHOTOS_BY_PAGE = {{}};
window.BOOK_PHOTOS_ALL.forEach(function(item) {{
  window.BOOK_PHOTOS_BY_PAGE[item.page_id] = item;
}});

// 5. 向下相容支援
window.BOOK_PAGES = window.BOOK_PHOTOS_ALL;
window.CHAPTERS_CATALOG = window.BOOK_CATALOG;

console.log('✅ book_pages.js 已成功載入《認識 Fuzzy》全書照片共 {len(sorted_chapters)} 章、{total_images_count} 頁！');
"""

    with open(BOOK_PAGES_JS, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\n==========================================")
    print(f"🎉 照片掃描完成！輸出至：{BOOK_PAGES_JS}")
    print(f"📚 總共掃描到章節數：{len(sorted_chapters)} 個章節 (第 1 章 ～ 第 19 章)")
    print(f"📸 總共掃描到書頁照片：{total_images_count} 張照片")
    print(f"==========================================")
    for c in catalog_list:
        print(f"  📘 第 {c['ch']:2d} 章：{c['title']} -> {c['photo_count']:2d} 頁 ({c['first_page']} ~ {c['last_page']})")

    return len(sorted_chapters), total_images_count

if __name__ == '__main__':
    scan_all_book_photos()
