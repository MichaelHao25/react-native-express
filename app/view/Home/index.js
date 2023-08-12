import {Badge, Grid, List, Toast} from "@ant-design/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {useFocusEffect} from "@react-navigation/native";
import React, {useEffect, useReducer, useState} from "react";
import {Image, ScrollView, Text, View} from "react-native";
import Tts from "react-native-tts";
import theme from "../../theme";
import {order_count} from "../../util/api";

export default ({navigation}) => {
    const [state, dispatch] = useReducer(
        (prevStete, action) => {
            switch (action.type) {
                case "ORDER_COUNT":
                    return {
                        ...prevStete,
                        ...action.payload,
                    };
                case "USER_NAME":
                    return {
                        ...prevStete,
                        ...action.payload,
                    };

                default:
                    break;
            }
        },
        {
            userName: "admin",
            end_accept: "0",
            month_amount: "0",
            today_amount: "0",
            wait_accept: "0",
        }
    );
    /**
     * type对应接口的权限字段
     * text是显示的字段
     */
    const [list, setList] = useState([
        {
            icon: require("../../image/merge.png"),
            text: `合包`,
            type: "package",
        },
        {
            icon: require("../../image/merge.png"),
            text: `拼包`,
            type: "gather",
        },
        {
            icon: require("../../image/merge.png"),
            text: `减包`,
            type: "subpackage",
        },
        {
            icon: require("../../image/merge.png"),
            text: `拆包`,
            type: "deletepackage",
        },
        {
            icon: require("../../image/merge.png"),
            text: `出库`,
            type: "storeout",
        },
        {
            icon: require("../../image/none.png"),
            text: `扫描`,
            type: "scan",
        },
        {
            icon: require("../../image/none.png"),
            text: `真实地址`,
            type: "realaddr",
        },

        // {
        //     icon: require("../../image/none.png"),
        //     text: `已揽件`,
        //     type: 'orders'
        // },
        /**
         * 入库三个入口
         * 打码入库 - storeInByPrint
         * 扫码入库 - storeInByScan
         * 称重入库 - storeInByWeigh
         */
        {
            icon: require("../../image/none.png"),
            text: `打码入库`,
            type: "storeInByPrint",
        },
        {
            icon: require("../../image/none.png"),
            text: `扫码入库`,
            type: "storeInByScan",
        },
        {
            icon: require("../../image/none.png"),
            text: `称重入库`,
            type: "storeInByWeigh",
        },
        {
            icon: require("../../image/none.png"),
            text: `查询`,
            type: "searchScan",
        },

        {
            icon: require("../../image/none.png"),
            text: `异常件处理`,
            type: "deal",
        },

        {
            icon: require("../../image/none.png"),
            text: `随货标签`,
            type: "label",
        },
        {
            icon: require("../../image/set.png"),
            text: `设置`,
            type: "normal",
        },
    ]);
    const [oerder, setOrder] = useState(false);
    useEffect(eventType => {
        Tts.setDucking(true);
        Tts.engines().then((engines = []) => {
            if (engines.length === 0) {
                Toast.fail("tts engines 未安装");
            }
        });
        Tts.getInitStatus().then(
            (res) => {
                if (res === "success") {
                    // Toast.info("tts engines 初始化完毕");
                    ;
                }else{
                    Toast.info("tts engines 初始化失败");
                }
                return res;
            },
            (err) => {
                if (err?.code === "no_engine") {
                    Tts.requestInstallEngine();
                }
            }
        );
        const handleTTSStart = (event) => {
            console.log("tts-start", event);
        };
        const handleTTSProgress = (event) => {
            console.log("tts-progress", event);
        };
        const handleTTSFinish = (event) => {
            console.log("tts-finish", event);
        };
        const handleTTSCancel = (event) => {
            console.log("tts-cancel", event);
        };
        Tts.addEventListener("tts-start", handleTTSStart);
        Tts.addEventListener("tts-progress", handleTTSProgress);
        Tts.addEventListener("tts-finish", handleTTSFinish);
        Tts.addEventListener("tts-cancel", handleTTSCancel);
        return eventType => {
            Tts.removeAllListeners("tts-start");
            Tts.removeAllListeners("tts-progress");
            Tts.removeAllListeners("tts-finish");
            Tts.removeAllListeners("tts-cancel");
        };
    }, []);
    useEffect(() => {
        AsyncStorage.getItem("auth").then((res) => {
            const auth = JSON.parse(res);
            const tempList = list.filter((item) => {
                if (item.type === "normal") {
                    return true;
                }
                return auth.includes(item.type);
            });
            setOrder(auth.includes("orders"));
            setList(tempList);
        });
        Tts.speak("hello");
        // JPush.addNotificationListener(msg => {
        //     order_count().then(
        //         ({data: {end_accept, month_amount, today_amount, wait_accept}}) => {
        //             dispatch({
        //                 type: "ORDER_COUNT",
        //                 payload: {
        //                     end_accept,
        //                     month_amount,
        //                     today_amount,
        //                     wait_accept,
        //                 },
        //             });
        //         }
        //     );
        // })
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            order_count().then(
                ({data: {end_accept, month_amount, today_amount, wait_accept}}) => {
                    dispatch({
                        type: "ORDER_COUNT",
                        payload: {
                            end_accept,
                            month_amount,
                            today_amount,
                            wait_accept,
                        },
                    });
                }
            );
        }, [])
    );
    useEffect(() => {
        // Tts.speak("王老板,晚上好!!!!success!");
        AsyncStorage.getItem("username").then((res) => {
            //   setTimeout(() => {
            //   }, 1000);
            dispatch({
                type: "ORDER_COUNT",
                payload: {
                    userName: res,
                },
            });
        });
    }, []);
    const handleGrid = (el, index) => {
        console.log(el, index);
        const type = el.type;
        switch (type) {
            case "package": {
                navigation.navigate("package", {
                    type: 0,
                });
                break;
            }
            case "gather": {
                navigation.navigate("gather", {
                    type: 1,
                });
                break;
            }
            case "subpackage": {
                navigation.navigate("removePackage");
                break;
            }
            case "deletepackage": {
                navigation.navigate("unpackPackage");
                break;
            }
            case "storeout": {
                navigation.navigate("outStock");
                break;
            }
            case "scan": {
                navigation.navigate("scan", {
                    /**
                     * 不显示真实地址
                     */
                    showAddress: false,
                });
                break;
            }
            case "realaddr": {
                navigation.navigate("scan", {
                    /**
                     * 显示真实地址
                     */
                    showAddress: true,
                });
                break;
            }
            case "orders": {
                navigation.navigate("list", {
                    title: "已揽件列表",
                    status: 1,
                });
                break;
            }
            /**
             * 入库三个入口
             * 打码入库 - storeInByPrint
             * 扫码入库 - storeInByScan
             * 称重入库 - storeInByWeigh
             */
            case "storeInByPrint": {
                navigation.navigate("warehouse", {
                    title: "打码入库",
                    type: "storeInByPrint",
                });
                break;
            }
            case "storeInByScan": {
                navigation.navigate("warehouse", {
                    title: "扫码入库",
                    type: "storeInByScan",
                });
                break;
            }
            case "storeInByWeigh": {
                navigation.navigate("warehouse", {
                    title: "称重入库",
                    type: "storeInByWeigh",
                });
                break;
            }
            case "searchScan": {
                navigation.navigate("search2");
                break;
            }
            case "deal": {
                navigation.navigate("deal");
                break;
            }
            case "label": {
                navigation.navigate("goodLabel");
                break;
            }

            default: {
                navigation.navigate("set");
                break;
            }
        }
    };
    console.log("list", list);
    return (
        <ScrollView>
            <List renderHeader={"用户信息"}>
                <List.Item arrow="empty">{state.userName}</List.Item>
                <List.Item>
                    <Grid
                        // package             合包
                        // gather                集包
                        // subpackage       减包
                        // deletepackage   拆包
                        // storeout             出库
                        // scan                    扫描
                        // orders                揽件
                        data={list}
                        renderItem={(item) => {
                            return (
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Image
                                        source={
                                            typeof item.icon === "number"
                                                ? item.icon
                                                : {src: item.icon}
                                        }
                                        style={{
                                            width: theme.icon_size_md,
                                            height: theme.icon_size_md,
                                        }}
                                    />
                                    <View style={{marginTop: theme.h_spacing_sm}}>
                                        <Text style={{fontSize: theme.font_size_icontext}}>
                                            {item.text}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                        onPress={handleGrid}
                        hasLine={true}
                    />
                </List.Item>
                {/* <List.Item
          arrow='horizontal'
          onPress={() => {
            navigation.navigate('barcodeScanner');
          }}
        >
          <Text>扫描</Text>
        </List.Item> */}
                {oerder ? (
                    <>
                        <List.Item
                            arrow="horizontal"
                            onPress={() => {
                                navigation.navigate("list", {
                                    status: 0,
                                });
                            }}
                            // extra={state.wait_accept}
                        >
                            {parseInt(state.wait_accept) === 0 ? (
                                <Text>待揽件</Text>
                            ) : (
                                <Badge dot>
                                    <Text>待揽件</Text>
                                </Badge>
                            )}
                        </List.Item>
                        <List.Item
                            arrow="horizontal"
                            onPress={() => {
                                navigation.navigate("todayList", {
                                    status: 1,
                                    today: 1,
                                });
                            }}
                            // extra={state.end_accept}
                        >
                            <Text>揽件列表</Text>
                            {/* <Badge dot></Badge> */}
                        </List.Item>
                    </>
                ) : null}
                {/* <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "今日总数列表" });
          }}
          extra={state.today_amount}
        >
          <Text>今日总数</Text>
        </List.Item>
        <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "本月总数列表" });
          }}
          extra={state.month_amount}
        >
          <Badge dot>
            <Text>本月总数</Text>
          </Badge>
        </List.Item> */}
                {/* <List.Item arrow="empty" onPress={signOut}>
        <Text>退出登录</Text>
      </List.Item> */}
            </List>
        </ScrollView>
    );
};
