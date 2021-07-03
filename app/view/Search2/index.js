import React, {useEffect, useRef, useState} from "react";
import {FlatList, PixelRatio, Text, View} from "react-native";
import {Button, InputItem, Modal, Toast, WhiteSpace, WingBlank} from "@ant-design/react-native";
import {order_claim, order_pickup, order_scan_list} from "../../util/api";
import Print from "../../util/print";
import usePdaScan from "react-native-pda-scan";

/**
 * 搜索展示列表
 * @param navigation
 * @param route
 * @returns {JSX.Element}
 */
export default ({navigation, route}) => {
    const blue = useRef();
    const [list, setList] = useState([]);
    const [end, setEnd] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [params, setParams] = useState(() => {
        return {
            page: 1,
            limit: 5,
            keyword: ''
        }
    });
    const [extend, setExtend] = useState('');
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
        blue.current = new Print();
        blue.current.boot().then(() => {
            return blue.current.getPeripheralId();
        })
        return () => {
            blue.current.disconnect();
        };
    }, []);
    // useEffect(() => {
    //     if (params.keyword !== '') {
    //         onFetch()
    //     }
    // }, [params])
    const reloadList = (body = {}) => {
        const paramsValid = Object.keys(body).length !== 0;
        console.log('paramsValid', paramsValid)
        setRefreshing(true);
        setEnd(false);
        if (paramsValid) {
            onFetch({
                ...body,
                page: 1,
            })
        } else {
            console.log('reloadList', params)
            onFetch({
                ...params,
                page: 1,
            })
        }
    }
    const loadMore = () => {
        console.log('loadMore')
        if (loading === false) {
            onFetch();
        }
    }
    /**
     * 如果有参数的话就按照参数来传没有的话反之
     * @param body
     */
    const onFetch = (body = {}) => {
        setLoading(true);
        /**
         * 是否有参数传过来/true有，false没有
         */
        const paramsValid = Object.keys(body).length !== 0
        if (paramsValid === false) {
            if (end) {
                return;
            }
        }
        order_scan_list(paramsValid ? body : params)
            .then((res) => {

                const {data} = res;
                if (data.length < params.limit) {
                    setEnd(true)
                } else {
                    setEnd(false);
                }
                if (paramsValid) {
                    setRefreshing(false);
                }
                setList(list => paramsValid ? [...data] : [...list, ...data])
                setLoading(false)
                if (paramsValid) {
                    setParams(params => {
                        return {
                            ...body,
                            page: paramsValid ? 2 : params.page + 1,
                        }
                    })
                } else {
                    setParams(params => {
                        return {
                            ...params,
                            page: paramsValid ? 2 : params.page + 1,
                        }
                    })
                }
            })
    };
    //   取件
    const handle_order_pickup = ({orderID, item}) => {
        // console.log(ref.current.ulv.getRows());
        // ref.current.ulv.getPage()
        // ref.current.ulv.updateRows(,0)

        Modal.alert("警告", "确认?", [
            {
                text: "取消",
                style: "cancel",
            },
            {
                text: "确定",
                onPress: () => {
                    order_pickup({orderID}).then((res) => {
                        console.log(res);
                        const tempList = list.filter(value => {
                            return value.orderID !== orderID;

                        })
                        setList([...tempList])
                        // let dataSource = [...ref.current.ulv.getRows()];
                        // dataSource = dataSource.filter((value) => {
                        //     if (value.orderID === orderID) {
                        //         value.status = 1;
                        //         return false;
                        //     }
                        //     return true;
                        // });
                        // ref.current.ulv.updateRows(dataSource, 0);
                        Toast.success("成功!", 2, () => {
                        }, false);
                        handlePrint({item});
                    });
                },
            },
        ]);
    };
    // 领取
    const handle_order_claim = ({orderID}) => {
        Modal.alert("警告", "确认?", [
            {
                text: "取消",
                style: "cancel",
            },
            {
                text: "确定",
                onPress: () => {
                    order_claim({orderID}).then((res) => {
                        console.log(res);
                        // const dataSource = [...ref.current.ulv.getRows()];
                        // dataSource.find((value) => {
                        //     if (value.orderID === orderID) {
                        //         value.adminID = 2;
                        //         return true;
                        //     }
                        //     return false;
                        // });
                        // ref.current.ulv.updateRows(dataSource, 0);
                        list.some(value => {
                            if (value.orderID === orderID) {
                                value.adminID = 2;
                                return true;
                            }
                        })
                        setList([...list])
                        Toast.success("成功!", 2, () => {
                        }, false);
                    });
                },
            },
        ]);
    };
    const handlePrint = async ({item}) => {
        const {
            packageNum,
            expected_time,
            consignee: {name, mobile},
            to,
            supplier,
            shipping,
            payment,
            client_phone,
            trueAddr,
            pickup: {addr: pickup_addr = ''} = {},
            num = '1'
        } = item;
        for (let i = 1; i <= parseInt(num); i++) {
            try {

                blue.current.getPrint({
                    supplier,
                    packageNum,
                    expected_time,
                    to,
                    shipping,
                    name,
                    mobile,
                    payment,
                    client_phone,
                    trueAddr,
                    pages: `${i}/${num}`,
                    pickup_addr,
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
    }

    const handleChangeText = (text) => {
        setParams((state) => {
            return {
                ...state,
                keyword: text,
            };
        });
    };
    const handleSubmitEditing = ({nativeEvent: {text: keyword}}) => {
        setParams(state => ({...state, keyword}))
    }
    const handleSearch = () => {

    }
    const renderHeader = () => {
        return (
            <>
                <View>
                    <InputItem
                        autoCapitalize="none"
                        type="text"
                        placeholder="等待扫描中.."
                        value={params.keyword}
                        onChangeText={handleChangeText}
                        onSubmitEditing={handleSubmitEditing}
                    />
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingHorizontal: 15,
                        paddingVertical: 9,
                        alignItems: "center",
                        backgroundColor: "#f5f5f9",
                        borderBottomColor: "#ddd",
                        borderBottomWidth: 1 / PixelRatio.get(),
                    }}
                >
                    <Text style={{fontSize: 12, color: "#333"}}>
                        条码:
                        {/*{state.input_sn}*/}
                    </Text>
                    {/* <Button size="small">清除</Button> */}
                </View>

                <WhiteSpace/>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    {/*<Button type="warning" onPress={handleRemovePackage}>*/}
                    <Button type="warning" onPress={() => reloadList()}>
                        搜索
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
            </>
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
                    //   justifyContent: "space-between",
                    //   alignItems: "center",
                    paddingVertical: 15,
                    backgroundColor: '#fff',
                    margin: 10,
                    marginBottom: 0,
                    borderRadius: 5,
                }}
            >
                {/*预约时间：***********            待取件*/}
                {/*揽件地址：************/}
                {/*现付  1000KG*/}
                {/*--------------------------------------*/}
                {/*南油 - 深圳 - 快件*/}
                {/*寄：王老板（1888888888）*/}
                {/*收：王小姐（188****8888）*/}
                <View style={{flexDirection: "column"}}>
                    <Text style={{
                        fontSize: 20,
                        color: "#333"
                    }}>最晚取件时间：{item.expected_time.replace(/^.*? /, '')} {item.statusName}</Text>
                    <WhiteSpace/>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={{width: '80%'}}><Text
                            style={{fontSize: 20, color: "#333"}}>{item.pickup.address}</Text></View>
                        {/*<Button type={"primary"} size={"small"}*/}
                        {/*        onPress={() => setExtend(id => {*/}
                        {/*            if (id === item.orderID) {*/}
                        {/*                return ''*/}
                        {/*            } else {*/}
                        {/*                return item.orderID;*/}
                        {/*            }*/}
                        {/*        })}>*/}
                        {/*    {extend === item.orderID ? '收缩' : '展开'}*/}
                        {/*</Button>*/}
                    </View>
                    {/*{extend === item.orderID ? <>*/}
                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>{item.payment} {item.weight}</Text>
                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>{item.channel}</Text>
                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>寄:{item.pickup.name}({item.pickup.mobile})</Text>
                    <WhiteSpace/>
                    <Text style={{
                        fontSize: 20,
                        color: "#333"
                    }}>收:{item.consignee.name}({item.consignee.mobile})</Text>
                    {/*</> : null*/}
                    {/*}*/}
                </View>
                <WhiteSpace/>
                {/*{*/}
                {/*    extend === item.orderID ?*/}
                <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
                    {/*{item.adminID === 0 ? (*/}
                    {/*    <WingBlank size="sm">*/}
                    {/*        <Button*/}
                    {/*            type="primary"*/}
                    {/*            onPress={() => {*/}
                    {/*                handle_order_claim({orderID: item.orderID});*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            领取*/}
                    {/*        </Button>*/}
                    {/*    </WingBlank>*/}
                    {/*) : null}*/}
                    {/*{item.status === 0 ? (*/}
                    {/*    <WingBlank size="sm">*/}
                    {/*        <Button*/}
                    {/*            type="primary"*/}
                    {/*            onPress={() => {*/}
                    {/*                handle_order_pickup({orderID: item.orderID, item});*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            取件*/}
                    {/*        </Button>*/}
                    {/*    </WingBlank>*/}
                    {/*) : null}*/}
                    {item.status === 1 ? (
                        <WingBlank size="sm">
                            <Button
                                type="primary"
                                onPress={() => {
                                    handlePrint({item});
                                }}
                            >
                                打印
                            </Button>
                        </WingBlank>
                    ) : null}
                </View>
                {/*        : null*/}
                {/*}*/}
            </View>
        );
    };
    return (
        <View style={{backgroundColor: "#fff", flex: 1}}>
            <View style={{flex: 1,}}>
                {/*<ListView*/}
                {/*    ref={ref}*/}
                {/*    header={renderHeader}*/}
                {/*    onFetch={onFetch}*/}
                {/*    renderItem={renderItem}*/}
                {/*    displayDate*/}
                {/*    keyExtractor={({orderID}) => `key--${orderID}`}*/}
                {/*/>*/}


                {renderHeader()}
                <FlatList
                    style={{backgroundColor: 'gray'}}
                    refreshing={refreshing}
                    onRefresh={reloadList}
                    // ListHeaderComponent={renderHeader}
                    data={list}
                    // renderItem={() => {
                    //     return <View><Text>3333</Text></View>
                    // }}
                    renderItem={renderItem}
                    keyExtractor={({orderID}) => `key--${orderID}`}
                    onEndReachedThreshold={.2}
                    onEndReached={loadMore}
                    ListFooterComponent={() => {
                        return <View><Text style={{textAlign: 'center'}}>{end ? '加载完毕' : "正在疯狂加载中..."}</Text></View>
                    }}
                    ListEmptyComponent={() => {
                        return <View style={{flex: 1}}><Text
                            style={{textAlign: 'center'}}>{loading ? '' : '暂无数据'}</Text></View>
                    }}
                />
            </View>
        </View>
    );
};
