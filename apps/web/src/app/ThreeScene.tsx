'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/** Soft circular glow sprite — avoids the default square gl_Point */
function makeCircleTexture(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.3, 'rgba(255,255,255,0.6)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = mount.clientHeight

    // ── Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene / Camera ───────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
    camera.position.set(0, 0, 22)

    const sprite = makeCircleTexture(64)
    const isMobile = W < 768

    // ── Star layer builder ───────────────────────────────────────────
    function makeLayer(
      count: number,
      spread: [number, number, number],
      colors: string[],
      size: number,
      opacity: number,
      depthBias = 0          // push z further back
    ) {
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      const threeColors = colors.map(c => new THREE.Color(c))

      for (let i = 0; i < count; i++) {
        // Keep particles away from the centre so content stays readable
        let x: number, y: number
        do {
          x = (Math.random() - 0.5) * spread[0]
          y = (Math.random() - 0.5) * spread[1]
        } while (Math.abs(x) < 3.5 && Math.abs(y) < 2.5)   // clear centre box

        pos[i * 3]     = x
        pos[i * 3 + 1] = y
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2] - depthBias

        const c = threeColors[Math.floor(Math.random() * threeColors.length)]
        col[i * 3]     = c.r
        col[i * 3 + 1] = c.g
        col[i * 3 + 2] = c.b
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))

      const mat = new THREE.PointsMaterial({
        size,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })

      return new THREE.Points(geo, mat)
    }

    // ── Layers (back → front) ────────────────────────────────────────
    const baseCount = isMobile ? 0.5 : 1

    // 1. Distant white star dust
    const dust = makeLayer(
      Math.round(600 * baseCount),
      [40, 26, 12],
      ['#c4b5fd', '#a5b4fc', '#bfdbfe', '#e0f2fe'],
      0.06, 0.45, 4
    )
    scene.add(dust)

    // 2. Mid violet / indigo stars
    const midStars = makeLayer(
      Math.round(280 * baseCount),
      [32, 20, 8],
      ['#a78bfa', '#818cf8', '#7c3aed'],
      0.12, 0.55, 2
    )
    scene.add(midStars)

    // 3. Bright accent cyan / violet foreground
    const accents = makeLayer(
      Math.round(80 * baseCount),
      [28, 18, 4],
      ['#67e8f9', '#a78bfa', '#f0abfc'],
      0.22, 0.7, 0
    )
    scene.add(accents)

    // ── Mouse parallax ───────────────────────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 0.6
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 0.4
    }
    window.addEventListener('mousemove', onMove)

    // ── Resize ───────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Animate ──────────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let raf: number

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()

      // Smooth mouse lerp
      mouse.x += (mouse.tx - mouse.x) * 0.03
      mouse.y += (mouse.ty - mouse.y) * 0.03

      // Layers drift at different speeds (parallax depth)
      dust.rotation.y     = t * 0.008  + mouse.x * 0.15
      dust.rotation.x     =              mouse.y * 0.1
      midStars.rotation.y = t * 0.014  + mouse.x * 0.25
      midStars.rotation.x =              mouse.y * 0.18
      accents.rotation.y  = t * 0.02   + mouse.x * 0.4
      accents.rotation.x  =              mouse.y * 0.28

      renderer.render(scene, camera)
    }
    tick()

    // ── Cleanup ──────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      sprite.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
