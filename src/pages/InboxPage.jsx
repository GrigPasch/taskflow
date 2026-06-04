import useStore from '../store/useStore'
import styles from './SharedPage.module.css'

export default function InboxPage() {
  const { notifications, markNotifRead, markAllRead, currentUserId } = useStore()

  // Only show notifications targeted at the current user or broadcast (no target)
  const visible = notifications.filter(n => !n.targetUserId || n.targetUserId === currentUserId)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Εισερχόμενα</h1>
        <button className={styles.addBtn} onClick={markAllRead}>Σήμανση όλων ως αναγνωσμένα</button>
      </div>
      <div className={styles.content}>
        {visible.length === 0 && (
          <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '16px 4px' }}>
            Δεν υπάρχουν ειδοποιήσεις.
          </p>
        )}
        {visible.map(n => (
          <div
            key={n.id}
            className={`${styles.notifRow} ${!n.read ? styles.notifUnread : ''}`}
            onClick={() => markNotifRead(n.id)}
          >
            <div className={styles.notifDot} style={{ opacity: n.read ? 0 : 1 }} />
            <div>
              <div className={styles.notifText}>{n.text}</div>
              <div className={styles.notifSub}>{n.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}