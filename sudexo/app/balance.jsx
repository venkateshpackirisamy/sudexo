import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Animatable from 'react-native-animatable';
const uri = process.env.EXPO_PUBLIC_API_URL;
const { height, width } = Dimensions.get('window');
import colors from '../assets/color'
const BankBalancePage = () => {
    const [balance, setBalance] = useState(null)
    const [err, setErr] = useState(null)
    const item = useLocalSearchParams();
    const [loading, setLoading] = useState(true)

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
                body: JSON.stringify({ pin: item.pin })
            })
            const result1 = await response1.json()

            if (result1.status === 'success')
                setBalance(result1.data.balance)
            else if (result1.status === 'error') {
                setErr(result1.errors[0].error)
            }
            setLoading(false)

        }
        catch (error) {
            console.log(error)
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainor}>
                <ActivityIndicator size="large" color={colors.color1} />
                <Text>Loading...</Text>
            </SafeAreaView>
        )

    }

    return (
        <View style={styles.container}>

            {balance !== null ? (

                <Animatable.View animation="bounceIn" duration={1000} style={styles.resultBox}>
                    <AntDesign name="checkcircle" size={120} color="green" />
                    <Text style={styles.title}>Account Balance</Text>
                    <Text style={styles.balance}>₹{balance}</Text>
                </Animatable.View>

            ) : err !== null ? (
                <Animatable.View animation="bounceIn" duration={1000} style={styles.resultBox}>
                    <AntDesign name="closecircle" size={120} color="red" />
                    <Text style={styles.errorTitle}>Incorrect PIN</Text>
                    <Text style={styles.errorText}>{err}</Text>
                </Animatable.View>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={() => router.replace('/EmpHome')}>
                <Text style={styles.buttonText}>Back To Home</Text>
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
        color: 'green',
        marginBottom: 10,
    },
    button: {
        width: '80%',
        padding: 15,
        backgroundColor: colors.color1,
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
    },
    resultBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 30,
    },

    errorTitle: {
        fontSize: 22,
        color: 'red',
        fontWeight: 'bold',
        marginTop: 15,
    },

    errorText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 10,
    },

});

export default BankBalancePage;
