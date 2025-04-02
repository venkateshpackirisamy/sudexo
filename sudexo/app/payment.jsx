import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const uri = process.env.EXPO_PUBLIC_API_URL;
const BankBalancePage = () => {
    const item = useLocalSearchParams();
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        // fetchBalance()
        if (item.to_id) {
            makePayment()
        }
        else if (item.result)
            setLoading(false)

    }, [])

    const makePayment = async () => {
        const token = await AsyncStorage.getItem('@userToken');
        try {
            const response1 = await fetch(`${uri}/employee/pay`, {
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                method: "POST",
                body: JSON.stringify({ pin: item.pin, amount: item.amount, to_id: item.to_id })
            })
            const result1 = await response1.json()

            router.replace({ pathname: '/payment', params: { result: result1.message } })

        }
        catch (error) {
            console.log(error)
        }
    }

    if (loading) {

        return (
            <SafeAreaView style={styles.loadingContainor}>
                <ActivityIndicator size="large" color="#00ff00" />
                    <Text>Loading...</Text>
            </SafeAreaView>
        )

    }
    return (

        <View style={styles.container}>
            {/* { balance!=null && <Text style={styles.title}>Account Balance</Text>}
            {balance!=null && <Text style={styles.balance}>₹{balance}</Text>} */}
            {/* {err!=null && <Text style={styles.error}>{err}</Text>} */}
            {/*             
            <Text>{item.amount },{ item.to_id},{ item.pin}</Text> */}
            <View style={{padding:20,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontWeight:'bold',fontSize:25}}>{item.result}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => { router.replace('/EmpHome') }}>
                <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
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
        color: 'red',
        textAlign: 'center',
    },
    balance: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 30,
    },
    button: {
        width: '80%',
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
    loadingContainor: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default BankBalancePage;
