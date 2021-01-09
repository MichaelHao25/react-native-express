import AsyncStorage from "@react-native-community/async-storage";
import { Toast, Portal } from '@ant-design/react-native';
class Request {
    static url = "http://t.0lz.net";
    static loadingTimer = 0;
    static loadingKey;
    static getToken = () => {
        return AsyncStorage.getItem('token');
    }
    static fetch = ({
        method = 'get',
        url,
        body = {

        },
        headers = {},
    }) => {
        Request.loadingTimer = setTimeout(() => {
            Request.loadingKey = Toast.loading('正在加载中...');
        }, 200);
        return Request.getToken().then(token => {
            console.log('token',token);
            if (token) {
                // body.token = token;
                headers.token = token;
            }
            let arg = '';
            const request = {
                method: method.toUpperCase(),
                headers: {
                    "Content-Type": 'application/json; charset=utf-8',
                    'Accept': 'application/json; charset=utf-8',
                    ...headers,
                }
            }

            if (method.toLowerCase() === 'get') {
                arg = '?';
                for (const key in body) {
                    if (body.hasOwnProperty(key)) {
                        const element = body[key];
                        arg += `${key}=${element}&`;
                    }
                }
                let length = arg.length;
                arg = arg.slice(0, length - 1);
            } else {
                request.body = JSON.stringify(body)
            }


            return fetch(`${Request.url}${url}${arg}`, request).then(res => {

                clearTimeout(Request.loadingTimer);
                if (Request.loadingKey) {
                    Portal.remove(Request.loadingKey);
                }

                if (res.status === 200) {
                    // console.log('res status 200')
                    return res.json()
                } else {
                    if (res.status === 403) {
                        // console.log('res status 403')
                        RootNavigation.navigate('Login')
                        throw res.text();
                    } else {
                        // console.log('res status other')
                        throw res.text();
                    }
                }
            }).then(res => {
                // console.log(`get res json ${JSON.stringify(res)}`)
                console.log(`${Request.url}${url}${arg}`);
                console.log(body);
                // dir会在正式版的模式下报错
                console.log(res);
                if (res.sessionid) {
                    // console.log(`set sessionid ${res.sessionid}`)
                    AsyncStorage.setItem('__sid', res.sessionid);
                }
                if (res.code !== 200) {
                    // console.log(`res.result false`)
                    Toast.fail(res.msg);
                    throw res;
                } else {
                    // console.log(`res.result true`)
                    return res;
                }
            })
        })
        // .catch(error => {
        //     console.log(error)
        //     Toast.fail(JSON.stringify(error));
        // })
    }
}
export default Request
