import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import userReducer from './userSlice';

// Define persist config
const persistConfig = {
    key: 'root',
    storage,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

// Create the store with the persisted reducer
export const store = configureStore({
    reducer: {
        user: persistedReducer,
    },
});

export const persistor = persistStore(store);
