<script setup>
import { ref, computed } from 'vue'
import PageShell from '../components/PageShell.vue'
import SectionTitle from '../components/SectionTitle.vue'
import DataPanel from '../components/DataPanel.vue'
import SourceList from '../components/SourceList.vue'
import Reveal from '../components/Reveal.vue'
import WingEmblem from '../components/WingEmblem.vue'
import economies from '../data/economies.json'

// E-03 定稿 = s10 便当分区 + s01 检索（数据联动筛选，服务技术 30%）
const kw = ref('')
const region = ref('全部')
const regions = ['全部', '东亚', '东南亚', '大洋洲', '北美', '南美', '欧亚']

const filtered = computed(() => {
  const k = kw.value.trim().toLowerCase()
  return economies.filter(
    (d) => (region.value === '全部' || d.region === region.value) && (!k || d.cn.toLowerCase().includes(k) || d.en.toLowerCase().includes(k) || d.batch.includes(k)),
  )
})

// 对比模式：勾选 2—3 个经济体并排对比（仅用真实字段，不编造 GDP/人口）
const compare = ref([])
function toggleCompare(id) {
  const i = compare.value.indexOf(id)
  if (i >= 0) compare.value.splice(i, 1)
  else if (compare.value.length < 3) compare.value.push(id)
}
const compareList = computed(() => compare.value.map((id) => economies.find((e) => e.id === id)))

const value = [
  { value: '21', label: '成员经济体' },
  { value: '>60%', label: '经济总量占世界' },
  { value: '≈48%', label: '贸易额占世界' },
  { value: '26亿', label: '覆盖人口（约世界 40%）' },
]
const batches = [
  { year: '1989', name: '创始成员', count: 12, members: '澳大利亚、文莱、加拿大、印度尼西亚、日本、韩国、马来西亚、新西兰、菲律宾、新加坡、泰国、美国' },
  { year: '1991', name: '第二批', count: 3, members: '中国、中国香港、中国台北' },
  { year: '1993', name: '第三批', count: 2, members: '墨西哥、巴布亚新几内亚' },
  { year: '1994', name: '第四批', count: 1, members: '智利' },
  { year: '1998', name: '第五批', count: 3, members: '秘鲁、俄罗斯、越南' },
]
</script>

<template>
  <PageShell>
    <section class="text-center py-6">
      <p class="text-[13px] tracking-[.2em] uppercase font-bold text-[var(--accent)]">E-03 · 亚太经济体互动百科</p>
      <h1 class="mt-2 text-[clamp(26px,5vw,44px)] font-black text-ink">读懂 21 个亚太经济体</h1>
      <p class="mt-2 text-muted">按中文名 / 英文名 / 批次检索，或按区域筛选。成员以 APEC 官网 21 个经济体为准。</p>
    </section>

    <!-- 开篇科普卡 -->
    <div class="bg-[var(--accent-tint)] border border-[var(--accent)] rounded-card p-5 mb-8">
      <h3 class="font-extrabold text-[var(--accent-ink)]">💡 为什么 APEC 的成员叫「经济体」而不是「国家」？</h3>
      <p class="text-sm text-muted mt-2">因为 APEC 合作进程主要处理<b class="text-ink">贸易与经济议题</b>，成员以<b class="text-ink">经济实体</b>身份相互交往。中国以主权国家身份、中国香港与中国台北以地区经济名义，于 1991 年 11 月正式加入。</p>
    </div>

    <!-- 21 羽翼彩蛋 -->
    <Reveal>
      <section class="my-10">
        <SectionTitle title="会标彩蛋 · 21 根羽翼" en="The 21 Wings" />
        <WingEmblem />
      </section>
    </Reveal>

    <!-- 含金量看板 -->
    <Reveal>
      <section class="my-8">
        <SectionTitle title="APEC 的含金量" en="The Weight of APEC" />
        <DataPanel :items="value" />
      </section>
    </Reveal>

    <!-- 检索 + 对比 -->
    <section class="my-8">
      <SectionTitle title="成员经济体" en="Member Economies" />
      <div class="mb-3 flex items-center gap-2 text-sm">
        <span class="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
        <span class="font-bold text-[var(--accent-ink)]">搜索结果</span>
        <span class="ml-auto text-muted">显示 <b class="text-[var(--accent-ink)]">{{ filtered.length }}</b> / {{ economies.length }} · 对比已选 <b class="text-[var(--accent-ink)]">{{ compare.length }}</b>/3</span>
      </div>
      <input
        v-model="kw"
        class="w-full border-2 border-[var(--accent)] rounded-card px-5 py-3 text-lg bg-card outline-none focus:ring-4 focus:ring-[var(--accent-tint)]"
        placeholder="搜索经济体内名称、英文名或批次，例如「新加坡」或 Singapore"
      />
      <div class="flex flex-wrap gap-2 mt-4 mb-6">
        <button
          v-for="r in regions"
          :key="r"
          @click="region = r"
          :class="['px-3 py-1 rounded-pill text-sm transition-colors duration-150', region === r ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : 'border border-line bg-card text-muted hover:bg-[var(--accent-tint)]']"
        >{{ r }}</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <article
          v-for="d in filtered"
          :key="d.id"
          class="bg-card border rounded-card p-4 transition-all duration-150"
          :class="compare.includes(d.id) ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-line'"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="text-lg font-bold text-ink flex items-center gap-2"><span class="text-2xl leading-none">{{ d.flag || '🏳' }}</span>{{ d.cn }}</div>
            <span class="text-[10px] font-bold bg-[var(--accent-tint)] text-[var(--accent-ink)] px-2 py-0.5 rounded-pill whitespace-nowrap">{{ d.region }}</span>
          </div>
          <div class="text-xs text-muted italic mt-1">{{ d.en }}</div>
          <div class="text-xs mt-2 flex justify-between"><span>加入 <b class="font-mono text-[var(--accent-ink)]">{{ d.year }}</b></span><span class="text-muted">{{ d.batch }}</span></div>
          <button
            class="mt-3 w-full text-xs font-bold rounded-lg border py-1.5 transition-colors"
            :class="compare.includes(d.id) ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]' : 'border-line text-muted hover:bg-[var(--accent-tint)]'"
            :disabled="!compare.includes(d.id) && compare.length >= 3"
            @click="toggleCompare(d.id)"
          >{{ compare.includes(d.id) ? '✓ 已加入对比' : '加入对比' }}</button>
        </article>
      </div>
      <p v-if="!filtered.length" class="text-center text-muted py-8">没有匹配的经济体，换个关键词试试。</p>
    </section>

    <!-- 对比结果 -->
    <section v-if="compare.length" class="my-10">
      <SectionTitle title="对比模式" en="Compare" />
      <div class="overflow-x-auto">
        <table class="w-full border-collapse bg-card rounded-card overflow-hidden text-sm">
          <tbody>
            <tr>
              <th class="text-left p-3 bg-surface text-muted font-semibold w-28">项目</th>
              <th v-for="c in compareList" :key="c.id" class="p-4 text-center font-extrabold text-ink border-l border-line">
                <div class="text-2xl">{{ c.flag || '🏳' }}</div>{{ c.cn }}
              </th>
            </tr>
            <tr class="border-t border-line">
              <td class="p-3 bg-surface text-muted font-semibold">英文名</td>
              <td v-for="c in compareList" :key="c.id" class="p-3 text-center italic text-muted border-l border-line">{{ c.en }}</td>
            </tr>
            <tr class="border-t border-line">
              <td class="p-3 bg-surface text-muted font-semibold">区域</td>
              <td v-for="c in compareList" :key="c.id" class="p-3 text-center border-l border-line">{{ c.region }}</td>
            </tr>
            <tr class="border-t border-line">
              <td class="p-3 bg-surface text-muted font-semibold">加入年份</td>
              <td v-for="c in compareList" :key="c.id" class="p-3 text-center font-mono border-l border-line">{{ c.year }}</td>
            </tr>
            <tr class="border-t border-line">
              <td class="p-3 bg-surface text-muted font-semibold">加入日期</td>
              <td v-for="c in compareList" :key="c.id" class="p-3 text-center font-mono border-l border-line">{{ c.join }}</td>
            </tr>
            <tr class="border-t border-line">
              <td class="p-3 bg-surface text-muted font-semibold">批次</td>
              <td v-for="c in compareList" :key="c.id" class="p-3 text-center border-l border-line">{{ c.batch }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-xs text-muted mt-2">对比仅使用 APEC 官方公开的成员信息（区域 / 加入时间 / 批次）；各经济体 GDP、人口等指标口径不一，此处不臆造。</p>
    </section>

    <!-- 加入批次时间轴 -->
    <Reveal>
      <section class="my-10">
        <SectionTitle title="加入时间轴 · 五个批次" en="Accession Batches" />
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div v-for="b in batches" :key="b.year" class="bg-card border border-line rounded-lg p-4">
            <div class="text-2xl font-black text-[var(--accent-ink)] font-mono">{{ b.year }}</div>
            <div class="text-xs font-bold text-ink mt-1">{{ b.name }} · {{ b.count }} 个</div>
            <p class="text-xs text-muted mt-2 leading-relaxed">{{ b.members }}</p>
          </div>
        </div>
      </section>
    </Reveal>

    <!-- 南山视角 -->
    <section class="my-10 bg-card border border-line rounded-card p-5">
      <SectionTitle title="南山视角" en="Nanshan Perspective" />
      <p class="text-sm text-muted">亚太 21 经济体的贸易网络中，南山是活跃节点：<b class="text-park">前海深港合作区</b>（面向中国香港）、<b class="text-park">西部港区</b>（蛇口 / 妈湾国际海运，连接东南亚与大洋洲）、<b class="text-park">企业总部出海</b>（面向各经济体市场）。来源：深圳市南山区人民政府、前海管理局。</p>
    </section>

    <SourceList :items="[{ label: 'APEC 官网 · Our members', url: 'https://www.apec.org/who-we-are/our-members' }, { label: '工业和信息化部 · APEC 成员' }, { label: '央视网' }]" />
  </PageShell>
</template>
