import { API_URL } from '../services/api'
import Dropdown from '../components/ui/Dropdown'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'
import RoutineDetail from '../components/tasks/RoutineDetail'
import { useState, useEffect } from 'react'
import {
  useTasks,
  useLimboCount,
  useRoutineCount,
  useRoutineList,
  useCreateTask,
  useCompleteTask,
  useResolveFromLimbo,
  useUpdateTask
} from '../hooks/useTasks'
import { Link, useSearchParams } from 'react-router-dom'


export default function Tasks() {
  const [destination, setDestination] = useState('active')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  // Limbo resolution
  const [resolvingTask, setResolvingTask] = useState(null)
  const [resolveAction, setResolveAction] = useState('done')
  const [rescheduleDate, setRescheduleDate] = useState('')

  const [selectedRoutine, setSelectedRoutine] = useState(null)

  // Task detail modal
  const [selectedTask, setSelectedTask] = useState(null)

  const { data, isLoading } = useTasks(
    destination === 'routine' ? 'active' : destination,
    category,
    search
  )
  const { data: limboData } = useLimboCount()
  const { data: routineData } = useRoutineCount()
  const { data: routineListData } = useRoutineList()
  const createTask = useCreateTask()
  const completeTask = useCompleteTask()
  const resolveFromLimbo = useResolveFromLimbo()
  const updateTask = useUpdateTask()

  const tasks = data?.tasks || []
  const total = data?.total || 0


  const emptyMessages = {
    active: [
      "Your day is clear. Leave space for what matters.",
      "Nothing pressing right now. That's a good thing.",
      "An empty list can be a peaceful one.",
      "No tasks waiting. Enjoy the quiet.",
      "Clear slate. Fresh start.",
    ],
    limbo: [
      "Nothing in limbo. Everything is accounted for.",
      "No loose ends waiting for your word.",
      "All caught up. Nothing slipping through.",
    ],
    archive: [
      "Nothing archived yet. Your first completion will appear here.",
      "Finished tasks find their rest here.",
      "The archive awaits its first story.",
    ],
    routine: [
      "No routines set yet. Automate the things that come back.",
      "Routines help you build habits without remembering to create them again.",
      "Set a task to repeat and let it return on its own.",
    ]
  }

  function getRandomMessage(messages) {
    const key = `tasks-empty-${messages[0].slice(0, 10)}`
    const previous = localStorage.getItem(key)
    if (messages.length === 1) return messages[0]
    let message
    do {
      message = messages[Math.floor(Math.random() * messages.length)]
    } while (message === previous)
    localStorage.setItem(key, message)
    return message
  }

  const handleResolve = (taskId) => {
    resolveFromLimbo.mutate({
      taskId,
      resolution: {
        action: resolveAction,
        new_due_date: resolveAction === 'reschedule' ? rescheduleDate : null
      }
    })
    setResolvingTask(null)
    setResolveAction('done')
    setRescheduleDate('')
  }

  const destinationTabs = [
    { key: 'active', label: 'Active', icon: '📋' },
    { key: 'limbo', label: `Limbo${limboData?.count ? ` (${limboData.count})` : ''}`, icon: '⏳' },
    { key: 'archive', label: 'Archive', icon: '📦' },
    { key: 'routine', label: 'Routine', icon: '⟳' },
  ]

  const priorityBadgeClass = (p) => {
    const map = {
      urgent: 'badge-urgent',
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low'
    }
    return `badge ${map[p] || 'badge-medium'}`
  }

  const statusLabel = (s) => {
    const labels = {
      not_started: 'Not started',
      in_progress: 'In progress',
      done: 'Done',
      stuck: 'Stuck'
    }
    return labels[s] || s
  }

  const [searchParams] = useSearchParams()
    useEffect(() => {
      const dest = searchParams.get('destination')
      if (dest && ['active', 'limbo', 'archive', 'routine'].includes(dest)) {
        setDestination(dest)
      }
    }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="heading-page">Tasks</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn btn-primary"
        >
          + New Task
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <TaskForm
          onSubmit={(taskData) => {
            createTask.mutate(taskData)
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Tabs */}
      <div className="tab-bar">
        {destinationTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setDestination(tab.key)}
            className={destination === tab.key ? 'tab-active' : 'tab'}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      {destination !== 'routine' && (
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="input-search"
          />
          <Dropdown
            value={category}
            onChange={setCategory}
            placeholder="All categories"
            options={[
              { value: '', label: 'All categories' },
              { value: 'business', label: 'Business' },
              { value: 'personal', label: 'Personal' },
              { value: 'family', label: 'Family' },
            ]}
          />
        </div>
      )}

      {/* Routine Tab — Dedicated View */}
      {destination === 'routine' && (
        <div className="space-y-3">
          {!routineListData?.routines || routineListData.routines.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">⟳</p>
              <p className="empty-state-text">{getRandomMessage(emptyMessages.routine)}</p>
            </div>
          ) : (
            routineListData.routines.map((routine) => (
              <div
                key={routine.id}
                onClick={() => setSelectedRoutine(routine)}
                className="card-padded cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-primary font-medium">{routine.title}</h3>
                      {routine.category && (
                        <span className="badge badge-medium">{routine.category}</span>
                      )}
                    </div>
                    {routine.description && (
                      <p className="text-sm text-secondary mb-2">{routine.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="text-muted">⟳ {routine.frequency_label}</span>
                      {routine.routine_days && (
                        <span className="text-muted">
                          on {routine.routine_days.split(',').map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                        </span>
                      )}
                      {routine.next_occurrence && (
                        <span className="text-brand">
                          Next: {new Date(routine.next_occurrence).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <p className="text-xs text-muted text-center">
            {routineData?.count || 0} routine{routineData?.count !== 1 ? 's' : ''} set up
          </p>
        </div>
      )}

      {/* Task List — Active, Limbo, Archive */}
      {destination !== 'routine' && (
        <>
          {isLoading ? (
            <p className="empty-state-text">Loading...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">
                {destination === 'active' ? '📋' : destination === 'limbo' ? '⏳' : '📦'}
              </p>
              <p className="empty-state-text">
                {emptyMessages[destination]
                  ? getRandomMessage(emptyMessages[destination])
                  : 'No tasks found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks
                .filter((t) => {
                  if (!priority) return true
                  return t.priority === priority
                })
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={task.destination === 'limbo' ? 'card-limbo cursor-pointer' : 'card-clickable'}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-primary font-medium truncate">{task.title}</h3>
                          <span className={priorityBadgeClass(task.priority)}>{task.priority}</span>
                          {task.category && (
                            <span className="badge badge-medium">{task.category}</span>
                          )}
                          {task.routine_type && task.routine_type !== 'never' && (
                            <span className="badge badge-success text-xs">
                              ⟳ {task.routine_type.charAt(0).toUpperCase() + task.routine_type.slice(1)}
                            </span>
                          )}
                          {task.destination !== 'archive' && (
                            <span className="badge badge-medium">{statusLabel(task.status)}</span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-secondary text-sm mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-muted">
                          {task.due_date && (
                            <span>Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                          {task.completed_at && (
                            <span className="text-success">Done: {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          )}
                          {task.subtasks?.length > 0 && (
                            <span>{task.subtasks.filter((s) => s.is_completed).length}/{task.subtasks.length} subtasks</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.destination === 'active' && task.status === 'not_started' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateTask.mutate({ taskId: task.id, updates: { status: 'in_progress' } })
                            }}
                            className="btn btn-secondary text-xs py-1 px-3"
                            title="Start working"
                          >
                            Start
                          </button>
                        )}

                        {task.destination === 'active' && task.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              completeTask.mutate(task.id)
                            }}
                            className="btn-icon"
                            style={{borderColor: 'var(--color-brand)'}}
                            title="Mark complete"
                          >
                            <span className="text-xs text-brand hover:text-success">✓</span>
                          </button>
                        )}

                        {task.destination === 'limbo' && (
                          <>
                            {resolvingTask === task.id ? (
                              <div className="flex items-center gap-2 card p-2">
                                <Dropdown
                                  value={resolveAction}
                                  onChange={setResolveAction}
                                  options={[
                                    { value: 'done', label: 'Done (late)' },
                                    { value: 'reschedule', label: 'Reschedule' },
                                    { value: 'dismiss', label: 'Dismiss' },
                                  ]}
                                  className="text-xs"
                                />
                                {resolveAction === 'reschedule' && (
                                  <input
                                    type="datetime-local"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="input text-xs py-1 w-36"
                                  />
                                )}
                                <button
                                  onClick={() => handleResolve(task.id)}
                                  className="btn btn-warning text-xs py-1 px-2"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setResolvingTask(null)}
                                  className="btn btn-ghost text-xs py-1 px-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setResolvingTask(task.id)
                                }}
                                className="btn btn-warning text-xs py-1 px-3"
                              >
                                Resolve
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Subtasks */}
                    {task.subtasks?.length > 0 && (
                      <ul className="mt-3 space-y-1 ml-2 border-l-2 divider pl-3">
                        {task.subtasks.map((sub) => (
                          <li
                            key={sub.id}
                            onClick={task.destination !== 'archive' ? async (e) => {
                              e.stopPropagation()
                              try {
                                const token = localStorage.getItem('access_token')
                                await fetch(`${API_URL}/tasks/${task.id}/subtasks/${sub.id}/toggle`, {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                })
                                window.location.reload()
                              } catch (err) {
                                console.error('Failed to toggle subtask', err)
                              }
                            } : undefined}
                            className={`text-sm flex items-center gap-2 rounded px-1 py-0.5 transition-colors ${
                              task.destination !== 'archive'
                                ? 'cursor-pointer hover:bg-[var(--color-brand-soft)]'
                                : 'cursor-default'
                            }`}
                          >
                            <span className={`text-xs ${sub.is_completed ? 'text-success' : 'text-muted'}`}>
                              {sub.is_completed ? '✓' : '○'}
                            </span>
                            <span className={sub.is_completed ? 'text-muted line-through' : 'text-primary'}>
                              {sub.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          )}

          {total > 0 && (
            <p className="text-xs text-muted text-center">
              {total} task{total !== 1 ? 's' : ''} in {destination}
            </p>
          )}
        </>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {selectedRoutine && (
        <RoutineDetail
          routine={selectedRoutine}
          onClose={() => setSelectedRoutine(null)}
          onUpdate={() => {
            // Refetch routine list
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}