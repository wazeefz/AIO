export const categoryColors = {
  skills: 'blue-grey-darken-4',
  salary: 'light-green lighten-1',
  title: 'blue lighten-1',
  department: 'brown-lighten-2',
}

export function getColorForCategory(category) {
  return categoryColors[category] || 'grey'
}
