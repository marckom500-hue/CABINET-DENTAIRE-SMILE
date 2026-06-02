import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReminderNotifications } from '../hooks/useFailedReminders'

export default function ReminderNotificationBell() {
  const { notifications, unreadCount, markAsRead } = useReminderNotifications()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        title="Notifications SMS"
        aria-label="Notifications SMS"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Desktop dropdown */}
          <div className="hidden md:block absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            <RemindersList
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              onViewAll={() => {
                setIsOpen(false)
                navigate('/rappels')
              }}
            />
          </div>

          {/* Mobile modal */}
          <div className="md:hidden fixed inset-0 z-50 flex flex-col">
            <div className="flex-1 overflow-hidden" />
            <div className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="font-semibold text-gray-900 text-lg">Notifications SMS</h3>
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

              {/* Content */}
              <div className="overflow-y-auto flex-1">
                <RemindersList
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                  onViewAll={() => {
                    setIsOpen(false)
                    navigate('/rappels')
                  }}
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

// Composant réutilisable
function RemindersList({ notifications, unreadCount, markAsRead, onViewAll, isMobile = false }) {
  const getIcon = (type) => {
    switch (type) {
      case 'sms_failed':
        return '❌'
      case 'sms_retry':
        return '⏳'
      case 'sms_success':
        return '✅'
      default:
        return '📬'
    }
  }

  const getColor = (type) => {
    switch (type) {
      case 'sms_failed':
        return 'bg-red-50'
      case 'sms_retry':
        return 'bg-amber-50'
      case 'sms_success':
        return 'bg-green-50'
      default:
        return 'bg-gray-50'
    }
  }

  const getTextColor = (type) => {
    switch (type) {
      case 'sms_failed':
        return 'text-red-700'
      case 'sms_retry':
        return 'text-amber-700'
      case 'sms_success':
        return 'text-green-700'
      default:
        return 'text-gray-700'
    }
  }

  const getDotColor = (type) => {
    switch (type) {
      case 'sms_failed':
        return 'bg-red-500'
      case 'sms_retry':
        return 'bg-amber-500'
      case 'sms_success':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 p-4 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 text-base md:text-sm">Notifications SMS</h3>
        {unreadCount > 0 && (
          <p className="text-xs text-gray-600 mt-1">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Liste */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-sm">Aucune notification SMS</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.lue) {
                  markAsRead(notification.id)
                }
              }}
              className={`p-4 md:p-3 cursor-pointer transition-all active:scale-95 border-l-4 ${
                !notification.lue
                  ? 'border-l-orange-500 bg-orange-50 hover:bg-orange-100'
                  : `border-l-gray-200 ${getColor(notification.type)} hover:bg-opacity-75`
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl md:text-lg flex-shrink-0">{getIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm md:text-xs font-semibold ${getTextColor(notification.type)}`}>
                    {notification.type === 'sms_failed' && 'Échec SMS'}
                    {notification.type === 'sms_retry' && 'Renvoi en attente'}
                    {notification.type === 'sms_success' && 'SMS envoyé'}
                  </p>
                  <p className="text-sm md:text-xs text-gray-700 mt-1 leading-relaxed md:leading-snug">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 md:mt-1">
                    {new Date(notification.created_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notification.lue && (
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 md:mt-0.5 ${getDotColor(notification.type)}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer avec bouton "Voir tous les rappels" */}
      <div className="sticky bottom-0 bg-gradient-to-r from-orange-50 to-orange-100 border-t border-orange-200 px-4 py-3 flex-shrink-0">
        <button
          onClick={onViewAll}
          className="w-full text-sm font-medium text-orange-700 hover:text-orange-900 hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 py-2 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Voir tous les rappels
        </button>
      </div>
    </>
  )
}
