<script setup>
import { ref, computed, reactive } from 'vue'

const submitted = ref(false)
const id = ref('')

const form = reactive({
  name: '',
  grade: '',
  school: '',
  contact: '',
  guardian: '',
  track: '',
  workType: '',
  consent: false,
  intro: '',
})

// 校验规则
const rules = {
  name: (v) => v.trim().length >= 2 && v.trim().length <= 10,
  grade: (v) => !!v,
  school: (v) => v.trim().length >= 2,
  contact: (v) => /^1[3-9]\d{9}$/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  guardian: (v) => v.trim().length >= 2,
  track: (v) => !!v,
  workType: (v) => !!v,
  consent: (v) => v === true,
  intro: () => true, // 选填
}

const touched = reactive({})
function touch(f) { touched[f] = true }

const valid = computed(() =>
  Object.keys(rules).every((k) => rules[k](form[k]))
)

function fieldOk(k) { return rules[k](form[k]) }
function fieldErr(k) { return touched[k] && !fieldOk(k) }

function submit() {
  Object.keys(form).forEach((k) => (touched[k] = true))
  if (!valid.value) return
  // 生成报名编号 + 暂存 localStorage
  const num = (JSON.parse(localStorage.getItem('ns-reg-count') || '0') + 1)
  localStorage.setItem('ns-reg-count', String(num))
  id.value = `NS-2026-${String(num).padStart(4, '0')}`
  const entry = { ...form, id: id.value, time: new Date().toISOString() }
  const list = JSON.parse(localStorage.getItem('ns-registrations') || '[]')
  list.push(entry)
  localStorage.setItem('ns-registrations', JSON.stringify(list))
  submitted.value = true
}

function reset() {
  submitted.value = false
  id.value = ''
  Object.keys(form).forEach((k) => { form[k] = k === 'consent' ? false : '' })
  Object.keys(touched).forEach((k) => delete touched[k])
}

const grades = ['四年级', '五年级', '六年级', '七年级', '八年级']
const tracks = ['开放', '创新', '合作']
const workTypes = ['图文', '短视频', '网页']
</script>

<template>
  <!-- 成功态 -->
  <div v-if="submitted" class="text-center py-10 px-4">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-2xl mb-4">✅</div>
    <h3 class="text-xl font-black text-ink">报名成功</h3>
    <p class="text-sm text-muted mt-2">你的报名编号：<b class="font-mono text-[var(--accent)]">{{ id }}</b></p>
    <p class="text-xs text-muted mt-1">（本演示仅存于你当前浏览器，无后端传输）</p>
    <button class="mt-6 text-sm underline text-[var(--accent)]" @click="reset">继续填写 / 查看表单</button>
  </div>

  <!-- 表单 -->
  <form v-else @submit.prevent="submit" class="space-y-5">
    <!-- 姓名 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">姓名 <span class="text-red-400">*</span></label>
      <input v-model="form.name" @blur="touch('name')" type="text" placeholder="2-10 字"
        :class="['w-full px-3 py-2 rounded-lg border text-sm transition-colors', fieldErr('name') ? 'border-red-400 bg-red-50' : touched.name && fieldOk('name') ? 'border-emerald-400' : 'border-line']" />
      <p v-if="fieldErr('name')" class="text-xs text-red-500 mt-1">请填写 2–10 个字的姓名</p>
    </div>

    <!-- 年级 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">年级 <span class="text-red-400">*</span></label>
      <select v-model="form.grade" @change="touch('grade')"
        :class="['w-full px-3 py-2 rounded-lg border text-sm', fieldErr('grade') ? 'border-red-400' : touched.grade && fieldOk('grade') ? 'border-emerald-400' : 'border-line']">
        <option value="" disabled>请选择年级</option>
        <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
      </select>
    </div>

    <!-- 学校 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">学校 <span class="text-red-400">*</span></label>
      <input v-model="form.school" @blur="touch('school')" type="text" placeholder="就读学校全称"
        :class="['w-full px-3 py-2 rounded-lg border text-sm', fieldErr('school') ? 'border-red-400' : touched.school && fieldOk('school') ? 'border-emerald-400' : 'border-line']" />
    </div>

    <!-- 联系方式 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">联系方式 <span class="text-red-400">*</span></label>
      <input v-model="form.contact" @blur="touch('contact')" type="text" placeholder="手机号或邮箱"
        :class="['w-full px-3 py-2 rounded-lg border text-sm', fieldErr('contact') ? 'border-red-400' : touched.contact && fieldOk('contact') ? 'border-emerald-400' : 'border-line']" />
      <p v-if="fieldErr('contact')" class="text-xs text-red-500 mt-1">请输入正确的手机号或邮箱格式</p>
    </div>

    <!-- 监护人联系方式 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">监护人联系方式 <span class="text-red-400">*</span></label>
      <input v-model="form.guardian" @blur="touch('guardian')" type="text" placeholder="家长手机（未成年人保护必填）"
        :class="['w-full px-3 py-2 rounded-lg border text-sm', fieldErr('guardian') ? 'border-red-400' : touched.guardian && fieldOk('guardian') ? 'border-emerald-400' : 'border-line']" />
    </div>

    <!-- 参与分论坛 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">参与分论坛 <span class="text-red-400">*</span></label>
      <div class="flex gap-3 flex-wrap">
        <label v-for="t in tracks" :key="t" class="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" :value="t" v-model="form.track" @change="touch('track')" class="accent-[var(--accent)]" />{{ t }}
        </label>
      </div>
    </div>

    <!-- 作品类型 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">作品类型 <span class="text-red-400">*</span></label>
      <div class="flex gap-3 flex-wrap">
        <label v-for="w in workTypes" :key="w" class="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" :value="w" v-model="form.workType" @change="touch('workType')" class="accent-[var(--accent)]" />{{ w }}
        </label>
      </div>
    </div>

    <!-- 监护人同意 -->
    <div>
      <label class="flex items-start gap-2 text-sm cursor-pointer">
        <input type="checkbox" v-model="form.consent" @change="touch('consent')" class="mt-0.5 accent-[var(--accent)]" />
        <span>我已阅读并同意：<b>监护人知情同意书</b>——本人系参赛学生的监护人，同意该学生参与本次活动并接受《个人信息保护法》相关条款。<span class="text-red-400">*</span></span>
      </label>
      <p v-if="fieldErr('consent')" class="text-xs text-red-500 mt-1">须勾选监护人同意才能提交</p>
    </div>

    <!-- 自我介绍 -->
    <div>
      <label class="block text-sm font-bold text-ink mb-1">自我介绍 <span class="text-xs text-muted">(选填，200 字内)</span></label>
      <textarea v-model="form.intro" maxlength="200" rows="3" placeholder="一句话介绍自己或想参加的理由"
        class="w-full px-3 py-2 rounded-lg border border-line text-sm resize-none"></textarea>
    </div>

    <!-- 提交 -->
    <button type="submit" :disabled="!valid"
      class="w-full py-3 rounded-lg font-bold text-sm transition-all"
      :class="valid ? 'bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
      {{ valid ? '提交报名' : '请完成必填项后提交' }}
    </button>

    <p class="text-[11px] text-muted text-center">本演示为纯前端表单（无后端），提交数据仅保存在你当前浏览器 localStorage 中。正式活动报名将通过腾讯问卷等第三方工具完成。</p>
  </form>
</template>
