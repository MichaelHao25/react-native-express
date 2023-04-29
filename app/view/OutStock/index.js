import {Button, InputItem, List, Modal, Picker, WhiteSpace,} from "@ant-design/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {useFocusEffect} from "@react-navigation/native";
import React, {useEffect, useRef, useState} from "react";
import {FlatList, PixelRatio, Text, View} from "react-native";
import ScanButton from "../../component/ScanButton";
import {common_allshipping, common_car, order_loading, order_storeout,} from "../../util/api";

export default ({navigation, route}) => {
  const ref = useRef();

  const [state, setState] = useState({
    input_sn: "",
    input_sn_list: new Set(),
    carList: [],
    carId: "",
    count: 0,
    shippingID: undefined,
  });
  const [allshipping, setAllshipping] = useState([]);
  const [list, setList] = useState([]);
  useEffect(() => {
    common_car().then((res) => {
      console.log(res);
      const carList = res.data.map((value) => {
        return {
          label: value.number,
          value: `${value.id}`,
        };
      });
      setState((state) => {
        return {
          ...state,
          carList,
        };
      });
    });
    common_allshipping().then((res) => {
      console.log("res", res);
      const { data = [] } = res;
      const allshipping = data.map((item) => {
        const { id = "", name = "" } = item;
        return {
          label: name,
          value: id,
        };
      });
      if (allshipping.length !== 0) {
        setState((state) => {
          return {
            ...state,
            shippingID: allshipping[0].value,
          };
        });
      }
      setAllshipping(allshipping);
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
  useFocusEffect(
      React.useCallback(() => {
        AsyncStorage.getItem("QRcode").then((QRcode) => {
          if (QRcode) {
            AsyncStorage.removeItem("QRcode");
            handleSubmitEditing({
              nativeEvent: {
                text: QRcode,
              },
            });
          }
        });
      }, [state])
  );
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
    if (!state.carId) {
      Modal.alert("提示", "请选择一辆车!");
      return;
    }

    order_loading({
      car: state.carId,
      codeNum: text,
      shippingID: state.shippingID,
    }).then((res) => {
      console.log(res);
      const { data = [] } = res;
      if (res.success === false) {
        Modal.alert("提示", res.msg);
      }
      if (data.length !== 0) {
        setState((state) => {
          return {
            ...state,
            input_sn: "",
            input_sn_list: new Set(data),
          };
        });
        // ref.current.ulv.updateRows([...data], 0);
      }
      // {
      //     "code": 200,
      //     "success": true,
      //     "msg": "操作成功！",
      //     "data": [
      //     {
      //         "packageID": 18,
      //         "sn": "WLTDP1624176311",
      //         "carID": "1",
      //         "weight": "0.000"
      //     }
      // ],
      //     "num": 1
      // }
    });
    // state.input_sn_list.add(text);

    // setState((state) => {
    //     return {
    //         ...state,
    //         input_sn: "",
    //         input_sn_list: state.input_sn_list,
    //     };
    // });
    // ref.current.ulv.updateRows([...state.input_sn_list], 0);
  };
  const handleOutStock = () => {
    if (state.input_sn_list.size === 0) {
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
          console.log(state.input_sn_list);
          const tempList = [];
          for (const inputSnListElement of state.input_sn_list) {
            tempList.push(inputSnListElement.sn);
          }
          order_storeout({
            car: state.carId,
            codeNum: tempList.join(","),
            shippingID: state.shippingID,
          }).then((res) => {
            if (res.success === false) {
              Modal.alert("提示", res.msg);
            } else {
              // Modal.alert("提示", "出库成功!");
            }
            setState((state) => {
              return {
                ...state,
                input_sn_list: new Set(),
                carId: "",
              };
            });
            // ref.current.ulv.updateRows([], 0);
          });
        },
      },
    ]);
  };

  const renderHeader = () => {
    return (
      <View>
        <WhiteSpace />
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <ScanButton />
          <Button type="warning" onPress={handleOutStock}>
            出库
          </Button>
        </View>
        <WhiteSpace />
        <Picker
          data={state.carList}
          cols={1}
          value={state.carId}
          format={(e) => {
            console.log(e);
            console.log("state.carId", state.carId);
            return state.carList.find(({ value }) => value === state.carId)
              ?.label;
          }}
          onChange={(e) => {
            console.log("state.carList", state.carList);
            console.log("Picker", e);
            setState((state) => ({
              ...state,
              carId: e[0],
            }));
          }}
        >
          <List.Item arrow="horizontal">请选择车牌号</List.Item>
        </Picker>

        <Picker
          data={allshipping}
          cols={1}
          value={state.shippingID}
          format={() => {
            return allshipping.find(({ value }) => value === state.shippingID)
              ?.label;
          }}
          onChange={(e) => {
            setState((state) => ({
              ...state,
              shippingID: e[0],
            }));
          }}
        >
          <List.Item arrow="horizontal">请选择运输方式</List.Item>
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
              基础信息:包裹个数({state.input_sn_list.size})
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
  const renderItem = ({ item }) => {
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
          <Text style={{ fontSize: 20, color: "#333" }}>包号:{item.sn}</Text>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 20, color: "#333" }}>
            重量:{item.weight}kg
          </Text>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 20, color: "#333" }}>名称:{item?.name}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          style={{ flex: 1 }}
          data={[...state.input_sn_list].reverse()}
          renderItem={renderItem}
          keyExtractor={(value) => `key--${value.sn}`}
        />
        {/*<ListView*/}
        {/*    ref={ref}*/}
        {/*    header={renderHeader}*/}
        {/*    onFetch={(page = 1, startFetch, abortFetch) => {*/}
        {/*        abortFetch();*/}
        {/*    }}*/}
        {/*    renderItem={renderItem}*/}
        {/*    displayDate*/}
        {/*    keyExtractor={(value) => `key--${value.sn}`}*/}
        {/*/>*/}
      </View>
      {renderHeader()}
    </View>
  );
};
