import { useEffect, useRef, useState } from 'react'
import { Activity, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from 'lucide-react'
import TalkingAvatar from './TalkingAvatar.jsx'

const introduction = "Hi, I'm Vikas Patel K R. I'm an Information Science and Engineering student with a strong interest in Artificial Intelligence and software development. I enjoy building practical technology projects and learning new tools and technologies. Welcome to my portfolio. Feel free to explore my projects, skills, experience and achievements."
const audioUrl = import.meta.env.VITE_INTRO_AUDIO_URL

function findSentence(text, index) {
  const start = Math.max(text.lastIndexOf('.', index), text.lastIndexOf('?', index), text.lastIndexOf('!', index)) + 1
  const endings = ['.', '?', '!'].map((mark) => text.indexOf(mark, index)).filter((position) => position !== -1)
  const end = endings.length ? Math.min(...endings) + 1 : text.length
  return text.slice(start, end).trim()
}

function preferredVoice(voices) {
  const english = voices.filter((voice) => /^en(-|_)/i.test(voice.lang))
  return english.find((voice) => /\b(male|david|mark|daniel|guy|alex|fred|james|george|matthew|christopher|eric|roger|prabhat)\b/i.test(voice.name))
    || english.find((voice) => /en[-_]in/i.test(voice.lang))
    || english[0]
}

export default function TalkingAvatarExperience() {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const [motionEnabled, setMotionEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [caption, setCaption] = useState('Ready when you are.')
  const [error, setError] = useState('')
  const [gesturePhase, setGesturePhase] = useState(0)
  const [availableVoices, setAvailableVoices] = useState([])
  const utteranceRef = useRef(null)
  const audioRef = useRef(null)
  const analyserRef = useRef(null)
  const gainNodeRef = useRef(null)
  const audioContextRef = useRef(null)
  const audioSourceRef = useRef(null)
  const mouthLevelRef = useRef(0)
  const photoMouthRef = useRef(null)
  const playbackStartedRef = useRef(false)
  const autoPlayAttemptedRef = useRef(false)
  const speechStartedRef = useRef(false)
  const lastBoundaryRef = useRef({ time: 0, syllables: 2 })

  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    audioRef.current?.pause()
    audioContextRef.current?.close()
  }, [])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined

    const updateVoices = () => setAvailableVoices(window.speechSynthesis.getVoices())
    updateVoices()
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices)
  }, [])

  useEffect(() => {
    if (!speaking || paused || !motionEnabled) {
      mouthLevelRef.current = 0
      return undefined
    }

    let frameId
    const frequencies = analyserRef.current
      ? new Uint8Array(analyserRef.current.frequencyBinCount)
      : null
    const animateMouth = (now) => {
      const analyser = analyserRef.current
      if (analyser && frequencies) {
        analyser.getByteFrequencyData(frequencies)
        let average = 0
        for (let index = 2; index < 24; index += 1) average += frequencies[index]
        average /= 22
        mouthLevelRef.current = Math.min(average / 150, 0.78)
      } else {
        const { time, syllables } = lastBoundaryRef.current
        const elapsed = now - time
        const cycle = 125 + Math.min(syllables, 5) * 28
        const pulse = Math.max(0, Math.sin((elapsed / cycle) * Math.PI * 2))
        mouthLevelRef.current = 0.04 + pulse * 0.48
      }
      photoMouthRef.current?.style.setProperty('--mouth-scale', String(0.14 + mouthLevelRef.current * 1.3))
      frameId = window.requestAnimationFrame(animateMouth)
    }
    frameId = window.requestAnimationFrame(animateMouth)
    return () => window.cancelAnimationFrame(frameId)
  }, [speaking, paused, motionEnabled])

  const connectAudioMeter = async (audio) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    try {
      if (!audioContextRef.current) {
        const context = new AudioContextClass()
        const source = context.createMediaElementSource(audio)
        const analyser = context.createAnalyser()
        const gain = context.createGain()
        analyser.fftSize = 256
        source.connect(analyser)
        analyser.connect(gain)
        gain.connect(context.destination)
        audioContextRef.current = context
        audioSourceRef.current = source
        analyserRef.current = analyser
        gainNodeRef.current = gain
      }
      audio.volume = 1
      gainNodeRef.current.gain.value = muted ? 0 : 1
      await audioContextRef.current.resume()
    } catch (meterError) {
      console.warn('Audio visualization is unavailable; the introduction audio can still play.', meterError)
      analyserRef.current = null
    }
  }

  const playAudio = async () => {
    const audio = audioRef.current
    audio.currentTime = 0
    await connectAudioMeter(audio)
    await audio.play()
    setCaption(findSentence(introduction, 0))
    setSpeaking(true)
    setPaused(false)
  }

  const playSpeech = () => {
    if (!('speechSynthesis' in window)) {
      setError('Speech playback is not supported in this browser. Please try a current version of Chrome, Edge, Safari, or Firefox.')
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(introduction)
    const voice = preferredVoice(window.speechSynthesis.getVoices()) || preferredVoice(availableVoices)
    utterance.lang = voice?.lang || 'en-US'
    utterance.rate = 0.94
    utterance.pitch = 1
    utterance.volume = muted ? 0 : 1
    utterance.voice = voice || null
    speechStartedRef.current = false
    utterance.onstart = () => {
      speechStartedRef.current = true
      lastBoundaryRef.current = { time: performance.now(), syllables: 4 }
      setSpeaking(true)
      setPaused(false)
    }
    utterance.onboundary = (event) => {
      if (event.name && event.name !== 'word') return
      const index = event.charIndex || 0
      const word = introduction.slice(index).split(/\s/, 1)[0]
      const syllables = Math.max(1, word.match(/[aeiouy]+/gi)?.length || 1)
      lastBoundaryRef.current = { time: performance.now(), syllables }
      const nextCaption = findSentence(introduction, index)
      setCaption(nextCaption)
      if (/[.!?]$/.test(word)) setGesturePhase((phase) => phase + 1)
    }
    utterance.onend = () => {
      speechStartedRef.current = false
      autoPlayAttemptedRef.current = false
      setSpeaking(false)
      setPaused(false)
      setCaption('Introduction finished. Replay any time.')
      mouthLevelRef.current = 0
    }
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted') return
      speechStartedRef.current = false
      autoPlayAttemptedRef.current = false
      setSpeaking(false)
      setPaused(false)
      setError('The selected system voice could not finish speaking. Try Replay or choose another browser voice.')
    }
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const play = async () => {
    playbackStartedRef.current = true
    setError('')
    try {
      if (audioUrl) await playAudio()
      else playSpeech()
    } catch (playbackError) {
      console.error('Unable to play the portfolio introduction.', playbackError)
      setSpeaking(false)
      setPaused(false)
      setError('The introduction could not be played. Please try again or check the configured audio file.')
    }
  }

  const togglePlayback = async () => {
    try {
      if (!speaking && !paused) {
        await play()
        return
      }

      if (paused) {
        if (audioUrl) await audioRef.current.play()
        else window.speechSynthesis.resume()
        setPaused(false)
        setSpeaking(true)
        return
      }

      if (audioUrl) audioRef.current.pause()
      else window.speechSynthesis.pause()
      setPaused(true)
      setSpeaking(false)
    } catch (playbackError) {
      console.error('Unable to update introduction playback.', playbackError)
      setSpeaking(false)
      setPaused(false)
      setError('Playback could not be resumed. Please try Replay.')
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    window.speechSynthesis?.cancel()
    utteranceRef.current = null
    autoPlayAttemptedRef.current = false
    mouthLevelRef.current = 0
    setSpeaking(false)
    setPaused(false)
    setCaption('Ready when you are.')
  }

  const replay = async () => {
    stop()
    await play()
  }

  const toggleMute = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    if (audioRef.current) {
      if (gainNodeRef.current) {
        audioRef.current.volume = 1
        gainNodeRef.current.gain.value = nextMuted ? 0 : 1
      } else {
        audioRef.current.volume = nextMuted ? 0 : 1
      }
    }
    if (utteranceRef.current) utteranceRef.current.volume = nextMuted ? 0 : 1
  }

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      if (playbackStartedRef.current) return
      playbackStartedRef.current = true
      autoPlayAttemptedRef.current = true
      setCaption('Starting your introduction…')
      void play()
    }, 600)
    const fallbackTimer = window.setTimeout(() => {
      const playbackDidNotStart = audioUrl
        ? audioRef.current?.paused
        : !speechStartedRef.current
      if (playbackDidNotStart && autoPlayAttemptedRef.current) {
        setCaption('If you don’t hear audio, tap “Hear my introduction”.')
      }
    }, 5000)
    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(fallbackTimer)
    }
  }, [])

  return (
    <div className={`avatar-panel ${motionEnabled ? '' : 'motion-paused'}`}>
      <div className={`profile-placeholder ${speaking ? 'is-speaking' : ''}`}>
        <img src="/profile.jpg" alt="Vikas Patel KR" />
        <TalkingAvatar
          speaking={speaking}
          motionEnabled={motionEnabled}
          mouthLevelRef={mouthLevelRef}
          gesturePhase={gesturePhase}
        />
        <span className="photo-mouth" ref={photoMouthRef} aria-hidden="true" />
        <span className="avatar-speaking-indicator" aria-hidden="true">
          <i /><i /><i />
        </span>
      </div>
      <div className="avatar-controls" aria-label="Introduction playback controls">
        <button className="avatar-play-control" type="button" onClick={togglePlayback} aria-label={paused ? 'Resume introduction' : speaking ? 'Pause introduction' : 'Play introduction'}>
          {speaking ? <Pause size={15} /> : <Play size={15} />}
          <span>{speaking ? paused ? 'Resume' : 'Pause' : 'Hear my introduction'}</span>
        </button>
        <button type="button" onClick={replay} aria-label="Replay introduction" title="Replay introduction"><RotateCcw size={14} /></button>
        <button type="button" onClick={stop} aria-label="Stop introduction" title="Stop introduction"><Square size={13} /></button>
        <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute introduction' : 'Mute introduction'} title={muted ? 'Unmute introduction' : 'Mute introduction'}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button
          type="button"
          onClick={() => setMotionEnabled((enabled) => !enabled)}
          aria-label={motionEnabled ? 'Pause avatar motion' : 'Resume avatar motion'}
          title={motionEnabled ? 'Pause avatar motion' : 'Resume avatar motion'}
          aria-pressed={motionEnabled}
        >
          <Activity size={15} />
        </button>
      </div>
      <p className="avatar-caption" aria-live="polite" aria-atomic="true">{caption}</p>
      <details className="avatar-transcript">
        <summary>Read the full introduction</summary>
        <p>{introduction}</p>
      </details>
      <p className="avatar-error" role="status">{error}</p>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="none"
        onEnded={() => {
          autoPlayAttemptedRef.current = false
          setSpeaking(false)
          setPaused(false)
          setCaption('Introduction finished. Replay any time.')
          mouthLevelRef.current = 0
        }}
        onTimeUpdate={(event) => {
          const { currentTime, duration } = event.currentTarget
          if (duration > 0) setCaption(findSentence(introduction, Math.floor(introduction.length * currentTime / duration)))
        }}
      />
    </div>
  )
}
