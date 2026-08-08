import { useState, useEffect } from 'react'
import { useBrainDumps, useCreateBrainDump } from '../hooks/useBrainDump'
import { useCreateTask } from '../hooks/useTasks'
import { Link } from 'react-router-dom'

const emptyMessages = [
  "Your mind has room to breathe.",
  "A quiet mind is a wonderful place to start.",
  "Nothing is asking for your attention right now.",
  "Sometimes an empty list is progress.",
  "Peace can be productive too.",
  "Your mind is clear. Take a moment before filling it again.",
  "Nothing waiting. Nothing pressing. Just now.",
]

function getRandomMessage() {
  const previous = localStorage.getItem("capture-last-message")
  if (emptyMessages.length === 1) return emptyMessages[0]
  let message
  do {
    message = emptyMessages[Math.floor(Math.random() * emptyMessages.length)]
  } while (message === previous)
  localStorage.setItem("capture-last-message", message)
  return message
}

export default function Capture() {
  const [content, setContent] = useState('')
  const [released, setReleased] = useState(false)
  const [releasedText, setReleasedText] = useState('')
  const [showSparkle, setShowSparkle] = useState(false)
  const [dailyMessage] = useState(getRandomMessage)
  const [messageVisible, setMessageVisible] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useBrainDumps(false)
  const createDump = useCreateBrainDump()
  const createTask = useCreateTask()

  const unprocessedDumps = data?.items || []

  const filteredDumps = search
    ? unprocessedDumps.filter(dump =>
        dump.content.toLowerCase().includes(search.toLowerCase())
      )
    : unprocessedDumps

  // Fade in message
  useEffect(() => {
    const timer = setTimeout(() => setMessageVisible(true), 250)
    return () => clearTimeout(timer)
  }, [])

  const handleDump = (e) => {
    e.preventDefault()
    if (!content.trim()) return

    const text = content.trim()
    setContent('')
    setReleased(true)
    setReleasedText(text)

    setTimeout(() => {
      setReleased(false)
      setShowSparkle(true)
      createDump.mutate(text)
    }, 700)

    setTimeout(() => {
      setShowSparkle(false)
    }, 3000)
  }

  const handleConvertToTask = (dumpContent) => {
    createTask.mutate({
      title: dumpContent.slice(0, 100),
      description: dumpContent.length > 100 ? dumpContent : null,
      priority: 'medium'
    })
  }

  return (
    <div className="space-y-5">
      <h1 className="heading-page">Capture</h1>
      <p className="text-sm text-secondary">
        Drop anything on your mind here. No need to organize it, prioritize it, or do anything
        about it. Just get it out. You can turn it into a task later, or just let it go.
      </p>

      {/* Capture Input */}
      <form onSubmit={handleDump} className="card-padded space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? No need to make it pretty..."
            rows={3}
            className="textarea"
            autoFocus
          />
          {released && (
            <div className="absolute inset-0 flex items-start pointer-events-none">
              <p className="text-sm text-primary animate-release w-full">
                {releasedText}
              </p>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!content.trim()}
          className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Let it out
        </button>
      </form>

      {/* Sparkle confirmation */}
      {showSparkle && (
        <div className="text-center py-4 animate-sparkle-in">
          <p className="text-2xl float-gentle">✨</p>
          <p className="text-sm text-secondary mt-2">Your mind is a little lighter.</p>
        </div>
      )}

      {/* Unprocessed Dumps */}
      {isLoading ? (
        <p className="empty-state-text">Loading...</p>
      ) : filteredDumps.length === 0 && !showSparkle ? (
        <div className="empty-state">
          <p className="text-2xl float-gentle mb-4">✨</p>
          <p
            className={`text-sm text-secondary max-w-sm mx-auto leading-relaxed transition-opacity duration-500 ${
              messageVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {search ? `Nothing found for "${search}".` : dailyMessage}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="heading-section">Waiting to be processed</h2>
          {unprocessedDumps.length > 0 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your thoughts..."
              className="input-search"
            />
          )}
          {filteredDumps.map((dump) => (
            <div key={dump.id} className="card-padded">
              <p className="text-sm text-primary whitespace-pre-wrap">{dump.content}</p>
              <p className="text-xs text-muted mt-2">
                {new Date(dump.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleConvertToTask(dump.content)}
                  className="btn btn-secondary text-xs py-1.5 px-3"
                >
                  Turn into task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link to="/tasks" className="text-sm text-brand hover:underline">
          View all tasks →
        </Link>
      </div>
    </div>
  )
}