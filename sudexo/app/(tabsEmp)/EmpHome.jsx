import { ActivityIndicator, Alert, Dimensions, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { PieChart } from "react-native-gifted-charts";
import ToastManager, { Toast } from "toastify-react-native";
import colors from "../../assets/color";
import { useIsFocused } from "@react-navigation/native";
const { height, width } = Dimensions.get('window');
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {
  const [userName, setUserName] = useState(null)
  const isfocuse = useIsFocused()
  const [series, setseries] = useState([])
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [month, setMonth] = useState(0)
  const [filterVar, setfilterVar] = useState(0)
  const [lastSixMon,setLastSixMon] = useState([])
  const months = [
    { label: 'Jan', mon: 1, },
    { label: 'Feb', mon: 2, },
    { label: 'Mar', mon: 3, },
    { label: 'Apr', mon: 4, },
    { label: 'May', mon: 5, },
    { label: 'June', mon: 6, },
    { label: 'July', mon: 7, },
    { label: 'Aug', mon: 8, },
    { label: 'Sep', mon: 9, },
    { label: 'Oct', mon: 10, },
    { label: 'Nov', mon: 11, },
    { label: 'Dec', mon: 12, },
  ]
  useEffect(() => {
    setUser();
    if (token)
      getSat()
    getMonths()
  }, [])

  useEffect(() => {
    if (token)
      getSat()
  }, [isfocuse, token,month])

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

  const getMonths = () => {
    const d = new Date();
    const current_month = d.getMonth() + 1
    setfilterVar(current_month)
    setMonth(current_month)
    let temp
    if (current_month < 6) {
      temp = [
        ...months.slice(12 - (6 - current_month)),
        ...months.slice(0, current_month)
      ]
    } else {
      temp = months.slice(current_month - 6, current_month)
    }
    setLastSixMon(temp)
  }
  const getSat = () => {
    try {
      fetch(`${uri}/employee/transactionsSummary?month=${month}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        .then(function (res) {
          res.json()
            .then(data => {
              if (data.status_code == 200) {
                if (data.result.length >= 1) {
                  const sat = [
                    { value: data.result[0]?.total || 0, color: data.result[0]?._id == 'DR' ? '#B6A6E9' : '#876FD4', type: data.result[0]?._id },
                    { value: data.result[1]?.total || 0, color: data.result[1]?._id == 'DR' ? '#B6A6E9' : '#876FD4', type: data.result[1]?._id },
                  ]
                  setseries(sat)
                }
                else{
                  setseries({})
                }
                setLoading(false)
              }
            })
        })
        .catch(function (res) { Toast.error(res.message) })

    } catch (error) {
      console.log(error)
    }
  }

  if (!userName || loading)
    return (
      <SafeAreaView style={styles.loadingContainor}>
        <ToastManager />
        <ActivityIndicator size="large" color={colors.color1} />
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
          <View style={{ width: '100%',flexDirection:'row',justifyContent:'space-between' }}>
            <Text style={{ fontWeight: 'bold' }}>Monthly Transaction summary</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.filter}>
              <Text style={{ fontSize: 15, fontWeight: "500" }}>Filters </Text>
              <Ionicons name="filter" size={15} color="black" />
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setfilterVar(month)
                setModalVisible(!modalVisible);
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.modelHaeder}>

                    <Pressable onPress={() => { setModalVisible(false), setfilterVar(month) }}><AntDesign name="close" size={24} color="black" /></Pressable>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 ,}}>Months</Text>
                  </View>
                  <View style={{ gap: 10, width: '100%', alignItems: 'center' }}>
                    {lastSixMon.map((item) => {
                      return (
                        <TouchableOpacity onPress={() => setfilterVar(item.mon)} style={[styles.filter1, filterVar == item.mon && { borderWidth: 1, borderColor: 'black' }]}>
                          <Text>{item.label}</Text>
                        </TouchableOpacity>)
                    })}


                  </View>


                  <TouchableOpacity onPress={() => { setMonth(filterVar); setModalVisible(false) }} style={{ width: '100%', padding: 10, alignItems: 'center', backgroundColor: colors.color1 }} >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Apply</Text>
                  </TouchableOpacity>

                </View>
              </View>
            </Modal>

          </View>
          {series.length >= 1 ?
            <View>
              <PieChart
                donut
                showGradient
                data={series}

                textColor="black"
                radius={137}
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}><FontAwesome name="square" color={series[0]?.color} /><Text> {series[0]?.type == 'DR' ? 'Send' : 'Recived'} ₹{series[0]?.value}</Text></View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}><FontAwesome name="square" color={series[1]?.color} /><Text> {series[1]?.type == 'DR' ? 'Send' : 'Recived'} ₹{series[1]?.value}</Text></View>
              </View>
            </View> :



            <View style={styles.noTranscations}>
              <FontAwesome6 name="money-bill-transfer" size={24} color="black" />
              <Text style={{ fontWeight: 'bold' }}>No Transaction in This month</Text>
            </View>}

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
    elevation: 4,
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
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  pieChart: {
    borderRadius: 20, // Rounded corners for the chart
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 5, // Shadow radius
    elevation: 5, // For Android shadow
  },
  noTranscations: {
    // flex: 1,
    width: "100%",
    height:height*0.4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10, 

  },
  filter: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    // alignSelf: 'flex-end',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    height: "55%",
    width: "80%",
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 10
  },

  buttonClose: {
    backgroundColor: 'red',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modelHaeder: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    width: '100%',
    gap:70,
  },
  filter1: {
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    width: '80%',
    borderColor: '#A9A9A9',
  },

})