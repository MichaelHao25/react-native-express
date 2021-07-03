import React, {useEffect, useRef, useState} from "react";
import {FlatList, PixelRatio, Text, View} from "react-native";
import {Button, InputItem, Modal, Toast, WhiteSpace} from "@ant-design/react-native";
import Scales from "../../util/scales";
import Print from "../../util/print";
import {order_storein} from "../../util/api";
import usePdaScan from "react-native-pda-scan";
import {TouchableOpacity} from "react-native-gesture-handler";
import AsyncStorage from "@react-native-community/async-storage";


export default ({navigation, route}) => {
    const ref = useRef();
    const blue = useRef();
    const scales = useRef();
    const [state, setState] = useState({
        input_sn: "",
        count: 0,
        weight: 0,
    });
    const [list, setList] = useState([]);
    const [expansion, setExpansion] = useState([]);
    const [weight, setWeight] = useState('');
    useEffect(() => {
        AsyncStorage.getItem('WarehouseList').then(WarehouseList => {
            console.log('WarehouseList', WarehouseList)
            if (WarehouseList !== null) {
                setList(JSON.parse(WarehouseList));
            }
        })

    }, []);
    useEffect(() => {
        return () => {
            AsyncStorage.setItem('WarehouseList', JSON.stringify(list));
        }
    }, [list])
    /**
     * 初始化链接蓝牙
     */
    useEffect(() => {
        navigation.setOptions({title: route.params.title});
        if (route.params.type === 'storeInByPrint') {
            blue.current = new Print();
            blue.current.boot().then(() => {
                return blue.current.getPeripheralId();
            })
        }

        if (route.params.type === 'storeInByWeigh') {
            scales.current = new Scales({
                handleBindNotificationEvent({
                                                data
                                            }) {
                    const res = data.match(/\d.*?kg/);
                    if (res) {
                        const [weight = '0.00 kg'] = res;
                        setWeight([...weight])
                    } else {
                        setWeight([...'0.00 kg'])
                    }
                    // const [weight = '0.00 kg'] = 'data'.match(/\d.*?$/)
                }
            });
            scales.current.boot().then(() => {
                return scales.current.getPeripheralId();
            }).then(() => {
                return scales.current.connect();
            })
                .then(() => {
                    return scales.current.retrieveServices()
                })
                .then(res => {
                    scales.current.handleBindNotificationEvent()
                    return scales.current.startNotification()
                })
        }
        return () => {
            if (route.params.type === 'storeInByWeigh') {
                scales.current.handleUnbindNotificationEvent()
                scales.current.stopNotification()
            }
            if (route.params.type === 'storeInByPrint') {
                blue.current.disconnect();
            }
        };
    }, []);
    usePdaScan({
        onEvent(e) {
            console.log(e);
            handleSubmitEditing({
                nativeEvent: {
                    text: e,
                },
            });
        },
        onError(e) {
            console.log(e);
        },
        trigger: "always",
    });
    useEffect(() => {
        console.log('useEffect-weight')
        if (weight) {
            /**
             * 第三步获取到重量信息
             */
            handle_order_storeinBefore(weight)
        }
    }, [weight])
    /**
     * 第二部向设备发送信息
     */
    const handleGetWeight = () => {
        /**
         * 如果真的话就需要称重，假的话就不用称重
         */
        if (route.params.type === 'storeInByWeigh') {
            scales.current.connect().then(() => {
                scales.current.write();
            })
        } else {
            setWeight([...route.params.type])
        }
    }
    const handleChangeText = (text) => {
        setState((state) => {
            return {
                ...state,
                input_sn: text,
            };
        });
    };
    /**
     * 第四步请求接口的前置动作
     * @param codeNum
     */
    const handle_order_storeinBefore = (weight) => {
        /**
         * 如果是真的话就提示重量信息
         */
        if (route.params.type === 'storeInByWeigh') {
            let int_weight = parseFloat(weight.join('').replace(/[ kg]/g, ''));
            if (int_weight <= 0) {
                Modal.alert("警告", `重量为：${weight.join('')},确定提交`, [
                    {
                        text: "取消",
                        style: "cancel",
                    },
                    {
                        text: "确定",
                        onPress: () => {
                            handle_order_storein(weight)
                        }
                    }])
            } else {
                handle_order_storein(weight)
            }
        } else {
            handle_order_storein(weight)
        }
    }
    /**
     * 可选打印条码
     * @param item
     * @returns {Promise<void>}
     */
    const handlePrint = async (item) => {
        const num = item.num || 1;
        for (let i = 1; i <= parseInt(num); i++) {
            try {
                blue.current.getPrint({
                    ...item,
                    pages: `${i}/${num}`
                });
                await blue.current
                    .connect()
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((error) => {
                        console.log(error);
                    });


            } catch (e) {
                console.log(e)
            }
        }
    };
    /**
     * 第五步请求接口
     * @param weight
     */
    const handle_order_storein = (weight) => {
        const res = {
            codeNum: state.input_sn,
            weight: weight.join('').replace('kg', '')
        }

        /**
         * 如果不是称重的话就删除重量信息
         */
        if (route.params.type !== 'storeInByWeigh') {
            delete res.weight
        }
        console.log('res', res)
        order_storein(res).then(res => {
                const {data, success, msg} = res;
                if (success === false) {
                    Toast.fail(msg);
                } else {
                    const {weight, num} = data;
                    setState(state => {
                        state.weight = parseFloat(weight);
                        state.count = parseInt(num);
                        return {
                            ...state,
                        }
                    })
                    setList(list => {
                        list.unshift(data);
                        return [...list]
                    })
                    if (route.params.type === 'storeInByPrint') {
                        handlePrint({
                            supplier: data.supplier,
                            packageNum: data.codeNum,
                            expected_time: data.createTime,
                            name: data?.consignee.consignee,
                            mobile: data?.consignee.mobile,
                            to: data.toChannelID,
                            shipping: data.shippingID,
                            payment: data.payment,
                            client_phone: data.client_phone,
                            flag: res.codeType,
                            trueAddr: res.trueAddr,
                            num: res.num,
                        });
                    }
                }
            }
        )
    }
    /**
     * 第一步获取物流单号
     * @param text
     */
    const handleSubmitEditing = ({nativeEvent: {text}}) => {
        setState(state => {
            return {
                ...state,
                input_sn: text
            }
        })
        // 第二步去获取重量
        handleGetWeight()
    }
    const renderRow = ({title, value}) => {
        const renderContent = () => {
            if (typeof title === 'function' && typeof value === 'function') {
                return <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    {title()}
                    {value()}
                </View>
            } else {
                return <View style={{flex: 1}}>
                    <Text style={{fontSize: 14, color: "#888"}}>
                        {title}
                        <Text style={{fontWeight: "bold"}}>{value}</Text>
                    </Text>
                </View>
            }
        }
        return (
            <>
                <View
                    style={{
                        flexDirection: "column",
                        paddingHorizontal: 15,
                        paddingVertical: 9,
                        backgroundColor: "#f5f5f9",
                        borderBottomColor: "#ddd",
                        borderBottomWidth: 1 / PixelRatio.get(),
                        height: 40,
                    }}
                >
                    {renderContent()}
                </View>
            </>
        );
    };
    const renderHeader = () => {
        return (
            <View>
                <View>
                    <InputItem
                        autoCapitalize="none"
                        type="text"
                        placeholder="等待扫描中.."
                        value={state.input_sn}
                        onChangeText={handleChangeText}
                        onSubmitEditing={handleSubmitEditing}
                    />
                </View>
                {renderRow({
                    title: "包裹个数:  ",
                    value: state.count,
                })}
                {renderRow({
                    title: '重        量:  ',
                    value: `${state.weight}kg`
                })}
                {renderRow({
                    title: '订  单  数:  ',
                    value: `${list.length}`
                })}
                <WhiteSpace/>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <Button type="primary" onPress={() => {
                        /**
                         * 点击按钮，第一步
                         */
                        handleSubmitEditing({
                            nativeEvent: {
                                text: state.input_sn,
                            },
                        })
                    }}>
                        入库
                    </Button>
                </View>
                <WhiteSpace/>
                <View
                    style={{
                        flexDirection: "row",
                        paddingHorizontal: 15,
                        paddingVertical: 9,
                        backgroundColor: "#f5f5f9",
                    }}
                >
                    <View style={{flex: 1}}>
                        <Text style={{fontSize: 14, color: "#888"}}>包裹信息</Text>
                    </View>
                </View>
            </View>
        );
    };
    const renderItem = ({item}) => {
        return (
            <View
                style={{
                    borderBottomColor: "#ddd",
                    borderBottomWidth: 1 / PixelRatio.get(),
                    paddingHorizontal: 15,
                    flexDirection: "column",
                    paddingVertical: 15,
                }}
            >
                <TouchableOpacity
                    style={{flexDirection: "column"}}
                    activeOpacity={0.9}
                    onPress={() => {
                        setExpansion((res) => {
                            if (res.includes(item.codeNum)) {
                                return [...res.filter((a) => a !== item.codeNum)];
                            } else {
                                res.push(item.codeNum);
                                return [...res];
                            }
                        });
                    }}
                >
                    <Text style={{fontSize: 20, color: "#333"}}>
                        [{item.shippingID}]{' '}
                        <Text style={{fontWeight: 'bold'}}>{item.toChannelID}</Text>
                        {' '}{item.consignee.consignee} {item.weight}KG
                    </Text>
                    {expansion.includes(item.codeNum) ? (
                        <>
                            <WhiteSpace/>
                            <Text style={{fontSize: 20, color: "#333"}}>
                                订单号:{item.codeNum}
                            </Text>
                            {/*<WhiteSpace/>*/}
                            {/*<Text style={{fontSize: 20, color: "#333"}}>*/}
                            {/*    运输方式:{item.shippingID}*/}
                            {/*</Text>*/}
                        </>
                    ) : null}
                </TouchableOpacity>
            </View>
        );
    };
    return (
        <View style={{backgroundColor: "#fff", flex: 1}}>
            <View style={{flex: 1}}>
                {renderHeader()}
                <FlatList
                    style={{flex: 1}}
                    keyExtractor={({codeNum}) => `key--${codeNum}`}
                    renderItem={renderItem}
                    data={list}
                />
            </View>
        </View>
    );
};
