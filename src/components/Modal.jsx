import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmOnClose = false,
  confirmCloseTitle = 'Abandonner les modifications ?',
  confirmCloseMessage = 'Des informations sont peut-etre en cours de saisie. Voulez-vous vraiment fermer ce formulaire ?',
}) {
  const [confirmClose, setConfirmClose] = useState(false)

  if (!isOpen) return null

  const requestClose = () => {
    if (confirmOnClose) {
      setConfirmClose(true)
      return
    }
    onClose()
  }

  const closeConfirmed = () => {
    setConfirmClose(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={requestClose} />
      <div className="relative w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={requestClose} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 md:p-5">{children}</div>
      </div>
      <ConfirmDialog
        isOpen={confirmClose}
        onConfirm={closeConfirmed}
        onCancel={() => setConfirmClose(false)}
        title={confirmCloseTitle}
        message={confirmCloseMessage}
        confirmLabel="Oui, abandonner"
        cancelLabel="Non"
        tone="warning"
      />
    </div>
  )
}
