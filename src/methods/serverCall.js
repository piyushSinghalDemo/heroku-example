'use strict'
import config from '../config.json'
import { SERVER_ERROR } from './../data/client_message.js'
import { sessioncheck, destroy_session } from './../methods/user_session.js';

export function deleteFromServer(that, endPoint, is_ui_token = false) {
    // console.log(that.$session.get('access_token'))
    let authorization = config.APPLICATION_TOKEN;
    let headerData ={}
    if (!is_ui_token) {
        if(!sessioncheck(that))
            {
                window.location.href = "/login"
                return
            }
        headerData['From-ui'] = 'Y'
    }
    if(that.$session && that.$session.get('access_token'))
        authorization = that.$session.get('access_token')

    headerData['Authorization'] = authorization
    headerData['Content-Type'] = 'application/json'
    return new Promise(function(resolve, reject) {
        that.$http.delete(endPoint, {
            headers: headerData
        }).then(response => {
            return resolve(response.body)
        }, response => {
            if (!is_ui_token && response.status === 401) {
                destroy_session(that)
            } else if (response.status < 500) {
                return reject(response.body.message)
            } else {
                return reject(SERVER_ERROR)
            }
        })
    })
}

export function get(that, endPoint, is_ui_token = false) {
    let authorization = config.APPLICATION_TOKEN;
    let headerData ={}
    if (!is_ui_token) {
        if(!sessioncheck(that))
            {
                window.location.href = "/login"
                return
            }
        headerData['From-ui'] = 'Y'
    }
    if(that.$session && that.$session.get('access_token'))
        authorization = that.$session.get('access_token')

    headerData['Authorization'] = authorization
    headerData['Content-Type'] = 'application/json'
    return new Promise(function(resolve, reject) {
        that.$http.get(endPoint, {
            headers: headerData
        }).then(response => {
            return resolve(response.body)
        }, response => {
            if (!is_ui_token && response.status === 401) {
                destroy_session(that)
            } else if (response.status < 500) {
                return reject(response.body.message)
            } else {
                return reject(SERVER_ERROR)
            }
        })
    })
}

export function post(that, endPoint, InputJson, is_ui_token = false) {
    let authorization = config.APPLICATION_TOKEN;
    let headerData ={}
    if (!is_ui_token) {
        if(!sessioncheck(that))
            {
                window.location.href = "/login"
                return
            }
        headerData['From-ui'] = 'Y'
    }
    if(that.$session && that.$session.get('access_token'))
        authorization = that.$session.get('access_token')
    
    headerData['Authorization'] = authorization
    headerData['Content-Type'] = 'application/json'
    return new Promise(function(resolve, reject) {
        that.$http.post(endPoint, InputJson, {
            headers: headerData
        }, ).then(response => {
            return resolve(response.body)
        }, response => {
            if (!is_ui_token && response.status === 401) {
                destroy_session(that)
            } else if (response.status <= 500 || response.status === 503) {
                return reject(response.body.message)
            } else {
                return reject(SERVER_ERROR)
            }

        })
    })
}
export function fileUpload(that, endPoint, InputJson, is_ui_token = false) {
    let authorization = config.APPLICATION_TOKEN;
    let headerData ={}
    if (!is_ui_token) {
        if(!sessioncheck(that))
            {
                window.location.href = "/login"
                return
            }
        headerData['From-ui'] = 'Y'
    }
    if(that.$session && that.$session.get('access_token'))
        authorization = that.$session.get('access_token')
    headerData['Authorization'] = authorization
    headerData['Content-Type'] = 'application/json'
    return new Promise(function(resolve, reject) {
        that.$http.post(endPoint, InputJson, {
            headers: headerData
        }, ).then(response => {
            return resolve(response.body)
        }, response => {
            if (!is_ui_token && response.status === 401) {
                destroy_session(that)
            } else if (response.status <= 500) {
                return reject(response.body.message)
            } else {
                return reject(SERVER_ERROR)
            }

        })
    })
}