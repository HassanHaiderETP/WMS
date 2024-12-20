﻿import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import Swal from 'sweetalert2';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Avatar,
    Chip,
    Input,
    Tooltip,
    Progress,
} from "@material-tailwind/react";
import {
    useMaterialTailwindController,
    setOpenConfigurator,
    setOpenSidenav,
} from "@/context";

function CreateUser({ darkMode }) {
    const [isCreateVisible, setIsCreateVisible] = useState(true);
    const [module, setModule] = useState("Create User");
    const [userPermissions, setUserPermissions] = useState([]);
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);
    const [modalLabel, setModalLabel] = useState('Create User');
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState([]);
    const [UserName, setUserName] = useState('');
    const [Password, setPassword] = useState('');
    const [IsEnabled, setIsActive] = useState(false);
    const [SelectedUserID, setSelectedUserID] = useState(null);
    const [CreatedBy] = useState(5);
    const [RolesID, setRolesID] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const token = localStorage.getItem('authToken');
    const currentRoleId = localStorage.getItem('roleId');
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL + '/',
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    const sidenavTypes = {
        dark: "bg-gradient-to-br from-gray-800 to-gray-900",
        white: "bg-white shadow-sm",
        transparent: "bg-transparent",
    };
    const [controller, dispatch] = useMaterialTailwindController();
    const { sidenavType, fixedNavbar, openSidenav } = controller;

    useEffect(() => {
        fetchUsers();
        fetchUserPermissions();
        fetchRoles();
        resetForm();
    }, []);

    // Fetch users permissions
    const fetchUserPermissions = async () => {        
        try {
            const response = await api.get(
                `api/UserProfile/GetCheckUserPermission/${parseInt(currentRoleId, 10)}`,
                {
                    params: {
                        module: module
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            setUserPermissions(response.data);
            //console.log('Permissions:', response.data);
            //console.log('Permissions:', userPermissions);
            //setIsPermissionsLoaded(true);
            //console.log('isPermissionsLoaded:', isPermissionsLoaded);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error fetching permissions: ${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await api.get('api/UserProfile/GetAllUsers');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error fetching users: ${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Fetch all roles
    const fetchRoles = async () => {
        try {
            const response = await api.get('api/UserProfile/GetAllRoles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error fetching roles: ${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    const isUserExists = (userName) => {
        if (!userName) return false;

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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill in all fields.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        // Check if email format is valid
        if (!isValidEmail(UserName)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a valid email address.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        if (isUserExists(UserName)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'User with this username already exists.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
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
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'User saved successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                resetForm();
                fetchUsers();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error creating user: ' + error.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Handle updating an existing user
    const handleUpdate = async () => {
        if (!UserName || !Password || !RolesID || RolesID === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill in all fields.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        if (!SelectedUserID) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Select any user from grid!',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        // Check if email format is valid
        if (!isValidEmail(UserName)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a valid email address.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
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
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'User  updated successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                resetForm();
                fetchUsers();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error updating user: ' + error.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Handle deleting an existing user
    const handleDelete = async (SelectedUserID) => {

        if (!SelectedUserID.userId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please select a user to delete.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const confirmation = await Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete!',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (!confirmation.isConfirmed) return;

        try {
            const response = await api.post(`api/UserProfile/Delete/${SelectedUserID.userId}`);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'User  deleted successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                fetchUsers();
                resetForm();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Failed to delete user.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error deleting user: ' + error.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
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

    // Filter the data based on the search term
    const filteredData = users.filter((user) => {
        const normalizedSearchTerm = searchTerm.toLowerCase();

        // Check for partial matches with "active" or "inactive"
        const isEnabledSearch =
            "active".startsWith(normalizedSearchTerm)
                ? true
                : "inactive".startsWith(normalizedSearchTerm)
                    ? false
                    : null;

        return (
            user.userName.toString().toLowerCase().includes(normalizedSearchTerm) ||
            (isEnabledSearch !== null && user.isEnabled === isEnabledSearch) ||
            user.createdBy.toString().toLowerCase().includes(normalizedSearchTerm) ||
            user.rolesDescription.toString().toLowerCase().includes(normalizedSearchTerm)
        );
    });

    // Table columns
    const columns = [
        { name: <strong>Sr#</strong>, selector: (_, index) => index + 1},
        { name: <strong>Username</strong>, selector: row => row.userName, sortable: true },
        { name: <strong>Created By</strong>, selector: row => row.createdBy, sortable: true },
        { name: <strong>Roles Description</strong>, selector: row => row.rolesDescription, sortable: true },
        { name: <strong>Password</strong>, selector: row => row.password, sortable: true },
        {
            name: <strong>Status</strong>,
            selector: row => row.isEnabled, sortable: true,
            cell: row => (
                //<span className={`inline-block px-3 py-1 text-sm font-semibold ${row.isEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} rounded-full`}>
                //    {row.isEnabled ? 'Active' : 'Inactive'}
                //</span>
                <Chip
                    variant="gradient"
                    color={row.isEnabled ? "green" : "blue-gray"}
                    value={row.isEnabled ? "Active" : "Inactive"}
                    className="py-0.5 px-2 text-[11px] font-medium w-fit"
                />
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
                        onClick={() => handleRowClick(row)}
                        className="text-blue-500 hover:bg-blue-100 hover:text-blue-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ease-in-out"
                        disabled={
                            userPermissions.find(
                                (permission) =>
                                    permission.permission === "Update" && permission.isEnable === true
                            ) === undefined
                        }
                    >
                        <ModeEditOutlineOutlinedIcon />
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="text-red-500 hover:bg-red-100 hover:text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ease-in-out"
                        disabled={
                            userPermissions.find(
                                (permission) =>
                                    permission.permission === "Delete" && permission.isEnable === true
                            ) === undefined
                        }
                    >
                        <DeleteOutlinedIcon />
                    </button>
                </div>
            ),
        },
    ];

    const customStyles = (sidenavType) => ({
        table: {
            style: {
                backgroundColor:
                    sidenavType === "dark"
                        ? "transparent"
                        : sidenavType === "transparent"
                            ? "transparent"
                            : "#ffffff",
                backgroundImage:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : "none",
            },
        },
        rows: {
            style: {
                minHeight: "48px",
                backgroundColor:
                    sidenavType === "dark" ? "transparent" : "#ffffff",
                backgroundImage:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : "none",
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                transition: "background-color 0.3s ease, background-image 0.3s ease",
            },
            hover: {
                style: {
                    backgroundImage:
                        sidenavType === "dark"
                            ? "linear-gradient(to bottom right, #1f2937, #111827)"
                            : sidenavType === "transparent"
                                ? "linear-gradient(to bottom right, #d1d5db, #e5e7eb)"
                                : "#e5e7eb",
                    backgroundColor: "transparent",
                    boxShadow:
                        sidenavType === "dark"
                            ? "0 4px 8px rgba(0, 0, 0, 0.5)"
                            : "0 2px 4px rgba(0, 0, 0, 0.2)",
                    color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                    transition: "all 0.3s ease",
                },
            },
        },
        headCells: {
            style: {
                backgroundColor:
                    sidenavType === "dark" ? "#1f2937" : "#f3f4f6",
                backgroundImage:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : "none",
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                fontWeight: "bold",
            },
        },
        cells: {
            style: {
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
            },
        },
        pagination: {
            style: {
                backgroundColor:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : sidenavType === "transparent"
                            ? "transparent"
                            : "#ffffff",
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                borderTop: "1px solid #e5e7eb", // Add a border for separation if needed
            },
            pageButtonsStyle: {
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                fill: sidenavType === "dark" ? "#f9fafb" : "#374151", // Icons for page buttons
                "&:hover": {
                    backgroundColor:
                        sidenavType === "dark"
                            ? "#4b5563" // Slightly lighter on hover
                            : "#f3f4f6",
                },
            },
        },
    });

    return (
        <>
            <section>
                <div className="flex justify-between md:flex-col items-start">
                    <div className="">
                        <h2 className={`mt-2 mb-4 font-bold ${sidenavType === "dark" ? "text-white" : "text-blue-gray-500"}`}>
                            User Management
                        </h2>
                    </div>
                    <div className="">
                        {/* Button to trigger modal */}
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            onClick={HandelOpenModal}
                            disabled={
                                userPermissions.find(
                                    (permission) =>
                                        permission.permission === "Create" && permission.isEnable === true
                                ) === undefined
                            }
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
                                            type="email"
                                            value={UserName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            autoComplete="off"
                                            required
                                            placeholder="Enter a valid email address"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            value={Password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            autoComplete="new-password"
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

                <div className="mt-4 mr-auto md:mr-4 md:w-56">
                    <Input
                        label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${sidenavType === "dark" ? "text-white" : "text-blue-gray-500"}`}
                    />
                </div>

                <div className="mt-12 mb-8 flex flex-col gap-12">
                    <Card className={`${sidenavTypes[sidenavType]}`}>
                        <CardHeader variant="gradient" color="blue" className={`mb-8 p-6 ${sidenavTypes[sidenavType]}`}>
                            <Typography variant="h6" color="white">
                                Users Table
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <div className="h-[17.5rem] overflow-y-scroll">
                                <DataTable
                                    columns={columns}
                                    data={filteredData}
                                    pagination
                                    highlightOnHover
                                    pointerOnHover
                                    //theme={darkMode ? 'dark' : 'default'}
                                    customStyles={customStyles(sidenavType)}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </section>
        </>
    );
}

export default CreateUser;
