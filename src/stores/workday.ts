// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import _ from 'lodash'
// import api from '../tools/api'
// import type { WorkDay, WorkdaysState } from 'src/types/AllTypes'

// export const useWorkdayStore = defineStore('workdayStore', () => {
//   // State
//   const workdays = ref<WorkdaysState>({})
//   const today = ref<WorkDay | null>(null)
//   const month = ref<number>(new Date().getMonth() + 1)
//   const year = ref<number>(new Date().getFullYear())
//   const workTime = ref(null)
//   const calendarRows = ref([])
//   const generalCalendarRows = ref([])

//   // Getters
//   const workdaysGetter = computed((): WorkdaysState => {console.log(workdays.value); return workdays.value})
//   const todayGetter = computed((): WorkDay | null  => {console.log(today.value); return today.value})
//   const workTimeGetter = computed(() => {console.log(workTime.value); return workTime.value})
//   const calendarRowsGetter = computed(() => {
//     calendarRows.value.forEach(month => {
//       let sum = 0
//       for (let day = 1; day <= 31; day++) {
//         if ('type' in month[day]) {
//           const dType = month[day].user_type || month[day].type
//           sum += dType.special === 'W'
//             ? month[day].hours + dType.compensation - (month[day].hours + dType.compensation > 0.5 ? 0.5 : 0)
//             : month[day].hours + dType.compensation
//         }
//       }
//       month.sum = sum
//     })
//     console.log(calendarRows.value)
//     return calendarRows.value
//   })
//   const yearGetter = computed(() => {console.log(year.value); return year.value})
//   const monthGetter = computed(() => {console.log(month.value); return month.value})
//   const generalCalendarRowsGetter = computed(() => {console.log(generalCalendarRows.value); return generalCalendarRows.value})

//   // Actions
//   async function setWorkdays() {
//     const data = await api.workday.fetchWorkdays()
//     workdays.value = data
//     console.log(data)
//     updateCalendarRows(data)
//     return true
//   }

//   async function setGeneralCalendar() {
//     const data = await api.workday.fetchGeneralCalendar(false)
//     updateGeneralCalendarRows(data)
//     return true
//   }

//   async function updateWorkday(workDayId) {
//     const workday = await api.workday.getWorkday(workDayId)
//     updateCalendarRows([workday])
//     updateGeneralCalendarRows([workday])
//     updateWorkdays(workday)
//     return true
//   }

//   async function setToday() {
//     const data = await api.workday.fetchToday()
//     today.value = data[0]
//     console.log(data[0])
//     return true
//   }

//   async function setWorkTime() {
//     const data = await api.workday.fetchWorkTime()
//     workTime.value = data
//     console.log(data)
//     return true
//   }

//   // Mutations (as separate functions)
//   function updateCalendarRows(workdaysData) {
//     const rows = []
//     const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
//     const toDayDate = new Date()

//     months.forEach((monthName, index) => {
//       const tmp = { month: monthName, monthNum: index + 1 }
//       const maxDays = 33 - new Date(year.value, index, 33).getDate()
//       for (let i = 0; i < 31; i++) {
//         tmp[String(i + 1)] = {
//           slug: i + 1 > maxDays ? 'x' : '',
//           day: new Date(year.value, index, i + 1),
//           today: year.value === toDayDate.getFullYear() && index === toDayDate.getMonth() && i + 1 === toDayDate.getDate(),
//           color: '#000000',
//           background_color: '#ffffff'
//         }
//         const day = workdaysData[`${index + 1}.${i + 1}`]
//         if (day) {
//           const dType = day.user_type || day.type
//           tmp[String(i + 1)] = {
//             ...tmp[String(i + 1)],
//             slug: dType.slug ? (day.hours ? `${dType.slug} (${day.hours})` : dType.slug) : day.hours,
//             color: dType.color,
//             background_color: dType.background_color,
//             ...day
//           }
//         }
//       }
//       rows.push(tmp)
//     })
//     calendarRows.value = rows
//   }

//   function updateGeneralCalendarRows(workdaysData) {
//     const rows = []
//     const usernames = _.map(workdaysData.usernames, 'name')
//     const workdaysByUser = _.keyBy(workdaysData.workdays, (val) => `${val.user_name}.${new Date(val.date).getDate()}`)
//     const toDayDate = new Date()

//     usernames.forEach((username, index) => {
//       const tmp = { username, usernameNum: index + 1 }
//       const maxDays = 33 - new Date(year.value, month.value - 1, 33).getDate()
//       let sum = 0
//       let online = false

//       for (let i = 0; i < 31; i++) {
//         tmp[String(i + 1)] = {
//           slug: i + 1 > maxDays ? 'x' : '',
//           day: new Date(year.value, month.value - 1, i + 1),
//           today: year.value === toDayDate.getFullYear() && month.value === toDayDate.getMonth() + 1 && i + 1 === toDayDate.getDate(),
//           color: '#000000',
//           background_color: '#ffffff'
//         }
//         const day = workdaysByUser[`${username}.${i + 1}`]
//         if (day) {
//           const dType = day.user_type || day.type
//           sum += dType.special === 'W'
//             ? day.hours + dType.compensation - (day.hours + dType.compensation > 0.5 ? 0.5 : 0)
//             : day.hours + dType.compensation
//           tmp[String(i + 1)] = {
//             ...tmp[String(i + 1)],
//             slug: dType.slug ? (day.hours ? `${dType.slug} (${day.hours})` : dType.slug) : day.hours,
//             color: dType.color,
//             background_color: dType.background_color,
//             ...day
//           }
//           if (tmp[String(i + 1)].today && day.work_day_times.length) {
//             online = !!day.work_day_times[day.work_day_times.length - 1]?.work_time_start && !day.work_day_times[day.work_day_times.length - 1]?.work_time_stop
//           }
//         }
//       }
//       tmp.sum = sum
//       tmp.online = online
//       rows.push(tmp)
//     })
//     generalCalendarRows.value = rows
//   }

//   function updateWorkdays(workday) {
//     const key = `${new Date(workday.date).getMonth() + 1}.${new Date(workday.date).getDate()}`
//     workdays.value[key] = { ...workday }
//   }

//   // Return everything
//   return {
//     workdays,
//     today,
//     month,
//     year,
//     workTime,
//     calendarRows,
//     generalCalendarRows,
//     workdaysGetter,
//     todayGetter,
//     workTimeGetter,
//     calendarRowsGetter,
//     yearGetter,
//     monthGetter,
//     generalCalendarRowsGetter,
//     setWorkdays,
//     setGeneralCalendar,
//     updateWorkday,
//     updateWorkdays,
//     setToday,
//     setWorkTime
//   }
// })

// stores/workday.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import _ from 'lodash'
import { api } from '../services/api'
import type {
  WorkDay,
  WorkdaysState,
  WorkTime,
  CalendarRow
} from '../types/store.types'

export const useWorkdayStore = defineStore('workdayStore', () => {
  // State
  const workdays = ref<WorkdaysState>({})
  const today = ref<WorkDay | null>(null)
  const month = ref<number>(new Date().getMonth() + 1)
  const year = ref<number>(new Date().getFullYear())
  const workTime = ref<WorkTime | null>(null)
  const calendarRows = ref<CalendarRow[]>([])
  const generalCalendarRows = ref<CalendarRow[]>([])

  // Getters
  const workdaysGetter = computed((): WorkdaysState => {
    console.log(workdays.value)
    return workdays.value
  })

  const todayGetter = computed((): WorkDay | null => {
    console.log(today.value)
    return today.value
  })

  const workTimeGetter = computed((): WorkTime | null => {
    console.log(workTime.value)
    return workTime.value
  })

  const calendarRowsGetter = computed((): CalendarRow[] => {
    calendarRows.value.forEach(month => {
      let sum = 0
      for (let day = 1; day <= 31; day++) {
        if ('type' in month[day]) {
          const dType = month[day].user_type || month[day].type
          sum += dType.special === 'W'
            ? month[day].hours + dType.compensation - (month[day].hours + dType.compensation > 0.5 ? 0.5 : 0)
            : month[day].hours + dType.compensation
        }
      }
      month.sum = sum
    })
    console.log(calendarRows.value)
    return calendarRows.value
  })

  const yearGetter = computed((): number => {
    console.log(year.value)
    return year.value
  })

  const monthGetter = computed((): number => {
    console.log(month.value)
    return month.value
  })

  const generalCalendarRowsGetter = computed((): CalendarRow[] => {
    console.log(generalCalendarRows.value)
    return generalCalendarRows.value
  })

  // Actions
  async function setWorkdays(): Promise<boolean> {
    try {
      const data = await api.workday.fetchWorkdays()
      workdays.value = data
      console.log(data)
      updateCalendarRows(data)
      return true
    } catch (error) {
      console.error('Error setting workdays:', error)
      return false
    }
  }

  async function setGeneralCalendar(): Promise<boolean> {
    try {
      const data = await api.workday.fetchGeneralCalendar(false)
      console.log(data)
      updateGeneralCalendarRows(data)
      return true
    } catch (error) {
      console.error('Error setting general calendar:', error)
      return false
    }
  }

  async function updateWorkday(workDayId: number): Promise<boolean> {
    try {
      const workday = await api.workday.getWorkday(workDayId)
      updateCalendarRows([workday])
      updateGeneralCalendarRows([workday])
      updateWorkdays(workday)
      return true
    } catch (error) {
      console.error('Error updating workday:', error)
      return false
    }
  }

  async function setToday(): Promise<boolean> {
    try {
      const data = await api.workday.fetchToday()
      today.value = data[0]
      console.log(data[0])
      return true
    } catch (error) {
      console.error('Error setting today:', error)
      return false
    }
  }

  async function setWorkTime(): Promise<boolean> {
    try {
      const data = await api.workday.fetchWorkTime()
      workTime.value = data
      console.log(data)
      return true
    } catch (error) {
      console.error('Error setting work time:', error)
      return false
    }
  }

  // Helper functions for updating state
  function updateCalendarRows(workdaysData: WorkDay[] | WorkdaysState): void {
    const rows: CalendarRow[] = []
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
    const toDayDate = new Date()

    months.forEach((monthName, index) => {
      const tmp: CalendarRow = {
        month: monthName,
        monthNum: index + 1
      }

      const maxDays = 33 - new Date(year.value, index, 33).getDate()

      for (let i = 0; i < 31; i++) {
        tmp[String(i + 1)] = {
          slug: i + 1 > maxDays ? 'x' : '',
          day: new Date(year.value, index, i + 1),
          today: year.value === toDayDate.getFullYear() &&
                 index === toDayDate.getMonth() &&
                 i + 1 === toDayDate.getDate(),
          color: '#000000',
          background_color: '#ffffff'
        }

        const day = Array.isArray(workdaysData)
          ? workdaysData.find(d => {
              const date = new Date(d.date)
              return date.getMonth() === index && date.getDate() === i + 1
            })
          : workdaysData[`${index + 1}.${i + 1}`]

        if (day) {
          const dType = day.user_type || day.type
          tmp[String(i + 1)] = {
            ...tmp[String(i + 1)],
            slug: dType.slug ? (day.hours ? `${dType.slug} (${day.hours})` : dType.slug) : day.hours,
            color: dType.color,
            background_color: dType.background_color,
            ...day
          }
        }
      }
      rows.push(tmp)
    })
    calendarRows.value = rows
  }

  function updateGeneralCalendarRows(data: { workdays: WorkDay[], usernames: { name: string }[] }): void {
    const rows: CalendarRow[] = []
    const usernames = _.map(data.usernames, 'name')
    const workdaysByUser = _.keyBy(data.workdays, (val) =>
      `${val.user_name}.${new Date(val.date).getDate()}`
    )
    const toDayDate = new Date()

    usernames.forEach((username, index) => {
      const tmp: CalendarRow = {
        username,
        usernameNum: index + 1
      }

      const maxDays = 33 - new Date(year.value, month.value - 1, 33).getDate()
      let sum = 0
      let online = false

      for (let i = 0; i < 31; i++) {
        tmp[String(i + 1)] = {
          slug: i + 1 > maxDays ? 'x' : '',
          day: new Date(year.value, month.value - 1, i + 1),
          today: year.value === toDayDate.getFullYear() &&
                 month.value === toDayDate.getMonth() + 1 &&
                 i + 1 === toDayDate.getDate(),
          color: '#000000',
          background_color: '#ffffff'
        }

        const day = workdaysByUser[`${username}.${i + 1}`]
        if (day) {
          const dType = day.user_type || day.type
          sum += dType.special === 'W'
            ? day.hours + dType.compensation - (day.hours + dType.compensation > 0.5 ? 0.5 : 0)
            : day.hours + dType.compensation

          tmp[String(i + 1)] = {
            ...tmp[String(i + 1)],
            slug: dType.slug ? (day.hours ? `${dType.slug} (${day.hours})` : dType.slug) : day.hours,
            color: dType.color,
            background_color: dType.background_color,
            ...day
          }

          if (tmp[String(i + 1)].today && day.work_day_times.length) {
            const lastWorkTime = day.work_day_times[day.work_day_times.length - 1]
            online = !!lastWorkTime?.work_time_start && !lastWorkTime?.work_time_stop
          }
        }
      }

      tmp.sum = sum
      tmp.online = online
      rows.push(tmp)
    })

    generalCalendarRows.value = rows
  }

  function updateWorkdays(workday: WorkDay): void {
    const key = `${new Date(workday.date).getMonth() + 1}.${new Date(workday.date).getDate()}`
    workdays.value[key] = { ...workday }
  }

  return {
    // State
    workdays,
    today,
    month,
    year,
    workTime,
    calendarRows,
    generalCalendarRows,

    // Getters
    workdaysGetter,
    todayGetter,
    workTimeGetter,
    calendarRowsGetter,
    yearGetter,
    monthGetter,
    generalCalendarRowsGetter,

    // Actions
    setWorkdays,
    setGeneralCalendar,
    updateWorkday,
    updateWorkdays,
    setToday,
    setWorkTime
  }
})
