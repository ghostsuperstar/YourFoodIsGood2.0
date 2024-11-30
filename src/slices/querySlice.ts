import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface queryState{
    query:string;
}

const initialState:queryState={
    query:""
}

const querySlice=createSlice({
    name:'query',
    initialState,
    reducers:{
        setQuery:(state,action:PayloadAction<string>)=>{
            state.query=action.payload;
        },
    },
});

export const {setQuery}=querySlice.actions;
export default querySlice.reducer;