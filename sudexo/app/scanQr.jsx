import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Button, Dimensions } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { router } from "expo-router";
import colors from "../assets/color";
const { height, width } = Dimensions.get('window');
export default function scanQr() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ type, data }) => {
    const regex = /pn=([^&]+)/;
    const match = data.match(regex);
    if (match) {
      setScanned(true);
      const name = match[1];
      router.push({ pathname: '/pay', params: { to_id: name } })

      // if (cameraRef.current) {
      //   cameraRef.current.stopPreview();
      // }

    } else {
      console.log("Name not found");
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {!scanned && (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.qr}><View style={styles.box}></View></View>
        </CameraView>)}
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  qr:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  box:{
    borderWidth:3,
    height:height*0.3,
    width:width*0.6,
    borderColor:colors.color1,
    borderRadius:20,
  }
});