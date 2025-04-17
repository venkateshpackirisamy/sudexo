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
import usePaginationEmp from "../usePaginationEmp";
import colors from "../../assets/color";
import { useIsFocused } from "@react-navigation/native";
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function employees() {
  const item = useLocalSearchParams()
  const [userName, setUserName] = useState()
  const [token, setToken] = useState()
  const [nameReg, setNameReg] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [filter, setfilter] = useState(item.filter || 0)
  const [filterVar, setfilterVar] = useState(filter)
  const isfocuse = useIsFocused()

  useEffect(() => {
    setUser()
  }, [])
  useEffect(() => {
    if (isfocuse) {
      setfilter(item.filter)
      router.setParams({ filter: 0 })
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
    setfilterVar(filter)
    if (filter != null)
      handleRefresh();
  }, [filter]);

  useEffect(() => {
    if (nameReg != null)
      handleRefresh();
  }, [nameReg]);

  const {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  } = usePaginationEmp(filter, nameReg);


  const search = () => {
    if (email_id) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)) {
        fetch(`${uri}/admin/employeeByMail?email=${email_id}`, {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
          .then(res => {
            res.json()
              .then(data => {
                if (data.status_code == 200) {
                  router.push({ pathname: '/employee', params: { emp_id: data.data.id } })
                  setEmailId('')
                }
                else
                  Toast.error(data.errors[0].error);
              })
          })
      }
      else
        Toast.error("Enter valid Email id");
    }
    else {
      Toast.error("Please Enter Email id");
    }
  }
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={styles.input}
            value={nameReg}
            onChangeText={(value) => { setNameReg(value) }}
            placeholder="Search"
            placeholderTextColor='black'
          />
        </View>


        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.filter}>
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Filters </Text>
          <Ionicons name="filter" size={15} color="black" />
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setfilterVar(filter)
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modelHaeder}>

                <Pressable onPress={() => { setModalVisible(false), setfilterVar(filter) }}><AntDesign name="close" size={24} color="black" /></Pressable>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Filters</Text>
                <Pressable onPress={() => setfilterVar(0)}><Text style={[filterVar != 0 && { fontWeight: 'bold' }]}>clear </Text></Pressable>
              </View>
              <View style={{ gap: 10, width: '100%', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setfilterVar(1)} style={[styles.filter1, filterVar == 1 && { borderWidth: 1, borderColor: 'black' }]}>
                  <Text>Above 2000</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setfilterVar(2)} style={[styles.filter1, filterVar == 2 && { borderWidth: 1, borderColor: 'black' }]}>
                  <Text>Above 1000</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setfilterVar(3)} style={[styles.filter1, filterVar == 3 && { borderWidth: 1, borderColor: 'black' }]}>
                  <Text>below 1000</Text>
                </TouchableOpacity>
              </View>


              <TouchableOpacity onPress={() => { setfilter(filterVar); setModalVisible(false) }} style={{ width: '100%', padding: 10, alignItems: 'center', backgroundColor: colors.color1 }} >
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
                      <Text style={{ fontWeight: 'bold', fontSize: 20, color: item.balance >= 2000 ? 'green' : item.balance >= 1000 ? "gold" : 'red' }}>₹{item.balance}</Text>
                    </View>
                    <Text>{item.email}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={<View style={{ height: height * 0.8, width: width * 0.95, justifyContent: 'center', alignItems: 'center' }}> <Text style={{ fontWeight: 'bold', fontSize: 25 }}> No Employees Yet</Text></View>}
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
    width: width * 0.9,
    height: height * 0.05,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 8,
    backgroundColor: 'white'
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
    height: "40%",
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