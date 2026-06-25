import { useState, useEffect, useRef } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { auth, provider, db } from './firebase'
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

function useFirestoreApps(uid) {
  const [apps, setApps] = useState(null)

  useEffect(() => {
    if (!uid) { setApps(null); return }

    const ref = doc(db, 'users', uid)

    // Subscribe to real-time updates
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setApps(snap.data().apps)
      } else {
        // First time — seed with defaults
        setDoc(ref, { apps: DEFAULT_APPS })
        setApps(DEFAULT_APPS)
      }
    })

    return unsub
  }, [uid])

  async function saveApps(updated) {
    setApps(updated)
    await setDoc(doc(db, 'users', uid), { apps: updated })
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

function LoginScreen({ onLogin }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon">🚀</div>
        <h1 className="login-title">Master View</h1>
        <p className="login-sub">Sign in to access your app launcher</p>
        <button className="google-btn" onClick={onLogin}>
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading
  const [apps, saveApps] = useFirestoreApps(user?.uid)
  const [editingApp, setEditingApp] = useState(null)
  const [addingApp, setAddingApp] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u ?? null))
  }, [])

  async function handleLogin() {
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleLogout() {
    await signOut(auth)
  }

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

  if (user === undefined) {
    return <div className="loading-screen"><div className="spinner" /></div>
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Master View</h1>
            <p className="header-sub">Your app launcher dashboard</p>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
              <span className="user-name">{user.displayName}</span>
            </div>
            <button className="add-btn" onClick={() => setAddingApp(true)}>+ Add App</button>
            <button className="logout-btn" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="main">
        {apps === null ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : apps.length === 0 ? (
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
