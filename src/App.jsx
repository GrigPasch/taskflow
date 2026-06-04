import { Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import Layout from './components/Layout'
import LoginPage    from './pages/LoginPage'
import HomePage     from './pages/HomePage'
import MyTasksPage  from './pages/MyTasksPage'
import InboxPage    from './pages/InboxPage'
import ProjectPage  from './pages/ProjectPage'
import MembersPage  from './pages/MembersPage'
import AdminPage    from './pages/AdminPage'
import SettingsPage from './pages/SettingsPage'

function RequireAuth({ children }) {
  const currentUserId = useStore(s => s.currentUserId)
  if (!currentUserId) return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const { currentUserId, members } = useStore()
  const user = members.find(m => m.id === currentUserId)
  if (user?.role !== 'admin') return <Navigate to="/home" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home"         element={<HomePage />} />
        <Route path="my-tasks"     element={<MyTasksPage />} />
        <Route path="inbox"        element={<InboxPage />} />
        <Route path="projects/:id" element={<ProjectPage />} />
        <Route path="members"      element={<MembersPage />} />
        <Route path="settings"     element={<SettingsPage />} />
        <Route path="admin"        element={<RequireAdmin><AdminPage /></RequireAdmin>} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
