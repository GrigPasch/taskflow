import { IconCalendar } from '@tabler/icons-react'
import useStore from '../store/useStore'
import styles from './TaskRow.module.css'

export default function TaskRow({ task, onClick }) {
  const { toggleTask, members } = useStore()
  const assignee = members.find(m => m.id === task.assigneeId)
  const isOverdue = !task.done && task.due && new Date(task.due) < new Date()

  return (
    <div className={styles.row} onClick={() => onClick?.(task)}>
      <div
        className={`${styles.check} ${task.done ? styles.checked : ''}`}
        onClick={e => { e.stopPropagation(); toggleTask(task.id) }}
        title={task.done ? 'Mark incomplete' : 'Mark complete'}
      />
      <span className={`${styles.name} ${task.done ? styles.done : ''}`}>{task.name}</span>
      <div className={styles.meta}>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {task.due && (
          <span className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
            <IconCalendar size={12} />
            {task.due}
          </span>
        )}
        {assignee && (
          <div
            className="avatar avatar-sm"
            style={{ background: assignee.color }}
            title={assignee.name}
          >
            {assignee.initials}
          </div>
        )}
      </div>
    </div>
  )
}
