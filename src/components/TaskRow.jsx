import { IconCalendar, IconLock } from '@tabler/icons-react'
import useStore, { canEditTask } from '../store/useStore'
import styles from './TaskRow.module.css'

export default function TaskRow({ task, onClick }) {
  const { toggleTask, members, projects, currentUserId } = useStore()
  const assignee     = members.find(m => m.id === task.assigneeId)
  const currentUser  = members.find(m => m.id === currentUserId)
  const project      = projects.find(p => p.id === task.projectId)
  const canEdit      = canEditTask(task, project, currentUser)
  const isOverdue    = !task.done && task.due && new Date(task.due) < new Date()

  const handleCheck = (e) => {
    e.stopPropagation()
    if (!canEdit) return
    toggleTask(task.id)
  }

  return (
    <div className={styles.row} onClick={() => onClick?.(task)}>
      <div
        className={`${styles.check} ${task.done ? styles.checked : ''} ${!canEdit ? styles.checkLocked : ''}`}
        onClick={handleCheck}
        title={canEdit ? (task.done ? 'Mark incomplete' : 'Mark complete') : 'You are not assigned to this task'}
      >
        {!canEdit && <IconLock size={9} />}
      </div>
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
          <div className="avatar avatar-sm" style={{ background: assignee.color }} title={assignee.name}>
            {assignee.initials}
          </div>
        )}
        {!canEdit && <IconLock size={11} style={{ color: 'var(--text-3)' }} />}
      </div>
    </div>
  )
}
