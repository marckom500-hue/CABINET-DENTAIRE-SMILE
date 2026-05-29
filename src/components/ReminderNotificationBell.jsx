import { useEffect, useState } from 'react'
import { useReminderNotifications } from '../hooks/useFailedReminders'

export default function ReminderNotificationBell() {
  const { notifications, unreadCount, markAsRead } = useReminderNotifications()
  const [isOpen, setIsOpen] = useState(false)

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
        return 'bg-red-50 border-red-200'
      case 'sms_retry':
        return 'bg-amber-50 border-amber-200'
      case 'sms_success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
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

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications SMS"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications SMS</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-600 mt-1">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 border-l-4 ${getColor(notification.type)} cursor-pointer hover:bg-opacity-75 transition-colors ${
                    !notification.lue ? 'border-l-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.lue) {
                      markAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{getIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                        {notification.type === 'sms_failed' && 'Échec SMS'}
                        {notification.type === 'sms_retry' && 'Renvoi en attente'}
                        {notification.type === 'sms_success' && 'SMS envoyé'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString('fr-CM')}
                      </p>
                    </div>
                    {!notification.lue && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="sticky bottom-0 bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
            <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
              Voir tous les rappels
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
