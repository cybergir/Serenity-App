import Dropdown from "../ui/Dropdown";
import { useState } from 'react'

export default function TaskForm({ onSubmit, onCancel, initialData }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priority, setPriority] = useState(initialData?.priority || 'medium')
  const [category, setCategory] = useState(initialData?.category || '')
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '')
  const [subtasks, setSubtasks] = useState(initialData?.subtasks || [])
  const [errors, setErrors] = useState({})

  // Routine state
  const [routineType, setRoutineType] = useState(initialData?.routineType || 'never')
  const [routineInterval, setRoutineInterval] = useState(initialData?.routineInterval || 1)
  const [routineDays, setRoutineDays] = useState(initialData?.routineDays || '')
  const [routineMonthDay, setRoutineMonthDay] = useState(initialData?.routineMonthDay || null)
  const [routineEndType, setRoutineEndType] = useState(initialData?.routineEndType || 'never')
  const [routineEndCount, setRoutineEndCount] = useState(initialData?.routineEndCount || null)
  const [routineEndDate, setRoutineEndDate] = useState(initialData?.routineEndDate || '')
  const [showRoutine, setShowRoutine] = useState(initialData?.routineType && initialData.routineType !== 'never' ? true : false)
  const [routineCustomUnit, setRoutineCustomUnit] = useState('days')

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Task title is needed.'
    if (!category) newErrors.category = 'Please choose a category.'
    if (!dueDate) newErrors.dueDate = 'When would you like this done?'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const validSubtasks = subtasks
      .filter(s => s.title.trim())
      .map((s, i) => ({ title: s.title.trim(), order: i }))

    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      category,
      priority,
      due_date: dueDate ? dueDate + ':00' : null,
      routine_type: showRoutine ? routineType : 'never',
      routine_interval: routineInterval,
      routine_days: routineDays || null,
      routine_month_day: routineMonthDay,
      routine_end_type: routineEndType,
      routine_end_count: routineEndCount,
      routine_end_date: routineEndDate ? routineEndDate + 'T00:00:00' : null,
      is_routine_template: showRoutine && routineType !== 'never',
      subtasks: validSubtasks.length > 0 ? validSubtasks : []
    })

    // Reset form
    setTitle('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setDueDate('')
    setSubtasks([])
    setRoutineType('never')
    setRoutineInterval(1)
    setRoutineDays('')
    setRoutineMonthDay(null)
    setRoutineEndType('never')
    setRoutineEndCount(null)
    setShowRoutine(false)
    setRoutineCustomUnit('days')
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="card-padded space-y-4">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setErrors({}) }}
          placeholder="What needs doing?"
          className={`input w-full ${errors.title ? 'border-red-300 dark:border-red-700' : ''}`}
          autoFocus
        />
        {errors.title && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.title}</p>
        )}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a note (optional)"
        rows={2}
        className="textarea"
      />

      {/* Subtasks */}
      <div className="space-y-2">
        <p className="text-xs text-muted">Subtasks (optional)</p>
        {subtasks.map((sub, index) => (
          <div key={index} className="flex gap-2 items-center">
            <span className="text-xs text-muted w-4">{index + 1}.</span>
            <input
              type="text"
              value={sub.title}
              onChange={(e) => {
                const updated = [...subtasks]
                updated[index].title = e.target.value
                setSubtasks(updated)
              }}
              placeholder="Subtasks..."
              className="input flex-1 py-2"
            />
            <button
              type="button"
              onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}
              className="text-muted hover:text-red-400 text-sm px-1"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSubtasks([...subtasks, { title: '', order: subtasks.length }])}
          className="text-xs text-brand hover:underline px-1 py-0.5"
        >
          + Add subtasks
        </button>
      </div>

      {/* Category, Priority, Due Date */}
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <Dropdown
            value={category}
            onChange={setCategory}
            placeholder="Select category"
            options={[
              { value: 'business', label: 'Business' },
              { value: 'personal', label: 'Personal' },
              { value: 'family', label: 'Family' },
            ]}
          />
          {errors.category && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.category}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <Dropdown
            value={priority}
            onChange={setPriority}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
        </div>

        <div>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => { setDueDate(e.target.value); setErrors({}) }}
            min={new Date().toISOString().slice(0, 16)}
            className={`input-date ${errors.dueDate ? 'border-red-300 dark:border-red-700' : ''}`}
          />
          {errors.dueDate && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.dueDate}</p>
          )}
        </div>
      </div>

      {/* Routine Toggle */}
      <div>
        <button
          type="button"
          onClick={() => {
            setShowRoutine(!showRoutine)
            if (showRoutine) setRoutineType('never')
          }}
          className="text-xs text-muted hover:text-primary"
        >
          {showRoutine ? '−' : '+'} Make this a routine
        </button>

        {showRoutine && (
          <div className="space-y-3 mt-3">
            <p className="text-xs text-muted italic">Create it once. Serenity will bring it back automatically.</p>

            <div className="flex gap-1 flex-wrap">
              {[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
                { value: 'custom', label: 'Custom' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRoutineType(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    routineType === opt.value
                      ? 'bg-[var(--color-brand-soft)] text-brand'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom: Repeat every X days/weeks/months/years */}
            {routineType === 'custom' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Repeat every</span>
                <input
                  type="number"
                  value={routineInterval}
                  onChange={(e) => setRoutineInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="input w-16 py-1.5 text-center text-sm"
                />
                <Dropdown
                  value={routineCustomUnit}
                  onChange={(value) => {
                    setRoutineCustomUnit(value)
                    if (value === 'weeks') setRoutineType('weekly')
                    else if (value === 'months') setRoutineType('monthly')
                    else if (value === 'years') setRoutineType('yearly')
                    else setRoutineType('daily')
                  }}
                  options={[
                    { value: 'days', label: 'Days' },
                    { value: 'weeks', label: 'Weeks' },
                    { value: 'months', label: 'Months' },
                    { value: 'years', label: 'Years' },
                  ]}
                />
              </div>
            ) : (
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
                   routineType === 'monthly' ? 'month(s)' :
                   routineType === 'yearly' ? 'year(s)' : ''}
                </span>
              </div>
            )}

            {routineType === 'weekly' && (
              <div>
                <p className="text-xs text-muted mb-1.5">On these days</p>
                <div className="flex gap-1 flex-wrap">
                  {['mon','tue','wed','thu','fri','sat','sun'].map((day) => (
                    <button
                      key={day}
                      type="button"
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

            <div>
              <p className="text-xs text-muted mb-1.5">Ends</p>
              <div className="flex gap-1 flex-wrap">
                {[
                  { value: 'never', label: 'Never' },
                  { value: 'after_count', label: 'After' },
                  { value: 'on_date', label: 'On date' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRoutineEndType(opt.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      routineEndType === opt.value
                        ? 'bg-[var(--color-brand-soft)] text-brand'
                        : 'text-muted hover:text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {routineEndType === 'after_count' && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" value={routineEndCount || ''} onChange={(e) => setRoutineEndCount(parseInt(e.target.value) || null)} min="1" placeholder="10" className="input w-20 py-1.5 text-center text-sm" />
                  <span className="text-xs text-muted">occurrences</span>
                </div>
              )}

              {routineEndType === 'on_date' && (
                <div className="mt-2">
                  <input type="date" value={routineEndDate || ''} onChange={(e) => setRoutineEndDate(e.target.value || null)} className="input-date" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button type="submit" className="btn btn-primary">
          Save Task
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}