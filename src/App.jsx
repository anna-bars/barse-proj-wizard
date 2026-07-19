import { useState } from 'react'
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-webgl2'
import wizzardRiv from './assets/wizzard.riv'

const STATE_MACHINE = 'Wizzard Controller'

export default function App() {
  const [talking, setTalking] = useState(false)
  const [listening, setListening] = useState(false)

  const { rive, RiveComponent } = useRive({
    src: wizzardRiv,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  })

  const isTalking = useStateMachineInput(rive, STATE_MACHINE, 'isTalking')
  const isListening = useStateMachineInput(rive, STATE_MACHINE, 'isListening')
  const blink = useStateMachineInput(rive, STATE_MACHINE, 'Blink')
  const gemGlint = useStateMachineInput(rive, STATE_MACHINE, 'GemGlint')

  const toggleTalking = () => {
    const next = !talking
    setTalking(next)
    if (isTalking) isTalking.value = next
    if (next) {
      setListening(false)
      if (isListening) isListening.value = false
    }
  }

  const toggleListening = () => {
    const next = !listening
    setListening(next)
    if (isListening) isListening.value = next
    if (next) {
      setTalking(false)
      if (isTalking) isTalking.value = false
    }
  }

  const currentState = talking ? 'Talking' : listening ? 'Listening' : 'Idle'

  return (
    <div className="layout-wrap">
      <div className="bg-glow">
        <div className="glow-blue" />
        <div className="glow-pink" />
        <div className="glow-yellow" />
        <div className="glow-teal" />
      </div>
      <div className="layout">
        <div className="stage">
          <div className="canvas-wrap">
            <RiveComponent />
          </div>
        </div>

        <div className="panel">
          <div className="top-tag">
            <span className="pulse" />
            Live State Machine
          </div>
          <h1>Wizard Controller</h1>
          <p className="sub">
            Use the toggles and buttons to test the state machine behavior live.
          </p>
          <div className="group-label">Loop states</div>
          <div className="card">
            <Row label="Talking" hint="isTalking" checked={talking} onChange={toggleTalking} />
            <Row label="Listening" hint="isListening" checked={listening} onChange={toggleListening} />
          </div>

          <div className="group-label">One-shot triggers</div>
          <div style={{ marginBottom: 26 }}>
            <button className="btn blink" onClick={() => blink && blink.fire()}>
              <span className="dot" />
              Blink
            </button>
            <button className="btn gem" onClick={() => gemGlint && gemGlint.fire()}>
              <span className="dot" />
              Gem Glint
            </button>
          </div>

          <div className="state-readout">
            <span className="live-dot" />
            Current state: <b>{currentState}</b>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, hint, checked, onChange }) {
  return (
    <div className="row">
      <div>
        <div className="label">{label}</div>
        <div className="hint">{hint}</div>
      </div>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="track" />
        <span className="thumb" />
      </label>
    </div>
  )
}
