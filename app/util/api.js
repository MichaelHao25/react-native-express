import Request from "./fetch";
import AsyncStorage from "@react-native-community/async-storage";

/**
 * 修改密码
 */
export const order_resetpwd = (body) => {
    return Request.fetch({
        url: "/order/resetpwd",
        method: "post",
        body
    });
};

/**
 * 扫描下面的真实地址查询
 */
export const pack_realaddr = () => {
    return Request.fetch({
        url: "/pack/realaddr",
        method: "post",
    });
};


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
 * 合包
 * 往包裹里面添合包裹
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
export const pack_deletepack = (body) => {
    return Request.fetch({
        url: "/pack/deletepack",
        method: "post",
        body
    });
};

/**
 * 查询包裹信息
 */
export const pack_scan = (body) => {
    return Request.fetch({
        url: "/pack/scan",
        method: "post",
        body
    });
};

export const user_login = (userInfo) => {
    return Request.fetch({
        url: "/user/login",
        method: "post",
        body: userInfo,
    }).then((res) => {
        // {"access_token": "cNdtpW14aZvTpNvC-E5HQSSrXAJWFLuV_1620919694", "auth": ["package", "gather", "subpackage", "deletepackage", "storeout", "scan", "orders"], "code": 200, "msg": "请求成功", "url": "http://member.junchain.cn", "username": "超级管理员"}

        AsyncStorage.setItem("auth", JSON.stringify(res.auth));
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
