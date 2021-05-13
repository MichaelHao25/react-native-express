import React from "react";
import { StyleSheet, Text, View, PixelRatio } from "react-native";
import {
  List,
  ListView,
  Button,
  WhiteSpace,
  Picker,
  WingBlank,
  Toast,
  Modal,
} from "@ant-design/react-native";
import { useEffect } from "react";
import { order_accept_list, order_pickup, order_claim } from "../../util/api";
import theme from "../../theme";
import { useRef } from "react";
import Print from "../../util/print";

export default ({ navigation, route }) => {
  const ref = useRef();
  const blue = useRef();

  useEffect(() => {
    navigation.setOptions({ title: route.params.title });
    blue.current = new Print();
    return () => {
      blue.current.disconnect();
    };
  }, []);
  const onFetch = (page = 1, startFetch, abortFetch) => {
    order_accept_list({
      page,
      limit: 5,
      status: route.params.status,
      today: route?.params?.today,
    })
      .then((res) => {
        console.log(res);
        const { data } = res;
        startFetch(data, 5);
      })
      .catch(() => {
        abortFetch();
      });
  };
  //   取件
  const handle_order_pickup = ({ orderID, item }) => {
    // console.log(ref.current.ulv.getRows());
    // ref.current.ulv.getPage()
    // ref.current.ulv.updateRows(,0)

    Modal.alert("警告", "确认?", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: () => {
          order_pickup({ orderID }).then((res) => {
            console.log(res);
            let dataSource = [...ref.current.ulv.getRows()];
            dataSource = dataSource.filter((value) => {
              if (value.orderID === orderID) {
                value.status = 1;
                return false;
              }
              return true;
            });
            ref.current.ulv.updateRows(dataSource, 0);
            Toast.success("成功!", 2, () => {}, false);
            handlePrint({ item });
          });
        },
      },
    ]);
  };
  // 领取
  const handle_order_claim = ({ orderID }) => {
    Modal.alert("警告", "确认?", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: () => {
          order_claim({ orderID }).then((res) => {
            console.log(res);
            const dataSource = [...ref.current.ulv.getRows()];
            dataSource.find((value) => {
              if (value.orderID === orderID) {
                value.adminID = 2;
                return true;
              }
              return false;
            });
            ref.current.ulv.updateRows(dataSource, 0);
            Toast.success("成功!", 2, () => {}, false);
          });
        },
      },
    ]);
  };
  const handlePrint = ({ item }) => {
    const {
      packageNum,
      expected_time,
      consignee: { name, mobile },
      to,
      supplier,
      shipping,
      payment,
      client_phone,
    } = item;
    blue.current.getPrint({
      supplier,
      packageNum,
      expected_time,
      to,
      shipping,
      name,
      mobile,
      payment,
      client_phone,
    });
    blue.current
      .connect()
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const renderHeader = () => {
    return (
      <View>
        {/* <View style={{ width: "50%" }}>
          <Picker
            data={[
              {
                value: "all",
                label: "筛选地区",
              },
              {
                value: "shanghai",
                label: "上海",
              },
              {
                value: "hebei",
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
    return (
      <View
        style={{
          borderBottomColor: "#ddd",
          borderBottomWidth: 1 / PixelRatio.get(),
          paddingHorizontal: 15,
          flexDirection: "column",
          //   justifyContent: "space-between",
          //   alignItems: "center",
          paddingVertical: 15,
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 20, color: "#333" }}>
            {item.expected_time}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            {item.channel}({item.num}件)
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            {item.pickup.address}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            寄:{item.pickup.name}({item.pickup.mobile})
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            收:{item.consignee.name}({item.consignee.mobile})
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>
            预估重量:{item.weight}kg
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: "#333" }}>{item.payment}</Text>
        </View>
        <WhiteSpace />
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          {item.adminID == 0 ? (
            <WingBlank size="sm">
              <Button
                type="primary"
                onPress={() => {
                  handle_order_claim({ orderID: item.orderID });
                }}
              >
                领取
              </Button>
            </WingBlank>
          ) : null}
          {item.status == 0 ? (
            <WingBlank size="sm">
              <Button
                type="primary"
                onPress={() => {
                  handle_order_pickup({ orderID: item.orderID, item });
                }}
              >
                取件
              </Button>
            </WingBlank>
          ) : null}
          {item.status == 1 ? (
            <WingBlank size="sm">
              <Button
                type="primary"
                onPress={() => {
                  handlePrint({ item });
                }}
              >
                打印
              </Button>
            </WingBlank>
          ) : null}
          {/* <WingBlank size="sm">
            <Button type="warning">放弃</Button>
          </WingBlank> */}
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
          onFetch={onFetch}
          renderItem={renderItem}
          displayDate
          keyExtractor={({ orderID }) => `key--${orderID}`}
        />
      </View>
    </View>
  );
};
