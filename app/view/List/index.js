import React from "react";
import { StyleSheet, Text, View, PixelRatio } from "react-native";
import {
  List,
  ListView,
  Button,
  WhiteSpace,
  Picker,
} from "@ant-design/react-native";
import { useEffect } from "react";
import { order_accept_list } from "../../util/api";
import theme from "../../theme";

export default ({ navigation, route }) => {
  useEffect(() => {
    navigation.setOptions({ title: route.params.title });
  }, []);
  const onFetch = (page = 1, startFetch, abortFetch) => {
    order_accept_list({
      page,
      limit: 5,
    })
      .then((res) => {
        const { data } = res;
        startFetch(data, 5);
      })
      .catch(() => {
        abortFetch();
      });
  };
  const renderHeader = () => {
    return (
      <View>
        <View style={{ width: "50%" }}>
          <Picker
            data={[
              {
                value: "all",
                label: "筛选地区",
              },
              {
                value: "all",
                label: "上海",
              },
              {
                value: "all",
                label: "河北",
              },
            ]}
            cols={1}
            value={"all"}
            onChange={(e) => {
              console.log(e);
            }}
          >
            <List.Item arrow="horizontal" onPress={this.onPress}></List.Item>
          </Picker>
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
            <Text style={{ fontSize: 14, color: "#888" }}>取件信息</Text>
          </View>
          <View style={{ width: 70 }}>
            <Text
              style={{
                fontSize: 14,
                color: "#888",
                textAlign: "center",
              }}
            >
              操作
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const renderItem = (item) => {
    // {
    //     address: "上海市闸北区 电信ADSL"
    //     consignee: "演示账号"
    //     expected_time: "2020-12-23 23:30:27"
    //     moblie: "18111111111"
    //     orderID: "1"
    //     packageNum: "1"
    //     phone: "13453661048"
    //     pick_time: "2020-12-04 21:12:16"
    //     status: "1"
    //     userID: "Monster"
    // }
    return (
      <View
        style={{
          borderBottomColor: "#ddd",
          borderBottomWidth: 1 / PixelRatio.get(),
          paddingHorizontal: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 15,
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 17, color: "#333" }}>2012-12-30 12:00</Text>
          <WhiteSpace />
          <Text style={{ fontSize: 17, color: "#333" }}>
            深圳-上海-快件(100件)
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 17, color: "#333" }}>
            深圳南山区*****8号
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 17, color: "#333" }}>朱坤(1363232323)</Text>
        </View>
        <View style={{ width: 70 }}>
          <Button type="primary">打印</Button>
          <WhiteSpace />
          <Button type="warning">放弃</Button>
        </View>
      </View>
    );
  };
  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ListView
          header={renderHeader}
          onFetch={onFetch}
          renderItem={renderItem}
          keyExtractor={({ orderID }) => `key--${orderID}`}
        />
      </View>
    </View>
  );
};
