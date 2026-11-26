export const CLIPS = [
  { scene: 'fps', words: ['IL', 'RESTE', 'UN', 'ROUND'], score: 94, seed: 3, len: 33 },
  { scene: 'neon', words: ['LE', 'CHAT', 'A', 'CRIÉ'], score: 88, seed: 7, len: 27 },
  { scene: 'race', words: ['JE', 'PEUX', 'PLUS', 'RESPIRER'], score: 71, seed: 11, len: 36 },
  { scene: 'arena', words: ['CLUTCH', '1V4', 'INCROYABLE'], score: 97, seed: 5, len: 24 },
  { scene: 'fps', words: ["T'AS", 'VU', 'CE', 'TIR ?'], score: 90, seed: 21, len: 19 },
  { scene: 'race', words: ['DERNIER', 'VIRAGE'], score: 83, seed: 17, len: 41 }
]

const W = 256
const H = 455

function rng(seed) {
  let a = seed * 2654435761
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rr(c, x, y, w, h, r) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

function poly(c, pts, fill) {
  c.beginPath()
  c.moveTo(pts[0], pts[1])
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1])
  c.closePath()
  c.fillStyle = fill
  c.fill()
}

function fps(c, t, acc, r) {
  let g = c.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#120c16')
  g.addColorStop(1, '#2b170c')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  poly(c, [0, 0, W, 0, 150, 180, 106, 180], '#0c0a10')
  g = c.createLinearGradient(0, 260, 0, H)
  g.addColorStop(0, '#2a1d16')
  g.addColorStop(1, '#4a2c18')
  poly(c, [0, H, W, H, 150, 260, 106, 260], g)
  poly(c, [0, 0, 106, 180, 106, 260, 0, H], '#1b1419')
  poly(c, [W, 0, 150, 180, 150, 260, W, H], '#221820')
  c.strokeStyle = 'rgba(255,255,255,.05)'
  c.lineWidth = 2
  for (let i = 1; i < 6; i++) {
    const k = i / 6
    c.beginPath()
    c.moveTo(106 * k, 180 * k)
    c.lineTo(106 * k, H - (H - 260) * k)
    c.moveTo(W - 106 * k, 180 * k)
    c.lineTo(W - 106 * k, H - (H - 260) * k)
    c.stroke()
  }
  g = c.createRadialGradient(128, 220, 2, 128, 220, 60)
  g.addColorStop(0, acc)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = g
  c.fillRect(60, 150, 136, 140)
  c.fillStyle = '#0a0a0d'
  c.fillRect(110, 186, 36, 72)
  const blink = Math.sin(t * 7 + r() * 6) > 0.86
  if (blink) {
    g = c.createRadialGradient(190, 330, 2, 190, 330, 70)
    g.addColorStop(0, 'rgba(255,240,200,.95)')
    g.addColorStop(0.3, acc)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = g
    c.fillRect(110, 250, 160, 160)
  }
  poly(c, [160, H, 196, 350, 226, 340, 256, 372, 256, H], '#09090c')
  poly(c, [190, 356, 214, 344, 222, 352, 198, 366], '#2b2b33')
  c.strokeStyle = 'rgba(255,255,255,.9)'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(128, 210); c.lineTo(128, 216)
  c.moveTo(128, 224); c.lineTo(128, 230)
  c.moveTo(118, 220); c.lineTo(124, 220)
  c.moveTo(132, 220); c.lineTo(138, 220)
  c.stroke()
  c.font = '600 9px system-ui, sans-serif'
  for (let i = 0; i < 3; i++) {
    const y = 40 + i * 16
    c.fillStyle = 'rgba(0,0,0,.5)'
    rr(c, 150, y - 10, 98, 13, 3)
    c.fill()
    c.fillStyle = i === 0 ? acc : 'rgba(255,255,255,.8)'
    c.fillText(['Xeen  ⌖  Bot_42', 'Xeen  ⌖  Kiro', 'Xeen  ⌖  Nox'][i], 155, y)
  }
  c.fillStyle = 'rgba(0,0,0,.5)'
  rr(c, 10, 402, 70, 10, 3)
  c.fill()
  c.fillStyle = '#3ecf8e'
  rr(c, 11, 403, 22, 8, 2)
  c.fill()
}

function race(c, t, acc, r) {
  let g = c.createLinearGradient(0, 0, 0, 230)
  g.addColorStop(0, '#140a24')
  g.addColorStop(0.7, '#5a1a2e')
  g.addColorStop(1, acc)
  c.fillStyle = g
  c.fillRect(0, 0, W, 230)
  c.save()
  c.beginPath()
  c.arc(128, 200, 52, Math.PI, 0)
  c.clip()
  g = c.createLinearGradient(0, 148, 0, 200)
  g.addColorStop(0, '#ffd27a')
  g.addColorStop(1, acc)
  c.fillStyle = g
  c.fillRect(70, 140, 120, 64)
  c.fillStyle = '#1a0c1c'
  for (let i = 0; i < 5; i++) c.fillRect(70, 172 + i * 6, 120, 1.5 + i * 0.6)
  c.restore()
  const pts = [0, 230]
  for (let x = 0; x <= W; x += 16) pts.push(x, 196 + r() * 26)
  pts.push(W, 230)
  poly(c, pts, '#1a0d20')
  c.fillStyle = '#0d0a12'
  c.fillRect(0, 230, W, H - 230)
  poly(c, [118, 230, 138, 230, 250, H, 6, H], '#1d1a22')
  c.strokeStyle = acc
  c.lineWidth = 3
  c.shadowColor = acc
  c.shadowBlur = 10
  c.beginPath()
  c.moveTo(118, 230); c.lineTo(6, H)
  c.moveTo(138, 230); c.lineTo(250, H)
  c.stroke()
  c.shadowBlur = 0
  c.fillStyle = 'rgba(255,255,255,.75)'
  const off = (t * 1.6) % 1
  for (let i = 0; i < 8; i++) {
    const k = (i + off) / 8
    const y = 230 + (H - 230) * k * k
    const w = 1 + 5 * k * k
    c.fillRect(128 - w / 2, y, w, 4 + 26 * k * k)
  }
  c.strokeStyle = 'rgba(255,255,255,.12)'
  c.lineWidth = 1
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2
    const d0 = 60 + ((t * 300 + i * 40) % 200)
    c.beginPath()
    c.moveTo(128 + Math.cos(a) * d0, 260 + Math.sin(a) * d0)
    c.lineTo(128 + Math.cos(a) * (d0 + 30), 260 + Math.sin(a) * (d0 + 30))
    c.stroke()
  }
  poly(c, [70, H, 90, 380, 166, 380, 186, H], '#121016')
  c.fillStyle = acc
  c.fillRect(92, 386, 18, 5)
  c.fillRect(146, 386, 18, 5)
}

function neon(c, t, acc, r) {
  let g = c.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#05060f')
  g.addColorStop(1, '#120a1c')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  c.fillStyle = 'rgba(255,230,200,.9)'
  c.beginPath()
  c.arc(196, 70, 18, 0, Math.PI * 2)
  c.fill()
  for (let layer = 0; layer < 2; layer++) {
    let x = -10
    while (x < W) {
      const w = 20 + r() * 34
      const h = (layer ? 120 : 190) + r() * (layer ? 90 : 120)
      const y = 330 - h
      c.fillStyle = layer ? '#0b0a12' : '#15121f'
      c.fillRect(x, y, w, h)
      for (let wy = y + 8; wy < 320; wy += 11) {
        for (let wx = x + 4; wx < x + w - 5; wx += 8) {
          const v = r()
          if (v < 0.35) {
            const on = Math.sin(t * 2 + v * 40) > -0.6
            c.fillStyle = on ? (v < 0.08 ? acc : 'rgba(255,214,150,.7)') : 'rgba(255,214,150,.12)'
            c.fillRect(wx, wy, 4, 5)
          }
        }
      }
      x += w + 4
    }
  }
  g = c.createLinearGradient(0, 330, 0, H)
  g.addColorStop(0, '#1a0f14')
  g.addColorStop(1, '#07060a')
  c.fillStyle = g
  c.fillRect(0, 330, W, H - 330)
  c.globalAlpha = 0.35
  c.fillStyle = acc
  for (let i = 0; i < 18; i++) c.fillRect(r() * W, 340 + r() * 110, 2 + r() * 10, 1.5)
  c.globalAlpha = 1
  const jump = Math.max(0, Math.sin(t * 2.2))
  c.strokeStyle = acc
  c.lineWidth = 2
  c.globalAlpha = jump * 0.8
  c.strokeRect(6, 6, W - 12, H - 12)
  c.globalAlpha = 1
}

function arena(c, t, acc, r) {
  c.fillStyle = '#08080c'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = 'rgba(255,255,255,.06)'
  c.lineWidth = 1
  const s = 18
  for (let y = 0; y < H + s; y += s * 0.86) {
    for (let x = ((y / (s * 0.86)) % 2) * (s / 2); x < W + s; x += s) {
      c.beginPath()
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + Math.PI / 6
        c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5)
      }
      c.closePath()
      c.stroke()
    }
  }
  const p = (t * 0.8) % 1
  for (let i = 0; i < 3; i++) {
    const q = (p + i / 3) % 1
    c.strokeStyle = acc
    c.globalAlpha = 1 - q
    c.lineWidth = 3
    c.beginPath()
    c.arc(128, 220, 20 + q * 110, 0, Math.PI * 2)
    c.stroke()
  }
  c.globalAlpha = 1
  const g = c.createRadialGradient(128, 220, 0, 128, 220, 60)
  g.addColorStop(0, 'rgba(255,240,210,.9)')
  g.addColorStop(0.35, acc)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = g
  c.fillRect(60, 150, 136, 140)
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2
    const d = 30 + ((t * 60 + r() * 200) % 160)
    c.fillStyle = i % 3 ? 'rgba(255,255,255,.7)' : acc
    c.fillRect(128 + Math.cos(a) * d, 220 + Math.sin(a) * d, 2, 2)
  }
  c.font = '800 11px system-ui, sans-serif'
  c.textAlign = 'center'
  c.fillStyle = 'rgba(255,255,255,.55)'
  c.fillText('4  ÉLIMINATIONS', 128, 140)
  c.textAlign = 'left'
}

const SCENES = { fps, race, neon, arena }

function captions(c, words, t, acc) {
  const step = 0.42
  const cycle = words.length * step + 1.2
  const k = Math.floor((t % cycle) / step)
  c.font = '900 27px "Bricolage", system-ui, sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  const lines = []
  let line = []
  for (const w of words) {
    const test = [...line, w].join(' ')
    if (line.length && c.measureText(test).width > 200) {
      lines.push(line)
      line = [w]
    } else line.push(w)
  }
  lines.push(line)
  let idx = 0
  const y0 = 318 - (lines.length - 1) * 17
  lines.forEach((ln, li) => {
    const total = c.measureText(ln.join(' ')).width
    let x = 128 - total / 2
    const y = y0 + li * 34
    for (const w of ln) {
      const ww = c.measureText(w).width
      const cx = x + ww / 2
      const active = idx === Math.min(k, words.length - 1) && k < words.length
      const shown = idx <= k
      if (shown) {
        c.save()
        c.translate(cx, y)
        if (active) c.scale(1.12, 1.12)
        c.lineJoin = 'round'
        c.lineWidth = 6
        c.strokeStyle = 'rgba(0,0,0,.9)'
        c.strokeText(w, 0, 0)
        c.fillStyle = active ? acc : '#fff'
        c.fillText(w, 0, 0)
        c.restore()
      }
      x += ww + c.measureText(' ').width
      idx++
    }
  })
  c.textAlign = 'left'
  c.textBaseline = 'alphabetic'
}

function ui(c, clip, t, acc) {
  let g = c.createLinearGradient(0, 250, 0, H)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,.65)')
  c.fillStyle = g
  c.fillRect(0, 250, W, H - 250)
  g = c.createLinearGradient(0, 0, 0, 60)
  g.addColorStop(0, 'rgba(0,0,0,.55)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = g
  c.fillRect(0, 0, W, 60)
  c.fillStyle = 'rgba(0,0,0,.55)'
  rr(c, 10, 10, 46, 20, 6)
  c.fill()
  c.fillStyle = clip.score >= 85 ? '#3ecf8e' : '#f5b041'
  c.font = '700 12px "Plex Mono", ui-monospace, monospace'
  c.fillText('★ ' + clip.score, 16, 24)
  const sec = Math.floor(t % clip.len)
  c.fillStyle = 'rgba(255,255,255,.85)'
  c.font = '500 10px "Plex Mono", ui-monospace, monospace'
  c.textAlign = 'right'
  c.fillText(`0:${String(sec).padStart(2, '0')} / 0:${clip.len}`, 246, 23)
  c.textAlign = 'left'
  c.fillStyle = '#ff3b3b'
  c.beginPath()
  c.arc(66, 20, 3.5, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = 'rgba(255,255,255,.9)'
  c.fillStyle = 'rgba(255,255,255,.9)'
  c.lineWidth = 2
  const ix = 232
  c.beginPath()
  c.moveTo(ix, 382)
  c.bezierCurveTo(ix - 14, 372, ix - 8, 360, ix, 368)
  c.bezierCurveTo(ix + 8, 360, ix + 14, 372, ix, 382)
  c.fill()
  rr(c, ix - 9, 396, 18, 13, 4)
  c.stroke()
  c.beginPath()
  c.moveTo(ix - 8, 430); c.lineTo(ix + 8, 422); c.lineTo(ix - 8, 414)
  c.stroke()
  c.fillStyle = 'rgba(255,255,255,.18)'
  c.fillRect(0, H - 4, W, 4)
  c.fillStyle = acc
  c.fillRect(0, H - 4, W * ((t % clip.len) / clip.len), 4)
}

export function drawClip(canvas, clip, t, acc) {
  const c = canvas.getContext('2d')
  c.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0)
  const r = rng(clip.seed)
  SCENES[clip.scene](c, t, acc, r)
  ui(c, clip, t, acc)
  captions(c, clip.words, t, acc)
}
