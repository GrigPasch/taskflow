import { IconBell, IconCheck } from '@tabler/icons-react'
import useStore from '../store/useStore'
import styles from './NotifPanel.module.css'

export default function NotifPanel({ onClose }) {
  const { notifications, markNotifRead, markAllRead } = useStore()

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
          <button className={styles.markAll} onClick={markAllRead}>
            <IconCheck size={13} /> Mark all read
          </button>
        </div>
        <div className={styles.list}>
          {notifications.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={() => markNotifRead(n.id)}
            >
              <div className={styles.dot} style={{ opacity: n.read ? 0 : 1 }} />
              <div>
                <div className={styles.itemText}>{n.text}</div>
                <div className={styles.itemSub}>{n.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
