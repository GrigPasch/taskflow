import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'

const hashPassword  = (pw)       => btoa(pw + '_taskflow_salt')
const checkPassword = (pw, hash) => hashPassword(pw) === hash

// ── Slack notification helper — goes through local proxy to avoid CORS ──────
const PROXY_URL = '/api/slack'

// In-memory log for the debug panel in Settings
export const slackLog = []

async function sendSlackNotification(webhookUrl, message) {
  const entry = { at: new Date().toISOString(), webhookUrl: webhookUrl?.slice(0, 60) + '...', message, status: 'sending', error: null }
  slackLog.unshift(entry)
  if (slackLog.length > 20) slackLog.pop()

  if (!webhookUrl) {
    entry.status = 'error'; entry.error = 'No webhook URL provided'
    console.error('[Slack] No webhook URL')
    return
  }

  console.log('[Slack] Sending to proxy:', PROXY_URL, '\nMessage:', message)

  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl, text: message }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      entry.status = 'error'; entry.error = `HTTP ${res.status}: ${JSON.stringify(data)}`
      console.error('[Slack] Proxy returned error:', res.status, data)
    } else {
      entry.status = 'ok'
      console.log('[Slack] ✓ Sent successfully')
    }
  } catch (e) {
    entry.status = 'error'; entry.error = e.message
    console.error('[Slack] Proxy unreachable — run: npm run server\nError:', e.message)
  }
}

// ── Seed data (Greek) ────────────────────────────────────────────────────────
const SEED_MEMBERS = [
  { id: 'u1', name: 'Κωνσταντίνος Παπαπαναγιώτου', email: 'kpap@dromeas.gr',       role: 'admin',   color: '#D85A30', initials: 'KΠ', passwordHash: hashPassword('admin123')  },
  { id: 'u2', name: 'Ιωάννα Χατζήμπαντη',          email: 'ichatzibadi@dromeas.gr', role: 'manager', color: '#0F6E56', initials: 'ΙΧ', passwordHash: hashPassword('ioanna123') },
  { id: 'u3', name: 'Αλέξης Τσαγκαλίδης',           email: 'atsagalidi@dromeas.gr',  role: 'member',  color: '#534AB7', initials: 'ΑΤ', passwordHash: hashPassword('alexis123') },
  { id: 'u4', name: 'Φωτεινή Σαββάκη',              email: 'fsavvaki@dromeas.gr',    role: 'member',  color: '#185FA5', initials: 'ΦΣ', passwordHash: hashPassword('fotini123') },
  { id: 'u5', name: 'Σοφία Κεχαγιά',                email: 'skehagia@dromeas.gr',    role: 'member',  color: '#3B6D11', initials: 'ΣΚ', passwordHash: hashPassword('sofia123')  },
]

const SEED_PROJECTS = [
  {
    id: 'p1', name: 'Γερμανικός Στρατός', color: '#D85A30',
    description: 'Ερμάρια Γερμανικού Στρατού',
    sections: ['Προς Εκτέλεση', 'Σε Εξέλιξη', 'Έλεγχος', 'Ολοκληρώθηκε'],
    createdBy: 'u2', memberIds: ['u2', 'u4'],
  },
  {
    id: 'p2', name: 'Διαγωνισμός Ευρωπαϊκής - Αφρική', color: '#0F6E56',
    description: 'Ευρωπαϊκός Διαγωνισμός - Αφρική',
    sections: ['Εκκρεμεί', 'Σε Εξέλιξη', 'Έλεγχος', 'Ολοκληρώθηκε'],
    createdBy: 'u2', memberIds: ['u2', 'u3', 'u5'],
  },
  {
    id: 'p3', name: 'Διαγωνισμός Δημοσίου', color: '#534AB7',
    description: 'Δημόσιο Ελλάδα',
    sections: ['Προς Εκτέλεση', 'Σε Εξέλιξη', 'Δοκιμές', 'Ολοκληρώθηκε'],
    createdBy: 'u1', memberIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
  },
]

const SEED_TASKS = [
  {
    id: 't1', projectId: 'p1',
    name: 'Ερμάρια Γερμανικού Στρατού',
    priority: 'high', section: 'Προς Εκτέλεση', assigneeId: 'u4', due: '2025-07-10', done: false,
    description: 'Να δοθούν προσφορές για τον διαγωνισμό Α354 του Γερμανικού Στρατού.',
    comments: [], subtasks: [],
  },
  {
    id: 't2', projectId: 'p2',
    name: 'Q/A για τον Ευρωπαϊκό Διαγωνισμό Αφρικής',
    priority: 'med', section: 'Σε Εξέλιξη', assigneeId: 'u2', due: '2025-07-08', done: false,
    description: 'Να γίνει το Q/A για τον Ευρωπαϊκό Διαγωνισμό για την Αφρική.',
    comments: [], subtasks: [],
  },
  {
    id: 't3', projectId: 'p2',
    name: 'Αποστολή πιστοποιήσεων ISO 50001:50003',
    priority: 'low', section: 'Σε Εξέλιξη', assigneeId: 'u2', due: '2025-07-15', done: false,
    description: 'Να αποσταλούν οι πιστοποιήσεις ISO 50001:50003 για τα γραφεία.',
    comments: [], subtasks: [],
  },
  {
    id: 't4', projectId: 'p2',
    name: 'Κατασκευή & Αποστολή Δείγματος',
    priority: 'high', section: 'Σε Εξέλιξη', assigneeId: 'u5', due: '2025-06-11', done: false,
    description: 'Να φτιαχτεί δείγμα και να σταλεί για την απόκτηση του πιστοποιητικού.',
    comments: [], subtasks: [
      { id: 'st1', name: 'Κατασκευή δείγματος', done: false },
      { id: 'st2', name: 'Επικοινωνία με εταιρεία πιστοποίησης', done: false },
      { id: 'st3', name: 'Αποστολή δείγματος', done: false },
    ],
  },
  {
    id: 't5', projectId: 'p3',
    name: 'Τεχνική Προσφορά Δημοσίου',
    priority: 'high', section: 'Προς Εκτέλεση', assigneeId: 'u3', due: '2025-07-20', done: false,
    description: 'Σύνταξη τεχνικής προσφοράς για τον διαγωνισμό δημοσίου.',
    comments: [], subtasks: [],
  },
  {
    id: 't6', projectId: 'p3',
    name: 'Οικονομική Προσφορά',
    priority: 'med', section: 'Προς Εκτέλεση', assigneeId: 'u4', due: '2025-07-22', done: false,
    description: 'Σύνταξη οικονομικής προσφοράς.',
    comments: [], subtasks: [],
  },
]

// ── Permission helpers ────────────────────────────────────────────────────────
export function canEditTask(task, project, currentUser) {
  if (!currentUser) return false
  if (currentUser.role === 'admin') return true
  if (currentUser.role === 'manager' && project?.createdBy === currentUser.id) return true
  if (task?.assigneeId === currentUser.id) return true
  return false
}

export function canManageProject(project, currentUser) {
  if (!currentUser) return false
  if (currentUser.role === 'admin') return true
  if (currentUser.role === 'manager' && project?.createdBy === currentUser.id) return true
  return false
}

export function canCreateProject(currentUser) {
  if (!currentUser) return false
  return currentUser.role === 'admin' || currentUser.role === 'manager'
}

export function isProjectMember(project, userId) {
  if (!project) return false
  return (project.memberIds || []).includes(userId) || project.createdBy === userId
}

// ── Seed version — bump this whenever SEED_MEMBERS changes ──────────────────
const SEED_VERSION = 3

// ── Store ─────────────────────────────────────────────────────────────────────
const useStore = create(
  persist(
    (set, get) => ({
      // ── Seed version tracking ─────────────────────────────────────────────
      seedVersion: SEED_VERSION,

      // ── Auth ──────────────────────────────────────────────────────────────
      currentUserId: null,
      authError: null,

      login: (email, password) => {
        const member = get().members.find(m => m.email.toLowerCase() === email.toLowerCase())
        if (!member)                              { set({ authError: 'Δεν βρέθηκε λογαριασμός με αυτό το email.' }); return false }
        if (!checkPassword(password, member.passwordHash)) { set({ authError: 'Λανθασμένος κωδικός πρόσβασης.' }); return false }
        set({ currentUserId: member.id, authError: null })
        get().pushUpdate(`${member.name} συνδέθηκε`)
        return true
      },
      logout:         () => set({ currentUserId: null, authError: null }),
      clearAuthError: () => set({ authError: null }),
      getCurrentUser: () => {
        const id = get().currentUserId
        return get().members.find(m => m.id === id) || null
      },

      // ── Slack settings ─────────────────────────────────────────────────────
      // projectWebhooks: { [projectId]: webhookUrl }
      slackEnabled: true,
      projectWebhooks: {},   // per-project webhook URLs
      slackEvents: {
        taskAssigned:   true,
        taskCompleted:  true,
        taskUpdated:    false,
        taskCreated:    true,
        commentAdded:   false,
      },
      setSlackEnabled:      (val)           => set({ slackEnabled: val }),
      setProjectWebhook:    (projId, url)   => set(s => ({ projectWebhooks: { ...s.projectWebhooks, [projId]: url } })),
      removeProjectWebhook: (projId)        => set(s => { const pw = { ...s.projectWebhooks }; delete pw[projId]; return { projectWebhooks: pw } }),
      setSlackEvent:        (k, val)        => set(s => ({ slackEvents: { ...s.slackEvents, [k]: val } })),

      testSlack: async (projId) => {
        const url = get().projectWebhooks[projId]
        if (!url) return
        const proj = get().projects.find(p => p.id === projId)
        await sendSlackNotification(url,
          `:white_check_mark: *Taskflow* — Η σύνδεση για το έργο *${proj?.name}* λειτουργεί!`
        )
      },

      // Send to the webhook of the task's project (if configured)
      _slack: (msg, event, projectId) => {
        const { slackEnabled, projectWebhooks, slackEvents } = get()
        console.log(`[Slack._slack] event=${event} projectId=${projectId} enabled=${slackEnabled} eventEnabled=${slackEvents[event]} hasUrl=${!!projectWebhooks[projectId]}`)
        if (!slackEnabled) { console.warn('[Slack] Skipped — Slack is disabled in Settings'); return }
        if (!slackEvents[event]) { console.warn(`[Slack] Skipped — event "${event}" is disabled`); return }
        const url = projectWebhooks[projectId]
        if (!url) { console.warn(`[Slack] Skipped — no webhook URL for project ${projectId}`); return }
        sendSlackNotification(url, msg)
      },

      // ── Data ──────────────────────────────────────────────────────────────
      members:  SEED_MEMBERS,
      projects: SEED_PROJECTS,
      tasks:    SEED_TASKS,
      notifications: [
        { id: 'n1', read: false, text: 'Σας ανατέθηκε η εργασία "Ερμάρια Γερμανικού Στρατού"', sub: 'Γερμανικός Στρατός · μόλις τώρα' },
        { id: 'n2', read: false, text: '"Κατασκευή & Αποστολή Δείγματος" είναι εκπρόθεσμο', sub: 'Διαγωνισμός Ευρωπαϊκής · 1ω πριν' },
        { id: 'n3', read: true,  text: 'Ο Κωνσταντίνος ολοκλήρωσε εργασία', sub: '1μ πριν' },
      ],

      // ── Search ────────────────────────────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      getSearchResults: () => {
        const q = get().searchQuery.toLowerCase().trim()
        if (!q) return []
        const userId = get().currentUserId
        const user   = get().members.find(m => m.id === userId)
        return get().tasks.filter(t => {
          const proj = get().projects.find(p => p.id === t.projectId)
          if (user?.role === 'member' && !isProjectMember(proj, userId)) return false
          return t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        }).slice(0, 8)
      },

      // ── Live updates ──────────────────────────────────────────────────────
      updates: [],
      pushUpdate: (msg) => set(s => ({
        updates: [{ id: uuid(), msg, at: new Date().toISOString() }, ...s.updates].slice(0, 10)
      })),

      // ── Tasks ─────────────────────────────────────────────────────────────
      addTask: (task) => {
        const currentUser = get().getCurrentUser()
        const project     = get().projects.find(p => p.id === task.projectId)
        if (!canManageProject(project, currentUser)) return null
        const id = uuid()
        set(s => ({ tasks: [...s.tasks, { id, comments: [], subtasks: [], done: false, createdBy: currentUser.id, ...task }] }))
        get().pushUpdate(`Νέα εργασία: "${task.name}"`)

        if (task.assigneeId && task.assigneeId !== currentUser.id) {
          const assignee = get().members.find(m => m.id === task.assigneeId)
          // targetUserId ensures only the assignee sees this notification
          set(s => ({ notifications: [
            { id: uuid(), read: false, targetUserId: task.assigneeId, text: `${currentUser.name} σας ανέθεσε "${task.name}"`, sub: `${project?.name} · μόλις τώρα` },
            ...s.notifications,
          ]}))
          get()._slack(
            `:bell: *Νέα εργασία για σένα, ${assignee?.name}!*\n>${task.name}\n<${window.location.origin}/projects/${task.projectId}|Άνοιγμα εργασίας →>`,
            'taskAssigned', task.projectId
          )
        }
        get()._slack(
          `:memo: *Νέα εργασία:* ${task.name}\n<${window.location.origin}/projects/${task.projectId}|Άνοιγμα →>`,
          'taskCreated', task.projectId
        )
        return id
      },

      updateTask: (id, patch) => {
        const currentUser = get().getCurrentUser()
        const task        = get().tasks.find(t => t.id === id)
        const project     = get().projects.find(p => p.id === task?.projectId)
        if (!canEditTask(task, project, currentUser)) return false

        // Handle reassignment notification + Slack
        if (patch.assigneeId && patch.assigneeId !== task.assigneeId && patch.assigneeId !== currentUser.id) {
          const newAssignee = get().members.find(m => m.id === patch.assigneeId)
          set(s => ({ notifications: [
            { id: uuid(), read: false, targetUserId: patch.assigneeId, text: `${currentUser.name} σας ανέθεσε "${task.name}"`, sub: `${project?.name} · μόλις τώρα` },
            ...s.notifications,
          ]}))
          get()._slack(
            `:bell: *Νέα εργασία για σένα, ${newAssignee?.name}!*\n>${task.name}\n<${window.location.origin}/projects/${task.projectId}|Άνοιγμα εργασίας →>`,
            'taskAssigned', task.projectId
          )
        }

        set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }))
        get().pushUpdate(`Ενημερώθηκε: "${task.name}"`)
        get()._slack(
          `:pencil: *Ενημερώθηκε:* ${task.name}\n<${window.location.origin}/projects/${task.projectId}|Άνοιγμα →>`,
          'taskUpdated', task.projectId
        )
        return true
      },

      toggleTask: (id) => {
        const currentUser = get().getCurrentUser()
        const task        = get().tasks.find(t => t.id === id)
        const project     = get().projects.find(p => p.id === task?.projectId)
        if (!canEditTask(task, project, currentUser)) return false
        const done = !task.done
        set(s => ({
          tasks: s.tasks.map(x => x.id === id
            ? { ...x, done, section: done ? 'Ολοκληρώθηκε' : (x.section === 'Ολοκληρώθηκε' ? 'Προς Εκτέλεση' : x.section) }
            : x),
        }))
        get().pushUpdate(done ? `✓ "${task.name}" ολοκληρώθηκε` : `"${task.name}" επαναστάθηκε`)
        if (done) {
          get()._slack(
            `:white_check_mark: *Ολοκληρώθηκε:* ${task.name}\n<${window.location.origin}/projects/${task.projectId}|Άνοιγμα →>`,
            'taskCompleted', task.projectId
          )
        }
        return true
      },

      deleteTask: (id) => {
        const currentUser = get().getCurrentUser()
        const task        = get().tasks.find(t => t.id === id)
        const project     = get().projects.find(p => p.id === task?.projectId)
        if (!canManageProject(project, currentUser)) return false
        set(s => ({ tasks: s.tasks.filter(x => x.id !== id) }))
        get().pushUpdate(`Διαγράφηκε: "${task?.name}"`)
        return true
      },

      moveTask: (taskId, toSection) => {
        const currentUser = get().getCurrentUser()
        const task        = get().tasks.find(t => t.id === taskId)
        const project     = get().projects.find(p => p.id === task?.projectId)
        if (!canEditTask(task, project, currentUser)) return false
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, section: toSection } : t) }))
        get().pushUpdate(`Μεταφέρθηκε: "${task.name}" → ${toSection}`)
        get()._slack(
          `:arrow_right: *${task.name}* → ${toSection}\n<${window.location.origin}/projects/${task.projectId}|Άνοιγμα →>`,
          'taskUpdated', task.projectId
        )
        return true
      },

      reorderTasks: (projectId, section, orderedIds) => {
        set(s => {
          const others    = s.tasks.filter(t => !(t.projectId === projectId && t.section === section))
          const reordered = orderedIds.map(id => s.tasks.find(t => t.id === id)).filter(Boolean)
          return { tasks: [...others, ...reordered] }
        })
      },

      // ── Comments ──────────────────────────────────────────────────────────
      addComment: (taskId, text) => {
        const currentUser = get().getCurrentUser()
        const task        = get().tasks.find(t => t.id === taskId)
        const project     = get().projects.find(p => p.id === task?.projectId)
        if (!isProjectMember(project, currentUser?.id) && currentUser?.role !== 'admin') return
        const comment = { id: uuid(), authorId: currentUser.id, authorName: currentUser.name, text, at: new Date().toISOString() }
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t) }))
        get().pushUpdate(`Σχόλιο από ${currentUser.name}`)
        if (task?.assigneeId && task.assigneeId !== currentUser.id) {
          set(s => ({ notifications: [
            { id: uuid(), read: false, targetUserId: task.assigneeId, text: `${currentUser.name} σχολίασε "${task.name}"`, sub: `${project?.name} · μόλις τώρα` },
            ...s.notifications,
          ]}))
        }
        get()._slack(
          `:speech_balloon: *Νέο σχόλιο από ${currentUser.name}:* ${text}\n<${window.location.origin}/projects/${task.projectId}|Άνοιγμα →>`,
          'commentAdded', task.projectId
        )
      },

      // ── Subtasks ──────────────────────────────────────────────────────────
      addSubtask: (taskId, name) => {
        const currentUser = get().getCurrentUser()
        const task        = get().tasks.find(t => t.id === taskId)
        const project     = get().projects.find(p => p.id === task?.projectId)
        if (!canEditTask(task, project, currentUser)) return
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), { id: uuid(), name, done: false }] } : t) }))
      },
      toggleSubtask: (taskId, subtaskId) => {
        const currentUser = get().getCurrentUser()
        const task        = get().tasks.find(t => t.id === taskId)
        const project     = get().projects.find(p => p.id === task?.projectId)
        if (!canEditTask(task, project, currentUser)) return
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks||[]).map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) } : t) }))
      },
      deleteSubtask: (taskId, subtaskId) => {
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks||[]).filter(s => s.id !== subtaskId) } : t) }))
      },

      // ── Projects ──────────────────────────────────────────────────────────
      addProject: (project) => {
        const currentUser = get().getCurrentUser()
        if (!canCreateProject(currentUser)) return null
        const id = uuid()
        set(s => ({ projects: [...s.projects, { id, sections: ['Προς Εκτέλεση','Σε Εξέλιξη','Έλεγχος','Ολοκληρώθηκε'], createdBy: currentUser.id, memberIds: [currentUser.id], ...project }] }))
        get().pushUpdate(`Νέο έργο: "${project.name}"`)
        return id
      },
      updateProject: (id, patch) => {
        const currentUser = get().getCurrentUser()
        const project     = get().projects.find(p => p.id === id)
        if (!canManageProject(project, currentUser)) return false
        set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p) }))
        get().pushUpdate('Ενημερώθηκε έργο')
        return true
      },
      deleteProject: (id) => {
        const currentUser = get().getCurrentUser()
        const project     = get().projects.find(p => p.id === id)
        if (!canManageProject(project, currentUser)) return false
        set(s => ({ projects: s.projects.filter(x => x.id !== id), tasks: s.tasks.filter(t => t.projectId !== id) }))
        get().pushUpdate(`Διαγράφηκε έργο: "${project?.name}"`)
        return true
      },
      addSection: (projectId, name) => {
        set(s => ({ projects: s.projects.map(p => p.id === projectId ? { ...p, sections: [...p.sections, name] } : p) }))
      },
      addProjectMember: (projectId, userId) => {
        set(s => ({ projects: s.projects.map(p => p.id === projectId ? { ...p, memberIds: [...new Set([...(p.memberIds||[]), userId])] } : p) }))
        const member  = get().members.find(m => m.id === userId)
        const project = get().projects.find(p => p.id === projectId)
        get().pushUpdate(`${member?.name} προστέθηκε στο ${project?.name}`)
      },
      removeProjectMember: (projectId, userId) => {
        set(s => ({ projects: s.projects.map(p => p.id === projectId ? { ...p, memberIds: (p.memberIds||[]).filter(id => id !== userId) } : p) }))
      },

      // ── Members ───────────────────────────────────────────────────────────
      addMember: (member) => {
        const currentUser = get().getCurrentUser()
        if (currentUser?.role !== 'admin') return
        const id = uuid()
        set(s => ({ members: [...s.members, { id, passwordHash: hashPassword(member.password || 'changeme123'), ...member }] }))
        get().pushUpdate(`${member.name} προστέθηκε`)
        set(s => ({ notifications: [{ id: uuid(), read: false, text: `${member.name} προστέθηκε στο workspace`, sub: 'μόλις τώρα' }, ...s.notifications] }))
      },
      updateMember: (id, patch) => {
        const currentUser = get().getCurrentUser()
        if (currentUser?.role !== 'admin' && currentUser?.id !== id) return
        if (patch.password) { patch.passwordHash = hashPassword(patch.password); delete patch.password }
        set(s => ({ members: s.members.map(m => m.id === id ? { ...m, ...patch } : m) }))
        get().pushUpdate('Μέλος ενημερώθηκε')
      },
      removeMember: (id) => {
        const currentUser = get().getCurrentUser()
        if (currentUser?.role !== 'admin') return
        const m = get().members.find(m => m.id === id)
        set(s => ({
          members:  s.members.filter(x => x.id !== id),
          tasks:    s.tasks.map(t => t.assigneeId === id ? { ...t, assigneeId: null } : t),
          projects: s.projects.map(p => ({ ...p, memberIds: (p.memberIds||[]).filter(mid => mid !== id) })),
        }))
        if (m) get().pushUpdate(`${m.name} αφαιρέθηκε`)
      },

      // ── Notifications ─────────────────────────────────────────────────────
      markNotifRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllRead:   ()   => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),

      // ── Reset ─────────────────────────────────────────────────────────────
      resetData: () => {
        // Nuke ALL taskflow localStorage keys so persist can't rehydrate stale data
        Object.keys(localStorage)
          .filter(k => k.toLowerCase().includes('taskflow'))
          .forEach(k => localStorage.removeItem(k))
        set({
          members:         SEED_MEMBERS,
          projects:        SEED_PROJECTS,
          tasks:           SEED_TASKS,
          updates:         [],
          notifications:   [],
          currentUserId:   null,
          slackEnabled:    true,
          projectWebhooks: {},
          seedVersion:     SEED_VERSION,
        })
      },
    }),
    {
      name: 'taskflow-dromeas-v2',
      onRehydrateStorage: () => (state) => {
        // If seed version changed, merge new seed members in
        if (state && state.seedVersion !== SEED_VERSION) {
          const existingIds = new Set(state.members.map(m => m.id))
          const newMembers  = SEED_MEMBERS.filter(m => !existingIds.has(m.id))
          state.members     = [...state.members, ...newMembers]
          state.seedVersion = SEED_VERSION
        }
      },
      partialize: (s) => ({
        seedVersion:     s.seedVersion,
        currentUserId:   s.currentUserId,
        members:         s.members,
        projects:        s.projects,
        tasks:           s.tasks,
        notifications:   s.notifications,
        slackEnabled:      s.slackEnabled,
        projectWebhooks:   s.projectWebhooks,
        slackEvents:       s.slackEvents,
      }),
    }
  )
)

export default useStore