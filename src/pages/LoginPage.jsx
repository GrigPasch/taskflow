import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import styles from './LoginPage.module.css'

const ROLE_LABELS = { admin: 'Διαχειριστής', manager: 'Διευθυντής', member: 'Μέλος' }

// All known seed passwords for quick-login
const KNOWN_PASSWORDS = {
  'kpap@dromeas.gr':       'admin123',
  'ichatzibadi@dromeas.gr':'ioanna123',
  'atsagalidi@dromeas.gr': 'alexis123',
  'fsavvaki@dromeas.gr':   'fotini123',
  'skehagia@dromeas.gr':   'sofia123',
  'gregpasch8@gmail.com':  'grigorios123',
}

export default function LoginPage() {
  const { login, authError, clearAuthError, members, resetData } = useStore()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const attempt = async (em, pw) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 350))
    const ok = login(em, pw)
    setLoading(false)
    if (ok) navigate('/home', { replace: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    attempt(email.trim(), password)
  }

  const quickLogin = (member) => {
    clearAuthError()
    const pw = KNOWN_PASSWORDS[member.email]
    if (pw) {
      attempt(member.email, pw)
    } else {
      setEmail(member.email)
    }
  }

  const handleReset = () => {
    resetData()
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoDot}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <circle cx="12" cy="5"  r="3.5"/>
              <circle cx="19" cy="17" r="3.5"/>
              <circle cx="5"  cy="17" r="3.5"/>
            </svg>
          </div>
          <span>Taskflow</span>
        </div>

        <h1 className={styles.title}>Καλώς ήρθατε</h1>
        <p className={styles.sub}>Συνδεθείτε για να διαχειριστείτε τα έργα και τις εργασίες σας.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {authError && <div className={styles.error}>{authError}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input} type="email" placeholder="name@dromeas.gr"
              value={email} onChange={e => { setEmail(e.target.value); clearAuthError() }}
              autoFocus required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Κωδικός πρόσβασης</label>
            <input
              className={styles.input} type="password" placeholder="••••••••"
              value={password} onChange={e => { setPassword(e.target.value); clearAuthError() }}
              required
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading && <span className={styles.spinner} />}
            {loading ? 'Σύνδεση…' : 'Σύνδεση'}
          </button>
        </form>

        <div className={styles.demoSection}>
          <div className={styles.demoLabel}>
            Μέλη workspace ({members.length})
            {!members.find(m => m.email === 'gregpasch8@gmail.com') && (
              <button onClick={handleReset} style={{
                marginLeft: 10, fontSize: 11, color: 'var(--red)',
                background: 'var(--red-lt)', border: '1px solid #F7C1C1',
                borderRadius: 6, padding: '2px 8px', cursor: 'pointer'
              }}>
                ↺ Επαναφορά δεδομένων
              </button>
            )}
          </div>
          <div className={styles.demoGrid}>
            {members.map(m => {
              const isKnown = !!KNOWN_PASSWORDS[m.email]
              return (
                <button key={m.id} className={styles.demoCard} onClick={() => quickLogin(m)}>
                  <div className={styles.demoAvatar} style={{ background: m.color }}>
                    {m.initials}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div className={styles.demoName}>{m.name}</div>
                    <span className={`badge badge-${m.role}`}>{ROLE_LABELS[m.role] || m.role}</span>
                  </div>
                  <div className={styles.demoPw}>
                    {isKnown ? KNOWN_PASSWORDS[m.email] : '← πληκτρολογήστε κωδικό'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className={styles.bgGrid} aria-hidden />
    </div>
  )
}