/**
 * electron-builder afterPack 钩子
 * 移除不需要的 Chromium locale 文件，仅保留中文和英文，缩小包体积约 10-30MB
 */
const path = require('path')
const fs = require('fs')

exports.default = async function (context) {
  const localeDir = path.join(context.appOutDir, 'locales')

  if (!fs.existsSync(localeDir)) {
    console.log('[afterPack] locales 目录不存在，跳过清理')
    return
  }

  // 只保留这些 locale
  const keepLocales = ['zh-CN.pak', 'en-US.pak', 'en.pak']

  const files = fs.readdirSync(localeDir)
  let removedCount = 0
  let savedBytes = 0

  for (const file of files) {
    if (!keepLocales.includes(file)) {
      const filePath = path.join(localeDir, file)
      try {
        const stat = fs.statSync(filePath)
        savedBytes += stat.size
        fs.unlinkSync(filePath)
        removedCount++
      } catch (err) {
        console.warn(`[afterPack] 无法删除 ${file}:`, err.message)
      }
    }
  }

  const savedMB = (savedBytes / 1024 / 1024).toFixed(2)
  console.log(`[afterPack] 已移除 ${removedCount} 个 locale 文件，节省约 ${savedMB} MB`)
}
