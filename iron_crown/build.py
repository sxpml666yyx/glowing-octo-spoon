#!/usr/bin/env python3
"""
build.py — 铁与王冠 构建脚本
将分散的CSS和JS模块拼接为单一HTML文件，可直接双击打开或部署到GitHub Pages。

用法:
  python build.py              # 输出到 dist/index.html
  python build.py --watch      # 监听文件变化自动重建(需要watchdog)
  python build.py --output X   # 指定输出文件

目录结构:
  src/
    template.html              # HTML骨架(含占位符)
    css/
      01-variables.css         # 全局变量与重置
      02-menu.css              # 主菜单
      03-modal.css             # 弹窗
      04-forms.css             # 表单/按钮
      05-lists.css             # 列表/标签
      06-editor.css            # 编辑器布局
      07-map-entities.css      # 地图实体/通知/响应式
    js/
      01-utils.js              # 工具函数与存储
      02-data.js               # 常量/默认数据
      03-ui.js                 # 通知/弹窗
      04-map-ctrl.js           # 地图缩放控制器
      05-editor-core.js        # 编辑器核心(init/工具/碰撞)
      06-editor-popups.js      # 弹出编辑器(城池/实体)
      07-editor-render.js      # 地图实体渲染
      08-editor-sidebar.js     # 侧边栏渲染
      09-editor-crud.js        # CRUD操作与保存
      10-menu.js               # 主菜单与启动
"""

import os
import sys
import glob
import argparse
from datetime import datetime


def collect_files(directory, ext):
    """按文件名排序收集目录下所有指定扩展名的文件"""
    pattern = os.path.join(directory, f"*{ext}")
    files = sorted(glob.glob(pattern))
    return files


def read_file(path):
    """读取文件内容"""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def build(src_dir="src", output="dist/index.html"):
    """执行构建"""
    # 收集CSS
    css_files = collect_files(os.path.join(src_dir, "css"), ".css")
    css_parts = []
    for f in css_files:
        name = os.path.basename(f)
        css_parts.append(f"/* --- {name} --- */")
        css_parts.append(read_file(f))
    all_css = "\n".join(css_parts)

    # 收集JS
    js_files = collect_files(os.path.join(src_dir, "js"), ".js")
    js_parts = []
    for f in js_files:
        name = os.path.basename(f)
        js_parts.append(f"// --- {name} ---")
        js_parts.append(read_file(f))
    all_js = "\n".join(js_parts)

    # 包裹IIFE
    wrapped_js = f'(function(){{\n"use strict";\n\n{all_js}\n\n}})();'

    # 读取模板
    template = read_file(os.path.join(src_dir, "template.html"))

    # 替换占位符
    html = template.replace("/* === STYLES_PLACEHOLDER === */", all_css)
    html = template.replace("/* === STYLES_PLACEHOLDER === */", all_css)
    html = html.replace("/* === JS_PLACEHOLDER === */", wrapped_js)

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output) if os.path.dirname(output) else ".", exist_ok=True)

    # 写入
    with open(output, "w", encoding="utf-8") as f:
        f.write(html)

    size_kb = os.path.getsize(output) / 1024
    n_css = len(css_files)
    n_js = len(js_files)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] BUILD OK")
    print(f"  CSS: {n_css} files | JS: {n_js} files")
    print(f"  Output: {output} ({size_kb:.1f} KB)")
    return output


def main():
    parser = argparse.ArgumentParser(description="铁与王冠 构建工具")
    parser.add_argument("--src", default="src", help="源码目录 (默认: src)")
    parser.add_argument("--output", "-o", default="dist/index.html", help="输出文件 (默认: dist/index.html)")
    parser.add_argument("--watch", "-w", action="store_true", help="监听文件变化自动重建")
    args = parser.parse_args()

    build(args.src, args.output)

    if args.watch:
        try:
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler

            class RebuildHandler(FileSystemEventHandler):
                def on_modified(self, event):
                    if event.src_path.endswith((".css", ".js", ".html")):
                        print(f"\n  Changed: {event.src_path}")
                        try:
                            build(args.src, args.output)
                        except Exception as e:
                            print(f"  ERROR: {e}")

            observer = Observer()
            observer.schedule(RebuildHandler(), args.src, recursive=True)
            observer.start()
            print(f"\n  Watching {args.src}/ for changes... (Ctrl+C to stop)")
            try:
                import time
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                observer.stop()
            observer.join()
        except ImportError:
            print("\n  --watch requires 'watchdog': pip install watchdog")
            sys.exit(1)


if __name__ == "__main__":
    main()
