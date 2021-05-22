import React, {Component} from "react";
import {Button, Flex, List, Modal, WhiteSpace, WingBlank,} from "@ant-design/react-native";
import Storage from "@react-native-community/async-storage";

import {AppState, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, View,} from "react-native";
import BleManager from "react-native-ble-manager";

// // Import/require in the beginning of the file
// import { stringToBytes } from "convert-string";
// // Convert data to byte array before write/writeWithoutResponse
// const data = stringToBytes(yourStringData);

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            scanning: false,
            peripherals: new Map(),
            appState: "",
        };

        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
        this.handleStopScan = this.handleStopScan.bind(this);
        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
            this
        );
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
            this
        );
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    componentDidMount() {
        AppState.addEventListener("change", this.handleAppStateChange);

        BleManager.start({showAlert: false});

        this.handlerDiscover = bleManagerEmitter.addListener(
            "BleManagerDiscoverPeripheral",
            this.handleDiscoverPeripheral
        );
        this.handlerStop = bleManagerEmitter.addListener(
            "BleManagerStopScan",
            this.handleStopScan
        );
        this.handlerDisconnect = bleManagerEmitter.addListener(
            "BleManagerDisconnectPeripheral",
            this.handleDisconnectedPeripheral
        );
        this.handlerUpdate = bleManagerEmitter.addListener(
            "BleManagerDidUpdateValueForCharacteristic",
            this.handleUpdateValueForCharacteristic
        );

        if (Platform.OS === "android" && Platform.Version >= 23) {
            PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
            ).then((result) => {
                if (result) {
                    console.log("Permission is OK");
                } else {
                    PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
                    ).then((result) => {
                        if (result) {
                            console.log("User accept");
                        } else {
                            console.log("User refuse");
                        }
                    });
                }
            });
        }
    }

    handleAppStateChange(nextAppState) {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            console.log("App has come to the foreground!");
            BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
                console.log("Connected peripherals: " + peripheralsArray.length);
            });
        }
        this.setState({appState: nextAppState});
    }

    componentWillUnmount() {
        this.handlerDiscover.remove();
        this.handlerStop.remove();
        this.handlerDisconnect.remove();
        this.handlerUpdate.remove();
    }

    handleDisconnectedPeripheral(data) {
        let peripherals = this.state.peripherals;
        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            this.setState({peripherals});
        }
        console.log("Disconnected from " + data.peripheral);
    }

    handleUpdateValueForCharacteristic(data) {
        console.log(
            "Received data from " +
            data.peripheral +
            " characteristic " +
            data.characteristic,
            data.value
        );
    }

    /**
     * 停止扫描
     */
    handleStopScan() {
        console.log("Scan is stopped");
        this.setState({scanning: false});
    }

    /**
     * 开始扫描
     */
    startScan() {
        if (!this.state.scanning) {
            //this.setState({peripherals: new Map()});
            BleManager.scan([], 3, true).then((results) => {
                console.log("Scanning...");
                this.setState({scanning: true});
            });
        }
    }

    /**
     * 发现设备回调
     * @param peripheral
     */
    handleDiscoverPeripheral(peripheral) {
        var peripherals = this.state.peripherals;
        console.log("Got ble peripheral", peripheral);
        /**
         * 去掉了no name 的设备
         */
        if (!peripheral.name) {
            peripheral.name = "NO NAME";
        } else {
            peripherals.set(peripheral.id, peripheral);
            this.setState({peripherals});
        }
    }

    /**
     * 选中绑定设备
     * macAddress/name
     * @param value
     */
    handleSelectDevice = (value) => {
        Storage.setItem("printDevice", JSON.stringify(value)).then(() => {
            Modal.alert("提示", "绑定成功!", [
                {
                    text: "确定",
                    onPress: () => {
                        this.props.navigation.goBack();
                    },
                },
            ]);
        });
    };

    render() {
        const list = Array.from(this.state.peripherals.values());

        return (
            <View style={{flex: 1}}>
                <WhiteSpace/>
                <WingBlank>
                    <Flex justify="end">
                        <Flex.Item>
                            <Button
                                type="primary"
                                loading={this.state.scanning}
                                disabled={this.state.scanning}
                                onPress={() => {
                                    this.startScan();
                                }}
                            >
                                扫描设备
                            </Button>
                        </Flex.Item>
                    </Flex>
                </WingBlank>
                <List renderHeader={"请选择需要绑定的打印机"}>
                    {list.map((value) => {
                        return (
                            <List.Item
                                key={value.id}
                                onPress={() => {
                                    this.handleSelectDevice({
                                        macAddress: value.id,
                                        name: value.name,
                                    });
                                }}
                            >{`${value.name} - ${value.id}(${value.rssi})`}</List.Item>
                        );
                    })}
                </List>
            </View>
        );
    }
}
