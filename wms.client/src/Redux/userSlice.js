import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    email: '',
    password: ''
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.email = action.payload.email;
            state.password = action.payload.password;
        },
        clearCredentials: (state) => {
            state.email = '';
            state.password = '';
        }
    }
});

export const { setCredentials, clearCredentials } = userSlice.actions;
export default userSlice.reducer;
