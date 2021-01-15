import { DeviceEventEmitter } from "react-native";
import {
  BluetoothManager,
  BluetoothEscposPrinter,
} from "react-native-bluetooth-escpos-printer";

/**
 * 获取蓝牙状态
 */
const getBluetoothStatus = () => {
  return BluetoothManager.isBluetoothEnabled();
};
/**
 * 打开蓝牙并且获取已经配对的列表
 */
const getBluetoothList = () => {
  return BluetoothManager.enableBluetooth();
};
/**
 * 关闭蓝牙
 */
const disableBluetooth = () => {
  return BluetoothManager.disableBluetooth();
};
/**
 * 扫描设备
 */
const scanDevices = () => {
  return BluetoothManager.scanDevices();
};

/**
 * 连接设备
 * @param {address} macAddress 设备的mac地址
 */
const connectDevices = (macAddress) => {
  if (macAddress) {
    throw new Error("macAddress不能为空~");
  }
  return BluetoothManager.scanDevices(macAddress);
};

/**
 * 断开连接
 * @param {address} macAddress 设备的mac地址
 */
const unpairDevices = (macAddress) => {
  if (macAddress) {
    throw new Error("macAddress不能为空~");
  }
  return BluetoothManager.unpair(macAddress);
};

/**
 * 打印快递单
 */
const handlePrint = async () => {
  // 打初始化
  BluetoothEscposPrinter.printerInit();
  // 设置宽度
  BluetoothEscposPrinter.setWidth(50);
  // 开始打印
  await BluetoothEscposPrinter.printText("世纪通物流\n\r", {
    encoding: "GBK",
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 1,
  });
  await BluetoothEscposPrinter.printerAlign(
    BluetoothEscposPrinter.ALIGN.CENTER
  );

  await BluetoothEscposPrinter.printBarCode("VIKAS\n\r", 73, 3, 100, 0, 2);
  await BluetoothEscposPrinter.printAndFeed(1);
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
  await BluetoothEscposPrinter.printText(
    "--------------------------------\n\r",
    {}
  );
  await BluetoothEscposPrinter.printText("张三\n\r", {
    encoding: "GBK",
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 1,
  });
  await BluetoothEscposPrinter.printText("广东省南山区123号\n\r", {
    encoding: "GBK",
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 1,
  });
  await BluetoothEscposPrinter.printText("136****3232\n\r", {
    encoding: "GBK",
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 1,
  });
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
  await BluetoothEscposPrinter.printText("快件 - 上海\n\r", {
    encoding: "GBK",
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 1,
  });
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
  await BluetoothEscposPrinter.printText(
    "--------------------------------\n\r",
    {}
  );
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
  await BluetoothEscposPrinter.printText("客服电话:0577-26731009\n\r", {
    encoding: "GBK",
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 1,
  });
  await BluetoothEscposPrinter.printAndFeed(10);
};
// 绑定会调事件
DeviceEventEmitter.addListener(
  BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
  (rsp) => {
    console.log(`${rsp},已经配对完成`);
  }
);
DeviceEventEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
  console.log(`${rsp},找到新设备`);
});

export {
  getBluetoothStatus,
  getBluetoothList,
  disableBluetooth,
  scanDevices,
  connectDevices,
  unpairDevices,
};
