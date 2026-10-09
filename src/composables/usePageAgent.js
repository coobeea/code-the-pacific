// page-agent 集成：按需懒加载，避免拖慢首屏；面板由悬浮按钮开关控制。
// 本地直连模式：浏览器直接调 DeepSeek（DeepSeek 放行 CORS，无需任何服务端）。
//   dev 和 build 出的离线静态页 dist/ 都能用，但要用 http 方式起服务（npm run preview），
//   别用 file:// 直接打开（Origin=null 会被 CORS 拦）。
// ⚠ key 会被打进前端产物，仅限本机自用，不要对外发布这个 dist。
import { ref, shallowRef } from 'vue'

const BASE_URL = import.meta.env.VITE_LLM_BASE || 'https://api.deepseek.com/v1'
const API_KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'deepseek-chat'

// 告诉智能体这是张什么页，引导它用滚动/跳转/开链接来帮忙
const SYSTEM_INSTRUCTIONS = [
  '这是「南山成长时光轴」——一条倒叙的单页滚动叙事，从 2026 APEC 主办城区回到 1979 蛇口开山炮。',
  '页面从上到下依次是 12 个里程碑（section.step）和结尾的「资料来源」区。',
  '你可以帮助用户：滚动到某个年份/里程碑、点击「回到 2026」按钮、展开或打开资料来源的官方链接、概括页面内容。',
  '操作要克制，不要提交任何表单、不要填写个人信息。',
].join(' ')

let agent = null

export function usePageAgent() {
  const open = ref(false)
  const ready = ref(false)
  const error = ref('')
  const agentRef = shallowRef(null)

  async function ensureAgent() {
    if (agent) return agent
    const { PageAgent } = await import('page-agent')
    agent = new PageAgent({
      baseURL: BASE_URL,
      model: MODEL,
      apiKey: API_KEY,       // 直连时带 key（从 .env.local 的 VITE_LLM_API_KEY 注入）
      language: 'zh-CN',
      enableMask: false,     // 这条页面是纯展示，遮罩反而挡住叙事，关掉
      instructions: { system: SYSTEM_INSTRUCTIONS },
    })
    agentRef.value = agent
    ready.value = true
    return agent
  }

  async function show() {
    try {
      error.value = ''
      const a = await ensureAgent()
      a.panel.show()
      open.value = true
    } catch (e) {
      error.value = e?.message || String(e)
      console.error('[page-agent] init failed:', e)
    }
  }

  function hide() {
    if (agent) agent.panel.hide()
    open.value = false
  }

  async function toggle() {
    if (open.value) hide()
    else await show()
  }

  function dispose() {
    if (agent) {
      try { agent.dispose() } catch { /* noop */ }
      agent = null
    }
    open.value = false
    ready.value = false
    agentRef.value = null
  }

  return { open, ready, error, agent: agentRef, show, hide, toggle, dispose }
}
