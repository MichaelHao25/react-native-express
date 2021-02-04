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
import { pack_createcode, pack_createpack, pack_addpack } from "../../util/api";
import theme from "../../theme";
import { useRef } from "react";
import Print from "../../util/print";
import { useState } from "react";
import Sound from "react-native-sound";
import usePdaScan from "react-native-pda-scan";

export default ({ navigation, route }) => {
  const ref = useRef();
  const blue = useRef();
  const sound = useRef();
  const [state, setState] = useState({
    input_sn: "",
    input_sn_list: [],
    count: 0,
    price: 0,
    weight: 0,
  });
  /**
   * 初始化链接蓝牙
   */
  useEffect(() => {
    navigation.setOptions({ title: route.params.type === 0 ? "合包" : "集包" });
    blue.current = new Print();
    return () => {
      blue.current.disconnect();
    };
  }, []);
  /**
   * 播放声音
   */
  useEffect(() => {
    Sound.setCategory("Playback");
    sound.current = new Sound("error_error.mp3", Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log("failed to load the sound", error);
        return;
      }
    });
    return () => {
      sound.current.release();
    };
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

  const handlePrint = (item) => {
    blue.current.getPrint(item);
    blue.current
      .connect()
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleCreateQrcode = () => {
    pack_createcode({
      type: route.params.type + 1,
    }).then((res) => {
      const { codeNum } = res;
      setState((state) => {
        return {
          ...state,
          input_sn_list: [codeNum],
        };
      });
      handlePrint({
        packageNum: codeNum,
      });
    });
  };
  const handleChangeText = (text) => {
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
  };
  const handleSubmitEditing = ({ nativeEvent: { text } }) => {
      
    const { input_sn_list } = state;

    if (!input_sn_list.includes(text)) {
      input_sn_list.push(text);
    }
    if (input_sn_list.length < 2) {
      setState((state) => {
        return {
          ...state,
          input_sn: "",
          input_sn_list: [...input_sn_list],
        };
      });
      return;
    }
    pack_addpack({
      codeNum: [...input_sn_list].join(","),
      type: route.params.type + 1,
    }).then((res) => {
      if (res.success === false) {
        Toast.fail(res.msg);
        sound.current.play();
      }
      // count: "64"
      // data: (8)
      // pcodeNum: "PK1611758823"
      // price: 111.01

      const { count, data, pcodeNum, price, weight } = res;
      //   if (count) {
      // 去掉的具体原因参考20210130下午五点钟的消息记录
      ref.current.ulv.updateRows(data, 0);
      setState((state) => {
        return {
          ...state,
          input_sn: "",
          input_sn_list: pcodeNum?[pcodeNum]:[],
          count,
          price,
          weight,
        };
      });
      //   }
    });
    // setState((state) => {
    //   const { input_sn_list } = state;
    //   const length = input_sn_list.length;
    //   if (length <= 1) {
    //     input_sn_list.push(text);
    //   }
    //   return {
    //     ...state,
    //     input_sn_list,
    //     input_sn: "",
    //   };
    // });
  };
  const handleMerge = () => {
    if (state.input_sn_list.length === 0) {
      Modal.alert("提示", "没有找到sn,合包失败!");
      return;
    }
    Modal.alert("警告", "确认?", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: () => {
       

          pack_createpack({
            pcodeNum: state.input_sn_list[0],
          }).then((res) => {
            if (res.success === false) {
              sound.current.play();
              Modal.alert("提示", res.msg);
              setState((state) => {
                return {
                  ...state,
                  input_sn: "",
                  count: 0,
                  weight: 0,
                  price: 0,
                  input_sn_list: [],
                };
              });
              return;
            }
            console.log(res);
            Modal.alert("提示", "合包成功!");
            setState((state) => {
              return {
                ...state,
                count: 0,
                weight: 0,
                price: 0,
                input_sn_list: [],
              };
            });
            ref.current.ulv.updateRows([], 0);
            const data = res.data;
            handlePrint({
              packageNum: data.codeNum,
              expected_time: data.createTime,
              name: data.consignee.consignee,
              mobile: data.consignee.mobile,
              to: data.toChannelID,
              shipping: data.shippingID,
              payment: data.payment,
              client_phone: data.client_phone,
            });
          });
        },
      },
    ]);
  };

  const renderHeader = () => {
    return (
      <View>
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
        {[0, 1].map((value) => {
          return (
            <View
              key={value}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 15,
                paddingVertical: 9,
                alignItems: "center",
                backgroundColor: "#f5f5f9",
                borderBottomColor: "#ddd",
                borderBottomWidth: 1 / PixelRatio.get(),
              }}
            >
              <Text style={{ fontSize: 20, color: "#333" }}>
                条码: {state.input_sn_list[value]}
              </Text>
              {/* <Button size="small">清除</Button> */}
            </View>
          );
        })}

        <WhiteSpace />
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Button type="primary" onPress={handleCreateQrcode}>
            生成新条码
          </Button>
          <Button type="warning" onPress={handleMerge}>
            {route.params.type === 0 ? "合包" : "集包"}
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
              基础信息:包裹个数({state.count}),重量({state.weight}kg),价格(
              {state.price}元),
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
          <Text style={{ fontSize: 20, color: "#333" }}>
            运单号:{item.codeNum}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            目的站:{item.toChannelID}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            运输方式:{item.shippingID}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            承运商:{item.supplierID}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            收件人:{item.consignee.consignee}
          </Text>
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
          keyExtractor={({ codeNum }) => `key--${codeNum}`}
        />
      </View>
    </View>
  );
};
