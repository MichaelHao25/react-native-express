import React, { useEffect, useReducer } from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { useFocusEffect } from "@react-navigation/native";
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
import Sound from "react-native-sound";
import Tts from "react-native-tts";
import theme from "../../theme";
export default ({ navigation }) => {
  const [state, dispatch] = useReducer(
    (prevStete, action) => {
      switch (action.type) {
        case "ORDER_COUNT":
          return {
            ...prevStete,
            ...action.payload,
          };
        case "USER_NAME":
          return {
            ...prevStete,
            ...action.payload,
          };

        default:
          break;
      }
    },
    {
      userName: "admin",
      end_accept: "0",
      month_amount: "0",
      today_amount: "0",
      wait_accept: "0",
    }
  );
  useFocusEffect(
    React.useCallback(() => {
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
    }, [])
  );
  useEffect(() => {
    // Tts.speak("王老板,晚上好!!!!success!");
    AsyncStorage.getItem("username").then((res) => {
      //   setTimeout(() => {
      //   }, 1000);
      dispatch({
        type: "ORDER_COUNT",
        payload: {
          admin: res,
        },
      });
    });
  }, []);
  const handleGrid = (el, index) => {
    console.log(el, index);
    switch (index) {
      case 0: {
        navigation.navigate("mergePackage", {
          type: 0,
        });
        break;
      }
      case 1: {
        navigation.navigate("mergePackage", {
          type: 1,
        });
        break;
      }
      case 2: {
        navigation.navigate("removePackage");
        break;
      }
      case 3: {
        navigation.navigate("unpackPackage");
        break;
      }
      case 4: {
        navigation.navigate("outStock");
        break;
      }
      case 5: {
        navigation.navigate("set");
        break;
      }
      case 6: {
        navigation.navigate("scan");
        break;
      }
      default:
        break;
    }
  };
  return (
    <ScrollView>
      <List renderHeader={"用户信息"}>
        <List.Item arrow="empty">{state.userName}</List.Item>
        <List.Item>
          <Grid
            data={[
              {
                icon: require("../../image/merge.png"),
                text: `合包`,
              },
              {
                icon: require("../../image/merge.png"),
                text: `集包`,
              },
              {
                icon: require("../../image/merge.png"),
                text: `减包`,
              },
              {
                icon: require("../../image/merge.png"),
                text: `拆包`,
              },
              {
                icon: require("../../image/merge.png"),
                text: `出库`,
              },
              {
                icon: require("../../image/set.png"),
                text: `设置`,
              },
              {
                icon: require("../../image/none.png"),
                text: `扫描`,
              },
              {
                icon: require("../../image/none.png"),
                text: `已揽件`,
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
            navigation.navigate("list", { title: "待揽件列表", status: 0 });
          }}
          extra={state.wait_accept}
        >
          {parseInt(state.wait_accept) === 0 ? (
            <Text>待揽件数量</Text>
          ) : (
            <Badge dot>
              <Text>待揽件数量</Text>
            </Badge>
          )}
        </List.Item>
        <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "今日已揽件列表", status: 1 });
          }}
          extra={state.end_accept}
        >
          <Text>已揽件数量</Text>
          {/* <Badge dot></Badge> */}
        </List.Item>
        {/* <List.Item
          arrow="horizontal"
          onPress={() => {
            navigation.navigate("list", { title: "今日总数列表" });
          }}
          extra={state.today_amount}
        >
          <Text>今日总数</Text>
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
        </List.Item> */}
        {/* <List.Item arrow="empty" onPress={signOut}>
        <Text>退出登录</Text>
      </List.Item> */}
      </List>
    </ScrollView>
  );
};
