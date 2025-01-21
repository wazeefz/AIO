// services/mockData.js
export const mockData = [
  {
    id: 1,
    title: 'Frontend Developer',
    skills: ['Javascript', 'HTML', 'CSS', 'Vue.js'],
    salary: 'RM10,000',
    role: 'Developer',
    company: 'Tech Corp',
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    skills: ['Adobe Photoshop', 'Figma', 'HTML', 'CSS'],
    salary: 'RM10,000',
    role: 'Designer',
    company: 'Design Studio',
  },
  {
    id: 3,
    title: 'Full Stack Developer',
    skills: ['Javascript', 'Python', 'MongoDB', 'Vue.js'],
    salary: 'RM15,000',
    role: 'Developer',
    company: 'StartUp Inc',
  },
  {
    id: 4,
    title: 'Frontend Engineer',
    skills: ['Javascript', 'HTML', 'CSS', 'Bootstrap'],
    salary: 'RM6,000',
    role: 'Developer',
    company: 'Web Solutions',
  },
  {
    id: 5,
    title: 'Creative Designer',
    skills: ['Adobe Photoshop', 'Illustrator', 'Figma'],
    salary: 'RM6,000',
    role: 'Designer',
    company: 'Creative Agency',
  },
]

// Filter function
export const filterData = (filters) => {
  return mockData.filter((item) => {
    // Check if all active filters match the item
    const matchesSkills =
      filters.skills.length === 0 ||
      filters.skills.every((skill) => item.skills.includes(skill))

    const matchesSalary =
      filters.salary.length === 0 || filters.salary.includes(item.salary)

    const matchesRole =
      filters.role.length === 0 || filters.role.includes(item.role)

    // Item must match all active filter criteria
    return matchesSkills && matchesSalary && matchesRole
  })
}
