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
export default function reset() {


    useEffect(() => {
        getToken()
    }, [])
    const item = useLocalSearchParams()
    const [type, setType] = useState('pin')
    const [field1, setfield1] = useState()
    const [field2, setfield2] = useState()
    const [field1Err, setField1Err] = useState()
    const [field2Err, setField2Err] = useState()
    const [token, setToken] = useState()

    const getToken = async () => {
        const result = await AsyncStorage.getItem('@userToken')
        if (result) {
            setToken(result)
        }
        else
            router.push('/login')
    }

    function reset() {
        if (field1 && field2 && field1 == field2) {
            setField1Err(''); setField2Err('')
            if (type == 'pin') {
                if (field1.length == 4) {
                    fetch(`${uri}/admin/resetPin`,
                        {
                            headers: {
                                'Content-type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            method: "POST",
                            body: JSON.stringify({ employee_id: item.emp_id, pin: field1 })
                        })
                        .then(function (res) {
                            res.json()
                                .then(data => {
                                    console.log(data)
                                    if (data.status_code == 200)
                                        Toast.success(data.message)
                                    else
                                        Toast.error(data.message)
                                })
                            setfield1(''); setfield2('')
                        })
                        .catch(function (res) { console.log('errror'); Toast.error(res.message) })
                }
                else {
                    setField1Err('pin must be 4 digit')
                }
            }
            else {
                fetch(`${uri}/admin/resetPassword`,
                    {
                        headers: {
                            'Content-type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        method: "POST",
                        body: JSON.stringify({ employee_id: item.emp_id, password: field1 })
                    })
                    .then(function (res) {
                        res.json()
                            .then(data => {
                                if (data.status_code == 200)
                                    Toast.success(data.message)
                                else
                                    Toast.error(data.message)
                            })
                        setfield1(''); setfield2('')
                    })
                    .catch(function (res) { console.log('errror'); Toast.error(res.message) })


            }
        }
        else {

            if (!field1) {
                setField1Err(`* ${type} is requried `)
            }
            else {
                setField1Err('')
            }
            if (!field2) {
                setField2Err(`*Retype ${type} is requried `)
            }
            else {
                setField2Err('')
            }
            if (field1 != "" && field1 != field2)
                setField2Err(`* ${type} and Retype${type} must be same  `)
        }
    }



    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <StatusBar style="light" />
                <ToastManager />

                <View style={styles.container}>
                    <Text style={styles.title}>Reset {type}</Text>
                    <View style={styles.roles}>
                        <TouchableOpacity
                            style={[styles.rbutton, type === 'pin' && styles.selectedRole]}
                            onPress={() => setType('pin')}
                        >
                            <Text style={[styles.rbuttonText, type == 'pin' && { color: 'white' }]}>Pin</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.rbutton, type === 'password' && styles.selectedRole]}
                            onPress={() => setType('password')}
                        >
                            <Text style={[styles.rbuttonText, type == 'password' && { color: 'white' }]}>Password</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.form}>

                        <View>
                            <Text style={styles.errorText}>{field1Err}</Text>
                            <TextInput

                                style={styles.input}
                                placeholder={type}
                                placeholderTextColor="#aaa"
                                keyboardType={(type == 'pin') ? 'numeric' : ''}
                                secureTextEntry
                                value={field1}
                                maxLength={(type == 'pin') ? 4 : 15}
                                onChangeText={(text) => setfield1(text)}
                            /> </View>

                        <View>
                            <Text style={styles.errorText}>{field2Err}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={`retype ${type}`}
                                placeholderTextColor="#aaa"
                                keyboardType={(type == 'pin') ? 'numeric' : ''}
                                secureTextEntry
                                value={field2}
                                maxLength={(type == 'pin') ? 4 : 15}
                                onChangeText={(text) => setfield2(text)}
                            /> </View>

                        <TouchableOpacity style={styles.button} onPress={reset}>
                            <Text style={styles.buttonText}>submit</Text>
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
    roles: {
        flexDirection: "row",
        width: '100%',
        justifyContent: 'center'
    },
    rbutton: {
        width: width * 0.3,
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
        marginHorizontal: 30,
        borderRadius: 30

    },
    rbuttonText: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
    },

    selectedRole: {
        backgroundColor: colors.color1,
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
        backgroundColor: colors.color1,
        alignItems: 'center',
        borderRadius: 5,
        borderRadius: 25,
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
        marginVertical: 10,
        width: width * 0.60,
        height: height * 0.07,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});