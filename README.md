# 小程序 tailwind

在小程序开发里使用 tailwind css, 灵感来自 [taro-tailwind](https://github.com/windedge/taro-tailwind) 和 [nativescript-tailwind](https://github.com/rigor789/nativescript-tailwind), 但是原项目已经不再适配最新的 postcss 和 tailwind 了，所以这里更新为 mini-tailwind, 供所有小程序开发使用，不限框架，因为 tailwind 本质上是生成一个工具类的 css，写界面的时候便于引用。 mini-tailwind 的逻辑完全独立与小程序本身的任何框架，核心功能就是利用 postcss 生成一个 tailwind 工具类 css

## 安装

```shell
npm install --save-dev mini-tailwind
```

## 使用

支持 2 种使用方式:

1. 直接引入预先生成的 css 文件；
2. 使用 PostCSS 生成自定义的 css 文件(通过 tailwind.config.js)。

### 1. 直接引入

引入样式文件:

> 不推荐，样式较大，未个性化定制

```js
import "mini-tailwind/dist/tailwind.css";
```

### 2. 使用命令行生成

> 依赖 `tailwindcss`, `postcss`, 如果没装的话，请先安装：

```sh
npm i tailwindcss postcss
```

命令：

```bash
npx mini-tailwind tailwind.config.js
```

如上，还是这样引用：

```js
import "mini-tailwind/dist/tailwind.css";
```

> `tailwind.config.js` 是你的 tailwind config 配置，不传的话使用 tailwind 官方默认配置

### 2. 使用 PostCSS 生成

1. 添加依赖:

```shell
npm i -D tailwindcss postcss postcss-cli
```

2. 初始化 tailwind

```shell
npx tailwindcss init
```

3. 创建 postcss.config.js:

```js
module.exports = {
  plugins: [
    // ...
    require("tailwindcss"),
    require("mini-tailwind"),
    // ...
  ],
};
```

4. 添加你的 tailwind 原始 css `src/tailwind.src.css`

```css
@tailwind components;
@tailwind utilities;
```

然后使用 postcss 执行生成 css 文件:

```shell
postcss ./src/tailwind.src.css -o ./src/tailwind.css
```

引入样式文件:

```js
import "./tailwind.css";
```

## 选项

- `unit`, 单位,默认 `px`
- `designWidth`, 设计稿宽度, 默认 `750`, `text-base`, 相当于 `32px`,
- `properties`, 支持的属性，默认值如下:

```js
{
    "align-content": true,
    "align-items": true,
    "align-self": true,
    background: true,
    "background-color": true,
    "background-image": true,
    "background-position": true,
    "background-repeat": ["repeat", "repeat-x", "repeat-y", "no-repeat"],
    "background-size": true,
    "border-bottom-color": true,
    "border-bottom-left-radius": true,
    "border-bottom-right-radius": true,
    "border-bottom-width": true,
    "border-color": true,
    "border-left-color": true,
    "border-left-width": true,
    "border-radius": true,
    "border-right-color": true,
    "border-right-width": true,
    "border-style": true,
    "border-top-color": true,
    "border-top-left-radius": true,
    "border-top-right-radius": true,
    "border-top-width": true,
    "border-width": true,
    "box-shadow": true,
    "clip-path": true,
    color: true,
    display: true,
    flex: true,
    "flex-direction": true,
    "flex-grow": true,
    "flex-shrink": true,
    "flex-wrap": true,
    font: true,
    "font-family": true,
    "font-size": true,
    "font-style": ["italic", "normal"],
    "font-weight": true,
    gap: true,
    "grid-auto-flow": true,
    "grid-column": true,
    "grid-column-end": true,
    "grid-column-start": true,
    "grid-row": true,
    "grid-row-end": true,
    "grid-row-start": true,
    "grid-template-columns": true,
    "grid-template-rows": true,
    height: true,
    "horizontal-align": ["left", "center", "right", "stretch"],
    "justify-content": true,
    "letter-spacing": true,
    "line-height": true,
    margin: true,
    "margin-bottom": true,
    "margin-left": true,
    "margin-right": true,
    "margin-top": true,
    "max-height": true,
    "max-width": true,
    "min-height": true,
    "min-width": true,
    "object-fit": true,
    "object-position": true,
    opacity: true,
    overflow: true,
    "overflow-wrap": true,
    padding: true,
    "padding-bottom": true,
    "padding-left": true,
    "padding-right": true,
    "padding-top": true,
    "placeholder-color": true,
    position: ["absolute", ""],
    scale: true,
    "text-align": ["left", "center", "right"],
    "text-decoration": ["none", "line-through", "underline"],
    "text-transform": ["none", "capitalize", "uppercase", "lowercase"],
    "transform-origin": true,
    transition: true,
    "transition-duration": true,
    "transition-property": true,
    "transition-timing-function": true,
    translate: true,
    "vertical-align": ["top", "center", "bottom", "stretch"],
    visibility: ["visible", "collapse"],
    "white-space": true,
    width: true,
    "word-break": true,
    "z-index": true,
    "text-overflow": true,
    "-webkit-line-clamp": true,
    "-webkit-box-orient": true,
    top: true,
    left: true,
    right: true,
    bottom: true,
    inset: true,
  }
```

## 注意事项

### 反斜杠和冒号的使用

小程序不支持使用反斜杠和冒号作为类名，因此默认配置文件(tailwind.config.js)中，反斜杠修改成使用下划线(\_)，例如:

```jsx
<View className="w-1/3"></View>
```

应该写成:

```jsx
<View className="w-1_3"></View>
```

小数改为 `__`, 如 `h-2.5`, 改为 `h-2__5`

## 推荐优化

### 使用 purge 参数按需生成 tailwind.css，

修改 tailwind.config.js 文件，使用下面的示例配置：

```js
const colors = require("tailwindcss/colors");

module.exports = {
  purge: [
    "./src/**/*.html",
    "./src/**/*.vue",
    "./src/**/*.wxml",
    "./src/**/*.jsx",
  ],
};
```

运行命令生成简化后的 css：

```shell
NODE_ENV=production postcss ./src/tailwind.src.css -o ./src/tailwind.css
```

或加到打包脚本(package.json)里：

```json
{
  "scripts": {
    "build:weapp": "cross-env NODE_ENV=production postcss ./src/tailwind.src.css -o ./src/tailwind.css && taro build --type weapp"
  }
}
```
