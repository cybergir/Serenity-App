import { useState, useEffect } from 'react'
import { useMicroWins, useCreateMicroWin } from '../hooks/useMicroWins'
import { usePulseHistory, useTotalWins } from '../hooks/useInsights'

const emptyMessages = [
  "Every journey begins with one small step.",
  "Progress is built one moment at a time.",
  "Notice one thing that went right today.",
  "Even today had something worth remembering.",
  "Growth doesn't always make noise.",
  "What made today a little better?",
  "The small things add up. They really do.",
  "You've done more than you give yourself credit for.",
]

const dailyPrompts = [
  "What went well today?",
  "What's one thing you did that took courage?",
  "What moment would you want to remember?",
  "Who helped you recently?",
  "What did you do that your future self will thank you for?",
  "What felt like progress today?",
  "What are you quietly proud of?",
  "What made you smile?",
]

function getRandomMessage(messages, storageKey) {
  const previous = localStorage.getItem(storageKey)
  if (messages.length === 1) return messages[0]
  let message
  do {
    message = messages[Math.floor(Math.random() * messages.length)]
  } while (message === previous)
  localStorage.setItem(storageKey, message)
  return message
}

function getPlantStage(total) {
  if (total === 0) return { emoji: '🌱', label: '' }
  if (total <= 3) return { emoji: '🌱', label: 'Just beginning' }
  if (total <= 10) return { emoji: '🌿', label: 'Taking root' }
  if (total <= 25) return { emoji: '🪴', label: 'Growing steadily' }
  if (total <= 50) return { emoji: '🌳', label: 'Something real' }
  return { emoji: '🌳✨', label: 'A forest of moments' }
}

export default function Insights() {
  const [winContent, setWinContent] = useState('')
  const [released, setReleased] = useState(false)
  const [releasedText, setReleasedText] = useState('')
  const [showSparkle, setShowSparkle] = useState(false)
  const [firstWinCelebration, setFirstWinCelebration] = useState(false)
  const [emptyMessage] = useState(() => getRandomMessage(emptyMessages, 'insights-last-empty'))
  const [dailyPrompt] = useState(() => getRandomMessage(dailyPrompts, 'insights-last-prompt'))
  const [messageVisible, setMessageVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('wins')
  const [milestoneMessage, setMilestoneMessage] = useState(null)
  const [search, setSearch] = useState('')

  const { data: winsData, isLoading: winsLoading } = useMicroWins()
  const { data: totalWinsData } = useTotalWins()
  const { data: pulseData, isLoading: pulseLoading } = usePulseHistory(14)
  const createWin = useCreateMicroWin()

  const wins = winsData?.items || []
  const totalWins = totalWinsData?.total || 0
  const pulseHistory = pulseData?.items || []
  const plant = getPlantStage(totalWins)

  const filteredWins = search
    ? wins.filter(win =>
        win.content.toLowerCase().includes(search.toLowerCase())
      )
    : wins

  // Fade in
  useEffect(() => {
    const timer = setTimeout(() => setMessageVisible(true), 250)
    return () => clearTimeout(timer)
  }, [])

  // First win celebration
  useEffect(() => {
    const hasSeen = localStorage.getItem('insights-first-win')
    if (totalWins === 1 && !hasSeen) {
      setFirstWinCelebration(true)
      localStorage.setItem('insights-first-win', 'true')
      setTimeout(() => setFirstWinCelebration(false), 4000)
    }
  }, [totalWins])

  // Milestone celebrations
  useEffect(() => {
    const milestones = {
      5: '🌱 You\'re building momentum.',
      10: '🌿 Small victories become habits.',
      25: '🪴 Look how far you\'ve come.',
      50: '🌳 Something real is growing.',
      100: '🌳✨ A forest of moments.'
    }
    const seen = JSON.parse(localStorage.getItem('insights-milestones') || '[]')
    for (const [count, message] of Object.entries(milestones)) {
      if (totalWins >= parseInt(count) && !seen.includes(count)) {
        setMilestoneMessage(message)
        localStorage.setItem('insights-milestones', JSON.stringify([...seen, count]))
        setTimeout(() => setMilestoneMessage(null), 5000)
        break
      }
    }
  }, [totalWins])

  const handleAddWin = (e) => {
    e.preventDefault()
    if (!winContent.trim()) return

    const text = winContent.trim()
    setWinContent('')
    setReleased(true)
    setReleasedText(text)

    setTimeout(() => {
      setReleased(false)
      setShowSparkle(true)
      createWin.mutate(text)
    }, 600)

    setTimeout(() => {
      setShowSparkle(false)
    }, 3000)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const answeredPulses = pulseHistory.filter(p => p.answer && p.answer !== '[skipped]')

  return (
    <div className="space-y-6">
      {/* First win celebration */}
      {firstWinCelebration && (
        <div className="card-padded text-center" style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success)' }}>
          <p className="text-success text-sm">🌱 Your first win has been planted.</p>
        </div>
      )}

      {/* Milestone celebration */}
      {milestoneMessage && (
        <div className="card-padded text-center" style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success)' }}>
          <p className="text-success text-sm">{milestoneMessage}</p>
        </div>
      )}

      {/* Plant */}
      <div className="card-padded text-center">
        <div className="text-5xl float-gentle mb-3">{plant.emoji}</div>
        {plant.label && (
          <p className="text-xs text-muted">{plant.label}</p>
        )}
        <p className="text-xs text-muted mt-1">
          {totalWins} win{totalWins !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          onClick={() => setActiveTab('wins')}
          className={activeTab === 'wins' ? 'tab-active' : 'tab'}
        >
          🌱 Micro-Wins
        </button>
        <button
          onClick={() => setActiveTab('checkins')}
          className={activeTab === 'checkins' ? 'tab-active' : 'tab'}
        >
          🌤 Check-ins
        </button>
      </div>

      {/* Micro-Wins Tab */}
      {activeTab === 'wins' && (
        <div className="space-y-5">
          {/* Input */}
          <form onSubmit={handleAddWin} className="card-padded space-y-3">
            <p className="text-sm text-secondary">{dailyPrompt}</p>
            <div className="relative">
              <input
                type="text"
                value={winContent}
                onChange={(e) => setWinContent(e.target.value)}
                placeholder="Type your answer..."
                className="input w-full"
                autoFocus
              />
              {released && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <p className="text-sm text-primary animate-release w-full">{releasedText}</p>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!winContent.trim()}
              className="btn btn-success disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Record Win
            </button>
          </form>

          {/* Sparkle confirmation */}
          {showSparkle && (
            <div className="text-center py-3 animate-sparkle-in">
              <p className="text-lg float-gentle">✨</p>
              <p className="text-xs text-secondary mt-1">Small victories grow into big ones.</p>
            </div>
          )}

          {/* Search */}
          {wins.length > 0 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your wins..."
              className="input-search"
            />
          )}

          {/* Wins list */}
          {winsLoading ? (
            <p className="empty-state-text">Loading...</p>
          ) : filteredWins.length === 0 && search ? (
            <div className="empty-state">
              <p className="empty-state-icon">🔍</p>
              <p className="empty-state-text">Nothing found for "{search}".</p>
            </div>
          ) : wins.length === 0 ? (
            <div className="empty-state">
              <p className="text-2xl float-gentle mb-4">🌱</p>
              <p
                className={`text-sm text-secondary max-w-sm mx-auto leading-relaxed transition-opacity duration-500 ${
                  messageVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {emptyMessage}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredWins.map((win) => (
                <div
                  key={win.id}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--color-success-soft)' }}
                >
                  <span className="text-success mt-0.5 text-sm">✦</span>
                  <div>
                    <p className="text-sm text-primary">{win.content}</p>
                    <p className="text-xs text-muted mt-1">{formatDate(win.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Check-ins Tab */}
      {activeTab === 'checkins' && (
        <div className="space-y-3">
          {pulseLoading ? (
            <p className="empty-state-text">Loading...</p>
          ) : answeredPulses.length === 0 ? (
            <div className="empty-state">
              <p className="text-2xl float-gentle mb-4">🌤</p>
              <p className="text-sm text-secondary max-w-sm mx-auto leading-relaxed">
                No check-ins yet. They'll appear here as you answer the daily prompts on your Today page.
              </p>
            </div>
          ) : (
            answeredPulses.map((pulse) => (
              <div key={pulse.id} className="card-padded">
                <p className="text-xs text-muted mb-1">{pulse.prompt}</p>
                <p className="text-sm text-primary">{pulse.answer}</p>
                <p className="text-xs text-muted mt-2">{formatDate(pulse.created_at)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}