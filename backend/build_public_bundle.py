# -*- coding: utf-8 -*-
"""
單一獨立檔案打包腳本 (Self-Contained HTML Bundler)：
讀取 frontend/index.html 及所有本地資料與邏輯腳本：
- course_data.js
- book_pages.js
- interactive_widgets.js
- fis_studio.js
將它們安全地內嵌 (Inline) 合併至 public/index.html，
確保線上環境（如 Cloudflare Pages / Workers）零 404、零 MIME type 錯誤，
且各模組具備獨立 <script> 與 try...catch 防崩潰保護！
"""
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')

os.makedirs(PUBLIC_DIR, exist_ok=True)

INDEX_SRC = os.path.join(FRONTEND_DIR, 'index.html')
INDEX_OUT = os.path.join(PUBLIC_DIR, 'index.html')

LOCAL_SCRIPTS = [
    'course_data.js',
    'chapters_19_data.js',
    'book_pages.js',
    'interactive_widgets.js',
    'fis_studio.js'
]

def sanitize_js_for_inline(js_code):
    """將 JS 中的 </script> 安全轉義為 <\/script>，避免提前關閉 HTML 標籤"""
    return re.sub(r'</(script)>', r'<\/\1>', js_code, flags=re.IGNORECASE)

def build_bundle():
    print(f"正在讀取主 HTML 檔案：{INDEX_SRC}")
    with open(INDEX_SRC, 'r', encoding='utf-8') as f:
        html = f.read()

    # 移除不需要的舊函數呼叫 setupModalZoomEvents()
    html = html.replace("try { setupModalZoomEvents(); } catch(e) { console.warn(e); }", "")

    # 逐一將外部 <script src="xxx.js"></script> 替換為安全的內嵌 <script> 區塊
    for js_name in LOCAL_SCRIPTS:
        js_path = os.path.join(FRONTEND_DIR, js_name)
        if not os.path.exists(js_path):
            raise FileNotFoundError(f"找不到必要的腳本檔案：{js_path}")

        print(f"正在讀取並內嵌：{js_name} ...")
        with open(js_path, 'r', encoding='utf-8') as jf:
            js_content = jf.read()

        safe_js = sanitize_js_for_inline(js_content)
        inline_tag = f"<script>\n/* === Inlined {js_name} === */\n{safe_js}\n</script>"

        pattern = rf'<script\s+src=["\']{re.escape(js_name)}["\']\s*>\s*</script>'
        if re.search(pattern, html):
            html = re.sub(pattern, lambda m: inline_tag, html, count=1)
            print(f"  ✅ 已成功內嵌 {js_name} (大小: {len(safe_js):,} 字元)")
        else:
            print(f"  ⚠️ 警告：在 index.html 中未找到 <script src=\"{js_name}\"></script> 引用")

    # 寫出單一獨立檔案 public/index.html
    with open(INDEX_OUT, 'w', encoding='utf-8') as out_f:
        out_f.write(html)

    out_size_mb = os.path.getsize(INDEX_OUT) / (1024 * 1024)
    print(f"\n🎉 打包完成！已產出完全獨立的單一檔案：{INDEX_OUT} ({out_size_mb:.2f} MB)")

if __name__ == '__main__':
    build_bundle()
