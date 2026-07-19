import { useState, useEffect, useRef } from 'react'
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-webgl2'
import wizardRiv from './assets/wizard.riv'
import { Analytics } from "@vercel/analytics/react"

const STATE_MACHINE = 'Wizard Controller'

export default function App() {
  const [talking, setTalking] = useState(false)
  const [listening, setListening] = useState(false)
  const [blinkFeed, setBlinkFeed] = useState({ count: 0, lastAt: null })
  const [gemFeed, setGemFeed] = useState({ count: 0, lastAt: null })

  const { rive, RiveComponent } = useRive({
    src: wizardRiv,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  })

  const isTalking = useStateMachineInput(rive, STATE_MACHINE, 'isTalking')
  const isListening = useStateMachineInput(rive, STATE_MACHINE, 'isListening')
  const blink = useStateMachineInput(rive, STATE_MACHINE, 'Blink')
  const gemGlint = useStateMachineInput(rive, STATE_MACHINE, 'GemGlint')

  // Auto Blink — actually fires the real "Blink" trigger on the canvas
  // above, on a random 3–6s cadence, so the docs section below can show
  // it's genuinely driving the same state machine, not just a snippet.
  const blinkTimeout = useRef(null)
  useEffect(() => {
    if (!blink) return
    const schedule = () => {
      const delay = 3000 + Math.random() * 3000
      blinkTimeout.current = setTimeout(() => {
        blink.fire()
        setBlinkFeed((f) => ({ count: f.count + 1, lastAt: Date.now() }))
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(blinkTimeout.current)
  }, [blink])

  // Auto Gem Glint — same idea, random 8–15s cadence.
  const gemTimeout = useRef(null)
  useEffect(() => {
    if (!gemGlint) return
    const schedule = () => {
      const delay = 8000 + Math.random() * 7000
      gemTimeout.current = setTimeout(() => {
        gemGlint.fire()
        setGemFeed((f) => ({ count: f.count + 1, lastAt: Date.now() }))
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(gemTimeout.current)
  }, [gemGlint])

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
    <>
      {/* ================= SECTION 1 — LIVE DEMO (UNCHANGED) ================= */}
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

            <a className="scroll-cue" href="#docs">
              <span>Integration docs</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2+ — DOCUMENTATION ================= */}
      <div className="docs-backdrop">
      <div id="docs" className="docs">
        <DocsNav />

        <div className="docs-body">
        <div className="docs-body-inner">

          <DocSection id="overview" eyebrow="01 · Overview" title="Built for JavaScript & React Native">
            <p>
              The Wizard character is driven by a single, production-ready Rive
              <b> State Machine</b> — <code>Wizard Controller</code>. It exposes two
              boolean inputs for looping states and two triggers for one-shot
              gestures, so it drops into any JS or React&nbsp;Native app with the
              same runtime calls shown below.
            </p>
            <div className="badge-row">
              <span className="badge">✅ JavaScript</span>
              <span className="badge">✅ React Native</span>
              <span className="badge">✅ Rive Runtime</span>
            </div>
          </DocSection>

          <DocSection id="state-machine" eyebrow="02 · State Machine" title="Wizard Controller">
            <p>
              One state machine controls everything you see in the demo above.
              Two states loop continuously, two triggers fire once and return.
            </p>
            <div className="sm-diagram">
              <div className="sm-node idle">Idle<span>default loop</span></div>
              <div className="sm-arrow">⇄</div>
              <div className="sm-node">Talking<span>isTalking · loop</span></div>
              <div className="sm-arrow">⇄</div>
              <div className="sm-node">Listening<span>isListening · loop</span></div>
              <div className="sm-node trigger">Blink<span>trigger</span></div>
              <div className="sm-node trigger">Gem Glint<span>trigger</span></div>
            </div>
          </DocSection>

          <DocSection id="states" eyebrow="03 · Animation States" title="States reference">
            <table className="doc-table">
              <thead>
                <tr><th>State</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td>Idle</td><td><span className="pill loop">Loop</span></td><td>Default breathing animation</td></tr>
                <tr><td>Talking</td><td><span className="pill loop">Loop</span></td><td>Speaking animation</td></tr>
                <tr><td>Listening</td><td><span className="pill loop">Loop</span></td><td>Calm listening animation</td></tr>
                <tr><td>Blink</td><td><span className="pill trig">Trigger</span></td><td>Eye blink</td></tr>
                <tr><td>Gem Glint</td><td><span className="pill trig">Trigger</span></td><td>Staff sparkle</td></tr>
              </tbody>
            </table>
          </DocSection>

          <DocSection id="inputs" eyebrow="04 · Inputs" title="State machine inputs">
            <div className="inputs-grid">
              <div className="input-card">
                <div className="input-kind">Boolean</div>
                <code>isTalking</code>
                <code>isListening</code>
              </div>
              <div className="input-card">
                <div className="input-kind">Trigger</div>
                <code>Blink</code>
                <code>GemGlint</code>
              </div>
            </div>
          </DocSection>

          <DocSection id="js" eyebrow="05 · JavaScript" title="JavaScript example">
            <CodeBlock lang="js" code={JS_EXAMPLE} />
          </DocSection>

          <DocSection id="rn" eyebrow="06 · React Native" title="React Native example">
            <CodeBlock lang="jsx" code={RN_EXAMPLE} />
          </DocSection>

          <DocSection id="auto-blink" eyebrow="07 · Automatic Blink" title="Random blink while idle">
            <p>Fire <code>Blink</code> on a random interval so the character feels alive during Idle.</p>
            <LiveFeed
              label="Live on the canvas above"
              count={blinkFeed.count}
              lastAt={blinkFeed.lastAt}
              noun="blink"
            />
            <CodeBlock lang="js" code={AUTO_BLINK} />
          </DocSection>

          <DocSection id="auto-gem" eyebrow="08 · Automatic Gem Glint" title="Occasional gem glint">
            <p>Fire <code>GemGlint</code> less often — it's an accent, not a heartbeat.</p>
            <LiveFeed
              label="Live on the canvas above"
              count={gemFeed.count}
              lastAt={gemFeed.lastAt}
              noun="glint"
            />
            <CodeBlock lang="js" code={AUTO_GEM} />
          </DocSection>

          <DocSection id="best-practices" eyebrow="09 · Best Practices" title="Keep the character believable">
            <ul className="check-list">
              <li>Keep only one loop state active at a time.</li>
              <li>Blink should fire on a random interval, never on a fixed beat.</li>
              <li>Gem Glint is an occasional accent — don't overuse it.</li>
              <li>Idle is always the default resting state.</li>
            </ul>
          </DocSection>

          <DocSection id="checklist" eyebrow="10 · Integration Checklist" title="Ship it">
            <ul className="check-list boxes">
              <li>Import the <code>.riv</code> file</li>
              <li>Load <code>Wizard Controller</code></li>
              <li>Bind boolean inputs</li>
              <li>Fire trigger inputs</li>
              <li>Optionally schedule random Blink</li>
              <li>Optionally schedule random Gem Glint</li>
              <li>Done</li>
            </ul>
          </DocSection>

          <footer className="docs-footer">
            Wizard Controller · Rive integration docs
          </footer>
        </div>
        </div>
      </div>
      </div>
      <Analytics />
    </>
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

function DocsNav() {
  const items = [
    ['overview', 'Overview'],
    ['state-machine', 'State Machine'],
    ['states', 'States'],
    ['inputs', 'Inputs'],
    ['js', 'JavaScript'],
    ['rn', 'React Native'],
    ['auto-blink', 'Auto Blink'],
    ['auto-gem', 'Auto Gem Glint'],
    ['best-practices', 'Best Practices'],
    ['checklist', 'Checklist'],
  ]
  return (
    <nav className="docs-nav">
      <div className="docs-nav-title">Contents</div>
      {items.map(([id, label]) => (
        <a key={id} href={`#${id}`}>{label}</a>
      ))}
    </nav>
  )
}

function DocSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="doc-section">
      <div className="doc-eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function LiveFeed({ label, count, lastAt, noun }) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const secondsAgo = lastAt ? Math.max(0, Math.round((Date.now() - lastAt) / 1000)) : null

  return (
    <div className="live-feed">
      <span className="live-feed-dot" />
      <span className="live-feed-label">{label}</span>
      <span className="live-feed-value">
        {count === 0
          ? `waiting for first ${noun}…`
          : `${count} fired · last ${secondsAgo}s ago`}
      </span>
    </div>
  )
}

function CodeBlock({ code }) {
  return (
    <pre className="code-block"><code>{code}</code></pre>
  )
}

const JS_EXAMPLE = `import { Rive, Fit, Alignment, Layout } from '@rive-app/canvas'

const r = new Rive({
  src: 'wizard.riv',
  canvas: document.getElementById('wizard-canvas'),
  autoplay: true,
  stateMachines: 'Wizard Controller',
  layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  onLoad: () => {
    const inputs = r.stateMachineInputs('Wizard Controller')
    const isTalking = inputs.find(i => i.name === 'isTalking')
    const isListening = inputs.find(i => i.name === 'isListening')
    const blink = inputs.find(i => i.name === 'Blink')
    const gemGlint = inputs.find(i => i.name === 'GemGlint')

    isTalking.value = true      // start talking
    isListening.value = false
    blink.fire()                 // one-shot blink
    gemGlint.fire()               // one-shot glint
  },
})`

const RN_EXAMPLE = `import Rive, { Fit, Alignment, useRive } from 'rive-react-native'

export function Wizard() {
  const riveRef = useRef(null)

  const onTalk = (talking) => {
    riveRef.current?.setInputState('Wizard Controller', 'isTalking', talking)
    if (talking) {
      riveRef.current?.setInputState('Wizard Controller', 'isListening', false)
    }
  }

  const onBlink = () => riveRef.current?.fireState('Wizard Controller', 'Blink')
  const onGlint = () => riveRef.current?.fireState('Wizard Controller', 'GemGlint')

  return (
    <Rive
      ref={riveRef}
      resourceName="wizard"
      stateMachineName="Wizard Controller"
      autoplay
      fit={Fit.Contain}
      alignment={Alignment.Center}
      style={{ width: '100%', height: 320 }}
    />
  )
}`

const AUTO_BLINK = `function scheduleBlink(blink) {
  const next = 3000 + Math.random() * 3000 // 3–6s
  setTimeout(() => {
    blink?.fire()
    scheduleBlink(blink)
  }, next)
}

scheduleBlink(blink) // call once after rive loads`

const AUTO_GEM = `function scheduleGemGlint(gemGlint) {
  const next = 8000 + Math.random() * 7000 // 8–15s
  setTimeout(() => {
    gemGlint?.fire()
    scheduleGemGlint(gemGlint)
  }, next)
}

scheduleGemGlint(gemGlint) // call once after rive loads`
