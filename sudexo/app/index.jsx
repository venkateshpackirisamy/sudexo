import { Button, ImageBackground, StyleSheet, Text, View } from "react-native";
import { router } from 'expo-router';
import colors from "../assets/color";
import { TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
export default function Index() {
    const isfocuse = useIsFocused()
  useEffect(() => {
    checkuser()
      .then(res => {
        if (res.token && res.admin === 'false')
          router.push('/EmpHome')
        else if (res.token && res.admin === 'true')
          router.push('/AdminHome')
      })
  }, [isfocuse])
  const checkuser = async () => {
    const token = await AsyncStorage.getItem('@userToken');
    const is_admin = await AsyncStorage.getItem('is_admin');
    return { 'token': token, 'admin': is_admin }
  }




  const image = { uri: 'https://img.freepik.com/free-vector/flat-concept-business-with-hands-payments-sales-vector-illustration_1284-42937.jpg?t=st=1743568907~exp=1743572507~hmac=8be7f76d68eec9f3bf2e0751bd53fa74628c9c2123a6194f6154b0649dd9a88d&w=740' };
  return (

    <View style={styles.containor}>
      <StatusBar style="dark" />
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        <Text style={styles.text}>Manage all you Employee Using Sudexo</Text>
        <TouchableOpacity style={styles.button} onPress={() => { router.push('/login') }}>
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
      </ImageBackground>

    </View>
  );
}

const styles = StyleSheet.create({
  containor: {
    flex: 1,

  },
  image: {
    flex: 1,
    justifyContent: 'center',
    resizeMode: 'cover'
  },
  text: {
    color: '#21130d',
    fontSize: 42,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: colors.color1,
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center'
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  }
})
