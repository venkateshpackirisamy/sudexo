import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from "expo-router";
import { useEffect, useState } from "react";
export default function Profile() {
  
    const [userName, setUserName] = useState()
    useEffect(() => {
        setUser()
    }, [])
    const setUser = async () => {
        const result = await AsyncStorage.getItem('@userName')
        if (result)
            setUserName(result)
        else
            router.replace('/login')
    }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <TouchableOpacity >
                <MaterialCommunityIcons name="account-circle" size={200} color="black" />
            </TouchableOpacity>
            <Text style={{fontSize:30}}>{userName}</Text>

            {/* <TouchableOpacity style={{ alignItems: 'center', justifyContent: "center" ,backgroundColor:'white', width:'90%',height:'15%'}}>
              
                <FontAwesome6 name="indian-rupee-sign" size={60} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Check Balance</Text>
                </View>
           
            </TouchableOpacity> */}
            
            
            <TouchableOpacity style={styles.button} onPress={async () => { await AsyncStorage.clear();router.dismissAll(); router.replace('/login') }}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        gap:20
    },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: 'red',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
})