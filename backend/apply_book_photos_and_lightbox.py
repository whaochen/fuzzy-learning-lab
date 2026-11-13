# -*- coding: utf-8 -*-
"""
更新 index.html：
1. 引入 book_pages.js
2. 升級燈箱 (Lightbox Modal) 支援滾輪縮放 (Wheel Zoom)、平移拖曳與縮放工具列
3. 讓 renderParentBookGallery 直接使用 window.BOOK_PHOTOS
4. 移除舊有的重複覆蓋函式 (renderChapter34 / renderChapter56 legacy)
5. 匯出縮放控制函式至 window
"""
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

INDEX_HTML_PATH = 'h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html'

with open(INDEX_HTML_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

print("1. 引入 book_pages.js...")
if '<script src="book_pages.js"></script>' not in html:
    html = html.replace(
        '<script src="course_data.js"></script>',
        '<script src="course_data.js"></script>\n  <script src="book_pages.js"></script>'
    )

print("2. 升級 Lightbox Modal (加入縮放工具列、拖曳容器與滾輪提示)...")
old_modal_start = '<div id="book-photo-modal" onclick="closeBookPhotoModal(event)" class="fixed inset-0 z-50 hidden bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6">'
pattern_modal = r'<div id="book-photo-modal"[\s\S]*?<!-- 頁尾 -->'

new_modal_html = r'''<div id="book-photo-modal" onclick="closeBookPhotoModal(event)" class="fixed inset-0 z-50 hidden bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
    <div class="glass-panel rounded-3xl max-w-5xl w-full max-h-[96vh] flex flex-col border border-sky-500/40 overflow-hidden shadow-2xl relative" onclick="event.stopPropagation()">
      <!-- 頂部工具列 -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800 bg-slate-900/95">
        <div class="flex items-center gap-3">
          <span id="modal-page-counter" class="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 font-mono font-bold text-xs border border-sky-500/35 shrink-0">第 1 / 282 頁</span>
          <div class="min-w-0">
            <span id="modal-page-badge" class="text-xs font-bold uppercase tracking-wider text-slate-400 block truncate">《認識 Fuzzy》頁 1-1</span>
            <h4 id="modal-page-title" class="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">章節標題</h4>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- 快速跳轉選單 -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-400 hidden lg:inline">跳轉：</span>
            <select id="modal-page-select" onchange="openBookPhotoModal(this.value)" class="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-400 max-w-[120px] sm:max-w-[170px]">
            </select>
          </div>

          <!-- 上一頁 / 下一頁 按鈕 -->
          <button onclick="prevBookPhotoModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1 transition" title="上一頁 (鍵盤 ← 鍵)">
            <span>❮</span>
            <span class="hidden sm:inline">上一頁</span>
          </button>
          <button onclick="nextBookPhotoModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1 transition" title="下一頁 (鍵盤 → 鍵)">
            <span class="hidden sm:inline">下一頁</span>
            <span>❯</span>
          </button>

          <!-- 滾輪縮放控制器 (Wheel Zoom) -->
          <div class="flex items-center gap-1 bg-slate-950/90 px-2 py-1 rounded-xl border border-slate-700">
            <button onclick="zoomOutModal()" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold transition flex items-center justify-center" title="縮小 (滾輪向下或 - 鍵)">－</button>
            <button onclick="resetModalZoom()" id="modal-zoom-pill" class="text-xs font-mono text-sky-400 font-bold px-1.5 hover:text-white" title="點擊重設 100%">100%</button>
            <button onclick="zoomInModal()" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold transition flex items-center justify-center" title="放大 (滾輪向上或 + 鍵)">＋</button>
            <button onclick="resetModalZoom()" class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="重設原尺寸 (0 鍵)">1:1</button>
          </div>

          <!-- 手動上傳圖檔備援 -->
          <label class="cursor-pointer px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold transition" title="手動更換此頁圖檔">
            <span>📂</span>
            <span class="hidden sm:inline ml-1">備援</span>
            <input type="file" accept="image/*" class="hidden" onchange="handleManualPhotoUpload(event)" />
          </label>

          <!-- 關閉按鈕 -->
          <button onclick="closeBookPhotoModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/30 text-slate-200 hover:text-rose-200 text-xs sm:text-sm font-bold transition" title="關閉預覽 (Esc 鍵)">
            ✕
          </button>
        </div>
      </div>

      <!-- 中間圖片檢視區 (支援滑鼠滾輪縮放與按住拖曳) -->
      <div id="modal-img-container" class="p-3 sm:p-5 overflow-hidden flex-1 flex flex-col items-center justify-center gap-3 bg-slate-950 relative cursor-grab">
        <!-- 浮動上一頁按鈕 (大螢幕滑鼠懸停) -->
        <button onclick="prevBookPhotoModal()" class="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-sky-600 text-white items-center justify-center text-xl shadow-2xl border border-slate-700/80 transition backdrop-blur z-20 hover:scale-110 active:scale-95" title="上一頁 (鍵盤 ← 鍵)">
          ❮
        </button>

        <!-- 浮動下一頁按鈕 (大螢幕滑鼠懸停) -->
        <button onclick="nextBookPhotoModal()" class="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-sky-600 text-white items-center justify-center text-xl shadow-2xl border border-slate-700/80 transition backdrop-blur z-20 hover:scale-110 active:scale-95" title="下一頁 (鍵盤 → 鍵)">
          ❯
        </button>

        <!-- 書頁大圖 (支援 transform scale & translate) -->
        <div class="w-full h-full flex items-center justify-center overflow-hidden">
          <img id="modal-page-img" src="" alt="書頁原圖"
            onload="document.getElementById('modal-img-fallback').classList.add('hidden'); this.classList.remove('hidden');"
            onerror="this.classList.add('hidden'); document.getElementById('modal-img-fallback').classList.remove('hidden');"
            class="max-h-[72vh] w-auto rounded-xl border border-slate-800 shadow-2xl object-contain mx-auto transition-transform duration-100 origin-center pointer-events-auto" />
        </div>

        <!-- 找不到圖檔時之備援提示 -->
        <div id="modal-img-fallback" class="hidden w-full max-w-xl rounded-2xl border border-amber-500/40 bg-amber-950/30 p-6 text-center space-y-4 my-auto">
          <div class="text-3xl">🖼️</div>
          <div class="text-base font-bold text-amber-300">找不到或無法直接預覽原書照片圖檔</div>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            預期相對路徑：<code id="modal-expected-path" class="px-2 py-0.5 rounded bg-slate-900 text-sky-300 font-mono">../materials/book_photos/chapter1_photos/1-1.jpg</code>
          </p>
          <div class="pt-2">
            <label class="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-sky-500/20">
              <span>📂 點此從電腦選擇該張書頁照片載入預覽</span>
              <input type="file" accept="image/*" class="hidden" onchange="handleManualPhotoUpload(event)" />
            </label>
          </div>
        </div>

        <!-- 書頁摘要導讀與滾輪操作提示 -->
        <div class="w-full max-w-3xl text-center space-y-1 pt-1">
          <p id="modal-page-caption" class="text-xs sm:text-sm text-slate-300 leading-relaxed truncate"></p>
          <div class="text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-2.5">
            <span>🖱️ <strong>滑鼠滾輪直接縮放</strong></span>
            <span>•</span>
            <span>✋ <strong>放大後可按住滑鼠拖曳平移</strong></span>
            <span>•</span>
            <span>⌨️ 鍵盤 <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">←</kbd> / <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">→</kbd> 翻頁</span>
            <span>•</span>
            <span><kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">+</kbd>/<kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">-</kbd> 縮放</span>
            <span>•</span>
            <span><kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">Esc</kbd> 關閉</span>
          </div>
        </div>
      </div>
    </div>
  </div>\n\n  <!-- 頁尾 -->'''

html = re.sub(pattern_modal, new_modal_html, html, count=1)

print("3. 更新 JavaScript: 加入滾輪縮放狀態、事件監聽與相依函式...")
zoom_logic_js = r'''    // =========================================================================
    // 原書全螢幕燈箱縮放 (Wheel Zoom & Pan) 狀態與函式
    // =========================================================================
    let modalZoomScale = 1.0;
    let modalPanX = 0;
    let modalPanY = 0;
    let isModalPanning = false;
    let startPanX = 0;
    let startPanY = 0;

    function applyModalTransform() {
      const imgEl = document.getElementById('modal-page-img');
      const pillEl = document.getElementById('modal-zoom-pill');
      if (imgEl) {
        imgEl.style.transform = `scale(${modalZoomScale}) translate(${modalPanX}px, ${modalPanY}px)`;
      }
      if (pillEl) {
        pillEl.textContent = `${Math.round(modalZoomScale * 100)}%`;
      }
    }

    function setModalZoom(scale) {
      modalZoomScale = Math.max(0.6, Math.min(4.0, scale));
      if (modalZoomScale <= 1.0) {
        modalPanX = 0;
        modalPanY = 0;
      }
      applyModalTransform();
      const container = document.getElementById('modal-img-container');
      if (container) {
        container.style.cursor = modalZoomScale > 1.0 ? 'grab' : 'default';
      }
    }

    function zoomInModal() {
      setModalZoom(modalZoomScale + 0.25);
    }

    function zoomOutModal() {
      setModalZoom(modalZoomScale - 0.25);
    }

    function resetModalZoom() {
      modalZoomScale = 1.0;
      modalPanX = 0;
      modalPanY = 0;
      applyModalTransform();
      const container = document.getElementById('modal-img-container');
      if (container) {
        container.style.cursor = 'default';
      }
    }

    function setupModalZoomEvents() {
      const container = document.getElementById('modal-img-container');
      if (!container) return;

      // 滾輪縮放
      container.addEventListener('wheel', function(e) {
        const modal = document.getElementById('book-photo-modal');
        if (!modal || modal.classList.contains('hidden')) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setModalZoom(modalZoomScale + delta);
      }, { passive: false });

      // 按住拖曳平移
      container.addEventListener('mousedown', function(e) {
        if (modalZoomScale > 1.0) {
          isModalPanning = true;
          startPanX = e.clientX - modalPanX;
          startPanY = e.clientY - modalPanY;
          container.style.cursor = 'grabbing';
          e.preventDefault();
        }
      });

      window.addEventListener('mousemove', function(e) {
        if (isModalPanning) {
          modalPanX = e.clientX - startPanX;
          modalPanY = e.clientY - startPanY;
          applyModalTransform();
        }
      });

      window.addEventListener('mouseup', function() {
        if (isModalPanning) {
          isModalPanning = false;
          const c = document.getElementById('modal-img-container');
          if (c) c.style.cursor = modalZoomScale > 1.0 ? 'grab' : 'default';
        }
      });
    }'''

# 在 renderModalPage 之前插入縮放邏輯
pattern_insert_zoom = r"(function renderModalPage\(idx\) \{)"
html = re.sub(pattern_insert_zoom, zoom_logic_js + "\n\n    \\1", html, count=1)

# 在 renderModalPage 內加入 resetModalZoom()
html = re.sub(
    r"function renderModalPage\(idx\) \{",
    "function renderModalPage(idx) {\n      resetModalZoom();",
    html,
    count=1
)

# 註冊鍵盤縮放快捷鍵 (+, -, 0)
pattern_keydown = r"(if \(e\.key === 'ArrowLeft'\) \{[\s\S]*?closeBookPhotoModal\(\);\s*\})"
new_keydown = r'''if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevBookPhotoModal();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextBookPhotoModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeBookPhotoModal();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomInModal();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOutModal();
      } else if (e.key === '0') {
        e.preventDefault();
        resetModalZoom();
      }'''
html = re.sub(pattern_keydown, new_keydown, html, count=1)

# 4. 優化 getBookPagesList 與 getChaptersCatalogList 優先使用 window.BOOK_PHOTOS_ALL 與 window.BOOK_CATALOG
new_get_pages = r'''    function getBookPagesList() {
      if (window.BOOK_PHOTOS_ALL && Array.isArray(window.BOOK_PHOTOS_ALL) && window.BOOK_PHOTOS_ALL.length > 0) {
        return window.BOOK_PHOTOS_ALL;
      }
      if (window.BOOK_PAGES && Array.isArray(window.BOOK_PAGES) && window.BOOK_PAGES.length > 0) {
        return window.BOOK_PAGES;
      }
      if (window.FUZZY_COURSE_DATA && Array.isArray(window.FUZZY_COURSE_DATA.all_book_pages)) {
        return window.FUZZY_COURSE_DATA.all_book_pages;
      }
      return [];
    }

    function getChaptersCatalogList() {
      if (window.BOOK_CATALOG && Array.isArray(window.BOOK_CATALOG) && window.BOOK_CATALOG.length > 0) {
        return window.BOOK_CATALOG;
      }
      if (window.CHAPTERS_CATALOG && Array.isArray(window.CHAPTERS_CATALOG) && window.CHAPTERS_CATALOG.length > 0) {
        return window.CHAPTERS_CATALOG;
      }
      if (window.FUZZY_COURSE_DATA && Array.isArray(window.FUZZY_COURSE_DATA.chapters_catalog)) {
        return window.FUZZY_COURSE_DATA.chapters_catalog;
      }
      return [];
    }'''

pattern_get_lists = r"function getBookPagesList\(\) \{[\s\S]*?return \[\];\s*\}"
html = re.sub(pattern_get_lists, new_get_pages, html, count=1)

# 5. 更新 getBookPageImagePath 優先讀取 relative_path 確保零破圖
new_img_path = r'''    function getBookPageImagePath(p) {
      if (!p) return '';
      if (customUploadedPhotos[p.page_id]) return customUploadedPhotos[p.page_id];
      if (p.relative_path) return p.relative_path;
      if (p.source_file) return p.source_file;
      if (p.image_path) return p.image_path;
      const ch = p.chapter || (p.page_id ? p.page_id.split('-')[0] : '1');
      return `../materials/book_photos/chapter${ch}_photos/${p.file_name || (p.page_id + '.jpg')}`;
    }'''
pattern_img_path = r"function getBookPageImagePath\(p\) \{[\s\S]*?return `\.\./materials/book_photos/chapter\$\{ch\}_photos/\$\{p\.file_name \|\| \(\{p\.page_id \+ '\.jpg'\)\}`;\s*\}"
html = re.sub(pattern_img_path, new_img_path, html, count=1)

# 6. 更新 renderParentBookGallery：直接使用 window.BOOK_PHOTOS['ch' + activeSubCh]
pattern_subch_pages = r"// 2\. 當前子章節之書頁\s*const allBookPages = getBookPagesList\(\);\s*const chapterPages = allBookPages\.filter\(p => p\.chapter === activeSubCh\);"
new_subch_pages = r'''// 2. 當前子章節之書頁 (直接讀取自然排序之 window.BOOK_PHOTOS)
      const chKey = 'ch' + activeSubCh;
      let chapterPages = (window.BOOK_PHOTOS && window.BOOK_PHOTOS[chKey]) ? window.BOOK_PHOTOS[chKey] : null;
      if (!chapterPages || !chapterPages.length) {
        const allBookPages = getBookPagesList();
        chapterPages = allBookPages.filter(p => p.chapter === activeSubCh);
      }'''
html = re.sub(pattern_subch_pages, new_subch_pages, html, count=1)

# 7. 移除舊有重複覆蓋的 renderChapter34 / renderChapter56 (從 line 2046 到 renderChapterNav 之前)
pattern_legacy_dup = r"// =========================================================================\s*// 《認識 Fuzzy》第 3、4 章（頁 3-1 ～ 4-6）[\s\S]*?// =========================================================================\s*// 主導覽列渲染與章節切換"
html = re.sub(pattern_legacy_dup, "// =========================================================================\n    // 主導覽列渲染與章節切換", html, count=1)

# 8. 匯出縮放函式與呼叫 setupModalZoomEvents
new_exports_window = r'''    window.zoomInModal = zoomInModal;
    window.zoomOutModal = zoomOutModal;
    window.resetModalZoom = resetModalZoom;
    window.setModalZoom = setModalZoom;
    window.setupModalZoomEvents = setupModalZoomEvents;
    window.selectChapter = selectChapter;'''
html = re.sub(r"window\.selectChapter\s*=\s*selectChapter;", new_exports_window, html, count=1)

# 在 initApp 內初始化 setupModalZoomEvents
html = re.sub(
    r"function initApp\(\) \{",
    "function initApp() {\n      try { setupModalZoomEvents(); } catch(e) { console.warn(e); }",
    html,
    count=1
)

with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html successfully updated with book_pages.js and wheel zoom Lightbox!")
