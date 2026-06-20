# 紫微古籍馆

一个公开的传统文化作品：输入生辰，在浏览器本地生成紫微斗数命盘、查看五级运限，并检索有来源标注的命理古籍。

- 网站：<https://mingli.lbenben.cc.cd>
- 仓库：<https://github.com/qq250113397-dotcom/mingli>
- 排盘底座：[SylarLong/iztro](https://github.com/SylarLong/iztro)

## 功能

- 公历、农历与十三个时辰输入
- 十二宫、星曜、命主身主和五行局
- 大限、小限、流年、流月、流日与年份前后切换
- 通行法、中州派和五项时间分界口径
- 点击宫位或四化词检索古籍原文
- 古籍来源、许可和校对状态展示
- 生辰仅在浏览器本地计算，不上传服务器
- 手机、平板和桌面响应式界面

## 已收录的公开古籍

- 《紫微斗数全书》卷一、卷二、卷三
- 《三命通会》卷一至卷九
- 《渊海子平》
- 《滴天髓》第一至第十篇
- 《神峰通考》
- 《五行精纪》
- 《梅花易数》卷一至卷三
- 《增删卜易》卷三

当前共 29 个 Markdown 文档。维基文库数字文本按 CC BY-SA 4.0 署名与同方式共享；每个文件均保留来源和许可信息。

## 本地运行

要求 Node.js 22。

```bash
npm install
npm run dev
```

打开 <http://127.0.0.1:5173>。

## 检查

```bash
npm test
npm run lint
npm run build
```

## 同步古籍

导入脚本从维基文库 MediaWiki API 获取公开文本：

```bash
npm run content:sync
```

导入器会拒绝重定向和正文过短的页面。新增古籍必须核验来源和版权，不批量复制现代注释、课程或未授权 PDF。

## 部署

正式域名使用 Cloudflare Workers 静态资源部署，Cloudflare Pages 地址作为备用。两种方式都使用同一份 `dist/` 构建产物：

```bash
npm run deploy
npm run deploy:pages
```

正式域名配置见 `wrangler.worker.jsonc`，Pages 配置见 `wrangler.jsonc`，安全响应头见 `public/_headers`。

## 授权

程序代码采用 MIT License；古籍数字文本的许可和来源见 [NOTICE.md](NOTICE.md) 及每个 Markdown 文件的 Frontmatter。

## 说明

本项目用于传统文化研究与娱乐，不提供确定性人生判断，不替代医疗、法律、投资等专业意见。不同紫微斗数流派的安星法、四化、星曜亮度和时间分界可能不同，页面会明确当前算法口径。
