export function formatDateToString(value) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  const year = String(date.getFullYear())
  const month = ((date.getMonth() + 1) > 9 ? '' : '0') + (date.getMonth() + 1)
  const day = ((date.getDate()) > 9 ? '' : '0') + (date.getDate())
  return `${day}.${month}.${year}`
}

export function formatTimeToString(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  const hour = ((date.getHours()) > 9 ? '' : '0') + (date.getHours())
  const minute = ((date.getMinutes()) > 9 ? '' : '0') + (date.getMinutes())
  return `${hour}:${minute}`
}
