import { useState } from 'react'
import { useOffDays, useUpcomingOffDays, useCreateOffDay } from '../hooks/useOffDays'

export default function OffDays() {
  const [showForm, setShowForm] = useState(false)
  const [employeeName, setEmployeeName] = useState('')
  const [offDate, setOffDate] = useState('')
  const [note, setNote] = useState('')
  const [tab, setTab] = useState('upcoming')

  const { data: allData } = useOffDays()
  const { data: upcomingData } = useUpcomingOffDays(30)
  const createOffDay = useCreateOffDay()

  const allEntries = allData?.entries || []
  const upcomingEntries = upcomingData?.entries || []
  
  // Filter past entries (off_date is before today)
  const today = new Date().toISOString().split('T')[0]
  const pastEntries = allEntries.filter(entry => entry.off_date < today)
  const futureEntries = allEntries.filter(entry => entry.off_date >= today)

  const handleCreate = (e) => {
    e.preventDefault()
    if (!employeeName.trim() || !offDate) return
    createOffDay.mutate({
      employee_name: employeeName,
      off_date: offDate,
      note: note || null
    })
    setEmployeeName('')
    setOffDate('')
    setNote('')
    setShowForm(false)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const daysUntil = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff < 0) return `${Math.abs(diff)}d ago`
    return `in ${diff}d`
  }

  const displayEntries = tab === 'upcoming' ? futureEntries : pastEntries

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-light text-slate-700 dark:text-slate-200">Off Days</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm hover:bg-amber-600 transition-colors"
        >
          + Add Off Day
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-4">
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Employee name"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100"
            autoFocus
            required
          />
          <div className="flex gap-3 flex-wrap">
            <input
              type="date"
              value={offDate}
              onChange={(e) => setOffDate(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 text-sm"
              required
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 text-sm"
            />
            <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            tab === 'upcoming'
              ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          Upcoming ({futureEntries.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            tab === 'past'
              ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          Past ({pastEntries.length})
        </button>
      </div>

      {/* Entry List */}
      {displayEntries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">{tab === 'upcoming' ? '📅' : '📦'}</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            {tab === 'upcoming' ? 'No upcoming off days scheduled.' : 'No past off days recorded.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 flex items-center justify-between ${
                tab === 'past'
                  ? 'border-slate-100 dark:border-slate-700 opacity-60'
                  : 'border-slate-100 dark:border-slate-700'
              }`}
            >
              <div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">{entry.employee_name}</p>
                {entry.note && (
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{entry.note}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-300">{formatDate(entry.off_date)}</p>
                <p className={`text-xs mt-0.5 ${
                  daysUntil(entry.off_date).includes('ago')
                    ? 'text-slate-400 dark:text-slate-500'
                    : daysUntil(entry.off_date) === 'Today'
                    ? 'text-amber-500 font-medium'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {daysUntil(entry.off_date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}