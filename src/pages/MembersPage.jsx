import { useState } from 'react'
import useStore from '../store/useStore'
import Modal from '../components/Modal'
import styles from './SharedPage.module.css'

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
          <button className={styles.addBtn} onClick={() => setInviteOpen(true)}>+ Invite member</button>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.memberGrid}>
          {members.map(m => {
            const memberTasks = tasks.filter(t => t.assigneeId === m.id)
            const open = memberTasks.filter(t => !t.done).length
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
                    <div className={styles.chipLabel}>open tasks</div>
                  </div>
                  <div className={styles.statChip}>
                    <div className={styles.chipNum}>{memberTasks.filter(t => t.done).length}</div>
                    <div className={styles.chipLabel}>completed</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {inviteOpen && (
        <Modal title="Invite member" onClose={() => setInviteOpen(false)}>
          <InviteForm onClose={() => setInviteOpen(false)} />
        </Modal>
      )}
      {selected && (
        <Modal title="Member profile" onClose={() => setSelected(null)}>
          <MemberDetail
            member={selected}
            tasks={tasks.filter(t => t.assigneeId === selected.id)}
            isAdmin={isAdmin}
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

const COLORS = ['#D85A30','#0F6E56','#534AB7','#185FA5','#A32D2D','#3B6D11']
function getInitials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }

function InviteForm({ onClose }) {
  const { addMember, members } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')

  const [name2, setName2] = [name, setName]

  const invite = () => {
    if (!name.trim() || !email.trim()) return
    addMember({
      name: name.trim(), email: email.trim(), role,
      initials: getInitials(name),
      color: COLORS[members.length % COLORS.length],
    })
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[
        { label: 'Full name', val: name, set: setName, type: 'text', placeholder: 'e.g. Jordan Lee' },
        { label: 'Email', val: email, set: setEmail, type: 'email', placeholder: 'jordan@company.com' },
      ].map(f => (
        <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .4 }}>{f.label}</label>
          <input style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border)', width: '100%' }}
            type={f.type} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} />
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .4 }}>Role</label>
        <select style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border)', width: '100%' }}
          value={role} onChange={e => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
        <button onClick={onClose} style={{ padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, cursor: 'pointer' }}>Cancel</button>
        <button onClick={invite} style={{ padding: '7px 18px', background: 'var(--coral)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Send invite</button>
      </div>
    </div>
  )
}

function MemberDetail({ member, tasks, isAdmin, onToggleRole, onRemove, onClose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="avatar avatar-xl" style={{ background: member.color }}>{member.initials}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{member.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{member.email}</div>
          <span className={`badge badge-${member.role}`} style={{ marginTop: 6, display: 'inline-flex' }}>{member.role}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .4 }}>
        Assigned tasks ({tasks.length})
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tasks.slice(0, 8).map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', borderBottom: '1px solid var(--bg)' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid', borderColor: t.done ? 'var(--green)' : 'var(--border-md)', background: t.done ? 'var(--green)' : 'transparent', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: t.done ? 'var(--text-3)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.name}</span>
            <span className={`badge badge-${t.priority}`}>{t.priority}</span>
          </div>
        ))}
        {tasks.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No tasks assigned.</p>}
      </div>
      {isAdmin && (
        <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
          <button onClick={onRemove} style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            Remove member
          </button>
          <button onClick={onToggleRole} style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--purple)', cursor: 'pointer' }}>
            Toggle role
          </button>
          <button onClick={onClose} style={{ marginLeft: 'auto', padding: '7px 18px', background: 'var(--coral)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Done</button>
        </div>
      )}
    </div>
  )
}
