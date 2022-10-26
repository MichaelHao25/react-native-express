import AsyncStorage from "@react-native-community/async-storage";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RNCamera } from "react-native-camera";
import Sound from "react-native-sound";
Sound.setCategory("Playback");
const handleSound = new Sound("di.mp3", Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log("failed to load the sound", error);
    return;
  }
});
const option = {
  mediaType: "photo",
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.7,
};
class BarcodeScanner extends React.Component {
  isBack = false;
  state = {
    flashMode: false,
    // isVisible: false,
    text: "",
  };

  saveQRcode(value) {
    if (this.isBack === false) {
      handleSound.play();
      this.isBack = true;
      AsyncStorage.setItem("QRcode", value);
      this.props.navigation.goBack();
    }
  }
  // decodeFile = async (filePath) => {
  //   return this.reader.decodeFile(filePath);
  // };

  // useImagePicker = (imagePickerLauncher) => {
  //   this.reader
  //     .updateRuntimeSettings(EnumDBRPresetTemplate.IMAGE_SPEED_FIRST)
  //     .catch((err) => {
  //       console.log(err);
  //     });
  //   this.ifDecodingFile = true;
  //   imagePickerLauncher(option, (res) => {
  //     if (res.didCancel) {
  //       // this.setState(modalInitState);
  //       this.ifDecodingFile = false;
  //       return false;
  //     }
  //     this.decodeFile(res.assets[0].uri.split("file://")[1])
  //       .then((results) => {
  //         let str = "";
  //         if (results && results.length > 0) {
  //           str = results[0].barcodeText;
  //         }
  //         this.modalText = str;
  //         this.results = results[0];
  //         this.setState({
  //           isVisible: true,
  //         });
  //         this.saveQRcode(str);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         this.setState({ isVisible: true, modalText: err.toString() });
  //       })
  //       .finally(() => {
  //         this.initSettingForVideo(this.reader);
  //         this.ifDecodingFile = false;
  //       });
  //   });
  // };
  // initSettingForVideo = async (reader) => {
  //   await reader.resetRuntimeSettings();
  //   let settings = await reader.getRuntimeSettings();

  //   // Set the expected barcode count to 0 when you are not sure how many barcodes you are scanning.
  //   // Set the expected barcode count to 1 can maximize the barcode decoding speed.
  //   settings.expectedBarcodesCount = 1;

  //   // Set the barcode format to read.
  //   settings.barcodeFormatIds =
  //     EnumBarcodeFormat.BF_ONED |
  //     // EnumBarcodeFormat.BF_QR_CODE |
  //     EnumBarcodeFormat.BF_PDF417 |
  //     EnumBarcodeFormat.BF_DATAMATRIX;

  //   // Apply the new runtime settings to the barcode reader.
  //   await this.reader.updateRuntimeSettings(settings);
  // };
  async componentDidMount() {
    // this.reader = await DCVBarcodeReader.createInstance();
    // await this.initSettingForVideo(this.reader);
    // // Add a result listener. The result listener will handle callback when barcode result is returned.
    // this.reader.addResultListener((results) => {
    //   // Update the newly detected barcode results to the state.
    //   if (!this.ifDecodingFile) {
    //     if (results instanceof Array) {
    //       if (results.length !== 0) {
    //         if (this.results) {
    //           if (this.results.barcodeText !== results[0].barcodeText) {
    //             this.results = results[0];
    //             this.saveQRcode(results[0].barcodeText);
    //           }
    //         } else {
    //           this.results = results[0];
    //           this.saveQRcode(results[0].barcodeText);
    //         }
    //       }
    //     }
    //   }
    // });
    // this.props.navigation.setOptions({
    //   headerRight: () => (
    //     <View style={styles.headerRight}>
    //       <Text
    //         style={{ paddingRight: 5 }}
    //         name={"camera"}
    //         onPress={() => {
    //           this.useImagePicker(launchCamera);
    //         }}
    //       >
    //         拍照
    //       </Text>
    //       <Text
    //         style={{ paddingLeft: 5 }}
    //         name={"folder-images"}
    //         onPress={() => {
    //           this.useImagePicker(launchImageLibrary);
    //         }}
    //       >
    //         相册
    //       </Text>
    //     </View>
    //   ),
    // });
  }

  async componentWillUnmountccc() {
    // Stop the barcode decoding thread when your component is unmount.
    // await this.reader.stopScanning();
    // // Remove the result listener when your component is unmount.
    // this.reader.removeAllResultListeners();
  }

  render() {
    // let barcode_text = "";

    // if (this.results) {
    //   barcode_text = this.results.barcodeText;
    // }
    const { flashMode } = this.state;
    return (
      <RNCamera
        style={{
          flex: 1,
        }}
        type={RNCamera.Constants.Type.back}
        flashMode={
          flashMode
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        androidCameraPermissionOptions={{
          title: "二维码需要相机",
          message: "需要相机扫描二维码",
          buttonPositive: "好",
          buttonNegative: "取消",
        }}
        androidRecordAudioPermissionOptions={{
          title: "二维码需要相机",
          message: "需要相机扫描二维码",
          buttonPositive: "好",
          buttonNegative: "取消",
        }}
        onBarCodeRead={(barcode) => {
          const { type, data } = barcode;
          console.log(barcode);
          if (type !== "QR_CODE") {
            this.setState({ text: data });
            this.saveQRcode(data);
          }
        }}
        notAuthorizedView={
          <View style={{ backgroundColor: "#ccc" }}>
            <Text style={{ color: "#fff" }}>没有权限</Text>
          </View>
        }
      >
        <Text
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: 5,
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: 5,
          }}
          onPress={() => {
            this.setState((prev) => {
              return {
                ...prev,
                flashMode: !prev.flashMode,
              };
            });
          }}
        >
          闪光灯：{flashMode ? "开" : "关"}
        </Text>
      </RNCamera>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "#00000000",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    paddingRight: 5,
    justifyContent: "space-between",
  },
});

export default BarcodeScanner;
