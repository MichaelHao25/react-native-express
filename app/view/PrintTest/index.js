import React, {useEffect, useRef, useState} from "react";
import {ScrollView, Text} from "react-native";
import Storage from "@react-native-community/async-storage";
import {Modal} from "@ant-design/react-native";
import Print from "../../util/print";

const blue_write = {
    ServiceUUID: '',
    CharacteristicUUID: ''
}
export default ({navigation, route}) => {
    const [state, setState] = useState(['初始化中...请稍等....'])
    const scales = useRef();


    useEffect(() => {
        scales.current = new Print()
        scales.current.getPeripheralId().then((peripheralId) => {
            setState(staet => {
                state.push(`获取mac地址...${peripheralId}`)
                return [...state]
            })
            return scales.current.boot()
        }).then(res => {
            setState(staet => {
                state.push(`${res}`)
                return [...state]
            })
            return scales.current.connect2();
        }).then(res => {
            setState(staet => {
                state.push(`连接设备成功！`)
                return [...state]
            })
            return scales.current.retrieveServices()
        }).then(res => {
            setState(staet => {
                state.push(`获取特征值成功！`);
                state.push(`${JSON.stringify(res)}`);
                return [...state]
            })
            return new Promise((resolve) => {
                const index = scales.current.writeWithResponseServiceUUID.findIndex(value => value.length === 36)
                blue_write.ServiceUUID = scales.current.writeWithResponseServiceUUID[index]
                blue_write.CharacteristicUUID = scales.current.writeWithResponseCharacteristicUUID[index]
                resolve();
            })
        }).then(() => {
            scales.current.res._write = blue_write;
            console.log('scales.current.res', scales.current.res)
            return Storage.setItem('printDevice', JSON.stringify(scales.current.res))
        }).then(() => {
            Modal.alert("提示", "初始完毕！", [
                {
                    text: "确定",
                    onPress: () => {
                        navigation.navigate('home');
                    },
                },
            ]);
        })
        return () => {
            scales.current.disconnect();
        };
    }, []);


    return (
        <ScrollView style={{backgroundColor: "#fff", flex: 1}}>
            {
                state.map((text, index) => <Text key={index}>{text}</Text>)
            }
        </ScrollView>
    );
}
