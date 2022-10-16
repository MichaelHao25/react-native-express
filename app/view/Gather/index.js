import {
  Button,
  InputItem,
  ListView,
  Modal,
  Toast,
  WhiteSpace,
} from '@ant-design/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { PixelRatio, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ScanButton from '../../component/ScanButton';
import { pack_addpack, pack_createcode, pack_createpack } from '../../util/api';
import Print from '../../util/print';
/*是否打印*/
let printStatus = false;
export default ({ navigation, route }) => {
  const ref = useRef();
  const blue = useRef();
  /**
   * 基础信息
   */
  const [state, setState] = useState({
    input_sn: '',
    input_sn_list: [],
    count: 0,
    price: 0,
    weight: 0,
  });
  /**
   * 是否展开
   */
  const [expansion, setExpansion] = useState([]);
  /**
   * 防止合包成功，但是打印机故障的时候存储上一次的pcode
   */
  const [prevPCode, setPrevPCode] = useState('');
  /**
   * 初始化连接蓝牙
   */
  useEffect(() => {
    /*打印机初始化---start*/
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
          handleSubmitEditing({
            nativeEvent: {
              text: QRcode,
            },
          });
        }
      });
    }, [state])
  );
  /**
   * 打印开始
   * @param item
   * @returns {Promise<void>}
   */
  const handlePrint = async (item) => {
    const num = item.num || 1;
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
  /**
   * 创建一个条码
   */
  const handleCreateQrcode = () => {
    Modal.alert('警告', '确定生成条码?', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '确定',
        onPress: () => {
          pack_createcode({
            type: route.params.type + 1,
          }).then((res) => {
            const { codeNum } = res;
            setState((state) => {
              return {
                ...state,
                input_sn_list: [codeNum],
              };
            });
            handlePrint({
              packageNum: codeNum,
              flag: res.codeType,
            });
          });
        },
      },
    ]);
  };
  /**
   * 输入框发生改变
   * @param text
   */
  const handleChangeText = (text) => {
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
  };
  /**
   * 条码提交的时候
   * @param text
   */
  const handleSubmitEditing = ({ nativeEvent: { text } }) => {
    const { input_sn_list } = state;

    if (!input_sn_list.includes(text)) {
      input_sn_list.push(text);
    }

    pack_addpack({
      codeNum: [...input_sn_list].join(','),
      type: route.params.type + 1,
    }).then((res) => {
      if (res.success === false) {
        Toast.fail(res.msg);
      }
      // count: "64"
      // data: (8)
      // pcodeNum: "PK1611758823"
      // price: 111.01

      const { count, data, pcodeNum, price, weight } = res;
      /**
       * 加包的时候获取主包号兜底打印
       */
      setPrevPCode(pcodeNum);
      //   if (count) {
      // 去掉的具体原因参考20210130下午五点钟的消息记录
      ref.current.ulv.updateRows(data, 0);
      setState((state) => {
        return {
          ...state,
          input_sn: '',
          input_sn_list: pcodeNum ? [pcodeNum] : [],
          count,
          price,
          weight,
        };
      });
      //   }
    });
    // setState((state) => {
    //   const { input_sn_list } = state;
    //   const length = input_sn_list.length;
    //   if (length <= 1) {
    //     input_sn_list.push(text);
    //   }
    //   return {
    //     ...state,
    //     input_sn_list,
    //     input_sn: "",
    //   };
    // });
  };
  const handleMergeAfter = () => {
    if (state.input_sn_list.length === 0) {
      Modal.alert('提示', '没有找到sn,合包失败!');
      return;
    }
    handleMerge();
  };
  const handleMerge = () => {
    let content = '';
    const res = {
      pcodeNum: state.input_sn_list[0],
    };

    Modal.alert('警告', content, [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '确定',
        onPress: () => {
          pack_createpack(res).then((res) => {
            if (res.success === false) {
              Modal.alert('提示', res.msg);
              setState((state) => {
                return {
                  ...state,
                  input_sn: '',
                  count: 0,
                  weight: 0,
                  price: 0,
                  input_sn_list: [],
                };
              });
              return;
            }
            console.log(res);
            // Modal.alert(
            //     "提示",
            //     "集包成功!"
            // );
            setState((state) => {
              return {
                ...state,
                count: 0,
                weight: 0,
                price: 0,
                input_sn_list: [],
              };
            });
            ref.current.ulv.updateRows([], 0);
            if (printStatus) {
              const data = res.data;
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
                flag: res.codeType,
                trueAddr: res.trueAddr,
                num: res.num,
              });
            }
          });
        },
      },
    ]);
  };
  const renderRow = ({ title, value }) => {
    const renderContent = () => {
      if (typeof title === 'function' && typeof value === 'function') {
        return (
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {title()}
            {value()}
          </View>
        );
      } else {
        return (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: '#888' }}>
              {title}
              <Text style={{ fontWeight: 'bold' }}>{value}</Text>
            </Text>
          </View>
        );
      }
    };
    return (
      <>
        <View
          style={{
            flexDirection: 'column',
            paddingHorizontal: 15,
            paddingVertical: 9,
            backgroundColor: '#f5f5f9',
            borderBottomColor: '#ddd',
            borderBottomWidth: 1 / PixelRatio.get(),
          }}
        >
          {renderContent()}
        </View>
      </>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        <View>
          <InputItem
            autoCapitalize='none'
            type='text'
            placeholder='等待扫描中..'
            value={state.input_sn}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmitEditing}
          />
        </View>
        {renderRow({
          title: '拼  包  号:  ',
          value: state.input_sn_list[0],
        })}
        {renderRow({
          title: '包裹个数:  ',
          value: state.count,
        })}
        {renderRow({
          title() {
            return <Text>{`重        量:  ${state.weight}kg`}</Text>;
          },
          value() {
            /**
             * 如果是集包的话就不称重
             */
            return <></>;
          },
        })}
        <WhiteSpace />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <ScanButton />
          <Button type='primary' onPress={handleCreateQrcode}>
            生成
          </Button>
          <Button
            type='warning'
            onPress={() => {
              printStatus = false;
              handleMergeAfter();
            }}
          >
            拼包
          </Button>
          <Button
            type='primary'
            onPress={() => {
              printStatus = true;
              handleMergeAfter();
            }}
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
      </View>
    );
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
        <TouchableOpacity
          style={{ flexDirection: 'column' }}
          activeOpacity={0.9}
          onPress={() => {
            setExpansion((res) => {
              if (res.includes(item.codeNum)) {
                return [...res.filter((a) => a !== item.codeNum)];
              } else {
                res.push(item.codeNum);
                return [...res];
              }
            });
          }}
        >
          <Text style={{ fontSize: 20, color: '#333' }}>
            运单号:{item.codeNum}
          </Text>
          {expansion.includes(item.codeNum) ? (
            <>
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
            </>
          ) : null}
        </TouchableOpacity>
      </View>
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
          paginationWaitingView={() => <></>}
          paginationFetchingView={() => <></>}
          paginationWaitingView={() => <></>}
          keyExtractor={({ codeNum }) => `key--${codeNum}`}
        />
      </View>
    </View>
  );
};
