import axios from 'axios'

const instance = axios.create({

    baseURL: 'https://ancient-bayou-65086.herokuapp.com/'
})

export default instance