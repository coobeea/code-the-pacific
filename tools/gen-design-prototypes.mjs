#!/usr/bin/env node
/**
 * gen-design-prototypes.mjs
 * ---------------------------------------------------------------------------
 * 《码上亚太》Code the Pacific —— 设计风格原型生成器
 *
 * 作者：小满 (xiaoman)
 * 用途：按「主题 × 设计风格」矩阵，批量生成可在浏览器直接打开的界面原型 HTML。
 *       目前 3 个主题 × 10 种风格 = 30 个原型，另生成 design/index.html 对比预览页。
 *
 * 为什么用生成器而不是手写 30 个文件：
 *   1. 命名与结构 100% 一致，不会出现"这个文件是别人写的、样式不统一"的问题
 *   2. 新增一种风格 = 在 STYLES 里加一项；新增一个主题 = 在 THEMES 里加一项
 *   3. 保证 30 个原型可随时重新生成，不会被手工改动搞乱
 *
 * 运行：node tools/gen-design-prototypes.mjs
 * 产物：design/prototypes/<主题>/<序号>-<风格>.html
 *       design/index.html
 *
 * ⚠️ 手工微调请注意：生成的文件会被下一次运行覆盖。
 *    需要长期保留的改动，请改本脚本里对应的 STYLES / THEMES 定义。
 * ---------------------------------------------------------------------------
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT = join(ROOT, 'design')

/* ===========================================================================
 * 署名（改这里即可全局改名）
 * ========================================================================= */
const AUTHOR = { name: '小满', slug: 'xiaoman', role: '设计原型与文档' }

/* ===========================================================================
 * 主题（3 个）—— 取自赛事官方四个选题方向中的三个
 * 未纳入 T4「活动落地类」：其核心功能（在线报名收集）在纯前端架构下无法实现，
 * 需改为跳转第三方表单，形态偏营销落地页，设计探索价值低于前三个。详见设计说明书。
 * ========================================================================= */
const THEMES = [
  {
    id: 't01-nanshan-city',
    code: 'T1',
    name: '城市名片类',
    ref: '《鹏城文化数字名片》',
    route: '#/02-nanshan',
    hero: {
      kicker: 'APEC 2026 · 深圳南山',
      title: '鹏城文化数字名片',
      sub: '从 1700 年的南头古城，到今天的万亿科创城区。一海一河一城一湖，八景连缀成南山。',
      cta: '开始漫游八景',
    },
    sectionA: { title: '南山八景', note: '2026 年 9 月揭晓' },
    itemsA: [
      ['古城宁南', '南头古城 · 1700 年'],
      ['蛇口记忆', '改革开放第一炮'],
      ['前海观潮', '制度创新试验田'],
      ['后海逐浪', '总部经济海岸'],
      ['深湾驭风', '超级总部基地'],
      ['燕晗栖羽', '华侨城生态绿心'],
      ['丽湖留仙', '西丽湖科教城'],
      ['伶仃烟渚', '内伶仃岛保护区'],
    ],
    sectionB: { title: '一海 · 一河 · 一城 · 一湖', note: '南山的四种打开方式' },
    itemsB: [
      ['海', '深圳湾 · 人才公园', '15 公里滨海休闲带'],
      ['河', '大沙河生态长廊', '13.7 公里 · 大学城段'],
      ['城', '南头古城', '近 1700 年历史'],
      ['湖', '环西丽湖碧道', '15.5 公里 · 科教融合'],
    ],
    stats: [
      ['1.01', '万亿元 GDP（2025）'],
      ['218', '家上市公司'],
      ['6037', '家国家高新技术企业'],
      ['860', '件 · 每万人发明专利'],
    ],
    note: '南山特色元素：八景命名取自本地地名与典故，配色取自海洋蓝与科创青，手绘轮廓图用于八景地图交互。',
  },
  {
    id: 't02-apac-pedia',
    code: 'T2',
    name: '知识科普类',
    ref: '《亚太经济体互动百科》',
    route: '#/03-pedia',
    hero: {
      kicker: '21 个成员经济体',
      title: '亚太经济体互动百科',
      sub: '从堪培拉到温哥华，从东京到利马。跨越太平洋的 21 个成员经济体，在这里被检索、被比较、被看见。',
      cta: '浏览经济体',
    },
    sectionA: { title: '成员经济体', note: '按 APEC 官方英文名排序' },
    itemsA: [
      ['澳大利亚', 'Australia'], ['文莱', 'Brunei Darussalam'], ['加拿大', 'Canada'],
      ['智利', 'Chile'], ['中国', 'China'], ['中国香港', 'Hong Kong, China'],
      ['印度尼西亚', 'Indonesia'], ['日本', 'Japan'], ['韩国', 'Korea'],
      ['马来西亚', 'Malaysia'], ['墨西哥', 'Mexico'], ['新西兰', 'New Zealand'],
      ['巴布亚新几内亚', 'Papua New Guinea'], ['秘鲁', 'Peru'], ['菲律宾', 'The Philippines'],
      ['俄罗斯', 'Russia'], ['新加坡', 'Singapore'], ['中国台北', 'Chinese Taipei'],
      ['泰国', 'Thailand'], ['美国', 'The United States'], ['越南', 'Viet Nam'],
    ],
    sectionB: { title: '检索与筛选', note: '原型交互区' },
    itemsB: [
      ['检索', '按名称 / 英文名搜索', '输入即筛选'],
      ['筛选', '按加入批次 / 区域', '多选标签'],
      ['对比', '并排比较 2–3 个经济体', '卡片对照'],
      ['详情', '单个经济体资料页', '数据 + 文化'],
    ],
    stats: [
      ['21', '个成员经济体'],
      ['1989', '年于堪培拉成立'],
      ['1991', '年中国加入'],
      ['2026', '年深圳主办'],
    ],
    note: '表述规范：中国以主权国家身份加入，中国香港与中国台北以地区经济名义加入，全站统一写作「中国香港」「中国台北」。',
  },
  {
    id: 't03-summit-info',
    code: 'T3',
    name: '峰会资讯类',
    ref: '《APEC 2026 深圳峰会主题网站》',
    route: '#/01-summit',
    hero: {
      kicker: '2026 年 11 月 18—19 日 · 深圳',
      title: 'APEC 2026 深圳峰会',
      sub: '建设亚太共同体，促进共同繁荣。开放、创新、合作——第 33 次 APEC 领导人非正式会议，深圳见。',
      cta: '查看议题与日程',
    },
    sectionA: { title: '峰会要点', note: '官方已公布信息' },
    itemsA: [
      ['时间', '2026 年 11 月 18—19 日'],
      ['地点', '中国 · 深圳'],
      ['会议', '第 33 次领导人非正式会议'],
      ['主题', '建设亚太共同体，促进共同繁荣'],
      ['优先领域', '开放 · 创新 · 合作'],
      ['主办城市', '继上海、北京后的第三座'],
    ],
    sectionB: { title: '会标寓意', note: '2025 年 12 月 12 日于深圳发布' },
    itemsB: [
      ['开放', '整体形态如张开双臂', '迎接八方来客'],
      ['创新', '鲲鹏蜕变向上', '象征发展动能转换'],
      ['合作', '21 根羽翼交织', '代表 21 个成员经济体'],
    ],
    stats: [
      ['21', '根交织羽翼'],
      ['11/18', '领导人会议开幕'],
      ['300+', '场全年系列活动'],
      ['3', '座中国主办城市'],
    ],
    note: '会标寓意「乘大势，共翱翔」。尚未官方公布的会场、详细议程等细节，页面一律标注「待官方发布」，不作推测。',
  },
]

/* ===========================================================================
 * 设计风格（10 种）
 * 每种风格 = 一套完整的设计语言：配色 / 字体 / 圆角 / 边框 / 阴影 / 布局变体
 * hero: centered | split | bleed | left
 * ========================================================================= */
const STYLES = [
  {
    id: '01-minimal-swiss', name: '极简瑞士', family: 'light', hero: 'centered',
    mood: '白底、大留白、发丝分隔线、零圆角。信息优先，几乎不用装饰色。',
    fit: '峰会资讯类（信息密度高的场景最稳）',
    css: `
body{background:#FFFFFF;color:#111111;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue","PingFang SC",sans-serif}
.wrap{max-width:1080px;margin:0 auto;padding:0 32px}
.hdr{border-bottom:1px solid #E5E5E5;padding:18px 0}
.hdr .wrap{display:flex;align-items:baseline;gap:24px}
.brand{font-size:14px;font-weight:500;letter-spacing:.02em}
.nav{margin-left:auto;display:flex;gap:18px;font-size:12px;color:#6B6B6B}
.nav a{color:inherit;text-decoration:none}
.hero{padding:96px 0 72px}
.hero .kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6B6B6B;margin-bottom:20px}
.hero h1{font-size:52px;line-height:1.08;letter-spacing:-.02em;font-weight:500;margin:0 0 20px}
.hero p{font-size:15px;line-height:1.85;color:#4A4A4A;max-width:560px;margin:0 0 32px}
.btn{display:inline-block;border:1px solid #111;padding:11px 22px;font-size:13px;text-decoration:none;color:#111;background:transparent}
.block{padding:56px 0;border-top:1px solid #E5E5E5}
.block-head{display:flex;align-items:baseline;gap:14px;margin-bottom:32px}
.block-head h2{font-size:15px;font-weight:500;margin:0;letter-spacing:.02em}
.block-head span{font-size:12px;color:#6B6B6B}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.card{border-top:1px solid #E5E5E5;padding:20px 20px 20px 0}
.card .k{font-size:10px;letter-spacing:.1em;color:#9A9A9A;margin-bottom:8px}
.card .t{font-size:15px;font-weight:500;margin-bottom:6px}
.card .d{font-size:12px;color:#6B6B6B;line-height:1.6}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
.stat .n{font-size:34px;font-weight:500;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.stat .l{font-size:12px;color:#6B6B6B;margin-top:6px}
.list{border-top:1px solid #E5E5E5}
.list .row{display:grid;grid-template-columns:180px 1fr;gap:24px;padding:18px 0;border-bottom:1px solid #E5E5E5;font-size:13px}
.list .row .a{color:#6B6B6B}
.foot{border-top:1px solid #E5E5E5;padding:28px 0 40px;font-size:11px;color:#9A9A9A;line-height:1.9}
.hero.centered{text-align:center}.hero.centered p{margin-left:auto;margin-right:auto}
.hero.split .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.hero.bleed .wrap{max-width:none;padding:0 32px}
.hero.bleed h1{font-size:76px}
.hero.left .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:48px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:34px}.hero.bleed h1{font-size:44px}.hero.split .wrap,.hero.left .wrap{grid-template-columns:1fr}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '02-ocean-gradient', name: '深海渐变', family: 'dark', hero: 'bleed',
    mood: '深海蓝渐变打底，半透明玻璃卡片，光晕描边。沉稳、官方、有水感。',
    fit: '峰会资讯类 / 城市名片类（海洋与湾区意象）',
    css: `
body{background:linear-gradient(160deg,#042C53 0%,#0C447C 45%,#185FA5 100%);color:#E6F1FB;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;min-height:100vh}
.wrap{max-width:1120px;margin:0 auto;padding:0 32px}
.hdr{padding:20px 0;border-bottom:1px solid rgba(181,212,244,.18)}
.hdr .wrap{display:flex;align-items:center;gap:24px}
.brand{font-size:14px;font-weight:500;letter-spacing:.04em}
.nav{margin-left:auto;display:flex;gap:20px;font-size:12px;color:#B5D4F4}
.nav a{color:inherit;text-decoration:none}
.hero{padding:104px 0 88px}
.hero .kicker{display:inline-block;font-size:11px;letter-spacing:.18em;padding:6px 12px;border:1px solid rgba(133,183,235,.5);border-radius:999px;color:#B5D4F4;margin-bottom:26px}
.hero h1{font-size:66px;line-height:1.05;letter-spacing:-.02em;font-weight:500;margin:0 0 24px;text-shadow:0 0 60px rgba(133,183,235,.35)}
.hero p{font-size:16px;line-height:1.85;color:#B5D4F4;max-width:600px;margin:0 0 36px}
.btn{display:inline-block;padding:13px 28px;border-radius:999px;background:rgba(181,212,244,.14);border:1px solid rgba(181,212,244,.45);color:#E6F1FB;text-decoration:none;font-size:13px;backdrop-filter:blur(8px)}
.block{padding:64px 0}
.block-head{margin-bottom:34px}
.block-head h2{font-size:20px;font-weight:500;margin:0 0 8px}
.block-head span{font-size:12px;color:#85B7EB}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card{padding:22px;border-radius:16px;background:rgba(230,241,251,.08);border:1px solid rgba(181,212,244,.22);backdrop-filter:blur(10px);box-shadow:0 8px 32px rgba(4,44,83,.4)}
.card .k{font-size:10px;letter-spacing:.12em;color:#85B7EB;margin-bottom:10px}
.card .t{font-size:16px;font-weight:500;margin-bottom:8px}
.card .d{font-size:12px;color:#B5D4F4;line-height:1.65}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat{padding:24px;border-radius:16px;background:rgba(230,241,251,.06);border:1px solid rgba(181,212,244,.18)}
.stat .n{font-size:38px;font-weight:500;font-variant-numeric:tabular-nums;color:#FFFFFF}
.stat .l{font-size:12px;color:#85B7EB;margin-top:8px}
.list{display:grid;gap:2px}
.list .row{display:grid;grid-template-columns:180px 1fr;gap:24px;padding:20px 22px;border-radius:12px;background:rgba(230,241,251,.05);font-size:13px}
.list .row .a{color:#85B7EB}
.foot{padding:36px 0 48px;margin-top:40px;border-top:1px solid rgba(181,212,244,.18);font-size:11px;color:#85B7EB;line-height:1.9}
.hero.split .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.hero.centered{text-align:center}.hero.centered p{margin-left:auto;margin-right:auto}
.hero.bleed .wrap{max-width:1200px}
.hero.left .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:48px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:40px}.hero.split .wrap,.hero.left .wrap{grid-template-columns:1fr}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '03-modern-chinese', name: '新中式', family: 'light', hero: 'split',
    mood: '宣纸米白、墨黑、朱红印章。宋体标题、细双线边框、竖排点缀。东方而不老气。',
    fit: '城市名片类（南山八景、南头古城最贴）',
    css: `
body{background:#F7F3EA;color:#2A2620;font-family:"Songti SC","STSong","PingFang SC",serif}
.wrap{max-width:1080px;margin:0 auto;padding:0 40px}
.hdr{padding:22px 0;border-bottom:1px solid #D9D0BE}
.hdr .wrap{display:flex;align-items:center;gap:22px}
.brand{font-size:15px;letter-spacing:.3em}
.nav{margin-left:auto;display:flex;gap:22px;font-size:13px;color:#6B6152}
.nav a{color:inherit;text-decoration:none}
.hero{padding:88px 0 72px}
.hero .wrap{display:grid;grid-template-columns:1fr auto;gap:56px;align-items:center}
.hero .kicker{font-size:12px;letter-spacing:.28em;color:#A8332A;margin-bottom:22px}
.hero h1{font-size:50px;line-height:1.22;letter-spacing:.06em;font-weight:400;margin:0 0 22px}
.hero p{font-size:15px;line-height:2;color:#5A5245;max-width:560px;margin:0 0 34px}
.btn{display:inline-block;padding:12px 26px;border:1px solid #A8332A;color:#A8332A;text-decoration:none;font-size:13px;letter-spacing:.12em;background:transparent}
.seal{width:104px;height:104px;border:3px solid #A8332A;color:#A8332A;display:flex;align-items:center;justify-content:center;font-size:26px;letter-spacing:.1em;line-height:1.15;text-align:center;border-radius:3px;flex:none}
.block{padding:56px 0;border-top:1px solid #D9D0BE}
.block-head{display:flex;align-items:baseline;gap:16px;margin-bottom:34px}
.block-head h2{font-size:22px;font-weight:400;letter-spacing:.14em;margin:0}
.block-head span{font-size:12px;color:#8A7F6C;letter-spacing:.1em}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.card{padding:22px;background:#FDFBF6;border:1px solid #E3DACA}
.card .k{font-size:11px;letter-spacing:.22em;color:#A8332A;margin-bottom:12px}
.card .t{font-size:17px;letter-spacing:.1em;margin-bottom:8px}
.card .d{font-size:12px;color:#7A7061;line-height:1.8}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.stat{padding:22px;border-left:2px solid #A8332A;background:#FDFBF6}
.stat .n{font-size:36px;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.stat .l{font-size:12px;color:#7A7061;margin-top:8px;letter-spacing:.08em}
.list{border-top:1px solid #E3DACA}
.list .row{display:grid;grid-template-columns:180px 1fr;gap:24px;padding:20px 0;border-bottom:1px solid #E3DACA;font-size:13px}
.list .row .a{color:#A8332A;letter-spacing:.1em}
.foot{padding:32px 0 44px;border-top:1px solid #D9D0BE;font-size:12px;color:#8A7F6C;line-height:2;letter-spacing:.04em}
.hero.centered{text-align:center}.hero.centered .wrap{grid-template-columns:1fr}
.hero.bleed .wrap,.hero.left .wrap{grid-template-columns:minmax(0,1fr) auto}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:32px}.hero .wrap{grid-template-columns:1fr}.seal{display:none}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '04-editorial', name: '杂志编辑', family: 'light', hero: 'bleed',
    mood: '大标题衬线字、粗顶栏、多栏正文、首字下沉、超细网格线。像一本特刊。',
    fit: '知识科普类（21 经济体适合做成长篇专题）',
    css: `
body{background:#FBF9F6;color:#161412;font-family:Georgia,"Songti SC","PingFang SC",serif}
.wrap{max-width:1140px;margin:0 auto;padding:0 40px}
.hdr{border-bottom:4px solid #161412;padding:16px 0 14px}
.hdr .wrap{display:flex;align-items:baseline;gap:24px}
.brand{font-size:16px;font-weight:600;letter-spacing:.02em}
.nav{margin-left:auto;display:flex;gap:20px;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#6B6357;font-family:-apple-system,"PingFang SC",sans-serif}
.nav a{color:inherit;text-decoration:none}
.hero{padding:64px 0 48px;border-bottom:1px solid #DED7CC}
.hero .kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#9A3B2A;font-family:-apple-system,"PingFang SC",sans-serif;margin-bottom:24px}
.hero h1{font-size:78px;line-height:1;letter-spacing:-.03em;font-weight:600;margin:0 0 26px}
.hero p{font-size:16px;line-height:1.8;color:#4A443C;max-width:640px;margin:0 0 34px}
.hero p::first-letter{float:left;font-size:56px;line-height:.9;padding:6px 10px 0 0;font-weight:600;color:#9A3B2A}
.btn{display:inline-block;padding:12px 24px;background:#161412;color:#FBF9F6;text-decoration:none;font-size:12px;letter-spacing:.1em;font-family:-apple-system,"PingFang SC",sans-serif}
.block{padding:52px 0;border-bottom:1px solid #DED7CC}
.block-head{display:flex;align-items:baseline;gap:18px;margin-bottom:30px;border-bottom:1px solid #161412;padding-bottom:12px}
.block-head h2{font-size:26px;font-weight:600;margin:0;letter-spacing:-.01em}
.block-head span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6B6357;font-family:-apple-system,"PingFang SC",sans-serif;margin-left:auto}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-left:1px solid #DED7CC}
.card{padding:20px 18px;border-right:1px solid #DED7CC;border-bottom:1px solid #DED7CC}
.card .k{font-size:22px;color:#9A3B2A;line-height:1;margin-bottom:12px;font-variant-numeric:tabular-nums}
.card .t{font-size:16px;font-weight:600;margin-bottom:8px}
.card .d{font-size:12px;color:#6B6357;line-height:1.7;font-family:-apple-system,"PingFang SC",sans-serif}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;padding-top:10px}
.stat .n{font-size:44px;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums;border-top:2px solid #9A3B2A;padding-top:12px;display:block}
.stat .l{font-size:12px;color:#6B6357;margin-top:8px;font-family:-apple-system,"PingFang SC",sans-serif}
.list{columns:2;column-gap:44px;column-rule:1px solid #DED7CC}
.list .row{display:block;break-inside:avoid;padding:14px 0;border-bottom:1px solid #DED7CC;font-size:13px;line-height:1.7}
.list .row .a{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9A3B2A;font-family:-apple-system,"PingFang SC",sans-serif;margin-bottom:4px}
.foot{padding:36px 0 48px;font-size:11px;color:#6B6357;line-height:1.9;font-family:-apple-system,"PingFang SC",sans-serif}
.hero.split .wrap{display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center}
.hero.centered{text-align:center}.hero.centered p{margin-left:auto;margin-right:auto}.hero.centered p::first-letter{float:none;font-size:inherit;color:inherit;padding:0}
.hero.left .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:48px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:42px}.hero.split .wrap,.hero.left .wrap{grid-template-columns:1fr}.list{columns:1}}
`,
  },
  {
    id: '05-neo-tech', name: '科技霓虹', family: 'dark', hero: 'bleed',
    mood: '纯黑底、青紫霓虹、等宽字体、细网格背景、发光描边。技术感最强。',
    fit: '知识科普类的检索界面 / 数据可视化页',
    css: `
body{background:#05070D;color:#E6F1FB;font-family:ui-monospace,"SFMono-Regular",Menlo,monospace;background-image:linear-gradient(rgba(34,211,238,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.055) 1px,transparent 1px);background-size:44px 44px}
.wrap{max-width:1120px;margin:0 auto;padding:0 32px}
.hdr{padding:18px 0;border-bottom:1px solid rgba(34,211,238,.22)}
.hdr .wrap{display:flex;align-items:center;gap:22px}
.brand{font-size:13px;letter-spacing:.16em;color:#22D3EE;text-shadow:0 0 12px rgba(34,211,238,.6)}
.nav{margin-left:auto;display:flex;gap:18px;font-size:11px;letter-spacing:.1em;color:#7DD3FC}
.nav a{color:inherit;text-decoration:none}
.hero{padding:92px 0 76px}
.hero .kicker{font-size:11px;letter-spacing:.24em;color:#A78BFA;margin-bottom:24px}
.hero h1{font-size:58px;line-height:1.08;letter-spacing:-.01em;font-weight:500;margin:0 0 24px;color:#FFFFFF;text-shadow:0 0 30px rgba(34,211,238,.5)}
.hero p{font-size:14px;line-height:1.9;color:#94A3B8;max-width:620px;margin:0 0 34px}
.btn{display:inline-block;padding:12px 26px;border:1px solid #22D3EE;color:#22D3EE;text-decoration:none;font-size:12px;letter-spacing:.14em;box-shadow:0 0 24px rgba(34,211,238,.28) inset}
.block{padding:56px 0;border-top:1px solid rgba(34,211,238,.16)}
.block-head{display:flex;align-items:baseline;gap:16px;margin-bottom:30px}
.block-head h2{font-size:16px;font-weight:500;letter-spacing:.1em;margin:0;color:#22D3EE}
.block-head span{font-size:11px;letter-spacing:.12em;color:#64748B}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.card{padding:20px;background:rgba(15,23,42,.72);border:1px solid rgba(34,211,238,.28);border-radius:4px}
.card .k{font-size:10px;letter-spacing:.16em;color:#A78BFA;margin-bottom:10px}
.card .t{font-size:15px;font-weight:500;margin-bottom:8px;color:#F0FDFF}
.card .d{font-size:11px;color:#7D8FA6;line-height:1.7}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.stat{padding:22px;background:rgba(15,23,42,.72);border:1px solid rgba(167,139,250,.3);border-radius:4px}
.stat .n{font-size:36px;color:#22D3EE;font-variant-numeric:tabular-nums;text-shadow:0 0 18px rgba(34,211,238,.55)}
.stat .l{font-size:11px;color:#7D8FA6;margin-top:8px;letter-spacing:.06em}
.list{display:grid;gap:1px;background:rgba(34,211,238,.16);border:1px solid rgba(34,211,238,.16)}
.list .row{display:grid;grid-template-columns:190px 1fr;gap:22px;padding:18px 20px;background:#0A0F1A;font-size:12px}
.list .row .a{color:#A78BFA;letter-spacing:.08em}
.foot{padding:34px 0 46px;margin-top:36px;border-top:1px solid rgba(34,211,238,.16);font-size:11px;color:#64748B;line-height:2;letter-spacing:.04em}
.hero.split .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:52px;align-items:center}
.hero.centered{text-align:center}.hero.centered p{margin-left:auto;margin-right:auto}
.hero.left .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:44px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:34px}.hero.split .wrap,.hero.left .wrap{grid-template-columns:1fr}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '06-soft-pastel', name: '柔和粉彩', family: 'light', hero: 'centered',
    mood: '奶油底、马卡龙点缀色、超大圆角、柔和投影、药丸标签。亲和力最高。',
    fit: '活动落地类 / 面向青少年的科普页',
    css: `
body{background:#FFF7F2;color:#3B3330;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}
.wrap{max-width:1080px;margin:0 auto;padding:0 32px}
.hdr{padding:18px 0}
.hdr .wrap{display:flex;align-items:center;gap:20px}
.brand{font-size:15px;font-weight:500;background:#FFFFFF;padding:8px 16px;border-radius:999px;box-shadow:0 4px 14px rgba(216,196,184,.4)}
.nav{margin-left:auto;display:flex;gap:10px;font-size:12px}
.nav a{color:#7A6A62;text-decoration:none;background:#FFFFFF;padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(216,196,184,.35)}
.hero{padding:72px 0 56px;text-align:center}
.hero .kicker{display:inline-block;font-size:11px;font-weight:500;letter-spacing:.06em;background:#FBE3A8;color:#7A5A12;padding:7px 16px;border-radius:999px;margin-bottom:24px}
.hero h1{font-size:48px;line-height:1.16;font-weight:500;margin:0 auto 22px;max-width:760px}
.hero p{font-size:15px;line-height:1.9;color:#7A6A62;max-width:560px;margin:0 auto 34px}
.btn{display:inline-block;padding:14px 30px;border-radius:999px;background:#F0997B;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:500;box-shadow:0 10px 24px rgba(240,153,123,.4)}
.block{padding:48px 0}
.block-head{text-align:center;margin-bottom:32px}
.block-head h2{font-size:22px;font-weight:500;margin:0 0 8px}
.block-head span{font-size:12px;color:#9A8B83}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.card{padding:24px;border-radius:24px;background:#FFFFFF;box-shadow:0 10px 30px rgba(216,196,184,.34)}
.card:nth-child(4n+1){background:#FFF1E8}.card:nth-child(4n+2){background:#EAF6F0}
.card:nth-child(4n+3){background:#F1EEFB}.card:nth-child(4n+4){background:#FDF6E3}
.card .k{font-size:10px;font-weight:500;letter-spacing:.08em;color:#A08A80;margin-bottom:10px}
.card .t{font-size:16px;font-weight:500;margin-bottom:8px}
.card .d{font-size:12px;color:#7A6A62;line-height:1.75}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.stat{padding:24px;border-radius:24px;background:#FFFFFF;box-shadow:0 10px 30px rgba(216,196,184,.3);text-align:center}
.stat .n{font-size:36px;font-weight:500;color:#D85A30;font-variant-numeric:tabular-nums}
.stat .l{font-size:12px;color:#7A6A62;margin-top:8px}
.list{display:grid;gap:12px}
.list .row{display:grid;grid-template-columns:190px 1fr;gap:20px;padding:18px 22px;border-radius:20px;background:#FFFFFF;font-size:13px;box-shadow:0 6px 20px rgba(216,196,184,.28)}
.list .row .a{color:#D85A30;font-weight:500}
.foot{padding:36px 0 48px;margin-top:24px;font-size:11px;color:#9A8B83;line-height:1.9;text-align:center}
.hero.split .wrap{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center;text-align:left}
.hero.left .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:44px;align-items:end;text-align:left}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:32px}.hero.split .wrap,.hero.left .wrap{grid-template-columns:1fr}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '07-glassmorphism', name: '玻璃拟态', family: 'dark', hero: 'split',
    mood: '彩色渐变背景 + 磨砂玻璃卡片 + 亮色细边。通透、现代、层次感强。',
    fit: '城市名片类 / 峰会资讯类（视觉冲击优先）',
    css: `
body{background:linear-gradient(135deg,#0F6E56 0%,#185FA5 42%,#534AB7 100%);color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;min-height:100vh}
.wrap{max-width:1100px;margin:0 auto;padding:0 32px}
.hdr{padding:20px 0;border-bottom:1px solid rgba(255,255,255,.22)}
.hdr .wrap{display:flex;align-items:center;gap:22px}
.brand{font-size:15px;font-weight:500;letter-spacing:.02em}
.nav{margin-left:auto;display:flex;gap:10px;font-size:12px}
.nav a{color:#FFFFFF;text-decoration:none;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.26);backdrop-filter:blur(12px)}
.hero{padding:96px 0 80px}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center}
.hero .kicker{display:inline-block;font-size:11px;letter-spacing:.14em;padding:7px 15px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(12px);margin-bottom:26px}
.hero h1{font-size:56px;line-height:1.1;font-weight:500;margin:0 0 24px}
.hero p{font-size:15px;line-height:1.9;color:rgba(255,255,255,.86);max-width:560px;margin:0 0 34px}
.btn{display:inline-block;padding:14px 28px;border-radius:999px;background:rgba(255,255,255,.92);color:#0C447C;text-decoration:none;font-size:13px;font-weight:500}
.preview{height:220px;border-radius:26px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.34);backdrop-filter:blur(22px);display:flex;align-items:center;justify-content:center;font-size:13px;color:rgba(255,255,255,.85);box-shadow:0 20px 60px rgba(4,44,83,.36)}
.block{padding:56px 0}
.block-head{margin-bottom:30px}
.block-head h2{font-size:21px;font-weight:500;margin:0 0 8px}
.block-head span{font-size:12px;color:rgba(255,255,255,.72)}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card{padding:22px;border-radius:20px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(18px);box-shadow:0 12px 36px rgba(4,44,83,.26)}
.card .k{font-size:10px;letter-spacing:.12em;color:rgba(255,255,255,.72);margin-bottom:10px}
.card .t{font-size:16px;font-weight:500;margin-bottom:8px}
.card .d{font-size:12px;color:rgba(255,255,255,.8);line-height:1.7}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat{padding:24px;border-radius:20px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.26);backdrop-filter:blur(18px)}
.stat .n{font-size:38px;font-weight:500;font-variant-numeric:tabular-nums}
.stat .l{font-size:12px;color:rgba(255,255,255,.72);margin-top:8px}
.list{display:grid;gap:12px}
.list .row{display:grid;grid-template-columns:190px 1fr;gap:20px;padding:18px 22px;border-radius:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(14px);font-size:13px}
.list .row .a{color:rgba(255,255,255,.72)}
.foot{padding:34px 0 48px;margin-top:36px;border-top:1px solid rgba(255,255,255,.22);font-size:11px;color:rgba(255,255,255,.72);line-height:1.95}
.hero.centered{text-align:center}.hero.centered .wrap{grid-template-columns:1fr}.hero.centered p{margin-left:auto;margin-right:auto}
.hero.bleed .wrap{max-width:1180px}
.hero.left .wrap{grid-template-columns:minmax(0,1fr) auto;gap:44px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:34px}.hero .wrap{grid-template-columns:1fr}.preview{display:none}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '08-neo-brutalism', name: '粗野主义', family: 'light', hero: 'left',
    mood: '粗黑描边、硬投影（无模糊）、高饱和色块、零圆角。态度最强，最不容易撞车。',
    fit: '知识科普类（个性表达）/ 城市名片类',
    css: `
body{background:#FFFDF5;color:#111111;font-family:"PingFang SC",-apple-system,"Helvetica Neue",sans-serif}
.wrap{max-width:1080px;margin:0 auto;padding:0 28px}
.hdr{padding:16px 0;border-bottom:3px solid #111}
.hdr .wrap{display:flex;align-items:center;gap:20px}
.brand{font-size:15px;font-weight:700;background:#FFD93D;border:3px solid #111;padding:6px 14px;box-shadow:4px 4px 0 #111}
.nav{margin-left:auto;display:flex;gap:10px;font-size:12px;font-weight:700}
.nav a{color:#111;text-decoration:none;background:#FFFFFF;border:3px solid #111;padding:6px 12px;box-shadow:3px 3px 0 #111}
.hero{padding:72px 0 56px}
.hero .kicker{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.1em;background:#7FD1AE;border:3px solid #111;padding:6px 12px;box-shadow:4px 4px 0 #111;margin-bottom:26px}
.hero h1{font-size:62px;line-height:1.02;font-weight:800;letter-spacing:-.02em;margin:0 0 22px;max-width:820px}
.hero p{font-size:15px;line-height:1.85;color:#3A3A3A;max-width:600px;margin:0 0 34px;font-weight:500}
.btn{display:inline-block;padding:14px 28px;background:#FF9F9F;border:3px solid #111;color:#111;text-decoration:none;font-size:13px;font-weight:700;box-shadow:6px 6px 0 #111}
.block{padding:52px 0;border-top:3px solid #111}
.block-head{display:flex;align-items:center;gap:14px;margin-bottom:28px}
.block-head h2{font-size:24px;font-weight:800;margin:0}
.block-head span{font-size:11px;font-weight:700;background:#111;color:#FFFDF5;padding:5px 10px}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.card{padding:20px;background:#FFFFFF;border:3px solid #111;box-shadow:5px 5px 0 #111}
.card:nth-child(2n){background:#FFF6CC}.card:nth-child(3n){background:#E4F5EC}
.card .k{font-size:10px;font-weight:700;letter-spacing:.12em;margin-bottom:10px}
.card .t{font-size:17px;font-weight:800;margin-bottom:8px}
.card .d{font-size:12px;color:#3A3A3A;line-height:1.7;font-weight:500}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.stat{padding:22px;background:#111;color:#FFFDF5;border:3px solid #111;box-shadow:5px 5px 0 #FFD93D}
.stat .n{font-size:40px;font-weight:800;font-variant-numeric:tabular-nums}
.stat .l{font-size:11px;font-weight:600;margin-top:8px;color:#D9D3C0}
.list{border:3px solid #111;box-shadow:5px 5px 0 #111;background:#FFFFFF}
.list .row{display:grid;grid-template-columns:190px 1fr;gap:20px;padding:16px 18px;border-bottom:3px solid #111;font-size:13px;font-weight:500}
.list .row:last-child{border-bottom:0}
.list .row .a{font-weight:800;color:#A32D2D}
.foot{padding:32px 0 46px;margin-top:32px;border-top:3px solid #111;font-size:11px;font-weight:500;color:#3A3A3A;line-height:1.95}
.hero.centered{text-align:center}.hero.centered h1{margin-left:auto;margin-right:auto}.hero.centered p{margin-left:auto;margin-right:auto}
.hero.split .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:44px;align-items:center}
.hero.left .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:44px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:36px}.hero.split .wrap,.hero.left .wrap{grid-template-columns:1fr}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '09-dashboard', name: '数据仪表盘', family: 'dark', hero: 'left',
    mood: '深色面板、密集信息、等宽数字、KPI 磁贴、细边框表格。专业感与信息密度最高。',
    fit: '城市名片类的数据板块 / 峰会资讯类的排期看板',
    css: `
body{background:#0B1220;color:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:0 28px}
.hdr{background:#0E1626;border-bottom:1px solid #1E293B;padding:14px 0}
.hdr .wrap{display:flex;align-items:center;gap:20px}
.brand{font-size:13px;font-weight:500;letter-spacing:.04em}
.dot{width:8px;height:8px;border-radius:50%;background:#34D399;display:inline-block;margin-right:8px}
.nav{margin-left:auto;display:flex;gap:6px;font-size:12px}
.nav a{color:#94A3B8;text-decoration:none;padding:7px 13px;border-radius:8px;border:1px solid transparent}
.hero{padding:52px 0 44px}
.hero .kicker{font-size:11px;letter-spacing:.14em;color:#38BDF8;margin-bottom:18px;font-family:ui-monospace,Menlo,monospace}
.hero h1{font-size:40px;line-height:1.15;font-weight:500;margin:0 0 18px;letter-spacing:-.01em}
.hero p{font-size:14px;line-height:1.8;color:#94A3B8;max-width:640px;margin:0 0 28px}
.btn{display:inline-block;padding:11px 22px;border-radius:8px;background:#1D4ED8;color:#FFFFFF;text-decoration:none;font-size:13px}
.block{padding:36px 0;border-top:1px solid #1E293B}
.block-head{display:flex;align-items:baseline;gap:14px;margin-bottom:20px}
.block-head h2{font-size:15px;font-weight:500;margin:0;letter-spacing:.04em}
.block-head span{font-size:11px;color:#64748B;font-family:ui-monospace,Menlo,monospace}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.card{padding:18px;border-radius:10px;background:#121A2B;border:1px solid #1E293B}
.card .k{font-size:10px;letter-spacing:.12em;color:#64748B;margin-bottom:8px;font-family:ui-monospace,Menlo,monospace}
.card .t{font-size:14px;font-weight:500;margin-bottom:6px}
.card .d{font-size:11px;color:#7D8FA6;line-height:1.65}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.stat{padding:20px;border-radius:10px;background:#121A2B;border:1px solid #1E293B;border-left:3px solid #38BDF8}
.stat:nth-child(2){border-left-color:#34D399}.stat:nth-child(3){border-left-color:#A78BFA}.stat:nth-child(4){border-left-color:#FBBF24}
.stat .n{font-size:32px;font-weight:500;font-variant-numeric:tabular-nums;font-family:ui-monospace,Menlo,monospace}
.stat .l{font-size:11px;color:#7D8FA6;margin-top:8px}
.list{border:1px solid #1E293B;border-radius:10px;overflow:hidden;background:#121A2B}
.list .row{display:grid;grid-template-columns:190px 1fr;gap:20px;padding:15px 18px;border-bottom:1px solid #1E293B;font-size:12.5px}
.list .row:last-child{border-bottom:0}
.list .row:nth-child(odd){background:#0F1726}
.list .row .a{color:#7D8FA6;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.06em}
.foot{padding:28px 0 40px;margin-top:24px;border-top:1px solid #1E293B;font-size:11px;color:#64748B;line-height:1.9;font-family:ui-monospace,Menlo,monospace}
.hero.centered{text-align:center}.hero.centered p{margin-left:auto;margin-right:auto}
.hero.split .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center}
.hero.bleed .wrap{max-width:1240px}
.hero.left .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:26px}.hero.split .wrap,.hero.left .wrap{grid-template-columns:1fr}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
  {
    id: '10-paper-zine', name: '纸质手账', family: 'light', hero: 'split',
    mood: '米黄纸纹、楷体、虚线胶带、贴纸式卡片、手写标注。最有人味，也最适合八景。',
    fit: '城市名片类（八景手账感最强）',
    css: `
body{background:#EFE7D6;color:#3A3226;font-family:"Kaiti SC","STKaiti","Songti SC",serif;background-image:repeating-linear-gradient(0deg,rgba(140,120,90,.055) 0 1px,transparent 1px 26px)}
.wrap{max-width:1060px;margin:0 auto;padding:0 32px}
.hdr{padding:20px 0;border-bottom:2px dashed #B7A98C}
.hdr .wrap{display:flex;align-items:center;gap:20px}
.brand{font-size:17px;letter-spacing:.1em}
.nav{margin-left:auto;display:flex;gap:16px;font-size:13px;color:#6B5F4A}
.nav a{color:inherit;text-decoration:none;border-bottom:1px dotted #A89878}
.hero{padding:76px 0 60px}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}
.hero .kicker{display:inline-block;font-size:12px;background:#D9E8DC;padding:6px 12px;color:#3A5A46;margin-bottom:22px;transform:rotate(-1.4deg)}
.hero h1{font-size:48px;line-height:1.24;font-weight:400;letter-spacing:.04em;margin:0 0 20px}
.hero p{font-size:15px;line-height:2.05;color:#5A5040;max-width:560px;margin:0 0 32px}
.btn{display:inline-block;padding:12px 26px;background:#C4623C;color:#FFF8EC;text-decoration:none;font-size:14px;letter-spacing:.1em;border-radius:3px;box-shadow:3px 3px 0 rgba(58,50,38,.28)}
.tape{height:34px;background:#F2E4B8;border-left:2px dashed #C9B98C;border-right:2px dashed #C9B98C;display:flex;align-items:center;justify-content:center;font-size:12px;color:#8A7A5A;transform:rotate(2.2deg);box-shadow:0 3px 10px rgba(90,75,50,.16)}
.block{padding:48px 0;border-top:2px dashed #B7A98C}
.block-head{display:flex;align-items:baseline;gap:16px;margin-bottom:28px}
.block-head h2{font-size:22px;font-weight:400;letter-spacing:.12em;margin:0}
.block-head span{font-size:12px;color:#8A7A5A}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.card{padding:20px;background:#FBF6E9;border:1px solid #DCCFB0;border-radius:3px;box-shadow:2px 3px 0 rgba(120,105,75,.16);transform:rotate(-.5deg)}
.card:nth-child(2n){transform:rotate(.7deg);background:#F7F1E0}
.card:nth-child(3n){transform:rotate(-.3deg);background:#FCF8EF}
.card .k{font-size:11px;letter-spacing:.16em;color:#A8522F;margin-bottom:10px}
.card .t{font-size:18px;letter-spacing:.08em;margin-bottom:8px}
.card .d{font-size:12px;color:#7A6C56;line-height:1.85}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.stat{padding:20px;background:#FBF6E9;border:1px dashed #C9B98C;border-radius:3px}
.stat .n{font-size:34px;font-variant-numeric:tabular-nums;color:#A8522F}
.stat .l{font-size:12px;color:#7A6C56;margin-top:8px}
.list{display:grid;gap:10px}
.list .row{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:15px 18px;background:#FBF6E9;border:1px solid #DCCFB0;border-radius:3px;font-size:13px}
.list .row .a{color:#A8522F;letter-spacing:.08em}
.foot{padding:30px 0 44px;margin-top:26px;border-top:2px dashed #B7A98C;font-size:12px;color:#8A7A5A;line-height:2}
.hero.centered{text-align:center}.hero.centered .wrap{grid-template-columns:1fr}.hero.centered p{margin-left:auto;margin-right:auto}
.hero.bleed .wrap{max-width:1140px}
.hero.left .wrap{grid-template-columns:minmax(0,1fr) auto;gap:44px;align-items:end}
@media(max-width:900px){.card-grid,.stats{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:30px}.hero .wrap{grid-template-columns:1fr}.tape{display:none}.list .row{grid-template-columns:1fr;gap:6px}}
`,
  },
]

/* ===========================================================================
 * 基础样式（所有风格共用：重置 + 骨架，不含配色）
 * ========================================================================= */
const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;line-height:1.6}
img{max-width:100%;display:block}
a{transition:opacity .15s}
a:hover{opacity:.72}
h1,h2,h3,p{margin-top:0}
.subnav{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;padding:10px 0;opacity:.85;letter-spacing:.04em}
.subnav b{font-weight:500;opacity:.75;margin-right:6px}
.subnav a{text-decoration:none;border:1px solid currentColor;border-radius:4px;padding:2px 7px;opacity:.6}
.subnav a.on{opacity:1;font-weight:500}
`

/* ===========================================================================
 * 渲染
 * ========================================================================= */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function itemsA(theme) {
  return theme.itemsA
    .map((it, i) => {
      const k = String(i + 1).padStart(2, '0')
      const [t, d] = it
      return `      <article class="card">
        <div class="k">${esc(k)}</div>
        <h3 class="t">${esc(t)}</h3>
        <p class="d">${esc(d || '')}</p>
      </article>`
    })
    .join('\n')
}

function itemsB(theme) {
  return theme.itemsB
    .map(([a, b, c]) => {
      const right = c ? `${esc(b)}　·　${esc(c)}` : esc(b)
      return `      <div class="row"><div class="a">${esc(a)}</div><div>${right}</div></div>`
    })
    .join('\n')
}

function statsBlock(theme) {
  return theme.stats
    .map(([n, l]) => `      <div class="stat"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`)
    .join('\n')
}

function previewBox(style, theme) {
  if (style.hero !== 'split') return ''
  return `        <div class="preview">${esc(theme.code)} · ${esc(theme.name)}　｜　风格原型预览区</div>`
}

function styleSwitch(theme, currentId) {
  const links = STYLES.map((s) => {
    const no = s.id.slice(0, 2)
    const on = s.id === currentId ? ' class="on"' : ''
    return `<a${on} href="${s.id}.html" title="${esc(s.name)}">${no}</a>`
  }).join('')
  return `    <div class="wrap"><nav class="subnav"><b>切换风格</b>${links}<a href="../index.html">全部 ${STYLES.length} 款</a></nav></div>`
}

function renderPage(theme, style) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(theme.name)} · ${esc(style.name)} — 码上亚太 设计原型</title>
<meta name="description" content="${esc(theme.ref)} 界面原型，设计风格：${esc(style.name)}。APEC 2026 深圳峰会主题网页，南山区教育科技节 AI 赛项主题三。">
<meta name="author" content="${esc(AUTHOR.name)} (${AUTHOR.slug})">
<meta name="theme-color" content="#FFFFFF">
<style>${BASE_CSS}${style.css}</style>
<!-- ============================================================
     设计原型 · 非生产代码
     主题：${theme.code} ${theme.name}（${theme.ref}）
     风格：${style.id} ${style.name}
     作者：${AUTHOR.name} (${AUTHOR.slug})
     生成：tools/gen-design-prototypes.mjs —— 手工修改会被重新生成覆盖
     ============================================================ -->
</head>
<body class="theme-${theme.id} style-${style.id.slice(0, 2)}">

  <header class="hdr">
    <div class="wrap">
      <div class="brand">码上亚太 Code the Pacific</div>
      <nav class="nav">
        <a href="#">首页</a>
        <a href="#">${esc(theme.name)}</a>
        <a href="#">全部入口</a>
      </nav>
    </div>
${styleSwitch(theme, style.id)}
  </header>

  <section class="hero ${style.hero}">
    <div class="wrap">
      <div>
        <div class="kicker">${esc(theme.hero.kicker)}</div>
        <h1>${esc(theme.hero.title)}</h1>
        <p>${esc(theme.hero.sub)}</p>
        <a class="btn" href="#">${esc(theme.hero.cta)}</a>
      </div>
${previewBox(style, theme)}
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div class="block-head"><h2>${esc(theme.sectionA.title)}</h2><span>${esc(theme.sectionA.note)}</span></div>
      <div class="card-grid">
${itemsA(theme)}
      </div>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div class="block-head"><h2>${esc(theme.sectionB.title)}</h2><span>${esc(theme.sectionB.note)}</span></div>
      <div class="list">
${itemsB(theme)}
      </div>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div class="block-head"><h2>关键数据</h2><span>数据来源见页脚</span></div>
      <div class="stats">
${statsBlock(theme)}
      </div>
    </div>
  </section>

  <footer class="foot">
    <div class="wrap">
      <div>${esc(theme.note)}</div>
      <div style="margin-top:12px">原型：${esc(theme.code)} ${esc(theme.name)} · ${esc(style.id)} ${esc(style.name)}　｜　作者：${esc(AUTHOR.name)}（${AUTHOR.slug}）· ${esc(AUTHOR.role)}</div>
      <div style="margin-top:6px">资料出处：赛事规则文档 / APEC 官网 / 深圳市政府与南山区政府公开信息　｜　本页为设计原型，内容以正式版为准</div>
    </div>
  </footer>

</body>
</html>
`
}

/* ===========================================================================
 * 对比预览页
 * ========================================================================= */
function renderIndex() {
  const cards = STYLES.map((s) => {
    const no = s.id.slice(0, 2)
    const frames = THEMES.map(
      (t) => `        <div class="shot">
          <iframe src="prototypes/${t.id}/${s.id}.html" loading="lazy" title="${esc(t.name)} · ${esc(s.name)}"></iframe>
          <div class="shot-k">${esc(t.code)} ${esc(t.name)}</div>
          <a class="shot-l" href="prototypes/${t.id}/${s.id}.html" target="_blank" rel="noopener">打开 ↗</a>
        </div>`
    ).join('\n')
    return `    <article class="style-card">
      <header>
        <div class="no">${no}</div>
        <div>
          <h3>${esc(s.name)}<span class="tag tag-${s.family}">${s.family === 'dark' ? '深色' : '浅色'}</span></h3>
          <p class="mood">${esc(s.mood)}</p>
          <p class="fit"><b>适合</b>${esc(s.fit)}</p>
        </div>
      </header>
      <div class="shots">
${frames}
      </div>
    </article>`
  }).join('\n')

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>设计风格总览 — 码上亚太 30 款界面原型</title>
<meta name="author" content="${esc(AUTHOR.name)} (${AUTHOR.slug})">
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#F4F5F7;color:#1A1C20;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue",sans-serif;line-height:1.6}
.wrap{max-width:1280px;margin:0 auto;padding:0 28px}
header.top{padding:48px 0 28px;border-bottom:1px solid #E2E4E9;background:#FFFFFF}
h1{font-size:30px;font-weight:500;letter-spacing:-.01em;margin:0 0 12px}
.lede{font-size:14px;color:#5B6070;max-width:760px;margin:0 0 20px;line-height:1.85}
.meta{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:#5B6070}
.meta span{background:#F4F5F7;border:1px solid #E2E4E9;border-radius:999px;padding:5px 12px}
.legend{padding:20px 0 4px;font-size:12px;color:#5B6070}
.legend b{font-weight:500;color:#1A1C20}
.style-card{background:#FFFFFF;border:1px solid #E2E4E9;border-radius:14px;padding:24px;margin:24px 0}
.style-card > header{display:grid;grid-template-columns:52px 1fr;gap:18px;align-items:start;margin-bottom:20px}
.no{font-size:26px;font-weight:500;color:#9AA0AE;font-variant-numeric:tabular-nums;line-height:1.1}
h3{font-size:17px;font-weight:500;margin:0 0 8px;display:flex;align-items:center;gap:10px}
.tag{font-size:11px;font-weight:400;border-radius:999px;padding:3px 10px;border:1px solid #E2E4E9;color:#5B6070;background:#F4F5F7}
.tag-dark{background:#1A1C20;color:#F4F5F7;border-color:#1A1C20}
.mood{font-size:13px;color:#3A3F4B;margin:0 0 8px;line-height:1.75}
.fit{font-size:12px;color:#7A8090;margin:0}
.fit b{font-weight:500;color:#3A3F4B;margin-right:8px}
.shots{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.shot{border:1px solid #E2E4E9;border-radius:10px;overflow:hidden;background:#FAFBFC;position:relative;height:544px;max-width:381px}
.shot iframe{width:1400px;height:2000px;border:0;transform:scale(.2721);transform-origin:0 0;display:block;pointer-events:none}
.shot-k{position:absolute;left:10px;bottom:34px;font-size:11px;background:rgba(26,28,32,.82);color:#fff;padding:4px 9px;border-radius:6px}
.shot-l{position:absolute;right:10px;bottom:10px;font-size:11px;color:#1A1C20;background:#FFFFFF;border:1px solid #E2E4E9;padding:5px 11px;border-radius:999px;text-decoration:none}
footer{padding:36px 0 60px;font-size:12px;color:#7A8090;line-height:1.9}
@media(max-width:1000px){.shots{grid-template-columns:1fr}.shot{margin:0 auto}}
</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    <h1>设计风格总览 · ${THEMES.length} 主题 × ${STYLES.length} 风格 = ${THEMES.length * STYLES.length} 款界面原型</h1>
    <p class="lede">每款风格都是一套完整的设计语言（配色 / 字体 / 圆角 / 边框 / 阴影 / 版式变体），并同时套用到 ${THEMES.length} 个内容主题上。横着看是"同一内容的不同视觉"，纵着看是"同一视觉的不同题材"——用来选定最终方向。</p>
    <div class="meta">
      <span>作者：${esc(AUTHOR.name)}（${AUTHOR.slug}）</span>
      <span>生成器：tools/gen-design-prototypes.mjs</span>
      <span>命名：&lt;主题&gt;/&lt;序号&gt;-&lt;风格&gt;.html</span>
      <span>项目：码上亚太 Code the Pacific</span>
    </div>
    <div class="legend"><b>怎么用：</b>点任意缩略图右下角「打开 ↗」看全尺寸效果；也可直接进某个风格页，用页内「切换风格」横向对比。</div>
  </div>
</header>
<main class="wrap">
${cards}
</main>
<footer>
  <div class="wrap">
    本页为设计原型集合，内容数据以正式版为准。设计风格探索属于「创意与原创性」与「交互与页面完成度」两项评分维度的前期准备。<br>
    作者：${esc(AUTHOR.name)}（${AUTHOR.slug}）· ${esc(AUTHOR.role)}　｜　生成时间：${new Date().toISOString().slice(0, 10)}
  </div>
</footer>
</body>
</html>
`
}

/* ===========================================================================
 * 主流程
 * ========================================================================= */
let written = 0
for (const theme of THEMES) {
  const dir = join(OUT, 'prototypes', theme.id)
  mkdirSync(dir, { recursive: true })
  for (const style of STYLES) {
    writeFileSync(join(dir, `${style.id}.html`), renderPage(theme, style), 'utf8')
    written++
  }
}
writeFileSync(join(OUT, 'index.html'), renderIndex(), 'utf8')

console.log(`作者 ${AUTHOR.name}(${AUTHOR.slug}) —— 生成完成`)
console.log(`主题 ${THEMES.length} 个：${THEMES.map((t) => `${t.code} ${t.name}`).join(' / ')}`)
console.log(`风格 ${STYLES.length} 款：${STYLES.map((s) => s.name).join(' / ')}`)
console.log(`原型 ${written} 个 + 索引 1 个 → design/`)
