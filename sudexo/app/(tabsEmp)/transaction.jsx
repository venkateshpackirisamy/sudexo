import { ActivityIndicator, Dimensions, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
const { height, width } = Dimensions.get('window');
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import usePagination from "../usePagination";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { router } from "expo-router";
import colors from "../../assets/color";
export default function Index() {
  const[userName,setUserName] = useState()
  useEffect(()=>{
    setUser()
  },[])
  const setUser = async ()=>{
    const result =  await AsyncStorage.getItem('@userName')
    if(result)
      setUserName(result)
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
  } = usePagination();

  const renderFooter = () => {
    if (!loadingMore || data.length < 5) return null; // Show footer loader only for subsequent pages
    return <ActivityIndicator animating size="large" />;
  };

  const covert_date = (dateString) => {
    const date = new Date(dateString);
    const dateOnly = date.toLocaleDateString();  // In local format, e.g., "3/26/2025"
    return dateOnly
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='light' backgroundColor={colors.color1} />
      <View style={styles.haeder}>
        <TouchableOpacity onPress={() => { router.push('/profile') }}>
          <MaterialCommunityIcons name="account-circle" size={40} color='white' />
        </TouchableOpacity>
        <Text style={{fontSize:20, color:'white'}}>{userName}</Text>
      </View>


      <View style={{ 'width': '100%', height: '90%', alignItems: 'center',justifyContent:'center', gap: 10,padding:10, }}>
      
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{height:'100%',width:'20%', alignItems:'center',justifyContent:'center',padding:10}}>
                <View style={{backgroundColor:colors.color1,height:'60%',width:'90%',alignItems:'center',justifyContent:'center',borderRadius:10}}>
                <Text style={{fontSize:25,padding:5,color:'white'}}>{item.type === 'DR' ? item.to_id[0] : item.from_id[0]}</Text>
                </View> 
                </View>
              <View style={styles.cardLeft}>
                <Text style={{ 'fontWeight': "bold", 'fontSize': 25 }}>{item.type === 'DR' ? "TO:" : 'From:'}</Text>
                <Text style={{ 'fontWeight': "bold", 'fontSize': 18 }}>{item.type === 'DR' ? item.to_id : item.from_id}</Text>
              </View>
              <View style={styles.CardRight}>
                <Text style={{ 'fontWeight': "bold", 'fontSize': 30 ,color:item.type === 'DR' ? "red":'green'}}> ₹{item.amount} </Text>
                <Text style={{alignSelf:'flex-end'}}>{covert_date(item.date_time)}</Text>
              </View>

            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={<View style={{height:height*0.8, width:width*0.9,justifyContent:'center',alignItems:'center'}}> <Text style={{fontWeight:'bold',fontSize:25}}> No Transaction Yet</Text></View>}
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
    padding: 15,
    backgroundColor: colors.color1,
    // justifyContent: "center",
    alignItems:'center',
    flexDirection:'row',
    gap:10,
  },
  card: {
    width: width * 0.9,
    height: height * 0.15,
    backgroundColor: 'white',
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    alignSelf:'center'
  },

  cardLeft: {
    width:'50%',
    justifyContent: 'center',
    // alignItems:"center"
    alignItems:'flex-start'

  },
  CardRight: {
    justifyContent: 'center'
  }


})