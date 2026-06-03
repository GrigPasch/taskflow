import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MyTasksPage from './pages/MyTasksPage'
import InboxPage from './pages/InboxPage'
import ProjectPage from './pages/ProjectPage'
import MembersPage from './pages/MembersPage'
import AdminPage from './pages/AdminPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home"           element={<HomePage />} />
        <Route path="my-tasks"       element={<MyTasksPage />} />
        <Route path="inbox"          element={<InboxPage />} />
        <Route path="projects/:id"   element={<ProjectPage />} />
        <Route path="members"        element={<MembersPage />} />
        <Route path="admin"          element={<AdminPage />} />
        <Route path="settings"       element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
