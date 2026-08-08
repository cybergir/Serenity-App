import { useState } from 'react'
import { useUpdateTask } from '../../hooks/useTasks'
import api from '../../services/api'

export default function RoutineDetail({ routine, onClose, onUpdate }) {
  const [routineType, setRoutineType] = useState(routine.routine_type)
  const [routineInterval, setRoutineInterval] = useState(routine.routine_interval || 1)
  const [routineDays, setRoutineDays] = useState(routine.routine_days || '')
  const [routineMonthDay, setRoutineMonthDay] = useState(routine.routine_month_day || null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const updateTask = useUpdateTask()

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateTask.mutateAsync({
        taskId: routine.id,
        updates: {
          routine_type: routineType,
          routine_interval: routineInterval,
          routine_days: routineDays || null,
          routine_month_day: routineMonthDay,
        }
      })
      onUpdate?.()
      onClose()
    } catch (err) {
      console.error('Failed to update routine', err)
    } finally {
      setSaving(false)
    }
  }

  const handleStopRoutine = async () => {
    setSaving(true)
    try {
      await updateTask.mutateAsync({
        taskId: routine.id,
        updates: { routine_type: 'never' }
      })
      onUpdate?.()
      onClose()
    } catch (err) {
      console.error('Failed to stop routine', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this routine and all its future instances?')) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('access_token')
      await api.delete(`/tasks/${routine.id}`)
      onUpdate?.()
      onClose()
    } catch (err) {
      console.error('Failed to delete routine', err)
    } finally {
      setDeleting(false)
    }
  }

  const frequencyLabel = () => {
    if (routineType === 'never') return 'Not repeating'
    const base = routineType.charAt(0).toUpperCase() + routineType.slice(1)
    if (routineInterval > 1) return `Every ${routineInterval} ${routineType}`
    return base
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--color-card)] rounded-2xl shadow-xl border border-[var(--color-border)] w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg text-primary font-medium">{routine.title}</h2>
              {routine.category && (
                <span className="badge badge-medium mt-1 inline-block">{routine.category}</span>
              )}
            </div>
            <button onClick={onClose} className="text-muted hover:text-primary text-xl p-1">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {routine.description && (
            <p className="text-sm text-secondary">{routine.description}</p>
          )}

          {/* Next occurrence */}
          {routine.next_occurrence && (
            <div className="p-3 rounded-xl bg-[var(--color-brand-soft)]">
              <p className="text-xs text-muted mb-1">Next occurrence</p>
              <p className="text-sm text-brand font-medium">
                {new Date(routine.next_occurrence).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Frequency editor */}
          <div>
            <p className="text-xs text-muted mb-2">Frequency</p>
            <div className="flex gap-1 flex-wrap mb-3">
              {['daily', 'weekly', 'monthly', 'yearly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setRoutineType(type)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    routineType === type
                      ? 'bg-[var(--color-brand-soft)] text-brand'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Every</span>
              <input
                type="number"
                value={routineInterval}
                onChange={(e) => setRoutineInterval(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="input w-16 py-1.5 text-center text-sm"
              />
              <span className="text-xs text-muted">
                {routineType === 'daily' ? 'day(s)' :
                 routineType === 'weekly' ? 'week(s)' :
                 routineType === 'monthly' ? 'month(s)' : 'year(s)'}
              </span>
            </div>
          </div>

          {/* Days for weekly */}
          {routineType === 'weekly' && (
            <div>
              <p className="text-xs text-muted mb-1.5">On these days</p>
              <div className="flex gap-1 flex-wrap">
                {['mon','tue','wed','thu','fri','sat','sun'].map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      const days = routineDays ? routineDays.split(',') : []
                      const updated = days.includes(day)
                        ? days.filter(d => d !== day)
                        : [...days, day]
                      setRoutineDays(updated.join(','))
                    }}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                      routineDays?.includes(day)
                        ? 'bg-[var(--color-brand-soft)] text-brand'
                        : 'text-muted hover:text-primary border border-[var(--color-border)]'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day for monthly */}
          {routineType === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">On day</span>
              <input
                type="number"
                value={routineMonthDay || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (val >= 1 && val <= 31) setRoutineMonthDay(val)
                  else if (e.target.value === '') setRoutineMonthDay(null)
                }}
                min="1" max="31" placeholder="1-31"
                className="input w-16 py-1.5 text-center text-sm"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] rounded-b-2xl space-y-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleStopRoutine}
              disabled={saving}
              className="btn btn-ghost text-xs flex-1 text-muted hover:text-warning"
            >
              Stop routine
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-ghost text-xs flex-1 text-muted hover:text-red-400"
            >
              {deleting ? 'Deleting...' : 'Delete routine'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}