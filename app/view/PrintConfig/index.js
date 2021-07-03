import React from "react";
import BluetoothScanDevices from "../../component/BluetoothScanDevices";
import Storage from "@react-native-community/async-storage";
import {Modal} from "@ant-design/react-native";

export default (props) => {
    return <BluetoothScanDevices title={"请选中需要绑定的打印机"} handleBindMacAddress={(value) => {
        Storage.setItem("printDevice", JSON.stringify(value)).then(() => {
            Modal.alert("提示", "打印机绑定成功，即将进入初始化阶段，请保证打印机在连接范围内...", [
                {
                    text: "确定",
                    onPress: () => {
                        props.navigation.navigate('printTest');
                    },
                },
            ]);
        });
    }
    }/>
}
;

