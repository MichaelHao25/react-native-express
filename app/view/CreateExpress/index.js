import React, { useEffect, useReducer } from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { Button, List, InputItem, WingBlank, Grid, Badge, Modal, Picker } from '@ant-design/react-native';
import { useFocusEffect } from '@react-navigation/native'
import Storage from '@react-native-community/async-storage'
import {
  order_supplier,
  order_member,
  order_consignee,
  order_store,
  order_address
} from "../../util/api";
import AuthContext from "../../util/AuthContext";
import theme from '../../theme'
import { useState } from 'react';

const App = ({ navigation }) => {
  const types = [
    'order_consignee',
  ]
  const [formData, setFormData] = useState({
    supplierID: ''
  });
  const [supplier, setSupplier] = useState([]);
  const [member, setMember] = useState([]);
  
  useFocusEffect(
    React.useCallback(() => {
      console.log('focus');
      Storage.getItem(types[0]).then(res => {
        console.log(JSON.parse(res));
      })
    }, [])
  );
  useEffect(() => {

    order_supplier().then(res => {
      let supplier = [];
      res.data.forEach(value => {
        supplier.push({
          value: value.id,
          label: value.name
        })
      })
      setSupplier(supplier);
    })
    order_member().then(res => {
      console.log(res);
    })
    // order_consignee().then(res => {
    //   console.log(res);
    // })
    // order_store().then(res => {
    //   console.log(res);
    // })
    // order_address().then(res => {
    //   console.log(res);
    // })
  }, [])
  return (
    <ScrollView
      style={{ flex: 1 }}
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      <List renderHeader={'寄件人信息'}>
        <InputItem
          autoCapitalize="none"
          textAlign="right"
        >寄件人</InputItem>
      </List>
      <List renderHeader={"收件人信息"}>
        <List.Item
          onPress={() => {
            navigation.navigate('search', {
              title: '搜索收件人信息',
              type: types[0]
            })
          }}
          arrow={'horizontal'}
        >
          收件人
        </List.Item>

        <InputItem
          autoCapitalize="none"
        >目的站</InputItem>
        <InputItem
          autoCapitalize="none"
        >电话</InputItem>
        <InputItem
          autoCapitalize="none"
        >地址</InputItem>
      </List>
      <List renderHeader={"商品信息"}>
        <Picker
          data={supplier}
          cols={1}
          value={formData.supplierID}
          onChange={(e) => {
            setFormData(formData => ({
              ...formData,
              supplierID: e[0]
            }))
          }}
        >
          {/* onPress={this.onPress} */}
          <List.Item arrow="horizontal">
            承运商
              </List.Item>
        </Picker>
        <InputItem
          autoCapitalize="none"
        >运输方式</InputItem>
        <InputItem
          autoCapitalize="none"
        >寄件方式</InputItem>
        <InputItem
          autoCapitalize="none"
        >取件时间</InputItem>
        <InputItem
          autoCapitalize="none"
        >件数</InputItem>
        <InputItem
          autoCapitalize="none"
        >重量</InputItem>
        <InputItem
          autoCapitalize="none"
        >品名</InputItem>
        <InputItem
          autoCapitalize="none"
        >包装</InputItem>

        <List.Item>
          <Button
            onPress={() => {
              this.inputRef.focus();
            }}
            type="primary"
          >
            提交信息
            </Button>
        </List.Item>
      </List>
    </ScrollView>
  );
}
export default App
