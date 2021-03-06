import Vue from 'vue'
import TokenMgr from '../mgr/TokenMgr'
import { Message } from 'element-ui'
import { removeUserInfo } from '../mgr/userMgr'

let vue = new Vue()

export function getHttp(url, params) {
    return new Promise((resolve, reject) => {
        vue.axios.get(url, { params: params })
            .then(response => {
                if (response.data.success === false) {
                    Message.error(response.data.message)
                    reject(response.data.message)
                }
                setTimeout(() => {
                    resolve(response.data)
                }, 300)
            })
            .catch(error => {
                reject(error.message)
            })
    })
}

export function deleteHttp(url) {
    return new Promise((resolve, reject) => {
        vue.axios.delete(url)
            .then(response => {
                setTimeout(() => {
                    if (response.data.success === false) {
                        Message.error(response.data.message)
                        reject(response.data.message)
                    }
                    resolve(response.data)
                }, 300)
            })
            .catch(error => {
                reject(error.message)
            })
    })
}

export function postHttp(url, body, params) {
    return new Promise((resolve, reject) => {
        vue.axios({
            method: 'post',
            url: url,
            params: params,
            data: body
        }).then(response => {
            setTimeout(() => {
                if (response.data.success === false) {
                    Message.error(response.data.message)
                    reject(response.data.message)
                }
                resolve(response.data)
            }, 300)
        }).catch(error => {
            reject(error.message)
        })
    })
}

export function configAxios() {

    console.log(window.location.origin)
    var baseUrl = process.env.SERVER_HOST || window.location.origin

    if (!baseUrl.endsWith('/')) {
        baseUrl += '/'
    }

    vue.axios.defaults.baseURL = baseUrl
    vue.axios.defaults.headers.common['Content-Type'] = 'application/json'
    vue.axios.default.timeout = 60000

    vue.axios.interceptors.request.use(
        config => {
            let token = TokenMgr.get(vue.axios.defaults.baseURL)
            if (token) {
                config.headers.Authorization = 'Bearer' + ' ' + token
            }
            return config
        }, err => {
            return Promise.reject(err)
        })

    vue.axios.interceptors.response.use({}, error => {
        if (!error.response) {
            error.message = '?????????????????????'
            return Promise.reject(error)
        }
        switch (error.response.status) {
            case 101:
                break
            case 401:
                error.message = '???????????????,???????????????!'
                    // ??????????????????
                TokenMgr.clearTokens()
                removeUserInfo()
                    // ??????
                setTimeout(() => {
                    vue.router.push('/login')
                }, 500)
                break
            case 403:
                error.message = '????????????!'
                break
            case 408:
                error.message = '????????????!'
                break
            case 500:
                error.message = '??????????????????!'
                break
            case 503:
                error.message = '??????????????????!'
                break
            case 504:
                error.message = '????????????!'
                break
            default:
                error.message = '????????????'
                break
        }
        return Promise.reject(error)
    })
}