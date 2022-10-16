import {
  Button,
  Checkbox,
  InputItem,
  List,
  ListView,
  Modal,
  Picker,
  Toast,
  WhiteSpace,
} from '@ant-design/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { PixelRatio, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ScanButton from '../../component/ScanButton';
import {
  common_bagprice,
  pack_addpack,
  pack_createcode,
  pack_createpack,
} from '../../util/api';
import Print from '../../util/print';
import Scales from '../../util/scales';

/*是否打印*/
let printStatus = false;
export default ({ navigation, route }) => {
  const ref = useRef();
  const blue = useRef();
  const scales = useRef();
  const [state, setState] = useState({
    input_sn: '',
    input_sn_list: [],
    count: 0,
    price: 0,
    weight: 0,
    getWeight: true,
  });
  const [expansion, setExpansion] = useState([]);

  const [dropList, setDropList] = useState([]);
  const [common_bag_select, setCommon_bag_select] = useState(0);
  const [weight, setWeight] = useState('');

  /**
   * 防止合包成功，但是打印机故障的时候存储上一次的pcode
   */
  const [prevPCode, setPrevPCode] = useState('');
  /**
   * 初始化链接蓝牙
   */
  useEffect(() => {
    // navigation.setOptions({title: route.params.type === 0 ? "合包" : "拼包"});
    /*打印机初始化---start*/
    blue.current = new Print();
    blue.current
      .boot()
      .then(() => {
        return blue.current.getPeripheralId();
      })
      .then((res) => {
        console.log('res', res);
      });
    /*打印机初始化---end*/
    /*体重秤初始化---start*/
    // 如果是集包的话就不初始化体重秤
    if (route.params.type === 0) {
      scales.current = new Scales({
        handleBindNotificationEvent({ data }) {
          const res = data.match(/\d.*?kg/);
          if (res) {
            const [weight = '0.00 kg'] = res;
            setWeight([...weight]);
          } else {
            setWeight([...'0.00 kg']);
          }
          // const [weight = '0.00 kg'] = 'data'.match(/\d.*?$/)
        },
      });
      scales.current
        .boot()
        .then(() => {
          return scales.current.getPeripheralId();
        })
        .then(() => {
          return scales.current.connect();
        })
        .then(() => {
          return scales.current.retrieveServices();
        })
        .then((res) => {
          scales.current.handleBindNotificationEvent();
          return scales.current.startNotification();
        });
    }
    /*体重秤初始化---end*/
    return () => {
      // 如果是集包的话就不卸载体重秤
      if (route.params.type === 0) {
        scales.current.handleUnbindNotificationEvent();
        scales.current.stopNotification();
      }
      blue.current.disconnect();
    };
  }, []);
  useEffect(() => {
    common_bagprice().then((res) => {
      const { data = [] } = res;

      setDropList(() => {
        return data.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      });
    });
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
  useEffect(() => {
    console.log('useEffect-weight');
    if (weight) {
      handleMerge(weight);
    }
  }, [weight]);
  const handleGetWeight = () => {
    if (scales.current) {
      scales.current.connect().then(() => {
        scales.current.write();
      });
    } else {
      setWeight([...'0.00 kg']);
    }
  };
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
  const handleChangeText = (text) => {
    setState((state) => {
      return {
        ...state,
        input_sn: text,
      };
    });
  };
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

      const { count = 0, data, pcodeNum = '', price = 0, weight = 0 } = res;
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
    if (state.getWeight === true) {
      handleGetWeight();
    } else {
      handleMerge();
    }
    // }else if(common_bag_select===1) {
    //
    // }else{
    //
    // }
    // common_bag_list
  };
  const handleMerge = (getWeight = '') => {
    console.log('handleMerge');
    // getWeigth

    let packageWeight = '';
    let content = '';
    const res = {
      pcodeNum: state.input_sn_list[0],
    };

    if (state.getWeight === true) {
      packageWeight = getWeight.join('');
      res.weight = packageWeight.replace(/[ kg]/g, '');
    } else if (common_bag_select === 0) {
      Modal.alert('警告', '请选择价格！');
      return;
    }
    if (state.getWeight === false) {
      content += `${common_bag_select}元  `;

      res.price = common_bag_select;
    } else {
      console.log('getWeight', getWeight.join(''));
      content += `${getWeight.join('')}`;
    }

    console.log('content', content);
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
            //     "合包成功!"
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
            const data = res.data;
            if (printStatus) {
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
          title: '合  包  号:  ',
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
            return (
              <Checkbox
                checked={state.getWeight}
                onChange={({ target }) => {
                  const { checked } = target;
                  setState((state) => {
                    return {
                      ...state,
                      getWeight: checked,
                    };
                  });
                  setCommon_bag_select(0);
                }}
              >
                称重
              </Checkbox>
            );
          },
        })}

        {renderRow({
          title: '价        格:  ',
          value: state.price + '元',
        })}

        <Picker
          data={dropList}
          cols={1}
          value={common_bag_select.toString()}
          format={() => {
            return dropList.find(
              ({ value }) => parseInt(value) === common_bag_select
            )?.label;
          }}
          onChange={([e]) => {
            setCommon_bag_select(parseInt(e));

            setState((state) => {
              return {
                ...state,
                getWeight: false,
              };
            });
          }}
        >
          <List.Item arrow='horizontal'>价 格：</List.Item>
        </Picker>

        {/*{renderRow({*/}
        {/*    title() {*/}
        {/*        // overlay*/}

        {/*        return <Popover*/}
        {/*            overlay={Object.entries(common_bag_list).map(([key, value]) => {*/}
        {/*                return <Popover.Item key={key} value={key}*/}
        {/*                                     style={{backgroundColor: common_bag_select === parseInt(key) ? '#efeff4' : '#fff'}}>*/}
        {/*                    <Text>{value.name}</Text>*/}
        {/*                </Popover.Item>*/}
        {/*            })}*/}
        {/*            onSelect={v => {*/}
        {/*                setCommon_bag_select(parseInt(v))*/}
        {/*                console.log('Object.entries(common_bag_list)[v][1].price', Object.entries(common_bag_list)[v][1].price)*/}
        {/*                const list = Object.entries(common_bag_list)[v][1].price || [];*/}
        {/*                const [value = ''] = list;*/}
        {/*                setPriceList(Object.entries(common_bag_list)[v][1].price || []);*/}
        {/*                setPrice(value);*/}
        {/*                setState(state => {*/}
        {/*                    return {*/}
        {/*                        ...state,*/}
        {/*                        getWeight: false,*/}
        {/*                    }*/}
        {/*                })*/}
        {/*            }}*/}
        {/*        >*/}
        {/*            <View*/}
        {/*                style={{flexDirection: 'row', alignItems: 'center'}}>*/}
        {/*                <Text>{`包  装  袋：${getBagName()}`}</Text>*/}
        {/*                <Image*/}
        {/*                    style={{width: 16, height: 16, marginLeft: 5}}*/}
        {/*                    resizeMode={"contain"}*/}
        {/*                    source={require('../../image/dropDown.png')}*/}
        {/*                />*/}
        {/*            </View>*/}
        {/*        </Popover>*/}
        {/*    },*/}
        {/*    value() {*/}
        {/*        return null*/}
        {/*    },*/}
        {/*})}*/}
        {/*{priceList.length !== 0 ? renderRow({*/}
        {/*    title() {*/}
        {/*        // overlay*/}
        {/*        return <Popover*/}
        {/*            overlay={priceList.map((value, index) => {*/}
        {/*                return <Popover.Item key={index} value={value}*/}
        {/*                                     style={{backgroundColor: value === price ? '#efeff4' : '#fff'}}>*/}
        {/*                    <Text>{value}</Text>*/}
        {/*                </Popover.Item>*/}
        {/*            })}*/}
        {/*            onSelect={v => {*/}
        {/*                setPrice(v)*/}
        {/*            }}*/}
        {/*        >*/}
        {/*            <View*/}
        {/*                style={{flexDirection: 'row', alignItems: 'center'}}>*/}
        {/*                <Text>{`价        格：${price}`}</Text>*/}
        {/*                <Image*/}
        {/*                    style={{width: 16, height: 16, marginLeft: 5}}*/}
        {/*                    resizeMode={"contain"}*/}
        {/*                    source={require('../../image/dropDown.png')}*/}
        {/*                />*/}
        {/*            </View>*/}
        {/*        </Popover>*/}
        {/*    },*/}
        {/*    value() {*/}
        {/*        return null*/}
        {/*    },*/}
        {/*}) : <></>}*/}

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
            合包
          </Button>
          <Button
            type='primary'
            onPress={() => {
              printStatus = true;
              handleMergeAfter();
            }}
          >
            {/*onPress={handleCreateQrcode}*/}
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
            运单号:
            {`${`${item.codeNum}-`.slice(-6, -1)},收件人:${
              item.consignee.consignee
            }`}
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
