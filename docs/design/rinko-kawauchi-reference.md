# 川内伦子网站：设计研究基线

- 研究对象：[Rinko Kawauchi 官方网站](https://rinkokawauchi.com/)
- 研究范围：公开信息架构、公开 DOM/CSS/JS 的布局与交互行为
- 首次核验：2026-07-29
- 用途：为 Fio 原型与后续设计决策提供可追溯的版式、栏目和交互基线
- 非用途：复制网站内容、图片、PDF、Logo、字体文件、源码或品牌表达

## 使用边界

本研究允许复用的是抽象层的设计知识：栏目层级、页面模板、间距尺度、栅格、导航结构、响应式规则和可访问交互。

以下内容不进入 Fio：

- 原站图片、图像裁切结果、轮播素材或缩略图。
- 原站文章、履历、出版物说明、PDF 或项目标题。
- 原站 Logo、SVG、字体文件、CSS、JavaScript 或 WordPress 模板。
- 容易使访客误认 Fio 与原站有关的品牌元素。

原型中的文字和媒体均是 `prototype-only` 占位。生产阶段只使用自己创作或有明确公开授权的素材。

## 事实与建议的区分

| 标记 | 含义 |
| --- | --- |
| 实测 | 在公开页面或公开样式中直接核验的行为/数值 |
| 推断 | 从实测模式得出的可行解释，未来需复验 |
| Fio 采用 | 已决定用于 Fio 原型的规则 |
| 待决 | 只有生产实现前才需决定的技术或内容规则 |

## 全局 Shell

### Desktop

| 项目 | 实测 | Fio 原型采用 |
| --- | --- | --- |
| 左侧栏 | 固定 `360px`，占满视口高度 | 采用 |
| 侧栏内边距 | 左/上约 `50px` | 采用 |
| 主导航 | 主栏目与上下文子导航并列 | 采用 |
| 导航字号 | `14px`，条目上下约 `4px` padding | 采用 |
| 当前状态 | 左侧 `4px` 圆点 | 采用 |
| 页脚 | 左下版权与返回顶部 | 内页采用；Fio 首页不采用 |
| 内容外边距 | 常见右侧 `18px` | 采用 |

### Mobile：`≤1023px`

| 项目 | 实测 | Fio 原型采用 |
| --- | --- | --- |
| Desktop 侧栏 | 隐藏 | 采用 |
| 顶栏 | 左右 `18px`，文字 `Menu/Close` | 采用 |
| 菜单 | 同色全屏覆盖层；主/子导航均保留 | 采用 |
| 内容区 | 顶部约 `58px`，左右 `18px` | 采用 |
| Footer | 文档流，不固定 | 后续生产待定 |
| 无障碍 | 打开菜单时主体不可滚动 | 原型采用焦点移交、Escape 和焦点归还；滚动锁定待生产实现 |

### Token

| Token | 实测值 | Fio 原型 |
| --- | --- | --- |
| Surface | `#eaeeee` | `#eaeeee` |
| 主文本 | `#000000` | `#161818`，接近黑色但保留屏幕舒适度 |
| 辅助文本 | `#777777` | `#657070` / `#777777` |
| 静默规则 | 约 `#999999` | `#999999` |
| 字体 | Adobe Garamond W01 + 日文/明朝回退 | Garamond / Yu Mincho / Songti SC 回退栈 |
| 基础正文 | `14px / 1.6` | 采用 |
| 圆角、阴影、卡片 | 未使用 | 不使用 |

## 页面模板矩阵

| 模板 | 原站公开栏目 | 内容单元 | 导航 | 分页/交互 | Fio 原型状态 |
| --- | --- | --- | --- | --- | --- |
| Home | Home | 全屏媒体轮播 | 侧栏 | 淡入淡出自动轮播 | 不采用；Fio 保留上田式深灰首页 |
| News | News | 可选图片、类别、标题、日期、地点、说明、外链 | All/Event/Group Exhibition/News/Publication/Solo Exhibition | 数字分页 | 采用 |
| Biography | Biography | 简介、分区、年份列、事件列 | 页面锚点 | 长页平滑滚动 | 采用 |
| Works | Works | 封面、标题、年份、详情链接 | 项目索引 | 长档案，无分页 | 采用 |
| Work detail | Works detail | 连续媒体组、标题、年份 | 当前项目索引 | 单图/双图组 | 采用 |
| Video Works | Works 子栏目 | 16:9 视频、标题、年份、时长 | Works 子导航 | 长列表 | 原型只保留结构，不嵌视频 |
| Installation Views | Works 子栏目 | 媒体组、标题、日期、场地 | Works 子导航 | 轮播/触摸 | 原型只保留结构，不自动轮播 |
| Publications | Publications | 书封、标题、年份、详情链接 | 主导航 | 数字分页 | 采用 |
| Publication detail | Publications detail | 媒体组、说明、规格 label/value | 当前项 | 轮播 | 待生产内容模型 |
| Articles | Articles | 缩略图、类型、标题、年份、PDF 链接 | Essay/Interview/Commission | 分类；分页取决于数量 | 采用网格与分类 |
| Contact | Contact | 文字分区、联系方式、代理/外链 | 主导航 | 无表单 | 采用 |
| Instagram | 外部平台 | 无站内内容 | 主导航外链 | 新标签页 | 原型只标明外部边界 |

## 模板规则

### Home：Fio 的独立决定

原站 Home 是无文案的全屏媒体轮播。Fio 不采用该模板，保留以下独立首页规则：

```text
深灰固定满屏
Fio 大型姓名
一句短文本
底部 Latest / Works / Information
无首页版权文字
无自动轮播
```

**原因：** Fio 在真实媒体内容尚未准备好前，需要通过姓名和最少入口建立身份；用未授权占位图模拟摄影师首页会制造错误的作品承诺。

### News

- 条目按时间倒序；字段可缺省。
- 内容采用纵向档案，而不是浮动卡片或瀑布流。
- 图片与文字之间约 `10px`；条目之间约 `55px`。
- 原站使用约 `15px` 的短灰横线分隔 News 条目，而不是整宽 border。
- News 使用真实数字分页；当前公开日文版至少 7 页、英文版至少 6 页，说明不同语言库可独立增长。
- Fio 原型采用两页虚构记录，只验证分页状态，不规定生产 URL 或数据接口。

### Biography

- 单页长履历，子导航是锚点而非分页。
- 年份列约 `60px`，同一年允许多个事件。
- 分区：简介、个展、群展、奖项、出版物、公共收藏为可选模板。
- 段落行高约 `1.8`，分区之间约 `4em` 留白。
- 移动端仍应保留时间扫描能力，不将年份完全丢弃。

### Works 与详情

- Works 是单列大图项目档案，侧栏二级导航是项目索引，不是分类筛选。
- 原站按原创系列、项目型作品、Video Works、Installation Views 等大留白分组。
- Fio 可用同一模板承载 photography、software、hardware、mixed；不能因媒介不同复制多套站点架构。
- 详情页桌面强调连续媒体流；移动端在媒体前显示标题和年份，补偿侧栏消失后的上下文。
- 单图为一行；双图桌面约 `49% + 2%`，小屏约 `48.5% + 3%`。
- 媒体组间距：桌面约 `18px`，移动约 `12px`。

### Publications

- 桌面三列封面网格；小屏 `≤480px` 两列。
- 媒体保持原始比例，不强制裁切成相同卡片高度。
- 单项至少显示标题和年份；生产阶段可增加作者/出版社。
- 使用数字分页，不使用无限滚动。
- 详情页的规格应设计为可变 `label/value` 集合，而不是固定 ISBN 表。

### Articles

- 桌面三列、小屏两列的文献网格。
- 类型为 Essay、Interview、Commission；类型应有独立可索引状态。
- 原站多数链接直接打开 PDF，不使用常规站内详情页。
- Fio 原型只展示 `prototype PDF` 语义，禁止嵌入、下载或复制第三方 PDF。

### Contact

- 纯文本分区；不使用联系表单、地图、营销卡片或虚构个人联系方式。
- 适合按 inquiry、representation、press、region 等分区组织。
- 生产阶段可考虑邮件混淆或联系链接策略，但不在本原型实现。

## 间距与网格数据

| 场景 | 实测/采用规则 |
| --- | --- |
| Desktop 侧栏 | `360px` |
| Desktop 侧栏 padding | `50px` |
| Desktop 内容右边距 | `18px` |
| Mobile 页面内边距 | `18px` |
| Mobile 顶栏高度 | 约 `52px` |
| News 图片/文字间距 | `10px` |
| News 条目间距 | 约 `55px` |
| Works 条目间距 | Desktop `5em`，小屏 `3em` |
| Publications/Articles desktop | 三列，单列约 `31%`，间隙约 `3.5%` |
| Publications/Articles mobile | 两列，单列约 `47%`，间隙约 `6%` |
| Work detail 双图 Desktop | `49% + 2% + 49%` |
| Work detail 双图 Mobile | `48.5% + 3% + 48.5%` |
| Home media motion | 原站淡入淡出 `500ms`、间隔 `4000ms`；Fio 不采用自动播放 |

## 原型采用、待决与延后项

### 本轮原型采用

- Desktop 固定侧栏、移动 `Menu/Close` 覆盖菜单。
- News 分类与数字分页状态。
- Biography 年份履历与锚点。
- Works 项目索引与连续媒体组。
- Publications/Articles 的响应式网格。
- Contact 文字分区。
- 主/子导航圆点状态、低对比度元数据、无卡片式装饰。

### 生产前待决

- 是否正式采用 News、Biography、Works、Publications、Articles、Contact 这些栏目名称。
- News/Publications 的静态分页 URL 和每页条目数。
- Biography 的 Markdown/frontmatter 或结构化数据模型。
- Publications/Articles 的媒体、PDF 与元数据存储策略。
- Works 的 `kind`、`role`、媒体组（单图/双图）字段。
- 外部 Instagram 是否保留、目标链接与 `rel="noopener"` 规则。
- 首页真实媒体策略与是否继续保留上田式姓名入口。

### 明确延后

- 生产自动轮播、Vimeo 嵌入、触摸轮播。
- 多语言镜像内容与 `hreflang`。
- 真实 PDF 托管或下载。
- 真实代理/联系信息。
- 生产 CMS、数据库或在线编辑后台。

## 素材授权台账模板

每一个未来可能进入 `public/media/`、文章、作品、出版物或外部嵌入的素材，都应先记录：

| Asset ID | 用途 | 作者/权利人 | 来源 URL/文件 | 许可证或授权凭证 | 允许范围 | 归档位置 | 可公开 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `media-001` | Works cover | 待填写 | 待填写 | 待填写 | 网站与 RSS | 待填写 | 否 |

没有明确授权、来源和公开范围的素材，不得进入 `content/` 或 `public/media/`。

## 来源

- [首页](https://rinkokawauchi.com/)
- [News](https://rinkokawauchi.com/news/)
- [Biography](https://rinkokawauchi.com/biography/)
- [Works](https://rinkokawauchi.com/works/)
- [Video Works](https://rinkokawauchi.com/video_works/)
- [Installation Views](https://rinkokawauchi.com/installation_views/)
- [Publications](https://rinkokawauchi.com/publications/)
- [Articles](https://rinkokawauchi.com/articles/)
- [Contact](https://rinkokawauchi.com/contact/)
- [站点地图](https://rinkokawauchi.com/sitemap.xml)
- [公开主题样式](https://rinkokawauchi.com/unit/wp-content/themes/main/style.css?v=201802021700)
- [公开交互脚本](https://rinkokawauchi.com/unit/wp-content/themes/main/js/base.js?v=201802021700)
