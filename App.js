import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from "./app/view/Login";
import Home from "./app/view/Home";



const Stack = createStackNavigator();
export default () => {
    // headerMode={'none'}
    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator initialRouteName={"home"}>
                <Stack.Screen name="login" options={{ title: '登录' }} component={Login} />
                <Stack.Screen name="home" options={{ title: '首页' }} component={Home} />
            </Stack.Navigator>
        </NavigationContainer >
    );
}
