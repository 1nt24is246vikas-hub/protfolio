import { useEffect, useRef, useState } from 'react'

const modelUrl = import.meta.env.VITE_AVATAR_MODEL_URL

export default function TalkingAvatar({ speaking, motionEnabled, mouthLevelRef, gesturePhase }) {
  const hostRef = useRef(null)
  const animationStateRef = useRef(null)
  const [nearViewport, setNearViewport] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [modelError, setModelError] = useState(false)
  animationStateRef.current = { speaking, motionEnabled, mouthLevelRef, gesturePhase }

  useEffect(() => {
    const host = hostRef.current
    if (!host || !('IntersectionObserver' in window)) {
      setNearViewport(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true)
        observer.disconnect()
      }
    }, { rootMargin: '180px' })
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!nearViewport || !modelUrl || !hostRef.current) return undefined

    let disposed = false
    let frameId
    let renderer
    let mixer
    let activeAction
    let lastGesturePhase = -1
    let gestureActions = []
    let idleAction
    let head
    const eyes = []
    let morphTargets = []
    const visemeTargets = []
    let blinkTargets = []
    let expressionTargets = []
    let scene
    let resizeObserver
    let resourcesDisposed = false
    const host = hostRef.current
    const clock = { last: 0, elapsed: 0, nextBlink: 2.5, blinkUntil: 0 }
    const disposeModel = (root) => {
      root.traverse((object) => {
        if (!object.isMesh) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value?.isTexture) value.dispose()
          })
          material.dispose()
        })
      })
    }
    const disposeResources = () => {
      if (resourcesDisposed) return
      resourcesDisposed = true
      resizeObserver?.disconnect()
      renderer?.dispose()
      renderer?.domElement.remove()
      if (scene) disposeModel(scene)
    }

    const initialize = async () => {
      try {
        const [{ default: THREE }, { GLTFLoader }] = await Promise.all([
          import('three'),
          import('three/addons/loaders/GLTFLoader.js'),
        ])
        if (disposed) return

        scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
        camera.position.set(0, 0, 4.5)
        const group = new THREE.Group()
        scene.add(group)

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1
        host.appendChild(renderer.domElement)

        scene.add(new THREE.HemisphereLight(0xffffff, 0x6070a8, 2.1))
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
        keyLight.position.set(2, 3, 4)
        scene.add(keyLight)
        const fillLight = new THREE.DirectionalLight(0x9eafff, 1.2)
        fillLight.position.set(-3, 1, 2)
        scene.add(fillLight)

        const loader = new GLTFLoader()
        const gltf = await new Promise((resolve, reject) => loader.load(modelUrl, resolve, undefined, reject))
        if (disposed) {
          disposeModel(gltf.scene)
          return
        }

        const model = gltf.scene
        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        const center = bounds.getCenter(new THREE.Vector3())
        const height = Math.max(size.y, 0.01)
        model.scale.setScalar(2.5 / height)
        model.position.set(
          -center.x * model.scale.x,
          -bounds.min.y * model.scale.y,
          -center.z * model.scale.z,
        )
        group.add(model)
        camera.position.set(0, 1.15, 4.5)
        camera.lookAt(0, 1.15, 0)

        model.traverse((object) => {
          if (object.isBone && /head|neck/i.test(object.name) && !head) head = object
          if (object.isBone && /eye/i.test(object.name)) eyes.push(object)
          if (object.isMesh && object.morphTargetDictionary && object.morphTargetInfluences) {
            Object.entries(object.morphTargetDictionary).forEach(([name, index]) => {
              const target = { influences: object.morphTargetInfluences, index, name: name.toLowerCase() }
              if (/mouth.?open|jaw.?open/.test(target.name)) morphTargets.push(target)
              else if (/viseme.?aa|viseme.?oh|viseme.?eh/.test(target.name)) visemeTargets.push(target)
              if (/blink|eye.?close/.test(target.name)) blinkTargets.push(target)
              if (/mouth.?smile|smile/.test(target.name)) expressionTargets.push(target)
            })
          }
        })
        if (!morphTargets.length) {
          const openViseme = visemeTargets.find(({ name }) => /viseme.?aa/.test(name))
            || visemeTargets.find(({ name }) => /viseme.?oh/.test(name))
            || visemeTargets[0]
          if (openViseme) morphTargets = visemeTargets.filter(({ name }) => name === openViseme.name)
        }

        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model)
          const clips = gltf.animations
          const idleClip = clips.find((clip) => /idle|breath|stand/i.test(clip.name))
          idleAction = idleClip ? mixer.clipAction(idleClip) : null
          gestureActions = clips
            .filter((clip) => /talk|wave|gesture|point|explain/i.test(clip.name))
            .map((clip) => mixer.clipAction(clip))
          if (idleAction) {
            activeAction = idleAction
            idleAction.play()
          }
        }

        const resize = () => {
          const { width, height: hostHeight } = host.getBoundingClientRect()
          if (!width || !hostHeight || disposed) return
          renderer.setSize(width, hostHeight, false)
          camera.aspect = width / hostHeight
          camera.updateProjectionMatrix()
        }
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(host)
        resize()
        setModelReady(true)

        const render = (timestamp) => {
          if (disposed) return
          const {
            speaking: isSpeaking,
            motionEnabled: shouldAnimate,
            mouthLevelRef: currentMouthLevelRef,
            gesturePhase: currentGesturePhase,
          } = animationStateRef.current
          const delta = Math.min((timestamp - clock.last) / 1000 || 0, 0.05)
          clock.last = timestamp
          clock.elapsed += delta

          if (shouldAnimate) {
            const breath = Math.sin(clock.elapsed * 1.35) * 0.018
            group.position.y = breath
            group.rotation.y = Math.sin(clock.elapsed * 0.48) * 0.035
            if (head) {
              head.rotation.y = Math.sin(clock.elapsed * 0.62) * 0.035
              head.rotation.x = Math.sin(clock.elapsed * 0.83) * 0.018
            }
            eyes.forEach((eye, index) => {
              eye.rotation.y = Math.sin(clock.elapsed * 0.72 + index) * 0.035
              eye.rotation.x = Math.sin(clock.elapsed * 0.57 + index) * 0.018
            })

            if (mixer) mixer.update(delta)

            const mouth = isSpeaking ? Math.min(currentMouthLevelRef.current, 0.72) : 0
            morphTargets.forEach(({ influences, index }) => { influences[index] = mouth })
            expressionTargets.forEach(({ influences, index }) => { influences[index] = isSpeaking ? 0.12 : 0 })

            if (timestamp > clock.nextBlink) {
              clock.blinkUntil = timestamp + 140
              clock.nextBlink = timestamp + 2600 + Math.random() * 3000
            }
            const blink = timestamp < clock.blinkUntil ? Math.sin(Math.PI * (timestamp - (clock.blinkUntil - 140)) / 140) : 0
            blinkTargets.forEach(({ influences, index }) => { influences[index] = blink })

            if (isSpeaking && gestureActions.length && currentGesturePhase !== lastGesturePhase) {
              const next = gestureActions[Math.abs(currentGesturePhase) % gestureActions.length]
              activeAction?.fadeOut(0.25)
              next.reset().fadeIn(0.25).play()
              activeAction = next
              lastGesturePhase = currentGesturePhase
            } else if (!isSpeaking && activeAction !== idleAction) {
              activeAction?.fadeOut(0.3)
              if (idleAction) idleAction.reset().fadeIn(0.3).play()
              activeAction = idleAction
              lastGesturePhase = -1
            }
          }

          renderer.render(scene, camera)
          frameId = window.requestAnimationFrame(render)
        }
        frameId = window.requestAnimationFrame(render)

      } catch (error) {
        if (!disposed) {
          disposeResources()
          console.error('Unable to load the configured talking avatar model.', error)
          setModelError(true)
        }
      }
    }

    initialize()
    return () => {
      disposed = true
      if (frameId) window.cancelAnimationFrame(frameId)
      disposeResources()
    }
  }, [nearViewport])

  return (
    <>
      <div
        className={`avatar-renderer ${modelReady ? 'is-model-ready' : ''}`}
        ref={hostRef}
        aria-label={modelReady ? 'Three-dimensional talking avatar' : modelError ? 'Avatar model could not be loaded; showing the profile photo instead.' : 'Profile photo shown until an optional three-dimensional avatar model is configured'}
        role="img"
      />
      {modelError && <span className="avatar-model-error" role="status">3D avatar unavailable; showing the profile photo.</span>}
    </>
  )
}
