import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ChangePassword({ darkMode }) {
    const [users, setUsers] = useState([]);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [userId, setUserId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [originalPassword, setOriginalPassword] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    const api = axios.create({
        baseURL: 'https://' + import.meta.env.VITE_API_URL + '/',//import.meta.env.VITE_API_URL,
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });

    // Fetch users
    const fetchUsers = async () => {
        try {
            
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token is missing. Please log in again.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }

            const response = await api.get('api/UserProfile/GetAllUsers');

            if (!response.data) {
                throw new Error('Failed to fetch users');
            }

            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error fetching users: ${error.response?.data || error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Decrypt data function
    const decryptData = (encryptedData) => {
        const bytes = CryptoJS.AES.decrypt(encryptedData, 'secretKey');
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    // Use this function to decrypt email and password from Redux state
    const useCredentials = () => {
        const email = useSelector((state) => state.user.email);
        const password = useSelector((state) => state.user.password);

        // Decrypt credentials
        const decryptedEmail = decryptData(email);
        const decryptedPassword = decryptData(password);

        return { email: decryptedEmail, password: decryptedPassword };
    };

    const { email, password } = useCredentials();

    useEffect(() => {
        fetchUsers();
    }, []); // fetch users once on component mount

    useEffect(() => {
        if (users.length > 0 && email && password) {
            const matchedUser = users.find(
                (user) => user.userName === email && user.password === password
            );

            if (matchedUser) {
                setUserId(matchedUser.userId);
                setNewPassword(password);
                setOriginalPassword(password); // Set original password
            }
        }
    }, [users, email, password]);

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);  // Update local state with new password input
    };

    //const handleSave = async () => {
    //    if (!newPassword) {
    //        alert("Password cannot be empty!");
    //        return;
    //    }

    //    try {
    //        const token = localStorage.getItem('authToken');
    //        if (!token) {
    //            alert('Authentication token is missing. Please log in again.');
    //            return;
    //        }

    //        const response = await api.post(
    //            `api/UserProfile/UpdatePassword/${userId.toString()}`,
    //            { newPassword },
    //            {
    //                headers: {
    //                    Authorization: `Bearer ${token}`,
    //                    'Content-Type': 'application/json'
    //                }
    //            }
    //        );

    //        if (response.status === 200) {
    //            alert('Password updated successfully.');
    //        } else {
    //            throw new Error('Failed to update password.');
    //        }
    //    } catch (error) {
    //        console.error('Error saving password:', error);
    //        alert(`Error updating password: ${error.response?.data || error.message}`);
    //    }
    //};

    const handleSave = async () => {
        if (!newPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password cannot be empty!',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token is missing. Please log in again.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }

            // Using fetch to make the POST request

            //const api = axios.create({
            //    baseURL: 'https://' + API_URL + '/',
            //    headers: {
            //        Authorization: token ? `Bearer ${token}` : ''
            //    }
            //});
            const response = await api.post(
                `api/UserProfile/UpdatePassword/${userId}`,  // URL
                JSON.stringify(newPassword) ,  // Send newPassword as the request body directly
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            //const response = await fetch(
            //    `https://${API_URL}/api/UserProfile/UpdatePassword/${userId}`,
            //    {
            //        method: 'POST',
            //        headers: {
            //            'Authorization': `Bearer ${token}`,
            //            'Content-Type': 'application/json',
            //        },
            //        body: JSON.stringify( newPassword ),  // Send the password as a plain string
            //    }
            //);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Password updated successfully.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                navigate('/')

            } else {
                //const errorData = await response.json();
                //throw new Error(errorData?.message || 'Failed to update password.');
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Failed to update password.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
            }
        } catch (error) {
            console.error('Error saving password:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error updating password: ${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    return (
        <>
            <div>
                <h2 className="mt-2 mb-4 font-bold">Change Password</h2>
            </div>
            <div className={`flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white-100'}`}>
                <div className={`p-8 max-w-lg w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white shadow-lg rounded-lg text-black'}`}>
                    {/* User ID Field */}
                    <div className="mb-4">
                        <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="userId">
                            User ID
                        </label>
                        <input
                            className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
                            id="userId"
                            type="text"
                            value={userId}
                            placeholder="User ID"
                            autoComplete="off"
                            readOnly
                        />
                    </div>

                    {/* Email Field */}
                    <div className="mb-4">
                        <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="email">
                            Email
                        </label>
                        <input
                            className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
                            id="email"
                            type="text"
                            value={email}
                            autoComplete="off"
                            readOnly
                        />
                    </div>

                    {/* New Password Field */}
                    <div className="mb-4 relative">
                        <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="newPassword">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                className={`appearance-none border rounded w-full py-2 px-3 leading-tight pr-10 focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                id="newPassword"
                                type={passwordVisible ? 'text' : 'password'}
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                placeholder="New Password"
                                autoComplete="off"
                            />
                            <div
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                            >
                                {passwordVisible ? (
                                    <FaEyeSlash className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                                ) : (
                                    <FaEye className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end mt-6 space-x-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            type="button"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                        <button
                            className={'bg-gray-500 hover:bg-gray-600  text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'}
                            type="button"
                            onClick={() => setNewPassword(originalPassword)}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
}

export default ChangePassword;
