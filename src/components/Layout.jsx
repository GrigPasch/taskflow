import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  IconHome, IconCheckbox, IconInbox, IconUsers, IconSettings,
  IconShield, IconPlus, IconBell, IconSearch, IconChevronDown,
  IconChevronRight, IconCircleFilled, IconX
} from '@tabler/icons-react'
import useStore from '../store/useStore'
import NotifPanel from './NotifPanel'
import Modal from './Modal'
import NewProjectModal from './NewProjectModal'
import styles from './Layout.module.css'

export default function Layout() {
  const { projects, currentUserId, members, notifications, switchUser, updates } = useStore()
  const currentUser = members.find(m => m.id === currentUserId)
  const unread = notifications.filter(n => !n.read).length
  const navigate = useNavigate()

  const [notifOpen, setNotifOpen] = useState(false)
  const [projOpen, setProjOpen] = useState(true)
  const [newProjOpen, setNewProjOpen] = useState(false)

  const latestUpdate = updates[0]

  return (
    <div className={styles.shell}>
      {/* TOP NAV */}
      <header className={styles.topnav}>
        <div className={styles.logo}>
          <div className={styles.logoDot}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <circle cx="12" cy="5"  r="3.5"/>
              <circle cx="19" cy="17" r="3.5"/>
              <circle cx="5"  cy="17" r="3.5"/>
            </svg>
          </div>
          Taskflow
        </div>

        <div className={styles.searchBox}>
          <IconSearch size={15} className={styles.searchIcon} />
          <input placeholder="Search tasks, projects…" />
        </div>

        {latestUpdate && (
          <div className={styles.liveChip}>
            <span className={styles.liveDot} />
            {latestUpdate.msg}
          </div>
        )}

        <div className={styles.navActions}>
          <button className={styles.iconBtn} onClick={() => setNotifOpen(o => !o)}>
            <IconBell size={18} />
            {unread > 0 && <span className={styles.notifDot}>{unread}</span>}
          </button>

          <div className={styles.userMenu}>
            <div className="avatar avatar-md" style={{ background: currentUser?.color }}>
              {currentUser?.initials}
            </div>
            <select
              className={styles.roleSelect}
              value={currentUserId}
              onChange={e => switchUser(e.target.value)}
              title="Switch user"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <nav className={styles.navSection}>
            <SideLink to="/home"     Icon={IconHome}     label="Home" />
            <SideLink to="/my-tasks" Icon={IconCheckbox} label="My Tasks" badge={
              useStore.getState().tasks.filter(t => t.assigneeId === currentUserId && !t.done).length || null
            } />
            <SideLink to="/inbox"    Icon={IconInbox}    label="Inbox" badge={unread || null} />
          </nav>

          <div className={styles.divider} />

          <div className={styles.navSection}>
            <button className={styles.sectionToggle} onClick={() => setProjOpen(o => !o)}>
              {projOpen ? <IconChevronDown size={13} /> : <IconChevronRight size={13} />}
              <span>Projects</span>
            </button>

            {projOpen && (
              <>
                {projects.map(p => (
                  <NavLink
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className={({ isActive }) =>
                      `${styles.sideItem} ${isActive ? styles.sideItemActive : ''}`
                    }
                  >
                    <span className={styles.projDot} style={{ background: p.color }} />
                    <span className={styles.sideLabel}>{p.name}</span>
                  </NavLink>
                ))}
                <button className={styles.addProjectBtn} onClick={() => setNewProjOpen(true)}>
                  <IconPlus size={14} /> New project
                </button>
              </>
            )}
          </div>

          <div className={styles.divider} />

          <nav className={styles.navSection}>
            <SideLink to="/members"  Icon={IconUsers}    label="Members" />
            <SideLink to="/settings" Icon={IconSettings} label="Settings" />
            {currentUser?.role === 'admin' && (
              <SideLink to="/admin" Icon={IconShield} label="Admin Panel" />
            )}
          </nav>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
      {newProjOpen && (
        <Modal title="New project" onClose={() => setNewProjOpen(false)}>
          <NewProjectModal onClose={() => setNewProjOpen(false)} />
        </Modal>
      )}
    </div>
  )
}

function SideLink({ to, Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.sideItem} ${isActive ? styles.sideItemActive : ''}`
      }
    >
      <Icon size={16} />
      <span className={styles.sideLabel}>{label}</span>
      {badge ? <span className={styles.badge}>{badge}</span> : null}
    </NavLink>
  )
}
