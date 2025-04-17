import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
const { height, width } = Dimensions.get('window');
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";
import usePaginationEmp from "../usePaginationSpnd";
import colors from "../../assets/color";
import { useIsFocused } from "@react-navigation/native";
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function spending() {
  const item = useLocalSearchParams()
  const [userName, setUserName] = useState()
  const [token, setToken] = useState()
  const [month, setMonth] = useState(item.month || 0)
  const [lastSixMon, setLastSixMon] = useState([])
  const [filterVar, setfilterVar] = useState(month)
  const [barSat, setBarSat] = useState([])
  const isfocuse = useIsFocused()
  const [modalVisible, setModalVisible] = useState(false)
  const barData = [
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
    setUser()
    getMonths()
  }, [])
  useEffect(() => {
    if (isfocuse) {
      setMonth(item.month)
      router.setParams({ month: 0 })
    }
  }, [isfocuse])

  const setUser = async () => {
    const result = await AsyncStorage.getItem('@userName')
    const token = await AsyncStorage.getItem('@userToken')
    if (result && token) {
      setUserName(result)
      setToken(token)
    }
    else
      router.push('/login')
  }

  useEffect(() => {
    setfilterVar(month)
    if (month != null)
      handleRefresh();
  }, [month]);

  const getMonths = () => {
    const d = new Date();
    const current_month = d.getMonth() + 1
    let temp
    if (current_month < 6) {
      temp = [
        ...barData.slice(12 - (6 - current_month)),
        ...barData.slice(0, current_month)
      ]
    } else {
      temp = barData.slice(current_month - 6, current_month)
    }
    setBarSat(temp)
  }


  const {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  } = usePaginationEmp(month);



  const renderFooter = () => {
    if (!loadingMore || data.length < 5) return null; // Show footer loader only for subsequent pages
    return <ActivityIndicator animating size="large" />;
  };


  return (
    <SafeAreaView style={styles.container} >
      <StatusBar style='light' backgroundColor={colors.color1} />
      <ToastManager />

      <View style={styles.haeder}>
        <TouchableOpacity onPress={() => { router.push('/profile') }}>
          <MaterialCommunityIcons name="account-circle" size={40} color="white" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: 'white' }}>{userName}</Text>
      </View>


      <View style={{ 'width': '100%', height: '90%', alignItems: 'center', gap: 10, paddingTop: 15, }}>

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
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Filters</Text>
                <Pressable onPress={() => setfilterVar(0)}><Text style={[filterVar != 0 && { fontWeight: 'bold' }]}>clear </Text></Pressable>
              </View>
              <View style={{ gap: 10, width: '100%', alignItems: 'center' }}>
                {barSat.map((item) => {
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

        {!refreshing ?
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { router.push({ pathname: '/employee', params: { emp_id: item.id } }) }}>
                <View style={[styles.card, !item.active && { borderColor: 'red' }]}>
                  <View style={styles.cardLeft}>
                    <MaterialCommunityIcons name="account-circle" size={50} color={colors.color1} />
                  </View>
                  <View style={styles.CardRight}>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 20, }}>{item.name}</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 20, }}>₹{item.transaction[0]?.totalspending || 0}</Text>
                    </View>
                    <Text>{item.email}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={<View style={{ height: height * 0.8, width: width * 0.9, justifyContent: 'center', alignItems: 'center' }}> <Text style={{ fontWeight: 'bold', fontSize: 25 }}> No Employees Yet</Text></View>}
            ListFooterComponent={renderFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            style={styles.cards}
          />
          :
          <View style={styles.loadingContainor}>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text>Loading...</Text>
          </View>
        }


      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'Center',
  },
  haeder: {
    height: '10%',
    width: '100%',
    padding: 10,
    backgroundColor: colors.color1,
    // justifyContent: "center",
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  cards: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
    marginBottom: 15,
    gap: 3,
  },
  card: {
    width: width * 0.9,
    height: height * 0.13,
    backgroundColor: 'white',
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    gap: 3,
    marginBottom: 1,
    marginHorizontal: 10,
    marginVertical: 5,
  },

  cardLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '15%',
  },
  CardRight: {
    width: '85%',
    justifyContent: 'center',
    height: '100%',
    borderBottomWidth: 1,
    borderColor: '#A9A9A9',
    justifyContent: 'center',

  },
  input: {
    width: width * 0.8,
    height: height * 0.05,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 15,
    textAlign: 'center',
    // marginBottom: 10,
  },
  filter: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginHorizontal: 15,
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
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modelHaeder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
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
  loadingContainor: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    width:'98%',
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
    marginBottom: 15,
  },
})