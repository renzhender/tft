# GitHub Pages

公开地址： https://renzhender.github.io/tft/ （首次部署成功后可用）。

仓库使用当前 web 目录作为根目录。GitHub 仓库 Settings → Pages → Source 设为 GitHub Actions。
推送 main 后，工作流会验证统计、构建静态页面并发布。

网站沿用 app/page.tsx、组件、样式、lib/dataset.json 和 public/icons；不维护两套页面或数据。
Sites 仍使用原 build 命令；GitHub Pages 使用 pnpm build:pages，生成 dist-pages。
更换仓库名时，需要同步修改工作流中的 PAGES_BASE_PATH；个人主页根路径使用 /。

后续数据更新：在 TFT 项目运行现有汇总和 export_web_data.py 后，提交 web/lib/dataset.json 和新增图标并推送到 GitHub main。
GitHub Actions 只负责发布已推送的数据，不会自动采集或识别录像。

仅发布网页代码、图标和汇总数据；原始录像、取样图片、本地工具和凭据留在 TFT 项目目录。
