import React from "react";
import Storage from "@react-native-community/async-storage";
import {Toast} from "@ant-design/react-native";
import BleManager from "react-native-ble-manager";
import {NativeEventEmitter, NativeModules, Platform, ToastAndroid} from "react-native";
import {bytesToString, stringToBytes} from "convert-string";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


class Scales {
    /**
     * 蓝牙MAC地址
     * @type {string}
     */
    peripheralId = "";
    /**
     * 通知的服务和特征id
     * @type {{characteristicUUID: string, serviceUUID: string}}
     */
    _notification = {
        ServiceUUID: '',
        CharacteristicUUID: '',
    }
    /**
     * 通知事件的句柄，关闭页面的时候要调用remove方法移除
     * @type {null}
     */
    // eventHandleBleManagerDidUpdateValueForCharacteristic = null;
    /**
     * 写入数据的服务和特征id
     * @type {{characteristicUUID: string, serviceUUID: string}}
     */
    _write = {
        ServiceUUID: '',
        CharacteristicUUID: '',
    }

    /**
     * 构造函数初始化
     * @param props
     */
    constructor(props) {
        this.props = props;
    }

    /**
     * 获取getPeripheralId地址
     * @returns {Promise<string>}
     */
    async getPeripheralId() {
        try {
            const res = await Storage.getItem("scalesDevice")
            console.log("scalesDevice", res);
            if (res) {
                // const json = {
                //     "macAddress":
                //         "00:0C:BF:09:51:17",
                //        "name":
                //         "AT+NAMEjaynes216",
                //         "_write":
                //         {
                //             "ServiceUUID":
                //                 "49535343-fe7d-4ae5-8fa9-9fafd205e455", "CharacteristicUUID":
                //                 "49535343-ACA3-481C-91EC-D85E28A60318"
                //         }
                //     ,
                //     "_notification":
                //         {
                //             "ServiceUUID":
                //                 "49535343-fe7d-4ae5-8fa9-9fafd205e455", "CharacteristicUUID":
                //                 "49535343-1e4d-4bd9-ba61-23c647249616"
                //         }
                // }
                const blue = JSON.parse(res);
                this.peripheralId = blue?.macAddress;
                this._write = blue._write;
                this._notification = blue._notification;
                return this.peripheralId
            } else {
                Toast.fail("请绑定打印机。");
            }
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 请根据具体需要是否转成128位的，ios有些设备需要传16位的才能正常通信
     * Converts UUID to full 128bit.
     *
     * @param {UUID} uuid 16bit, 32bit or 128bit UUID.
     * @returns {UUID} 128bit UUID.
     */
    fullUUID(uuid) {
        if (uuid.length === 4) {
            return '0000' + uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
        }
        if (uuid.length === 8) {
            return uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
        }
        return uuid.toUpperCase()
    }

    /**
     * 获取Notify、Read、Write、WriteWithoutResponse的serviceUUID和characteristicUUID
     * @param peripheralInfo
     */
    getUUID(peripheralInfo) {
        this.readServiceUUID = [];
        this.readCharacteristicUUID = [];
        this.writeWithResponseServiceUUID = [];
        this.writeWithResponseCharacteristicUUID = [];
        this.writeWithoutResponseServiceUUID = [];
        this.writeWithoutResponseCharacteristicUUID = [];
        this.nofityServiceUUID = [];
        this.nofityCharacteristicUUID = [];
        for (let item of peripheralInfo.characteristics) {
            //请根据具体需要是否转成128位的，ios有些设备需要传16位的才能正常通信
            //item.service = this.fullUUID(item.service);
            item.characteristic = this.fullUUID(item.characteristic);
            if (Platform.OS === 'android') {
                if (item.properties.Notify === 'Notify') {
                    this.nofityServiceUUID.push(item.service);
                    this.nofityCharacteristicUUID.push(item.characteristic);
                }
                if (item.properties.Read === 'Read') {
                    this.readServiceUUID.push(item.service);
                    this.readCharacteristicUUID.push(item.characteristic);
                }
                if (item.properties.Write === 'Write') {
                    this.writeWithResponseServiceUUID.push(item.service);
                    this.writeWithResponseCharacteristicUUID.push(item.characteristic);
                }
                if (item.properties.Write === 'WriteWithoutResponse') {
                    this.writeWithoutResponseServiceUUID.push(item.service);
                    this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
                }
            } else {  //ios
                for (let property of item.properties) {
                    if (property === 'Notify') {
                        this.nofityServiceUUID.push(item.service);
                        this.nofityCharacteristicUUID.push(item.characteristic);
                    }
                    if (property === 'Read') {
                        this.readServiceUUID.push(item.service);
                        this.readCharacteristicUUID.push(item.characteristic);
                    }
                    if (property === 'Write') {
                        this.writeWithResponseServiceUUID.push(item.service);
                        this.writeWithResponseCharacteristicUUID.push(item.characteristic);
                    }
                    if (property === 'WriteWithoutResponse') {
                        this.writeWithoutResponseServiceUUID.push(item.service);
                        this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
                    }
                }
            }
        }
    }

    /**
     * 启动蓝牙模块
     * @returns {Promise<void>}
     */
    async boot() {
        try {
            await BleManager.start({showAlert: false})
            console.log("Module initialized");
            ToastAndroid.show('蓝牙初始化成功', ToastAndroid.BOTTOM)
            return 'Module initialized'
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 写入数据
     * @returns {Promise<void>}
     */
    async write(ServiceUUID, CharacteristicUUID) {
        try {
            const data = stringToBytes(`RN\n`)
            if (ServiceUUID) {
                const res = await BleManager.write(
                    this.peripheralId,
                    ServiceUUID,
                    CharacteristicUUID,
                    data
                )
                return res
            } else {
                const res = await BleManager.write(
                    this.peripheralId,
                    this._write.ServiceUUID,
                    this._write.CharacteristicUUID,
                    data
                )
                return res
            }
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 开启通知
     * @returns {Promise<string>}
     */
    async startNotification(ServiceUUID, CharacteristicUUID) {
        try {
            if (ServiceUUID) {
                await BleManager.startNotification(this.peripheralId, ServiceUUID, CharacteristicUUID)
            } else {
                await BleManager.startNotification(this.peripheralId, this._notification.ServiceUUID, this._notification.CharacteristicUUID)
            }
            return 'startNotificationSuccess'
        } catch (e) {
            console.log(e)
            throw e
        }

    }

    /**
     * 监听通知
     */
    handleBindNotificationEvent() {
        this.eventHandleBleManagerDidUpdateValueForCharacteristic = bleManagerEmitter.addListener(
            "BleManagerDidUpdateValueForCharacteristic",
            ({value, peripheral, characteristic, service}) => {
                // Convert bytes array to string
                const data = bytesToString(value);
                console.log(`Recieved ${data} for characteristic ${characteristic} ${peripheral},${service}`);
                this.props?.handleBindNotificationEvent && this.props.handleBindNotificationEvent({
                    msg: `Recieved ${data} for characteristic ${characteristic} ${peripheral},${service}`,
                    key: {
                        ServiceUUID: service,
                        CharacteristicUUID: characteristic
                    },
                    data
                })

            }
        );
    }

    /**
     * 关闭监听通知
     */
    handleUnbindNotificationEvent() {
        if (this.eventHandleBleManagerDidUpdateValueForCharacteristic) {
            this.eventHandleBleManagerDidUpdateValueForCharacteristic.remove()
        }
    }

    /**
     * 关闭通知
     * @returns {Promise<void>}
     */
    async stopNotification(ServiceUUID, CharacteristicUUID) {
        try {
            if (ServiceUUID) {
                await BleManager.stopNotification(this.peripheralId, ServiceUUID, CharacteristicUUID)
            } else {
                await BleManager.stopNotification(this.peripheralId, this._notification.ServiceUUID, this._notification.CharacteristicUUID)
            }
            console.log('stopNotification')
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 连接设备
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            await BleManager.connect(this.peripheralId)
            console.log('connect')
            return 'connect'
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 获取特征服务
     * @returns {Promise<PeripheralInfo>}
     */
    async retrieveServices() {
        try {
            const res = await BleManager.retrieveServices(this.peripheralId);
            // console.log('retrieveServices.', res)
            // console.log(JSON.stringify(res))
            this.getUUID(res);
            return res;
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 关闭连接
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            await BleManager.disconnect(this.peripheralId)
            console.log('disconnect')
        } catch (e) {
            console.log(e)
        }
    }
}


export default Scales;