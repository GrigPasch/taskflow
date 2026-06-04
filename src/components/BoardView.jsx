import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconPlus, IconGripVertical } from '@tabler/icons-react'
import useStore from '../store/useStore'
import styles from './BoardView.module.css'

const COL_COLORS = {
  'To Do': '#888780', 'In Progress': '#185FA5', 'Review': '#534AB7',
  'Done': '#0F6E56', 'Backlog': '#854F0B', 'Testing': '#A32D2D',
}

export default function BoardView({ project, tasks, onSelect, onNewTask }) {
  const { reorderTasks, moveTask, members } = useStore()
  const sections = project.sections || ['To Do', 'In Progress', 'Review', 'Done']

  const [activeId, setActiveId] = useState(null)
  const activeTask = tasks.find(t => t.id === activeId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const fromTask = tasks.find(t => t.id === active.id)
    const toTask   = tasks.find(t => t.id === over.id)

    if (!fromTask) return

    // dropped onto a column header
    if (over.id.startsWith('col-')) {
      const toSection = over.id.replace('col-', '')
      if (fromTask.section !== toSection) moveTask(active.id, toSection)
      return
    }

    if (!toTask) return

    if (fromTask.section === toTask.section) {
      // reorder within column
      const colTasks = tasks.filter(t => t.section === fromTask.section && t.projectId === project.id)
      const oldIdx = colTasks.findIndex(t => t.id === active.id)
      const newIdx = colTasks.findIndex(t => t.id === over.id)
      const newOrder = arrayMove(colTasks, oldIdx, newIdx).map(t => t.id)
      reorderTasks(project.id, fromTask.section, newOrder)
    } else {
      // move to another column
      moveTask(active.id, toTask.section)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className={styles.board}>
        {sections.map(sec => {
          const colTasks = tasks
            .filter(t => t.section === sec && t.projectId === project.id)
          const color = COL_COLORS[sec] || '#888780'

          return (
            <div key={sec} className={styles.col} id={`col-${sec}`}>
              <div className={styles.colHeader}>
                <div className={styles.colDot} style={{ background: color }} />
                <span className={styles.colTitle}>{sec}</span>
                <span className={styles.colCount}>{colTasks.length}</span>
                <button className={styles.colAddBtn} onClick={() => onNewTask({ section: sec })}>
                  <IconPlus size={14} />
                </button>
              </div>

              <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className={styles.cards}>
                  {colTasks.map(t => (
                    <SortableCard
                      key={t.id}
                      task={t}
                      members={members}
                      isDragging={activeId === t.id}
                      onClick={() => onSelect(t)}
                    />
                  ))}
                </div>
              </SortableContext>

              <button className={styles.colAddBtnBottom} onClick={() => onNewTask({ section: sec })}>
                <IconPlus size={13} /> Add card
              </button>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <CardInner task={activeTask} members={members} overlay />
        )}
      </DragOverlay>
    </DndContext>
  )
}

function SortableCard({ task, members, isDragging, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <CardInner task={task} members={members} onClick={onClick} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  )
}

function CardInner({ task, members, onClick, dragListeners, dragAttributes, overlay }) {
  const assignee = members.find(m => m.id === task.assigneeId)
  const isOverdue = !task.done && task.due && new Date(task.due) < new Date()
  const subtasksDone = (task.subtasks || []).filter(s => s.done).length
  const subtasksTotal = (task.subtasks || []).length

  return (
    <div
      className={`${styles.card} ${overlay ? styles.cardOverlay : ''} ${task.done ? styles.cardDone : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardDragHandle} {...dragListeners} {...dragAttributes} onClick={e => e.stopPropagation()}>
        <IconGripVertical size={13} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{task.name}</div>
        <div className={styles.cardMeta}>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {task.due && (
            <span className={styles.cardDue} style={{ color: isOverdue ? 'var(--red)' : undefined }}>
              {isOverdue ? '⚠ ' : ''}{task.due}
            </span>
          )}
          {subtasksTotal > 0 && (
            <span className={styles.subtaskPip} title="Subtasks">
              {subtasksDone}/{subtasksTotal}
            </span>
          )}
          {assignee && (
            <div className="avatar avatar-sm" style={{ background: assignee.color, marginLeft: 'auto' }} title={assignee.name}>
              {assignee.initials}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
