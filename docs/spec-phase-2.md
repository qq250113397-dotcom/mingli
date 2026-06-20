# Spec: 紫微古籍馆二期——典籍与算法增强

## Assumptions

1. “补全典籍”指建立可持续扩充、来源可核验的古籍库，不承诺一次收尽所有命理文献。
2. 本期只收录公有领域原作或许可清晰的数字文本，不复制现代付费课程、注解和网盘 PDF。
3. 页面继续沿用现有宣纸、朱砂和三栏工作台设计，不重做视觉风格。
4. 排盘继续全部在浏览器本地完成，不新增账号、数据库和生辰上传。
5. 算法以 iztro 2.5.8 为底座，并明确暴露会造成流派差异的配置。

## Objective

把 MVP 升级为可长期维护的传统命理资料与排盘作品：

1. 用户可选择具体查看日期，并查看大限、小限、流年、流月、流日。
2. 用户可选择通行法或中州派，以及年度、运限、小限和晚子时分界口径。
3. 古籍库从 8 卷扩充到至少 25 个 Markdown 文档，并保留来源、许可和校勘状态。
4. 导入脚本集中管理书目，拒绝缺少正文或来源信息的页面。
5. Obsidian 保存典籍来源清单、算法口径、实现进度和后续待办。

## Tech Stack

- React 19.2
- TypeScript 6.0
- Vite 8
- iztro 2.5.8
- Vitest 4
- Cloudflare Workers 静态资源部署
- 维基文库 MediaWiki API

## Commands

```bash
npm run content:sync
npm test
npm run lint
npm run build
npm run deploy
```

## Project Structure

```text
content/classics/           古籍 Markdown 正文
scripts/import-wikisource.mjs 书目清单、抓取、清洗和校验
src/domain/chart.ts         排盘配置与五级运限适配
src/components/             日期、运限、算法设置界面
src/lib/classics.ts         古籍元数据解析和搜索
docs/classics-sources.md    来源、版权和收录状态
docs/spec-phase-2.md        本期规格和任务
```

## Interfaces

```ts
export interface AlgorithmOptions {
  algorithm: "default" | "zhongzhou";
  yearDivide: "normal" | "exact";
  horoscopeDivide: "normal" | "exact";
  ageDivide: "normal" | "birthday";
  dayDivide: "current" | "forward";
}

export interface FortuneTarget {
  date: string;
  timeIndex?: number;
}
```

`buildChart` 保留传入年份的兼容方式，同时新增具体日期与算法选项，避免一次破坏现有调用。

## Code Style

```ts
export function buildChart(
  input: BirthInput,
  target: string | number,
  options: AlgorithmOptions = DEFAULT_ALGORITHM_OPTIONS,
): ChartViewModel {
  // 在模块边界校验输入，再调用 iztro。
}
```

## Testing Strategy

- 单元测试：日期归一化、算法配置、五级运限映射、异常输入。
- 内容测试：文档数量、三类书目、来源 URL、许可、正文非空。
- 组件测试：查看日期提交、五级运限切换、算法设置应用。
- 回归检查：现有十二宫、搜索、年份前后切换和键盘关闭弹窗继续可用。
- 发布检查：测试、ESLint、TypeScript/Vite 构建、Wrangler dry-run、线上 HTTP。

## Boundaries

- Always：保留来源和许可；显示算法口径；本地计算；错误信息用中文。
- Ask first：AI 自动断命、真太阳时、全球地点库、付费或用户账户。
- Never：把命理结果包装成确定事实；上传生辰；收录版权不明现代内容；伪造“全集”。

## Success Criteria

- [ ] 输入查看日期后，能得到大限、小限、流年、流月、流日数据。
- [ ] 算法设置可切换并重新排盘，默认配置与 iztro 2.5.8 一致。
- [ ] 古籍文档不少于 25 个，全部通过来源和正文校验。
- [ ] 页面显示实际收录卷数，并可搜索新增正文。
- [ ] `npm test`、`npm run lint`、`npm run build` 全部通过。
- [ ] PR 审查合并后部署到 `https://mingli.lbenben.cc.cd`。
- [ ] Obsidian 中有二期来源、算法和发布记录。

## Tasks

### Task 1: 算法契约与测试

- Acceptance：定义算法选项、目标日期和五级运限输出。
- Verify：新增测试先失败，再由实现使其通过。
- Files：`src/domain/chart.ts`、`src/domain/chart.test.ts`

### Task 2: 日期与运限界面

- Acceptance：表单改为查看日期；运限面板支持五个标签。
- Verify：组件测试、键盘操作和构建通过。
- Files：`src/components/BirthForm.tsx`、`src/components/FortunePanel.tsx` 及测试

### Task 3: 算法设置

- Acceptance：弹窗可编辑五项算法口径并应用，保留默认值。
- Verify：组件测试确认提交值，重新排盘后设置说明同步。
- Files：`src/components/AlgorithmDialog.tsx`、`src/App.tsx` 及测试

### Task 4: 典籍扩充与校验

- Acceptance：集中书目清单，新增至少 17 个文档，总数不少于 25。
- Verify：`npm run content:sync` 成功；内容测试校验正文、来源和许可。
- Files：`scripts/import-wikisource.mjs`、`content/classics/**`、`src/lib/classic-content.test.ts`

### Task 5: 发布与资料沉淀

- Acceptance：版本号更新，PR 合并，正式域名更新，Obsidian 完整记录。
- Verify：线上首页返回 200，新功能与新增书目可见。
- Files：`package.json`、`README.md`、Obsidian 项目笔记和资料笔记
