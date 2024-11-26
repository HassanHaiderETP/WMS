import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';

function CreateUserRole({ darkMode }) {
    const [isCreateVisible, setIsCreateVisible] = useState(true);
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);
    const [modalLabel, setModalLabel] = useState('Create Role');
    const [roles, setRoles] = useState([]);
    const [roleDescription, setRoleDescription] = useState('');
    const [selectedRoleID, setSelectedRoleID] = useState(null);
    const userId = localStorage.getItem('userId');
    const [modalOpen, setModalOpen] = useState(false);
    const token = localStorage.getItem('authToken');
    const api = axios.create({
        baseURL: 'https://' + import.meta.env.VITE_API_URL + '/',
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });

    // Fetch roles on component mount
    useEffect(() => {
        fetchRoles();
        resetForm();
    }, []);

    // Fetch all roles
    const fetchRoles = async () => {
        try {
            const response = await api.get('api/UserRoles/GetAllUserRoles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
            alert(`Error fetching roles: ${error.message}`);
        }
    };

    // Handle form submission for creating a new role
    const handleCreateRole = async () => {
        if (!roleDescription) {
            alert('Please fill in all fields.');
            return;
        }

        const role = {
            RolesDesc: roleDescription.trim(),
            CreatedBy: userId,
        };

        try {
            const response = await api.post('api/UserRoles/Add', role);

            if (response.status === 200) {
                alert('Role created successfully!');
                document.getElementById('closebtn').click();
                resetForm();
                fetchRoles();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating role:', error);
            alert(`A role with the same description already exists.\n${error.message}`);
            resetForm();
        }
    };

    // Handle updating an existing role
    const handleUpdateRole = async () => {
        if (!roleDescription) {
            alert('Please fill in all fields.');
            return;
        }

        if (!selectedRoleID) {
            alert('Select a role from the grid!');
            return;
        }

        const role = {
            RolesId: selectedRoleID,
            RolesDesc: roleDescription.trim(),
        };

        try {
            const response = await api.post(`api/UserRoles/Update/${selectedRoleID}`, role);

            if (response.status === 200) {
                alert('Role updated successfully!');
                document.getElementById('closebtn').click();
                resetForm();
                fetchRoles();
                setModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert(`Error updating role: ${error.message}`);
            resetForm();
        }
    };

    // Handle deleting a role
    const handleDeleteRole = async (selectedRoleID) => {
        if (!selectedRoleID.rolesId) {
            alert('Please select a role to delete.');
            return;
        }

        const confirmation = window.confirm('Are you sure you want to delete this role?');
        if (!confirmation) return;

        try {
            const response = await api.post(`api/UserRoles/Delete/${selectedRoleID.rolesId}`);

            if (response.status === 200) {
                alert('Role deleted successfully!');
                fetchRoles();
                resetForm();
            } else {
                alert('Failed to delete role.');
                resetForm();
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Error deleting role: ' + error.message);
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

    // Table columns
    const columns = [
        { name: <strong>Sr#</strong>, selector: (_, index) => index + 1, sortable: true },
        { name: <strong>Role Description</strong>, selector: row => row.rolesDesc, sortable: true },
        { name: <strong>Created By</strong>, selector: row => row.createdBy },
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
                    >
                        <ModeEditOutlineOutlinedIcon />
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => handleDeleteRole(row)}
                        className="text-red-500 hover:bg-red-100 hover:text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ease-in-out"
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
                    <h2 className="mb-4 font-bold">Create User Role</h2>
                    <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={HandelOpenModal}
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

                <div className="w-full mt-4">
                    <div className="overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={roles}
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

export default CreateUserRole;