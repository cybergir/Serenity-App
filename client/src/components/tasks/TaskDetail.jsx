import { useState } from 'react'
import { useCompleteTask, useResolveFromLimbo } from '../../hooks/useTasks'

export default function TaskDetail({ task, onClose }) {
  const [resolving, setResolving] = useState(false)
  const [resolveAction, setResolveAction] = useState('done')
  const [rescheduleDate, setRescheduleDate] = useState('')

  const completeTask = useCompleteTask()
  const resolveFromLimbo = useResolveFromLimbo()

  const handleResolve = () => {
    resolveFromLimbo.mutate({
      taskId: task.id,
      resolution: {
        action: resolveAction,
        new_due_date: resolveAction === 'reschedule' ? rescheduleDate : null
      }
    })
    setResolving(false)
    onClose()
  }

  const handleComplete = () => {
    completeTask.mutate(task.id)
    onClose()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  const destinationLabel = (d) => {
    const labels = {
      active: 'Active',
      limbo: 'In Limbo',
      archive: 'Archived'
    }
    return labels[d] || d
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--color-card)] rounded-2xl shadow-xl border border-[var(--color-border)] w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg text-primary font-medium break-words">
                {task.title}
              </h2>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={priorityBadgeClass(task.priority)}>
                  {task.priority}
                </span>
                {task.destination !== 'archive' && (
                  <span className="badge badge-medium">
                    {statusLabel(task.status)}
                  </span>
                )}
                <span className={
                  task.destination === 'limbo'
                    ? 'badge badge-warning'
                    : task.destination === 'archive'
                    ? 'badge badge-success'
                    : 'badge badge-brand'
                }>
                  {destinationLabel(task.destination)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-primary text-xl p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Description */}
          {task.description ? (
            <div>
              <p className="text-xs text-muted mb-1">Description</p>
              <p className="text-sm text-secondary whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted italic">No description</p>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {task.due_date && (
              <div>
                <p className="text-xs text-muted mb-1">Due</p>
                <p className="text-sm text-secondary">
                  {formatDate(task.due_date)}
                </p>
              </div>
            )}
            {task.completed_at && (
              <div>
                <p className="text-xs text-muted mb-1">Completed</p>
                <p className="text-sm text-success">
                  {formatDate(task.completed_at)}
                </p>
              </div>
            )}
            {task.estimated_minutes && (
              <div>
                <p className="text-xs text-muted mb-1">Estimated time</p>
                <p className="text-sm text-secondary">
                  {task.estimated_minutes} minutes
                </p>
              </div>
            )}
          </div>

          {/* Created / Updated */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted mb-1">Created</p>
              <p className="text-sm text-secondary">
                {formatDate(task.created_at)}
              </p>
            </div>
            {task.updated_at !== task.created_at && (
              <div>
                <p className="text-xs text-muted mb-1">Updated</p>
                <p className="text-sm text-secondary">
                  {formatDate(task.updated_at)}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && (
            <div>
              <p className="text-xs text-muted mb-1">Tags</p>
              <div className="flex gap-1 flex-wrap">
                {task.tags.split(',').map((tag, i) => (
                  <span
                    key={i}
                    className="badge badge-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">
                Subtasks ({task.subtasks.filter(s => s.is_completed).length}/{task.subtasks.length})
              </p>
              <div className="space-y-2">
                {task.subtasks.map((sub) => {
                  const isArchived = task.destination === 'archive'
                  
                  return (
                    <div
                      key={sub.id}
                      onClick={!isArchived ? async (e) => {
                        e.stopPropagation()
                        try {
                          const token = localStorage.getItem('access_token')
                          await fetch(`/api/tasks/${task.id}/subtasks/${sub.id}/toggle`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            }
                          })
                          onClose()
                        } catch (err) {
                          console.error('Failed to toggle subtask', err)
                        }
                      } : undefined}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        !isArchived ? 'cursor-pointer hover:bg-[var(--color-brand-soft)]' : 'cursor-default'
                      }`}
                      style={{
                        background: sub.is_completed ? 'var(--color-success-soft)' : 'var(--color-surface)',
                        borderColor: sub.is_completed ? 'var(--color-success)' : 'var(--color-border)'
                      }}
                    >
                      <span className={`text-sm ${sub.is_completed ? 'text-success' : 'text-muted'}`}>
                        {sub.is_completed ? '✓' : '○'}
                      </span>
                      <span className={`text-sm ${sub.is_completed ? 'text-muted line-through' : 'text-primary'}`}>
                        {sub.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Limbo Info */}
          {task.destination === 'limbo' && task.resolved_from_limbo_at && (
            <div className="p-3 rounded-xl" style={{ background: 'var(--color-warning-soft)' }}>
              <p className="text-xs text-warning">
                Resolved from Limbo on {formatDate(task.resolved_from_limbo_at)}
              </p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] rounded-b-2xl">
          {task.destination === 'active' && (
            <button
              onClick={handleComplete}
              className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition-colors"
            >
              Mark Complete
            </button>
          )}

          {task.destination === 'limbo' && (
            <div className="space-y-3">
              {!resolving ? (
                <button
                  onClick={() => setResolving(true)}
                  className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl text-sm hover:bg-amber-600 transition-colors"
                >
                  Resolve This Task
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-secondary">How should we handle this?</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setResolveAction('done')}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        resolveAction === 'done'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[var(--color-surface)] text-secondary'
                      }`}
                    >
                      Done (late)
                    </button>
                    <button
                      onClick={() => setResolveAction('reschedule')}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        resolveAction === 'reschedule'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-[var(--color-surface)] text-secondary'
                      }`}
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setResolveAction('dismiss')}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        resolveAction === 'dismiss'
                          ? 'bg-slate-500 text-white'
                          : 'bg-[var(--color-surface)] text-secondary'
                      }`}
                    >
                      Dismiss
                    </button>
                  </div>
                  {resolveAction === 'reschedule' && (
                    <input
                      type="datetime-local"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="input w-full"
                      required
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleResolve}
                      className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setResolving(false)}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {task.destination === 'archive' && (
            <p className="text-sm text-muted text-center">
              This task is archived.
              {task.completed_at && ' Completed on ' + formatDate(task.completed_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}