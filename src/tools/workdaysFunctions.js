import _ from 'lodash'

export default {
  calcTotalHours (workdays, month) {
    let hours = 0
    for (const day in workdays) {
      if (workdays[day].type.special === 'W' && Number(day.split('.')[0]) === month) {
        hours += workdays[day].type.work_hours
      }
    }
    return hours
  },
  // calcFullSalary (salary, employments, multiplier) {
  //   for (const emp of employments) {
  //     salary += emp.salary
  //   }
  //   return salary * multiplier
  // },
  calcFullSalary (workdays, month) {
    let firstDay = Object.keys(workdays).filter(k => Number(k.split('.')[0]) === month)[0]
    firstDay = workdays[firstDay]
    if (!firstDay) return 0
    let fullSalary = firstDay.current_salary_cash
    for (const emp of firstDay.current_employments) {
      fullSalary += emp.salary
    }
    return fullSalary * firstDay.rate_multiplier
  },
  calcRanging (workdays, month, totalHours, missingHours, salaryRate) {
    let firstDay = Object.keys(workdays).filter(k => Number(k.split('.')[0]) === month)[0]
    firstDay = workdays[firstDay]
    const ranging = firstDay ? firstDay.ranging : 0
    let hours = 0
    if (missingHours > 0) {
      hours = Math.round(ranging * totalHours * 2) / 2
      if (hours > missingHours) {
        hours = missingHours
      }
    }
    return {
      hours: hours,
      money: hours * salaryRate
    }
  },
  calcVCPayments (workdays, payments, month) {
    let Vdays = 0
    let Sdays = 0
    let Vcash = 0
    let Scash = 0
    let VnonCash = 0
    let SnonCash = 0
    for (const day in workdays) {
      if (Number(day.split('.')[0]) === month && workdays[day].user_type) {
        if (workdays[day].user_type.special === 'V') Vdays++
        if (workdays[day].user_type.special === 'S') Sdays++
      }
    }
    for (const payment of payments) {
      if (payment.type === 'V') {
        if (payment.cash) {
          Vcash += payment.value
        } else {
          VnonCash += payment.value
        }
      }
      if (payment.type === 'S') {
        if (payment.cash) {
          Scash += payment.value
        } else {
          SnonCash += payment.value
        }
      }
    }
    return {
      vacation: {
        days: Vdays,
        cash: Vcash,
        nonCash: VnonCash
      },
      sick: {
        days: Sdays,
        cash: Scash,
        nonCash: SnonCash
      }
    }
  },
  calcWeightedHours (workdays, month) {
    const res = []
    for (const d in workdays) {
      const isDaywork = ['W', 'H'].includes(workdays[d].type.special)
      const isThisMonth = Number(d.split('.')[0]) === month
      const isThisTodayMonth = Number(d.split('.')[0]) === (new Date()).getMonth() + 1
      const isDayLessThenToday = d.split('.')[1] < (new Date()).getDate()
      const day = workdays[d]
      const compensation = day.type.compensation + (day.user_type ? day.user_type.compensation : 0)
      let hours = day.hours + compensation
      const dayIsWorkday = day.type.special === 'W'
      const dayNotSickOrVacation = day.user_type ? (day.user_type.special !== 'S' && day.user_type.special !== 'V') : true
      if (hours > 0.5 && dayIsWorkday && dayNotSickOrVacation) {
        hours = hours - 0.5
      }
      const isHoursGTZero = hours > 0
      if (isDaywork && isThisMonth && !(isThisTodayMonth && !isDayLessThenToday) && isHoursGTZero) {
        const c1 = day.type.coefficient
        const c2 = day.type.coefficient_overwork
        const c3 = day.type.coefficient_over_overwork
        if (!_.find(res, { c: c1 })) res.push({ c: c1, h: 0 })
        if (!_.find(res, { c: c2 })) res.push({ c: c2, h: 0 })
        if (!_.find(res, { c: c3 })) res.push({ c: c3, h: 0 })
        if (hours > day.type.overwork_hours) {
          _.find(res, { c: c3 }).h += (hours - day.type.overwork_hours)
          hours -= (hours - day.type.overwork_hours)
        }
        if (hours > day.type.work_hours) {
          _.find(res, { c: c2 }).h += (hours - day.type.work_hours)
          hours -= (hours - day.type.work_hours)
        }
        if (day.type.special === 'W' && compensation === 0) {
          _.find(res, { c: c1 }).h += day.type.work_hours
        } else {
          _.find(res, { c: c1 }).h += hours
        }
      }
    }
    return _.orderBy(res, ['c'], ['asc'])
  },
  calcHomework (homeworks) {
    let res = 0
    for (const homework of homeworks) {
      res += homework.value
    }
    return res
  },
  calcAward (awards) {
    let APublic = 0
    let APrivate = 0
    let APublicComment = ''
    let APrivateComment = ''
    for (const award of awards) {
      if (award.private) {
        APrivate += award.value
        APrivateComment += award.comment + '\n-----------------------------------\n'
      } else {
        APublic += award.value
        APublicComment += award.comment + '\n-----------------------------------\n'
      }
    }
    return {
      public: APublic,
      private: APrivate,
      publicComment: APublicComment,
      privateComment: APrivateComment
    }
  },
  calcPays (paies) {
    let tax = 0
    let cash = 0
    let nonCash = 0
    for (const pay of paies) {
      if (pay.cash) {
        cash += pay.value
      } else {
        nonCash += pay.value
        tax += pay.tax
      }
    }
    return {
      tax: tax,
      cash: cash,
      nonCash: nonCash
    }
  },
  calcMissingHours (workdays, month) {
    let res = 0
    for (const d in workdays) {
      const isDaywork = workdays[d].type.special === 'W'
      const isThisMonth = Number(d.split('.')[0]) === month
      const isThisTodayMonth = Number(d.split('.')[0]) === (new Date()).getMonth() + 1
      const isDayLessThenToday = d.split('.')[1] < (new Date()).getDate()

      const day = workdays[d]
      const compensation = day.type.compensation + (day.user_type ? day.user_type.compensation : 0)
      let hours = day.hours + compensation
      const dayIsWorkday = day.type.special === 'W'
      const dayNotSickOrVacation = day.user_type ? (day.user_type.special !== 'S' && day.user_type.special !== 'V') : true
      if (hours > 0.5 && dayIsWorkday && dayNotSickOrVacation) {
        hours = hours - 0.5
      }

      const isHoursGTZero = hours > 0
      if (isDaywork && isThisMonth && !(isThisTodayMonth && !isDayLessThenToday) && isHoursGTZero) {
        res += ((workdays[d].type.work_hours - hours) > 0) ? workdays[d].type.work_hours - hours : 0
      }
    }
    return res
  },
  calcLateness (workdays, month) {
    let times = 0
    let value = 0
    for (const day in workdays) {
      if (workdays[day].type.special === 'W' && Number(day.split('.')[0]) === month) {
        if (workdays[day].work_day_times[0] && workdays[day].work_day_times[0].work_time_start) {
          const timeFact = workdays[day].work_day_times[0].work_time_start.split('T')[1].split('+')[0]
          const timeShould = workdays[day].enter_time
          const hourDiff = Number(timeFact.slice(0, 2)) - Number(timeShould.slice(0, 2))
          const minDiff = Number(timeFact.slice(3, 5)) - Number(timeShould.slice(3, 5))
          const secDiff = Number(timeFact.slice(6, 8)) - Number(timeShould.slice(6, 8))
          const late = hourDiff * 60 + minDiff + Math.floor(secDiff / 30)
          const dayIsWorkday = workdays[day].type.special === 'W'
          const dayNotSickOrVacation = workdays[day].user_type ? (workdays[day].user_type.special !== 'S' && workdays[day].user_type.special !== 'V') : true
          if (!workdays[day].not_loss && !workdays[day].type.can_late && late > workdays[day].late_since && dayIsWorkday && dayNotSickOrVacation) {
            times++
            value += times > 1 ? workdays[day].late_fee : 0
          }
        }
      }
    }
    return {
      times: times > 0 ? times - 1 : 0,
      value: value
    }
  },
  calcPenalty (penalties) {
    let res = 0
    let comment = ''
    for (const penalty of penalties) {
      res += penalty.value
      comment += penalty.comment + '\n-----------------------------------\n'
    }
    return {
      value: res,
      comment: comment
    }
  },
  calcTotalPlus (weightedHours, salaryRate, award, VCPayments, homework, ranging) {
    let sum = 0
    for (const w of weightedHours) {
      sum += w.c * w.h * salaryRate
    }
    sum += award.private
    sum += award.public
    sum += VCPayments.sick.cash + VCPayments.sick.nonCash
    sum += VCPayments.vacation.cash + VCPayments.vacation.nonCash
    sum += homework
    sum += ranging.money
    return sum
  },
  calcTotalMinus (salaryRate, missingHours, paies, lateness, penalty) {
    let sum = 0
    sum += missingHours * salaryRate
    sum += paies.tax
    sum += lateness.value
    sum += penalty.value
    return sum
  },
  calcTotalSum (weightedHours, salaryRate, award, VCPayments, homework, ranging, missingHours, paies, lateness, penalty) {
    return this.calcTotalPlus(weightedHours, salaryRate, award, VCPayments, homework, ranging) - this.calcTotalMinus(salaryRate, missingHours, paies, lateness, penalty)
  },
  calcAllValues (workdays, month, user, payments, homeworks, awards, paies, penalties) {
    const totalHours = this.calcTotalHours(workdays, month)
    const fullSalary = this.calcFullSalary(workdays, month)
    const missingHours = this.calcMissingHours(workdays, month)
    const salaryRate = fullSalary / totalHours
    const ranging = this.calcRanging(workdays, month, totalHours, missingHours, salaryRate)
    const VCPayments = this.calcVCPayments(workdays, payments, month)
    const weightedHours = this.calcWeightedHours(workdays, month)
    const homework = this.calcHomework(homeworks)
    const pays = this.calcPays(paies)
    const award = this.calcAward(awards)
    const penalty = this.calcPenalty(penalties)
    const lateness = this.calcLateness(workdays, month)
    const totalPlus = this.calcTotalPlus(weightedHours, salaryRate, award, VCPayments, homework, ranging)
    const totalMinus = this.calcTotalMinus(salaryRate, missingHours, pays, lateness, penalty)
    const totalSum = this.calcTotalSum(weightedHours, salaryRate, award, VCPayments, homework, ranging, missingHours, pays, lateness, penalty)
    return {
      user,
      totalHours,
      fullSalary,
      missingHours,
      salaryRate,
      ranging,
      VCPayments,
      weightedHours,
      homework,
      pays,
      award,
      penalty,
      lateness,
      totalPlus,
      totalMinus,
      totalSum
    }
  }
}

// weightedHours () {
//   const res = []
//   const workdays = this.workdays
//   let currHours = 0
//   for (const d in workdays) {
//     if (['W', 'H'].includes(workdays[d].type.special) && d.split('.')[0] === this.month.toString()) {
//       const day = workdays[d]
//       const c1 = day.type.coefficient
//       const c2 = day.type.coefficient_overwork
//       const c3 = day.type.coefficient_over_overwork
//       if (!_.find(res, { c: c1 })) res.push({ c: c1, h: 0 })
//       if (!_.find(res, { c: c2 })) res.push({ c: c2, h: 0 })
//       if (!_.find(res, { c: c3 })) res.push({ c: c3, h: 0 })
//       let hours = day.hours + day.type.compensation > 0.5 ? day.hours + day.type.compensation - 0.5 : 0
//       if (hours > day.type.overwork_hours) {
//         _.find(res, { c: c3 }).h += hours - day.type.overwork_hours
//         currHours += hours - day.type.overwork_hours
//         hours -= hours - day.type.overwork_hours
//       }
//       if (workdays[d].type.special === 'H') {
//         _.find(res, { c: c1 }).h += hours
//         currHours += hours
//       }
//       if (workdays[d].type.special === 'W') {
//         if (currHours + hours <= this.totalHours) {
//           currHours += hours
//           _.find(res, { c: c1 }).h += hours
//         } else {
//           if (currHours >= this.totalHours) {
//             _.find(res, { c: c2 }).h += hours
//             currHours += hours
//           } else {
//             currHours += hours
//             const diff = currHours - this.totalHours
//             _.find(res, { c: c1 }).h += hours - diff
//             _.find(res, { c: c2 }).h += diff
//           }
//         }
//       }
//     }
//   }
//   return _.orderBy(res, ['c'], ['asc'])
// },
