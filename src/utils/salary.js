// utils/salary.js (not used atm)
export function parseSalaryRange(range) {
  if (range.includes('-')) {
    const [min, max] = range
      .replace(/[^\d-]/g, '')
      .split('-')
      .map(Number)
    return { min, max }
  }
  if (range.includes('+')) {
    return { min: parseInt(range.replace(/[^\d]/g, '')), max: Infinity }
  }
  if (range.startsWith('Up to')) {
    return { min: 0, max: parseInt(range.replace(/[^\d]/g, '')) }
  }
  return { min: 0, max: Infinity }
}

export function isSalaryInRange(salary, range) {
  const salaryValue = parseInt(salary.replace(/[^\d]/g, ''))
  const { min, max } = parseSalaryRange(range)
  return salaryValue >= min && salaryValue <= max
}
