import React, { useState, useEffect } from 'react';
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

function CreateUserRole({ darkMode }) {
    const [userPermissions, setUserPermissions] = useState([]);
    const currentRoleId = localStorage.getItem('roleId');
    const [module, setModule] = useState("Create User Role");
    const [isCreateVisible, setIsCreateVisible] = useState(true);
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);
    const [modalLabel, setModalLabel] = useState('Create Role');
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [selectedRoleID, setSelectedRoleID] = useState(null);
    const userId = localStorage.getItem('userId');
    const [modalOpen, setModalOpen] = useState(false);
    const token = localStorage.getItem('authToken');
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL + '/',
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });

    // Fetch roles on component mount
    useEffect(() => {
        fetchRoles();
        fetchUserPermissions();
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

    // Fetch all roles
    const fetchRoles = async () => {
        try {
            const response = await api.get('api/UserRoles/GetAllUserRoles');
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

    // Handle form submission for creating a new role
    const handleCreateRole = async () => {
        if (!roleDescription) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill in all fields.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const role = {
            RolesDesc: roleDescription.trim(),
            CreatedBy: userId,
        };

        try {
            const response = await api.post('api/UserRoles/Add', role);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'Role created successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                resetForm();
                fetchRoles();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating role:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `A role with the same description already exists.\n${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            resetForm();
        }
    };

    // Handle updating an existing role
    const handleUpdateRole = async () => {
        if (!roleDescription) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill in all fields.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        if (!selectedRoleID) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Select a role from the grid!',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const role = {
            RolesId: selectedRoleID,
            RolesDesc: roleDescription.trim(),
        };

        try {
            const response = await api.post(`api/UserRoles/Update/${selectedRoleID}`, role);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Role updated successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                resetForm();
                fetchRoles();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating role:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error updating role: ${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            resetForm();
        }
    };

    // Handle deleting a role
    const handleDeleteRole = async (selectedRoleID) => {
        if (!selectedRoleID.rolesId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please select a role to delete.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const confirmation = await Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this role?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete!',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (!confirmation.isConfirmed) return;

        try {
            const response = await api.post(`api/UserRoles/Delete/${selectedRoleID.rolesId}`);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Role deleted successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                fetchRoles();
                resetForm();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Failed to delete role.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                resetForm();
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error deleting role: ' + error.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Reset form fields
    const resetForm = () => {
        setRoleDescription('');
        setSelectedRoleID(null);
    };

    // Handle row click to pre-fill form
    const handleRowClick = (row) => {
        setModalOpen(true);
        setModalLabel('Update Role');
        setIsCreateVisible(false);
        setIsUpdateVisible(true);
        setRoleDescription(row.rolesDesc);
        setSelectedRoleID(row.rolesId);
    };

    const HandelOpenModal = () => {
        setModalOpen(true);
        setModalLabel('Create Role');
        setIsUpdateVisible(false);
        setIsCreateVisible(true);
        resetForm();
    };

    const HandelCloseModal = () => {
        setModalOpen(false);
    };

    // Filter the data based on the search term
    const filteredData = roles.filter((role) => {
        const normalizedSearchTerm = searchTerm.toLowerCase();

        return (
            role.createdBy.toString().toLowerCase().includes(normalizedSearchTerm) ||
            role.rolesDesc.toString().toLowerCase().includes(normalizedSearchTerm)
        );
    });

    // Table columns
    const columns = [
        { name: <strong>Sr#</strong>, selector: (_, index) => index + 1},
        { name: <strong>Role Description</strong>, selector: row => row.rolesDesc, sortable: true },
        { name: <strong>Created By</strong>, selector: row => row.createdBy, sortable: true },
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
                        onClick={() => handleDeleteRole(row)}
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

    // Custom styles for React DataTable
    const customStyles = {
        rows: {
            style: {
                minHeight: '48px', // Set row height
            },
        },
        headCells: {
            style: {
                backgroundColor: '#f3f4f6', // Light gray background
                color: '#374151', // Dark text
                fontWeight: 'bold',
                textAlign: 'center',
            },
        },
        cells: {
            style: {
                textAlign: 'center', // Center align text in cells
            },
        },
    };

    return (
        <>
            <section>
                <div className="flex justify-between  md:flex-col items-start">
                    <h2 className="mt-2 mb-4 font-bold">Create User Role</h2>
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
                        Create Role
                    </button>
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
                                        <label className="form-label text-gray-700">Role Description</label>
                                        <input
                                            type="text"
                                            value={roleDescription}
                                            onChange={(e) => setRoleDescription(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            required
                                            placeholder="Enter role description"
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
                                        onClick={handleCreateRole}
                                    >
                                        Create
                                    </button>

                                    <button
                                        type="button"
                                        className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 ${isUpdateVisible ? '' : 'hidden'}`}
                                        onClick={handleUpdateRole}
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
                    />
                </div>

                <div className="mt-12 mb-8 flex flex-col gap-12">
                    <Card>
                        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                            <Typography variant="h6" color="white">
                                Roles Table
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
                                    theme={darkMode ? 'dark' : 'default'}
                                    customStyles={customStyles}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </section>
        </>
    );
}

export default CreateUserRole;
