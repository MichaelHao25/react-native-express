import React, {useEffect, useReducer, useState} from "react";
import {Image, ScrollView, Text, View} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {useFocusEffect} from "@react-navigation/native";
import {Badge, Grid, List,} from "@ant-design/react-native";
import {order_count} from "../../util/api";
import theme from "../../theme";
import JPush from "jpush-react-native";

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
    const [list, setList] = useState([
        {
            icon: require("../../image/merge.png"),
            text: `合包`,
            type: 'package'
        },
        {
            icon: require("../../image/merge.png"),
            text: `集包`,
            type: 'gather'
        },
        {
            icon: require("../../image/merge.png"),
            text: `减包`,
            type: 'subpackage'
        },
        {
            icon: require("../../image/merge.png"),
            text: `拆包`,
            type: 'deletepackage'
        },
        {
            icon: require("../../image/merge.png"),
            text: `出库`,
            type: 'storeout'
        },
        {
            icon: require("../../image/set.png"),
            text: `设置`,
            type: 'normal'
        },
        {
            icon: require("../../image/none.png"),
            text: `扫描`,
            type: 'scan'

        },
        {
            icon: require("../../image/none.png"),
            text: `已揽件`,
            type: 'orders'
        },
    ])
    useEffect(() => {
        AsyncStorage.getItem('auth').then(res => {
            const auth = JSON.parse(res)
            const tempList = list.filter(item => {
                if (item.type === 'normal') {
                    return true;
                }
                return auth.includes(item.type)
            });
            setList(tempList);
        })
        JPush.addNotificationListener(msg => {
            console.log(msg)
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
        })
    }, [])
    useFocusEffect
    (
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
            case 'package': {
                navigation.navigate("mergePackage", {
                    type: 0,
                });
                break;
            }
            case 'gather': {
                navigation.navigate("mergePackage", {
                    type: 1,
                });
                break;
            }
            case 'subpackage': {
                navigation.navigate("removePackage");
                break;
            }
            case 'deletepackage': {
                navigation.navigate("unpackPackage");
                break;
            }
            case 'storeout': {
                navigation.navigate("outStock");
                break;
            }
            case 'scan': {
                navigation.navigate("scan");
                break;
            }
            case 'orders': {
                navigation.navigate("list", {
                    title: "已揽件列表",
                    status: 1,
                });
                break;
            }
            default: {
                navigation.navigate("set");
                break;
            }
        }
    };
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
                <List.Item
                    arrow="horizontal"
                    onPress={() => {
                        navigation.navigate("list", {
                            title: "待揽件列表",
                            status: 0,
                        });
                    }}
                    extra={state.wait_accept}
                >
                    {parseInt(state.wait_accept) === 0 ? (
                        <Text>待揽件数量</Text>
                    ) : (
                        <Badge dot>
                            <Text>待揽件数量</Text>
                        </Badge>
                    )}
                </List.Item>
                <List.Item
                    arrow="horizontal"
                    onPress={() => {
                        navigation.navigate("list", {
                            title: "今日已揽件列表",
                            status: 1,
                            today: 1,
                        });
                    }}
                    extra={state.end_accept}
                >
                    <Text>今日已揽件列表</Text>
                    {/* <Badge dot></Badge> */}
                </List.Item>
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
