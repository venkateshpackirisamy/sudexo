import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
const { height, width } = Dimensions.get('window');
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import usePagination from "../usePagination";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { router } from "expo-router";
import colors from "../../assets/color";
export default function transaction() {
  const [userName, setUserName] = useState()
  const [modalVisibleFilter, setModalVisibleFilter] = useState(false)
  const [lastSixMon, setLastSixMon] = useState([])
  const [filterVar, setfilterVar] = useState(0)
  const [month, setMonth] = useState(0)
  const monthData = [
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
    if (month != null)
      handleRefresh();
  }, [month]);

  const setUser = async () => {
    const result = await AsyncStorage.getItem('@userName')
    if (result)
      setUserName(result)
    else
      router.push('/login')
  }

  const getMonths = () => {
    const d = new Date();
    const current_month = d.getMonth() + 1
    let temp
    if (current_month < 6) {
      temp = [
        ...monthData.slice(12 - (6 - current_month)),
        ...monthData.slice(0, current_month)
      ]
    } else {
      temp = monthData.slice(current_month - 6, current_month)
    }
    setLastSixMon(temp)
  }


  const {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  } = usePagination(month);

  const renderFooter = () => {
    if (!loadingMore || data.length < 5) return null; 
    return <ActivityIndicator animating size="large" />;
  };

  const covert_date = (dateString) => {
    const date = new Date(dateString);
    const dateOnly = date.toLocaleDateString();  
    return dateOnly
  }


  return (

    <SafeAreaView style={styles.container}>
      <StatusBar style='light' backgroundColor={colors.color1} />
      <View style={styles.haeder}>
        <TouchableOpacity onPress={() => { router.push('/profile') }}>
          <MaterialCommunityIcons name="account-circle" size={40} color='white' />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: 'white' }}>{userName}</Text>
      </View>
      <View style={{ height: '7%' }}>
        <TouchableOpacity onPress={() => setModalVisibleFilter(true)} style={styles.filter}>
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Filters </Text>
          <Ionicons name="filter" size={15} color="black" />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleFilter}
        onRequestClose={() => {
          setfilterVar(month)
          setModalVisible(!modalVisibleFilter);
        }}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: "55%", width: "80%", }]}>
            <View style={styles.modelHaeder}>
              <Pressable onPress={() => { setModalVisibleFilter(false), setfilterVar(month) }}><AntDesign name="close" size={24} color="black" /></Pressable>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Filters</Text>
              <Pressable onPress={() => setfilterVar(0)}><Text style={[filterVar != 0 && { fontWeight: 'bold' }]}>clear </Text></Pressable>
            </View>
            <View style={{ gap: 10, width: '100%', alignItems: 'center' }}>
              {lastSixMon.map((item) => {
                return (
                  <TouchableOpacity onPress={() => setfilterVar(item.mon)} style={[styles.filter1, filterVar == item.mon && { borderWidth: 1, borderColor: 'black' }]}>
                    <Text>{item.label}</Text>
                  </TouchableOpacity>)
              })}


            </View>
            <TouchableOpacity onPress={() => { setMonth(filterVar); setModalVisibleFilter(false) }} style={{ width: '100%', padding: 10, alignItems: 'center', backgroundColor: colors.color1 }} >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ 'width': '100%', height: '83%', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 10, }}>
        {!refreshing ?
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>

                <View style={{ height: '100%', width: '20%', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                  <View style={{ backgroundColor: colors.color1, height: '60%', width: '80%', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                    <Text style={{ fontSize: 25, padding: 5, color: 'white' }}>{item.type === 'DR' ? <Feather name="arrow-up-right" size={24} color="white" /> : <Feather name="arrow-down-left" size={24} color="White" />}</Text>
                  </View>
                </View>

                <View style={{ justifyContent: 'center', width: '80%' }}>
                  <Text style={{ 'fontSize': 17 }}>{item.type === 'DR' ? "Send to" : 'Recived from'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ 'fontWeight': "bold", 'fontSize': 20 }}>{item.type === 'DR' ? item.to_id : item.from_id}</Text>
                    <Text style={{ 'fontWeight': "bold", 'fontSize': 20, alignSelf: 'flex-end', color: item.type === 'DR' ? "red" : 'green' }}> ₹{item.amount} </Text>
                  </View>
                  <Text style={{ alignSelf: 'flex-end' }}>{covert_date(item.date_time)}</Text>
                </View>

              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={<View style={{ backgroundColor:'white',height: height * 0.75, width: width * 0.9, justifyContent: 'center', alignItems: 'center',borderRadius:10 }}> <Text style={{ fontWeight: 'bold', fontSize: 25 }}> No Transaction Yet</Text></View>}
            ListFooterComponent={renderFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
          />
          :
          <View style={styles.loadingContainor}>
            <ActivityIndicator size="large" color={colors.color1} />
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
    padding: 15,
    backgroundColor: colors.color1,
    // justifyContent: "center",
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    width: width * 0.94,
    height: height * 0.13,
    backgroundColor: 'white',
    flexDirection: "row",
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  cardLeft: {
    width: '50%',
    justifyContent: 'center',
    // alignItems:"center"
    alignItems: 'flex-start'

  },
  CardRight: {
    justifyContent: 'center'
  },
  filter: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#A9A9A9',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    // height:"80%",
    // width:"80%",
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
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
  loadingContainor: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%'
  },

})