// AdminPage.jsx
import useStore from '../store/useStore'
import styles from './SharedPage.module.css'

export default function AdminPage() {
  const { tasks, projects, members, updateMember, removeMember, currentUserId } = useStore()
  const currentUser = members.find(m => m.id === currentUserId)

  if (currentUser?.role !== 'admin') {
    return <div style={{ padding: 40, color: 'var(--text-3)' }}>Access denied. Admins only.</div>
  }

  const stats = [
    { label: 'Σύνολο εργασιών',  value: tasks.length,                         accent: 'var(--coral)' },
    { label: 'Ολοκληρωμένες',    value: tasks.filter(t => t.done).length,     accent: 'var(--green)' },
    { label: 'Μέλη',      value: members.length,                       accent: 'var(--purple)' },
    { label: 'Έργα',     value: projects.length,                      accent: 'var(--blue)' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.adminStats}>
          {stats.map(s => (
            <div key={s.label} className={styles.adminStat} style={{ borderTopColor: s.accent }}>
              <div className={styles.adminStatNum} style={{ color: s.accent }}>{s.value}</div>
              <div className={styles.adminStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.adminSection}>
          <h2 className={styles.adminSectionTitle}>Member management</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Open tasks</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm" style={{ background: m.color }}>{m.initials}</div>
                        {m.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{m.email}</td>
                    <td><span className={`badge badge-${m.role}`}>{m.role}</span></td>
                    <td>{tasks.filter(t => t.assigneeId === m.id && !t.done).length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => updateMember(m.id, { role: m.role === 'admin' ? 'member' : 'admin' })}
                          style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--purple)' }}
                        >
                          Toggle role
                        </button>
                        {m.id !== currentUserId && (
                          <button
                            onClick={() => removeMember(m.id)}
                            style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--red)' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.adminSection}>
          <h2 className={styles.adminSectionTitle}>Project overview</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Project</th><th>Total tasks</th><th>Completed</th><th>Progress</th></tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const pt = tasks.filter(t => t.projectId === p.id)
                  const pd = pt.filter(t => t.done).length
                  const pct = pt.length ? Math.round(pd / pt.length * 100) : 0
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                          {p.name}
                        </div>
                      </td>
                      <td>{pt.length}</td>
                      <td>{pd}</td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-3)', width: 32 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
