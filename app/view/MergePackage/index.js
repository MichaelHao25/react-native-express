import React, {useEffect, useRef, useState} from "react";
import {Image, PixelRatio, Text, View} from "react-native";
import {Button, Checkbox, InputItem, ListView, Modal, Popover, Toast, WhiteSpace} from "@ant-design/react-native";
import {common_bag, pack_addpack, pack_createcode, pack_createpack, pack_pack} from "../../util/api";
import Print from "../../util/print";
import Scales from "../../util/scales";

import usePdaScan from "react-native-pda-scan";
import {TouchableOpacity} from "react-native-gesture-handler";

export default ({navigation, route}) => {
    const ref = useRef();
    const blue = useRef();
    const scales = useRef();
    const [state, setState] = useState({
        input_sn: "",
        input_sn_list: [],
        count: 0,
        price: 0,
        weight: 0,
        getWeight: false,
    });
    const [expansion, setExpansion] = useState([]);
    const [common_bag_list, setCommon_bag_list] = useState({
        0: '无'
    });
    const [common_bag_select, setCommon_bag_select] = useState(0);
    const [weight, setWeight] = useState('');
    /**
     * 防止合包成功，但是打印机故障的时候存储上一次的pcode
     */
    const [prevPCode, setPrevPCode] = useState('');
    /**
     * 初始化链接蓝牙
     */
    useEffect(() => {
        navigation.setOptions({title: route.params.type === 0 ? "合包" : "集包"});
        blue.current = new Print();
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
        return () => {
            scales.current.handleUnbindNotificationEvent()
            scales.current.stopNotification()
            blue.current.disconnect();
        };
    }, []);
    useEffect(() => {
        common_bag().then(res => {
            const {data = []} = res;
            setCommon_bag_list(res => {
                return {...res, ...data}
            })
        })
    }, [])

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
            handleMerge(weight)
        }
    }, [weight])
    const handleGetWeight = () => {
        scales.current.connect().then(() => {
            scales.current.write();
        })
    }
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
            /**
             * 加包的时候获取主包号兜底打印
             */
            setPrevPCode(pcodeNum)
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
    const handleMergeAfter = () => {
        if (state.input_sn_list.length === 0) {
            Modal.alert("提示", "没有找到sn,合包失败!");
            return;
        }
        handleGetWeight();
        // if(state.getWeight===false){
        //
        // }else if(common_bag_select===1) {
        //
        // }else{
        //
        // }
        // common_bag_list

    }
    const handleMerge = (getWeight) => {
        console.log('handleMerge')
        // getWeigth
        let packageName = '';
        let packageWeight = '';
        let content = ''
        const res = {
            pcodeNum: state.input_sn_list[0],
        };
        if (common_bag_select !== 0) {
            packageName = common_bag_list[common_bag_select]
        }
        if (state.getWeight === true) {
            packageWeight = getWeight.join('');
            res.weight = packageWeight.replace(/[ kg]/g, '')
        }
        if (packageName) {
            content += `${packageName},  `;
            res.bag = common_bag_select;
        }
        if (packageWeight) {
            content += `${getWeight.join('')}`;
        }


        Modal.alert("警告", content, [
            {
                text: "取消",
                style: "cancel",
            },
            {
                text: "确定",
                onPress: () => {
                    pack_createpack(res).then((res) => {
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
                    }}
                >
                    {renderContent()}
                </View>
            </>
        );
    };
    const getBagName = () => {
        const res = Object.entries(common_bag_list).find(([key, value]) => parseInt(key) === common_bag_select)
        const [, name = ''] = res;
        return name
    }
    /**
     * 打印条码，如果合包成功，但是条码没有出现的情况的一个兜底
     */
    const printBarCode = () => {
        pack_pack({
            pcodeNum: prevPCode,
            // type:route.params.type === 0
        }).then(res => {
            const data = res.data;
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
        })
    }
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
                    title() {
                        return <Text>{`重        量:  ${state.weight}kg`}</Text>
                    },
                    value() {
                        return <Checkbox defaultChecked={state.getWeight} onChange={({target}) => {
                            const {checked} = target
                            setState(state => {
                                return {
                                    ...state,
                                    getWeight: checked,
                                }
                            })
                        }
                        }>称重</Checkbox>
                    }
                })}

                {renderRow({
                    title() {
                        // overlay

                        return <Popover
                            overlay={Object.entries(common_bag_list).map(([key, value]) => {
                                return <Popover.Item key={key} value={key}
                                                     style={{backgroundColor: common_bag_select === parseInt(key) ? '#efeff4' : '#fff'}}>
                                    <Text>{value}</Text>
                                </Popover.Item>
                            })}
                            onSelect={v => {
                                setCommon_bag_select(parseInt(v))
                            }}
                        >
                            <View
                                style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text>{`包  装  袋：${getBagName()}`}</Text>
                                <Image
                                    style={{width: 16, height: 16, marginLeft: 5}}
                                    resizeMode={"contain"}
                                    source={require('../../image/dropDown.png')}
                                />
                            </View>
                        </Popover>
                    },
                    value() {
                        return null
                    },
                })}

                <WhiteSpace/>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <Button type="primary" onPress={handleCreateQrcode}>
                        生成
                    </Button>
                    <Button type="primary" onPress={printBarCode}>
                        {/*onPress={handleCreateQrcode}*/}
                        打印
                    </Button>
                    <Button type="warning" onPress={handleMergeAfter}>
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
}
;
