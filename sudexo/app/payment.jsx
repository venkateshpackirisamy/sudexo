import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, SafeAreaView, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../assets/color';

const { height, width } = Dimensions.get('window');
const uri = process.env.EXPO_PUBLIC_API_URL;

const Payment = () => {
    let item = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState(null);

    useEffect(() => {
        if (item) {
            makePayment();
        }
    },[]);

    const makePayment = async () => {
        const token = await AsyncStorage.getItem('@userToken');
        try {
            const res = await fetch(`${uri}/employee/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pin: item.pin,
                    amount: item.amount,
                    to_id: item.to_id
                })
            });
            const result = await res.json();
            setResponse(result);
            setLoading(false);
            router.setParams({});
            item = null
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    };

    if (loading || response === null) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.color1} />
                <Text style={{ marginTop: 10 }}>Processing Payment...</Text>
            </SafeAreaView>
        );
    }

    const isSuccess = response.status_code === 200;
    const isFailed = response.status_code === 401 || response.status_code === 400;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    {isSuccess && <AntDesign name="checkcircle" size={100} color="#4BB543" />}
                    {isFailed && response.status_code === 401 && (
                        <AntDesign name="closecircle" size={100} color="#FF3B30" />
                    )}
                    {isFailed && response.status_code === 400 && (
                        <FontAwesome name="warning" size={100} color="#FFA500" />
                    )}
                </View>

                <Text style={[styles.statusText, { color: isSuccess ? '#4BB543' : '#FF3B30' }]}>
                    {isSuccess ? 'Payment Successful' : 'Payment Failed'}
                </Text>

                {response.amount && (
                    <Text style={styles.amountText}>₹{response.amount}</Text>
                )}
                {response.receiver && (
                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailLabel}>To:</Text>
                        <Text style={styles.detailValue}>{response.receiver}</Text>
                    </View>
                )}


                <Text style={styles.messageText}>
                    {isSuccess ? response.description : response.message}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/EmpHome')}
                >
                    <Text style={styles.buttonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    card: {
        width: width * 0.85,
        padding: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    statusText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
    },
    amountText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 10,
    },
    messageText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#555',
        marginBottom: 25,
    },
    button: {
        backgroundColor: colors.color1,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        elevation: 3,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    detailsContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailLabel: {
        fontSize: 16,
        color: '#888',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 4,
        textAlign: 'center',
    },
    
});

export default Payment;
