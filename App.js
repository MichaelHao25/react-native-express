import "react-native-gesture-handler";
import React, {useEffect, useMemo, useReducer} from "react";
import {StatusBar} from "expo-status-bar";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {Provider} from "@ant-design/react-native";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-community/async-storage";
import ModifyPassword from "./app/view/ModifyPassword";
import Login from "./app/view/Login";
import Home from "./app/view/Home";
import List from "./app/view/List";
import CreateExpress from "./app/view/CreateExpress";
import Search from "./app/view/Search";
import Set from "./app/view/Set";
import ScalesConfig from "./app/view/ScalesConfig";
import PrintConfig from "./app/view/PrintConfig";
import MergePackage from "./app/view/MergePackage";
import RemovePackage from "./app/view/RemovePackage";
import UnpackPackage from "./app/view/UnpackPackage";
import OutStock from "./app/view/OutStock";
import PrintPackageDetails from "./app/view/PrintPackageDetails";
import Logout from "./app/view/Logout";
import Warehouse from "./app/view/Warehouse";
import ScalesTest from "./app/view/ScalesTest";

import {navigationRef} from './app/util/RootNavigation';
import {order_logout, user_login} from "./app/util/api";
import AuthContext from "./app/util/AuthContext";
import JPush from "jpush-react-native";

const Stack = createStackNavigator();

const App = () => {
    useEffect(() => {
        JPush.addConnectEventListener((result) => {
            console.log("connectListener:" + JSON.stringify(result));
        });
        JPush.init();
        SplashScreen.preventAutoHideAsync();
        AsyncStorage.getItem("token")
            .then((res) => {
                dispatch({
                    type: "RESTORE_TOKEN",
                    token: res,
                });
            })
            .finally(() => {
                SplashScreen.hideAsync();
            });
    }, []);
    const [state, dispatch] = useReducer(
        (prevState, action) => {
            switch (action.type) {
                case "RESTORE_TOKEN":
                    // 这个时候是获取到了token
                    return {
                        ...prevState,
                        token: action.token,
                        isloading: false,
                    };
                case "SIGN_IN":
                    // 登录完毕
                    return {
                        ...prevState,
                        isloading: false,
                        token: action.token,
                    };
                case "SIGN_OUT":
                    // 登出
                    AsyncStorage.removeItem("token");
                    AsyncStorage.removeItem("WarehouseList");
                    return {
                        ...prevState,
                        token: null,
                        isSignout: true,
                    };
                default:
                    break;
            }
        },
        {
            isLoading: true,
            isSignout: false,
            token: null,
        }
    );
    const authContext = useMemo(() => ({
        signIn(userInfo) {
            // 登录
            JPush.getRegistrationID(({registerID}) => {
                console.log("registerID:" + registerID);
                user_login({
                    ...userInfo,
                    registerID,
                }).then(() => {
                    dispatch({
                        type: "SIGN_IN",
                        token: "---",
                    });
                });
            });
        },
        signOut() {
            order_logout()
            // 登出
            dispatch({
                type: "SIGN_OUT",
            });
        },
        signUp() {
            // 注册
            dispatch({
                type: "SIGN_IN",
                token: "---",
            });
        },
    }));
    return (
        <AuthContext.Provider value={authContext}>
            <Provider>
                <NavigationContainer ref={navigationRef}>
                    <StatusBar style="auto"/>
                    {/* headerMode={'none'} */}
                    <Stack.Navigator>
                        {/* initialRouteName={"login"} */}
                        {state.token === null ? (
                            <>
                                <Stack.Screen
                                    name="login"
                                    options={{
                                        title: "登录",
                                        animationTypeForReplace: state.isSignout ? "pop" : "push",
                                    }}
                                    component={Login}
                                />
                            </>

                        ) : (
                            <>
                                <Stack.Screen
                                    name="home"
                                    options={{title: "首页"}}
                                    component={Home}
                                />
                                <Stack.Screen
                                    name="scalesTest"
                                    options={{title: "蓝牙秤初始化"}}
                                    component={ScalesTest}
                                />


                                <Stack.Screen
                                    name="modifyPassword"
                                    options={{
                                        title: "修改密码",
                                    }}
                                    component={ModifyPassword}
                                />
                                <Stack.Screen
                                    name="scan"
                                    options={{title: "扫描"}}
                                    component={PrintPackageDetails}
                                />
                                <Stack.Screen
                                    name="outStock"
                                    options={{title: "出库"}}
                                    component={OutStock}
                                />
                                <Stack.Screen
                                    name="removePackage"
                                    options={{title: "减包"}}
                                    component={RemovePackage}
                                />
                                <Stack.Screen
                                    name="unpackPackage"
                                    options={{title: "拆包"}}
                                    component={UnpackPackage}
                                />
                                <Stack.Screen
                                    name="list"
                                    options={{title: "列表"}}
                                    component={List}
                                />
                                <Stack.Screen
                                    name="createExpress"
                                    options={{title: "创建运单"}}
                                    component={CreateExpress}
                                />
                                <Stack.Screen
                                    name="search"
                                    options={{title: "搜索"}}
                                    component={Search}
                                />
                                <Stack.Screen
                                    name="set"
                                    options={{title: "设置"}}
                                    component={Set}
                                />
                                <Stack.Screen
                                    name="printConfig"
                                    options={{title: "打印机连接设置"}}
                                    component={PrintConfig}
                                />
                                <Stack.Screen
                                    name="scalesConfig"
                                    options={{title: "秤连接设置"}}
                                    component={ScalesConfig}
                                />

                                <Stack.Screen
                                    name="mergePackage"
                                    options={{title: "合包"}}
                                    component={MergePackage}
                                />

                                <Stack.Screen
                                    name="logout"
                                    options={{title: "登出"}}
                                    component={Logout}
                                />
                                <Stack.Screen
                                    name="warehouse"
                                    options={{title: "入库"}}
                                    component={Warehouse}
                                />

                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        </AuthContext.Provider>
    );
};

// export default () => {
//   useEffect(() => {
//     SplashScreen.hideAsync();
//   }, []);
//   return <View>
//       <Text>3333</Text>
//       <CCCCTest />
//   </View>;
// };

export default App;
