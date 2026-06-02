import { useState } from 'react'
import { useDatabaseNotifications } from '../hooks/useDatabaseNotifications'

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useDatabaseNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        title="Notifications"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay pour mobile/tablet - fermer au clic */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Desktop dropdown */}
          <div className="hidden md:block absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            <NotificationsList
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              deleteNotification={deleteNotification}
            />
          </div>

          {/* Mobile/Tablet modal */}
          <div className="md:hidden fixed inset-0 z-50 flex flex-col">
            <div className="flex-1 overflow-hidden" />
            <div className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
              {/* Header avec bouton fermer */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content scrollable */}
              <div className="overflow-y-auto flex-1">
                <NotificationsList
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                  markAllAsRead={markAllAsRead}
                  deleteNotification={deleteNotification}
                  isMobile
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Composant réutilisable pour afficher la liste
function NotificationsList({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  isMobile = false,
}) {
  const getNotificationStyle = (type) => {
    const styles = {
      rdv: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', dot: 'bg-teal-500' },
      patient: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500' },
      facture: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
      stock: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
      system: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', dot: 'bg-gray-500' },
    }
    return styles[type] || styles.system
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <>
      {/* Header avec bouton marquer tout comme lu */}
      {unreadCount > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200 p-4 flex-shrink-0 sticky top-0">
          <button
            onClick={markAllAsRead}
            className="text-sm text-teal-700 hover:text-teal-900 font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Marquer {unreadCount} comme lu
          </button>
        </div>
      )}

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-sm">Aucune notification pour le moment</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map(notif => {
            const style = getNotificationStyle(notif.type)
            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 cursor-pointer transition-all active:scale-95 ${
                  notif.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-teal-50'
                } ${style.bg}`}
              >
                <div className="flex gap-3">
                  {/* Indicateur de type */}
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${style.dot}`} />

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    {notif.title && (
                      <p className={`text-sm font-semibold ${style.text}`}>
                        {notif.title}
                      </p>
                    )}
                    <p className={`text-sm leading-relaxed ${
                      notif.read ? 'text-gray-600' : 'font-medium text-gray-900'
                    }`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatTime(notif.created_at)}
                    </p>
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notif.id)
                    }}
                    className="text-gray-300 hover:text-red-500 flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors"
                    aria-label="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
