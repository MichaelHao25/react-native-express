import {Button, InputItem, Modal, WhiteSpace} from "@ant-design/react-native";
import React, {useEffect, useRef, useState} from "react";
import {PixelRatio, ScrollView, Text, View} from "react-native";
import ScanButton from "../../component/ScanButton";
import {pack_printlabel} from "../../util/api";
import Print from "../../util/print";
import usePdaScan from "react-native-pda-scan";

export default ({navigation, route}) => {
    const blue = useRef();

    const [state, setState] = useState({
        input_sn: "",
    });
    const [item, setItem] = useState({});
    useEffect(() => {
        blue.current = new Print();
        blue.current.boot().then(() => {
            return blue.current.getPeripheralId();
        });

        return () => {
            blue.current.disconnect();
        };
    }, []);
    usePdaScan({
        onEvent(e) {
            handleChangeText(e)
            handleFetchData(
                {codeNum: e}
            );
        },
        onError(e) {
            console.log(e);
        },
        trigger: "always",
    });
    const handleFetchData = (body) => {
        pack_printlabel(body).then(res => {
            if (res.success) {
                setItem(res.data)
            } else {
                Modal.alert("提示", res.msg);
            }
        })
    }
    const handlePrint = (item) => {

        try {
            blue.current.getLabel(item);
            blue.current
                .connect()
                .then((res) => {
                    console.log(res);
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (e) {
            console.log(e);
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

    const renderHeader = () => {
        return (
            <>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        paddingVertical: 10,

                        borderBottomColor: "#ccc",
                        borderBottomWidth: 1 / PixelRatio.get(),
                    }}
                >
                    <ScanButton/>
                    {/*<Button*/}
                    {/*    type="warning"*/}
                    {/*    onPress={() => {*/}
                    {/*        handleFetchData({codeNum: 'WLTD214053041'})*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    打印*/}
                    {/*</Button>*/}
                  <Button
                    type="warning"
                    onPress={() =>
                        handlePrint(item)
                    }
                >
                    打印
                </Button>
                </View>
                <View>
                    <InputItem
                        autoCapitalize="none"
                        type="text"
                        placeholder="等待扫描中.."
                        value={state.input_sn}
                        onChangeText={handleChangeText}
                        // onSubmitEditing={handleRemovePackage}
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
                        borderBottomColor: "#ccc",
                        borderBottomWidth: 1 / PixelRatio.get(),
                    }}
                >
                    <Text style={{fontSize: 12, color: "#333"}}>
                        条码: {state.input_sn}
                    </Text>
                    {/* <Button size="small">清除</Button> */}
                </View>
                {/*
        <WhiteSpace />

        <WhiteSpace /> */}

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
            return <></>;
        }
        const {
            address = '',
            channelID = '',
            consignee = '',
            supplierID = '',
        } = item;
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
                    backgroundColor: "#fff",
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

                    <Text style={{fontSize: 20, color: "#333"}}>
                        承运商：{supplierID}
                    </Text>
                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>
                        目的站：{channelID}
                    </Text>
                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>
                        收件人：{consignee}
                    </Text>
                    <WhiteSpace/>
                    <Text style={{fontSize: 20, color: "#333"}}>
                        详细地址：{address}
                    </Text>

                </View>
                <WhiteSpace/>
            </View>
        );
    };
    return (
        <View style={{flex: 1}}>
            <ScrollView style={{backgroundColor: "#fff", flex: 1}}>
                {renderItem({item})}
            </ScrollView>
            {renderHeader()}
            <View style={{height: 130}}></View>
        </View>
    );
};
