// All employees in the company
export const employeesData = [
  {
    id: 101,
    name: 'John Doe',
    title: 'Frontend Developer',
    skills: ['JavaScript', 'HTML', 'CSS', 'Vue.js'],
    salary: 'RM10,000',
    department: 'Developer',
    employment: 'Full Time',
  },
  {
    id: 102,
    name: 'Jane Smith',
    title: 'UI/UX Designer',
    skills: ['Adobe Photoshop', 'Figma', 'HTML', 'CSS'],
    salary: 'RM10,000',
    department: 'Designer',
    employment: 'External',
  },
  {
    id: 103,
    name: 'Michael Johnson',
    title: 'Full Stack Developer',
    skills: ['JavaScript', 'Python', 'MongoDB', 'Vue.js'],
    salary: 'RM15,000',
    department: 'Developer',
    employment: 'Part Time',
  },
  {
    id: 201,
    name: 'Emily Davis',
    title: 'Frontend Engineer',
    skills: ['JavaScript', 'HTML', 'CSS', 'Bootstrap'],
    salary: 'RM6,000',
    department: 'Developer',
    employment: 'Intern',
  },
  {
    id: 202,
    name: 'Sarah Wilson',
    title: 'Creative Designer',
    skills: ['Adobe Photoshop', 'Illustrator', 'Figma'],
    salary: 'RM6,000',
    department: 'Designer',
    employment: 'Contractual',
  },
]

// Project specific data
export const projectsData = [
  {
    id: 1,
    projectName: 'Project Alpha',
    description: 'Frontend Development Project',
    status: 'Active',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    team: [101, 102, 103], // Reference to employee IDs
  },
  {
    id: 2,
    projectName: 'Project Beta',
    description: 'UI/UX Design Project',
    status: 'Active',
    startDate: '2023-06-01',
    endDate: '2024-06-01',
    team: [201, 202],
  },
]

// Keep the original mockData export for backward compatibility
export const mockData = employeesData

// Optional: Add filterData function from old code
export const filterData = (filters) => {
  return mockData.filter((item) => {
    const matchesSkills =
      filters.skills.length === 0 ||
      filters.skills.every((skill) => item.skills.includes(skill))

    const matchesSalary =
      filters.salary.length === 0 || filters.salary.includes(item.salary)

    const matchesTitle =
      filters.title.length === 0 || filters.title.includes(item.title)

    const matchesDepartment =
      filters.department.length === 0 ||
      filters.department.includes(item.department)

    return matchesSkills && matchesSalary && matchesTitle && matchesDepartment
  })
}
