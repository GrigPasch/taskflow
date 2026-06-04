import { useState } from 'react'
import { IconTrash, IconSend, IconPlus, IconX } from '@tabler/icons-react'
import useStore, { canEditTask, canManageProject } from '../store/useStore'
import Modal from './Modal'
import styles from './TaskDetailModal.module.css'

export default function TaskDetailModal({ task, onClose }) {
  const { updateTask, deleteTask, addComment, addSubtask, toggleSubtask, deleteSubtask, members, projects, currentUserId } = useStore()
  const [comment, setComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)

  if (!task) return null

  const project      = projects.find(p => p.id === task.projectId)
  const currentUser  = members.find(m => m.id === currentUserId)
  const canEdit      = canEditTask(task, project, currentUser)
  const canManage    = canManageProject(project, currentUser)
  const subtasks = task.subtasks || []
  const subtasksDone = subtasks.filter(s => s.done).length

  const field = (key) => (e) => { if (canEdit) updateTask(task.id, { [key]: e.target.value }) }

  const handleDelete = () => { deleteTask(task.id); onClose() }

  const handleComment = () => {
    if (!comment.trim()) return
    addComment(task.id, comment.trim())
    setComment('')
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    addSubtask(task.id, newSubtask.trim())
    setNewSubtask('')
  }

  const isOverdue = !task.done && task.due && new Date(task.due) < new Date()

  return (
    <Modal title="Task details" onClose={onClose} width={620}>
      <div className={styles.wrap}>

        {/* Read-only banner */}
        {!canEdit && (
          <div className={styles.readonlyBar}>
            🔒 Μπορείτε να δείτε αυτή την εργασία αλλά δεν μπορείτε να την επεξεργαστείτε — δεν σας έχει ανατεθεί.
          </div>
        )}

        {/* Overdue warning */}
        {isOverdue && (
          <div className={styles.overdueBar}>
            ⚠ Αυτή η εργασία είναι εκπρόθεσμη — προθεσμία: {task.due}
          </div>
        )}

        {/* Name */}
        <input
          className={styles.nameInput}
          defaultValue={task.name}
          onBlur={field('name')}
          placeholder="Όνομα εργασίας…"
          readOnly={!canEdit}
          style={!canEdit ? { cursor: 'default', background: 'var(--bg)' } : undefined}
        />

        {/* Fields grid */}
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
              {(project?.sections || ['To Do','In Progress','Review','Κλείσιμο']).map(s => <option key={s}>{s}</option>)}
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
            <select className={styles.select} defaultValue={task.assigneeId || ''}
              onChange={e => updateTask(task.id, { assigneeId: e.target.value || null })}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea className={styles.textarea} defaultValue={task.description || ''} onBlur={field('description')} placeholder="Προσθέστε λεπτομέρειες…" />
        </div>

        {/* Subtasks */}
        <div className={styles.field}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label className={styles.label}>
              Subtasks {subtasks.length > 0 && <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({subtasksDone}/{subtasks.length})</span>}
            </label>
            <button className={styles.addSubBtn} onClick={() => setShowSubtaskInput(s => !s)}>
              <IconPlus size={12} /> Add subtask
            </button>
          </div>

          {subtasks.length > 0 && (
            <div className={styles.subtaskList}>
              {/* Progress bar */}
              {subtasks.length > 1 && (
                <div className={styles.subtaskProgress}>
                  <div className={styles.subtaskProgressBar} style={{ width: `${Math.round(subtasksDone / subtasks.length * 100)}%` }} />
                </div>
              )}
              {subtasks.map(s => (
                <div key={s.id} className={styles.subtaskRow}>
                  <div
                    className={`${styles.subtaskCheck} ${s.done ? styles.subtaskChecked : ''}`}
                    onClick={() => toggleSubtask(task.id, s.id)}
                  />
                  <span className={styles.subtaskName} style={{ textDecoration: s.done ? 'line-through' : 'none', color: s.done ? 'var(--text-3)' : 'var(--text)' }}>
                    {s.name}
                  </span>
                  <button className={styles.subtaskDel} onClick={() => deleteSubtask(task.id, s.id)}>
                    <IconX size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showSubtaskInput && (
            <div className={styles.subtaskInputRow}>
              <input
                className={styles.subtaskInput}
                autoFocus
                placeholder="Όνομα υποεργασίας…"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); if (e.key === 'Escape') setShowSubtaskInput(false) }}
              />
              <button className={styles.sendBtn} onClick={handleAddSubtask}><IconPlus size={14} /></button>
              <button className={styles.cancelSubBtn} onClick={() => setShowSubtaskInput(false)}><IconX size={14} /></button>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className={styles.field}>
          <label className={styles.label}>Comments ({task.comments?.length || 0})</label>
          <div className={styles.comments}>
            {(!task.comments || task.comments.length === 0) && (
              <p className={styles.noComments}>No comments yet. Be the first!</p>
            )}
            {task.comments?.map(c => (
              <div key={c.id} className={styles.comment}>
                <div className="avatar avatar-sm" style={{ background: members.find(m => m.id === c.authorId)?.color || '#888' }}>
                  {members.find(m => m.id === c.authorId)?.initials || '?'}
                </div>
                <div className={styles.commentBubble}>
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
              placeholder="Γράψτε σχόλιο… (Enter για αποστολή)"
            />
            <button className={styles.sendBtn} onClick={handleComment}><IconSend size={14} /></button>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {canManage && <button className={styles.deleteBtn} onClick={handleDelete}>
            <IconTrash size={14} /> Delete task
          </button>}
          <button className={styles.closeBtn} onClick={onClose}>Done</button>
        </div>
      </div>
    </Modal>
  )
}
