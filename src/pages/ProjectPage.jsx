import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconList, IconLayoutKanban, IconTimeline, IconPlus, IconTrash, IconPencil, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import useStore, { canManageProject, isProjectMember } from '../store/useStore'
import TaskRow from '../components/TaskRow'
import TaskDetailModal from '../components/TaskDetailModal'
import Modal from '../components/Modal'
import NewTaskModal from '../components/NewTaskModal'
import BoardView from '../components/BoardView'
import styles from './ProjectPage.module.css'

const VIEWS = [
  { key: 'list',     Icon: IconList,         label: 'Λίστα' },
  { key: 'board',    Icon: IconLayoutKanban, label: 'Kanban' },
  { key: 'timeline', Icon: IconTimeline,     label: 'Χρονοδιάγραμμα' },
]

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, tasks, members, deleteProject, currentUserId, addProjectMember, removeProjectMember } = useStore()
  const currentUser  = members.find(m => m.id === currentUserId)
  const project      = projects.find(p => p.id === id)
  const projectTasks = tasks.filter(t => t.projectId === id)
  const canManage    = canManageProject(project, currentUser)

  const [view,      setView]      = useState('list')
  const [selected,  setSelected]  = useState(null)
  const [newTask,   setNewTask]   = useState(null)
  const [editOpen,  setEditOpen]  = useState(false)

  if (!project) return <div style={{ padding: 40, color: 'var(--text-3)' }}>Το έργο δεν βρέθηκε.</div>

  if (currentUser?.role === 'member' && !isProjectMember(project, currentUserId)) return (
    <div style={{ padding: 40, color: 'var(--text-3)' }}>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Δεν έχετε πρόσβαση</div>
      <div>Δεν είστε μέλος αυτού του έργου.</div>
    </div>
  )

  const handleDelete = () => {
    if (!canManage) return
    deleteProject(id)
    navigate('/home')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.projDot} style={{ background: project.color }} />
        <h1 className={styles.title}>{project.name}</h1>
        {project.description && <span className={styles.desc}>{project.description}</span>}
        {canManage && (
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => setEditOpen(true)} title="Επεξεργασία έργου"><IconPencil size={15} /></button>
            <button className={styles.iconBtn} onClick={handleDelete} title="Διαγραφή έργου" style={{ color: 'var(--red)' }}><IconTrash size={15} /></button>
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        {VIEWS.map(v => (
          <button key={v.key} className={`${styles.tab} ${view === v.key ? styles.tabActive : ''}`} onClick={() => setView(v.key)}>
            <v.Icon size={14} /> {v.label}
          </button>
        ))}
        <div className={styles.tabSpacer} />
        {canManage && (
          <button className={styles.addBtn} onClick={() => setNewTask({ section: project.sections?.[0] || 'Προς Εκτέλεση' })}>
            <IconPlus size={14} /> Add task
          </button>
        )}
      </div>

      <div className={styles.content}>
        {view === 'list'     && <ListView     project={project} tasks={projectTasks} onSelect={setSelected} onNewTask={setNewTask} canManage={canManage} />}
        {view === 'board'    && <BoardView    project={project} tasks={projectTasks} onSelect={setSelected} onNewTask={setNewTask} />}
        {view === 'timeline' && <TimelineView project={project} tasks={projectTasks} onSelect={setSelected} members={members} />}
      </div>

      {selected && (
        <TaskDetailModal task={tasks.find(t => t.id === selected.id)} onClose={() => setSelected(null)} />
      )}
      {newTask && (
        <Modal title="Νέα εργασία" onClose={() => setNewTask(null)}>
          <NewTaskModal defaultProjectId={id} defaultSection={newTask.section} onClose={() => setNewTask(null)} />
        </Modal>
      )}
      {editOpen && (
        <Modal title="Επεξεργασία έργου" onClose={() => setEditOpen(false)}>
          <EditProjectModal project={project} onClose={() => setEditOpen(false)} />
        </Modal>
      )}
    </div>
  )
}

// ── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({ project, tasks, onSelect, onNewTask, canManage }) {
  const sections  = project.sections || ['Προς Εκτέλεση', 'Σε Εξέλιξη', 'Έλεγχος', 'Ολοκληρώθηκε']
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
              {canManage && <button className={styles.sectionAdd} onClick={e => { e.stopPropagation(); onNewTask({ section: sec }) }}>+ Προσθήκη</button>}
            </div>
            {!isCollapsed && (
              <>
                {sts.map(t => <TaskRow key={t.id} task={t} onClick={onSelect} />)}
                {canManage && (
                  <button className={styles.addRowBtn} onClick={() => onNewTask({ section: sec })}>
                    <span className={styles.addRowDot}>+</span>
                    <span>Προσθήκη εργασίας στο {sec}</span>
                  </button>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── TIMELINE VIEW ────────────────────────────────────────────────────────────
const SECTION_COLORS = {
  'Προς Εκτέλεση':  { bar: '#888780', text: '#fff' },
  'Εκκρεμεί':       { bar: '#888780', text: '#fff' },
  'Σε Εξέλιξη':    { bar: '#185FA5', text: '#fff' },
  'Έλεγχος':       { bar: '#534AB7', text: '#fff' },
  'Δοκιμές':       { bar: '#854F0B', text: '#fff' },
  'Ολοκληρώθηκε':  { bar: '#0F6E56', text: '#fff' },
}

function TimelineView({ project, tasks, onSelect, members }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [offset, setOffset] = useState(0) // weeks offset for navigation
  const DAYS = 35 // 5 weeks visible

  const viewStart = new Date(today)
  viewStart.setDate(viewStart.getDate() - viewStart.getDay() + 1 + offset * 7) // start Monday
  viewStart.setHours(0, 0, 0, 0)

  const viewEnd = new Date(viewStart)
  viewEnd.setDate(viewEnd.getDate() + DAYS)

  const tasksWithDue = tasks.filter(t => t.due)

  // Build weeks array for header
  const weeks = []
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(viewStart)
    d.setDate(d.getDate() + i)
    weeks.push(d)
  }

  const totalMs = viewEnd - viewStart
  const dayW = 100 / DAYS // % per day

  const pct = (date) => {
    const d = new Date(date); d.setHours(0,0,0,0)
    return Math.max(0, Math.min(100, (d - viewStart) / totalMs * 100))
  }

  const todayPct = pct(today)
  const todayVisible = todayPct >= 0 && todayPct <= 100

  const sections = project.sections || ['Προς Εκτέλεση', 'Σε Εξέλιξη', 'Έλεγχος', 'Ολοκληρώθηκε']

  // Month labels
  const months = []
  let lastMonth = null
  weeks.forEach((d, i) => {
    const m = d.toLocaleDateString('el-GR', { month: 'short' })
    if (m !== lastMonth) { months.push({ label: m, dayIndex: i }); lastMonth = m }
  })

  return (
    <div className={styles.tlWrap}>
      {/* Controls */}
      <div className={styles.tlControls}>
        <button className={styles.tlNavBtn} onClick={() => setOffset(o => o - 1)}><IconChevronLeft size={15} /></button>
        <button className={styles.tlTodayBtn} onClick={() => setOffset(0)}>Σήμερα</button>
        <button className={styles.tlNavBtn} onClick={() => setOffset(o => o + 1)}><IconChevronRight size={15} /></button>
        <span className={styles.tlRange}>
          {viewStart.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })} — {viewEnd.toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className={styles.tlGrid}>
        {/* Left label column header */}
        <div className={styles.tlLabelCol}>
          <div className={styles.tlHeaderCell} style={{ height: 52 }} />
        </div>

        {/* Right: header + rows */}
        <div className={styles.tlRight}>
          {/* Month row */}
          <div className={styles.tlMonthRow}>
            {months.map((m, i) => (
              <div key={i} className={styles.tlMonthLabel}
                style={{ left: `${m.dayIndex * dayW}%`, width: `${(months[i+1]?.dayIndex || DAYS) - m.dayIndex}%` * dayW }}>
                {m.label}
              </div>
            ))}
          </div>

          {/* Day header */}
          <div className={styles.tlDayHeader}>
            {weeks.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString()
              const isMon   = d.getDay() === 1
              return (
                <div key={i} className={`${styles.tlDayCell} ${isToday ? styles.tlDayToday : ''} ${isMon ? styles.tlDayMon : ''}`}>
                  <span className={styles.tlDayNum}>{d.getDate()}</span>
                </div>
              )
            })}
          </div>

          {/* Task rows grouped by section */}
          <div className={styles.tlBody}>
            {/* Today line */}
            {todayVisible && (
              <div className={styles.tlTodayLine} style={{ left: `${todayPct}%` }}>
                <div className={styles.tlTodayDot} />
              </div>
            )}

            {/* Weekend shading */}
            {weeks.map((d, i) => (
              (d.getDay() === 0 || d.getDay() === 6) && (
                <div key={i} className={styles.tlWeekend} style={{ left: `${i * dayW}%`, width: `${dayW}%` }} />
              )
            ))}

            {/* Column grid lines */}
            {weeks.map((d, i) => (
              d.getDay() === 1 && i > 0 && (
                <div key={i} className={styles.tlGridLine} style={{ left: `${i * dayW}%` }} />
              )
            ))}

            {sections.map(sec => {
              const secTasks = tasksWithDue.filter(t => t.section === sec)
              if (secTasks.length === 0) return null
              const colors = SECTION_COLORS[sec] || { bar: '#888780', text: '#fff' }
              return (
                <div key={sec}>
                  <div className={styles.tlSectionLabel}>{sec}</div>
                  {secTasks.map(t => {
                    const due       = new Date(t.due); due.setHours(0,0,0,0)
                    const barEnd    = pct(due)
                    // Start bar 3 days before due (visual width), clamp to view
                    const startDate = new Date(due); startDate.setDate(startDate.getDate() - 3)
                    const barStart  = pct(startDate)
                    const width     = Math.max(barEnd - barStart, dayW * 0.8)
                    const inView    = barEnd >= 0 && barStart <= 100
                    const assignee  = members.find(m => m.id === t.assigneeId)
                    const isOverdue = !t.done && due < today

                    return (
                      <div key={t.id} className={styles.tlRow} onClick={() => onSelect(t)}>
                        <div className={styles.tlBarTrack}>
                          {inView && (
                            <div
                              className={`${styles.tlBar} ${t.done ? styles.tlBarDone : ''}`}
                              style={{
                                left:       `${Math.max(0, barStart)}%`,
                                width:      `${Math.min(width, 100 - Math.max(0, barStart))}%`,
                                background: t.done ? '#9FE1CB' : isOverdue ? '#F09595' : colors.bar,
                              }}
                            >
                              <span className={styles.tlBarLabel}>{t.name}</span>
                              {assignee && (
                                <div className={styles.tlAvatar} style={{ background: assignee.color }}>{assignee.initials}</div>
                              )}
                            </div>
                          )}
                          {!inView && (
                            <div className={styles.tlOutOfView}>
                              {due < viewStart ? '◀ ' : '▶ '}{t.name} ({t.due})
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {tasksWithDue.length === 0 && (
              <div style={{ padding: '32px 16px', color: 'var(--text-3)', fontSize: 13 }}>
                Δεν υπάρχουν εργασίες με προθεσμία ακόμα.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── EDIT PROJECT MODAL ───────────────────────────────────────────────────────
function EditProjectModal({ project, onClose }) {
  const { updateProject } = useStore()
  const [name, setName] = useState(project.name)
  const [desc, setDesc] = useState(project.description || '')
  const save = () => { updateProject(project.id, { name, description: desc }); onClose() }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={{ fontSize:11.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:.4 }}>Όνομα έργου</label>
        <input style={{ height:34, padding:'0 10px', borderRadius:8, border:'1px solid var(--border)', width:'100%', fontFamily:'inherit', fontSize:13.5 }} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={{ fontSize:11.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:.4 }}>Περιγραφή</label>
        <textarea style={{ width:'100%', minHeight:72, padding:'8px 10px', borderRadius:8, border:'1px solid var(--border)', resize:'vertical', lineHeight:1.5, fontFamily:'inherit', fontSize:13.5 }} value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:4, borderTop:'1px solid var(--border)' }}>
        <button onClick={onClose} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:8, fontSize:13.5, cursor:'pointer', fontFamily:'inherit' }}>Ακύρωση</button>
        <button onClick={save} style={{ padding:'7px 18px', background:'var(--coral)', color:'#fff', borderRadius:8, fontSize:13.5, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'inherit' }}>Αποθήκευση</button>
      </div>
    </div>
  )
}