import React, { useEffect } from "react";
import BleManager from "react-native-ble-manager";
import { encode64gb2312 } from "./base64gb2312";
import Storage from "@react-native-community/async-storage";
import { Toast ,Portal} from "@ant-design/react-native";

function _base64ToArrayBuffer(base64) {
  var binary_string = base64;
  var len = binary_string.length;
  var bytes = new Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

class Print {
  macAddress = "";
  data = [];
  initOver = false;
  key = "";
  constructor(props) {
    // super(props);
    Storage.getItem("printDevice").then((res) => {
      console.log("printDevice", res);
      if (res) {
        const blue = JSON.parse(res);
        this.macAddress = blue?.macAddress;
        this.init();
      }else{
        Toast.fail('请绑定打印机。')
      }
    });
  }
  init() {
    BleManager.start({ showAlert: false }).then(() => {
      // Success code
      console.log("Module initialized");
      Toast.info('打印机初始化完毕。')
      this.initOver = true;
    });
  }
  disconnect() {
    BleManager.disconnect(this.macAddress)
      .then(() => {
        // Success code
        console.log("Disconnected");
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  connect() {
      this.key = Toast.loading('正在打印中...',0);
    return new Promise((resolve, reject) => {
      BleManager.connect(this.macAddress)
        .then(() => {
          // Success code
          console.log("Connected");
          // 70*50mm
          BleManager.retrieveServices(this.macAddress).then(
            (peripheralInfo) => {
              console.log("peripheralInfo");
              let serviceUUID = "";
              let characteristicUUID = "";
              peripheralInfo.characteristics.forEach((value) => {
                if (value?.properties?.Write) {
                  if (value.service.length === 36) {
                    console.log(value);
                    serviceUUID = value.service;
                    characteristicUUID = value.characteristic;
                    // serviceUUID
                    //
                  }
                }
              });
              BleManager.write(
                this.macAddress,
                serviceUUID,
                characteristicUUID,
                this.data
              )
                .then(() => {
                  resolve("ok");
                  Toast.success("指令发送完毕")
                  Portal.remove(this.key)
                  
                })
                .catch((error) => {
                  reject(error);
                });
            }
          );
        })
        .catch((error) => {
          console.log(error);
          reject(error);
          Toast.success("打印失败")
          Portal.remove(this.key)
        })
    });
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
  }) {
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
          "TEXT 8 7 0 8 世纪通物流\r\n" +
          "CENTER\r\n" +
          "BARCODE 128 1 1 86 0 43 " +
          packageNum +
          "\r\n" +
          "TEXT 7 0 0 134 " +
          packageNum +
          "\r\n" +
          "LEFT\r\n" +
          "TEXT 7 0 8 170 1/1 " +
          expected_time +
          "\r\n" +
          "LINE 0 195 560 195 2\r\n" +
          "TEXT 8 7 8 205 " +
          name +
          " " +
          mobile +
          "\r\n" +
          "RIGHT\r\n" +
          "SETBOLD 2\r\n" +
          "SETMAG 2 2\r\n" +
          "TEXT 8 7 0 205 " +
          to +
          " - " +
          shipping +
          "\r\n" +
          "SETMAG 0 0\r\n" +
          "SETBOLD 0\r\n" +
          "LEFT\r\n" +
          "TEXT 8 7 8 285 " +
          payment +
          "\r\n" +
          "RIGHT\r\n" +
          "SETBOLD 2\r\n" +
          "TEXT 1 6 0 285 " +
          packageNum.slice(-5) +
          "\r\n" +
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
}

export default Print;
