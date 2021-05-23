import React, {useState} from "react";
import {Button, InputItem, List} from "@ant-design/react-native";
import AuthContext from "../../util/AuthContext";

export default ({navigation}) => {
    const [userInfo, setUserInfo] = useState({
        // username: "admin",
        // password: "123456",
        username: "",
        password: "",
    });
    const {signIn} = React.useContext(AuthContext);
    const handleLogin = () => {
        signIn(userInfo);
    };
    const handleMidfyPassword = () => {
        navigation.navigate('modifyPassword')
    }
    return (
        <>
            <List renderHeader={"用户登录"}>
                <InputItem
                    clear
                    value={userInfo.username}
                    onChange={(username) => {
                        setUserInfo((res) => ({...res, username}));
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
                        setUserInfo((res) => ({...res, password}));
                    }}
                    placeholder="请输入密码"
                />
                <List.Item>
                    <Button type="primary" onPress={handleLogin}>
                        登录
                    </Button>
                </List.Item>
                {/*<List.Item>*/}
                {/*    <Button type="ghost" onPress={handleMidfyPassword}>*/}
                {/*        修改密码*/}
                {/*    </Button>*/}
                {/*</List.Item>*/}
            </List>
        </>
    );
};
