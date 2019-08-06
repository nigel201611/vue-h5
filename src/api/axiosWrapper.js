import axios from 'axios';
// import { Message } from 'element-ui';
let loadingInstance = null;

let prefix = process.env.API_ROOT
// let prefix = ''

// Add a request interceptor 
axios.interceptors.request.use(function (config) {
    // alert(JSON.stringify(config));
    // if (loadingInstance) {
    //     loadingInstance.close();
    // }

    // loadingInstance = Loading.service({ target: '.content-container' });
    // Do something before request is sent     
    config.withCredentials = true;
    config.headers = config.headers || {};
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['Content-Type'] = 'application/json;charset=utf-8';

    return config;
}, function (error) {
    // loadingInstance.close();
    // Do something with request error 
    return Promise.reject(error);
});

// Add a response interceptor 
axios.interceptors.response.use(function (response) {
    // Do something with response data 
    // loadingInstance.close();
    //业务错误
    // if (response.data.retcode == 1) {
    //     Message.error(response.data.toast);
    // }
    //用户如果未登录，则跳转到登录页面
    //  if (response.data.retcode == 20001) {
    //     window.location = response.data.redirect;
    // } else {
    //     return response;
    // }

    return response;
}, function (error) {
    // Do something with response error 
    // loadingInstance.close();
    return Promise.reject(error);
});

export default axios