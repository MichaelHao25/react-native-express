import Request from "./fetch";
import AsyncStorage from "@react-native-community/async-storage";
export const user_login = (userInfo) => {
    return Request.fetch({
        url: '/user/login',
        method: 'post',
        body: userInfo
    }).then(res => {
        AsyncStorage.setItem('token', res.access_token)
    })
}


export const order_count = () => {
    return Request.fetch({
        url: '/order/count',
        method: 'post',
    })
}

export const order_accept_list = (body) => {
    return Request.fetch({
        url: '/order/accept_list',
        method: 'post',
        body
    })
}

export const order_create = (body) => {
    return Request.fetch({
        url: '/order/create',
        method: 'post',
        body
    })
}

export const order_detail_list = (body) => {
  return Request.fetch({
      url: '/order/detail_list',
      method: 'post',
      body
  })
}

export const order_supplier = (body) => {
  return Request.fetch({
      url: '/order/supplier',
      method: 'post',
      body
  })
}

export const order_member = (body) => {
  return Request.fetch({
      url: '/order/member',
      method: 'post',
  })
}

export const order_consignee = (body) => {
  return Request.fetch({
      url: '/order/consignee',
      method: 'post',
      body
  })
}

export const order_store = (body) => {
  return Request.fetch({
      url: '/order/store',
      method: 'post',
      body
  })
}

export const order_address = (body) => {
  return Request.fetch({
      url: '/order/address',
      method: 'post',
      body
  })
}

// export const order_detail_list = (body) => {
//   return Request.fetch({
//       url: '/order/detail_list',
//       method: 'post',
//       body
//   })
// }

