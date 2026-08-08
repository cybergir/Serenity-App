import { Link } from 'react-router-dom'
import { useTasks, useLimboCount, useCreateTask, useCompleteTask } from '../hooks/useTasks'
import { useShoppingList, useMarkPurchased, useCreateShoppingItem } from '../hooks/useShopping'
import { useUpcomingOffDays, useCreateOffDay } from '../hooks/useOffDays'
import { useTodayPulse, useAnswerPulse, useSkipPulse } from '../hooks/useDailyPulse'
import { useState } from 'react'
import TaskForm from '../components/tasks/TaskForm'

export default function Home() {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showShoppingForm, setShowShoppingForm] = useState(false)
  const [showOffDayForm, setShowOffDayForm] = useState(false)

  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium')
  const [shoppingItem, setShoppingItem] = useState('')
  const [shoppingQty, setShoppingQty] = useState(1)
  const [employeeName, setEmployeeName] = useState('')
  const [offDate, setOffDate] = useState('')

  const [pulseAnswer, setPulseAnswer] = useState('')
  const [pulseAnswered, setPulseAnswered] = useState(false)

  const { data: tasksData, isLoading: tasksLoading } = useTasks('active')
  const { data: limboData } = useLimboCount()
  const { data: shoppingData } = useShoppingList(false)
  const { data: upcomingOffDays } = useUpcomingOffDays(7)
  const { data: pulseData } = useTodayPulse()

  const createTask = useCreateTask()
  const completeTask = useCompleteTask()
  const createShoppingItem = useCreateShoppingItem()
  const markPurchased = useMarkPurchased()
  const createOffDay = useCreateOffDay()
  const answerPulse = useAnswerPulse()
  const skipPulse = useSkipPulse()

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!taskTitle.trim()) return
    createTask.mutate({ title: taskTitle, priority: taskPriority })
    setTaskTitle('')
    setShowTaskForm(false)
  }

  const handleCreateShoppingItem = (e) => {
    e.preventDefault()
    if (!shoppingItem.trim()) return
    createShoppingItem.mutate({ item_name: shoppingItem, quantity: shoppingQty })
    setShoppingItem('')
    setShoppingQty(1)
    setShowShoppingForm(false)
  }

  const handleCreateOffDay = (e) => {
    e.preventDefault()
    if (!employeeName.trim() || !offDate) return
    createOffDay.mutate({ employee_name: employeeName, off_date: offDate })
    setEmployeeName('')
    setOffDate('')
    setShowOffDayForm(false)
  }

  const activeTasks = tasksData?.tasks || []
  const pendingShopping = shoppingData?.items || []
  const upcomingOff = upcomingOffDays?.entries || []

  const priorityBadgeClass = (p) => {
    const map = {
      urgent: 'badge-urgent',
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low'
    }
    return `badge ${map[p] || 'badge-medium'}`
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card-padded">
        <p className="text-secondary text-sm">Today</p>
        {activeTasks.length === 0 ? (
          <p className="text-primary text-lg mt-1">Nothing pressing. That's okay.</p>
        ) : (
          <Link
            to="/tasks"
            className="text-primary text-lg mt-1 block hover:text-brand transition-colors cursor-pointer"
          >
            You have {activeTasks.length} task{activeTasks.length > 1 ? 's' : ''} waiting. →
          </Link>
        )}
      </div>

      {/* Daily Pulse */}
      {pulseData && !pulseAnswered && !pulseData.answer && pulseData.id && (
        <div className="notification-bar">
          <p className="text-sm mb-2 opacity-80">Daily check-in</p>
          <p className="text-primary mb-4 font-medium">{pulseData.prompt}</p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={pulseAnswer}
              onChange={(e) => setPulseAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="input flex-1 min-w-[200px] bg-white dark:bg-slate-700"
            />
            <button
              onClick={() => {
                if (pulseAnswer.trim()) {
                  answerPulse.mutate({ pulseId: pulseData.id, answer: pulseAnswer })
                  setPulseAnswered(true)
                }
              }}
              className="btn btn-primary"
            >
              Answer
            </button>
            <button
              onClick={() => {
                skipPulse.mutate(pulseData.id)
                setPulseAnswered(true)
              }}
              className="btn btn-ghost"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn btn-secondary">
          + Add Task
        </button>
        <button onClick={() => setShowShoppingForm(!showShoppingForm)} className="btn btn-secondary" style={{'--color-brand': '#10b981', '--color-brand-soft': '#ecfdf5', '--color-brand-hover': '#059669'}}>
          + Shopping Item
        </button>
        <button onClick={() => setShowOffDayForm(!showOffDayForm)} className="btn btn-secondary" style={{'--color-brand': '#f59e0b', '--color-brand-soft': '#fffbeb', '--color-brand-hover': '#d97706'}}>
          + Off Day
        </button>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <TaskForm
          onSubmit={(taskData) => {
            createTask.mutate(taskData)
            setShowTaskForm(false)
          }}
          onCancel={() => setShowTaskForm(false)}
        />
      )}
      {/* Shopping Form */}
      {showShoppingForm && (
        <form onSubmit={handleCreateShoppingItem} className="card-padded space-y-3">
          <input
            type="text"
            value={shoppingItem}
            onChange={(e) => setShoppingItem(e.target.value)}
            placeholder="What do you need?"
            className="input w-full"
            autoFocus
          />
          <div className="flex gap-3 items-center">
            <input type="number" value={shoppingQty} onChange={(e) => setShoppingQty(parseInt(e.target.value) || 1)} min="1" className="input w-20" />
            <button type="submit" className="btn btn-success">Add</button>
          </div>
        </form>
      )}

      {/* Off Day Form */}
      {showOffDayForm && (
        <form onSubmit={handleCreateOffDay} className="card-padded space-y-3">
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Employee name"
            className="input w-full"
            autoFocus
          />
          <div className="flex gap-3 items-center">
            <input type="date" value={offDate} onChange={(e) => setOffDate(e.target.value)} className="input" />
            <button type="submit" className="btn btn-warning">Save</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <div className="card-padded">
          <h2 className="heading-section">Active Tasks</h2>
          {tasksLoading ? (
            <p className="empty-state-text">Loading...</p>
          ) : activeTasks.length === 0 ? (
            <p className="empty-state-text">Nothing here yet.</p>
          ) : (
            <ul className="space-y-1">
              {activeTasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link
                    to="/tasks"
                    className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-[var(--color-brand-soft)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted text-xs">○</span>
                      <span className="text-primary">{task.title}</span>
                    </div>
                    <span className={priorityBadgeClass(task.priority)}>{task.priority}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {activeTasks.length > 5 && (
            <p className="text-muted text-xs mt-3">+{activeTasks.length - 5} more</p>
          )}
        </div>

        {/* Shopping List */}
        <div className="card-padded">
          <h2 className="heading-section">Shopping</h2>
          {pendingShopping.length === 0 ? (
            <p className="empty-state-text">List is empty.</p>
          ) : (
            <ul className="space-y-2">
              {pendingShopping.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => markPurchased.mutate(item.id)} className="btn-icon" title="Mark purchased" />
                    <span className="text-primary">{item.item_name}</span>
                  </div>
                  <span className="text-muted text-xs">x{item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Off Days */}
        <div className="card-padded">
          <h2 className="heading-section">Upcoming Off Days</h2>
          {upcomingOff.length === 0 ? (
            <p className="empty-state-text">No upcoming off days.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingOff.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="text-primary">{entry.employee_name}</span>
                  <span className="text-muted text-xs">{entry.off_date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Limbo */}
        {limboData?.count > 0 && (
          <div className="card-limbo">
            <h2 className="text-sm font-medium mb-2" style={{color: 'var(--color-warning)'}}>Waiting for Your Word</h2>
            <Link
              to="/tasks?destination=limbo"
              className="text-sm hover:underline"
              style={{color: 'var(--color-warning)'}}
            >
              {limboData.count} task{limboData.count > 1 ? 's' : ''} in limbo →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}