import React, {useState} from "react";
import {Button, InputItem, List, Modal, Toast} from "@ant-design/react-native";
import {order_resetpwd} from "../../util/api";
import AuthContext from "../../util/AuthContext";

export default ({navigation}) => {
    const [userInfo, setUserInfo] = useState({
        // username: "admin",
        // password: "123456",
        username: "",
        oldPassword: "",
        newPassword: "",
    });
    const {signOut} = React.useContext(AuthContext);
    const handleModifyPassword = () => {
        if (!userInfo.oldPassword) {
            Toast.fail('请输入旧密码！')
            return
        }
        if (!userInfo.newPassword) {
            Toast.fail('请输入新密码！')
            return
        }

        order_resetpwd({
            oldPwd: userInfo.oldPassword,
            newPwd: userInfo.newPassword,
        }).then(res => {
            Modal.alert('提示', res.msg, [
                {
                    text: '好的', onPress: () => {
                        signOut();
                    }
                },
            ])
        })
    };
    return (
        <>
            <List renderHeader={"修改密码"}>
                {/*<InputItem*/}
                {/*    clear*/}
                {/*    value={userInfo.username}*/}
                {/*    onChange={(username) => {*/}
                {/*        setUserInfo((res) => ({...res, username}));*/}
                {/*    }}*/}
                {/*    autoCorrect={false}*/}
                {/*    autoCapitalize="none"*/}
                {/*    type="text"*/}
                {/*    placeholder="请输入用户名"*/}
                {/*/>*/}
                <InputItem
                    clear
                    autoCorrect={false}
                    type="text"
                    value={userInfo.oldPassword}
                    onChange={(oldPassword) => {
                        setUserInfo((res) => ({...res, oldPassword}));
                    }}
                    placeholder="请输入原密码"
                />

                <InputItem
                    clear
                    autoCorrect={false}
                    type="text"
                    value={userInfo.newPassword}
                    onChange={(newPassword) => {
                        setUserInfo((res) => ({...res, newPassword}));
                    }}
                    placeholder="请输入新密码"
                />
                <List.Item>
                    <Button type="primary" onPress={handleModifyPassword}>
                        修改
                    </Button>
                </List.Item>
            </List>
        </>
    );
};
