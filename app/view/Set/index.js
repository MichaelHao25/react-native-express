import React from "react";
import {ScrollView} from "react-native";
import {List, Modal} from "@ant-design/react-native";
import AuthContext from "../../util/AuthContext";

export default ({navigation}) => {
    const {signOut} = React.useContext(AuthContext);
    return (
        <ScrollView style={{flex: 1}}>
            <List>
                <List.Item
                    arrow={"horizontal"}
                    onPress={() => {
                        navigation.navigate("printConfig");
                    }}
                >
                    打印机设置
                </List.Item>
                <List.Item
                    arrow={"horizontal"}
                    onPress={() => {
                        navigation.navigate("scalesConfig");
                    }}
                >
                    秤设置
                </List.Item>
                <List.Item
                    onPress={() => {
                        Modal.alert("警告", "是否退出登录?", [
                            {
                                text: "取消",
                                style: "cancel",
                            },
                            {text: "确定", onPress: signOut},
                        ]);
                    }}
                >
                    登出
                </List.Item>
            </List>
        </ScrollView>
    );
};
