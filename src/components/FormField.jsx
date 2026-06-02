import { useState } from 'react'

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  inputMode,
  maxLength,
  pattern,
  validationState,
  validationMessage = '',
  options = [],
  rows = 3,
  disabled = false,
  className = '',
  hideLabel = false,
  min
}) {
  const [touched, setTouched] = useState(false)

  const handleBlur = () => setTouched(true)

  const showValidation = touched && validationState
  const isValid = validationState === 'success'
  const isInvalid = validationState === 'error'

  const baseInputClass = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400 ${className}`
  
  const inputClass = `${baseInputClass} ${
    showValidation
      ? isValid
        ? 'border-green-500 focus:border-green-500'
        : isInvalid
        ? 'border-red-500 focus:border-red-500'
        : 'border-gray-200'
      : 'border-gray-200'
  }`

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={inputClass}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className={inputClass}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt, idx) => {
              const optionValue = typeof opt === 'object' ? opt.value : opt
              const optionLabel = typeof opt === 'object' ? opt.label : opt
              return (
                <option key={idx} value={optionValue}>
                  {optionLabel}
                </option>
              )
            })}
          </select>
        )

      default:
        return (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            inputMode={inputMode}
            maxLength={maxLength}
            pattern={pattern}
            min={min}
            disabled={disabled}
            className={inputClass}
          />
        )
    }
  }

  return (
    <div className="mb-3">
      {!hideLabel && (
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-1)' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {showValidation && validationMessage && (
        <p className={`text-xs mt-1 ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          {validationMessage}
        </p>
      )}
    </div>
  )
}
