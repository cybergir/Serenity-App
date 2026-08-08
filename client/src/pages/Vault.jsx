import { useState, useEffect } from 'react'
import { useVaultItems, useCreateVaultItem, useDeleteVaultItem } from '../hooks/useVault'
import VaultDetail from '../components/vault/VaultDetail'

const typeLabels = {
  note: 'Note',
  quote: 'Quote',
  image_url: 'Image',
  link: 'Link',
  memory: 'Memory'
}

const emptyMessages = [
  "Every meaningful collection starts with one memory.",
  "Nothing here yet. The moments that matter are worth keeping.",
  "Save something your future self will smile at.",
  "The little things often become the biggest memories.",
  "Not everything valuable can be measured.",
  "Some moments deserve a place you'll always remember.",
  "What made you smile today? Save it here.",
  "Save something your future self will appreciate.",
]

function getRandomMessage() {
  const previous = localStorage.getItem("vault-last-message")
  if (emptyMessages.length === 1) return emptyMessages[0]
  let message
  do {
    message = emptyMessages[Math.floor(Math.random() * emptyMessages.length)]
  } while (message === previous)
  localStorage.setItem("vault-last-message", message)
  return message
}

function formatAddedDate(dateStr) {
  const date = new Date(dateStr)
  const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return `Added ${formatted}`
}

function getDomain(url) {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return hostname.replace('www.', '')
  } catch {
    return url.length > 30 ? url.slice(0, 30) + '...' : url
  }
}

function isYouTube(url) {
  return /youtube\.com|youtu\.be/i.test(url)
}

export default function Vault() {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [itemType, setItemType] = useState('note')
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [firstItemMessage, setFirstItemMessage] = useState(false)
  const [dailyMessage] = useState(getRandomMessage)
  const [messageVisible, setMessageVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data, isLoading } = useVaultItems(filter)
  const createItem = useCreateVaultItem()
  const deleteItem = useDeleteVaultItem()

  const items = data?.items || []
  const totalItems = data?.total || 0

  useEffect(() => {
    const timer = setTimeout(() => setMessageVisible(true), 250)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const hasSeenCelebration = localStorage.getItem('vault-first-item')
    if (totalItems === 1 && !hasSeenCelebration) {
      setFirstItemMessage(true)
      localStorage.setItem('vault-first-item', 'true')
      setTimeout(() => setFirstItemMessage(false), 4000)
    }
  }, [totalItems])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    createItem.mutate({
      title: title.trim(),
      content: content.trim(),
      item_type: itemType
    })
    setTitle('')
    setContent('')
    setItemType('note')
    setShowForm(false)
  }

  const renderContent = (item) => {
    switch (item.item_type) {
      case 'link':
        if (isYouTube(item.content)) {
          return (
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
              style={{ background: '#fee2e2', color: '#dc2626' }}
            >
              <span>▶</span>
              <span>Listen on YouTube</span>
            </a>
          )
        }
        if (/spotify\.com/i.test(item.content)) {
          return (
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}
            >
              <span>🎧</span>
              <span>Listen on Spotify</span>
            </a>
          )
        }
        return (
          <a
            href={item.content.startsWith('http') ? item.content : `https://${item.content}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
            style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}
          >
            <span>🌐</span>
            <span>{getDomain(item.content)}</span>
          </a>
        )

      case 'image_url':
        return (
          <img
            src={item.content}
            alt={item.title}
            className="rounded-lg max-h-40 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<p class="text-sm text-muted italic">Unable to load this image.</p>'
            }}
          />
        )

      case 'quote':
        return (
          <p className="text-sm text-secondary italic leading-relaxed pl-3 border-l-2" style={{ borderColor: 'var(--color-warning)' }}>
            "{item.content}"
          </p>
        )

      case 'memory':
        return (
          <p className="text-sm text-secondary leading-relaxed pl-3 border-l-2" style={{ borderColor: 'var(--color-success)' }}>
            {item.content}
          </p>
        )

      default:
        return (
          <p className="text-sm text-secondary leading-relaxed">
            {item.content}
          </p>
        )
    }
  }

  const filteredItems = search
    ? items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <div className="space-y-5">
      {firstItemMessage && (
        <div className="card-padded text-center" style={{ background: 'var(--color-brand-soft)', borderColor: 'var(--color-brand)' }}>
          <p className="text-brand text-sm">💎 Your vault has its first treasure.</p>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="heading-page">Vault</h1>
        {items.length > 0 && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            + Add to Vault
          </button>
        )}
      </div>

      <p className="text-sm text-secondary">
        A private collection of things that help you feel better. Photos, quotes,
        memories, links; whatever anchors you. 
        <br />
        No one sees this but you.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-padded space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a name..."
            className="input w-full"
            autoFocus
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="The quote, the memory, the link, the words..."
            rows={3}
            className="textarea"
            required
          />
          <div className="flex gap-3 items-center flex-wrap">
            <select value={itemType} onChange={(e) => setItemType(e.target.value)} className="select">
              <option value="note">Note</option>
              <option value="quote">Quote</option>
              <option value="memory">Memory</option>
              <option value="link">Link</option>
              <option value="image_url">Image URL</option>
            </select>
            <button type="submit" className="btn btn-primary">Save to Vault</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your vault..."
        className="input-search"
      />

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        {['', 'note', 'quote', 'memory', 'link', 'image_url'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filter === type ? 'bg-[var(--color-brand-soft)] text-brand' : 'text-muted hover:text-primary'
            }`}
          >
            {type ? typeLabels[type] : 'All'}
          </button>
        ))}
      </div>

      {!isLoading && filteredItems.length === 0 && !search && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl float-gentle mb-6">💎</div>
          <p
            className={`fade-soft text-secondary text-base max-w-sm leading-relaxed transition-opacity duration-500 ${
              messageVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {dailyMessage}
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-6">
            + Add your first memory
          </button>
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && search && (
        <div className="empty-state">
          <p className="empty-state-icon">🔍</p>
          <p className="empty-state-text">Nothing found for "{search}".</p>
        </div>
      )}

      {isLoading && <p className="empty-state-text">Loading...</p>}

      {filteredItems.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="card-padded group relative cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted">{typeLabels[item.item_type]}</span>
              </div>
              <h3 className="text-primary font-medium mb-2">{item.title}</h3>
              <div>{renderContent(item)}</div>
              <p className="text-xs text-muted mt-3">{formatAddedDate(item.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {filteredItems.length > 0 && (
        <p className="text-xs text-muted text-center">
          {filteredItems.length === 1
            ? '1 treasure safely kept.'
            : `${filteredItems.length} treasures safely kept.`}
        </p>
      )}

      {selectedItem && (
        <VaultDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}