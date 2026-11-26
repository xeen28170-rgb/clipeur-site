import { CLIPS, drawClip } from './clipart.js?v=5'

const root = document.documentElement
const acc = getComputedStyle(root).getPropertyValue('--acc').trim() || '#ff5a1f'
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

const title = document.getElementById('title')
if (title && !reduce) {
  let i = 0
  const wrap = () => {
    const s = document.createElement('span')
    s.className = 'w'
    s.style.setProperty('--d', `${0.25 + i++ * 0.11}s`)
    return s
  }
  for (const node of [...title.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment()
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue
        if (/^\s+$/.test(part)) frag.append(part)
        else {
          const s = wrap()
          s.textContent = part
          frag.append(s)
        }
      }
      node.replaceWith(frag)
    } else {
      const s = wrap()
      node.replaceWith(s)
      s.append(node)
    }
  }
  title.classList.add('k')
}

const phone = document.getElementById('phone')
const rows = [...document.querySelectorAll('.mo')]
const peaks = [...document.querySelectorAll('.pk')]
const head = document.querySelector('.ph')
const area = document.querySelector('.hype-a')
const line = document.querySelector('.hype-l')
const AT = [0.54, 0.31, 0.87]
const SCORE = [94, 88, 71]
const SLOT = 5.8

if (phone && area) {
  const N = 150
  const ys = []
  for (let k = 0; k <= N; k++) {
    const x = k / N
    let v = 0.16 + 0.07 * Math.sin(x * 37) + 0.05 * Math.sin(x * 91 + 1) + 0.04 * Math.sin(x * 13 + 2)
    AT.forEach((p, i) => { v += (SCORE[i] / 100) * 0.78 * Math.exp(-((x - p) ** 2) / 0.0007) })
    ys.push(86 - Math.max(0.04, Math.min(0.98, v)) * 80)
  }
  const pts = ys.map((y, k) => `${((k / N) * 300).toFixed(1)},${y.toFixed(1)}`)
  line.setAttribute('d', 'M' + pts.join(' L'))
  area.setAttribute('d', 'M0,90 L' + pts.join(' L') + ' L300,90 Z')
  peaks.forEach((el) => {
    const i = +el.dataset.i
    const y = ys[Math.round(AT[i] * N)]
    el.style.left = AT[i] * 100 + '%'
    el.style.top = (y / 90) * 100 + '%'
  })

  const thumbs = rows.map((r) => r.querySelector('canvas'))
  let active = -1
  let t = 0
  let last = performance.now()
  let visible = true
  let drawnThumbs = false

  const paint = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    if (!reduce) t += dt
    const a = Math.floor(t / SLOT) % 3
    if (a !== active) {
      active = a
      rows.forEach((r, i) => r.classList.toggle('on', i === a))
      peaks.forEach((p) => p.classList.toggle('on', +p.dataset.i === a))
    }
    const local = reduce ? 2.2 : t % SLOT
    head.style.left = (AT[a] - 0.02 + (local / SLOT) * 0.04) * 100 + '%'
    drawClip(phone, CLIPS[a], local, acc)
    if (!drawnThumbs) {
      thumbs.forEach((c, i) => drawClip(c, CLIPS[i], 2.2, acc))
      drawnThumbs = true
    }
  }

  let lastPaint = 0
  const loop = (now) => {
    if (!visible) last = now
    else if (now - lastPaint > 33) {
      paint(now)
      lastPaint = now
    }
    if (!reduce) requestAnimationFrame(loop)
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting }).observe(phone)
  document.fonts.ready.then(() => {
    drawnThumbs = false
    paint(performance.now())
  })
  requestAnimationFrame(loop)
}
