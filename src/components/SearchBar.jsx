import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconX } from '@tabler/icons-react'
import useStore from '../store/useStore'
import styles from './SearchBar.module.css'

export default function SearchBar() {
  const { searchQuery, setSearchQuery, getSearchResults, projects } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const results = getSearchResults()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    setSearchQuery(e.target.value)
    setOpen(true)
  }

  const handleSelect = (task) => {
    navigate(`/projects/${task.projectId}`)
    setSearchQuery('')
    setOpen(false)
  }

  const clear = () => { setSearchQuery(''); setOpen(false) }

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={styles.inputWrap}>
        <IconSearch size={14} className={styles.icon} />
        <input
          className={styles.input}
          placeholder="Αναζήτηση εργασιών…"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => searchQuery && setOpen(true)}
        />
        {searchQuery && (
          <button className={styles.clear} onClick={clear}><IconX size={13} /></button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map(t => {
            const proj = projects.find(p => p.id === t.projectId)
            const isOverdue = !t.done && t.due && new Date(t.due) < new Date()
            return (
              <div key={t.id} className={styles.result} onClick={() => handleSelect(t)}>
                <div className={styles.resultDot} style={{ background: proj?.color || '#888' }} />
                <div className={styles.resultBody}>
                  <div className={styles.resultName} style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-3)' : 'var(--text)' }}>
                    {highlight(t.name, searchQuery)}
                  </div>
                  <div className={styles.resultSub}>
                    {proj?.name} · {t.section}
                    {isOverdue && <span style={{ color: 'var(--red)', marginLeft: 6 }}>overdue</span>}
                  </div>
                </div>
                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
              </div>
            )
          })}
        </div>
      )}

      {open && searchQuery && results.length === 0 && (
        <div className={styles.dropdown}>
          <div className={styles.empty}>Δεν βρέθηκαν εργασίες για "{searchQuery}"</div>
        </div>
      )}
    </div>
  )
}

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'var(--coral-lt)', color: 'var(--coral)', borderRadius: 2 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
