import React from "react";
import Storage from "@react-native-community/async-storage";
import {Portal, Toast} from "@ant-design/react-native";
import BleManager from "react-native-ble-manager";
import {NativeEventEmitter, NativeModules, Platform} from "react-native";
import {encode64gb2312} from "./base64gb2312";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function _base64ToArrayBuffer(base64) {
    var binary_string = base64;
    var len = binary_string.length;
    var bytes = new Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

class Scales {
    /**
     *  打印机需要的数据
     * @type {undefined}
     */
    data = undefined
    /**
     * 蓝牙MAC地址
     * @type {string}
     */
    peripheralId = "";

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
            const res = await Storage.getItem("printDevice")
            console.log("printDevice", res);
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
                this.res = blue;
                this.peripheralId = blue?.macAddress;
                this._write = blue._write;
                return this.peripheralId
            } else {
                // Toast.fail("请绑定打印机。");
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
            // item.characteristic = this.fullUUID(item.characteristic);
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
            // ToastAndroid.show('蓝牙初始化成功', ToastAndroid.BOTTOM)
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
            if (ServiceUUID) {
                const res = await BleManager.write(
                    this.peripheralId,
                    ServiceUUID,
                    CharacteristicUUID,
                    this.data
                )
                return res
            } else {
                const res = await BleManager.write(
                    this.peripheralId,
                    this._write.ServiceUUID,
                    this._write.CharacteristicUUID,
                    this.data
                )
                return res
            }
        } catch (e) {
            console.log(e)
        }
    }


    /**
     * 连接设备,为了兼容新增的所以加上这个部分。
     * @returns {Promise<void>}
     */
    async connect2() {
        try {
            await BleManager.connect(this.peripheralId)
            console.log('connect')
            return 'connect'
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 连接设备
     * @returns {Promise<void>}
     */
    async connect() {
        console.log('this._write', this._write)
        this.key = Toast.loading("正在连接中...", 0);
        this.timer = setTimeout(() => {
            Portal.remove(this.key);
            Toast.fail("指令发送超时请检查打印机！");
        }, 1000 * 10)
        try {
            await BleManager.connect(this.peripheralId)
            await this.retrieveServices();
            console.log('connect')
            await BleManager.write(
                this.peripheralId,
                this._write.ServiceUUID,
                this._write.CharacteristicUUID,
                this.data
            )
            // await BleManager.write(
            //     this.peripheralId,
            //     '49535343-fe7d-4ae5-8fa9-9fafd205e455',
            //     '49535343-8841-43f4-a8d4-ecbe34729bb3',
            //     this.data
            // )
            Toast.success("指令发送完毕");
            Portal.remove(this.key);
            clearTimeout(this.timer)
            return 'connect'
        } catch (e) {
            console.log(e)
            Toast.fail(`发生了一个错误！,${JSON.stringify(e)}`);
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
            console.log('retrieveServices', JSON.stringify(res))
            this.getUUID(res);
            return res;
        } catch (e) {
            console.log('retrieveServices', e)
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

    // 打印机相关的特征
    getLabel({

                 supplierID="###",
                 channelID="###",
                 consignee="###",
                 address="###",
             }) {
        const renderAddress = (address) => {
            const addressArr = address.split('');
            let str = "";
            for (let i = 0; i < addressArr.length; i += 20) {
                str += "TEXT 8 7 0 " + (155 + 27 * (i / 20)) + " " + addressArr.slice(i / 20 * 20, i / 20 * 20 + 20).join('') + "\r\n"
            }
            address.slice(0, 20)
            return str;
        }
        this.data = _base64ToArrayBuffer(
            // 50 70
            // 每mm八个点
            // 地址隐藏掉
            // "TEXT 8 7 0 245 广东省深圳市南山区南海大道\r\n" +
            encode64gb2312(
                "! 0 200 200 400 1\r\n" +
                "PAGE-WIDTH 520\r\n" +
                "GAP-SENSE 255\r\n" +
                "SET-TOF 0\r\n" +
                "LEFT\r\n" +
                // 10
                "TEXT 8 7 0 40 " + "承运商：" + supplierID + "\r\n" +
                // 10 + 48 + 10
                "SETBOLD 2\r\n" +
                "RIGHT\r\n" +
                "TEXT 8 7 0 40 " + "目的站：" + channelID + "\r\n" +
                // 68 + 48 + 10
                "LEFT\r\n" +
                "TEXT 8 7 0 84 " + "收件人：" + consignee + "\r\n" +
                // 174 + 48 + 10
                "SETBOLD 0\r\n" +
                "TEXT 8 7 0 127 " + "详细地址：" + "\r\n" +
                renderAddress(address) +
                "FORM\r\n" +
                "PRINT\r\n"
            )
        );
    }

        getPrint({
                 packageNum = "######",
                 expected_time = "######",
                 name = "######",
                 mobile = "######",
                 to = "######",
                 shipping = "######",
                 payment = "######",
                 client_phone = "######",
                 flag = "",
                 supplier = "",
                 trueAddr = false,
                 pages = '1/1',
                 pickup_addr = ''
             }) {
        const count = pages.split('/')[0];
        pages = pages.split('/')[1] + '包';
        if (parseInt(pages) !== 1) {
            packageNum += '-' + count;
        }
        this.data = _base64ToArrayBuffer(
            // 50 70
            // 每mm八个点
            // 地址隐藏掉
            // "TEXT 8 7 0 245 广东省深圳市南山区南海大道\r\n" +
            encode64gb2312(
                "! 0 200 200 400 1\r\n" +
                "PAGE-WIDTH 520\r\n" +
                "GAP-SENSE 255\r\n" +
                "SET-TOF 0\r\n" +
                "LEFT\r\n" +
                "TEXT 8 7 0 8 " + supplier + "\r\n" +
                this.renderFlag(flag) +
                this.renderSymbol(trueAddr) +
                "CENTER\r\n" +
                "BARCODE 128 1 1 86 0 43 " +
                packageNum +
                "\r\n" +
                "TEXT 7 0 0 134 " +
                packageNum +
                "\r\n" +
                "LEFT\r\n" +
                "TEXT 8 7 8 170 " + pages + " " +
                expected_time +
                "\r\n" +
                "LINE 0 195 560 195 2\r\n" +
                "SETBOLD 2\r\n" +
                // "SETMAG 1.5 1.5\r\n" +
                "TEXT 8 7 8 205 " +
                name + "  " + payment +
                " " +
                // mobile +
                "\r\n" +
                // "SETMAG 0 0\r\n" +
                "SETBOLD 0\r\n" +
                this.renderAddress(pickup_addr) +
                "LEFT\r\n" +
                "SETBOLD 2\r\n" +
                "SETMAG 2 2\r\n" +
                "TEXT 8 7 0 280 " +
                to +
                " - " +
                shipping +
                "\r\n" +
                "SETMAG 2 2\r\n" +
                "SETBOLD 0\r\n" +
                // "LEFT\r\n" +
                // "TEXT 8 7 8 285 " +
                // payment +
                "\r\n" +
                "RIGHT\r\n" +
                "SETBOLD 2\r\n" +
                "TEXT 8 7 0 205 " +
                packageNum.slice(-5) +
                "\r\n" +
                "SETMAG 0 0\r\n" +
                "SETBOLD 0\r\n" +
                "LEFT\r\n" +
                "LINE 0 325 560 325 4\r\n" +
                "RIGHT\r\n" +
                "TEXT 8 7 0 340 客服电话:" +
                client_phone +
                "\r\n" +
                "FORM\r\n" +
                "PRINT\r\n"
            )
        );
    }

    renderAddress(text = '') {
        console.log('renderAddress', text)
        if (!text) {
            return "";
        }

        return (
            "CENTER\r\n" +
            "TEXT 8 7 8 238 " +
            text +
            "\r\n" +
            "LEFT\r\n"
        )
            ;
    }

    renderSymbol(status = true) {
        if (status === false) {
            return '';
        }
        return (
            "SETBOLD 1\r\n" +
            "SETMAG 1 1\r\n" +
            "TEXT 8 7 110 50 " +
            "*" +
            "\r\n" +
            "SETBOLD 0\r\n" +
            "SETMAG 0 0\r\n"
        )
            ;
    }

    /**
     * 渲染合包集包标记
     */
    renderFlag(text) {
        if (!text) {
            return "";
        }
        return (
            "SETBOLD 2\r\n" +
            "SETMAG 2 2\r\n" +
            "TEXT 8 7 0 63 " +
            text +
            "\r\n" +
            "SETBOLD 0\r\n" +
            "SETMAG 0 0\r\n"
        );
    }

    /**
     * 初始化打印机
     * 1mm=8point
     * @param {number} width 打印机纸张的宽度
     * @param {number} height 打印机纸张的高度
     */
    printInitArgs(width = 400, height = 520) {
        return "! 0 200 200 400 1\r\n" + "PAGE-WIDTH 520\r\n" + "GAP-SENSE 255\r\n";
    }

    /**
     * 打印机控制指令结束符号
     */
    printEnd() {
        return "FORM\r\n" + "PRINT\r\n";
    }

    /**
     * 设置对齐方式（left/center/right）
     * @param {emnu} direction 左对齐右对齐居中等
     */
    printAlign(direction) {
        return direction.toUpperCase() + "\r\n";
    }

    /**
     * 打印文字
     */
    printText() {
        return "TEXT 8 7 0 340 客服电话:" + client_phone + "\r\n";
    }
}


export default Scales;
