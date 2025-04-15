import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import colors from '../assets/color';
const uri = process.env.EXPO_PUBLIC_API_URL;
const { height, width } = Dimensions.get('window');
const BankBalancePage = () => {
    const item = useLocalSearchParams();
    const [loading, setLoading] = useState(true)
    const [response,setResponse] = useState(null)
    useEffect(() => {
        // fetchBalance()
        if (item.to_id) {
            makePayment()
        }
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
            console.log(result1)
            setResponse(result1)
            router.setParams({})

        }
        catch (error) {
            console.log(error)
        }
    }

    if (response==null) {

        return (
            <SafeAreaView style={styles.loadingContainor}>
                <ActivityIndicator size="large" color={colors.color1} />
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
            <View style={{ padding: 20 }}>

                <View style={{ height: height * 0.5, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>{response.status_code == 401 && <AntDesign name="closecircle" size={150} color="red" />}</Text>
                    <Text>{response.status_code == 200 && <AntDesign name="checkcircle" size={150} color="green" />}</Text>
                    <Text>{response.status_code == 400 && <FontAwesome name="warning" size={150} color="orange" />}</Text>
                </View>

                <Text style={{ fontWeight: 'bold', fontSize: 25, alignSelf: 'center', color: item.status_code == 200 ? 'green' : 'red' }}>
                    {response.status_code == 200 ? 'Payment Success' : 'Payment Failed'}</Text>

                {response.amount && <Text style={{ fontWeight: 'bold', fontSize: 25, alignSelf: 'center' }}>{response.amount}</Text>}

                {!(response.status_code == 200) && <Text style={{ fontWeight: 'bold', fontSize: 20, alignSelf: 'center' }}>{response.message}</Text>}

                {response.status_code == 200 && <Text style={{ fontWeight: 'bold', fontSize: 20, alignSelf: 'center' }}>{response.description}</Text>}
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
        // justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white'
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
        borderRadius: 25,
        margin: 25,
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
