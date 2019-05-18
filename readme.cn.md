## skeleton-weex-plugin
skeleton-weex-plugin是[skeleton-webpack-plugin](https://github.com/NealST/skeleton-webpack-plugin)的一个插件，它主要用于生成weex端的骨架屏代码 

## 如何使用  

skeleton-weex-plugin必须结合[skeleton-webpack-plugin](https://github.com/NealST/skeleton-webpack-plugin)一起使用.  
在使用之前你必须先安装它们。
```
npm i skeleton-webpack-plugin skeleton-weex-plugin --save-dev
```
或者
```
yarn add skeleton-webpack-plugin skeleton-weex-plugin --dev
```
在安装好该webpack插件之后，你只需要在其plugins配置项中添加上skeleton-weex-plugin即可。

```
const SkeletonWebpackPlugin = require('skeleton-webpack-plugin')
cosnt HtmlWebpackPlugin = require('html-webpack-plugin')
const SkeletonWeexPlugin = require('skeleton-weex-plugin')
module.exports = {
  entry: 'index.js',
  mode: 'development',
  output: {
    path: 'dist',
    filename: 'index.bundle.js'
  },
  plugins: [
    new SkeletonWebpackPlugin({
      outDir: __dirname,
      projectDir: __dirname,
      plugins: [SkeletonWeexPlugin]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true
    })
  ]
}
```  
然后当你启动dev server本地预览页面时,打开你的控制台，输入skeleton并按下回车键即可 
![](https://camo.githubusercontent.com/ffc6c72bfb3ed1391a4e0be72c27b1e97433b448/68747470733a2f2f70742d73746172696d672e646964697374617469632e636f6d2f7374617469632f73746172696d672f696d672f6c4e6e694d764635584c313535383038393937373337382e6a7067)  

skeleton-weex-plugin将会在你对应的页面目录下生成skeleton.vue的文件：
```
<template>
<div v-if="isShow" class="skeleton-wrapper">
<div>skeleton content</div>
</div>
</template>
<script>
export default {
  name: "Skeleton",
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style scoped>
skeleton style content
</style>
```  
怎样你就可以将骨架屏当初一个组件来使用，并控制它的隐藏和显示  

## 它是如何实现的  
作为skeleton-webpack-plugin的插件,skeleton-weex-plugin可以获取到骨架屏html与css的抽象语法树，skeleton-weex-plugin只需要将语法树转化成weex代码。这里我选择了vue作为weex的dsl。 
![](https://pt-starimg.didistatic.com/static/starimg/img/31gUFXpL6c1558076117193.jpg)