# 小程序 tailwind

在小程序开发里使用 tailwind css, 灵感来自 [taro-tailwind](https://github.com/windedge/taro-tailwind), 但是原项目已经不再适配最新的 postcss 和 tailwind 了，所以这里更新为 mini-tailwind, 供所有小程序开发使用，不限框架，因为 tailwind 本质上是生成一个工具类的 css，写界面的时候便于引用。 mini-tailwind 的逻辑完全独立与小程序本身的任何框架，核心功能就是利用 postcss 生成一个 tailwind 工具类 css

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

### 2. 使用 PostCSS 生成

添加 talwindcss 依赖:

```shell
# 使用npm
npm install --save-dev tailwindcss

# 使用yarn
yarn add --dev tailwindcss postcss postcss-cli
```

复制默认配置 tailwind.config.js 和基础类定义 tailwind.src.css 到项目目录:

```shell
cp ./node_modules/mini-tailwind/tailwind.config.js ./tailwind.config.js
cp ./node_modules/mini-tailwind/tailwind.src.css ./src/tailwind.src.css
```

在 postcss.config.js 中添加:

```js
module.exports = {
  plugins: [
    // ...
    require("tailwindcss"),
    require("taro-tailwind"),
    // ...
  ],
};
```

然后使用 postcss 执行生成 css 文件:

```shell
postcss ./src/tailwind.src.css -o ./src/tailwind.css
```

引入样式文件:

```js
import "./tailwind.css";
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

### 使用 PurgeCSS 简化生成的 tailwind.css

修改 postcss.config.js 文件，使用下面的示例配置：

```js
const purgecss = require("@fullhuman/postcss-purgecss");

const production = process.env.NODE_ENV === "production";

module.exports = {
  plugins: [
    require("tailwindcss"),
    // require('taro-tailwind')({debug: true}),
    require("mini-tailwind"),
    production &&
      purgecss({
        content: [
          "**/*.html",
          "./src/**/*.js",
          "./src/**/*.jsx",
          "./src/**/*.vue",
          "./src/**/*.mpx",
          "./src/**/*.tsx",
        ],
      }),
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
