import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from "@ant-design/react-native";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-community/async-storage";

import Login from "./app/view/Login";
import Home from "./app/view/Home";
import List from "./app/view/List";
import CreateExpress from "./app/view/CreateExpress";
import Search from "./app/view/Search";

import { useReducer } from 'react';
import { useMemo } from 'react';
import { user_login } from "./app/util/api";
import AuthContext from "./app/util/AuthContext";



const Stack = createStackNavigator();

export default () => {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    AsyncStorage.getItem('token').then(res => {
      dispatch({
        type: 'RESTORE_TOKEN',
        token: res
      })
    }).finally(() => {
      SplashScreen.hideAsync();
    })
  }, [])
  const [state, dispatch] = useReducer((prevState, action) => {
    switch (action.type) {
      case 'RESTORE_TOKEN':
        // 这个时候是获取到了token
        return {
          ...prevState,
          token: action.token,
          isloading: false,
        }
      case 'SIGN_IN':
        // 登录完毕
        return {
          ...prevState,
          isloading: false,
          token: action.token,
        }
      case 'SIGN_OUT':
        // 登出
        return {
          ...prevState,
          token: null,
          isSignout: true,
        }
      default:
        break;
    }
  }, {
    isLoading: true,
    isSignout: false,
    token: null,
  })
  const authContext = useMemo(() => ({
    signIn(userInfo) {
      // 登录
      user_login(userInfo).then(() => {
        dispatch({
          type: 'SIGN_IN',
          token: '---'
        })
      })
    },
    signOut() {
      // 登出
      dispatch({
        type: 'SIGN_OUT'
      })
    },
    signUp() {
      // 注册
      dispatch({
        type: 'SIGN_IN',
        token: '---'
      })
    }
  }))
  return (
    <AuthContext.Provider value={authContext}>
      <Provider>
        <NavigationContainer>
          <StatusBar style="auto" />
          {/* headerMode={'none'} */}
          <Stack.Navigator>
            {/* initialRouteName={"login"} */}
            {
              state.token === null ? (
                <Stack.Screen
                  name="login"
                  options={{
                    title: '登录',
                    animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                  }}
                  component={Login}
                />
              ) : (
                  <>
                    <Stack.Screen
                      name="home"
                      options={{ title: '首页' }}
                      component={Home}
                    />

                    <Stack.Screen
                      name="list"
                      options={{ title: '列表' }}
                      component={List}
                    />
                    <Stack.Screen
                      name="createExpress"
                      options={{ title: '创建运单' }}
                      component={CreateExpress}
                    />
                    <Stack.Screen
                      name="search"
                      options={{ title: '搜索' }}
                      component={Search}
                    />
                    

                  </>
                )
            }
          </Stack.Navigator>
        </NavigationContainer >
      </Provider>
    </AuthContext.Provider>
  );
}
