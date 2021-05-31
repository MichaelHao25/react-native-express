import React, {useEffect, useRef, useState} from "react";
import {ScrollView, Text} from "react-native";
import Scales from "../../util/scales";
import Storage from "@react-native-community/async-storage";
import {Modal} from "@ant-design/react-native";


const blue_notification = {
    ServiceUUID: '',
    CharacteristicUUID: ''
}
const blue_write = {
    ServiceUUID: '',
    CharacteristicUUID: ''
}
export default ({navigation, route}) => {
    const [state, setState] = useState(['初始化中...请稍等....'])
    const scales = useRef();


    useEffect(() => {
        scales.current = new Scales({
            handleBindNotificationEvent(
                {
                    msg, key
                }
            ) {
                setState(staet => {
                    state.push(msg)
                    return [...state]
                })
                blue_notification.CharacteristicUUID = key.CharacteristicUUID;
                blue_notification.ServiceUUID = key.ServiceUUID;
            }
        })
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
            scales.current.handleBindNotificationEvent();
            setState(staet => {
                state.push(`开启通知成功！`)
                return [...state]
            })
            return scales.current.connect();
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
            console.log('scales.current.nofityServiceUUID', scales.current.nofityServiceUUID)
            console.log('scales.current.nofityCharacteristicUUID', scales.current.nofityCharacteristicUUID)
            return new Promise((reslove) => {
                let count = 0;
                let length = scales.current.nofityServiceUUID.length;
                scales.current.nofityServiceUUID.forEach((ServiceUUID, index) => {
                    const CharacteristicUUID = scales.current.nofityCharacteristicUUID[index]
                    console.log('index', index)
                    setTimeout(() => {
                        scales.current.startNotification(ServiceUUID, CharacteristicUUID).then(res => {
                            count++;
                            setState(state => {
                                state.push(`通知开启成功！`);
                                state.push(`${ServiceUUID},${CharacteristicUUID}`);
                                return [...state]
                            })
                            if (count === length) {
                                reslove()
                            }
                        }).catch(e => {
                            count++;
                            setState(state => {
                                state.push(`通知开启失败！`);
                                state.push(`${ServiceUUID},${CharacteristicUUID}`);
                                return [...state]
                            })
                            if (count === length) {
                                reslove()
                            }
                        });
                    }, 1000 * (index + 1))
                })
            })
        }).then(() => {
            return new Promise(async (resolve) => {
                for (let i = 0; i < scales.current.writeWithResponseServiceUUID.length; i++) {
                    await new Promise(async (resolve) => {
                        const ServiceUUID = scales.current.writeWithResponseServiceUUID[i];
                        const CharacteristicUUID = scales.current.writeWithResponseCharacteristicUUID[i];
                        await scales.current.write(ServiceUUID, CharacteristicUUID);
                        if (!blue_notification.CharacteristicUUID) {
                            blue_write.ServiceUUID = ServiceUUID;
                            blue_write.CharacteristicUUID = CharacteristicUUID;
                        }
                        await setTimeout(() => {
                            console.log(new Date().getTime());
                            setState(state => {
                                state.push(`执行写入！`);
                                state.push(`${ServiceUUID},${CharacteristicUUID}`);
                                return [...state]
                            })

                            resolve();
                        }, 1000 * 2);
                    })
                }
                resolve()
            })
        }).then(() => {
            console.log('初始化执行完毕！');
            console.log(blue_notification)
            console.log(blue_write)
            setState(state => {
                state.push(`执行写入！`);
                state.push(`${JSON.stringify(blue_notification)}`);
                state.push(`${JSON.stringify(blue_write)}`);
                return [...state]
            })
            if (Object.values(blue_write).includes('') === false && Object.values(blue_notification).includes('') === false) {
                return Storage.getItem('scalesDevice')
            } else {
                setState(state => {
                    state.push(`初始化失败，请检查设备`);
                    return [...state]
                })
                Modal.alert('警告', '初始化失败！')
            }
        }).then(scalesDevice => {
            const tempScaleDevice = JSON.parse(scalesDevice)
            tempScaleDevice._write = blue_write;
            tempScaleDevice._notification = blue_notification;
            console.log(tempScaleDevice)
            return Storage.setItem('scalesDevice', JSON.stringify(tempScaleDevice))
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
            if (scales.current.nofityServiceUUID) {
                console.log('scales.current.nofityServiceUUID', scales.current.nofityServiceUUID)
                console.log('scales.current.nofityCharacteristicUUID', scales.current.nofityCharacteristicUUID)
                scales.current.nofityServiceUUID.forEach((ServiceUUID, index) => {
                    const CharacteristicUUID = scales.current.nofityCharacteristicUUID[index]
                    scales.current.stopNotification(ServiceUUID, CharacteristicUUID)
                })
            }
            scales.current.handleUnbindNotificationEvent();
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
