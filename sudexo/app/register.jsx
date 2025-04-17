import { Button, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import ToastManager, { Toast } from "toastify-react-native";
const { height, width } = Dimensions.get('window');
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setrePassword] = useState('')
    const [error_name, setNameError] = useState('')
    const [error_email, setEmailError] = useState('')
    const [error_password, setPasswordError] = useState('')
    const [error_Repassword, setRePasswordError] = useState('')
    function Register() {
        if (name && email && password && rePassword && password === rePassword) {
            setEmailError(''); setPasswordError(''); setNameError(''); setRePasswordError('');
            fetch(`${uri}/admin/register`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({ email: email, password: password,name:name })
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
                                });
                            }
                            else if (data.status_code==201) {
                                Toast.success('Account Created')
                                setName('');setPassword('');setEmail('');setrePassword('')
                                router.push('/login')
                            }
                        })
                })
                .catch((res)=> { console.log('errror',res);Toast.error(res.message)  })



        }
        else {
            setNameError(name ? " " : '*Name is required')
            setEmailError(email ? " " : '*Email is required')
            setPasswordError(password ? " " : '*Password is required');
            setRePasswordError(rePassword ? " " : '*Retype Password is required');
            if(rePassword)
                setRePasswordError(rePassword==password ? " " : 'password and retype password is not matched');
            
        }
    }
    return (
        <SafeAreaProvider>

            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <StatusBar style="dark" />
                <ToastManager/>
                <View style={styles.container}>
                    <Text style={styles.title}>Register</Text>
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
            </SafeAreaView>
        </SafeAreaProvider>
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
