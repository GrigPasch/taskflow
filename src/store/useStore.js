import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

const SAMPLE_MEMBERS = [
  { id: 'u1', name: 'Alex Director', email: 'alex@taskflow.io', role: 'admin', color: '#D85A30', initials: 'AD' },
  { id: 'u2', name: 'Jordan Lee',    email: 'jordan@taskflow.io', role: 'member', color: '#0F6E56', initials: 'JL' },
  { id: 'u3', name: 'Sam Park',      email: 'sam@taskflow.io',    role: 'member', color: '#534AB7', initials: 'SP' },
  { id: 'u4', name: 'Riley Chen',    email: 'riley@taskflow.io',  role: 'member', color: '#185FA5', initials: 'RC' },
  { id: 'u5', name: 'Morgan Kim',    email: 'morgan@taskflow.io', role: 'member', color: '#3B6D11', initials: 'MK' },
]

const SAMPLE_PROJECTS = [
  { id: 'p1', name: 'Marketing Sprint', color: '#D85A30', description: 'Q3 marketing campaign tasks', sections: ['To Do', 'In Progress', 'Review', 'Done'] },
  { id: 'p2', name: 'Product Roadmap',  color: '#0F6E56', description: 'Feature planning and execution', sections: ['Backlog', 'In Progress', 'Review', 'Done'] },
  { id: 'p3', name: 'Engineering Q3',   color: '#534AB7', description: 'Backend and frontend development', sections: ['To Do', 'In Progress', 'Testing', 'Done'] },
]

const SAMPLE_TASKS = [
  { id: 't1',  projectId: 'p1', name: 'Design Q3 campaign banner',    priority: 'high', section: 'To Do',       assigneeId: 'u2', due: '2025-07-10', done: false, description: 'Create hero banner assets for Q3 campaign.', comments: [] },
  { id: 't2',  projectId: 'p1', name: 'Write email newsletter copy',   priority: 'med',  section: 'In Progress', assigneeId: 'u3', due: '2025-07-08', done: false, description: 'Draft the monthly newsletter for July.',       comments: [] },
  { id: 't3',  projectId: 'p1', name: 'Set up A/B test for CTA',       priority: 'low',  section: 'In Progress', assigneeId: 'u4', due: '2025-07-15', done: false, description: 'Configure A/B testing for the CTA button.',    comments: [] },
  { id: 't4',  projectId: 'p1', name: 'Analyze June metrics',          priority: 'high', section: 'Done',        assigneeId: 'u1', due: '2025-06-30', done: true,  description: 'Review and summarize June analytics data.',   comments: [] },
  { id: 't5',  projectId: 'p1', name: 'Social media content calendar', priority: 'med',  section: 'Review',      assigneeId: 'u5', due: '2025-07-12', done: false, description: 'Plan content for next 4 weeks.',               comments: [] },
  { id: 't6',  projectId: 'p2', name: 'Define Q4 feature list',        priority: 'high', section: 'Backlog',     assigneeId: 'u1', due: '2025-07-12', done: false, description: 'Prioritize features for next quarter.',        comments: [] },
  { id: 't7',  projectId: 'p2', name: 'User research interviews',      priority: 'med',  section: 'Backlog',     assigneeId: 'u5', due: '2025-07-20', done: false, description: 'Conduct 5 user interviews.',                   comments: [] },
  { id: 't8',  projectId: 'p2', name: 'Update product spec doc',       priority: 'low',  section: 'In Progress', assigneeId: 'u2', due: '2025-07-18', done: false, description: 'Revise the product spec based on feedback.',   comments: [] },
  { id: 't9',  projectId: 'p2', name: 'Competitive analysis',          priority: 'med',  section: 'Review',      assigneeId: 'u3', due: '2025-07-05', done: false, description: 'Analyze top 5 competitors.',                   comments: [] },
  { id: 't10', projectId: 'p3', name: 'API endpoint refactoring',      priority: 'high', section: 'In Progress', assigneeId: 'u4', due: '2025-07-09', done: false, description: 'Refactor all REST endpoints.',                 comments: [] },
  { id: 't11', projectId: 'p3', name: 'Set up CI/CD pipeline',         priority: 'high', section: 'To Do',       assigneeId: 'u2', due: '2025-07-14', done: false, description: 'Configure GitHub Actions workflows.',          comments: [] },
  { id: 't12', projectId: 'p3', name: 'Write unit tests',              priority: 'med',  section: 'To Do',       assigneeId: 'u5', due: '2025-07-22', done: false, description: 'Achieve 80% test coverage.',                   comments: [] },
  { id: 't13', projectId: 'p3', name: 'Deploy staging environment',    priority: 'low',  section: 'Done',        assigneeId: 'u1', due: '2025-06-28', done: true,  description: 'Staging server is live.',                      comments: [] },
  { id: 't14', projectId: 'p3', name: 'Database schema migration',     priority: 'high', section: 'Testing',     assigneeId: 'u4', due: '2025-07-11', done: false, description: 'Run migration scripts on staging.',            comments: [] },
]

const useStore = create((set, get) => ({
  // ── Auth / session ──────────────────────────────────────────────────────────
  currentUserId: 'u1',
  get currentUser() { return get().members.find(m => m.id === get().currentUserId) },

  switchUser: (id) => set({ currentUserId: id }),

  // ── Data ────────────────────────────────────────────────────────────────────
  members:  SAMPLE_MEMBERS,
  projects: SAMPLE_PROJECTS,
  tasks:    SAMPLE_TASKS,
  notifications: [
    { id: 'n1', read: false, text: 'Alex assigned you "API endpoint refactoring"', sub: 'Engineering Q3 · 2m ago' },
    { id: 'n2', read: false, text: '"Q3 Report" is due tomorrow',                  sub: 'Marketing Sprint · 1h ago' },
    { id: 'n3', read: false, text: 'Jordan commented on "Competitive analysis"',   sub: 'Product Roadmap · 3h ago' },
    { id: 'n4', read: true,  text: 'Sprint "Alpha Launch" completed',              sub: 'Engineering · 1d ago' },
    { id: 'n5', read: true,  text: 'Morgan joined the workspace',                  sub: '2d ago' },
  ],

  // ── UI state ────────────────────────────────────────────────────────────────
  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),

  // ── Live-update feed ────────────────────────────────────────────────────────
  updates: [],
  pushUpdate: (msg) => set(s => ({ updates: [{ id: uuid(), msg, at: new Date() }, ...s.updates].slice(0, 10) })),

  // ── Tasks ───────────────────────────────────────────────────────────────────
  addTask: (task) => {
    const id = uuid()
    set(s => ({ tasks: [...s.tasks, { id, comments: [], done: false, ...task }] }))
    get().pushUpdate(`Task created: "${task.name}"`)
    return id
  },
  updateTask: (id, patch) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }))
    get().pushUpdate(`Task updated`)
  },
  toggleTask: (id) => {
    const t = get().tasks.find(t => t.id === id)
    if (!t) return
    const done = !t.done
    set(s => ({ tasks: s.tasks.map(x => x.id === id ? { ...x, done, section: done ? 'Done' : (x.section === 'Done' ? 'To Do' : x.section) } : x) }))
    get().pushUpdate(done ? `✓ "${t.name}" completed` : `"${t.name}" reopened`)
  },
  deleteTask: (id) => {
    const t = get().tasks.find(t => t.id === id)
    set(s => ({ tasks: s.tasks.filter(x => x.id !== id) }))
    if (t) get().pushUpdate(`Task deleted: "${t.name}"`)
  },
  addComment: (taskId, text) => {
    const user = get().members.find(m => m.id === get().currentUserId)
    const comment = { id: uuid(), authorId: get().currentUserId, authorName: user?.name, text, at: new Date().toISOString() }
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t) }))
    get().pushUpdate(`Comment added`)
  },
  moveTask: (taskId, toSection) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, section: toSection } : t) }))
  },

  // ── Projects ────────────────────────────────────────────────────────────────
  addProject: (project) => {
    const id = uuid()
    set(s => ({ projects: [...s.projects, { id, sections: ['To Do', 'In Progress', 'Review', 'Done'], ...project }] }))
    get().pushUpdate(`Project created: "${project.name}"`)
    return id
  },
  updateProject: (id, patch) => {
    set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p) }))
    get().pushUpdate(`Project updated`)
  },
  deleteProject: (id) => {
    const p = get().projects.find(p => p.id === id)
    set(s => ({ projects: s.projects.filter(x => x.id !== id), tasks: s.tasks.filter(t => t.projectId !== id) }))
    if (p) get().pushUpdate(`Project deleted: "${p.name}"`)
  },
  addSection: (projectId, sectionName) => {
    set(s => ({ projects: s.projects.map(p => p.id === projectId ? { ...p, sections: [...p.sections, sectionName] } : p) }))
  },

  // ── Members ─────────────────────────────────────────────────────────────────
  addMember: (member) => {
    const id = uuid()
    set(s => ({ members: [...s.members, { id, ...member }] }))
    get().pushUpdate(`${member.name} invited to workspace`)
  },
  updateMember: (id, patch) => {
    set(s => ({ members: s.members.map(m => m.id === id ? { ...m, ...patch } : m) }))
    get().pushUpdate(`Member updated`)
  },
  removeMember: (id) => {
    const m = get().members.find(m => m.id === id)
    set(s => ({ members: s.members.filter(x => x.id !== id), tasks: s.tasks.map(t => t.assigneeId === id ? { ...t, assigneeId: null } : t) }))
    if (m) get().pushUpdate(`${m.name} removed from workspace`)
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  markNotifRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
}))

export default useStore
