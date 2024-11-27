import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
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

function UserRolePermission({ darkMode }) {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const API_url = 'https://' + import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken');

    // Fetch all roles on component mount
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch(`${API_url}/api/UserRolesPermission/GetAllRoles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
                setSelectedRole(data[0]?.rolesId || '');
            } else {
                console.error('Error fetching roles');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchPermissions = async (roleId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_url}/api/UserRolesPermission/GetPermissions/${roleId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTableData(data);
            } else {
                console.error('Error fetching permissions');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedRole) fetchPermissions(selectedRole);
    }, [selectedRole]);

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleCheckboxChange = (index) => {
        const newData = [...tableData];
        newData[index].isEnable = !newData[index].isEnable;
        setTableData(newData);
    };

    //const handleSave = async () => {
    //    try {
    //        console.log('Sending data:', tableData); // Add this line to log the data
    //        const response = await fetch(`${API_url}/api/UserRolesPermission/UpdatePermissions`, {
    //            method: 'POST',
    //            headers: {
    //                'Authorization': `Bearer ${token}`,
    //                'Content-Type': 'application/json'
    //            },
    //            body: JSON.stringify(tableData),
    //        });

    //        if (response.ok) {
    //            alert('Permissions updated successfully!');
    //        } else {
    //            alert('Error updating permissions.');
    //        }
    //    } catch (error) {
    //        console.error('Error:', error);
    //        alert('An error occurred while updating permissions.');
    //    }
    //};
    const handleSave = async () => {
        // Remove the userRole property from the tableData array before sending it
        const cleanedData = tableData.map(({ userRole, ...rest }) => rest);

        console.log('Sending cleaned data:', cleanedData);

        try {
            const response = await fetch(`${API_url}/api/UserRolesPermission/UpdatePermissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedData),
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'Permissions updated successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
            } else {
                console.error('Response error:', await response.text());
                if (!SelectedUserID.userId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed!',
                        text: 'Failed to update permissions.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3085d6',
                    });
                    return;
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating permissions.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Filter the data based on the search term
    const filteredData = tableData.filter((permission) => {
        const normalizedSearchTerm = searchTerm.toLowerCase();

        return (
            permission.module.toString().toLowerCase().includes(normalizedSearchTerm) ||
            permission.permission.toString().toLowerCase().includes(normalizedSearchTerm) 
        );
    });

    // Table columns
    const columns = [
        { name: 'Sr#', selector: (_, index) => index + 1 },
        { name: 'Module', selector: row => row.module, sortable: true },
        { name: 'Permission', selector: row => row.permission, sortable: true },
        {
            name: 'Activation',
            cell: (row, index) => (
                <input
                    type="checkbox"
                    checked={row.isEnable}
                    onChange={() => handleCheckboxChange(index)}
                />
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
                <div className="flex justify-between md:flex-col items-start">
                    <div className="">
                            <h2 className="mt-2 mb-4 font-bold">User Role Permission</h2>
                    </div>

                    {/* Dropdown for roles */}
                    <div className="">
                        <select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            {roles.map(role => (
                                <option key={role.rolesId} value={role.rolesId}>
                                    {role.rolesDesc}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className="ml-5 bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded"
                            onClick={handleSave}
                        >
                            Save
                        </button>
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
                                Role Permissions Table
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

export default UserRolePermission;
