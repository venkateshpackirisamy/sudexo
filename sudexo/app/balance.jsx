import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const uri = process.env.EXPO_PUBLIC_API_URL;
const BankBalancePage = () => {
   
    const [balance, setBalance] = useState(null)
    const [err, setErr] = useState(null)
     const item = useLocalSearchParams();

    useEffect(() => {
        fetchBalance()
    }, [])

    const fetchBalance = async () => {
        const token = await AsyncStorage.getItem('@userToken');
        try {
            const response1 = await fetch(`${uri}/employee/balance`, {
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                method: "POST",
                body: JSON.stringify({ pin:item.pin })
            })
            const result1 = await response1.json()

            if (result1.status === 'success')
                setBalance(result1.data.balance)
            else if(result1.status === 'error')
            {
                setErr(result1.errors[0].error)
            }
                
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={styles.container}>                                
            { balance!=null && <Text style={styles.title}>Account Balance</Text>}
            {balance!=null && <Text style={styles.balance}>₹{balance}</Text>}
            {err!=null && <Text style={styles.error}>{err}</Text>}            
            { !(balance||err) ?  <ActivityIndicator size="large" color="#00ff00" />
            :<TouchableOpacity style={styles.button} onPress={()=>{router.replace('/EmpHome')}}>
                <Text style={styles.buttonText}>Back To Home</Text>
            </TouchableOpacity>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    error: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color:'red',
        textAlign:'center',
    },
    balance: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 30,
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
    }
});

export default BankBalancePage;
