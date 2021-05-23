import React, {useEffect, useRef, useState} from "react";
import {PixelRatio, Text, View} from "react-native";
import {Button, InputItem, ListView, Modal, WhiteSpace,} from "@ant-design/react-native";
import {pack_realaddr, pack_scan} from "../../util/api";
import Print from "../../util/print";
import usePdaScan from "react-native-pda-scan";


export default ({navigation, route}) => {


    const blue = useRef();

    const [state, setState] = useState({
        input_sn: "",
        count: 0,
        price: 0,
        weight: 0,
    });
    useEffect(() => {
        blue.current = new Print();

        return () => {
            blue.current.disconnect();
        };
    }, []);
    usePdaScan({
        onEvent(e) {
            console.log(e);
            handleRemovePackage({
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
        console.log('num', num)
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

    const handleChangeText = (text) => {
        setState((state) => {
            return {
                ...state,
                input_sn: text,
            };
        });
    };
    const handleRemovePackage = async ({nativeEvent: {text}}) => {
        console.log('text', text)
        if (state.text === "") {
            return;
        }
        let res;
        try {
            /**
             * 根据是否显示真实地址来请求不同的接口
             */
            if (route.params.showAddress === true) {
                res = await pack_realaddr({
                    codeNum: text,
                })
            } else {
                res = await pack_scan({
                    codeNum: text,
                })
            }
        } catch (e) {
            Modal.alert("提示", '请求失败，请检查接口或者网络！');
        }
        if (res.success === false) {

            Modal.alert("提示", res.msg);
            setState((state) => {
                return {
                    ...state,
                    input_sn: "",
                };
            });
        } else {
            // const { count, data, pcodeNum, price, weight } = res;
            setState((state) => {

                return {
                    ...state,
                    input_sn: "",
                };
            });
            const data = res.data;
            console.log('data', data)
            // {"client_phone": "0577-26531009", "codeNum": "SJT1620962651", "consignee": {"consignee": "爆小姐", "mobile": "137****0681"}, "createTime": "2021-05-14 11:24:11", "fromChannelID": null, "num": "1", "payment": "到付", "shippingID": "快件", "status": "已入库", "supplierID": "速安达", "toChannelID": "上海青浦"}

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
                trueAddr: data.trueAddr,
                num: data.num,
            });
        }
    };
    const renderHeader = () => {
        return (
            <>
                <View>
                    <InputItem
                        autoCapitalize="none"
                        type="text"
                        placeholder="等待扫描中.."
                        value={state.input_sn}

                        onChangeText={handleChangeText}
                        onSubmitEditing={handleRemovePackage}
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
                        条码: {state.input_sn}
                    </Text>
                    {/* <Button size="small">清除</Button> */}
                </View>

                <WhiteSpace/>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <Button type="warning" onPress={handleRemovePackage}>
                        打印
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
    return (
        <View style={{backgroundColor: "#fff", flex: 1}}>
            <View style={{flex: 1}}>
                <ListView
                    header={renderHeader}
                    onFetch={(page = 1, startFetch, abortFetch) => {
                        abortFetch();
                    }}
                />
            </View>
        </View>
    );
};
