import React, { useEffect, useRef } from 'react';
import { SearchBar, List } from '@ant-design/react-native'
import { ScrollView, View } from 'react-native'
import { order_consignee } from '../../util/api'
import Storage from '@react-native-community/async-storage'
import { useState } from 'react';

const App = ({ navigation, route }) => {
  const ref = useRef()
  const type = route.params.type;
  const [list, setList] = useState({
    total: [],
    show: [],
  })
  const [name, setName] = useState('')
  useEffect(() => {
    navigation.setOptions({ title: route.params.title })
    switch (route.params.type) {
      case 'order_consignee':
        order_consignee().then(res => {
          console.log(res);
          setList({
            total: res.data,
            show: res.data,
          });
        })
        break;

      default:
        break;
    }
  }, [])
  useEffect(() => {
    const show = list.total.filter(value => {
      debugger
      if (!value.consignee) {
        return false
      }
      return value.consignee.toLowerCase().includes(name.toLowerCase())
    })
    setList(list => {
      return {
        ...list,
        show
      }
    })
  }, [name])
  const handleSelectUser = (userInfo) => {
    Storage.setItem(type,JSON.stringify(userInfo)).then(_=>{
      navigation.goBack();
    })
  }
  return <View style={{ flex: 1 }}>
    <SearchBar placeholder="请输入姓名" autoCapitalize={'none'} value={name} onChange={name => setName(name)} ref={ref} placeholder="搜索" />
    <ScrollView style={{ flex: 1 }}>
      {
        list.show.map((value) => {
          return <List key={value.id}>
            <List.Item onPress={() => handleSelectUser({
              consignee: value.consignee,
              id: value.id,
              mobile: value.mobile,
              address: value.address
            })}>姓名:{value.consignee}</List.Item>
            <List.Item onPress={() => handleSelectUser({
              consignee: value.consignee,
              id: value.id,
              mobile: value.mobile,
              address: value.address
            })}>电话:{value.mobile}</List.Item>
            <List.Item onPress={() => handleSelectUser({
              consignee: value.consignee,
              id: value.id,
              mobile: value.mobile,
              address: value.address
            })}>地址:{value.address}</List.Item>
          </List>
        })
      }
    </ScrollView>
  </View>
}
export default App;
