import React from "react";
import { ScrollView } from "react-native";
import {
  List,
  Modal,
  Button,
  WingBlank,
  Flex,
  WhiteSpace,
} from "@ant-design/react-native";
import {
  getBluetoothStatus,
  getBluetoothList,
  disableBluetooth,
  scanDevices,
  connectDevices,
  unpairDevices,
} from "../../util/printSet";
import Storage from "@react-native-community/async-storage";
import { useEffect } from "react";
import { useState } from "react";
const App = ({ navigation }) => {
  const [list, setList] = useState([]);
  useEffect(() => {
    getBluetoothList()
      .then((res) => {
        // ["{\"name\":\"K319_0786\",\"address\":\"00:37:76:50:07:86\"}"]
        const list = [];
        res.forEach((value) => {
          const { name, address } = JSON.parse(value);
          list.push({
            name,
            address,
          });
        });
        setList(list);
      })
      .catch((err) => {
        Modal.alert("警告", "请打开蓝牙设备!", [
          {
            text: "确定",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
        console.log(err);
      });
  }, []);
  const handleNoMatch = () => {
    Modal.alert("提示", "请先和打印机进行配对!");
  };
  const handleSelectDevice = (value) => {
    Storage.setItem("printDevice", JSON.stringify(value)).then(() => {
      Modal.alert("提示", "绑定成功!", [
        {
          text: "确定",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    });
  };
  return (
    <ScrollView style={{ flex: 1 }}>
      <List renderHeader={"请绑定需要连接的打印机"}>
        {list.map((value) => {
          return (
            <List.Item
              key={value.address}
              onPress={() => {
                handleSelectDevice(value);
              }}
            >{`${value.name} - ${value.address}`}</List.Item>
          );
        })}
      </List>
      <WhiteSpace></WhiteSpace>
      <WingBlank>
        <Flex justify="end">
          <Flex.Item>
            <Button type="primary" onPress={handleNoMatch}>
              找不到我的设备?
            </Button>
          </Flex.Item>
        </Flex>
      </WingBlank>
    </ScrollView>
  );
};
export default App;
