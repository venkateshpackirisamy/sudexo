import { ActivityIndicator, Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { PieChart } from "react-native-gifted-charts";
import colors from "../../assets/color";
const { height, width } = Dimensions.get('window');
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {
  const [userName, setUserName] = useState(null)
  const [series, setseries] = useState([])
  const [token, setToken] = useState(null)
  useEffect(() => {
    setUser();
    if(token)
      getSat()
  }, [token])

  const setUser = async () => {
    const token = await AsyncStorage.getItem('@userToken')
    const result = await AsyncStorage.getItem('@userName')
    const admin = await AsyncStorage.getItem('is_admin')
    if (result && admin === 'false') {
      setToken(token)
      setUserName(result)
    }
    else
      router.push('/login')
  }

  const getSat = () => {
    console.log('funtion')
    try {
      fetch(`${uri}/employee/transactionsSummary`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        .then(function (res) {
          res.json()
            .then(data => {
              console.log(data)
              if (data.status_code == 200) {
                console.log(data)
                const sat = [
                  { value: data.result[0]?.total || 0, color:  data.result[0]?._id=='DR'?'#B6A6E9':'#876FD4', type:data.result[0]?._id},
                  { value: data.result[1]?.total || 0, color:  data.result[0]?._id=='CR'?'#B6A6E9':'#876FD4',type:data.result[0]?._id},
                ]
                setseries(sat)
              }
            })
        })
        .catch(function (res) { console.log('errror') })

    } catch (error) {
      console.log(error)
    }
  }
  if (!userName || !(series.length > 0))
    return (
      <SafeAreaView style={styles.loadingContainor}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text>Loading...</Text>
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='light' backgroundColor={colors.color1} />
      <View style={styles.haeder}>
        <TouchableOpacity onPress={() => { router.push('/profile') }}>
          <MaterialCommunityIcons name="account-circle" size={40} color="white" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: 'white' }}>{userName}</Text>
      </View>

      <View style={{ 'width': '100%', height: '90%', alignItems: 'center', padding: 10, gap: 10 }}>

        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text style={{ fontWeight: '600' }}>Money Transfer</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity onPress={() => { router.push({ pathname: '/scanQr', params: { type: 'pay' } }) }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <View style={{ backgroundColor: colors.color1, padding: 5, borderRadius: 10 }}>
                  <MaterialCommunityIcons name="qrcode-scan" size={40} color={'white'} />
                </View>
                <Text>Scan & Pay</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { router.push({ pathname: '/pin', params: { type: 'balance' } }) }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <View style={{ backgroundColor: colors.color1, padding: 5, borderRadius: 10 }}>
                  <MaterialIcons name="account-balance-wallet" size={40} color="white" />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text>Check Balance</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text style={{ fontWeight: '600' }}>Reacharge & Bill Payment</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity onPress={() => { router.push({ pathname: '/billPayment', params: { type: 'mobile' } }) }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Entypo name="mobile" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Mobile</Text>
                  <Text>Recharge</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { router.push({ pathname: '/billPayment', params: { type: 'eb' } }) }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="lightbulb" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Electricity</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { router.push({ pathname: '/billPayment', params: { type: 'mobile' } }) }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Entypo name="mobile" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Mobile</Text>
                  <Text>PostPaid</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>
        {/* 
        <View style={styles.card}>
          <View style={styles.cardHeaad}><Text>Loan</Text></View>
          <View style={styles.cardBody}>

            <TouchableOpacity onPress={() => { Linking.openURL('https://mykaasu.com/personal-loans') }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <Fontisto name="person" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Personal</Text>
                  <Text>Loan</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { Linking.openURL('https://mykaasu.com/home') }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <MaterialCommunityIcons name="speedometer" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Free Credit</Text>
                  <Text>Score</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { Linking.openURL('https://mykaasu.com/business-loans') }}>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <MaterialCommunityIcons name="cash-multiple" size={40} color={colors.color1} />
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
                <FontAwesome6 name="google-play" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Yavhi</Text>
                  <Text>Pay</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="google-play" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Yavhi</Text>
                  <Text>Business</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={{ alignItems: 'center', justifyContent: "center" }}>
                <FontAwesome6 name="google-play" size={40} color={colors.color1} />
                <View style={{ alignItems: 'center' }}>
                  <Text>Yahvi</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View> */}

        <View style={styles.dashBoard}>

          <Text style={{ fontWeight: 'bold', width: '100%' }}>Monthly Transaction summary</Text>
          <PieChart
            donut
            showGradient
            data={series}

            textColor="black"
            radius={140}
            textSize={20}
            focusOnPress
            showValuesAsLabels
            showTextBackground
            textBackgroundRadius={26}
            innerRadius={80}
            // onPress ={(item,index)=>{Alert.alert(item.value.toString())}}

            // textBackgroundColor="rgba(0, 0, 0, 0.5)" 
            style={styles.pieChart}
          />
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-evenly',

            }}>
            <Text>{series[0]?.value}</Text>
            <Text>{series[1]?.value}</Text>

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
    padding: 15,
    backgroundColor: colors.color1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  card: {
    width: '100%',
    height: '20%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4, // For Android
  },
  cardHeaad: {
    height: '20%',
    marginBottom: 5,
  },
  cardBody: {
    height: '80%',
    alignItems: 'center',
    justifyContent: "space-evenly",
    flexDirection: 'row',
    gap: 10,
  },
  loadingContainor: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dashBoard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4, // For Android
  },
  pieChart: {
    borderRadius: 20, // Rounded corners for the chart
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 5, // Shadow radius
    elevation: 5, // For Android shadow
  },


})