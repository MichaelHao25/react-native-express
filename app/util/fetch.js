import { Portal, Toast } from '@ant-design/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Sound from 'react-native-sound';
import Tts from 'react-native-tts';
import * as RootNavigation from './RootNavigation.js';
// 预加载声音资源
Sound.setCategory('Playback');
const handleSound = new Sound('error_error.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
});

let requestList = [];

class Request {
  static url = 'http://api.junchain.cn';
  static loadingTimer = 0;
  static loadingKey;
  static timeoutTimer = 0;
  static getToken = () => {
    return AsyncStorage.getItem('token');
  };
  static fetch = ({ method = 'get', url, body = {}, headers = {} }) => {
    console.log(requestList);
    if (requestList.includes(`${method}_${url}`)) {
      console.log('repeat');
      return Promise.reject();
    } else {
      requestList.push(`${method}_${url}`);
    }
    Request.loadingTimer = setTimeout(() => {
      Request.loadingKey = Toast.loading('正在加载中...');
    }, 200);
    /*添加超时的标记，如果超时的话就不执行回掉函数了*/
    let timeoutFlag = false;
    // 超时的策略 3s
    // 根本无用
    // Request.timeoutTimer = setTimeout(() => {
    //   requestList = requestList.filter((a) => a !== `${method}_${url}`);
    //   timeoutFlag = true;
    // }, 1000 * 3);

    return Request.getToken().then((token) => {
      console.log('token', token);
      if (token) {
        // body.token = token;
        headers.token = token;
      }
      let arg = '';
      const request = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json; charset=utf-8',
          ...headers,
        },
      };

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
        request.body = JSON.stringify(body);
      }

      return fetch(`${Request.url}${url}${arg}`, request)
        .then((res) => {
          if (timeoutFlag) {
            console.log('timeout');
          }
          return res;
        })
        .then((res) => {
          // 超时的策略 3s
          requestList = requestList.filter((a) => a !== `${method}_${url}`);
          clearTimeout(Request.timeoutTimer);

          clearTimeout(Request.loadingTimer);

          if (Request.loadingKey) {
            Portal.remove(Request.loadingKey);
          }
          if (res.status === 200) {
            // console.log('res status 200')
            return res.json();
          } else {
            // if (res.status === 403) {
            //     // console.log('res status 403')
            //
            //     throw res.text();
            // } else {
            // console.log('res status other')
            throw res.text();
            // }
          }
        })
        .then((res) => {
          // console.log(`get res json ${JSON.stringify(res)}`)
          console.log('url', `${Request.url}${url}${arg}`);
          console.log('request', request);
          console.log('response', res);
          // dir会在正式版的模式下报错
          if (res.msg === '无效的token') {
            RootNavigation.navigate('logout');
            // signOut()
          }
          if (res.code !== 200) {
            // console.log(`res.result false`)
            Toast.fail(res.msg);
            throw res;
          } else {
            // {"code": 200, "count": 0, "data": [], "pcodeNum": "SJTPACK1612616050", "price": 0, "success": true, "weight": 0}
            // false时，sound没有传值，发默认的error；sound有值时，发sound
            // if (res.success === false) {
            if (res.sound) {
              Tts.speak(res.sound);
            } else {
              if (res.success === false) {
                handleSound.play();
              }
            }
            // }
            // if (res.success === true) {
            //     if (res.sound) {
            //         Tts.speak(res.sound);
            //     }
            // }
            // console.log(`res.result true`)
            return res;
          }
        });
    });
    // .catch(error => {
    //     console.log(error)
    //     Toast.fail(JSON.stringify(error));
    // })
  };
}

export default Request;
