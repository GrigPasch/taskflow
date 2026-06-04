import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import TaskRow from '../components/TaskRow'
import TaskDetailModal from '../components/TaskDetailModal'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { tasks, projects, members, currentUserId } = useStore()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const currentUser = members.find(m => m.id === currentUserId)
  const myTasks = tasks.filter(t => t.assigneeId === currentUserId && !t.done)
  const overdue  = tasks.filter(t => !t.done && t.due && new Date(t.due) < new Date())
  const done     = tasks.filter(t => t.done)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Καλημέρα'
    if (h < 18) return 'Καλό απόγευμα'
    return 'Καλό βράδυ'
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>{greeting()}, {currentUser?.name?.split(' ')[0]} 👋</h1>
        <p className={styles.sub}>Ιδού τι σας περιμένει σήμερα</p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {[
          { label: 'Ανοιχτές εργασίες', value: myTasks.length, accent: 'var(--coral)', bg: 'var(--coral-lt)' },
          { label: 'Εκπρόθεσμες',       value: overdue.length, accent: 'var(--red)',   bg: 'var(--red-lt)' },
          { label: 'Ολοκληρωμένες',     value: done.length,    accent: 'var(--green)', bg: 'var(--green-lt)' },
        ].map(s => (
          <div key={s.label} className={styles.statCard} style={{ borderTopColor: s.accent }}>
            <div className={styles.statNum} style={{ color: s.accent }}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.two}>
        {/* Επερχόμενες εργασίες μου */}
        <div>
          <h2 className={styles.sectionTitle}>Επερχόμενες εργασίες μου</h2>
          <div className={styles.card}>
            {myTasks.length === 0 && (
              <p className={styles.empty}>Τα έχετε όλα σε τάξη 🎉</p>
            )}
            {myTasks.slice(0, 6).map(t => (
              <TaskRow key={t.id} task={t} onClick={setSelected} />
            ))}
          </div>
        </div>

        {/* Επισκόπηση έργων */}
        <div>
          <h2 className={styles.sectionTitle}>Επισκόπηση έργων</h2>
          <div className={styles.projectList}>
            {projects.map(p => {
              const pt = tasks.filter(t => t.projectId === p.id)
              const pd = pt.filter(t => t.done).length
              const pct = pt.length ? Math.round(pd / pt.length * 100) : 0
              return (
                <div key={p.id} className={styles.projCard} onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className={styles.projTop}>
                    <span className={styles.projDot} style={{ background: p.color }} />
                    <span className={styles.projName}>{p.name}</span>
                    <span className={styles.projCount}>{pd}/{pt.length}</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressBar} style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                  <div className={styles.projPct}>{pct}% ολοκλήρωση</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selected && (
        <TaskDetailModal
          task={tasks.find(t => t.id === selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
