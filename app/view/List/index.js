import React, {useEffect, useRef, useState} from "react";
import {FlatList, PixelRatio, Text, View} from "react-native";
import {Button, Modal, Popover, Toast, WhiteSpace, WingBlank} from "@ant-design/react-native";
import {order_accept_list, order_claim, order_pickup} from "../../util/api";
import Print from "../../util/print";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";

/**
 * 过滤的状态枚举
 * @type {string[]}
 */
const enumStatus = ['全部', '认领', '未认领'];
export default ({navigation, route}) => {
    const blue = useRef();
    const [list, setList] = useState([]);
    const [end, setEnd] = useState(false);
    const [loading, setLoading] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const [params, setParams] = useState(() => {
        return {
            page: 1,
            limit: 5,
            status: route.params.status,
            today: route?.params?.today,
            claim: 0,
            keyword: '',
            st: moment().format('YYYY-MM-DD'),
            et: moment().format('YYYY-MM-DD')
        }
    });
    const [showTime, setShowTime] = useState({
        value: '',
        type: ''
    });
    const [extend, setExtend] = useState('');
    useEffect(() => {
        blue.current = new Print();
        blue.current.boot().then(() => {
            return blue.current.getPeripheralId();
        })
        onFetch()
        return () => {
            blue.current.disconnect();
        };
    }, []);
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
        order_accept_list(paramsValid ? body : params)
            .then((res) => {
                console.log(JSON.stringify(res))
                const {data} = res;
                if (data.length < params.limit) {
                    setEnd(true)
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
        const expected_time = moment().format('YYYY-MM-DD HH:mm');
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
    const handleSearch = () => {
        Modal.prompt(
            '搜索',
            '请输入要搜索的内容',
            keyword => {
                reloadList({
                    ...params,
                    keyword,
                })
            },
            'default',
            params.keyword,
            ['请输入要搜索的内容']
        )
        ;
    }
    const handleSelectDate = ({value, type}) => {
        setShowTime({
            value: moment(value).format(),
            type,
        });
    }
    const renderHeader = () => {
        return (
            <View
                style={{
                    paddingHorizontal: 15,
                    backgroundColor: "#f5f5f9",
                }}>
                <View style={{flexDirection: "row", paddingVertical: 9, justifyContent: 'space-between'}}>
                    <View>
                        <Text style={{fontSize: 14, color: "#888"}} onPress={handleSearch}>搜索:{params.keyword}</Text>
                    </View>
                    <View>
                        <Popover
                            overlay={
                                enumStatus.map((value, index) => {
                                    return <Popover.Item key={index} value={index}
                                                         style={{backgroundColor: params.claim === index ? '#efeff4' : '#fff'}}>
                                        <Text>{value}</Text>
                                    </Popover.Item>
                                })}
                            onSelect={v =>
                                reloadList({
                                    ...params,
                                    claim: v,
                                })
                            }
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "#888",
                                    textAlign: "center",
                                }}
                            >
                                状态：{enumStatus[params.claim]}
                            </Text>
                        </Popover>
                    </View>
                </View>
                <View style={{flexDirection: "row", paddingVertical: 9, justifyContent: 'space-between'}}>
                    <View style={{flexDirection: "column", justifyContent: 'space-between'}}>
                        <Text style={{fontSize: 14, color: "#888"}} onPress={() => {
                            handleSelectDate({value: params.st, type: 'st'})
                        }}>开始时间:{params.st}</Text>
                        <Text style={{fontSize: 14, color: "#888"}} onPress={() => {
                            handleSelectDate({value: params.et, type: 'et'})
                        }}>结束时间:{params.et}</Text>
                    </View>
                    <View>
                        <Button onPress={() => reloadList()}>筛选</Button>
                    </View>
                </View>


                {
                    showTime.value !== '' ?
                        <DateTimePicker
                            value={new Date(showTime.value)}
                            mode={'date'}
                            is24Hour={true}
                            display="default"
                            onChange={({nativeEvent: {timestamp}}) => {
                                setParams(params => {
                                    return {
                                        ...params,
                                        [showTime.type]: moment(timestamp).format('YYYY-MM-DD'),
                                    }
                                })
                                setShowTime({
                                    value: '',
                                    type: ''
                                })
                            }}
                        />
                        : null
                }

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

                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>{item.channel}</Text>
                    <WhiteSpace/>
                    <Text style={{
                        fontSize: 20,
                        color: "#333"
                    }}>收:{item.consignee.name}({item.consignee.mobile})</Text>
                    <WhiteSpace/>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={{width: '80%'}}><Text
                            style={{fontSize: 20, color: "#333"}}>{item.pickup.addr}</Text></View>
                        <Button type={"primary"} size={"small"}
                                onPress={() => setExtend(id => {
                                    if (id === item.orderID) {
                                        return ''
                                    } else {
                                        return item.orderID;
                                    }
                                })}>
                            {extend === item.orderID ? '收缩' : '展开'}
                        </Button>
                    </View>
                    {extend === item.orderID ? <>
                        <WhiteSpace/>
                        <Text style={{
                            fontSize: 20,
                            color: "#333"
                        }}>最晚取件时间：{item.expected_time.replace(/^.*? /, '')} {item.statusName}</Text>
                        <WhiteSpace/>
                        <Text style={{fontSize: 20, color: "#333"}}>{item.payment} {item.weight}</Text>
                        <WhiteSpace/>
                        <Text style={{fontSize: 20, color: "#333"}}>寄:{item.pickup.name}({item.pickup.mobile})</Text>
                        {/*<WhiteSpace/>*/}
                        {/*<Text style={{*/}
                        {/*    fontSize: 20,*/}
                        {/*    color: "#333"*/}
                        {/*}}>收:{item.consignee.name}({item.consignee.mobile})</Text>*/}
                    </> : null
                    }
                </View>
                <WhiteSpace/>
                {
                    extend === item.orderID ?
                        <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
                            {item.adminID === 0 ? (
                                <WingBlank size="sm">
                                    <Button
                                        type="primary"
                                        onPress={() => {
                                            handle_order_claim({orderID: item.orderID});
                                        }}
                                    >
                                        接单
                                    </Button>
                                </WingBlank>
                            ) : null}
                            {item.status === 0 ? (
                                <WingBlank size="sm">
                                    <Button
                                        type="primary"
                                        size={'small'}
                                        onPress={() => {
                                            handle_order_pickup({orderID: item.orderID, item});
                                        }}
                                    >
                                        取件
                                    </Button>
                                </WingBlank>
                            ) : null}
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
                        : null
                }
            </View>
        );
    };
    return (
        <View style={{backgroundColor: "#fff", flex: 1}}>
            <View style={{flex: 1, backgroundColor: 'gray'}}>
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
}
;
