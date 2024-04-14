const HtmlWebpackPlugin = require("safe-require")("html-webpack-plugin");
const path = require("path")

class MyInlineWebpackPlugin {
  constructor(tests) {
    // 这里是可以从配置之中获取正则的规则
    this.tests = tests
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("MyInlineWebpackPlugin", (compilation) => {
      
      const hooks = HtmlWebpackPlugin.getHooks(compilation)
      hooks.alterAssetTagGroups.tap(
        "MyInlineWebpackPlugin", // 
        (assets) => {
          /*
          [
  {
    tagName: 'script',
    // voidTag: false,
    meta: { plugin: 'html-webpack-plugin' },
    // attributes: { defer: true, src: 'static/js/runtime-main.js.d867ae117e.js' },
    innerHTML: xxx,
    closeTag: true
  },
  {
    tagName: 'script',
    voidTag: false,
    meta: { plugin: 'html-webpack-plugin' },
    attributes: { defer: true, src: 'static/js/311.5b9e7f055c.js' }
  },
  {
    tagName: 'script',
    voidTag: false,
    meta: { plugin: 'html-webpack-plugin' },
    attributes: { defer: true, src: 'static/js/main.9a2bbde5a7.js' }
  }
]
          */
          // console.log(headTags, bodyTags)
          // console.log(headTags)
          assets.headTags = this.getInlineChunk(assets.headTags, compilation.assets)
          assets.bodyTags = this.getInlineChunk(assets.bodyTags, compilation.assets)
        },
      );


      hooks.afterEmit.tap("MyInlineWebpackPlugin", () => {
        Object.keys(compilation.assets).forEach(filepath => {
          // console.log(filepath, 44)
          if (/runtime(.*)\.js$/g.test(filepath)) {
            delete compilation.assets[filepath]
          }
          if (/runtime(.*)\.js\.map$/g.test(filepath)) {
            delete compilation.assets[filepath]
          }
        })
      })
    });



    // 删除dist目录之中的runtime 文件

  }



  getInlineChunk(tags, assets) {
    return tags.map(tag => {

      const filepath = tag.attributes.src

      console.log(filepath, 72, tag)

      // return tag
      
      if (tag.tagName !== 'script') {
        return tag
      }
      // 获取文件资源路径
      
      if (!filepath) {
        return tag
      }

      if (!/runtime(.*)\.js$/g.test(filepath)) {
        return tag
      }

      console.log(__dirname, filepath, 85)
      console.log(path.resolve(__dirname, "../dist", filepath))     
      const realPath = path.resolve(__dirname, "../dist", filepath)
      return {
        tagName: 'script',
        innerHTML: assets[filepath.slice(1)].source(),
        closeTag: true
      }
    })
  }
}

module.exports = MyInlineWebpackPlugin;























