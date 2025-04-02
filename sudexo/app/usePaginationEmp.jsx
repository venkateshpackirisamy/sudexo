import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const uri = process.env.EXPO_PUBLIC_API_URL;
const initialData = {
  data: [],
  totalResult: 0,
  status: true,
  pageNo: 1,
  totalPages: 1,
};
const usePaginationEmp = () => {
  const [initialLoader, setInitialLoader] = useState(true);
  const [data, setData] = useState(initialData.data);
  const [totalResult, setTotalResult] = useState(initialData.totalResult);
  const [pageNo, setPageNo] = useState(initialData.pageNo);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch data for a given page
  const fetchData = async (page) => {
    const token = await AsyncStorage.getItem('@userToken');
    try {
      const response1 = await fetch(`${uri}/admin/employees?page_no=${page}`, {
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }})


      const result1 = await response1.json()
      const resultOld = result1.result
  
      const result = {
        data: resultOld?.data,
        totalResult: resultOld?.total_page,
        status: true,
        pageNo: resultOld?.current_page,
        totalPages: resultOld?.total_page,
      };
      if (result.status) {
        if (page === 1) {
          setData(result.data);
        } else {
          setData(prevData => {
            const newData = result.data.filter(item => !prevData.some(existingItem => existingItem.id === item.id));
            return [...prevData, ...newData];
          });
        }

        setTotalResult(result.totalResult);
        setPageNo(result.pageNo);
        setTotalPages(result.totalPages);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setInitialLoader(false);
    }
  };

  useEffect(() => {
    console.log()
    fetchData(pageNo);
  }, []);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(1); // Refresh from the first page
  }, []);

  // Load more data
  const loadMore = () => {
    if (!loadingMore && pageNo < totalPages) {
      setLoadingMore(true);
      fetchData(pageNo + 1);
    }
  };

  return {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  };
};

export default usePaginationEmp;
