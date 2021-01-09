import React, { useState } from 'react';
import { StyleSheet, Text, View, } from 'react-native';
import { Button, List, InputItem, WingBlank } from '@ant-design/react-native';

import AuthContext from "../../util/AuthContext";


const App = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState({
        username: 'admin',
        password: '123456'
    })
    const { signIn } = React.useContext(AuthContext)
    const handleLogin = () => {
        signIn(userInfo);
    }
    return (
        <>
            <List renderHeader={'用户登录'}>
                <InputItem
                    clear
                    value={userInfo.username}
                    onChange={username => {
                        setUserInfo(res => ({ ...res, username }))
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
                    onChange={password => {
                        setUserInfo(res => ({ ...res, password }))
                    }}
                    placeholder="请输入密码"
                />
                <List.Item>
                    <Button type="primary" onPress={handleLogin}>登录</Button>
                </List.Item>
            </List>
        </>
    );
}
export default App
