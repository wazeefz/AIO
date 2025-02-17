import { defineStore } from 'pinia'
import crossfilter from 'crossfilter2'

export const useTalentStore = defineStore('talent', {
  state: () => {
    const talents = [
      {
        talent_id: 1, //id
        first_name: 'Damaris', //first
        last_name: 'Taib', //last
        email: 'd@gmail.com',
        phone: '123456789',
        job_title: 'Software Engineer', //title
        employment_type: 'FULL_TIME', //employment
        contract_duration: '', //contract
        remarks: '', //remark
        department_id: 1, // Assuming IT department has ID 1
        hire_date: '2023-01-01',
        basic_salary: 5000.00, //wage
        gender: 'FEMALE',
        date_of_birth: '1973-02-18', //dob
        marital_status: false, //marital
        total_experience_years: 8.5,
        career_preferences: '',
        availability_status: 'Available'
      },
      {
        talent_id: 2,
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.s@gmail.com',
        phone: '987654321',
        job_title: 'Frontend Developer',
        employment_type: 'FULL_TIME',
        contract_duration: '',
        remarks: '',
        department_id: 1,
        hire_date: '2023-02-01',
        basic_salary: 4800.00,
        gender: 'MALE',
        date_of_birth: '1990-05-15',
        marital_status: true,
        total_experience_years: 5.0,
        career_preferences: '',
        availability_status: 'Available'
      },
      // ... Continue updating the rest of the talents similarly
      {
        talent_id: 3,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.j@gmail.com',
        phone: '456789123',
        job_title: 'UX Designer',
        employment_type: 'PART_TIME',
        contract_duration: '',
        remarks: '',
        department_id: 2, // Assuming Design department has ID 2
        hire_date: '2023-03-01',
        basic_salary: 4200.00,
        gender: 'FEMALE',
        date_of_birth: '1988-11-30',
        marital_status: true,
        total_experience_years: 6.5,
        career_preferences: '',
        availability_status: 'Available'
      },
      // ... Continue with the rest of the talents
    ]

    const cf = crossfilter(talents)

    return {
      talents,
      people: cf,
    }
  },
})