const units = ['B/s', 'KB/s', 'MB/s']
export function parseDownloadRate(value, unitIndex = 0) {
  if (value < 1024) return `${value} ${units[unitIndex]}`
  value = (value / 1024).toFixed(1)
  return parseDownloadRate(value, ++unitIndex)
}

// [{ ... , probability: number }]
export function getRandomItem(items) {
  const total = items.reduce((total, item) => {
    return total + item.probability
  }, 0)
  const factor = Math.random() * total
  let threshold = 0

  for (let i = 0; i < items.length; i++) {
    threshold += items[i].probability
    if (threshold > factor) {
      return items[i]
    }
  }

  return null
}
