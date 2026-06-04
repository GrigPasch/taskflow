import { useState } from 'react'
import useStore from '../store/useStore'
import Modal from '../components/Modal'
import styles from './SharedPage.module.css'

const COLORS = ['#D85A30','#0F6E56','#534AB7','#185FA5','#A32D2D','#3B6D11']
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export default function MembersPage() {
  const { members, tasks, currentUserId, addMember, updateMember, removeMember } = useStore()
  const currentUser = members.find(m => m.id === currentUserId)
  const isAdmin = currentUser?.role === 'admin'

  const [inviteOpen, setInviteOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Members</h1>
        {isAdmin && (
          <button className={styles.addBtn} onClick={() => setInviteOpen(true)}>+ Πρόσκληση μέλους</button>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.memberGrid}>
          {members.map(m => {
            const memberTasks = tasks.filter(t => t.assigneeId === m.id)
            const open = memberTasks.filter(t => !t.done).length
            const done = memberTasks.filter(t => t.done).length
            return (
              <div key={m.id} className={styles.memberCard} onClick={() => setSelected(m)}>
                <div className={styles.memberTop}>
                  <div className="avatar avatar-lg" style={{ background: m.color }}>{m.initials}</div>
                  <div>
                    <div className={styles.memberName}>{m.name}</div>
                    <div className={styles.memberEmail}>{m.email}</div>
                    <span className={`badge badge-${m.role}`} style={{ marginTop: 4, display: 'inline-flex' }}>{m.role}</span>
                  </div>
                </div>
                <div className={styles.memberStats}>
                  <div className={styles.statChip}>
                    <div className={styles.chipNum}>{open}</div>
                    <div className={styles.chipLabel}>open</div>
                  </div>
                  <div className={styles.statChip}>
                    <div className={styles.chipNum}>{done}</div>
                    <div className={styles.chipLabel}>done</div>
                  </div>
                  <div className={styles.statChip}>
                    <div className={styles.chipNum}>{memberTasks.length}</div>
                    <div className={styles.chipLabel}>σύνολο</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {inviteOpen && (
        <Modal title="Invite member" onClose={() => setInviteOpen(false)}>
          <InviteForm members={members} onInvite={addMember} onClose={() => setInviteOpen(false)} />
        </Modal>
      )}

      {selected && (
        <Modal title="Member profile" onClose={() => setSelected(null)}>
          <MemberDetail
            member={selected}
            tasks={tasks.filter(t => t.assigneeId === selected.id)}
            isAdmin={isAdmin}
            isSelf={selected.id === currentUserId}
            onToggleRole={() => {
              updateMember(selected.id, { role: selected.role === 'admin' ? 'member' : 'admin' })
              setSelected(null)
            }}
            onRemove={() => {
              removeMember(selected.id)
              setSelected(null)
            }}
            onClose={() => setSelected(null)}
          />
        </Modal>
      )}
    </div>
  )
}

function InviteForm({ members, onInvite, onClose }) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState('member')
  const [error,    setError]    = useState('')

  const invite = () => {
    if (!name.trim())                          { setError('Απαιτείται όνομα'); return }
    if (!email.trim() || !email.includes('@')) { setError('Απαιτείται έγκυρο email'); return }
    if (!password.trim() || password.length < 6) { setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες'); return }
    onInvite({
      name:     name.trim(),
      email:    email.trim(),
      password: password.trim(),
      role,
      initials: getInitials(name.trim()),
      color:    COLORS[members.length % COLORS.length],
    })
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div style={{ background: 'var(--red-lt)', color: 'var(--red)', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
      <Field label="Πλήρες όνομα">
        <input style={inputStyle} type="text" placeholder="π.χ. Γιώργης Παπαδόπουλος" value={name} onChange={e => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Email">
        <input style={inputStyle} type="email" placeholder="name@dromeas.gr" value={email} onChange={e => setEmail(e.target.value)} />
      </Field>
      <Field label="Κωδικός πρόσβασης">
        <input style={inputStyle} type="password" placeholder="Τουλάχιστον 6 χαρακτήρες" value={password} onChange={e => setPassword(e.target.value)} />
        <span style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>Ο χρήστης θα συνδεθεί με αυτόν τον κωδικό.</span>
      </Field>
      <Field label="Ρόλος">
        <select style={inputStyle} value={role} onChange={e => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
        <button onClick={onClose} style={cancelBtnStyle}>Ακύρωση</button>
        <button onClick={invite} style={submitBtnStyle}>Αποστολή</button>
      </div>
    </div>
  )
}

function MemberDetail({ member, tasks, isAdmin, isSelf, onToggleRole, onRemove, onClose }) {
  const openTasks = tasks.filter(t => !t.done)
  const doneTasks = tasks.filter(t => t.done)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="avatar avatar-xl" style={{ background: member.color }}>{member.initials}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{member.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{member.email}</div>
          <span className={`badge badge-${member.role}`} style={{ marginTop: 6, display: 'inline-flex' }}>{member.role}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, textAlign: 'center' }}>
          {[{ val: openTasks.length, label: 'Open' }, { val: doneTasks.length, label: 'Κλείσιμο' }, { val: tasks.length, label: 'Total' }].map(s => (
            <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 14px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 8 }}>
          Ανατεθειμένες εργασίες ({tasks.length})
        </div>
        <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tasks.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Δεν υπάρχουν ανατεθειμένες εργασίες.</p>}
          {tasks.slice(0, 10).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', borderBottom: '1px solid var(--bg)' }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                border: '1.5px solid', borderColor: t.done ? 'var(--green)' : 'var(--border-md)',
                background: t.done ? 'var(--green)' : 'transparent'
              }} />
              <span style={{ flex: 1, fontSize: 13, color: t.done ? 'var(--text-3)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.name}</span>
              <span className={`badge badge-${t.priority}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && !isSelf && (
        <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
          <button onClick={onRemove} style={{ ...cancelBtnStyle, color: 'var(--red)' }}>Αφαίρεση μέλους</button>
          <button onClick={onToggleRole} style={{ ...cancelBtnStyle, color: 'var(--purple)' }}>
            Αλλαγή ρόλου σε {member.role === 'admin' ? 'μέλος' : 'διαχειριστή'}
          </button>
          <button onClick={onClose} style={{ ...submitBtnStyle, marginLeft: 'auto' }}>Done</button>
        </div>
      )}
      {(!isAdmin || isSelf) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} style={submitBtnStyle}>Close</button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .4 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border)', width: '100%', fontFamily: 'inherit', fontSize: 13.5, color: 'var(--text)', background: 'var(--surface)', outline: 'none' }
const cancelBtnStyle = { padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, color: 'var(--text-2)', cursor: 'pointer', background: 'var(--surface)', fontFamily: 'inherit' }
const submitBtnStyle = { padding: '7px 18px', background: 'var(--coral)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }