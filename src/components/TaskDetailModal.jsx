import { useState } from 'react'
import { IconTrash, IconSend } from '@tabler/icons-react'
import useStore from '../store/useStore'
import Modal from './Modal'
import styles from './TaskDetailModal.module.css'

export default function TaskDetailModal({ task, onClose }) {
  const { updateTask, deleteTask, addComment, members, projects, currentUserId } = useStore()
  const [comment, setComment] = useState('')

  if (!task) return null

  const project = projects.find(p => p.id === task.projectId)
  const currentUser = members.find(m => m.id === currentUserId)

  const field = (key) => (e) => updateTask(task.id, { [key]: e.target.value })

  const handleDelete = () => {
    deleteTask(task.id)
    onClose()
  }

  const handleComment = () => {
    if (!comment.trim()) return
    addComment(task.id, comment.trim())
    setComment('')
  }

  return (
    <Modal title="Task details" onClose={onClose} width={600}>
      <div className={styles.wrap}>
        {/* Name */}
        <input
          className={styles.nameInput}
          defaultValue={task.name}
          onBlur={field('name')}
        />

        {/* Grid fields */}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>Project</label>
            <select className={styles.select} defaultValue={task.projectId} onChange={field('projectId')}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Section</label>
            <select className={styles.select} defaultValue={task.section} onChange={field('section')}>
              {(project?.sections || ['To Do','In Progress','Review','Done']).map(s =>
                <option key={s}>{s}</option>
              )}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <select className={styles.select} defaultValue={task.priority} onChange={field('priority')}>
              <option value="high">High</option>
              <option value="med">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Due date</label>
            <input type="date" className={styles.input} defaultValue={task.due || ''} onBlur={field('due')} />
          </div>
          <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>Assignee</label>
            <select className={styles.select} defaultValue={task.assigneeId || ''} onChange={e => updateTask(task.id, { assigneeId: e.target.value || null })}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            defaultValue={task.description || ''}
            onBlur={field('description')}
            placeholder="Add more detail…"
          />
        </div>

        {/* Comments */}
        <div className={styles.field}>
          <label className={styles.label}>Comments ({task.comments?.length || 0})</label>
          <div className={styles.comments}>
            {(!task.comments || task.comments.length === 0) && (
              <p className={styles.noComments}>No comments yet.</p>
            )}
            {task.comments?.map(c => (
              <div key={c.id} className={styles.comment}>
                <div className="avatar avatar-sm" style={{ background: members.find(m => m.id === c.authorId)?.color || '#888' }}>
                  {members.find(m => m.id === c.authorId)?.initials || '?'}
                </div>
                <div>
                  <span className={styles.commentAuthor}>{c.authorName}</span>
                  <p className={styles.commentText}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.commentInput}>
            <div className="avatar avatar-sm" style={{ background: currentUser?.color }}>{currentUser?.initials}</div>
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Leave a comment…"
            />
            <button className={styles.sendBtn} onClick={handleComment}>
              <IconSend size={14} />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            <IconTrash size={14} /> Delete task
          </button>
          <button className={styles.closeBtn} onClick={onClose}>Done</button>
        </div>
      </div>
    </Modal>
  )
}
