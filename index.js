const fs = require('fs')
const promisify = require('util').promisify
const templateStr = [
    '<template>',
    '\t<div v-if="isShow" class="skeleton-wrapper">',
    '\t\tskeletonContent',
    '\t</div>',
    '</template>'
].join('\n')
const scriptStr = [
    '<script>',
    'export default {',
    '\tname: "Skeleton",',
    '\tprops: {',
    '\t\tisShow:{',
    '\t\t\ttype: Boolean,',
    '\t\t\tdefault: false',
    '\t\t}',
    '\t}',
    '}',
    '</script>'
].join('\n')
const styleStr = [
    '<style scoped>',
    'cssContent',
    '</style>'
].join('\n')

function generateTemplate(htmlAst, hasScrollerColumn = false) {
    htmlAst = htmlAst.filter(item => item.type === 'element')
    let skeletonContentStr = ''
    htmlAst.forEach(htmlItem => {
        let classValues = ['skeleton-block']
        let ultiStyleArray = []
        const classes = htmlItem.attributes && htmlItem.attributes.filter(item => item.key === 'class') || []
        const styles = htmlItem.attributes && htmlItem.attributes.filter(item => item.key === 'style') || []
        const dataVs = htmlItem.attributes && htmlItem.attributes.filter(item => /data-v-([\w\W]+)/.test(item.key)) || []
        if (classes.length > 0) {
            let classValue = classes[0].value
            classValue = classValue.replace(/weex-(\w*)\s/g, '')
            const classArray = classValue.split(" ")
            if (hasScrollerColumn && classArray.includes('weex-scroller-inner')) {
                ultiStyleArray.push("flexDirection: 'column'")
            }
            if (classArray.includes('weex-scroller-vertical')) {
                hasScrollerColumn = true
            } else {
                hasScrollerColumn = false
            }
            classValue = classArray.map(item => {
                if (/sk-([\w\-]*)/.test(item) || /weex-([\w\-]*)/.test(item)) {
                    return item
                } else {
                    return dataVs.length > 0 ? dataVs.map(v => `${item}-${v.key}`).join(' ') : item
                }
            }).join(' ')
            classValues.push(classValue)
        }
        if (styles.length > 0) {
            const styleValue = styles[0].value
            let styleArray = styleValue.trim().split(';')
            if (!/\w/.test(styleArray[styleArray.length - 1])) {
                styleArray.pop()
            }
            styleArray = styleArray.filter(item => !/url\(([^\)]*)\)/.test(item)).map(item => {
                const theMap = item.split(':')
                const key = theMap[0]
                const value = theMap[1]
                const ultiKey = key.replace(/\-[a-z]/g, (a, l) => a.toUpperCase().replace('-', ''))
                return `${ultiKey}: '${value.trim()}'`
            })
            ultiStyleArray = ultiStyleArray.concat(styleArray)
        }
        let styleStr = ultiStyleArray.length > 0 ? `:style="{${ultiStyleArray.join(',')}}"` : 'styleContent'
        skeletonContentStr += `<div  class="${classValues.join(' ')}" ${styleStr}>`.replace(/\sstyleContent/, '').replace(/skeleton-block\s/g, '')
        if (htmlItem.children && htmlItem.children.length > 0) {
            skeletonContentStr += generateTemplate(htmlItem.children, hasScrollerColumn)
        }
        skeletonContentStr += '</div>'
    })
    return skeletonContentStr
}

function processStyle(cssAst, stringify) {
    const currentRules = cssAst.stylesheet.rules
    let ultiRules = currentRules.filter((item) => {
        return item.selectors && item.selectors.every(selectItem => {
            return selectItem !== 'html' && !/body([\:\w]*)/.test(selectItem) && !['.weex-ct', '.weex-div'].includes(selectItem)
        })
    }).map(item => {
        item.declarations = item.declarations.map(declareItem => {
            const valueMatch = declareItem.value.match(/([\.\d]+)rem/)
            if (valueMatch) {
                declareItem.value = `${Number(valueMatch[1]) * 75}px`
            }
            // thanos不支持important css语法
            declareItem.value = declareItem.value.replace(/(\s*)!important/, '')
            return declareItem
        })
        item.selectors = item.selectors.map((selectItem) => {
            // 处理.container[data-v-507ee5e2]类型的选择器
            const dataVMatch = selectItem.match(/\[([\w\d\-]+)\]/)
            if (dataVMatch) {
                selectItem = selectItem.replace(dataVMatch[0], `-${dataVMatch[1]}`)
            }
            let selectItemStrs = selectItem.split(/\s?\./)
            const ultiSelectorStr = selectItemStrs[selectItemStrs.length - 1]
            selectItem = /^\./.test(selectItem) ? `.${ultiSelectorStr}` : ultiSelectorStr
            return selectItem
        })
        return item
    })
    cssAst.stylesheet.rules = ultiRules
    return stringify(cssAst)
}

module.exports = async function generateSkeletonComponent(astInfo, route, projectDir) {
    const htmlAst = astInfo.html.ast
    const cssAst = astInfo.css.ast
    const cssStringify = astInfo.css.stringify
    let skeletonContent = generateTemplate(htmlAst)
    let template = templateStr.replace('skeletonContent', skeletonContent)
    let style = styleStr.replace('cssContent', processStyle(cssAst, cssStringify))
    let skeletonComponent = [template, scriptStr, style].join('\n')
    const outDir = `${projectDir}/src${route.replace(/\/([^.\/]+).html/, '')}`
    if (!fs.existsSync(outDir)) {
        await promisify(fs.mkdir)(outDir)
    }
    const outputFilePath = `${outDir}/skeleton.vue`
    await promisify(fs.writeFile)(outputFilePath, skeletonComponent, { encoding: 'utf-8' })
    return skeletonComponent
}
