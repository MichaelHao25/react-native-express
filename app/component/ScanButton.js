import { Button } from '@ant-design/react-native';
import React from 'react';
import { navigate } from '../util/RootNavigation';
export default () => {
  return (
    <Button type='primary' onPress={() => navigate('barcodeScanner')}>
      扫描
    </Button>
  );
};
