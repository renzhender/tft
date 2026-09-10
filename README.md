# 弈览 · S18 强化评级

数据来源：本项目 `data/streamer_batch/summary_fast.json` 与 TFTable 图标目录。
网页默认合并所有选手；仅复核模式重新计算均值，不混用自动样本。

在项目根目录运行 `python scripts/export_web_data.py` 更新网页数据与本地图标快照。
在 web 目录运行 `pnpm dev` 启动预览，`pnpm build` 构建。
运行 `node --test lib/statistics.test.ts` 核对评级边界、全部均值、样本量与图标文件。

在线页面为发布时的静态数据快照，采集队列完成后需重新导出并发布。
WebMCP 支持在可用浏览器中筛选页面；当前环境未进行 WebMCP 浏览器契约验证。
