// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import api from '../tools/api'
// import _ from 'lodash'

// export const useBookStore = defineStore('mainStore', () => {
//   // State
//   const workdayTypes = ref([])
//   const companies = ref([])
//   const projects = ref([])
//   const jobs = ref([])
//   const usernames = ref([])

//   // Getters
//   const workdayTypesGetter = computed(() => workdayTypes.value)
//   const companiesGetter = computed(() => companies.value)
//   const projectsGetter = computed(() => projects.value)
//   const jobsGetter = computed(() => jobs.value)
//   const usernamesGetter = computed(() => usernames.value)

//   // Actions
//   async function setWorkdayTypes() {
//     const data = await api.book.fetchWorkdaysTypes()
//     if (!data) return false
//     workdayTypes.value = _.keyBy(data, 'id')
//     return true
//   }

//   async function setProjects() {
//     const data = await api.book.fetchProjects()
//     if (!data) return false
//     projects.value = _.keyBy(data, 'id')
//     return true
//   }

//   async function setCompanies() {
//     const data = await api.book.fetchCompanies()
//     if (!data) return false
//     companies.value = _.keyBy(data, 'id')
//     return true
//   }

//   async function setJobs() {
//     const data = await api.book.fetchJobs()
//     if (!data) return false
//     jobs.value = _.keyBy(data, 'id')
//     return true
//   }

//   async function setUsernames() {
//     const data = await api.book.fetchUsernames()
//     console.log(data)
//     if (!data) return false
//     usernames.value = data
//     return true
//   }

//   // Return everything
//   return {
//     workdayTypes,
//     companies,
//     projects,
//     jobs,
//     usernames,
//     workdayTypesGetter,
//     companiesGetter,
//     projectsGetter,
//     jobsGetter,
//     usernamesGetter,
//     setWorkdayTypes,
//     setProjects,
//     setCompanies,
//     setJobs,
//     setUsernames
//   }
// })

// stores/book.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import _ from 'lodash'
import { api } from '../services/api'
import type {
  WorkdayType,
  Company,
  Project,
  Job,
  Username
} from '../types/store.types'

export const useBookStore = defineStore('mainStore', () => {
  // State
  const workdayTypes = ref<Record<number, WorkdayType>>({})
  const companies = ref<Record<number, Company>>({})
  const projects = ref<Record<number, Project>>({})
  const jobs = ref<Record<number, Job>>({})
  const usernames = ref<Username[]>([])

  // Getters
  const workdayTypesGetter = computed((): Record<number, WorkdayType> => workdayTypes.value)
  const companiesGetter = computed((): Record<number, Company> => companies.value)
  const projectsGetter = computed((): Record<number, Project> => projects.value)
  const jobsGetter = computed((): Record<number, Job> => jobs.value)
  const usernamesGetter = computed((): Username[] => usernames.value)

  // Actions
  async function setWorkdayTypes(): Promise<boolean> {
    try {
      const data = await api.book.fetchWorkdayTypes()
      if (!data.length) return false
      workdayTypes.value = _.keyBy(data, 'id')
      return true
    } catch (error) {
      console.error('Error setting workday types:', error)
      return false
    }
  }

  async function setProjects(): Promise<boolean> {
    try {
      const data = await api.book.fetchProjects()
      if (!data.length) return false
      projects.value = _.keyBy(data, 'id')
      return true
    } catch (error) {
      console.error('Error setting projects:', error)
      return false
    }
  }

  async function setCompanies(): Promise<boolean> {
    try {
      const data = await api.book.fetchCompanies()
      if (!data.length) return false
      companies.value = _.keyBy(data, 'id')
      return true
    } catch (error) {
      console.error('Error setting companies:', error)
      return false
    }
  }

  async function setJobs(): Promise<boolean> {
    try {
      const data = await api.book.fetchJobs()
      if (!data.length) return false
      jobs.value = _.keyBy(data, 'id')
      return true
    } catch (error) {
      console.error('Error setting jobs:', error)
      return false
    }
  }

  async function setUsernames(): Promise<boolean> {
    try {
      const data = await api.book.fetchUsernames()
      console.log(data)
      if (!data.length) return false
      usernames.value = data
      return true
    } catch (error) {
      console.error('Error setting usernames:', error)
      return false
    }
  }

  return {
    // State
    workdayTypes,
    companies,
    projects,
    jobs,
    usernames,

    // Getters
    workdayTypesGetter,
    companiesGetter,
    projectsGetter,
    jobsGetter,
    usernamesGetter,

    // Actions
    setWorkdayTypes,
    setProjects,
    setCompanies,
    setJobs,
    setUsernames
  }
})
