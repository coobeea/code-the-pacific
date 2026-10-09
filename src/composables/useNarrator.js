// 在页 AI 讲解：点里程碑卡片上的锚点 → 直接调 DeepSeek 生成一段口语化讲解词，就地展开。
// 与旧的 page-agent 不同，这里不操作页面、不需要用户提问，只做「这块内容的智能讲解」。
// 本地直连：浏览器直调 DeepSeek（放行 CORS），dev 与 build 后的 http 静态页都能用。
import { ref } from 'vue'
// 复用与问答版同一份资料做知识底座（构建时内联，运行时零请求）
import referenceRaw from '../data/agent-reference.txt?raw'

const BASE_URL = import.meta.env.VITE_LLM_BASE || 'https://api.deepseek.com/v1'
const API_KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'deepseek-chat'

// 讲解员专用语气（区别于「问答助手」：要主动、成段、有画面感，不提问不寒暄）
const NARRATION_SYSTEM = [
  '你是「南山成长时光轴」的现场讲解员，正带一群参观的中小学生和评委走这条 47 年的时间线。',
  '根据用户给出的这一段里程碑和参考资料，用生动、口语化、有画面感的中文讲解这一段。',
  '要求：3–5 句话，约 80–140 字；讲清它的背景、一个关键数字、以及它与 APEC/亚太的关联。',
  '直接开讲，不要提问、不要寒暄、不要复述标题、不要加小标题或列表符号。',
  '所有数据和事实必须来自参考资料，不得编造；拿不准就用页面给到的描述。',
].join('\n')

const KNOWLEDGE = referenceRaw.trim()

// 行内关键词「词语解析」专用语气（只讲这一个词/概念本身）
const TERM_SYSTEM = [
  '你是「南山成长时光轴」的讲解员。用户会给你一个词或概念，请就地解析它。',
  '用通俗易懂、面向中小学生的中文，讲清：这是什么 / 它的由来或含义 / 它与南山或 APEC 的关系。',
  '要求：2–4 句话，约 60–120 字；直接讲，不要重复词条本身、不要提问、不要加标题或列表。',
  '所有事实必须来自参考资料，不得编造。',
].join('\n')

export function useNarrator() {
  const busy = ref(false)

  // 给单个里程碑生成讲解词，支持 AbortController 取消
  async function narrate(item, signal) {
    const user = [
      `里程碑：${item.year} 年「${item.title}」（${item.era} 时代 · 主题「${item.apac}」）`,
      `页面标签：${item.tag}`,
      `页面描述：${item.desc}`,
      `与 APEC 的关联：${item.link}`,
      `关键数据：${(item.chips || []).join('、')}`,
      '',
      '请讲解这一段。',
    ].join('\n')

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        stream: false,
        messages: [
          { role: 'system', content: NARRATION_SYSTEM + '\n\n【参考资料】\n' + KNOWLEDGE },
          { role: 'user', content: user },
        ],
      }),
      signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${text.slice(0, 120)}`)
    }
    const data = await res.json()
    return (data?.choices?.[0]?.message?.content || '').trim()
  }

  // 解析正文里点选的某个关键词（复用同一套请求，只是提示词与上下文不同）
  async function narrateTerm(item, term, signal) {
    const user = [
      `待解析的词：「${term}」`,
      `它出现在这个里程碑里：${item.year} 年「${item.title}」`,
      `该段页面原文：${item.desc}`,
      '',
      '请解析这个词。',
    ].join('\n')

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        stream: false,
        messages: [
          { role: 'system', content: TERM_SYSTEM + '\n\n【参考资料】\n' + KNOWLEDGE },
          { role: 'user', content: user },
        ],
      }),
      signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${text.slice(0, 120)}`)
    }
    const data = await res.json()
    return (data?.choices?.[0]?.message?.content || '').trim()
  }

  return { narrate, narrateTerm, busy }
}
