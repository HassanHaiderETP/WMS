import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';

function CreateUser({ darkMode }) {
    const [isCreateVisible, setIsCreateVisible] = useState(true);
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);
    const [modalLabel, setModalLabel] = useState('Create User');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [UserName, setUserName] = useState('');
    const [Password, setPassword] = useState('');
    const [IsEnabled, setIsActive] = useState(false);
    const [SelectedUserID, setSelectedUserID] = useState(null);
    const [CreatedBy] = useState(5);
    const [RolesID, setRolesID] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const token = localStorage.getItem('authToken');
    const api = axios.create({
        baseURL: 'https://' + import.meta.env.VITE_API_URL + '/',
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });

    // Fetch Users and Roles on component mount
    useEffect(() => {
        fetchUsers();
        fetchRoles();
        resetForm();
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await api.get('api/UserProfile/GetAllUsers');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert(`Error fetching users: ${error.message}`);
        }
    };

    // Fetch all roles
    const fetchRoles = async () => {
        try {
            const response = await api.get('api/UserProfile/GetAllRoles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const isUserExists = (userName) => {
        if (!userName) return false; // If the input is empty, return false

        const trimmedUserName = userName.trim().toLowerCase();

        // Check if the username already exists in the users list, regardless of the currently selected user
        return users.some(user =>
            user.userName.trim().toLowerCase() === trimmedUserName
        );
    };

    // Function to validate email format with strong checks for common extensions
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|int|co|io|info|biz|name|pro)$/;
        return emailRegex.test(email);
    };

    // Handle form submission for creating a new user
    const handleCreate = async () => {
        if (!UserName || !Password || !RolesID || RolesID === 0) {
            alert('Please fill in all fields.');
            return;
        }

        // Check if email format is valid
        if (!isValidEmail(UserName)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (isUserExists(UserName)) {
            alert('User with this username already exists.');
            return;
        }

        const user = {
            UserName: UserName.trim(),
            Password: Password.trim(),
            CreatedBy,
            RolesID,
            IsEnabled,
        };

        try {
            const response = await api.post('api/UserProfile/Create', user);

            if (response.status === 200) {
                alert('User saved successfully!');
                resetForm();
                fetchUsers();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert(`Error creating user: ${error.message}`);
        }
    };

    // Handle updating an existing user
    const handleUpdate = async () => {
        if (!UserName || !Password || !RolesID || RolesID === 0) {
            alert('Please fill in all fields.');
            return;
        }

        if (!SelectedUserID) {
            alert('Select any user from grid!');
            return;
        }

        // Check if email format is valid
        if (!isValidEmail(UserName)) {
            alert('Please enter a valid email address.');
            return;
        }

        const user = {
            UserId: SelectedUserID,
            UserName: UserName.trim(),
            Password: Password.trim(),
            CreatedBy,
            RolesID,
            IsEnabled,
        };

        try {
            const response = await api.post(`api/UserProfile/Update/${SelectedUserID}`, user);

            if (response.status === 200) {
                alert('User updated successfully!');
                resetForm();
                fetchUsers();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert(`Error updating user: ${error.message}`);
        }
    };

    // Handle deleting an existing user
    const handleDelete = async (SelectedUserID) => {

        if (!SelectedUserID.userId) {
            alert('Please select a user to delete.');
            return;
        }

        const confirmation = window.confirm('Are you sure you want to delete this user?');
        if (!confirmation) return;

        try {
            const response = await api.post(`api/UserProfile/Delete/${SelectedUserID.userId}`);

            if (response.status === 200) {
                alert('User deleted successfully!');
                fetchUsers();
                resetForm();
            } else {
                alert('Failed to delete user.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + error.message);
        }
    };


    // Reset form fields
    const resetForm = () => {
        setUserName('');
        setPassword('');
        setIsActive(false);
        setRolesID(0);
        setSelectedUserID(null);
    };

    // Handle row click to pre-fill form
    const handleRowClick = (row) => {
        setModalOpen(true);
        setModalLabel('Update User');
        setIsCreateVisible(false); // Hide Create button
        setIsUpdateVisible(true); // Show Update button

        setUserName(row.userName);
        setPassword(row.password);
        setIsActive(row.isEnabled);
        setRolesID(row.rolesId);
        setSelectedUserID(row.userId);
    };

    const HandelOpenModal = () => {
        setModalOpen(true);
        setModalLabel('Create User');
        setIsUpdateVisible(false); // Hide Update button
        setIsCreateVisible(true); // Show Create button
        resetForm();
    };

    const HandelCloseModal = () => {
        setModalOpen(false);
    };

    // Table columns
    const columns = [
        { name: <strong>Sr#</strong>, selector: (_, index) => index + 1, sortable: true },
        { name: <strong>Username</strong>, selector: row => row.userName, sortable: true },
        { name: <strong>Created By</strong>, selector: row => row.createdBy, sortable: true },
        { name: <strong>Roles Description</strong>, selector: row => row.rolesDescription },
        { name: <strong>Password</strong>, selector: row => row.password, sortable: true },
        {
            name: <strong>Status</strong>,
            selector: row => row.isEnabled,
            cell: row => (
                <span className={`inline-block px-3 py-1 text-sm font-semibold ${row.isEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} rounded-full`}>
                    {row.isEnabled ? 'Active' : 'Inactive'}
                </span>

            ),
        },
        {
            name: <strong>Action</strong>,
            selector: row => row.userId,
            cell: row => (
                <div className="flex items-center">
                    {/* Update Button */}
                    <button
                        type="button"
                        onClick={() => handleRowClick(row)} // Pass the row data to handleUpdate
                        className="text-blue-500 hover:bg-blue-100 hover:text-blue-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ease-in-out"
                    >
                        <ModeEditOutlineOutlinedIcon />
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => handleDelete(row)} // Pass the row data to handleDelete
                        className="text-red-500 hover:bg-red-100 hover:text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ease-in-out"
                    >
                        <DeleteOutlinedIcon />
                    </button>
                </div>
            ),
        },
    ];

    const customStyles = {
        rows: {
            style: {
                minHeight: '48px',
                overflowWrap: 'break-word', // Add this line
            },
        },
        headCells: {
            style: {
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontWeight: 'bold',
                textAlign: 'center',
            },
        },
        cells: {
            style: {
                textAlign: 'center',
                overflowWrap: 'break-word', // Add this line
            },
        },
    };

    return (
        <>
            <section>
                <div className="flex justify-between md:flex-col items-start">
                    <div className="">
                        <h2 className="mb-4 font-bold">User Management</h2>
                    </div>
                    <div className="">
                        {/* Button to trigger modal */}
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            onClick={HandelOpenModal}
                        >
                            Create User
                        </button>
                    </div>
                </div>

                <div>
                    {/* Modal */}
                    <div
                        className={`fixed inset-0 flex justify-center items-center z-50 bg-gray-500 bg-opacity-75 ${modalOpen ? '' : 'hidden'}`}
                        aria-hidden="true"
                    >
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                            <div className="flex justify-between items-center">
                                <h1 className="text-lg font-semibold">
                                    <span id="labelchange">{modalLabel}</span>
                                </h1>
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={HandelCloseModal}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="mt-4">
                                <form className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                                    <div className="mb-4">
                                        <label className="form-label text-gray-700">Email</label>
                                        <input
                                            type="email" // Changed to email type for validation
                                            value={UserName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            autoComplete="off" // Prevent browser auto-fill
                                            required // Ensures that the field is filled before form submission
                                            placeholder="Enter a valid email address" // Optional: helpful for users
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            value={Password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            autoComplete="new-password" // Prevent browser auto-fill
                                            placeholder="Enter password"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-gray-700">Roles</label>
                                        <select
                                            value={RolesID}
                                            onChange={(e) => setRolesID(Number(e.target.value))}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value={0} disabled>Select Role</option> {/* Default option */}
                                            {roles.map(role => (
                                                <option key={role.rolesID} value={role.rolesId}>
                                                    {role.rolesDesc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <label className="form-label text-gray-700 mr-3">Activate/Deactivate</label>
                                        <input
                                            type="checkbox"
                                            checked={IsEnabled}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="h-5 w-5"
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                    onClick={HandelCloseModal}
                                >
                                    Close
                                </button>
                                <div className="space-x-2">
                                    <button
                                        type="button"
                                        className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 ${isCreateVisible ? '' : 'hidden'}`}
                                        onClick={handleCreate}
                                    >
                                        Create
                                    </button>

                                    <button
                                        type="button"
                                        className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 ${isUpdateVisible ? '' : 'hidden'}`}
                                        onClick={handleUpdate}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-4">
                    <div className="overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={users}
                            pagination
                            highlightOnHover
                            pointerOnHover
                            theme={darkMode ? 'dark' : 'default'}
                            customStyles={customStyles}
                        />
                    </div>
                </div>
            </section>
        </>
    );

}

export default CreateUser;
