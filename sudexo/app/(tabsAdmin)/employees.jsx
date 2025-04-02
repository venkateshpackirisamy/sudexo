import { ActivityIndicator, Dimensions, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
const { height, width } = Dimensions.get('window');
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { router } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";
import usePaginationEmp from "../usePaginationEmp";
import colors from "../../assets/color";
const uri = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {
  const [userName, setUserName] = useState()
  const [token, setToken] = useState()
  const [email_id, setEmailId] = useState('')
  useEffect(() => {
    setUser()
  }, [])
  const setUser = async () => {
    const result = await AsyncStorage.getItem('@userName')
    const token = await AsyncStorage.getItem('@userToken')
    if (result && token){
      setUserName(result)
      setToken(token)
    }
    else
      router.push('/login')
  }
  const {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  } = usePaginationEmp();


  const search = ()=>{
    if(email_id){
      if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)){
        fetch(`${uri}/admin/employeeByMail?email=${email_id}`, {
          headers: {
              'Content-type': 'application/json',
              'Authorization': `Bearer ${token}`,
          }})
          .then(res=>{
            res.json()
            .then(data=>{
              if(data.status_code==200){
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
    else{
      Toast.error("Please Enter Email id");
    }
  }
  const renderFooter = () => {
    if (!loadingMore || data.length < 4) return null; // Show footer loader only for subsequent pages
    return <ActivityIndicator animating size="large" />;
  };


  return (
    <SafeAreaView style={styles.container}>
       <StatusBar style='light' backgroundColor={colors.color1} />
      <ToastManager />
      <View style={styles.haeder}>
        <TouchableOpacity onPress={() => { router.push('/profile')}}>
          <MaterialCommunityIcons name="account-circle" size={40} color="white" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20,color:'white' }}>{userName}</Text>
      </View>

      <View style={{ 'width': '100%', height: '90%', alignItems: 'center', gap: 10,paddingTop:15, }}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
        <TextInput
          style={styles.input}
          value={email_id}
          onChangeText={(value)=>{setEmailId(value)}}
          placeholder="Search by Email"
          onSubmitEditing={search}
        />
        <TouchableOpacity style={{height: height * 0.05,backgroundColor:'black',justifyContent:'center',padding:5}} onPress={search}>
        <AntDesign name="search1" size={30} color="white" />
        </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { router.push({ pathname: '/employee', params: { emp_id: item.id } }) }}>
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <MaterialCommunityIcons name="account-circle" size={40} color={colors.color1} />
                  <Text style={{ fontWeight: 'bold', fontSize: 20, color:colors.color1 }}>{item.name}</Text>
                </View>
                <View style={styles.CardRight}>
                  <Text style={{ fontWeight: 'bold', fontSize: 20, color: item.balance > 2000 ? 'green' : item.balance > 1000 ? "gold" : 'red' }}>₹{item.balance}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={<View style={{height:height*0.8, width:width*0.9,justifyContent:'center',alignItems:'center'}}> <Text style={{fontWeight:'bold',fontSize:25}}> No Employees Yet</Text></View>}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
        />

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
    padding: 20,
    backgroundColor: colors.color1,
    // justifyContent: "center",
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    width: width * 0.9,
    height: height * 0.13,
    backgroundColor: 'white',
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },

  cardLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  CardRight: {
    padding: 20,
    justifyContent: 'center'
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


})