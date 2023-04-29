import {Button, InputItem, ListView, Modal, WhiteSpace,} from "@ant-design/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {useFocusEffect} from "@react-navigation/native";
import React, {useState} from "react";
import {PixelRatio, Text, View} from "react-native";
import ScanButton from "../../component/ScanButton";
import {pack_deletepack} from "../../util/api";
import usePdaScan from "react-native-pda-scan";

export default ({navigation, route}) => {
    const [state, setState] = useState({
        input_sn: "",
    });
    usePdaScan({
        onEvent(e) {
            handleChangeText(e);
        },
        onError(e) {
            console.log(e);
        },
        trigger: "always",
    });
    useFocusEffect(
        React.useCallback(() => {
            AsyncStorage.getItem("QRcode").then((QRcode) => {
                if (QRcode) {
                    AsyncStorage.removeItem("QRcode");
                    handleChangeText(QRcode);
                }
            });
        }, [state])
    );
    // pack_subpack
    const handleChangeText = (text) => {
        setState((state) => {
            return {
                ...state,
                input_sn: text,
            };
        });
    };
    const handleRemovePackage = () => {
        if (state.input_sn === "") {
            return;
        }
        Modal.alert("警告", "确认拆开该包裹?", [
            {
                text: "取消",
                style: "cancel",
            },
            {
                text: "确定",
                onPress: () => {
                    pack_deletepack({
                        pcodeNum: state.input_sn,
                    }).then((res) => {
                        if (res.success === false) {
                            Modal.alert("提示", res.msg);
                        } else {
                            // Modal.alert("提示", "拆包成功!");
                        }
                    });
                },
            },
        ]);
    };
    const renderHeader = () => {
        return (
            <>
                <WhiteSpace/>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <ScanButton/>
                    <Button type="warning" onPress={handleRemovePackage}>
                        拆包
                    </Button>
                </View>
                <View>
                    <InputItem
                        autoCapitalize="none"
                        type="text"
                        placeholder="等待扫描中.."
                        value={state.input_sn}
                        onChangeText={handleChangeText}
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
            </>
        );
    };
    return (
        <View style={{backgroundColor: "#fff", flex: 1}}>
            <View style={{flex: 1}}>
                <ListView
                    style={{flex: 1}}
                    onFetch={(page = 1, startFetch, abortFetch) => {
                        abortFetch();
                    }}
                />
            </View>
            {renderHeader()}
            <View style={{height: 150}}></View>
        </View>
    );
};
