export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  tone = 'danger',
}) {
  if (!isOpen) return null
  const toneClasses = tone === 'warning'
    ? {
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700',
      }
    : tone === 'info'
    ? {
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
      }
    : {
        iconBg: 'bg-red-100',
        iconText: 'text-red-500',
        button: 'bg-red-500 hover:bg-red-600',
      }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className={`w-12 h-12 ${toneClasses.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <svg className={`w-6 h-6 ${toneClasses.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={tone === 'warning'
                ? 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
                : tone === 'info'
                ? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                : 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'} />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white ${toneClasses.button} rounded-lg transition-colors`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
