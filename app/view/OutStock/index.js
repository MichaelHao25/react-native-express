import React from "react";
import { StyleSheet, Text, View, PixelRatio, Image } from "react-native";
import {
  List,
  ListView,
  Button,
  WhiteSpace,
  Picker,
  WingBlank,
  Toast,
  Modal,
  InputItem,
} from "@ant-design/react-native";
import { useEffect } from "react";
import {
  pack_createcode,
  pack_createpack,
  pack_addpack,
  common_car,
  order_storeout,
} from "../../util/api";
import theme from "../../theme";
import { useRef } from "react";
import Print from "../../util/print";
import { useState } from "react";
import usePdaScan from "react-native-pda-scan";

export default ({ navigation, route }) => {
  const ref = useRef();

  const [state, setState] = useState({
    input_sn: "",
    input_sn_list: new Set(),
    carList: [],
    carId: "",
    count: 0,
  });
  useEffect(() => {
    common_car().then((res) => {
      console.log(res);
      const carList = res.data.map((value) => {
        return {
          label: value.number,
          value: value.id,
        };
      });
      setState((state) => {
        return {
          ...state,
          carList,
        };
      });
    });
  }, []);
  usePdaScan({
    onEvent(e) {
      console.log(e);
      handleSubmitEditing({
        nativeEvent: {
          text: e,
        },
      });
    },
    onError(e) {
      console.log(e);
    },
    trigger: "always",
  });
  const handleChangeText = (text) => {
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
  };
  const handleSubmitEditing = ({ nativeEvent: { text } }) => {
    if (text === "") {
      return;
    }
    state.input_sn_list.add(text);

    setState((state) => {
      return {
        ...state,
        input_sn: "",
        input_sn_list: state.input_sn_list,
      };
    });
    ref.current.ulv.updateRows([...state.input_sn_list], 0);
  };
  const handleOutStock = () => {
    if (state.input_sn_list.length == 0) {
      Modal.alert("提示", "没有找到sn,出库失败!");
      return;
    }
    if (!state.carId) {
      Modal.alert("提示", "请选择一辆车!");
      return;
    }
    Modal.alert("警告", "确认出库?", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: () => {
          order_storeout({
            id: state.carId,
            codeNum: [...state.input_sn_list].join(","),
          }).then((res) => {
            if(res.success===false){
                Modal.alert("提示", res.msg);
            }else{
                Modal.alert("提示", "出库成功!");
            }
            setState((state) => {
              return {
                ...state,
                input_sn_list: new Set(),
                carId: "",
              };
            });
            ref.current.ulv.updateRows([], 0);
          });
        },
      },
    ]);
  };

  const renderHeader = () => {
    return (
      <View>
        <Picker
          data={state.carList}
          cols={1}
          value={state.carId}
          onChange={(e) => {
            setState((state) => ({
              ...state,
              carId: e[0],
            }));
          }}
        >
          <List.Item arrow="horizontal">请选择车牌号</List.Item>
        </Picker>
        <View>
          <InputItem
            autoCapitalize="none"
            type="text"
            placeholder="等待扫描中.."
            value={state.input_sn}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmitEditing}
          />
        </View>
        <WhiteSpace />
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Button type="warning" onPress={handleOutStock}>
            出库
          </Button>
        </View>
        <WhiteSpace />
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 15,
            paddingVertical: 9,
            backgroundColor: "#f5f5f9",
            borderBottomColor: "#ddd",
            borderBottomWidth: 1 / PixelRatio.get(),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: "#888" }}>
              基础信息:包裹个数({state.input_sn_list.length})
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 15,
            paddingVertical: 9,
            backgroundColor: "#f5f5f9",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: "#888" }}>包裹信息</Text>
          </View>
        </View>
      </View>
    );
  };
  const renderItem = (item) => {
    return (
      <View
        style={{
          borderBottomColor: "#ddd",
          borderBottomWidth: 1 / PixelRatio.get(),
          paddingHorizontal: 15,
          flexDirection: "column",
          paddingVertical: 15,
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 20, color: "#333" }}>运单号:{item}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ListView
          ref={ref}
          header={renderHeader}
          onFetch={(page = 1, startFetch, abortFetch) => {
            abortFetch();
          }}
          renderItem={renderItem}
          displayDate
          keyExtractor={(valu) => `key--${valu}`}
        />
      </View>
    </View>
  );
};
