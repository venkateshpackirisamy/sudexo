import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
const { height, width } = Dimensions.get('window');
export default function Index() {
  const [userName, setUserName] = useState(null)
  useEffect(() => {
    setUser();
  }, [])

  const setUser = async () => {
    const result = await AsyncStorage.getItem('@userName')
    if (result)
      setUserName(result)
    else
      router.push('/login')
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.haeder}>
        <TouchableOpacity onPress={() => { router.push('/profile') }}>
          <MaterialCommunityIcons name="account-circle" size={40} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20 }}>{userName}</Text>

      </View>

      <View style={{ 'width': '100%', height: '90%', alignItems: 'center', padding: 20, gap: 10 }}>

        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>Money Transfer</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity onPress={() => { router.push({ pathname: '/scanQr', params: { type: 'pay' } }) }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <MaterialCommunityIcons name="qrcode-scan" size={40} color="black" />
                <Text>Scan & Pay</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { router.push({ pathname: '/pin', params: { type: 'balance' } }) }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="indian-rupee-sign" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Check Balance</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>Reacharge & Bill Payment</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Entypo name="mobile" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Mobile</Text>
                  <Text>Recharge</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="lightbulb" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Electricity</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Entypo name="mobile" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Mobile</Text>
                  <Text>PostPaid</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>Loan</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Fontisto name="person" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Personal</Text>
                  <Text>Loan</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <MaterialCommunityIcons name="speedometer" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Free Credit</Text>
                  <Text>Score</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <MaterialCommunityIcons name="cash-multiple" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Business</Text>
                  <Text>Loan</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>App by Sudexo</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="google-play" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Yavhi</Text>
                  <Text>Pay</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="google-play" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Yavhi</Text>
                  <Text>Business</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="google-play" size={40} color="black" />
                <View style={{ alignItems: 'center' }}>
                  <Text>Yahvi</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#b0006d",
    // paddingTop: Constants.statusBarHeight,
    alignItems: 'Center',
  },
  haeder: {
    height: '10%',
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  card: {
    width: '100%',
    height: '20%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10
  },
  cardHeaad: {
    height: '20%'
  },
  cardBody: {
    height: '80%',
    alignItems: 'center',
    justifyContent: "space-evenly",
    flexDirection: 'row',
    gap: 10,
  }


})