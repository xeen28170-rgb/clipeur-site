import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const canvas = document.getElementById('scene')
const root = document.documentElement
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const small = matchMedia('(max-width: 760px)').matches
const rand = (a, b) => a + Math.random() * (b - a)

function start() {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' })
  } catch (e) {
    root.classList.add('no-3d')
    return
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.25 : 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const accCss = getComputedStyle(root).getPropertyValue('--acc').trim() || '#ff5a1f'
  const ACC = new THREE.Color(accCss)
  const glow = (k) => ACC.clone().multiplyScalar(k)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x07070a)
  scene.fog = new THREE.FogExp2(0x07070a, 0.02)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.32

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 420)

  scene.add(new THREE.HemisphereLight(0x6b6b80, 0x050505, 0.4))
  const key = new THREE.DirectionalLight(0xffd8c0, 0.7)
  key.position.set(6, 12, 10)
  scene.add(key)
  const cursorLight = new THREE.PointLight(ACC, 45, 16, 1.6)
  scene.add(cursorLight)
  const headLight = new THREE.PointLight(ACC, 30, 22, 1.6)
  scene.add(headLight)

  const unit = new THREE.BoxGeometry(1, 1, 1)
  const metal = new THREE.MeshStandardMaterial({ color: 0x16161c, metalness: 0.85, roughness: 0.36 })
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x0c0c10, metalness: 0.7, roughness: 0.55 })
  const metalCap = new THREE.MeshStandardMaterial({ color: 0x1d1d24, metalness: 0.9, roughness: 0.28 })
  const glowMat = new THREE.MeshBasicMaterial({ color: glow(2.4), toneMapped: false })
  const hotMat = new THREE.MeshBasicMaterial({ color: glow(4.2), toneMapped: false })
  const dimMat = new THREE.MeshStandardMaterial({ color: 0x26262f, metalness: 0.4, roughness: 0.5 })
  const m4 = new THREE.Matrix4()
  const col = new THREE.Color()

  const TRACKS = small ? 9 : 13
  const GAP = 2.3
  const Z0 = 16
  const Z1 = -150
  const LEN = Z0 - Z1
  const MID = (Z0 + Z1) / 2
  const W = TRACKS * GAP

  const base = new THREE.Mesh(unit, metalDark)
  base.scale.set(W + 5, 0.6, LEN + 2)
  base.position.set(0, -0.45, MID)
  scene.add(base)

  const tracks = new THREE.InstancedMesh(new RoundedBoxGeometry(GAP * 0.84, 0.3, LEN, 2, 0.08), metal, TRACKS)
  const xs = []
  for (let i = 0; i < TRACKS; i++) {
    const x = (i - (TRACKS - 1) / 2) * GAP
    xs.push(x)
    m4.makeTranslation(x, 0, MID)
    tracks.setMatrixAt(i, m4)
  }
  scene.add(tracks)

  const segs = []
  const bars = []
  xs.forEach((x, i) => {
    if (i % 3 === 1) {
      for (let z = Z0 - 1; z > Z1 + 1; z -= 0.34) {
        const env = Math.pow(Math.abs(Math.sin(z * 0.11) * Math.sin(z * 0.047 + i)), 0.7)
        bars.push({ x, z, amp: 0.08 + env * 0.95, ph: Math.random() * 6.28 })
      }
      return
    }
    let z = Z0 - rand(0, 3)
    while (z > Z1 + 4) {
      const len = rand(1.4, 7)
      if (Math.random() < 0.64) segs.push({ x, z: z - len / 2, len, heat: Math.random() })
      z -= len + rand(0.5, 3.6)
    }
  })

  const segBody = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.12), metalCap, segs.length)
  const segStrip = new THREE.InstancedMesh(unit, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), segs.length)
  segs.forEach((s, i) => {
    m4.makeScale(GAP * 0.66, 0.34, s.len)
    m4.setPosition(s.x, 0.32, s.z)
    segBody.setMatrixAt(i, m4)
    m4.makeScale(GAP * 0.24, 0.05, Math.max(0.4, s.len - 0.4))
    m4.setPosition(s.x, 0.5, s.z)
    segStrip.setMatrixAt(i, m4)
    segStrip.setColorAt(i, ACC)
  })
  scene.add(segBody, segStrip)

  const barMesh = new THREE.InstancedMesh(unit, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), bars.length)
  bars.forEach((b, i) => {
    col.copy(ACC).multiplyScalar(0.15 + b.amp * 1.4)
    barMesh.setColorAt(i, col)
  })
  scene.add(barMesh)

  const ticks = new THREE.InstancedMesh(unit, dimMat, Math.ceil(LEN) * 2)
  const tickGlow = new THREE.InstancedMesh(unit, glowMat, Math.ceil(LEN / 5) * 2)
  let ti = 0
  let gi = 0
  for (let z = Z0; z > Z1; z -= 1) {
    for (const side of [-1, 1]) {
      const major = Math.round(z) % 5 === 0
      m4.makeScale(major ? 0.9 : 0.45, 0.05, 0.07)
      m4.setPosition(side * (W / 2 + 1.2), 0, z)
      if (major) tickGlow.setMatrixAt(gi++, m4)
      else ticks.setMatrixAt(ti++, m4)
    }
  }
  ticks.count = ti
  tickGlow.count = gi
  scene.add(ticks, tickGlow)

  const head = new THREE.Group()
  const headBar = new THREE.Mesh(unit, hotMat)
  headBar.scale.set(W + 3, 0.06, 0.08)
  headBar.position.y = 0.62
  const sheetMat = new THREE.ShaderMaterial({
    uniforms: { c: { value: glow(1) }, a: { value: 0.55 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 c;uniform float a;varying vec2 vUv;void main(){float f=pow(1.-vUv.y,2.4)*a*smoothstep(0.,.1,vUv.x)*smoothstep(1.,.9,vUv.x);gl_FragColor=vec4(c*f,f);}',
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(W + 3, 6), sheetMat)
  sheet.position.y = 3.6
  head.add(headBar, sheet)
  scene.add(head)

  const FW = 1.6
  const FH = (FW * 16) / 9
  const glass = new THREE.MeshStandardMaterial({ color: 0x0d0d12, metalness: 0.75, roughness: 0.2, transparent: true, opacity: 0.84, side: THREE.DoubleSide })
  const plane = new THREE.PlaneGeometry(FW, FH)
  const faceGeo = new THREE.CircleGeometry(0.3, 32)
  const shoulderGeo = new THREE.CircleGeometry(0.58, 32, 0, Math.PI)
  const piece = (mat, w, h, d, x, y, z) => {
    const m = new THREE.Mesh(unit, mat)
    m.scale.set(w, h, d)
    m.position.set(x, y, z)
    return m
  }
  const frames = []
  const FRAMES = small ? 9 : 18
  for (let i = 0; i < FRAMES; i++) {
    const g = new THREE.Group()
    const t = 0.05
    const face = new THREE.Mesh(faceGeo, dimMat)
    face.position.set(0, 0.42, 0.01)
    const shoulders = new THREE.Mesh(shoulderGeo, dimMat)
    shoulders.position.set(0, -0.32, 0.01)
    const prog = rand(0.2, 0.9)
    g.add(
      new THREE.Mesh(plane, glass),
      piece(glowMat, FW + t, t, t, 0, FH / 2, 0),
      piece(glowMat, FW + t, t, t, 0, -FH / 2, 0),
      piece(glowMat, t, FH, t, -FW / 2, 0, 0),
      piece(glowMat, t, FH, t, FW / 2, 0, 0),
      face,
      shoulders,
      piece(hotMat, FW * 0.3, 0.11, 0.02, -0.18, -0.82, 0.03),
      piece(glowMat, FW * 0.2, 0.11, 0.02, 0.33, -0.82, 0.03),
      piece(dimMat, FW * 0.84, 0.03, 0.01, 0, -FH / 2 + 0.2, 0.02),
      piece(hotMat, FW * 0.84 * prog, 0.035, 0.015, -FW * 0.42 + (FW * 0.84 * prog) / 2, -FH / 2 + 0.2, 0.03)
    )
    const side = i % 2 ? 1 : -1
    g.position.set(side * rand(6.5, 14), rand(2.6, 9), Z0 - 6 - (i / FRAMES) * (LEN - 20) + rand(-3, 3))
    g.scale.setScalar(rand(0.85, 1.45))
    g.userData = { y: g.position.y, ph: Math.random() * 6.28, ry: -side * rand(0.15, 0.45) }
    frames.push(g)
    scene.add(g)
  }

  const TZ = Z1 - 6
  const RINGS = 16
  const tunnel = new THREE.Group()
  tunnel.position.set(0, 3, TZ)
  const ringGeo = new THREE.TorusGeometry(6.6, 0.07, 8, 140)
  const ringMats = []
  const PANELS = 14
  const panels = new THREE.InstancedMesh(new RoundedBoxGeometry(2.4, 0.9, 5.2, 2, 0.12), metal, RINGS * PANELS)
  const leds = new THREE.InstancedMesh(unit, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), RINGS * PANELS * 3)
  const q = new THREE.Quaternion()
  const zAxis = new THREE.Vector3(0, 0, 1)
  const v = new THREE.Vector3()
  const s3 = new THREE.Vector3()
  let li = 0
  for (let r = 0; r < RINGS; r++) {
    const ringMat = new THREE.MeshBasicMaterial({ color: glow(2.6), toneMapped: false })
    ringMats.push(ringMat)
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.z = -r * 6
    tunnel.add(ring)
    for (let p = 0; p < PANELS; p++) {
      const a = (p / PANELS) * Math.PI * 2 + (r % 2) * 0.22
      q.setFromAxisAngle(zAxis, a + Math.PI / 2)
      v.set(Math.cos(a) * 7.3, Math.sin(a) * 7.3, -r * 6 - 3)
      m4.compose(v, q, s3.set(1, 1, 1))
      panels.setMatrixAt(r * PANELS + p, m4)
      const n = Math.floor(rand(0, 4))
      for (let k = 0; k < 3; k++) {
        const on = k < n
        v.set(Math.cos(a) * 6.82, Math.sin(a) * 6.82, -r * 6 - 4.6 + k * 0.5)
        m4.compose(v, q, s3.set(on ? rand(0.4, 1.4) : 0.001, 0.05, 0.16))
        leds.setMatrixAt(li, m4)
        col.copy(ACC).multiplyScalar(Math.random() < 0.12 ? 5 : rand(1.4, 3))
        leds.setColorAt(li++, col)
      }
    }
  }
  tunnel.add(panels, leds)
  scene.add(tunnel)

  const dot = document.createElement('canvas')
  dot.width = dot.height = 64
  const dc = dot.getContext('2d')
  const grad = dc.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,.8)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  dc.fillStyle = grad
  dc.fillRect(0, 0, 64, 64)
  const dotTex = new THREE.CanvasTexture(dot)

  const N = small ? 700 : 1700
  const ePos = new Float32Array(N * 3)
  const eVel = new Float32Array(N * 3)
  const eCol = new Float32Array(N * 3)
  const spawn = (i, zc, fresh) => {
    ePos[i * 3] = rand(-W / 2 - 3, W / 2 + 3)
    ePos[i * 3 + 1] = fresh ? rand(0.3, 14) : rand(0.2, 0.8)
    ePos[i * 3 + 2] = zc - rand(-6, 64)
    eVel[i * 3] = rand(-0.15, 0.15)
    eVel[i * 3 + 1] = rand(0.5, 1.9)
    eVel[i * 3 + 2] = rand(-0.15, 0.15)
  }
  for (let i = 0; i < N; i++) {
    spawn(i, rand(Z1 + 60, Z0), true)
    col.copy(ACC).lerp(new THREE.Color(1, 0.85, 0.6), Math.random() * 0.6).multiplyScalar(rand(1.2, 3.2))
    eCol.set([col.r, col.g, col.b], i * 3)
  }
  const eGeo = new THREE.BufferGeometry()
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3))
  eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3))
  const embers = new THREE.Points(eGeo, new THREE.PointsMaterial({ size: 0.17, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }))
  embers.frustumCulled = false
  scene.add(embers)

  const S = small ? 600 : 1400
  const sPos = new Float32Array(S * 3)
  for (let i = 0; i < S; i++) {
    v.setFromSphericalCoords(rand(220, 300), rand(0.05, Math.PI * 0.55), rand(0, Math.PI * 2))
    sPos.set([v.x, v.y, v.z - 60], i * 3)
  }
  const sGeo = new THREE.BufferGeometry()
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
  const stars = new THREE.Points(sGeo, new THREE.PointsMaterial({ size: 1.3, map: dotTex, color: 0xffe2c8, transparent: true, opacity: 0.75, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }))
  scene.add(stars)

  const P = (x, y, z) => new THREE.Vector3(x, y, z)
  const camPath = new THREE.CatmullRomCurve3([P(-5, 7.5, 21), P(-5, 4.6, -8), P(6, 3.4, -42), P(-3, 4.8, -90), P(0, 3.4, -146), P(0, 3, -190)])
  const lookPath = new THREE.CatmullRomCurve3([P(-9, 0.4, -10), P(2, 0.6, -34), P(-2, 1, -68), P(0, 2.4, -150), P(0, 3, -200), P(0, 3, -260)])
  const introFrom = P(0, 30, 80)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.65 : 0.8, 0.5, 0.92)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  function resize() {
    const w = innerWidth
    const h = innerHeight
    renderer.setSize(w, h, false)
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(w, h)
    camera.aspect = w / h
    camera.fov = w < h ? 68 : 50
    camera.updateProjectionMatrix()
  }
  resize()
  addEventListener('resize', resize)

  const ndc = new THREE.Vector2(0, -0.25)
  const mouse = ndc.clone()
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const ray = new THREE.Raycaster()
  const hit = new THREE.Vector3(0, 0, -10)
  const tmp = new THREE.Vector3()
  const pulses = []
  let t = 0
  let moved = false

  addEventListener('pointermove', (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
    moved = true
  }, { passive: true })
  addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button,summary,input,textarea,select,label,.mock')) return
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    if (!ray.ray.intersectPlane(floor, tmp)) return
    pulses.push({ x: tmp.x, z: tmp.z, t0: t })
    for (let i = 0; i < N; i++) {
      const dx = ePos[i * 3] - tmp.x
      const dz = ePos[i * 3 + 2] - tmp.z
      const d = Math.hypot(dx, dz)
      if (d < 5 && ePos[i * 3 + 1] < 6) {
        const k = (5 - d) / 5
        eVel[i * 3] += (dx / (d + 0.01)) * 3.5 * k
        eVel[i * 3 + 1] += 4.5 * k
        eVel[i * 3 + 2] += (dz / (d + 0.01)) * 3.5 * k
      }
    }
  })

  const scrollP = () => {
    const max = document.documentElement.scrollHeight - innerHeight
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
  }
  let sp = scrollP()
  let intro = reduce ? 1 : 0
  const clock = new THREE.Clock()
  const pos = new THREE.Vector3()
  const look = new THREE.Vector3()

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05)
    if (!reduce) t += dt
    intro = Math.min(1, intro + dt / 2.8)
    const target = scrollP()
    sp = reduce ? target : sp + (target - sp) * Math.min(1, dt * 2.4)
    mouse.lerp(ndc, Math.min(1, dt * 3.5))

    camPath.getPointAt(sp, pos)
    lookPath.getPointAt(sp, look)
    pos.x += mouse.x * 1.7
    pos.y += mouse.y * 0.9
    look.x += mouse.x * 0.8
    look.y += mouse.y * 0.4
    const e = 1 - Math.pow(1 - intro, 3)
    camera.position.lerpVectors(introFrom, pos, e)
    camera.lookAt(look)

    ray.setFromCamera(mouse, camera)
    if (ray.ray.intersectPlane(floor, tmp) && tmp.distanceTo(camera.position) < 80) hit.lerp(tmp, Math.min(1, dt * 8))
    cursorLight.position.set(hit.x, 1.9, hit.z)
    cursorLight.intensity = moved ? 45 : 18

    const playZ = Z0 - 2 - ((t * 5.5) % (LEN - 8))
    head.position.z = playZ
    headLight.position.set(0, 2.2, playZ)

    for (let k = pulses.length - 1; k >= 0; k--) if (t - pulses[k].t0 > 1.8) pulses.splice(k, 1)
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i]
      const dzp = Math.max(0, Math.abs(s.z - playZ) - s.len / 2)
      let k = 0.12 + s.heat * s.heat * 0.9 + Math.sin(t * 1.6 + s.heat * 20) * 0.08
      k += 3.4 * Math.exp(-(dzp * dzp) / 5)
      const dx = s.x - hit.x
      const dzc = Math.max(0, Math.abs(s.z - hit.z) - s.len / 2)
      k += (moved ? 2.6 : 1) * Math.exp(-(dx * dx + dzc * dzc) / 7)
      for (const p of pulses) {
        const age = t - p.t0
        const d = Math.hypot(s.x - p.x, Math.max(0, Math.abs(s.z - p.z) - s.len / 2))
        const ring = d - age * 16
        k += 4 * Math.exp(-(ring * ring) / 2.5) * (1 - age / 1.8)
      }
      col.copy(ACC).multiplyScalar(k)
      segStrip.setColorAt(i, col)
    }
    segStrip.instanceColor.needsUpdate = true

    for (let i = 0; i < bars.length; i++) {
      const b = bars[i]
      const near = Math.exp(-((b.z - playZ) ** 2) / 30)
      const h = 0.04 + b.amp * (0.5 + 0.5 * Math.abs(Math.sin(t * 3.2 + b.ph + b.z * 0.4))) * (0.75 + near * 0.9)
      m4.makeScale(GAP * 0.5, h, 0.17)
      m4.setPosition(b.x, 0.15 + h / 2, b.z)
      barMesh.setMatrixAt(i, m4)
    }
    barMesh.instanceMatrix.needsUpdate = true

    for (const g of frames) {
      const u = g.userData
      g.position.y = u.y + Math.sin(t * 0.7 + u.ph) * 0.45
      g.rotation.y = u.ry + Math.sin(t * 0.35 + u.ph) * 0.18 + mouse.x * 0.25
      g.rotation.x = -mouse.y * 0.12 + Math.sin(t * 0.5 + u.ph) * 0.04
      g.rotation.z = Math.sin(t * 0.4 + u.ph) * 0.05
    }

    tunnel.children.forEach((c, i) => {
      if (c.isMesh && c.geometry === ringGeo) c.rotation.z = t * (i % 2 ? 0.12 : -0.12)
    })
    panels.parent.rotation.z = Math.sin(t * 0.2) * 0.05
    ringMats.forEach((m, i) => m.color.copy(ACC).multiplyScalar(1.6 + 1.6 * (0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.55))))

    const cz = camera.position.z
    for (let i = 0; i < N; i++) {
      const j = i * 3
      if (!reduce) {
        const dx = ePos[j] - hit.x
        const dz = ePos[j + 2] - hit.z
        const d2 = dx * dx + dz * dz
        if (moved && d2 < 6 && ePos[j + 1] < 5) {
          eVel[j] += dx * 0.6 * dt
          eVel[j + 1] += 1.6 * dt
          eVel[j + 2] += dz * 0.6 * dt
        }
        eVel[j] *= 1 - dt * 0.8
        eVel[j + 2] *= 1 - dt * 0.8
        eVel[j + 1] += (1.1 - eVel[j + 1]) * dt * 0.5
        ePos[j] += (eVel[j] + Math.sin(t * 1.3 + i) * 0.25) * dt
        ePos[j + 1] += eVel[j + 1] * dt
        ePos[j + 2] += eVel[j + 2] * dt
      }
      if (ePos[j + 1] > 15 || ePos[j + 2] > cz + 10 || ePos[j + 2] < cz - 75) spawn(i, Math.min(cz, Z0), false)
    }
    eGeo.attributes.position.needsUpdate = true

    stars.rotation.y = t * 0.004
    composer.render(dt)
  }

  let running = false
  const run = (on) => {
    if (on === running) return
    running = on
    renderer.setAnimationLoop(on ? frame : null)
    if (on) clock.getDelta()
  }
  run(true)
  document.addEventListener('visibilitychange', () => run(!document.hidden))
  requestAnimationFrame(() => root.classList.add('scene-on'))
}

start()
