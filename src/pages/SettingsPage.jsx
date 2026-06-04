import { useState, useEffect } from 'react'
import {
  IconBrandSlack, IconCheck, IconAlertCircle, IconExternalLink,
  IconRefresh, IconCircleCheck, IconCircleX, IconTrash, IconPlus,
} from '@tabler/icons-react'
import useStore, { slackLog } from '../store/useStore'
import styles from './SettingsPage.module.css'

const SLACK_EVENTS = [
  { key: 'taskAssigned',   label: 'Ανάθεση εργασίας',       desc: 'Όταν μια εργασία ανατίθεται σε κάποιον' },
  { key: 'taskCreated',    label: 'Δημιουργία εργασίας',    desc: 'Όταν δημιουργείται νέα εργασία χωρίς ανάθεση' },
  { key: 'statusChanged',  label: 'Αλλαγή κατάστασης',      desc: 'Μεταφορά εργασίας σε άλλη στήλη (π.χ. → Σε Εξέλιξη)' },
  { key: 'taskCompleted',  label: 'Ολοκλήρωση εργασίας',   desc: 'Όταν μια εργασία σημειωθεί ως ολοκληρωμένη' },
  { key: 'taskReopened',   label: 'Επαναστάθηκε εργασία',   desc: 'Όταν μια ολοκληρωμένη εργασία ξανανοίξει' },
  { key: 'commentAdded',   label: 'Νέο σχόλιο',             desc: 'Όταν προστίθεται σχόλιο σε εργασία' },
  { key: 'subtaskAdded',   label: 'Νέα υποεργασία',         desc: 'Όταν προστίθεται υποεργασία' },
  { key: 'dueDateChanged', label: 'Αλλαγή προθεσμίας',      desc: 'Όταν αλλάζει η ημερομηνία προθεσμίας' },
  { key: 'taskUpdated',    label: 'Γενική ενημέρωση',       desc: 'Κάθε άλλη αλλαγή πεδίου (πολύ συχνό — προτείνεται OFF)' },
]

export default function SettingsPage() {
  const {
    slackEnabled, projectWebhooks, slackEvents,
    setSlackEnabled, setProjectWebhook, removeProjectWebhook, setSlackEvent, testSlack,
    currentUserId, members, projects, resetData,
  } = useStore()

  const currentUser = members.find(m => m.id === currentUserId)
  const isAdmin = currentUser?.role === 'admin'

  const [serverStatus, setServerStatus] = useState(null) // null|'ok'|'err'
  const [, forceUpdate] = useState(0)
  const [inputs,   setInputs]   = useState({})           // { [projId]: string }
  const [saved,    setSaved]    = useState({})            // { [projId]: bool }
  const [testing,  setTesting]  = useState({})           // { [projId]: null|'sending'|'ok'|'err' }

  // Check proxy server
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.ok ? setServerStatus('ok') : setServerStatus('err'))
      .catch(() => setServerStatus('err'))
  }, [])

  // Init inputs from persisted webhooks
  useEffect(() => {
    const init = {}
    projects.forEach(p => { init[p.id] = projectWebhooks[p.id] || '' })
    setInputs(init)
  }, [projects, projectWebhooks])

  const handleSave = (projId) => {
    const url = (inputs[projId] || '').trim()
    if (url) setProjectWebhook(projId, url)
    else removeProjectWebhook(projId)
    setSaved(s => ({ ...s, [projId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [projId]: false })), 2000)
  }

  const handleTest = async (projId) => {
    setTesting(s => ({ ...s, [projId]: 'sending' }))
    try {
      await testSlack(projId)
      setTesting(s => ({ ...s, [projId]: 'ok' }))
    } catch {
      setTesting(s => ({ ...s, [projId]: 'err' }))
    }
    setTimeout(() => setTesting(s => ({ ...s, [projId]: null })), 4000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ρυθμίσεις</h1>
      </div>

      <div className={styles.content}>

        {/* Workspace */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Workspace</h2>
          <div className={styles.formRow}>
            <label className={styles.label}>Όνομα workspace</label>
            <input className={styles.input} defaultValue="Dromeas Workspace" readOnly={!isAdmin} />
          </div>
          <div className={styles.formRow}>
            <label className={styles.label}>Προεπιλεγμένη προβολή</label>
            <select className={styles.select} disabled={!isAdmin}>
              <option>Λίστα</option><option>Kanban</option><option>Χρονοδιάγραμμα</option>
            </select>
          </div>
          {!isAdmin && <p className={styles.note}>Μόνο διαχειριστές μπορούν να αλλάξουν τις ρυθμίσεις workspace.</p>}
        </section>

        {/* Slack */}
        <section className={styles.card}>
          <div className={styles.slackHeader}>
            <div className={styles.slackIcon}><IconBrandSlack size={22} /></div>
            <div style={{ flex: 1 }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Ενσωμάτωση Slack</h2>
              <p className={styles.slackSub}>
                Κάθε έργο μπορεί να έχει το δικό του Slack channel.
                Αντιγράψτε το Webhook URL από το{' '}
                <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" className={styles.inlineLink}>
                  Slack API <IconExternalLink size={11} />
                </a>
              </p>
            </div>
            <div className={styles.slackToggleWrap}>
              <span className={styles.toggleLabel}>{slackEnabled ? 'Ενεργό' : 'Ανενεργό'}</span>
              <button
                className={`${styles.toggle} ${slackEnabled ? styles.toggleOn : ''}`}
                onClick={() => setSlackEnabled(!slackEnabled)}
                disabled={!isAdmin}
              >
                <div className={styles.toggleThumb} />
              </button>
            </div>
          </div>

          {/* Proxy server status */}
          <div className={`${styles.serverBanner} ${serverStatus === 'ok' ? styles.serverOk : serverStatus === 'err' ? styles.serverErr : styles.serverUnknown}`}>
            {serverStatus === 'ok'  && <><IconCircleCheck size={15} /> Slack API είναι έτοιμο</>}
            {serverStatus === 'err' && <><IconCircleX size={15} /> Slack API μη διαθέσιμο — ελέγξτε τη σύνδεσή σας</> }
            {serverStatus === null && 'Έλεγχος server…'}
          </div>

          {/* Per-project webhook rows */}
          <div className={styles.projectWebhooks}>
            <div className={styles.pwHeader}>
              <span className={styles.pwCol}>Έργο</span>
              <span className={styles.pwCol} style={{ flex: 3 }}>Slack Webhook URL</span>
              <span className={styles.pwCol} style={{ width: 160 }}>Ενέργειες</span>
            </div>

            {projects.map(p => {
              const hasUrl    = !!(projectWebhooks[p.id])
              const testState = testing[p.id] || null
              return (
                <div key={p.id} className={styles.pwRow}>
                  {/* Project name */}
                  <div className={styles.pwName}>
                    <span className={styles.pwDot} style={{ background: p.color }} />
                    <span>{p.name}</span>
                    {hasUrl && <span className={styles.connectedPill}>● συνδεδεμένο</span>}
                  </div>

                  {/* Webhook input */}
                  <div className={styles.pwInput}>
                    <input
                      className={styles.webhookInput}
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      value={inputs[p.id] || ''}
                      onChange={e => setInputs(s => ({ ...s, [p.id]: e.target.value }))}
                      disabled={!isAdmin}
                    />
                  </div>

                  {/* Actions */}
                  <div className={styles.pwActions}>
                    <button
                      className={`${styles.saveBtn} ${saved[p.id] ? styles.saveBtnOk : ''}`}
                      onClick={() => handleSave(p.id)}
                      disabled={!isAdmin}
                    >
                      {saved[p.id] ? <><IconCheck size={13} /> OK</> : 'Αποθήκευση'}
                    </button>

                    <button
                      className={`${styles.testBtn}
                        ${testState === 'ok'  ? styles.testOk  : ''}
                        ${testState === 'err' ? styles.testErr : ''}`}
                      onClick={() => handleTest(p.id)}
                      disabled={!hasUrl || testState === 'sending' || serverStatus !== 'ok' || !isAdmin}
                      title={serverStatus !== 'ok' ? 'Εκκινήστε πρώτα τον server' : !hasUrl ? 'Αποθηκεύστε πρώτα ένα URL' : ''}
                    >
                      {testState === 'sending' && <><span className={styles.spinner} /> …</>}
                      {testState === 'ok'      && <><IconCheck size={13} /> OK!</>}
                      {testState === 'err'     && <><IconAlertCircle size={13} /> Σφάλμα</>}
                      {!testState             && 'Δοκιμή'}
                    </button>

                    {hasUrl && isAdmin && (
                      <button
                        className={styles.removeBtn}
                        onClick={() => { removeProjectWebhook(p.id); setInputs(s => ({ ...s, [p.id]: '' })) }}
                        title="Αφαίρεση webhook"
                      >
                        <IconTrash size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Event toggles */}
          <div className={styles.eventsSection}>
            <h3 className={styles.eventsTitle}>Ποιες ειδοποιήσεις να στέλνονται</h3>
            {SLACK_EVENTS.map(ev => (
              <div key={ev.key} className={styles.eventRow}>
                <div>
                  <div className={styles.eventLabel}>{ev.label}</div>
                  <div className={styles.eventDesc}>{ev.desc}</div>
                </div>
                <button
                  className={`${styles.toggle} ${slackEvents[ev.key] ? styles.toggleOn : ''}`}
                  onClick={() => setSlackEvent(ev.key, !slackEvents[ev.key])}
                  disabled={!isAdmin || !slackEnabled}
                  title={!slackEnabled ? 'Ενεργοποιήστε πρώτα το Slack' : ''}
                >
                  <div className={styles.toggleThumb} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* App notifications */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Ειδοποιήσεις εφαρμογής</h2>
          {['Ανάθεση εργασίας σε εμένα','Υπενθύμιση προθεσμίας','Σχόλια σε εργασίες μου','Αλλαγές κατάστασης'].map(label => (
            <div key={label} className={styles.eventRow}>
              <span className={styles.eventLabel}>{label}</span>
              <button className={`${styles.toggle} ${styles.toggleOn}`}><div className={styles.toggleThumb} /></button>
            </div>
          ))}
        </section>

        {/* Slack debug log */}
        {isAdmin && (
          <section className={styles.card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h2 className={styles.cardTitle} style={{margin:0}}>Slack — Αρχείο αποστολών</h2>
              <button className={styles.testBtn} onClick={() => forceUpdate(n => n+1)} style={{height:28}}>↻ Ανανέωση</button>
            </div>
            {slackLog.length === 0
              ? <p className={styles.note}>Δεν έχουν σταλεί ειδοποιήσεις ακόμα.</p>
              : slackLog.map((e, i) => (
                <div key={i} style={{
                  padding:'8px 10px', borderRadius:6, marginBottom:6,
                  background: e.status==='ok' ? 'var(--green-lt)' : e.status==='error' ? 'var(--red-lt)' : 'var(--bg)',
                  border: '1px solid', fontSize:12,
                  borderColor: e.status==='ok' ? '#9FE1CB' : e.status==='error' ? '#F7C1C1' : 'var(--border)',
                  color: e.status==='ok' ? 'var(--green)' : e.status==='error' ? 'var(--red)' : 'var(--text-2)'
                }}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
                    <span style={{fontWeight:600}}>{e.status==='ok'?'✓ Εστάλη':e.status==='error'?'✗ Αποτυχία':'⏳ Αποστολή…'}</span>
                    <span style={{opacity:.6, fontSize:11}}>{new Date(e.at).toLocaleTimeString('el-GR')}</span>
                  </div>
                  <div style={{fontFamily:'monospace',fontSize:11,opacity:.8,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.message}</div>
                  {e.error && <div style={{marginTop:4,fontWeight:600}}>Σφάλμα: {e.error}</div>}
                </div>
              ))
            }
          </section>
        )}

        {/* Danger zone */}
        {isAdmin && (
          <section className={styles.card} style={{ borderColor: '#F7C1C1' }}>
            <h2 className={styles.cardTitle} style={{ color: 'var(--red)' }}>Ζώνη Κινδύνου</h2>
            <p className={styles.note} style={{ marginBottom: 12 }}>Αυτές οι ενέργειες δεν μπορούν να αναιρεθούν.</p>
            <button className={styles.dangerBtn}
              onClick={() => { if (window.confirm('Να επαναφερθούν τα demo δεδομένα;')) resetData() }}>
              <IconRefresh size={14} /> Επαναφορά demo δεδομένων
            </button>
          </section>
        )}
      </div>
    </div>
  )
}