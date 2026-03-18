# 铁与王冠 — 万世征途

> Iron & Crown — A Grand Strategy Game

## 在线游玩

部署到 GitHub Pages 后，直接访问 `https://<username>.github.io/<repo>/` 即可。

## 项目结构

```
iron_crown/
├── build.py                  # 构建脚本：拼接 → dist/index.html
├── README.md
├── .github/
│   └── workflows/
│       └── build.yml         # GitHub Actions 自动构建
├── src/
│   ├── template.html         # HTML骨架（含CSS/JS占位符）
│   ├── css/
│   │   ├── 01-variables.css  # 全局变量与重置
│   │   ├── 02-menu.css       # 主菜单
│   │   ├── 03-modal.css      # 弹窗/遮罩
│   │   ├── 04-forms.css      # 表单/按钮
│   │   ├── 05-lists.css      # 列表/标签/选项卡
│   │   ├── 06-editor.css     # 编辑器布局
│   │   └── 07-map-entities.css # 地图实体/通知/响应式
│   └── js/
│       ├── 01-utils.js       # 工具函数与localStorage
│       ├── 02-data.js        # 常量/默认数据/剧本结构
│       ├── 03-ui.js          # 通知系统与弹窗
│       ├── 04-map-ctrl.js    # 地图缩放/拖动控制器
│       ├── 05-editor-core.js # 编辑器核心逻辑
│       ├── 06-editor-popups.js # 弹出编辑器
│       ├── 07-editor-render.js # 地图实体渲染
│       ├── 08-editor-sidebar.js # 侧边栏面板
│       ├── 09-editor-crud.js # CRUD操作与保存
│       └── 10-menu.js        # 主菜单与启动
└── dist/
    └── index.html            # 构建输出（单文件，可直接双击打开）
```

## 本地开发

```bash
# 构建单文件
python build.py

# 监听文件变化自动重建（需要 pip install watchdog）
python build.py --watch

# 指定输出路径
python build.py -o ./index.html
```

构建后打开 `dist/index.html` 即可游玩。
