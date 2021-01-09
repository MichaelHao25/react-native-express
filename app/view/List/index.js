import React from "react";
import { StyleSheet, Text, View, } from 'react-native';
import { List, ListView } from "@ant-design/react-native";
import { useEffect } from "react";
import { order_accept_list } from "../../util/api";


export default ({ navigation, route }) => {
  useEffect(() => {
    navigation.setOptions({ title: route.params.title })
  }, [])
  const onFetch = (
    page = 1,
    startFetch,
    abortFetch
  ) => {
    order_accept_list({
      page,
      limit: 5,
    }).then(res => {
      const { data } = res;
      startFetch(data, 5)
    }).catch(() => {
      abortFetch();
    })
  }
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
    return <List renderHeader="信息详情">
      <List.Item
        wrap
        extra={item.packageNum}
        multipleLine
      >运单号</List.Item>
      <List.Item
        wrap
        extra={item.userID}
        multipleLine
      >寄件人</List.Item>
      <List.Item
        wrap
        extra={item.address}
        multipleLine
      >寄件人地址</List.Item>
      <List.Item
        wrap
        extra={item.moblie}
        multipleLine
      >寄件人电话</List.Item>
      <List.Item
        wrap
        extra={item.consignee}
        multipleLine
      >收件人</List.Item>
      <List.Item
        wrap
        extra={item.phone}
        multipleLine
      >收件人电话</List.Item>
      <List.Item
        wrap
        extra={item.pick_time}
        multipleLine
      >取件时间</List.Item>
      <List.Item
        wrap
        extra={item.expected_time}
        multipleLine
      >预约时间</List.Item>
      <List.Item
        wrap
        extra={item.status === 0 ? "未取件" : "取件"}
        multipleLine
      >状态</List.Item>
    </List>
  }
  return <ListView
    onFetch={onFetch}
    renderItem={renderItem}
    keyExtractor={({ orderID }) => `key--${orderID}`}
  />
}
