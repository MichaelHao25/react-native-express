import AsyncStorage from "@react-native-community/async-storage";
import {
  DCVBarcodeReader,
  DCVCameraView,
  EnumBarcodeFormat,
  EnumDBRPresetTemplate,
  EnumTorchState,
} from "dynamsoft-capture-vision-react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
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

const mergeResultsText = (results) => {
  let str = "";
  if (results && results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      str +=
        results[i].barcodeFormatString + ": " + results[i].barcodeText + " \n";
    }
  } else {
    str = "No barcode detected.";
  }
  return str;
};

const modalInitState = {
  isVisible: false,
  modalText: "",
};

class BarcodeScanner extends React.Component {
  ifDecodingFile = false;
  isBack = false;
  results = null;
  modalText = "";
  state = {
    isVisible: false,
  };

  decodeFile = async (filePath) => {
    return this.reader.decodeFile(filePath);
  };

  saveQRcode(value) {
    if (this.isBack === false) {
      handleSound.play();
      this.isBack = true;
      AsyncStorage.setItem("QRcode", value);
      this.props.navigation.goBack();
    }
  }
  useImagePicker = (imagePickerLauncher) => {
    this.reader
      .updateRuntimeSettings(EnumDBRPresetTemplate.IMAGE_SPEED_FIRST)
      .catch((err) => {
        console.log(err);
      });
    this.ifDecodingFile = true;
    imagePickerLauncher(option, (res) => {
      if (res.didCancel) {
        // this.setState(modalInitState);
        this.ifDecodingFile = false;
        return false;
      }
      this.decodeFile(res.assets[0].uri.split("file://")[1])
        .then((results) => {
          let str = "";
          if (results && results.length > 0) {
            str = results[0].barcodeText;
          }
          this.modalText = str;
          this.results = results[0];
          this.setState({
            isVisible: true,
          });
          this.saveQRcode(str);
        })
        .catch((err) => {
          console.log(err);
          this.setState({ isVisible: true, modalText: err.toString() });
        })
        .finally(() => {
          this.initSettingForVideo(this.reader);
          this.ifDecodingFile = false;
        });
    });
  };

  initSettingForVideo = async (reader) => {
    await reader.resetRuntimeSettings();
    let settings = await reader.getRuntimeSettings();

    // Set the expected barcode count to 0 when you are not sure how many barcodes you are scanning.
    // Set the expected barcode count to 1 can maximize the barcode decoding speed.
    settings.expectedBarcodesCount = 1;

    // Set the barcode format to read.
    settings.barcodeFormatIds =
      EnumBarcodeFormat.BF_ONED |
      // EnumBarcodeFormat.BF_QR_CODE |
      EnumBarcodeFormat.BF_PDF417 |
      EnumBarcodeFormat.BF_DATAMATRIX;

    // Apply the new runtime settings to the barcode reader.
    await this.reader.updateRuntimeSettings(settings);
  };

  async componentDidMount() {
    console.log("componentDidMount");

    // Create a barcode reader instance.
    this.reader = await DCVBarcodeReader.createInstance();

    await this.initSettingForVideo(this.reader);

    // Add a result listener. The result listener will handle callback when barcode result is returned.
    this.reader.addResultListener((results) => {
      // Update the newly detected barcode results to the state.
      if (!this.ifDecodingFile) {
        if (results instanceof Array) {
          if (results.length !== 0) {
            if (this.results) {
              if (this.results.barcodeText !== results[0].barcodeText) {
                this.results = results[0];
                this.saveQRcode(results[0].barcodeText);
              }
            } else {
              this.results = results[0];
              this.saveQRcode(results[0].barcodeText);
            }
          }
        }
      }
    });

    // Enable video barcode scanning.
    // If the camera is opened, the barcode reader will start the barcode decoding thread when you triggered the startScanning.
    // The barcode reader will scan the barcodes continuously before you trigger stopScanning.
    this.reader.startScanning();

    this.props.navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <Text
            style={{ paddingRight: 5 }}
            name={"camera"}
            onPress={() => {
              this.useImagePicker(launchCamera);
            }}
          >
            拍照
          </Text>
          <Text
            style={{ paddingLeft: 5 }}
            name={"folder-images"}
            onPress={() => {
              this.useImagePicker(launchImageLibrary);
            }}
          >
            相册
          </Text>
        </View>
      ),
    });
  }

  async componentWillUnmountccc() {
    // Stop the barcode decoding thread when your component is unmount.
    await this.reader.stopScanning();
    // Remove the result listener when your component is unmount.
    this.reader.removeAllResultListeners();
  }

  render() {
    let barcode_text = "";
    // let region = {
    //   regionTop: 30,
    //   regionLeft: 15,
    //   regionBottom: 70,
    //   regionRight: 85,
    //   regionMeasuredByPercentage: true,
    // };       // Define the scan region.
    // let results = this.results;
    // if (results && results.length > 0) {
    //   for (var i = 0; i < results.length; i++) {
    //     barcode_text +=
    //       results[i].barcodeFormatString + ':' + results[i].barcodeText + '\n';
    //   }
    // }
    if (this.results) {
      barcode_text = this.results.barcodeText;
    }
    return (
      <DCVCameraView
        style={{
          flex: 1,
        }}
        overlayVisible={true}
        torchButton={{
          visible: true,
        }}
        torchState={EnumTorchState.OFF}
        // scanRegionVisible={true}
        // scanRegion={region}  // Set scan region.
      >
        <Text
          style={{
            flex: 0.9,
            marginTop: 200,
            textAlign: "center",
            color: "white",
            fontSize: 18,
          }}
        >
          {barcode_text}
        </Text>
        <BarCodeScanner style={{ width: 1000, height: 1000 }}></BarCodeScanner>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isVisible}
          onRequestClose={() => {
            this.setState(modalInitState);
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              this.setState(modalInitState);
            }}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{this.modalText}</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      </DCVCameraView>
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
