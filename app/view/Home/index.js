import React, { useEffect, useReducer } from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import {
  Button,
  List,
  InputItem,
  WingBlank,
  Grid,
  Badge,
  Modal,
} from "@ant-design/react-native";
import { order_count } from "../../util/api";
import theme from "../../theme";
const App = ({ navigation }) => {
  const [state, dispatch] = useReducer(
    (prevStete, action) => {
      switch (action.type) {
        case "ORDER_COUNT":
          return {
            ...prevStete,
            ...action.payload,
          };

        default:
          break;
      }
    },
    {
      end_accept: "0",
      month_amount: "0",
      today_amount: "0",
      wait_accept: "0",
    }
  );
  useEffect(() => {
    order_count().then(
      ({ data: { end_accept, month_amount, today_amount, wait_accept } }) => {
        dispatch({
          type: "ORDER_COUNT",
          payload: {
            end_accept,
            month_amount,
            today_amount,
            wait_accept,
          },
        });
      }
    );
  }, []);
  const handleGrid = (el, index) => {
    console.log(el, index);
    switch (index) {
      case 1: {
        navigation.navigate("createExpress");
        break;
      }
      case 2: {
        navigation.navigate("set");
        break;
      }
      case 3: {
        
        break;
      }
      default:
        break;
    }
  };
  return (
    <ScrollView>
      <List renderHeader={"用户信息"}>
        <List.Item arrow="empty">王五(1212121212)</List.Item>
        <List.Item>
          <Grid
            data={[
              {
                icon: require("../../image/scanf.png"),
                text: `扫码`,
              },
              {
                icon: require("../../image/create.png"),
                text: `创建运单`,
              },
              {
                icon: require("../../image/set.png"),
                text: `设置`,
              },
              {
                icon: require("../../image/none.png"),
                text: `退出登录`,
              },
            ]}
            renderItem={(item) => {
              return (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={
                      typeof item.icon === "number"
                        ? item.icon
                        : { src: item.icon }
                    }
                    style={{
                      width: theme.icon_size_md,
                      height: theme.icon_size_md,
                    }}
                  ></Image>
                  <View style={{ marginTop: theme.h_spacing_sm }}>
                    <Text style={{ fontSize: theme.font_size_icontext }}>
                      {item.text}
                    </Text>
                  </View>
                </View>
              );
            }}
            onPress={handleGrid}
            hasLine={true}
          />
        </List.Item>
        <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "待揽件列表" });
          }}
          extra={state.wait_accept}
        >
          <Badge dot>
            <Text>待揽件数量</Text>
          </Badge>
        </List.Item>
        <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "已揽件列表" });
          }}
          extra={state.end_accept}
        >
          <Text>已揽件数量</Text>
          {/* <Badge dot></Badge> */}
        </List.Item>
        <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "今日总数列表" });
          }}
          extra={state.today_amount}
        >
          <Text>今日总数</Text>
          {/* <Badge dot></Badge> */}
        </List.Item>
        <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "本月总数列表" });
          }}
          extra={state.month_amount}
        >
          <Badge dot>
            <Text>本月总数</Text>
          </Badge>
        </List.Item>
        {/* <List.Item arrow="empty" onPress={signOut}>
        <Text>退出登录</Text>
      </List.Item> */}
      </List>
    </ScrollView>
  );
};
export default App;
