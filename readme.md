# AsyncStorage

- token 登录时候的 token
- printDevice 打印机的信息
- scalesDevice 秤的的信息
- username 用户名
- url 下单扫描的二维码
- WarehouseList 入库列表

## 登出的时候删除 token 和入库列表信息

在扫描头设置里面 pda 要关闭键盘方式输出，否则不会广播

1.

点击生成条码 扫描条码 已经入库，没有入库，已经合包，合包号

2.他扫描一个已经生成好的条码

3.订单条码，

可以只输入一个条码，如果报错的话就清除掉。

jcore-react-native
lintOptions {
abortOnError false
}
