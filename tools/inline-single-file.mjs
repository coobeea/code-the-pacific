/**
 * 把 vite build 的产物内联成「自包含单文件 HTML」。
 *
 * 目的：交付形态从「index.html + assets/*.js + assets/*.css」收敛为一个 index.html，
 * 丢到任何静态托管（CloudBase / Lighthouse Nginx / GitHub Pages / 任意对象存储）都能直接跑，
 * 不再受 base 路径、资源 404、CDN 依赖影响。
 *
 * 用法：npm run build && node tools/inline-single-file.mjs
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const entry = resolve(dist, 'index.html')

if (!existsSync(entry)) {
  console.error('✗ 找不到 dist/index.html，请先运行 npm run build')
  process.exit(1)
}

let html = readFileSync(entry, 'utf8')
const inlined = []
const missing = []
let moduleCount = 0

/** 把 dist 里的绝对路径还原成本地文件路径 */
const toLocal = (href) => resolve(dist, href.replace(/^\/+/, ''))

// ① 内联 CSS：<link rel="stylesheet" href="/assets/xxx.css">
html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, (tag) => {
  const m = tag.match(/href="([^"]+)"/)
  if (!m) return tag
  const file = toLocal(m[1])
  if (!existsSync(file)) { missing.push(m[1]); return '' }
  const css = readFileSync(file, 'utf8')
  inlined.push(basename(file))
  return `<style>\n${css}\n</style>`
})

// ② 内联 JS：<script type="module" src="/assets/xxx.js">
html = html.replace(/<script([^>]*)\ssrc="([^"]+)"([^>]*)>\s*<\/script>/g, (_t, pre, src, post) => {
  const file = toLocal(src)
  if (!existsSync(file)) { missing.push(src); return '' }
  let js = readFileSync(file, 'utf8')
  // 关键：脚本正文里若出现 </script> 会提前闭合标签，必须转义
  js = js.replace(/<\/script>/gi, '<\\/script>')
  inlined.push(basename(file))
  // 若产物不含 import / export / import.meta，降级为普通 script：
  // module 脚本在 file:// 协议下会被 CORS 拦截，普通 script 则可直接双击打开
  const needModule =
    /(^|[;\n])\s*import[\s{*"']/.test(js) ||
    /(^|[;\n])\s*export\s/.test(js) ||
    js.includes('import.meta')
  if (needModule) moduleCount++
  return `<script${needModule ? ' type="module"' : ''}>\n${js}\n</script>`
})

// ③ 内联 favicon：转成 data URI
html = html.replace(/<link[^>]*rel="icon"[^>]*>/g, (tag) => {
  const m = tag.match(/href="([^"]+)"/)
  if (!m) return tag
  const file = toLocal(m[1])
  if (!existsSync(file)) { missing.push(m[1]); return '' }
  const buf = readFileSync(file)
  const type = file.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
  inlined.push(basename(file))
  return `<link rel="icon" type="${type}" href="data:${type};base64,${buf.toString('base64')}">`
})

writeFileSync(entry, html, 'utf8')

// ④ 清理已被内联的资源
const removed = []
const assetsDir = resolve(dist, 'assets')
if (existsSync(assetsDir)) {
  for (const f of readdirSync(assetsDir)) {
    if (/\.(js|css|map)$/.test(f)) {
      unlinkSync(resolve(assetsDir, f))
      removed.push(f)
    }
  }
}

// ⑤ 自检：确认没有残留的外部引用
const leftovers = [...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map((m) => m[1])

const size = statSync(entry).size
console.log('✓ 已内联：', inlined.join(', ') || '（无）')
if (removed.length) console.log('✓ 已清理：', removed.join(', '))
if (missing.length) console.warn('⚠ 引用了但文件不存在：', missing.join(', '))
console.log(`✓ 单文件产出：dist/index.html — ${(size / 1024).toFixed(1)} KB`)
console.log(
  moduleCount
    ? `ℹ ${moduleCount} 个脚本需 ES module，须通过 http(s) 访问（file:// 双击不可用）`
    : '✓ 已降级为普通 script：本地双击也能直接打开'
)
console.log(
  leftovers.length
    ? `⚠ 仍有 ${leftovers.length} 处外部引用：${leftovers.join(', ')}（需一并上传）`
    : '✓ 完全自包含：无任何外部资源引用，可直接上传'
)
