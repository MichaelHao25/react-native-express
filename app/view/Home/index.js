import React, { useEffect } from 'react';
import { StyleSheet, Text, View, } from 'react-native';
import { Button, List, InputItem, WingBlank, Grid, Badge } from 'antd-mobile-rn';
const App = ({ navigation }) => {
    return (
        <>
            <List renderHeader={'用户信息'}>
                <List.Item arrow="empty">
                    王五(1212121212)
                </List.Item>
                <List.Item>
                    <Grid
                        data={[{
                            icon: 'https://os.alipayobjects.com/rmsportal/IptWdCkrtkAUfjE.png',
                            text: `扫码`,
                        }, {
                            icon: 'https://os.alipayobjects.com/rmsportal/IptWdCkrtkAUfjE.png',
                            text: `退出`,
                        }, {
                            icon: 'https://os.alipayobjects.com/rmsportal/IptWdCkrtkAUfjE.png',
                            text: `暂未开放`,
                        }, {
                            icon: 'https://os.alipayobjects.com/rmsportal/IptWdCkrtkAUfjE.png',
                            text: `暂未开放`,
                        },]
                        }
                        hasLine={true}
                    />
                </List.Item>
                <List.Item arrow="horizontal" extra={10}>
                    <Badge dot><Text>待上门</Text></Badge>
                </List.Item>
                <List.Item arrow="horizontal" extra={10}>
                    <Badge dot><Text>即将到期</Text></Badge>
                </List.Item>
                <List.Item arrow="horizontal" extra={10}>
                    <Badge dot><Text>今日小计</Text></Badge>
                </List.Item>
                <List.Item arrow="horizontal" extra={10}>
                    <Badge dot><Text>本月小计</Text></Badge>
                </List.Item>

            </List>
        </>
    );
}
export default App
