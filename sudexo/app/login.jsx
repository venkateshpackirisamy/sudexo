import { Text, View, Dimensions, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../assets/color";
import { useIsFocused } from "@react-navigation/native";
const { height, width } = Dimensions.get('window');
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {
  const [modalVisible, setModalVisible] = useState(false)
  const [account,setAccount]= useState([])
  const[selectAcc,setSelectAcc] = useState()
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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee');
  const [error_email, setEmailError] = useState('')
  const [error_password, setPasswordError] = useState('')
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
    if (email && (password || role == "employee")) {
      setEmailError(''); setPasswordError('')
      if (role == 'employee') {
        fetch(`${uri}/employee/accounts?email=${email}`)
          .then(function (res) {
            res.json()
              .then(data => {
                if (data.result.length === 0) {
                  setEmailError('The email address provided does not exist in our records')
                }
                else if (data.result.length>1) {
                  setModalVisible(true)
                  setAccount(data.result)
                }
                else if(data.result.length===1){
                  router.push({ pathname: '/emplogin', params: { id: data.result[0].id } })
                }
              })
          })
          .catch(function (res) { console.log('errror'); Toast.error(res.message) })
      }
      else {
        fetch(`${uri}/admin/login`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ email: email, password: password })
          })
          .then(function (res) {
            res.json()
              .then(data => {

                if (data.status === 'error') {
                  data.errors.forEach(element => {
                    if (element.field == 'email')
                      setEmailError('The email address provided does not exist in our records')
                    if (element.field == 'password')
                      setPasswordError('The password you entered is incorrect')
                  });
                }
                else if (data.data) {
                  storeUserToken(data.data.token, data.data.name, "true")
                    .then(
                      router.push('/AdminHome')
                    )

                }
              })
          })
          .catch(function (res) { console.log('errror');Toast.error(res.message) })

      }
    }
    else {
      if (email === "") {
        setEmailError('* email is requried ')
      }
      else {
        setEmailError('')
      }
      if (password === '') {
        setPasswordError("*password is requried")
      }
      else {
        setPasswordError('')
      }
    }
  }
  function next(){
    if(selectAcc){
      setModalVisible(false);
      router.push({ pathname: '/emplogin', params: { id: selectAcc.id } })
    }
    else{
      Toast.error('select Account')
    }
  }


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
        <StatusBar style="dark" />
        <ToastManager/>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>it Look like this email  is used more that one Account</Text>
              <Text style={{fontWeight:'bold'}}>Select Account</Text>
              <View style={{ gap: 10, width: '100%', alignItems: 'center',height:'50%' }}>
                <View style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}>
                  <ScrollView styles={{alignItems:'center',justifyContent:'center'}} >
                  {account.map((item) => {
                    return (
                      <TouchableOpacity onPress={() => {setSelectAcc(item)}} style={[styles.account, selectAcc==item && { borderWidth: 1, borderColor: 'black' }]}>
                        <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                        <Text style={{fontWeight:'bold'}}>Admin: {item.admin.name}</Text>
                      </TouchableOpacity>)
                  })}
                  </ScrollView>
                </View>
              </View>
              <TouchableOpacity onPress={next} style={{ width: '100%', padding: 10, alignItems: 'center', backgroundColor: '#4CAF50' }} >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Next</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <View style={styles.roles}>
            <TouchableOpacity
              style={[styles.rbutton, role === 'admin' && styles.selectedRole]}
              onPress={() => setRole('admin')}
            >
              <Text style={styles.rbuttonText}>Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rbutton, role === 'employee' && styles.selectedRole]}
              onPress={() => setRole('employee')}
            >
              <Text style={styles.rbuttonText}>Employee</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <Text style={styles.errorText}>{error_email}</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />

            {role === 'admin' &&
              <View>
                <Text style={styles.errorText}>{error_password}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                /> </View>}

            <TouchableOpacity style={styles.button} onPress={login}>
              <Text style={styles.buttonText}>{role === 'admin' ? 'Login' : 'Next'}</Text>
            </TouchableOpacity>

          </View>

          {role === 'admin' && <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => { router.push('/register') }}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>}

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
  roles: {
    flexDirection: "row"
  },
  rbutton: {
    width: width * 0.41,
    padding: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',

  },
  rbuttonText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },

  selectedRole: {
    backgroundColor: '#4CAF50',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  picker: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
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
  footer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 14,
    color: '#777',
  },
  footerLink: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14

  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    height: "55%",
    width: "85%",
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 10
  },
  account: {
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
    marginVertical:10,
    width:width*0.60,
    height:height*0.07,
    flexDirection:'row',
    justifyContent:'space-between',
  },
});