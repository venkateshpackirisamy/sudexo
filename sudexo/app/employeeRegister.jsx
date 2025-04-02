import { Button, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import ToastManager, { Toast } from "toastify-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { height, width } = Dimensions.get('window');
import colors from "../assets/color";
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {
    const[token,setToken]= useState('')
    useEffect(() => {
        (async () => {
          const result = await AsyncStorage.getItem('@userToken')
          if (result)
            setToken(result)
          else
            router.push('/login')
        })();
      }, [])

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [pin, setpin] = useState('')
    const [balance, setBalance] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setrePassword] = useState('')
    const [error_name, setNameError] = useState('')
    const [error_email, setEmailError] = useState('')
    const [error_pin, setPinError] = useState('')
    const [error_balance, setBalanceError] = useState('')
    const [error_password, setPasswordError] = useState('')
    const [error_Repassword, setRePasswordError] = useState('')
    function Register() {
        if (name && email && password && rePassword &&  pin && balance &&  password === rePassword) {
            setEmailError(''); setPasswordError(''); setNameError(''); setRePasswordError('');
            fetch(`${uri}/admin/createEmployee`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    method: "POST",
                    body: JSON.stringify({ email: email, password: password,name:name,pin:pin,amount:balance })
                })
                .then(function (res) {
                    res.json()
                        .then(data => {

                            if (data.status === 'error') {
                                data.errors.forEach(element => {
                                    if (element.field == 'email')
                                        setEmailError(element.error)
                                    if (element.field == 'password')
                                        setPasswordError(element.error)
                                    if (element.field == 'name')
                                        setNameError(element.error)
                                    if (element.field == 'pin')
                                        setNameError(element.error)
                                });
                            }
                            else if (data.status_code==201) {
                                setName('');setPassword('');setEmail('');setrePassword('');setBalance('');setpin('')
                                Toast.success('Account created successfully')
                            }
                        })
                })
                .catch((res)=> { console.log('errror',res) })



        }
        else {
            setNameError(name ? " " : '*Name is required')
            setEmailError(email ? " " : '*Email is required')
            setPinError(pin ? " " : '*pin is required')
            setBalanceError(balance ? " " : '*balance is required')
            setPasswordError(password ? " " : '*Password is required');
            setRePasswordError(rePassword ? " " : '*Retype Password is required');
            if(rePassword)
                setRePasswordError(rePassword==password ? " " : 'password and retype password is not matched');
            
        }
    }
    return (
      

            <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' ,padding:10}}>
                <StatusBar style='light' backgroundColor={colors.color1} />
                <ToastManager/>
                <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.title}>Employee Register</Text>
                    <View style={styles.form}>

                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            placeholderTextColor="#aaa"
                            value={name}
                            onChangeText={(text) => setName(text)}
                        />
                        {error_name && <Text style={styles.errorText}>{error_name}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />
                        {error_email && <Text style={styles.errorText}>{error_email}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="pin"
                            placeholderTextColor="#aaa"
                            value={pin}
                            maxLength={4}
                            keyboardType="numeric"
                            onChangeText={(text) => setpin(text)}
                        />
                        {error_email && <Text style={styles.errorText}>{error_pin}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Initial Balance"
                            placeholderTextColor="#aaa"
                            keyboardType="numeric"
                            value={balance}
                            onChangeText={(text) => setBalance(text)}
                        />
                        {error_email && <Text style={styles.errorText}>{error_balance}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                        {error_password && <Text style={styles.errorText}>{error_password}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Retype Password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={rePassword}
                            onChangeText={(text) => setrePassword(text)}
                        />
                        {error_Repassword && <Text style={styles.errorText}>{error_Repassword}</Text>}
                        <TouchableOpacity style={styles.button} onPress={Register}>
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>

                    </View>
                </View>
                </ScrollView>
            </View>
      
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },

    form: {
        width: width * 0.9,

    },
    input: {
        width: '100%',
        padding: 10,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        width: '100%',
        padding: 15,
        marginTop:15,
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

    }
})
