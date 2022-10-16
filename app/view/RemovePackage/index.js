import {
  Button,
  InputItem,
  ListView,
  Modal,
  WhiteSpace,
} from '@ant-design/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { PixelRatio, Text, View } from 'react-native';
import ScanButton from '../../component/ScanButton';
import { pack_subpack } from '../../util/api';
export default ({ navigation, route }) => {
  const ref = useRef();

  const [state, setState] = useState({
    input_sn: '',
    count: 0,
    price: 0,
    weight: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('QRcode').then((QRcode) => {
        if (QRcode) {
          AsyncStorage.removeItem('QRcode');
          handleChangeText(QRcode);
        }
      });
    }, [])
  );

  // pack_subpack
  const handleChangeText = (text) => {
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
  };
  const handleRemovePackage = () => {
    if (state.input_sn === '') {
      return;
    }
    Modal.alert('警告', '确认移除该包裹?', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '确定',
        onPress: () => {
          pack_subpack({
            codeNum: state.input_sn,
          }).then((res) => {
            if (res.success === false) {
              Modal.alert('提示', res.msg);
            } else {
              // Modal.alert("提示", "减包成功!");
              const { count, data, pcodeNum, price, weight } = res;
              setState((state) => {
                ref.current.ulv.updateRows(data, 0);
                return {
                  ...state,
                  input_sn: '',
                  count,
                  price,
                  weight,
                };
              });
            }
          });
        },
      },
    ]);
  };
  const renderItem = (item) => {
    return (
      <View
        style={{
          borderBottomColor: '#ddd',
          borderBottomWidth: 1 / PixelRatio.get(),
          paddingHorizontal: 15,
          flexDirection: 'column',
          paddingVertical: 15,
        }}
      >
        <View style={{ flexDirection: 'column' }}>
          <Text style={{ fontSize: 20, color: '#333' }}>
            运单号:{item.codeNum}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: '#333' }}>
            目的站:{item.toChannelID}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: '#333' }}>
            运输方式:{item.shippingID}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: '#333' }}>
            承运商:{item.supplierID}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: '#333' }}>
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
            autoCapitalize='none'
            type='text'
            placeholder='等待扫描中..'
            value={state.input_sn}
            onChangeText={handleChangeText}
          />
        </View>
        <WhiteSpace />
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 15,
            paddingVertical: 9,
            backgroundColor: '#f5f5f9',
            borderBottomColor: '#ddd',
            borderBottomWidth: 1 / PixelRatio.get(),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: '#888' }}>
              基础信息:包裹个数({state.count}),重量({state.weight}kg),价格(
              {state.price}元),
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 9,
            alignItems: 'center',
            backgroundColor: '#f5f5f9',
            borderBottomColor: '#ddd',
            borderBottomWidth: 1 / PixelRatio.get(),
          }}
        >
          <Text style={{ fontSize: 12, color: '#333' }}>
            条码: {state.input_sn}
          </Text>
          {/* <Button size="small">清除</Button> */}
        </View>

        <WhiteSpace />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <ScanButton />
          <Button type='warning' onPress={handleRemovePackage}>
            减包
          </Button>
        </View>
        <WhiteSpace />
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 15,
            paddingVertical: 9,
            backgroundColor: '#f5f5f9',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: '#888' }}>包裹信息</Text>
          </View>
        </View>
      </>
    );
  };
  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
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
