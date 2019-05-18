## skeleton-weex-plugin
This is a plugin of [skeleton-webpack-plugin](https://github.com/NealST/skeleton-webpack-plugin) to generate skeleton for your weex page.   

[中文文档戳这里]()

## how to use  

skeleton-weex-plugin must be used combined with [skeleton-webpack-plugin](https://github.com/NealST/skeleton-webpack-plugin).After you installed this webpack plugin,what you need to do is just adding skeleton-weex-plugin to the plugins configure param of skeleton-webpack-plugin like this:

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
Then you start your dev server,when your local preview page is showed in browser, open your console,input skeleton,then press enter keyboard key.  
![](https://camo.githubusercontent.com/ffc6c72bfb3ed1391a4e0be72c27b1e97433b448/68747470733a2f2f70742d73746172696d672e646964697374617469632e636f6d2f7374617469632f73746172696d672f696d672f6c4e6e694d764635584c313535383038393937373337382e6a7067)  

skeleton-weex-plugin will generate skeleton.vue file in your corresponding page directory like this:  
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
So you could use skeleton as a vue component and control the display or hide of this component.

## how it works  
As a plugin of skeleton-webpack-plugin,skeleton-weex-plugin could get the html ast and css ast of skeleton, then the remaining work is transform it to weex code, the entire process could be showed as follows:  
![](https://pt-starimg.didistatic.com/static/starimg/img/31gUFXpL6c1558076117193.jpg)