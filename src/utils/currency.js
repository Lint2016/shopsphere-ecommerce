const zarFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return '—'
  }

  return zarFormatter.format(amount)
}
