import LogRocket from "@logrocket/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import Request from "./fetch";


/**
 * 随货标签
 */
export const pack_printlabel = (body) => {
    return Request.fetch({
        url: "/pack/printlabel",
        method: "post",
        body
    });
};

/**
 * 获取二维码扫描器的License
 */
export const common_pdakey = () => {
    return Request.fetch({
        url: "/common/pdakey",
        method: "post",
    });
};

/**
 * 获取包装袋的价格
 */
export const common_bagprice = () => {
    return Request.fetch({
        url: "/common/bagprice",
        method: "post",
    });
};

/**
 * 出库运输方式元数据
 */
export const common_allshipping = () => {
    return Request.fetch({
        url: "/common/allshipping",
        method: "post",
    });
};

/**
 * 异常提交
 */
// {
//  codeNum:'WLTDP062813120863',
//  type:1
// }
export const pack_deal = (body) => {
    return Request.fetch({
        url: "/pack/deal",
        method: "post",
        body,
    });
};
/**
 * 异常选项元数据
 */
export const common_dealoption = () => {
    return Request.fetch({
        url: "/common/dealoption",
        method: "post",
    });
};
/**
 * 装车
 */
export const order_loading = (body) => {
    return Request.fetch({
        url: "/order/loading",
        method: "post",
        body,
    });
};
/**
 * 入库
 */
export const order_scan_list = (body) => {
    return Request.fetch({
        url: "/order/scan_list",
        method: "post",
        body,
    });
};
/**
 * 入库
 */
export const order_storein = (body) => {
    return Request.fetch({
        url: "/order/storein",
        method: "post",
        body,
    });
};
/**
 * 获取包装袋列表
 */
export const common_bag = () => {
    return Request.fetch({
        url: "/common/bag",
        method: "post",
    });
};
/**
 * 退出登录
 */
export const order_logout = () => {
    return Request.fetch({
        url: "/order/logout",
        method: "post",
    });
};
/**
 * 修改密码
 */
export const order_resetpwd = (body) => {
    return Request.fetch({
        url: "/order/resetpwd",
        method: "post",
        body,
    });
};

/**
 * 扫描下面的真实地址查询
 */
export const pack_realaddr = (body) => {
    return Request.fetch({
        url: "/pack/realaddr",
        method: "post",
        body,
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
 * 查包
 * 查包，查询包的信息进行打印
 */
export const pack_pack = (body) => {
    return Request.fetch({
        url: "/pack/pack",
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
        body,
    });
};

/**
 * 查询包裹信息
 */
export const pack_scan = (body) => {
    return Request.fetch({
        url: "/pack/scan",
        method: "post",
        body,
    });
};

export const user_login = (userInfo) => {
    return Request.fetch({
        url: "/user/login",
        method: "post",
        body: userInfo,
    }).then((res) => {
        // {"access_token": "cNdtpW14aZvTpNvC-E5HQSSrXAJWFLuV_1620919694", "auth": ["package", "gather", "subpackage", "deletepackage", "storeout", "scan", "orders"], "code": 200, "msg": "请求成功", "url": "http://member.junchain.cn", "username": "超级管理员"}

        LogRocket.identify(userInfo.username, {
            name: res.access_token,
            email: userInfo.password,
        });
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
