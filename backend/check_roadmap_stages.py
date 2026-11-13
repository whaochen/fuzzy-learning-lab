# -*- coding: utf-8 -*-
"""
檢查 index.html 的學習地圖節點與全域變數相依性
"""
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('h:/我的雲端硬碟/Fuzzy-Learning-Platform/frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 檢查 ROADMAP_STAGES 內的所有 stage 與 node id
stages = re.findall(r"stageId:\s*'([^']+)'[\s\S]*?stageNumber:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'", html)
print(f"Total Stages in ROADMAP_STAGES: {len(stages)}")
for st in stages:
    print(f"  {st[1]}: {st[2]}")

node_ids = re.findall(r"id:\s*'(s\d+_n\d+)'", html)
print(f"\nTotal Milestone Nodes in ROADMAP_STAGES: {len(node_ids)}")
print(f"Node IDs: {node_ids}")

# 檢查首頁學習進度百分比、全部解鎖、重置進度
print("\nChecking roadmap actions & buttons:")
for action_btn in ['continueCurrentStage', 'resetRoadmapProgress', 'unlockAllRoadmapStages', 'toggleCurrentNodeComplete']:
    print(f"  {action_btn} defined:", f"function {action_btn}" in html)
