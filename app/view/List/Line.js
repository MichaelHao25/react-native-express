import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default class DashLine extends React.Component {
    render() {
        const len = Math.ceil(screenWidth / 4);
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(i);
        }

        return <View style={styles.dashLine}>
            {
                arr.map((item, index) => {
                    return <Text style={styles.dashItem} key={'dash' + index}> </Text>
                })
            }
        </View>
    }
}
const styles = StyleSheet.create({
    dashLine: {
        flexDirection: 'row',
    },
    dashItem: {
        height: 1,
        width: 2,
        marginRight: 2,
        flex: 1,
        backgroundColor: '#ddd',
    }
})