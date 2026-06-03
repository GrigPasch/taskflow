// MyTasksPage.jsx
import { useState } from 'react'
import useStore from '../store/useStore'
import TaskRow from '../components/TaskRow'
import TaskDetailModal from '../components/TaskDetailModal'
import Modal from '../components/Modal'
import NewTaskModal from '../components/NewTaskModal'
import styles from './SharedPage.module.css'

export default function MyTasksPage() {
  const { tasks, currentUserId } = useStore()
  const [selected, setSelected] = useState(null)
  const [newTask, setNewTask] = useState(false)

  const myTasks = tasks.filter(t => t.assigneeId === currentUserId)
  const sections = ['To Do', 'In Progress', 'Review', 'Done']

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Tasks</h1>
        <button className={styles.addBtn} onClick={() => setNewTask(true)}>+ Add task</button>
      </div>
      <div className={styles.content}>
        {sections.map(sec => {
          const sts = myTasks.filter(t => t.section === sec)
          return (
            <div key={sec} className={styles.section}>
              <div className={styles.secHead}>
                <span className={styles.secName}>{sec}</span>
                <span className={styles.secCount}>{sts.length}</span>
                <div className={styles.secLine} />
              </div>
              {sts.map(t => <TaskRow key={t.id} task={t} onClick={setSelected} />)}
              {sts.length === 0 && <p className={styles.empty}>No tasks in {sec}</p>}
            </div>
          )
        })}
      </div>

      {selected && (
        <TaskDetailModal
          task={tasks.find(t => t.id === selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
      {newTask && (
        <Modal title="New task" onClose={() => setNewTask(false)}>
          <NewTaskModal onClose={() => setNewTask(false)} />
        </Modal>
      )}
    </div>
  )
}
