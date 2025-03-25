import { Button, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
const { height, width } = Dimensions.get('window');

export default function Index() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setrePassword] = useState('')
    const [error_name, setNameError] = useState('')
    const [error_email, setEmailError] = useState('')
    const [error_password, setPasswordError] = useState('')
    const [error_Repassword, setRePasswordError] = useState('')
    function Register(){
        if(name && email && password && rePassword){
            setEmailError('');setPasswordError('');setNameError('');setRePasswordError('')
        }
        else{
            setNameError(name?" ":'*Name is required')
            setEmailError(email?" ":'*Email is required')
            setPasswordError(password?" ":'*Password is required');
            setRePasswordError(rePassword?" ":'*Retype Password is required');
        }
    }
    return (
        <SafeAreaProvider>

            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <StatusBar style="dark" />
                <View style={styles.container}>
                    <Text style={styles.title}>Register</Text>
                    <View style={styles.form}>
                        {error_name && <Text style={styles.errorText}>{error_name}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            placeholderTextColor="#aaa"
                            value={name}
                            onChangeText={(text) => setName(text)}
                        />
                        {error_email && <Text style={styles.errorText}>{error_email}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />
                        {error_password && <Text style={styles.errorText}>{error_password}</Text>}
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                        {error_Repassword && <Text style={styles.errorText}>{error_Repassword}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Retype Password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={rePassword}
                            onChangeText={(text) => setrePassword(text)}
                        />
                        <TouchableOpacity style={styles.button}  onPress={Register}>
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
    errorText:{
        color:'red',
        fontSize:14
    
      }
})
