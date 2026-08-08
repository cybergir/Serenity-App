import { useState } from 'react'
import { useDeleteVaultItem } from '../../hooks/useVault'

const typeLabels = {
  note: 'Note',
  quote: 'Quote',
  image_url: 'Image',
  link: 'Link',
  memory: 'Memory'
}

function formatAddedDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function getDomain(url) {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return hostname.replace('www.', '')
  } catch {
    return url
  }
}

function isYouTube(url) {
  return /youtube\.com|youtu\.be/i.test(url)
}

export default function VaultDetail({ item, onClose }) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const deleteItem = useDeleteVaultItem()

  const handleDelete = () => {
    deleteItem.mutate(item.id)
    setDeleted(true)
    setTimeout(() => onClose(), 400)
  }

  if (deleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[var(--color-card)] rounded-2xl shadow-xl border border-[var(--color-border)] p-8 text-center">
          <p className="text-sm text-secondary">Removed from your vault.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--color-card)] rounded-2xl shadow-xl border border-[var(--color-border)] w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted mb-1 block">{typeLabels[item.item_type]}</span>
              <h2 className="text-lg text-primary font-medium break-words">{item.title}</h2>
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
          {/* Content */}
          <div>
            {item.item_type === 'image_url' ? (
              <img
                src={item.content}
                alt={item.title}
                className="rounded-xl w-full object-cover"
                onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<p class="text-sm text-muted italic py-8 text-center">Unable to load this image.</p>'
                }}
              />
            ) : item.item_type === 'link' ? (
              <div className="space-y-3">
                {isYouTube(item.content) ? (
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-colors hover:opacity-90"
                    style={{ background: '#fee2e2', color: '#dc2626' }}
                  >
                    <span className="text-lg">▶</span>
                    <span>Listen on YouTube</span>
                  </a>
                ) : /spotify\.com/i.test(item.content) ? (
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-colors hover:opacity-90"
                    style={{ background: '#dbeafe', color: '#1d4ed8' }}
                  >
                    <span>🎧</span>
                    <span>Listen on Spotify</span>
                  </a>
                ) : (
                  <a
                    href={item.content.startsWith('http') ? item.content : `https://${item.content}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-colors hover:opacity-90"
                    style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}
                  >
                    <span>🌐</span>
                    <span>{getDomain(item.content)}</span>
                  </a>
                )}
                <p className="text-xs text-muted break-all">{item.content}</p>
              </div>
            ) : item.item_type === 'quote' ? (
              <p className="text-secondary italic leading-relaxed text-base pl-4 border-l-2" style={{ borderColor: 'var(--color-warning)' }}>
                "{item.content}"
              </p>
            ) : item.item_type === 'memory' ? (
              <p className="text-secondary leading-relaxed text-base pl-4 border-l-2" style={{ borderColor: 'var(--color-success)' }}>
                {item.content}
              </p>
            ) : (
              <p className="text-secondary leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <p className="text-xs text-muted mb-1">Saved</p>
            <p className="text-sm text-secondary">{formatAddedDate(item.created_at)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] rounded-b-2xl">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-xs text-muted hover:text-red-400 transition-colors"
            >
              Remove from vault
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary">Remove this memory?</span>
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Yes, remove
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="text-xs text-muted hover:text-primary"
              >
                Keep it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}