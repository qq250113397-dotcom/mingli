# 紫微古籍馆 Design QA

- source visual truth path: `docs/design/reference-option-1.png`
- implementation screenshot path: `docs/qa/desktop-final.png`
- mobile screenshot path: `docs/qa/mobile-final.png`
- viewport: 1487 × 1059 desktop；390 × 844 mobile
- state: 默认生辰、2026 流年、命宫选中、搜索“紫微”
- full-view comparison evidence: `docs/qa/comparison-full.png`
- focused region comparison evidence: `docs/qa/comparison-center.png`

## Findings

没有剩余的 P0、P1 或 P2 问题。

- 字体与层级：实现使用 Noto Serif SC 与 Noto Sans SC，对应参考图的宋体标题、无衬线小字结构；字号、字重和行距在桌面及手机端均可读。
- 间距与布局：保留左古籍、中命盘、右运限的三栏骨架，细分隔线、方角控件、低阴影密度与参考图一致；手机端改为单列并提供古籍抽屉，没有横向溢出。
- 颜色与视觉令牌：米白纸色、墨色文字、灰褐分隔线和朱砂红选中态均已统一为 CSS 令牌；对比度和焦点轮廓清晰。
- 图片与资产：参考图没有业务图片；界面图标统一使用 Remix Icon。参考图最左侧装订条与纸张颗粒属于装饰性 P3 细节，当前未加入，以保持页面轻量。
- 文案与内容：输入、运限、古籍来源、隐私和免责声明文案完整；默认“紫微”搜索已与《紫微斗数全书》正文同步。
- 交互与状态：排盘表单、十二宫点击检索、大限/流年切换、年份前后切换、算法弹窗、移动端古籍抽屉均已验证。
- 可访问性：主要区域有语义名称，控件可键盘访问，表单有标签，焦点态可见；浏览器控制台无错误或警告。

## Patches Made Since Previous QA Pass

1. 修正默认搜索“紫微”却打开《滴天髓》的内容错配。
2. 清理古籍正文预览中的来源声明和 `__TOC__` 标记。
3. 隐藏右侧搜索结果条的视觉滚动条，同时保留横向触控滚动。
4. 验证 390px 手机布局无横向溢出，并验证古籍抽屉正常打开。

## Follow-up Polish

- P3：未来可以生成并加入轻量纸纹或装订边饰，但不影响当前产品使用与视觉成立。
- P3：古籍数量扩充后，可把左侧分类升级为参考图中的卷册数量与折叠目录。

## Implementation Checklist

- [x] 桌面三栏结构
- [x] 响应式手机布局
- [x] 十二宫与古籍检索联动
- [x] 大限、流年和年份交互
- [x] 算法口径与隐私说明
- [x] 浏览器控制台检查
- [x] 参考图同屏对照

final result: passed
