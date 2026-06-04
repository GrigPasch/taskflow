import { useState } from 'react'
import useStore from '../store/useStore'
import styles from './NewTaskModal.module.css'

export default function NewTaskModal({ defaultProjectId, defaultSection, onClose }) {
  const { addTask, projects, members } = useStore()
  const [form, setForm] = useState({
    name: '',
    projectId: defaultProjectId || projects[0]?.id || '',
    section: defaultSection || 'To Do',
    priority: 'med',
    due: '',
    assigneeId: '',
    description: '',
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const selectedProject = projects.find(p => p.id === form.projectId)

  const handleSubmit = () => {
    if (!form.name.trim()) return
    addTask({ ...form, assigneeId: form.assigneeId || null })
    onClose()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label className={styles.label}>Task name *</label>
        <input
          className={styles.input}
          autoFocus
          placeholder="Τι πρέπει να γίνει;"
          value={form.name}
          onChange={set('name')}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Project</label>
          <select className={styles.select} value={form.projectId} onChange={set('projectId')}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Section</label>
          <select className={styles.select} value={form.section} onChange={set('section')}>
            {(selectedProject?.sections || ['To Do','In Progress','Review','Done']).map(s =>
              <option key={s}>{s}</option>
            )}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Priority</label>
          <select className={styles.select} value={form.priority} onChange={set('priority')}>
            <option value="high">Υψηλή</option>
            <option value="med">Medium</option>
            <option value="low">Χαμηλή</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Due date</label>
          <input type="date" className={styles.input} value={form.due} onChange={set('due')} />
        </div>
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.label}>Assignee</label>
          <select className={styles.select} value={form.assigneeId} onChange={set('assigneeId')}>
            <option value="">Χωρίς ανάθεση</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Προσθέστε περισσότερες πληροφορίες…"
            value={form.description}
            onChange={set('description')}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button className={styles.submitBtn} onClick={handleSubmit}>Create task</button>
      </div>
    </div>
  )
}
