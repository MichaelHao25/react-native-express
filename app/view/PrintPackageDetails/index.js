import { Button, InputItem, Modal, WhiteSpace } from '@ant-design/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { PixelRatio, ScrollView, Text, View } from 'react-native';
import ScanButton from '../../component/ScanButton';
import { pack_realaddr, pack_scan } from '../../util/api';
import Print from '../../util/print';

export default ({ navigation, route }) => {
  const blue = useRef();

  const [state, setState] = useState({
    input_sn: '',
    count: 0,
    price: 0,
    weight: 0,
  });
  const [resList, setResList] = useState(new Map());
  const [item, setItem] = useState({});
  useEffect(() => {
    blue.current = new Print();
    blue.current.boot().then(() => {
      return blue.current.getPeripheralId();
    });

    return () => {
      blue.current.disconnect();
    };
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('QRcode').then((QRcode) => {
        if (QRcode) {
          AsyncStorage.removeItem('QRcode');
          handleRemovePackage({
            nativeEvent: {
              text: QRcode,
              print: false,
            },
          });
        }
      });
    }, [state, resList])
  );
  const handlePrint = async (item) => {
    const num = item.num;
    for (let i = 1; i <= parseInt(num); i++) {
      try {
        blue.current.getPrint({
          ...item,
          pages: `${i}/${num}`,
        });
        await blue.current
          .connect()
          .then((res) => {
            console.log(res);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleChangeText = (text) => {
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
  };
  // print = false 的时候不打印
  const handleRemovePackage = async ({
    nativeEvent: { text = '', print = true },
  }) => {
    console.log('text', text);
    if (state.text === '' || text === '') {
      return;
    }
    let res;
    try {
      if (resList.has(text)) {
        res = resList.get(text);
      } else {
        /**
         * 根据是否显示真实地址来请求不同的接口
         */
        if (route.params.showAddress === true) {
          res = await pack_realaddr({
            codeNum: text,
          });
        } else {
          res = await pack_scan({
            codeNum: text,
          });
        }
        resList.set(text, res);
        setResList(resList);
      }
    } catch (e) {
      Modal.alert('提示', '请求失败，请检查接口或者网络！');
    }
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
    if (res?.success !== true) {
      Modal.alert('提示', res.msg);
      // setState((state) => {
      //     return {
      //         ...state,
      //         input_sn: "",
      //     };
      // });
    } else {
      // const { count, data, pcodeNum, price, weight } = res;
      // setState((state) => {
      //
      //     return {
      //         ...state,
      //         input_sn: "",
      //     };
      // });
      const data = res.data;
      console.log('data', data);
      // {"client_phone": "0577-26531009", "codeNum": "SJT1620962651", "consignee": {"consignee": "爆小姐", "mobile": "137****0681"}, "createTime": "2021-05-14 11:24:11", "fromChannelID": null, "num": "1", "payment": "到付", "shippingID": "快件", "status": "已入库", "supplierID": "速安达", "toChannelID": "上海青浦"}
      setItem(data);
      const addr = data?.pickup?.addr;
      if (print === true) {
        handlePrint({
          supplier: data.supplier,
          packageNum: data.codeNum,
          expected_time: data.createTime,
          name: data.consignee.consignee,
          mobile: data.consignee.mobile,
          to: data.toChannelID,
          shipping: data.shippingID,
          payment: data.payment,
          client_phone: data.client_phone,
          trueAddr: data.trueAddr,
          num: data.num,
          pickup_addr: addr ? addr : '',
        });
      }
    }
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
            onSubmitEditing={handleRemovePackage}
          />
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
          <Button
            type='warning'
            onPress={() =>
              handleRemovePackage({ nativeEvent: { text: state.input_sn } })
            }
          >
            打印
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
  const renderItem = ({ item }) => {
    if (Object.keys(item).length === 0) {
      return <></>;
    }
    return (
      <View
        style={{
          borderBottomColor: '#ddd',
          borderBottomWidth: 1 / PixelRatio.get(),
          paddingHorizontal: 15,
          flexDirection: 'column',
          //   justifyContent: "space-between",
          //   alignItems: "center",
          paddingVertical: 15,
          backgroundColor: '#fff',
          margin: 10,
          marginBottom: 0,
          borderRadius: 5,
        }}
      >
        {/*预约时间：***********            待取件*/}
        {/*揽件地址：************/}
        {/*现付  1000KG*/}
        {/*--------------------------------------*/}
        {/*南油 - 深圳 - 快件*/}
        {/*寄：王老板（1888888888）*/}
        {/*收：王小姐（188****8888）*/}
        <View style={{ flexDirection: 'column' }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ width: '80%' }}>
              <Text style={{ fontSize: 20, color: '#333' }}>
                {item.pickup.address}
              </Text>
            </View>
          </View>

          <WhiteSpace />
          <Text style={{ fontSize: 20, color: '#333' }}>
            {item.payment}-{item.status}
          </Text>
          <WhiteSpace />
          <Text style={{ fontSize: 20, color: '#333' }}>
            寄:{item.pickup.name}({item.pickup.mobile})
          </Text>
          <WhiteSpace />
          <Text
            style={{
              fontSize: 20,
              color: '#333',
            }}
          >
            收:{item.consignee.consignee}({item.consignee.mobile})
          </Text>
        </View>
        <WhiteSpace />
      </View>
    );
  };
  return (
    <ScrollView style={{ backgroundColor: '#fff', flex: 1 }}>
      <View style={{ flex: 1 }}>
        {renderHeader()}
        {renderItem({ item })}
      </View>
    </ScrollView>
  );
};
