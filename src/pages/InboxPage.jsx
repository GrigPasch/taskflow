import useStore from '../store/useStore'
import styles from './SharedPage.module.css'

export default function InboxPage() {
  const { notifications, markNotifRead, markAllRead } = useStore()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inbox</h1>
        <button className={styles.addBtn} onClick={markAllRead}>Σήμανση όλων ως αναγνωσμένα</button>
      </div>
      <div className={styles.content}>
        {notifications.map(n => (
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
