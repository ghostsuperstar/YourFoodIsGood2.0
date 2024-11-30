import { configureStore } from '@reduxjs/toolkit';
import queryReducer from '../slices/querySlice'; 

const store = configureStore({
  reducer: {
    query: queryReducer, 
  },
});

export default store;
