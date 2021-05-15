import React, {useEffect, useRef, useState} from "react";
import {PixelRatio, Text, View} from "react-native";
import {Button, InputItem, ListView, Modal, Toast, WhiteSpace,} from "@ant-design/react-native";
import {pack_addpack, pack_createcode, pack_createpack} from "../../util/api";
import Print from "../../util/print";
import usePdaScan from "react-native-pda-scan";
import {TouchableOpacity} from "react-native-gesture-handler";

export default ({navigation, route}) => {
    const ref = useRef();
    const blue = useRef();
    const [state, setState] = useState({
        input_sn: "",
        input_sn_list: [],
        count: 0,
        price: 0,
        weight: 0,
    });
    const [expansion, setExpansion] = useState([]);
    /**
     * 初始化链接蓝牙
     */
    useEffect(() => {
        navigation.setOptions({title: route.params.type === 0 ? "合包" : "集包"});
        blue.current = new Print();
        return () => {
            blue.current.disconnect();
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

    const handlePrint = async (item) => {
        const num = item.num;
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
    const handleCreateQrcode = () => {
        Modal.alert("警告", "确定创建一个运单?", [
            {
                text: "取消",
                style: "cancel",
            },
            {
                text: "确定",
                onPress: () => {
                    pack_createcode({
                        type: route.params.type + 1,
                    }).then((res) => {
                        const {codeNum} = res;
                        setState((state) => {
                            return {
                                ...state,
                                input_sn_list: [codeNum],
                            };
                        });
                        handlePrint({
                            packageNum: codeNum,
                            flag: res.codeType,
                        });
                    });
                },
            },
        ]);
    };
    const handleChangeText = (text) => {
        setState((state) => {
            return {
                ...state,
                input_sn: text,
            };
        });
    };
    const handleSubmitEditing = ({nativeEvent: {text}}) => {
        const {input_sn_list} = state;

        if (!input_sn_list.includes(text)) {
            input_sn_list.push(text);
        }

        pack_addpack({
            codeNum: [...input_sn_list].join(","),
            type: route.params.type + 1,
        }).then((res) => {
            if (res.success === false) {
                Toast.fail(res.msg);
            }
            // count: "64"
            // data: (8)
            // pcodeNum: "PK1611758823"
            // price: 111.01

            const {count, data, pcodeNum, price, weight} = res;
            //   if (count) {
            // 去掉的具体原因参考20210130下午五点钟的消息记录
            ref.current.ulv.updateRows(data, 0);
            setState((state) => {
                return {
                    ...state,
                    input_sn: "",
                    input_sn_list: pcodeNum ? [pcodeNum] : [],
                    count,
                    price,
                    weight,
                };
            });
            //   }
        });
        // setState((state) => {
        //   const { input_sn_list } = state;
        //   const length = input_sn_list.length;
        //   if (length <= 1) {
        //     input_sn_list.push(text);
        //   }
        //   return {
        //     ...state,
        //     input_sn_list,
        //     input_sn: "",
        //   };
        // });
    };
    const handleMerge = () => {
        if (state.input_sn_list.length === 0) {
            Modal.alert("提示", "没有找到sn,合包失败!");
            return;
        }
        Modal.alert("警告", "确认?", [
            {
                text: "取消",
                style: "cancel",
            },
            {
                text: "确定",
                onPress: () => {
                    pack_createpack({
                        pcodeNum: state.input_sn_list[0],
                    }).then((res) => {
                        if (res.success === false) {
                            Modal.alert("提示", res.msg);
                            setState((state) => {
                                return {
                                    ...state,
                                    input_sn: "",
                                    count: 0,
                                    weight: 0,
                                    price: 0,
                                    input_sn_list: [],
                                };
                            });
                            return;
                        }
                        console.log(res);
                        Modal.alert(
                            "提示",
                            route.params.type == 0 ? "合包成功!" : "集包成功!"
                        );
                        setState((state) => {
                            return {
                                ...state,
                                count: 0,
                                weight: 0,
                                price: 0,
                                input_sn_list: [],
                            };
                        });
                        ref.current.ulv.updateRows([], 0);
                        const data = res.data;
                        handlePrint({
                            supplier: data.supplier,
                            packageNum: data.codeNum,
                            expected_time: data.createTime,
                            name: data.consignee.consignee,
                            mobile: data.consignee.mobile,
                            to: data.toChannelID,
                            shipping: data.shippingID,
                            payment: data.payment,
                            client_phone: data.client_phone,
                            flag: res.codeType,
                            trueAddr: res.trueAddr,
                            num: res.num,

                        });
                    });
                },
            },
        ]);
    };
    const renderRow = ({title, value}) => {
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
                    }}
                >
                    <View style={{flex: 1}}>
                        <Text style={{fontSize: 14, color: "#888"}}>
                            {title}
                            <Text style={{fontWeight: "bold"}}>{value}</Text>
                        </Text>
                    </View>
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
                    title: "合  包  号:  ",
                    value: state.input_sn_list[0],
                })}

                {renderRow({
                    title: "包裹个数:  ",
                    value: state.count,
                })}

                {renderRow({
                    title: "重          量:  ",
                    value: state.weight + "kg",
                })}

                {renderRow({
                    title: "价          格:  ",
                    value: state.price + "元",
                })}
                <WhiteSpace/>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <Button type="primary" onPress={handleCreateQrcode}>
                        生成新条码
                    </Button>
                    <Button type="warning" onPress={handleMerge}>
                        {route.params.type === 0 ? "合包" : "集包"}
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
    const renderItem = (item) => {
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
                        运单号:{item.codeNum}
                    </Text>
                    {expansion.includes(item.codeNum) ? (
                        <>
                            <WhiteSpace/>
                            <Text style={{fontSize: 20, color: "#333"}}>
                                目的站:{item.toChannelID}
                            </Text>
                            <WhiteSpace/>
                            <Text style={{fontSize: 20, color: "#333"}}>
                                运输方式:{item.shippingID}
                            </Text>
                            <WhiteSpace/>
                            <Text style={{fontSize: 20, color: "#333"}}>
                                承运商:{item.supplierID}
                            </Text>
                            <WhiteSpace/>
                            <Text style={{fontSize: 20, color: "#333"}}>
                                收件人:{item.consignee.consignee}
                            </Text>
                        </>
                    ) : null}
                </TouchableOpacity>
            </View>
        );
    };
    return (
        <View style={{backgroundColor: "#fff", flex: 1}}>
            <View style={{flex: 1}}>
                <ListView
                    ref={ref}
                    header={renderHeader}
                    onFetch={(page = 1, startFetch, abortFetch) => {
                        abortFetch();
                    }}
                    renderItem={renderItem}
                    displayDate
                    paginationWaitingView={() => <></>}
                    paginationFetchingView={() => <></>}
                    paginationWaitingView={() => <></>}

                    keyExtractor={({codeNum}) => `key--${codeNum}`}
                />
            </View>
        </View>
    );
};
