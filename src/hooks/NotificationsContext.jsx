import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'smile_notifications'

const TYPE_STYLES = {
  success: { toast:'bg-teal-600 text-white', dot:'bg-teal-500' },
  error:   { toast:'bg-red-600 text-white',  dot:'bg-red-500' },
  patient: { toast:'bg-blue-600 text-white', dot:'bg-blue-500' },
  rdv:     { toast:'bg-teal-600 text-white', dot:'bg-teal-500' },
  facture: { toast:'bg-amber-600 text-white', dot:'bg-amber-500' },
  stock:   { toast:'bg-amber-600 text-white', dot:'bg-amber-500' },
  user:    { toast:'bg-indigo-600 text-white', dot:'bg-indigo-500' },
}

const NotificationsContext = createContext({
  notifications: [],
  notify: () => {},
  clearNotifications: () => {},
})

function formatTime(date = new Date()) {
  return date.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
}

function readStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(readStoredNotifications)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)))
  }, [notifications])

  const dismissToast = useCallback((id) => {
    setToasts(current => current.filter(t => t.id !== id))
  }, [])

  const notify = useCallback(({ type = 'success', message, title }) => {
    if (!message) return
    const notification = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title,
      message,
      time: formatTime(),
      created_at: new Date().toISOString(),
    }

    setNotifications(current => [notification, ...current].slice(0, 30))
    setToasts(current => [notification, ...current].slice(0, 4))
    window.setTimeout(() => dismissToast(notification.id), 4500)
  }, [dismissToast])

  const clearNotifications = useCallback(() => setNotifications([]), [])

  const value = useMemo(() => ({ notifications, notify, clearNotifications }), [notifications, notify, clearNotifications])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[80] w-[min(22rem,calc(100vw-2rem))] space-y-2 pointer-events-none">
        {toasts.map(t => {
          const style = TYPE_STYLES[t.type] ?? TYPE_STYLES.success
          return (
            <div key={t.id} className={`${style.toast} rounded-lg px-4 py-3 shadow-lg pointer-events-auto`}>
              <div className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                <div className="min-w-0 flex-1">
                  {t.title && <p className="text-sm font-semibold">{t.title}</p>}
                  <p className="text-sm leading-snug">{t.message}</p>
                </div>
                <button onClick={() => dismissToast(t.id)} className="text-white/80 hover:text-white text-sm leading-none">
                  x
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
