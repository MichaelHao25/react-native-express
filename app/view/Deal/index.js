import React, {useEffect, useState} from "react";
import {FlatList, PixelRatio, Text, View} from "react-native";
import {Button, InputItem, List, Picker, WhiteSpace} from "@ant-design/react-native";
import {common_dealoption, pack_deal} from "../../util/api";
import usePdaScan from "react-native-pda-scan";


export default ({navigation, route}) => {
    const [list, setList] = useState([]);
    const [end, setEnd] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [params, setParams] = useState(() => {
        return {
            type: undefined,
            codeNum: ''
        }
    });
    const [common_dealoptionList, setCommon_dealoptionList] = useState([]);
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
        common_dealoption().then(res => {
            const {data = {}} = res;
            const common_dealoptionList = Object.entries(data).map(([key, value]) => {
                return {
                    label: value,
                    value: key
                }
            })
            if (common_dealoptionList.length !== 0) {
                setParams(params => {
                    return {
                        ...params,
                        type: common_dealoptionList[0].value,
                    }
                })
            }
            setCommon_dealoptionList(common_dealoptionList);
        })
    }, [])
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
        pack_deal(paramsValid ? body : params)
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

    const handleChangeText = (text) => {
        setParams((state) => {
            return {
                ...state,
                codeNum: text,
            };
        });
    };
    const handleSubmitEditing = ({nativeEvent: {text: codeNum}}) => {
        setParams(state => ({...state, codeNum}))
    }
    const renderHeader = () => {
        return (
            <>
                <Picker
                    data={common_dealoptionList}
                    cols={1}
                    value={params.type}
                    format={() => {
                        const {label = ''} = common_dealoptionList.find(item => item.value === params.type) || {}
                        return label;
                    }}
                    onChange={([e]) => {
                        setParams(params => {
                            return {
                                ...params,
                                type: e,
                            }
                        })
                    }}
                >
                    <List.Item arrow="horizontal">异常类型：</List.Item>
                </Picker>
                <View>
                    <InputItem
                        autoCapitalize="none"
                        type="text"
                        placeholder="等待扫描中.."
                        value={params.codeNum}
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
                        提交
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
        if (Object.keys(item).length === 0) {
            return <></>
        }
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
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={{width: '80%'}}><Text
                            style={{fontSize: 20, color: "#333"}}>{item.pickup.address}</Text></View>
                    </View>

                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>{item.payment}-{item.status}</Text>
                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>寄:{item.pickup.name}({item.pickup.mobile})</Text>
                    <WhiteSpace/>
                    <Text style={{
                        fontSize: 20,
                        color: "#333"
                    }}>收:{item.consignee.consignee}({item.consignee.mobile})</Text>

                </View>
                <WhiteSpace/>

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
                    keyExtractor={({codeNum}) => `key--${codeNum}`}
                    // onEndReachedThreshold={.2}
                    // onEndReached={loadMore}
                    // ListFooterComponent={() => {
                    //     return <View><Text style={{textAlign: 'center'}}>{end ? '加载完毕' : "正在疯狂加载中..."}</Text></View>
                    // }}
                    // ListEmptyComponent={() => {
                    //     return <View style={{flex: 1}}><Text
                    //         style={{textAlign: 'center'}}>{loading ? '' : '暂无数据'}</Text></View>
                    // }}
                />
            </View>
        </View>
    );
};
