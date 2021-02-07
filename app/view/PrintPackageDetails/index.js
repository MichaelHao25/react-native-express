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
  pack_subpack,
  pack_scan,
} from "../../util/api";
import theme from "../../theme";
import { useRef } from "react";
import Print from "../../util/print";
import Sound from "react-native-sound";
import { useState } from "react";
import usePdaScan from "react-native-pda-scan";


export default ({ navigation, route }) => {

  const ref = useRef();
  const blue = useRef();
  const sound = useRef();
  const [state, setState] = useState({
    input_sn: "",
    count: 0,
    price: 0,
    weight: 0,
  });
  useEffect(() => {
    blue.current = new Print();
    return () => {
      blue.current.disconnect();
    };
  }, []);
  useEffect(() => {
    Sound.setCategory("Playback");
    // See notes below about preloading sounds within initialization code below.
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
        handleSubmitEditing({
            nativeEvent: {
              text: e,
            },
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // pack_subpack
  const handleChangeText = (text) => {
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
  };
  const handleRemovePackage = ({ nativeEvent: { text } }) => {
    if (state.text === "") {
     
      return;
    }

    pack_scan({
      codeNum: text,
    }).then((res) => {
      if (res.success === false) {
        sound.current.play();
        Modal.alert("提示", res.msg);
        setState((state) => {
       
          return {
            ...state,
            input_sn: "",
          };
        });
      } else {
        // const { count, data, pcodeNum, price, weight } = res;
        setState((state) => {
         
          return {
            ...state,
            input_sn: "",
          };
        });
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
      }
    });
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
  const renderHeader = () => {
    return (
      <>
        <View>
          <InputItem
            autoCapitalize="none"
            type="text"
            placeholder="等待扫描中.."
            value={state.input_sn}
           
            onChangeText={handleChangeText}
            onSubmitEditing={handleRemovePackage}
          />
        </View>
        <View
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
          <Text style={{ fontSize: 12, color: "#333" }}>
            条码: {state.input_sn}
          </Text>
          {/* <Button size="small">清除</Button> */}
        </View>

        <WhiteSpace />
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Button type="warning" onPress={handleRemovePackage}>
            扫描
          </Button>
        </View>
        <WhiteSpace />
        {/* <View
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
        </View> */}
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
      </>
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
