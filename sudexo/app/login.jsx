import { Link } from "expo-router";
import { Text, View, Dimensions, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, } from "react-native";
import { Picker } from '@react-native-picker/picker'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from 'expo-router';
const { height, width } = Dimensions.get('window');
export default function Index() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee');
  const[error_email,setEmailError] = useState('')
  const[error_password,setPasswordError] = useState('')
  function login() {
    if (email && password) {
      setEmailError('');setPasswordError('')
      if (role == 'employee') {
        router.push('/EmpHome')
      }
      else {
        router.push('/AdminHome')
      }
    }
    else{
      if(email===""){
        setEmailError('* email is requried ')
      }
      else{
        setEmailError('')
      }
      if(password===''){
        setPasswordError("*password is requried")
      }
      else{
        setPasswordError('')
      }
    }
  }


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
        <StatusBar style="dark" />
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
            <Text style={styles.errorText}>{error_password}</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
            />

            <TouchableOpacity style={styles.button} onPress={login}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => { router.push('/register') }}>
              <Text style={styles.footerLink}>Sign Up</Text>
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
  errorText:{
    color:'red',
    fontSize:14

  }
});