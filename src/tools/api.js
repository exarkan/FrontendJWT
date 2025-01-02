import axios from 'axios'
import Auth from './endpoints/auth'
import User from './endpoints/user'
import Workday from './endpoints/workday'
import Book from './endpoints/book'
import Payment from './endpoints/payment'
import SystemMessage from './endpoints/systemMessage'
let baseApiUrl
// if (window.location.hostname === 'localhost') {
//   baseApiUrl = 'http://' + window.location.hostname + ':8000/api/'
// } else {
//   baseApiUrl = 'https://api.' + window.location.hostname + '/api/'
// }
baseApiUrl = 'https://localhost:8000/api/'
const apiVersion = 'v1/'

const api = axios.create({
  baseURL: baseApiUrl
})

api.auth = new Auth(baseApiUrl)
api.user = new User(baseApiUrl + apiVersion)
api.workday = new Workday(baseApiUrl + apiVersion)
api.book = new Book(baseApiUrl + apiVersion)
api.payment = new Payment(baseApiUrl + apiVersion)
api.systemMessage = new SystemMessage(baseApiUrl + apiVersion)

export default api
