export function formatPhone(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback

  const raw = String(value).trim()
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('237') && digits.length === 12
    ? digits.slice(3)
    : digits

  if (/^6\d{8}$/.test(local)) {
    return `+237 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }

  return raw || fallback
}

export function formatPhoneList(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback

  return String(value)
    .split(/\s*\/\s*/)
    .map(phone => formatPhone(phone, ''))
    .filter(Boolean)
    .join(' / ') || fallback
}
