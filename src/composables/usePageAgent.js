// page-agent 集成：按需懒加载，避免拖慢首屏；面板由悬浮按钮开关控制。
// 本地直连模式：浏览器直接调 DeepSeek（DeepSeek 放行 CORS，无需任何服务端）。
//   dev 和 build 出的离线静态页 dist/ 都能用，但要用 http 方式起服务（npm run preview），
//   别用 file:// 直接打开（Origin=null 会被 CORS 拦）。
// ⚠ key 会被打进前端产物，仅限本机自用，不要对外发布这个 dist。
import { ref, shallowRef } from 'vue'
// 用 Vite ?raw 把纯文本文档编译进产物（构建时内联为字符串，运行时零请求）
import instructionsRaw from '../data/agent-instructions.txt?raw'
import referenceRaw from '../data/agent-reference.txt?raw'

const BASE_URL = import.meta.env.VITE_LLM_BASE || 'https://api.deepseek.com/v1'
const API_KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'deepseek-chat'

// 把两份文档拼成完整的 system prompt：身份+规则 + 参考资料
// 以后要改 AI 的行为或知识范围，只改 txt 文件，不动代码
const SYSTEM_INSTRUCTIONS = instructionsRaw.trim() + '\n\n' + referenceRaw.trim()

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
