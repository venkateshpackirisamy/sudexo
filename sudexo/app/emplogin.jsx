import { Text, View, Dimensions, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../assets/color";
const { height, width } = Dimensions.get('window');
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function emplogin() {
  useEffect(() => {
    checkuser()
      .then(res => {
        if (res.token && res.admin === 'false')
          router.replace('/EmpHome')
        else if (res.token && res.admin === 'true')
          router.replace('/AdminHome',)
      })
  }, [])
  const checkuser = async () => {
    const token = await AsyncStorage.getItem('@userToken');
    const is_admin = await AsyncStorage.getItem('is_admin');
    return { 'token': token, 'admin': is_admin }
  }

  const [password, setPassword] = useState('')
  const [error_password, setPasswordError] = useState('')
  const item = useLocalSearchParams()
  const storeUserToken = async (token, name, is_admin) => {
    try {
      await AsyncStorage.clear()
      await AsyncStorage.setItem('@userToken', token);
      await AsyncStorage.setItem('@userName', name);
      await AsyncStorage.setItem('is_admin', is_admin);
      console.log('token strored')
    } catch (e) {
      console.error('Error storing token in AsyncStorage:', e);
    }
  };

  function login() {
    if (password) {
      setPasswordError('')
      fetch(`${uri}/employee/login`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ id:item.id, password: password })
        })
        .then(function (res) {
          res.json()
            .then(data => {

              if (data.status === 'error') {
                data.errors.forEach(element => {
                  if (element.field == 'password')
                    setPasswordError('The password you entered is incorrect')
                });
              }
              else if (data.data) {
                console.log(data.data)
                storeUserToken(data.data.token, data.data.name, "false")
                  .then(
                    router.replace('/EmpHome',{ overrideInitialScreen: false })
                  )

              }
            })
        })
        .catch(function (res) { console.log('errror');Toast.error(res.message) })

    }
    else {
      setPasswordError("*password is requried")
    }
  }

  


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
        <StatusBar style="dark" />
        <ToastManager />
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          
          <View style={styles.form}>
              <View>
                <Text style={styles.errorText}>{error_password}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  secureTextEntry
                  value={password}
                  maxLength={15}
                  onChangeText={(text) => setPassword(text)}
                /> 
              </View>
            <TouchableOpacity style={styles.button} onPress={login}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider >
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',

  },
  form: {
    width: width * 0.85,
    borderRadius: 5,
    padding: 5
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },

  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14

  },
 
});