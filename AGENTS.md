# Fuzzy-Learning-Platform 專案開發規範 (AGENTS.md)

本專案位於 Google Drive 雲端同步資料夾中。為避免大量零碎檔案造成雲端硬碟同步卡頓、I/O 阻塞與 Context 溢位，所有 AI Agent 與開發者在執行任務時，**必須嚴格遵守以下規範**：

---

## 1. 嚴禁在專案目錄內建立虛擬環境與套件目錄
- **禁止建立 `.venv` / `venv` / `env`**：Python 虛擬環境**一律建立在本地家目錄**：
  - Windows: `~\.fuzzy_env` (`C:\Users\<Username>\.fuzzy_env`)
  - macOS / Linux: `~/.fuzzy_env`
- **禁止建立 `node_modules`**：前端一律採用輕量化架構（HTML5 + CDN 引入 Tailwind CSS、Plotly.js、MathJax），不在專案目錄內執行 `npm install` 或建立 `node_modules`。
- **禁止產出大量暫存檔**：`__pycache__`、`.pytest_cache` 等應盡量避免或設定環境變數 `PYTHONDONTWRITEBYTECODE=1`。

### 建立與啟用本地 Python 環境指令範例 (PowerShell)
```powershell
# 於本地家目錄建立虛擬環境
python -m venv "$HOME\.fuzzy_env"

# 安裝專案所需套件
& "$HOME\.fuzzy_env\Scripts\pip.exe" install google-genai pypdf python-pptx pillow pydantic

# 執行教材萃取腳本
& "$HOME\.fuzzy_env\Scripts\python.exe" backend/ingest_materials.py
```

---

## 2. 教材檔案 (`materials/`) 處理與 Context 保護規範
專案下的 `materials/` 包含三類高容量教材資源：
1. `materials/book_photos/`：《認識 Fuzzy》書本每頁拍照圖檔
2. `materials/lecture_audio/`：老師上課錄音檔
3. `materials/other_slides/`：其他學校老師的講義檔案 (PDF / PPTX)

### 嚴格限制：
- **禁止在對話中直接批量讀取**：AI Agent **嚴禁**使用 `read_file` 工具一次讀取 `materials/` 內的所有圖片、音訊或大型簡報檔，以免瞬間塞爆 Context Window 上限。
- **一律透過 Python 腳本批次處理**：所有針對 `materials/` 的 OCR、公式辨識、語音轉錄與講義解析，必須透過 `backend/ingest_materials.py` 呼叫 `google-genai` SDK 與文件解析套件進行批次處理與快取，並將結構化結果輸出至 `frontend/course_data.json`。

---

## 3. 系統架構一覽
- `AGENTS.md`：專案環境與防卡頓最高指導規範。
- `backend/ingest_materials.py`：利用 Gemini 多模態 API (`google-genai`) 及 `pypdf` / `python-pptx` 批次萃取三大教材並合成 `frontend/course_data.json` 的自動化腳本。
- `frontend/course_data.json`：結構化課程資料庫（包含理論章節、課堂錄音重點、迷思解析與隨堂測驗）。
- `frontend/index.html`：結合「基礎理論導讀」、「課堂重點與音訊筆記」與「Fuzzy 互動實驗室」的單頁式教學平台。
