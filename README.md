# Mastershot Studio 作品网站

这是一个不依赖构建工具的静态网站原型，可以直接修改、预览和部署。

## 目录

- `index.html`：页面结构
- `styles.css`：视觉系统、响应式布局和动效
- `blur.css`：Blur 风格全屏开场、Mastershot 动画 Logo 与项目详情页
- `content.js`：所有可编辑内容（项目、简介、海报、预告片链接）
- `assets/posters/`：项目海报
- `assets/stills/`：个人剧照和工作照
- `logo.svg`：第一版 Mastershot 主视觉标志，可直接导入 Figma / Illustrator 继续调整

## 修改作品

打开 `content.js`，复制一个项目对象，修改：

```js
{
  title: "项目名称",
  year: "2026",
  type: "类型标签",
  tags: ["action"],
  role: "你的项目职责",
  poster: "assets/posters/项目/海报.jpg",
  still: "assets/stills/剧照.jpg",
  trailer: ""
}
```

现在的作品交互改成了“海报卡片 → 全屏项目详情页”。点击作品后，详情页顶部是预告片播放区，下面是导演、年份、项目职责、文字介绍和剧照墙；左上角 HOME 返回作品首页，右上角 Mastershot 标志回到开场。

`trailer` 可以填 YouTube 链接（例如 `https://www.youtube.com/watch?v=xxxxxxx`），也可以填 `.mp4` / `.webm` 直链。填好后，详情页会直接显示播放器和播放按钮。

首页现在先显示黑底 `MASTERSHOT` 开场，约 2 秒后自动上升切入主界面。动态背景可以在 `content.js` 的 `heroVideo` 填入 mp4/webm 文件路径；当前留空时使用电影海报作为动态位移背景，巨大的 MASTERSHOT 镂空字样会自动上升并缓慢漂移。

普通网页链接（例如视频网站的播放页面）不能直接嵌入播放器。你刚发的《太平轮》链接已经填入 `trailerPage`，会在详情页显示播放按钮并打开原页面。YouTube 链接可以直接填入 `trailer`，例如：

```js
trailer: "https://www.youtube.com/watch?v=VIDEO_ID",
trailerPage: "https://www.xinpianyugao.com/play_197754_45840.html",
stills: ["assets/stills/project-shot-01.jpg", "assets/stills/project-shot-02.jpg"]
```

## 本地预览

在 `mastershot-site` 文件夹中运行：

```bash
python3 -m http.server 8080
```

然后打开 <http://localhost:8080>。建议用本地服务器预览，因为部分浏览器会限制 `file://` 下的视频播放。

## 下一步建议

1. 补充每个项目的预告片链接和可公开的具体署名。
2. 把新的个人剧照放进 `assets/stills/`，然后在 `content.js` 替换路径。
3. 确认双语组合和工作室最终 Logo 后，再做正式上线版域名与分享封面。
