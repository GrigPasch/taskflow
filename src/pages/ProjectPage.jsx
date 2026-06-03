import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconList, IconLayoutKanban, IconTimeline, IconPlus, IconTrash, IconPencil } from '@tabler/icons-react'
import useStore from '../store/useStore'
import TaskRow from '../components/TaskRow'
import TaskDetailModal from '../components/TaskDetailModal'
import Modal from '../components/Modal'
import NewTaskModal from '../components/NewTaskModal'
import styles from './ProjectPage.module.css'

const VIEWS = [
  { key: 'list',     Icon: IconList,           label: 'List' },
  { key: 'board',    Icon: IconLayoutKanban,   label: 'Board' },
  { key: 'timeline', Icon: IconTimeline,       label: 'Timeline' },
]

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, tasks, members, deleteProject, currentUserId } = useStore()
  const currentUser = members.find(m => m.id === currentUserId)

  const project = projects.find(p => p.id === id)
  const projectTasks = tasks.filter(t => t.projectId === id)

  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [newTask, setNewTask] = useState(null) // { section }
  const [editOpen, setEditOpen] = useState(false)

  if (!project) return (
    <div style={{ padding: 40, color: 'var(--text-3)' }}>Project not found.</div>
  )

  const handleDelete = () => {
    deleteProject(id)
    navigate('/home')
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.projDot} style={{ background: project.color }} />
        <h1 className={styles.title}>{project.name}</h1>
        {project.description && (
          <span className={styles.desc}>{project.description}</span>
        )}
        {currentUser?.role === 'admin' && (
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => setEditOpen(true)} title="Edit project">
              <IconPencil size={15} />
            </button>
            <button className={styles.iconBtn} onClick={handleDelete} title="Delete project" style={{ color: 'var(--red)' }}>
              <IconTrash size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {VIEWS.map(v => (
          <button
            key={v.key}
            className={`${styles.tab} ${view === v.key ? styles.tabActive : ''}`}
            onClick={() => setView(v.key)}
          >
            <v.Icon size={14} /> {v.label}
          </button>
        ))}
        <div className={styles.tabSpacer} />
        <button className={styles.addBtn} onClick={() => setNewTask({ section: project.sections?.[0] || 'To Do' })}>
          <IconPlus size={14} /> Add task
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {view === 'list'     && <ListView     project={project} tasks={projectTasks} onSelect={setSelected} onNewTask={setNewTask} />}
        {view === 'board'    && <BoardView    project={project} tasks={projectTasks} onSelect={setSelected} onNewTask={setNewTask} />}
        {view === 'timeline' && <TimelineView project={project} tasks={projectTasks} onSelect={setSelected} />}
      </div>

      {/* Modals */}
      {selected && (
        <TaskDetailModal
          task={tasks.find(t => t.id === selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
      {newTask && (
        <Modal title="New task" onClose={() => setNewTask(null)}>
          <NewTaskModal
            defaultProjectId={id}
            defaultSection={newTask.section}
            onClose={() => setNewTask(null)}
          />
        </Modal>
      )}
      {editOpen && (
        <Modal title="Edit project" onClose={() => setEditOpen(false)}>
          <EditProjectModal project={project} onClose={() => setEditOpen(false)} />
        </Modal>
      )}
    </div>
  )
}

// ── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({ project, tasks, onSelect, onNewTask }) {
  const sections = project.sections || ['To Do', 'In Progress', 'Review', 'Done']
  const [collapsed, setCollapsed] = useState({})

  return (
    <div className={styles.listWrap}>
      {sections.map(sec => {
        const sts = tasks.filter(t => t.section === sec)
        const isCollapsed = collapsed[sec]
        return (
          <div key={sec} className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => setCollapsed(c => ({ ...c, [sec]: !c[sec] }))}>
              <span className={styles.chevron}>{isCollapsed ? '▶' : '▼'}</span>
              <span className={styles.sectionName}>{sec}</span>
              <span className={styles.sectionCount}>{sts.length}</span>
              <div className={styles.sectionLine} />
              <button className={styles.sectionAdd} onClick={e => { e.stopPropagation(); onNewTask({ section: sec }) }}>
                + Add
              </button>
            </div>
            {!isCollapsed && (
              <>
                {sts.map(t => <TaskRow key={t.id} task={t} onClick={onSelect} />)}
                <button className={styles.addRowBtn} onClick={() => onNewTask({ section: sec })}>
                  <span className={styles.addRowDot}>+</span>
                  <span>Add task to {sec}</span>
                </button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── BOARD VIEW ───────────────────────────────────────────────────────────────
const COL_COLORS = { 'To Do': '#888780', 'In Progress': '#185FA5', 'Review': '#534AB7', 'Done': '#0F6E56', 'Backlog': '#854F0B', 'Testing': '#A32D2D' }

function BoardView({ project, tasks, onSelect, onNewTask }) {
  const { moveTask, members } = useStore()
  const sections = project.sections || ['To Do', 'In Progress', 'Review', 'Done']

  return (
    <div className={styles.board}>
      {sections.map(sec => {
        const cts = tasks.filter(t => t.section === sec)
        const color = COL_COLORS[sec] || '#888780'
        return (
          <div key={sec} className={styles.col}>
            <div className={styles.colHeader}>
              <div className={styles.colDot} style={{ background: color }} />
              <span className={styles.colTitle}>{sec}</span>
              <span className={styles.colCount}>{cts.length}</span>
              <button className={styles.colAdd} onClick={() => onNewTask({ section: sec })}>
                <IconPlus size={14} />
              </button>
            </div>
            <div className={styles.cards}>
              {cts.map(t => {
                const assignee = members.find(m => m.id === t.assigneeId)
                return (
                  <div key={t.id} className={styles.card} onClick={() => onSelect(t)}>
                    <div className={styles.cardTitle}>{t.name}</div>
                    <div className={styles.cardMeta}>
                      <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                      {t.due && <span className={styles.cardDue}>{t.due}</span>}
                      {assignee && (
                        <div className="avatar avatar-sm" style={{ background: assignee.color, marginLeft: 'auto' }}>
                          {assignee.initials}
                        </div>
                      )}
                    </div>
                    {/* Move to section dropdown */}
                    <select
                      className={styles.moveSelect}
                      value={t.section}
                      onClick={e => e.stopPropagation()}
                      onChange={e => moveTask(t.id, e.target.value)}
                    >
                      {sections.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )
              })}
            </div>
            <button className={styles.colAddBtn} onClick={() => onNewTask({ section: sec })}>
              <IconPlus size={13} /> Add card
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── TIMELINE VIEW ────────────────────────────────────────────────────────────
function TimelineView({ project, tasks, onSelect }) {
  const tasksWithDue = tasks.filter(t => t.due)
  const sections = project.sections || ['To Do', 'In Progress', 'Review', 'Done']
  const colors = { 'To Do': '#888780', 'In Progress': '#185FA5', 'Review': '#534AB7', 'Done': '#0F6E56', 'Backlog': '#854F0B', 'Testing': '#A32D2D' }

  const now = new Date()
  const minD = new Date(now.getFullYear(), now.getMonth(), 1)
  const maxD = new Date(now.getFullYear(), now.getMonth() + 2, 0)
  const span = maxD - minD

  return (
    <div className={styles.timelineWrap}>
      <div className={styles.timelineScale}>
        {Array.from({ length: 5 }).map((_, i) => {
          const d = new Date(minD.getTime() + (span / 4) * i)
          return <span key={i}>{d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
        })}
      </div>
      {tasksWithDue.map(t => {
        const due = new Date(t.due)
        const offset = Math.max(0, Math.min(100, (due - minD) / span * 100))
        const barW = 12
        const left = Math.min(offset, 100 - barW)
        const color = colors[t.section] || '#888'
        return (
          <div key={t.id} className={styles.tlRow} onClick={() => onSelect(t)}>
            <div className={styles.tlName}>{t.name}</div>
            <div className={styles.tlTrack}>
              <div
                className={styles.tlBar}
                style={{ left: `${left}%`, width: `${barW}%`, background: color }}
                title={t.due}
              />
            </div>
            <div className={styles.tlDate}>{t.due}</div>
          </div>
        )
      })}
      {tasksWithDue.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '16px 0' }}>No tasks with due dates yet.</p>
      )}
    </div>
  )
}

// ── EDIT PROJECT MODAL ───────────────────────────────────────────────────────
function EditProjectModal({ project, onClose }) {
  const { updateProject } = useStore()
  const [name, setName] = useState(project.name)
  const [desc, setDesc] = useState(project.description || '')

  const save = () => {
    updateProject(project.id, { name, description: desc })
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .4 }}>Project name</label>
        <input style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border)', width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .4 }}>Description</label>
        <textarea style={{ width: '100%', minHeight: 72, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }} value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
        <button onClick={onClose} style={{ padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
        <button onClick={save} style={{ padding: '7px 18px', background: 'var(--coral)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  )
}
