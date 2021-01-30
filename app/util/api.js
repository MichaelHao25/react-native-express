import Request from "./fetch";
import AsyncStorage from "@react-native-community/async-storage";

/**
 * 车辆信息查询
 */
export const common_car = () => {
  return Request.fetch({
    url: "/common/car",
    method: "post",
  });
};
/**
 * 装车出库
 */
export const order_storeout = (body) => {
  return Request.fetch({
    url: "/order/storeout",
    method: "post",
    body,
  });
};

/**
 * 创建一个新的包裹
 */
export const pack_createcode = (body) => {
  return Request.fetch({
    url: "/pack/createcode",
    method: "post",
    body,
  });
};

/**
 * 加包
 * 往包裹里面添加包裹
 */
export const pack_addpack = (body) => {
  return Request.fetch({
    url: "/pack/addpack",
    method: "post",
    body,
  });
};
/**
 * 减包
 * 往包裹里面移除一个包裹
 */
export const pack_subpack = (body) => {
  return Request.fetch({
    url: "/pack/subpack",
    method: "post",
    body,
  });
};

/**
 * 合包
 * 包裹添加完毕
 */
export const pack_createpack = (body) => {
  return Request.fetch({
    url: "/pack/createpack",
    method: "post",
    body,
  });
};
/**
 * 拆包
 * 包裹拆开
 */
export const pack_deletepack = () => {
  return Request.fetch({
    url: "/pack/deletepack",
    method: "post",
  });
};

export const pack_scan = () => {
  return Request.fetch({
    url: "/pack/scan",
    method: "post",
  });
};

export const user_login = (userInfo) => {
  return Request.fetch({
    url: "/user/login",
    method: "post",
    body: userInfo,
  }).then((res) => {
    AsyncStorage.setItem("token", res.access_token);
    AsyncStorage.setItem("username", res.username);
    AsyncStorage.setItem("url", res.url);
  });
};

export const order_count = () => {
  return Request.fetch({
    url: "/order/count",
    method: "post",
  });
};

export const order_create = (body) => {
  return Request.fetch({
    url: "/order/create",
    method: "post",
    body,
  });
};

export const order_detail_list = (body) => {
  return Request.fetch({
    url: "/order/detail_list",
    method: "post",
    body,
  });
};

export const order_supplier = (body) => {
  return Request.fetch({
    url: "/order/supplier",
    method: "post",
    body,
  });
};

export const order_member = (body) => {
  return Request.fetch({
    url: "/order/member",
    method: "post",
  });
};

export const order_consignee = (body) => {
  return Request.fetch({
    url: "/order/consignee",
    method: "post",
    body,
  });
};

export const order_store = (body) => {
  return Request.fetch({
    url: "/order/store",
    method: "post",
    body,
  });
};

export const order_address = (body) => {
  return Request.fetch({
    url: "/order/address",
    method: "post",
    body,
  });
};

export const order_accept_list = (body) => {
  return Request.fetch({
    url: "/order/accept_list",
    method: "post",
    body,
  });
};

export const order_pickup = (body) => {
  return Request.fetch({
    url: "/order/pickup",
    method: "post",
    body,
  });
};

export const order_claim = (body) => {
  return Request.fetch({
    url: "/order/claim",
    method: "post",
    body,
  });
};
