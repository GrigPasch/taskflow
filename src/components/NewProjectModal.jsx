import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import styles from './NewProjectModal.module.css'

const COLORS = ['#D85A30','#0F6E56','#534AB7','#185FA5','#A32D2D','#3B6D11','#854F0B']

export default function NewProjectModal({ onClose }) {
  const { addProject } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const handleCreate = () => {
    if (!name.trim()) return
    const id = addProject({ name: name.trim(), description, color })
    onClose()
    navigate(`/projects/${id}`)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label className={styles.label}>Project name *</label>
        <input
          autoFocus
          className={styles.input}
          placeholder="e.g. Website Redesign"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          placeholder="What is this project about?"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <div className={styles.colorRow}>
          {COLORS.map(c => (
            <button
              key={c}
              className={`${styles.colorDot} ${color === c ? styles.selected : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button className={styles.submitBtn} onClick={handleCreate}>Create project</button>
      </div>
    </div>
  )
}
