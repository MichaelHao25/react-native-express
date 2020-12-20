import React from 'react';
import { StyleSheet, Text, View, } from 'react-native';
import { Button, List, InputItem, WingBlank } from 'antd-mobile-rn';
const App = ({ navigation }) => {
    return (
        <>
            <List renderHeader={'用户登录'}>
                <InputItem
                    clear
                    // value={this.state.value}
                    // onChange={value => {
                    //     this.setState({
                    //         value,
                    //     });
                    // }}
                    autoCorrect={false}
                    autoCapitalize="none"
                    type="text"
                    placeholder="请输入用户名"
                />
                <InputItem
                    clear
                    autoCorrect={false}
                    type="password"
                    // value={this.state.value}
                    // onChange={value => {
                    //     this.setState({
                    //         value,
                    //     });
                    // }}
                    placeholder="请输入密码"
                />
                <List.Item>
                    <Button type="primary">登录</Button>
                </List.Item>
            </List>
        </>
    );
}
export default App
