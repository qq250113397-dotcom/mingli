# 可视化流年大运与批注规格

## Objective

参考用户提供的直播录屏，把现有紫微斗数运限数据整理成可横向浏览的十年大运表。用户点击任一年后，同步查看该年的流年命宫、四化落宫和规则化批注。

批注用于传统文化研究与娱乐，必须展示推导依据并使用“较容易、可留意、建议”等非确定性措辞。

## Tech Stack

- React 19.2.7 + TypeScript 6
- iztro 2.5.8：计算命盘、大限和流年
- Vitest + Testing Library：领域逻辑和交互测试
- Cloudflare Workers / Pages：静态部署

## Commands

- 开发：`npm run dev`
- 测试：`npm test`
- 检查：`npm run lint`
- 构建：`npm run build`
- 正式部署：`npm run deploy`
- Pages 备用部署：`npm run deploy:pages`

## Project Structure

- `src/domain/annual-reading.ts`：十年时间轴与年度批注纯函数
- `src/components/FortuneTimeline.tsx`：年份选择和批注展示
- `src/App.tsx`：把出生资料、当前日期和时间轴联动
- `src/styles.css`：桌面与手机布局
- `docs/`：算法口径和功能规格

## Code Style

领域函数只接收明确输入并返回可渲染数据，不读取 DOM、不保存用户资料：

```ts
const timeline = buildDecadalTimeline(birth, targetDate, algorithm);
const reading = createAnnualReading(chart);
```

## Testing Strategy

- 领域测试：十年范围、流年干支、宫位焦点、四化证据、非确定性措辞
- 组件测试：点击年份后触发全站年份切换，选中年份可被辅助技术识别
- 浏览器测试：桌面和手机无横向溢出，时间轴可横向滚动，控制台无错误

## Boundaries

- Always：批注展示计算证据；现实风险主题只给一般性提醒；本地排盘
- Ask first：引入收费 AI API、账号系统、云端保存用户生辰
- Never：承诺准确率；输出医疗诊断、投资指令或确定性灾祸；伪造大师身份

## Success Criteria

- 当前大限的完整年份横向展示，并标出年份、虚岁、干支和流年命宫
- 点击年份后，命盘、右侧运限和查看日期同步更新
- 当前年份展示年度主轴、机会、提醒、行动建议
- 四化批注至少列出化禄、化权、化科、化忌及其落宫依据
- 手机和桌面均可使用，所有自动化测试、检查和构建通过

## Open Questions

- 录屏音频没有字幕，本机转写模型文件损坏且在线转写密钥未配置；本期不复制主播原话。
- 后续如需要“真人声音”，应单独确认配音人、声音授权和文案审核流程。
