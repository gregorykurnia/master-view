import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import './App.css'

const DEFAULT_APPS = [
  { id: 1, name: 'File Management', url: '', emoji: '📁' },
  { id: 2, name: 'Client Tracker', url: '', emoji: '👥' },
  { id: 3, name: 'Stocks', url: '', emoji: '📈' },
  { id: 4, name: 'Attendance', url: '', emoji: '📋' },
  { id: 5, name: 'To-Do Management', url: '', emoji: '✅' },
]

const EMOJI_OPTIONS = [
  '📁', '📂', '🗂️', '📊', '📈', '📉', '💹',
  '👥', '👤', '🤝', '💼', '🏢', '🏗️', '🔧',
  '✅', '📋', '📝', '🗒️', '📌', '📍', '🔖',
  '💰', '💳', '🏦', '💵', '🛒', '📦', '🚚',
  '🎯', '🚀', '⚡', '🔥', '🌟', '💡', '🔑',
  '📅', '🕐', '⏰', '📆', '🗓️', '⏳', '⌛',
  '🖥️', '💻', '📱', '🖨️', '⌨️', '🖱️', '💾',
  '🔒', '🔓', '🛡️', '🔐', '🗝️', '🔏', '🔑',
  '📧', '📨', '📩', '📤', '📥', '📮', '📬',
  '🎨', '🖌️', '✏️', '📐', '📏', '🔍', '🔎',
]

const APPS_DOC = doc(db, 'dashboard', 'apps')

function useFirestoreApps() {
  const [apps, setApps] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(APPS_DOC, (snap) => {
      if (snap.exists()) {
        setApps(snap.data().apps)
      } else {
        setDoc(APPS_DOC, { apps: DEFAULT_APPS })
        setApps(DEFAULT_APPS)
      }
    })
    return unsub
  }, [])

  async function saveApps(updated) {
    setApps(updated)
    await setDoc(APPS_DOC, { apps: updated })
  }

  return [apps, saveApps]
}

function EmojiPicker({ selected, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div className="emoji-picker" ref={ref}>
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          className={`emoji-option ${selected === emoji ? 'active' : ''}`}
          onClick={() => { onSelect(emoji); onClose() }}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

function EditModal({ app, onSave, onCancel }) {
  const [name, setName] = useState(app.name)
  const [url, setUrl] = useState(app.url)
  const [emoji, setEmoji] = useState(app.emoji)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ ...app, name: name.trim(), url: url.trim(), emoji })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit App</h2>
        <form onSubmit={handleSave}>
          <div className="field">
            <label>Icon</label>
            <div className="emoji-row">
              <button type="button" className="emoji-trigger" onClick={() => setShowEmojiPicker((v) => !v)}>
                {emoji}
              </button>
              <span className="emoji-hint">Click to change icon</span>
            </div>
            {showEmojiPicker && (
              <EmojiPicker selected={emoji} onSelect={setEmoji} onClose={() => setShowEmojiPicker(false)} />
            )}
          </div>
          <div className="field">
            <label htmlFor="edit-name">App Name</label>
            <input id="edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. File Management" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="edit-url">URL</label>
            <input id="edit-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.com" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddModal({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [emoji, setEmoji] = useState('🚀')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), url: url.trim(), emoji })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add App</h2>
        <form onSubmit={handleSave}>
          <div className="field">
            <label>Icon</label>
            <div className="emoji-row">
              <button type="button" className="emoji-trigger" onClick={() => setShowEmojiPicker((v) => !v)}>
                {emoji}
              </button>
              <span className="emoji-hint">Click to change icon</span>
            </div>
            {showEmojiPicker && (
              <EmojiPicker selected={emoji} onSelect={setEmoji} onClose={() => setShowEmojiPicker(false)} />
            )}
          </div>
          <div className="field">
            <label htmlFor="add-name">App Name</label>
            <input id="add-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My App" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="add-url">URL</label>
            <input id="add-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.com" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Add App</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AppCard({ app, onEdit, onDelete }) {
  function handleClick() {
    if (app.url) window.open(app.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`app-card ${!app.url ? 'no-url' : ''}`}>
      <div className="app-card-inner" onClick={handleClick} title={app.url || 'No URL set'}>
        <div className="app-icon">{app.emoji}</div>
        <div className="app-name">{app.name}</div>
        {!app.url && <div className="url-badge">No URL</div>}
      </div>
      <div className="app-actions">
        <button className="action-btn edit-btn" onClick={() => onEdit(app)} title="Edit">✏️</button>
        <button className="action-btn delete-btn" onClick={() => onDelete(app.id)} title="Delete">🗑️</button>
      </div>
    </div>
  )
}

export default function App() {
  const [apps, saveApps] = useFirestoreApps()
  const [editingApp, setEditingApp] = useState(null)
  const [addingApp, setAddingApp] = useState(false)

  function handleSaveEdit(updated) {
    saveApps(apps.map((a) => (a.id === updated.id ? updated : a)))
    setEditingApp(null)
  }

  function handleDelete(id) {
    saveApps(apps.filter((a) => a.id !== id))
  }

  function handleAddApp(data) {
    saveApps([...apps, { ...data, id: Date.now() }])
    setAddingApp(false)
  }

  if (apps === null) {
    return <div className="loading-screen"><div className="spinner" /></div>
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Master View</h1>
            <p className="header-sub">Your app launcher dashboard</p>
          </div>
          <button className="add-btn" onClick={() => setAddingApp(true)}>+ Add App</button>
        </div>
      </header>

      <main className="main">
        {apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <p>No apps yet. Add your first app!</p>
          </div>
        ) : (
          <div className="grid">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} onEdit={setEditingApp} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {editingApp && (
        <EditModal app={editingApp} onSave={handleSaveEdit} onCancel={() => setEditingApp(null)} />
      )}
      {addingApp && (
        <AddModal onSave={handleAddApp} onCancel={() => setAddingApp(false)} />
      )}
    </div>
  )
}
