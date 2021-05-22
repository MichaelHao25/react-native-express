import React from "react";
import BluetoothScanDevices from "../../component/BluetoothScanDevices";
import Storage from "@react-native-community/async-storage";
import {Modal} from "@ant-design/react-native";

export default (props) => {
    return <BluetoothScanDevices title={"请选中需要绑定的秤"} handleBindMacAddress={(value) => {
        Storage.setItem("printDevice", JSON.stringify(value)).then(() => {
            Modal.alert("提示", "绑定成功!", [
                {
                    text: "确定",
                    onPress: () => {
                        props.navigation.goBack();
                    },
                },
            ]);
        });
    }}
    />
}
;

