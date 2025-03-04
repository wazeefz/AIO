import { defineStore } from 'pinia'

const API_URL = 'http://localhost:8000'

export const useTalentResumeStore = defineStore('talentResume', {
  state: () => ({
    currentResumeId: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    // Submit complete employee info form by splitting it into sections for database storage
    async submitEmployeeInfo(formData) {
      this.isLoading = true
      this.error = null
      try {
        console.log('Starting talent submission process...')

        // Step 1: Create or update the talent profile (personal info)
        const personalInfo = {
          // Personal Info
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: this.formatDateForBackend(formData.dateOfBirth),
          age: formData.age,
          gender: formData.gender,
          marital_status: formData.maritalStatus === 'married', // Convert to boolean
          profile_pic: formData.profilePic,

          // Location fields
          current_country: formData.currentCountry,
          current_city: formData.currentCity,
          willing_to_relocate: formData.willingToRelocate || false,
          relocation_preferences: JSON.stringify(
            formData.relocationPreferences || []
          ),

          // Professional summary
          professional_summary: formData.summary || '',
          total_experience_years: formData.experience || 0,

          // Job details
          job_title: formData.jobTitle || '',
          position_level: formData.jobPosition || 'Entry Level',
          employment_type: formData.employmentType || 'fullTime',
          contract_duration: formData.contractDuration || null,
          employment_remarks: formData.employmentRemarks || '',
          department: formData.department || '',
          join_date: this.formatDateForBackend(formData.joinDate),

          // Salary
          basic_salary: parseFloat(formData.salary?.replace(/,/g, '')) || 0,

          // Assessment
          tech_skill: formData.assessment?.interview?.[0]?.rating || 0,
          soft_skill: formData.assessment?.interview?.[1]?.rating || 0,
          interview_remarks: formData.assessment?.interviewRemarks || '',
          assessment_projects: JSON.stringify(
            formData.assessment?.projects || []
          ),

          // Required fields with default values
          department_id: 1, // Default department ID
          availability_status: 'Available',
          career_preferences: formData.summary || '',
        }

        console.log('Prepared talent data:', personalInfo)

        // Create or update the talent in the database
        let talentId = this.currentResumeId
        let talentResponse

        if (talentId) {
          console.log(`Updating existing talent with ID: ${talentId}`)
          talentResponse = await fetch(`${API_URL}/talents/${talentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personalInfo),
          })
        } else {
          console.log('Creating new talent record')
          talentResponse = await fetch(`${API_URL}/talents/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personalInfo),
          })
        }

        if (!talentResponse.ok) {
          const errorText = await talentResponse.text()
          console.error('Talent API error:', errorText)
          throw new Error(
            `HTTP error! status: ${talentResponse.status}, details: ${errorText}`
          )
        }

        const talent = await talentResponse.json()
        talentId = talent.talent_id
        this.currentResumeId = talentId
        console.log(`Talent saved with ID: ${talentId}`)

        // Step 2: Store skills
        if (Array.isArray(formData.skills) && formData.skills.length > 0) {
          console.log(`Processing ${formData.skills.length} skills`)
          const formattedSkills = formData.skills.map((skill) => ({
            name: skill,
            proficiency: 3, // Default proficiency
            experience: 0, // Default experience
          }))
          await this.saveSkillsWithAssociation(talentId, formattedSkills)
        }

        // Step 3: Store education history
        if (
          Array.isArray(formData.education) &&
          formData.education.length > 0
        ) {
          console.log(
            `Processing ${formData.education.length} education entries`
          )
          const formattedEducation = formData.education.map((edu) => ({
            institution_name: edu.institution || edu.institutionName,
            qualification_type: edu.degree || edu.qualificationType,
            field_of_study: edu.fieldOfStudy || '',
            start_date: this.formatDateForBackend(edu.startDate),
            end_date: this.formatDateForBackend(edu.endDate),
            talent_id: talentId,
          }))
          await this.saveEducation(talentId, formattedEducation)
        }

        // Step 4: Store work experience
        if (
          Array.isArray(formData.experiences) &&
          formData.experiences.length > 0
        ) {
          console.log(
            `Processing ${formData.experiences.length} experience entries`
          )
          const formattedExperiences = formData.experiences.map((exp) => ({
            company_name: exp.company || exp.companyName,
            job_title: exp.title || exp.jobTitle,
            location: exp.location || '',
            employment_type: exp.employmentType || 'fullTime',
            start_date: this.formatDateForBackend(exp.startDate),
            end_date: this.formatDateForBackend(exp.endDate),
            is_current_job: exp.isCurrent || false,
            description: exp.description || '',
            key_achievements: exp.achievements || [],
            talent_id: talentId,
          }))
          await this.saveExperiences(talentId, formattedExperiences)
        }

        // Step 5: Store certifications
        if (
          Array.isArray(formData.certifications) &&
          formData.certifications.length > 0
        ) {
          console.log(
            `Processing ${formData.certifications.length} certification entries`
          )
          const formattedCertifications = formData.certifications.map(
            (cert) => ({
              certification_name: cert.name || cert.certificationName,
              issuing_organization: cert.issuer || cert.issuingOrganization,
              credential_id: cert.credentialId || null,
              start_date: this.formatDateForBackend(
                cert.issueDate || cert.startDate
              ),
              has_expiration_date: !!cert.expirationDate,
              expiration_date: cert.expirationDate
                ? this.formatDateForBackend(cert.expirationDate)
                : null,
              talent_id: talentId,
            })
          )
          await this.saveCertifications(talentId, formattedCertifications)
        }

        console.log('Talent submission process completed successfully')
        return talentId
      } catch (error) {
        this.error = error.message
        console.error('Error submitting employee information:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async saveSkillsWithAssociation(talentId, skills) {
      console.log('Starting skill association process')
      // First remove existing talent-skill associations
      await this.removeAllTalentSkills(talentId)

      // For each skill
      for (const skill of skills) {
        try {
          let skillId

          // Check if the skill exists by name
          console.log(`Checking if skill "${skill.name}" exists`)
          const searchResponse = await fetch(
            `${API_URL}/skills/?skill_name=${encodeURIComponent(skill.name)}`
          )
          let searchResults = []

          if (searchResponse.ok) {
            searchResults = await searchResponse.json()
          }

          if (searchResults && searchResults.length > 0) {
            // Skill exists
            skillId = searchResults[0].skill_id
            console.log(`Found existing skill with ID: ${skillId}`)
          } else {
            // Create the skill since it doesn't exist
            console.log(`Creating new skill: ${skill.name}`)
            const createSkillResponse = await fetch(`${API_URL}/skills/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                skill_name: skill.name,
                description: skill.description || '',
                category: skill.category || 'Other',
              }),
            })

            if (!createSkillResponse.ok) {
              const errorText = await createSkillResponse.text()
              throw new Error(
                `Error creating skill: ${createSkillResponse.status}, details: ${errorText}`
              )
            }

            const newSkill = await createSkillResponse.json()
            skillId = newSkill.skill_id
            console.log(`Created new skill with ID: ${skillId}`)
          }

          // Now create the talent-skill association
          console.log(
            `Creating talent-skill association for talent ${talentId} and skill ${skillId}`
          )
          const associationResponse = await fetch(`${API_URL}/talentskills/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              talent_id: talentId,
              skill_id: skillId,
              proficiency_level: skill.proficiency || 3, // Default to medium proficiency if not provided
              years_of_experience: skill.experience || 0,
            }),
          })

          if (!associationResponse.ok) {
            const errorText = await associationResponse.text()
            throw new Error(
              `Error creating talent-skill association: ${associationResponse.status}, details: ${errorText}`
            )
          }

          console.log(
            `Successfully associated skill ${skillId} with talent ${talentId}`
          )
        } catch (error) {
          console.error(`Error processing skill ${skill.name}:`, error)
          // Continue with other skills even if one fails
        }
      }
    },

    async removeAllTalentSkills(talentId) {
      try {
        console.log(
          `Removing existing talent-skill associations for talent ${talentId}`
        )
        // Get all existing talent-skill associations
        const response = await fetch(
          `${API_URL}/talentskills/talent/${talentId}`
        )

        if (!response.ok) {
          if (response.status === 404) {
            // No skills found, nothing to delete
            console.log('No existing talent-skill associations found')
            return
          }
          const errorText = await response.text()
          throw new Error(
            `Error getting talent skills: ${response.status}, details: ${errorText}`
          )
        }

        const skills = await response.json()
        console.log(
          `Found ${skills.length} existing talent-skill associations to remove`
        )

        // Delete each association
        for (const skill of skills) {
          console.log(`Removing association for skill ${skill.skill_id}`)
          const deleteResponse = await fetch(
            `${API_URL}/talentskills/talent/${talentId}/skill/${skill.skill_id}`,
            {
              method: 'DELETE',
            }
          )

          if (!deleteResponse.ok) {
            console.warn(
              `Warning: Failed to delete talent-skill association for skill ${skill.skill_id}`
            )
          }
        }

        console.log(
          'Successfully removed all existing talent-skill associations'
        )
      } catch (error) {
        console.error('Error removing talent skills:', error)
        // Continue even if there's an error
      }
    },

    async saveEducation(talentId, educationList) {
      console.log('Starting education save process')
      // For each education entry, create or update
      const savedEducations = []

      for (const edu of educationList) {
        try {
          // Check if this education entry has an ID (for updates)
          const method = edu.education_id ? 'PUT' : 'POST'
          const url = edu.education_id
            ? `${API_URL}/education/${edu.education_id}`
            : `${API_URL}/education/`

          console.log(`${method} education to ${url}`)

          // Map form data to database fields
          const educationData = {
            talent_id: talentId,
            institution_name: edu.institution || edu.institutionName,
            qualification_type: edu.degree || edu.qualificationType,
            field_of_study: edu.field_of_study,
            start_date: this.formatDateForBackend(edu.start_date),
            end_date: this.formatDateForBackend(edu.end_date),
          }

          console.log('Education data:', educationData)

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(educationData),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
              `Error saving education entry: ${response.status}, details: ${errorText}`
            )
          }

          const savedEdu = await response.json()
          savedEducations.push(savedEdu)
          console.log(`Education saved with ID: ${savedEdu.education_id}`)
        } catch (error) {
          console.error('Error saving education entry:', error)
          // Continue with other entries even if one fails
        }
      }

      // Remove educations that are no longer in the list
      try {
        console.log('Checking for education entries to remove')
        const existingResponse = await fetch(
          `${API_URL}/education/talent/${talentId}`
        )
        if (existingResponse.ok) {
          const existingEducations = await existingResponse.json()
          console.log(
            `Found ${existingEducations.length} existing education entries`
          )

          // Find IDs that are in existing but not in the new list
          const savedIds = savedEducations.map((edu) => edu.education_id)
          const toDelete = existingEducations.filter(
            (edu) => !savedIds.includes(edu.education_id)
          )

          console.log(`Found ${toDelete.length} education entries to remove`)

          // Delete each one
          for (const edu of toDelete) {
            console.log(`Deleting education entry ${edu.education_id}`)
            await fetch(`${API_URL}/education/${edu.education_id}`, {
              method: 'DELETE',
            })
          }
        }
      } catch (error) {
        console.error('Error cleaning up old education entries:', error)
      }

      return savedEducations
    },

    async saveExperiences(talentId, experiencesList) {
      console.log('Starting experiences save process')
      // For each experience entry, create or update
      const savedExperiences = []

      for (const exp of experiencesList) {
        try {
          // Check if this experience entry has an ID (for updates)
          const method = exp.experience_id ? 'PUT' : 'POST'
          const url = exp.experience_id
            ? `${API_URL}/experience/${exp.experience_id}`
            : `${API_URL}/experience/`

          console.log(`${method} experience to ${url}`)

          // Map form data to database fields
          const experienceData = {
            talent_id: talentId,
            company_name: exp.company || exp.companyName,
            job_title: exp.job_title,
            location: exp.location,
            employment_type: exp.employment_type,
            start_date: this.formatDateForBackend(exp.start_date),
            end_date: this.formatDateForBackend(exp.end_date),
            is_current_job: exp.is_current_job,
            description: exp.description,
            key_achievements: exp.key_achievements || [],
          }

          console.log('Experience data:', experienceData)

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(experienceData),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
              `Error saving experience entry: ${response.status}, details: ${errorText}`
            )
          }

          const savedExp = await response.json()
          savedExperiences.push(savedExp)
          console.log(`Experience saved with ID: ${savedExp.experience_id}`)
        } catch (error) {
          console.error('Error saving experience entry:', error)
          // Continue with other entries even if one fails
        }
      }

      // Remove experiences that are no longer in the list
      try {
        console.log('Checking for experience entries to remove')
        const existingResponse = await fetch(
          `${API_URL}/experience/talent/${talentId}`
        )
        if (existingResponse.ok) {
          const existingExperiences = await existingResponse.json()
          console.log(
            `Found ${existingExperiences.length} existing experience entries`
          )

          // Find IDs that are in existing but not in the new list
          const savedIds = savedExperiences.map((exp) => exp.experience_id)
          const toDelete = existingExperiences.filter(
            (exp) => !savedIds.includes(exp.experience_id)
          )

          console.log(`Found ${toDelete.length} experience entries to remove`)

          // Delete each one
          for (const exp of toDelete) {
            console.log(`Deleting experience entry ${exp.experience_id}`)
            await fetch(`${API_URL}/experience/${exp.experience_id}`, {
              method: 'DELETE',
            })
          }
        }
      } catch (error) {
        console.error('Error cleaning up old experience entries:', error)
      }

      return savedExperiences
    },

    async saveCertifications(talentId, certificationsList) {
      console.log('Starting certifications save process')
      // For each certification entry, create or update
      const savedCertifications = []

      for (const cert of certificationsList) {
        try {
          // Check if this certification entry has an ID (for updates)
          const method = cert.certification_id ? 'PUT' : 'POST'
          const url = cert.certification_id
            ? `${API_URL}/certifications/${cert.certification_id}`
            : `${API_URL}/certifications/`

          console.log(`${method} certification to ${url}`)

          // Map form data to database fields
          const certificationData = {
            talent_id: talentId,
            certification_name: cert.certification_name,
            issuing_organization: cert.issuing_organization,
            credential_id: cert.credential_id,
            start_date: this.formatDateForBackend(cert.start_date),
            has_expiration_date: !!cert.has_expiration_date,
            expiration_date: cert.has_expiration_date
              ? this.formatDateForBackend(cert.expiration_date)
              : null,
          }

          console.log('Certification data:', certificationData)

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(certificationData),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
              `Error saving certification entry: ${response.status}, details: ${errorText}`
            )
          }

          const savedCert = await response.json()
          savedCertifications.push(savedCert)
          console.log(
            `Certification saved with ID: ${savedCert.certification_id}`
          )
        } catch (error) {
          console.error('Error saving certification entry:', error)
          // Continue with other entries even if one fails
        }
      }

      // Remove certifications that are no longer in the list
      try {
        console.log('Checking for certification entries to remove')
        const existingResponse = await fetch(
          `${API_URL}/certifications/talent/${talentId}`
        )
        if (existingResponse.ok) {
          const existingCertifications = await existingResponse.json()
          console.log(
            `Found ${existingCertifications.length} existing certification entries`
          )

          // Find IDs that are in existing but not in the new list
          const savedIds = savedCertifications.map(
            (cert) => cert.certification_id
          )
          const toDelete = existingCertifications.filter(
            (cert) => !savedIds.includes(cert.certification_id)
          )

          console.log(
            `Found ${toDelete.length} certification entries to remove`
          )

          // Delete each one
          for (const cert of toDelete) {
            console.log(`Deleting certification entry ${cert.certification_id}`)
            await fetch(`${API_URL}/certifications/${cert.certification_id}`, {
              method: 'DELETE',
            })
          }
        }
      } catch (error) {
        console.error('Error cleaning up old certification entries:', error)
      }

      return savedCertifications
    },

    // Helper function to format dates for the backend
    formatDateForBackend(dateString) {
      if (!dateString) return null

      try {
        // Handle different date formats
        let date
        if (dateString.includes('/')) {
          // Format: YYYY/MM/DD
          const [year, month, day] = dateString.split('/')
          date = new Date(year, month - 1, day)
        } else if (dateString.includes('-')) {
          // Format: YYYY-MM-DD
          date = new Date(dateString)
        } else {
          // Try to parse as is
          date = new Date(dateString)
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateString)
          return null
        }

        // Format as ISO string (backend expects ISO format)
        return date.toISOString().split('T')[0]
      } catch (error) {
        console.error('Error formatting date:', error)
        return null
      }
    },

    // Retrieve full resume data
    async getFullResumeData(talentId) {
      this.isLoading = true
      try {
        console.log(`Fetching talent data for ID: ${talentId}`)
        // Get basic talent info
        const talentResponse = await fetch(`${API_URL}/talents/${talentId}`)

        if (!talentResponse.ok) {
          const errorText = await talentResponse.text()
          throw new Error(
            `HTTP error! status: ${talentResponse.status}, details: ${errorText}`
          )
        }

        const talentData = await talentResponse.json()
        console.log('Talent data retrieved:', talentData)

        // Get skills
        console.log('Fetching talent skills')
        const skillsResponse = await fetch(
          `${API_URL}/talentskills/talent/${talentId}`
        )
        let skills = []
        if (skillsResponse.ok) {
          const talentSkills = await skillsResponse.json()
          console.log(`Retrieved ${talentSkills.length} skills`)

          // Map the talent-skill data to the format expected by the form
          skills = await Promise.all(
            talentSkills.map(async (ts) => {
              // Fetch the skill details
              const skillResponse = await fetch(
                `${API_URL}/skills/${ts.skill_id}`
              )
              let skillData = {
                skill_name: 'Unknown Skill',
                description: '',
                category: 'Other',
              }

              if (skillResponse.ok) {
                skillData = await skillResponse.json()
              }

              return {
                id: ts.skill_id,
                name: skillData.skill_name,
                description: skillData.description || '',
                category: skillData.category || 'Other',
                proficiency: ts.proficiency_level,
                experience: ts.years_of_experience,
              }
            })
          )
        }

        // Get education
        console.log('Fetching education history')
        const educationResponse = await fetch(
          `${API_URL}/education/talent/${talentId}`
        )
        let education = []
        if (educationResponse.ok) {
          const eduData = await educationResponse.json()
          console.log(`Retrieved ${eduData.length} education entries`)

          // Map the education data to the format expected by the form
          education = eduData.map((edu) => ({
            education_id: edu.education_id,
            institution: edu.institution_name,
            degree: edu.qualification_type,
            fieldOfStudy: edu.field_of_study,
            startDate: this.formatDateForFrontend(edu.start_date),
            endDate: this.formatDateForFrontend(edu.end_date),
          }))
        }

        // Get experiences
        console.log('Fetching work experience')
        const experiencesResponse = await fetch(
          `${API_URL}/experience/talent/${talentId}`
        )
        let experiences = []
        if (experiencesResponse.ok) {
          const expData = await experiencesResponse.json()
          console.log(`Retrieved ${expData.length} experience entries`)

          // Map the experience data to the format expected by the form
          experiences = expData.map((exp) => ({
            experience_id: exp.experience_id,
            company: exp.company_name,
            title: exp.job_title,
            location: exp.location,
            employmentType: exp.employment_type,
            startDate: this.formatDateForFrontend(exp.start_date),
            endDate: this.formatDateForFrontend(exp.end_date),
            isCurrent: exp.is_current_job,
            description: exp.description,
            achievements: exp.key_achievements || [],
          }))
        }

        // Get certifications
        console.log('Fetching certifications')
        const certificationsResponse = await fetch(
          `${API_URL}/certifications/talent/${talentId}`
        )
        let certifications = []
        if (certificationsResponse.ok) {
          const certData = await certificationsResponse.json()
          console.log(`Retrieved ${certData.length} certification entries`)

          // Map the certification data to the format expected by the form
          certifications = certData.map((cert) => ({
            certification_id: cert.certification_id,
            name: cert.certification_name,
            issuer: cert.issuing_organization,
            credentialId: cert.credential_id,
            issueDate: this.formatDateForFrontend(cert.start_date),
            expirationDate: cert.has_expiration_date
              ? this.formatDateForFrontend(cert.expiration_date)
              : null,
          }))
        }

        // Combine all data and map backend field names to frontend field names
        const resumeData = {
          // Personal Info
          firstName: talentData.first_name,
          lastName: talentData.last_name,
          email: talentData.email,
          phone: talentData.phone,
          dateOfBirth: this.formatDateForFrontend(talentData.date_of_birth),
          age: talentData.age,
          gender: talentData.gender,
          maritalStatus: talentData.marital_status ? 'married' : 'single',

          // Location
          currentCountry: talentData.current_country,
          currentCity: talentData.current_city,
          willingToRelocate: talentData.willing_to_relocate,

          // Professional Summary
          summary: talentData.professional_summary,
          experience: talentData.total_experience_years,

          // Job Details
          jobTitle: talentData.job_title,
          jobPosition: talentData.position_level,
          employmentType: talentData.employment_type,

          // Salary
          salary: talentData.basic_salary?.toString() || '',

          // Assessment
          assessment: {
            interview: [
              { rating: talentData.tech_skill || 0 }, // Technical Skills
              { rating: talentData.soft_skill || 0 }, // Soft Skills
            ],
            interviewRemarks: talentData.interview_remarks || '',
            projects: [],
          },

          // Arrays for sections
          skills,
          education,
          experiences,
          certifications,
        }

        console.log('Resume data compiled successfully')
        this.currentResumeId = talentId
        return resumeData
      } catch (error) {
        this.error = error.message
        console.error('Error fetching full resume data:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Helper function to format dates for the frontend
    formatDateForFrontend(dateString) {
      if (!dateString) return ''

      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return ''

        // Format as YYYY/MM/DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}/${month}/${day}`
      } catch (error) {
        console.error('Error formatting date:', error)
        return ''
      }
    },

    // Clear current resume data
    clearCurrentResume() {
      this.currentResumeId = null
      this.error = null
    },
  },
})
