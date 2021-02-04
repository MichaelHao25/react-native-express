import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, List, InputItem, WingBlank } from "@ant-design/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import AuthContext from "../../util/AuthContext";
import { useEffect } from "react";
import usePdaScan from "react-native-pda-scan";

export default ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({
    username: "admin",
    password: "123456",
  });
  const { signIn } = React.useContext(AuthContext);
  const handleLogin = () => {
    signIn(userInfo);
  };
  const a = usePdaScan({
    onEvent(e) {
        console.log(333);
        console.log(e);
    },
    onError(e) {
        console.log(666);
        console.log(e);
    },
    trigger: "always",
  });
  console.log(a);
  return (
    <>
      <List renderHeader={"用户登录"}>
        <InputItem
          clear
          value={userInfo.username}
          onChange={(username) => {
            setUserInfo((res) => ({ ...res, username }));
          }}
          autoCorrect={false}
          autoCapitalize="none"
          type="text"
          placeholder="请输入用户名"
        />
        <InputItem
          clear
          autoCorrect={false}
          type="password"
          value={userInfo.password}
          onChange={(password) => {
            setUserInfo((res) => ({ ...res, password }));
          }}
          placeholder="请输入密码"
        />
        <List.Item>
          <Button type="primary" onPress={handleLogin}>
            登录
          </Button>
        </List.Item>
      </List>
    </>
  );
};
